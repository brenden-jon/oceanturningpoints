"""Gridded projections of change in total marine animal biomass (FishMIP, CMIP6), for the globe.

Source: Tittensor, D. P. et al. (2021) Next-generation ensemble projections reveal higher climate
risks for marine ecosystems. Nature Climate Change 11, 973-981, doi:10.1038/s41558-021-01173-9.
Data and code: Zenodo doi:10.5281/zenodo.7703393 (CC BY 4.0).

What the archive holds. data_CMIP6.RData is the intermediate file written by the paper's
R/Batch_run_maps.Rmd (full model set). Its first two objects, data_ipsl_CMIP6 and data_gfdl_CMIP6,
hold for every marine ecosystem model (MEM) x Earth system model (ESM) pair the decadal-mean total
consumer biomass ("tcb", kg km-2) for 1990-1999 ("hist") and 2090-2099 under SSP1-2.6 and SSP5-8.5,
and the per-cell percentage change ("diff_2p6", "diff_8p5") on a 1-degree grid stored as
[lon -180..180, lat 90..-90] (already flipped / hemisphere-swapped by the paper's script; DBEM's
0.5-degree change field already subsampled to 1 degree). The remaining objects are ggplot maps that
contain R byte-code, which the Python `rdata` reader cannot parse, so the file is read object by object
and only the first two objects are decoded. There are no gridded fields for any other period: the
paper's maps are 2090-2099 against 1990-1999 only. No mid-century map exists in this source.

Method (as R/HelperScripts.R::model_stat). Ensemble mean = per-cell mean over members of the
percentage change, ignoring non-finite values. Agreement = share of members whose change has the
majority sign (>= 0 counted as increase), so it runs from 50 to 100 %. Here it is written with a sign:
negative when the majority projects a decline, positive when the majority projects an increase
(ties carry the sign of the ensemble mean), so |value| is exactly the paper's agreement.

One deliberate departure, switchable with PAPER_EXACT. In the paper's map script the GFDL-ESM4 EcoOcean
member reads the IPSL-CM6A-LR EcoOcean future files (Batch_run_maps.Rmd, lines 1038 and 1042), and the
archive confirms it: that member's 2090s fields are identical to IPSL's while its 1990s field is GFDL's.
Its change field is therefore a ratio of two different ESMs and is left out by default (15 members).
The paper's time-series script uses the correct GFDL EcoOcean files, so its headline numbers are not
affected.

Global context from the same record (data_trends_CMIP6.RData, the paper's Fig. 3 data): the 16-member
mean of each member's change in global total biomass for the 2040s and 2090s, relative to 1990-1999.

An ensemble median layer is also written (not in the paper): in parts of the Southern Ocean one model
(DBEM) projects gains of several hundred per cent from near-zero baselines, which lifts the mean to
+50% where nearly every other model projects a decline. The median is not pulled by such values.

Output: public/data/fish/grid_<ssp>_2100.png (mean), _agree.png, _median.png, public/data/fish/grid.json
"""
from __future__ import annotations

import gzip
import warnings

import numpy as np

from common import CACHE, OUT, encode_grid, fetch, write_json

ZENODO = "https://zenodo.org/api/records/7703393/files/{}/content"
FILES = {"data_CMIP6.RData": "27c054b095fefc60fb7fd11f46d70c7a",
         "data_trends_CMIP6.RData": "faf5ce3346cdb73c6745544bb6912166"}
C = CACHE / "fish_grid"
DEST = OUT / "fish"

PAPER_EXACT = False                       # True: keep the mis-read GFDL-ESM4 EcoOcean member, as in the paper's maps
FAULTY = ("gfdl", "EcoOcean")
DOMAIN = 50                               # symmetric clip, %, as the paper's maps (scales::squish at +/-50)
SCEN = {"ssp126": ("diff_2p6", "fut126", "SSP1-2.6", "Low emissions (SSP1-2.6)"),
        "ssp585": ("diff_8p5", "fut585", "SSP5-8.5", "Very high emissions (SSP5-8.5)")}
PAPER_HEADLINE = {"ssp126": -7, "ssp585": -19}   # Tittensor et al. 2021, main text, "~7%" and "~19%"


