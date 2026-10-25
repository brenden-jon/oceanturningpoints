"""AMOC collapse scenarios from the Community Earth System Model.

Source
    van Westen, R. M. & Baatsen, M. L. J. (2025). European temperature extremes
    under different AMOC scenarios in the Community Earth System Model.
    Geophysical Research Letters 52, e2025GL114611. doi:10.1029/2025GL114611

Data
    van Westen, R. & Baatsen, M. (2025). Data for the AMOC Collapse
    Visualisation. Zenodo. doi:10.5281/zenodo.15490235  (CC BY 4.0)

Which model run is which
    The published files do not say which simulation each came from. We
    identified them by matching each file's 1-in-10-year cold extreme against
    the GEV fits published with the paper (github.com/RenevanWesten/
    AMOC-TEMP-Extremes). Every file matched exactly one run to ~0.1 C, against
    >= 2.4 C for the next best:

        PI_historical_without_AMOC_collapse   CESM_1500_PI     F_H 0.45 Sv  AMOC 12.4 Sv
        PI_historical_with_AMOC_collapse      CESM_2900_PI     F_H 0.45 Sv  collapsed
        Climate_change_RCP45_without_...      CESM_0600_RCP45  F_H 0.18 Sv  AMOC 15.5 Sv
        Climate_change_RCP45_with_...         CESM_1500_RCP45  F_H 0.45 Sv  AMOC  1.2 Sv
        Climate_change_RCP85_with_...         CESM_1500_RCP85  F_H 0.45 Sv  AMOC  1.2 Sv

    This matters. Comparisons between runs at the same freshwater forcing
    isolate the AMOC state. Comparisons across different forcing levels mix
    the AMOC state with a 0.27 Sv difference in applied freshwater, and are
    flagged as such in the manifest and in the interface.
"""
from __future__ import annotations

import numpy as np
import xarray as xr

from common import CACHE, GRID, LAT, LON, OUT, PLACES, encode_grid, fetch, sample, write_json

RECORD = "15490235"
FILES = {
    "pi_on": "PI_historical_without_AMOC_collapse.nc",
    "pi_off": "PI_historical_with_AMOC_collapse.nc",
    "rcp45_on": "Climate_change_RCP45_without_AMOC_collapse.nc",
    "rcp45_off": "Climate_change_RCP45_with_AMOC_collapse.nc",
    "rcp85_off": "Climate_change_RCP85_with_AMOC_collapse.nc",
}

SCENARIOS = {
    "pi_on":     {"label": "Pre-industrial climate, AMOC intact",    "warming": "pre-industrial", "amoc": "intact",    "amocSv": 12.4, "freshwaterSv": 0.45, "run": "CESM_1500_PI"},
    "pi_off":    {"label": "Pre-industrial climate, AMOC collapsed", "warming": "pre-industrial", "amoc": "collapsed", "amocSv": None, "freshwaterSv": 0.45, "run": "CESM_2900_PI"},
    "rcp45_on":  {"label": "About +2 °C world, AMOC intact",          "warming": "+2 °C (RCP4.5)", "amoc": "intact",    "amocSv": 15.5, "freshwaterSv": 0.18, "run": "CESM_0600_RCP45"},
    "rcp45_off": {"label": "About +2 °C world, AMOC collapsed",       "warming": "+2 °C (RCP4.5)", "amoc": "collapsed", "amocSv": 1.2,  "freshwaterSv": 0.45, "run": "CESM_1500_RCP45"},
    "rcp85_off": {"label": "About +4 °C world, AMOC collapsed",       "warming": "+4 °C (RCP8.5)", "amoc": "collapsed", "amocSv": 1.2,  "freshwaterSv": 0.45, "run": "CESM_1500_RCP85"},
}

