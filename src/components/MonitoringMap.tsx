"use client";

import dynamic from "next/dynamic";
import { useEffect, useMemo, useRef, useState } from "react";
import { asset } from "@/lib/site";
import type { Overlay } from "./EarthMap";
import styles from "./ReefMap.module.css";
import own from "./MonitoringMap.module.css";

const EarthMap = dynamic(() => import("./EarthMap"), { ssr: false });

interface Summary {
  harvested: string; total: number; countriesTotal: number;
  types: Record<string, { label: string; n: number }>;
  countries: [string, number][];
  arrays: { name: string; since: number }[];
}
type FC = GeoJSON.FeatureCollection<GeoJSON.Geometry, { t: string; c?: string; name?: string; since?: number }>;

const COLOURS: Record<string, string> = {
  argo: "#1f6fb8", "argo-bgc": "#17a37a", "argo-deep": "#6b4bb0", drifter: "#e08a1e", mooring: "#c0392b",
  tide: "#16191d", ship: "#9aa5b1", radar: "#c9719e", other: "#8c6d1f",
};
const ORDER = ["argo", "argo-bgc", "argo-deep", "drifter", "mooring", "tide", "ship", "radar", "other"];

export default function MonitoringMap() {
  const [data, setData] = useState<FC | null>(null);
  const [sum, setSum] = useState<Summary | null>(null);
  const [off, setOff] = useState<Set<string>>(new Set());
  const [country, setCountry] = useState<string>("all");
  const boxRef = useRef<HTMLDivElement>(null);
  const [zoom, setZoom] = useState(0.9);
  useEffect(() => {
    if (!boxRef.current) return;
    const ro = new ResizeObserver(([e]) => { const w = e.contentRect.width; if (w > 0) setZoom(Math.max(0, Math.log2(w / 512))); });
    ro.observe(boxRef.current);
    return () => ro.disconnect();
  }, [data]);
  useEffect(() => {
    fetch(asset("/data/monitoring/platforms.geojson")).then((r) => r.json()).then(setData).catch(() => {});
    fetch(asset("/data/monitoring/summary.json")).then((r) => r.json()).then(setSum).catch(() => {});
  }, []);

  const overlays: Overlay[] = useMemo(() => {
    if (!data) return [];
    const pts = data.features.filter((f) => f.properties.t !== "amoc" && !off.has(f.properties.t) && (country === "all" || f.properties.c === country))
      .map((f) => ({ ...f, properties: { ...f.properties, color: COLOURS[f.properties.t] ?? "#999", r: f.properties.t === "tide" || f.properties.t === "mooring" ? 0.75 : 0.55 } }));
    const lines = data.features.filter((f) => f.properties.t === "amoc");
    return [
      { id: "platforms", kind: "point", color: "rgba(255,255,255,0.9)", width: 0.4, data: { type: "FeatureCollection", features: pts } as GeoJSON.FeatureCollection },
      { id: "amoc-arrays", kind: "line", color: "#d6452b", width: 3.2, data: { type: "FeatureCollection", features: lines } as GeoJSON.FeatureCollection },
    ];
  }, [data, off, country]);

  if (!data || !sum) return <div className={styles.placeholder} />;
  const toggle = (t: string) => setOff((s) => { const n = new Set(s); if (n.has(t)) n.delete(t); else n.add(t); return n; });
  const countryCounts = country === "all" ? null : ORDER.map((t) => [t, data.features.filter((f) => f.properties.t === t && f.properties.c === country).length] as const);
  const max = sum.countries[0]?.[1] ?? 1;

  return (
    <div className={styles.wrap}>
      <p className={styles.headline}>
        <b>{sum.total.toLocaleString("en-GB")}</b> ocean observing platforms and tide gauges. The platforms are run by {sum.countriesTotal} countries and the EU; the United States alone
        runs more than half. Red lines mark the arrays that measure the Atlantic overturning circulation.
      </p>
      <div className={styles.layout}>
        <div className={styles.mapCol}>
          <div className={styles.mapBox} ref={boxRef}>
            <EarthMap look="data" projection="mercator" view={{ center: [10, 10], zoom }} overlays={overlays}
              className={styles.map} ariaLabel="World map of ocean observing platforms by type, with the Atlantic overturning arrays marked as red lines." />
          </div>
          <div className={own.types} role="group" aria-label="Show platform types">
            {ORDER.filter((t) => (sum.types[t]?.n ?? 0) > 0).map((t) => (
              <button key={t} aria-pressed={!off.has(t)} onClick={() => toggle(t)}>
                <i style={{ background: COLOURS[t] }} />{sum.types[t]?.label ?? t}
                <span className="tnum">{(countryCounts ? countryCounts.find((c) => c[0] === t)?.[1] : sum.types[t]?.n)?.toLocaleString("en-GB")}</span>
              </button>
            ))}
            <span className={own.amocKey}><i />Atlantic overturning arrays</span>
          </div>
        </div>
        <aside className={styles.panel}>
          <p className={styles.place}>Who runs them</p>
          <label className={own.select}>
            <span>Show one country</span>
            <select value={country} onChange={(e) => setCountry(e.target.value)}>
              <option value="all">All countries</option>
              {sum.countries.map(([c]) => <option key={c} value={c}>{c}</option>)}
            </select>
          </label>
          <ol className={own.countries}>
            {sum.countries.slice(0, 10).map(([c, n]) => (
              <li key={c}>
                <span>{c}</span>
                <span className={own.bar}><i style={{ width: `${(n / max) * 100}%` }} /></span>
                <b className="tnum">{n.toLocaleString("en-GB")}</b>
              </li>
            ))}
          </ol>
          <p className="small faint">
            Platforms by the country responsible, top ten, excluding tide gauges, which are listed by location. Select a type below the map to
            hide or show it.
          </p>
          <p className="small faint">
            <span className="evidence evidence--obs">Official records</span> Last reported positions from{" "}
            <a href="https://www.ocean-ops.org/">OceanOPS</a> (WMO-IOC), {new Date(sum.harvested + "T12:00:00Z").toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" })}.
            Operational platforms, plus recently active moorings. Tide gauges: GLOSS core stations with data in 2026, from the{" "}
            <a href="https://psmsl.org/">PSMSL</a>. Array lines are indicative.
          </p>
        </aside>
      </div>
    </div>
  );
}
