/**
 * Decision horizons against the length of the observing records behind them.
 * Redrawn from Jongman (forthcoming), Figure 1, with the author's permission.
 * Record start years: satellite SST 1981; satellite altimetry 1992/93; TAO array 1994 (reduced
 * data return 2012–2014); Argo full coverage 2005 (partial from 2000); RAPID 2004; BGC-Argo 2014;
 * OSNAP 2014.
 */
type Obs = "sat" | "mixed" | "insitu";
const DOMAIN = { adapt: ["Adaptation", "#1f6fb8"], mitig: ["Mitigation", "#17a37a"], risk: ["Disaster risk", "#d9661f"], protect: ["Marine protection", "#c9719e"] } as const;

const DECISIONS: { label: string; from: number; to: number; d: keyof typeof DOMAIN; obs: Obs }[] = [
  { label: "Detecting untracked industrial fishing", from: 1, to: 30, d: "protect", obs: "sat" },
  { label: "Coral bleaching alerts for reef managers", from: 1, to: 90, d: "protect", obs: "sat" },
  { label: "Marine heatwave preparedness", from: 30, to: 365, d: "risk", obs: "mixed" },
  { label: "El Niño preparedness", from: 90, to: 270, d: "risk", obs: "mixed" },
  { label: "Fishery quotas under warming", from: 365, to: 400, d: "protect", obs: "insitu" },
  { label: "Earth’s energy imbalance and carbon budget", from: 365 * 25, to: 365 * 75, d: "mitig", obs: "insitu" },
  { label: "Ocean carbon sink in mitigation accounting", from: 365 * 25, to: 365 * 75, d: "mitig", obs: "insitu" },
  { label: "Planning for AMOC weakening", from: 365 * 25, to: 365 * 100, d: "adapt", obs: "insitu" },
  { label: "Coastal adaptation pathways", from: 365 * 50, to: 365 * 100, d: "adapt", obs: "mixed" },
];

const RECORDS: { label: string; system: string; start: number; sat?: boolean; partial?: [number, number]; gap?: [number, number]; ends?: boolean }[] = [
  { label: "Sea surface temperature", system: "Satellite radiometers", start: 1981, sat: true },
  { label: "Sea level", system: "Satellite altimeters", start: 1992, sat: true },
  { label: "Tropical Pacific upper ocean", system: "TAO moored array", start: 1994, gap: [2012, 2014] },
  { label: "Temperature and salinity, 0–2,000 m", system: "Argo floats", start: 2005, partial: [2000, 2005] },
  { label: "AMOC at 26.5°N", system: "RAPID array", start: 2004 },
  { label: "Carbon, oxygen and nutrients", system: "Biogeochemical Argo", start: 2014, ends: true },
  { label: "AMOC in the subpolar North Atlantic", system: "OSNAP array", start: 2014 },
];

const NAVY = "#1f3a5f", GREY = "#9aa3ab";

function Marker({ x, y, obs }: { x: number; y: number; obs: Obs }) {
  if (obs === "sat") return <circle cx={x} cy={y} r={6} fill="#fff" stroke={NAVY} strokeWidth={1.8} />;
  if (obs === "insitu") return <circle cx={x} cy={y} r={6} fill={NAVY} />;
  return (
    <g>
      <circle cx={x} cy={y} r={6} fill="#fff" stroke={NAVY} strokeWidth={1.8} />
      <path d={`M ${x} ${y - 6} A 6 6 0 0 0 ${x} ${y + 6} Z`} fill={NAVY} />
    </g>
  );
}

