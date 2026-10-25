# Ocean Turning Points

An independent, evidence-led atlas of ocean change and its consequences for people.
Created and curated by Brenden Jongman. Proposed domain: oceanturningpoints.org.

The site is a static Next.js export: plain HTML, JavaScript and pre-processed data files that any static host can serve.
It has no server, database, accounts or tracking.

## What is in the first release

| Route | What it is |
|---|---|
| `/` | Homepage: a turning Blue Marble globe, the featured AMOC question, the ocean systems covered, how change reaches people, and the evidence principles |
| `/questions/amoc-collapse/` | Flagship explorer. CESM temperature scenarios and four-model rainfall maps on a globe or flat map, RAPID observations, the hysteresis experiment, scenario runs, regional consequences, a confidence table, decision steps and a full data disclosure |
| `/questions/` | Index of questions: the interactive one, plus the knowledge-base questions |
| `/science/` and `/science/<topic>/` | Knowledge base: AMOC, subpolar gyre, Southern Ocean, coral reefs and ice sheets, each in seven fixed sections with dated reviews and verified references |
| `/science/methods/` | Sources, kinds of evidence, uncertainty language, processing, limitations and the dataset list |
| `/atlas/` | Navigable globe with NASA Blue Marble (day) and Black Marble 2016 (night lights), plus cautions |
| `/about/` | Purpose, curator, independence statement, verified publications |

## Running it

```bash
npm install
npm run dev          # http://localhost:3100
npm run build        # static export to ./out
npm run start        # serve ./out on port 3100
```

The data in `public/data` are committed, so the site builds without running the pipeline.

To rebuild the data from the original sources (needs [uv](https://docs.astral.sh/uv/) and about 6 GB of cache):

```bash
npm run data
```

## Documentation

- [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md): how the site and its components fit together
- [docs/DATA.md](docs/DATA.md): every dataset, its licence and citation, how it is processed, validation results and how to update it
- [docs/CONTENT.md](docs/CONTENT.md): editorial rules, how to add or review a topic, the publications policy
- [docs/ROADMAP.md](docs/ROADMAP.md): known limitations and next priorities

## Deployment

The site deploys to GitHub Pages from `.github/workflows/deploy.yml` on every push to `main`
(Settings → Pages → Source must be "GitHub Actions"). The workflow sets `BASE_PATH` and `NEXT_PUBLIC_SITE_URL` from the
Pages configuration, so it works both at `brenden-jon.github.io/oceanturningpoints/` and, once connected, at a custom domain.
Any other static host works too: run `npm run build` with those two variables and serve `out/`.
No DNS changes have been made.

## Licences

Code: all rights reserved by the curator until a licence is chosen. Data are redistributed under their original licences (see docs/DATA.md).
Every data layer is credited on the page where it appears.
