/**
 * How much sea level is eventually committed, by the peak global warming reached.
 * IPCC AR6 WGI Chapter 9, Table 9.10 (Fox-Kemper et al., 2021): ranges over 2,000 and
 * 10,000 years. Low confidence in the SPM; the 1.5°C 10,000-year value rests on one study.
 */
const ROWS = [
  { t: "1.5°C", k2: [2, 3], k10: [6, 7] },
  { t: "2°C", k2: [2, 6], k10: [8, 13] },
  { t: "3°C", k2: [4, 10], k10: [10, 24] },
  { t: "4°C", k2: [12, 16], k10: [19, 33] },
  { t: "5°C", k2: [19, 22], k10: [28, 37] },
];
const MAX = 40;
const pct = (v: number) => `${(v / MAX) * 100}%`;

export default function CommitmentChart() {
  return (
    <figure style={{ margin: 0 }}>
      <p style={{ margin: "0 0 0.3rem", fontWeight: 600 }}>Eventual sea-level rise, by the peak warming the world reaches</p>
      <p className="small faint" style={{ margin: "0 0 1.1rem" }}>Metres of global rise, as ranges</p>
      <div style={{ display: "grid", gap: "0.9rem" }} role="img"
        aria-label="IPCC estimates of committed global sea-level rise: at 1.5 degrees, 2 to 3 metres over 2,000 years and 6 to 7 metres over 10,000 years; at 2 degrees, 2 to 6 and 8 to 13 metres; at 3 degrees, 4 to 10 and 10 to 24 metres; at 4 degrees, 12 to 16 and 19 to 33 metres; at 5 degrees, 19 to 22 and 28 to 37 metres.">
        {ROWS.map((r) => (
          <div key={r.t} style={{ display: "grid", gridTemplateColumns: "3.2rem 1fr", gap: "0.8rem", alignItems: "center" }}>
            <b className="tnum" style={{ fontSize: "0.95rem" }}>{r.t}</b>
            <div style={{ position: "relative", height: 30 }}>
              <span style={{ position: "absolute", top: 0, height: 13, left: pct(r.k2[0]), width: pct(Math.max(r.k2[1] - r.k2[0], 0.4)), background: "#0a62b8", borderRadius: 3 }} />
              <span className="tnum" style={{ position: "absolute", top: -2, left: `calc(${pct(r.k2[1])} + 6px)`, fontSize: "0.78rem", color: "var(--text-2)", whiteSpace: "nowrap" }}>{r.k2[0]}–{r.k2[1]} m</span>
              <span style={{ position: "absolute", top: 16, height: 13, left: pct(r.k10[0]), width: pct(r.k10[1] - r.k10[0]), background: "#9cc3ea", borderRadius: 3 }} />
              <span className="tnum" style={{ position: "absolute", top: 14, left: `calc(${pct(r.k10[1])} + 6px)`, fontSize: "0.78rem", color: "var(--text-3)", whiteSpace: "nowrap" }}>{r.k10[0]}–{r.k10[1]} m</span>
            </div>
          </div>
        ))}
        <div style={{ display: "grid", gridTemplateColumns: "3.2rem 1fr", gap: "0.8rem" }}>
          <span />
          <div style={{ position: "relative", height: 16, borderTop: "1px solid var(--line)" }}>
            {[0, 10, 20, 30, 40].map((v) => (
              <span key={v} className="tnum" style={{ position: "absolute", left: pct(v), top: 3, fontSize: "0.75rem", color: "var(--text-3)", transform: v === 40 ? "translateX(-100%)" : v ? "translateX(-50%)" : undefined, whiteSpace: "nowrap" }}>{v} m</span>
            ))}
          </div>
        </div>
      </div>
      <ul style={{ listStyle: "none", padding: 0, margin: "1rem 0 0", display: "flex", flexWrap: "wrap", gap: "0.3rem 1.2rem", fontSize: "0.8rem", color: "var(--text-2)" }}>
        <li><i style={{ display: "inline-block", width: 14, height: 8, background: "#0a62b8", borderRadius: 2, marginRight: 6 }} />Within 2,000 years</li>
        <li><i style={{ display: "inline-block", width: 14, height: 8, background: "#9cc3ea", borderRadius: 2, marginRight: 6 }} />Within 10,000 years</li>
      </ul>
      <figcaption className="small faint" style={{ marginTop: "0.8rem" }}>
        <span className="evidence evidence--model">Assessment</span> IPCC AR6 Working Group I, Chapter 9, Table 9.10 (Fox-Kemper et al., 2021),
        relative to 1850–1900 warming. The IPCC gives these values <i>low confidence</i>; the 1.5°C value over 10,000 years rests on a
        single study. For comparison, about 125,000 years ago, when the world was 0.5–1.5°C warmer than pre-industrial, sea level was
        likely 5–10 m higher than today.
      </figcaption>
    </figure>
  );
}
