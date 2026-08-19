const { expect } = require("chai");
const { ethers } = require("hardhat");

// Security-regression tests from the completed audit. These pin pause
// semantics across the credits rail and the mint reentrancy guard so any
// future change to this behavior has to break a test on purpose.

async function expectRevertWith(promise, errorName) {
  let reverted = false;
  let text = "";
  try {
    await promise;
  } catch (err) {
    reverted = true;
    const parts = [];
    let cur = err;
    while (cur) {
      if (cur.message) parts.push(cur.message);
      if (cur.shortMessage) parts.push(cur.shortMessage);
      if (typeof cur.data === "string") parts.push(cur.data);
      cur = cur.error || (cur.info && cur.info.error) || cur.cause;
    }
    text = parts.join(" | ");
  }
  expect(reverted).to.equal(true);
  const selector = ethers.id(`${errorName}()`).slice(0, 10);
  expect(
    text.includes(errorName) || text.includes(selector),
    `expected revert with ${errorName}, got: ${text}`,
  ).to.equal(true);
}

describe("AccessDesk pause paths", function () {
  async function deploy(takeBps = 3000) {
    const [owner, treasury, payer, grantee] = await ethers.getSigners();
    const usdg = await (await ethers.getContractFactory("MockUsdg")).deploy();
    await usdg.waitForDeployment();
    const credit = await (await ethers.getContractFactory("MergedCredit")).deploy();
    await credit.waitForDeployment();
    const desk = await (await ethers.getContractFactory("AccessDesk")).deploy(
      await usdg.getAddress(),
      await credit.getAddress(),
      treasury.address,
      takeBps,
    );
    await desk.waitForDeployment();
    await usdg.mint(payer.address, 1_000_000_000n); // 1000 USDG (6 decimals)
    await usdg.connect(payer).approve(await desk.getAddress(), ethers.MaxUint256);
    await credit.mint(payer.address, 500);
    await credit.connect(payer).approve(await desk.getAddress(), ethers.MaxUint256);
    return { owner, treasury, payer, grantee, usdg, credit, desk };
  }

  it("pause blocks payUsdg and payCredit with EnforcedPause; unpause restores both", async function () {
    const { desk, payer } = await deploy(3000);
    await desk.connect(payer).payUsdg(10_000_000n); // sanity: works before pause
    await desk.pause();
    await expectRevertWith(desk.connect(payer).payUsdg(10_000_000n), "EnforcedPause");
    await expectRevertWith(desk.connect(payer).payCredit(5), "EnforcedPause");
    expect(await desk.paidUsdg(payer.address)).to.equal(10_000_000n);
    expect(await desk.paidCredit(payer.address)).to.equal(0n);
    await desk.unpause();
    await desk.connect(payer).payUsdg(10_000_000n);
    await desk.connect(payer).payCredit(5);
    expect(await desk.paidUsdg(payer.address)).to.equal(20_000_000n);
    expect(await desk.paidCredit(payer.address)).to.equal(5n);
  });

  it("grantFromPool still succeeds while paused (pinned: deliberate owner relief valve)", async function () {
    // grantFromPool intentionally has no whenNotPaused: during an incident
    // freeze the owner can still move USDG out of the community pool. This
    // test pins that behavior so removing it is a deliberate change.
    const { desk, usdg, payer, grantee } = await deploy(3000);
    await desk.connect(payer).payUsdg(100_000_000n); // 30 USDG stays in pool
    expect(await desk.communityPool()).to.equal(30_000_000n);
    await desk.pause();
    await desk.grantFromPool(grantee.address, 5_000_000n);
    expect(await usdg.balanceOf(grantee.address)).to.equal(5_000_000n);
    expect(await desk.communityPool()).to.equal(25_000_000n);
  });
});

