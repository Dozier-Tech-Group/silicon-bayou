/**
 * Optional extra mints to alpha testers.
 * testers/fixtures.json currently has PLACEHOLDER wallets
 * (0x1111… / 0x2222… / 0x3333…). Replace with real EVM addresses
 * before running — this script refuses the placeholders.
 *
 *   $env:CONTRACT_ADDRESS="0x..."
 *   npm run mint:testers
 */
const { readFileSync } = require("fs");
const { join } = require("path");
const hre = require("hardhat");

const PLACEHOLDERS = new Set([
  "0x1111111111111111111111111111111111111111",
  "0x2222222222222222222222222222222222222222",
  "0x3333333333333333333333333333333333333333",
]);

async function main() {
  const [signer] = await hre.ethers.getSigners();
  if (!signer) throw new Error("No signer. Set PRIVATE_KEY in .env");

  const deployPath = join(__dirname, "..", "deployments", "robinhood.json");
  const deploy = JSON.parse(readFileSync(deployPath, "utf8"));
  const address = process.env.CONTRACT_ADDRESS || deploy.address;
  const fixtures = JSON.parse(readFileSync(join(__dirname, "..", "testers", "fixtures.json"), "utf8"));

  const wallets = fixtures.testers.map((t) => t.wallet.toLowerCase());
  if (wallets.some((w) => PLACEHOLDERS.has(w))) {
    console.log("Tester wallets are still placeholders. Put real addresses in testers/fixtures.json:");
    for (const t of fixtures.testers) {
      console.log(`  ${t.id} ${t.name}  ${t.wallet}  (${t.role})`);
    }
    process.exitCode = 2;
    return;
  }

  const nft = await hre.ethers.getContractAt("SiliconBayou", address, signer);
  for (const t of fixtures.testers) {
    const tx = await nft.mint(t.wallet);
    const receipt = await tx.wait();
    console.log(`Minted to ${t.name} ${t.wallet} tx=${receipt.hash}`);
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
