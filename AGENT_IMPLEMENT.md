# Silicon Bayou — full plan for the next implementing agent

Copy this file as your system prompt. Execute. Do not reinvent the project.

**Repo:** https://github.com/Dozier-Tech-Group/silicon-bayou  
**Local:** `C:\Users\gdozi\Projects\silicon-bayou`  
**Org / branch:** Dozier-Tech-Group / `master`  
**Also read:** `AGENTS.md`, `LAUNCH.md`, `PLAN.md`, `SECURITY.md`, `TESTERS.md`

---

## Mission (do this first)

Get **four genesis BAYOU NFTs live on Robinhood Chain mainnet (chain ID 4663)** and listed on OpenSea. Production-grade. Do not get picked off by a stolen owner key, metadata swap, or unbounded mint.

The operator has a **funded wallet**. It is **not** in this repo. There is no `.env` committed (and must never be). Ask for a **file path only**, never a pasted key. Put `PRIVATE_KEY` in local `.env` (gitignored). Never print it. Never commit it.

---

## North star (do not water down)

**Merged, Inc.** / [mergedpublic.com](https://www.mergedpublic.com) — the open source institutional network (`merged.edu` / `.sport` / `.map` / `.core`).

Hope: **one day all of Louisiana uses Merged technology for education and other industries**, and Louisiana becomes a **leading technical developer in the nation**.

Silicon Bayou gators are the holdable capability layer (Engineering, Testing, Construction, Capital). Gator Parish is the in-universe region.

Hard rules:

- NFTs are **not** legal contracts, diplomas, SAM.gov records, or grant awards.
- **No** passive yield, staking APY, or guaranteed return.
- Rewards, if any, are **payment for verified work** (Merged Credits / bounties).

---

## What is already built

### Art (frozen hybrid stills + living portraits)

Rejected: funky 16-bit `generator/out` **and** photoreal cinematic 3D. Never mint or pin those.

Shipped look: **hybrid painted PFP**.

| Token | Class | Still | Loop |
|---|---|---|---|
| #1 | Engineering | `art/gators/engineering-gator.png` (+ `-still.png`) | `metadata/images/1.html` and `metadata/animations/1.mp4` |
| #2 | Testing | `art/gators/testing-gator.png` | same pattern |
| #3 | Construction | `art/gators/construction-gator.png` | same pattern |
| #4 | Capital | `art/gators/capital-gator.png` | same pattern |

Copies: `metadata/images/1.png`–`4.png`. OpenSea JSON: `metadata/1.json`–`4.json` (`image` / `animation_url` still `ipfs://REPLACE_ME/` until pin). Calm Ken-Burns; honor `prefers-reduced-motion`. Gallery uses iframe loops in `gallery/tokens/`.

`generator/` is a paused experiment. Do not run `--count 10000`. Do not ship it.

### Contracts (compiled, **not deployed**)

`contracts/SiliconBayou.sol` — ERC-721 `BAYOU`, Solidity **0.8.24**, immutable (no proxy):

- Ownable2Step, Pausable (mint + transfer), ReentrancyGuard
- ERC-2981 royalty cap 10% (default 5%)
- `freezeURI()` irreversible
- Owner mint / mintBatch

Also (alpha, not required for genesis mint): `MergedCredit.sol`, `BountyBoard.sol` (first-settle-wins, pull withdraw).

**Known production gap to fix before mainnet:** supply is **unbounded**. Stolen owner key can mint forever. Add `MAX_SUPPLY = 4` (or mint-then-renounce after freeze) before deploy. Tests must cover “mint 5 reverts”.

### Tooling

- `npm test` and `npm run security` **must pass** before `deploy:mainnet`
- `npm run pin` (needs `GENESIS_ART_READY=1` + Pinata/nft.storage key)
- `npm run wallet` (balance check, never prints the key)
- `npm run deploy:mainnet` deploys **and** mints 1–4 (`scripts/deploy.js`)
- `npm run set-base-uri`, `npm run freeze-uri`
- Chain: **4663** mainnet, **46630** testnet, gas ETH  
  RPC `https://rpc.mainnet.chain.robinhood.com`  
  Explorer https://robinhoodchain.blockscout.com  
  OpenSea https://opensea.io/collections/chain/robinhood

`deployments/robinhood.json` has `"address": null`. **Do not invent an address.**

### Sites

- Gallery (GitHub Pages): https://dozier-tech-group.github.io/silicon-bayou/gallery/
- Local gallery: `npm run gallery` → http://localhost:4173/gallery/
- **mergedpublic.com route (sibling, not this repo):** `C:\Users\gdozi\OneDrive\Desktop\CLIENTS\MERGED\Merged-Inc\merged-website` — `/bayou` (nav BAYOU). Wallet + SIWE + GitHub gist proof + bounty board + Get USD. Local often http://127.0.0.1:5188/bayou. Only edit that repo for site work. Do not use pixel PFPs there; `public/bayou/1.png`–`4.png` should be the hybrid stills.

### Alpha testers

https://github.com/Dozier-Tech-Group/silicon-bayou/issues/1 and `TESTERS.md`. Invite-only. **No real money.**

---

## What is NOT done (your job, in order)

1. **Production mint cap** — `MAX_SUPPLY = 4` on `SiliconBayou` so a hacked owner key cannot print tokens. Tests. `npm test` / `npm run security`.
2. **Local `.env`** (never commit):
   ```
   PRIVATE_KEY=          # from operator file path, not chat
   RPC_URL=https://rpc.mainnet.chain.robinhood.com
   GENESIS_ART_READY=1
   BASE_URI=https://raw.githubusercontent.com/Dozier-Tech-Group/silicon-bayou/master/metadata/
   ```
   Optional: `PINATA_JWT` then `npm run pin` and switch `BASE_URI` to `ipfs://<JSON_CID>/`.
3. `npm run wallet` — confirm ETH on **4663**, print **address + balance only**.
4. Rehearse: `npm run deploy:testnet` (46630) if testnet ETH exists.
5. **Mainnet:** `npm run deploy:mainnet` → write real address/tx to `deployments/robinhood.json` and README.
6. If you pinned IPFS: `npm run set-base-uri`. Then **`npm run freeze-uri` immediately** so metadata cannot be swapped.
7. Verify on Blockscout. OpenSea Robinhood collection URL. Push `deployments/` (no `.env`) to GitHub.
8. Tell operator: 2-step `transferOwnership` to a **Gnosis Safe** as soon as possible. EOA owner is the remaining nuclear risk.

Interim metadata (no Pinata): GitHub raw `…/master/metadata/` already works for `tokenURI` if JSON + images are on `master`.

---

## Security bar (non-negotiable)

See `SECURITY.md`. Short version:

- Never paste `PRIVATE_KEY` into chat, tickets, or git
- No upgradeable proxy
- No `tx.origin`
- Freeze URI after pin / GitHub URI is final
- Cap supply before mainnet
- Pause is break-glass only
- Do not add public sale, bridges, or yield
- GitHub Pages / gallery: no secrets in `VITE_*`; never put a GitHub token in frontend env

Residual risks after a correct deploy: EOA owner until Safe; ERC-2981 not enforced by marketplaces; IPFS/GitHub availability; no third-party audit.

---

## Out of scope unless the operator asks again

SBIR/STTR engine, crew staking, 10k pixel drop, full KYC, fake “live” bridges, public sale, write-access into merged.core, changing git config, force push.

---

## Git

Do not force push. Do not change git config. Do not commit `.env` or `generator/out`. Push `master` to `origin` after each real milestone (contract cap, deploy record). OAuth may lack `workflow` scope — do not add `.github/workflows` unless the token can push them.

---

## Paste this to start

Open `C:\Users\gdozi\Projects\silicon-bayou`. Read `AGENT_IMPLEMENT.md`. Cap supply at 4, load the funded wallet from a **file path** the operator gives (never from chat), `npm test` + `npm run security`, deploy BAYOU to Robinhood **4663**, mint 1–4, freeze URI, write the address, push, OpenSea.
