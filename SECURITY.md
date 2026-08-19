# Silicon Bayou — security

Engineering bar: least privilege, fail-safe defaults, tested gates, no unaudited god-keys, zero-trust at the edges. This is a discipline claim, not a claim that we run SpaceX classified systems.

**Never paste `PRIVATE_KEY` into chat, tickets, or commits.** Keys live in `.env` only (gitignored).

Target chain: **Robinhood Chain mainnet, chain ID 4663** (testnet 46630). Gas is ETH.

## Threat model

| Threat | What it looks like | Mitigation |
|---|---|---|
| NFT metadata swap | Owner (or stolen owner key) points `baseURI` at different art / phishing JSON | `setBaseURI` then **`freezeURI`** — irreversible. Do this after IPFS pin. OpenSea attributes stay in pinned JSON. |
| Stolen owner key | Attacker mints, pauses, changes royalty, settles bounties | **Ownable2Step** (no instant transfer). Production owner should be a **Gnosis Safe** (or equivalent multisig), not a hot EOA. Rotate via 2-step (below). Owner key remains the nuclear residual risk until then. |
| Reentrancy | Receiver hook during `_safeMint` or ERC-20 callback during bounty withdraw | Checks-effects-interactions; `nextTokenId` updated **before** mint loop; `ReentrancyGuard` on mint / fund / withdraw; pull-over-push for credits. |
| Fake OpenSea / fake site | Phishing collection or lookalike gallery | Official address is [`0xA81aEd6f3a5Faea95197786ba162e706Fd938d20`](https://robinhoodchain.blockscout.com/address/0xA81aEd6f3a5Faea95197786ba162e706Fd938d20) on chain **4663** — also in `deployments/robinhood.json` and README. Verify on [Blockscout](https://robinhoodchain.blockscout.com). Never trust a link that asks you to “approve” the NFT to a stranger. |
| Client-side payout lie | Wallet or page reports a balance / “you won” | Gallery never pays. Bounty withdraw is on-chain pull by `msg.sender`. UI must not treat client-reported balances as settlement. Wallet connect must check `chainId === 4663` (or 46630 on testnet). |
| Unbounded mint | Stolen owner key prints tokens forever | **`MAX_SUPPLY = 198`**. `mint` / `mintBatch` revert past 198. |
| Unbounded work | Huge `mintBatch` | `MAX_BATCH = 33`. Owner-only. Supply already minted out at 198. |
| Instant ownership foot-gun | `transferOwnership` to a typo / contract that cannot accept | Ownable2Step: pending owner must `acceptOwnership`. Cannot `renounceOwnership` until URI is frozen. |
| Upgrade god-mode | Transparent / UUPS proxy with admin key | **Rejected.** Contracts are immutable implementations. |
| `tx.origin` auth | Phishing contract tricks an EOA | Not used. Authorization is `msg.sender` only. |
| GitHub issue XSS | Rendering untrusted issue titles with `innerHTML` | Gallery titles are hardcoded. If a future page fetches GitHub, escape before insert. External links use `rel="noopener noreferrer"`. |

Out of scope for this MVP: public sale, bridges, KYC, staking, yield. Do not add them here.

## Contract controls

`SiliconBayou` (ERC-721 + ERC-2981):

- Owner-only `mint` / `mintBatch` / `setBaseURI` / `freezeURI` / `pause` / royalty
- **`MAX_SUPPLY = 198`**. `mint` / `mintBatch` revert past 198.
- `Pausable` emergency stop on mint **and** transfer
- Royalty capped at **10%** (`MAX_ROYALTY_BPS = 1000`)
- Events: `Minted`, `BatchMinted`, `BaseURISet`, `URIFrozen`, `RoyaltyUpdated`, plus OZ pause / ownership events

`BountyBoard`:

- Immutable `credit` (MC) and `bayou` (live BAYOU ERC-721)
- Owner funds; owner **or** oracle settles; **first settle wins**
- Settle and `withdraw` require `bayou.balanceOf(account) > 0` — gators need MC; wallets without a gator cannot pull
- Winner **pulls** via `withdraw` (CEI + `nonReentrant`)
- Pause stops fund / settle / withdraw

`MergedCredit`: Ownable2Step + pause on mint/transfer. Owner can still mint credits — treat that key like cash.

`AccessDesk`:

- Canonical USDG in; `takeBps` locked to **20–40%** community pool, remainder to `treasury`
- MC payments go 100% to treasury (credits are not cash)
- `grantFromPool` is owner-only, one recipient — **not** a BAYOU `ownerOf` snapshot, not APY
- Pause stops `payUsdg` / `payCredit`

No delegatecall to untrusted targets. No upgradeable proxy.

## Rotate owner (2-step)

1. Current owner calls `transferOwnership(newOwner)` — typically a Gnosis Safe on chain 4663.
2. Confirm `owner()` is still the old address and `pendingOwner()` is the Safe.
3. Safe (or new EOA) calls `acceptOwnership()`.
4. Update royalty receiver if it should follow the new owner: `setDefaultRoyalty(safe, bps)` (bps ≤ 1000).
5. If the old key might be exposed, treat it as burned. Do not reuse it.

Cancel a bad transfer by calling `transferOwnership(address(0))` before accept.

## Operational rules for the live contracts (2026-08 audit)

The five deployed contracts (BAYOU, MergedCredit, BountyBoard, AccessDesk,
MergedPublic) are immutable, so these are runbook law, not code:

- **`renounceOwnership` is never called. On any contract.** SiliconBayou's URI is
  already frozen, so its only renounce guard is satisfied — `pause()` +
  `renounceOwnership()` would freeze every holder's transfers forever.
  MergedCredit/BountyBoard/AccessDesk inherit one-step renounce unguarded:
  renouncing MC while paused bricks all credit movement (escrow included);
  renouncing AccessDesk strands the community pool permanently. Future deploys
  carry MergedPublic's `PausedRenounce`-style guard (or revert outright).
- **Voiding a bounty:** BountyBoard has no `cancel()`. To void a dead bounty,
  the owner settles it to the operator wallet and records it as a cancellation
  in the off-chain ledger so the synthetic `Settled` event is never counted as
  work. Fund only issues that are expected to settle. Future deploys add
  `cancel(issueId)` (owner-only, unsettled-only, refund + event).
- **Winners keep a gator until they withdraw.** `withdraw()` re-checks gator
  ownership; selling the last gator before withdrawing strands the MC with no
  recovery path.
- **issueId namespace:** bounty keys are a flat uint256. Before Gator Works
  spans a second repo, derive `issueId = uint256(keccak256(repoFullName,
  issueNumber))` in fund/settle scripts and record the mapping in
  `agents/tasks.json` — raw issue numbers collide across repos.
- **USDG is an upgradeable third-party proxy.** AccessDesk splits on the
  nominal amount, so a future fee-on-transfer upgrade would silently drain the
  community pool; a blocklisted treasury halts `payUsdg` until `setTreasury`.
  Watch USDG proxy-upgrade events; `setTreasury` is the escape hatch.
- **The deployer sweep is permanently retired.** The old deployer key
  `0xBA98…aa71` is lost (confirmed 2026-08-19, no copy exists); its ~0.0023
  ETH is written off. `sweep-deployer.mjs` refuses to sign with any other key
  by design — `.env` legitimately holds a different role's key (the Merged
  Public deployer). A lost key that owns nothing is a closed risk.

