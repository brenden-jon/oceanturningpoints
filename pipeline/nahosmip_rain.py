"""Rainfall after an AMOC collapse, across four independent climate models.

Source
    Ben-Yami, M., Good, P., Jackson, L. C., Crucifix, M., Hu, A., Saenko, O.,
    Swingedouw, D. & Boers, N. (2024). Impacts of AMOC collapse on monsoon
    rainfall: a multi-model comparison. Earth's Future 12, e2023EF003959.
    doi:10.1029/2023EF003959

Data
    Jackson, L. C., Bellomo, K., et al. (2025). NAHosMIP - monthly surface air
    temperature and precipitation v3. Zenodo. doi:10.5281/zenodo.14884357
    (CC BY 4.0). Protocol: Jackson et al. (2023), Geosci. Model Dev. 16,
    1975-1995, doi:10.5194/gmd-16-1975-2023.

Method (following Ben-Yami et al. 2024)
    Four models whose AMOC stays collapsed after the freshwater forcing is
    switched off: HadGEM3-GC31-MM, CanESM5, CESM2 and IPSL-CM6A-LR. For each,
    rainfall in the "weak AMOC" run (u03-r50; u03-r100 for IPSL, i.e. after
    0.3 Sv of hosing for 50 or 100 years and then none) is compared with the
    model's own pre-industrial control. Using the post-hosing state avoids
    attributing the direct effect of artificial freshwater to the collapse.

    Per model, the percentage change is computed on the model's own grid and
    then interpolated to a common 0.5° grid. The ensemble mean is the mean of
    the four percentage changes. Agreement counts how many of the four share
    the sign of the ensemble mean.

    Percentage change is undefined where it barely rains, so grid cells where
    the control climate receives under 0.3 mm/day (~110 mm/yr) are left blank.

Caution, from the paper itself: with four models, the ensemble mean is "a
tool to showcase the pattern of precipitation change where the models agree",
not the most accurate prediction.
"""
from __future__ import annotations

import tarfile
from pathlib import Path

import numpy as np
import xarray as xr

from common import CACHE, GRID, LAT, LON, OUT, PLACES, encode_grid, fetch, sample, write_json

RECORD = "14884357"
MODELS = {
    "HadGEM3-GC31-MM": {"tar": "pr_Amon_HadGEM3-GC31-MM_r1i1p1f1_gn.tar", "weak": "u03-r50"},
    "CanESM5":         {"tar": "pr_Amon_CanESM5_r1i1p2f1_gn.tar",         "weak": "u03-r50"},
    "CESM2":           {"tar": "pr_Amon_CESM2.tar",                        "weak": "u03-r50"},
    "IPSL-CM6A-LR":    {"tar": "pr_Amon_IPSL-CM6A-LR_r1i1p1f1_gn.tar",    "weak": "u03-r100"},
}
SEASONS = {"annual": list(range(1, 13)), "jja": [6, 7, 8], "djf": [12, 1, 2]}
DRY_MM_DAY = 0.3
S_PER_DAY = 86400.0

# Approximate monsoon boxes, used only to sanity-check against the published
# ensemble means. The paper's exact boxes are in its supplement (Table S2);
# these are not claimed to reproduce them.
CHECK_BOXES = {
    "West African monsoon":  {"lon": (-15, 15), "lat": (5, 18),   "published": -29.07},
    "Indian summer monsoon": {"lon": (70, 90),  "lat": (10, 28),  "published": -18.76},
    "Southern Amazon":       {"lon": (-65, -45), "lat": (-15, 0), "published": 43.79},
}


def extract(model: str) -> Path:
    spec = MODELS[model]
    tar_path = fetch(f"https://zenodo.org/records/{RECORD}/files/{spec['tar']}?download=1", CACHE / "nahosmip" / spec["tar"])
    out = CACHE / "nahosmip" / model
    if not out.exists():
        out.mkdir(parents=True)
        with tarfile.open(tar_path) as t:
            for m in t.getmembers():
                if ("_piControl_" in m.name or f"_{spec['weak']}_" in m.name) and m.name.endswith(".nc"):
                    t.extract(m, out, filter="data")
    return out


def season_means(files: list[Path]) -> dict[str, xr.DataArray]:
    """Mean rainfall (mm/day) per season, accumulated file by file to bound memory."""
    sums: dict[str, xr.DataArray | None] = {k: None for k in SEASONS}
    counts = {k: 0 for k in SEASONS}
    for f in sorted(files):
        ds = xr.open_dataset(f, decode_times=xr.coders.CFDatetimeCoder(use_cftime=True))
        pr = ds["pr"] * S_PER_DAY
        months = pr["time"].dt.month
        for key, ms in SEASONS.items():
            sel = pr.where(months.isin(ms), drop=True)
            if sel.sizes.get("time", 0) == 0:
                continue
            s = sel.sum("time").load()
            sums[key] = s if sums[key] is None else sums[key] + s
            counts[key] += int(sel.sizes["time"])
        ds.close()
    return {k: sums[k] / counts[k] for k in SEASONS}


def to_common_grid(da: xr.DataArray) -> np.ndarray:
    lat_name = "lat" if "lat" in da.dims else "latitude"
    lon_name = "lon" if "lon" in da.dims else "longitude"
    da = da.rename({lat_name: "lat", lon_name: "lon"})
    lon = ((da["lon"] + 180) % 360) - 180
    da = da.assign_coords(lon=lon).sortby("lon").sortby("lat")
    # Pad one column each side so interpolation wraps cleanly across the dateline.
    left = da.isel(lon=-1).assign_coords(lon=da["lon"][-1] - 360)
    right = da.isel(lon=0).assign_coords(lon=da["lon"][0] + 360)
    da = xr.concat([left, da, right], dim="lon")
    return da.interp(lat=LAT, lon=LON, method="linear").values


