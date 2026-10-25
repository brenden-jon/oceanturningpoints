"use client";

import dynamic from "next/dynamic";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { HoverInfo, Overlay } from "./EarthMap";
import LineChart from "./LineChart";
import styles from "./ReefMap.module.css";
import own from "./SeaLevelCities.module.css";

const EarthMap = dynamic(() => import("./EarthMap"), { ssr: false });

type Q = { p17: number; p50: number; p83: number; p95?: number };
export interface City {
  name: string; country: string; lat: number; lon: number; location: string; caveat: string | null;
  series: Record<string, [number, number, number, number][]>;
  y2050: Record<string, Q>; y2100: Record<string, Q>;
  floods?: { station: string; km: number } & Record<string, number | "capped" | string>;
}

const SCEN = [
  { id: "ssp126-medium", label: "Very low emissions (SSP1-2.6)", color: "#1f7a5a" },
  { id: "ssp245-medium", label: "Intermediate (SSP2-4.5)", color: "#0a62b8" },
  { id: "ssp585-medium", label: "Very high (SSP5-8.5)", color: "#b24a2a" },
];
const BINS = [
  { max: 0.55, color: "#c6dbef", label: "under 0.55 m" },
  { max: 0.7, color: "#6baed6", label: "0.55–0.7 m" },
  { max: 0.9, color: "#2171b5", label: "0.7–0.9 m" },
  { max: Infinity, color: "#08306b", label: "0.9 m or more" },
];
const colour = (v: number) => (BINS.find((b) => v < b.max) ?? BINS[3]).color;

function every(af: number | "capped" | string | undefined) {
  if (af === undefined) return null;
  if (af === "capped" || (typeof af === "number" && af >= 100)) return "at least once a year";
  const yrs = 100 / (af as number);
  return yrs >= 2 ? `about every ${Math.round(yrs)} years` : "about every year or two";
}

