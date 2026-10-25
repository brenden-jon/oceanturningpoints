/** Site-wide constants. One place to change names, links and the domain. */
export const SITE = {
  name: "Ocean Turning Points",
  tagline: "The science of a changing ocean, and what it means for our world.",
  url: "https://oceanturningpoints.org",
  creator: "Brenden Jongman",
};

/** Prefix for static assets when the site is served from a sub-path. */
export const BASE = process.env.NEXT_PUBLIC_BASE_PATH ?? "";
export const asset = (p: string) => `${BASE}${p.startsWith("/") ? p : `/${p}`}`;

export const NAV = [
  { href: "/questions/", label: "Questions" },
  { href: "/atlas/", label: "Atlas" },
  { href: "/science/", label: "Science" },
  { href: "/about/", label: "About" },
];
