import { PROFILES } from "@/lib/publications";
import { SITE, abs } from "@/lib/site";

/** Structured data for search engines (schema.org JSON-LD). */
const AUTHOR = {
  "@type": "Person", name: SITE.creator, honorificPrefix: "Dr", url: abs("/about/"), image: abs("/img/brenden-jongman.jpg"),
  alumniOf: { "@type": "CollegeOrUniversity", name: "VU University Amsterdam" },
  sameAs: [PROFILES.website, PROFILES.scholar, PROFILES.linkedin].filter(Boolean),
};

export function SiteLd() {
  const data = {
    "@context": "https://schema.org", "@type": "WebSite", name: SITE.name, url: abs("/"),
    description: "Independent, evidence-led guide to the big changes in the ocean — the Atlantic circulation (AMOC), coral reefs, ice sheets, El Niño, fish on the move and the subpolar North Atlantic — and what they mean for decisions.",
    inLanguage: "en", creator: AUTHOR, publisher: AUTHOR,
  };
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }} />;
}

export function ArticleLd({ path, title, description, about, image = "/og/science.png", modified = "2026-10-25" }: {
  path: string; title: string; description: string; about: string[]; image?: string; modified?: string;
}) {
  const data = {
    "@context": "https://schema.org", "@type": "Article", headline: title, description,
    url: abs(path), mainEntityOfPage: abs(path), image: abs(image), inLanguage: "en",
    datePublished: "2026-10-24", dateModified: modified, author: AUTHOR, publisher: AUTHOR,
    about: about.map((name) => ({ "@type": "Thing", name })),
  };
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }} />;
}
