#!/usr/bin/env python3
"""Rebuild the swamp-222 drop from the contact sheet.

Per token: crop the native 85x87 cell, remove the baked-in corner number,
replace the noisy background with a clean flat color (keeping each token's
original hue), de-noise the art into crisp pixel-art, and upscale to 512.

Tokens 199-222 are special-edition variants: mirrored + hue-shifted gators
on shifted backgrounds, built from 24 sources spread across the set.
"""
import colorsys
from collections import deque
from pathlib import Path

import numpy as np
from PIL import Image

ROOT = Path(__file__).resolve().parents[1]
SHEET = ROOT / "art" / "references" / "swamp-222-sheet.png"
OUT = ROOT / "art" / "swamp-222"

OX, OY, CW, CH, COLS, ROWS = 5, 7, 85, 87, 18, 11
INSET = (2, 2, 3, 3)  # left, top, right, bottom - trims neighbor-cell bleed
SIZE = 512
BG_TOL = 70          # color distance counted as background
FRINGE_TOL = 42      # art pixels this close to old bg get absorbed into new bg
NUM_BOX = (0, 0, 34, 20)  # number badge region in native cell coords


def dist(a, color):
    return np.sqrt(((a.astype(float) - np.asarray(color, float)) ** 2).sum(axis=-1))


def components(mask):
    """Label 4-connected components; returns label array and count."""
    lab = np.zeros(mask.shape, int)
    cur = 0
    h, w = mask.shape
    for sy in range(h):
        for sx in range(w):
            if mask[sy, sx] and not lab[sy, sx]:
                cur += 1
                q = deque([(sy, sx)])
                lab[sy, sx] = cur
                while q:
                    y, x = q.popleft()
                    for ny, nx in ((y - 1, x), (y + 1, x), (y, x - 1), (y, x + 1)):
                        if 0 <= ny < h and 0 <= nx < w and mask[ny, nx] and not lab[ny, nx]:
                            lab[ny, nx] = cur
                            q.append((ny, nx))
    return lab, cur


def flat_bg(color):
    """Snap a sampled background color to a clean, well-saturated flat."""
    r, g, b = [c / 255 for c in color]
    h, s, v = colorsys.rgb_to_hsv(r, g, b)
    s = min(1.0, max(s * 1.15, 0.30 if s > 0.08 else s))
    v = min(0.92, max(v, 0.55))
    return tuple(int(round(c * 255)) for c in colorsys.hsv_to_rgb(h, s, v))


def shift_hue(arr, mask, dh, ds=1.0, dv=1.0):
    """Hue-rotate masked pixels of an HxWx3 uint8 array. dh in [0,1)."""
    a = arr.astype(float) / 255
    r, g, b = a[..., 0], a[..., 1], a[..., 2]
    mx, mn = a.max(-1), a.min(-1)
    v = mx
    c = mx - mn
    s = np.where(mx > 0, c / np.maximum(mx, 1e-9), 0)
    h = np.zeros_like(v)
    nz = c > 1e-9
    idx = nz & (mx == r)
    h[idx] = ((g - b)[idx] / c[idx]) % 6
    idx = nz & (mx == g)
    h[idx] = (b - r)[idx] / c[idx] + 2
    idx = nz & (mx == b)
    h[idx] = (r - g)[idx] / c[idx] + 4
    h = (h / 6 + dh) % 1.0
    s = np.clip(s * ds, 0, 1)
    v = np.clip(v * dv, 0, 1)
    i = (h * 6).astype(int) % 6
    f = h * 6 - (h * 6).astype(int)
    p, q, t = v * (1 - s), v * (1 - s * f), v * (1 - s * (1 - f))
    out = np.select(
        [(i == k)[..., None] for k in range(6)],
        [np.stack([v, t, p], -1), np.stack([q, v, p], -1), np.stack([p, v, t], -1),
         np.stack([p, q, v], -1), np.stack([p, t, v], -1), np.stack([v, p, q], -1)])
    res = arr.copy()
    res[mask] = (out[mask] * 255).round().astype(np.uint8)
    return res


