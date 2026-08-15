# Silicon Bayou — Robinhood Chain launch

**HOLD on art / IPFS / mint.** Two looks are rejected: funky **16-bit pixel** PFPs (`generator/out`) and too-**photoreal cinematic 3D**. Target is **HYBRID** — stylized illustrated / premium painted PFP: readable collectible silhouette from the pixel set + clean lighting/finish from the cinematic set. Not a sprite, not a photo.

Another agent is regenerating `art/gators/*.png` now. Do **not** pin, freeze, or mint until the **user okays** the hybrid set in `art/gators/` and `metadata/images/1.png`–`4.png`. Never ship `generator/out`.

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
| 1 | Art freeze for launch | **HOLD** | Waiting on user-okayed **hybrid** painted PFPs in `art/gators/*.png`. Pixel sprites and photoreal 3D are both rejected. |
| 2 | Metadata freeze | **DONE** (traits) / **HOLD** (images) | Names `Silicon Bayou #N`, class, specialty, stats locked. No yield promises. `image` stays unset/`REPLACE_ME` until hybrid art + pin. |
| 3 | IPFS pin images + metadata | **HOLD** | Guard: `GENESIS_ART_READY=1` required. No pin keys in env. `npm run pin` → `scripts/pin.mjs` (HD `metadata/images/1-4` only). |
| 4 | Robinhood Chain mainnet config | **DONE** | Chain 4663, ETH gas, official RPC/explorer in `hardhat.config.js`, `foundry.toml`, `.env.example`. |
| 5 | Funded deployer wallet | **BLOCKED** | No `.env`, no `PRIVATE_KEY`. Only human step besides hybrid art. See below. |
| 6 | Deploy ERC-721 mainnet | **BLOCKED** | Compile path ready: `npm run compile` then `npm run deploy:mainnet`. Guarded until `GENESIS_ART_READY=1` + funded key. |
| 7 | Set baseURI | **BLOCKED** | `npm run set-base-uri` after pin. |
| 8 | Mint genesis 1–4 | **HOLD** | Same guard. Tokens 1–4 = Engineering / Testing / Construction / Capital. |
| 9 | Verify on Blockscout | **BLOCKED** | After deploy: `forge verify-contract <addr> contracts/SiliconBayou.sol:SiliconBayou --chain-id 4663 --verifier blockscout --verifier-url https://robinhoodchain.blockscout.com/api/` |
| 10 | OpenSea + testers | **BLOCKED** | After deploy: `https://opensea.io/item/robinhood/<addr>/1` and `https://opensea.io/assets/robinhood/<addr>`. Testers in `testers/fixtures.json` are still placeholders. |

**Live links:** none yet (no contract address).

## Only remaining human steps

1. **Hybrid art** — user okays stylized illustrated / premium painted PFPs (not sprite, not photo). Drop them in `art/gators/*.png` and copy to `metadata/images/1.png`–`4.png`. Then `$env:GENESIS_ART_READY="1"`.
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
