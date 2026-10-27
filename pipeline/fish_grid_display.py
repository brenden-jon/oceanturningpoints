"""Display version of the FishMIP median maps: 0.25° with a clean coastline.

The 1° model grid leaves blocky cells over land and gaps along coasts. This step resamples each median layer to
0.25°, fills ocean cells within about 2° of data from the nearest model cell, and blanks land using Natural Earth
1:50m land (public domain). Values are not changed, only placed on a finer grid. Run after fish_grid.py.

Output: public/data/fish/grid_<key>_median_display.png and a "display" entry per layer in grid.json.
"""
from __future__ import annotations

import json

import numpy as np
import rasterio.features
from PIL import Image
from rasterio.transform import from_origin
from scipy import ndimage

from common import CACHE, OUT, encode_grid, fetch

DEST = OUT / "fish"
LAND = "https://raw.githubusercontent.com/nvkelso/natural-earth-vector/master/geojson/ne_50m_land.geojson"
RES = 0.25


def decode(meta: dict) -> np.ndarray:
    q = np.asarray(Image.open(DEST / meta["file"]).convert("L"), dtype=float)
    v = meta["vmin"] + (q - 1) / 254 * (meta["vmax"] - meta["vmin"])
    v[q == 0] = np.nan
    return v  # rows north to south


def land_mask() -> np.ndarray:
    gj = json.loads(fetch(LAND, CACHE / "naturalearth" / "ne_50m_land.geojson").read_text())
    shapes = [(f["geometry"], 1) for f in gj["features"]]
    h, w = int(180 / RES), int(360 / RES)
    return rasterio.features.rasterize(shapes, out_shape=(h, w), transform=from_origin(-180, 90, RES, RES), fill=0, dtype="uint8").astype(bool)


def main() -> None:
    index = json.loads((DEST / "grid.json").read_text())
    land = land_mask()
    k = int(round(1 / RES))
    for key, layer in index.items():
        if not key.startswith("ssp"):
            continue
        med = decode(layer["median"])                          # 180 x 360, north to south
        fine = np.kron(med, np.ones((k, k)))                   # nearest-neighbour to 0.25°
        missing = ~np.isfinite(fine)
        dist, (ii, jj) = ndimage.distance_transform_edt(missing, return_indices=True)
        filled = fine[ii, jj]
        filled[dist > 2 / RES] = np.nan                        # do not invent values far from any model cell
        filled[land] = np.nan
        meta = encode_grid(filled[::-1], DEST / f"grid_{key}_median_display.png")   # encode_grid wants south-to-north
        layer["display"] = {**meta, "grid": {"lat0": -90 + RES / 2, "lat1": 90 - RES / 2, "lon0": -180 + RES / 2, "lon1": 180 - RES / 2,
                                             "res": RES, "h": int(180 / RES), "w": int(360 / RES), "rowOrder": "north-to-south"},
                            "units": "%", "domain": layer["median"]["domain"],
                            "meaning": "The ensemble median resampled to 0.25° for display: coastal ocean cells filled from the nearest model cell (up to 2°), land blanked (Natural Earth 1:50m)."}
        print(f"  {key}: display layer {meta['bytes'] / 1e3:.0f} kB")
    (DEST / "grid.json").write_text(json.dumps(index, indent=1, ensure_ascii=False))


if __name__ == "__main__":
    main()
