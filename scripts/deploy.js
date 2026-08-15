const hre = require("hardhat");

async function main() {
  const [deployer] = await hre.ethers.getSigners();
  if (!deployer) {
    throw new Error("No signer. Set PRIVATE_KEY in .env");
  }

  const baseURI = process.env.BASE_URI || "ipfs://REPLACE_ME/";
  const recipient = process.env.MINT_TO || deployer.address;

  console.log("Network :", hre.network.name);
  console.log("Chain ID:", hre.network.config.chainId);
  console.log("Deployer:", deployer.address);
  console.log("Mint to :", recipient);
  console.log("Base URI:", baseURI);

  const factory = await hre.ethers.getContractFactory("SiliconBayou");
  const nft = await factory.deploy(baseURI);
  await nft.waitForDeployment();
  const address = await nft.getAddress();
  console.log("SiliconBayou deployed:", address);

  const tx = await nft.mintBatch(recipient, 4);
  const receipt = await tx.wait();
  console.log("Minted tokens 1-4 in tx:", receipt.hash);
  console.log("Next token id:", (await nft.nextTokenId()).toString());
  console.log("tokenURI(1):", await nft.tokenURI(1));
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
