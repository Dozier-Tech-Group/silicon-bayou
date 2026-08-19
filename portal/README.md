# portal/ — the data spine of the build portal

This directory is the data behind the build transparency portal at
[mergedpublic.com/build](https://www.mergedpublic.com/build). The website
fetches these files over `raw.githubusercontent.com` — **these files are the
public record**, not a copy of one. The project runs on Robinhood Chain
(chain ID 4663, gas in ETH). Not endorsed by Robinhood.

## Who updates this

Build sessions do. Every file carries an `updated` date and a note saying so.
Nothing here is a live feed; when a page renders these numbers it labels them
**"updated by build sessions"**, because that is what they are.

## The honesty rules (house law)

1. **Every number is traceable to a public source** — a file in this repo, a
   GitHub API response, or an on-chain record. If a figure can't cite its
   source, it doesn't ship.
2. **Absence of data renders as "no data"** — never as zero, never as a
   made-up figure.
3. **Nothing is presented as automatic or live if it is session-updated.**
   Session-updated data is labeled as such.

## Files and schemas

Both repos (this one and the website) follow these shapes exactly.

### `status.json` — lane-by-lane build status

```json
{
  "updated": "YYYY-MM-DD",
  "note": "Updated by build sessions from the repo records it cites — not a live feed.",
  "lanes": [
    {
      "id": "bayou | credits | mp | game | site",
      "name": "human name",
      "status": "short human string",
      "summary": "one sentence",
      "record": { "label": "the source file", "url": "where it lives" },
      "phases": [
        {
          "id": "phase id",
          "name": "phase name",
          "state": "done | in-progress | todo | blocked",
          "gate": "the gate condition as one sentence",
          "note": "optional"
        }
      ]
    }
  ]
}
```

`phases` is optional — only lanes with a phased runbook (Merged Public follows
[MP-REVEAL.md](../MP-REVEAL.md)) carry it. Every lane's `record` link points at
the real file this repo keeps as its record of truth.

### `fleets.json` — the agent fleets, standing and launched

```json
{
  "updated": "YYYY-MM-DD",
  "note": "one sentence explaining what a fleet is",
  "standing": [
    {
      "id": "slug",
      "name": "human name",
      "role": "what it does",
      "status": "active | dormant | blocked",
      "detail": "why it is in that state"
    }
  ],
  "runs": [
    {
      "id": "slug",
      "date": "YYYY-MM-DD",
      "name": "human name",
      "mission": "one sentence",
      "agents": [ { "role": "...", "brief": "..." } ],
      "status": "running | done",
      "outcomes": [ "strings — empty while running" ],
      "links": [ { "label": "...", "url": "..." } ]
    }
  ]
}
```

`outcomes` stays an empty array while a run is `running` — outcomes are
recorded when they exist, not predicted.

### `../letters/index.json` — the letters

Letters live in `letters/` at the repo root; this index lists them newest
first:

```json
{
  "letters": [
    {
      "slug": "slug",
      "file": "letters/<slug>.md",
      "title": "title",
      "date": "YYYY-MM-DD",
      "author": "author",
      "summary": "one or two sentences"
    }
  ]
}
```

## Feature requests

Intake is GitHub issues on this repo using the **feature-request** issue form
(label `feature-request`). Demand signal is thumbs-up reactions on the issue.
Lifecycle labels: `triaged`, `funded` (backed by a funded BountyBoard bounty),
`shipped`, `declined`.

---

Standing language, unchanged here as everywhere in this repo: tokens are
cryptographic identity, not legal contracts or securities; no yield, no APY,
no returns; game rewards are recognition and access only.
