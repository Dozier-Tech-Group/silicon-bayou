# Continue on another computer

**Left the previous machine 2026-08-15.** Clone is the source of truth. `.env` was never committed (correct). There is **no** live contract address yet.

> **Update 2026-08-16 (working machine):** the key for `0x9747…F8a5` could not be exported, so a **throwaway deployer** was generated: `0xBA98546Ea9E60Ff469bE7735c0a482C86865aa71` — its key exists **only** in the working machine's local `.env` (never in git, never in chat). `MINT_TO` is unchanged; tokens 1–4 still mint to `0x9747…F8a5`. `scripts/deploy.js` was hardened (rerun guard, incremental deploy records, stale-field cleanup) and rehearsed end-to-end on a local Hardhat network. Test + security gates pass; all 12 metadata URLs verified live. The value thesis is published: [VALUE.md](VALUE.md), live at [mergedpublic.com/silicon-bayou](https://www.mergedpublic.com/silicon-bayou). **Only blocker: ~0.005 ETH to the deployer on chain 4663** (operator bridging from Base via relay.link), then `npm run wallet` → `npm run deploy:mainnet`.

Repo: https://github.com/Dozier-Tech-Group/silicon-bayou · branch `master`

## Paste this into Cursor on the new computer

```
You are continuing Silicon Bayou. Repo: https://github.com/Dozier-Tech-Group/silicon-bayou
Read CONTINUE.md first (including the 2026-08-16 update), then AGENT_IMPLEMENT.md. Also AGENTS.md, LAUNCH.md, SECURITY.md, VALUE.md.

Mission: deploy BAYOU ERC-721 to Robinhood Chain mainnet chain ID 4663, mint tokens 1-4 to 0x97471f8Aa113aF7043B599Ccfb1702F2F78CF8a5, freeze URI, write the address to deployments/robinhood.json, push (never .env), OpenSea.

State: NOT deployed (deployments/robinhood.json address: null). Gates pass. All 12 metadata URLs verified live. deploy.js hardened (rerun guard, incremental records) and rehearsed on local hardhat. Thesis published: VALUE.md, live at mergedpublic.com/silicon-bayou.

Deployer: throwaway 0xBA98546Ea9E60Ff469bE7735c0a482C86865aa71 — key exists ONLY in the working machine's local .env (C:\Users\gdozi\Projects\silicon-bayou). On any other machine, generate a fresh deployer locally, put its key in .env, and fund that instead. Never print, paste, or commit a key. MINT_TO stays 0x9747…F8a5 regardless of deployer.

Blocker: ~0.005 ETH to the deployer on chain 4663. Operator gas source: ~0.024 native ETH on Base at 0x29486Fc6B2E7184Dd4aF4d310D4f85F4262fD11d — bridge via relay.link (Base → Robinhood Chain, recipient = the deployer).

When funded: npm install; npm test; npm run security; npm run wallet (expect the deployer address, Funded true); npm run deploy:mainnet.
After deploy: verify on Blockscout; push deployments/robinhood.json; OpenSea; setDefaultRoyalty(0x9747…F8a5, 500); 2-step transferOwnership toward a Gnosis Safe; sweep leftover gas back to the operator; update the PRE-DEPLOYMENT status blocks in VALUE.md and merged-website public/silicon-bayou/index.html to the live address.

Do not invent a contract address. Do not mint generator/out or photoreal gators. Hybrid stills in art/gators/ are frozen. MAX_SUPPLY is already 4. A rerun of deploy:mainnet over a recorded address is refused by design — recover with mint:genesis / freeze-uri, never REDEPLOY=1 unless you truly mean a second contract.

North star: Merged, Inc. / mergedpublic.com — one day all of Louisiana uses Merged technology for education and other industries and becomes a leading technical developer in the nation. NFTs are not legal contracts. No passive APY.
```

Treat **[AGENT_IMPLEMENT.md](AGENT_IMPLEMENT.md)** as the full system prompt. This file is the short playbook.

---

## North star

