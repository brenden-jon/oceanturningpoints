"""The ocean now: data refreshed daily by the deploy workflow.

1. Surface currents
    NOAA CoastWatch blended near-real-time sea surface currents
    (noaacwBLENDEDNRTcurrentsDaily): geostrophic currents from satellite
    altimetry plus an Ekman (wind-driven) component, daily, 0.25°.
    https://coastwatch.noaa.gov/erddap/griddap/noaacwBLENDEDNRTcurrentsDaily.html
    US Government work, public domain. We request every second cell (0.5°)
    from ERDDAP and store u and v as an 8-bit RGBA PNG: R = u, G = v, mapped
    linearly from [-CLIP, CLIP] m/s; A = 0 over land or missing data.

2. El Niño–Southern Oscillation
    NOAA Climate Prediction Center, public domain:
      wksst9120.for       weekly Niño-region SST anomalies (OISST v2.1, 1991–2020 base)
      rel_wksst9120.txt   weekly relative Niño indices
      oni.ascii.txt       Oceanic Niño Index (ERSSTv6)
      RONI.ascii.txt      Relative Oceanic Niño Index (ERSSTv6), used by CPC since 2026
      ensodisc.shtml      monthly diagnostic discussion (alert status, synopsis)
    The relative indices subtract the tropical-mean warming trend, so they
    measure the Pacific's east-west contrast that drives El Niño's impacts.

3. Sea-surface temperature anomaly and coral heat stress
    NOAA Coral Reef Watch daily global 5 km products (v3.1): SST anomaly
    (noaacrwsstanomalyDaily) and Degree Heating Weeks (noaacrwdhwDaily), via
    the CoastWatch ERDDAP. Every fifth pixel is taken, giving a 0.25° grid.
    Use without restriction, with credit to NOAA Coral Reef Watch.

4. Sea-ice extent
    NSIDC Sea Ice Index, version 4 (G02135), daily extent for both
    hemispheres. Fetterer et al., doi:10.7265/a98x-0f50. We publish this
    year, last year, the 1981–2010 daily median and the record low for each
    day of the year.

5. Outlooks (forecasts, clearly labelled as such)
    NOAA Coral Reef Watch Four-Month Coral Bleaching Heat Stress Outlook v5,
    60% probability level (Liu et al. 2018, doi:10.3389/fmars.2018.00057),
    weekly. NOAA CPC North American Multi-Model Ensemble (NMME) mean
    sea-surface temperature anomaly forecast (Kirtman et al. 2014,
    doi:10.1175/BAMS-D-12-00050.1), monthly; leads 1–4, masked to ocean.

Every fetch is time-limited. If a source fails, the previous output is kept
and the failure is recorded, so a broken upstream never breaks the site.
"""
from __future__ import annotations

import datetime as dt
import html
import io
import json
import re
import urllib.request

import numpy as np
from PIL import Image

from common import OUT, write_json

NOW = OUT / "now"
UA = {"User-Agent": "OceanTurningPoints-pipeline (+https://github.com/brenden-jon/oceanturningpoints)"}
CLIP = 2.0  # m/s; faster currents are rare outside narrow jets and are clipped
CPC = "https://www.cpc.ncep.noaa.gov"


def get(url: str, timeout: int = 180) -> bytes:
    with urllib.request.urlopen(urllib.request.Request(url, headers=UA), timeout=timeout) as r:
        return r.read()


# ----------------------------------------------------------------- currents

def currents() -> dict:
    sel = "%5B(last)%5D%5B(-89.875):2:(89.875)%5D%5B(-179.875):2:(179.875)%5D"
    url = ("https://coastwatch.noaa.gov/erddap/griddap/noaacwBLENDEDNRTcurrentsDaily.csv"
           f"?u_current{sel},v_current{sel}")
    rows = get(url, 300).decode().splitlines()[2:]
    data = np.genfromtxt(io.StringIO("\n".join(r.split(",", 1)[1] for r in rows)), delimiter=",")
    date = rows[0][:10]
    lat, lon, u, v = data[:, 0], data[:, 1], data[:, 2], data[:, 3]
    lats, lons = np.unique(lat), np.unique(lon)
    U = u.reshape(lats.size, lons.size)[::-1]  # north to south
    V = v.reshape(lats.size, lons.size)[::-1]
    ok = np.isfinite(U) & np.isfinite(V)
    q = lambda a: np.clip(np.rint((np.nan_to_num(a) + CLIP) / (2 * CLIP) * 255), 0, 255).astype(np.uint8)
    rgba = np.dstack([q(U), q(V), np.zeros_like(q(U)), np.where(ok, 255, 0).astype(np.uint8)])
    path = NOW / "currents.png"
    path.parent.mkdir(parents=True, exist_ok=True)
    Image.fromarray(rgba, "RGBA").save(path, optimize=True)
    speed = np.hypot(U, V)[ok]
    return {
        "file": path.name, "date": date,
        "grid": {"lat0": float(lats.max()), "lon0": float(lons.min()), "res": float(lats[1] - lats[0]),
                 "h": int(lats.size), "w": int(lons.size), "rowOrder": "north-to-south"},
        "encoding": {"clip": CLIP, "note": "R = u, G = v, value = -clip + byte/255 * 2 * clip (m/s); alpha 0 = no data"},
        "stats": {"p50": round(float(np.percentile(speed, 50)), 3), "p99": round(float(np.percentile(speed, 99)), 3)},
        "source": {"org": "NOAA CoastWatch", "product": "Blended near-real-time sea surface currents (altimetry geostrophic plus Ekman)",
                   "datasetId": "noaacwBLENDEDNRTcurrentsDaily",
                   "url": "https://coastwatch.noaa.gov/erddap/griddap/noaacwBLENDEDNRTcurrentsDaily.html",
                   "licence": "US Government work, public domain"},
        "bytes": path.stat().st_size,
    }


