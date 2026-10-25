# Knowledge base

One Markdown file per topic. The file name is the URL slug (`amoc.md` → `/science/amoc/`).
Files starting with `_` and this README are ignored.

## Frontmatter

```yaml
title: "Short topic name"
question: "The page headline: a concrete scientific question"
summary: "One or two sentences, used on cards and as the meta description"
order: 1                     # position in lists
updated: "YYYY-MM-DD"        # last edit
reviewed: "YYYY-MM-DD"       # last full check against new literature (shown on the page)
status: "Reviewed against literature published to <month year>"
related: ["other-slug"]
explorer: "/questions/..."   # optional link to interactive data
keyPoints: ["3–5 one-sentence takeaways, each with a citation"]
confidence:
  - claim: "..."
    level: high | medium | low
    basis: "what the confidence rests on"
```

## Body

Exactly these seven H2 sections, in this order (the build fails otherwise):

1. The system
2. What we observe
3. What could change
4. Consequences
5. What we know and don't know
6. Why it matters for decisions
7. References and data

See docs/CONTENT.md for the editorial rules.
