"""Observed latitudinal range shifts of marine species (BioShifts).

Source: Comte, L. et al. (2020) BioShifts: a global geodatabase of climate-induced species
redistribution over land and sea. Figshare, doi:10.6084/m9.figshare.7413365 (CC BY 4.0),
compiled for Lenoir, J. et al. (2020) Species better track climate warming in the oceans than
on land. Nature Ecology & Evolution 4, 1044-1059, doi:10.1038/s41559-020-1198-2.

Each BioShifts row is one range-shift estimate (one species, one range position, one study area
and period) taken from a published study. The rate ShiftR is already standardised by study
duration and signed by the compilers: positive = poleward (and upslope), negative = equatorward
(Lenoir et al. 2020, Methods: "Range estimates ... were coded as positive values if poleward in
latitude, or upward in elevation, and negative otherwise"). The southern-hemisphere records were
therefore NOT flipped here. Marine records are all latitudinal (km/year); the compilers excluded
studies of purely bathymetric (depth) or longitudinal shifts.

We keep Ecosystem == Marine, join each record to its study-area polygon (Study_Areas.gdb, one
layer per Source id), and summarise per study area: a representative point (planar centroid of
the polygon in degrees, computed in 0..360 longitude for polygons that cross the antimeridian),
the bounding box, record and species counts, the median rate, the share of poleward records,
classes, start years and references.

Output: public/data/fish/shifts.json
"""
from __future__ import annotations

import csv
import json
import re
import statistics
import warnings
import zipfile
from collections import Counter, defaultdict

import pyogrio
import shapely
from shapely.affinity import translate

from common import CACHE, OUT, fetch

ZIP_URL = "https://ndownloader.figshare.com/files/22023519"
DIR = CACHE / "bioshifts"
FISH = {"Actinopterygii", "Chondrichthyes"}  # NCBI classes in BioShifts (sharks and rays are Chondrichthyes)
POS = {"Centroid": "C", "Leading edge": "L", "Trailing edge": "T"}

CLASS_LABELS = {
    "Actinopterygii": "ray-finned fishes", "Chondrichthyes": "sharks, rays and skates",
    "Polychaeta": "bristle worms", "Gastropoda": "sea snails and limpets", "Malacostraca": "crabs, lobsters and shrimps",
    "Bivalvia": "mussels, clams and oysters", "Florideophyceae": "red seaweeds", "Phaeophyceae": "brown seaweeds and kelp",
    "Maxillopoda": "copepods and barnacles", "Anthozoa": "corals and anemones", "Dinophyceae": "dinoflagellates",
    "Asteroidea": "sea stars", "Cephalopoda": "squid and octopus", "Ulvophyceae": "green seaweeds", "Aves": "seabirds",
    "Bacillariophyceae": "diatoms", "Coscinodiscophyceae": "diatoms", "Fragilariophyceae": "diatoms",
    "Mediophyceae": "diatoms", "Echinoidea": "sea urchins", "Ophiuroidea": "brittle stars", "Polyplacophora": "chitons",
    "Coccolithophyceae": "coccolithophores", "Ascidiacea": "sea squirts", "Holothuroidea": "sea cucumbers",
    "Aplacophora": "worm-like molluscs", "Crinoidea": "feather stars", "Euopisthobranchia": "sea slugs",
    "Liliopsida": "monocot plants (as classified; Acmira catherinae here is almost certainly the polychaete homonym)",
    "Ostracoda": "seed shrimps",
}


def data_dir():
    root = DIR / "Bioshifts"
    if not (root / "BioShifts.csv").exists():
        z = fetch(ZIP_URL, DIR / "BioShifts.zip")
        with zipfile.ZipFile(z) as f:
            f.extractall(DIR)
        nested = list(DIR.rglob("BioShifts.csv"))
        if not nested:
            raise RuntimeError("BioShifts.csv not found in the figshare archive")
        root = nested[0].parent
    return root


def r1(x: float) -> float:
    return round(x, 1) + 0.0