# Hand-tuned overrides for cells whose background defeats the automatic
# model: "seeds" are known-background points (native cell x, y), "tol" is a
# starting color tolerance replacing BG_TOL.
# Per-cell knobs: "tol" starting tolerance, "retry" auto-retry, "bgpt" a
# known-background point (native x, y) forcing the color candidate, "dust"
# minimum surviving component size, "inset_left" extra crop columns.
OVERRIDES = {
    14: {"bgpt": (76, 8)},
    16: {"bgpt": (76, 8)},
    25: {"tol": 30, "retry": False, "dust": 70},  # red hat + vest on red bg
    31: {"bgpt": (76, 8)},
    32: {"bgpt": (76, 40)},
    34: {"bgpt": (76, 40)},
    39: {"inset_left": 4},
    50: {"bgpt": (76, 8)},
    51: {"bgpt": (76, 8)},
    68: {"bgpt": (76, 8)},
    85: {"bgpt": (76, 10)},
    86: {"bgpt": (76, 8)},
    104: {"bgpt": (3, 25)},
    140: {"bgpt": (76, 8)},
    158: {"bgpt": (76, 8)},
}


def fit_bg_rows(a, bgpt=None):
    """Planar background estimate: robust linear fit over border pixels."""
    h, w, _ = a.shape
    border = np.concatenate([
        a[0, w // 2:], a[-1, :], a[:, -1], a[h // 2:, 0]  # avoid number corner
    ])
    # Big gators can cover most of the border, and a gradient background
    # spreads over many color bins while a uniform jacket concentrates in one,
    # so neither a median nor a modal bin is safe. Instead take corner patches
    # as background candidates and keep the one explaining most of the border.
    candidates = [
        np.median(a[2:12, w - 11:w - 1].reshape(-1, 3), axis=0),   # top-right
        np.median(a[h - 13:h - 3, w - 11:w - 1].reshape(-1, 3), axis=0),
        np.median(a[h - 13:h - 3, 1:11].reshape(-1, 3), axis=0),   # bottom-left
        np.median(a[h // 2 - 5:h // 2 + 5, w - 9:w - 1].reshape(-1, 3), axis=0),
    ]
    if bgpt is not None:
        px, py = bgpt
        center = np.median(
            a[max(0, py - 4):py + 5, max(0, px - 4):px + 5].reshape(-1, 3), axis=0)
    else:
        scores = [(dist(border[None, :, :], c)[0] < 65).mean() for c in candidates]
        center = candidates[int(np.argmax(scores))]
    in_mode = dist(border[None, :, :], center)[0] < 65
    bg = np.median(border[in_mode].reshape(-1, 3), axis=0)
    ys_b = np.concatenate([
        np.zeros(w - w // 2), np.full(w, h - 1), np.arange(h), np.arange(h // 2, h)
    ])
    xs_b = np.concatenate([
        np.arange(w // 2, w), np.arange(w), np.full(h, w - 1), np.zeros(h - h // 2)
    ])
    keep = dist(border[None, :, :], bg)[0] < 80
    if keep.sum() >= 10:
        A = np.stack([np.ones(keep.sum()), ys_b[keep], xs_b[keep]], axis=1)
        coef, *_ = np.linalg.lstsq(A, border[keep].astype(float), rcond=None)
        yy, xx = np.mgrid[0:h, 0:w]
        bg_img = np.clip(
            coef[0][None, None, :] + coef[1][None, None, :] * yy[..., None]
            + coef[2][None, None, :] * xx[..., None], 0, 255)
    else:
        bg_img = np.tile(bg, (h, w, 1))
    return bg, bg_img


def segment(a, bg_img, tol, extra_seeds=()):
    """Background mask: threshold against the plane model plus corner seeds,
    then keep only regions connected to the cell border."""
    h, w, _ = a.shape
    d = np.sqrt(((a.astype(float) - bg_img) ** 2).sum(-1))
    near = d < tol
    # Extra seeds from the three non-number corners: catches radial/2D
    # gradients whose corners drift far from the plane fit. Only trust a
    # corner patch whose color is still plausibly background there.
    for (cy, cx) in ((h - 5, 4), (h - 5, w - 5), (4, w - 5)):
        patch = a[cy - 4:cy + 4, cx - 4:cx + 4].reshape(-1, 3)
        seed = np.median(patch, axis=0)
        if np.sqrt(((seed - bg_img[cy, cx]) ** 2).sum()) < 110:
            near |= dist(a, seed) < min(50, tol)
    for (sx, sy) in extra_seeds:
        patch = a[max(0, sy - 2):sy + 3, max(0, sx - 2):sx + 3].reshape(-1, 3)
        near |= dist(a, np.median(patch, axis=0)) < 55
    lab, n = components(near)
    bg_mask = np.zeros_like(near)
    edge_labels = set(lab[0, :]) | set(lab[-1, :]) | set(lab[:, 0]) | set(lab[:, -1])
    edge_labels.discard(0)
    for l in edge_labels:
        bg_mask |= lab == l

    # Locally constrained growth: absorb the smooth glows and vignettes the
    # sheet bakes around badges and gators, which drift far from the plane
    # model. A pixel joins only via a small color step from an adjacent
    # background pixel, so the walk follows smooth gradients but cannot cross
    # the art's outlines.
    af = a.astype(float)
    q = deque(zip(*np.nonzero(bg_mask)))
    while q:
        y, x = q.popleft()
        c = af[y, x]
        for ny, nx in ((y - 1, x), (y + 1, x), (y, x - 1), (y, x + 1)):
            if 0 <= ny < h and 0 <= nx < w and not bg_mask[ny, nx]:
                step = af[ny, nx] - c
                if (step * step).sum() < 13 * 13:
                    bg_mask[ny, nx] = True
                    q.append((ny, nx))
    return bg_mask, d


def process_cell(cell, override=None):
    """Return (art_rgb, art_mask, new_bg) for one native-res cell image."""
    override = override or {}
    extra_seeds = override.get("seeds", ())
    if override.get("inset_left"):
        cell = cell.crop((override["inset_left"], 0, cell.width, cell.height))
    a = np.array(cell.convert("RGB"), np.uint8)
    h, w, _ = a.shape
    bg, bg_rows = fit_bg_rows(a, override.get("bgpt"))

    # Auto-retry: a sane gator covers roughly 25-62% of the cell. Too little
    # art means the gator was eaten (bg too similar - tighten); too much means
    # background residue survived (loosen).
    tol = override.get("tol", BG_TOL)
    for _ in range(3 if override.get("retry", True) else 1):
        bg_mask, d = segment(a, bg_rows, tol, extra_seeds)
        frac = 1 - bg_mask.mean()
        if frac < 0.25 and tol > 35:
            tol -= 18
        elif frac > 0.62 and tol < 87:
            tol += 16
        else:
            break

    # The sheet bakes a pale glow behind each number badge (and sometimes a
    # wash in the bottom-left corner) that sits far from the background model.
    # Absorb such washes with a tightly stepped growth confined to those
    # corners: smooth gradients get eaten, outlined art blocks the walk.
    af = a.astype(float)
    for (rx0, ry0, rx1, ry1, step_tol) in ((0, 0, 58, 38, 14), (0, h - 26, 26, h, 12)):
        q = deque(zip(*np.nonzero(bg_mask)))
        while q:
            y, x = q.popleft()
            c = af[y, x]
            for ny, nx in ((y - 1, x), (y + 1, x), (y, x - 1), (y, x + 1)):
                if (rx0 <= nx < rx1 and ry0 <= ny < ry1 and 0 <= ny < h and 0 <= nx < w
                        and not bg_mask[ny, nx]):
                    step = af[ny, nx] - c
                    if (step * step).sum() < step_tol * step_tol:
                        bg_mask[ny, nx] = True
                        q.append((ny, nx))

    art = ~bg_mask
    lab2, n2 = components(art)
    x0, y0, x1, y1 = NUM_BOX
    if n2:
        sizes = np.bincount(lab2.ravel())
        sizes[0] = 0
        main = sizes.argmax()
        bg_hue = colorsys.rgb_to_hsv(*(np.asarray(bg) / 255))[0]
        for l in range(1, n2 + 1):
            if l == main:
                continue
            m = lab2 == l
            if sizes[l] < override.get("dust", 12):
                art[m] = False
                continue
            ys, xs = np.nonzero(m)
            bw, bh = xs.max() - xs.min() + 1, ys.max() - ys.min() + 1
            in_box = ((xs < x1 + 6) & (ys < y1 + 6)).mean()
            med = np.median(a[m].reshape(-1, 3), axis=0)
            mh, msat, _ = colorsys.rgb_to_hsv(*(med / 255))
            hue_d = min(abs(mh - bg_hue), 1 - abs(mh - bg_hue))
            if in_box > 0.5:                       # anything living in the badge corner
                art[m] = False
            elif sizes[l] < 120 and (xs.min() <= 1 or xs.max() >= w - 2):
                art[m] = False                     # neighbor-cell bleed at edges
            elif bw <= 5 and bh >= 30 and (xs.min() <= 1 or xs.max() >= w - 2):
                art[m] = False                     # tall bleed sliver at edges
            elif bw <= 3 and bh >= 25:
                art[m] = False                     # sheet seam line
            elif hue_d < 0.06 and msat > 0.1 and np.sqrt(
                    ((med - bg_rows[int(np.median(ys)), int(np.median(xs))]) ** 2).sum()) < 95:
                art[m] = False                     # old-background residue island

    # Badge pixels merged into the main component (numbers printed over hats,
    # blurred gray ghosts): inside the badge box, kill badge-like pixels -
    # dark outline, bright fill, or desaturated smear - then inpaint from
    # surrounding art so hats are not notched.
    bx1, by1 = x1 + 2, y1 + 2
    # If the ring just outside the badge box is pure background, nothing
    # legitimate lives inside it - wipe the box (kills blur halos wholesale).
    ring = np.zeros_like(art)
    ring[:min(h, by1 + 5), :min(w, bx1 + 5)] = True
    ring[:by1, :bx1] = False
    if ring.any() and (~art[ring]).mean() >= 0.8:
        art[:by1, :bx1] = False
    # Badge remnants connected to the gator by thin blur bridges: walk through
    # art from everything outside the badge region; box pixels that take more
    # than 10 connected steps to reach are badge junk, not hat.
    reach = np.full((h, w), -1, int)
    q = deque()
    for y in range(h):
        for x in range(w):
            if art[y, x] and (x >= bx1 + 2 or y >= by1 + 2):
                reach[y, x] = 0
                q.append((y, x))
    while q:
        y, x = q.popleft()
        if reach[y, x] >= 12:
            continue
        for ny, nx in ((y - 1, x), (y + 1, x), (y, x - 1), (y, x + 1)):
            if 0 <= ny < h and 0 <= nx < w and art[ny, nx] and reach[ny, nx] < 0:
                reach[ny, nx] = reach[y, x] + 1
                q.append((ny, nx))
    far = art & ((reach < 0) | (reach > 10))
    far[by1:, :] = False
    far[:, bx1:] = False
    art[far] = False

    sub = a[:by1, :bx1].astype(int)
    suspect = art[:by1, :bx1] & (
        (sub.max(-1) < 100) | (sub.min(-1) > 170) | (sub.max(-1) - sub.min(-1) < 50))
    if suspect.sum() >= 8:
        box_art = np.zeros_like(art)
        box_art[:by1, :bx1] = suspect
        art[box_art] = False
        # inpaint: badge pixels well-surrounded by remaining art get filled
        # with the nearest art color instead of background
        fill = box_art & np.zeros_like(art)
        pad = 3
        for _ in range(6):
            grew = False
            ys, xs = np.nonzero(box_art & ~fill)
            for y, x in zip(ys, xs):
                y0_, y1_ = max(0, y - 1), min(h, y + 2)
                x0_, x1_ = max(0, x - 1), min(w, x + 2)
                nbr = art[y0_:y1_, x0_:x1_]
                if nbr.sum() >= 3:
                    win = a[max(0, y - pad):y + pad + 1, max(0, x - pad):x + pad + 1]
                    wm = art[max(0, y - pad):y + pad + 1, max(0, x - pad):x + pad + 1]
                    if wm.sum() >= 6:
                        a[y, x] = np.median(win[wm].reshape(-1, 3), axis=0)
                        art[y, x] = True
                        fill[y, x] = True
                        grew = True
            if not grew:
                break

    # Sweep leftover badge fringe / paint scraps in the corner: small blobs
    # living entirely inside the (slightly expanded) badge region.
    lab4, n4 = components(art)
    for l in range(1, n4 + 1):
        m = lab4 == l
        if m.sum() < 90:
            ys, xs = np.nonzero(m)
            if xs.max() < x1 + 10 and ys.max() < y1 + 10:
                art[m] = False

    # Sheet seam artifacts: 1-2px vertical lines of art with background on
    # both sides for 20+ rows are grid-line bleed, not art.
    for x in range(1, w - 2):
        one = art[:, x] & ~art[:, x - 1] & ~art[:, x + 1]
        if one.sum() >= 20:
            art[one, x] = False
        if x < w - 3:
            two = art[:, x] & art[:, x + 1] & ~art[:, x - 1] & ~art[:, x + 2]
            if two.sum() >= 20:
                art[two, x] = False
                art[two, x + 1] = False

    # absorb anti-alias fringe: art pixels touching bg whose color is close
    # to the adjacent background pixel
    nb = np.zeros_like(art)
    for shift in ((1, 0), (-1, 0), (0, 1), (0, -1)):
        r = np.roll(~art, shift, axis=(0, 1))
        if shift == (1, 0):
            r[0, :] = False
        elif shift == (-1, 0):
            r[-1, :] = False
        elif shift == (0, 1):
            r[:, 0] = False
        else:
            r[:, -1] = False
        nb |= r
    art[art & nb & (d < FRINGE_TOL)] = False

    flat = flat_bg(np.median(a[~art].reshape(-1, 3), axis=0)) if (~art).any() else flat_bg(bg)
    return a, art, flat


def compose(a, art, bgcolor, size=SIZE, quant=64):
    h, w, _ = a.shape
    out = np.empty_like(a)
    out[...] = np.asarray(bgcolor, np.uint8)
    out[art] = a[art]
    img = Image.fromarray(out)
    side = max(w, h)
    sq = Image.new("RGB", (side, side), bgcolor)
    sq.paste(img, ((side - w) // 2, side - h))
    sq = sq.quantize(colors=quant, method=Image.MEDIANCUT, dither=Image.Dither.NONE).convert("RGB")
    return sq.resize((size, size), Image.NEAREST)


def load_cells():
    sheet = Image.open(SHEET).convert("RGB")
    cells = []
    li, ti, ri, bi = INSET
    for row in range(ROWS):
        for col in range(COLS):
            x0, y0 = OX + col * CW, OY + row * CH
            cells.append(sheet.crop((x0 + li, y0 + ti, x0 + CW - ri, y0 + CH - bi)))
    return cells


VARIANT_SOURCES = [1, 10, 19, 24, 26, 33, 43, 48, 58, 62, 65, 71,
                   80, 90, 99, 108, 118, 130, 137, 144, 161, 170, 186, 198]
VARIANT_HUES = [0.12, 0.25, 0.38, 0.5, 0.62, 0.75, 0.88, 0.18,
                0.32, 0.45, 0.58, 0.7, 0.82, 0.95, 0.15, 0.28,
                0.42, 0.55, 0.68, 0.8, 0.92, 0.35, 0.65, 0.22]


def main():
    OUT.mkdir(parents=True, exist_ok=True)
    cells = load_cells()
    processed = []
    for i, cell in enumerate(cells, 1):
        a, art, bgc = process_cell(cell, OVERRIDES.get(i))
        processed.append((a, art, bgc))
        compose(a, art, bgc).save(OUT / f"{i}.png", optimize=True)
        if i % 50 == 0:
            print(f"  {i}/198")
    print("base 198 done")

    for k, (src, dh) in enumerate(zip(VARIANT_SOURCES, VARIANT_HUES)):
        a, art, bgc = processed[src - 1]
        a2 = shift_hue(a, art, dh, ds=1.05)
        a2 = a2[:, ::-1]
        art2 = art[:, ::-1]
        r, g, b = [c / 255 for c in bgc]
        hh, ss, vv = colorsys.rgb_to_hsv(r, g, b)
        bg2 = tuple(int(round(c * 255)) for c in colorsys.hsv_to_rgb((hh + dh + 0.5) % 1, ss, vv))
        bg2 = flat_bg(bg2)
        compose(np.ascontiguousarray(a2), np.ascontiguousarray(art2), bg2).save(
            OUT / f"{199 + k}.png", optimize=True)
    print("variants 199-222 done")


if __name__ == "__main__":
    main()
