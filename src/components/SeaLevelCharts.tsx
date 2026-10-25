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
  { id: "ssp126", label: "Very low emissions", color: "#1f7a5a" },
  { id: "ssp585", label: "Very high emissions", color: "#b24a2a" },
];

/** Global projections to 2300: the likely range (medium confidence, to 2150) against the
 * low-confidence projections that add rapid ice-sheet loss (to 2300). */
export function GlobalProjectionChart({ d }: { d: SeaLevelData }) {
  const [hx, setHx] = useState<number | null>(null);
  const near = hx == null ? null : Math.round(hx / 10) * 10;
  const at = (id: string) => d.global[id].find((p) => p[0] === near);
  return (
    <figure className={styles.figure}>
      <figcaption className={styles.caption}>
        <span className="evidence evidence--model">Projection</span>
        <strong>Global sea-level rise to 2300, with and without rapid ice-sheet loss</strong>
        <span className="small muted">Metres relative to 1995–2014. Solid lines and shading: projections that include rapid ice-sheet loss (median, 17–83% range). Dotted: the IPCC likely range without it, to 2150.</span>
      </figcaption>
      <LineChart ariaLabel="IPCC global mean sea-level projections to 2300 under very low and very high emissions, with and without rapid ice-sheet loss." x={[2020, 2300]} y={[0, 16]}
        xTicks={[2050, 2100, 2150, 2200, 2250, 2300]} yTicks={[0, 4, 8, 12, 16]} yLabel="metres" yFormat={(v) => v.toFixed(0)}
        series={[
          ...G.map((s) => ({ id: `${s.id}-low`, color: s.color, width: 2, label: s.label, points: d.global[`${s.id}-low`].map((p) => [p[0], p[2]] as [number, number]),
            band: d.global[`${s.id}-low`].map((p) => [p[0], p[1], p[3]] as [number, number, number]) })),
          ...G.map((s) => ({ id: `${s.id}-medium`, color: s.color, width: 1.3, dash: "2 3", points: d.global[`${s.id}-medium`].map((p) => [p[0], p[3]] as [number, number]) })),
        ]}
        onHoverX={setHx} hoverX={hx}
        hoverText={near && at("ssp585-low") ? `${near}: ${G.map((s) => `${s.label} ${at(`${s.id}-low`)?.[2].toFixed(1)} m (to ${at(`${s.id}-low`)?.[3].toFixed(1)} m)`).join(" · ")}` : "The gap between the two scenarios widens for centuries."} />
      <p className={styles.source}>Source: IPCC AR6 (Fox-Kemper et al., 2021), low- and medium-confidence projections; Garner et al. (2021), <a href="https://doi.org/10.5281/zenodo.6382554">doi:10.5281/zenodo.6382554</a>, CC BY 4.0. The IPCC could not assess the likelihood of the rapid ice-loss processes.</p>
    </figure>
  );
}
