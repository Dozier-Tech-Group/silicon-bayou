# Continue on another computer

**Left the previous machine 2026-08-15.** Clone is the source of truth. `.env` was never committed (correct). There is **no** live contract address yet.

Repo: https://github.com/Dozier-Tech-Group/silicon-bayou · branch `master`

## Paste this into Cursor on the new computer

```
You are continuing Silicon Bayou. Repo: https://github.com/Dozier-Tech-Group/silicon-bayou
Read CONTINUE.md first, then AGENT_IMPLEMENT.md as the system prompt. Also AGENTS.md, LAUNCH.md, SECURITY.md.

Mission: deploy BAYOU ERC-721 to Robinhood Chain mainnet chain ID 4663, mint tokens 1-4 to 0x97471f8Aa113aF7043B599Ccfb1702F2F78CF8a5, freeze URI, write the address to deployments/robinhood.json, push (never .env), OpenSea.

Do not invent a contract address. Do not mint generator/out or photoreal gators. Hybrid stills in art/gators/ are frozen. MAX_SUPPLY is already 4.

The funded wallet is that 0x9747… address. PRIVATE_KEY is not in git. Ask for a file path, copy into local .env, never print the key. Then: npm install; npm test; npm run security; npm run wallet; npm run deploy:mainnet.

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

The funded EOA on Robinhood Chain 4663 is:

`0x97471f8Aa113aF7043B599Ccfb1702F2F78CF8a5`

It has ETH for gas. Tokens 1–4 should mint **to that address** (`MINT_TO`).

What is **not** in git (and must never be): the **private key** that controls that wallet.

On the new machine:

1. Export the key from MetaMask / Coinbase Wallet / Robinhood Wallet for **that same address**. Never paste it into chat.
2. Copy `.env.example` → `.env`.
3. Set:

```
PRIVATE_KEY=<exported key, with or without 0x>
RPC_URL=https://rpc.mainnet.chain.robinhood.com
RH_RPC_URL=https://rpc.mainnet.chain.robinhood.com
BASE_URI=https://raw.githubusercontent.com/Dozier-Tech-Group/silicon-bayou/master/metadata/
MINT_TO=0x97471f8Aa113aF7043B599Ccfb1702F2F78CF8a5
GENESIS_ART_READY=1
```

4. Confirm without printing the key:

```powershell
npm run wallet
```

Expected: **Address** matches `0x9747…F8a5`, **Chain ID** 4663, **Funded** true.

If the address does not match, you exported the wrong account. Stop.

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
