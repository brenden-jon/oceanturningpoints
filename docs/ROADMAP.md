# Limitations and next priorities

## Known limitations
- AMOC temperature maps come from one model (CESM 1.0.5). Other models agree on the pattern, not the size.
- AMOC experiments use artificial freshwater forcing; ice sheets are fixed and greenhouse forcing is held after 2100.
- Rainfall uses four models; percentages are relative to each model's pre-industrial climate.
- Two of the three rainfall validation boxes only approximate the published regions (see docs/DATA.md).
- Place values are single model grid cells (100–250 km); they are regional, not local.
- Daily satellite layers are shown at 0.25–0.5°, coarser than the source products, and are less reliable near coasts and ice.
- Coral heat stress (Degree Heating Weeks) indicates bleaching risk, not observed bleaching or mortality.
- Marine protected areas show designation, not management effectiveness or no-take status.
- The subpolar gyre and the Southern Ocean have explainers but no dedicated story page yet.
- City sea-level values include tide-gauge land motion but not present-day subsidence that no gauge records.
- Protected-area coverage is shown from published statistics; there is no country-level breakdown yet.

## Next priorities (suggested order)
1. **Marine heatwave outlook.** NOAA PSL's experimental marine heatwave forecasts (Jacox et al., 2022), labelled separately
   from Coral Reef Watch products because the definitions differ.
2. **Responses: protection where it counts.** Where reefs that are coping better with heat overlap with strong protection;
   protection coverage and level by country and region, from published statistics only.
3. **Responses: finance.** Extend the finance section as new peer-reviewed analysis of the costs and financing of marine
   protection is published.
4. **People exposed to AMOC rainfall change.** Combine the four-model rainfall layer with GHSL population (JRC, CC BY 4.0),
   labelled as exposure, not impact.
5. **Southern Ocean and subpolar North Atlantic.** OSNAP observations; Antarctic sea ice and bottom-water change.
6. Choose a code licence; add a corrections log; consider privacy-respecting analytics.
