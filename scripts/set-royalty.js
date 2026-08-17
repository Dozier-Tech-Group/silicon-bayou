const { writeFileSync, readFileSync, existsSync } = require("fs");
const { join } = require("path");
const hre = require("hardhat");

const DEPLOY_PATH = join(__dirname, "..", "deployments", "robinhood.json");
const OPERATOR = "0x29486Fc6B2E7184Dd4aF4d310D4f85F4262fD11d";

async function main() {
  const [signer] = await hre.ethers.getSigners();
  if (!signer) throw new Error("No signer. Set PRIVATE_KEY in .env");

  const deploy = existsSync(DEPLOY_PATH) ? JSON.parse(readFileSync(DEPLOY_PATH, "utf8")) : {};
  const address = process.env.CONTRACT_ADDRESS || deploy.address;
  if (!address) throw new Error("No contract address in deployments/robinhood.json");

  const receiver = hre.ethers.getAddress(process.env.ROYALTY_RECEIVER || OPERATOR);
  const feeBps = Number(process.env.ROYALTY_BPS || 500);
  if (feeBps <= 0 || feeBps > 1000) throw new Error(`feeBps ${feeBps} outside (0, 1000]`);

  const nft = await hre.ethers.getContractAt("SiliconBayou", address, signer);
  const owner = await nft.owner();
  if (owner.toLowerCase() !== signer.address.toLowerCase()) {
    throw new Error(`Signer ${signer.address} is not owner ${owner}`);
  }
  if (receiver.toLowerCase() === signer.address.toLowerCase()) {
    throw new Error("Refusing to point royalties at the throwaway deployer");
  }

  const [beforeRecv, beforeAmt] = await nft.royaltyInfo(1, 10000n);
  console.log("Royalty before:", beforeRecv, Number(beforeAmt), "bps");

  const tx = await nft.setDefaultRoyalty(receiver, feeBps);
  const receipt = await tx.wait();

  const [afterRecv, afterAmt] = await nft.royaltyInfo(1, 10000n);
  console.log("Royalty after :", afterRecv, Number(afterAmt), "bps");
  console.log("Tx            :", receipt.hash);
  if (afterRecv.toLowerCase() !== receiver.toLowerCase()) throw new Error("Royalty receiver mismatch after tx");

  writeFileSync(
    DEPLOY_PATH,
    JSON.stringify(
      { ...deploy, royaltyReceiver: afterRecv, royaltyBps: Number(afterAmt), setRoyaltyTx: receipt.hash },
      null,
      2
    ) + "\n"
  );
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
