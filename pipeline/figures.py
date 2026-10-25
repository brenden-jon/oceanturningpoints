"""Static images for link previews (Open Graph) and page cards.

Drawn from the published data layers in public/data, decoded exactly as the
browser decodes them, so a shared preview shows the same numbers as the site.
Fonts (Spectral, Hanken Grotesk; SIL Open Font Licence) are fetched into the
cache from the Google Fonts repository.
"""
from __future__ import annotations

import json

import cmocean
import matplotlib

matplotlib.use("Agg")
import matplotlib.pyplot as plt
import numpy as np
from matplotlib import font_manager
from PIL import Image

from common import CACHE, OUT, fetch

ROOT = OUT.parent  # public/
FONTS = {
    "serif": ("https://github.com/google/fonts/raw/main/ofl/spectral/Spectral-Medium.ttf", "Spectral-Medium.ttf"),
    "sans": ("https://github.com/google/fonts/raw/main/ofl/hankengrotesk/HankenGrotesk%5Bwght%5D.ttf", "HankenGrotesk.ttf"),
}
PAPER, INK, MUTED, RULE = "#f5f7f6", "#153647", "#587381", "#d9e2e1"


def fonts() -> dict[str, font_manager.FontProperties]:
    out = {}
    for k, (url, name) in FONTS.items():
        p = fetch(url, CACHE / "fonts" / name)
        font_manager.fontManager.addfont(str(p))
        out[k] = font_manager.FontProperties(fname=str(p))
    return out


def decode(path, meta) -> np.ndarray:
    q = np.asarray(Image.open(path), dtype=np.float64)
    v = meta["vmin"] + (q - 1) / 254 * (meta["vmax"] - meta["vmin"])
    v[q == 0] = np.nan
    return v  # rows north to south, 0.5° grid


def coast_lines():
    gj = json.loads((OUT / "geo" / "coastline_50m.geojson").read_text())
    for f in gj["features"]:
        g = f["geometry"]
        parts = g["coordinates"] if g["type"] == "MultiLineString" else [g["coordinates"]]
        for part in parts:
            a = np.asarray(part)
            yield a[:, 0], a[:, 1]


def fit(lon_c: float, lat0: float, lat1: float, w: float, h: float) -> tuple[float, float, float, float]:
    """Longitude span that fills a w x h box without distorting shapes at mid-latitude."""
    span = (lat1 - lat0) * (w / h) / np.cos(np.deg2rad((lat0 + lat1) / 2))
    return (lon_c - span / 2, lon_c + span / 2, lat0, lat1)


def draw_map(ax, field, cmap, half, extent, stipple=None):
    lon0, lon1, lat0, lat1 = extent
    j0, j1 = int((lon0 + 180) * 2), int((lon1 + 180) * 2) + 1
    i0, i1 = int((90 - lat1) * 2), int((90 - lat0) * 2) + 1
    sub = field[i0:i1, j0:j1]
    ax.set_facecolor("#eef3f3")
    ax.imshow(sub, cmap=cmap, vmin=-half, vmax=half, extent=(lon0, lon1, lat0, lat1), origin="upper",
              interpolation="bilinear", aspect="auto")
    if stipple is not None:
        a = stipple[i0:i1, j0:j1]
        lats = np.linspace(lat1, lat0, a.shape[0])
        lons = np.linspace(lon0, lon1, a.shape[1])
        ii, jj = np.meshgrid(np.arange(0, a.shape[0], 5), np.arange(0, a.shape[1], 5), indexing="ij")
        ok = np.nan_to_num(a[ii, jj]) >= 3.5
        ax.scatter(lons[jj[ok]], lats[ii[ok]], s=1.2, c=INK, alpha=0.55, linewidths=0)
    for x, y in coast_lines():
        ax.plot(x, y, color=INK, lw=0.45, alpha=0.75)
    ax.set_xlim(lon0, lon1)
    ax.set_ylim(lat0, lat1)
    ax.axis("off")


