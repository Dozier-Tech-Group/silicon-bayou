# Silicon Bayou

**MVP** — original Louisiana alligator PFPs (capability NFTs) on Robinhood Chain. The public-facing capability layer for **merged**.

Give the next coding agent **[AGENT_IMPLEMENT.md](AGENT_IMPLEMENT.md)** — full plan, what is built, what is not, and the Robinhood mainnet go-live sequence.

## Vision

The north star, stated the way Merged, Inc. already talks: **merged** is *the open source institutional network* — one open network for every institution. The hope is that **one day all of Louisiana uses this stack for education and other industries**, and that Louisiana becomes a **leading technical developer in the nation**.

That is not a side note. It is why Silicon Bayou exists.

On the live product language (`merged-website`):

- **merged.edu** — the operating layer for higher education (overlay on systems of record, not a rip-and-replace)
- **merged.sport** — the operating system for collegiate athletics
- **merged.map** — the directory; **The Merger** is the index for groups, colleges, and tools
- **merged.core** — the retained core (ontologies, packages, data, integrations); open to contribution, accepted by Merged, Inc.

Tagline they ship: *Merging ideas and the structures of education into one open network — every feature open source, the core intelligence retained by Merged, Inc.* Higher education is the **reference implementation, not the requirement** — the same modules are meant for a district, agency, hospital, or municipality.

Silicon Bayou is the holdable, human face of capability on that network. Four gators in this repo are Phase 0. The protocol is the statewide bet. See [PLAN.md](PLAN.md).

