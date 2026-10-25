"use client";

import dynamic from "next/dynamic";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { HoverInfo, Overlay } from "./EarthMap";
import LineChart from "./LineChart";
import { asset } from "@/lib/site";
import styles from "./ReefMap.module.css";

const EarthMap = dynamic(() => import("./EarthMap"), { ssr: false });

interface Station {
  id: string; name: string; lat: number; lon: number;
  latest: { date: string; dhw: number; alert: number };
  peak: Record<string, number>; peak2023to2025: number;
  yearsAbove4: Record<string, number>; yearsAbove8: Record<string, number>;
}
interface StationsFile { updated: string; count: number; stations: Station[] }
type Metric = "peak" | "now" | "change";

const WDPA = {
  id: "wdpa",
  tiles: ["https://data-gis.unep-wcmc.org/server/rest/services/ProtectedSites/The_World_Database_of_Protected_Areas/MapServer/export?bbox={bbox-epsg-3857}&bboxSR=3857&imageSR=3857&size=256,256&format=png32&transparent=true&f=image&layers=show:1&layerDefs=%7B%221%22%3A%22realm%20%3C%3E%20%27Terrestrial%27%22%7D"],
  attribution: 'Protected areas: <a href="https://www.protectedplanet.net/">UNEP-WCMC &amp; IUCN, WDPA</a>',
  opacity: 0.55,
};

// Bins follow NOAA Coral Reef Watch alert levels (Degree Heating Weeks, °C-weeks).
const DHW_BINS = [
  { max: 4, color: "#f2e6cf", label: "Below 4: no reef-wide bleaching expected" },
  { max: 8, color: "#f4a259", label: "4–8: reef-wide bleaching likely" },
  { max: 12, color: "#e0542b", label: "8–12: bleaching with coral deaths likely" },
  { max: 16, color: "#b0202a", label: "12–16: deaths of many species likely" },
  { max: Infinity, color: "#5e0a1c", label: "16 and above: severe, widespread mortality likely" },
];
const CHANGE_BINS = [
  { max: 2, color: "#e8edf1", label: "Up to 1 more year" },
  { max: 5, color: "#f4c27a", label: "2–4 more years" },
  { max: 8, color: "#e57a3c", label: "5–7 more years" },
  { max: Infinity, color: "#b0202a", label: "8 or more years" },
];
const binColor = (bins: { max: number; color: string }[], v: number) => (bins.find((b) => v < b.max) ?? bins[bins.length - 1]).color;
const fmtDate = (iso: string) => new Date(iso + "T12:00:00Z").toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric", timeZone: "UTC" });

