"""Rebuild every published data file from the original sources.

    cd pipeline && uv run python build_all.py

Downloads are cached in pipeline/.cache (about 6 GB, mostly the NAHosMIP
rainfall archives) and are never committed. Outputs go to public/data,
public/og and public/img. Each step prints its own checks; compare them with
the values recorded in docs/DATA.md after any rebuild.
"""
from __future__ import annotations

import time

import amoc_scenarios
import amoc_series
import basemap_and_scales
import figures
import fish
import nahosmip_rain
import ocean_now
import reef_stations
import sea_level
import southern_ocean

STEPS = [
    ("Base map and colour scales", lambda: (basemap_and_scales.geography(), basemap_and_scales.scales())),
    ("AMOC temperature scenarios (CESM)", amoc_scenarios.main),
    ("AMOC rainfall, four models (NAHosMIP)", nahosmip_rain.main),
    ("AMOC observations and model time series", amoc_series.main),
    ("The ocean now (daily layers)", ocean_now.main),
    ("Reef heat-stress history (weekly)", reef_stations.main),
    ("Sea level and the ice sheets", sea_level.main),
    ("Fish biomass projections by country (FishMIP)", fish.main),
    ("Southern Ocean carbon uptake (SOM-FFN, 1.3 GB download)", southern_ocean.main),
    ("Preview and card images", figures.main),
]

if __name__ == "__main__":
    for name, fn in STEPS:
        t = time.time()
        print(f"\n== {name}")
        fn()
        print(f"   done in {time.time() - t:.0f} s")