# References whose author list is garbled in References.csv (checked against the original papers).
REF_FIX = {"47": "Rivadeneira & Fernández 2005", "164": "Beaugrand et al. 2009"}


def short_ref(full: str, rid: str = "") -> str:
    """'A. B. Smith, C. Jones, Title. J. 1, 2 (2003).' -> 'Smith & Jones 2003'."""
    if rid in REF_FIX:
        return REF_FIX[rid]
    years = re.findall(r"\((\d{4})\)", full)
    year = years[-1] if years else "n.d."
    authors = []
    for tok in full.split(", "):
        m = re.match(r"^((?:[A-Za-z][a-z]?\.[ -]?)+)\s*(.+?)( et al\.)?$", tok.strip())
        if not m or len(m.group(2).split()) > 3:
            break
        authors.append(m.group(2).strip())
        if m.group(3):
            authors.append("et al.")
            break
    if not authors:
        return f"{full.split(',')[0]} {year}"
    if "et al." in authors or len(authors) > 2:
        return f"{authors[0]} et al. {year}"
    return f"{' & '.join(authors)} {year}"


def polygon_summary(geoms):
    g = shapely.union_all([shapely.make_valid(x) for x in geoms])
    g = shapely.force_2d(g)
    parts = [p for p in getattr(g, "geoms", [g]) if p.geom_type in ("Polygon", "MultiPolygon")]
    g = shapely.union_all(parts)
    w, s, e, n = g.bounds
    crosses = (e - w) > 180
    if crosses:  # move the western-hemisphere parts east of 180 so the shape is contiguous
        polys = [p for q in getattr(g, "geoms", [g]) for p in getattr(q, "geoms", [q])]
        g = shapely.union_all([translate(p, 360) if p.centroid.x < 0 else p for p in polys])
        w, s, e, n = g.bounds
    c = g.centroid
    lon = c.x - 360 if c.x > 180 else c.x
    wrap = lambda x: x - 360 if x > 180 else x
    # bbox is [west, south, east, north]; west > east means the box crosses the antimeridian (RFC 7946)
    bbox = [r1(wrap(w)), r1(s), r1(wrap(e)), r1(n)]
    return r1(lon), r1(c.y), bbox, crosses, shapely.to_wkb(g, hex=True)


def summarise(vals):
    vals = list(vals)
    if not vals:
        return None
    n = len(vals)
    mean = statistics.fmean(vals)
    sem = statistics.stdev(vals) / n ** 0.5 if n > 1 else None
    return {"n": n, "medianKmYr": round(statistics.median(vals), 2), "meanKmYr": round(mean, 2),
            "semKmYr": round(sem, 2) if sem is not None else None,
            "sharePoleward": round(sum(v > 0 for v in vals) / n, 3),
            "shareEquatorward": round(sum(v < 0 for v in vals) / n, 3),
            "shareZero": round(sum(v == 0 for v in vals) / n, 3)}


def pick_examples(recs, k=5):
    """Up to k distinct fish species spread across the area's range of rates (centroid estimates preferred)."""
    best = {}
    binomial = [r for r in recs if " " in r["Species"]]  # skip genus-only names when species-level ones exist
    for r in binomial or recs:
        sp = r["Species"]
        rank = 0 if r["Position"] == "Centroid" else 1
        if sp not in best or rank < best[sp][0]:
            best[sp] = (rank, r)
    rows = sorted((b[1] for b in best.values()), key=lambda r: float(r["ShiftR"]))
    if len(rows) > k:
        idx = sorted({round(i * (len(rows) - 1) / (k - 1)) for i in range(k)})
        rows = [rows[i] for i in idx]
    return [{"species": r["Species"], "kmYr": round(float(r["ShiftR"]), 2), "pos": POS[r["Position"]]} for r in rows]