def read_members() -> dict:
    """Decode data_ipsl_CMIP6 and data_gfdl_CMIP6 from the paper's intermediate RData file."""
    import rdata
    from rdata.parser._parser import RObjectType, parse_r_object_info
    from rdata.parser._xdr import ParserXDR

    path = fetch(ZENODO.format("data_CMIP6.RData"), C / "data_CMIP6.RData", FILES["data_CMIP6.RData"])
    raw = gzip.decompress(path.read_bytes())
    if raw[:7] != b"RDX3\nX\n":
        raise RuntimeError("unexpected RData header")
    p = ParserXDR(memoryview(raw)[7:], expand_altrep=True, altrep_constructor_dict=rdata.parser.DEFAULT_ALTREP_MAP)
    p.parse_extra_info(p.parse_versions())
    refs, members = [], {}
    for want in ("data_ipsl_CMIP6", "data_gfdl_CMIP6"):       # top level is a pairlist: flags, tag, value, ...
        info = parse_r_object_info(p.parse_int())
        assert info.type == RObjectType.LIST and info.tag
        name = p.parse_R_object(refs).value.value.decode()
        obj = p.parse_R_object(refs)
        assert name == want, name
        with warnings.catch_warnings():
            warnings.simplefilter("ignore")
            data = rdata.conversion.SimpleConverter().convert(obj)
        esm = want.split("_")[1]
        for mem, v in data.items():
            members[(esm, str(mem))] = {k: np.asarray(v[k]["fishvar"] if isinstance(v[k], dict) else v[k], dtype=float)
                                        for k in ("hist", "fut126", "fut585", "diff_2p6", "diff_8p5")}
    del raw
    return members


def global_series() -> dict:
    """16-member mean change in global total biomass, from the paper's time-series data (Fig. 3)."""
    import rdata
    path = fetch(ZENODO.format("data_trends_CMIP6.RData"), C / "data_trends_CMIP6.RData", FILES["data_trends_CMIP6.RData"])
    with warnings.catch_warnings():
        warnings.simplefilter("ignore")
        d = rdata.conversion.convert(rdata.parser.parse_file(path))
    out = {}
    for key, (_, _, label, _) in SCEN.items():
        for dec, (a, b) in {"2040s": (2040, 2049), "2090s": (2090, 2099)}.items():
            vals = []
            for esm in d.values():
                for m in esm.values():
                    df = m["all"]
                    vals.append(float(df[(df.color == key) & (df.year >= a) & (df.year <= b)].TcbChange.mean()))
            out[f"{key}_{dec}"] = {"scenario": label, "period": f"{a}-{b}", "mean": round(float(np.mean(vals)), 1),
                                   "sd": round(float(np.std(vals, ddof=1)), 1), "n": len(vals)}
    return out


def model_stat(fields: list[np.ndarray]) -> tuple[np.ndarray, np.ndarray, np.ndarray, np.ndarray]:
    """Ensemble mean, signed agreement (%) and member count, as model_stat() in the paper's R code,
    plus the ensemble median (not in the paper; robust to single-model extremes)."""
    Y = np.stack(fields)
    with warnings.catch_warnings():
        warnings.simplefilter("ignore")
        mean = np.nanmean(np.where(np.isfinite(Y), Y, np.nan), axis=0)
        median = np.nanmedian(np.where(np.isfinite(Y), Y, np.nan), axis=0)
        n = (~np.isnan(Y)).sum(0)                         # R: !is.na() keeps +/-Inf
        t = (Y >= 0).sum(0) / np.where(n > 0, n, np.nan)
    agree = np.where(t > 0.5, t, 1 - t) * 100
    up = (t > 0.5) | ((t == 0.5) & (mean >= 0))
    signed = np.where(np.isfinite(t) & np.isfinite(mean), np.where(up, agree, -agree), np.nan)
    return mean, signed, n, median


def to_s2n(a: np.ndarray) -> np.ndarray:
    """[lon -180..180, lat 90..-90] -> (lat, lon) with rows south-to-north."""
    return a.T[::-1, :]


