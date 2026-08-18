# Silicon Bayou — implementing-agent plan

Copy this file as a system prompt only **after** [CONTINUE.md](CONTINUE.md) and [AGENTS.md](AGENTS.md). Do not reinvent the project.

**The genesis deploy is done.** Collection [`0xA81aEd6f3a5Faea95197786ba162e706Fd938d20`](https://robinhoodchain.blockscout.com/address/0xA81aEd6f3a5Faea95197786ba162e706Fd938d20) on Robinhood Chain **4663**. 198/198 minted. URI frozen. **Do not run `deploy:mainnet`.**

Repo: https://github.com/Dozier-Tech-Group/silicon-bayou · branch `master`

Also read: `HOLDERS.md`, `LAUNCH.md`, `PLAN.md`, `SECURITY.md`, `VALUE.md`, `README.md`.

---

## Mission now

Keep the live collection honest and the repo fit for public clone:

1. Do not deploy a second BAYOU contract.
2. Do not rewrite `metadata/swamp/` or the 198 PNGs on `master`.
3. Holders are briefed before public social posts ([HOLDERS.md](HOLDERS.md)).
4. Rotate contract ownership off the deploy EOA (Ownable2Step → Safe or operator). See [SECURITY.md](SECURITY.md) and [DEPLOYMENT.md](DEPLOYMENT.md).
5. `npm test` and `npm run security` stay green.
6. AccessDesk (USDG commercial access) is a **separate** deploy from BAYOU. 20–40% community pool, rest to treasury. No holder dividend. See [ACCESS.md](ACCESS.md).

The mergedpublic.com `/bayou` page lives in a **sibling website repo**. Only open it when the operator asks to put a page on that site.

---

## North star (do not water down)

**Merged, Inc.** / [mergedpublic.com](https://www.mergedpublic.com) — the open source institutional network (`merged.edu` / `.sport` / `.map` / `.core`).

Hope: **one day all of Louisiana uses Merged technology for education and other industries**, and Louisiana becomes a **leading technical developer in the nation**.

Hard rules:

- NFTs are **not** legal contracts, diplomas, SAM.gov records, or grant awards.
- **No** passive yield, staking APY, or guaranteed return.
- Rewards, if any, are **payment for verified work** (Merged Credits / bounties) — not built on the live ERC-721.

---

## What is already built

### Art

Rejected: funky 16-bit `generator/out` **and** photoreal cinematic 3D. Never mint or pin those.

Live look: swamp gators `art/swamp-222/1.png`–`198.png`. OpenSea JSON: `metadata/swamp/{id}.json`. `generator/` is paused. Do not run `--count 10000`.

### Contract (immutable, already deployed)

`contracts/SiliconBayou.sol` — ERC-721 `BAYOU`, Solidity **0.8.24**, no proxy:

- **`MAX_SUPPLY = 198`**, **`MAX_BATCH = 33`**
- Ownable2Step, Pausable (mint + transfer), ReentrancyGuard
- ERC-2981 royalty cap 10% (default 5%)
- `freezeURI()` already executed

Behind the gators: `MergedCredit.sol` (MC) + `BountyBoard.sol` + `AccessDesk.sol`. Separate deploy (`npm run deploy:bounty:mainnet`). Only BAYOU holders can withdraw MC. AccessDesk takes USDG (20–40% community pool, rest treasury). Grants from the pool are discretionary — not yield. Do not mix this with `deploy:mainnet`.

### Tooling

- `npm test` and `npm run security`
- `npm run wallet` (balance check, never prints the key)
- Chain **4663** mainnet, **46630** testnet, gas ETH
- Explorer https://robinhoodchain.blockscout.com
- OpenSea https://opensea.io/collection/silicon-bayou

### Sites

- Gallery: https://dozier-tech-group.github.io/silicon-bayou/gallery/
- Local: `npm run gallery` → http://localhost:4173/gallery/
- Public thesis page: [mergedpublic.com](https://www.mergedpublic.com) `/bayou` or `/silicon-bayou` when that site deploy is current

---

## Security bar

See `SECURITY.md`. Short version:

- Never paste `PRIVATE_KEY` into chat, tickets, or git
- No upgradeable proxy
- No `tx.origin`
- Do not add public sale, bridges, or yield
- GitHub Pages / gallery: no secrets in `VITE_*`

Residual risks: EOA owner until Safe; ERC-2981 not enforced by marketplaces; GitHub availability of metadata; no third-party audit.

---

## Out of scope unless the operator asks again

SBIR/STTR engine, crew staking, 10k pixel drop, full KYC, fake “live” bridges, public sale, write-access into merged.core, changing git config, force push.

---

## Git

Do not force push. Do not change git config. Do not commit `.env` or `generator/out`.
