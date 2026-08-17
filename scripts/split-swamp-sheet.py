#!/usr/bin/env python3
"""Split the swamp-gator contact sheet into individual PFPs.

The delivered sheet is 18 columns x 11 rows = 198 portraits, not 222.
"""
from pathlib import Path
from PIL import Image

ROOT = Path(__file__).resolve().parents[1]
SRC = Path(r"C:\Users\gdozi\Downloads\442532a8-c2d6-4a7d-a004-ede26df668cc.png")
OUT = ROOT / "art" / "swamp-222"
REF = ROOT / "art" / "references" / "swamp-222-sheet.png"

OX, OY, CW, CH, COLS, ROWS = 5, 7, 85, 87, 18, 11
SIZE = 512
# Native-cell ID box (white 001-style label). Skip the sheet gutter.
ID_X0, ID_X1, ID_Y0, ID_Y1, ID_SRC_X = 0, 44, 0, 17, 52


def strip_native_id(crop: Image.Image) -> Image.Image:
    pix = crop.load()
    w, h = crop.size
    src_x = min(w - 1, ID_SRC_X)
    for y in range(ID_Y0, min(h, ID_Y1)):
        color = pix[src_x, y]
        for x in range(ID_X0, min(w, ID_X1)):
            pix[x, y] = color
    return crop


def main() -> None:
    if not SRC.exists():
        raise SystemExit(f"Missing sheet: {SRC}")
    OUT.mkdir(parents=True, exist_ok=True)
    REF.parent.mkdir(parents=True, exist_ok=True)
    sheet = Image.open(SRC).convert("RGB")
    sheet.save(REF)
    n = 0
    for row in range(ROWS):
        for col in range(COLS):
            n += 1
            x0, y0 = OX + col * CW, OY + row * CH
            crop = strip_native_id(sheet.crop((x0, y0, x0 + CW, y0 + CH)))
            side = max(crop.size)
            bg = crop.getpixel((crop.size[0] - 2, 2))
            square = Image.new("RGB", (side, side), bg)
            square.paste(crop, (0, 0))
            pfp = square.resize((SIZE, SIZE), Image.NEAREST)
            pfp.save(OUT / f"{n}.png", optimize=True)
    print(f"Wrote {n} tokens to {OUT} at {SIZE}x{SIZE} (nearest-neighbor)")
    if n != 222:
        print(f"NOTE: sheet contains {n} portraits, not 222.")


if __name__ == "__main__":
    main()
