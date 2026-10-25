# Limitations and next priorities

## Known limitations of the first release
- AMOC temperature maps come from one model (CESM 1.0.5). Other models agree on the pattern, not the size.
- The AMOC experiments use artificial freshwater forcing; ice sheets are fixed and greenhouse forcing is held after 2100.
- Rainfall uses four models; percentages are relative to each model's pre-industrial climate, not to observed rainfall today.
- Two of our three rainfall validation boxes only approximate the published regions (see docs/DATA.md).
- Place values are single model grid cells (100–250 km); they are regional, not local.
- Night lights show electrification, not population; poor rural areas are under-represented.
- Subpolar gyre, Southern Ocean, coral reefs and ice sheets are explained but not yet mapped.
- The homepage globe depends on NASA GIBS tiles; if GIBS is slow the globe appears after a delay.

## Next priorities (suggested order)
1. **Population exposure to AMOC rainfall change.** Combine the four-model rainfall layer with GHSL population (JRC, CC BY 4.0)
   to show how many people live where models agree on large drying. Label clearly as exposure, not impact.
2. **Sea level.** Map dynamic sea-level change from a collapse (van Westen, Katsman & Le Bars, 2026, Ocean Science) alongside
   IPCC AR6 regional projections (NASA sea-level projection tool data).
3. **Coral reefs and coastal flood protection.** Map reef locations and published flood-protection values, separating the
   "no reef" counterfactual from realistic degradation. Check data licences before use.
4. **Ice sheets.** IMBIE mass-balance time series and AR6 sea-level projections by scenario.
5. **Southern Ocean and subpolar gyre.** Sea-ice extent (NSIDC) and OSNAP observations as charts.
6. **Animated surface currents** (data-driven only), for example from OSCAR or Copernicus Marine, if licences allow.
7. **Responses and decisions**, then marine protection, as separate sections once the evidence base is in place.
8. Choose a code licence; add a corrections log; add a simple privacy-respecting analytics option if wanted.