export default function SeaLevelCities({ cities }: { cities: City[] }) {
  const [sel, setSel] = useState<City>(cities.find((c) => c.name === "Lagos") ?? cities[0]);
  const [hx, setHx] = useState<number | null>(null);
  const boxRef = useRef<HTMLDivElement>(null);
  const [zoom, setZoom] = useState(0.8);
  useEffect(() => {
    if (!boxRef.current) return;
    const ro = new ResizeObserver(([e]) => { const w = e.contentRect.width; if (w > 0) setZoom(Math.max(0, Math.log2(w / 512))); });
    ro.observe(boxRef.current);
    return () => ro.disconnect();
  }, []);

  const overlays: Overlay[] = useMemo(() => [{
    id: "cities", kind: "point", color: "#16191d", width: 0.8,
    data: { type: "FeatureCollection", features: cities.map((c) => ({ type: "Feature",
      properties: { color: colour(c.y2100["ssp245-medium"].p50), r: c.name === sel.name ? 2.6 : 1.9 },
      geometry: { type: "Point", coordinates: [c.lon, c.lat] } })) },
  }], [cities, sel]);

  const onSelect = useCallback((h: HoverInfo) => {
    let best = cities[0], bd = Infinity;
    for (const c of cities) { const dl = ((c.lon - h.lon + 540) % 360) - 180; const d = dl * dl + (c.lat - h.lat) ** 2; if (d < bd) { bd = d; best = c; } }
    if (bd < 100) setSel(best);
  }, [cities]);

  const y = sel.y2100, f = sel.floods;
  const yMax = Math.max(1.5, Math.ceil(Math.max(...SCEN.map((s) => Math.max(...sel.series[s.id].map((p) => p[3])))) * 2) / 2);
  const near = hx == null ? null : Math.round(hx / 10) * 10;
  const at = (id: string) => sel.series[id].find((p) => p[0] === near);

  return (
    <div className={styles.wrap}>
      <p className={styles.headline}>
        Projected rise in sea level by 2100 at sixteen coastal cities in developing countries, under intermediate emissions. Select a
        city to see its range under different emissions and how often today’s rare floods would occur.
      </p>
      <div className={styles.layout}>
        <div className={styles.mapCol}>
          <div className={styles.mapBox} ref={boxRef}>
            <EarthMap look="data" projection="mercator" view={{ center: [40, 8], zoom }} overlays={overlays} onSelect={onSelect}
              className={styles.map} ariaLabel="Map of coastal cities coloured by projected sea-level rise by 2100. Select a city for details." />
          </div>
          <ul className={styles.legend}>
            {BINS.map((b) => <li key={b.label}><i style={{ background: b.color }} />{b.label} by 2100 (intermediate emissions)</li>)}
          </ul>
          <div className={own.picker} role="group" aria-label="Choose a city">
            {cities.map((c) => <button key={c.name} aria-pressed={c.name === sel.name} onClick={() => setSel(c)}>{c.name}</button>)}
          </div>
        </div>

        <aside className={styles.panel} aria-live="polite">
          <p className={styles.place}>{sel.name}, {sel.country}</p>
          <dl className={styles.stats}>
            <div><dt>2100, intermediate</dt><dd className="tnum">{y["ssp245-medium"].p50.toFixed(2)} m</dd></div>
            <div><dt>2100, very high</dt><dd className="tnum">{y["ssp585-medium"].p50.toFixed(2)} m</dd></div>
            <div><dt>Plausible worst case, 2100</dt><dd className="tnum">{y["ssp585-low"].p95?.toFixed(1)} m</dd></div>
          </dl>
          <p className="small faint">
            Medians, relative to 1995–2014. Likely range under intermediate emissions: {y["ssp245-medium"].p17.toFixed(2)}–{y["ssp245-medium"].p83.toFixed(2)} m.
            The plausible worst case is the 95th percentile of the IPCC’s low-likelihood, high-impact storyline with rapid ice-sheet loss.
          </p>
          <LineChart ariaLabel={`Projected sea-level rise at ${sel.name}, 2020 to 2150`} height={220}
            x={[2020, 2150]} y={[0, yMax]} xTicks={[2050, 2100, 2150]} yTicks={Array.from({ length: Math.round(yMax / 0.5) + 1 }, (_, i) => i * 0.5)}
            yLabel="metres" yFormat={(v) => v.toFixed(1)}
            series={SCEN.map((s) => ({ id: s.id, color: s.color, width: 2, points: sel.series[s.id].map((p) => [p[0], p[2]] as [number, number]),
              band: sel.series[s.id].map((p) => [p[0], p[1], p[3]] as [number, number, number]) }))}
            onHoverX={setHx} hoverX={hx}
            hoverText={near && at("ssp245-medium") ? `${near}: ${SCEN.map((s) => `${s.label.split(" (")[0]} ${at(s.id)?.[2].toFixed(2)} m`).join(" · ")}` : "Lines: medians. Shading: likely range (17–83%)."} />
          <ul className={own.key}>{SCEN.map((s) => <li key={s.id}><i style={{ background: s.color }} />{s.label}</li>)}</ul>
          {f ? (
            <p className={own.flood}>
              <b>Today’s 1-in-100-year flood</b> (at {f.station}, {f.km} km) would occur {every(f["ssp245-2050"])} by 2050 and{" "}
              {every(f["ssp245-2100"])} by 2100 under intermediate emissions.
            </p>
          ) : (
            <p className="small faint">No tide gauge within 100 km has flood-frequency estimates in the IPCC data set.</p>
          )}
          <p className="small faint">Location used: {sel.location}.</p>
          {sel.caveat === "subsidence" && <p className={own.caveat}>Land here is also sinking because of groundwater pumping and sediment compaction, which these IPCC values do not fully capture. Local relative sea-level rise is likely to be considerably higher.</p>}
          {sel.caveat === "gauge-subsidence" && <p className={own.caveat}>The tide gauge here recorded rapid subsidence in the 20th century, which the projection carries forward. How fast the land sinks in future depends on how groundwater is managed.</p>}
        </aside>
      </div>
    </div>
  );
}
