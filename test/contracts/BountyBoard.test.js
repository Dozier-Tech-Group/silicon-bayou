const { expect } = require("chai");
const { ethers } = require("hardhat");
const fixtures = require("../../testers/fixtures.json");

describe("BountyBoard + MergedCredit", function () {
  async function deploy() {
    const [owner, other, oracle] = await ethers.getSigners();
    const credit = await (await ethers.getContractFactory("MergedCredit")).deploy();
    await credit.waitForDeployment();
    const board = await (await ethers.getContractFactory("BountyBoard")).deploy(
      await credit.getAddress(),
    );
    await board.waitForDeployment();
    await credit.mint(owner.address, 1000);
    await credit.approve(await board.getAddress(), 1000);
    return { owner, other, oracle, credit, board };
  }

  async function expectRevert(promise) {
    let reverted = false;
    try {
      await promise;
    } catch {
      reverted = true;
    }
    expect(reverted).to.equal(true);
  }

  it("first settle wins; winner can withdraw credits (not yield)", async function () {
    const { board, credit } = await deploy();
    const hunter = fixtures.testers[1];
    await board.fund(1, 200);
    await board.settle(1, hunter.wallet);
    expect((await board.bounties(1)).settled).to.equal(true);

    const winner = await ethers.getImpersonatedSigner(hunter.wallet);
    await ethers.provider.send("hardhat_setBalance", [hunter.wallet, "0x56BC75E2D63100000"]);
    await board.connect(winner).withdraw();
    expect(await credit.balanceOf(hunter.wallet)).to.equal(200n);
    expect(await board.claimable(hunter.wallet)).to.equal(0n);
  });

  it("settle twice reverts; second withdraw is safe (reverts)", async function () {
    const { board, other } = await deploy();
    await board.fund(7, 50);
    await board.settle(7, other.address);
    await expectRevert(board.settle(7, other.address));
    await board.connect(other).withdraw();
    await expectRevert(board.connect(other).withdraw());
  });

  it("non-owner cannot settle a bounty", async function () {
    const { board, other } = await deploy();
    await board.fund(2, 50);
    await expectRevert(board.connect(other).settle(2, fixtures.testers[0].wallet));
  });

  it("oracle can settle; stranger cannot", async function () {
    const { board, other, oracle } = await deploy();
    await board.setOracle(oracle.address);
    await board.fund(3, 25);
    await board.connect(oracle).settle(3, other.address);
    expect((await board.bounties(3)).winner).to.equal(other.address);
    await board.fund(4, 25);
    await expectRevert(board.connect(other).settle(4, other.address));
  });

  it("2-step ownership on the board", async function () {
    const { board, owner, other } = await deploy();
    await board.transferOwnership(other.address);
    expect(await board.owner()).to.equal(owner.address);
    await board.connect(other).acceptOwnership();
    expect(await board.owner()).to.equal(other.address);
  });

  it("pause blocks fund, settle, and withdraw", async function () {
    const { board, other } = await deploy();
    await board.fund(9, 10);
    await board.pause();
    await expectRevert(board.fund(10, 10));
    await expectRevert(board.settle(9, other.address));
    await board.unpause();
    await board.settle(9, other.address);
    await board.pause();
    await expectRevert(board.connect(other).withdraw());
    await board.unpause();
    await board.connect(other).withdraw();
  });
});
