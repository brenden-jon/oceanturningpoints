# Content and editorial rules

## Voice
- Intelligent, accessible, calm. Not alarmist, not advocacy.
- Headlines are concrete scientific questions.
- British spelling. Short paragraphs. No marketing phrases ("unlock", "delve", "game-changer", "landscape", "navigate").
- The science should be what readers remember, not the site or its curator.

## Evidence
- Only published, publicly released, peer-reviewed research, IPCC assessments and official datasets.
- Verify every reference against Crossref (or DataCite for datasets) before citing it: title, first author, year, journal.
- Every number has its source next to it. Numbers derived from the site's own data are read from the data files at build time
  (`src/lib/amocData.ts`), never typed in.
- Use IPCC calibrated language correctly. Where the IPCC has not assessed a claim, the confidence table states its basis.
- Always distinguish observations from models, history from projections, scenarios from forecasts, exposure from damages,
  and hypothetical counterfactuals (for example "no reef at all") from realistic change (a degrading reef).
- Do not use material shared in confidence. Do not describe unpublished analyses or findings.

## Adding a topic
1. Create `content/science/<slug>.md` following `content/science/README.md`.
2. Check every DOI, then run `npm run build`; the build fails if a section is missing.
3. Add the slug to `related` lists of neighbouring topics.

## Reviewing a topic
At least once a year, and after major papers or assessments:
1. Search for new literature since the `reviewed` date.
2. Update text, key points and the confidence table; recheck every reference.
3. Set `reviewed` (and `updated`) to the review date.

## Curator credit
- A single attribution line in the footer and a proper About page. No institutional logos, no implied partnerships.
- Affiliations are stated factually on the About page only, with an explicit independence statement.
- Link from relevant pages to the curator's published work, never to drafts or work under review.

## Publications policy (`src/lib/publications.ts`)
- List only work that has been published and publicly released, verified against Crossref.
- Never list drafts, submissions, revisions or work under review, and never name the journal a manuscript is intended for.
- Exceptions only with the curator's explicit authorisation.
- Jongman & Hall (2026), Nature Sustainability, doi:10.1038/s41893-026-01961-1 (published 27 October 2026; previously an authorised forthcoming exception);
  the ocean observation manuscript, cited as "Jongman (forthcoming)" and listed under work in progress; topic lines for work in
  progress on decisions for a changing ocean and on financing marine protection, with no findings, journals or institutions.

## Latest research (`content/data/latest_research.json`)
Add new entries at any time; the page sorts by date. For each entry: verify the DOI on Crossref, read the abstract, and write one
plain sentence (at most 30 words) of the main finding. Fields: date, topic (one of the keys in `src/lib/research.ts`), title,
authors ("Surname, I. et al."), venue, doi (or null with a url), summary, type ("article" or "report"), verified.

## Impacts by region and sector (`content/data/impacts.json`)
Each statement carries a change, a sector, a source with DOI or URL, an evidence type (observed, projection, model experiment,
expert assessment) and confidence wording. AMOC and subpolar-gyre statements describe what models show if a collapse happened.

## Decision lens (`src/lib/decisions.ts`)
Act now / Assess now / Stay the course for each big change. The lens is the site's own synthesis; keep each item short, and
change it when the evidence on the topic page changes.
