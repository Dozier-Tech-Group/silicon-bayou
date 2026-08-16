# Silicon Bayou — full plan for the next implementing agent

Copy this file as your system prompt. Execute. Do not reinvent the project.

**Also read first:** [CONTINUE.md](CONTINUE.md) — clone-and-go-live playbook for another computer.

**Repo:** https://github.com/Dozier-Tech-Group/silicon-bayou  
**Local (this machine):** `C:\Users\gdozi\Projects\silicon-bayou`  
**Org / branch:** Dozier-Tech-Group / `master`  
**Also read:** `AGENTS.md`, `LAUNCH.md`, `PLAN.md`, `SECURITY.md`, `TESTERS.md`

---

## Mission (do this first)

Get **four genesis BAYOU NFTs live on Robinhood Chain mainnet (chain ID 4663)** and listed on OpenSea. Production-grade. Do not get picked off by a stolen owner key, metadata swap, or unbounded mint.

The operator has a **funded EOA** on Robinhood Chain 4663:

`0x97471f8Aa113aF7043B599Ccfb1702F2F78CF8a5`

Use it as `MINT_TO` (genesis tokens 1–4). Confirmed on RPC with a non-zero ETH balance. The **private key is not in this repo**. Ask for a **file path only**, copy into local `.env` as `PRIVATE_KEY`, never print it. If this address is also the deployer, the key that controls it must match.

`npm run wallet` must print that address + a non-zero ETH balance before `deploy:mainnet`.

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
| #1 | Engineering | `art/gators/engineering-gator.png` (+ `-still.png`) | `metadata/images/1.html` |
| #2 | Testing | same pattern | same pattern |
| #3 | Construction | same pattern | same pattern |
| #4 | Capital | same pattern | same pattern |

Copies: `metadata/images/1.png`–`4.png`. OpenSea JSON: `metadata/1.json`–`4.json`. `image` is GitHub raw PNG; `animation_url` is GitHub Pages HTML (calm Ken-Burns; honor `prefers-reduced-motion`). Gallery uses iframe loops in `gallery/tokens/`.

`generator/` is a paused experiment. Do not run `--count 10000`. Do not ship it.

### Contracts (compiled, **not deployed** until `PRIVATE_KEY` is in local `.env`)

`contracts/SiliconBayou.sol` — ERC-721 `BAYOU`, Solidity **0.8.24**, immutable (no proxy):

- **`MAX_SUPPLY = 4`** (mint 5 reverts — tested)
- **`MAX_BATCH = 4`**
- Ownable2Step, Pausable (mint + transfer), ReentrancyGuard
- ERC-2981 royalty cap 10% (default 5%)
- `freezeURI()` irreversible — `deploy.js` calls it after mint
- Owner mint / mintBatch only

Also (alpha, not required for genesis mint): `MergedCredit.sol`, `BountyBoard.sol` (first-settle-wins, pull withdraw).

### Tooling

- `npm test` and `npm run security` **must pass** before `deploy:mainnet`
- `npm run pin` (needs `GENESIS_ART_READY=1` + Pinata/nft.storage key) — optional; GitHub HTTPS is the launch host
- `npm run wallet` (balance check, never prints the key)
- `npm run deploy:mainnet` deploys, mints 1–4, **freezes URI**
- Chain: **4663** mainnet, **46630** testnet, gas ETH  
  RPC `https://rpc.mainnet.chain.robinhood.com`  
  Explorer https://robinhoodchain.blockscout.com  
  OpenSea https://opensea.io/collections/chain/robinhood

`deployments/robinhood.json` has `"address": null` until a real deploy. **Do not invent an address.**

### Sites

- Gallery (GitHub Pages): https://dozier-tech-group.github.io/silicon-bayou/gallery/
- Local gallery: `npm run gallery` → http://localhost:4173/gallery/
- **mergedpublic.com route (sibling, not this repo):** `C:\Users\gdozi\OneDrive\Desktop\CLIENTS\MERGED\Merged-Inc\merged-website` — `/bayou` (nav BAYOU). Only edit that repo for site work.

### Alpha testers

https://github.com/Dozier-Tech-Group/silicon-bayou/issues/1 and `TESTERS.md`. Invite-only. **No real money.** Do not mint extras (`MAX_SUPPLY` is 4). Transfer from the owner if needed.

---

## What is NOT done (your job, in order)

1. **Local `.env`** (never commit). `PRIVATE_KEY` is the blocker — every other field can already be copied from `.env.example`:

   ```
   PRIVATE_KEY=          # from operator file path, not chat
   RPC_URL=https://rpc.mainnet.chain.robinhood.com
   RH_RPC_URL=https://rpc.mainnet.chain.robinhood.com
   GENESIS_ART_READY=1
   BASE_URI=https://raw.githubusercontent.com/Dozier-Tech-Group/silicon-bayou/master/metadata/
   MINT_TO=0x97471f8Aa113aF7043B599Ccfb1702F2F78CF8a5
   ```

2. `npm run wallet` — confirm ETH on **4663**, print **address + balance only**. Address must be `0x9747…F8a5` if that key is the deployer.
3. `npm test` / `npm run security` (re-run on the new machine).
4. **Mainnet:** `npm run deploy:mainnet` → write real address/tx to `deployments/robinhood.json` and README.
5. Verify on Blockscout. OpenSea Robinhood collection URL. Push `deployments/` (no `.env`) to GitHub.
6. Tell operator: 2-step `transferOwnership` to a **Gnosis Safe** as soon as possible. EOA owner is the remaining nuclear risk.

Do **not** call `setBaseURI` after a successful `deploy:mainnet` — URI is already frozen. Pinata later cannot retarget this collection.

---

## Security bar (non-negotiable)

See `SECURITY.md`. Short version:

- Never paste `PRIVATE_KEY` into chat, tickets, or git
- No upgradeable proxy
- No `tx.origin`
- Freeze URI at deploy (already in `scripts/deploy.js`)
- Cap supply at 4 (already in the contract)
- Pause is break-glass only
- Do not add public sale, bridges, or yield
- GitHub Pages / gallery: no secrets in `VITE_*`

Residual risks after a correct deploy: EOA owner until Safe; ERC-2981 not enforced by marketplaces; GitHub availability of metadata; no third-party audit.

---

## Out of scope unless the operator asks again

SBIR/STTR engine, crew staking, 10k pixel drop, full KYC, fake “live” bridges, public sale, write-access into merged.core, changing git config, force push.

---

## Git

Do not force push. Do not change git config. Do not commit `.env` or `generator/out`. Push `master` to `origin` after each real milestone (deploy record). OAuth may lack `workflow` scope — do not add `.github/workflows` unless the token can push them.

---

## Paste this to start

Open the clone. Read `CONTINUE.md` then this file. Load the funded wallet from a **file path** the operator gives (never from chat). `npm test` + `npm run security` + `npm run wallet`. `npm run deploy:mainnet`. Write the address. Push. OpenSea. Tell them to rotate owner to a Safe.
