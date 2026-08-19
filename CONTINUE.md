# Continue Silicon Bayou

**Status: LIVE.** Do not deploy again.

Repo: https://github.com/Dozier-Tech-Group/silicon-bayou · branch `master`

Collection: [`0xA81aEd6f3a5Faea95197786ba162e706Fd938d20`](https://robinhoodchain.blockscout.com/address/0xA81aEd6f3a5Faea95197786ba162e706Fd938d20) on Robinhood Chain **4663**. `MAX_SUPPLY = 198`, URI frozen. Tokens 1–198 exist. Record: [DEPLOYMENT.md](DEPLOYMENT.md).

This file is the short playbook for a clone. Full standing orders: [AGENTS.md](AGENTS.md). Public front door: [README.md](README.md). Holders first: [HOLDERS.md](HOLDERS.md).

## Paste this into a new agent session

```
You are continuing Silicon Bayou. Repo: https://github.com/Dozier-Tech-Group/silicon-bayou
Read CONTINUE.md, then AGENTS.md, SECURITY.md, VALUE.md, HOLDERS.md.

The collection is LIVE at 0xA81aEd6f3a5Faea95197786ba162e706Fd938d20 on Robinhood 4663.
Do not run deploy:mainnet. Do not invent a second contract. Do not rewrite metadata/swamp
or art/swamp-222/1.png–198.png on master. Do not mint generator/out or photoreal gators.
Do not commit .env. Do not force push.

The gallery now grids the live 198 swamp tokens from art/swamp-222. The next session
is a full NFT redesign — wait for the operator to start that; do not mint, redeploy,
or rewrite frozen files until they explicitly say so.

North star: Merged, Inc. / mergedpublic.com — one day all of Louisiana uses Merged
technology for education and other industries. NFTs are not legal contracts. No APY.
```

## North star

**Merged, Inc.** / [mergedpublic.com](https://www.mergedpublic.com) — one day **all of Louisiana uses Merged technology** for education and other industries, and Louisiana becomes a **leading technical developer in the nation**.

Silicon Bayou (`BAYOU`) is the holdable swamp-gator layer. **Not** legal contracts. **No** passive APY.

## What is live

| Piece | Status |
|---|---|
| Contract | `0xA81a…8d20`, 198/198, `uriFrozen() = true` |
| Art | `art/swamp-222/1.png`–`198.png` + `metadata/swamp/{id}.json` |
| Gallery | `gallery/index.html` grids tokens **1–198** from `art/swamp-222/{id}.png`. Inspect dialog links OpenSea + Blockscout. GitHub Pages serves this from `master`. |
| OpenSea | [opensea.io/collection/silicon-bayou](https://opensea.io/collection/silicon-bayou) |
| Credits rail | [deployments/credits.json](deployments/credits.json) — MC, BountyBoard, AccessDesk on 4663 |
| Tests | `npm test` and `npm run security` |
| Paused generator | `generator/` — **do not run it** |

## Next session (do not start until asked)

**Full NFT redesign.** Operator will start a new session for a new set. Until they explicitly begin that work:

- Do **not** mint, pin, or rewrite frozen `metadata/swamp/` or live `art/swamp-222/1.png`–`198.png` on `master`
- Do **not** run `deploy:mainnet` or change `MAX_SUPPLY` / URI freeze
- Do **not** ship `generator/out` or photoreal cinematic 3D

## Remaining work (do not redeploy BAYOU)

1. **mergedpublic.com site deploy is still not published.** Sibling repo only; do not start a new site deploy unless a green PR is already waiting. Cutover PRs stay skipped until the operator removes skip strings: merged-website #24, dtg-platform #148, DTG-Infra #1.
2. ~~2-step ownership off the deploy EOA~~ **DONE 2026-08-19.** The operator `0x2948…D11d` owns all five contracts (BAYOU, MergedCredit, BountyBoard, AccessDesk, MergedPublic) — accepts verified on-chain, pendings clear. The deployer key `0xBA98…aa71` is **lost**, so `sweep-deployer.mjs` is permanently retired and its ~0.0023 ETH written off (the script refuses any other signer by design). Optional future hop: re-rotate to a Safe when 4663 tooling exists. Never fund the legacy `0x9747…` wallet.
3. **Gator Works** needs the repo secret `ANTHROPIC_API_KEY` before `.github/workflows/gator-agents.yml` will run real agent tasks. Workflow exists; it is a clean no-op without the key.
4. **Gator lander** (`.github/workflows/land-prs.yml`) squash-merges green org PRs onto `main`/`master` every 30 minutes (`cron: 13,43 * * * *`) plus `workflow_dispatch`. Dormant until silicon-bayou repo secret **`DTG_MERGE_PAT`** (preferred) or **`DTG_CI_PAT`** is set — a PAT with `repo` + pull-request write across Dozier-Tech-Group. Skip rules: drafts; `DO NOT MERGE` / `do not merge yet` / `WIP` / `counsel` / `cutover` / `needs operator`; red or pending CI (comments once, never `gh run rerun`); deny-list files (`.env`, `metadata/swamp/`, `art/swamp-222/`, BAYOU supply/URI, `deploy:mainnet`). Check it with `gh run list --repo Dozier-Tech-Group/silicon-bayou --workflow "Gator lander"`. Human still required: counsel merged-public #63, website cutover, missing `DTG_CI_PAT` on sibling CI (dtg-platform #148, harness-conformance #2).
5. **Holder-first open source** — [HOLDERS.md](HOLDERS.md). Brief owners before the public X thread.

## Clone setup

```powershell
git clone https://github.com/Dozier-Tech-Group/silicon-bayou.git
cd silicon-bayou
copy .env.example .env
npm install
npm test
npm run security
```

`.env` is gitignored. `PRIVATE_KEY` is only for owner scripts. Never print it. Never commit it.

Local gallery: `npm run gallery` (port may not be 4173 if that one is taken).

## What not to do

- Do not force push, change git config, or commit `.env`
- Do not mint `generator/out` or photoreal gators
- Do not add a public sale, yield, staking, or a proxy
- Do not run `deploy:mainnet` / `REDEPLOY=1`
- Do not rewrite frozen swamp metadata or live art `1.png`–`198.png` on `master`

## Intentionally not in git

| Item | Why |
|---|---|
| `.env` | Contains `PRIVATE_KEY`. Recreate from `.env.example`. |
| `generator/out/` | Rejected pixel batch. Never mint or pin. |
| `node_modules/`, `artifacts/`, `cache/` | Rebuild with `npm install` / `npm run compile`. |
| `art/swamp-222/preview.html`, `marketing/merged-public-poster.html` | Other-session scratch. Do not land unless asked. |
