"use client";

import dynamic from "next/dynamic";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { HoverInfo, Overlay } from "./EarthMap";
import LineChart from "./LineChart";
import styles from "./ReefMap.module.css";
import own from "./IceSheetCities.module.css";

const EarthMap = dynamic(() => import("./EarthMap"), { ssr: false });

type Q = { p17: number; p50: number; p83: number; p95?: number };
export interface City {
  name: string; country: string; lat: number; lon: number; location: string; caveat: string | null;
  series: Record<string, [number, number, number, number][]>;
  y2050: Record<string, Q>; y2100: Record<string, Q>;
  low: Record<"2100" | "2150" | "2300", Q>;
}

/** The IPCC's low-confidence projections: they add ice-sheet processes, such as ice-cliff collapse, whose likelihood cannot be assessed. */
const STORY = [
  { id: "ssp126-low", label: "Very low emissions", color: "#1f7a5a" },
  { id: "ssp585-low", label: "Very high emissions", color: "#b24a2a" },
];
const BINS = [
  { max: 5.5, color: "#c6dbef", label: "under 5.5 m" },
  { max: 6, color: "#6baed6", label: "5.5–6 m" },
  { max: 7, color: "#2171b5", label: "6–7 m" },
  { max: Infinity, color: "#08306b", label: "7 m or more" },
];
const colour = (v: number) => (BINS.find((b) => v < b.max) ?? BINS[3]).color;
const m = (v: number) => `${v < 10 ? v.toFixed(1) : Math.round(v)} m`;

export default function IceSheetCities({ cities, globalLow }: { cities: City[]; globalLow: { high: number; low: number } }) {
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
      properties: { color: colour(c.low["2300"].p50), r: c.name === sel.name ? 2.6 : 1.9 },
      geometry: { type: "Point", coordinates: [c.lon, c.lat] } })) },
  }], [cities, sel]);

  const onSelect = useCallback((h: HoverInfo) => {
    let best = cities[0], bd = Infinity;
    for (const c of cities) { const dl = ((c.lon - h.lon + 540) % 360) - 180; const d = dl * dl + (c.lat - h.lat) ** 2; if (d < bd) { bd = d; best = c; } }
    if (bd < 100) setSel(best);
  }, [cities]);

  const lo = sel.series["ssp126-low"].find((p) => p[0] === 2300)!;
  const near = hx == null ? null : Math.round(hx / 10) * 10;
  const at = (id: string) => sel.series[id].find((p) => p[0] === near);
  const likely = sel.series["ssp585-medium"];

  return (
    <div className={styles.wrap}>
      <p className={styles.headline}>
        If the ice sheets destabilise, how high could the sea rise at sixteen exposed coasts? Colours show the median rise by 2300 in
        the IPCC’s projection that includes rapid ice-sheet loss, under very high emissions. Select a city to compare it with very low
        emissions.
      </p>
      <div className={styles.layout}>
        <div className={styles.mapCol}>
          <div className={styles.mapBox} ref={boxRef}>
            <EarthMap look="data" projection="mercator" view={{ center: [40, 8], zoom }} overlays={overlays} onSelect={onSelect}
              className={styles.map} ariaLabel="Map of coastal cities coloured by sea-level rise by 2300 if ice sheets destabilise. Select a city for details." />
          </div>
          <ul className={styles.legend}>
            {BINS.map((b) => <li key={b.label}><i style={{ background: b.color }} />{b.label} by 2300</li>)}
          </ul>
          <div className={own.picker} role="group" aria-label="Choose a city">
            {cities.map((c) => <button key={c.name} aria-pressed={c.name === sel.name} onClick={() => setSel(c)}>{c.name}</button>)}
          </div>
        </div>

        <aside className={styles.panel} aria-live="polite">
          <p className={styles.place}>{sel.name}, {sel.country}</p>
          <dl className={styles.stats}>
            <div><dt>2100, likely range, very high emissions</dt><dd className="tnum">{sel.y2100["ssp585-medium"].p17.toFixed(1)}–{sel.y2100["ssp585-medium"].p83.toFixed(1)} m</dd></div>
            <div><dt>2150 with rapid ice loss</dt><dd className="tnum">up to {m(sel.low["2150"].p83)}</dd></div>
            <div><dt>2300 with rapid ice loss</dt><dd className="tnum">{m(sel.low["2300"].p50)}</dd></div>
          </dl>
          <LineChart ariaLabel={`Projected sea-level rise at ${sel.name} to 2300, with rapid ice-sheet loss, under very low and very high emissions`} height={230}
            x={[2020, 2300]} y={[0, 20]} xTicks={[2050, 2100, 2150, 2200, 2250, 2300]} yTicks={[0, 5, 10, 15, 20]}
            yLabel="metres" yFormat={(v) => v.toFixed(0)}
            series={[
              ...STORY.map((s) => ({ id: s.id, color: s.color, width: 2, points: sel.series[s.id].map((p) => [p[0], p[2]] as [number, number]),
                band: sel.series[s.id].map((p) => [p[0], p[1], p[3]] as [number, number, number]) })),
              { id: "likely", color: "#16191d", width: 1.2, dash: "3 3", points: likely.map((p) => [p[0], p[3]] as [number, number]) },
            ]}
            onHoverX={setHx} hoverX={hx}
            hoverText={near && at("ssp585-low") ? `${near}: ${STORY.map((s) => `${s.label} ${at(s.id)?.[2].toFixed(1)} m (to ${at(s.id)?.[3].toFixed(1)} m)`).join(" · ")}` : "Lines: medians. Shading: 17–83% range."} />
          <ul className={own.key}>
            {STORY.map((s) => <li key={s.id}><i style={{ background: s.color }} />{s.label}, with rapid ice loss</li>)}
            <li><i style={{ background: "#16191d", height: 1 }} />Upper likely value without it, very high emissions, to 2150</li>
          </ul>
          <p className={own.compare}>
            By 2300 the median is <b>{m(sel.low["2300"].p50)}</b> under very high emissions and <b>{m(lo[2])}</b> under very low emissions.
            Globally the medians are {m(globalLow.high)} and {m(globalLow.low)}. Most of the difference comes from the ice sheets.
          </p>
          <p className="small faint">
            Relative to 1995–2014. These are the IPCC’s low-confidence projections, which include ice-sheet processes it could not rule
            out but whose likelihood it could not assess. Location used: {sel.location}.
          </p>
          {sel.caveat === "subsidence" && <p className={own.caveat}>Land here is also sinking because of groundwater pumping and sediment compaction, which these values do not fully capture.</p>}
          {sel.caveat === "gauge-subsidence" && <p className={own.caveat}>The tide gauge here recorded rapid subsidence in the 20th century, which the projection carries forward. How fast the land sinks in future depends on how groundwater is managed.</p>}
        </aside>
      </div>
    </div>
  );
}