export default function ObservingRecords() {
  const W = 780, left = 270, right = 40, rowH = 30;
  // panel a: log time axis from 1 day to 100 years
  const ax = (days: number) => left + (Math.log10(days) / Math.log10(36500)) * (W - left - right);
  const aH = 30 + DECISIONS.length * rowH + 40;
  const ticksA: [number, string][] = [[1, "1 day"], [7, "1 week"], [30, "1 month"], [365, "1 year"], [3650, "10 years"], [36500, "100 years"]];
  // panel b: years 1980–2026
  const bx = (y: number) => left + ((y - 1980) / (2026.8 - 1980)) * (W - left - right - 30);
  const bH = 20 + RECORDS.length * rowH + 40;
  const now = 2026.8;
  return (
    <figure style={{ margin: 0 }}>
      <div style={{ overflowX: "auto" }}>
        <svg viewBox={`0 0 ${W} ${aH}`} width="100%" style={{ fontFamily: "var(--font)", minWidth: 620 }} role="img"
          aria-label="Decision horizons: satellite-based decisions such as bleaching alerts work from days to months; decisions on the carbon budget, the ocean carbon sink, AMOC weakening and coastal adaptation span 25 to 100 years and rely mainly on in situ observations.">
          <text x={0} y={14} fontSize="12.5" fontWeight="700" fill="#16191d">How far ahead the decision looks</text>
          {ticksA.map(([d, l]) => (
            <g key={l}>
              <line x1={ax(d)} x2={ax(d)} y1={24} y2={aH - 32} stroke="#eceef0" />
              <text x={ax(d)} y={aH - 14} fontSize="11.5" textAnchor="middle" fill="#4b5560">{l}</text>
            </g>
          ))}
          {DECISIONS.map((r, i) => {
            const y = 30 + i * rowH + rowH / 2;
            return (
              <g key={r.label}>
                <text x={left - 12} y={y + 4} textAnchor="end" fontSize="12.5" fill="#16191d">{r.label}</text>
                <rect x={ax(r.from)} y={y - 7} width={Math.max(4, ax(r.to) - ax(r.from))} height={14} rx={2} fill={DOMAIN[r.d][1]} opacity={0.85} />
                <Marker x={ax(r.to) + 4} y={y} obs={r.obs} />
              </g>
            );
          })}
        </svg>
      </div>
      <ul style={{ listStyle: "none", padding: 0, margin: "0.4rem 0 1.6rem", display: "flex", flexWrap: "wrap", gap: "0.3rem 1.1rem", fontSize: "0.8rem", color: "var(--text-2)" }}>
        {Object.values(DOMAIN).map(([l, c]) => <li key={l}><i style={{ display: "inline-block", width: 12, height: 10, background: c, borderRadius: 2, marginRight: 6 }} />{l}</li>)}
        <li>○ mainly satellite</li><li>◐ mixed</li><li>● mainly in situ</li>
      </ul>
      <div style={{ overflowX: "auto" }}>
        <svg viewBox={`0 0 ${W} ${bH}`} width="100%" style={{ fontFamily: "var(--font)", minWidth: 620 }} role="img"
          aria-label="Length of continuous records: satellite sea surface temperature 45 years, satellite sea level 34 years, tropical Pacific moored array 32 years, Argo 21 years, RAPID AMOC array 22 years, biogeochemical Argo 12 years with US funding ending in October 2026, OSNAP 12 years.">
          <text x={0} y={12} fontSize="12.5" fontWeight="700" fill="#16191d">How long the record is</text>
          {[1980, 1990, 2000, 2010, 2020].map((y) => (
            <g key={y}>
              <line x1={bx(y)} x2={bx(y)} y1={20} y2={bH - 32} stroke="#eceef0" />
              <text x={bx(y)} y={bH - 14} fontSize="11.5" textAnchor="middle" fill="#4b5560">{y}</text>
            </g>
          ))}
          <line x1={bx(now)} x2={bx(now)} y1={20} y2={bH - 32} stroke="#4b5560" strokeDasharray="3 3" />
          {RECORDS.map((r, i) => {
            const y = 20 + i * rowH + rowH / 2;
            return (
              <g key={r.label}>
                <text x={left - 12} y={y - 1} textAnchor="end" fontSize="12.5" fill="#16191d">{r.label}</text>
                <text x={left - 12} y={y + 12} textAnchor="end" fontSize="10.5" fill="#7d8792">{r.system}</text>
                {r.partial && <rect x={bx(r.partial[0])} y={y - 7} width={bx(r.partial[1]) - bx(r.partial[0])} height={14} fill="#b8c3cf" />}
                <rect x={bx(r.start)} y={y - 7} width={bx(now) - bx(r.start)} height={14} fill={r.sat ? GREY : NAVY} />
                {r.gap && <rect x={bx(r.gap[0])} y={y - 7} width={bx(r.gap[1]) - bx(r.gap[0])} height={14} fill="#c9d3dd" />}
                <text x={bx(now) + 8} y={y + 4} fontSize="11.5" fill="#16191d">{r.ends ? "✕ " : ""}{2026 - (r.partial ? r.partial[1] : r.start)} yr</text>
              </g>
            );
          })}
        </svg>
      </div>
      <ul style={{ listStyle: "none", padding: 0, margin: "0.4rem 0 0", display: "flex", flexWrap: "wrap", gap: "0.3rem 1.1rem", fontSize: "0.8rem", color: "var(--text-2)" }}>
        <li><i style={{ display: "inline-block", width: 12, height: 10, background: GREY, marginRight: 6 }} />Satellite record</li>
        <li><i style={{ display: "inline-block", width: 12, height: 10, background: NAVY, marginRight: 6 }} />Direct (in situ) record</li>
        <li><i style={{ display: "inline-block", width: 12, height: 10, background: "#b8c3cf", marginRight: 6 }} />Partial coverage</li>
        <li><i style={{ display: "inline-block", width: 12, height: 10, background: "#c9d3dd", marginRight: 6 }} />Reduced data return</li>
        <li>✕ US funding ends October 2026</li>
      </ul>
      <figcaption className="small faint" style={{ marginTop: "0.8rem" }}>
        Short-horizon decisions draw largely on satellite records several decades long. Long-term decisions on the AMOC, Earth’s
        energy imbalance and the ocean carbon sink rely on direct records of only about 12–22 years. Indicative. Redrawn from
        Jongman (forthcoming).
      </figcaption>
    </figure>
  );
}