**merged** (Merged, Inc.) is the institutional network. Public site: [mergedpublic.com](https://www.mergedpublic.com). Open-core rails live in `merged-public`. This repo is a **sibling MVP** — it does not import that codebase, does not replace systems of record, and does not pretend an NFT is a legal contract.

Gator Parish is the in-universe region for these alligators.

| | |
|---|---|
| Collection | Silicon Bayou |
| Symbol | `BAYOU` |
| Chain | Robinhood Chain (EVM L2, gas in ETH) |
| Mainnet | chain ID **4663** · RPC `https://rpc.mainnet.chain.robinhood.com` · explorer [robinhoodchain.blockscout.com](https://robinhoodchain.blockscout.com) |
| Testnet | chain ID **46630** · RPC `https://rpc.testnet.chain.robinhood.com` · explorer [explorer.testnet.chain.robinhood.com](https://explorer.testnet.chain.robinhood.com) |
| Marketplace | [OpenSea supports Robinhood Chain](https://opensea.io/blog/articles/robinhood-chain-is-live-on-opensea) |

This cut ships **four owner-minted tokens**, a static gallery, and a written protocol plan. No public sale, staking, recipes, yield, or SBIR/STTR engine — see [PLAN.md](PLAN.md).

**Launch status:** see [LAUNCH.md](LAUNCH.md). Hybrid genesis art is in progress — do not pin or mint the current photoreal portraits or `generator/out` pixels. Robinhood Chain mainnet is chain ID **4663**, gas in ETH, RPC `https://rpc.mainnet.chain.robinhood.com`, explorer [robinhoodchain.blockscout.com](https://robinhoodchain.blockscout.com).

## What you get

| Token | Class | File |
|---|---|---|
| #1 | Engineering Gator | `art/gators/engineering-gator.png` |
| #2 | Testing Gator | `art/gators/testing-gator.png` |
| #3 | Construction Gator | `art/gators/construction-gator.png` |
| #4 | Capital Gator | `art/gators/capital-gator.png` |

OpenSea-style JSON lives in `metadata/1.json` … `metadata/4.json`. Images are also copied to `metadata/images/1.png` … `4.png`.

## Install (Windows / PowerShell)

Node.js 20+ is required. **Hardhat** is the deploy path. **Foundry** is also configured (`foundry.toml`) and was used to verify the contract compiles (`forge build --skip test --skip script`).

```powershell
cd C:\Users\gdozi\Projects\silicon-bayou
npm install
npm run compile
```

Optional Foundry compile (if `forge` is on PATH, e.g. `%USERPROFILE%\.foundry\bin`):

```powershell
forge build --skip test --skip script
```

Compiler is Solidity 0.8.24 / Shanghai (Robinhood Chain is EVM; Cancun `mcopy` is not assumed). OpenZeppelin is pinned to 5.2.0 for that reason.

## Configure

```powershell
copy .env.example .env
```

Edit `.env`:

- `PRIVATE_KEY` — deployer / collection owner. Never paste keys into chat or commit `.env`.
- `RPC_URL` — start with the **testnet** public RPC above. For anything serious, use Alchemy (`https://robinhood-testnet.g.alchemy.com/v2/{API_KEY}`).
- `BASE_URI` — trailing slash. `tokenURI(1)` becomes `{BASE_URI}1.json`.
- `MINT_TO` — optional recipient; defaults to the deployer.

Fund the deployer with ETH on the target Robinhood Chain network (canonical Arbitrum bridge — see [Robinhood Chain docs](https://docs.robinhood.com/chain/)).

## Deploy and mint

Deploy to **testnet first**. The script deploys `SiliconBayou` and immediately mints tokens 1–4 to the owner (or `MINT_TO`).

```powershell
# .env: RPC_URL=https://rpc.testnet.chain.robinhood.com
npm run deploy:testnet
```

Then mainnet (only with a funded key already in `.env`):

```powershell
# .env: RPC_URL=https://rpc.mainnet.chain.robinhood.com
npm run deploy:mainnet
```

Verify on Blockscout by pasting the address and source, or install `@nomicfoundation/hardhat-verify` and run:

```powershell
npx hardhat verify --network robinhoodTestnet <CONTRACT_ADDRESS> "ipfs://REPLACE_ME/"
# mainnet:
npx hardhat verify --network robinhood <CONTRACT_ADDRESS> "ipfs://REPLACE_ME/"
```

Constructor arg must match the `BASE_URI` you deployed with.

After IPFS upload, the owner can point metadata at the real CID:

```powershell
npx hardhat console --network robinhoodTestnet
# const nft = await ethers.getContractAt("SiliconBayou", "<address>")
# await (await nft.setBaseURI("ipfs://<JSON_CID>/")).wait()
```

Official deploy guide: [docs.robinhood.com/chain/deploy-smart-contracts](https://docs.robinhood.com/chain/deploy-smart-contracts/).

## Upload metadata (IPFS) then list on OpenSea

Images are local until you pin them. A typical flow:

1. Upload `metadata/images/` (the four PNGs named `1.png`–`4.png`) to IPFS (Pinata, nft.storage, web3.storage, etc.). Note the folder CID.
2. Edit each `metadata/*.json` `image` field from `ipfs://REPLACE_ME/N.png` to `ipfs://<IMAGES_CID>/N.png`.
3. Upload the four JSON files (not the images folder) so `1.json` … `4.json` sit at the root of that CID.
4. Set `BASE_URI=ipfs://<JSON_CID>/` and call `setBaseURI` (or redeploy if you have not minted yet).
5. Verify `tokenURI(1)` on a trusted RPC, then `npm run freeze-uri` (permanent).
6. OpenSea indexes Robinhood Chain collections after the contract is live. Filter OpenSea by Robinhood Chain and open the contract address. Listing needs a **deployed address**; this repo does not include one until you deploy. Confirm the address on Blockscout — fake OpenSea collections exist.

You can browse locally before any of that:

```powershell
npm run gallery
```

Then open [http://localhost:4173/gallery/](http://localhost:4173/gallery/) — or just open `gallery/index.html` in a browser.

The live collection, wallet connect, bounty board, and cash-out flow live on
the merged website at **`/bayou`** (`merged-website`). This gallery stays a
local card preview. `BountyBoard.sol` + `MergedCredit.sol` are the on-chain
stub (`npm run deploy:bounty:testnet`); the website does not wait on a deploy.

## Contract

`contracts/SiliconBayou.sol` — OpenZeppelin ERC-721 + ERC-2981, **not upgradeable**:

- Name `Silicon Bayou`, symbol `BAYOU`
- `mint` / `mintBatch` — owner only, paused-safe, `MAX_BATCH = 32`
- `setBaseURI` then **`freezeURI`** — freeze is permanent
- `pause` / `unpause` — emergency stop on mint and transfer
- Ownable2Step — no instant owner handoff; cannot renounce until URI is frozen
- ERC-2981 royalties capped at 10% (`MAX_ROYALTY_BPS = 1000`); default 5%
- `tokenURI(id)` → `{baseURI}{id}.json`

No staking, no public sale, no proxy. See [SECURITY.md](SECURITY.md).

**Security gate before mainnet:** `npm test` and `npm run security` must pass. Do not mint or pin until hybrid art is user-okayed (`GENESIS_ART_READY`).

Local `npm run gallery` (`serve` on port 4173) applies CSP / nosniff headers from `serve.json`. GitHub Pages does not send those headers; each gallery page also has a CSP meta tag.

## Repo layout

```text
art/gators/           Source PFPs
metadata/             OpenSea JSON + images/1–4.png
contracts/            SiliconBayou.sol, BountyBoard.sol, MergedCredit.sol
scripts/deploy.js     Deploy + mint 1–4 (GENESIS_ART_READY hold)
gallery/              Local preview (CSP meta + rel=noopener)
SECURITY.md           Threat model, freeze URI, 2-step owner, Safe
PLAN.md               Future protocol (not built)
```

## Explicitly not in this MVP

Crew staking, yield, reward tokens, capability recipes, project contracts, SBIR/STTR workflows, SAM.gov/UEI checks, and any guaranteed-return tokenomics. Those belong in [PLAN.md](PLAN.md) only. NFTs here are cryptographic representations of capability/identity — **not** the full legal contract.
