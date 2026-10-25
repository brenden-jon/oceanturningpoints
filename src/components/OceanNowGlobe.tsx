"use client";

import type { Map as MLMap } from "maplibre-gl";
import dynamic from "next/dynamic";
import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import CurrentsLayer, { type CurrentsMeta } from "./CurrentsLayer";
import type { HoverInfo } from "./EarthMap";
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
type Kind = "temp" | "coral" | "currents";

const VIEWS = [
  { id: "pacific", label: "Pacific", center: [-140, 2] as [number, number], zoom: 1.55 },
  { id: "atlantic", label: "Atlantic", center: [-40, 28] as [number, number], zoom: 1.6 },
  { id: "indian", label: "Indian Ocean", center: [80, -5] as [number, number], zoom: 1.65 },
  { id: "coral", label: "Coral Triangle", center: [130, -5] as [number, number], zoom: 2.4 },
  { id: "southern", label: "Southern Ocean", center: [20, -58] as [number, number], zoom: 1.5 },
];

// Marine and coastal protected areas, drawn by UNEP-WCMC's own map service (WDPA),
// so the dataset itself is never copied or redistributed.
const WDPA = {
  id: "wdpa",
  tiles: ["https://data-gis.unep-wcmc.org/server/rest/services/ProtectedSites/The_World_Database_of_Protected_Areas/MapServer/export?bbox={bbox-epsg-3857}&bboxSR=3857&imageSR=3857&size=256,256&format=png32&transparent=true&f=image&layers=show:1&layerDefs=%7B%221%22%3A%22realm%20%3C%3E%20%27Terrestrial%27%22%7D"],
  attribution: 'Protected areas: <a href="https://www.protectedplanet.net/">UNEP-WCMC &amp; IUCN, WDPA</a>',
  opacity: 0.8,
};

const day = (iso: string) => new Date(iso + "T12:00:00Z").toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric", timeZone: "UTC" });
const short = (iso: string) => new Date(iso + "T12:00:00Z").toLocaleDateString("en-GB", { month: "long", year: "numeric", timeZone: "UTC" });

