"""Paint consistent 128x128 transparent PNG trait layers for Silicon Bayou."""

from __future__ import annotations

from pathlib import Path

from PIL import Image, ImageDraw

SIZE = 128
ROOT = Path(__file__).resolve().parent
LAYERS = ROOT / "layers"

# Shared silhouette anchors (facing right, bust shot).
EYE = (82, 50)
EAR = (42, 62)
JAW_TOOTH = (96, 68)
NECK = (58, 88)


def _new() -> Image.Image:
    return Image.new("RGBA", (SIZE, SIZE), (0, 0, 0, 0))


def _draw(im: Image.Image) -> ImageDraw.ImageDraw:
    return ImageDraw.Draw(im, "RGBA")


def _save(im: Image.Image, folder: str, name: str) -> Path:
    dest = LAYERS / folder
    dest.mkdir(parents=True, exist_ok=True)
    path = dest / f"{name}.png"
    im.save(path, "PNG")
    return path


def _px(d: ImageDraw.ImageDraw, x: int, y: int, color, w: int = 1, h: int = 1) -> None:
    d.rectangle([x, y, x + w - 1, y + h - 1], fill=color)


def _none() -> Image.Image:
    return _new()


# --- backgrounds (mostly solid, tiny accents — matches the four originals) ---

def bg_swamp() -> Image.Image:
    im = Image.new("RGBA", (SIZE, SIZE), (22, 72, 68, 255))
    d = _draw(im)
    d.rectangle([0, 96, 127, 127], fill=(16, 54, 52, 255))
    for x, h in ((10, 28), (18, 40), (24, 22)):
        d.rectangle([x, 96 - h, x + 3, 96], fill=(28, 48, 32, 255))
    return im


def bg_night_bayou() -> Image.Image:
    im = Image.new("RGBA", (SIZE, SIZE), (10, 16, 48, 255))
    d = _draw(im)
    d.ellipse([96, 10, 118, 32], fill=(236, 214, 120, 255))
    d.ellipse([100, 14, 114, 28], fill=(246, 230, 150, 255))
    for x, y in ((12, 18), (28, 8), (44, 22), (70, 12), (88, 28), (20, 36)):
        _px(d, x, y, (220, 220, 240, 255), 2, 2)
    d.rectangle([0, 104, 127, 127], fill=(6, 10, 32, 255))
    return im


def bg_mardi_gras() -> Image.Image:
    im = Image.new("RGBA", (SIZE, SIZE), (88, 36, 140, 255))
    d = _draw(im)
    d.polygon([(0, 0), (48, 0), (0, 48)], fill=(212, 168, 36, 255))
    d.polygon([(127, 127), (80, 127), (127, 80)], fill=(36, 140, 72, 255))
    return im


def bg_industrial_yard() -> Image.Image:
    im = Image.new("RGBA", (SIZE, SIZE), (176, 64, 28, 255))
    d = _draw(im)
    d.rectangle([0, 100, 127, 127], fill=(120, 40, 20, 255))
    d.rectangle([8, 56, 14, 100], fill=(70, 70, 74, 255))
    d.rectangle([8, 50, 40, 56], fill=(70, 70, 74, 255))
    return im


def bg_campus() -> Image.Image:
    im = Image.new("RGBA", (SIZE, SIZE), (226, 206, 154, 255))
    d = _draw(im)
    d.rectangle([0, 88, 127, 127], fill=(154, 62, 48, 255))
    for x in range(8, 120, 18):
        d.rectangle([x, 96, x + 8, 108], fill=(88, 140, 168, 255))
    return im


def bg_offshore() -> Image.Image:
    im = Image.new("RGBA", (SIZE, SIZE), (36, 84, 118, 255))
    d = _draw(im)
    d.rectangle([0, 72, 127, 127], fill=(24, 56, 86, 255))
    d.rectangle([0, 100, 127, 127], fill=(18, 42, 68, 255))
    d.rectangle([100, 40, 108, 72], fill=(180, 188, 196, 255))
    d.rectangle([88, 48, 120, 54], fill=(180, 188, 196, 255))
    return im


def bg_levee_dusk() -> Image.Image:
    im = Image.new("RGBA", (SIZE, SIZE), (210, 96, 56, 255))
    d = _draw(im)
    d.rectangle([0, 0, 127, 40], fill=(236, 150, 88, 255))
    d.rectangle([0, 88, 127, 127], fill=(92, 44, 72, 255))
    return im


