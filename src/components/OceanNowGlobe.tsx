"use client";

import type { Map as MLMap } from "maplibre-gl";
import { WDPA_LAYER } from "@/lib/wdpa";
import dynamic from "next/dynamic";
import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import CurrentsLayer, { type CurrentsMeta } from "./CurrentsLayer";
import type { HoverInfo, Overlay } from "./EarthMap";
import { formatValue, loadField, lutGradient, renderMercator, sampleField, type EncodedLayer, type Field, type GridSpec, type Lut } from "@/lib/field";
import { asset } from "@/lib/site";
import styles from "./OceanNowGlobe.module.css";

const EarthMap = dynamic(() => import("./EarthMap"), { ssr: false });

export interface FieldMeta extends EncodedLayer {
  date: string; grid: GridSpec; units: string; domain: number; scale: string;
  source: { org: string; product: string; url: string };
}
export interface BleachOutlookMeta extends FieldMeta { validFrom: string; validTo: string; categories: string[] }
export interface SstOutlookMeta {
  date: string; grid: GridSpec; domain: number; layers: (EncodedLayer & { lead: number; month: string })[];
  source: { org: string; product: string; url: string };
}

type When = "now" | "outlook";
type Kind = "temp" | "coral" | "currents" | "fishing" | "ice";
type Rec = { date: string; extent: number };
export interface SeaIceEdgesMeta { file: string; arctic: { max: Rec; min: Rec; now: Rec }; antarctic: { max: Rec; min: Rec; now: Rec } }
type EdgeFile = Record<"arctic" | "antarctic", Record<"max" | "min" | "now", Rec & { lines: [number, number][][] }>>;
const ICE_VIEWS = [
  { id: "arctic", label: "Arctic", center: [10, 80] as [number, number], zoom: 1.45 },
  { id: "antarctic", label: "Antarctic", center: [20, -75] as [number, number], zoom: 1.45 },
];
const REC_MAX = "#38bdf8", REC_MIN = "#f97316";
export interface FishingMeta extends EncodedLayer {
  date: string; start: string; days: number; grid: GridSpec; domain: [number, number]; totalHours: number;
  topFlags: [string, number][]; source: { org: string; product: string; url: string; licence: string; citation: string };
}

const VIEWS = [
  { id: "pacific", label: "Pacific", center: [-140, 2] as [number, number], zoom: 1.55 },
  { id: "atlantic", label: "Atlantic", center: [-40, 28] as [number, number], zoom: 1.6 },
  { id: "indian", label: "Indian Ocean", center: [80, -5] as [number, number], zoom: 1.65 },
  { id: "coral", label: "Coral Triangle", center: [130, -5] as [number, number], zoom: 2.4 },
  { id: "southern", label: "Southern Ocean", center: [20, -58] as [number, number], zoom: 1.5 },
];

const WDPA = WDPA_LAYER;
const ICE_LUT: Lut = Array.from({ length: 256 }, () => [244, 248, 252]);

const day = (iso: string) => new Date(iso + "T12:00:00Z").toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric", timeZone: "UTC" });
const short = (iso: string) => new Date(iso + "T12:00:00Z").toLocaleDateString("en-GB", { month: "long", year: "numeric", timeZone: "UTC" });

