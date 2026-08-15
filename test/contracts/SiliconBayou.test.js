const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("SiliconBayou", function () {
  const BASE_URI = "ipfs://CID/";

  async function deploy() {
    const [owner, stranger, other] = await ethers.getSigners();
    const factory = await ethers.getContractFactory("SiliconBayou");
    const nft = await factory.deploy(BASE_URI);
    await nft.waitForDeployment();
    return { nft, owner, stranger, other };
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

  it("deploys with name, symbol, and default 5% royalty", async function () {
    const { nft, owner } = await deploy();
    expect(await nft.name()).to.equal("Silicon Bayou");
    expect(await nft.symbol()).to.equal("BAYOU");
    expect(await nft.nextTokenId()).to.equal(1n);
    expect(await nft.uriFrozen()).to.equal(false);
    expect(await nft.baseURI()).to.equal(BASE_URI);
    const [receiver, amount] = await nft.royaltyInfo(1, 10_000n);
    expect(receiver).to.equal(owner.address);
    expect(amount).to.equal(500n);
    expect(await nft.supportsInterface("0x80ac58cd")).to.equal(true);
    expect(await nft.supportsInterface("0x2a55205a")).to.equal(true);
  });

  it("owner can mint tokens 1 through 4", async function () {
    const { nft, owner } = await deploy();
    for (let i = 1; i <= 4; i++) {
      await nft.mint(owner.address);
      expect(await nft.ownerOf(i)).to.equal(owner.address);
      expect(await nft.tokenURI(i)).to.equal(`${BASE_URI}${i}.json`);
    }
    expect(await nft.nextTokenId()).to.equal(5n);
  });

  it("owner can mintBatch 4 and tokenURIs match", async function () {
    const { nft, owner } = await deploy();
    await nft.mintBatch(owner.address, 4);
    expect(await nft.ownerOf(1)).to.equal(owner.address);
    expect(await nft.ownerOf(4)).to.equal(owner.address);
    expect(await nft.tokenURI(1)).to.equal("ipfs://CID/1.json");
    expect(await nft.tokenURI(4)).to.equal("ipfs://CID/4.json");
    expect(await nft.nextTokenId()).to.equal(5n);
  });

  it("non-owner cannot mint", async function () {
    const { nft, stranger } = await deploy();
    await expectRevert(nft.connect(stranger).mint(stranger.address));
  });

  it("non-owner cannot mintBatch", async function () {
    const { nft, stranger } = await deploy();
    await expectRevert(nft.connect(stranger).mintBatch(stranger.address, 1));
  });

  it("pause blocks mint and transfer; unpause restores", async function () {
    const { nft, owner, stranger } = await deploy();
    await nft.mint(owner.address);
    await nft.pause();
    await expectRevert(nft.mint(owner.address));
    await expectRevert(nft.mintBatch(owner.address, 1));
    await expectRevert(nft.transferFrom(owner.address, stranger.address, 1));
    await nft.unpause();
    await nft.mint(owner.address);
    expect(await nft.ownerOf(2)).to.equal(owner.address);
  });

  it("non-owner cannot pause", async function () {
    const { nft, stranger } = await deploy();
    await expectRevert(nft.connect(stranger).pause());
  });

  it("2-step ownership: transfer does not instantly change owner", async function () {
    const { nft, owner, stranger } = await deploy();
    await nft.transferOwnership(stranger.address);
    expect(await nft.owner()).to.equal(owner.address);
    expect(await nft.pendingOwner()).to.equal(stranger.address);
    await expectRevert(nft.connect(owner).acceptOwnership());
    await nft.connect(stranger).acceptOwnership();
    expect(await nft.owner()).to.equal(stranger.address);
    await expectRevert(nft.connect(owner).mint(owner.address));
    await nft.connect(stranger).mint(stranger.address);
    expect(await nft.ownerOf(1)).to.equal(stranger.address);
  });

  it("freezeURI then setBaseURI reverts", async function () {
    const { nft } = await deploy();
    await nft.setBaseURI("ipfs://NEW/");
    expect(await nft.baseURI()).to.equal("ipfs://NEW/");
    await nft.freezeURI();
    expect(await nft.uriFrozen()).to.equal(true);
    await expectRevert(nft.setBaseURI("ipfs://MUTATE/"));
    await expectRevert(nft.freezeURI());
    expect(await nft.baseURI()).to.equal("ipfs://NEW/");
  });

  it("cannot renounce ownership before URI is frozen", async function () {
    const { nft, owner } = await deploy();
    await expectRevert(nft.renounceOwnership());
    await nft.freezeURI();
    await nft.renounceOwnership();
    expect(await nft.owner()).to.equal(ethers.ZeroAddress);
  });

  it("royalty bps cap at 10%", async function () {
    const { nft, owner, stranger } = await deploy();
    await expectRevert(nft.setDefaultRoyalty(owner.address, 1001));
    await expectRevert(nft.setDefaultRoyalty(ethers.ZeroAddress, 100));
    await nft.setDefaultRoyalty(stranger.address, 1000);
    const [receiver, amount] = await nft.royaltyInfo(1, 10_000n);
    expect(receiver).to.equal(stranger.address);
    expect(amount).to.equal(1000n);
  });

  it("fuzz-cheap: royalty above cap and oversized batches revert", async function () {
    const { nft, owner } = await deploy();
    for (const bps of [1001, 2500, 5000, 10000, 65535]) {
      await expectRevert(nft.setDefaultRoyalty(owner.address, bps));
    }
    for (const count of [0, 33, 64, 100]) {
      await expectRevert(nft.mintBatch(owner.address, count));
    }
    await nft.mintBatch(owner.address, 32);
    expect(await nft.nextTokenId()).to.equal(33n);
  });
});
