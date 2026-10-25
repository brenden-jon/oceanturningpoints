/** Site-wide constants. One place to change names, links and the domain. */
export const SITE = {
  name: "Ocean Turning Points",
  tagline: "The science of a changing ocean, and what it means for our world.",
  // Public address, including any sub-path. Set NEXT_PUBLIC_SITE_URL at build
  // time (the deploy workflow does) until the custom domain is connected.
  url: (process.env.NEXT_PUBLIC_SITE_URL ?? "https://oceanturningpoints.org").replace(/\/$/, ""),
  creator: "Brenden Jongman",
};

/** Prefix for static assets when the site is served from a sub-path. */
export const BASE = process.env.NEXT_PUBLIC_BASE_PATH ?? "";
/** Absolute URL for metadata (canonical links, share images). */
export const abs = (p: string) => `${SITE.url}${p.startsWith("/") ? p : `/${p}`}`;

export const asset = (p: string) => `${BASE}${p.startsWith("/") ? p : `/${p}`}`;

export const NAV = [
  { href: "/ocean-now/", label: "Ocean now" },
  { href: "/changes/", label: "Big changes" },
  { href: "/responses/", label: "What can be done" },
  { href: "/science/", label: "Science" },
  { href: "/about/", label: "About" },
];