# Each comparison is (scenario minus reference). "clean" means both runs share
# the same applied freshwater forcing, so the difference isolates what it
# claims to isolate.
COMPARISONS = [
    {"id": "effect-pi", "a": "pi_off", "b": "pi_on", "clean": True,
     "title": "Effect of collapse alone",
     "subtitle": "Collapsed minus intact AMOC, both in a pre-industrial climate",
     "isolates": "the AMOC state, with everything else held equal"},
    {"id": "total-2c-collapse", "a": "rcp45_off", "b": "pi_on", "clean": True,
     "title": "A +2 °C world with a collapsed AMOC",
     "subtitle": "Compared with the pre-industrial climate with an intact AMOC",
     "isolates": "global warming and AMOC collapse together"},
    {"id": "total-2c-intact", "a": "rcp45_on", "b": "pi_on", "clean": False,
     "title": "A +2 °C world with the AMOC intact",
     "subtitle": "Compared with the pre-industrial climate with an intact AMOC",
     "isolates": "global warming without collapse",
     "caveat": "The two runs use different applied freshwater forcing (0.18 and 0.45 Sv), so this difference is not purely the effect of warming. The intact-AMOC reference is also somewhat weakened (12.4 Sv)."},
    {"id": "effect-2c", "a": "rcp45_off", "b": "rcp45_on", "clean": False,
     "title": "Effect of collapse in a +2 °C world",
     "subtitle": "Collapsed minus intact AMOC, both at about +2 °C",
     "isolates": "mostly the AMOC state",
     "caveat": "The two runs use different applied freshwater forcing (0.45 and 0.18 Sv), so this difference mixes the AMOC state with a change in forcing. The pre-industrial comparison is the cleaner isolation of collapse alone."},
    {"id": "total-4c-collapse", "a": "rcp85_off", "b": "pi_on", "clean": True,
     "title": "A +4 °C world with a collapsed AMOC",
     "subtitle": "Compared with the pre-industrial climate with an intact AMOC",
     "isolates": "strong global warming and AMOC collapse together"},
]

VARIABLES = [
    {"id": "winter", "var": "TEMP_2m_DJF", "label": "Winter temperature", "detail": "December–February mean, 2 m air temperature", "units": "°C", "scale": "temperature"},
    {"id": "summer", "var": "TEMP_2m_JJA", "label": "Summer temperature", "detail": "June–August mean, 2 m air temperature", "units": "°C", "scale": "temperature"},
    {"id": "annual", "var": "TEMP_2m", "label": "Annual temperature", "detail": "Annual mean, 2 m air temperature", "units": "°C", "scale": "temperature"},
    {"id": "cold-extreme", "var": "TEMP_1-10_year_min", "label": "Coldest day in ten years", "detail": "1-in-10-year minimum daily temperature, from an extreme-value (GEV) fit", "units": "°C", "scale": "temperature"},
    {"id": "hot-extreme", "var": "TEMP_1-10_year_max", "label": "Hottest day in ten years", "detail": "1-in-10-year maximum daily temperature, from an extreme-value (GEV) fit", "units": "°C", "scale": "temperature"},
    {"id": "frost-days", "var": "Frost_days", "label": "Frost days", "detail": "Days per year with a minimum temperature below 0 °C", "units": "days", "scale": "days"},
]


# Colour domains are chosen explicitly, once per variable, and shared by every
# comparison so that views remain comparable. They are set from the 2nd-98th
# percentile range between 70S and 70N, where the stories this site tells sit.
# Values beyond a domain are drawn at the end colour and the legend marks the
# tails as open ("<=" / ">="); hover read-outs always report the true value.
# A domain is never fitted to a single view, which would stretch small
# changes into apparently dramatic ones.
DOMAINS = {"winter": 15, "summer": 10, "annual": 10, "cold-extreme": 20, "hot-extreme": 10, "frost-days": 120}


def load() -> dict[str, xr.Dataset]:
    out = {}
    for key, name in FILES.items():
        p = fetch(f"https://zenodo.org/records/{RECORD}/files/{name}?download=1", CACHE / "amocviz" / name)
        ds = xr.open_dataset(p)
        # Exact subsample onto the 0.5-degree output grid. The source is already
        # an interpolation of ~2-degree model output, so no information is lost.
        out[key] = ds.sel(lat=LAT, lon=LON, method="nearest").assign_coords(lat=LAT, lon=LON)
    return out