def main():
    root = data_dir()
    with open(root / "BioShifts.csv", encoding="utf-8") as f:
        rows = list(csv.DictReader(f))
    with open(root / "References.csv", encoding="utf-8-sig") as f:
        refs = {r[0].strip(): r[1].strip() for r in csv.reader(f) if r}

    marine = [r for r in rows if r["Ecosystem"] == "Marine"]
    grads = Counter((r["Gradient"], r["Unit"]) for r in marine)
    print(f"  {len(rows)} records, {len(marine)} marine; marine gradients/units: {dict(grads)}")
    lat = [r for r in marine if r["Gradient"] == "Latitudinal" and r["Unit"] == "km/year"]
    assert len(lat) == len(marine), "unexpected non-latitudinal marine records (depth shifts?)"

    by_src = defaultdict(list)
    for r in lat:
        by_src[r["Source"]].append(r)

    gdb = str(root / "Study_Areas.gdb")
    with warnings.catch_warnings():
        warnings.simplefilter("ignore")
        layers = {name for name, _ in pyogrio.list_layers(gdb)}
        missing = sorted(set(by_src) - layers)
        if missing:
            raise RuntimeError(f"study areas missing from the geodatabase: {missing}")
        shapes = {}
        for src in by_src:
            _, _, wkb, _ = pyogrio.raw.read(gdb, layer=src)
            shapes[src] = polygon_summary(shapely.from_wkb(wkb))

    same = defaultdict(list)
    for src, (*_, key) in shapes.items():
        same[key].append(src)

    areas, ref_ids, fish_records = [], set(), []
    for src in sorted(by_src, key=lambda s: (-len(by_src[s]), s)):
        recs = by_src[src]
        lon, la, bbox, crosses, key = shapes[src]
        vals = [float(r["ShiftR"]) for r in recs]
        hemis = sorted({r["Hemisphere"] for r in recs})
        fish = [r for r in recs if r["Class"] in FISH]
        refs_here = sorted({r["Reference"] for r in recs}, key=int)
        ref_ids.update(refs_here)
        st = sorted({int(r["Start"]) for r in recs})
        area = {
            "id": src, "lon": lon, "lat": la, "bbox": bbox, "hemisphere": hemis[0] if len(hemis) == 1 else hemis,
            "n": len(recs), "nSpecies": len({r["Species"] for r in recs}),
            "medianKmYr": round(statistics.median(vals), 2),
            "sharePoleward": round(sum(v > 0 for v in vals) / len(vals), 2),
            "shareEquatorward": round(sum(v < 0 for v in vals) / len(vals), 2),
            "positions": dict(Counter(POS[r["Position"]] for r in recs)),
            "classes": [{"name": c, "n": k} for c, k in Counter(r["Class"] for r in recs).most_common()],
            "start": st[0] if len(st) == 1 else st,
            "refs": [short_ref(refs[i], i) for i in refs_here], "refIds": [int(i) for i in refs_here],
            "nFish": len(fish),
            "fishMedianKmYr": round(statistics.median(float(r["ShiftR"]) for r in fish), 2) if fish else None,
            "fishExamples": pick_examples(fish),
        }
        if crosses:
            area["crossesAntimeridian"] = True
        twins = [s for s in same[key] if s != src]
        if twins:
            area["samePolygonAs"] = sorted(twins)
        areas.append(area)
        for r in fish:
            fish_records.append([src, r["Species"], round(float(r["ShiftR"]), 2), POS[r["Position"]]])

    allv = [float(r["ShiftR"]) for r in lat]
    fishv = [float(r["ShiftR"]) for r in lat if r["Class"] in FISH]
    summary = {
        "nRecords": len(lat), "nAreas": len(areas), "nSpecies": len({r["Species"] for r in lat}),
        "nReferences": len(ref_ids), "nClasses": len({r["Class"] for r in lat}),
        "all": summarise(allv),
        "fish": {**summarise(fishv), "nSpecies": len({r["Species"] for r in lat if r["Class"] in FISH})},
        "byHemisphere": {h: summarise(float(r["ShiftR"]) for r in lat if r["Hemisphere"] == h) for h in ("North", "South")},
        "byPosition": {p: summarise(float(r["ShiftR"]) for r in lat if r["Position"] == p) for p in POS},
        "areasMostlyPoleward": sum(a["sharePoleward"] > 0.5 for a in areas),
        "areasByHemisphere": dict(Counter(a["hemisphere"] for a in areas)),
        "startYears": [min(int(r["Start"]) for r in lat), max(int(r["Start"]) for r in lat)],
    }

    out = {
        "source": {
            "dataset": "Comte, L., Grenouillet, G., Bertrand, R., Murienne, J., Bourgeaud, L., Hattab, T. & Lenoir, J. (2020) "
                       "BioShifts: a global geodatabase of climate-induced species redistribution over land and sea. Figshare.",
            "datasetDoi": "10.6084/m9.figshare.7413365",
            "paper": "Lenoir, J., Bertrand, R., Comte, L., Bourgeaud, L., Hattab, T., Murienne, J. & Grenouillet, G. (2020) "
                     "Species better track climate warming in the oceans than on land. Nature Ecology & Evolution 4, 1044-1059.",
            "paperDoi": "10.1038/s41559-020-1198-2",
            "licence": "CC BY 4.0",
            "signConvention": "kmYr > 0 means the range moved poleward (north in the Northern Hemisphere, south in the Southern); "
                              "< 0 means equatorward. Coded this way by the BioShifts compilers (Lenoir et al. 2020, Methods); "
                              "rates are the published shift divided by the study duration.",
            "scope": "Marine records only; all are latitudinal (studies of depth-only or longitude-only shifts were excluded by the compilers). "
                     "Each record is one species x range position (C centroid, L leading/poleward edge, T trailing/equatorward edge) "
                     "x study area x period, taken from a published study.",
            "points": "Planar centroid of the study-area polygon, rounded to 0.1 deg; it can fall on land for coastal studies. "
                      "bbox is [west, south, east, north]; west > east means it crosses the antimeridian.",
            "paperHeadline": "Lenoir et al. 2020 report marine species moving poleward at 5.92 +/- 0.94 km/yr (mean +/- s.e.m. of "
                             "class-level estimates from mixed models that correct for methodological differences), about six times "
                             "faster than terrestrial species. The raw-record medians and means here are simpler and lower.",
            "caveat": "Study areas are heavily concentrated in the North Atlantic (North Sea, NE US shelf, Iberia) and North Pacific "
                      "(Bering Sea, California Current, Japan). The tropics, the Indian Ocean, Africa, South America and the "
                      "Southern Ocean are barely sampled, so the map shows where scientists have looked, not where species are moving.",
            "classLabels": {c: CLASS_LABELS.get(c, c) for c in sorted({r["Class"] for r in lat})},
            "fishClasses": sorted(FISH),
        },
        "summary": summary,
        "areas": areas,
        "references": {i: refs[i] for i in sorted(ref_ids, key=int)},
        "fishRecordColumns": ["area", "species", "kmYr", "pos"],
        "fishRecords": fish_records,
    }
    dest = OUT / "fish" / "shifts.json"
    dest.parent.mkdir(parents=True, exist_ok=True)
    dest.write_text(json.dumps(out, ensure_ascii=False, separators=(",", ":")))

    a, fs = summary["all"], summary["fish"]
    print(f"  {summary['nAreas']} study areas, {summary['nSpecies']} species, {summary['nReferences']} studies")
    print(f"  all marine: median {a['medianKmYr']} km/yr, mean {a['meanKmYr']} +/- {a['semKmYr']}, poleward {a['sharePoleward']:.0%}")
    print(f"  fish:       median {fs['medianKmYr']} km/yr, mean {fs['meanKmYr']} +/- {fs['semKmYr']}, poleward {fs['sharePoleward']:.0%} (n={fs['n']})")
    print(f"  wrote {dest.relative_to(OUT.parent.parent)} ({dest.stat().st_size / 1024:.0f} KB)")


if __name__ == "__main__":
    main()
