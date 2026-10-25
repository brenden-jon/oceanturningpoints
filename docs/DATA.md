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
| NOAA Coral Reef Watch SST anomaly and Degree Heating Weeks, v3.1 (daily, 5 km) | NOAA CRW via CoastWatch ERDDAP; Skirving et al. (2020) Remote Sensing 12, 3856 | Use without restriction, with credit | Ocean now; coral story; El Niño article (refreshed daily) | `ocean_now.py` |
| NOAA CoastWatch blended near-real-time surface currents | NOAA CoastWatch ERDDAP (`noaacwBLENDEDNRTcurrentsDaily`) | Public domain | Animated currents (refreshed daily) | `ocean_now.py` |
| ENSO indices and discussion | NOAA Climate Prediction Center (weekly Niño indices, ONI, RONI) | Public domain | El Niño status and charts (refreshed daily) | `ocean_now.py` |
| Sea Ice Index v4 (G02135) | NSIDC; Fetterer et al., doi:10.7265/a98x-0f50 | Free with citation | Arctic and Antarctic sea-ice charts (refreshed daily) | `ocean_now.py` |
| CRW Four-Month Coral Bleaching Heat Stress Outlook v5 (CFSv2), 60% level | NOAA Coral Reef Watch; Liu et al. (2018) Front. Mar. Sci. 5:57 | Use without restriction, with credit | Bleaching outlook (weekly) | `ocean_now.py` |
| NMME ensemble-mean SST anomaly forecast | NOAA Climate Prediction Center; Kirtman et al. (2014) BAMS 95, 585–601 | Public domain | Temperature outlook, 1–4 months (monthly) | `ocean_now.py` |
| NOAA Coral Reef Watch regional virtual stations v3.1 | NOAA CRW (214 reef regions, daily since 1985) | Use without restriction, with credit | Reef regions map and histories (weekly) | `reef_stations.py` |
| IPCC AR6 sea-level projections | Garner et al. (2021), doi:10.5281/zenodo.6382554; Kopp et al. (2023) GMD | CC BY 4.0 | City and global projections: medium confidence to 2150, low confidence (rapid ice-sheet loss) to 2300 | `sea_level.py` |
| IMBIE ice-sheet mass balance | Otosaka et al. (2026) Sci. Data, data doi:10.5285/128c5e33-5224-4197-82f0-19dcc95b80a0 | Open Government Licence v3.0 | Ice-sheet chart | `sea_level.py` |
| NOAA LSA global mean sea level | NOAA Laboratory for Satellite Altimetry | Public domain | Observed sea level (series currently ends Feb 2025) | `sea_level.py` |
| Protected Planet: World Database on Protected and Conserved Areas (WDPCA) | UNEP-WCMC and IUCN (2026), October 2026 release. Citation and release month live in `src/lib/wdpa.ts` | Non-commercial; **displayed via UNEP-WCMC's map service, never downloaded or redistributed**; citation with release month and a link to protectedplanet.net must be visible | Protected areas on the globe, reef map and the global map on /responses/; coverage time series (published statistics, transcribed) | n/a |
| FishMIP projections of fish biomass by country | Blanchard & Novaglio (eds) 2024, FAO Fisheries and Aquaculture Technical Paper 707, doi:10.4060/cd1379en; data doi:10.5281/zenodo.13988998 | Apache-2.0 | Fish on the move map and continent chart | `fish.py` |
| Natural Earth 1:50m admin-0 countries | naturalearthdata.com | Public domain | Country shapes for the fish map | `fish.py` |
| MPI-SOM-FFN v2025 air–sea CO₂ flux | Jersild, Landschützer, Gruber & Bakker, NOAA NCEI 0160558, doi:10.7289/v5z899n6 | Free to use with citation | Southern Ocean carbon uptake chart (anomaly from 1985–2018 mean, south of 35°S) | `southern_ocean.py` |
| OceanOPS platform metadata | OceanOPS (WMO-IOC), ocean-ops.org public API | Free for educational and non-commercial use with acknowledgement | Monitoring map (last positions, type, country; refreshed weekly) | `monitoring.py` |
| GLOSS Core Network | PSMSL (Holgate et al. 2013), glossCoreNetwork.xml | Citation requested | Active tide gauges on the monitoring map | `monitoring.py` |
| MPAtlas level-of-protection summary | Marine Conservation Institute, analysis of 20 Oct 2026 | Non-commercial | Fully/highly protected share on /responses/ (transcribed) | n/a |
| Natural Earth 1:110m and 1:50m coastlines, land, boundary lines | naturalearthdata.com | Public domain | Map lines; preview images | `basemap_and_scales.py` |
| Blue Marble Shaded Relief and Bathymetry | NASA Earth Observatory via NASA GIBS (tiles requested by the browser) | Public domain (credit NASA) | Homepage globe, atlas, home preview image | n/a; `figures.py` for the preview |
| Black Marble 2016 (VIIRS) | NASA via GIBS; Román et al. (2018) RSE 210, 113–143 | Public domain (credit NASA) | Atlas night lights | n/a |
| cmocean colour maps | Thyng et al. (2016) Oceanography 29, 9–13 | MIT | Temperature scales | `basemap_and_scales.py` |
| ColorBrewer BrBG | Cynthia Brewer, via matplotlib | Apache 2.0 | Rainfall scale | `basemap_and_scales.py` |
| Spectral, Hanken Grotesk fonts | Google Fonts | SIL Open Font Licence | Site type; preview images | `figures.py` |

