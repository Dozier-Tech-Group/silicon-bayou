# Silicon Bayou — launch checklist

**Live.** Contract [`0xA81aEd6f3a5Faea95197786ba162e706Fd938d20`](https://robinhoodchain.blockscout.com/address/0xA81aEd6f3a5Faea95197786ba162e706Fd938d20) on Robinhood Chain **4663**. 198/198, URI frozen. **Do not run `deploy:mainnet`.**

Holder-first open source: [HOLDERS.md](HOLDERS.md). Other-computer playbook: [CONTINUE.md](CONTINUE.md). Standing orders: [AGENTS.md](AGENTS.md).

Do not paste `PRIVATE_KEY` into chat. Never commit `.env`.

Official network ([docs](https://docs.robinhood.com/chain/connecting/)):

| | Mainnet | Testnet |
|---|---|---|
| Name | Robinhood Chain | Robinhood Chain Testnet |
| Chain ID | **4663** | 46630 |
| Gas | ETH | ETH |
| Public RPC | `https://rpc.mainnet.chain.robinhood.com` | `https://rpc.testnet.chain.robinhood.com` |
| Explorer | [robinhoodchain.blockscout.com](https://robinhoodchain.blockscout.com) | [explorer.testnet.chain.robinhood.com](https://explorer.testnet.chain.robinhood.com) |
| OpenSea | [opensea.io/collection/silicon-bayou](https://opensea.io/collection/silicon-bayou) | — |

## Top 10

| # | Item | Status | Notes |
|---|---|---|---|
| 1 | Art freeze for launch | **DONE** | Swamp stills 1–198. Do not rewrite `metadata/swamp` on `master`. |
| 2 | Metadata freeze | **DONE** | On-chain `uriFrozen()`. Host is GitHub raw. |
| 3 | IPFS pin | **SKIPPED** | Too late after freeze. GitHub HTTPS is the host. |
| 4 | Robinhood Chain mainnet config | **DONE** | Chain 4663, ETH gas. |
| 5 | Funded deployer | **DONE** | Launch used a dedicated deploy EOA. Rotate ownership next. |
| 6 | Deploy ERC-721 mainnet | **DONE** | `MAX_SUPPLY = 198`. Do not rerun. |
| 7 | Set baseURI | **DONE / frozen** | `metadata/swamp/`. Cannot `setBaseURI` now. |
| 8 | Mint swamp 1–198 | **DONE** | Sold out. |
| 9 | Verify on Blockscout | **DONE** | See [DEPLOYMENT.md](DEPLOYMENT.md). |
| 10 | OpenSea + open source | **LIVE** | Brief holders first, then the public thread. |

## After launch (still open)

- 2-step `transferOwnership` off the deploy EOA ([SECURITY.md](SECURITY.md))
- Sweep leftover deployer gas; never fund `0x9747…`
- Holder-first notice, then public post ([marketing/](marketing/))

## Guards

- `scripts/pin.mjs` and `scripts/deploy.js` refuse to run unless `GENESIS_ART_READY=1`
- BASE_URI containing `generator/out` is rejected
- Never commit `.env`. Never print `PRIVATE_KEY`
- `mint:testers` is disabled. Supply is 198 and sold out