def main() -> None:
    members = read_members()
    use = [k for k in members if PAPER_EXACT or k != FAULTY]
    eco_i, eco_g = members[("ipsl", "EcoOcean")], members[FAULTY]
    same = all(np.array_equal(eco_i[f], eco_g[f], equal_nan=True) for f in ("fut126", "fut585"))
    print(f"  {len(members)} members in archive; GFDL EcoOcean 2090s identical to IPSL's: {same}; using {len(use)}")

    lat = np.arange(-89.5, 90, 1.0)
    lon = np.arange(-179.5, 180, 1.0)
    w = np.cos(np.deg2rad(lat))[:, None] * np.ones((1, lon.size))
    grid = {"lat0": float(lat[0]), "lat1": float(lat[-1]), "lon0": float(lon[0]), "lon1": float(lon[-1]),
            "res": 1.0, "h": int(lat.size), "w": int(lon.size), "rowOrder": "north-to-south"}

    def wmean(a, mask=None):
        ok = np.isfinite(a) if mask is None else mask & np.isfinite(a)
        return float((a[ok] * w[ok]).sum() / w[ok].sum())

    def biomass_change(keys, fut):
        """Mean over members of each member's change in global total biomass (area-weighted sum of density)."""
        g = []
        for k in keys:
            h, f = members[k]["hist"], members[k][fut]
            la = np.linspace(90 - 90 / h.shape[1], -90 + 90 / h.shape[1], h.shape[1])
            ww = np.cos(np.deg2rad(la))[None, :]
            ok = np.isfinite(h) & np.isfinite(f)
            g.append((np.where(ok, f * ww, 0).sum() / np.where(ok, h * ww, 0).sum() - 1) * 100)
        return float(np.mean(g))

    series = global_series()
    layers, checks = {}, {}
    for key, (diff, fut, label, title) in SCEN.items():
        mean, agree, n, median = (to_s2n(a) for a in model_stat([members[k][diff] for k in use]))
        ocean = np.isfinite(mean)
        clipped = np.where(ocean, np.clip(mean, -DOMAIN, DOMAIN), np.nan)
        lk = f"{key}_2100"
        meta = encode_grid(clipped, DEST / f"grid_{lk}.png")
        ameta = encode_grid(np.where(ocean, agree, np.nan), DEST / f"grid_{lk}_agree.png")
        med = np.where(ocean, np.clip(median, -DOMAIN, DOMAIN), np.nan)
        mmeta = encode_grid(med, DEST / f"grid_{lk}_median.png")
        layers[lk] = {
            **meta, "grid": grid, "domain": DOMAIN, "units": "%",
            "variable": "tcb", "period": "2090-2099", "baseline": "1990-1999",
            "scenario": label, "scenarioLabel": title,
            "agreement": {**ameta, "grid": grid, "units": "%", "domain": 100,
                          "meaning": "Share of models agreeing on the direction of change taken by the majority "
                                     "(the paper's 'model agreement', 50-100%). Negative = the majority projects a "
                                     "decline, positive = an increase; |value| is the paper's agreement."},
            "median": {**mmeta, "grid": grid, "units": "%", "domain": DOMAIN,
                       "meaning": "Ensemble MEDIAN of the same percentage changes (not shown in the paper). Unlike the "
                                  "mean it is not pulled by one model's extreme values, e.g. DBEM's several-hundred-% "
                                  "gains from near-zero baselines in the Southern Ocean at 50-60°S."},
        }
        tropics = np.abs(lat)[:, None] * np.ones((1, lon.size)) < 30
        arctic = (lat[:, None] * np.ones((1, lon.size))) > 60
        chk = {"areaMeanClipped": round(wmean(clipped), 1), "areaMeanMedianMap": round(wmean(med), 1),
               "areaMeanUnclipped": round(wmean(mean), 1),
               "globalTotalChange": round(biomass_change(use, fut), 1),
               "globalTotalChangeAll16": round(biomass_change(list(members), fut), 1),
               "tropics30": round(wmean(clipped, tropics), 1), "arctic60": round(wmean(clipped, arctic), 1),
               "shareClipped": round(float((np.abs(mean[ocean]) > DOMAIN).mean()), 3),
               "majorityVsMeanSignDiffer": round(float(((agree > 0) != (mean >= 0))[ocean & (np.abs(agree) > 50)].mean()), 3),
               "agree80": round(float((np.abs(agree[ocean]) >= 80).mean()), 3),
               "cellsFewerThan5Models": int(((n > 0) & (n < 5) & ocean).sum()), "oceanCells": int(ocean.sum())}
        checks[lk] = chk
        layers[lk]["globalMean"] = {"areaWeightedMeanOfMapPct": chk["areaMeanClipped"],
                                    "changeInGlobalTotalPct": chk["globalTotalChange"]}
        print(f"  {lk}: area-weighted mean of the (clipped) map {chk['areaMeanClipped']:+.1f}% "
              f"(unclipped {chk['areaMeanUnclipped']:+.0f}%; median map {chk['areaMeanMedianMap']:+.1f}%); "
              f"change in global total {chk['globalTotalChange']:+.1f}% ({chk['globalTotalChangeAll16']:+.1f}% with all 16 map members); "
              f"paper time series 2090s {series[f'{key}_2090s']['mean']:+.1f}% (n=16); paper text ~{PAPER_HEADLINE[key]}%")
        print(f"     tropics |lat|<30 {chk['tropics30']:+.1f}%, Arctic >60N {chk['arctic60']:+.1f}%; "
              f"{chk['shareClipped']:.0%} of cells beyond +/-{DOMAIN}%; majority sign differs from mean sign in "
              f"{chk['majorityVsMeanSignDiffer']:.0%}; >=80% agreement in {chk['agree80']:.0%}; "
              f"PNG {meta['bytes']} + {ameta['bytes']} + {mmeta['bytes']} bytes")

    # orientation and longitude checks on the written field
    m = to_s2n(model_stat([members[k]["diff_8p5"] for k in use])[0])
    pick = lambda la, lo: m[int(np.argmin(abs(lat - la))), int(np.argmin(abs(lon - lo)))]
    assert np.isnan(pick(25, 10)) and np.isnan(pick(-5, -60)) and np.isnan(pick(60, 100)), "land should be empty"
    assert np.isfinite(pick(0, -150)) and np.isfinite(pick(30, -40)) and np.isfinite(pick(-20, 80)), "ocean should have data"
    assert checks["ssp585_2100"]["tropics30"] < 0 < checks["ssp585_2100"]["arctic60"], "expected tropical loss, Arctic gain"

    n_i = sum(1 for k in use if k[0] == "ipsl")
    n_g = len(use) - n_i
    names = lambda e: ", ".join(k[1] for k in use if k[0] == e)
    write_json({
        **layers,
        "global": {"note": "Mean over the 16 model pairs of each pair's change in global total animal biomass, relative "
                           "to 1990-1999, from the paper's time-series data (Fig. 3). Global numbers only: the source "
                           "has no maps for the 2040s.", **series},
        "source": {
            "citation": "Tittensor, D. P. et al. (2021) Next-generation ensemble projections reveal higher climate risks "
                        "for marine ecosystems. Nature Climate Change 11, 973-981. doi:10.1038/s41558-021-01173-9",
            "data": "Zenodo doi:10.5281/zenodo.7703393 (data_CMIP6.RData, full model set)",
            "licence": "CC BY 4.0",
            "url": "https://doi.org/10.5281/zenodo.7703393",
            "variable": "tcb, total consumer biomass: total marine animal biomass without fishing; the animals represented "
                        "vary among models but generally include major taxonomic groups or major fish taxa",
            "ensemble": {"members": len(use), "ecosystemModels": len({k[1] for k in use}), "earthSystemModels": 2,
                         "IPSL-CM6A-LR": f"{n_i}: {names('ipsl')}", "GFDL-ESM4": f"{n_g}: {names('gfdl')}",
                         "excluded": None if PAPER_EXACT else
                         "GFDL-ESM4 x EcoOcean: in the archived map data its 2090s fields are the IPSL-CM6A-LR ones "
                         "(a file-path slip in the paper's map script), so its change is not a valid GFDL projection"},
            "method": "For each model pair, decadal-mean biomass in 2090-2099 divided by 1990-1999 on a 1° grid; the map is "
                      "the unweighted mean of these percentage changes across model pairs (as the paper's model_stat), "
                      f"clipped to ±{DOMAIN}%; agreement is the share of pairs on the majority side.",
            "periods": "Only 2090-2099 vs 1990-1999 exists as maps in this source; no mid-century maps.",
        },
    }, DEST / "grid.json")
    print(f"  wrote {DEST / 'grid.json'}")


if __name__ == "__main__":
    main()
