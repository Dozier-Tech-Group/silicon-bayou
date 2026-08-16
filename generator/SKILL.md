# Skill: invent Silicon Bayou traits and regenerate

**PAUSED.** Do not run `generate.py` or add pixel layers. Wait for HD hero art in `art/gators/`.

Stay in `generator/`. Do not edit `gallery/index.html` or the ERC-721.

## Recipe

1. Open `config.json` and `layers/` so you know the current DNA space (need ≥10,000 unique combos).
2. Invent **original** Louisiana / Gator Parish traits only. No Bored Ape copies, no LSU marks, no third-party logos.
3. Keep the same 128×128 camera: gator bust, facing right, transparent PNG.
4. Either:
   - Draw a new painter in `paint_layers.py` and run `python generator/generate.py --rebuild-layers --count 48`, or
   - Drop a PNG in the right `layers/` folder and add `{id, name, weight, file}` to that layer in `config.json`.
5. Weights are relative rarity. Lower weight = rarer.
6. Preview at `http://localhost:4174/preview.html` (serve `generator/`).
7. If the silhouette drifts, fix the painter — do not call an image model 10k times.

## Full drop

```powershell
python generator/generate.py --count 10000
```

Then follow README for IPFS + `setBaseURI`.
