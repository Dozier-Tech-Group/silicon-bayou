# Silicon Bayou — agent standing orders

Copy this file as the system prompt. On a new clone, start with **[CONTINUE.md](CONTINUE.md)**. Execute. Do not reinvent the project.

## Workspace

This repo is the **only** place for BAYOU NFT / chain / gallery / generator work.

- GitHub: https://github.com/Dozier-Tech-Group/silicon-bayou
- Org: **Dozier-Tech-Group**. Branch: `master`.
- Stay in this clone. The mergedpublic.com site is a **sibling repo** — open it only when the task is specifically to put a page on that site.

## North star (do not water down)

**Merged, Inc.** / [mergedpublic.com](https://www.mergedpublic.com) — the open source institutional network. One day **all of Louisiana uses Merged technology** for education and other industries and becomes a **leading technical developer in the nation**.

- NFTs are **not** legal contracts, diplomas, SAM.gov records, or grant awards.
- **No** passive yield, staking APY, or guaranteed returns.
- Full future thesis: `PLAN.md`. Do not implement PLAN.md unless asked.

## Live collection (do not redeploy)

**Live on Robinhood 4663:** `0xA81aEd6f3a5Faea95197786ba162e706Fd938d20`. URI frozen. Tokens 1–198 minted. **Do not run `deploy:mainnet` again.** Record: `deployments/robinhood.json`.

OpenSea: https://opensea.io/collection/silicon-bayou

BAYOU holders are briefed first: [HOLDERS.md](HOLDERS.md).

## Art (critical)

Two looks are **rejected**. Do not mint, pin, or ship either:

- Funky **16-bit pixel** PFPs (`generator/out` JPGs). Never ship `generator/out`.
- Too-**photoreal cinematic 3D**. Not a photo.

Live tokens are the swamp set (`art/swamp-222/1.png`–`198.png`, metadata `metadata/swamp/`). Do not rewrite those files on `master` — GitHub raw is the frozen host.

`generator/` is a **paused experiment** only. Do not run `generate.py`, do not `--count 10000`.

## Commands

```powershell
copy .env.example .env
npm install
npm run compile
npm test
npm run security
npm run gallery
```

Do **not** run `npm run deploy:mainnet` or `deploy:testnet` unless the operator explicitly asked for a **new** contract (they have not).

`.env`: `PRIVATE_KEY` (owner scripts only), `RPC_URL`, `BASE_URI` (trailing slash). Hardhat networks: `robinhood` (4663), `robinhoodTestnet` (46630). Contract: `contracts/SiliconBayou.sol` — name `Silicon Bayou`, symbol `BAYOU`, **`MAX_SUPPLY = 198`**. Ownable2Step, Pausable, ERC-2981 (max 10% royalty), URI freeze. Solidity **0.8.24** / Shanghai. Not upgradeable.

**Security gate:** `npm test` and `npm run security`. Never paste `PRIVATE_KEY`.

## Git

Do **not** force push. Do **not** change git config. Do **not** commit `.env`. Do not commit other agents' dirty files unless the operator asked. Prefer a commit that is only the files you were told to land.

## Out of scope unless asked

SBIR engine, crew staking, 10k pixel drop, full KYC, fake bridges, reward tokens, public sale, write-access into merged-public / merged.core.
