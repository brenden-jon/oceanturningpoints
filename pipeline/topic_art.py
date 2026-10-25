"""Topic images: one picture per big change, each showing the thing itself.

    coral-reefs     heat stress at the 214 Coral Reef Watch reef regions, 2023-25 peak, on Blue Marble
    el-nino         today's sea-surface temperature anomaly across the Pacific (CRW)
    amoc            schematic of the Atlantic overturning circulation (also used on the AMOC page)
    subpolar-gyre   schematic of the subpolar gyre and its winter convection sites
    ice-sheets      Greenland and Antarctica, NASA Blue Marble in polar projections (GIBS WMS)
    southern-ocean  surface current speed around Antarctica (NOAA CoastWatch) on Blue Marble

The circulation schematics are drawn from the standard textbook description of the
AMOC and subpolar gyre (for example Buckley & Marshall 2016, Rev. Geophys. 54, 5-63);
paths are indicative, not traced from data. Everything else is drawn from data.
"""
from __future__ import annotations

import json

import cmocean
import matplotlib

matplotlib.use("Agg")
import matplotlib.pyplot as plt
import numpy as np
from matplotlib.patches import FancyArrowPatch
from PIL import Image
from scipy.interpolate import splev, splprep

from common import CACHE, OUT, fetch
from figures import bm_crop, fonts

ROOT = OUT.parent
TOPICS = ROOT / "img" / "topics"
W, H = 1200, 800
WARM, COLD, LAND, SEA, INK = "#d6452b", "#1f5fae", "#e6e2d8", "#f3f6f8", "#16191d"


def save(img: Image.Image, slug: str) -> None:
    TOPICS.mkdir(parents=True, exist_ok=True)
    img.convert("RGB").save(TOPICS / f"{slug}.jpg", quality=84, optimize=True, progressive=True)


def merc_y(lat, z=3):
    n = 2 ** z * 256
    lat = np.radians(lat)
    return (1 - np.log(np.tan(lat) + 1 / np.cos(lat)) / np.pi) / 2 * n


def merc_xy(lon, lat, lon_c, lat_c, z=3):
    n = 2 ** z * 256
    x = ((np.asarray(lon) - lon_c + 540) % 360 - 180) / 360 * n + W / 2
    y = merc_y(np.asarray(lat), z) - merc_y(lat_c, z) + H / 2
    return x, y


# ---------------------------------------------------------------- coral reefs
def coral() -> None:
    lon_c, lat_c = 140, -2
    bg = np.asarray(bm_crop(lon_c, lat_c, 3, W, H), dtype=float) / 255
    st = json.loads((OUT / "reefs" / "stations.json").read_text())["stations"]
    fig = plt.figure(figsize=(W / 100, H / 100), dpi=100)
    ax = fig.add_axes((0, 0, 1, 1))
    ax.imshow(bg * 0.78)
    bins = [(4, "#f2e6cf"), (8, "#f4a259"), (12, "#e0542b"), (16, "#b0202a"), (99, "#5e0a1c")]
    for s in sorted(st, key=lambda s: s["peak2023to2025"]):
        v = s["peak2023to2025"]
        c = next(col for mx, col in bins if v < mx)
        x, y = merc_xy(s["lon"], s["lat"], lon_c, lat_c)
        if 0 <= x <= W and 0 <= y <= H:
            ax.scatter([x], [y], s=95, c=c, edgecolors="white", linewidths=1.1, zorder=3)
    ax.set_xlim(0, W); ax.set_ylim(H, 0); ax.axis("off")
    fig.savefig(TOPICS / "coral-reefs.tmp.png", dpi=100)
    plt.close(fig)
    save(Image.open(TOPICS / "coral-reefs.tmp.png"), "coral-reefs")
    (TOPICS / "coral-reefs.tmp.png").unlink()


