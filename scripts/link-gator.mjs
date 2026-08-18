#!/usr/bin/env node
/**
 * Link a BAYOU gator to a GitHub account for Gator Works.
 *
 *   node scripts/link-gator.mjs sign --github <username> [--tokens 1,2,3]
 *     Holder mode. Signs the canonical message with PRIVATE_KEY from local
 *     .env and prints the registry JSON block. Never prints the key.
 *
 *   node scripts/link-gator.mjs verify --file <entry.json> [--write]
 *     Anyone. Recovers the signer from the signature, checks the wallet holds
 *     BAYOU on chain 4663 (and ownerOf for each claimed tokenId), and with
 *     --write appends the entry to agents/registry.json.
 */
import { readFileSync, writeFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { Wallet, JsonRpcProvider, Contract, verifyMessage, getAddress } from "ethers";
import "dotenv/config";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const REGISTRY = join(ROOT, "agents", "registry.json");
const DEPLOY = JSON.parse(readFileSync(join(ROOT, "deployments", "robinhood.json"), "utf8"));
const RPC = process.env.RH_RPC_URL || process.env.RPC_URL || DEPLOY.rpc;
const ABI = [
  "function balanceOf(address) view returns (uint256)",
  "function ownerOf(uint256) view returns (address)",
];

function canonicalMessage(github, wallet) {
  return `Silicon Bayou gator link v1: github=${github} wallet=${wallet}`;
}

function arg(name, fallback) {
  const i = process.argv.indexOf(`--${name}`);
  return i > -1 ? process.argv[i + 1] : fallback;
}

async function sign() {
  const github = arg("github");
  if (!github) throw new Error("Missing --github <username>");
  if (!process.env.PRIVATE_KEY) throw new Error("Set PRIVATE_KEY in your local .env (never commit it)");
  const wallet = new Wallet(process.env.PRIVATE_KEY);
  const address = await wallet.getAddress();
  const tokens = (arg("tokens", "") || "")
    .split(",")
    .map((t) => Number(t.trim()))
    .filter((n) => Number.isInteger(n) && n >= 1 && n <= 198);
  const message = canonicalMessage(github, address);
  const signature = await wallet.signMessage(message);
  const entry = { github, wallet: address, tokenIds: tokens, signature, linkedAt: new Date().toISOString().slice(0, 10) };
  console.log("Add this block to agents/registry.json via PR (or a Holder access issue):\n");
  console.log(JSON.stringify(entry, null, 2));
}

async function verify() {
  const file = arg("file");
  if (!file) throw new Error("Missing --file <entry.json>");
  const entry = JSON.parse(readFileSync(file, "utf8"));
  const wallet = getAddress(entry.wallet);
  const message = canonicalMessage(entry.github, wallet);
  const recovered = verifyMessage(message, entry.signature);
  if (getAddress(recovered) !== wallet) {
    throw new Error(`Signature does not recover ${wallet} (got ${recovered})`);
  }
  console.log("signature   : OK —", wallet);

  const provider = new JsonRpcProvider(RPC);
  const bayou = new Contract(DEPLOY.address, ABI, provider);
  const balance = await bayou.balanceOf(wallet);
  if (balance === 0n) throw new Error(`${wallet} holds no BAYOU on chain 4663`);
  console.log("balanceOf   :", balance.toString());
  for (const id of entry.tokenIds || []) {
    const owner = getAddress(await bayou.ownerOf(id));
    if (owner !== wallet) throw new Error(`Token ${id} is owned by ${owner}, not ${wallet}`);
    console.log(`ownerOf(${id}) : OK`);
  }

  if (process.argv.includes("--write")) {
    const registry = JSON.parse(readFileSync(REGISTRY, "utf8"));
    if (registry.agents.some((a) => getAddress(a.wallet) === wallet || a.github === entry.github)) {
      throw new Error("Wallet or GitHub name already registered");
    }
    registry.agents.push(entry);
    writeFileSync(REGISTRY, JSON.stringify(registry, null, 2) + "\n");
    console.log("registry    : entry appended to agents/registry.json");
  } else {
    console.log("registry    : verification only (pass --write to append)");
  }
}

const mode = process.argv[2];
const run = mode === "sign" ? sign : mode === "verify" ? verify : null;
if (!run) {
  console.error("Usage: link-gator.mjs sign --github <u> [--tokens 1,2] | verify --file <entry.json> [--write]");
  process.exit(1);
}
run().catch((e) => {
  console.error(e.message || e);
  process.exit(1);
});
