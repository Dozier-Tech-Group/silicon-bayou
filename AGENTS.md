# Silicon Bayou — agent standing orders

Copy this file **or `AGENT_IMPLEMENT.md`** as the system prompt. On a new machine, start with **`CONTINUE.md`**. The full built-vs-not-built plan is in `AGENT_IMPLEMENT.md`. Execute. Do not reinvent the project.

## Workspace (non-negotiable)

This repo is the **only** place for NFT / chain / gallery / generator / launch.

- GitHub: https://github.com/Dozier-Tech-Group/silicon-bayou
- Local: `C:\Users\gdozi\Projects\silicon-bayou`
- Org: **Dozier-Tech-Group**. Branch: `master`.
- Default workspace = **this repo**. Stay here.

Do **not** open `CLIENTS\MERGED` unless the task is specifically **put a page on mergedpublic.com**. That site lives at `C:\Users\gdozi\OneDrive\Desktop\CLIENTS\MERGED\Merged-Inc\merged-website` (and `merged-public`). Unrelated to minting, pinning, or deploying BAYOU.

## North star (do not water down)

**Merged, Inc.** / [mergedpublic.com](https://www.mergedpublic.com) — the open source institutional network. One day **all of Louisiana uses Merged technology** for education and other industries and becomes a **leading technical developer in the nation**.

Gators are the visual / capability layer of that bet. Four tokens in this repo are Phase 0.

- NFTs are **not** legal contracts, diplomas, SAM.gov records, or grant awards.
- **No** passive yield, staking APY, or guaranteed returns.
- Full thesis: `PLAN.md`. Do not implement PLAN.md unless asked.

## Art (critical)

Two looks are **rejected**. Do not mint, pin, or ship either:

- Funky **16-bit pixel** PFPs (`generator/out` JPGs). Never ship `generator/out`.
- Too-**photoreal cinematic 3D**. Not a photo.

**Target: HYBRID** — stylized illustrated / premium painted PFP. Readable collectible silhouette from the pixel set + clean lighting/finish from the cinematic set. Not a sprite, not a photo.

- Hero stills are **frozen**: `art/gators/*-gator.png` (copied to `*-still.png` and `metadata/images/1.png`–`4.png`). Hybrid painted PFP. Not pixel, not photoreal.
- Living portraits: `gallery/tokens/N.html` (gallery) and `metadata/images/N.html` (OpenSea `animation_url`). Calm Ken-Burns + light/mist. Honor `prefers-reduced-motion`.
- Token map: #1 Engineering · #2 Testing · #3 Construction · #4 Capital.
- `generator/` is a **paused experiment** only. Do not run `generate.py`, do not `--count 10000`.
- Pin/deploy still requires `GENESIS_ART_READY=1` so a human sets the freeze flag locally.

## Launch — execute in this order

No live contract yet. `deployments/robinhood.json` has `"address": null`. **Do not invent an address.** `MAX_SUPPLY = 4` is in the contract. `scripts/deploy.js` deploys, mints 1–4, and freezes URI. The blocker is `PRIVATE_KEY` in local `.env`.

`scripts/deploy.js` **deploys, mints 1–4, and freezes URI**. Set `BASE_URI` to the GitHub raw metadata folder before mainnet.

1. Freeze the 4 **hybrid** gators (`art/gators/` + `metadata/images/1-4.png`) **after the user okays them**. Not pixel sprites. Not photoreal 3D.
2. Freeze metadata JSON (`metadata/1.json`–`4.json`). Launch host is GitHub HTTPS (not `ipfs://REPLACE_ME`).
3. Pin to IPFS is **optional and too late after freeze**. Launch uses GitHub raw `BASE_URI`.
4. Robinhood Chain **mainnet** config: chain ID **4663**, gas in **ETH**. `RPC_URL=https://rpc.mainnet.chain.robinhood.com` (Alchemy `https://robinhood-mainnet.g.alchemy.com/v2/{API_KEY}` if public RPC flakes).
5. Fund the deployer with ETH on Robinhood mainnet. `PRIVATE_KEY` in `.env` only. **Never commit. Never print. Never paste into chat.**
6. Security gate, then deploy BAYOU ERC-721: `npm test` and `npm run security` **must pass** before `npm run deploy:mainnet` (rehearse first with `npm run deploy:testnet`, chain ID **46630**). Do not skip the gate.
7. `freezeURI` runs inside `deploy:mainnet`. Do not `setBaseURI` afterward.
8. Tokens 1–4 mint in the deploy script. Do not write a second mint path unless mint failed.
9. Verify on [robinhoodchain.blockscout.com](https://robinhoodchain.blockscout.com). Constructor arg = the `BASE_URI` you deployed with. Plugin is not in `package.json` yet — paste source or `npm i -D @nomicfoundation/hardhat-verify` then `npx hardhat verify --network robinhood <ADDRESS> "https://raw.githubusercontent.com/Dozier-Tech-Group/silicon-bayou/master/metadata/"`.
10. OpenSea → filter **Robinhood Chain** → open the contract. Share with 2–3 testers (`TESTERS.md`). Gallery: `npm run gallery` → http://localhost:4173/gallery/ · live preview https://dozier-tech-group.github.io/silicon-bayou/gallery/

After a real deploy, write the address to `deployments/` and README. Until then there is **no** collection address.

## Commands

```powershell
cd C:\Users\gdozi\Projects\silicon-bayou
copy .env.example .env
npm install
npm run compile
npm test
npm run security
npm run gallery
npm run deploy:testnet
npm run deploy:mainnet
```

`.env`: `PRIVATE_KEY`, `RPC_URL`, `BASE_URI` (trailing slash), `MINT_TO`, `GENESIS_ART_READY=1`. Hardhat networks: `robinhood` (4663), `robinhoodTestnet` (46630). Contract: `contracts/SiliconBayou.sol` — name `Silicon Bayou`, symbol `BAYOU`, **`MAX_SUPPLY = 4`**, owner-only `mint` / `mintBatch` / `setBaseURI` / `freezeURI` / `pause`. Ownable2Step, Pausable, ERC-2981 (max 10% royalty), URI freeze. Solidity **0.8.24** frozen / Shanghai. Not upgradeable. Official deploy docs: https://docs.robinhood.com/chain/deploy-smart-contracts/

**Security gate:** `npm test` and `npm run security` before any `deploy:mainnet`. Optional: `forge test` if Foundry is on PATH. Threat model and owner rotation: `SECURITY.md`. Recommend a Gnosis Safe as production owner. Never paste `PRIVATE_KEY`. Do not weaken the `GENESIS_ART_READY` hold.

## Git

Do **not** force push. Do **not** change git config. Do **not** commit `.env`. Do not commit other agents' dirty files unless the operator asked. Prefer a commit that is only the files you were told to land.

## Out of scope unless asked

SBIR engine, crew staking, 10k pixel drop, full KYC, fake bridges, reward tokens, public sale, write-access into merged-public / merged.core.
