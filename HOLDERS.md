# Silicon Bayou holders — first access

The git repository is **already public**. Frozen token metadata is hosted at GitHub raw URLs; making the repo private would break OpenSea images. “Open source first for holders” therefore means **people, not a private GitHub toggle**:

1. **Holders are told first** — collection owners get the repo link, the license, and the thesis before any public social post.
2. **Holders can ask for org access** — a GitHub account tied to a wallet that `ownerOf`s a BAYOU token can be invited to the Dozier-Tech-Group discussion / issue loop first.
3. **Then the public post** — after that window, the same repo is announced on X and the site.

This is not gated source. Anyone can clone. Holders get the first conversation.

## Official collection

| | |
|---|---|
| Contract | [`0xA81aEd6f3a5Faea95197786ba162e706Fd938d20`](https://robinhoodchain.blockscout.com/address/0xA81aEd6f3a5Faea95197786ba162e706Fd938d20) |
| Chain | Robinhood Chain, ID **4663** |
| Tokens | 1–198 (sold out at mint) |
| OpenSea | [opensea.io/collection/silicon-bayou](https://opensea.io/collection/silicon-bayou) |
| Source | [github.com/Dozier-Tech-Group/silicon-bayou](https://github.com/Dozier-Tech-Group/silicon-bayou) |

A BAYOU token is **not** a share of Merged, Inc., a diploma, or a yield instrument. It is the holdable swamp gator for this collection.

## How to request holder access

Open a GitHub issue titled **Holder access** and include:

- Your GitHub username
- The BAYOU token id(s) you hold
- The wallet address that owns them on chain 4663 (we check `ownerOf` on the public RPC)

Do not paste a private key. Do not send NFTs to anyone who DMs you a “verify” link.

## What holders get first

- This repository (contract, tests, art source of record, [VALUE.md](VALUE.md))
- A chance to file issues before the public thread
- The same license as everyone else: MIT on code, art stays copyright Merged, Inc. ([LICENSE](LICENSE))

## Gator Works — your gator can earn

Holding a gator qualifies you to run an **AI agent in the merged CI/CD
pipeline**. Your agent works funded bounties (tests, docs, fixes on this repo
and merged-public); when its PR merges first, the bounty settles to your
wallet in Merged Credits on-chain — `BountyBoard.settle` itself checks you
still hold a gator. Payment for verified work only; never passive yield.

Start here: [agents/README.md](agents/README.md) — link your wallet with
`npm run agent:link` (signs locally; no key ever leaves your machine).

## Operator note (launch day)

Send [marketing/holders-first.md](marketing/holders-first.md) to current owners **before** posting [marketing/x-launch-thread.md](marketing/x-launch-thread.md).
