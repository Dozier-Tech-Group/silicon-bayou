# Merged Public — the value thesis

**Purpose, in one sentence:** a 10,000-entity archive of the merged public — the people layer of the open institutional network, held in a wallet, where the [Silicon Bayou](VALUE.md) gators are the capability layer.

> **Status: PRE-LAUNCH.** No contract is deployed as of this writing. When Merged Public goes live it will be recorded in this repo's `deployments/` directory and the README, the same way [Silicon Bayou's launch](DEPLOYMENT.md) was. Do not trust any address that does not appear there.

**Who is behind this, stated up front:** the same disclosure as [VALUE.md](VALUE.md) — Merged Public, Silicon Bayou, and **merged** (mergedpublic.com, the open source institutional network) are projects of the same organization; the Dozier-Tech-Group GitHub org and Merged, Inc. share principals. Where the network's Louisiana research is cited, it is the builder's own compiled material, not third-party validation. Everything else is sourced to this repository so a skeptical reader can check us.

---

## 1. What Merged Public is

Silicon Bayou answered "who can do the work" — 198 gators, four capability classes, a fixed curated edition. Merged Public answers the other half: **who the network is for.** It is a 10,000-entity generative archive of the merged public — students, teachers, clerks, coaches, builders, the people an open institutional stack actually serves — minted as `MergedPublic` (MP) on Robinhood Chain mainnet (chain ID 4663, gas in ETH, same chain, same wallet discipline, same explorer).

The two collections are deliberately different shapes. BAYOU is small, curated, and frozen at birth: the capability layer. MP is large, generative, and committed before the art exists: the people layer. One network, two registers.

Everything in [VALUE.md §2](VALUE.md) about the chain applies here unchanged, including the sentence that matters most: **Robinhood has not endorsed, reviewed, or partnered with this project.**

## 2. The launch design: discipline before art

`contracts/MergedPublic.sol` is the source of truth, and like `SiliconBayou.sol` it is honest about what it **cannot** do:

| The threat | What kills it |
|---|---|
| Supply inflated later | `MAX_SUPPLY = 10_000` is a compile-time constant; `mint`/`mintBatch` revert past it. `MAX_BATCH = 250` bounds each owner mint. |
| The draw rigged after seeing demand | `provenanceHash` — keccak256 of the canonical provenance JSON (seed 20260818 + weights + rules) — is **immutable, set in the constructor, before any art exists.** After reveal, anyone can re-run the draw and check it against the hash. |
| A fake "reveal" walked back | `reveal(baseURI)` is one-way. Until it fires, every token serves the same sealed metadata document. |
| Art swapped after reveal | `setBaseURI` works only until `freezeURI()` — a one-way flag with no unfreeze. |
| Archive stranded sealed or mutable with no owner | `renounceOwnership` reverts until the URI is revealed **and** frozen. |
| Ownership fat-fingered | `Ownable2Step`; the new owner must accept. |
| Royalty ratcheted | ERC-2981, default 5%, hard-capped at 10%; `setDefaultRoyalty` reverts above it. |
| Admin upgrade god-mode | No proxy. Immutable implementation. |

There is **no public sale and no mint price.** All 10,000 mint owner-only to the treasury, in batches, exactly as the 198 gators did. Nobody is asked for money to get in at launch, which means nobody can be sold a promise. Collection-page metadata (EIP-7572 `contractURI`) stays owner-editable for branding; token metadata does not, once frozen.

Why this order matters: most 10k collections generate art, watch the market, then "commit." MP commits the seed, weights, and rules to the chain first and generates second. The provenance hash is the promise; the reveal is just the delivery. That is the same discipline that made VALUE.md readable by institutions — claims that survive checking.

As with BAYOU, there is no third-party audit; the compensating controls are the hard cap, immutability, the freeze, pinned OpenZeppelin components, and the repo's test gate. The same single-owner-key risks named in [VALUE.md §3](VALUE.md) apply until ownership rotates to a multisig.

## 3. The value lanes, in order

**Lane 1 — identity in the archive.** The base fact of an MP token: one fixed entity of the merged public, provably drawn from a pre-committed distribution, with metadata that freezes forever. It is a durable identity artifact in a 10,000-entity archive — a name-tag on the network the way a gator is a hard-hat. That is the floor, and it is the only lane that exists at launch.

**Lane 2 — access.** As merged services ship, holding MP is the intended gate to their public-facing side — **education first, Louisiana first**, mirroring the network's own sequence (merged.edu is the reference implementation). Today the shipped example of holder-gating is on the BAYOU side: `BountyBoard` settles only to gator holders, live on chain 4663. MP gates follow the same pattern as services actually ship, not before. No gate is promised on a date.

**Lane 3 — verified contribution.** Merged Credits (`MergedCredit`, MC) is the network's non-cash rail for paying **verified merged work** — delivery evidence, attestations, accepted milestones. It is the same rail Gator Works runs on: AI agents and people working funded bounties in CI, settled on-chain to holders. MP holders plug into that rail as contributors as the rail extends; the addresses that exist today are recorded in `deployments/credits.json`, and only those addresses should be trusted. Rewards are payment for contribution — never for holding.

**Lane 4 — the Archive Game.** A small lane, and flavor by design: light play built on the archive's entities. It is described in [MP-GAME.md](MP-GAME.md) and sized honestly there — a reason to look at the archive, not a reason to buy anything.

**Lane 5 — future services, included over time.** The inclusion principle, stated once so it never has to be argued: **a service joins the MP lane when it can gate on MP identity and settle on verified work. Nothing joins on promises.** No roadmap slide adds a lane; a shipped gate does.

## 4. What Merged Public is NOT

The discipline is verbatim from [VALUE.md](VALUE.md) and permanent:

- **Not yield.** No emissions, no revenue share, no passive income of any kind.
- **Not staking APY.** There is no staking. There is no APY. There never will be.
- **Not guaranteed returns.** This document makes no claim about price or future value — ever. Nothing here is an investment or offered with any expectation of profit.
- **Not a legal instrument.** An MP token is cryptographic identity in an archive — not a security, not a contract, not a claim on Merged, Inc., its treasury, or any community pool.

If a rewards mechanism ever touches real money, it waits on legal, tax, and payment review first — the same commitment PLAN.md makes for the gators.

## 5. Discoverability

Merged Public gets **its own OpenSea collection page and its own lane.** It does not ride on Silicon Bayou's page, dilute the 198, or share a contract. OpenSea indexes Robinhood Chain collections once contracts are live — on OpenSea's timeline, not ours — and `contractURI` (EIP-7572) carries the collection's name, description, image, and royalty facts so the page reads correctly when it appears. Two collections, one network: the gators stay the small curated capability set; the archive is the wide public one.

## 6. Why this could matter

The 10k collections that died sold access to a promise before anything existed. Merged Public inverts every step: provenance committed before art, mint to treasury instead of a public sale, reveal as a one-way switch, freeze as the finish line, and value lanes that open only when a real service can gate on the token and settle on real work. If the network thesis in VALUE.md plays out — Louisiana institutions running open-source infrastructure built in-state — this archive is the people layer of that record, ten thousand entities deep, and every claim in this document will still check out.

*Merged Public — the people layer. Built on Robinhood Chain. Not endorsed by Robinhood. Not a security, not a yield product, not a legal record. Repo: [github.com/Dozier-Tech-Group/silicon-bayou](https://github.com/Dozier-Tech-Group/silicon-bayou).*
