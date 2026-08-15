# Phase 0 launch checklist

Execute in order. Do not skip ahead to mint or OpenSea.

**Status:** no address in `deployments/`. Metadata `image` fields are still `ipfs://REPLACE_ME/N.png`. There is no live BAYOU contract until step 6 succeeds.

`scripts/deploy.js` deploys `SiliconBayou` and **mints tokens 1–4 in the same run**. Prefer a real `BASE_URI` in `.env` before mainnet deploy.

| # | Do this | Done when |
|---|---------|-----------|
| 1 | Freeze 4 HD gators | `art/gators/*.png` and `metadata/images/1.png`–`4.png` are the ship portraits — not `generator/out` JPGs |
| 2 | Freeze metadata JSON | `metadata/1.json`–`4.json` attributes locked; only `image` CIDs may change |
| 3 | Pin images, then JSON, to IPFS | Images folder CID + JSON folder CID. Each `image` is `ipfs://<IMAGES_CID>/N.png`. JSON CID root has `1.json`…`4.json` |
| 4 | Mainnet RPC | `.env` → `RPC_URL=https://rpc.mainnet.chain.robinhood.com` (or Alchemy mainnet). Chain ID **4663**. Gas is ETH |
| 5 | Fund deployer | Wallet on Robinhood mainnet has ETH. `PRIVATE_KEY` in `.env` only — never commit, never print |
| 6 | Deploy BAYOU | `npm run deploy:mainnet` (rehearse: testnet RPC + `npm run deploy:testnet`, chain ID **46630**). Save the printed address to `deployments/` |
| 7 | Set base URI | `BASE_URI=ipfs://<JSON_CID>/` (trailing slash). If deploy used `REPLACE_ME`, owner calls `setBaseURI` |
| 8 | Mint 1–4 | Already done by step 6. Confirm `tokenURI(1)` and `nextTokenId == 5` |
| 9 | Verify | [robinhoodchain.blockscout.com](https://robinhoodchain.blockscout.com) — constructor arg must match the deployed `BASE_URI` |
| 10 | OpenSea + testers | OpenSea → Robinhood Chain → contract address. Send 2–3 people `TESTERS.md` |

## Commands

```powershell
cd C:\Users\gdozi\Projects\silicon-bayou
copy .env.example .env
npm install
npm test
npm run gallery
# .env RPC_URL = testnet public RPC, then:
npm run deploy:testnet
# .env RPC_URL = mainnet public RPC (or Alchemy), BASE_URI = ipfs://<JSON_CID>/, then:
npm run deploy:mainnet
```

If you deployed with a placeholder URI:

```powershell
npx hardhat console --network robinhood
# const nft = await ethers.getContractAt("SiliconBayou", "<address>")
# await (await nft.setBaseURI("ipfs://<JSON_CID>/")).wait()
```

Verify (plugin not installed by default):

```powershell
npx hardhat verify --network robinhood <CONTRACT_ADDRESS> "ipfs://<JSON_CID>/"
```

Or paste address + source on Blockscout.

## Do not

- Ship, pin, or mint `generator/` pixel JPGs (paused; look rejected).
- Invent a contract address.
- Commit `.env` or print `PRIVATE_KEY`.
- Force-push or edit git config.
- Build SBIR, staking, 10k drop, KYC, or fake bridges.
