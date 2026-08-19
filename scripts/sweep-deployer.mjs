#!/usr/bin/env node
/**
 * Final retirement of the throwaway deployer: sweep remaining ETH to the
 * operator. REFUSES to run until all four contracts are owned by the operator
 * (a swept deployer cannot re-initiate a failed handover).
 *
 * Never prints PRIVATE_KEY. Run: node scripts/sweep-deployer.mjs
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
  ["SiliconBayou (BAYOU)", "0xA81aEd6f3a5Faea95197786ba162e706Fd938d20"],
  ["MergedCredit (MC)", "0x040f12C71ddA0bA9D91E94016ea5C348106ab429"],
  ["BountyBoard", "0xd7899073819206828b7f4c7bB8aE4C530E93C0A2"],
  ["AccessDesk", "0x7EEc6e95179B8ae86CEbA24025ae35BaDbf0d4e9"],
];
const ABI = ["function owner() view returns (address)"];

const key = process.env.PRIVATE_KEY;
if (!key) {
  console.error("PRIVATE_KEY missing in .env — nothing signed, nothing sent.");
  process.exit(2);
}

const provider = new JsonRpcProvider(RPC, 4663);
const signer = new Wallet(key, provider);
const signerAddress = await signer.getAddress();

// .env sometimes holds a different role's key (e.g. the Merged Public deployer
// staged for launch). Sweeping the wrong wallet would drain that launch gas to
// the operator while looking like success — so pin the exact address to retire.
const EXPECTED_DEPLOYER = "0xBA98546Ea9E60Ff469bE7735c0a482C86865aa71";
if (signerAddress.toLowerCase() !== EXPECTED_DEPLOYER.toLowerCase()) {
  console.error(
    `Refusing to sweep: .env PRIVATE_KEY derives to ${signerAddress},\n` +
      `not the retiring deployer ${EXPECTED_DEPLOYER}.\n` +
      "Re-export the deployer key into .env for this one run, then delete it."
  );
  process.exit(3);
}

let blocked = false;
for (const [name, address] of CONTRACTS) {
  const owner = await new Contract(address, ABI, provider).owner();
  const done = owner.toLowerCase() === OPERATOR.toLowerCase();
  console.log(`${done ? "OK     " : "BLOCKED"} ${name}: owner ${owner}`);
  if (!done) blocked = true;
}
if (blocked) {
  console.error(
    "\nRefusing to sweep: not every contract is owned by the operator yet.\n" +
      "Finish acceptOwnership() on the contracts marked BLOCKED, then re-run."
  );
  process.exit(1);
}

const balance = await provider.getBalance(signerAddress);
const fee = await provider.getFeeData();
const gasPrice = fee.gasPrice ?? 1_000_000_000n;
const gasLimit = 21_000n;
const value = balance - gasPrice * gasLimit * 2n; // 2x headroom on the fee
if (value <= 0n) {
  console.log(`Nothing to sweep: balance ${formatEther(balance)} ETH barely covers gas.`);
  process.exit(0);
}

const tx = await signer.sendTransaction({ to: OPERATOR, value, gasLimit, gasPrice });
const receipt = await tx.wait();
console.log(`\nSwept ${formatEther(value)} ETH to operator ${OPERATOR}`);
console.log("Tx:", receipt.hash);
console.log("Deployer balance now:", formatEther(await provider.getBalance(signerAddress)), "ETH");
console.log("Retire the key: delete it from the wallet app and from .env.");
