"""AMOC strength through time: one observed record and two sets of model runs.

1. Observations - RAPID-MOCHA array at 26.5°N
    Moat, B. I., et al. RAPID-MOCHA-WBTS Atlantic meridional overturning
    circulation time series, v2024.1a. National Oceanography Centre / NERC
    EDS British Oceanographic Data Centre. doi:10.5285/48d0bf43-0598-ceb2-e063-7086abc062f1
    Variable moc_mar_hc10: overturning transport, 10-day low-pass filtered,
    twice daily. We publish monthly and calendar-year means. Years with less
    than 9 months of data are not given an annual mean.

2. Model - the quasi-equilibrium hosing experiment (CESM1.0.5)
    van Westen, R. M. & Baatsen, M. (2026). AMOC for the PI control and PI
    quasi-equilibrium hosing simulations. Zenodo. doi:10.5281/zenodo.18785979
    (CC BY 4.0). Experiment: van Westen, Kliphuis & Dijkstra (2024),
    Sci. Adv. 10, eadk1189. Freshwater forcing F_H over 20-50°N in the
    Atlantic rises by 3e-4 Sv per year, from 0 to 0.66 Sv over 2,200 model
    years. We take the overturning at 26°N and ~1,000 m depth, the standard
    measure in that paper.

3. Model - the scenario runs behind the temperature maps (CESM1.0.5)
    van Westen, R. M. & Baatsen, M. (2025). AMOC-TEMP-Extremes v1. Zenodo.
    doi:10.5281/zenodo.14586440 (CC BY 4.0). Paper: van Westen & Baatsen
    (2025), GRL, doi:10.1029/2025GL114611. Yearly AMOC strength (0-1000 m,
    26°N) in each branch run. Runs "0600" start from the hysteresis at
    F_H = 0.18 Sv, runs "1500" at F_H = 0.45 Sv.
"""
from __future__ import annotations

import datetime as dt

import netCDF4 as nc
import numpy as np

from common import CACHE, OUT, fetch, write_json

RAPID_URL = "https://rapid.ac.uk/sites/default/files/rapid_data/moc_transports.nc"
HYST_URL = "https://zenodo.org/records/18785979/files/AMOC_PI_QE_hosing.nc?download=1"
ZIP_URL = "https://zenodo.org/records/14586440/files/RenevanWesten/AMOC-TEMP-Extremes-AMOC-TEMP-Extremes_v1.zip?download=1"
ZIP_ROOT = "RenevanWesten-AMOC-TEMP-Extremes-458bcf4/Data"
RUNS = {
    "CESM_0600_RCP45": {"forcing": "RCP4.5, then held at 2100 levels", "freshwater": 0.18},
    "CESM_1500_RCP45": {"forcing": "RCP4.5, then held at 2100 levels", "freshwater": 0.45},
    "CESM_0600_RCP85": {"forcing": "RCP8.5, then held at 2100 levels", "freshwater": 0.18},
    "CESM_1500_RCP85": {"forcing": "RCP8.5, then held at 2100 levels", "freshwater": 0.45},
}


