"use client";

import { asset } from "@/lib/site";

/**
 * A link to a particular view of the AMOC explorer. It is a real URL, so it
 * can be shared or opened in a new tab; on the page itself it simply moves
 * the explorer to that view and scrolls to it.
 */
export default function ExplorerLink({ query, children, className }: { query: string; children: React.ReactNode; className?: string }) {
  const href = asset(`/changes/atlantic-circulation/?${query}#explorer`);
  return (
    <a
      href={href}
      className={className}
      onClick={(e) => {
        const target = document.getElementById("explorer");
        if (!target || e.metaKey || e.ctrlKey || e.shiftKey) return;
        e.preventDefault();
        window.dispatchEvent(new CustomEvent("otp:amoc-view", { detail: query }));
        const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
        target.scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "start" });
      }}
    >
      {children}
    </a>
  );
}