# --------------------------------------------------- CRW gridded products

ERDDAP = "https://coastwatch.noaa.gov/erddap/griddap"


_REEF_POLYS = None


def reef_mask(lat: np.ndarray, lon: np.ndarray) -> np.ndarray:
    """True for grid cells that overlap a NOAA Coral Reef Watch reef region (5 km virtual-station polygons).

    lat/lon are cell centres (lat north-to-south as stored). Polygons are sampled every 0.025° and any cell
    containing a reef-region sample is kept. Source: coralreefwatch.noaa.gov/product/vs/vs_polygons.json.
    """
    global _REEF_POLYS
    from matplotlib.path import Path as MPath
    if _REEF_POLYS is None:
        d = json.loads(get("https://coralreefwatch.noaa.gov/product/vs/vs_polygons.json", 180))
        rings = []
        for f in d["features"]:
            g = f["geometry"]
            if g["type"] == "Polygon":
                rings += [g["coordinates"][0]]
            elif g["type"] == "MultiPolygon":
                rings += [p[0] for p in g["coordinates"]]
        _REEF_POLYS = [np.asarray(r, dtype=float) for r in rings]
    res = abs(float(lat[0] - lat[1]))
    mask = np.zeros((lat.size, lon.size), dtype=bool)
    step = 0.025
    for r in _REEF_POLYS:
        x0, y0 = r.min(axis=0); x1, y1 = r.max(axis=0)
        xs = np.arange(x0 + step / 2, x1, step); ys = np.arange(y0 + step / 2, y1, step)
        if not xs.size or not ys.size:
            continue
        X, Y = np.meshgrid(xs, ys)
        inside = MPath(r).contains_points(np.c_[X.ravel(), Y.ravel()])
        if not inside.any():
            continue
        px, py = X.ravel()[inside], Y.ravel()[inside]
        i = np.clip(np.rint((lat[0] - py) / res).astype(int), 0, lat.size - 1)
        j = np.clip(np.rint((px - lon[0]) / res).astype(int), 0, lon.size - 1)
        mask[i, j] = True
    return mask


def crw_field(dataset: str, var: str, name: str, scale: dict, tropics_only: bool = False) -> dict:
    import netCDF4 as nc
    from common import encode_grid
    sel = "%5B(last)%5D%5B(89.975):5:(-89.975)%5D%5B(-179.975):5:(179.975)%5D"
    raw = get(f"{ERDDAP}/{dataset}.nc?{var}{sel}", 300)
    d = nc.Dataset("mem.nc", memory=raw)
    a = np.ma.filled(d[var][0].astype(float), np.nan)        # rows north to south
    lat = np.asarray(d["latitude"][:], dtype=float)
    lon = np.asarray(d["longitude"][:], dtype=float)
    t = nc.num2date(d["time"][0], d["time"].units).strftime("%Y-%m-%d")
    if lat[0] < lat[-1]:
        a, lat = a[::-1], lat[::-1]
    if tropics_only:
        # Degree Heating Weeks are a coral bleaching index: show it only where reefs are,
        # and drop flagged or implausible values (sea ice, inland water).
        a[~reef_mask(lat, lon)] = np.nan
        a[a > 60] = np.nan
    meta = encode_grid(a[::-1], NOW / f"{name}.png")             # encode_grid expects south-to-north
    return {**meta, "date": t,
            "grid": {"lat0": float(lat.min()), "lat1": float(lat.max()), "lon0": float(lon.min()), "lon1": float(lon.max()),
                     "res": float(round(lat[0] - lat[1], 4)), "h": int(lat.size), "w": int(lon.size), "rowOrder": "north-to-south"},
            **scale}


