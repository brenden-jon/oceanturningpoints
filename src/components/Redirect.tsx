"use client";

import { useEffect } from "react";
import { asset } from "@/lib/site";

/** Moves visitors from an old address to its new one, keeping any query string (e.g. a shared map view). */
export default function Redirect({ to }: { to: string }) {
  useEffect(() => {
    window.location.replace(asset(to) + window.location.search + window.location.hash);
  }, [to]);
  return (
    <div className="wrap" style={{ padding: "4rem var(--gutter)" }}>
      <p>This page has moved to <a href={asset(to)}>{to}</a>.</p>
    </div>
  );
}