# ---------------------------------------------------------------- El Nino
def el_nino() -> None:
    m = json.loads((OUT / "now" / "manifest.json").read_text())["ssta"]
    q = np.asarray(Image.open(OUT / "now" / m["file"]), dtype=float)
    v = m["vmin"] + (q - 1) / 254 * (m["vmax"] - m["vmin"])
    v[q == 0] = np.nan
    g = m["grid"]
    v = np.roll(v, -int(round((0 - g["lon0"]) / g["res"])), axis=1)  # columns now start at 0°E
    lats = np.linspace(g["lat1"], g["lat0"], g["h"])
    lon0, lon1, lat0, lat1 = 110, 290, -38, 38  # 0-360 longitudes
    j0, j1 = int(lon0 / g["res"]), int(lon1 / g["res"])
    rows = (lats <= lat1) & (lats >= lat0)
    sub = v[rows][:, j0:j1]
    fig = plt.figure(figsize=(W / 100, H / 100), dpi=100, facecolor="#0e1a24")
    ax = fig.add_axes((0, 0, 1, 1))
    ax.set_facecolor("#3a4148")
    ax.imshow(sub, cmap=cmocean.cm.balance, vmin=-4, vmax=4, extent=(lon0, lon1, lat0, lat1), aspect="auto",
              interpolation="bilinear")
    coast = json.loads((OUT / "geo" / "coastline_50m.geojson").read_text())
    for f in coast["features"]:
        geom = f["geometry"]
        for part in (geom["coordinates"] if geom["type"] == "MultiLineString" else [geom["coordinates"]]):
            a = np.asarray(part)
            x = a[:, 0] % 360
            brk = np.where(np.abs(np.diff(x)) > 180)[0] + 1
            for seg_x, seg_y in zip(np.split(x, brk), np.split(a[:, 1], brk)):
                ax.plot(seg_x, seg_y, color="#ffffff", lw=0.6, alpha=0.8)
    ax.set_xlim(lon0, lon1); ax.set_ylim(lat0, lat1); ax.axis("off")
    fig.savefig(TOPICS / "el-nino.tmp.png", dpi=100, facecolor=fig.get_facecolor())
    plt.close(fig)
    save(Image.open(TOPICS / "el-nino.tmp.png"), "el-nino")
    (TOPICS / "el-nino.tmp.png").unlink()


# ---------------------------------------------------------------- schematics
def land(ax, extent):
    gj = json.loads((OUT / "geo" / "land_110m.geojson").read_text())
    for f in gj["features"]:
        g = f["geometry"]
        polys = g["coordinates"] if g["type"] == "MultiPolygon" else [g["coordinates"]]
        for p in polys:
            a = np.asarray(p[0])
            ax.fill(a[:, 0], a[:, 1], color=LAND, ec="#c9c4b8", lw=0.6, zorder=1)
    ax.set_xlim(extent[0], extent[1]); ax.set_ylim(extent[2], extent[3])
    ax.set_facecolor(SEA)
    ax.set_xticks([]); ax.set_yticks([])
    for s in ax.spines.values():
        s.set_visible(False)


def flow(ax, pts, color, lw=7, alpha=0.95, head=True, z=4, halo=False, dash=None):
    pts = np.asarray(pts, dtype=float)
    tck, _ = splprep([pts[:, 0], pts[:, 1]], s=0, k=min(3, len(pts) - 1))
    x, y = splev(np.linspace(0, 1, 300), tck)
    if halo:
        ax.plot(x[:-4], y[:-4], color=SEA, lw=lw + 5, solid_capstyle="round", zorder=z)
    ax.plot(x[:-4], y[:-4], color=color, lw=lw, alpha=alpha, solid_capstyle="round", zorder=z,
            dashes=dash if dash else (None, None))
    if head:
        ax.add_patch(FancyArrowPatch((x[-10], y[-10]), (x[-1], y[-1]), arrowstyle=f"-|>,head_length={lw * 0.3},head_width={lw * 0.2}",
                                     color=color, lw=0, alpha=1, mutation_scale=10, zorder=z + 0.5))