## Numbers transcribed from publications

Some charts are drawn from numbers in published papers and reports rather than from data files. They are written into the
components with their source next to them: `ExtremeElNinoChart.tsx` (Sengupta et al. 2026), `CommitmentChart.tsx` (AR6 WGI
Table 9.10), `ReefBenefits.tsx` (Beck et al. 2018; Perry et al. 2025; Teh et al. 2013; Spalding et al. 2017), `PathwaysChart.tsx`
(UNEP Emissions Gap Report 2026; GTPR 2025), `ProtectionCharts.tsx` (Protected Planet, MPAtlas, Systemiq 2026, Sumaila et al. 2019)
the drought chart on the El Niño page (Delage & Power 2020), `ObservingRecords.tsx` (redrawn from Jongman, forthcoming, with
the author's permission) and the model-share chart on the subpolar gyre page (Sgubin et al. 2017; Swingedouw et al. 2021). Figures from papers under NC-ND licences are never reproduced;
only their numbers are used, redrawn.

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

### The ocean now (`ocean_now.py`, daily)
- Runs inside the deploy workflow every morning (06:40 UTC) before the site is built, and on every push. Each source is fetched
  independently with a timeout; if one fails, the last good file (committed in `public/data/now`) is used and the failure is
  recorded in `manifest.json` under `status`.
- Currents: every second 0.25° cell (0.5° grid), u and v stored in the red and green channels of a PNG, clipped at ±2 m/s.
- SST anomaly and Degree Heating Weeks: every fifth 0.05° pixel (0.25° grid). Degree Heating Weeks are shown between 35°S and
  35°N only, and values above 60 °C-weeks are treated as invalid.
- Sea ice: daily extent for both hemispheres; the 1981–2010 median and the record low for each day of the year are computed
  from the full record.
- Outlooks: the newest Coral Reef Watch outlook file is found from the directory listing (its name embeds the forecast window);
  the NMME run is looked up for the current month and up to two months back. NMME leads 1–4 are kept and masked to ocean using
  today's satellite SST grid. Both are labelled "Forecast" wherever they appear.
- El Niño: weekly traditional and relative Niño-3.4, the ONI and RONI, and the alert status parsed from NOAA's monthly
  diagnostic discussion.

### Topic images (`topic_art.py`)
- One image per big change, drawn from data where possible: reef heat stress (CRW stations), the Pacific SST anomaly and
  Antarctic surface currents (snapshots from the day the script runs), and NASA Blue Marble polar views from the GIBS WMS
  (EPSG:3413 and EPSG:3031). The AMOC and subpolar-gyre images are schematics after Buckley & Marshall (2016); their paths
  are indicative, not traced from data. `img/amoc-circulation.png` is the labelled AMOC diagram used on the AMOC page.

### Images (`figures.py`)
Open Graph previews (1200 × 630) and homepage card images, drawn from the published layers with the same colour scales.

## Updating

| What | How often | Steps |
|---|---|---|
| RAPID observations | When NOC releases a new version (roughly yearly) | Delete `pipeline/.cache/rapid`, update the URL or version in `amoc_series.py` if it changed, run the script, check the printed date range and mean |
| Model datasets | Only if the authors publish a new version | Update the record ID, rerun, compare the validation values above |
| Knowledge base | At least yearly, and after major papers or assessments | See docs/CONTENT.md |

After any rebuild, run `npm run build` and look at the explorer and charts before publishing.
