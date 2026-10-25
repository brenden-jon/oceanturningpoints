/**
 * Marine and coastal protected areas, drawn by UNEP-WCMC's own map service, so the
 * dataset is never copied, redistributed or offered for download. Protected Planet's
 * terms ask for the full citation with the release month and a link to protectedplanet.net.
 * Update RELEASE when UNEP-WCMC publishes a new monthly release.
 */
export const WDPA_RELEASE = "October 2026";

export const WDPA_CITATION =
  `UNEP-WCMC and IUCN (2026), Protected Planet: The World Database on Protected and Conserved Areas (WDPCA), ${WDPA_RELEASE}, Cambridge, UK: UNEP-WCMC and IUCN.`;

export const WDPA_LAYER = {
  id: "wdpa",
  tiles: ["https://data-gis.unep-wcmc.org/server/rest/services/ProtectedSites/The_World_Database_of_Protected_Areas/MapServer/export?bbox={bbox-epsg-3857}&bboxSR=3857&imageSR=3857&size=256,256&format=png32&transparent=true&f=image&layers=show:1&layerDefs=%7B%221%22%3A%22realm%20%3C%3E%20%27Terrestrial%27%22%7D"],
  attribution: `Protected areas: <a href="https://www.protectedplanet.net/">UNEP-WCMC &amp; IUCN, Protected Planet (WDPCA), ${WDPA_RELEASE}</a>`,
  opacity: 0.8,
};
