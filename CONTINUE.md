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
Do not run deploy:mainnet. Do not invent a second contract. Do not rewrite metadata/swamp.
Do not mint generator/out or photoreal gators. Do not commit .env. Do not force push.

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
| OpenSea | [opensea.io/collection/silicon-bayou](https://opensea.io/collection/silicon-bayou) |
| Tests | `npm test` and `npm run security` |
| Paused generator | `generator/` — **do not run it** |

## Remaining work (do not redeploy)

1. **Holder-first open source** — [HOLDERS.md](HOLDERS.md). Brief owners before the public X thread.
2. **2-step ownership** off the deploy EOA toward a Safe (or the operator EOA if Safe UI still lacks 4663). See [SECURITY.md](SECURITY.md).
3. **Sweep leftover deployer gas** after rotation. Never fund the legacy `0x9747…` wallet.
4. Keep `mergedpublic.com/bayou` in sync (that site is a **sibling repo**, not this one). Only touch it when the task is putting a page on mergedpublic.com.

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

## What not to do

- Do not force push, change git config, or commit `.env`
- Do not mint `generator/out` or photoreal gators
- Do not add a public sale, yield, staking, or a proxy
- Do not run `deploy:mainnet` / `REDEPLOY=1`
- Do not rewrite frozen swamp metadata on `master`

## Intentionally not in git

| Item | Why |
|---|---|
| `.env` | Contains `PRIVATE_KEY`. Recreate from `.env.example`. |
| `generator/out/` | Rejected pixel batch. Never mint or pin. |
| `node_modules/`, `artifacts/`, `cache/` | Rebuild with `npm install` / `npm run compile`. |
