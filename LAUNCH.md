# Silicon Bayou — Robinhood Chain launch

**Hybrid stills are the genesis freeze.** Two looks stay rejected: funky **16-bit pixel** PFPs (`generator/out`) and too-**photoreal cinematic 3D**. Target is **HYBRID** — stylized illustrated / premium painted PFP.

Stills: `art/gators/*-gator.png` → `metadata/images/1.png`–`4.png`. Living portraits are HTML loops (`animation_url`). Never ship `generator/out`.

**Another computer?** Start at [CONTINUE.md](CONTINUE.md). System prompt: [AGENT_IMPLEMENT.md](AGENT_IMPLEMENT.md).

Do not paste `PRIVATE_KEY` into chat.

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
| 1 | Art freeze for launch | **DONE** | Hybrid painted PFPs frozen as genesis stills. Calm HTML loops are `animation_url`. |
| 2 | Metadata freeze | **DONE** (interim host) | Traits locked. `image` = GitHub raw PNG. `animation_url` = GitHub Pages HTML. IPFS optional later (cannot retarget after `freezeURI`). |
| 3 | IPFS pin | **SKIPPED for launch** | No pin key. GitHub HTTPS is the frozen host. |
| 4 | Robinhood Chain mainnet config | **DONE** | Chain 4663, ETH gas, official RPC/explorer. |
| 5 | Funded deployer wallet | **PARTIAL** | Throwaway deployer `0xBA98…aa71` needs native ETH on 4663. `MINT_TO` is `0x29486…D11d`. Do not send to `0x9747…`. |
| 6 | Deploy ERC-721 mainnet | **READY** (blocked on gas) | `MAX_SUPPLY = 198`. `deploy.js` mints 1–198 and freezes URI. Gate: `npm test` + `npm run security` + `npm run wallet`. |
| 7 | Set baseURI | **BAKED IN** | Constructor uses GitHub raw `metadata/swamp/`. Do not `setBaseURI` after deploy — freeze is in the same script. |
| 8 | Mint swamp 1–198 | **READY** (same script) | Pixel swamp gators from `art/swamp-222/`. `MINT_TO=0x29486Fc6B2E7184Dd4aF4d310D4f85F4262fD11d`. |
| 9 | Verify on Blockscout | **BLOCKED** | After deploy. |
| 10 | OpenSea + testers | **BLOCKED** | After deploy. Do **not** mint extras (`MAX_SUPPLY` is 198). |

**Live links:** none yet (no contract address). Do not invent one.

## Go live on this machine or the next

```powershell
copy .env.example .env
# Set PRIVATE_KEY locally for 0x97471f8Aa113aF7043B599Ccfb1702F2F78CF8a5
# GENESIS_ART_READY=1
# BASE_URI=https://raw.githubusercontent.com/Dozier-Tech-Group/silicon-bayou/master/metadata/
# MINT_TO=0x97471f8Aa113aF7043B599Ccfb1702F2F78CF8a5
npm test
npm run security
npm run wallet
npm run deploy:mainnet
```

`npm test` / `npm run security` is the gate. Do not skip it. See [SECURITY.md](SECURITY.md). Do not weaken `GENESIS_ART_READY`.

After a real address exists: write it to `deployments/robinhood.json` + README, push (**not** `.env`), then open Blockscout + OpenSea.

Then 2-step `transferOwnership` to a **Gnosis Safe**. EOA owner is the remaining nuclear risk.

## Guards

- `scripts/pin.mjs` and `scripts/deploy.js` refuse to run unless `GENESIS_ART_READY=1`.
- BASE_URI containing `generator/out` is rejected.
- Never commit `.env`. Never print `PRIVATE_KEY`.
- `mint:testers` is disabled. Supply is 4.
