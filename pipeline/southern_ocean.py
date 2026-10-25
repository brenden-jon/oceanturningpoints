"""Southern Ocean carbon uptake: annual air-sea CO2 flux south of 35°S, 1982-2024.

Source: Jersild, A., Landschützer, P., Gruber, N. & Bakker, D. C. E. An observation-based global monthly
gridded sea surface pCO2 and air-sea CO2 flux product from 1982 onward (MPI-SOM-FFN v2025), NOAA NCEI
Accession 0160558, doi:10.7289/v5z899n6 ("free to be used", with citation). Method: Landschützer et al.
(2016), Global Biogeochemical Cycles, doi:10.1002/2015GB005359.

Processing: the smoothed flux (mol m-2 yr-1) is area-weighted over every 1° cell south of 35°S, averaged
over each calendar year and converted to PgC per year (12.011 g C per mol). No riverine adjustment, so the
level is not comparable with budget studies such as RECCAP2; the site shows each year's difference from
the 1985-2018 mean, which keeps the well-documented 1990s weakening and post-2000 rebound
(Gruber et al. 2019) without implying a precise total.

Output: public/data/southern/co2_uptake.json
"""
from __future__ import annotations

import json

import numpy as np
import xarray as xr

from common import CACHE, OUT, fetch

URL = "https://www.ncei.noaa.gov/data/oceans/ncei/ocads/data/0160558/MPI_SOM-FFN_v2025/SOM-FFN_v2025_NCEI_OCADS.nc"
R = 6371000.0


def main() -> None:
    path = fetch(URL, CACHE / "southern" / "SOM-FFN_v2025_NCEI_OCADS.nc")
    with xr.open_dataset(path, decode_times=False) as ds:
        f = ds["fgco2_smoothed"].where(ds["fgco2_smoothed"] < 1e19)  # mol m-2 yr-1, negative = ocean uptake
        lat = ds["lat"].values
        sel = lat < -35
        dlat = dlon = np.radians(1.0)
        area = (R ** 2) * dlat * dlon * np.cos(np.radians(lat[sel]))  # m2 per cell, by latitude
        sub = f.isel(lat=np.where(sel)[0]).transpose("time", "lat", "lon").values  # time, lat, lon
        tot = np.nansum(sub * area[None, :, None], axis=(1, 2)) * 12.011 / 1e15  # PgC/yr
        n = tot.size
        years = 1982 + np.arange(n) // 12
    annual = {int(y): float(np.mean(tot[years == y])) for y in np.unique(years) if (years == y).sum() == 12}
    base = np.mean([v for y, v in annual.items() if 1985 <= y <= 2018])
    series = [[y, round(-(v - base), 3)] for y, v in annual.items()]  # positive = more uptake than average
    out = OUT / "southern"
    out.mkdir(parents=True, exist_ok=True)
    (out / "co2_uptake.json").write_text(json.dumps({
        "source": "MPI-SOM-FFN v2025 (Jersild, Landschützer, Gruber & Bakker), NOAA NCEI 0160558, doi:10.7289/v5z899n6",
        "region": "south of 35°S", "units": "PgC per year, difference from the 1985-2018 mean (positive = more uptake)",
        "series": series}, indent=0))
    print(f"  Southern Ocean uptake anomaly: {series[0]} ... min {min(series, key=lambda p: p[1])} max {max(series, key=lambda p: p[1])} last {series[-1]}")


if __name__ == "__main__":
    main()
