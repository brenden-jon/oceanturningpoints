"""Sea-only arrows for the observed range shifts in public/data/fish/shifts.json.

Each study area gets an arrow pointing towards the pole (or the equator) with length scaled to its median shift.
The start point is moved off land to the nearest sea point when the study-area centroid falls on land, and the
arrow is shortened so that it does not cross onto land. Areas with no room for a visible arrow keep only their dot.
Land: Natural Earth 1:50m (public domain), already cached by fish_grid_display.py. Run after fish_shifts.py.
"""
from __future__ import annotations

import json

import numpy as np
from shapely.geometry import LineString, Point, shape
from shapely.ops import unary_union
from shapely.prepared import prep

from common import CACHE, OUT, fetch

LAND = "https://raw.githubusercontent.com/nvkelso/natural-earth-vector/master/geojson/ne_50m_land.geojson"
MIN_LEN = 0.6       # degrees of latitude; shorter arrows are not drawn


def length(km_yr: float) -> float:
    return min(7.0, 0.9 + abs(km_yr) * 0.9)


def main() -> None:
    gj = json.loads(fetch(LAND, CACHE / "naturalearth" / "ne_50m_land.geojson").read_text())
    land = prep(unary_union([shape(f["geometry"]) for f in gj["features"]]))
    path = OUT / "fish" / "shifts.json"
    d = json.loads(path.read_text())
    moved = drawn = 0
    for a in d["areas"]:
        lon, lat = a["lon"], a["lat"]
        if land.contains(Point(lon, lat)):
            # nearest sea point on rings of growing radius, up to 4°
            best = None
            for r in np.arange(0.25, 4.01, 0.25):
                for ang in np.linspace(0, 2 * np.pi, 48, endpoint=False):
                    p = (lon + r * np.cos(ang) / max(0.2, np.cos(np.radians(lat))), lat + r * np.sin(ang))
                    if -90 < p[1] < 90 and not land.contains(Point(p)):
                        best = p
                        break
                if best:
                    break
            if best:
                lon, lat = round(best[0], 2), round(best[1], 2)
                moved += 1
        a["seaLon"], a["seaLat"] = lon, lat
        pole = -1 if a["hemisphere"] == "South" else 1
        direction = int(np.sign(a["medianKmYr"])) * pole
        a["arrow"] = None
        if not direction:
            continue
        L = length(a["medianKmYr"])
        # shorten in small steps until the shaft stays at sea
        while L >= MIN_LEN:
            tip = (lon, lat + direction * L)
            if not land.intersects(LineString([(lon, lat), tip])):
                break
            L -= 0.2
        if L >= MIN_LEN:
            a["arrow"] = [[lon, lat], [lon, round(lat + direction * L, 2)]]
            drawn += 1
    d["source"]["arrows"] = ("Arrows point towards the pole or the equator, with length scaled to the area's median shift. They are "
                             "shortened where they would cross land; areas whose centroid falls on land are drawn from the nearest sea point.")
    path.write_text(json.dumps(d, ensure_ascii=False, separators=(",", ":")))
    print(f"  arrows: {drawn} drawn, {moved} start points moved off land, of {len(d['areas'])} areas")


if __name__ == "__main__":
    main()
