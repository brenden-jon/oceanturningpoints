"""Sea-level rise and coastal flooding: global and city-level evidence.

Sources (all openly licensed; nothing here is new analysis, only extraction)
  1. IPCC AR6 sea-level projections (Garner et al. 2021, Zenodo
     doi:10.5281/zenodo.6382554, CC BY 4.0; method Kopp et al. 2023 GMD,
     doi:10.5194/gmd-16-7461-2023; assessment Fox-Kemper et al. 2021).
     Relative sea-level change at tide gauges and on a 1° grid, relative to
     1995-2014, medium confidence (SSP1-2.6, SSP2-4.5, SSP5-8.5) and the low-
     confidence SSP5-8.5 "low-likelihood, high-impact" values.
     Only the four needed members are read from the 9 GB zip with HTTP range
     requests (about 390 MB); they are cached in pipeline/.cache/sealevel.
  2. AR6 WGI Figure 9.32 data (CEDA, doi:10.5285/6b33327d0d0d4bcca872b431279086db,
     CC BY 4.0): median amplification factor of today's 1-in-100-year extreme
     still water level at tide gauges, 2050 and 2100.
  3. Observed global mean sea level from satellite altimetry: NOAA Laboratory
     for Satellite Altimetry (public domain).
  4. Ice-sheet mass balance: IMBIE (Otosaka et al. 2026, Scientific Data,
     doi:10.1038/s41597-026-08088-0; data doi:10.5285/128c5e33-5224-4197-82f0-19dcc95b80a0,
     Open Government Licence v3.0).

City values come from the nearest tide gauge where one is close and reliable,
otherwise the nearest 1° grid cell. AR6 values include vertical land motion
estimated from tide gauges and GPS; they do NOT capture present-day subsidence
from groundwater pumping where no gauge records it (for example Jakarta), and
the site says so next to those cities.
"""
from __future__ import annotations

import base64
import io
import struct
import urllib.parse
import urllib.request
import zipfile
import zlib

import numpy as np
import xarray as xr

from common import CACHE, OUT, write_json

C = CACHE / "sealevel"
ZIP = "https://zenodo.org/api/records/6382554/files/ar6-regional-confidence.zip/content"
ROOT = "ar6-regional-confidence/regional/confidence_output_files"
UA = {"User-Agent": "OceanTurningPoints-pipeline (+https://github.com/brenden-jon/oceanturningpoints)"}

# name, country, lat, lon, AR6 location id, location note
CITIES = [
    ("Lagos", "Nigeria", 6.45, 3.39, 1008400030, "1° grid cell; no tide gauge within 380 km", "subsidence"),
    ("Alexandria", "Egypt", 31.20, 29.92, 503, "Alexandria tide gauge", None),
    ("Chittagong", "Bangladesh", 22.33, 91.83, 1496, "Charchanga tide gauge, 81 km", None),
    ("Khulna and Mongla", "Bangladesh", 22.49, 89.60, 1451, "Hiron Point tide gauge, 80 km", None),
    ("Mumbai", "India", 18.94, 72.84, 43, "Mumbai tide gauge", None),
    ("Kolkata", "India", 22.57, 88.36, 543, "Diamond Harbour tide gauge, 46 km", None),
    ("Ho Chi Minh City", "Viet Nam", 10.78, 106.70, 1495, "Vung Tau tide gauge, 64 km", "subsidence"),
    ("Jakarta", "Indonesia", -6.11, 106.88, 1009601070, "1° grid cell; no tide gauge in the AR6 set", "subsidence"),
    ("Manila", "Philippines", 14.58, 120.97, 145, "Manila tide gauge", None),
    ("Bangkok", "Thailand", 13.56, 100.58, 444, "Fort Phrachula Chomklao tide gauge, Chao Phraya mouth", "gauge-subsidence"),
    ("Dar es Salaam", "Tanzania", -6.82, 39.29, 1009700390, "1° grid cell; Zanzibar gauge 75 km", None),
    ("Maputo", "Mozambique", -25.97, 32.57, 1011600330, "1° grid cell", None),
    ("Cartagena", "Colombia", 10.40, -75.55, 572, "Cartagena tide gauge", None),
    ("Guayaquil", "Ecuador", -2.20, -79.90, 1009202800, "1° grid cell", None),
    ("Suva", "Fiji", -18.14, 178.43, 2356, "Suva tide gauge", None),
    ("Malé", "Maldives", 4.18, 73.51, 1753, "Malé (Hulhulé) tide gauge", None),
]
SCENARIOS = [("ssp126", "medium"), ("ssp245", "medium"), ("ssp585", "medium"), ("ssp585", "low")]
ESL = {(s, y): f"Fig9-32{c}_facts_esl_af_allow_{s}_{y}.nc" for c, s, y in
       [("a", "ssp585", 2050), ("b", "ssp585", 2100), ("c", "ssp245", 2050), ("d", "ssp245", 2100), ("e", "ssp126", 2050), ("f", "ssp126", 2100)]}
