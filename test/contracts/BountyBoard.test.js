const { expect } = require("chai");
const { ethers } = require("hardhat");
const fixtures = require("../../testers/fixtures.json");

describe("BountyBoard + MergedCredit", function () {
  async function deploy() {
    const [owner, other] = await ethers.getSigners();
    const credit = await (await ethers.getContractFactory("MergedCredit")).deploy();
    await credit.waitForDeployment();
    const board = await (await ethers.getContractFactory("BountyBoard")).deploy(
      await credit.getAddress(),
    );
    await board.waitForDeployment();
    await credit.mint(owner.address, 1000);
    await credit.approve(await board.getAddress(), 1000);
    return { owner, other, credit, board };
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
  });

  it("non-owner cannot settle a bounty", async function () {
    const { board, other } = await deploy();
    await board.fund(2, 50);
    let reverted = false;
    try {
      await board.connect(other).settle(2, fixtures.testers[0].wallet);
    } catch {
      reverted = true;
    }
    expect(reverted).to.equal(true);
  });
});
