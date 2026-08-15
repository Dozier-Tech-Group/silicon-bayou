#!/usr/bin/env node
/**
 * Report deployer address + Robinhood Chain ETH balance.
 * Never prints PRIVATE_KEY.
 */
import { readFileSync, existsSync } from "node:fs";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { JsonRpcProvider, Wallet, formatEther } from "ethers";

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

const key = process.env.PRIVATE_KEY;

if (!key) {
  console.log("PRIVATE_KEY: missing");
  console.log("RPC:", RPC);
  console.log(`
Funded-wallet steps (do this locally — do not paste the key into chat):

1. Create a throwaway deployer in MetaMask or Robinhood Wallet.
2. Add Robinhood Chain:
     Network name : Robinhood Chain
     Chain ID     : 4663
     RPC          : https://rpc.mainnet.chain.robinhood.com
     Symbol       : ETH
     Explorer     : https://robinhoodchain.blockscout.com
3. Bridge a little ETH onto Robinhood Chain (official docs):
     https://docs.robinhood.com/chain/connecting/
4. Export the account private key in the wallet UI.
5. In this repo:
     copy .env.example .env
   Then set PRIVATE_KEY and:
     RPC_URL=https://rpc.mainnet.chain.robinhood.com
6. Re-run:  node scripts/check-wallet.mjs
7. When balance > 0:  npm run compile ; npm run deploy:mainnet
`);
  process.exitCode = 2;
  process.exit();
}

const provider = new JsonRpcProvider(RPC, 4663);
const wallet = new Wallet(key, provider);
const address = await wallet.getAddress();
const [network, balance, block] = await Promise.all([
  provider.getNetwork(),
  provider.getBalance(address),
  provider.getBlockNumber(),
]);

console.log("Address :", address);
console.log("Chain ID:", network.chainId.toString());
console.log("Block   :", block);
console.log("RPC     :", RPC);
console.log("Balance :", formatEther(balance), "ETH");
console.log("Funded  :", balance > 0n);
if (balance === 0n) {
  console.log("BLOCKED: send ETH on Robinhood Chain (4663) to the address above, then redeploy.");
  process.exitCode = 2;
}
