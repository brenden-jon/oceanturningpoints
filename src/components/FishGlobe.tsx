"use client";

import dynamic from "next/dynamic";
import { useCallback, useEffect, useMemo, useState } from "react";
import type { HoverInfo, Overlay } from "./EarthMap";
import { loadField, lutGradient, renderMercator, sampleField, type EncodedLayer, type Field, type GridSpec, type Lut } from "@/lib/field";
import { asset } from "@/lib/site";
import styles from "./OceanNowGlobe.module.css";
import own from "./FishGlobe.module.css";

const EarthMap = dynamic(() => import("./EarthMap"), { ssr: false });

interface Enc extends EncodedLayer { grid: GridSpec; domain: number }
interface Layer extends Enc { period: string; baseline: string; scenarioLabel: string; median: Enc; display?: Enc }
type GlobalRow = { period: string; mean: number; sd: number; n: number };
interface GridIndex {
  [key: string]: unknown;
  global: Record<string, GlobalRow | string>;
  source: { citation: string; licence?: string; url?: string; ensemble?: { members: number; ecosystemModels: number; earthSystemModels: number } };
}
interface Area {
  id: string; lon: number; lat: number; hemisphere: "North" | "South"; n: number; nSpecies: number; medianKmYr: number;
  sharePoleward: number; classes: { name: string; n: number }[]; start: number; refs: string[]; nFish: number;
  fishExamples: { species: string; kmYr: number }[];
  seaLon: number; seaLat: number; arrow: [[number, number], [number, number]] | null;
}
interface Shifts { areas: Area[]; summary: { nRecords: number; nAreas: number; nSpecies: number }; source: { classLabels: Record<string, string>; caveat: string; paper: string; paperDoi: string; datasetDoi: string; paperHeadline?: string } }

const VIEWS = [
  { id: "natl", label: "North Atlantic", center: [-25, 45] as [number, number], zoom: 1.7 },
  { id: "npac", label: "North Pacific", center: [-170, 40] as [number, number], zoom: 1.6 },
  { id: "trop", label: "Tropics", center: [100, 0] as [number, number], zoom: 1.5 },
  { id: "south", label: "Southern seas", center: [140, -35] as [number, number], zoom: 1.6 },
];
const SCEN = [
  { id: "ssp126", label: "Low emissions" },
  { id: "ssp585", label: "Very high emissions" },
];
const fmt = (v: number) => `${v > 0 ? "+" : v < 0 ? "−" : ""}${Math.abs(v).toFixed(0)}%`;
const km = (v: number) => `${Math.abs(v) < 1 ? Math.abs(v).toFixed(1) : Math.abs(v).toFixed(0)} km a year`;

/** Arrow precomputed by the pipeline: towards the pole (or equator), scaled to speed, kept at sea. */
function arrow(a: Area): GeoJSON.Feature[] {
  if (!a.arrow) return [];
  const [[x0, y0], [x1, y1]] = a.arrow;
  const dir = Math.sign(y1 - y0);
  const head = Math.min(1.4, Math.abs(y1 - y0) * 0.35);
  return [
    { type: "Feature", properties: {}, geometry: { type: "LineString", coordinates: [[x0, y0], [x1, y1]] } },
    { type: "Feature", properties: {}, geometry: { type: "LineString", coordinates: [[x1 - head * 0.8, y1 - dir * head], [x1, y1], [x1 + head * 0.8, y1 - dir * head]] } },
  ];
}