def bg_french_quarter() -> Image.Image:
    im = Image.new("RGBA", (SIZE, SIZE), (232, 88, 122, 255))
    d = _draw(im)
    d.rectangle([0, 20, 127, 26], fill=(72, 40, 36, 255))
    for x in range(6, 122, 10):
        d.rectangle([x, 26, x + 2, 36], fill=(72, 40, 36, 255))
    return im


# --- body colorways ---

BODIES = {
    "bayou_green": {
        "body": (61, 130, 56, 255),
        "mid": (46, 100, 44, 255),
        "dark": (32, 70, 32, 255),
        "outline": (16, 28, 16, 255),
        "belly": (216, 198, 140, 255),
        "belly_d": (186, 164, 108, 255),
        "eye": (245, 208, 49, 255),
    },
    "midnight_blue": {
        "body": (42, 62, 118, 255),
        "mid": (30, 44, 86, 255),
        "dark": (20, 28, 58, 255),
        "outline": (10, 12, 28, 255),
        "belly": (196, 192, 176, 255),
        "belly_d": (160, 156, 140, 255),
        "eye": (245, 196, 64, 255),
    },
    "cypress_olive": {
        "body": (92, 108, 48, 255),
        "mid": (70, 84, 36, 255),
        "dark": (48, 58, 24, 255),
        "outline": (24, 28, 12, 255),
        "belly": (232, 214, 150, 255),
        "belly_d": (198, 176, 112, 255),
        "eye": (245, 208, 49, 255),
    },
    "capital_purple": {
        "body": (98, 62, 140, 255),
        "mid": (74, 44, 108, 255),
        "dark": (50, 28, 78, 255),
        "outline": (24, 12, 40, 255),
        "belly": (220, 200, 230, 255),
        "belly_d": (180, 156, 196, 255),
        "eye": (245, 214, 80, 255),
    },
    "storm_gray": {
        "body": (86, 96, 104, 255),
        "mid": (64, 72, 80, 255),
        "dark": (42, 48, 54, 255),
        "outline": (18, 20, 24, 255),
        "belly": (214, 216, 218, 255),
        "belly_d": (176, 178, 182, 255),
        "eye": (245, 208, 49, 255),
    },
    "crawfish_bronze": {
        "body": (150, 90, 48, 255),
        "mid": (118, 68, 34, 255),
        "dark": (86, 48, 22, 255),
        "outline": (40, 22, 10, 255),
        "belly": (236, 214, 168, 255),
        "belly_d": (204, 176, 124, 255),
        "eye": (245, 196, 56, 255),
    },
}


def _gator_regions(c: dict) -> Image.Image:
    """One shared silhouette so every colorway lines up with hats/kits."""
    im = _new()
    d = _draw(im)
    body, mid, dark, outline = c["body"], c["mid"], c["dark"], c["outline"]
    belly, belly_d, eye = c["belly"], c["belly_d"], c["eye"]

    # Shoulders / chest (clothes will cover most of this).
    d.ellipse([10, 92, 118, 140], fill=body)
    d.ellipse([18, 100, 70, 140], fill=mid)

    # Neck
    d.ellipse([40, 70, 78, 108], fill=body)
    d.polygon([(58, 78), (86, 74), (90, 108), (52, 112)], fill=belly)
    d.polygon([(62, 86), (84, 82), (86, 104), (60, 106)], fill=belly_d)

    # Skull
    d.ellipse([28, 30, 86, 86], fill=body)
    d.ellipse([30, 34, 70, 72], fill=mid)

    # Snout
    d.polygon(
        [(70, 42), (108, 46), (120, 54), (120, 66), (108, 72), (72, 70)],
        fill=body,
    )
    d.polygon(
        [(78, 58), (116, 56), (118, 68), (108, 74), (74, 72)],
        fill=belly,
    )
    d.polygon([(86, 64), (114, 62), (114, 70), (88, 72)], fill=belly_d)

    # Brow ridge
    d.polygon([(64, 36), (90, 40), (88, 50), (62, 48)], fill=dark)

    # Scales along the back / crown
    for x, y in (
        (36, 40), (44, 34), (52, 32), (40, 50), (34, 58),
        (48, 44), (56, 38), (38, 68), (46, 60),
    ):
        d.ellipse([x, y, x + 8, y + 6], fill=dark)

    # Nostril
    d.ellipse([110, 52, 116, 58], fill=dark)
    _px(d, 112, 54, (8, 8, 8, 255), 2, 2)

    # Eye
    d.ellipse([74, 44, 92, 60], fill=outline)
    d.ellipse([76, 46, 90, 58], fill=eye)
    d.ellipse([82, 48, 88, 56], fill=(8, 8, 8, 255))
    _px(d, 78, 48, (255, 255, 240, 255), 2, 2)

    # Teeth along the closed jaw
    for x in range(84, 114, 5):
        d.polygon([(x, 66), (x + 3, 66), (x + 1, 70)], fill=(245, 240, 224, 255))

    # Ear bump (for earring anchor)
    d.ellipse([34, 54, 48, 70], fill=mid)

    # Outline punch
    _stroke_alpha(im, outline)
    return im


