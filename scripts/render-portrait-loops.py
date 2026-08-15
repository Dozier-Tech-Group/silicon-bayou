"""Calm 6.5s living-portrait loops from the hybrid gator stills.

No new characters — only light, mist, distant fireflies, and a slow Ken Burns
on the approved paintings. Seamless sine-wave motion (start == end).
"""
from __future__ import annotations

import math
import os
import sys

from PIL import Image, ImageDraw, ImageEnhance, ImageFilter

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
GATORS = os.path.join(ROOT, "art", "gators")
DURATION = 6.5
FPS = 20
N = int(DURATION * FPS)

TOKENS = [
    {
        "src": "engineering-gator.png",
        "loop": "engineering-gator-loop.mp4",
        "warm": (255, 168, 78),
        "flies": ((0.12, 0.22), (0.86, 0.18), (0.08, 0.62), (0.91, 0.55), (0.78, 0.78)),
    },
    {
        "src": "testing-gator.png",
        "loop": "testing-gator-loop.mp4",
        "warm": (255, 160, 70),
        "flies": ((0.10, 0.20), (0.88, 0.16), (0.07, 0.70), (0.93, 0.48), (0.18, 0.86)),
    },
    {
        "src": "construction-gator.png",
        "loop": "construction-gator-loop.mp4",
        "warm": (255, 150, 60),
        "flies": ((0.11, 0.24), (0.84, 0.20), (0.90, 0.42), (0.08, 0.58), (0.72, 0.82)),
    },
    {
        "src": "capital-gator.png",
        "loop": "capital-gator-loop.mp4",
        "warm": (255, 176, 88),
        "flies": ((0.13, 0.18), (0.87, 0.22), (0.06, 0.64), (0.92, 0.60), (0.80, 0.84)),
    },
]


def _radial(size: tuple[int, int], cx: float, cy: float, rx: float, ry: float) -> Image.Image:
    w, h = size
    mask = Image.new("L", (256, 256), 0)
    d = ImageDraw.Draw(mask)
    for i in range(128, 0, -2):
        v = int(255 * ((128 - i) / 128) ** 1.65)
        d.ellipse((128 - i, 128 - i, 128 + i, 128 + i), fill=v)
    mask = mask.resize((max(8, int(rx * 2)), max(8, int(ry * 2))), Image.Resampling.LANCZOS)
    layer = Image.new("L", (w, h), 0)
    x = int(cx - mask.size[0] / 2)
    y = int(cy - mask.size[1] / 2)
    layer.paste(mask, (x, y))
    return layer


def ken_burns(im: Image.Image, t: float) -> Image.Image:
    w, h = im.size
    s = math.sin(2 * math.pi * t)
    c = math.cos(2 * math.pi * t)
    zoom = 1.038 + 0.022 * s
    nw, nh = int(w * zoom), int(h * zoom)
    big = im.resize((nw, nh), Image.Resampling.BICUBIC)
    cx = (nw - w) / 2 + 0.012 * w * c
    cy = (nh - h) / 2 + 0.008 * h * s
    left = int(max(0, min(nw - w, cx)))
    top = int(max(0, min(nh - h, cy)))
    return big.crop((left, top, left + w, top + h))


