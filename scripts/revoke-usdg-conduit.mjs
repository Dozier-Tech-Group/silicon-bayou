#!/usr/bin/env node
/**
 * Disarm the standing USDG approval trap on the operator wallet
 * (SECURITY.md 2026-08 audit finding: unlimited allowance to the shared
 * Seaport conduit — a conduit-operator compromise drains every USDG the
 * wallet ever receives, with no further signature).
 *
 * Default mode (no args, NO key needed): read-only report. Scans USDG
 * Approval logs from the operator, lists every distinct spender with its
 * CURRENT allowance, flags anything non-zero, prints the operator balance.
 *
 * Mode --revoke: sends approve(spender, 0) from the operator wallet and
 * verifies the allowance reads back 0. Requires OPERATOR_PRIVATE_KEY in the
 * environment — NOT the .env PRIVATE_KEY, which is the Merged Public
 * deployer, a different role. Default spender is the Seaport conduit;
 * --spender 0x... targets a different one from the report.
 *
 * Never prints any key or env var value. Run: node scripts/revoke-usdg-conduit.mjs
 */
import { readFileSync, existsSync } from "node:fs";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { Contract, JsonRpcProvider, Wallet, MaxUint256, formatEther, formatUnits, getAddress, isAddress, zeroPadValue } from "ethers";

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
const CHAIN_ID = 4663;
const USDG = "0x5fc5360D0400a0Fd4f2af552ADD042D716F1d168"; // canonical USDG, 6 decimals
const OPERATOR = "0x29486Fc6B2E7184Dd4aF4d310D4f85F4262fD11d";
const CONDUIT = "0x963F00d3ff000064fFCbA824b800c0000000C300"; // shared Seaport conduit
const APPROVAL_TOPIC = "0x8c5be1e5ebec7d5bd14f71427d1e84f3dd0314c0f7b2291e5b200ac8c7c3b925"; // Approval(address,address,uint256)
const EXPLORER = "https://robinhoodchain.blockscout.com";

const ABI = [
  "function allowance(address owner, address spender) view returns (uint256)",
  "function balanceOf(address owner) view returns (uint256)",
  "function approve(address spender, uint256 value) returns (bool)",
];

// Strict argv (same approach as scripts/pin-mp-reveal.mjs): any argument that
// is not an exactly recognized flag, or a value consumed by one, is a loud
// HOLD before ANY network or key handling. A misspelled --spendor would
// otherwise be silently ignored and --revoke would zero the DEFAULT conduit
// while printing success — wrong-target "success" is worse than failure.
const args = process.argv.slice(2);
let doRevoke = false;
let target = CONDUIT;
for (let i = 0; i < args.length; i++) {
  const a = args[i];
  const eq = a.indexOf("=");
  const key = eq > 0 ? a.slice(0, eq) : a;
  const val = () => (eq > 0 ? a.slice(eq + 1) : args[++i]);
  if (a === "--revoke") doRevoke = true;
  else if (key === "--spender") {
    const raw = val();
    if (!raw || !isAddress(raw)) {
      console.error("HOLD: --spender needs a valid address (copy one from the read-only report).");
      console.error("usage: node scripts/revoke-usdg-conduit.mjs [--revoke] [--spender 0x...]");
      process.exit(2);
    }
    target = getAddress(raw);
  } else {
    console.error(`HOLD: unknown argument '${a}'. Nothing scanned, nothing sent.`);
    console.error("usage: node scripts/revoke-usdg-conduit.mjs [--revoke] [--spender 0x...]");
    process.exit(2);
  }
}

const provider = new JsonRpcProvider(RPC, CHAIN_ID);
const token = new Contract(USDG, ABI, provider);

function showAllowance(v) {
  if (v === MaxUint256) return "UNLIMITED (2^256-1)";
  return `${formatUnits(v, 6)} USDG`;
}

// ---- Approval-log scan: every spender the operator ever approved ----------
async function scanSpenders() {
  const filter = {
    address: USDG,
    topics: [APPROVAL_TOPIC, zeroPadValue(OPERATOR, 32)],
  };
  let logs;
  try {
    logs = await provider.getLogs({ ...filter, fromBlock: 0, toBlock: "latest" });
  } catch {
    // Some RPCs cap the block range — fall back to chunked scanning.
    console.log("(full-range getLogs refused; scanning in 1M-block chunks)");
    logs = [];
    const latest = await provider.getBlockNumber();
    const STEP = 1_000_000;
    for (let from = 0; from <= latest; from += STEP) {
      const to = Math.min(from + STEP - 1, latest);
      logs.push(...(await provider.getLogs({ ...filter, fromBlock: from, toBlock: to })));
    }
  }
  const spenders = new Map(); // address -> last-seen block
  for (const log of logs) {
    const spender = getAddress("0x" + log.topics[2].slice(26));
    spenders.set(spender, log.blockNumber);
  }
  return spenders;
}

const spenders = await scanSpenders();

console.log(`USDG      : ${USDG} (6 decimals, chain ${CHAIN_ID})`);
console.log(`Operator  : ${OPERATOR}`);
console.log(`Balance   : ${formatUnits(await token.balanceOf(OPERATOR), 6)} USDG\n`);