def og(path, field, cmap, half, extent, title, sub, kicker, legend, f, stipple=None):
    fig = plt.figure(figsize=(12, 6.3), dpi=100, facecolor=PAPER)
    ax = fig.add_axes((0.0, 0.0, 0.56, 1.0))
    draw_map(ax, field, cmap, half, extent, stipple)
    fig.text(0.6, 0.88, kicker.upper(), fontproperties=f["sans"], fontsize=13, color=MUTED, fontweight=600)
    fig.text(0.6, 0.83, title, fontproperties=f["serif"], fontsize=30, color=INK, va="top", linespacing=1.0)
    fig.text(0.6, 0.37, sub, fontproperties=f["sans"], fontsize=15, color=MUTED, va="top", linespacing=1.35)
    # legend bar
    lax = fig.add_axes((0.6, 0.14, 0.3, 0.025))
    lax.imshow(np.linspace(0, 1, 256)[None, :], cmap=cmap, aspect="auto")
    lax.set_axis_off()
    fig.text(0.6, 0.10, legend[0], fontproperties=f["sans"], fontsize=11, color=MUTED, va="top")
    fig.text(0.9, 0.10, legend[1], fontproperties=f["sans"], fontsize=11, color=MUTED, va="top", ha="right")
    fig.text(0.6, 0.04, "oceanturningpoints.org", fontproperties=f["sans"], fontsize=12, color=INK, fontweight=600)
    path.parent.mkdir(parents=True, exist_ok=True)
    fig.savefig(path, dpi=100, facecolor=PAPER)
    plt.close(fig)


def blue_marble(z: int = 3) -> Image.Image:
    """Stitch NASA Blue Marble tiles (public domain, via NASA GIBS) into one Web Mercator image."""
    n = 2 ** z
    out = Image.new("RGB", (256 * n, 256 * n))
    for y in range(n):
        for x in range(n):
            url = (f"https://gibs.earthdata.nasa.gov/wmts/epsg3857/best/BlueMarble_ShadedRelief_Bathymetry/default/"
                   f"GoogleMapsCompatible_Level8/{z}/{y}/{x}.jpg")
            out.paste(Image.open(fetch(url, CACHE / "bluemarble" / f"{z}_{y}_{x}.jpg")), (256 * x, 256 * y))
    return out


