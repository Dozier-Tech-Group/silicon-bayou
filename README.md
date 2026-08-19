# Silicon Bayou

Original Louisiana alligator PFPs (**BAYOU**) on Robinhood Chain — the holdable face of **merged**, the open source institutional network.

**BAYOU holders see this repo first.** If you own a token, start at [HOLDERS.md](HOLDERS.md). Everyone else: clone is public; please don’t jump the holder announcement.

## Live collection

| | |
|---|---|
| Collection | Silicon Bayou |
| Symbol | `BAYOU` |
| Chain | Robinhood Chain (EVM L2, gas in ETH), chain ID **4663** |
| Contract | [`0xA81aEd6f3a5Faea95197786ba162e706Fd938d20`](https://robinhoodchain.blockscout.com/address/0xA81aEd6f3a5Faea95197786ba162e706Fd938d20) |
| Supply | **198 / 198** minted. `MAX_SUPPLY` is a compiled constant. There is no token 199. |
| Metadata | Frozen. `tokenURI` → GitHub raw `metadata/swamp/{id}.json` |
| Marketplace | [opensea.io/collection/silicon-bayou](https://opensea.io/collection/silicon-bayou) |
| Record | [DEPLOYMENT.md](DEPLOYMENT.md) |
| Thesis | [VALUE.md](VALUE.md) |
| License | [LICENSE](LICENSE) — MIT on code; artwork stays copyright Merged, Inc. |

**Do not run `deploy:mainnet` again.** A second deploy is a different contract. Trust no address except the one above.

RPC: `https://rpc.mainnet.chain.robinhood.com` · Explorer: [robinhoodchain.blockscout.com](https://robinhoodchain.blockscout.com)

Robinhood has **not** endorsed this project. We pay gas on a public chain.

## Vision

**merged** ([mergedpublic.com](https://www.mergedpublic.com)) is the open source institutional network — one open network for every institution. The hope is that **one day all of Louisiana uses this stack for education and other industries**, and that Louisiana becomes a **leading technical developer in the nation**.

Silicon Bayou is how that bet becomes something you can hold. The tokens are **not** legal contracts, diplomas, SAM.gov records, grant awards, or LLC equity. **No** passive yield, staking APY, or guaranteed returns.

Live site route: [mergedpublic.com/bayou](https://www.mergedpublic.com/bayou) (when that deploy is current). Local gallery: `npm run gallery` → http://localhost:4173/gallery/

The four capability classes — Engineering, Testing, Construction, Capital — are the framework. The live drop is **198 swamp gators** from Gator Parish (`art/swamp-222/1.png`–`198.png`). Tokens 199–222 in that folder are unmintable on this contract.

Roadmap that is **not built**: [PLAN.md](PLAN.md). Do not implement it unless asked.

## Install

Node.js 20+. Hardhat is the compile/test path.

```powershell
git clone https://github.com/Dozier-Tech-Group/silicon-bayou.git
cd silicon-bayou
copy .env.example .env
npm install
npm run compile
npm test
npm run security
```

Contributors can leave `PRIVATE_KEY` blank. Never commit `.env`. Never paste a key into chat.

Optional Foundry: `forge build --skip test --skip script` if `forge` is on PATH. Solidity **0.8.24** / Shanghai. OpenZeppelin **5.2.0**.

## Contract

`contracts/SiliconBayou.sol` — OpenZeppelin ERC-721 + ERC-2981, **not upgradeable**:

- Name `Silicon Bayou`, symbol `BAYOU`
- **`MAX_SUPPLY = 198`**, `MAX_BATCH = 33` — owner mint only; sold out
- **`freezeURI`** — already called; metadata cannot be retargeted on-chain
- `pause` / `unpause` — emergency stop on mint and transfer
- Ownable2Step — pending owner must accept; recommend a Safe as production owner
- ERC-2981 royalties capped at 10% (`MAX_ROYALTY_BPS = 1000`); default 5%
- `tokenURI(id)` → `{baseURI}{id}.json`

No staking, no public sale, no proxy. Threat model: [SECURITY.md](SECURITY.md).

## Merged Public (MP)

The second collection: **Merged Public**, 10,000 entities, live at
[`0x5D000b230653E416FF41451525b144a6C2Ad7178`](https://robinhoodchain.blockscout.com/address/0x5D000b230653E416FF41451525b144a6C2Ad7178#code)
on Robinhood Chain — launched pre-reveal 2026-08-19 with the generative provenance
(seed + 110 trait weights + 6 rules) committed as an immutable onchain hash before any
art existed. All 10,000 owner-minted to the treasury; every token serves the sealed
metadata until `reveal()`. Record: `deployments/merged-public.robinhood.json`. Docs:
[MP-VALUE.md](MP-VALUE.md) · [MP-GAME.md](MP-GAME.md) · [MP-LAUNCH.md](MP-LAUNCH.md).
Same discipline as BAYOU: no yield, no APY, not legal instruments.

## Behind the scenes: Merged Credits (MC)

The gators are the public face. **Gator Works** ([agents/README.md](agents/README.md)) is the technology behind them: holders register a signed wallet-to-GitHub link, each registered gator gets an AI agent that works funded bounty tasks in the CI pipeline, and PRs that merge settle on the BountyBoard to the holder's wallet. Humans review every PR; credits move only when work merges.

They need **Merged Credits** to get paid for verified work.

- `contracts/MergedCredit.sol` — ERC-20 `MC`, 0 decimals (1 token = 1 credit). Owner mint, pause, Ownable2Step. **Not** yield, **not** a public sale, **not** ETH.
- `contracts/BountyBoard.sol` — first-settle-wins bounties paid in MC. Only a wallet that holds a BAYOU gator can be settled or `withdraw`.

This is a separate deploy from the NFT, and it is **done** — live on chain 4663 since 2026-08-18:

| Contract | Address |
|---|---|
| MergedCredit (MC) | [`0x040f12C71ddA0bA9D91E94016ea5C348106ab429`](https://robinhoodchain.blockscout.com/address/0x040f12C71ddA0bA9D91E94016ea5C348106ab429) |
| BountyBoard | [`0xd7899073819206828b7f4c7bB8aE4C530E93C0A2`](https://robinhoodchain.blockscout.com/address/0xd7899073819206828b7f4c7bB8aE4C530E93C0A2) |
| AccessDesk | [`0x7EEc6e95179B8ae86CEbA24025ae35BaDbf0d4e9`](https://robinhoodchain.blockscout.com/address/0x7EEc6e95179B8ae86CEbA24025ae35BaDbf0d4e9) |

Record of truth: `deployments/credits.json` — trust no address that is not in that file. All three launch bounties in `agents/tasks.json` are funded on-chain (1001 = 25 MC, 1002 = 15 MC, 1003 = 10 MC; 50 MC escrowed, 0 settled). **Do not** run `deploy:mainnet` (that is BAYOU, already live) and **do not** rerun `deploy:bounty:mainnet` — the rail is up. Real-money cash-out of MC waits on legal/tax review — same rule as merged.

## Commercial access (USDG)

Compiled data on mergedpublic.com (the Louisiana spend census and similar) is licensed for commercial AI/crawl use through `AccessDesk.sol`:

- Payer sends **USDG** on Robinhood 4663 (canonical `0x5fc5360D0400a0Fd4f2af552ADD042D716F1d168` — not a lookalike USDC)
- **20–40%** stays in a community pool on the desk; the rest goes to the operating treasury
- Owner may later **grant** USDG from that pool (discretionary). Holding a gator does **not** entitle anyone to a cut
- **MC** is the meter the gators use; `payCredit` sends credits to treasury in full

Site terms: [mergedpublic.com/access](https://www.mergedpublic.com/access) (after that site deploy). Do not encode holder dividends.

Owner-only scripts (`set-royalty`, `transfer-ownership`, `pause`) need a funded key in local `.env`. They do not mint more than 198.

## Art

Two looks are rejected and must not be minted or shipped:

- Funky **16-bit pixel** PFPs (`generator/out`). Never ship `generator/out`.
- Too-**photoreal cinematic 3D**.

Live tokens use the swamp set. `generator/` is a **paused experiment** — do not run `generate.py`.

Because metadata is GitHub-hosted on `master`, **do not rewrite** `metadata/swamp/` or the 198 PNGs. That would look like a metadata swap even though `uriFrozen()` is true.

## Repo layout

```text
art/swamp-222/        Live token stills 1–198 (199–222 unmintable here)
metadata/swamp/       Frozen OpenSea JSON
contracts/            SiliconBayou.sol, BountyBoard.sol, MergedCredit.sol, AccessDesk.sol
deployments/          Live address and tx hashes
ACCESS.md             Commercial USDG desk (not yield)
gallery/              Local / GitHub Pages preview
HOLDERS.md            Holder-first access
CONTRIBUTING.md       How to clone, test, and PR
SECURITY.md           Threat model, freeze URI, 2-step owner
VALUE.md              Public thesis (sourced claims)
PLAN.md               Future protocol (not built)
```

## Explicitly not in this collection

Crew staking, yield, reward tokens, capability recipes, project contracts, SBIR/STTR workflows, SAM.gov/UEI checks, and any guaranteed-return tokenomics. Those belong in [PLAN.md](PLAN.md) only.

## License

[MIT](LICENSE) for source. Artwork and metadata remain copyright Merged, Inc.
