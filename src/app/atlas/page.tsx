import type { Metadata } from "next";
import AtlasView from "@/components/AtlasView";

export const metadata: Metadata = {
  title: "Atlas",
  description: "Explore the Earth by day and by night: where the shallow seas and reefs are, and how human settlement crowds the coasts.",
  alternates: { canonical: "/atlas/" },
};

export default function AtlasPage() {
  return (
    <div className="wrap" style={{ paddingTop: "clamp(2rem, 4.5vw, 3.5rem)", paddingBottom: "4rem" }}>
      <header style={{ display: "grid", gap: "0.9rem", marginBottom: "1.75rem" }}>
        <p className="eyebrow">Atlas</p>
        <h1 style={{ maxWidth: "22ch", fontSize: "clamp(2.2rem, 4.2vw, 3.3rem)" }}>Where do the ocean and people meet?</h1>
        <p className="standfirst">
          Drag to turn the globe; use Ctrl or ⌘ and scroll, or two fingers, to zoom. Switch to night to see how settlement crowds the coasts.
        </p>
      </header>
      <AtlasView />
    </div>
  );
}