def ssta() -> dict:
    return crw_field("noaacrwsstanomalyDaily", "sea_surface_temperature_anomaly", "ssta",
                     {"units": "°C", "domain": 4, "scale": "temperature",
                      "source": {"org": "NOAA Coral Reef Watch", "product": "Daily global 5 km SST anomaly (CoralTemp v3.1), relative to 1985–2012",
                                 "url": "https://coralreefwatch.noaa.gov/product/5km/index_5km_ssta.php", "licence": "Use without restriction; credit NOAA Coral Reef Watch"}})


def dhw() -> dict:
    return crw_field("noaacrwdhwDaily", "degree_heating_week", "dhw",
                     {"units": "°C-weeks", "domain": 16, "scale": "heat",
                      "thresholds": {"bleaching": 4, "severe": 8},
                      "source": {"org": "NOAA Coral Reef Watch", "product": "Daily global 5 km Degree Heating Weeks (v3.1)",
                                 "url": "https://coralreefwatch.noaa.gov/product/5km/index_5km_dhw.php", "licence": "Use without restriction; credit NOAA Coral Reef Watch"}},
                     tropics_only=True)


def sea_ice_field() -> dict:
    """Daily sea-ice concentration on the same 0.25° grid, for the overlay on the globe (ice where >= 15%)."""
    import netCDF4 as nc
    from common import encode_grid
    sel = "%5B(last)%5D%5B(89.975):5:(-89.975)%5D%5B(-179.975):5:(179.975)%5D"
    d = nc.Dataset("ice.nc", memory=get(f"{ERDDAP}/noaacrwsstDaily.nc?sea_ice_fraction{sel}", 300))
    a = np.ma.filled(d["sea_ice_fraction"][0].astype(float), np.nan)
    lat = np.asarray(d["latitude"][:], dtype=float); lon = np.asarray(d["longitude"][:], dtype=float)
    t = nc.num2date(d["time"][0], d["time"].units).strftime("%Y-%m-%d")
    if lat[0] < lat[-1]:
        a, lat = a[::-1], lat[::-1]
    a[(a < 0.15) | (a > 1)] = np.nan
    meta = encode_grid(a[::-1], NOW / "sea_ice.png")
    return {**meta, "date": t,
            "grid": {"lat0": float(lat.min()), "lat1": float(lat.max()), "lon0": float(lon.min()), "lon1": float(lon.max()),
                     "res": float(round(lat[0] - lat[1], 4)), "h": int(lat.size), "w": int(lon.size), "rowOrder": "north-to-south"},
            "units": "fraction", "threshold": 0.15,
            "source": {"org": "NOAA Coral Reef Watch", "product": "CoralTemp v3.1 sea-ice fraction (from the NOAA Geo-Polar Blended analysis)",
                       "url": "https://coralreefwatch.noaa.gov/product/5km/index_5km_sst.php", "licence": "Use without restriction; credit NOAA Coral Reef Watch"}}


# ----------------------------------------------------------------- outlooks

CRW_OUTLOOK = "https://www.star.nesdis.noaa.gov/pub/socd/mecb/crw/data/outlook/v5/nc/v1/outlook"


def bleaching_outlook() -> dict:
    import netCDF4 as nc
    from common import encode_grid
    year = dt.date.today().year
    names = []
    for y in (year, year - 1):
        listing = get(f"{CRW_OUTLOOK}/{y}/", 120).decode("latin-1")
        names = sorted(set(re.findall(r'cfsv2_outlook-060perc_4mon-and-wkly_v5_icwk(\d{8})_for_(\d{8})to(\d{8})\.nc', listing)))
        if names:
            break
    ic, start, end = names[-1]
    fname = f"cfsv2_outlook-060perc_4mon-and-wkly_v5_icwk{ic}_for_{start}to{end}.nc"
    d = nc.Dataset("o.nc", memory=get(f"{CRW_OUTLOOK}/{ic[:4]}/{fname}", 180))
    a = np.ma.filled(np.squeeze(d["CRW_BAA_FourMonth"][:]).astype(float), np.nan)
    lat = np.asarray(d["lat"][:], dtype=float); lon = np.asarray(d["lon"][:], dtype=float)
    if lat[0] < lat[-1]:
        a, lat = a[::-1], lat[::-1]
    if lon.max() > 180:
        k = int(np.argmax(lon > 180)); a = np.roll(a, -k, axis=1); lon = np.roll(np.where(lon > 180, lon - 360, lon), -k)
    a[~reef_mask(lat, lon)] = np.nan
    a[(a < 0) | (a > 4)] = np.nan
    meta = encode_grid(a[::-1], NOW / "bleaching_outlook.png")
    iso = lambda x: f"{x[:4]}-{x[4:6]}-{x[6:]}"
    return {**meta, "date": iso(ic), "validFrom": iso(start), "validTo": iso(end),
            "grid": {"lat0": float(lat.min()), "lat1": float(lat.max()), "lon0": float(lon.min()), "lon1": float(lon.max()),
                     "res": float(round(abs(lat[0] - lat[1]), 4)), "h": int(lat.size), "w": int(lon.size), "rowOrder": "north-to-south"},
            "units": "alert level", "domain": 4, "scale": "heat",
            "categories": ["No stress", "Watch", "Warning", "Alert level 1", "Alert level 2"],
            "source": {"org": "NOAA Coral Reef Watch", "product": "Four-Month Coral Bleaching Heat Stress Outlook v5 (CFSv2), 60% probability",
                       "url": "https://coralreefwatch.noaa.gov/satellite/bleachingoutlook_cfs/outlook_cfs.php", "doi": "10.3389/fmars.2018.00057",
                       "licence": "Use without restriction; credit NOAA Coral Reef Watch"}}