def _stroke_alpha(im: Image.Image, color, width: int = 2) -> None:
    """Dark rim around opaque pixels so the bust reads on any background."""
    alpha = im.split()[-1]
    ring = Image.new("RGBA", im.size, (0, 0, 0, 0))
    px_a = alpha.load()
    px_r = ring.load()
    w, h = im.size
    for y in range(h):
        for x in range(w):
            if px_a[x, y] < 20:
                continue
            edge = False
            for dx, dy in ((-1, 0), (1, 0), (0, -1), (0, 1)):
                nx, ny = x + dx, y + dy
                if nx < 0 or ny < 0 or nx >= w or ny >= h or px_a[nx, ny] < 20:
                    edge = True
                    break
            if edge:
                for ox in range(-width + 1, width):
                    for oy in range(-width + 1, width):
                        xx, yy = x + ox, y + oy
                        if 0 <= xx < w and 0 <= yy < h and px_a[xx, yy] < 20:
                            px_r[xx, yy] = color
    im.alpha_composite(ring)
    # stroke goes under the fill — composite ring first then original
    # (we already mutated im). Rebuild: ring under current.
    # Simpler redo: put ring beneath.
    base = Image.new("RGBA", im.size, (0, 0, 0, 0))
    base.alpha_composite(ring)
    base.alpha_composite(im)
    im.paste(base)


def paint_body(name: str) -> Image.Image:
    return _gator_regions(BODIES[name])


# --- class kits (shoulders / chest / collar only) ---

def kit_engineering() -> Image.Image:
    im = _new()
    d = _draw(im)
    navy = (28, 56, 96, 255)
    navy_d = (18, 36, 64, 255)
    d.polygon([(8, 100), (40, 86), (88, 86), (122, 104), (122, 127), (8, 127)], fill=navy)
    d.polygon([(40, 86), (64, 92), (64, 127), (40, 127)], fill=navy_d)
    # collar
    d.polygon([(48, 84), (64, 96), (52, 104)], fill=(240, 236, 220, 255))
    d.polygon([(80, 84), (64, 96), (76, 104)], fill=(240, 236, 220, 255))
    for y in (108, 116):
        d.ellipse([60, y, 66, y + 6], fill=(212, 176, 48, 255))
    # pocket PCB
    d.rectangle([86, 108, 108, 122], fill=(36, 120, 64, 255))
    _px(d, 90, 112, (212, 176, 48, 255), 4, 3)
    _px(d, 98, 114, (180, 40, 40, 255), 3, 3)
    _stroke_alpha(im, (10, 16, 28, 255))
    return im


def kit_testing() -> Image.Image:
    im = _new()
    d = _draw(im)
    shirt = (26, 40, 68, 255)
    shirt_d = (16, 26, 46, 255)
    d.polygon([(8, 100), (40, 86), (88, 86), (122, 104), (122, 127), (8, 127)], fill=shirt)
    d.polygon([(40, 86), (64, 92), (64, 127), (40, 127)], fill=shirt_d)
    d.polygon([(48, 84), (64, 96), (52, 104)], fill=(230, 230, 234, 255))
    d.polygon([(80, 84), (64, 96), (76, 104)], fill=(230, 230, 234, 255))
    # QA badge
    d.ellipse([88, 106, 110, 126], fill=(240, 240, 244, 255))
    d.polygon([(94, 116), (98, 122), (108, 110), (104, 108), (98, 116), (96, 114)], fill=(200, 40, 48, 255))
    _stroke_alpha(im, (8, 12, 22, 255))
    return im