## Freeze URI at deploy

Launch metadata is GitHub HTTPS (`metadata/swamp/{id}.json`). `freezeURI()` already ran after minting 1–198. There is no unfreeze. Do not rewrite those JSON/PNG files on `master` — OpenSea follows GitHub raw even though the contract URI is frozen.

Do **not** pin or mint a second collection from `generator/out`.

## Production owner

Use a **Gnosis Safe** (or comparable multisig) as `owner` after deploy. A single EOA is an unaudited god-key: mint, pause, settle, royalty, and (until freeze) metadata.

Recommend: 2-step transfer from the deploy EOA to a Safe (or the operator EOA if Safe UI still lacks chain 4663) → keep pause on the Safe only as break-glass. URI is already frozen.

## App / gallery (zero-trust edges)

- No secrets in the repo. `.env` is gitignored.
- Wallet connect (if used) must verify chain ID **4663** / **46630**. Never trust client-reported balances for payouts.
- Static gallery: `rel="noopener noreferrer"` on external links; no `innerHTML` of untrusted GitHub titles.
- Local `npm run gallery` can send CSP / nosniff headers via `serve.json`. GitHub Pages does not; HTML `Content-Security-Policy` meta is the fallback.
- **SIWE / auth:** none in this repo. If added later, bind `domain`, `uri`, `chainId` (4663), and a server-issued nonce. Reject foreign domains.

## Security gate (before `deploy:mainnet`)

```powershell
npm test
npm run security
# optional, if forge is on PATH:
forge test
```

Do not deploy if either npm command fails. Do not mint in a “hardening” change. Do not weaken `GENESIS_ART_READY`.

`npm run security` (solhint + Hardhat) is the required gate. Slither is not bundled (Python / extra install). Foundry tests in `test/*.t.sol` are optional and need `forge-std` (`forge install foundry-rs/forge-std`); `lib/` is gitignored, so Hardhat is what CI and deployers run.

## Residual risks

- **Owner key is still nuclear** until it is a Safe (and preferably until URI is frozen).
- ERC-2981 is a signal; marketplaces may ignore royalties.
- IPFS pins can vanish if the pin provider drops the CID — keep a second pin.
- No formal third-party audit. Tests are the gate, not a substitute for review before mainnet value.
- Oracle (if set) can settle bounties; treat that key as privileged.
- `MergedCredit` owner can mint arbitrary credits.
- The operator wallet holds an **unlimited USDG allowance to the shared
  Seaport conduit** `0x963f00d3ff000064ffcba824b800c0000000c300`
  (marketplace listing setup, 2026-08 audit finding; **re-verified live
  on-chain 2026-08-19** — the wallet's USDG balance is currently 0, so this
  is a standing trap for future income, not a live loss): a conduit-operator
  compromise drains the wallet's full USDG with no further signature.
  Revoke with `node scripts/revoke-usdg-conduit.mjs` (read-only report by
  default; `--revoke` signs with `OPERATOR_PRIVATE_KEY`) or manually via the
  Blockscout token write tab (`approve(conduit, 0)`); treat every Seaport
  signature on this wallet as treasury-critical. A second 2026-08 approval
  (117.5 USDG to `0xb477…4af3`) was checked at the same time and is already
  back at zero — no action needed.
- The retired BAYOU deployer key (`0xBA98…aa71`) and the original census-gate
  Cloudflare login (gdozier110) are both lost. Neither controls anything
  (contracts rotated; worker migrated to the DTG account 2026-08-19), so both
  are closed risks — documented here so nobody hunts for them.
