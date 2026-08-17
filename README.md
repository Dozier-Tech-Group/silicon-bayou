# Silicon Bayou

**MVP** — original Louisiana alligator PFPs (capability NFTs) on Robinhood Chain. The public-facing capability layer for **merged**.

Give the next coding agent **[CONTINUE.md](CONTINUE.md)** (other computer) and **[AGENT_IMPLEMENT.md](AGENT_IMPLEMENT.md)** (full plan).

## Vision

The north star, stated the way Merged, Inc. already talks: **merged** is *the open source institutional network* — one open network for every institution. The hope is that **one day all of Louisiana uses this stack for education and other industries**, and that Louisiana becomes a **leading technical developer in the nation**.

That is not a side note. It is why Silicon Bayou exists.

The full pre-launch value thesis — chain choice, contract guarantees, asset permanence, and the honest limits of each, every claim sourced — is in [VALUE.md](VALUE.md).

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
| Contract | [`0xA81aEd6f3a5Faea95197786ba162e706Fd938d20`](https://robinhoodchain.blockscout.com/address/0xA81aEd6f3a5Faea95197786ba162e706Fd938d20) on Robinhood **4663** |
| Marketplace | [OpenSea · Robinhood](https://opensea.io/assets/robinhood/0xA81aEd6f3a5Faea95197786ba162e706Fd938d20) |
| Canonical WETH | `0x0Bd7D308f8E1639FAb988df18A8011f41EAcAD73` on chain **4663** ([Robinhood token contracts](https://docs.robinhood.com/chain/contracts/)) — wrap/unwrap explainer: [ethereum.org/wrapped-eth](https://ethereum.org/wrapped-eth/). We do **not** deploy our own WETH. |

This cut ships **198 owner-minted swamp gators** on Robinhood Chain. No public sale, staking, recipes, yield, or SBIR/STTR engine — see [PLAN.md](PLAN.md).

**Launch status:** **live.** `MAX_SUPPLY = 198`, URI frozen. Tokens 1–198 minted to `0x29486Fc6B2E7184Dd4aF4d310D4f85F4262fD11d`. **Do not run `deploy:mainnet` again.** Record: `deployments/robinhood.json`.

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
- `RPC_URL` / `RH_RPC_URL` — `https://rpc.mainnet.chain.robinhood.com` for mainnet.
- `BASE_URI` — trailing slash. Launch value: `https://raw.githubusercontent.com/Dozier-Tech-Group/silicon-bayou/master/metadata/`
- `MINT_TO` — `0x97471f8Aa113aF7043B599Ccfb1702F2F78CF8a5`
- `GENESIS_ART_READY=1`

Fund the deployer with ETH on the target Robinhood Chain network (canonical Arbitrum bridge — see [Robinhood Chain docs](https://docs.robinhood.com/chain/)).

## Deploy and mint

Deploy to **testnet first** if you have testnet ETH. The script deploys `SiliconBayou`, mints tokens 1–4 to `MINT_TO`, and **freezes URI**.

```powershell
npm run deploy:testnet
```

Then mainnet (only with a funded key already in `.env`):

```powershell
npm run wallet
npm run deploy:mainnet
```

Verify on Blockscout by pasting the address and source, or install `@nomicfoundation/hardhat-verify` and run:

```powershell
npx hardhat verify --network robinhoodTestnet <CONTRACT_ADDRESS> "ipfs://REPLACE_ME/"
# mainnet:
npx hardhat verify --network robinhood <CONTRACT_ADDRESS> "ipfs://REPLACE_ME/"
```

Constructor arg must match the `BASE_URI` you deployed with (GitHub raw metadata folder, trailing slash).

After IPFS upload, the owner can point metadata at the real CID:

```powershell
npx hardhat console --network robinhoodTestnet
# const nft = await ethers.getContractAt("SiliconBayou", "<address>")
# await (await nft.setBaseURI("ipfs://<JSON_CID>/")).wait()
```

Official deploy guide: [docs.robinhood.com/chain/deploy-smart-contracts](https://docs.robinhood.com/chain/deploy-smart-contracts/).

## Upload metadata (IPFS) then list on OpenSea

Images are already referenced from GitHub HTTPS in `metadata/*.json`. A typical IPFS upgrade is **not available after `freezeURI`** on this collection. Keep a second pin of the PNGs as backup. To list:

1. Confirm `tokenURI(1)` on Blockscout after deploy.
2. OpenSea indexes Robinhood Chain collections after the contract is live. Filter OpenSea by Robinhood Chain and open the contract address. Listing needs a **deployed address**; this repo does not include one until you deploy. Confirm the address on Blockscout — fake OpenSea collections exist.

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
- **`MAX_SUPPLY = 198`**, `MAX_BATCH = 33` — owner mint only; token 199 reverts
- `setBaseURI` then **`freezeURI`** — freeze is permanent (`deploy.js` freezes after mint)
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
CONTINUE.md           Other-computer go-live playbook
AGENT_IMPLEMENT.md    Full agent system prompt
LAUNCH.md             Checklist
scripts/deploy.js     Deploy + mint 1–4 + freezeURI
gallery/              Local preview (CSP meta + rel=noopener)
SECURITY.md           Threat model, freeze URI, 2-step owner, Safe
PLAN.md               Future protocol (not built)
```

## Explicitly not in this MVP

Crew staking, yield, reward tokens, capability recipes, project contracts, SBIR/STTR workflows, SAM.gov/UEI checks, and any guaranteed-return tokenomics. Those belong in [PLAN.md](PLAN.md) only. NFTs here are cryptographic representations of capability/identity — **not** the full legal contract.