def sink(ax, lon, lat, r=2.4):
    ax.add_patch(plt.Circle((lon, lat), r, color=COLD, alpha=0.18, zorder=3))
    ax.add_patch(plt.Circle((lon, lat), r * 0.45, color=COLD, alpha=0.9, zorder=5))
    ax.annotate("", (lon, lat - r * 0.25), (lon, lat + r * 0.9), arrowprops=dict(arrowstyle="-|>", color="white", lw=1.6), zorder=6)


def amoc_figure(path, size=(12, 8), labels=True, f=None):
    ext = (-108, 32, -46, 80) if size[0] / size[1] >= 1.45 else (-100, 26, -46, 80)
    fig = plt.figure(figsize=size, dpi=100, facecolor=SEA)
    ax = fig.add_axes((0, 0, 1, 1))
    land(ax, ext)
    # warm upper limb: South Atlantic -> Caribbean -> Gulf Stream -> North Atlantic Current -> Nordic Seas
    flow(ax, [(12, -38), (-5, -28), (-22, -14), (-36, -4), (-48, 5), (-62, 13), (-80, 25), (-76, 32), (-66, 38),
              (-48, 43), (-32, 50), (-18, 56), (-4, 62), (8, 69)], WARM, halo=True, z=5)
    flow(ax, [(-34, 49), (-37, 56), (-44, 60), (-53, 61)], WARM, lw=5, halo=True, z=5)
    # cold lower limb: from the sinking regions south along the western boundary at depth
    flow(ax, [(-2, 66), (-20, 63), (-34, 60), (-46, 54), (-52, 46), (-58, 36), (-60, 26), (-54, 14), (-42, 2),
              (-33, -12), (-38, -28), (-48, -42)], COLD, lw=5, alpha=0.9, z=3, dash=(3, 1.6))
    for lon, lat in [(-55, 58.5), (-37, 61.5), (2, 71)]:
        sink(ax, lon, lat)
    if labels:
        fp = f["sans"] if f else None
        kw = dict(fontproperties=fp, fontsize=21, zorder=8)
        ax.text(-34, 31, "Warm water flows north\nnear the surface", color=WARM, fontweight=700, **kw)
        ax.text(-96, 39, "Gulf Stream", color=WARM, fontweight=700, **kw)
        ax.text(-36, 71.5, "Gives up heat,\ncools and sinks", color=COLD, fontweight=700, **kw)
        ax.text(-98, 5, "Cold, dense water\nreturns south at depth\n(dashed)", color=COLD, fontweight=700, **kw)
        ax.text(-30, -44, "From the South Atlantic\nand Indian Ocean", color=WARM, fontweight=600, fontsize=18,
                fontproperties=fp, zorder=8)
    path.parent.mkdir(parents=True, exist_ok=True)
    fig.savefig(path, dpi=100, facecolor=SEA)
    plt.close(fig)


def amoc(f) -> None:
    tmp = TOPICS / "amoc.tmp.png"
    amoc_figure(tmp, labels=False)
    save(Image.open(tmp), "amoc")
    tmp.unlink()
    # labelled version for the AMOC page, at twice the resolution
    amoc_figure(ROOT / "img" / "amoc-circulation.png", size=(12, 9), labels=True, f=f)
    im = Image.open(ROOT / "img" / "amoc-circulation.png").convert("RGB")
    im.save(ROOT / "img" / "amoc-circulation.png", optimize=True)


def subpolar() -> None:
    ext = (-70, -5, 44, 72)
    fig = plt.figure(figsize=(W / 100, H / 100), dpi=100, facecolor=SEA)
    ax = fig.add_axes((0, 0, 1, 1))
    land(ax, ext)
    # anticlockwise subpolar gyre: North Atlantic Current east, East Greenland Current south,
    # around Cape Farewell, West Greenland Current north, Labrador Current south
    flow(ax, [(-50, 46), (-38, 50), (-26, 54), (-20, 59)], WARM, lw=8)
    flow(ax, [(-24, 66), (-33, 64), (-41, 60.5), (-45, 59.4)], COLD, lw=7)
    flow(ax, [(-46, 59.6), (-51, 62.5), (-56, 66)], COLD, lw=6)
    flow(ax, [(-60, 64), (-60, 58), (-55, 52), (-50, 47)], COLD, lw=7)
    for lon, lat in [(-53, 58), (-38, 60.8)]:
        sink(ax, lon, lat, r=1.6)
    tmp = TOPICS / "subpolar-gyre.tmp.png"
    fig.savefig(tmp, dpi=100, facecolor=SEA)
    plt.close(fig)
    save(Image.open(tmp), "subpolar-gyre")
    tmp.unlink()


