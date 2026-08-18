# Silicon Bayou — protocol plan

This file is **future work**. The live collection in this repo is 198 swamp gators, frozen metadata, an owner-mint ERC-721 (sold out), and a gallery. Nothing below is implemented — except the thesis, which is why the protocol exists at all.

Copy here follows Merged, Inc. public materials. It does not invent product names.

## North Star / Louisiana thesis

**Hope, stated plainly:** one day **all of Louisiana uses Merged technology** — **merged** (the open source institutional network) and **Silicon Bayou** (this capability layer) — **for education and other industries**, and Louisiana becomes a **leading technical developer in the nation**.

That is the most forward-looking purpose of this project. Silicon Bayou is not a meme collection with a Louisiana costume. It is the public capability layer of infrastructure Merged, Inc. is already building.

### What merged actually is (from their repos)

| Name | What the materials say |
|---|---|
| **merged** | Marketing/network brand. Site: [mergedpublic.com](https://www.mergedpublic.com). Tagline: *The Open Source Institutional Network.* Headline family: *The Future of Higher Education / Collegiate Athletics / Every Institution — Merged.* |
| **merged.edu** | “The operating layer for higher education.” Overlay on Workday, Banner, SIS — **not** a rip-and-replace. Human-final advising. Dream-driven paths, advisor superpowers, institutional intelligence. **Live** industry on the site. |
| **merged.sport** | “The operating system for collegiate athletics.” Performance, compliance, eligibility, recruiting. **Live.** |
| **merged.map** | Directory. **The Merger** — index to find groups and reach the tools they publish. |
| **merged.core** | Retained core: identity, namespace (dots), access, value. “You never mutate state directly. You commit a typed, attributed transaction.” Open to contribution; Merged, Inc. accepts. |
| **merged.students** / **merged.merch** | Expanding. Portable student pages; network gear. |
| **merged-public** | Open-core contracts, manifests, registry rails, Merged Credits (MC) as **non-cash** credits. |
| **Merged Credits (MC)** | Public non-cash ledger. Real-money movement waits on legal/tax/payment review. |

Entity: **Merged, Inc.** Public GitHub: [Dozier-Tech-Group/merged-public](https://github.com/Dozier-Tech-Group/merged-public). Their own community copy: *Higher education is the reference implementation, not the requirement — the modules are the same for a district, agency, hospital, or municipality.*

Site industries today: Higher Education and Collegiate Athletics (**Live**); Government & Public Sector and Defense & National Security (**Emerging**).

### Louisiana evidence they already compiled

This thesis is not abstract. From Merged’s compiled census and school-index work:

- **Louisiana Public Higher-Ed Software Spend Census** (`merged-website/public/census`, `dtg-platform/tools/onboard-bridge/publish/hf-la-census`): 550 evidence-linked contract records across **45 Louisiana public higher-education institutions**. Counted vendors in that census are headquartered **outside Louisiana**. Rule: no quote, no number.
- **Louisiana public high school index** (`Research/school-index`): **380 schools, 124 districts, 246,582 students** — K-12 is in scope, not only universities. Dual enrollment is already mapped as a college-credit signal.
- **merged.core** identity model: a person owns a portable profile; institutions grant and revoke relationships. A merge is a handshake through a boundary, not a dissolution of it.

Education is first-class: K-12 → community college / LCTCS → university → athletics → career. The census is the argument that Louisiana currently pays out-of-state software stacks for that journey. merged is the overlay and coordinating layer. Silicon Bayou is how capability becomes visible on-chain.

### Gators as the human layer

Silicon Bayou alligators are the friendly, holdable face of that infrastructure. A gator is a cryptographic representation of class and capability (Engineering, Testing, Construction, Capital) — something a person, company, or institution on the merged network could eventually hold next to a merged.edu / merged.sport address. Gator Parish is the in-universe region.

The NFT is **not** a government contract, a diploma, a SAM.gov record, or a claim on treasury yield. merged.edu itself says it does not replace systems of record. Same rule here.

### Other industries (same pattern, later containments)

Live products start in higher education and athletics. The ten-module system is written to travel. For Louisiana that later map includes:

- **Energy, ports, construction, agriculture, software** — industry demand side of a student–research–employer pipeline
- **Government & public sector** — already an Emerging industry on the merged site (cross-agency coordination)
- **Defense** — Emerging on the site; SBIR/STTR as *referenced* opportunities, never as a replacement federal system

The long-term bet: Louisiana does not only consume software built elsewhere. Universities, companies, K-12 and higher-ed, ports, plants, and agencies use the same coordinating layer — merged for identity and tools, Silicon Bayou for capability you can hold — and the state becomes known nationally as a place that **builds**.

### Honest sequencing

| Now (Phase 0) | Why it exists |
|---|---|
| Four original gators, owner-mint ERC-721, metadata, gallery | A real, shippable surface so the capability layer can be seen and held |
| This plan | The reason the collection is not “just an NFT drop” |

Recipes, project contracts, institutional identity, education workflows, and industry crews come later. No guaranteed token yield. No claim that holding a gator *is* a legal award, enrollment, or government contract. Rewards, if any, only for verified contribution — the same discipline as merged.core’s attributed transactions and Merged Credits.

## Relationship to merged

**merged** is Merged, Inc.'s public network (site: [mergedpublic.com](https://www.mergedpublic.com)). **merged-public** is the open-core GitHub repo: manifests, registry rails, contributor workflows, and the public Merged Credits ledger. **merged.core** is the private spine (identity, dots, access, value). None of those repos were modified for this MVP.

**Silicon Bayou is the NFT capability layer for that ecosystem** — a visual identity a Louisiana org (or later an institution with a merged address) could hold. Sibling product, not a rewrite, not a live integration yet.

Gator Parish is the in-universe region for these alligators.

## What the NFT is (and is not)

| Is | Is not |
|---|---|
| A cryptographic pointer to class, region, specialty, and capability scores | The legal contract, SOW, or grant award |
| A public-facing identity / capability badge | A substitute for SAM.gov, UEI, Grants.gov, or agency systems of record |
| A hook for later recipes (crews assembled from capability mixes) | Passive yield, staking APY, or guaranteed returns |

Rewards, if introduced later, are **only for verified contribution** — delivery evidence, attestations, accepted milestones. No sit-and-earn.

## Contracting graph (target architecture)

Identity → Capability → Opportunity → Consortium → Contract → Milestone → Deliverable → Attestation → Settlement → Provenance

1. **Identity** — merged.core portable profile + dot-address; the gator is the public face.
2. **Capability** — Engineering, Testing, Construction, Capital scores (already on MVP metadata) plus credentials.
3. **Opportunity** — SBIR/STTR topic, state grant, parish build, institutional RFP. Discovery lives in Merged / The Merger, not in the NFT.
4. **Consortium** — a crew of gators (orgs) whose combined scores meet a recipe.
5. **Contract** — legal instrument stays off-chain (PDF, SAM, agency portal). On-chain: a hash, parties, and milestone skeleton.
6. **Milestone** — funded only when evidence is attached.
7. **Deliverable** — artifact + checksum / URI.
8. **Attestation** — independent tester / contracting officer analogue signs the evidence hash.
9. **Settlement** — payment or **non-cash credits** after attestation. Align with Merged Credits (MC) as non-cash until compliance review allows more.
10. **Provenance** — immutable trail of who did what; still not the system of record for federal awards.

Federal rules: SAM.gov registration, UEI, size/eligibility, COI, and reporting remain in government systems. Silicon Bayou must not claim to replace them. At most it can *point at* a UEI or award ID as an attribute.

## Recipes / crews (game layer, not MVP)

Later, combine gators so a crew can bid:

- Example: a Phase I SBIR prototype recipe might require Engineering ≥ 80, Testing ≥ 70, Capital ≥ 40.
- Construction-heavy parish work weights Construction + Testing.
- Recipes are matching rules over capability scores, not a DEX and not a yield farm.

## Phased roadmap

### Phase 0 — this MVP

Four original gators, OpenSea-compatible metadata, owner-mint ERC-721 on Robinhood Chain, local gallery, this plan.

### Phase 1 — live collection

IPFS pin, `setBaseURI`, OpenSea listing, more traits (beads, boots, parish, weather) without copying other collections. Optional public mint with a hard cap. Collection contract address published.

### Phase 2 — capability recipes

On-chain or off-chain recipe registry: required class mix → crew NFT or attestation that a set of token IDs satisfies a recipe. Still no yield.

### Phase 3 — project contracts

Milestone objects, deliverable hashes, attestor roles. SBIR/STTR and grant workflows as **templates that reference** agency IDs. Legal contract remains the authority; chain stores commitments and evidence pointers.

### Phase 4 — institutional identity

Bind gators to merged dot-addresses and org profiles (consent + scope, same handshake idea as Merged Public). Institutions hold capability tokens the way they hold a seal — portable, revocable relationships, not a merge that dissolves the legal entity.

## Explicit non-goals (do not build until Phase 2+)

- SBIR/STTR application or contracting system
- Crew staking
- Reward token / emissions
- Passive yield or “APY”
- Anything that looks like a security offering or guaranteed return
- Deep write-access into Merged Public / merged.core

## Design constraints to keep

- Original Louisiana alligator art; no Bored Ape / third-party character copies; no unlicensed trademarks (LSU, Nike, etc.).
- Robinhood Chain is EVM; unmodified Solidity/OpenZeppelin is the default.
- Real-money movement follows legal, tax, and payment review (same rule as the merged ecosystem). Early value stays non-cash.