export default function ReefMap() {
  const [data, setData] = useState<StationsFile | null>(null);
  const [metric, setMetric] = useState<Metric>("peak");
  const [selected, setSelected] = useState<Station | null>(null);
  const [series, setSeries] = useState<{ id: string; pts: [number, number][] } | null>(null);
  const [hx, setHx] = useState<number | null>(null);
  const [mpa, setMpa] = useState(false);
  // Fit the whole world's width into the map box (Web Mercator world = 512 px at zoom 0).
  const boxRef = useRef<HTMLDivElement>(null);
  const [zoom, setZoom] = useState(0.9);
  useEffect(() => {
    if (!boxRef.current) return;
    const ro = new ResizeObserver(([e]) => { const w = e.contentRect.width; if (w > 0) setZoom(Math.max(0, Math.log2(w / 512))); });
    ro.observe(boxRef.current);
    return () => ro.disconnect();
  }, [data]);

  useEffect(() => { fetch(asset("/data/reefs/stations.json")).then((r) => r.json()).then(setData).catch(() => {}); }, []);
  useEffect(() => {
    if (!data || selected) return;
    setSelected(data.stations.find((s) => s.id === "gbr_northern") ?? data.stations[0]);
  }, [data, selected]);
  useEffect(() => {
    if (!selected) return;
    let off = false;
    fetch(asset(`/data/reefs/${selected.id}.json`)).then((r) => r.json()).then((d: { weekStart: string; weekly: number[] }) => {
      if (off) return;
      const t0 = new Date(d.weekStart + "T12:00:00Z").getTime();
      setSeries({ id: selected.id, pts: d.weekly.map((v, i) => [1970 + (t0 + i * 7 * 864e5) / (365.25 * 864e5), v]) });
    }).catch(() => {});
    return () => { off = true; };
  }, [selected]);

  const value = useCallback((s: Station) => metric === "peak" ? s.peak2023to2025 : metric === "now" ? s.latest.dhw
    : s.yearsAbove4["2006-2025"] - s.yearsAbove4["1986-2005"], [metric]);
  const bins = metric === "change" ? CHANGE_BINS : DHW_BINS;

  const overlays: Overlay[] = useMemo(() => {
    if (!data) return [];
    return [{
      id: "reefs", kind: "point", color: "#16191d", width: 0.8,
      data: { type: "FeatureCollection", features: data.stations.map((s) => ({
        type: "Feature", properties: { id: s.id, color: binColor(bins, value(s)), r: selected?.id === s.id ? 2.2 : 1.45 },
        geometry: { type: "Point", coordinates: [s.lon, s.lat] } })) },
    }];
  }, [data, bins, value, selected]);

  const onSelect = useCallback((h: HoverInfo) => {
    if (!data) return;
    let best: Station | null = null, bd = Infinity;
    for (const s of data.stations) {
      const dlon = ((s.lon - h.lon + 540) % 360) - 180;
      const d = dlon * dlon + (s.lat - h.lat) ** 2;
      if (d < bd) { bd = d; best = s; }
    }
    if (best && bd < 64) setSelected(best);
  }, [data]);

  if (!data) return <div className={styles.placeholder} />;
  const n8 = data.stations.filter((s) => s.peak2023to2025 >= 8).length;
  const mean = (k: "1986-2005" | "2006-2025") => data.stations.reduce((a, s) => a + s.yearsAbove4[k], 0) / data.stations.length;
  const near = hx == null || !series ? null : series.pts.reduce((a, b) => (Math.abs(b[0] - hx) < Math.abs(a[0] - hx) ? b : a));

  return (
    <div className={styles.wrap}>
      <div className={styles.toolbar}>
        <div className={styles.seg} role="group" aria-label="What to show">
          <button aria-pressed={metric === "peak"} onClick={() => setMetric("peak")}>Peak heat stress 2023–2025</button>
          <button aria-pressed={metric === "change"} onClick={() => setMetric("change")}>How much more often</button>
          <button aria-pressed={metric === "now"} onClick={() => setMetric("now")}>Now</button>
        </div>
        <label className={styles.toggle}>
          <input type="checkbox" checked={mpa} onChange={(e) => setMpa(e.target.checked)} />
          <span>Show marine protected areas</span>
        </label>
      </div>

      <p className={styles.headline}>
        {metric === "peak" && <><b>{n8} of {data.count}</b> reef regions reached heat stress at which coral deaths are likely during the 2023–2025 global bleaching event.</>}
        {metric === "change" && <>On average, each reef region faced bleaching-level heat in <b>{mean("2006-2025").toFixed(1)} of the last 20 years</b>, against {mean("1986-2005").toFixed(1)} in the 20 years before.</>}
        {metric === "now" && <>Heat stress on {fmtDate(data.updated)}. In October most reefs are outside their hottest season; risk rises across the southern hemisphere from December.</>}
      </p>

      <div className={styles.layout}>
        <div className={styles.mapCol}>
        <div className={styles.mapBox} ref={boxRef}>
          <EarthMap look="data" projection="mercator" view={{ center: [10, 2], zoom }} overlays={overlays} onSelect={onSelect} raster={mpa ? WDPA : null}
            className={styles.map} ariaLabel="Map of coral reef regions coloured by heat stress. Select a region to see its history." />
        </div>
          <ul className={styles.legend} aria-label="Legend">
            {bins.map((b) => <li key={b.label}><i style={{ background: b.color }} />{b.label}</li>)}
          </ul>
        </div>

        <aside className={styles.panel} aria-live="polite">
          {selected && (<>
            <p className={styles.place}>{selected.name}</p>
            <dl className={styles.stats}>
              <div><dt>Peak 2023–2025</dt><dd className="tnum">{selected.peak2023to2025.toFixed(1)}</dd></div>
              <div><dt>Years with bleaching-level heat</dt><dd className="tnum">{selected.yearsAbove4["1986-2005"]} → {selected.yearsAbove4["2006-2025"]}</dd></div>
              <div><dt>Now</dt><dd className="tnum">{selected.latest.dhw.toFixed(1)}</dd></div>
            </dl>
            <p className="small faint">Heat stress in °C-weeks. Years: 1986–2005 → 2006–2025.</p>
            {series && series.id === selected.id && (
              <LineChart ariaLabel={`Weekly heat stress at ${selected.name} since 1985`} height={220}
                x={[1985, Math.ceil(series.pts[series.pts.length - 1][0] * 4) / 4]} y={[0, Math.max(16, Math.ceil(Math.max(...series.pts.map((p) => p[1])) / 4) * 4)]}
                xTicks={[1990, 2000, 2010, 2020]} yTicks={[0, 4, 8, 12, 16, 20, 24, 28].filter((t) => t <= Math.max(16, Math.ceil(Math.max(...series.pts.map((p) => p[1])) / 4) * 4))}
                yLabel="°C-weeks"
                rules={[{ y: 4, dash: "3 3", color: "#f4a259" }, { y: 8, dash: "3 3", color: "#e0542b" }]}
                series={[{ id: "dhw", points: series.pts, color: "#b0202a", width: 1.3 }]}
                onHoverX={setHx} hoverX={hx}
                hoverText={near ? `${Math.floor(near[0])}: ${near[1].toFixed(1)} °C-weeks` : "Dashed lines: 4 (bleaching likely) and 8 (coral deaths likely)."} />
            )}
          </>)}
          <p className="small faint">Select any dot on the map to see that reef region.</p>
        </aside>
      </div>

      <p className={`small faint ${styles.source}`}>
        <span className="evidence evidence--obs">Observed</span>{" "}
        NOAA Coral Reef Watch regional virtual stations, version 3.1: daily satellite heat stress for {data.count} reef regions since
        1985, updated weekly. Heat stress (Degree Heating Weeks) is accumulated heat over 12 weeks above the warmest month of a normal
        year. It indicates the risk of bleaching and coral death; what actually happens varies from reef to reef.
        {mpa && " Marine protected areas: World Database on Protected Areas (UNEP-WCMC and IUCN), drawn by UNEP-WCMC’s map service; designation does not guarantee effective management, and protection does not shield reefs from heatwaves."}
      </p>
    </div>
  );
}
