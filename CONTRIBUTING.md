# Contributing to Silicon Bayou

This repository is the source for the live **BAYOU** collection on Robinhood Chain.

**BAYOU holders are first.** Read [HOLDERS.md](HOLDERS.md) before opening a PR if you hold a token. Public contributions are welcome after that holder window; the git history is already public because frozen metadata is served from GitHub.

## What this repo is

- ERC-721 `SiliconBayou.sol` — **live**, `MAX_SUPPLY = 198`, URI frozen
- Swamp gator art + metadata for tokens 1–198
- Local gallery, tests, and the value thesis

NFTs here are **not** legal contracts, diplomas, SAM.gov records, or yield products.

## What not to do

- Do **not** run `npm run deploy:mainnet`. The collection is already deployed. A second deploy would be a different contract.
- Do **not** commit `.env`, private keys, or API tokens.
- Do **not** mint or ship `generator/out` (paused pixel experiment) or photoreal 3D gators.
- Do **not** rewrite `metadata/swamp/*.json` or the 198 PNGs on `master` — OpenSea reads those URLs. Changing them is a metadata swap.
- Do **not** add a public sale, staking, APY, or an upgradeable proxy.

## Setup

```powershell
git clone https://github.com/Dozier-Tech-Group/silicon-bayou.git
cd silicon-bayou
copy .env.example .env
npm install
npm run compile
npm test
npm run security
```

Leave `PRIVATE_KEY` empty unless you are the collection owner running an owner-only script (royalty, pause, 2-step ownership). Contributors do not need a key.

## Tests

```powershell
npm test
npm run security
```

Both must pass before a PR.

## Pull requests

1. One change per PR when you can.
2. Say **why** in the description.
3. Link an issue if there is one.
4. Do not force-push `master`.

Issues: https://github.com/Dozier-Tech-Group/silicon-bayou/issues

## Contract facts (do not “fix” these)

| | |
|---|---|
| Address | [`0xA81aEd6f3a5Faea95197786ba162e706Fd938d20`](https://robinhoodchain.blockscout.com/address/0xA81aEd6f3a5Faea95197786ba162e706Fd938d20) |
| Chain | Robinhood Chain mainnet, **4663** |
| OpenSea | [opensea.io/collection/silicon-bayou](https://opensea.io/collection/silicon-bayou) |
| Record | [DEPLOYMENT.md](DEPLOYMENT.md) |

Full standing orders for agents: [AGENTS.md](AGENTS.md). Threat model: [SECURITY.md](SECURITY.md).