def kit_construction() -> Image.Image:
    im = _new()
    d = _draw(im)
    tee = (36, 36, 40, 255)
    vest = (232, 92, 28, 255)
    vest_d = (180, 64, 18, 255)
    stripe = (220, 228, 234, 255)
    d.polygon([(8, 100), (40, 86), (88, 86), (122, 104), (122, 127), (8, 127)], fill=tee)
    d.polygon([(12, 98), (42, 88), (86, 88), (118, 102), (118, 127), (12, 127)], fill=vest)
    d.polygon([(42, 88), (64, 96), (64, 127), (42, 127)], fill=vest_d)
    d.rectangle([28, 96, 36, 127], fill=stripe)
    d.rectangle([92, 100, 100, 127], fill=stripe)
    _stroke_alpha(im, (20, 12, 8, 255))
    return im


def kit_capital() -> Image.Image:
    im = _new()
    d = _draw(im)
    jacket = (18, 18, 22, 255)
    jacket_d = (10, 10, 12, 255)
    shirt = (240, 236, 228, 255)
    tie = (112, 56, 168, 255)
    d.polygon([(8, 100), (40, 86), (88, 86), (122, 104), (122, 127), (8, 127)], fill=jacket)
    d.polygon([(40, 86), (64, 94), (64, 127), (40, 127)], fill=jacket_d)
    d.polygon([(50, 84), (64, 98), (54, 108), (48, 96)], fill=shirt)
    d.polygon([(78, 84), (64, 98), (74, 108), (80, 96)], fill=shirt)
    d.polygon([(64, 96), (70, 108), (64, 127), (58, 108)], fill=tie)
    d.rectangle([88, 108, 100, 116], fill=tie)  # pocket square
    _stroke_alpha(im, (0, 0, 0, 255))
    return im


# --- headgear ---

def hat_none() -> Image.Image:
    return _none()


def hat_safety_goggles() -> Image.Image:
    im = _new()
    d = _draw(im)
    frame = (232, 196, 40, 255)
    lens = (180, 210, 220, 180)
    strap = (20, 20, 24, 255)
    d.rectangle([28, 48, 76, 54], fill=strap)
    d.rounded_rectangle([70, 42, 98, 62], radius=4, fill=frame)
    d.ellipse([74, 46, 94, 58], fill=lens)
    _px(d, 78, 48, (255, 255, 255, 220), 3, 2)
    return im


def hat_hard_hat() -> Image.Image:
    im = _new()
    d = _draw(im)
    hat = (244, 212, 48, 255)
    brim = (214, 176, 28, 255)
    dark = (160, 128, 16, 255)
    d.ellipse([26, 14, 96, 48], fill=hat)
    d.rectangle([30, 30, 92, 42], fill=hat)
    d.rectangle([20, 40, 104, 48], fill=brim)
    d.rectangle([58, 16, 66, 40], fill=dark)
    return im


def hat_welding_helmet() -> Image.Image:
    im = _new()
    d = _draw(im)
    shell = (232, 96, 28, 255)
    shell_d = (160, 56, 16, 255)
    lens = (20, 24, 28, 255)
    d.rounded_rectangle([24, 4, 100, 44], radius=6, fill=shell)
    d.rectangle([32, 12, 92, 28], fill=lens)
    d.ellipse([26, 18, 36, 28], fill=shell_d)
    d.ellipse([88, 18, 98, 28], fill=shell_d)
    return im


def hat_gold_shades() -> Image.Image:
    im = _new()
    d = _draw(im)
    gold = (220, 176, 48, 255)
    lens = (12, 12, 16, 230)
    d.rectangle([30, 48, 74, 52], fill=gold)
    d.rounded_rectangle([70, 44, 100, 60], radius=3, fill=gold)
    d.rectangle([74, 47, 96, 57], fill=lens)
    _px(d, 90, 48, (255, 240, 160, 255), 3, 2)
    return im


def hat_bandana() -> Image.Image:
    im = _new()
    d = _draw(im)
    red = (176, 32, 48, 255)
    dark = (120, 16, 32, 255)
    d.polygon([(24, 40), (48, 18), (88, 20), (96, 40), (28, 48)], fill=red)
    d.polygon([(24, 40), (16, 56), (28, 52), (32, 44)], fill=dark)
    d.polygon([(20, 52), (12, 64), (26, 56)], fill=red)
    return im


