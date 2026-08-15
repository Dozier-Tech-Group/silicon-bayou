const hre = require("hardhat");

async function main() {
  const [deployer] = await hre.ethers.getSigners();
  if (!deployer) {
    throw new Error("No signer. Set PRIVATE_KEY in .env");
  }

  console.log("Network :", hre.network.name);
  console.log("Deployer:", deployer.address);

  const creditFactory = await hre.ethers.getContractFactory("MergedCredit");
  const credit = await creditFactory.deploy();
  await credit.waitForDeployment();
  const creditAddress = await credit.getAddress();
  console.log("MergedCredit deployed:", creditAddress);

  const boardFactory = await hre.ethers.getContractFactory("BountyBoard");
  const board = await boardFactory.deploy(creditAddress);
  await board.waitForDeployment();
  const boardAddress = await board.getAddress();
  console.log("BountyBoard deployed:", boardAddress);
  console.log("Set VITE_BOUNTY_BOARD_ADDRESS and VITE_MERGED_CREDIT_ADDRESS on the website after this.");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
