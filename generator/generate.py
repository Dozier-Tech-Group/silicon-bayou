"""
Silicon Bayou generative drop — trait layers + compositor.

  python generator/generate.py --count 96
  python generator/generate.py --count 1000
  python generator/generate.py --count 10000
  python generator/generate.py --count 96 --hires
"""

from __future__ import annotations

import argparse
import json
import random
import shutil
import sys
from collections import Counter, defaultdict
from datetime import datetime, timezone
from pathlib import Path

from PIL import Image

ROOT = Path(__file__).resolve().parent
if str(ROOT) not in sys.path:
    sys.path.insert(0, str(ROOT))
REPO = ROOT.parent
CONFIG_PATH = ROOT / "config.json"
LAYERS = ROOT / "layers"
OUT = ROOT / "out"
SAMPLES = ROOT / "samples"

CLASS_SCORES = {
    "Engineering": {
        "Engineering": (82, 97),
        "Testing": (34, 56),
        "Construction": (26, 48),
        "Capital": (20, 42),
    },
    "Testing": {
        "Engineering": (34, 56),
        "Testing": (84, 98),
        "Construction": (30, 52),
        "Capital": (22, 44),
    },
    "Construction": {
        "Engineering": (30, 52),
        "Testing": (34, 56),
        "Construction": (84, 98),
        "Capital": (24, 46),
    },
    "Capital": {
        "Engineering": (22, 44),
        "Testing": (26, 48),
        "Construction": (22, 42),
        "Capital": (86, 99),
    },
}

CLASS_BLURB = {
    "Engineering": "wired for software and electrical systems",
    "Testing": "built for QA, safety, and verification",
    "Construction": "built for site work and field construction",
    "Capital": "dressed for project finance and investment",
}

SPECIALTY = {
    "Engineering": {
        "soldering_iron": "Software & Electrical Systems",
        "tablet": "Systems Architecture",
        "wrench": "Hardware Integration",
        "default": "Software & Electrical Systems",
    },
    "Testing": {
        "clipboard": "Inspection & Quality Assurance",
        "tablet": "Field Verification",
        "survey_pole": "Site Measurement",
        "default": "Inspection & Quality Assurance",
    },
    "Construction": {
        "wrench": "Field Construction & Welding",
        "survey_pole": "Site Layout",
        "clipboard": "Job-Site Coordination",
        "default": "Field Construction & Welding",
    },
    "Capital": {
        "ledger": "Project Finance & Investment",
        "tablet": "Deal Operations",
        "cafe_au_lait": "Relationship Capital",
        "default": "Project Finance & Investment",
    },
}


def load_config() -> dict:
    return json.loads(CONFIG_PATH.read_text(encoding="utf-8"))


def ensure_layers(force: bool = False) -> None:
    from paint_layers import build_all

    build_all(force=force)


def pick_weighted(rng: random.Random, traits: list[dict]) -> dict:
    weights = [max(0, t.get("weight", 1)) for t in traits]
    return rng.choices(traits, weights=weights, k=1)[0]


def combo_dna(picks: dict[str, dict]) -> str:
    return "|".join(f"{layer}:{picks[layer]['id']}" for layer in picks)


def roll_scores(rng: random.Random, class_name: str) -> dict[str, int]:
    out = {}
    for key, (lo, hi) in CLASS_SCORES[class_name].items():
        out[key] = rng.randint(lo, hi)
    return out


def specialty_for(class_name: str, tool_id: str) -> str:
    table = SPECIALTY[class_name]
    return table.get(tool_id, table["default"])


def load_layer_images(cfg: dict) -> dict[str, dict[str, Image.Image]]:
    cache: dict[str, dict[str, Image.Image]] = {}
    for layer in cfg["layers"]:
        folder = layer["folder"]
        cache[layer["id"]] = {}
        for trait in layer["traits"]:
            path = LAYERS / folder / trait["file"]
            if not path.exists():
                raise FileNotFoundError(f"Missing layer PNG: {path}")
            cache[layer["id"]][trait["id"]] = Image.open(path).convert("RGBA")
    return cache


def composite(picks: dict[str, dict], images: dict, size: int) -> Image.Image:
    order = ["background", "body", "class_kit", "extra", "headgear", "tool"]
    canvas = Image.new("RGBA", images["background"][picks["background"]["id"]].size, (0, 0, 0, 0))
    for key in order:
        canvas.alpha_composite(images[key][picks[key]["id"]])
    if canvas.size[0] != size:
        canvas = canvas.resize((size, size), Image.Resampling.NEAREST)
    return canvas.convert("RGB")