export default function OceanNowGlobe({ ssta, dhw, currents, bleachOutlook, sstOutlook, initialLayer = "ssta", initialView = "pacific", compact = false, protectedAreas = false }: {
  ssta: FieldMeta; dhw: FieldMeta; currents: CurrentsMeta; bleachOutlook?: BleachOutlookMeta; sstOutlook?: SstOutlookMeta;
  initialLayer?: "ssta" | "dhw"; initialView?: string; compact?: boolean; protectedAreas?: boolean;
}) {
  const [map, setMap] = useState<MLMap | null>(null);
  const [view, setView] = useState(VIEWS.find((v) => v.id === initialView) ?? VIEWS[0]);
  const [when, setWhen] = useState<When>("now");
  const [kind, setKind] = useState<Kind>(initialLayer === "dhw" ? "coral" : "temp");
  const [lead, setLead] = useState(1);
  const [showMpa, setShowMpa] = useState(false);
  const [luts, setLuts] = useState<Record<string, { lut: Lut }> | null>(null);
  const [field, setField] = useState<Field | null>(null);
  const [canvas, setCanvas] = useState<HTMLCanvasElement | null>(null);
  const [key, setKey] = useState("");
  const [hover, setHover] = useState<(HoverInfo & { value: number | null }) | null>(null);
  const hasOutlook = Boolean(bleachOutlook && sstOutlook && sstOutlook.layers.length);
  const isCurrents = kind === "currents";
  const isOutlook = when === "outlook" && hasOutlook && !isCurrents;

  // The active layer: what to load, how to colour it, and how to describe it.
  const active = useMemo(() => {
    if (isOutlook && kind === "temp") {
      const L = sstOutlook!.layers.find((l) => l.lead === lead) ?? sstOutlook!.layers[0];
      return { id: `sst-${L.lead}`, file: L.file, enc: L as EncodedLayer, grid: sstOutlook!.grid, lut: "temperature", domain: [-sstOutlook!.domain, sstOutlook!.domain] as [number, number], date: sstOutlook!.date, month: L.month };
    }
    if (isOutlook && kind === "coral") {
      return { id: "bleach", file: bleachOutlook!.file, enc: bleachOutlook! as EncodedLayer, grid: bleachOutlook!.grid, lut: "heat", domain: [0, 4] as [number, number], date: bleachOutlook!.date, month: "" };
    }
    if (kind === "coral") return { id: "dhw", file: dhw.file, enc: dhw as EncodedLayer, grid: dhw.grid, lut: "heat", domain: [0, dhw.domain] as [number, number], date: dhw.date, month: "" };
    return { id: "ssta", file: ssta.file, enc: ssta as EncodedLayer, grid: ssta.grid, lut: "temperature", domain: [-ssta.domain, ssta.domain] as [number, number], date: ssta.date, month: "" };
  }, [isOutlook, kind, lead, ssta, dhw, sstOutlook, bleachOutlook]);

  const lut = luts ? luts[active.lut].lut : null;

  useEffect(() => { fetch(asset("/data/scales.json")).then((r) => r.json()).then(setLuts).catch(() => {}); }, []);
  useEffect(() => {
    let off = false;
    loadField(asset(`/data/now/${active.file}`), active.enc, active.grid).then((f) => { if (!off) setField(f); }).catch(() => {});
    return () => { off = true; };
  }, [active]);
  useEffect(() => {
    if (!field || !lut) return;
    const W = window.innerWidth < 720 ? 1024 : 2048;
    const img = renderMercator(field, lut, active.domain, W, W, 255);
    const c = document.createElement("canvas");
    c.width = W; c.height = W;
    c.getContext("2d")!.putImageData(img, 0, 0);
    setCanvas(c); setKey(`${active.id}-${active.date}`);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [field, lut]);

  const onHover = useCallback((h: HoverInfo | null) => {
    if (!h || !field) { setHover(null); return; }
    setHover({ ...h, value: sampleField(field, h.lon, h.lat) });
  }, [field]);

  const readout = (v: number) => {
    if (active.id === "dhw") return `${v.toFixed(1)} °C-weeks`;
    if (active.id === "bleach") return bleachOutlook!.categories[Math.max(0, Math.min(4, Math.round(v)))];
    return formatValue(v, "°C");
  };

  const title = active.id === "ssta" ? `Sea-surface temperature compared with normal, ${day(ssta.date)}`
    : active.id === "dhw" ? `Coral bleaching heat stress (Degree Heating Weeks), ${day(dhw.date)}`
    : active.id === "bleach" ? `Forecast bleaching heat stress, ${short(bleachOutlook!.validFrom)} to ${short(bleachOutlook!.validTo)} (60% likely or more)`
    : `Forecast sea-surface temperature compared with normal, ${active.month}`;

  return (
    <div className={`${styles.wrap} ${compact ? styles.compact : ""}`}>
      <div className={styles.toolbar}>
        <div className={styles.controls}>
          {hasOutlook && !isCurrents && (
            <div className={styles.seg} role="group" aria-label="Time">
              <button aria-pressed={when === "now"} onClick={() => setWhen("now")}>Now</button>
              <button aria-pressed={when === "outlook"} onClick={() => setWhen("outlook")}>Next months</button>
            </div>
          )}
          <div className={styles.seg} role="group" aria-label="Map layer">
            <button aria-pressed={kind === "temp"} onClick={() => setKind("temp")}>Temperature</button>
            <button aria-pressed={kind === "coral"} onClick={() => setKind("coral")}>Coral heat stress</button>
            {!compact && <button aria-pressed={kind === "currents"} onClick={() => setKind("currents")}>Currents</button>}
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
          image={isCurrents ? null : canvas} imageKey={isCurrents ? "none" : key} imageOpacity={0.9} onReady={setMap} onHover={onHover} onSelect={onHover}
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
          {VIEWS.map((v) => (
            <button key={v.id} aria-pressed={view.id === v.id} onClick={() => setView(v)}>{v.label}</button>
          ))}
        </div>
      </div>

      {lut && !isCurrents && (
        <div className={styles.legend}>
          <p className={styles.legendTitle}>{title}</p>
          <div className={styles.bar} style={{ background: lutGradient(lut) }} aria-hidden>
            {!isCurrents && active.id === "dhw" && (<><i style={{ left: `${(4 / dhw.domain) * 100}%` }} /><i style={{ left: `${(8 / dhw.domain) * 100}%` }} /></>)}
          </div>
          <div className={`${styles.ticks} tnum`}>
            {active.id === "dhw" ? (
              <><span>0</span><span style={{ marginLeft: `${(4 / dhw.domain) * 100 - 8}%` }}>4: bleaching likely</span><span>8: severe bleaching and mortality likely</span><span>≥ {dhw.domain}</span></>
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
          {isCurrents && (<>
            <div><h3>What it shows</h3><p>Today’s ocean surface currents. Each moving line follows the measured flow; brighter lines are faster currents. The motion is greatly speeded up, and the lines are not water or drifting buoys.</p></div>
            <div><h3>Why it matters</h3><p>Currents carry heat around the planet. The Gulf Stream and North Atlantic Current are the surface part of the Atlantic overturning circulation; along the equatorial Pacific the flow changes during El Niño. <Link href="/changes/atlantic-circulation/">Atlantic circulation</Link></p></div>
            <div><h3>Source</h3><p><span className="evidence evidence--obs">Observed</span> NOAA CoastWatch blended near-real-time surface currents, {day(currents.date)}, estimated from satellite sea-surface height and winds; 0.5° grid.</p></div>
          </>)}
          {!isCurrents && active.id === "ssta" && (<>
            <div><h3>What it shows</h3><p>How much warmer or colder the sea surface is than the 1985–2012 average for the same day, from satellite measurements blended into a daily 5 km product (shown here at 0.25°).</p></div>
            <div><h3>Why it matters</h3><p>The warm band along the equatorial Pacific is El Niño. Large warm patches elsewhere are marine heatwaves, which bleach corals, move fish stocks and fuel heavy rain on nearby coasts. <Link href="/science/el-nino/">El Niño</Link> · <Link href="/changes/coral-reefs/">coral reefs</Link></p></div>
            <div><h3>Source</h3><p><span className="evidence evidence--obs">Observed</span> NOAA Coral Reef Watch, CoralTemp v3.1 SST anomaly. <a href={ssta.source.url}>Product page</a>. Near-coast and sea-ice pixels are less reliable.</p></div>
          </>)}
          {!isCurrents && active.id === "dhw" && (<>
            <div><h3>What it shows</h3><p>Heat built up over the past 12 weeks above the warmest month of a normal year, in °C-weeks. Shown for the tropical belt where warm-water reefs grow; the map covers open ocean too.</p></div>
            <div><h3>Why it matters</h3><p>Above 4 °C-weeks, reef-wide bleaching is likely; above 8, bleaching with significant coral death is likely. Repeated heat stress is why reefs are assessed to be crossing a tipping point. <Link href="/changes/coral-reefs/">Coral reefs</Link></p></div>
            <div><h3>Source</h3><p><span className="evidence evidence--obs">Observed</span> NOAA Coral Reef Watch, Degree Heating Weeks v3.1. <a href={dhw.source.url}>Product page</a>. These are risk levels; how reefs respond varies locally.</p></div>
          </>)}
          {!isCurrents && active.id === "bleach" && (<>
            <div><h3>What it shows</h3><p>The highest bleaching alert level expected over the next four months, at places where at least 60% of forecast runs reach it. Issued {day(bleachOutlook!.date)}, updated weekly.</p></div>
            <div><h3>Why it matters</h3><p>Reef managers use the outlook to prepare monitoring and reduce other pressures before heat arrives. The strong El Niño raises bleaching risk across the tropics into 2027. <Link href="/changes/coral-reefs/">Coral reefs</Link></p></div>
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