def box_mean(field: np.ndarray, box: dict) -> float:
    la = (LAT >= box["lat"][0]) & (LAT <= box["lat"][1])
    lo = (LON >= box["lon"][0]) & (LON <= box["lon"][1])
    sub = field[np.ix_(la, lo)]
    w = np.cos(np.deg2rad(LAT[la]))[:, None] * np.ones(lo.sum())[None, :]
    ok = np.isfinite(sub)
    return float((sub[ok] * w[ok]).sum() / w[ok].sum())


def main(models: list[str] | None = None) -> None:
    models = models or list(MODELS)
    pct: dict[str, dict[str, np.ndarray]] = {s: {} for s in SEASONS}
    ctrl_mm: dict[str, dict[str, np.ndarray]] = {s: {} for s in SEASONS}
    delta_mm: dict[str, dict[str, np.ndarray]] = {s: {} for s in SEASONS}
    used = []

    for m in models:
        d = extract(m)
        # Skip macOS resource-fork entries ("._*") that some archives carry.
        ctrl_files = [f for f in d.rglob("*_piControl_*.nc") if not f.name.startswith("._")]
        weak_files = [f for f in d.rglob(f"*_{MODELS[m]['weak']}_*.nc") if not f.name.startswith("._")]
        if not ctrl_files or not weak_files:
            print(f"  {m}: missing runs, skipped")
            continue
        print(f"  {m}: {len(ctrl_files)} control files, {len(weak_files)} weak-AMOC files")
        c, w = season_means(ctrl_files), season_means(weak_files)
        for s in SEASONS:
            cg, wg = to_common_grid(c[s]), to_common_grid(w[s])
            with np.errstate(divide="ignore", invalid="ignore"):
                p = (wg - cg) / cg * 100.0
            p[cg < DRY_MM_DAY] = np.nan
            pct[s][m], ctrl_mm[s][m], delta_mm[s][m] = p, cg, wg - cg
        used.append(m)

    out_dir = OUT / "amoc" / "rainfall"
    layers, places, checks, means = [], [], {}, {}
    for s in SEASONS:
        stack = np.stack([pct[s][m] for m in used])
        mean = np.mean(stack, axis=0)
        valid = np.isfinite(stack).all(axis=0)
        mean[~valid] = np.nan  # only where every model has a meaningful percentage
        means[s] = mean
        sign = np.sign(mean)
        agree = np.where(valid, (np.sign(stack) == sign[None]).sum(axis=0), 0).astype(float)
        meta = encode_grid(mean, out_dir / f"rain_{s}_mean.png")
        ameta = encode_grid(np.where(valid, agree, np.nan), out_dir / f"rain_{s}_agreement.png")
        layers.append({"season": s, "mean": meta, "agreement": ameta})
        if s == "annual":
            for name, box in CHECK_BOXES.items():
                per_model = {m: round(box_mean(pct[s][m], box), 1) for m in used}
                checks[name] = {"ensembleMeanOfPercent": round(float(np.mean(list(per_model.values()))), 1),
                                "perModel": per_model, "published": box["published"],
                                "box": box}

    for pl in PLACES:
        rec = {k: pl[k] for k in ("name", "country", "lat", "lon", "region")}
        rec["rain"] = {}
        for s in SEASONS:
            rec["rain"][s] = {
                "mean": sample(means[s], pl["lat"], pl["lon"]),
                "perModel": {m: sample(pct[s][m], pl["lat"], pl["lon"]) for m in used},
                "controlMmPerDay": {m: sample(ctrl_mm[s][m], pl["lat"], pl["lon"]) for m in used},
            }
        places.append(rec)

    write_json({
        "source": {
            "paper": "Ben-Yami et al. (2024), Earth's Future 12, e2023EF003959",
            "paperDoi": "10.1029/2023EF003959",
            "dataset": "Jackson, Bellomo et al. (2025), NAHosMIP monthly surface air temperature and precipitation v3",
            "datasetDoi": "10.5281/zenodo.14884357",
            "protocolDoi": "10.5194/gmd-16-1975-2023",
            "licence": "CC BY 4.0",
            "models": used,
            "experiment": "Weak-AMOC state after 0.3 Sv of North Atlantic freshwater hosing is switched off (u03-r50; u03-r100 for IPSL), compared with each model's pre-industrial control.",
            "dryMask": f"Blank where the control climate receives less than {DRY_MM_DAY} mm/day; percentage change is not meaningful there.",
            "caution": "With four models, the ensemble mean is a tool to show the pattern where models agree, not the most accurate prediction (Ben-Yami et al. 2024).",
            "notAForecast": "These are idealised pre-industrial experiments. They show what a collapsed AMOC does to rainfall, not when or whether it will happen, and they exclude greenhouse warming.",
        },
        "grid": GRID,
        "units": "%",
        "domain": 50,
        "seasons": {"annual": "Annual", "jja": "June–August", "djf": "December–February"},
        "layers": layers,
        "places": places,
        "validation": checks,
    }, out_dir / "manifest.json")
    print("  validation (annual, approximate boxes):")
    for k, v in checks.items():
        print(f"    {k:24} ours {v['ensembleMeanOfPercent']:+6.1f}%  published {v['published']:+6.1f}%  per model {v['perModel']}")


if __name__ == "__main__":
    import sys
    main(sys.argv[1:] or None)