ESL_URL = "https://dap.ceda.ac.uk/badc/ar6_wg1/data/ch_09/ch9_fig32/v20220721/{}?download=1"
STAR = "https://www.star.nesdis.noaa.gov/socd/lsa/SeaLevelRise/slr/slr_sla_gbl_free_ref_90.csv"
IMBIE_ID = "128c5e33-5224-4197-82f0-19dcc95b80a0"


def http(url: str, headers: dict | None = None, timeout: int = 300) -> bytes:
    with urllib.request.urlopen(urllib.request.Request(url, headers={**UA, **(headers or {})}), timeout=timeout) as r:
        return r.read()


def member(name: str):
    """One AR6 member file, read from the remote zip with HTTP range requests (cached)."""
    out = C / name.split("/")[-1]
    if out.exists():
        return out
    size = int(urllib.request.urlopen(urllib.request.Request(ZIP, headers={**UA, "Range": "bytes=0-0"}), timeout=60)
               .headers["Content-Range"].split("/")[1])
    tail = http(ZIP, {"Range": f"bytes={size - 1_000_000}-{size - 1}"})

    class Tail(io.BytesIO):
        def seek(self, off, whence=0):
            if whence == 0:
                off -= size - len(tail)
            elif whence == 2:
                whence, off = 0, len(tail) + off
            return super().seek(off, whence)

        def tell(self):
            return super().tell() + size - len(tail)

    zi = zipfile.ZipFile(Tail(tail)).getinfo(name)
    hdr = http(ZIP, {"Range": f"bytes={zi.header_offset}-{zi.header_offset + 29}"})
    start = zi.header_offset + 30 + sum(struct.unpack("<HH", hdr[26:30]))
    raw = http(ZIP, {"Range": f"bytes={start}-{start + zi.compress_size - 1}"}, timeout=900)
    C.mkdir(parents=True, exist_ok=True)
    out.write_bytes(zlib.decompress(raw, -15) if zi.compress_type == 8 else raw)
    return out


def r2(v) -> float:
    return round(float(v), 2)


def cities() -> list[dict]:
    out = {c[0]: {"name": c[0], "country": c[1], "lat": c[2], "lon": c[3], "location": c[5], "caveat": c[6], "series": {}, "y2100": {}}
           for c in CITIES}
    ids = [c[4] for c in CITIES]
    for scen, conf in SCENARIOS:
        f = member(f"{ROOT}/{conf}_confidence/{scen}/total_{scen}_{conf}_confidence_values.nc")
        with xr.open_dataset(f) as ds:
            q = [0.05, 0.17, 0.5, 0.83, 0.95]
            sl = (ds.sea_level_change.sel(locations=ids, quantiles=q) / 1000.0).load()
            years = [int(y) for y in sl.years.values if y <= 2150]
            for c, loc in zip(CITIES, ids):
                v = sl.sel(locations=loc)
                if not np.isfinite(v.sel(quantiles=0.5, years=2100)):
                    raise ValueError(f"no AR6 value for {c[0]} at location {loc}")
                key = f"{scen}-{conf}"
                if conf == "medium":
                    out[c[0]]["series"][key] = [[y, r2(v.sel(quantiles=0.17, years=y)), r2(v.sel(quantiles=0.5, years=y)), r2(v.sel(quantiles=0.83, years=y))] for y in years]
                out[c[0]]["y2100"][key] = {k: r2(v.sel(quantiles=p, years=2100)) for k, p in (("p17", 0.17), ("p50", 0.5), ("p83", 0.83), ("p95", 0.95))}
                out[c[0]]["y2050"] = out[c[0]].get("y2050", {})
                out[c[0]]["y2050"][key] = {k: r2(v.sel(quantiles=p, years=2050)) for k, p in (("p17", 0.17), ("p50", 0.5), ("p83", 0.83))}
    # flood frequency amplification at the nearest station within 100 km
    for (scen, year), fname in ESL.items():
        p = C / "esl" / fname
        if not p.exists():
            p.parent.mkdir(parents=True, exist_ok=True)
            p.write_bytes(http(ESL_URL.format(fname)))
        with xr.open_dataset(p) as ds:
            la, lo, af = ds.lat.values, ds.lon.values, ds.af50.values
            names = [s.decode() if isinstance(s, bytes) else str(s) for s in ds.station.values]
            for c in CITIES:
                p1, p2 = np.radians(c[2]), np.radians(la)
                d = 6371 * np.arccos(np.clip(np.sin(p1) * np.sin(p2) + np.cos(p1) * np.cos(p2) * np.cos(np.radians(lo - c[3])), -1, 1))
                i = int(np.argmin(d))
                if d[i] <= 100:
                    rec = out[c[0]].setdefault("floods", {"station": names[i].strip(), "km": round(float(d[i]))})
                    # The source caps the factor at 18,262.5 (daily for 50 years): show it as "at least yearly".
                    rec[f"{scen}-{year}"] = "capped" if af[i] >= 18262 else round(float(af[i]), 1)
    return list(out.values())


