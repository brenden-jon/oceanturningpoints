# Data: sources, licences, processing and updates

All raw downloads are cached in `pipeline/.cache` (not committed). Rebuild everything with `npm run data`
(`pipeline/build_all.py`). Each script's docstring holds the full citation and method.

## Datasets

| Dataset | Provider and citation | Licence | Used for | Script |
|---|---|---|---|---|
| Data for the AMOC Collapse Visualisation | van Westen & Baatsen (2025), Zenodo, [doi:10.5281/zenodo.15490235](https://doi.org/10.5281/zenodo.15490235). Paper: van Westen & Baatsen (2025) GRL 52, e2025GL114611 | CC BY 4.0 | Temperature maps, March sea-ice edges, place values | `amoc_scenarios.py` |
| AMOC-TEMP-Extremes v1 | van Westen & Baatsen (2025), Zenodo, [doi:10.5281/zenodo.14586440](https://doi.org/10.5281/zenodo.14586440) | CC BY 4.0 | Scenario-run AMOC series; identifying which run each scenario file came from | `amoc_series.py` |
| AMOC for the PI control and PI quasi-equilibrium hosing simulations | van Westen & Baatsen (2026), Zenodo, [doi:10.5281/zenodo.18785979](https://doi.org/10.5281/zenodo.18785979). Experiment: van Westen, Kliphuis & Dijkstra (2024) Sci. Adv. 10, eadk1189 | CC BY 4.0 | Hysteresis (tipping) chart | `amoc_series.py` |
| NAHosMIP monthly surface air temperature and precipitation v3 | Jackson, Bellomo et al. (2025), Zenodo, [doi:10.5281/zenodo.14884357](https://doi.org/10.5281/zenodo.14884357). Protocol: Jackson et al. (2023) GMD 16, 1975–1995. Method: Ben-Yami et al. (2024) Earth's Future 12, e2023EF003959 | CC BY 4.0 | Four-model rainfall maps, agreement, place values | `nahosmip_rain.py` |
| RAPID-MOCHA-WBTS AMOC time series v2024.1a | Moat et al., National Oceanography Centre, [doi:10.5285/48d0bf43-0598-ceb2-e063-7086abc062f1](https://doi.org/10.5285/48d0bf43-0598-ceb2-e063-7086abc062f1) | Open Government Licence; acknowledge RAPID (NERC, NSF, NOAA) | Observed AMOC chart | `amoc_series.py` |
| Natural Earth 1:110m and 1:50m coastlines, land, boundary lines | naturalearthdata.com | Public domain | Map lines; preview images | `basemap_and_scales.py` |
| Blue Marble Shaded Relief and Bathymetry | NASA Earth Observatory via NASA GIBS (tiles requested by the browser) | Public domain (credit NASA) | Homepage globe, atlas, home preview image | n/a; `figures.py` for the preview |
| Black Marble 2016 (VIIRS) | NASA via GIBS; Román et al. (2018) RSE 210, 113–143 | Public domain (credit NASA) | Atlas night lights | n/a |
| cmocean colour maps | Thyng et al. (2016) Oceanography 29, 9–13 | MIT | Temperature scales | `basemap_and_scales.py` |
| ColorBrewer BrBG | Cynthia Brewer, via matplotlib | Apache 2.0 | Rainfall scale | `basemap_and_scales.py` |
| Spectral, Hanken Grotesk fonts | Google Fonts | SIL Open Font Licence | Site type; preview images | `figures.py` |

## Processing notes

### Temperature scenarios (`amoc_scenarios.py`)
- Five CESM 1.0.5 climate states, each a 100-year mean. The files do not name their model runs; each was identified by matching
  its 1-in-10-year cold extreme against the authors' GEV fits (RMSE about 0.1 °C for the match, 2.4 °C or more for the next best):

  | File | Run | Background freshwater | AMOC |
  |---|---|---|---|
  | PI_historical_without_AMOC_collapse | CESM_1500_PI | 0.45 Sv | 12.4 Sv |
  | PI_historical_with_AMOC_collapse | CESM_2900_PI | 0.45 Sv | collapsed |
  | Climate_change_RCP45_without_AMOC_collapse | CESM_0600_RCP45 | 0.18 Sv | 15.5 Sv |
  | Climate_change_RCP45_with_AMOC_collapse | CESM_1500_RCP45 | 0.45 Sv | 1.2 Sv |
  | Climate_change_RCP85_with_AMOC_collapse | CESM_1500_RCP85 | 0.45 Sv | 1.2 Sv |

- Comparisons at the same freshwater forcing are labelled clean. The two that mix 0.18 and 0.45 Sv carry a caveat in the
  manifest and in the interface.
- Variables: winter (DJF), summer (JJA) and annual mean 2 m temperature; 1-in-10-year coldest and hottest day; frost days.
  Fixed colour ranges: ±15, ±10, ±10, ±20, ±10 °C and ±120 days.
- Validation: London 1-in-10-year cold extreme −19.3 °C and Edinburgh −29.8 °C in the +2 °C collapsed state, matching the
  "approaching −20 °C and −30 °C" reported for these runs.

### Rainfall (`nahosmip_rain.py`)
- Following Ben-Yami et al. (2024): HadGEM3-GC31-MM, CanESM5 and CESM2 use run u03-r50, IPSL-CM6A-LR uses u03-r100 (the
  weak-AMOC state after hosing stops), each compared with the model's own piControl over the full available periods.
- Percentage change per model on its native grid, linearly interpolated (with dateline padding) to 0.5°; blank where any
  model's control rainfall is below 0.3 mm/day; mean of the four percentages; agreement = number of models sharing the sign of
  the mean.
- Validation, annual means over approximate boxes (the paper's exact regions are in its supplement):

  | Region | Ours | Published |
  |---|---|---|
  | West African monsoon (15°W–15°E, 5–18°N) | −28.7% | −29.07% |
  | Indian summer monsoon (70–90°E, 10–28°N) | −23.5% | −18.76% |
  | Southern Amazon (65–45°W, 15°S–0°) | +12.3% | +43.79% |

  The West African figure matches; the other two boxes are only approximations of the paper's regions and agree in direction.
  Values are written to `public/data/amoc/rainfall/manifest.json` under `validation` on every rebuild.

### Time series (`amoc_series.py`)
- RAPID `moc_mar_hc10`: monthly means need at least 20 twice-daily samples; calendar-year means need at least 9 months.
  2004–2024 mean: 17.0 Sv.
- Hysteresis: AMOC at 26°N and about 1,000 m; freshwater forcing = 0.0003 Sv × model year; 25-year running mean. The smoothed
  series first falls below 5 Sv at a forcing of about 0.54 Sv.
- Scenario runs: AMOC 0–1,000 m at 26°N; means for 2400–2499 are 15.5 (0600 RCP4.5), 3.3 (0600 RCP8.5), 1.2 (1500 RCP4.5)
  and 1.2 Sv (1500 RCP8.5).

### Images (`figures.py`)
Open Graph previews (1200 × 630) and homepage card images, drawn from the published layers with the same colour scales.

## Updating

| What | How often | Steps |
|---|---|---|
| RAPID observations | When NOC releases a new version (roughly yearly) | Delete `pipeline/.cache/rapid`, update the URL or version in `amoc_series.py` if it changed, run the script, check the printed date range and mean |
| Model datasets | Only if the authors publish a new version | Update the record ID, rerun, compare the validation values above |
| Knowledge base | At least yearly, and after major papers or assessments | See docs/CONTENT.md |

After any rebuild, run `npm run build` and look at the explorer and charts before publishing.
