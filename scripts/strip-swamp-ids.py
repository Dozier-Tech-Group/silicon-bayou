#!/usr/bin/env python3
"""Remove the 001-style ID in the top-left of each swamp-222 PFP."""
from pathlib import Path
import numpy as np
from PIL import Image

ROOT = Path(__file__).resolve().parents[1]
SRC = ROOT / "art" / "swamp-222"
Y0, Y1, X0, X1 = 8, 95, 4, 168
DILATE = 12


def dilate(mask: np.ndarray, radius: int) -> np.ndarray:
    out = mask.copy()
    ys, xs = np.where(mask)
    h, w = mask.shape
    for y, x in zip(ys, xs):
        out[max(0, y - radius) : y + radius + 1, max(0, x - radius) : x + radius + 1] = True
    return out


def strip_id(im: np.ndarray) -> np.ndarray:
    roi = im[Y0:Y1, X0:X1]
    white = (roi[:, :, 0] > 185) & (roi[:, :, 1] > 185) & (roi[:, :, 2] > 185)
    if white.sum() < 40:
        white = roi.mean(axis=2) > 170
    if white.sum() < 40:
        return im
    mask = np.zeros(im.shape[:2], dtype=bool)
    mask[Y0:Y1, X0:X1] = dilate(white, DILATE)
    out = im.copy()
    ys = np.where(mask.any(axis=1))[0]
    for y in ys:
        xs = np.where(mask[y])[0]
        src_start = min(im.shape[1] - 1, int(xs.max()) + 6)
        span = int(xs.max() - xs.min()) + 1
        for x in xs:
            src_x = src_start + (x - int(xs.min())) % max(span, 1)
            if src_x >= im.shape[1] or mask[y, src_x]:
                src_x = src_start
            out[y, x] = im[y, src_x]
    return out


def main() -> None:
    files = sorted(SRC.glob("*.png"), key=lambda p: int(p.stem) if p.stem.isdigit() else 10**9)
    files = [p for p in files if p.stem.isdigit()]
    for path in files:
        arr = np.array(Image.open(path).convert("RGB"))
        cleaned = strip_id(arr)
        Image.fromarray(cleaned).save(path, optimize=True)
    print(f"Stripped IDs from {len(files)} images in {SRC}")


if __name__ == "__main__":
    main()