def overlays(frame: Image.Image, t: float, warm: tuple[int, int, int], flies: tuple) -> Image.Image:
    w, h = frame.size
    s = math.sin(2 * math.pi * t)
    c = math.cos(2 * math.pi * t)

    # Soft sunset light drifting across scales / glasses / beads.
    light_mask = _radial(
        (w, h),
        w * (0.24 + 0.07 * c),
        h * (0.40 + 0.035 * s),
        w * 0.42,
        h * 0.38,
    )
    light = Image.new("RGB", (w, h), warm)
    lit = Image.composite(light, frame, light_mask)
    frame = Image.blend(frame, lit, 0.11 + 0.03 * s)

    # Cooler fill on the shadow side — keeps it a portrait, not a flashlight.
    cool_mask = _radial((w, h), w * (0.82 + 0.03 * s), h * 0.48, w * 0.28, h * 0.34)
    cool = Image.new("RGB", (w, h), (40, 70, 90))
    cooled = Image.composite(cool, frame, cool_mask)
    frame = Image.blend(frame, cooled, 0.045)

    # Low swamp mist — two slow bands, never over the eyes hard.
    mist = Image.new("RGBA", (w, h), (0, 0, 0, 0))
    md = ImageDraw.Draw(mist)
    drift = int(w * 0.05 * s)
    md.rectangle((drift - w * 0.15, int(h * 0.62), drift + int(w * 0.75), h), fill=(220, 214, 198, 18))
    md.rectangle((int(w * 0.2) - drift, int(h * 0.78), w, h), fill=(186, 198, 188, 16))
    mist = mist.filter(ImageFilter.GaussianBlur(28))
    frame = Image.alpha_composite(frame.convert("RGBA"), mist).convert("RGB")

    # Distant fireflies — few, dim, elliptical drift. Stay off the face.
    bugs = Image.new("RGBA", (w, h), (0, 0, 0, 0))
    bd = ImageDraw.Draw(bugs)
    for i, (bx, by) in enumerate(flies):
        phase = 2 * math.pi * t + i * 1.17
        x = w * (bx + 0.018 * math.sin(phase))
        y = h * (by + 0.012 * math.cos(phase * 0.85))
        pulse = 0.35 + 0.25 * math.sin(phase * 0.7 + i)
        r = 2.2 + (i % 3) * 0.6
        a = int(70 * pulse)
        bd.ellipse((x - r * 2.8, y - r * 2.8, x + r * 2.8, y + r * 2.8), fill=(255, 196, 90, a // 3))
        bd.ellipse((x - r, y - r, x + r, y + r), fill=(255, 214, 120, a))
    bugs = bugs.filter(ImageFilter.GaussianBlur(1.4))
    frame = Image.alpha_composite(frame.convert("RGBA"), bugs).convert("RGB")

    # Micro contrast breathe so scales feel wet, not flashing.
    frame = ImageEnhance.Contrast(frame).enhance(1.0 + 0.018 * s)
    frame = ImageEnhance.Brightness(frame).enhance(1.0 + 0.012 * c)
    return frame


def render_token(spec: dict) -> str:
    src = os.path.join(GATORS, spec["src"])
    dest = os.path.join(GATORS, spec["loop"])
    still = Image.open(src).convert("RGB")
    frames = []
    for i in range(N):
        t = i / N
        frame = overlays(ken_burns(still, t), t, spec["warm"], spec["flies"])
        frames.append(frame)
        if i % 20 == 0:
            print(f"  {spec['src']}: {i}/{N}", flush=True)

    try:
        import imageio.v2 as imageio

        imageio.mimwrite(
            dest,
            frames,
            fps=FPS,
            codec="libx264",
            quality=8,
            pixelformat="yuv420p",
            output_params=["-movflags", "+faststart"],
        )
    except Exception as exc:
        print(f"imageio mp4 failed ({exc}); writing webp", flush=True)
        dest = dest.replace(".mp4", ".webp")
        frames[0].save(
            dest,
            save_all=True,
            append_images=frames[1:],
            duration=int(1000 / FPS),
            loop=0,
            quality=82,
            method=4,
        )
    print(f"wrote {dest}", flush=True)
    return dest


def main() -> int:
    for spec in TOKENS:
        still_name = spec["src"].replace(".png", "-still.png")
        still_path = os.path.join(GATORS, still_name)
        src = os.path.join(GATORS, spec["src"])
        if not os.path.exists(still_path):
            Image.open(src).save(still_path)
            print(f"copied still {still_name}", flush=True)
        render_token(spec)
    return 0


if __name__ == "__main__":
    sys.exit(main())
