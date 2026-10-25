"""Heat stress at the world's coral reef regions, 1985 to now.

Source
    NOAA Coral Reef Watch, Version 3.1 Daily 5km Satellite Regional Virtual
    Station Time Series. About 214 reef regions worldwide, each a polygon
    around a reef area, with daily sea-surface temperature, HotSpot, Degree
    Heating Weeks (DHW) and Bleaching Alert Area since 1985.
    https://coralreefwatch.noaa.gov/product/vs/data.php
    Use without restriction, with credit to NOAA Coral Reef Watch
    (Skirving et al. 2020, doi:10.3390/rs12233856).

What we publish
    stations.json   one record per region: name, centre, latest DHW and alert
                    level, the peak DHW in each year, and counts of years with
                    reef-wide bleaching risk (DHW >= 4) and mortality risk (>= 8).
    <id>.json       the weekly maximum DHW for the full record, for charts.

Run weekly (the deploy workflow does so on Mondays). Each region file is about
1.3 MB, so a full refresh downloads roughly 280 MB.
"""
from __future__ import annotations

import concurrent.futures as cf
import datetime as dt
import re
import urllib.request

import numpy as np

from common import OUT, write_json

BASE = "https://coralreefwatch.noaa.gov/product/vs"
UA = {"User-Agent": "OceanTurningPoints-pipeline (+https://github.com/brenden-jon/oceanturningpoints)"}
DEST = OUT / "reefs"


def get(url: str, timeout: int = 120, tries: int = 4) -> str:
    import time
    for i in range(tries):
        try:
            with urllib.request.urlopen(urllib.request.Request(url, headers=UA), timeout=timeout) as r:
                return r.read().decode("latin-1")
        except Exception:
            if i == tries - 1:
                raise
            time.sleep(3 * (i + 1))
    raise RuntimeError("unreachable")


def parse(slug: str, txt: str) -> dict:
    lines = txt.splitlines()
    val = lambda key: lines[lines.index(next(l for l in lines if l.strip().startswith(key))) + 1].strip()
    name = val("Name:")
    lon = float(val("Polygon Middle Longitude:"))
    lat = float(val("Polygon Middle Latitude:"))
    rows = []
    for l in lines:
        p = l.split()
        if len(p) == 10 and re.fullmatch(r"\d{4}", p[0]):
            try:
                rows.append((dt.date(int(p[0]), int(p[1]), int(p[2])), float(p[8]), int(float(p[9]))))
            except ValueError:
                continue
    dates = [r[0] for r in rows]
    dhw = np.array([r[1] for r in rows])
    baa = np.array([r[2] for r in rows])
    years = sorted({d.year for d in dates})
    yr = np.array([d.year for d in dates])
    peak = {y: round(float(dhw[yr == y].max()), 1) for y in years}
    # weekly maxima (ISO weeks) for the chart
    weekly: dict[str, float] = {}
    for d, v in zip(dates, dhw):
        k = (d - dt.timedelta(days=d.weekday())).isoformat()
        weekly[k] = max(weekly.get(k, 0.0), float(v))
    full = [y for y in years if y < dates[-1].year]  # complete years only for counts
    count = lambda y0, y1, t: sum(1 for y in full if y0 <= y <= y1 and peak[y] >= t)
    return {
        "id": slug, "name": name, "lat": lat, "lon": lon,
        "latest": {"date": dates[-1].isoformat(), "dhw": round(float(dhw[-1]), 1), "alert": int(baa[-1])},
        "peak": peak,
        "peak2023to2025": max(peak.get(y, 0) for y in (2023, 2024, 2025)),
        "yearsAbove4": {"1986-2005": count(1986, 2005, 4), "2006-2025": count(2006, 2025, 4)},
        "yearsAbove8": {"1986-2005": count(1986, 2005, 8), "2006-2025": count(2006, 2025, 8)},
        # compact: first week start, then one value per week
        "_weekly": {"start": min(weekly), "values": [round(weekly[k], 1) for k in sorted(weekly)]},
    }


def main() -> None:
    index = get(f"{BASE}/data.php")
    slugs = sorted(set(re.findall(r"data/([a-z0-9_]+)\.txt", index)))
    print(f"  {len(slugs)} reef regions listed")
    DEST.mkdir(parents=True, exist_ok=True)
    stations, failed = [], []

    def one(slug: str):
        try:
            return parse(slug, get(f"{BASE}/data/{slug}.txt"))
        except Exception as e:  # keep going; report at the end
            failed.append((slug, str(e)[:80]))
            return None

    with cf.ThreadPoolExecutor(max_workers=6) as ex:
        for s in ex.map(one, slugs):
            if not s:
                continue
            w = s.pop("_weekly")
            write_json({"id": s["id"], "name": s["name"], "weekStart": w["start"], "weekly": w["values"]}, DEST / f"{s['id']}.json")
            stations.append(s)
    stations.sort(key=lambda s: s["name"])
    latest = max(s["latest"]["date"] for s in stations)
    write_json({
        "updated": latest,
        "count": len(stations),
        "thresholds": {"bleaching": 4, "mortality": 8},
        "alertLevels": ["No stress", "Watch", "Warning", "Alert level 1", "Alert level 2", "Alert level 3", "Alert level 4", "Alert level 5"],
        "source": {"org": "NOAA Coral Reef Watch", "product": "Version 3.1 daily 5 km regional virtual stations",
                   "url": f"{BASE}/data.php", "doi": "10.3390/rs12233856",
                   "licence": "Use without restriction; credit NOAA Coral Reef Watch"},
        "stations": stations,
    }, DEST / "stations.json")
    a4 = [s["yearsAbove4"] for s in stations]
    print(f"  wrote {len(stations)} regions (latest {latest}); failed {len(failed)}")
    print(f"  mean years with DHW>=4 per region: 1986-2005 {np.mean([x['1986-2005'] for x in a4]):.1f}, 2006-2025 {np.mean([x['2006-2025'] for x in a4]):.1f}")
    a8 = [s["yearsAbove8"] for s in stations]
    print(f"  mean years with DHW>=8 per region: 1986-2005 {np.mean([x['1986-2005'] for x in a8]):.1f}, 2006-2025 {np.mean([x['2006-2025'] for x in a8]):.1f}")
    print(f"  regions with DHW>=8 at some point in 2023-2025: {sum(1 for s in stations if s['peak2023to2025'] >= 8)}")


if __name__ == "__main__":
    main()