NMME = "https://ftp.cpc.ncep.noaa.gov/NMME/realtime_anom/ENSMEAN"
MONTH_NAMES = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"]


def sst_outlook() -> dict:
    import netCDF4 as nc
    from common import encode_grid
    today = dt.date.today()
    raw, init = None, None
    for back in range(0, 3):
        y, m = today.year, today.month - back
        while m < 1:
            y, m = y - 1, m + 12
        try:
            raw = get(f"{NMME}/{y}{m:02d}0800/NMME.tmpsfc.{y}{m:02d}.ENSMEAN.anom.nc", 180); init = (y, m); break
        except Exception:
            continue
    if raw is None:
        raise RuntimeError("no NMME run found in the last three months")
    d = nc.Dataset("n.nc", memory=raw)
    f = np.ma.filled(d["fcst"][:].astype(float), np.nan)        # (lead, lat, lon), lat 90 -> -90, lon 0..359
    lat = np.asarray(d["lat"][:], dtype=float); lon = np.asarray(d["lon"][:], dtype=float)
    if lat[0] < lat[-1]:
        f, lat = f[:, ::-1], lat[::-1]
    k = int(np.argmax(lon >= 180)); f = np.roll(f, -k, axis=2); lon = np.roll(np.where(lon >= 180, lon - 360, lon), -k)
    # Ocean mask from today's satellite SST anomaly (0.25°): a 1° cell counts as ocean if its centre is ocean.
    ssta = np.asarray(Image.open(NOW / "ssta.png"))             # north to south, 0 = no data
    sm = json.loads((NOW / "manifest.json").read_text())["ssta"]["grid"]
    rows = np.clip(np.rint((sm["lat1"] - lat) / sm["res"]).astype(int), 0, sm["h"] - 1)
    cols = np.clip(np.rint((lon - sm["lon0"]) / sm["res"]).astype(int), 0, sm["w"] - 1)
    ocean = ssta[np.ix_(rows, cols)] > 0
    layers = []
    for lead in range(1, 5):
        a = f[lead].copy()
        a[~ocean] = np.nan
        if not np.isfinite(a).any() or np.nanmax(np.abs(a)) == 0:
            continue
        y, m = init[0], init[1] + lead
        while m > 12:
            y, m = y + 1, m - 12
        meta = encode_grid(a[::-1], NOW / f"sst_outlook_{lead}.png")
        layers.append({**meta, "lead": lead, "month": f"{MONTH_NAMES[m - 1]} {y}"})
    return {"date": f"{init[0]}-{init[1]:02d}-08", "layers": layers,
            "grid": {"lat0": float(lat.min()), "lat1": float(lat.max()), "lon0": float(lon.min()), "lon1": float(lon.max()),
                     "res": 1.0, "h": int(lat.size), "w": int(lon.size), "rowOrder": "north-to-south"},
            "units": "°C", "domain": 4, "scale": "temperature",
            "source": {"org": "NOAA Climate Prediction Center", "product": "North American Multi-Model Ensemble, ensemble-mean sea-surface temperature anomaly forecast",
                       "url": "https://www.cpc.ncep.noaa.gov/products/NMME/", "doi": "10.1175/BAMS-D-12-00050.1", "licence": "Public domain"}}


# ------------------------------------------------------------------ sea ice