def ice_edges(raw: dict[str, xr.Dataset]) -> dict:
    """March sea-ice edge (15% concentration contour) per scenario, as GeoJSON."""
    import matplotlib
    matplotlib.use("Agg")
    import matplotlib.pyplot as plt

    feats = []
    for key, ds in raw.items():
        ice = np.asarray(ds["ICE"].values, dtype=float)
        ice = np.nan_to_num(ice, nan=0.0)
        fig = plt.figure()
        cs = plt.contour(LON, LAT, ice, levels=[0.5])
        for path in cs.get_paths():
            for poly in path.to_polygons(closed_only=False):
                if len(poly) < 6:
                    continue
                feats.append({"type": "Feature",
                              "properties": {"scenario": key},
                              "geometry": {"type": "LineString",
                                           "coordinates": [[round(float(x), 2), round(float(y), 2)] for x, y in poly]}})
        plt.close(fig)
    return {"type": "FeatureCollection", "features": feats}


def main() -> None:
    raw = load()
    out_dir = OUT / "amoc" / "temperature"
    layers, domains = [], {}

    for v in VARIABLES:
        diffs = {c["id"]: raw[c["a"]][v["var"]].values.astype(float) - raw[c["b"]][v["var"]].values.astype(float)
                 for c in COMPARISONS}
        domain = float(DOMAINS[v["id"]])
        domains[v["id"]] = domain
        for c in COMPARISONS:
            meta = encode_grid(diffs[c["id"]], out_dir / f"{v['id']}__{c['id']}.png")
            layers.append({"variable": v["id"], "comparison": c["id"], **meta})
        print(f"  {v['id']:13} domain ±{domain:g} {v['units']}")

    # Absolute values at named places, for every scenario.
    places = []
    for pl in PLACES:
        rec = {**pl, "values": {}}
        for v in VARIABLES:
            rec["values"][v["id"]] = {s: sample(raw[s][v["var"]].values, pl["lat"], pl["lon"]) for s in SCENARIOS}
        places.append(rec)

    write_json(ice_edges(raw), out_dir / "sea_ice_march.geojson")
    write_json({
        "source": {
            "dataset": "van Westen & Baatsen (2025), Data for the AMOC Collapse Visualisation",
            "datasetDoi": "10.5281/zenodo.15490235",
            "paper": "van Westen & Baatsen (2025), Geophysical Research Letters 52, e2025GL114611",
            "paperDoi": "10.1029/2025GL114611",
            "licence": "CC BY 4.0",
            "relatedTool": "https://amocscenarios.org",
            "model": "Community Earth System Model 1.0.5; atmosphere ~2° (≈200 km), ocean 1°",
            "resolutionNote": "The model atmosphere is about 200 km. The published files were interpolated to 0.25° for display, and are sampled here at 0.5°. Neither step adds physical detail: a value at a city is the value of a ~200 km model grid cell, not a local forecast.",
            "period": "100-year means of equilibrated climates; the RCP runs hold radiative forcing at 2100 levels to year 2499.",
            "iceSheets": "Ice sheets are fixed at present-day extent in these simulations.",
            "freshwater": "A constant freshwater flux is applied over 20–50°N in the Atlantic and compensated elsewhere. It makes the AMOC prone to collapse; it is an experimental device, not a representation of real meltwater.",
        },
        "grid": GRID,
        "scenarios": SCENARIOS,
        "comparisons": COMPARISONS,
        "variables": [{**v, "domain": domains[v["id"]]} for v in VARIABLES],
        "layers": layers,
        "places": places,
        "seaIce": "sea_ice_march.geojson",
    }, out_dir / "manifest.json")
    total = sum(l["bytes"] for l in layers)
    print(f"  wrote {len(layers)} layers, {total/1e6:.2f} MB")


if __name__ == "__main__":
    main()