export default function FishGlobe() {
  const [index, setIndex] = useState<GridIndex | null>(null);
  const [shifts, setShifts] = useState<Shifts | null>(null);
  const [lut, setLut] = useState<Lut | null>(null);
  const [scen, setScen] = useState("ssp585");
  const [year, setYear] = useState("2100");
  const [showShifts, setShowShifts] = useState(true);
  const [view, setView] = useState(VIEWS[0]);
  const [loaded, setLoaded] = useState<{ key: string; field: Field } | null>(null);
  const [canvas, setCanvas] = useState<{ key: string; c: HTMLCanvasElement } | null>(null);
  const [hover, setHover] = useState<(HoverInfo & { value: number | null }) | null>(null);
  const [sel, setSel] = useState<Area | null>(null);

  useEffect(() => {
    fetch(asset("/data/fish/grid.json")).then((r) => r.json()).then(setIndex).catch(() => {});
    fetch(asset("/data/fish/shifts.json")).then((r) => r.json()).then(setShifts).catch(() => {});
    fetch(asset("/data/scales.json")).then((r) => r.json()).then((s) => setLut(s.rainfall.lut)).catch(() => {});
  }, []);

  const keys = useMemo(() => index ? Object.keys(index).filter((k) => /^ssp\d+_\d{4}$/.test(k)) : [], [index]);
  const years = useMemo(() => Array.from(new Set(keys.map((k) => k.split("_")[1]))).sort(), [keys]);
  const key = `${scen}_${years.includes(year) ? year : years[years.length - 1]}`;
  const layer = index ? (index[key] as Layer | undefined) : undefined;
  // Show the ensemble median: unlike the mean, it is not pulled by one model's extreme percentage gains on tiny baselines.
  const shown = layer?.display ?? layer?.median;

  useEffect(() => {
    if (!shown) return;
    let off = false;
    loadField(asset(`/data/fish/${shown.file}`), shown, shown.grid).then((f) => { if (!off) setLoaded({ key, field: f }); }).catch(() => {});
    return () => { off = true; };
  }, [shown, key]);
  const field = loaded && loaded.key === key ? loaded.field : null;

  useEffect(() => {
    if (!field || !lut || !layer) return;
    const W = window.innerWidth < 720 ? 1024 : 2048;
    const c = document.createElement("canvas");
    c.width = W; c.height = W;
    c.getContext("2d")!.putImageData(renderMercator(field, lut, [-layer.domain, layer.domain], W, W, 235), 0, 0);
    setCanvas({ key, c });
  }, [field, lut, layer, key]);

  const overlays: Overlay[] = useMemo(() => {
    if (!shifts || !showShifts) return [];
    const areas = shifts.areas;
    const pole = areas.filter((a) => a.medianKmYr > 0), eq = areas.filter((a) => a.medianKmYr < 0);
    return [
      { id: "shift-pole", kind: "line", color: "#ffffff", width: 2.2, data: { type: "FeatureCollection", features: pole.flatMap(arrow) } },
      { id: "shift-eq", kind: "line", color: "#ffb15e", width: 2.2, data: { type: "FeatureCollection", features: eq.flatMap(arrow) } },
      { id: "shift-areas", kind: "point", color: "#0b1520", width: 1, data: { type: "FeatureCollection", features: areas.map((a) => ({
        type: "Feature", properties: { id: a.id, color: a.medianKmYr > 0 ? "#ffffff" : a.medianKmYr < 0 ? "#ffb15e" : "#b8c2cc", r: Math.min(2.4, 0.8 + Math.sqrt(a.nSpecies) / 6) },
        geometry: { type: "Point", coordinates: [a.seaLon ?? a.lon, a.seaLat ?? a.lat] } })) } },
    ];
  }, [shifts, showShifts]);

  const nearestArea = useCallback((h: HoverInfo) => {
    if (!shifts || !showShifts) return null;
    if (h.props && typeof h.props.id === "string") return shifts.areas.find((a) => a.id === h.props!.id) ?? null;
    return null;
  }, [shifts, showShifts]);
  const onHover = useCallback((h: HoverInfo | null) => {
    if (!h) { setHover(null); return; }
    setHover({ ...h, value: field ? sampleField(field, h.lon, h.lat) : null });
  }, [field]);
  const onSelect = useCallback((h: HoverInfo) => { const a = nearestArea(h); if (a) setSel(a); }, [nearestArea]);
  const hoverArea = hover ? nearestArea(hover) : null;

  const labels = shifts?.source.classLabels ?? {};
  const g585 = index?.global?.ssp585_2090s as GlobalRow | undefined;
  const g126 = index?.global?.ssp126_2090s as GlobalRow | undefined;
  const scenLabel = SCEN.find((s) => s.id === scen)!.label.toLowerCase();

  return (
    <div className={styles.wrap}>
      <div className={styles.toolbar}>
        <div className={styles.controls}>
          <div className={styles.seg} role="group" aria-label="Emissions">
            {SCEN.map((s) => <button key={s.id} aria-pressed={scen === s.id} onClick={() => setScen(s.id)}>{s.label}</button>)}
          </div>
          {years.length > 1 && (
            <div className={styles.seg} role="group" aria-label="Period">
              {years.map((y) => <button key={y} aria-pressed={key.endsWith(y)} onClick={() => setYear(y)}>{(index![`${scen}_${y}`] as Layer | undefined)?.period ?? y}</button>)}
            </div>
          )}
        </div>
        <div className={styles.toggles}>
          <label className={styles.toggle}>
            <input type="checkbox" checked={showShifts} onChange={(e) => setShowShifts(e.target.checked)} />
            <span>Observed shifts</span>
          </label>
        </div>
      </div>

      <div className={styles.box}>
        <EarthMap look="satellite" projection="globe" space="dark" view={{ center: view.center, zoom: view.zoom }}
          image={canvas && canvas.key === key ? canvas.c : null} imageKey={canvas?.key ?? "none"} imageOpacity={0.88}
          overlays={overlays} onHover={onHover} onSelect={onSelect} className={styles.map}
          ariaLabel={`Globe: projected change in marine animal biomass by ${layer?.period ?? ""} under ${scenLabel}, with observed species range shifts as arrows`} />
        {hover && (hoverArea || hover.value !== null) && (
          <div className={styles.readout} style={{ left: hover.x + 14, top: hover.y + 14 }}>
            {hoverArea ? (
              <><strong>{hoverArea.nSpecies} species, median {km(hoverArea.medianKmYr)} {hoverArea.medianKmYr >= 0 ? "poleward" : "towards the equator"}</strong><span>{hoverArea.refs.join("; ")} · select for details</span></>
            ) : (
              <><strong className="tnum">{fmt(hover.value!)} animal biomass</strong><span className="tnum">{Math.abs(hover.lat).toFixed(1)}°{hover.lat >= 0 ? "N" : "S"}, {Math.abs(hover.lon).toFixed(1)}°{hover.lon >= 0 ? "E" : "W"}</span></>
            )}
          </div>
        )}
        <div className={styles.views} role="group" aria-label="Centre the globe on">
          {VIEWS.map((v) => <button key={v.id} aria-pressed={view.id === v.id} onClick={() => setView(v)}>{v.label}</button>)}
        </div>
      </div>

      {lut && layer && (
        <div className={styles.legend}>
          <p className={styles.legendTitle}>Projected change in marine animal biomass by the 2090s, compared with the 1990s, {scenLabel}: median of {index?.source.ensemble?.members ?? 15} model runs</p>
          <div className={styles.bar} style={{ background: lutGradient(lut) }} aria-hidden />
          <div className={`${styles.ticks} tnum`}><span>≤ −{layer.domain}% less</span><span>no change</span><span>≥ +{layer.domain}% more</span></div>
          {showShifts && (
            <ul className={own.key}>
              <li><i className={own.pole} />Observed shift towards the pole</li>
              <li><i className={own.eq} />Observed shift towards the equator</li>
              <li className={own.note}>Median of the species in each study; arrow length scaled to speed and shortened where it would cross land.</li>
            </ul>
          )}
        </div>
      )}

      {sel && (
        <div className={own.detail} aria-live="polite">
          <button className={own.close} onClick={() => setSel(null)} aria-label="Close">×</button>
          <p className={own.detailHead}>
            Study area at {Math.abs(sel.lat).toFixed(0)}°{sel.lat >= 0 ? "N" : "S"}, {Math.abs(sel.lon).toFixed(0)}°{sel.lon >= 0 ? "E" : "W"} · {sel.refs.join("; ")}
          </p>
          <p>
            {sel.nSpecies} species tracked from {sel.start}. Median shift <b>{km(sel.medianKmYr)} {sel.medianKmYr >= 0 ? "towards the pole" : "towards the equator"}</b>;{" "}
            {Math.round(sel.sharePoleward * 100)}% of estimates moved poleward. Main groups: {sel.classes.slice(0, 3).map((c) => labels[c.name] ?? c.name).join(", ")}.
          </p>
          {sel.fishExamples.length > 0 && (
            <p className="small">Fish: {sel.fishExamples.map((f) => `${f.species} ${f.kmYr > 0 ? "+" : ""}${f.kmYr.toFixed(1)} km/yr`).join(" · ")}</p>
          )}
        </div>
      )}

      <section className={styles.about} aria-label="About this map">
        <div><h3>Colours: what models project</h3><p>Where the total mass of marine animals, without fishing, is projected to rise (blue-green) or fall (brown) by the 2090s: the median of {index?.source.ensemble ? `${index.source.ensemble.ecosystemModels} marine ecosystem models driven by ${index.source.ensemble.earthSystemModels} climate models` : "an ensemble of marine ecosystem models"}. Globally, total animal biomass falls by about {g585 ? Math.abs(g585.mean).toFixed(0) : "17"}% under very high emissions and {g126 ? Math.abs(g126.mean).toFixed(0) : "6"}% under low emissions. Losses dominate the tropics; some high-latitude seas gain.</p></div>
        <div><h3>Arrows: what has been measured</h3><p>{shifts ? `${shifts.summary.nRecords.toLocaleString("en-GB")} published range shifts of ${shifts.summary.nSpecies} marine species in ${shifts.summary.nAreas} study areas. ` : ""}Most moved towards the poles as the water warmed. {shifts?.source.caveat}</p></div>
        <div><h3>Sources</h3><p>
          <span className="evidence evidence--model">Model projection</span> <a href="https://doi.org/10.1038/s41558-021-01173-9">Tittensor et al. (2021)</a>, data on Zenodo, CC BY 4.0; ensemble median computed by Ocean Turning Points.{" "}
          <span className="evidence evidence--obs">Observed</span> {shifts ? <>BioShifts (<a href={`https://doi.org/${shifts.source.datasetDoi}`}>Comte et al., 2020</a>), CC BY 4.0; <a href={`https://doi.org/${shifts.source.paperDoi}`}>Lenoir et al. (2020)</a>.</> : "BioShifts (Comte et al., 2020), CC BY 4.0."}
        </p></div>
      </section>
    </div>
  );
}
