/**
 * Owner tool: wind down the BAYOU-gated BountyBoard, declared and final.
 *
 *   npx hardhat run scripts/winddown-bountyboard.js --network robinhood            # dry run
 *   WINDDOWN=1 npx hardhat run scripts/winddown-bountyboard.js --network robinhood # execute
 *
 * Order matters (withdraw() is whenNotPaused):
 *   1. settle every funded, unsettled bounty to the OWNER wallet (it holds
 *      BAYOU, satisfying the gate) — an explicit wind-down, not earned work
 *   2. withdraw() the full escrow back to the owner
 *   3. pause() the board — permanently, by declaration
 *
 * Needs the owner key in local .env. Records everything in
 * deployments/credits.json under windDown and in agents/settlements.json
 * (marked kind: "wind-down" so no one mistakes it for earned settlement).
 */
const { readFileSync, writeFileSync, existsSync } = require("fs");
const { join } = require("path");
const hre = require("hardhat");

const CREDITS_PATH = join(__dirname, "..", "deployments", "credits.json");
const LOG_PATH = join(__dirname, "..", "agents", "settlements.json");
const BOUNTY_IDS = [1001, 1002, 1003]; // the only ids ever funded (agents/tasks.json)

async function main() {
  const execute = process.env.WINDDOWN === "1";
  const credits = JSON.parse(readFileSync(CREDITS_PATH, "utf8"));
  const [signer] = await hre.ethers.getSigners();
  if (!signer) throw new Error("No signer. Set PRIVATE_KEY (owner) in .env");

  const board = await hre.ethers.getContractAt("BountyBoard", credits.bountyBoard, signer);
  const mc = await hre.ethers.getContractAt("MergedCredit", credits.credit, signer);

  const owner = await board.owner();
  if (owner.toLowerCase() !== signer.address.toLowerCase()) {
    throw new Error(`Signer ${signer.address} is not the board owner ${owner}`);
  }
  const escrow = await mc.balanceOf(credits.bountyBoard);
  console.log(`Board ${credits.bountyBoard} | owner ${owner} | escrow ${escrow} MC | paused ${await board.paused()}`);
  console.log(execute ? "MODE: EXECUTE" : "MODE: dry run (set WINDDOWN=1 to execute)");

  const settledNow = [];
  for (const id of BOUNTY_IDS) {
    const b = await board.bounties(id);
    if (b.reward === 0n) { console.log(`  ${id}: never funded — skip`); continue; }
    if (b.settled) { console.log(`  ${id}: already settled to ${b.winner} — skip`); continue; }
    console.log(`  ${id}: reward ${b.reward} MC -> settle to owner ${signer.address}`);
    if (execute) {
      const tx = await board.settle(id, signer.address);
      const rc = await tx.wait();
      console.log(`    settled, tx ${rc.hash}`);
      settledNow.push({ issueId: id, winner: signer.address, reward: b.reward.toString(), tx: rc.hash, kind: "wind-down" });
    }
  }

  const claimable = await board.claimable(signer.address);
  console.log(`claimable(owner) after settles: ${execute ? claimable : "(dry run)"} MC`);
  let withdrawTx = null;
  if (execute && claimable > 0n) {
    const tx = await board.withdraw();
    const rc = await tx.wait();
    withdrawTx = rc.hash;
    console.log(`withdrew ${claimable} MC, tx ${withdrawTx}`);
  }

  let pauseTx = null;
  if (execute) {
    const tx = await board.pause();
    const rc = await tx.wait();
    pauseTx = rc.hash;
    console.log(`board paused, tx ${pauseTx}`);
  } else {
    console.log("would pause() the board last");
  }

  if (execute) {
    const log = existsSync(LOG_PATH) ? JSON.parse(readFileSync(LOG_PATH, "utf8")) : { settlements: [] };
    log.settlements.push(...settledNow);
    writeFileSync(LOG_PATH, JSON.stringify(log, null, 2) + "\n");

    credits.windDown = {
      date: new Date().toISOString(),
      reason: "Merged Public decoupled from BAYOU; this board is retired. Escrow settled to owner and withdrawn as a declared wind-down (not earned work); board paused permanently.",
      settlements: settledNow,
      withdrawTx,
      pauseTx,
      escrowRecovered: escrow.toString(),
    };
    writeFileSync(CREDITS_PATH, JSON.stringify(credits, null, 2) + "\n");
    console.log("Recorded windDown in deployments/credits.json + agents/settlements.json");
    console.log(`final escrow: ${await mc.balanceOf(credits.bountyBoard)} MC | paused: ${await board.paused()}`);
  }
}

main().catch((e) => { console.error(e.message || e); process.exitCode = 1; });