def token_metadata(cfg: dict, token_id: int, picks: dict[str, dict], dna: str, scores: dict[str, int], image_name: str) -> dict:
    class_name = picks["class_kit"]["name"]
    spec = specialty_for(class_name, picks["tool"]["id"])
    attrs = [
        {"trait_type": layer["trait_type"], "value": picks[layer["id"]]["name"]}
        for layer in cfg["layers"]
    ]
    attrs.insert(1, {"trait_type": "Region", "value": cfg["region"]})
    attrs.insert(2, {"trait_type": "Specialty", "value": spec})
    for key, value in scores.items():
        attrs.append(
            {
                "trait_type": key,
                "value": value,
                "display_type": "number",
                "max_value": 100,
            }
        )
    return {
        "name": f"{cfg['name']} #{token_id}",
        "description": (
            f"{class_name} Gator of Silicon Bayou — capability layer for merged "
            f"(Merged, Inc.), the open source institutional network. A Louisiana "
            f"alligator from {cfg['region']}, {CLASS_BLURB[class_name]}. "
            f"Cryptographic identity; not a legal contract."
        ),
        "image": image_name,
        "external_url": cfg["external_url"],
        "dna": dna,
        "attributes": attrs,
    }


def generate(count: int, seed: int, hires: bool, rebuild_layers: bool) -> dict:
    cfg = load_config()
    ensure_layers(force=rebuild_layers)
    size = cfg["hires_output"] if hires else cfg["default_output"]
    quality = int(cfg.get("jpg_quality", 92))

    images_dir = OUT / "images"
    meta_dir = OUT / "metadata"
    if OUT.exists():
        shutil.rmtree(OUT)
    images_dir.mkdir(parents=True)
    meta_dir.mkdir(parents=True)

    layer_images = load_layer_images(cfg)
    rng = random.Random(seed)
    seen: set[str] = set()
    catalog = []
    freq: dict[str, Counter] = defaultdict(Counter)

    max_unique = 1
    for layer in cfg["layers"]:
        max_unique *= len(layer["traits"])
    if count > max_unique:
        raise SystemExit(f"--count {count} exceeds unique DNA space ({max_unique})")

    for token_id in range(1, count + 1):
        picks = None
        dna = None
        for _ in range(800):
            trial = {layer["id"]: pick_weighted(rng, layer["traits"]) for layer in cfg["layers"]}
            dna = combo_dna(trial)
            if dna not in seen:
                picks = trial
                seen.add(dna)
                break
        if picks is None:
            raise SystemExit(f"Could not find unique DNA at token {token_id}")

        frame = composite(picks, layer_images, size)
        jpg_name = f"{token_id}.jpg"
        frame.save(images_dir / jpg_name, "JPEG", quality=quality, optimize=True)

        scores = roll_scores(rng, picks["class_kit"]["name"])
        meta = token_metadata(cfg, token_id, picks, dna, scores, f"images/{jpg_name}")
        (meta_dir / f"{token_id}.json").write_text(
            json.dumps(meta, indent=2) + "\n", encoding="utf-8"
        )

        catalog.append(
            {
                "id": token_id,
                "image": f"images/{jpg_name}",
                "name": meta["name"],
                "class": picks["class_kit"]["name"],
                "dna": dna,
                "attributes": meta["attributes"],
            }
        )
        for layer in cfg["layers"]:
            freq[layer["trait_type"]][picks[layer["id"]]["name"]] += 1

        if token_id % 100 == 0 or token_id == count:
            print(f"  {token_id}/{count}")

    index = {
        "collection": cfg["name"],
        "count": count,
        "size": size,
        "seed": seed,
        "generated_at": datetime.now(timezone.utc).isoformat(),
        "unique_dna": len(seen),
        "max_unique": max_unique,
        "images": catalog,
        "frequencies": {k: dict(v) for k, v in freq.items()},
        "layer_counts": {layer["trait_type"]: len(layer["traits"]) for layer in cfg["layers"]},
    }
    (OUT / "index.json").write_text(json.dumps(index, indent=2) + "\n", encoding="utf-8")

    SAMPLES.mkdir(exist_ok=True)
    for existing in SAMPLES.glob("*.jpg"):
        existing.unlink()
    for token_id in range(1, min(9, count + 1)):
        shutil.copy2(images_dir / f"{token_id}.jpg", SAMPLES / f"{token_id}.jpg")

    return index


def parse_args(argv: list[str] | None = None) -> argparse.Namespace:
    p = argparse.ArgumentParser(description="Generate Silicon Bayou gator JPGs")
    p.add_argument("--count", type=int, default=128, help="How many unique tokens to mint locally")
    p.add_argument("--seed", type=int, default=None, help="Deterministic seed (default: config.json)")
    p.add_argument("--hires", action="store_true", help="1024x1024 instead of 512x512")
    p.add_argument("--rebuild-layers", action="store_true", help="Repaint trait PNGs before compositing")
    return p.parse_args(argv)


def main(argv: list[str] | None = None) -> int:
    args = parse_args(argv)
    cfg = load_config()
    seed = cfg["seed"] if args.seed is None else args.seed
    print(f"Silicon Bayou generator  count={args.count}  seed={seed}  size={'1024' if args.hires else '512'}")
    index = generate(args.count, seed, args.hires, args.rebuild_layers)
    print(f"Wrote {index['count']} JPGs + metadata to {OUT}")
    print(f"Unique DNA {index['unique_dna']} / {index['max_unique']} possible")
    print("Layer counts:", index["layer_counts"])
    return 0


if __name__ == "__main__":
    sys.path.insert(0, str(ROOT))
    raise SystemExit(main())
