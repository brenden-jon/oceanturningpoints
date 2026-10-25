/**
 * Share of El Niño events that are extreme, before, during and after warming,
 * from Sengupta et al. (2026), Communications Earth & Environment 7, 810.
 * Numbers transcribed from the paper; the figure itself is not reproduced.
 */
const GROUPS = [
  {
    title: "Nine Earth system models (ZECMIP)",
    bars: [
      { label: "Pre-industrial climate", value: 9.82 },
      { label: "While warming (CO₂ rising 1% a year)", value: 21.33 },
      { label: "After emissions reach net zero", value: 20.25 },
    ],
  },
  {
    title: "One model, net zero reached at different dates (ACCESS-ESM1-5)",
    bars: [
      { label: "Pre-industrial climate", value: 1.73 },
      { label: "While warming (around 2060, high emissions)", value: 34.7 },
      { label: "Net zero reached in 2060", value: 26.3 },
      { label: "Net zero reached in 2045", value: 17.0 },
      { label: "Net zero reached in 2030", value: 16.4 },
    ],
  },
];

export default function ExtremeElNinoChart() {
  const max = 40;
  return (
    <figure style={{ margin: 0, display: "grid", gap: "1.4rem" }}>
      {GROUPS.map((g) => (
        <div key={g.title} style={{ display: "grid", gap: "0.5rem" }}>
          <p style={{ margin: 0, fontWeight: 600, fontSize: "0.95rem" }}>{g.title}</p>
          {g.bars.map((b) => (
            <div key={b.label} style={{ display: "grid", gridTemplateColumns: "minmax(9rem, 15rem) 1fr", gap: "0.8rem", alignItems: "center" }}>
              <span className="small" style={{ color: "var(--text-2)", lineHeight: 1.3 }}>{b.label}</span>
              <span style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                <span style={{ height: 16, width: `${(b.value / max) * 100}%`, minWidth: 3, borderRadius: 4,
                  background: b.label.startsWith("Pre-industrial") ? "#9aa5b1" : "#b24a2a" }} />
                <b className="tnum" style={{ fontSize: "0.95rem" }}>{b.value.toFixed(b.value < 10 ? 1 : 0)}%</b>
              </span>
            </div>
          ))}
        </div>
      ))}
      <figcaption className="small faint">
        Share of El Niño events that are extreme, in model simulations. Source: Sengupta et al. (2026), <i>Communications Earth &amp;
        Environment</i>, <a href="https://doi.org/10.1038/s43247-026-04082-x">doi:10.1038/s43247-026-04082-x</a>. The single-model results
        come from one model with known biases, which the authors note could amplify the frequency of extreme events.
      </figcaption>
    </figure>
  );
}
