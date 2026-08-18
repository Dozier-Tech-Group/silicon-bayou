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

## Deploy (separate from BAYOU — already done)

The desk is **live on 4663** since 2026-08-18: AccessDesk [`0x7EEc6e95179B8ae86CEbA24025ae35BaDbf0d4e9`](https://robinhoodchain.blockscout.com/address/0x7EEc6e95179B8ae86CEbA24025ae35BaDbf0d4e9), deployed alongside MC and the BountyBoard. Record: `deployments/credits.json`. Take is 30% (`takeBps = 3000`); treasury is the operator wallet.

Do **not** run `deploy:mainnet` (that is BAYOU, live) and do **not** rerun `deploy:bounty:mainnet` — a rerun makes a second, unofficial desk. Trust only the addresses in `deployments/credits.json`.