def rapid() -> dict:
    d = nc.Dataset(fetch(RAPID_URL, CACHE / "rapid" / "moc_transports.nc"))
    t0 = dt.datetime(2004, 4, 1)
    days = np.asarray(d["time"][:], dtype=float)
    moc = np.ma.filled(d["moc_mar_hc10"][:].astype(float), np.nan)
    stamps = [t0 + dt.timedelta(days=x) for x in days]
    ym = np.array([s.year * 12 + s.month - 1 for s in stamps])
    monthly = []
    for k in np.unique(ym):
        v = moc[ym == k]
        v = v[np.isfinite(v)]
        if v.size >= 20:  # at least ~10 days of twice-daily samples
            monthly.append([int(k // 12), int(k % 12) + 1, round(float(v.mean()), 2)])
    annual = []
    years = sorted({m[0] for m in monthly})
    for y in years:
        vals = [m[2] for m in monthly if m[0] == y]
        if len(vals) >= 9:
            annual.append([y, round(float(np.mean(vals)), 2), len(vals)])
    whole = moc[np.isfinite(moc)]
    return {
        "source": "RAPID-MOCHA-WBTS, 26.5°N",
        "citation": "Moat, B. I. et al. RAPID-MOCHA-WBTS AMOC time series, " + str(d.version),
        "doi": "10.5285/48d0bf43-0598-ceb2-e063-7086abc062f1",
        "url": "https://rapid.ac.uk/",
        "licence": "Open Government Licence (UK); acknowledge RAPID, funded by NERC and partners",
        "variable": "Overturning transport (moc_mar_hc10), 10-day low-pass filtered",
        "units": "Sv",
        "start": stamps[0].strftime("%Y-%m-%d"),
        "end": stamps[-1].strftime("%Y-%m-%d"),
        "mean": round(float(whole.mean()), 1),
        "monthly": monthly,
        "annual": annual,
    }


def hysteresis() -> dict:
    d = nc.Dataset(fetch(HYST_URL, CACHE / "hysteresis" / "AMOC_PI_QE_hosing.nc"))
    lat, dep = d["lat"][:], d["depth"][:]
    i, j = int(np.argmin(np.abs(lat - 26))), int(np.argmin(np.abs(dep - 1000)))
    years = np.asarray(d["time"][:], dtype=int)
    amoc = np.asarray(d["AMOC"][:, j, i], dtype=float)
    fh = years * 3e-4
    # 25-year running mean, to separate the slow response from year-to-year noise
    k = 25
    smooth = np.convolve(amoc, np.ones(k) / k, mode="same")
    smooth[: k // 2] = np.nan
    smooth[-(k // 2):] = np.nan
    below = np.where(np.nan_to_num(smooth, nan=99) < 5)[0]
    return {
        "source": "CESM1.0.5 quasi-equilibrium hosing (pre-industrial forcing)",
        "citation": "van Westen & Baatsen (2026), Zenodo; experiment from van Westen, Kliphuis & Dijkstra (2024), Science Advances",
        "doi": "10.5281/zenodo.18785979",
        "paperDoi": "10.1126/sciadv.adk1189",
        "licence": "CC BY 4.0",
        "measure": f"Overturning at {float(lat[i]):.1f}°N, {float(dep[j]):.0f} m depth",
        "units": "Sv",
        "rate": "Freshwater forcing rises by 0.0003 Sv per model year",
        "firstYearBelow5SvSmoothed": int(years[below[0]]) if below.size else None,
        "freshwaterAtThatYear": round(float(fh[below[0]]), 3) if below.size else None,
        # every 2nd year is plenty for a chart 1,100 points wide
        "series": [[round(float(f), 4), round(float(a), 2), None if not np.isfinite(s) else round(float(s), 2)]
                   for f, a, s in zip(fh[::2], amoc[::2], smooth[::2])],
    }


def scenario_runs() -> dict:
    from remotezip import RemoteZip

    out = {}
    cache = CACHE / "amoc_ts"
    cache.mkdir(parents=True, exist_ok=True)
    z = None
    for run, meta in RUNS.items():
        dest = cache / f"{run}.nc"
        if not dest.exists():
            z = z or RemoteZip(ZIP_URL)
            dest.write_bytes(z.read(f"{ZIP_ROOT}/{run}/Ocean/AMOC_transport_depth_0-1000m.nc"))
        d = nc.Dataset(dest)
        years = np.asarray(d["time"][:], dtype=int)
        amoc = np.asarray(d["Transport"][:], dtype=float)
        last = amoc[years >= 2400]
        out[run] = {**meta, "series": [[int(y), round(float(a), 2)] for y, a in zip(years, amoc)],
                    "mean2400to2499": round(float(last.mean()), 1)}
    return {
        "source": "CESM1.0.5 branch runs (van Westen & Baatsen 2025, GRL)",
        "doi": "10.5281/zenodo.14586440",
        "paperDoi": "10.1029/2025GL114611",
        "licence": "CC BY 4.0",
        "measure": "Overturning at 26°N, 0-1000 m",
        "units": "Sv",
        "note": "Greenhouse forcing follows the RCP to 2100 and is then held fixed; the maps use the period 2400-2499 of these runs.",
        "runs": out,
    }


def main() -> None:
    data = {"rapid": rapid(), "hysteresis": hysteresis(), "scenarioRuns": scenario_runs()}
    write_json(data, OUT / "amoc" / "series.json")
    r, h = data["rapid"], data["hysteresis"]
    print(f"  RAPID {r['start']} to {r['end']}, mean {r['mean']} Sv, {len(r['annual'])} full years")
    print(f"  hysteresis: smoothed AMOC first below 5 Sv at year {h['firstYearBelow5SvSmoothed']} (F_H {h['freshwaterAtThatYear']} Sv)")
    for k, v in data["scenarioRuns"]["runs"].items():
        print(f"  {k}: mean 2400-2499 = {v['mean2400to2499']} Sv")


if __name__ == "__main__":
    main()