export default function OceanNowGlobe({ ssta, dhw, currents, bleachOutlook, sstOutlook, fishing, seaIce, seaIceEdges, initialLayer = "ssta", initialView = "pacific", compact = false, protectedAreas = false }: {
  ssta: FieldMeta; dhw: FieldMeta; currents: CurrentsMeta; bleachOutlook?: BleachOutlookMeta; sstOutlook?: SstOutlookMeta; fishing?: FishingMeta; seaIce?: EncodedLayer & { date: string; grid: GridSpec }; seaIceEdges?: SeaIceEdgesMeta;
  initialLayer?: "ssta" | "dhw"; initialView?: string; compact?: boolean; protectedAreas?: boolean;
}) {
  const [map, setMap] = useState<MLMap | null>(null);
  const [view, setView] = useState(VIEWS.find((v) => v.id === initialView) ?? VIEWS[0]);
  const [when, setWhen] = useState<When>("now");
  const [kind, setKind] = useState<Kind>(initialLayer === "dhw" ? "coral" : "temp");
  const [lead, setLead] = useState(1);
  const [showMpa, setShowMpa] = useState(false);
  const [showIce, setShowIce] = useState(Boolean(seaIce));
  const [iceField, setIceField] = useState<Field | null>(null);
  const [iceCanvas, setIceCanvas] = useState<HTMLCanvasElement | null>(null);
  const [edges, setEdges] = useState<EdgeFile | null>(null);
  const [iceVisited, setIceVisited] = useState(false);
  const [luts, setLuts] = useState<Record<string, { lut: Lut }> | null>(null);
  const [loaded, setLoaded] = useState<{ key: string; field: Field } | null>(null);
  const [canvas, setCanvas] = useState<HTMLCanvasElement | null>(null);
  const [key, setKey] = useState("");
  const [hover, setHover] = useState<(HoverInfo & { value: number | null }) | null>(null);
  const hasOutlook = Boolean(bleachOutlook && sstOutlook && sstOutlook.layers.length);
  const isCurrents = kind === "currents";
  const isFishing = kind === "fishing" && Boolean(fishing);
  const isIce = kind === "ice" && Boolean(seaIce);
  const isOutlook = when === "outlook" && hasOutlook && !isCurrents && !isFishing;

  // The active layer: what to load, how to colour it, and how to describe it.
  const active = useMemo(() => {
    if (isOutlook && kind === "temp") {
      const L = sstOutlook!.layers.find((l) => l.lead === lead) ?? sstOutlook!.layers[0];
      return { id: `sst-${L.lead}`, file: L.file, enc: L as EncodedLayer, grid: sstOutlook!.grid, lut: "temperature", domain: [-sstOutlook!.domain, sstOutlook!.domain] as [number, number], date: sstOutlook!.date, month: L.month };
    }
    if (isOutlook && kind === "coral") {
      return { id: "bleach", file: bleachOutlook!.file, enc: bleachOutlook! as EncodedLayer, grid: bleachOutlook!.grid, lut: "heat", domain: [0, 4] as [number, number], date: bleachOutlook!.date, month: "" };
    }
    if (isFishing) return { id: "fishing", file: fishing!.file, enc: fishing! as EncodedLayer, grid: fishing!.grid, lut: "fishing", domain: fishing!.domain, date: fishing!.date, month: "" };
    if (kind === "coral") return { id: "dhw", file: dhw.file, enc: dhw as EncodedLayer, grid: dhw.grid, lut: "heat", domain: [0, dhw.domain] as [number, number], date: dhw.date, month: "" };
    return { id: "ssta", file: ssta.file, enc: ssta as EncodedLayer, grid: ssta.grid, lut: "temperature", domain: [-ssta.domain, ssta.domain] as [number, number], date: ssta.date, month: "" };
  }, [isOutlook, isFishing, kind, lead, ssta, dhw, sstOutlook, bleachOutlook, fishing]);

  const lut = luts ? luts[active.lut].lut : null;

  useEffect(() => { fetch(asset("/data/scales.json")).then((r) => r.json()).then(setLuts).catch(() => {}); }, []);
  // Each field is tagged with the layer it belongs to, so a colour scale is never applied to another layer's data
  // while the new file is still loading.
  const activeKey = `${active.id}-${active.date}`;
  const field = loaded && loaded.key === activeKey ? loaded.field : null;
  useEffect(() => {
    let off = false;
    loadField(asset(`/data/now/${active.file}`), active.enc, active.grid).then((f) => { if (!off) setLoaded({ key: activeKey, field: f }); }).catch(() => {});
    return () => { off = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [active]);
  useEffect(() => {
    if (!isIce || edges || !seaIceEdges) return;
    fetch(asset(`/data/now/${seaIceEdges.file}`)).then((r) => r.json()).then(setEdges).catch(() => {});
  }, [isIce, edges, seaIceEdges]);
  useEffect(() => {
    if (!seaIce) return;
    loadField(asset(`/data/now/${seaIce.file}`), seaIce, seaIce.grid).then(setIceField).catch(() => {});
  }, [seaIce]);
  useEffect(() => {
    if (!iceField) return;
    const W = window.innerWidth < 720 ? 1024 : 2048;
    const c = document.createElement("canvas");
    c.width = W; c.height = W;
    c.getContext("2d")!.putImageData(renderMercator(iceField, ICE_LUT, [0.15, 1], W, W, 240, true), 0, 0);
    setIceCanvas(c);
  }, [iceField]);
  useEffect(() => {
    if (!field || !lut) return;
    const W = window.innerWidth < 720 ? 1024 : 2048;
    const img = renderMercator(field, lut, active.domain, W, W, 255, active.id === "fishing");
    const c = document.createElement("canvas");
    c.width = W; c.height = W;
    c.getContext("2d")!.putImageData(img, 0, 0);
    setCanvas(c); setKey(activeKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [field, lut]);

  // The data layer with today's sea ice drawn on top, so the poles read on every layer (and over the currents).
  const composite = useMemo(() => {
    if (isIce) return { image: iceCanvas, key: "ice-only" };
    const base = isCurrents ? null : canvas;
    if (!showIce || !iceCanvas) return { image: base, key: isCurrents ? "none" : key };
    const c = document.createElement("canvas");
    c.width = iceCanvas.width; c.height = iceCanvas.height;
    const ctx = c.getContext("2d")!;
    if (base) ctx.drawImage(base, 0, 0, c.width, c.height);
    ctx.drawImage(iceCanvas, 0, 0);
    return { image: c, key: `${isCurrents ? "none" : key}+ice` };
  }, [isIce, isCurrents, canvas, key, showIce, iceCanvas]);

  const iceOverlays: Overlay[] = useMemo(() => {
    if (!isIce || !edges) return [];
    const fc = (k: "max" | "min") => ({ type: "FeatureCollection" as const, features: (["arctic", "antarctic"] as const).flatMap((h) =>
      edges[h][k].lines.map((l) => ({ type: "Feature" as const, properties: {}, geometry: { type: "LineString" as const, coordinates: l } }))) });
    return [
      { id: "ice-max", kind: "line", color: REC_MAX, width: 2, data: fc("max") },
      { id: "ice-min", kind: "line", color: REC_MIN, width: 2, data: fc("min") },
    ];
  }, [isIce, edges]);

  const onHover = useCallback((h: HoverInfo | null) => {
    const f = isIce ? iceField : field;
    if (!h || !f) { setHover(null); return; }
    setHover({ ...h, value: sampleField(f, h.lon, h.lat) });
  }, [field, iceField, isIce]);

  const readout = (v: number) => {
    if (isIce) return `${Math.round(v * 100)}% ice cover`;
    if (active.id === "dhw") return `${v.toFixed(1)} °C-weeks`;
    if (active.id === "fishing") { const h = 10 ** v; return `${h >= 1000 ? "1,000+" : h >= 10 ? Math.round(h).toLocaleString("en-GB") : h.toFixed(1)} fishing hours`; }
    if (active.id === "bleach") return bleachOutlook!.categories[Math.max(0, Math.min(4, Math.round(v)))];
    return formatValue(v, "°C");
  };

  const title = active.id === "fishing" ? `Apparent fishing effort, ${day(fishing!.start)} to ${day(fishing!.date)}, hours per 0.25° cell`
    : active.id === "ssta" ? `Sea-surface temperature compared with normal, ${day(ssta.date)}`
    : active.id === "dhw" ? `Coral bleaching heat stress (Degree Heating Weeks), ${day(dhw.date)}`
    : active.id === "bleach" ? `Forecast bleaching heat stress, ${short(bleachOutlook!.validFrom)} to ${short(bleachOutlook!.validTo)} (60% likely or more)`
    : `Forecast sea-surface temperature compared with normal, ${active.month}`;

  return (
    <div className={`${styles.wrap} ${compact ? styles.compact : ""}`}>
      <div className={styles.toolbar}>
        <div className={styles.controls}>
          {hasOutlook && !isCurrents && !isFishing && (
            <div className={styles.seg} role="group" aria-label="Time">
              <button aria-pressed={when === "now"} onClick={() => setWhen("now")}>Now</button>
              <button aria-pressed={when === "outlook"} onClick={() => setWhen("outlook")}>Next months</button>
            </div>
          )}
          <div className={styles.seg} role="group" aria-label="Map layer">
            <button aria-pressed={kind === "temp"} onClick={() => setKind("temp")}>Temperature</button>
            <button aria-pressed={kind === "coral"} onClick={() => setKind("coral")}>Coral heat stress</button>
            {!compact && <button aria-pressed={kind === "currents"} onClick={() => setKind("currents")}>Currents</button>}
            {!compact && fishing && <button aria-pressed={kind === "fishing"} onClick={() => setKind("fishing")}>Fishing</button>}
            {!compact && seaIce && <button aria-pressed={kind === "ice"} onClick={() => { setKind("ice"); if (!iceVisited) { setView(ICE_VIEWS[0]); setIceVisited(true); } }}>Sea ice</button>}
          </div>
          {isOutlook && kind === "temp" && (
            <div className={styles.seg} role="group" aria-label="Forecast month">
              {sstOutlook!.layers.map((l) => (
                <button key={l.lead} aria-pressed={lead === l.lead} onClick={() => setLead(l.lead)}>{l.month.split(" ")[0].slice(0, 3)}</button>
              ))}
            </div>
          )}
        </div>
        <div className={styles.toggles}>
          {seaIce && !isIce && (
            <label className={styles.toggle}>
              <input type="checkbox" checked={showIce} onChange={(e) => setShowIce(e.target.checked)} />
              <span>Sea ice</span>
            </label>
          )}
          {protectedAreas && (
            <label className={styles.toggle}>
              <input type="checkbox" checked={showMpa} onChange={(e) => setShowMpa(e.target.checked)} />
              <span>Marine protected areas</span>
            </label>
          )}
        </div>
      </div>

      <div className={styles.box}>
        <EarthMap look="satellite" projection="globe" space="dark" view={{ center: view.center, zoom: view.zoom }}
          image={composite.image} imageKey={composite.key} imageOpacity={isIce ? 0.95 : 0.9} onReady={setMap} onHover={onHover} onSelect={onHover}
          overlays={iceOverlays} polarFill={isIce ? "#eff3f7" : null}
          raster={showMpa ? WDPA : null} className={styles.map} ariaLabel={`Globe: ${title}, centred on the ${view.label}`} />
        <CurrentsLayer map={map} meta={currents} visible={isCurrents} />
        {isOutlook && <span className={styles.badge}>Forecast</span>}
        {hover && hover.value !== null && (
          <div className={styles.readout} style={{ left: hover.x + 14, top: hover.y + 14 }}>
            <strong className="tnum">{readout(hover.value)}</strong>
            <span className="tnum">{Math.abs(hover.lat).toFixed(1)}°{hover.lat >= 0 ? "N" : "S"}, {Math.abs(hover.lon).toFixed(1)}°{hover.lon >= 0 ? "E" : "W"}</span>
          </div>
        )}
        <div className={styles.views} role="group" aria-label="Centre the globe on">
          {(isIce ? [...ICE_VIEWS, ...VIEWS] : VIEWS).map((v) => (
            <button key={v.id} aria-pressed={view.id === v.id} onClick={() => setView(v)}>{v.label}</button>
          ))}
        </div>
      </div>

      {isIce && seaIceEdges && (
        <div className={styles.legend}>
          <p className={styles.legendTitle}>Sea ice today, {day(seaIce!.date)}, with the record high and record low ice edges since {edges?.arctic ? new Date(edges.arctic.max.date).getUTCFullYear() < 1980 ? 1979 : 1978 : 1979}</p>
          <ul className={styles.iceKey}>
            <li><i style={{ background: "#f1f5f9", boxShadow: "0 0 0 1px #94a3b8" }} /><span><b>Today</b> · Arctic {seaIceEdges.arctic.now.extent.toFixed(2)}, Antarctic {seaIceEdges.antarctic.now.extent.toFixed(2)} million km² ({day(seaIceEdges.arctic.now.date)})</span></li>
            <li><i style={{ background: REC_MAX }} /><span><b>Record high</b> · Arctic {seaIceEdges.arctic.max.extent.toFixed(2)} on {day(seaIceEdges.arctic.max.date)}; Antarctic {seaIceEdges.antarctic.max.extent.toFixed(2)} on {day(seaIceEdges.antarctic.max.date)}</span></li>
            <li><i style={{ background: REC_MIN }} /><span><b>Record low</b> · Arctic {seaIceEdges.arctic.min.extent.toFixed(2)} on {day(seaIceEdges.arctic.min.date)}; Antarctic {seaIceEdges.antarctic.min.extent.toFixed(2)} on {day(seaIceEdges.antarctic.min.date)}</span></li>
          </ul>
        </div>
      )}

      {lut && !isCurrents && !isIce && (
        <div className={styles.legend}>
          <p className={styles.legendTitle}>{title}</p>
          <div className={styles.bar} style={{ background: lutGradient(lut) }} aria-hidden>
            {!isCurrents && active.id === "dhw" && (<><i style={{ left: `${(4 / dhw.domain) * 100}%` }} /><i style={{ left: `${(8 / dhw.domain) * 100}%` }} /></>)}
          </div>
          <div className={`${styles.ticks} tnum`}>
            {active.id === "dhw" ? (
              <><span>0</span><span style={{ marginLeft: `${(4 / dhw.domain) * 100 - 8}%` }}>4: bleaching likely</span><span>8: severe bleaching and mortality likely</span><span>≥ {dhw.domain}</span></>
            ) : active.id === "fishing" ? (
              <><span>0.5 hours</span><span>10</span><span>100</span><span>≥ 1,000 hours</span></>
            ) : active.id === "bleach" ? (
              bleachOutlook!.categories.map((c) => <span key={c}>{c}</span>)
            ) : (
              <><span>≤ −{ssta.domain}°C colder</span><span>normal</span><span>≥ +{ssta.domain}°C warmer</span></>
            )}
          </div>
        </div>
      )}

      {!compact && (
        <section className={styles.about} aria-label="About this layer">
          {isIce && (<>
            <div><h3>What it shows</h3><p>Where at least 15% of the sea surface is frozen today (white), and the ice edge on the days of the largest and smallest extent in the satellite record, for both poles. Drag the globe to move between the Arctic and the Antarctic.</p></div>
            <div><h3>Why it matters</h3><p>Sea ice reflects sunlight and shapes ocean circulation. Arctic summer ice has shrunk by about 40% since the late 1970s; Antarctic sea ice changed little until 2016, then fell to record lows. <Link href="/changes/southern-ocean/">Southern Ocean</Link></p></div>
            <div><h3>Source</h3><p><span className="evidence evidence--obs">Observed</span> Today’s ice: NOAA Coral Reef Watch CoralTemp sea-ice fraction. Extents and record edges: National Snow and Ice Data Center, Sea Ice Index version 4 (doi:10.7265/a98x-0f50), 25 km grid. Records count every day since late 1978; the early years have data every other day.</p></div>
          </>)}
          {isCurrents && (<>
            <div><h3>What it shows</h3><p>Today’s ocean surface currents. Each moving line follows the estimated surface flow; brighter lines are faster currents. The motion is greatly speeded up, and the lines are not water or drifting buoys.</p></div>
            <div><h3>Why it matters</h3><p>Currents carry heat around the planet. The Gulf Stream and North Atlantic Current carry the upper branch of the Atlantic overturning circulation; along the equatorial Pacific the flow changes during El Niño. <Link href="/changes/atlantic-circulation/">Atlantic circulation</Link></p></div>
            <div><h3>Source</h3><p><span className="evidence evidence--obs">Observed</span> NOAA CoastWatch blended near-real-time surface currents, {day(currents.date)}, estimated from satellite sea-surface height and winds; 0.5° grid.</p></div>
          </>)}
          {!isCurrents && active.id === "ssta" && (<>
            <div><h3>What it shows</h3><p>How much warmer or colder the sea surface is than the 1985–2012 average for the same day, from satellite measurements blended into a daily 5 km product (shown here at 0.25°).</p></div>
            <div><h3>Why it matters</h3><p>The warm band along the equatorial Pacific is El Niño. Large warm patches elsewhere are marine heatwaves, which bleach corals, move fish stocks and fuel heavy rain on nearby coasts. <Link href="/science/el-nino/">El Niño</Link> · <Link href="/changes/coral-reefs/">coral reefs</Link></p></div>
            <div><h3>Source</h3><p><span className="evidence evidence--obs">Observed</span> NOAA Coral Reef Watch, CoralTemp v3.1 SST anomaly. <a href={ssta.source.url}>Product page</a>. Near-coast pixels are less reliable. Sea ice (white, where at least 15% of the sea is ice) is from the same product.</p></div>
          </>)}
          {!isCurrents && active.id === "dhw" && (<>
            <div><h3>What it shows</h3><p>How much, and for how long, the sea has been at least 1°C warmer than its usual warmest month over the past 12 weeks, in °C-weeks; 4 °C-weeks is roughly one month at 1°C above that level. Shown only at coral reef regions (NOAA Coral Reef Watch’s 5 km reef areas); white means no heat stress.</p></div>
            <div><h3>Why it matters</h3><p>Above 4 °C-weeks, reef-wide bleaching is likely; above 8, bleaching with significant coral death is likely. Repeated heat stress is why the Global Tipping Points Report 2025 assesses that reefs are crossing their thermal tipping point. <Link href="/changes/coral-reefs/">Coral reefs</Link></p></div>
            <div><h3>Source</h3><p><span className="evidence evidence--obs">Observed</span> NOAA Coral Reef Watch, Degree Heating Weeks v3.1. <a href={dhw.source.url}>Product page</a>. These are risk levels; how reefs respond varies locally.</p></div>
          </>)}
          {!isCurrents && active.id === "fishing" && (<>
            <div><h3>What it shows</h3><p>Where fishing vessels appear to have been fishing over the past {fishing!.days} days: {Math.round(fishing!.totalHours / 1e6 * 10) / 10} million hours in total. Effort is detected from ships’ automatic identification system (AIS) tracks by a machine-learning model.</p></div>
            <div><h3>Why it matters</h3><p>Fishing pressure decides how well stocks cope as they move with warming waters, and whether protected areas are respected. Vessels flagged to China account for {fishing!.topFlags.find((f) => f[0] === "CHN")?.[1] ?? "–"}% of the hours shown. How many vessels carry AIS varies by country, so shares by flag are indicative. <Link href="/changes/fish-on-the-move/">Fisheries in a warming ocean</Link></p></div>
            <div><h3>Source and limits</h3><p><span className="evidence evidence--obs">Observed</span> <a href={fishing!.source.url}>Global Fishing Watch</a>, CC BY-SA 4.0 (Kroodsma et al., 2018). Many small and artisanal boats carry no AIS, and coverage is uneven between regions, so this is a minimum.</p></div>
          </>)}
          {!isCurrents && active.id === "bleach" && (<>
            <div><h3>What it shows</h3><p>The highest bleaching alert level expected over the next four months at coral reef regions, where at least 60% of forecast runs reach it. Issued {day(bleachOutlook!.date)}, updated weekly.</p></div>
            <div><h3>Why it matters</h3><p>Reef managers use the outlook to prepare monitoring and reduce other pressures before heat arrives. A strong El Niño raises bleaching risk across the tropics in the months that follow. <Link href="/changes/coral-reefs/">Coral reefs</Link></p></div>
            <div><h3>Source and reliability</h3><p><span className="evidence evidence--forecast">Forecast</span> NOAA Coral Reef Watch Four-Month Outlook v5, from the NOAA CFSv2 climate model (Liu et al., 2018). Skill is higher in the first weeks and lower near the end of the period.</p></div>
          </>)}
          {!isCurrents && active.id.startsWith("sst-") && (<>
            <div><h3>What it shows</h3><p>The average forecast from several seasonal climate models of how much warmer or colder than normal the sea surface will be in {active.month}. Forecast issued {day(sstOutlook!.date)}, updated monthly.</p></div>
            <div><h3>Why it matters</h3><p>Seasonal forecasts give months of warning of El Niño, marine heatwaves and the droughts and floods they bring. That lead time is what makes early action and pre-arranged finance possible. <Link href="/science/el-nino/">El Niño</Link></p></div>
            <div><h3>Source and reliability</h3><p><span className="evidence evidence--forecast">Forecast</span> NOAA North American Multi-Model Ensemble mean (Kirtman et al., 2014), 1° grid. Averaging smooths extremes; skill falls with lead time and is highest in the tropical Pacific.</p></div>
          </>)}
        </section>
      )}
      {showMpa && (
        <p className={`small faint ${styles.currentsNote}`}>
          Marine and coastal protected areas from the World Database on Protected Areas (UNEP-WCMC and IUCN, Protected Planet), drawn by
          UNEP-WCMC’s map service. Designation does not guarantee effective management, and protection does not shield reefs from
          marine heatwaves.
        </p>
      )}
    </div>
  );
}
