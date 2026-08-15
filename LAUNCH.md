# Silicon Bayou — Robinhood Chain launch

**Hybrid stills are the genesis freeze.** Two looks stay rejected: funky **16-bit pixel** PFPs (`generator/out`) and too-**photoreal cinematic 3D**. Target is **HYBRID** — stylized illustrated / premium painted PFP.

Stills: `art/gators/*-gator.png` → `metadata/images/1.png`–`4.png`. Living portraits are HTML loops (`animation_url`), not a 10k pixel drop. Never ship `generator/out`.

Set `$env:GENESIS_ART_READY="1"` locally, then pin and deploy. Do not paste `PRIVATE_KEY` into chat.

Official network ([docs](https://docs.robinhood.com/chain/connecting/)):

| | Mainnet | Testnet |
|---|---|---|
| Name | Robinhood Chain | Robinhood Chain Testnet |
| Chain ID | **4663** | 46630 |
| Gas | ETH | ETH |
| Public RPC | `https://rpc.mainnet.chain.robinhood.com` | `https://rpc.testnet.chain.robinhood.com` |
| Explorer | [robinhoodchain.blockscout.com](https://robinhoodchain.blockscout.com) | [explorer.testnet.chain.robinhood.com](https://explorer.testnet.chain.robinhood.com) |
| OpenSea | [collections/chain/robinhood](https://opensea.io/collections/chain/robinhood) | — |

Alchemy (production RPC): `https://robinhood-mainnet.g.alchemy.com/v2/{API_KEY}`.

## Top 10

| # | Item | Status | Notes |
|---|---|---|---|
| 1 | Art freeze for launch | **DONE** (stills) | Hybrid painted PFPs frozen as genesis stills. Calm HTML loops are `animation_url`. |
| 2 | Metadata freeze | **DONE** (traits) / **HOLD** (CIDs) | Names `Silicon Bayou #N`, class, specialty, stats locked. `image` / `animation_url` get CIDs at pin. |
| 3 | IPFS pin images + metadata | **BLOCKED** | Guard passed with `GENESIS_ART_READY=1`. No pin key in env. Interim: GitHub raw metadata URL after Pages push. |
| 4 | Robinhood Chain mainnet config | **DONE** | Chain 4663, ETH gas, official RPC/explorer in `hardhat.config.js`, `foundry.toml`, `.env.example`. |
| 5 | Funded deployer wallet | **BLOCKED** | No `.env`, no `PRIVATE_KEY`. Human step. |
| 6 | Deploy ERC-721 mainnet | **BLOCKED** | Compile + `npm test` + `npm run security` pass. Needs funded key + pin. |
| 7 | Set baseURI | **BLOCKED** | `npm run set-base-uri` after pin. |
| 8 | Mint genesis 1–4 | **HOLD** | Same guard. Tokens 1–4 = Engineering / Testing / Construction / Capital. |
| 9 | Verify on Blockscout | **BLOCKED** | After deploy: `forge verify-contract <addr> contracts/SiliconBayou.sol:SiliconBayou --chain-id 4663 --verifier blockscout --verifier-url https://robinhoodchain.blockscout.com/api/` |
| 10 | OpenSea + testers | **BLOCKED** | After deploy: `https://opensea.io/item/robinhood/<addr>/1` and `https://opensea.io/assets/robinhood/<addr>`. Testers in `testers/fixtures.json` are still placeholders. |

**Live links:** none yet (no contract address).

## Only remaining human steps

1. **Art** — hybrid stills are frozen. `$env:GENESIS_ART_READY="1"` then `node scripts/copy-genesis-stills.mjs`.
2. **Funded wallet** — create/export a deployer locally (do not paste the key into chat):

```powershell
copy .env.example .env
# Set PRIVATE_KEY in .env only.
# Add Robinhood Chain in the wallet: chain ID 4663, RPC https://rpc.mainnet.chain.robinhood.com, symbol ETH
# Bridge ETH: https://docs.robinhood.com/chain/connecting/
npm run wallet
```

3. **Optional pin key** — one of `PINATA_JWT` / `NFT_STORAGE_KEY` / `WEB3_STORAGE_TOKEN` / `LIGHTHOUSE_API_KEY`, then `npm run pin`.
4. **Go live**

```powershell
npm test
npm run security
npm run compile
npm run deploy:mainnet
# if BASE_URI was empty at deploy:
npm run set-base-uri
npm run freeze-uri
npx hardhat verify --network robinhood <CONTRACT_ADDRESS> "<BASE_URI>"
```

`npm test` / `npm run security` is the gate. Do not skip it. See [SECURITY.md](SECURITY.md). Do not weaken `GENESIS_ART_READY`.

5. **OpenSea** — open the explorer + `https://opensea.io/item/robinhood/<addr>/1`. Replace tester placeholders in `testers/fixtures.json`, then `npm run mint:testers` if you want extras.

## Guards

- `scripts/pin.mjs` and `scripts/deploy.js` / `mint-genesis.js` refuse to run unless `GENESIS_ART_READY=1`.
- BASE_URI containing `generator/out` is rejected.
- Never commit `.env`. Never print `PRIVATE_KEY`.
