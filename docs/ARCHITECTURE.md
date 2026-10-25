# Architecture

## Principles

- **Static first.** Next.js 15 with `output: "export"`. Every page is pre-rendered HTML; interactive parts hydrate in the browser.
  Hosting costs nothing beyond a static host, and there is nothing to patch on a server.
- **One source of numbers.** The numbers quoted in page text (for example London's winter temperature) are read at build time
  from the same manifest files that the maps draw (`src/lib/amocData.ts`). Nothing quantitative is typed into the page by hand,
  except figures quoted from papers, which are cited.
- **Light page, dark Earth.** The page is pale paper; colour is reserved for data. Brand colours never encode data.

## Layout

```
content/science/*.md        knowledge base, one Markdown file per topic (see content/science/README.md)
pipeline/                   Python data pipeline (uv); outputs to public/
public/data/                processed data served to the browser (committed)
public/og/, public/img/     link-preview and card images generated from the data
src/app/                    routes (App Router)
src/components/             UI components
src/lib/                    data access, field decoding, site constants
docs/                       documentation
```

## Key components

| Component | Role |
|---|---|
| `EarthMap` | MapLibre GL globe or Web Mercator map. Looks: `satellite` (Blue Marble), `night` (Black Marble), `data` (quiet base under a field). Takes a rendered canvas as an image source and GeoJSON overlays. Uses cooperative gestures so page scrolling is not hijacked. |
| `lib/field.ts` | Loads 8-bit PNG grids, decodes them to physical values, samples them bilinearly for hover read-outs, and renders them to a Mercator-spaced image with a lookup table. |
| `AmocExplorer` | The AMOC scenario explorer: guided views, controls, legend, read-out, sea-ice edges, rainfall agreement stippling, the places table, and URL state for sharing. |
| `ExplorerLink` | A real, shareable link to an explorer state that also updates the explorer in place on the same page. |
| `LineChart`, `AmocCharts` | Small SVG charts with fixed, explicit axes and direct labels: RAPID observations, the hysteresis experiment, scenario runs. |
| `HeroGlobe` | Homepage globe; zoom follows the container width so the whole planet stays in view. |
| `AtlasView` | Day and night globe with place shortcuts and layer cautions. |
| `lib/science.ts` | Reads the knowledge-base Markdown and enforces the seven-section structure at build time. |

## Data encoding

Each gridded layer is an 8-bit greyscale PNG on a regular 0.5° grid (721 × 361, rows north to south). Pixel 0 is "no data";
1–255 map linearly onto the layer's `[vmin, vmax]`, recorded in the manifest. The browser decodes once into a `Float32Array`,
which drives both colouring and hover values. With 254 levels across each layer's own range, the step is 0.06–0.23 °C for
temperature layers, 1–2 days for frost days and about 1 percentage point for rainfall, well below what the models can
distinguish. A layer is 20–65 kB.

MapLibre maps image sources linearly in Web Mercator, so fields are resampled row by row into Mercator spacing before display
(`renderMercator`), clipped at ±85.05°.

## Colour

- Temperature: cmocean `balance` (diverging, perceptually uniform).
- Rainfall: ColorBrewer `BrBG`, brown for drier, the IPCC convention for precipitation change.
- Every variable has a fixed, documented range shared across comparisons; values beyond it show the end colour and the legend
  says "≤" or "≥". Ranges are set in `pipeline/amoc_scenarios.py` (`DOMAINS`) and `pipeline/nahosmip_rain.py`.

## URLs and sharing

Explorer state lives in the query string (`?show=&var=&compare=&ice=&season=&region=&view=`), written with
`history.replaceState`. Every page sets a title, description, canonical URL and an Open Graph image (`public/og`).

## Accessibility

Skip link, landmarks, `aria-pressed` on toggles, text alternatives for maps and charts, keyboard-reachable controls,
and reduced-motion support (no globe spin, instant camera moves).
