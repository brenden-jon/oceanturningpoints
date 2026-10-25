"""Base geography and colour scales.

Geography: Natural Earth (public domain), https://www.naturalearthdata.com
Colour scales: cmocean (Thyng et al. 2016, Oceanography 29(3):9-13,
doi:10.5670/oceanog.2016.66). Perceptually uniform and widely used in ocean
science. We export the exact lookup tables rather than approximating them.
"""
from __future__ import annotations

import json

import cmocean
import matplotlib
import numpy as np

from common import CACHE, OUT, fetch, write_json

NE = "https://raw.githubusercontent.com/nvkelso/natural-earth-vector/master/geojson"
LAYERS = {
    "coastline_110m": "ne_110m_coastline.geojson",
    "coastline_50m": "ne_50m_coastline.geojson",
    "borders_50m": "ne_50m_admin_0_boundary_lines_land.geojson",
    "land_110m": "ne_110m_land.geojson",
}


def round_coords(geom, nd=2):
    def r(c):
        if isinstance(c[0], (int, float)):
            return [round(c[0], nd), round(c[1], nd)]
        return [r(x) for x in c]
    return {"type": geom["type"], "coordinates": r(geom["coordinates"])}


def geography() -> None:
    for key, name in LAYERS.items():
        src = fetch(f"{NE}/{name}", CACHE / "naturalearth" / name)
        gj = json.loads(src.read_text())
        slim = {"type": "FeatureCollection",
                "features": [{"type": "Feature", "properties": {}, "geometry": round_coords(f["geometry"])}
                             for f in gj["features"] if f.get("geometry")]}
        out = OUT / "geo" / f"{key}.geojson"
        out.parent.mkdir(parents=True, exist_ok=True)
        out.write_text(json.dumps(slim, separators=(",", ":")))
        print(f"  {key:16} {out.stat().st_size/1e3:7.0f} kB")


def scales() -> None:
    def lut(cmap, n=256):
        x = cmap(np.linspace(0, 1, n))[:, :3]
        return [[int(round(v * 255)) for v in row] for row in x]
    write_json({
        "source": "cmocean (Thyng et al. 2016), doi:10.5670/oceanog.2016.66; ColorBrewer BrBG (Brewer, colorbrewer2.org) via matplotlib",
        "temperature": {"cmap": "cmocean.balance", "lut": lut(cmocean.cm.balance), "note": "Diverging: cooler is blue, warmer is red, no change is white."},
        "days": {"cmap": "cmocean.balance (reversed)", "lut": lut(cmocean.cm.balance_r), "note": "More frost days is blue (colder), fewer is red."},
        # Brown-to-blue-green, the convention IPCC AR6 uses for precipitation
        # change. Low (negative) values are brown, so drying reads as brown.
        "rainfall": {"cmap": "ColorBrewer BrBG", "lut": lut(matplotlib.colormaps["BrBG"]), "note": "Diverging: drier is brown, wetter is blue-green, no change is white."},
        "sealevel": {"cmap": "cmocean.balance", "lut": lut(cmocean.cm.balance), "note": "Diverging: lower is blue, higher is red."},
    }, OUT / "scales.json")
    print("  scales.json written")


if __name__ == "__main__":
    geography()
    scales()