# ---------------------------------------------------------------- polar imagery
def polar(crs: str, bbox: tuple[int, int, int, int], w: int, h: int, name: str) -> Image.Image:
    url = ("https://gibs.earthdata.nasa.gov/wms/{c}/best/wms.cgi?SERVICE=WMS&REQUEST=GetMap&VERSION=1.3.0"
           "&LAYERS=BlueMarble_ShadedRelief_Bathymetry&CRS=EPSG:{n}&BBOX={b}&WIDTH={w}&HEIGHT={h}&FORMAT=image/jpeg&STYLES=")
    u = url.format(c=crs.lower().replace(":", ""), n=crs.split(":")[1], b=",".join(map(str, bbox)), w=w, h=h)
    return Image.open(fetch(u, CACHE / "bluemarble" / f"{name}.jpg")).convert("RGB")


def ice_sheets() -> None:
    g = polar("EPSG:3413", (-1250000, -3450000, 1150000, -250000), 600, 800, "greenland_600x800")
    a = polar("EPSG:3031", (-2900000, -3000000, 3100000, 3000000), 800, 800, "antarctica_800")
    out = Image.new("RGB", (W, H))
    out.paste(g.crop((50, 0, 550, 800)).resize((500, 800)), (0, 0))
    out.paste(a.crop((50, 0, 750, 800)), (500, 0))
    save(out, "ice-sheets")


def southern_ocean() -> None:
    R = 6378137.0
    half = 4150000
    a = np.asarray(polar("EPSG:3031", (-half, -half * 2 // 3, half, half * 2 // 3), W, H, "antarctica_wide2"), dtype=float) / 255
    m = json.loads((OUT / "now" / "manifest.json").read_text())["currents"]
    rgba = np.asarray(Image.open(OUT / "now" / m["file"]).convert("RGBA"), dtype=float)
    clip, g = m["encoding"]["clip"], m["grid"]
    u = -clip + rgba[..., 0] / 255 * 2 * clip
    v = -clip + rgba[..., 1] / 255 * 2 * clip
    spd = np.hypot(u, v)
    spd[rgba[..., 3] == 0] = 0
    from scipy.ndimage import gaussian_filter, map_coordinates
    spd = gaussian_filter(spd, 1.2)
    xs = np.linspace(-half, half, W)
    ys = np.linspace(half * 2 / 3, -half * 2 / 3, H)
    X, Y = np.meshgrid(xs, ys)
    rho = np.hypot(X, Y)
    k = R * (1 + np.sin(np.radians(71)))
    lat = 2 * np.degrees(np.arctan(rho / k)) - 90
    lon = np.degrees(np.arctan2(X, Y))
    fi = (g["lat0"] - lat) / g["res"]
    fj = ((lon - g["lon0"]) / g["res"]) % g["w"]
    s = map_coordinates(spd, [fi, fj], order=1, mode="wrap")
    s[lat > -30] = 0
    alpha = np.clip((s - 0.07) / 0.25, 0, 1)[..., None] * 0.85
    glow = np.array([0.55, 0.92, 1.0])
    out = a * 0.8 * (1 - alpha) + glow * alpha
    save(Image.fromarray((np.clip(out, 0, 1) * 255).astype(np.uint8)), "southern-ocean")


def main() -> None:
    f = fonts()
    coral()
    el_nino()
    amoc(f)
    subpolar()
    ice_sheets()
    southern_ocean()
    print("  wrote img/topics/*.jpg and img/amoc-circulation.png")


if __name__ == "__main__":
    main()