def hat_newsboy() -> Image.Image:
    im = _new()
    d = _draw(im)
    cap = (72, 56, 40, 255)
    brim = (48, 36, 24, 255)
    d.ellipse([24, 16, 100, 52], fill=cap)
    d.rectangle([28, 32, 96, 46], fill=cap)
    d.polygon([(88, 40), (118, 48), (88, 52)], fill=brim)
    _px(d, 58, 20, (212, 176, 48, 255), 6, 4)
    return im


def hat_cypress_crown() -> Image.Image:
    im = _new()
    d = _draw(im)
    leaf = (48, 100, 44, 255)
    leaf_d = (28, 68, 32, 255)
    moss = (92, 140, 48, 255)
    for x, y, r, col in (
        (28, 26, 14, leaf), (44, 12, 16, moss), (62, 10, 15, leaf),
        (80, 16, 14, moss), (36, 34, 12, leaf_d), (70, 28, 11, leaf),
        (52, 20, 10, leaf_d),
    ):
        d.ellipse([x, y, x + r, y + r + 5], fill=col)
    return im


# --- tools (lower-right / chest) ---

def tool_none() -> Image.Image:
    return _none()


def tool_soldering_iron() -> Image.Image:
    im = _new()
    d = _draw(im)
    d.rectangle([86, 104, 112, 122], fill=(28, 110, 56, 255))
    d.rectangle([90, 100, 96, 124], fill=(40, 40, 44, 255))
    d.polygon([(96, 98), (118, 90), (118, 94), (96, 104)], fill=(180, 180, 186, 255))
    _px(d, 116, 88, (232, 96, 28, 255), 4, 4)
    return im


def tool_clipboard() -> Image.Image:
    im = _new()
    d = _draw(im)
    d.rectangle([84, 96, 118, 127], fill=(150, 96, 48, 255))
    d.rectangle([88, 102, 114, 127], fill=(236, 232, 220, 255))
    d.rectangle([94, 94, 108, 102], fill=(168, 172, 180, 255))
    for y in (108, 114, 120):
        d.rectangle([92, y, 110, y + 2], fill=(160, 156, 148, 255))
    return im


def tool_wrench() -> Image.Image:
    im = _new()
    d = _draw(im)
    metal = (168, 172, 180, 255)
    d.rectangle([100, 88, 108, 124], fill=metal)
    d.ellipse([92, 80, 116, 100], fill=metal)
    d.ellipse([98, 86, 110, 96], fill=(0, 0, 0, 0))
    return im


def tool_ledger() -> Image.Image:
    im = _new()
    d = _draw(im)
    d.rectangle([84, 98, 118, 126], fill=(196, 156, 40, 255))
    d.rectangle([88, 102, 114, 122], fill=(248, 236, 180, 255))
    d.rectangle([84, 98, 90, 126], fill=(160, 120, 24, 255))
    return im


def tool_tablet() -> Image.Image:
    im = _new()
    d = _draw(im)
    d.rounded_rectangle([86, 96, 118, 126], radius=3, fill=(24, 28, 36, 255))
    d.rectangle([90, 100, 114, 118], fill=(56, 140, 200, 255))
    _px(d, 100, 121, (180, 180, 186, 255), 4, 3)
    return im


def tool_survey_pole() -> Image.Image:
    im = _new()
    d = _draw(im)
    for i, col in enumerate(((232, 232, 236, 255), (200, 40, 48, 255)) * 5):
        d.rectangle([104, 70 + i * 6, 112, 76 + i * 6], fill=col)
    return im


def tool_cafe_au_lait() -> Image.Image:
    im = _new()
    d = _draw(im)
    d.rectangle([92, 100, 114, 126], fill=(244, 240, 232, 255))
    d.rectangle([96, 94, 110, 102], fill=(36, 36, 40, 255))
    d.rectangle([94, 104, 112, 112], fill=(176, 124, 64, 255))
    d.arc([110, 106, 122, 120], 270, 90, fill=(36, 36, 40, 255), width=3)
    return im


# --- extras ---

def extra_none() -> Image.Image:
    return _none()


