# Silicon Bayou generator

**PAUSED.** Do not generate, do not run `--count 10000`, do not paint more pixel layers. The pixel-art look was rejected — the drop needs **HD, clean, beautiful** hero art, each one a work of art. Another agent is remaking the four originals in `art/gators/`. This compositor waits on those HD bases (and matching HD overlays) before any further batch.

---

Trait-layer compositor for up to **10,000 unique** square gator JPGs. No image model is called per token — layers are painted once, then stacked.

## Quick start (PowerShell)

```powershell
cd C:\Users\gdozi\Projects\silicon-bayou
python -m pip install -r generator/requirements.txt
python generator/generate.py --count 96
python -m http.server 4174 --directory generator
```

Open [http://localhost:4174/preview.html](http://localhost:4174/preview.html).

| Command | What you get |
|---|---|
| `python generator/generate.py --count 96` | Review batch (default size **512×512** JPG, quality 92) |
| `python generator/generate.py --count 1000` | Bigger look |
| `python generator/generate.py --count 10000` | Full drop |
| `python generator/generate.py --count 96 --hires` | **1024×1024** |
| `python generator/generate.py --count 96 --rebuild-layers` | Repaint trait PNGs, then composite |
| `python generator/generate.py --count 96 --seed 4663` | Deterministic (4663 is the config default) |

Each run wipes `generator/out/` and writes a fresh set. DNA is unique within the run; collisions retry. Seed is deterministic.

## Output

```text
generator/out/images/{id}.jpg
generator/out/metadata/{id}.json
generator/out/index.json          # catalog + trait frequencies
generator/samples/1.jpg …         # first 8 copies, safe to commit
```

OpenSea attributes include **Class**, **Region**, **Specialty**, each layer, and numeric Engineering / Testing / Construction / Capital scores.

`generator/out/` is gitignored (10k binaries are huge). Keep a handful of JPGs in `generator/samples/`.

## Layer math

Default config: **8 backgrounds × 6 bodies × 4 classes × 8 headgear × 8 tools × 6 extras = 73,728** unique DNA — enough for 10,000.

Layer order: Background → Body → Class kit → Extra → Headgear → Tool.

## Add a new trait

1. Drop a **128×128 transparent PNG** in the matching folder (`generator/layers/background`, `body`, `class`, `headgear`, `tool`, `extra`). Same camera / silhouette as the existing body.
2. Add an entry to that layer in `generator/config.json` (`id`, `name`, `weight`, `file`).
3. Rerun `python generator/generate.py --count 96`.

To invent more art in Python instead of a PNG editor, add a painter in `paint_layers.py` and run with `--rebuild-layers`.

See [SKILL.md](SKILL.md) for the short agent recipe.

## Full OpenSea set later

1. Generate the drop: `python generator/generate.py --count 10000 --hires` (or 512 if you want it faster).
2. Upload `generator/out/images/` to IPFS. Note the folder CID.
3. Rewrite each `generator/out/metadata/{id}.json` `image` field to `ipfs://<IMAGES_CID>/{id}.jpg`.
4. Upload the JSON files so `1.json` … `10000.json` sit at the CID root.
5. Point the ERC-721 `BASE_URI` at `ipfs://<JSON_CID>/` via `setBaseURI`. Do not change the contract for this preview pipeline.

Phase 0 tokens 1–4 in `metadata/` stay the hand-finished originals. This folder is the generative collection path.

## Preview

`generator/preview.html` — class filter, thumbnail grid, click-for-traits, rarity bars. Serve the `generator/` directory (not the repo root) so `out/index.json` resolves.
