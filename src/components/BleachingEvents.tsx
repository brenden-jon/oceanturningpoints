/** Share of the world's coral reef area exposed to bleaching-level heat stress in each global event (NOAA Coral Reef Watch). */
const EVENTS = [
  { label: "1998", share: 21 },
  { label: "2010", share: 37 },
  { label: "2014–2017", share: 68 },
  { label: "2023–2025", share: 84 },
];

export default function BleachingEvents() {
  return (
    <figure style={{ margin: 0 }}>
      <div role="img" aria-label="Global coral bleaching events: 21% of reef area in 1998, 37% in 2010, 68% in 2014–2017 and 84% in 2023–2025 exposed to bleaching-level heat stress."
        style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", alignItems: "end", gap: "1rem", height: 260 }}>
        {EVENTS.map((e) => (
          <div key={e.label} style={{ display: "grid", gap: "0.4rem", alignContent: "end", height: "100%" }}>
            <span style={{ fontSize: "1.6rem", fontWeight: 700, letterSpacing: "-0.03em" }}>{e.share}%</span>
            <div style={{ height: `${e.share * 2}px`, background: "linear-gradient(180deg, #a1162b 0%, #e2785c 100%)", borderRadius: "10px 10px 4px 4px" }} />
            <span className="small" style={{ color: "var(--text-2)" }}>{e.label}</span>
          </div>
        ))}
      </div>
      <figcaption className="small faint" style={{ marginTop: "0.8rem" }}>
        Share of the world’s coral reef area exposed to bleaching-level heat stress in each of the four global bleaching events.
        This measures heat stress from satellites; bleaching and mortality vary from reef to reef. Source: NOAA Coral Reef Watch (2026).
      </figcaption>
    </figure>
  );
}
