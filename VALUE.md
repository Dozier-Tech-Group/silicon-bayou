# Silicon Bayou — the value thesis

**Purpose, in one sentence:** open-source institutional technology for public institutions — starting with Louisiana — with Silicon Bayou as the first piece of that effort anyone can hold in a wallet.

> **Status: pre-deployment.** At the time of writing there is **no contract address**. `deployments/robinhood.json` records `address: null`. Everything below describes code, tests, and documents that are public in this repository and will become independently verifiable on-chain only after the deploy transaction lands. Do not trust any address that does not appear in this repo's `deployments/robinhood.json` and README.

**Who is behind this, stated up front:** Silicon Bayou and **merged** (mergedpublic.com, the open source institutional network) are projects of the same organization — the Dozier-Tech-Group GitHub org and Merged, Inc. share principals. Where this document cites Louisiana research, it is citing the builder's own compiled materials, not independent third-party validation. Every other claim is sourced to this repository or to official public documentation, so a skeptical reader can check us.

---

## 1. The purpose: open-sourcing institutional technology

The ambition is stated as a hope, because that is what it is — and it is a large one: **one day all of Louisiana uses this open-source stack for education and other industries, and Louisiana becomes a leading technical developer in the nation.**

The work behind that hope is concrete. merged builds overlay software for institutions — its site describes **merged.edu** as "the operating layer for higher education" (an overlay on Workday, Banner, and SIS, explicitly not a rip-and-replace) and **merged.sport** as "the operating system for collegiate athletics"; its site labels both industries Live, with government and defense listed as emerging. The open-core rails are public at [github.com/Dozier-Tech-Group/merged-public](https://github.com/Dozier-Tech-Group/merged-public). Higher education is the reference implementation, not the requirement: the same modules are written to serve a district, an agency, a hospital, or a municipality.

The Louisiana case is compiled in Merged's own census materials (again: our research, offered for checking, not third-party proof): **550 evidence-linked contract records across 45 Louisiana public higher-education institutions**, built under a "no quote, no number" rule, documenting a software stack rented largely from vendors headquartered outside the state — plus an index of **380 public high schools, 124 districts, and 246,582 students** with dual enrollment mapped as a college-credit signal. The thesis in one line: Louisiana currently pays out-of-state stacks for the entire K-12 → community college → university → athletics → career journey, and an open-source overlay built in-state is the counter-move.

Silicon Bayou is meant to become the way capability on that network is visibly held — four alligators for four capability classes: **Engineering, Testing, Construction, Capital**. Today there is no live integration between these tokens and the merged software; the roadmap for recipes, crews, and milestone-evidence contracting is written down in [PLAN.md](PLAN.md), which opens by declaring itself future work. We tell you the order of operations instead of pretending Phase 3 exists.

## 2. The settlement layer: Robinhood Chain

The collection targets **Robinhood Chain mainnet, chain ID 4663** — the public, permissionless, Ethereum-compatible Layer-2 that OpenSea's launch article describes as "built by Robinhood Crypto using Arbitrum technology, designed to bring real-world assets onchain," with public mainnet live since July 1, 2026 and native OpenSea support since July 11, 2026.

Say the important sentence plainly: **Robinhood has not endorsed, reviewed, or partnered with this project.** The chain is permissionless; we deploy on it the way anyone deploys on Ethereum, and our only relationship to Robinhood is paying gas on its network. Every claim in this document is written to survive that distinction, because our target audience — public institutions — runs diligence, and a document that overclaims once is a document that gets discarded whole.

What the chain actually buys us:

- **Unmodified EVM.** Official deployment docs state the chain is "fully EVM-compatible, so smart contracts written in Solidity or Vyper deploy without modification using standard Ethereum tooling." Our contract is Solidity 0.8.24 composed from stock, pinned OpenZeppelin 5.2.0 components — no chain-specific code anywhere.
- **ETH gas, low L2 fees.** No exotic gas token, no separate fee economy; costs stay legible to anyone who understands Ethereum.
- **Marketplace support that predates us.** OpenSea indexes Robinhood Chain collections once contracts are live; we expect the tokens to appear there with no integration work on our side — on OpenSea's indexing timeline, not ours.
- **Standard tooling end to end.** Stock Hardhat config, Blockscout explorer, a verification config already present (the verify plugin is installed before use, as the README documents).

What the chain does not fix, stated as risks: the public mainnet is weeks old with a short track record; sequencing is centralized with the chain operator, as is standard for new Arbitrum-family chains, and we have not verified the operational arrangement or any decentralization roadmap; "Ethereum's security" is the documentation's characterization, not our independent finding; official docs recommend Alchemy for production RPC while the repo's documented config defaults to the public rate-limited endpoint unless `RPC_URL` is overridden. And if Robinhood Chain were ever halted or wound down, these tokens' on-chain state would be affected like every other asset on it — we have not independently verified escape hatches for L2 state. Choosing a young chain is a real, undiversified bet, and we name it.

## 3. The contract: trust-minimization is the product

The honest way to value `SiliconBayou.sol` is by what it **cannot** do. Each guarantee below is a capability deliberately removed, stated as the threat it kills and where the code lives.

| The threat | What kills it |
|---|---|
| Admin "upgrades" the contract after mint and changes the rules | No proxy, no upgrade path — a plain immutable implementation (`contracts/SiliconBayou.sol:16`). SECURITY.md marks upgrade god-mode "Rejected." |
| A stolen owner key inflates supply forever | `MAX_SUPPLY = 198` is a compile-time constant; `mint` and `mintBatch` revert past it (`SiliconBayou.sol`), driven to the revert in tests. |
| Art or attributes silently swapped after sale | `freezeURI()` is a one-way flag with no unfreeze (`SiliconBayou.sol:90-94`); after it, `setBaseURI` reverts forever. The deploy script freezes in the same run that mints. |
| Ownership fat-fingered to a dead address | `Ownable2Step`: the new owner must call `acceptOwnership`; a bad transfer is cancelable. `renounceOwnership` is refused until the URI is frozen. |
| Royalty ratcheted on holders | Hard cap `MAX_ROYALTY_BPS = 1000` (10%); `setDefaultRoyalty` reverts above it. Default 5%. |
| Phishing-contract auth tricks | `msg.sender` only; `tx.origin` appears nowhere. |

The gate is mechanical: `npm test` and `npm run security` (solhint + the full Hardhat suite — 19 contract tests, 13 of them on SiliconBayou itself) must pass before any mainnet command, and SECURITY.md forbids deploying otherwise. The deploy script is hardened against operator error: it refuses to run without the art-ready flag, refuses to redeploy over a recorded address (a rerun would mint a duplicate collection), validates the base URI shape, and writes the contract address to disk the moment it exists so a mid-run failure never strands a live contract unrecorded. The pipeline has been rehearsed end-to-end on a local Hardhat network — deploy, mint 1–4, freeze, record, and rerun-refusal all exercised. No public-testnet deployment record exists; the first live-network execution will be the mainnet run, which is exactly why those guards were built and rehearsed first.

What we will not pretend: **there is no third-party audit.** For a four-token, owner-mint, no-sale, no-yield contract assembled from pinned OpenZeppelin components, we judge that a formal audit does not clear its cost — the compensating controls are the hard cap, immutability, the freeze, and public verifiability. If this ever grows into contracts holding user funds, that calculus flips and an audit comes first. Until ownership is rotated to a multisig Safe (the documented next step), the owner is a single key; a stolen owner key post-freeze could still pause transfers indefinitely, redirect the capped royalty, or transfer/renounce ownership itself. ERC-2981 royalties are advisory — marketplaces may ignore them. None of this is yet verifiable on-chain; after deploy and Blockscout verification, every claim above becomes independently checkable by anyone.

## 4. The asset layer: what "frozen" actually buys

The genesis is four tokens, not four thousand: individually made hybrid painted gator portraits — a curated edition, not trait-generator output. (A 16-bit pixel generator run and a photoreal 3D pass were both rejected; the deploy tooling actively refuses any base URI pointing at generator output.) Each token's OpenSea-standard JSON carries a structured capability profile — numeric Engineering / Testing / Construction / Capital scores with `max_value: 100` — machine-readable fields a downstream app can consume, not flavor text. Each also ships a living portrait: a small self-contained HTML loop honoring `prefers-reduced-motion`. Every token description states the boundary in its own text: *"Cryptographic identity; not a legal contract."*

`tokenURI(id)` is pure arithmetic — `baseURI + id + ".json"` — pinned by tests, with no per-token URI mapping an owner could quietly edit. A classic NFT failure mode is a silent swap of the metadata pointer; `freezeURI()` closes that permanently in the same transaction sequence that mints.

The other half, honestly: the frozen pointer targets **GitHub, not IPFS** — images and JSON via raw HTTPS, living portraits via GitHub Pages: two GitHub services, both frozen into the pointers forever, because the pointer can never be retargeted. The chain stores the URL, not a content hash. The repo behind that URL is controlled by us (the Dozier-Tech-Group org); a compromised or malicious maintainer could force-push different bytes behind the frozen pointer, and detection would rely on public git history and holders' local copies — not on the chain. **No IPFS pin exists today**; the only redundancy is the public git history and any copies holders keep. The README recommends a second pin as future hygiene — it has not been done. This is the real trust assumption of the hosting choice, stated plainly rather than hidden, and the freeze makes it permanent.

## 5. Straight answers a diligent reader will want

**Will the tokens be sold? What do the funds do?** All 198 tokens mint to `0x29486…D11d`. Nothing is offered for sale at launch, no token is offered with any expectation of profit, and this document makes no claim about price or future value — ever. The launch spends a few dollars of ETH on gas; the mission's real costs are software development, which gas does not touch.

**What rights come with a token?** The repo currently ships no explicit license for the artwork. Until one is added, owning the token conveys the token itself — not copyright or commercial rights to the image. That is a named gap on the to-do list, not a papered-over one.

**Why 198?** That is every portrait on the delivered contact sheet (18×11). `MAX_SUPPLY = 198` binds this contract forever.

**Will the pause power exist forever?** Plan of record: rotate ownership two-step to a multisig Safe, with pause as break-glass only. Renouncing ownership entirely (which would permanently remove pause and royalty control) becomes possible only after the freeze and is not currently planned — stated so nobody has to guess.

**What about the other contracts in the repo?** `BountyBoard.sol` and `MergedCredit.sol` are alpha stubs. They are not part of this launch and nothing here depends on them; SECURITY.md documents their owner powers for whenever they are used.

**No yield. Ever.** No staking, no APY, no emissions, no guaranteed returns. If rewards ever exist in later phases, PLAN.md commits that they would be payment for verified contribution — delivery evidence, attestations, accepted milestones — and real-money movement waits on legal, tax, and payment review.

## 6. Why this could matter

The NFT projects that died promised yield, minted thousands into a public sale, and blurred a JPEG into a legal right. This project refuses all three, permanently, in bytecode and in writing. Four tokens — hard-capped, frozen at birth, tested, documented, with the entire future explicitly labeled future work — is a credibility statement aimed at the one audience that reads the fine print: public institutions.

The bet is not that a token goes up. The bet is that Louisiana's institutions adopt open-source technology built in-state, that the census numbers move, and that capability on that network becomes something a person, company, or institution holds next to their name. If that happens, these four gators are the genesis artifact of the moment it started — and every claim in this document will still check out.

*Silicon Bayou — Gator Parish, Louisiana. Built on Robinhood Chain. Not endorsed by Robinhood. Not a security, not a yield product, not a legal record. Repo: [github.com/Dozier-Tech-Group/silicon-bayou](https://github.com/Dozier-Tech-Group/silicon-bayou).*
