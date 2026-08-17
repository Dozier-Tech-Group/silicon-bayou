const { writeFileSync, readFileSync, existsSync } = require("fs");
const { join } = require("path");
const hre = require("hardhat");

const DEPLOY_PATH = join(__dirname, "..", "deployments", "robinhood.json");
const OPERATOR = "0x29486Fc6B2E7184Dd4aF4d310D4f85F4262fD11d";

/**
 * Starts the Ownable2Step handover. Nothing changes hands until the new
 * owner calls acceptOwnership() from its own wallet; until then the current
 * owner can overwrite the pending owner with another transferOwnership().
 */
async function main() {
  const [signer] = await hre.ethers.getSigners();
  if (!signer) throw new Error("No signer. Set PRIVATE_KEY in .env");

  const deploy = existsSync(DEPLOY_PATH) ? JSON.parse(readFileSync(DEPLOY_PATH, "utf8")) : {};
  const address = process.env.CONTRACT_ADDRESS || deploy.address;
  if (!address) throw new Error("No contract address in deployments/robinhood.json");

  const newOwner = hre.ethers.getAddress(process.env.NEW_OWNER || OPERATOR);
  const nft = await hre.ethers.getContractAt("SiliconBayou", address, signer);

  const owner = await nft.owner();
  if (owner.toLowerCase() !== signer.address.toLowerCase()) {
    throw new Error(`Signer ${signer.address} is not owner ${owner}`);
  }
  if (newOwner.toLowerCase() === owner.toLowerCase()) {
    throw new Error("New owner equals current owner");
  }

  const tx = await nft.transferOwnership(newOwner);
  const receipt = await tx.wait();

  const pending = await nft.pendingOwner();
  console.log("owner()        :", await nft.owner());
  console.log("pendingOwner() :", pending);
  console.log("Tx             :", receipt.hash);
  if (pending.toLowerCase() !== newOwner.toLowerCase()) throw new Error("pendingOwner mismatch");

  writeFileSync(
    DEPLOY_PATH,
    JSON.stringify({ ...deploy, pendingOwner: pending, transferOwnershipTx: receipt.hash }, null, 2) + "\n"
  );
  console.log(
    `\nNext: from ${newOwner} call acceptOwnership() on ${address}\n` +
      "(Blockscout > Contract > Write, connect the wallet, acceptOwnership)."
  );
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
