/** Site-wide constants. One place to change names, links and the domain. */
export const SITE = {
  name: "Ocean Turning Points",
  tagline: "The science of a changing ocean, and what it means for our world.",
  // Public address, including any sub-path, from the deploy workflow's Pages configuration.
  // Always https: GitHub Pages reports http:// for a custom domain until HTTPS is enforced.
  url: (process.env.NEXT_PUBLIC_SITE_URL ?? "https://oceanturningpoints.org").replace(/\/$/, "").replace(/^http:\/\/(?!localhost)/, "https://"),
  creator: "Brenden Jongman",
};

/** Prefix for static assets when the site is served from a sub-path. */
export const BASE = process.env.NEXT_PUBLIC_BASE_PATH ?? "";
/** Absolute URL for metadata (canonical links, share images). */
export const abs = (p: string) => `${SITE.url}${p.startsWith("/") ? p : `/${p}`}`;

export const asset = (p: string) => `${BASE}${p.startsWith("/") ? p : `/${p}`}`;

export const NAV = [
  { href: "/ocean-now/", label: "The ocean now" },
  { href: "/changes/", label: "Big changes" },
  { href: "/decisions/", label: "Decisions" },
  { href: "/responses/", label: "What can be done" },
  { href: "/monitoring/", label: "Monitoring" },
  { href: "/science/", label: "Science" },
  { href: "/about/", label: "About" },
];
