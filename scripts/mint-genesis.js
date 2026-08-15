const { writeFileSync, readFileSync, existsSync, mkdirSync } = require("fs");
const { join } = require("path");
const hre = require("hardhat");

const DEPLOY_PATH = join(__dirname, "..", "deployments", "robinhood.json");

function loadDeploy() {
  if (!existsSync(DEPLOY_PATH)) return {};
  return JSON.parse(readFileSync(DEPLOY_PATH, "utf8"));
}

async function main() {
  if (process.env.GENESIS_ART_READY !== "1") {
    throw new Error(
      "HOLD: hybrid genesis art is not marked ready. Do not mint photoreal gators or generator/out pixels."
    );
  }

  const [signer] = await hre.ethers.getSigners();
  if (!signer) throw new Error("No signer. Set PRIVATE_KEY in .env");

  const deploy = loadDeploy();
  const address = process.env.CONTRACT_ADDRESS || deploy.address;
  if (!address) throw new Error("Set CONTRACT_ADDRESS or deploy first");

  const recipient = process.env.MINT_TO || signer.address;
  const nft = await hre.ethers.getContractAt("SiliconBayou", address, signer);
  const next = await nft.nextTokenId();
  if (next > 4n) {
    console.log("Genesis 1-4 already minted. nextTokenId =", next.toString());
    return;
  }
  if (next !== 1n) {
    throw new Error(`Unexpected nextTokenId ${next}. Expected 1 (fresh) or >4 (done).`);
  }

  const tx = await nft.mintBatch(recipient, 4);
  const receipt = await tx.wait();

  const record = {
    ...deploy,
    address,
    genesis: {
      tokenIds: [1, 2, 3, 4],
      to: recipient,
      tx: receipt.hash,
    },
  };
  mkdirSync(join(__dirname, "..", "deployments"), { recursive: true });
  writeFileSync(DEPLOY_PATH, JSON.stringify(record, null, 2) + "\n");

  console.log("Minted tokens 1-4 to", recipient);
  console.log("Tx", receipt.hash);
  console.log("tokenURI(1)", await nft.tokenURI(1));
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