describe("MergedCredit pause freezes the credits rail", function () {
  async function deploy() {
    const [owner, treasury, payer, hunter] = await ethers.getSigners();
    const usdg = await (await ethers.getContractFactory("MockUsdg")).deploy();
    await usdg.waitForDeployment();
    const credit = await (await ethers.getContractFactory("MergedCredit")).deploy();
    await credit.waitForDeployment();
    const bayou = await (await ethers.getContractFactory("SiliconBayou")).deploy(
      "https://example.invalid/metadata/",
    );
    await bayou.waitForDeployment();
    const board = await (await ethers.getContractFactory("BountyBoard")).deploy(
      await credit.getAddress(),
      await bayou.getAddress(),
    );
    await board.waitForDeployment();
    const desk = await (await ethers.getContractFactory("AccessDesk")).deploy(
      await usdg.getAddress(),
      await credit.getAddress(),
      treasury.address,
      3000,
    );
    await desk.waitForDeployment();
    await credit.mint(owner.address, 1000);
    await credit.approve(await board.getAddress(), 1000);
    await credit.mint(payer.address, 500);
    await credit.connect(payer).approve(await desk.getAddress(), ethers.MaxUint256);
    await bayou.mint(hunter.address);
    return { owner, treasury, payer, hunter, usdg, credit, bayou, board, desk };
  }

  it("paused MC blocks board.fund, settled withdraw, and desk.payCredit; unpause recovers all three", async function () {
    // Only MergedCredit is paused here — the board and desk stay unpaused.
    // Every MC movement funnels through MC._update, which is whenNotPaused,
    // so the escrow rail freezes end to end from the token side alone.
    const { treasury, payer, hunter, credit, board, desk } = await deploy();
    await board.fund(1, 100);
    await board.settle(1, hunter.address); // hunter is a settled winner pre-pause
    await credit.pause();
    await expectRevertWith(board.fund(2, 50), "EnforcedPause");
    await expectRevertWith(board.connect(hunter).withdraw(), "EnforcedPause");
    await expectRevertWith(desk.connect(payer).payCredit(10), "EnforcedPause");
    expect(await board.claimable(hunter.address)).to.equal(100n);
    expect(await credit.balanceOf(hunter.address)).to.equal(0n);
    await credit.unpause();
    await board.fund(2, 50);
    await board.connect(hunter).withdraw();
    expect(await credit.balanceOf(hunter.address)).to.equal(100n);
    expect(await board.claimable(hunter.address)).to.equal(0n);
    await desk.connect(payer).payCredit(10);
    expect(await credit.balanceOf(treasury.address)).to.equal(10n);
    expect(await desk.paidCredit(payer.address)).to.equal(10n);
  });
});

describe("SiliconBayou reentrancy regression", function () {
  const BASE_URI = "https://example.invalid/metadata/";

  // Why the 721 is the only callback surface on this estate: BountyBoard.withdraw
  // moves MergedCredit, a plain OZ ERC20 with no ERC777-style hooks and no
  // transfer callbacks, so credit.safeTransfer never hands execution to the
  // recipient — there is no ERC20-callback reentrancy surface to regress.
  // _safeMint -> onERC721Received on SiliconBayou is the one external callback,
  // and the attacker below is made the owner first so the re-entrant call gets
  // past onlyOwner and is stopped by the ReentrancyGuard itself.

  async function deploy() {
    const [owner] = await ethers.getSigners();
    const nft = await (await ethers.getContractFactory("SiliconBayou")).deploy(BASE_URI);
    await nft.waitForDeployment();
    const attacker = await (await ethers.getContractFactory("ReenteringReceiver")).deploy(
      await nft.getAddress(),
    );
    await attacker.waitForDeployment();
    await nft.transferOwnership(await attacker.getAddress());
    await attacker.acceptTargetOwnership();
    return { owner, nft, attacker };
  }

  it("re-entering mint from onERC721Received reverts; nextTokenId unchanged", async function () {
    const { nft, attacker } = await deploy();
    await attacker.attackMint(); // mode 0: benign receiver — proves the mock itself is fine
    expect(await nft.nextTokenId()).to.equal(2n);
    await attacker.setMode(1);
    await expectRevertWith(attacker.attackMint(), "ReentrancyGuardReentrantCall");
    expect(await nft.nextTokenId()).to.equal(2n);
    expect(await nft.balanceOf(await attacker.getAddress())).to.equal(1n);
  });

  it("re-entering mintBatch from onERC721Received reverts; nextTokenId unchanged", async function () {
    const { nft, attacker } = await deploy();
    await attacker.setMode(2);
    await expectRevertWith(attacker.attackMintBatch(3), "ReentrancyGuardReentrantCall");
    expect(await nft.nextTokenId()).to.equal(1n);
    expect(await nft.balanceOf(await attacker.getAddress())).to.equal(0n);
    // cross-function: mint -> re-enter mintBatch shares the same guard
    await expectRevertWith(attacker.attackMint(), "ReentrancyGuardReentrantCall");
    expect(await nft.nextTokenId()).to.equal(1n);
  });
});