def extra_crawfish_earring() -> Image.Image:
    im = _new()
    d = _draw(im)
    d.ellipse([38, 66, 44, 72], fill=(212, 176, 48, 255))
    d.ellipse([34, 70, 50, 86], fill=(196, 40, 40, 255))
    d.polygon([(34, 76), (28, 80), (36, 82)], fill=(196, 40, 40, 255))
    d.polygon([(50, 76), (56, 80), (48, 82)], fill=(196, 40, 40, 255))
    _px(d, 40, 74, (40, 20, 16, 255), 3, 2)
    return im


def extra_mardi_gras_beads() -> Image.Image:
    im = _new()
    d = _draw(im)
    colors = (
        (112, 56, 168, 255),
        (36, 140, 72, 255),
        (212, 168, 36, 255),
    )
    for i, col in enumerate(colors):
        y = 90 + i * 6
        for x in range(36, 96, 7):
            d.ellipse([x, y, x + 6, y + 6], fill=col)
    return im


def extra_gold_tooth() -> Image.Image:
    im = _new()
    d = _draw(im)
    d.polygon([(94, 64), (100, 64), (97, 72)], fill=(220, 176, 40, 255))
    _px(d, 96, 66, (255, 230, 120, 255), 2, 2)
    return im


def extra_shoulder_moss() -> Image.Image:
    im = _new()
    d = _draw(im)
    moss = (48, 100, 44, 255)
    moss_d = (28, 68, 28, 255)
    lime = (92, 140, 48, 255)
    for x, y, r, col in (
        (14, 86, 14, moss), (22, 94, 16, moss_d), (30, 84, 12, lime),
        (18, 104, 10, moss), (28, 108, 12, moss_d), (10, 98, 9, lime),
        (36, 92, 8, moss),
    ):
        d.ellipse([x, y, x + r, y + r + 6], fill=col)
    return im


def extra_shrimp_pin() -> Image.Image:
    im = _new()
    d = _draw(im)
    d.rounded_rectangle([20, 108, 42, 124], radius=2, fill=(240, 240, 244, 255))
    d.ellipse([24, 112, 38, 122], fill=(232, 108, 48, 255))
    d.polygon([(36, 114), (42, 110), (38, 118)], fill=(232, 108, 48, 255))
    return im


BUILDERS = {
    "background": {
        "swamp": bg_swamp,
        "night_bayou": bg_night_bayou,
        "mardi_gras": bg_mardi_gras,
        "industrial_yard": bg_industrial_yard,
        "campus": bg_campus,
        "offshore": bg_offshore,
        "levee_dusk": bg_levee_dusk,
        "french_quarter": bg_french_quarter,
    },
    "body": {name: (lambda n=name: paint_body(n)) for name in BODIES},
    "class": {
        "engineering": kit_engineering,
        "testing": kit_testing,
        "construction": kit_construction,
        "capital": kit_capital,
    },
    "headgear": {
        "none": hat_none,
        "safety_goggles": hat_safety_goggles,
        "hard_hat": hat_hard_hat,
        "welding_helmet": hat_welding_helmet,
        "gold_shades": hat_gold_shades,
        "bandana": hat_bandana,
        "newsboy": hat_newsboy,
        "cypress_crown": hat_cypress_crown,
    },
    "tool": {
        "none": tool_none,
        "soldering_iron": tool_soldering_iron,
        "clipboard": tool_clipboard,
        "wrench": tool_wrench,
        "ledger": tool_ledger,
        "tablet": tool_tablet,
        "survey_pole": tool_survey_pole,
        "cafe_au_lait": tool_cafe_au_lait,
    },
    "extra": {
        "none": extra_none,
        "crawfish_earring": extra_crawfish_earring,
        "mardi_gras_beads": extra_mardi_gras_beads,
        "gold_tooth": extra_gold_tooth,
        "shoulder_moss": extra_shoulder_moss,
        "shrimp_pin": extra_shrimp_pin,
    },
}


def build_all(force: bool = False) -> list[Path]:
    written: list[Path] = []
    for folder, traits in BUILDERS.items():
        for name, fn in traits.items():
            path = LAYERS / folder / f"{name}.png"
            if path.exists() and not force:
                written.append(path)
                continue
            written.append(_save(fn(), folder, name))
    return written


if __name__ == "__main__":
    paths = build_all(force=True)
    print(f"Wrote {len(paths)} layers to {LAYERS}")
