"""Coastal flood depth maps around selected cities (WRI Aqueduct Floods v2).

Source
    Ward, P.J., Winsemius, H.C., Kuzma, S., et al. (2020). Aqueduct Floods
    Methodology. Technical Note, World Resources Institute. Data:
    https://aqueduct.wridata.org/AqueductFloods20/ (CC BY 4.0).
    Coastal inundation depth (m) for the 1-in-100-year flood, 30 arc-second
    grid (about 1 km), "with subsidence":
      today   inuncoast_historical_wtsub_hist_rp0100_0.tif
      2050    inuncoast_rcp4p5_wtsub_2050_rp0100_0_perc_50.tif
              (RCP4.5, median sea-level rise from Jevrejeva et al. 2014)

What we do
    Cut a box around each city, classify depth into five bands and write a
    transparent PNG resampled to Web Mercator rows, with its bounds. This is
    display formatting only; no exposure or area statistics are computed.

Caveats shown on the site: flooding is estimated by connecting low land to
the sea on a corrected satellite elevation model (MERIT DEM), assuming no
flood defences; sea-level projections pre-date the IPCC AR6.
"""
from __future__ import annotations

import json

import numpy as np
import rasterio
from PIL import Image
from rasterio.windows import from_bounds

from common import CACHE, OUT, fetch

BASE = "https://aqueduct.wridata.org/AqueductFloods20/"
FILES = {"today": "inuncoast_historical_wtsub_hist_rp0100_0.tif", "2050": "inuncoast_rcp4p5_wtsub_2050_rp0100_0_perc_50.tif"}
# city -> (centre lat, centre lon, half-width in degrees)
BOXES = {
    "Lagos": (6.45, 3.55, 0.75), "Alexandria": (31.05, 30.6, 1.3), "Chittagong": (22.4, 91.75, 0.9),
    "Khulna and Mongla": (22.3, 89.7, 1.3), "Mumbai": (19.05, 72.9, 0.5), "Kolkata": (22.3, 88.3, 1.0),
    "Ho Chi Minh City": (10.3, 106.4, 1.4), "Jakarta": (-6.15, 106.85, 0.55), "Manila": (14.6, 120.9, 0.6),
    "Bangkok": (13.6, 100.6, 0.75), "Dar es Salaam": (-6.85, 39.3, 0.5), "Maputo": (-25.95, 32.65, 0.6),
    "Cartagena": (10.4, -75.5, 0.5), "Guayaquil": (-2.3, -79.9, 0.7), "Suva": (-18.1, 178.45, 0.3), "Malé": (4.2, 73.5, 0.25),
}
BANDS = [(0.0, 0.5, (158, 202, 225)), (0.5, 1.0, (107, 174, 214)), (1.0, 2.0, (49, 130, 189)), (2.0, 3.0, (8, 81, 156)), (3.0, 1e9, (8, 48, 107))]
MAX_LAT = 85.05112878


def merc_y(lat):
    return np.log(np.tan(np.pi / 4 + np.radians(lat) / 2))


def render(src, south, north, west, east, path) -> None:
    win = from_bounds(west, south, east, north, src.transform)
    a = src.read(1, window=win, boundless=True, fill_value=-9999).astype(np.float32)
    h, w = a.shape
    # resample rows so that equal image rows are equal steps in Web Mercator
    ys = np.linspace(merc_y(north), merc_y(south), h)
    lats = np.degrees(2 * np.arctan(np.exp(ys)) - np.pi / 2)
    rows = np.clip(np.rint((north - lats) / (north - south) * (h - 1)).astype(int), 0, h - 1)
    a = a[rows]
    rgba = np.zeros((h, w, 4), np.uint8)
    for lo, hi, col in BANDS:
        m = (a > lo) & (a <= hi)
        rgba[m, :3] = col
        rgba[m, 3] = 225
    img = Image.fromarray(rgba, "RGBA").resize((w * 2, h * 2), Image.NEAREST)
    path.parent.mkdir(parents=True, exist_ok=True)
    img.save(path, optimize=True)


def main() -> None:
    out = OUT / "sealevel" / "floods"
    srcs = {k: rasterio.open(fetch(BASE + f, CACHE / "aqueduct" / f)) for k, f in FILES.items()}
    index = {}
    for city, (lat, lon, r) in BOXES.items():
        s, n, w, e = lat - r, lat + r, lon - r * 1.4, lon + r * 1.4
        slug = city.lower().replace(" ", "-").replace("é", "e")
        for k, src in srcs.items():
            render(src, s, n, w, e, out / f"{slug}_{k}.png")
        index[city] = {"slug": slug, "bounds": [round(w, 4), round(s, 4), round(e, 4), round(n, 4)]}
    meta = {
        "cities": index,
        "layers": {"today": "1-in-100-year coastal flood today (with subsidence)",
                   "2050": "1-in-100-year coastal flood in 2050, intermediate emissions (RCP4.5), median sea-level rise, with subsidence"},
        "bands": [{"from": lo, "to": None if hi > 100 else hi, "color": "#%02x%02x%02x" % col} for lo, hi, col in BANDS],
        "source": {"cite": "WRI Aqueduct Floods v2 (Ward et al., 2020)", "url": "https://www.wri.org/data/aqueduct-floods-hazard-maps",
                   "licence": "CC BY 4.0"},
    }
    (out / "index.json").write_text(json.dumps(meta, ensure_ascii=False, separators=(",", ":")))
    total = sum(p.stat().st_size for p in out.glob("*.png"))
    print(f"  wrote {len(index)} cities x {len(srcs)} layers, {total / 1e6:.1f} MB")


if __name__ == "__main__":
    main()
