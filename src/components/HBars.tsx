/** Horizontal bars with direct labels. Values are drawn from zero; `range` draws a floating bar. */
export interface HBar { label: string; value: number; range?: [number, number]; text?: string; muted?: boolean }

export default function HBars({ rows, max, color = "#0a62b8", labelWidth = "9rem", rule }: {
  rows: HBar[]; max: number; color?: string; labelWidth?: string; rule?: { at: number; label: string };
}) {
  const pct = (v: number) => `${(Math.min(v, max) / max) * 100}%`;
  return (
    <div style={{ display: "grid", gap: "0.45rem", position: "relative" }}>
      {rows.map((r) => (
        <div key={r.label} style={{ display: "grid", gridTemplateColumns: `minmax(6rem, ${labelWidth}) 1fr`, gap: "0.8rem", alignItems: "center", fontSize: "0.9rem" }}>
          <span style={{ color: "var(--text-2)", lineHeight: 1.25 }}>{r.label}</span>
          <span style={{ position: "relative", height: 18, display: "block", marginRight: "5.2rem" }}>
            {rule && <i aria-hidden style={{ position: "absolute", left: pct(rule.at), top: -4, bottom: -4, borderLeft: "1.5px dashed #b24a2a" }} />}
            <i style={{ position: "absolute", top: 1, height: 16, borderRadius: 4, background: r.muted ? "#9aa5b1" : color,
              left: r.range ? pct(r.range[0]) : 0, width: r.range ? pct(r.range[1] - r.range[0]) : pct(r.value), minWidth: 3 }} />
            <b className="tnum" style={{ position: "absolute", top: 0, left: `calc(${pct(r.range ? r.range[1] : r.value)} + 6px)`, fontSize: "0.88rem", whiteSpace: "nowrap" }}>
              {r.text ?? r.value.toLocaleString("en-GB")}
            </b>
          </span>
        </div>
      ))}
      {rule && (
        <div style={{ display: "grid", gridTemplateColumns: `minmax(6rem, ${labelWidth}) 1fr`, gap: "0.8rem" }}>
          <span />
          <span style={{ display: "block", fontSize: "0.75rem", lineHeight: 1.3, color: "#b24a2a", marginRight: "5.2rem", paddingLeft: `calc(${pct(rule.at)} - 2px)` }}>
            {rule.label}
          </span>
        </div>
      )}
    </div>
  );
}