def sea_ice() -> dict:
    out = {}
    for hemi, code in (("arctic", "north"), ("antarctic", "south")):
        letter = code[0].upper()
        txt = get(f"https://noaadata.apps.nsidc.org/NOAA/G02135/{code}/daily/data/{letter}_seaice_extent_daily_v4.0.csv").decode()
        rows = []
        for line in txt.splitlines()[2:]:
            p = [x.strip() for x in line.split(",")[:4]]
            try:
                d = dt.date(int(p[0]), int(p[1]), int(p[2])); rows.append((d, float(p[3])))
            except (ValueError, IndexError):
                continue
        by_doy: dict[int, dict[int, float]] = {}
        for d, v in rows:
            doy = min(d.timetuple().tm_yday, 365)
            by_doy.setdefault(doy, {})[d.year] = v
        last = rows[-1][0]
        clim, low = [], []
        for doy in range(1, 366):
            vals = by_doy.get(doy, {})
            base = [v for y, v in vals.items() if 1981 <= y <= 2010]
            prior = {y: v for y, v in vals.items() if y < last.year}
            clim.append(round(float(np.median(base)), 3) if base else None)
            if prior:
                y = min(prior, key=prior.get); low.append([y, round(prior[y], 3)])
            else:
                low.append(None)
        series = lambda yr: [[min(d.timetuple().tm_yday, 365), round(v, 3)] for d, v in rows if d.year == yr]
        today = rows[-1][1]
        doy = min(last.timetuple().tm_yday, 365)
        ranks = sorted(v for y, v in by_doy.get(doy, {}).items() if y < last.year or y == last.year)
        out[hemi] = {"date": last.isoformat(), "extent": round(today, 3), "median8110": clim[doy - 1],
                     "rankLowest": ranks.index(today) + 1 if today in ranks else None, "years": len(ranks),
                     "thisYear": series(last.year), "lastYear": series(last.year - 1), "median": clim, "recordLow": low}
    return {"units": "million km²", **out,
            "source": {"org": "National Snow and Ice Data Center", "product": "Sea Ice Index, version 4 (G02135)",
                       "doi": "10.7265/a98x-0f50", "url": "https://nsidc.org/data/g02135/versions/4",
                       "note": "Extent is the area of ocean with at least 15% ice concentration."}}


