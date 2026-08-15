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
  if (!signer) throw new Error("No signer. Set PRIVATE_KEY in .env");

  const deploy = loadDeploy();
  const address = process.env.CONTRACT_ADDRESS || deploy.address;
  if (!address) throw new Error("Set CONTRACT_ADDRESS or deploy first (deployments/robinhood.json)");

  const baseURI = process.env.BASE_URI;
  if (!baseURI) throw new Error("Set BASE_URI (trailing slash). Example: ipfs://<JSON_CID>/");
  if (/generator[\\/]+out/i.test(baseURI)) {
    throw new Error("Refusing BASE_URI that points at generator/out — HD portraits only");
  }
  if (!baseURI.endsWith("/")) {
    throw new Error("BASE_URI must end with /  (tokenURI is {BASE_URI}{id}.json)");
  }

  const nft = await hre.ethers.getContractAt("SiliconBayou", address, signer);
  const tx = await nft.setBaseURI(baseURI);
  const receipt = await tx.wait();

  const next = { ...deploy, address, baseURI, setBaseURITx: receipt.hash };
  mkdirSync(join(__dirname, "..", "deployments"), { recursive: true });
  writeFileSync(DEPLOY_PATH, JSON.stringify(next, null, 2) + "\n");

  console.log("Contract :", address);
  console.log("BASE_URI :", baseURI);
  console.log("Tx       :", receipt.hash);
  console.log("tokenURI(1):", await nft.tokenURI(1));
  console.log("Next: npm run freeze-uri after you verify tokenURI on a trusted RPC. freezeURI is permanent.");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
