"use client";

import type { Map as MLMap } from "maplibre-gl";
import dynamic from "next/dynamic";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
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

type LayerId = "ssta" | "dhw";

const VIEWS = [
  { id: "pacific", label: "Pacific", center: [-140, 2] as [number, number], zoom: 1.55 },
  { id: "atlantic", label: "Atlantic", center: [-40, 28] as [number, number], zoom: 1.6 },
  { id: "indian", label: "Indian Ocean", center: [80, -5] as [number, number], zoom: 1.65 },
  { id: "coral", label: "Coral Triangle", center: [130, -5] as [number, number], zoom: 2.4 },
  { id: "southern", label: "Southern Ocean", center: [20, -58] as [number, number], zoom: 1.5 },
];

const day = (iso: string) => new Date(iso + "T12:00:00Z").toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric", timeZone: "UTC" });

export default function OceanNowGlobe({ ssta, dhw, currents, initialLayer = "ssta", initialView = "pacific", compact = false }: {
  ssta: FieldMeta; dhw: FieldMeta; currents: CurrentsMeta; initialLayer?: LayerId; initialView?: string; compact?: boolean;
}) {
  const [map, setMap] = useState<MLMap | null>(null);
  const [view, setView] = useState(VIEWS.find((v) => v.id === initialView) ?? VIEWS[0]);
  const [layer, setLayer] = useState<LayerId>(initialLayer);
  const [showCurrents, setShowCurrents] = useState(true);
  const [luts, setLuts] = useState<Record<string, { lut: Lut }> | null>(null);
  const [field, setField] = useState<Field | null>(null);
  const [canvas, setCanvas] = useState<HTMLCanvasElement | null>(null);
  const [key, setKey] = useState("");
  const [hover, setHover] = useState<(HoverInfo & { value: number | null }) | null>(null);

  const meta = layer === "ssta" ? ssta : dhw;
  const domain: [number, number] = layer === "ssta" ? [-ssta.domain, ssta.domain] : [0, dhw.domain];
  const lut = luts ? luts[layer === "ssta" ? "temperature" : "heat"].lut : null;

  useEffect(() => { fetch(asset("/data/scales.json")).then((r) => r.json()).then(setLuts).catch(() => {}); }, []);
  useEffect(() => {
    let off = false;
    loadField(asset(`/data/now/${meta.file}`), meta, meta.grid).then((f) => { if (!off) setField(f); }).catch(() => {});
    return () => { off = true; };
  }, [meta]);
  useEffect(() => {
    if (!field || !lut) return;
    const W = window.innerWidth < 720 ? 1024 : 2048;
    const img = renderMercator(field, lut, domain, W, W, 255);
    const c = document.createElement("canvas");
    c.width = W; c.height = W;
    c.getContext("2d")!.putImageData(img, 0, 0);
    setCanvas(c); setKey(`${layer}-${meta.date}`);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [field, lut]);

  const onHover = useCallback((h: HoverInfo | null) => {
    if (!h || !field) { setHover(null); return; }
    setHover({ ...h, value: sampleField(field, h.lon, h.lat) });
  }, [field]);

  return (
    <div className={`${styles.wrap} ${compact ? styles.compact : ""}`}>
      <div className={styles.toolbar}>
        <div className={styles.seg} role="group" aria-label="Map layer">
          <button aria-pressed={layer === "ssta"} onClick={() => setLayer("ssta")}>Temperature anomaly</button>
          <button aria-pressed={layer === "dhw"} onClick={() => setLayer("dhw")}>Coral heat stress</button>
        </div>
        <label className={styles.toggle}>
          <input type="checkbox" checked={showCurrents} onChange={(e) => setShowCurrents(e.target.checked)} />
          <span>Currents</span>
        </label>
      </div>

      <div className={styles.box}>
        <EarthMap look="satellite" projection="globe" space="dark" view={{ center: view.center, zoom: view.zoom }}
          image={canvas} imageKey={key} imageOpacity={0.9} onReady={setMap} onHover={onHover} onSelect={onHover}
          className={styles.map} ariaLabel={`Globe of ${layer === "ssta" ? "sea-surface temperature anomaly" : "coral bleaching heat stress"}, centred on the ${view.label}`} />
        <CurrentsLayer map={map} meta={currents} visible={showCurrents} />
        {hover && hover.value !== null && (
          <div className={styles.readout} style={{ left: hover.x + 14, top: hover.y + 14 }}>
            <strong className="tnum">{layer === "ssta" ? formatValue(hover.value, "°C") : `${hover.value.toFixed(1)} °C-weeks`}</strong>
            <span className="tnum">{Math.abs(hover.lat).toFixed(1)}°{hover.lat >= 0 ? "N" : "S"}, {Math.abs(hover.lon).toFixed(1)}°{hover.lon >= 0 ? "E" : "W"}</span>
          </div>
        )}
        <div className={styles.views} role="group" aria-label="Centre the globe on">
          {VIEWS.map((v) => (
            <button key={v.id} aria-pressed={view.id === v.id} onClick={() => setView(v)}>{v.label}</button>
          ))}
        </div>
      </div>

      {lut && (
        <div className={styles.legend}>
          <p className={styles.legendTitle}>
            {layer === "ssta" ? `Sea-surface temperature compared with normal, ${day(meta.date)}` : `Coral bleaching heat stress (Degree Heating Weeks), ${day(meta.date)}`}
          </p>
          <div className={styles.bar} style={{ background: lutGradient(lut) }} aria-hidden>
            {layer === "dhw" && (<><i style={{ left: `${(4 / dhw.domain) * 100}%` }} /><i style={{ left: `${(8 / dhw.domain) * 100}%` }} /></>)}
          </div>
          <div className={`${styles.ticks} tnum`}>
            {layer === "ssta"
              ? (<><span>≤ −{ssta.domain}°C colder</span><span>normal</span><span>≥ +{ssta.domain}°C warmer</span></>)
              : (<><span>0</span><span style={{ marginLeft: `${(4 / dhw.domain) * 100 - 8}%` }}>4: bleaching likely</span><span>8: severe bleaching and mortality likely</span><span>≥ {dhw.domain}</span></>)}
          </div>
        </div>
      )}

      {!compact && <section className={styles.about} aria-label="About this layer">
        {layer === "ssta" ? (
          <>
            <div>
              <h3>What it shows</h3>
              <p>How much warmer or colder the sea surface is than the 1985–2012 average for the same day, from satellite measurements blended into a daily 5 km product (shown here at 0.25°).</p>
            </div>
            <div>
              <h3>Why it matters</h3>
              <p>The warm band along the equatorial Pacific is El Niño. Large warm patches elsewhere are marine heatwaves, which bleach corals, move fish stocks and fuel heavy rain on nearby coasts. <Link href="/science/el-nino/">El Niño</Link> · <Link href="/science/coral-reefs/">coral reefs</Link></p>
            </div>
            <div>
              <h3>Source</h3>
              <p><span className="evidence evidence--obs">Observed</span> NOAA Coral Reef Watch, CoralTemp v3.1 SST anomaly. <a href={ssta.source.url}>Product page</a>. Near-coast and sea-ice pixels are less reliable.</p>
            </div>
          </>
        ) : (
          <>
            <div>
              <h3>What it shows</h3>
              <p>Heat built up over the past 12 weeks above the warmest normal month, in °C-weeks. Shown for the tropical belt where warm-water reefs grow; the map covers open ocean too.</p>
            </div>
            <div>
              <h3>Why it matters</h3>
              <p>Above 4 °C-weeks, significant bleaching is likely on reefs; above 8, severe bleaching and widespread coral death are likely. Repeated heat stress is why reefs are assessed to be crossing a tipping point. <Link href="/science/coral-reefs/">Coral reefs</Link></p>
            </div>
            <div>
              <h3>Source</h3>
              <p><span className="evidence evidence--obs">Observed</span> NOAA Coral Reef Watch, Degree Heating Weeks v3.1. <a href={dhw.source.url}>Product page</a>. Thresholds from Coral Reef Watch; local reef response varies.</p>
            </div>
          </>
        )}
      </section>}
      {showCurrents && (
        <p className={`small faint ${styles.currentsNote}`}>
          Currents: NOAA CoastWatch blended surface currents for {day(currents.date)}, from satellite sea-surface height and winds.
          Particles trace direction and relative speed, greatly speeded up; they are not water or drifting buoys.
        </p>
      )}
    </div>
  );
}