def sea_ice_maps() -> dict:
    """Latest NSIDC Sea Ice Index daily extent maps (with the 1981-2010 median edge), cropped to the map panel."""
    out = {}
    for code in ("north", "south"):
        letter = code[0].upper()
        base = f"https://noaadata.apps.nsidc.org/NOAA/G02135/{code}/daily/images/"
        year = max(re.findall(r'href="(\d{4})/"', get(base).decode()))
        month = sorted(re.findall(r'href="(\d{2}_\w{3})/"', get(base + f"{year}/").decode()))[-1]
        files = sorted(re.findall(rf'href="({letter}_(\d{{8}})_extn_hires_v[\d.]+\.png)"', get(base + f"{year}/{month}/").decode()))
        fname, ymd = files[-1]
        im = Image.open(io.BytesIO(get(base + f"{year}/{month}/{fname}"))).convert("RGB")
        a = np.asarray(im)
        # the map panel is everything that is not the dark grey frame
        frame = a[2, 2]
        mask = np.any(np.abs(a.astype(int) - frame.astype(int)) > 6, axis=2)
        rows = np.where(mask.mean(axis=1) > 0.5)[0]; cols = np.where(mask.mean(axis=0) > 0.5)[0]
        x0, y0, x1, y1 = int(cols[0]), int(rows[0]), int(cols[-1]) + 1, int(rows[-1]) + 1
        if code == "north":  # tall panel: keep a square around the pole, which sits about 52% of the way down
            side = x1 - x0; cy = y0 + int(0.52 * (y1 - y0))
            y0, y1 = max(y0, cy - side // 2), min(y1, cy - side // 2 + side)
        crop = im.crop((x0, y0, x1, y1))
        crop.thumbnail((720, 760))
        name = f"seaice_{code}.png"
        crop.save(NOW / name, optimize=True)
        out[code] = {"file": name, "date": f"{ymd[:4]}-{ymd[4:6]}-{ymd[6:]}", "w": crop.width, "h": crop.height}
    return out


def world_sst() -> dict:
    """Daily mean sea-surface temperature, 60°S-60°N, from Climate Reanalyzer (NOAA OISST v2.1; CC BY 4.0)."""
    raw = json.loads(get("https://climatereanalyzer.org/clim/sst_daily/json_2clim/oisst2.1_world2_sst_day.json"))
    years = {int(r["name"]): r["data"] for r in raw if r["name"].isdigit()}
    prelim = next((r["data"] for r in raw if r["name"] == "Preliminary"), None)
    clim = next(r["data"] for r in raw if r["name"] == "1991-2020")
    cur = max(years)
    this = list(years[cur])
    if prelim:
        this = [t if t is not None else p for t, p in zip(this, prelim)]
    last = max(i for i, v in enumerate(this) if v is not None)
    years[cur] = this
    rd = lambda v: None if v is None else round(v, 3)
    record = max(((y, i, v) for y, d in years.items() for i, v in enumerate(d) if v is not None and y >= 1982), key=lambda t: t[2])
    prior = [(y, max(v for v in d if v is not None)) for y, d in years.items() if y < cur and y >= 1982]
    prev_rec = max(prior, key=lambda t: t[1])
    date = dt.date(cur, 1, 1) + dt.timedelta(days=last)
    return {
        "units": "°C", "region": "60°S–60°N", "date": date.isoformat(), "latest": rd(this[last]),
        "anomaly": rd(this[last] - clim[last]), "climatology": "1991-2020",
        "recordDaily": {"year": record[0], "date": (dt.date(record[0], 1, 1) + dt.timedelta(days=record[1])).isoformat(), "value": rd(record[2])},
        "previousYearlyMax": {"year": prev_rec[0], "value": rd(prev_rec[1])},
        "years": {str(y): [rd(v) for v in d] for y, d in sorted(years.items()) if y >= 1982},
        "clim": [rd(v) for v in clim],
        "source": {"org": "Climate Reanalyzer, Climate Change Institute, University of Maine", "data": "NOAA OISST v2.1",
                   "url": "https://climatereanalyzer.org/clim/sst_daily/", "licence": "CC BY 4.0",
                   "note": "Recent days are preliminary."},
    }


# ------------------------------------------------------------------ fishing

GFW = "https://gateway.api.globalfishingwatch.org/v3"


def gfw_token() -> str:
    import os
    from pathlib import Path
    tok = os.environ.get("GFW_TOKEN")
    env = Path(__file__).with_name(".env")
    if not tok and env.exists():
        for line in env.read_text().splitlines():
            if line.startswith("GFW_TOKEN="):
                tok = line.split("=", 1)[1].strip()
    if not tok:
        raise RuntimeError("GFW_TOKEN not set")
    return tok


def fishing() -> dict:
    """Apparent fishing effort over the latest 30 days from Global Fishing Watch (AIS; CC BY-SA 4.0).

    Summed by flag state on GFW's 0.1° grid, then onto a 0.25° grid and stored as log10(hours).
    Nothing about individual vessels is kept.
    """
    import csv
    import zipfile
    from common import encode_grid
    tok = gfw_token()
    auth = {"Authorization": f"Bearer {tok}", **UA}
    meta = json.loads(urllib.request.urlopen(urllib.request.Request(f"{GFW}/datasets/public-global-fishing-effort:latest", headers=auth), timeout=60).read())
    end = dt.date.fromisoformat(meta["endDate"][:10])
    start = end - dt.timedelta(days=30)
    body = json.dumps({"geojson": {"type": "Polygon", "coordinates": [[[-180, -85], [180, -85], [180, 85], [-180, 85], [-180, -85]]]}}).encode()
    url = (f"{GFW}/4wings/report?spatial-resolution=LOW&temporal-resolution=ENTIRE&group-by=FLAG"
           f"&datasets[0]=public-global-fishing-effort:latest&date-range={start},{end}&format=CSV&spatial-aggregation=false")
    raw = urllib.request.urlopen(urllib.request.Request(url, data=body, headers={**auth, "Content-Type": "application/json"}, method="POST"), timeout=600).read()
    z = zipfile.ZipFile(io.BytesIO(raw))
    name = next(n for n in z.namelist() if n.endswith(".csv") and "activity" in n)
    res = 0.25
    H, W = int(180 / res), int(360 / res)
    grid = np.zeros((H, W))                      # south-to-north rows
    flags: dict[str, float] = {}
    with z.open(name) as f:
        r = csv.DictReader(io.TextIOWrapper(f, encoding="utf-8"))
        hcol = next(c for c in r.fieldnames if "fishing hours" in c.lower())
        fcol = next((c for c in r.fieldnames if c.strip().lower() == "flag"), None)
        for row in r:
            h = float(row[hcol] or 0)
            if h <= 0:
                continue
            i = min(H - 1, int((float(row["Lat"]) + 90) / res)); j = min(W - 1, int((float(row["Lon"]) + 180) / res))
            grid[i, j] += h
            fl = (row.get(fcol) if fcol else None) or "Unknown"
            flags[fl] = flags.get(fl, 0) + h
    total = float(grid.sum())
    v = np.where(grid >= 0.5, np.log10(np.maximum(grid, 0.5)), np.nan)
    v = np.clip(v, np.log10(0.5), 3)
    enc = encode_grid(v, NOW / "fishing.png")
    top = sorted(flags.items(), key=lambda kv: -kv[1])[:8]
    return {**enc, "date": end.isoformat(), "start": start.isoformat(), "days": 30,
            "grid": {"lat0": -90 + res / 2, "lat1": 90 - res / 2, "lon0": -180 + res / 2, "lon1": 180 - res / 2, "res": res, "h": H, "w": W, "rowOrder": "north-to-south"},
            "units": "hours (log10)", "domain": [round(float(np.log10(0.5)), 3), 3], "scale": "fishing", "totalHours": round(total),
            "topFlags": [[k, round(h / total * 100, 1)] for k, h in top],
            "source": {"org": "Global Fishing Watch", "product": "Apparent fishing effort (AIS), public-global-fishing-effort " + meta.get("id", "").split(":")[-1],
                       "url": "https://globalfishingwatch.org/dataset-and-code-fishing-effort/", "licence": "CC BY-SA 4.0",
                       "citation": "Kroodsma et al. (2018), Science 361, 908-911, doi:10.1126/science.aao5646"}}


# --------------------------------------------------------------------- ENSO

MON = {m: i + 1 for i, m in enumerate("JAN FEB MAR APR MAY JUN JUL AUG SEP OCT NOV DEC".split())}
SEAS = ["DJF", "JFM", "FMA", "MAM", "AMJ", "MJJ", "JJA", "JAS", "ASO", "SON", "OND", "NDJ"]


def weekly() -> list[dict]:
    """Traditional weekly Niño-3.4 anomaly. Fixed-width: values can run together (e.g. 20.6-0.1)."""
    txt = get(f"{CPC}/data/indices/wksst9120.for").decode()
    out = []
    for line in txt.splitlines():
        m = re.match(r"\s*(\d{2})([A-Z]{3})(\d{4})(.*)", line)
        if not m:
            continue
        nums = [float(x) for x in re.findall(r"-?\d+\.\d", m.group(4))]
        if len(nums) != 8:
            continue
        d = dt.date(int(m.group(3)), MON[m.group(2)], int(m.group(1)))
        out.append({"week": d.isoformat(), "nino34": nums[5], "nino12": nums[1], "nino4": nums[7]})
    return out


def weekly_relative() -> dict[str, float]:
    txt = get(f"{CPC}/data/indices/rel_wksst9120.txt").decode()
    out = {}
    for line in txt.splitlines():
        m = re.match(r"\s*(\d{2})([A-Z]{3})(\d{4})\s+(-?\d+\.\d+)\s+(-?\d+\.\d+)\s+(-?\d+\.\d+)\s+(-?\d+\.\d+)", line)
        if m:
            d = dt.date(int(m.group(3)), MON[m.group(2)], int(m.group(1)))
            out[d.isoformat()] = float(m.group(6))  # columns: Nino1+2, Nino3, Nino34, Nino4
    return out


def seasonal(name: str, col: int) -> list[dict]:
    txt = get(f"{CPC}/data/indices/{name}").decode()
    out = []
    for line in txt.splitlines()[1:]:
        p = line.split()
        if len(p) > col and p[0] in SEAS:
            out.append({"season": p[0], "year": int(p[1]), "value": float(p[col])})
    return out


def discussion() -> dict:
    page = get(f"{CPC}/products/analysis_monitoring/enso_advisory/ensodisc.shtml").decode("latin-1")
    text = html.unescape(re.sub(r"<[^>]+>", " ", page))
    text = re.sub(r"\s+", " ", text)
    status = re.search(r"ENSO Alert System Status:\s*(.+?)(?:Synopsis:|$)", text)
    synopsis = re.search(r"Synopsis:\s*(.+?)(?:\s{2}|(?<=\.)\s+[A-Z][a-z]+ (?:conditions|SST|The))", text)
    issued = re.search(r"issued by\s+CLIMATE PREDICTION CENTER.*?(\d{1,2} [A-Z][a-z]+ \d{4})", text, re.I)
    return {
        "status": status.group(1).strip().rstrip(".") if status else None,
        "synopsis": synopsis.group(1).strip() if synopsis else None,
        "issued": issued.group(1) if issued else None,
        "url": f"{CPC}/products/analysis_monitoring/enso_advisory/ensodisc.shtml",
    }


def enso() -> dict:
    w = weekly()
    rel = weekly_relative()
    for r in w:
        r["relative34"] = rel.get(r["week"])
    oni = seasonal("oni.ascii.txt", 3)
    roni = seasonal("RONI.ascii.txt", 2)
    disc = discussion()
    latest = w[-1]
    rec = max(w, key=lambda r: r["nino34"])
    return {
        "latest": latest,
        "weeklyRecord": {"week": rec["week"], "nino34": rec["nino34"]},
        "weekly": w[-160:],  # about three years
        "oni": oni,
        "roni": roni,
        "discussion": disc,
        "thresholds": {"elNino": 0.5, "laNina": -0.5, "note": "NOAA: El Niño when the 3-month index is at or above +0.5 °C, with atmospheric coupling"},
        "source": {"org": "NOAA Climate Prediction Center", "licence": "US Government work, public domain",
                   "weekly": f"{CPC}/data/indices/wksst9120.for", "relativeWeekly": f"{CPC}/data/indices/rel_wksst9120.txt",
                   "oni": f"{CPC}/data/indices/oni.ascii.txt", "roni": f"{CPC}/data/indices/RONI.ascii.txt"},
    }


# --------------------------------------------------------------------- main

def run(name, fn, status):
    try:
        result = fn()
        status[name] = {"ok": True}
        return result
    except Exception as e:  # keep the previous file; record the failure
        print(f"  {name}: FAILED ({e})")
        status[name] = {"ok": False, "error": str(e)[:200]}
        return None


def main() -> None:
    NOW.mkdir(parents=True, exist_ok=True)
    status: dict = {}
    manifest_path = NOW / "manifest.json"
    manifest = json.loads(manifest_path.read_text()) if manifest_path.exists() else {}
    c = run("currents", currents, status)
    if c:
        manifest["currents"] = c
        print(f"  currents {c['date']}: {c['bytes']/1e3:.0f} kB, median speed {c['stats']['p50']} m/s")
    e = run("enso", enso, status)
    if e:
        write_json(e, NOW / "enso.json")
        manifest["enso"] = {"file": "enso.json", "week": e["latest"]["week"], "nino34": e["latest"]["nino34"],
                            "relative34": e["latest"]["relative34"], "status": e["discussion"]["status"]}
        print(f"  ENSO week {e['latest']['week']}: Niño-3.4 {e['latest']['nino34']:+.1f} °C (relative {e['latest']['relative34']}), status: {e['discussion']['status']}")
    for key, fn in (("ssta", ssta), ("dhw", dhw), ("seaIceField", sea_ice_field)):
        r = run(key, fn, status)
        if r:
            manifest[key] = r
            print(f"  {key} {r['date']}: {r['bytes']/1e3:.0f} kB, range {r['vmin']}..{r['vmax']}")
    for key, fn in (("bleachingOutlook", bleaching_outlook), ("sstOutlook", sst_outlook)):
        r = run(key, fn, status)
        if r:
            manifest[key] = r
            print(f"  {key}: issued {r['date']}" + (f", months {[l['month'] for l in r['layers']]}" if 'layers' in r else f", valid {r['validFrom']} to {r['validTo']}"))
    ice = run("seaIce", sea_ice, status)
    if ice:
        write_json(ice, NOW / "sea_ice.json")
        manifest["seaIce"] = {"file": "sea_ice.json", **{h: {k: ice[h][k] for k in ("date", "extent", "median8110", "rankLowest", "years")} for h in ("arctic", "antarctic")}}
        for h in ("arctic", "antarctic"):
            i = ice[h]; print(f"  {h} sea ice {i['date']}: {i['extent']} vs median {i['median8110']} (rank {i['rankLowest']} lowest of {i['years']})")
    maps = run("seaIceMaps", sea_ice_maps, status)
    if maps:
        manifest["seaIceMaps"] = maps
        print(f"  sea-ice maps: {maps['north']['date']} / {maps['south']['date']}")
    w = run("worldSst", world_sst, status)
    if w:
        write_json(w, NOW / "sst_world.json")
        manifest["worldSst"] = {"file": "sst_world.json", **{k: w[k] for k in ("date", "latest", "anomaly", "recordDaily", "previousYearlyMax")}}
        print(f"  world SST {w['date']}: {w['latest']} °C ({w['anomaly']:+.2f} vs 1991-2020); record {w['recordDaily']}")
    fish = run("fishing", fishing, status)
    if fish:
        manifest["fishing"] = fish
        print(f"  fishing {fish['start']}..{fish['date']}: {fish['totalHours']:,} hours, {fish['bytes']/1e3:.0f} kB")
    manifest["updated"] = dt.datetime.now(dt.timezone.utc).strftime("%Y-%m-%dT%H:%MZ")
    manifest["status"] = status
    write_json(manifest, manifest_path)


if __name__ == "__main__":
    main()
