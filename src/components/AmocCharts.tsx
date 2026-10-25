"use client";

import { useEffect, useMemo, useState } from "react";
import LineChart from "./LineChart";
import { asset } from "@/lib/site";
import styles from "./AmocCharts.module.css";

interface SeriesFile {
  rapid: { start: string; end: string; mean: number; monthly: [number, number, number][]; annual: [number, number, number][]; doi: string; citation: string };
  hysteresis: { series: [number, number, number | null][]; firstYearBelow5SvSmoothed: number | null; freshwaterAtThatYear: number | null; doi: string; paperDoi: string };
  scenarioRuns: { runs: Record<string, { forcing: string; freshwater: number; series: [number, number][]; mean2400to2499: number }>; doi: string; paperDoi: string };
}

let cached: Promise<SeriesFile> | null = null;
function useSeries() {
  const [d, setD] = useState<SeriesFile | null>(null);
  useEffect(() => {
    cached ??= fetch(asset("/data/amoc/series.json")).then((r) => r.json());
    cached.then(setD).catch(() => { cached = null; });
  }, []);
  return d;
}

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const sv = (v: number) => `${v.toFixed(1)} Sv`;

/* ------------------------------------------------------- observations */

export function ObservedChart() {
  const d = useSeries();
  const [hx, setHx] = useState<number | null>(null);
  const monthly = useMemo(() => d?.rapid.monthly.map(([y, m, v]) => [y + (m - 0.5) / 12, v] as [number, number]) ?? [], [d]);
  const annual = useMemo(() => d?.rapid.annual.map(([y, v]) => [y + 0.5, v] as [number, number]) ?? [], [d]);
  if (!d) return <div className={styles.placeholder} />;
  const near = hx == null ? null : d.rapid.monthly.reduce((a, b) => Math.abs(b[0] + (b[1] - 0.5) / 12 - hx) < Math.abs(a[0] + (a[1] - 0.5) / 12 - hx) ? b : a);
  return (
    <figure className={styles.figure}>
      <figcaption className={styles.caption}>
        <span className="evidence evidence--obs">Observed</span>
        <strong>The AMOC at 26.5°N, measured by the RAPID array</strong>
        <span className="small muted">Monthly means (thin) and calendar-year means (thick), {d.rapid.start.slice(0, 4)}–{d.rapid.end.slice(0, 4)}.</span>
      </figcaption>
      <LineChart
        ariaLabel={`Line chart of AMOC strength at 26.5 degrees north from ${d.rapid.start.slice(0, 4)} to ${d.rapid.end.slice(0, 4)}, averaging ${d.rapid.mean} sverdrups.`}
        x={[2004, 2024.5]} y={[0, 30]} xTicks={[2005, 2010, 2015, 2020]} yTicks={[0, 10, 20, 30]}
        yLabel="Sv" yFormat={(v) => String(v)}
        series={[
          { id: "m", points: monthly, color: "var(--data-light)", width: 1.1 },
          { id: "a", points: annual, color: "var(--accent-hover)", width: 2.4 },
        ]}
        rules={[{ y: d.rapid.mean, label: `Average ${d.rapid.mean} Sv`, dash: "3 4", color: "var(--text-2)" }]}
        onHoverX={setHx} hoverX={hx}
        hoverText={near ? `${MONTHS[near[1] - 1]} ${near[0]}: ${sv(near[2])}` : "Hover or tap the chart to read monthly values."}
      />
      <p className={styles.source}>
        Source: Moat et al., RAPID-MOCHA-WBTS, National Oceanography Centre.{" "}
        <a href={`https://doi.org/${d.rapid.doi}`}>doi:{d.rapid.doi}</a>. One sverdrup (Sv) is a million cubic metres of water per second.
      </p>
    </figure>
  );
}

/* ---------------------------------------------------------- hysteresis */

export function HysteresisChart() {
  const d = useSeries();
  const [hx, setHx] = useState<number | null>(null);
  const raw = useMemo(() => d?.hysteresis.series.map(([f, a]) => [f, a] as [number, number]) ?? [], [d]);
  const smooth = useMemo(() => d?.hysteresis.series.map(([f, , s]) => [f, s] as [number, number | null]) ?? [], [d]);
  if (!d) return <div className={styles.placeholder} />;
  const near = hx == null ? null : d.hysteresis.series.reduce((a, b) => Math.abs(b[0] - hx) < Math.abs(a[0] - hx) ? b : a);
  return (
    <figure className={styles.figure}>
      <figcaption className={styles.caption}>
        <span className="evidence evidence--model">Model experiment</span>
        <strong>Slowly adding fresh water until the circulation tips</strong>
        <span className="small muted">
          CESM model, pre-industrial climate. Fresh water added to the North Atlantic rises by 0.0003 Sv each model year,
          over 2,200 years. Thin line: yearly values; thick: 25-year average.
        </span>
      </figcaption>
      <LineChart
        ariaLabel="Line chart of AMOC strength against freshwater forcing in the CESM quasi-equilibrium hosing experiment. The circulation weakens slowly, then drops abruptly to near zero at about 0.54 sverdrups of forcing."
        x={[0, 0.66]} y={[-3, 21]} xTicks={[0, 0.1, 0.2, 0.3, 0.4, 0.5, 0.6]} yTicks={[0, 5, 10, 15, 20]}
        xFormat={(v) => v.toFixed(1)} yLabel="AMOC, Sv" xLabel="Freshwater forcing, Sv"
        series={[
          { id: "raw", points: raw, color: "var(--data-light)", width: 1 },
          { id: "smooth", points: smooth, color: "var(--accent-hover)", width: 2.4 },
        ]}
        rules={[
          { x: 0.18, label: "0.18", dash: "2 4", color: "var(--text-2)" },
          { x: 0.45, label: "0.45", dash: "2 4", color: "var(--text-2)" },
          ...(d.hysteresis.freshwaterAtThatYear ? [{ x: d.hysteresis.freshwaterAtThatYear, label: "Collapse", dash: "4 3", color: "var(--alert)" }] : []),
        ]}
        onHoverX={setHx} hoverX={hx}
        hoverText={near ? `Forcing ${near[0].toFixed(3)} Sv (model year ${Math.round(near[0] / 3e-4)}): AMOC ${sv(near[1])}` : "Dotted lines mark the forcing levels at which the scenario runs below begin."}
      />
      <p className={styles.source}>
        Source: van Westen &amp; Baatsen (2026), <a href={`https://doi.org/${d.hysteresis.doi}`}>doi:{d.hysteresis.doi}</a>;
        experiment described in van Westen, Kliphuis &amp; Dijkstra (2024), <a href={`https://doi.org/${d.hysteresis.paperDoi}`}>Science Advances</a>.
        Overturning at 26°N, about 1,000 m depth.
      </p>
    </figure>
  );
}

