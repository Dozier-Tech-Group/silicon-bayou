const { expect } = require("chai");
const { ethers } = require("hardhat");
const { readFileSync } = require("fs");
const { join } = require("path");

describe("AccessDesk", function () {
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

  async function expectRevert(promise) {
    let reverted = false;
    try {
      await promise;
    } catch {
      reverted = true;
    }
    expect(reverted).to.equal(true);
  }

  it("splits a USDG payment 30/70 into pool and treasury", async function () {
    const { desk, usdg, treasury, payer } = await deploy(3000);
    await desk.connect(payer).payUsdg(100_000_000n); // 100 USDG
    expect(await desk.communityPool()).to.equal(30_000_000n);
    expect(await usdg.balanceOf(treasury.address)).to.equal(70_000_000n);
    expect(await desk.paidUsdg(payer.address)).to.equal(100_000_000n);
  });

  it("accepts 20% and 40% take, rejects outside the band", async function () {
    const [owner, treasury] = await ethers.getSigners();
    const usdg = await (await ethers.getContractFactory("MockUsdg")).deploy();
    const credit = await (await ethers.getContractFactory("MergedCredit")).deploy();
    const factory = await ethers.getContractFactory("AccessDesk");
    await (await factory.deploy(await usdg.getAddress(), await credit.getAddress(), treasury.address, 2000)).waitForDeployment();
    await (await factory.deploy(await usdg.getAddress(), await credit.getAddress(), treasury.address, 4000)).waitForDeployment();
    await expectRevert(factory.deploy(await usdg.getAddress(), await credit.getAddress(), treasury.address, 1999));
    await expectRevert(factory.deploy(await usdg.getAddress(), await credit.getAddress(), treasury.address, 4001));
    const desk = await factory.deploy(await usdg.getAddress(), await credit.getAddress(), treasury.address, 3000);
    await desk.waitForDeployment();
    await expectRevert(desk.connect(owner).setTakeBps(1500));
  });

  it("sends MC in full to treasury (credits are not cash)", async function () {
    const { desk, credit, treasury, payer } = await deploy();
    await desk.connect(payer).payCredit(40);
    expect(await credit.balanceOf(treasury.address)).to.equal(40n);
    expect(await desk.paidCredit(payer.address)).to.equal(40n);
  });

  it("lets owner grant from the pool, not a stranger", async function () {
    const { desk, usdg, payer, grantee } = await deploy(4000);
    await desk.connect(payer).payUsdg(50_000_000n); // 20 USDG to pool at 40%
    expect(await desk.communityPool()).to.equal(20_000_000n);
    await expectRevert(desk.connect(grantee).grantFromPool(grantee.address, 1_000_000n));
    await desk.grantFromPool(grantee.address, 5_000_000n);
    expect(await usdg.balanceOf(grantee.address)).to.equal(5_000_000n);
    expect(await desk.communityPool()).to.equal(15_000_000n);
  });

  it("does not encode holder snapshots or per-token payouts", function () {
    const src = readFileSync(join(__dirname, "../../contracts/AccessDesk.sol"), "utf8");
    expect(src).to.not.match(/ownerOf\s*\(/);
    expect(src).to.not.match(/tokenByIndex/);
    expect(src).to.not.match(/SiliconBayou/);
  });
});