def global_projections() -> dict:
    out = {}
    for scen, conf in SCENARIOS:
        f = C / f"global_total_{scen}_{conf}_confidence_values.nc"
        with xr.open_dataset(f) as ds:
            v = ds.sea_level_change.squeeze() / 1000.0
            yrs = [int(y) for y in v.years.values if y <= (2150 if conf == "medium" else 2150)]
            out[f"{scen}-{conf}"] = [[y, r2(v.sel(quantiles=0.17, years=y)), r2(v.sel(quantiles=0.5, years=y)), r2(v.sel(quantiles=0.83, years=y))] for y in yrs]
    return out


def observed_gmsl() -> dict:
    txt = http(STAR).decode()
    rows = []
    for line in txt.splitlines():
        if line.startswith("#") or not line.strip() or line.startswith("year"):
            continue
        p = line.split(",")
        try:
            t = float(p[0]); vals = [float(x) for x in p[1:] if x.strip()]
        except ValueError:
            continue
        if vals:
            rows.append([round(t, 3), round(vals[0], 1)])
    return {"series": rows, "end": rows[-1][0], "source": "NOAA Laboratory for Satellite Altimetry, global mean sea level (reference missions, seasonal signal removed)", "url": STAR}


def imbie() -> dict:
    out = {}
    for sheet in ("greenland", "antarctica"):
        f = f"imbie3_{sheet}_mm_partitioned.csv"
        eid = f"synth:{IMBIE_ID}:" + base64.b64encode(f"/{f}".encode()).decode()
        url = f"https://ramadda.data.bas.ac.uk/repository/entry/get/{f}?entryid={urllib.parse.quote(eid, safe='')}"
        cache = C / f
        if not cache.exists():
            cache.write_bytes(http(url))
        lines = [l for l in cache.read_text().splitlines() if l and not l.startswith("#")]
        head = [h.strip() for h in lines[0].split(",")]
        ci = next(i for i, h in enumerate(head) if "cumulative" in h.lower() and "uncert" not in h.lower() and "smb" not in h.lower() and "dynamic" not in h.lower())
        series = []
        for l in lines[1:]:
            p = l.split(",")
            y, m = int(p[0][:4]), int(p[0][5:7])
            try:
                series.append([round(y + (m - 0.5) / 12, 3), round(-float(p[ci]), 2)])  # sea-level contribution (mm), positive = rise
            except ValueError:
                continue
        base = next(v for t, v in series if t >= 1992)
        out[sheet] = [[t, round(v - base, 2)] for t, v in series if t >= 1992]
    return {"since": 1992, "units": "mm of global sea-level rise", "series": out,
            "source": "IMBIE: Otosaka et al. (2026), Scientific Data; UK Polar Data Centre, Open Government Licence v3.0",
            "doi": "10.1038/s41597-026-08088-0", "dataDoi": f"10.5285/{IMBIE_ID}"}


def main() -> None:
    data = {
        "cities": cities(),
        "global": global_projections(),
        "observed": observed_gmsl(),
        "iceSheets": imbie(),
        "baseline": "1995–2014",
        "sources": {
            "projections": {"cite": "Garner et al. (2021) IPCC AR6 Sea Level Projections, v20210809; Kopp et al. (2023) GMD; Fox-Kemper et al. (2021)",
                            "doi": "10.5281/zenodo.6382554", "licence": "CC BY 4.0"},
            "floods": {"cite": "IPCC AR6 WGI Chapter 9, Figure 9.32 data (Hermans, Garner, Kopp, Slangen), CEDA",
                       "doi": "10.5285/6b33327d0d0d4bcca872b431279086db", "licence": "CC BY 4.0"},
        },
    }
    write_json(data, OUT / "sealevel" / "sealevel.json")
    for c in data["cities"]:
        y = c["y2100"]
        print(f"  {c['name']:18} 2100 SSP2-4.5 {y['ssp245-medium']['p50']:.2f} m; SSP5-8.5 {y['ssp585-medium']['p50']:.2f}; low-conf p95 {y['ssp585-low']['p95']:.2f}; floods {c.get('floods', {}).get('ssp245-2050')}")
    o = data["observed"]; print(f"  observed GMSL to {o['end']}: {o['series'][-1][1]} mm")
    i = data["iceSheets"]["series"]; print(f"  ice sheets since 1992: Greenland {i['greenland'][-1][1]} mm, Antarctica {i['antarctica'][-1][1]} mm")


if __name__ == "__main__":
    main()
