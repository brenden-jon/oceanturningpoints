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

/** Views that answer "enough for what?": which platforms measure what the big changes need. */
const VIEWS: { id: string; label: string; types: string[]; text: string }[] = [
  { id: "all", label: "Everything", types: ORDER, text: "More than a third of the points are drifting buoys and ships, which measure only the surface. Choose a view to see what each network reaches." },
  { id: "surface", label: "Surface only", types: ["drifter", "ship"], text: "Drifting buoys and ships measure the sea surface and the air above it: vital for weather forecasts, blind below the surface. Both networks are shrinking (GOOS, 2025)." },
  { id: "upper", label: "Upper 2,000 m", types: ["argo", "argo-bgc", "argo-deep"], text: "Argo floats profile the top 2,000 m every 10 days, about 300 km apart: the backbone of ocean heat monitoring. They cannot work in shallow coastal water and few operate under sea ice." },
  { id: "deep", label: "Below 2,000 m", types: ["argo-deep"], text: "Half the ocean’s volume lies below 2,000 m. About a sixth of the 1,200 deep floats planned are in the water (Argo Steering Team, 2024)." },
  { id: "bgc", label: "Carbon and oxygen", types: ["argo-bgc"], text: "Floats with at least one chemical or biological sensor, often oxygen only. In 2022 about 170 carried the full set of six, against a target of 1,000 (Owens et al., 2022)." },
  { id: "coast", label: "Sea level at the coast", types: ["tide"], text: "Core tide gauges with data in 2026, the long records of sea level at the coast. GOOS rates the tide-gauge network at 30–50% of its target, and coastal radars cover about 2% of the world’s coastline." },
];

export default function MonitoringMap() {
  const [data, setData] = useState<FC | null>(null);
  const [sum, setSum] = useState<Summary | null>(null);
  const [off, setOff] = useState<Set<string>>(new Set());
  const [view, setView] = useState("all");
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
  const pick = (id: string) => { const v = VIEWS.find((x) => x.id === id)!; setView(id); setOff(new Set(ORDER.filter((t) => !v.types.includes(t)))); };
  const current = VIEWS.find((x) => x.id === view);
  const shown = data.features.filter((f) => f.properties.t !== "amoc" && !off.has(f.properties.t) && (country === "all" || f.properties.c === country)).length;
  const toggle = (t: string) => { setView("custom"); setOff((s) => { const n = new Set(s); if (n.has(t)) n.delete(t); else n.add(t); return n; }); };
  const countryCounts = country === "all" ? null : ORDER.map((t) => [t, data.features.filter((f) => f.properties.t === t && f.properties.c === country).length] as const);
  const max = sum.countries[0]?.[1] ?? 1;

  return (
    <div className={styles.wrap}>
      <p className={styles.headline}>
        <b>{sum.total.toLocaleString("en-GB")}</b> platforms reporting, from {sum.countriesTotal} countries and the EU. Only{" "}
        <b>{sum.types["argo-deep"]?.n.toLocaleString("en-GB")}</b> reach below 2,000 m. Red lines mark the arrays that measure the Atlantic circulation.
      </p>
      <div className={own.views} role="group" aria-label="What the platforms measure">
        {VIEWS.map((v) => <button key={v.id} aria-pressed={view === v.id} onClick={() => pick(v.id)}>{v.label}</button>)}
      </div>
      <p className={own.viewText}>
        <b className="tnum">{shown.toLocaleString("en-GB")}</b> platforms shown.{current?.text ? ` ${current.text}` : ""}
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