**Merged, Inc.** / [mergedpublic.com](https://www.mergedpublic.com) — one day **all of Louisiana uses Merged technology** for education and other industries, and Louisiana becomes a **leading technical developer in the nation**.

Silicon Bayou (`BAYOU`) is the holdable capability layer. Four gators: Engineering, Testing, Construction, Capital. **Not** legal contracts. **No** passive APY.

---

## What is already shipped in this repo

| Piece | Status |
|---|---|
| Hybrid painted genesis stills | Frozen in `art/gators/` and `metadata/images/1.png`–`4.png` |
| Living portraits | HTML loops in `metadata/images/N.html` (Ken-Burns; honors `prefers-reduced-motion`) |
| OpenSea JSON | `metadata/1.json`–`4.json` — `image` / `animation_url` are **live GitHub HTTPS**, not `ipfs://REPLACE_ME` |
| ERC-721 | `contracts/SiliconBayou.sol` — `MAX_SUPPLY = 4`, `MAX_BATCH = 4`, Ownable2Step, pause, ERC-2981 (max 10%), `freezeURI()`, **no proxy** |
| Deploy script | `npm run deploy:mainnet` deploys, mints 1–4, **freezes URI** |
| Gallery | https://dozier-tech-group.github.io/silicon-bayou/gallery/ |
| Tests | `npm test` and `npm run security` are the gate |
| Paused 10k generator | `generator/` source + layers + 8 samples are in git. **Do not run it.** `generator/out` is gitignored and rejected as mint art. |

**Rejected art (never mint/pin/ship):** `generator/out` pixel PFPs, photoreal cinematic 3D.

**Not deployed yet:** there is **no contract address**. Do not invent one. `deployments/robinhood.json` stays `"address": null` until a real tx lands.

---

## The only remaining human step

**Fund the deployer with ~0.005 ETH on Robinhood Chain (4663).**

The key for `0x9747…F8a5` could not be exported, so the launch runs from a **throwaway deployer**:

`0xBA98546Ea9E60Ff469bE7735c0a482C86865aa71`

Its key exists **only** in the working machine's local `.env` (never in git, never in chat). Tokens 1–4 still mint to `MINT_TO=0x97471f8Aa113aF7043B599Ccfb1702F2F78CF8a5` — the deployer is just the gas wallet and initial owner, rotated away after launch.

Operator gas source (confirmed 2026-08-16): ~0.024 native ETH on **Base** at `0x29486Fc6B2E7184Dd4aF4d310D4f85F4262fD11d`. Bridge with relay.link: From **Base (ETH)** → To **Robinhood Chain (ETH)**, amount **0.005**, and set the **recipient** to the deployer address above.

On a **different** machine (no access to this `.env`): generate a fresh deployer locally (`node -e` with ethers `Wallet.createRandom()`), put its key in `.env`, fund *that* address instead. Never reuse a key you cannot verify, never print one.

`.env` non-secret fields (already correct in `.env.example`):

```
RPC_URL=https://rpc.mainnet.chain.robinhood.com
RH_RPC_URL=https://rpc.mainnet.chain.robinhood.com
BASE_URI=https://raw.githubusercontent.com/Dozier-Tech-Group/silicon-bayou/master/metadata/
MINT_TO=0x97471f8Aa113aF7043B599Ccfb1702F2F78CF8a5
GENESIS_ART_READY=1
```

Confirm without printing the key:

```powershell
npm run wallet
```

Expected: **Address** matches the deployer you funded, **Chain ID** 4663, **Funded** true.

If the address does not match what you funded, the `.env` key is wrong. Stop.

---

## Go live (one sitting)

```powershell
cd <clone>
copy .env.example .env
# fill PRIVATE_KEY locally — never commit .env
npm install
npm test
npm run security
npm run wallet
npm run deploy:mainnet
```

`deploy:mainnet` will:

1. Deploy `SiliconBayou` with the GitHub raw `BASE_URI`
2. Mint tokens **1–4** to `MINT_TO`
3. Call `freezeURI()` so the contract cannot point metadata somewhere else
4. Write the real address + tx hashes into `deployments/robinhood.json`

Then:

```powershell
# paste the constructor BASE_URI you deployed with
npx hardhat verify --network robinhood <CONTRACT_ADDRESS> "https://raw.githubusercontent.com/Dozier-Tech-Group/silicon-bayou/master/metadata/"
```

If verify is not wired, paste source on [Blockscout](https://robinhoodchain.blockscout.com).

OpenSea (after indexing):

- Collection: `https://opensea.io/assets/robinhood/<CONTRACT_ADDRESS>`
- Token #1: `https://opensea.io/item/robinhood/<CONTRACT_ADDRESS>/1`

Commit **only** `deployments/robinhood.json` plus README/LAUNCH address updates. **Never** commit `.env`.

---

## After it is live (same day)

EOA owner is the remaining nuclear risk. 2-step rotate to a **Gnosis Safe** on chain 4663:

1. Owner: `transferOwnership(safe)`
2. Confirm `owner()` is still the EOA and `pendingOwner()` is the Safe
3. Safe: `acceptOwnership()`
4. Optional: `setDefaultRoyalty(safe, 500)` (5%)

Do **not** run `npm run mint:testers`. Supply is 4. If a tester needs a token, **transfer** one from the owner wallet.

Optional later: Pinata `PINATA_JWT` → `npm run pin` is **too late after freeze** unless you un-freeze (you cannot). GitHub raw is the frozen metadata host until a future collection. Keep a second copy of the PNGs.

---

## What not to do

- Do not force push, change git config, or commit `.env`
- Do not mint `generator/out` or photoreal gators
- Do not add a public sale, yield, staking, or a proxy
- Do not invent a contract address
- Do not send NFT agents into `CLIENTS\MERGED` unless the task is the mergedpublic.com `/bayou` page
- Do not run `generator/generate.py` or ship `generator/out`

---

## Intentionally not in git

| Item | Why |
|---|---|
| `.env` | Contains `PRIVATE_KEY`. Recreate from `.env.example` on the new machine. |
| `generator/out/` | Rejected pixel batch. Never mint or pin. |
| `node_modules/`, `artifacts/`, `cache/` | Rebuild with `npm install` / `npm run compile`. |

---

## Sibling site (optional)

mergedpublic.com `/bayou` lives in a **different** repo:

`C:\Users\gdozi\OneDrive\Desktop\CLIENTS\MERGED\Merged-Inc\merged-website`

After BAYOU has an address, that page can link the live OpenSea / Blockscout URLs. Not required to mint.

---

## Exact files to open (in this order)

This machine: `C:\Users\gdozi\Projects\silicon-bayou\`  
New machine: `<clone>\` (same relative paths). GitHub: `https://github.com/Dozier-Tech-Group/silicon-bayou/blob/master/<path>`

### Agent reads first

| File | Path |
|---|---|
| Leave-machine playbook | `CONTINUE.md` |
| Full system prompt | `AGENT_IMPLEMENT.md` |
| Standing orders | `AGENTS.md` |
| Launch checklist | `LAUNCH.md` |
| Threat model / Safe rotation | `SECURITY.md` |
| Human README | `README.md` |
| Env template (no secrets) | `.env.example` |
| Deploy record (address still `null`) | `deployments/robinhood.json` |

### Contract and deploy

| File | Path |
|---|---|
| ERC-721 (`MAX_SUPPLY = 4`) | `contracts/SiliconBayou.sol` |
| Deploy + mint 1–4 + freezeURI | `scripts/deploy.js` |
| Wallet check (never prints the key) | `scripts/check-wallet.mjs` |
| Hardhat networks 4663 / 46630 | `hardhat.config.js` |
| Tests | `test/contracts/SiliconBayou.test.js` |

### Genesis art + OpenSea JSON

| File | Path |
|---|---|
| Engineering still | `art/gators/engineering-gator.png` |
| Testing still | `art/gators/testing-gator.png` |
| Construction still | `art/gators/construction-gator.png` |
| Capital still | `art/gators/capital-gator.png` |
| Token metadata | `metadata/1.json` `metadata/2.json` `metadata/3.json` `metadata/4.json` |
| OpenSea images | `metadata/images/1.png` … `4.png` |
| Living portraits | `metadata/images/1.html` … `4.html` |

### Recreate locally, never commit

| File | Path |
|---|---|
| Secrets | `.env` (copy from `.env.example`; set `PRIVATE_KEY` for `0x97471f8Aa113aF7043B599Ccfb1702F2F78CF8a5`) |
