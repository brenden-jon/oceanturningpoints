/**
 * Where the tipping thresholds lie, relative to today's warming.
 *
 * Central estimates and ranges are global warming above pre-industrial
 * (1850–1900) at which each system is assessed as likely to tip. Values from
 * Armstrong McKay et al. (2022) as updated in the Global Tipping Points
 * Report 2025. These are expert assessments with wide uncertainty, and
 * crossing a threshold commits a system to change over very different times:
 * about a decade for reefs, millennia for ice sheets.
 */
export interface Threshold { id: string; label: string; central: number; low: number; high: number; timescale: string; note?: string; href?: string }

export const OCEAN_THRESHOLDS: Threshold[] = [
  { id: "coral", label: "Warm-water coral reefs", central: 1.2, low: 1.0, high: 1.5, timescale: "about 10 years", href: "/changes/coral-reefs/" },
  { id: "greenland", label: "Greenland ice sheet", central: 1.5, low: 0.8, high: 3.4, timescale: "thousands of years", href: "/changes/ice-sheets/" },
  { id: "wais", label: "West Antarctic ice sheet", central: 1.5, low: 1.0, high: 3.0, timescale: "about 2,000 years", href: "/changes/ice-sheets/" },
  { id: "spg", label: "Subpolar North Atlantic convection", central: 1.8, low: 1.1, high: 3.8, timescale: "about 10 years", href: "/changes/subpolar-gyre/" },
  { id: "amoc", label: "Atlantic overturning circulation", central: 4.0, low: 1.4, high: 8.0, timescale: "about 50 years", note: "collapse cannot be ruled out below 2°C", href: "/changes/atlantic-circulation/" },
];

const X0 = 0.5, X1 = 5;

export default function ThresholdChart({ items = OCEAN_THRESHOLDS, now = [1.34, 1.41] }: { items?: Threshold[]; now?: [number, number] }) {
  const W = 760, rowH = 46, top = 34, left = 210, right = 24, H = top + items.length * rowH + 34;
  const sx = (v: number) => left + ((Math.min(v, X1) - X0) / (X1 - X0)) * (W - left - right);
  const ticks = [1, 1.5, 2, 3, 4, 5];
  return (
    <figure style={{ margin: 0 }}>
      <div style={{ overflowX: "auto" }}>
      <svg viewBox={`0 0 ${W} ${H}`} width="100%" role="img" style={{ fontFamily: "var(--font)", overflow: "visible", minWidth: 600 }}
        aria-label="Estimated global warming thresholds for ocean and ice tipping systems, with today's warming of about 1.4 degrees.">
        {ticks.map((t) => (
          <g key={t}>
            <line x1={sx(t)} x2={sx(t)} y1={top - 6} y2={H - 30} stroke={t === 1.5 || t === 2 ? "#cfd4d9" : "#eceef0"} strokeDasharray={t === 1.5 || t === 2 ? "3 3" : undefined} />
            <text x={sx(t)} y={H - 12} textAnchor="middle" fontSize="12" fontWeight={t === 1.5 || t === 2 ? 600 : 400} fill="#4b5560">{t}°C{t === 5 ? "+" : ""}</text>
          </g>
        ))}
        <rect x={sx(now[0])} y={top - 10} width={sx(now[1]) - sx(now[0])} height={H - 30 - top + 10} fill="#b24a2a" opacity="0.18" />
        <text x={sx(now[1]) + 4} y={top - 14} fontSize="12" fontWeight="600" fill="#b24a2a">Today, about 1.4°C</text>
        {items.map((d, i) => {
          const y = top + i * rowH + rowH / 2;
          return (
            <g key={d.id}>
              <text x={left - 14} y={y - 3} textAnchor="end" fontSize="13.5" fontWeight="600" fill="#16191d">{d.label}</text>
              <text x={left - 14} y={y + 13} textAnchor="end" fontSize="11.5" fill="#7d8792">{d.note ?? `change unfolds over ${d.timescale}`}</text>
              <line x1={sx(d.low)} x2={sx(d.high)} y1={y} y2={y} stroke="#0a62b8" strokeWidth="6" strokeLinecap="round" opacity="0.28" />
              {d.high > X1 && <text x={sx(X1) + 6} y={y + 4} fontSize="11" fill="#0a62b8">to {d.high}°C</text>}
              <circle cx={sx(d.central)} cy={y} r="6.5" fill="#0a62b8" stroke="#fff" strokeWidth="2" />
            </g>
          );
        })}
      </svg>
      </div>
      <figcaption className="small faint" style={{ marginTop: "0.6rem", maxWidth: "80ch" }}>
        Dashed lines: the Paris Agreement goals of 1.5°C and 2°C. Dot: central estimate of the global warming at which each system is assessed as likely to tip; bar: range. Armstrong McKay
        et al. (2022) as updated by the Global Tipping Points Report 2025 (coral reefs and Greenland ranges). The report notes that
        AMOC collapse cannot be ruled out below 2°C, and that how fast warming happens also matters. Today’s warming: WMO
        best estimates of current long-term warming, 1.34–1.41°C.
      </figcaption>
    </figure>
  );
}
