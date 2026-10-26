"""Social sharing card for the homepage (public/og/ocean-turning-points.jpg, 1200x630).

A globe centred on the Pacific showing the latest sea-surface temperature anomaly (NOAA Coral Reef Watch,
from public/data/now) over NASA Blue Marble, with the site's name and purpose. Run after ocean_now.py.
"""
from __future__ import annotations

import datetime as dt
import json

import cmocean
import matplotlib.pyplot as plt
import numpy as np
from PIL import Image

from common import OUT
from figures import blue_marble, fonts

ROOT = OUT.parent
NAVY = "#0b1520"


def decode(meta: dict) -> np.ndarray:
    q = np.asarray(Image.open(OUT / "now" / meta["file"]).convert("L"), dtype=float)
    v = meta["vmin"] + (q - 1) / 254 * (meta["vmax"] - meta["vmin"])
    v[q == 0] = np.nan
    return v  # rows north to south


def globe(size: int, lon0: float, lat0: float, ssta: np.ndarray, grid: dict, half: float) -> Image.Image:
    bm = np.asarray(blue_marble(3).convert("RGB"), dtype=float) / 255
    H, W = bm.shape[:2]
    y, x = np.mgrid[0:size, 0:size]
    u = (x + 0.5) / size * 2 - 1
    v = 1 - (y + 0.5) / size * 2
    r2 = u * u + v * v
    inside = r2 <= 1
    z = np.sqrt(np.clip(1 - r2, 0, 1))
    p0, l0 = np.radians(lat0), np.radians(lon0)
    lat = np.arcsin(np.clip(z * np.sin(p0) + v * np.cos(p0), -1, 1))
    lon = l0 + np.arctan2(u, z * np.cos(p0) - v * np.sin(p0))
    lat_d = np.degrees(lat); lon_d = (np.degrees(lon) + 180) % 360 - 180
    # Blue Marble mosaic is Web Mercator
    latc = np.clip(lat_d, -85.05, 85.05)
    my = (1 - np.log(np.tan(np.radians(latc)) + 1 / np.cos(np.radians(latc))) / np.pi) / 2 * H
    mx = (lon_d + 180) / 360 * W
    rgb = bm[np.clip(my.astype(int), 0, H - 1), np.clip(mx.astype(int), 0, W - 1)]
    # anomaly field, equirectangular, rows north to south
    gi = np.clip(((grid["lat1"] - lat_d) / grid["res"]).round().astype(int), 0, grid["h"] - 1)
    gj = np.clip(((lon_d - grid["lon0"]) / grid["res"]).round().astype(int), 0, grid["w"] - 1)
    a = ssta[gi, gj]
    ok = np.isfinite(a) & inside
    col = cmocean.cm.balance(np.clip((a + half) / (2 * half), 0, 1))[..., :3]
    rgb = np.where(ok[..., None], rgb * 0.12 + col * 0.88, rgb)
    # simple limb shading
    shade = 0.55 + 0.45 * z
    rgb = rgb * shade[..., None]
    alpha = np.clip((1 - np.sqrt(r2)) * size / 1.5, 0, 1) * inside
    out = np.dstack([rgb, alpha])
    return Image.fromarray((out * 255).astype(np.uint8), "RGBA")


def main() -> None:
    f = fonts()
    m = json.loads((OUT / "now" / "manifest.json").read_text())
    s = m["ssta"]
    ssta = decode(s)
    when = dt.date.fromisoformat(s["date"]).strftime("%-d %B %Y")
    g = globe(560, -150, 4, ssta, s["grid"], float(s["domain"]))

    fig = plt.figure(figsize=(12, 6.3), dpi=100, facecolor=NAVY)
    ax = fig.add_axes([0.03, 0.05, 0.44, 0.9]); ax.axis("off")
    ax.imshow(g, interpolation="lanczos")
    white, soft = "#ffffff", "#a9b7c6"
    fig.text(0.53, 0.86, "OCEAN TURNING POINTS", fontproperties=f["sans"], fontsize=14, color="#7fb3e6", fontweight=700)
    fig.text(0.53, 0.79, "The big ocean changes,\nand what they mean\nfor decisions", fontproperties=f["serif"], fontsize=32,
             color=white, va="top", linespacing=1.05)
    fig.text(0.53, 0.415, "The Atlantic circulation (AMOC), coral reefs,\nice sheets, El Niño, fish stocks and the\nNorth Atlantic: how likely each change is,\nwhat it would mean, and what to do.",
             fontproperties=f["sans"], fontsize=14, color=soft, va="top", linespacing=1.35)
    fig.text(0.53, 0.135, "oceanturningpoints.org", fontproperties=f["sans"], fontsize=15, color=white, fontweight=700, va="top")
    fig.text(0.53, 0.075, f"Globe: sea temperature compared with normal, {when}.\nNOAA Coral Reef Watch; imagery NASA Blue Marble.",
             fontproperties=f["sans"], fontsize=9.5, color="#6f8296", va="top", linespacing=1.3)
    out = ROOT / "og" / "ocean-turning-points.jpg"
    fig.savefig(out.with_suffix(".png"), dpi=100, facecolor=NAVY)
    plt.close(fig)
    Image.open(out.with_suffix(".png")).convert("RGB").save(out, quality=86, optimize=True, progressive=True)
    out.with_suffix(".png").unlink()
    print(f"  wrote {out.relative_to(ROOT.parent)}")


if __name__ == "__main__":
    main()
