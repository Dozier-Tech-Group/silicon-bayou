#!/usr/bin/env node
/**
 * Initiate the Ownable2Step handover to the operator on ALL revenue contracts:
 * BAYOU NFT, MergedCredit, BountyBoard, AccessDesk.
 *
 * Safe by design: nothing changes hands until the operator wallet calls
 * acceptOwnership() on each contract (Blockscout > Contract > Write). Until
 * then the current owner can overwrite the pending owner. Idempotent — skips
 * contracts already rotated or already pending to the operator.
 *
 * Never prints PRIVATE_KEY. Run: node scripts/rotate-ownership.mjs
 */
import { readFileSync, existsSync } from "node:fs";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { Contract, JsonRpcProvider, Wallet, formatEther } from "ethers";

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
    if ((v.startsWith('"') && v.endsWith('"')) || (v.startsWith("'") && v.endsWith("'"))) {
      v = v.slice(1, -1);
    }
    if (process.env[k] === undefined) process.env[k] = v;
  }
}

loadDotEnv();

const RPC =
  process.env.RH_RPC_URL ||
  process.env.RPC_URL ||
  "https://rpc.mainnet.chain.robinhood.com";
const OPERATOR = "0x29486Fc6B2E7184Dd4aF4d310D4f85F4262fD11d";

const CONTRACTS = [
  { name: "SiliconBayou (BAYOU)", address: "0xA81aEd6f3a5Faea95197786ba162e706Fd938d20" },
  { name: "MergedCredit (MC)", address: "0x040f12C71ddA0bA9D91E94016ea5C348106ab429" },
  { name: "BountyBoard", address: "0xd7899073819206828b7f4c7bB8aE4C530E93C0A2" },
  { name: "AccessDesk", address: "0x7EEc6e95179B8ae86CEbA24025ae35BaDbf0d4e9" },
];

const ABI = [
  "function owner() view returns (address)",
  "function pendingOwner() view returns (address)",
  "function transferOwnership(address newOwner)",
];

const key = process.env.PRIVATE_KEY;
if (!key) {
  console.error("PRIVATE_KEY missing in .env — nothing signed, nothing sent.");
  process.exit(2);
}

const provider = new JsonRpcProvider(RPC, 4663);
const signer = new Wallet(key, provider);
const signerAddress = await signer.getAddress();
console.log("Signer  :", signerAddress);
console.log("Balance :", formatEther(await provider.getBalance(signerAddress)), "ETH");
console.log("Target  :", OPERATOR, "(operator)\n");

let failures = 0;
for (const { name, address } of CONTRACTS) {
  const c = new Contract(address, ABI, signer);
  const [owner, pending] = await Promise.all([c.owner(), c.pendingOwner()]);

  if (owner.toLowerCase() === OPERATOR.toLowerCase()) {
    console.log(`OK      ${name}: already owned by operator`);
    continue;
  }
  if (owner.toLowerCase() !== signerAddress.toLowerCase()) {
    console.log(`SKIP    ${name}: owner is ${owner}, not the signer`);
    failures++;
    continue;
  }
  if (pending.toLowerCase() === OPERATOR.toLowerCase()) {
    console.log(`PENDING ${name}: transfer already initiated, awaiting acceptOwnership()`);
    continue;
  }

  const tx = await c.transferOwnership(OPERATOR);
  const receipt = await tx.wait();
  const after = await c.pendingOwner();
  const ok = after.toLowerCase() === OPERATOR.toLowerCase();
  console.log(`${ok ? "SENT   " : "ERROR  "} ${name}: tx ${receipt.hash} (pendingOwner ${ok ? "verified" : after})`);
  if (!ok) failures++;
}

console.log(
  `\nNext (operator wallet ${OPERATOR}):\n` +
    "open each contract on https://robinhoodchain.blockscout.com > Contract > Write,\n" +
    "connect the operator wallet, call acceptOwnership(). Then run\n" +
    "node scripts/sweep-deployer.mjs to sweep leftover gas and retire the key."
);
process.exitCode = failures ? 1 : 0;
