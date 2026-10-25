"""Projected change in fish biomass by country (FishMIP, for FAO Technical Paper 707).

Source: Blanchard, J. L. & Novaglio, C. (eds) (2024) Climate change risks to marine ecosystems and
fisheries: projections to 2100 from the Fisheries and Marine Ecosystem Model Intercomparison Project.
FAO Fisheries and Aquaculture Technical Paper 707, doi:10.4060/cd1379en. Data table: Fish-MIP/FAO_Report,
Zenodo doi:10.5281/zenodo.13988998, Apache-2.0. Values are the ensemble-mean percentage change in
exploitable fish biomass (10 g to 100 kg, without fishing) in each country's waters, relative to
2005-2014, with the share of models agreeing on the sign.

Country shapes: Natural Earth 1:50m admin-0 countries (public domain), coordinates rounded to 0.1°.
Small island states, too small to see as shapes, are also written as points.

Output: public/data/fish/countries.geojson, public/data/fish/points.geojson, public/data/fish/summary.json
"""
from __future__ import annotations

import csv
import io
import json
import statistics

from common import CACHE, OUT, fetch

TABLE = "https://raw.githubusercontent.com/Fish-MIP/FAO_Report/main/data/table_stats_formatted_admin_full.csv"
NE50 = "https://raw.githubusercontent.com/nvkelso/natural-earth-vector/master/geojson/ne_50m_admin_0_countries.geojson"
ALIAS = {"Sao Tome and Principe": "STP", "Venezuela (Bolivarian Republic of)": "VEN", "Iran (Islamic Republic of)": "IRN",
         "Türkiye": "TUR", "Viet Nam": "VNM", "Netherlands (Kingdom of the)": "NLD", "Micronesia (Federated States of)": "FSM"}
SHORT = {"Venezuela (Bolivarian Republic of)": "Venezuela", "Iran (Islamic Republic of)": "Iran", "Netherlands (Kingdom of the)": "Netherlands",
         "Micronesia (Federated States of)": "Micronesia", "United Kingdom of Great Britain and Northern Ireland": "United Kingdom",
         "Democratic People's Republic of Korea": "North Korea", "Republic of Korea": "South Korea", "United States of America": "United States",
         "Russian Federation": "Russia", "United Republic of Tanzania": "Tanzania", "Syrian Arab Republic": "Syria"}
KEYS = {"ssp126_2050": "mean_ssp126_2041-2050", "ssp585_2050": "mean_ssp585_2041-2050",
        "ssp126_2100": "mean_ssp126_2091-2100", "ssp585_2100": "mean_ssp585_2091-2100"}
AGREE = {"ssp126_2100": "agreement_ssp126_2091-2100", "ssp585_2100": "agreement_ssp585_2091-2100"}


def num(v: str):
    try:
        return round(float(v), 1)
    except ValueError:
        return None


def rnd(coords):
    if isinstance(coords[0], (int, float)):
        return [round(round(coords[0] / 0.1) * 0.1, 1), round(round(coords[1] / 0.1) * 0.1, 1)]
    out = [rnd(c) for c in coords]
    if out and isinstance(out[0], list) and out and isinstance(out[0][0], float):
        dedup = [out[0]] + [p for i, p in enumerate(out[1:], 1) if p != out[i - 1]]
        return dedup
    return out


def area_deg(geom) -> float:
    def ring(r):
        return abs(sum(r[i][0] * r[i + 1][1] - r[i + 1][0] * r[i][1] for i in range(len(r) - 1))) / 2
    polys = geom["coordinates"] if geom["type"] == "MultiPolygon" else [geom["coordinates"]]
    return sum(ring(p[0]) for p in polys)


def main() -> None:
    rows = list(csv.DictReader(io.StringIO(fetch(TABLE, CACHE / "fish" / "fao707_admin.csv").read_text())))
    ne = json.loads(fetch(NE50, CACHE / "fish" / "ne_50m_admin_0_countries.geojson").read_text())
    idx = {}
    for f in ne["features"]:
        p = f["properties"]
        for k in ("NAME_LONG", "ADMIN", "NAME", "FORMAL_EN", "NAME_EN"):
            if p.get(k):
                idx.setdefault(p[k], f)
    by_a3 = {f["properties"]["ADM0_A3"]: f for f in ne["features"]}
    feats, points, countries = [], [], []
    for r in rows:
        if r["spatial_scale"] != "countries_admin":
            continue
        name = r["figure_name"]
        f = by_a3.get(ALIAS[name]) if name in ALIAS else idx.get(name)
        if f is None:
            raise ValueError(f"no shape for {name}")
        props = {"name": SHORT.get(name, name), "continent": r["continent"], **{k: num(r[v]) for k, v in KEYS.items()},
                 **{f"agree_{k}": num(r[v]) for k, v in AGREE.items()}}
        countries.append(props)
        g = {"type": f["geometry"]["type"], "coordinates": rnd(f["geometry"]["coordinates"])}
        feats.append({"type": "Feature", "properties": props, "geometry": g})
        if area_deg(f["geometry"]) < 2.5:  # small islands: also a point so they stay visible
            p = f["properties"]
            points.append({"type": "Feature", "properties": props,
                           "geometry": {"type": "Point", "coordinates": [round(p["LABEL_X"], 2), round(p["LABEL_Y"], 2)]}})
    out = OUT / "fish"
    out.mkdir(parents=True, exist_ok=True)
    (out / "countries.geojson").write_text(json.dumps({"type": "FeatureCollection", "features": feats}, separators=(",", ":")))
    (out / "points.geojson").write_text(json.dumps({"type": "FeatureCollection", "features": points}, separators=(",", ":")))
    med = lambda k, cs: round(statistics.median(c[k] for c in cs if c[k] is not None), 1)
    conts = sorted({c["continent"] for c in countries})
    summary = {
        "source": "Blanchard & Novaglio (eds) 2024, FAO Fisheries and Aquaculture Technical Paper 707, doi:10.4060/cd1379en; data doi:10.5281/zenodo.13988998 (Apache-2.0)",
        "baseline": "2005-2014", "countries": len(countries),
        "median": {k: med(k, countries) for k in KEYS},
        "declining": {k: sum(1 for c in countries if (c[k] or 0) < 0) for k in KEYS},
        "continents": {ct: {k: med(k, [c for c in countries if c["continent"] == ct]) for k in KEYS} for ct in conts},
    }
    (out / "summary.json").write_text(json.dumps(summary, indent=1))
    print(f"  {len(feats)} countries ({len(points)} also as points); median 2091-2100: "
          f"SSP1-2.6 {summary['median']['ssp126_2100']}%, SSP5-8.5 {summary['median']['ssp585_2100']}%; "
          f"declining under SSP5-8.5: {summary['declining']['ssp585_2100']}")


if __name__ == "__main__":
    main()
