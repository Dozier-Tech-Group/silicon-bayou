/**
 * Oracle/operator tool: settle a Gator Works bounty after the winning PR merges.
 *
 *   npm run settle -- --issue 1001 --winner 0xHolderWallet
 *
 * Requires deployments/credits.json (written by deploy:bounty:mainnet) and the
 * owner/oracle key in local .env. BountyBoard enforces the rest: the issue must
 * be funded and unsettled, and the winner must hold a BAYOU gator.
 */
const { readFileSync, writeFileSync, existsSync } = require("fs");
const { join } = require("path");
const hre = require("hardhat");

const CREDITS_PATH = join(__dirname, "..", "deployments", "credits.json");
const LOG_PATH = join(__dirname, "..", "agents", "settlements.json");

function arg(name) {
  const i = process.argv.indexOf(`--${name}`);
  return i > -1 ? process.argv[i + 1] : undefined;
}

async function main() {
  if (!existsSync(CREDITS_PATH)) {
    throw new Error("deployments/credits.json not found - deploy MC + BountyBoard first (npm run deploy:bounty:mainnet)");
  }
  const credits = JSON.parse(readFileSync(CREDITS_PATH, "utf8"));
  const boardAddress = credits.bountyBoard || credits.board || credits.bountyBoardAddress;
  if (!boardAddress) throw new Error("credits.json has no bountyBoard address");

  const issueId = Number(arg("issue"));
  const winner = arg("winner");
  if (!Number.isInteger(issueId) || !winner) {
    throw new Error("Usage: npm run settle -- --issue <id> --winner <0xwallet>");
  }

  const [signer] = await hre.ethers.getSigners();
  if (!signer) throw new Error("No signer. Set PRIVATE_KEY in .env");
  const board = await hre.ethers.getContractAt("BountyBoard", boardAddress, signer);

  const before = await board.bounties(issueId);
  console.log(`Bounty ${issueId}: reward=${before.reward} settled=${before.settled}`);

  const tx = await board.settle(issueId, winner);
  const receipt = await tx.wait();
  console.log(`Settled ${issueId} -> ${winner}`);
  console.log("Tx:", receipt.hash);

  const log = existsSync(LOG_PATH) ? JSON.parse(readFileSync(LOG_PATH, "utf8")) : { settlements: [] };
  log.settlements.push({ issueId, winner, reward: before.reward.toString(), tx: receipt.hash });
  writeFileSync(LOG_PATH, JSON.stringify(log, null, 2) + "\n");
  console.log("Recorded in agents/settlements.json - the holder can now call withdraw().");
}

main().catch((error) => {
  console.error(error.message || error);
  process.exitCode = 1;
});
