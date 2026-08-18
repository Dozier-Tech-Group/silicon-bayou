# Commercial access desk

Compiled public-records work on [mergedpublic.com/census](https://www.mergedpublic.com/census/) is the asset AIs actually want. This desk is how commercial use is paid — **not** a yield farm on BAYOU.

## Money flow

```text
AI / crawler pays USDG
        │
        ▼
   AccessDesk.payUsdg
        │
        ├── takeBps (20–40%) → community pool (stays on the desk)
        └── remainder        → operating treasury
```

- Canonical USDG on Robinhood 4663: `0x5fc5360D0400a0Fd4f2af552ADD042D716F1d168`
- Do **not** use unofficial “USDC” tokens on the explorer
- `grantFromPool` is a human grant. It does not snapshot gators. It is not APY
- MC (`payCredit`) is the gator meter; credits go to treasury, not the cash pool

## Deploy (separate from BAYOU)

BAYOU is already live. Do not run `deploy:mainnet`.

```powershell
npm test
npm run security
npm run deploy:bounty:testnet
npm run deploy:bounty:mainnet
```

Writes `deployments/credits.json`. Default take is 30% (`ACCESS_TAKE_BPS=3000`). Treasury defaults to `MINT_TO`.
