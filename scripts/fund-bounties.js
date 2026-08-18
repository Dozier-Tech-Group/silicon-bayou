/**
 * Fund the open Gator Works bounties from agents/tasks.json on-chain.
 *
 *   npm run fund-bounties            (network robinhood via package.json)
 *
 * Owner-only: mints exactly the MC shortfall to the owner, approves the
 * BountyBoard, then fund(issueId, rewardMC) for every open unfunded task.
 * Flips funded:true in agents/tasks.json for each success.
 */
const { readFileSync, writeFileSync, existsSync } = require("fs");
const { join } = require("path");
const hre = require("hardhat");

const CREDITS_PATH = join(__dirname, "..", "deployments", "credits.json");
const TASKS_PATH = join(__dirname, "..", "agents", "tasks.json");

async function main() {
  if (!existsSync(CREDITS_PATH)) {
    throw new Error("deployments/credits.json not found - run deploy:bounty first");
  }
  const credits = JSON.parse(readFileSync(CREDITS_PATH, "utf8"));
  const [signer] = await hre.ethers.getSigners();
  if (!signer) throw new Error("No signer. Set PRIVATE_KEY in .env");

  const mc = await hre.ethers.getContractAt("MergedCredit", credits.credit, signer);
  const board = await hre.ethers.getContractAt("BountyBoard", credits.bountyBoard, signer);

  const queue = JSON.parse(readFileSync(TASKS_PATH, "utf8"));
  const open = queue.tasks.filter((t) => t.status === "open" && !t.funded && t.rewardMC > 0);
  if (!open.length) {
    console.log("No open unfunded tasks.");
    return;
  }
  const total = open.reduce((s, t) => s + BigInt(t.rewardMC), 0n);
  const balance = await mc.balanceOf(signer.address);
  console.log(`Funding ${open.length} tasks, total ${total} MC (balance ${balance})`);

  if (balance < total) {
    const tx = await mc.mint(signer.address, total - balance);
    await tx.wait();
    console.log(`Minted ${total - balance} MC`);
  }
  const allowance = await mc.allowance(signer.address, credits.bountyBoard);
  if (allowance < total) {
    const tx = await mc.approve(credits.bountyBoard, total);
    await tx.wait();
    console.log(`Approved board for ${total} MC`);
  }

  for (const task of open) {
    const tx = await board.fund(task.issueId, task.rewardMC);
    const receipt = await tx.wait();
    task.funded = true;
    console.log(`Funded ${task.issueId} (${task.rewardMC} MC) tx ${receipt.hash}`);
  }
  writeFileSync(TASKS_PATH, JSON.stringify(queue, null, 2) + "\n");
  console.log("agents/tasks.json updated - tasks are live.");
}

main().catch((error) => {
  console.error(error.message || error);
  process.exitCode = 1;
});
