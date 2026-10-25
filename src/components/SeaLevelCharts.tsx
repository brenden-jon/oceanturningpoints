"use client";

import { useState } from "react";
import LineChart from "./LineChart";
import styles from "./AmocCharts.module.css";

export interface SeaLevelData {
  global: Record<string, [number, number, number, number][]>;
  observed: { series: [number, number][]; end: number; url: string };
  iceSheets: { series: { greenland: [number, number][]; antarctica: [number, number][] } };
}

export function IceSheetChart({ d }: { d: SeaLevelData }) {
  const [hx, setHx] = useState<number | null>(null);
  const g = d.iceSheets.series.greenland, a = d.iceSheets.series.antarctica;
  const near = (s: [number, number][]) => (hx == null ? null : s.reduce((p, c) => (Math.abs(c[0] - hx) < Math.abs(p[0] - hx) ? c : p)));
  const ng = near(g), na = near(a);
  return (
    <figure className={styles.figure}>
      <figcaption className={styles.caption}>
        <span className="evidence evidence--obs">Observed</span>
        <strong>Ice lost from Greenland and Antarctica, as global sea-level rise</strong>
        <span className="small muted">Cumulative since January 1992, in millimetres. Satellite measurements combined by the IMBIE team.</span>
      </figcaption>
      <LineChart ariaLabel="Cumulative sea-level contribution from the Greenland and Antarctic ice sheets since 1992." x={[1992, 2024.5]} y={[0, 20]}
        xTicks={[1995, 2005, 2015, 2023]} yTicks={[0, 5, 10, 15, 20]} yLabel="mm"
        series={[{ id: "g", points: g, color: "#0a62b8", width: 2.2, label: "Greenland" }, { id: "a", points: a, color: "#7d8792", width: 2.2, label: "Antarctica", labelDy: 8 }]}
        onHoverX={setHx} hoverX={hx}
        hoverText={ng && na ? `${Math.floor(ng[0])}: Greenland ${ng[1].toFixed(1)} mm, Antarctica ${na[1].toFixed(1)} mm` : `Together ${(g[g.length - 1][1] + a[a.length - 1][1]).toFixed(0)} mm by the end of 2023.`} />
      <p className={styles.source}>Source: Otosaka et al. (2026), <i>Scientific Data</i>, <a href="https://doi.org/10.1038/s41597-026-08088-0">doi:10.1038/s41597-026-08088-0</a>; data UK Polar Data Centre, Open Government Licence v3.0. Rebased to January 1992.</p>
    </figure>
  );
}

export function ObservedSeaLevelChart({ d }: { d: SeaLevelData }) {
  const [hx, setHx] = useState<number | null>(null);
  const s = d.observed.series;
  const n = hx == null ? null : s.reduce((p, c) => (Math.abs(c[0] - hx) < Math.abs(p[0] - hx) ? c : p));
  return (
    <figure className={styles.figure}>
      <figcaption className={styles.caption}>
        <span className="evidence evidence--obs">Observed</span>
        <strong>Global mean sea level from satellites</strong>
        <span className="small muted">Millimetres, from 1993 to early {Math.floor(d.observed.end)}. Seasonal cycle removed.</span>
      </figcaption>
      <LineChart ariaLabel="Global mean sea level from satellite altimetry since 1993." x={[1993, Math.ceil(d.observed.end)]} y={[-20, 100]}
        xTicks={[1995, 2005, 2015, 2025]} yTicks={[-20, 0, 20, 40, 60, 80, 100]} yLabel="mm"
        series={[{ id: "o", points: s, color: "#0a62b8", width: 1.6 }]} onHoverX={setHx} hoverX={hx}
        hoverText={n ? `${n[0].toFixed(1)}: ${n[1].toFixed(0)} mm` : "Rising at about 3 mm a year on average over the record, and faster in recent years."} />
      <p className={styles.source}>Source: <a href={d.observed.url}>NOAA Laboratory for Satellite Altimetry</a>, public domain. This series currently ends in {Math.floor(d.observed.end)}.</p>
    </figure>
  );
}

const G = [
  { id: "ssp126-medium", label: "Very low emissions", color: "#1f7a5a" },
  { id: "ssp245-medium", label: "Intermediate", color: "#0a62b8" },
  { id: "ssp585-medium", label: "Very high", color: "#b24a2a" },
];

export function GlobalProjectionChart({ d }: { d: SeaLevelData }) {
  const [hx, setHx] = useState<number | null>(null);
  const low = d.global["ssp585-low"];
  const near = hx == null ? null : Math.round(hx / 10) * 10;
  const at = (id: string) => d.global[id].find((p) => p[0] === near);
  return (
    <figure className={styles.figure}>
      <figcaption className={styles.caption}>
        <span className="evidence evidence--model">Projection</span>
        <strong>Global sea-level rise to 2150, by emissions scenario</strong>
        <span className="small muted">Metres relative to 1995–2014. Lines: medians; shading: likely range. Dotted: upper likely bound of the low-likelihood, high-impact storyline with rapid ice-sheet loss.</span>
      </figcaption>
      <LineChart ariaLabel="IPCC global mean sea-level projections to 2150 under three scenarios." x={[2020, 2150]} y={[0, 3]}
        xTicks={[2050, 2100, 2150]} yTicks={[0, 0.5, 1, 1.5, 2, 2.5, 3]} yLabel="metres" yFormat={(v) => v.toFixed(1)}
        series={[
          ...G.map((s) => ({ id: s.id, color: s.color, width: 2, label: s.label, points: d.global[s.id].map((p) => [p[0], p[2]] as [number, number]),
            band: d.global[s.id].map((p) => [p[0], p[1], p[3]] as [number, number, number]) })),
          { id: "llhi", color: "#b24a2a", width: 1.4, dash: "2 3", label: "High-impact storyline", labelDy: -8, points: low.filter((p) => p[0] <= 2150).map((p) => [p[0], p[3]] as [number, number]) },
        ]}
        onHoverX={setHx} hoverX={hx}
        hoverText={near && at("ssp245-medium") ? `${near}: ${G.map((s) => `${s.label} ${at(s.id)?.[2].toFixed(2)} m`).join(" · ")}` : "Under every scenario, sea level keeps rising after 2100."} />
      <p className={styles.source}>Source: IPCC AR6 (Fox-Kemper et al., 2021); projections Garner et al. (2021), <a href="https://doi.org/10.5281/zenodo.6382554">doi:10.5281/zenodo.6382554</a>, CC BY 4.0.</p>
    </figure>
  );
}