if (spenders.size === 0) {
  console.log("No Approval logs from the operator — no spenders to check.");
} else {
  console.log(`${spenders.size} distinct approved spender(s) in the log history:\n`);
}

let live = 0;
for (const [spender, block] of spenders) {
  const current = await token.allowance(OPERATOR, spender);
  const label =
    spender === CONDUIT ? " <- Seaport conduit (SECURITY.md audit finding)" : "";
  if (current > 0n) {
    live++;
    console.log(`  LIVE  ${spender}  allowance ${showAllowance(current)}  (last approval block ${block})${label}`);
  } else {
    console.log(`  zero  ${spender}  allowance 0  (last approval block ${block})${label}`);
  }
}

if (live > 0) {
  console.log(
    `\nHOLD: ${live} non-zero allowance(s) above are a standing trap — any USDG` +
      "\nthis wallet receives can be pulled by those spenders with no further" +
      "\nsignature. Revoke with:" +
      "\n  OPERATOR_PRIVATE_KEY=... node scripts/revoke-usdg-conduit.mjs --revoke [--spender 0x...]" +
      "\nor manually from the operator wallet on Blockscout:" +
      `\n  ${EXPLORER}/address/${USDG}?tab=write_contract` +
      `\n  approve(spender, 0) — for the conduit: approve(${CONDUIT}, 0)`
  );
} else if (spenders.size > 0) {
  console.log("\nAll historical approvals are back at zero. Nothing to revoke.");
}

if (!doRevoke) process.exit(0);

// ---- --revoke: sign approve(target, 0) from the operator -------------------
console.log(`\n--revoke: zeroing allowance to ${target}\n`);

const rawKey = process.env.OPERATOR_PRIVATE_KEY;
if (!rawKey) {
  console.error(
    "HOLD: OPERATOR_PRIVATE_KEY is not set — nothing signed, nothing sent.\n" +
      "This script signs as the OPERATOR wallet. The .env PRIVATE_KEY is the\n" +
      "Merged Public deployer — a different role — and is deliberately not used.\n" +
      "Export the operator key for this one run:\n" +
      "  OPERATOR_PRIVATE_KEY=... node scripts/revoke-usdg-conduit.mjs --revoke"
  );
  process.exit(2);
}

// Pre-validate the key SHAPE before ethers ever sees it: ethers 6 embeds the
// malformed value in its invalid-BytesLike error message, so an uncaught
// new Wallet(key) would echo a nearly-real key (trailing newline, stray
// quote, 63-hex truncation) to stderr.
const key = rawKey.trim();
if (!/^(0x)?[0-9a-fA-F]{64}$/.test(key)) {
  console.error(
    "HOLD: OPERATOR_PRIVATE_KEY is set but is not 64 hex characters\n" +
      "(optionally 0x-prefixed). The value is deliberately NOT printed.\n" +
      "Common causes: a trailing newline, a stray quote from copy-paste, or a\n" +
      "truncated key. Fix the env value and re-run. Nothing signed, nothing sent."
  );
  process.exit(2);
}

let signer;
try {
  signer = new Wallet(key, provider);
} catch {
  // Never interpolate the key OR the caught error here — ethers embeds the
  // offending value in err.message too.
  console.error(
    "HOLD: OPERATOR_PRIVATE_KEY passed the shape check but ethers refused to\n" +
      "construct a wallet from it (the value and the underlying error message\n" +
      "are deliberately NOT printed). Nothing signed, nothing sent."
  );
  process.exit(2);
}
const signerAddress = await signer.getAddress();
if (signerAddress.toLowerCase() !== OPERATOR.toLowerCase()) {
  console.error(
    `HOLD: OPERATOR_PRIVATE_KEY derives to ${signerAddress},\n` +
      `not the operator ${OPERATOR}.\n` +
      "Refusing to sign — the allowance lives on the operator, so only the\n" +
      "operator's approve(spender, 0) can clear it. Check which key you exported."
  );
  process.exit(1);
}
console.log("Signer  :", signerAddress, "(verified operator)");
console.log("Gas     :", formatEther(await provider.getBalance(signerAddress)), "ETH");

const before = await token.allowance(OPERATOR, target);
if (before === 0n) {
  console.log(`\nAllowance to ${target} is already 0 — nothing to send.`);
  process.exit(0);
}
console.log(`Before  : ${showAllowance(before)}`);

const tx = await token.connect(signer).approve(target, 0n);
console.log("Sent    :", tx.hash);
const receipt = await tx.wait();
console.log("Mined   : block", receipt.blockNumber, `(${EXPLORER}/tx/${receipt.hash})`);

const after = await token.allowance(OPERATOR, target);
if (after !== 0n) {
  console.error(
    `\nHOLD: allowance read-back is ${showAllowance(after)}, not 0.\n` +
      "The transaction mined but the trap is still live — investigate before\n" +
      "trusting this wallet with USDG."
  );
  process.exit(1);
}
console.log(`\nVerified: allowance(operator, ${target}) reads back 0. Trap disarmed.`);
process.exit(0);
