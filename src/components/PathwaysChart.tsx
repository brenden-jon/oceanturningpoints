/**
 * Where warming is heading, against where the ocean and ice tipping thresholds lie.
 * Pathways: UNEP Emissions Gap Report 2026 (warming by 2100 with a 66% chance; range from
 * emissions-projection uncertainty) and Forster et al. (2026) for today's human-induced warming.
 * Thresholds: Armstrong McKay et al. (2022) as updated by the Global Tipping Points Report 2025.
 */
import { OCEAN_THRESHOLDS } from "./ThresholdChart";

const PATHS = [
  { label: "Current policies", sub: "by 2100, still rising", v: 2.8, lo: 2.2, hi: 3.8 },
  { label: "All pledges delivered", sub: "national climate plans, by 2100", v: 2.6, lo: 1.9, hi: 3.3 },
  { label: "Pledges plus net-zero targets", sub: "most optimistic case, by 2100", v: 2.1, lo: 1.8, hi: 2.4 },
  { label: "Fastest feasible cuts", sub: "peak about 2050, 1.4°C by 2100", v: 1.8, lo: 1.7, hi: 1.8, back: 1.4 },
];
const X0 = 0.8, X1 = 4.4;

export default function PathwaysChart() {
  const W = 780, rowH = 44, left = 230, right = 30, top = 40;
  const gap = 46, nP = PATHS.length, nT = OCEAN_THRESHOLDS.length;
  const H = top + nP * rowH + gap + nT * rowH + 40;
  const sx = (v: number) => left + ((Math.min(v, X1) - X0) / (X1 - X0)) * (W - left - right);
  const ticks = [1, 1.5, 2, 2.5, 3, 3.5, 4];
  const yT = top + nP * rowH + gap;
  return (
    <figure style={{ margin: 0 }}>
      <div style={{ overflowX: "auto" }}>
        <svg viewBox={`0 0 ${W} ${H}`} width="100%" role="img" style={{ fontFamily: "var(--font)", minWidth: 620, overflow: "visible" }}
          aria-label="Warming by 2100 under current policies (2.8 degrees), pledges (2.6), pledges plus net-zero targets (2.1) and the fastest feasible cuts (peak 1.8, back to 1.4), compared with tipping thresholds for coral reefs (1.2), Greenland and West Antarctica (1.5), the subpolar gyre (1.8) and the Atlantic circulation (4, range 1.4 to 8).">
          {ticks.map((t) => (
            <g key={t}>
              <line x1={sx(t)} x2={sx(t)} y1={top - 12} y2={H - 30} stroke={t === 1.5 || t === 2 ? "#cfd4d9" : "#eceef0"} strokeDasharray={t === 1.5 || t === 2 ? "3 3" : undefined} />
              <text x={sx(t)} y={H - 12} textAnchor="middle" fontSize="12" fill="#4b5560" fontWeight={t === 1.5 || t === 2 ? 600 : 400}>{t}°C</text>
            </g>
          ))}
          <rect x={sx(1.34)} y={top - 16} width={sx(1.41) - sx(1.34)} height={H - 30 - top + 16} fill="#16191d" opacity="0.12" />
          <text x={sx(1.41) + 4} y={top - 20} fontSize="12" fontWeight="600" fill="#16191d">Today, about 1.4°C</text>

          <text x={0} y={top - 20} fontSize="12" fontWeight="700" fill="#b24a2a" letterSpacing="0.04em">WHERE WARMING IS HEADING</text>
          {PATHS.map((p, i) => {
            const y = top + i * rowH + rowH / 2;
            return (
              <g key={p.label}>
                <text x={left - 14} y={y - 3} textAnchor="end" fontSize="13.5" fontWeight="600" fill="#16191d">{p.label}</text>
                <text x={left - 14} y={y + 13} textAnchor="end" fontSize="11.5" fill="#7d8792">{p.sub}</text>
                <line x1={sx(p.lo)} x2={sx(p.hi)} y1={y} y2={y} stroke="#b24a2a" strokeWidth="6" strokeLinecap="round" opacity="0.25" />
                {p.back && <>
                  <line x1={sx(p.v) - 8} x2={sx(p.back) + 7} y1={y} y2={y} stroke="#b24a2a" strokeWidth="1.5" strokeDasharray="3 3" />
                  <path d={`M ${sx(p.back) + 7} ${y - 4} L ${sx(p.back)} ${y} L ${sx(p.back) + 7} ${y + 4}`} fill="none" stroke="#b24a2a" strokeWidth="1.5" />
                </>}
                <circle cx={sx(p.v)} cy={y} r="6.5" fill="#b24a2a" stroke="#fff" strokeWidth="2" />
                <text x={sx(p.hi) + 10} y={y + 4} fontSize="12" fontWeight="600" fill="#b24a2a">{p.v.toFixed(1)}°C</text>
              </g>
            );
          })}

          <text x={0} y={yT - 14} fontSize="12" fontWeight="700" fill="#0a62b8" letterSpacing="0.04em">WHERE TIPPING THRESHOLDS LIE</text>
          {OCEAN_THRESHOLDS.map((d, i) => {
            const y = yT + i * rowH + rowH / 2;
            return (
              <g key={d.id}>
                <text x={left - 14} y={y + 4} textAnchor="end" fontSize="13.5" fontWeight="600" fill="#16191d">{d.label}</text>
                <line x1={sx(d.low)} x2={sx(d.high)} y1={y} y2={y} stroke="#0a62b8" strokeWidth="6" strokeLinecap="round" opacity="0.28" />
                {d.high > X1 && <text x={sx(X1) + 6} y={y + 4} fontSize="11" fill="#0a62b8">to {d.high}°C</text>}
                <circle cx={sx(d.central)} cy={y} r="6.5" fill="#0a62b8" stroke="#fff" strokeWidth="2" />
              </g>
            );
          })}
        </svg>
      </div>
      <figcaption className="small faint" style={{ marginTop: "0.6rem", maxWidth: "85ch" }}>
        Red: warming that each path would likely not exceed (66% chance), with the range from uncertainty in future emissions; UNEP
        Emissions Gap Report 2026. The fastest feasible path overshoots 1.5°C, peaking at about 1.8°C, and needs large-scale carbon
        removal to come back down. Blue: central estimate and range of the warming at which each system is assessed as likely to tip;
        Armstrong McKay et al. (2022) as updated by the Global Tipping Points Report 2025. Today: Forster et al. (2026).
      </figcaption>
    </figure>
  );
}
