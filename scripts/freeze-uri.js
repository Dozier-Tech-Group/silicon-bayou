const { writeFileSync, readFileSync, existsSync, mkdirSync } = require("fs");
const { join } = require("path");
const hre = require("hardhat");

const DEPLOY_PATH = join(__dirname, "..", "deployments", "robinhood.json");

function loadDeploy() {
  if (!existsSync(DEPLOY_PATH)) return {};
  return JSON.parse(readFileSync(DEPLOY_PATH, "utf8"));
}

async function main() {
  const [signer] = await hre.ethers.getSigners();
  if (!signer) throw new Error("No signer. Set PRIVATE_KEY in .env (never paste the key into chat).");

  const deploy = loadDeploy();
  const address = process.env.CONTRACT_ADDRESS || deploy.address;
  if (!address) throw new Error("Set CONTRACT_ADDRESS or deploy first (deployments/robinhood.json)");

  const nft = await hre.ethers.getContractAt("SiliconBayou", address, signer);
  if (await nft.uriFrozen()) {
    console.log("URI already frozen. baseURI:", await nft.baseURI());
    return;
  }

  const tx = await nft.freezeURI();
  const receipt = await tx.wait();
  const next = { ...deploy, address, uriFrozen: true, freezeURITx: receipt.hash };
  mkdirSync(join(__dirname, "..", "deployments"), { recursive: true });
  writeFileSync(DEPLOY_PATH, JSON.stringify(next, null, 2) + "\n");

  console.log("Contract :", address);
  console.log("Frozen   :", await nft.uriFrozen());
  console.log("baseURI  :", await nft.baseURI());
  console.log("Tx       :", receipt.hash);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
