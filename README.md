# Ocean Turning Points

An independent, evidence-led atlas of ocean change and its consequences for people.
Created and curated by Brenden Jongman. Live at https://oceanturningpoints.org.

The site is a static Next.js export: plain HTML, JavaScript and pre-processed data files that any static host can serve.
It has no server, database, accounts or tracking.

## What is in the first release

| Route | What it is |
|---|---|
| `/` | Homepage: today's ocean currents on a Blue Marble globe, live El Niño status, the featured AMOC question, the systems followed, how ocean change reaches people |
| `/ocean-now/` | Live globe (sea-temperature anomaly, coral heat stress, currents), El Niño status and indices, Arctic and Antarctic sea ice; refreshed daily |
| `/changes/` | The big changes: tipping thresholds against today's warming, and each system as change → people → decisions |
| `/changes/atlantic-circulation/` | AMOC scenario explorer with observations, model experiments, consequences, confidence and decisions |
| `/changes/coral-reefs/` | Coral story: live heat stress with marine protected areas, bleaching events, the reef tipping threshold, people, responses |
| `/science/` and `/science/<topic>/` | Evidence base: AMOC, El Niño, coral reefs, ice sheets, subpolar gyre, Southern Ocean; seven fixed sections, dated reviews, verified references |
| `/science/methods/` | Sources, kinds of evidence, uncertainty language, processing, limitations and datasets |
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

Old addresses (`/questions/…`, `/atlas/`) redirect to their new pages, keeping any shared map settings.

## Documentation

- [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md): how the site and its components fit together
- [docs/DATA.md](docs/DATA.md): every dataset, its licence and citation, how it is processed, validation results and how to update it
- [docs/CONTENT.md](docs/CONTENT.md): editorial rules, how to add or review a topic, the publications policy
- [docs/ROADMAP.md](docs/ROADMAP.md): known limitations and next priorities
- [docs/STYLE.md](docs/STYLE.md): design and writing rules

## Deployment

The site deploys to GitHub Pages from `.github/workflows/deploy.yml` on every push to `main`
(Settings → Pages → Source must be "GitHub Actions"). The workflow sets `BASE_PATH` and `NEXT_PUBLIC_SITE_URL` from the
Pages configuration. The custom domain oceanturningpoints.org is set in Settings → Pages (DNS at GoDaddy: four A records to GitHub Pages, `www` CNAME to brenden-jon.github.io); the old `brenden-jon.github.io/oceanturningpoints/` address redirects to it.
Any other static host works too: run `npm run build` with those two variables and serve `out/`.
No DNS changes have been made.

## Licences

Code: all rights reserved by the curator until a licence is chosen. Data are redistributed under their original licences (see docs/DATA.md).
Every data layer is credited on the page where it appears.
