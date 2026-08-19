# Fleet Operations Board

The live transparency board for the Merged Public fleet, served at
**https://www.mergedpublic.com/fleet/**. This directory is the **canonical
source**; the website repo carries a byte-for-byte vendored copy at
`public/fleet/` (keep them in sync — edit here first).

## What it is

A 1980s-style operations board that shows, in real time, the inner workings
of the credits rail:

| Panel        | Shows                                        | Source |
| ------------ | -------------------------------------------- | ------ |
| **SUPPLY**   | MP / BAYOU / MC figures, escrow, bounty counts | eth_call + Blockscout |
| **DEMAND**   | the work queue — every bounty funded on the BountyBoard | BountyBoard event log |
| **PIPELINE** | Gator Works fleet runs in CI                 | GitHub Actions API |
| **LEDGER**   | every Merged Credit movement, labeled (mint / fund escrow / withdraw) | Blockscout token transfers |

## How it works — the whole point

**There is no backend.** The page is three files — `index.html`,
`board.css`, `board.js` — and the visitor's own browser does all the
reading, directly against public sources:

1. **Robinhood Chain JSON-RPC** (`eth_call`) for live contract state.
   `board.js` builds the calldata by hand (4-byte selector + padded args) so
   you can see exactly what a "web3 library" does underneath.
2. **Blockscout REST API** for indexed history: holder counts, the MC
   transfer feed, and the BountyBoard's raw event log, which the board
   decodes itself from `topics`/`data` using the events' keccak256
   signatures.
3. **GitHub public API** (keyless, ETag-cached) for the fleet's CI runs and
   the `agents/tasks.json` mirror that gives bounties their titles.

Every number on the board links to the contract, transaction, or CI run it
came from. The board **reports; it never pays** — it holds no keys, signs
nothing, and cannot move anything. When the queue is empty it says so.

## Standing language rules (do not soften these when editing)

- MC is **payment for verified work, never for holding**. MC moves only when
  work merges. Never connect credit movement to NFT ownership.
- No yield, APY, returns, price, or lottery language. Ever.
- Bounty settlement today reaches **BAYOU holders only** (the contract
  enforces it). Do not imply MP holders receive MC.
- Not endorsed by Robinhood.
- Every address displayed must exist in `deployments/credits.json` or
  `deployments/merged-public.robinhood.json`.

## Testing

`test/fleet-board.test.js` loads the page into happy-dom, injects `board.js`
with a stubbed `fetch` (canned RPC/Blockscout/GitHub fixtures), runs a full
tick, and asserts the rendered rows. Run with `npm run test:app`.

## Embedding

`index.html?embed` hides the long-form footer and retargets links to
`_top` — this is how the mergedpublic.com homepage embeds the board in an
iframe.