/* ------------------------------------------------------- scenario runs */

const RUN_STYLE: Record<string, { color: string; label: string; dash?: string; dy?: number }> = {
  CESM_0600_RCP45: { color: "#176d8a", label: "Low freshwater, RCP4.5", dy: -2 },
  CESM_0600_RCP85: { color: "#b2553c", label: "Low freshwater, RCP8.5", dy: -12 },
  CESM_1500_RCP45: { color: "#176d8a", label: "High freshwater, RCP4.5", dash: "5 3", dy: 2 },
  CESM_1500_RCP85: { color: "#b2553c", label: "High freshwater, RCP8.5", dash: "5 3", dy: 16 },
};

function smooth(series: [number, number][], k = 11): [number, number | null][] {
  return series.map((p, i) => {
    if (i < k >> 1 || i >= series.length - (k >> 1)) return [p[0], null];
    let s = 0;
    for (let j = i - (k >> 1); j <= i + (k >> 1); j++) s += series[j][1];
    return [p[0], s / k];
  });
}

export function ScenarioRunsChart() {
  const d = useSeries();
  const [hx, setHx] = useState<number | null>(null);
  const lines = useMemo(() => d ? Object.entries(d.scenarioRuns.runs).map(([id, r]) => ({
    id, points: smooth(r.series), color: RUN_STYLE[id].color, dash: RUN_STYLE[id].dash, width: 2,
    label: RUN_STYLE[id].label, labelDy: RUN_STYLE[id].dy,
  })) : [], [d]);
  if (!d) return <div className={styles.placeholder} />;
  const year = hx == null ? null : Math.round(hx);
  const text = year == null ? "Lines are 11-year averages. The shaded period, 2400–2499, is the one shown in the maps."
    : `${year}: ` + Object.entries(d.scenarioRuns.runs).map(([id, r]) => {
      const p = r.series.find((s) => s[0] === year);
      return p ? `${RUN_STYLE[id].label} ${sv(p[1])}` : null;
    }).filter(Boolean).join(" · ");
  return (
    <figure className={styles.figure}>
      <figcaption className={styles.caption}>
        <span className="evidence evidence--model">Model experiment</span>
        <strong>The scenario runs: warming tips the circulation in three of four</strong>
        <span className="small muted">
          Greenhouse gases follow RCP4.5 or RCP8.5 to 2100 and are then held at 2100 levels. Runs start from the experiment above
          at low (0.18 Sv) or high (0.45 Sv) background freshwater forcing.
        </span>
      </figcaption>
      <LineChart
        ariaLabel="Line chart of AMOC strength from 1850 to 2499 in four CESM scenario runs. The run with low freshwater forcing and RCP4.5 stays near 15 sverdrups; the other three collapse to between 1 and 3 sverdrups."
        x={[1850, 2500]} y={[0, 20]} xTicks={[1900, 2000, 2100, 2200, 2300, 2400]} yTicks={[0, 5, 10, 15, 20]}
        yLabel="AMOC, Sv"
        bands={[{ x0: 2100, x1: 2400, label: "Forcing held at 2100 levels", fill: "rgba(21,54,71,0.035)" }, { x0: 2400, x1: 2500, label: "Maps", fill: "rgba(131,199,195,0.22)" }]}
        series={lines}
        onHoverX={setHx} hoverX={hx} hoverText={text}
      />
      <p className={styles.source}>
        Source: van Westen &amp; Baatsen (2025), <a href={`https://doi.org/${d.scenarioRuns.paperDoi}`}>Geophysical Research Letters</a>;
        data <a href={`https://doi.org/${d.scenarioRuns.doi}`}>doi:{d.scenarioRuns.doi}</a>. Overturning at 26°N, 0–1,000 m.
        The freshwater forcing is a modelling device that places the AMOC closer to or further from its tipping point; it is not a forecast of meltwater.
      </p>
    </figure>
  );
}