def bm_crop(lon_c: float, lat_c: float, z: int, w: int, h: int) -> Image.Image:
    """A w x h pixel window of Blue Marble (Web Mercator, zoom z) centred on a point."""
    n, size = 2 ** z, 256
    x = (lon_c + 180) / 360 * n * size
    y = (1 - np.log(np.tan(np.radians(lat_c)) + 1 / np.cos(np.radians(lat_c))) / np.pi) / 2 * n * size
    x0, y0 = int(x - w / 2), int(y - h / 2)
    out = Image.new("RGB", (w, h))
    for ty in range(max(0, y0 // size), min(n, (y0 + h) // size + 1)):
        for tx in range((x0 // size), (x0 + w) // size + 1):
            txw = tx % n
            url = (f"https://gibs.earthdata.nasa.gov/wmts/epsg3857/best/BlueMarble_ShadedRelief_Bathymetry/default/"
                   f"GoogleMapsCompatible_Level8/{z}/{ty}/{txw}.jpg")
            tile = Image.open(fetch(url, CACHE / "bluemarble" / f"{z}_{ty}_{txw}.jpg"))
            out.paste(tile, (tx * size - x0, ty * size - y0))
    return out


# Region views for topic cards: (centre lon, centre lat, zoom)
TOPIC_VIEWS = {
    "amoc": (-35, 35, 3),
    "subpolar-gyre": (-40, 58, 4),
    "southern-ocean": (-45, -64, 4),
    "coral-reefs": (147.5, -18.5, 6),
    "ice-sheets": (-42, 72, 4),
    "el-nino": (-130, 0, 3),
    "ocean-today": (-150, 5, 2),
}


def topic_images() -> None:
    for slug, (lon, lat, z) in TOPIC_VIEWS.items():
        img = bm_crop(lon, lat, z, 1200, 800)
        dest = ROOT / "img" / "topics" / f"{slug}.jpg"
        dest.parent.mkdir(parents=True, exist_ok=True)
        img.save(dest, quality=82, optimize=True, progressive=True)


def og_home(path, f):
    img = blue_marble()
    # Atlantic-centred crop (Web Mercator pixels at zoom 3): Americas, Europe, Africa
    crop = img.crop((560, 520, 560 + 672, 520 + 630)).resize((672, 630), Image.LANCZOS)
    fig = plt.figure(figsize=(12, 6.3), dpi=100, facecolor=PAPER)
    ax = fig.add_axes((0.0, 0.0, 0.56, 1.0))
    ax.imshow(crop)
    ax.axis("off")
    fig.text(0.6, 0.88, "INDEPENDENT SCIENCE ATLAS", fontproperties=f["sans"], fontsize=13, color=MUTED, fontweight=600)
    fig.text(0.6, 0.83, "How is the ocean\nchanging, and what\ndoes it mean for\npeople?", fontproperties=f["serif"], fontsize=30, color=INK, va="top", linespacing=1.0)
    fig.text(0.6, 0.37, "Ocean Turning Points: the science of\na changing ocean, explained with data.", fontproperties=f["sans"], fontsize=15, color=MUTED, va="top", linespacing=1.35)
    fig.text(0.6, 0.13, "Imagery: NASA Blue Marble", fontproperties=f["sans"], fontsize=10.5, color=MUTED)
    fig.text(0.6, 0.06, "oceanturningpoints.org", fontproperties=f["sans"], fontsize=12, color=INK, fontweight=600)
    fig.savefig(path, dpi=100, facecolor=PAPER)
    plt.close(fig)
    # A photograph compresses far better as JPEG
    Image.open(path).convert("RGB").save(path.with_suffix(".jpg"), quality=85, optimize=True)
    path.unlink()


def card(path, field, cmap, half, extent, size=(9, 6), stipple=None):
    fig = plt.figure(figsize=size, dpi=120, facecolor=PAPER)
    ax = fig.add_axes((0, 0, 1, 1))
    draw_map(ax, field, cmap, half, extent, stipple)
    path.parent.mkdir(parents=True, exist_ok=True)
    fig.savefig(path, dpi=120, facecolor=PAPER)
    plt.close(fig)
    Image.open(path).convert("RGB").save(path.with_suffix(".jpg"), quality=86, optimize=True)
    path.unlink()


def main() -> None:
    f = fonts()
    tm = json.loads((OUT / "amoc" / "temperature" / "manifest.json").read_text())
    rm = json.loads((OUT / "amoc" / "rainfall" / "manifest.json").read_text())
    L = next(l for l in tm["layers"] if l["variable"] == "winter" and l["comparison"] == "total-2c-collapse")
    winter = decode(OUT / "amoc" / "temperature" / L["file"], L)
    R = next(l for l in rm["layers"] if l["season"] == "jja")
    rain = decode(OUT / "amoc" / "rainfall" / R["mean"]["file"], R["mean"])
    agree = decode(OUT / "amoc" / "rainfall" / R["agreement"]["file"], R["agreement"])
    G = next(l for l in tm["layers"] if l["variable"] == "annual" and l["comparison"] == "effect-pi")
    annual = decode(OUT / "amoc" / "temperature" / G["file"], G)

    W, H = 12 * 0.56, 6.3  # map panel of the 1200 x 630 preview
    og(ROOT / "og" / "amoc-collapse.png", winter, cmocean.cm.balance, 15, fit(-5, 25, 75, W, H),
       "What would happen\nif the Atlantic\ncirculation\ncollapsed?",
       "Colder European winters in a warming world,\nand weaker monsoons across the tropics.",
       "Atlantic circulation", ("≤ −15 °C winter", "≥ +15 °C"), f)
    og_home(ROOT / "og" / "home.png", f)
    og(ROOT / "og" / "science.png", annual, cmocean.cm.balance, 10, fit(-20, -60, 80, W, H),
       "What is changing\nin the ocean,\nand how do\nwe know?",
       "Short, referenced explainers on the\nocean systems that are changing.",
       "Science", ("≤ −10 °C", "≥ +10 °C"), f)
    card(ROOT / "img" / "amoc-winter.png", winter, cmocean.cm.balance, 15, fit(0, 30, 75, 8, 5.6), size=(8, 5.6))
    card(ROOT / "img" / "amoc-rain.png", rain, matplotlib.colormaps['BrBG'], 50, fit(30, -5, 35, 8, 3.2), size=(8, 3.2), stipple=agree)
    topic_images()
    print("  wrote og/*.png, img/*.jpg and img/topics/*.jpg")


if __name__ == "__main__":
    main()
