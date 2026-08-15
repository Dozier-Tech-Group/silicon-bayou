const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("SiliconBayou", function () {
  const BASE_URI = "ipfs://CID/";

  async function deploy() {
    const [owner, stranger] = await ethers.getSigners();
    const factory = await ethers.getContractFactory("SiliconBayou");
    const nft = await factory.deploy(BASE_URI);
    await nft.waitForDeployment();
    return { nft, owner, stranger };
  }

  it("deploys with name and symbol", async function () {
    const { nft } = await deploy();
    expect(await nft.name()).to.equal("Silicon Bayou");
    expect(await nft.symbol()).to.equal("BAYOU");
    expect(await nft.nextTokenId()).to.equal(1n);
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

  async function expectOwnerGuard(promise) {
    let reverted = false;
    try {
      await promise;
    } catch {
      reverted = true;
    }
    expect(reverted).to.equal(true);
  }

  it("non-owner cannot mint", async function () {
    const { nft, stranger } = await deploy();
    await expectOwnerGuard(nft.connect(stranger).mint(stranger.address));
  });

  it("non-owner cannot mintBatch", async function () {
    const { nft, stranger } = await deploy();
    await expectOwnerGuard(nft.connect(stranger).mintBatch(stranger.address, 1));
  });
});
