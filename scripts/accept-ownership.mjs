#!/usr/bin/env node
/**
 * Complete the staged Ownable2Step rotation, signed by the OPERATOR wallet
 * (the pending owner on all four contracts), then optionally start the hop
 * to the treasury.
 *
 * Reads OPERATOR_KEY from .env (never printed). For each of BAYOU,
 * MergedCredit, BountyBoard, AccessDesk:
 *   1. acceptOwnership() where pendingOwner == operator (idempotent — skips
 *      contracts already owned or not pending to us).
 *   2. On BAYOU only: retarget ERC-2981 royalties to the treasury (they
 *      currently point at the lost throwaway deployer).
 *   3. If HOP_TO_TREASURY=yes: transferOwnership(treasury) — pending until
 *      the treasury itself calls acceptOwnership() (safe, revocable).
 *
 * Run: node scripts/accept-ownership.mjs
 */
import { readFileSync, existsSync } from "node:fs";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { Contract, JsonRpcProvider, Wallet, formatEther, getAddress } from "ethers";

const root = resolve(fileURLToPath(new URL("..", import.meta.url)));

function loadDotEnv() {
  const p = resolve(root, ".env");
  if (!existsSync(p)) return;
  for (const line of readFileSync(p, "utf8").split(/\r?\n/)) {
    const t = line.trim();
    if (!t || t.startsWith("#")) continue;
    const i = t.indexOf("=");
    if (i < 1) continue;
    const k = t.slice(0, i).trim();
    let v = t.slice(i + 1).trim();
    if ((v.startsWith('"') && v.endsWith('"')) || (v.startsWith("'") && v.endsWith("'"))) v = v.slice(1, -1);
    if (!(k in process.env)) process.env[k] = v;
  }
}
loadDotEnv();

const RPC = process.env.RH_RPC_URL || "https://rpc.mainnet.chain.robinhood.com";
const TREASURY = getAddress("0xBCCAecdBb4F0c7af32C8018486D0b52A474d9B4a");
const CREDITS = JSON.parse(readFileSync(resolve(root, "deployments", "credits.json"), "utf8"));
const CONTRACTS = {
  BAYOU: CREDITS.bayou,
  MergedCredit: CREDITS.credit,
  BountyBoard: CREDITS.bountyBoard,
  AccessDesk: CREDITS.accessDesk,
};

const ABI = [
  "function owner() view returns (address)",
  "function pendingOwner() view returns (address)",
  "function acceptOwnership()",
  "function transferOwnership(address)",
  "function setDefaultRoyalty(address receiver, uint96 feeBps)",
  "function royaltyInfo(uint256, uint256) view returns (address, uint256)",
];

async function main() {
  const key = process.env.OPERATOR_KEY;
  if (!key) throw new Error("HOLD: set OPERATOR_KEY in .env (the operator wallet's private key; never in chat).");
  const provider = new JsonRpcProvider(RPC);
  const wallet = new Wallet(key.startsWith("0x") ? key : "0x" + key, provider);
  const net = await provider.getNetwork();
  if (net.chainId !== 4663n) throw new Error(`HOLD: expected chain 4663, node reports ${net.chainId}.`);
  const bal = await provider.getBalance(wallet.address);
  console.log("Operator:", wallet.address, "|", formatEther(bal), "ETH on 4663");
  if (bal === 0n) throw new Error("Operator wallet has no gas on 4663.");

  const hop = process.env.HOP_TO_TREASURY === "yes";
  for (const [name, addr] of Object.entries(CONTRACTS)) {
    const c = new Contract(addr, ABI, wallet);
    const owner = await c.owner();
    const pending = await c.pendingOwner();
    if (owner.toLowerCase() === wallet.address.toLowerCase()) {
      console.log(`${name}: already owned by operator.`);
    } else if (pending.toLowerCase() === wallet.address.toLowerCase()) {
      const tx = await c.acceptOwnership();
      await tx.wait();
      console.log(`${name}: ownership ACCEPTED by operator (tx ${tx.hash}).`);
    } else {
      console.log(`${name}: pending owner is ${pending}, not the operator — skipping.`);
      continue;
    }

    if (name === "BAYOU") {
      const [receiver] = await c.royaltyInfo(1, 10000);
      if (receiver.toLowerCase() !== TREASURY.toLowerCase()) {
        const tx = await c.setDefaultRoyalty(TREASURY, 500);
        await tx.wait();
        console.log(`BAYOU: royalties retargeted to treasury ${TREASURY} at 5% (tx ${tx.hash}).`);
      } else {
        console.log("BAYOU: royalties already point at the treasury.");
      }
    }

    if (hop) {
      const tx = await c.transferOwnership(TREASURY);
      await tx.wait();
      console.log(`${name}: transferOwnership(${TREASURY}) started — treasury must acceptOwnership() to complete.`);
    }
  }
  if (!hop) console.log("\nRun again with HOP_TO_TREASURY=yes to start the handover to the treasury.");
}

main().catch((e) => {
  console.error(e.message || e);
  process.exitCode = 1;
});
