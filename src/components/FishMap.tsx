"use client";

import dynamic from "next/dynamic";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { asset } from "@/lib/site";
import type { HoverInfo, Overlay } from "./EarthMap";
import styles from "./ReefMap.module.css";

const EarthMap = dynamic(() => import("./EarthMap"), { ssr: false });

type Key = "ssp126_2050" | "ssp585_2050" | "ssp126_2100" | "ssp585_2100";
interface Props { name: string; continent: string; ssp126_2050: number; ssp585_2050: number; ssp126_2100: number; ssp585_2100: number;
  agree_ssp126_2100: number | null; agree_ssp585_2100: number | null }
type FC = GeoJSON.FeatureCollection<GeoJSON.Geometry, Props>;

// Diverging scale: losses in warm browns and reds, gains in blue (ColorBrewer RdBu-based).
const BINS = [
  { max: -30, color: "#8c1d18", label: "−30% or more" },
  { max: -20, color: "#c8452c", label: "−20 to −30%" },
  { max: -10, color: "#ec8a5e", label: "−10 to −20%" },
  { max: -3, color: "#f7c8a8", label: "−3 to −10%" },
  { max: 3, color: "#eeeeee", label: "−3 to +3%" },
  { max: Infinity, color: "#5a9bd0", label: "+3% or more" },
];
const colour = (v: number | null | undefined) => (v == null ? "#dddddd" : (BINS.find((b) => v < b.max) ?? BINS[BINS.length - 1]).color);
const pct = (v: number | null | undefined) => (v == null ? "–" : `${v > 0 ? "+" : v < 0 ? "−" : ""}${Math.abs(v).toFixed(0)}%`);

export default function FishMap() {
  const [shapes, setShapes] = useState<FC | null>(null);
  const [points, setPoints] = useState<FC | null>(null);
  const [scen, setScen] = useState<"ssp126" | "ssp585">("ssp585");
  const [year, setYear] = useState<"2050" | "2100">("2100");
  const [sel, setSel] = useState<Props | null>(null);
  const [hover, setHover] = useState<Props | null>(null);
  const boxRef = useRef<HTMLDivElement>(null);
  const [zoom, setZoom] = useState(0.9);
  useEffect(() => {
    if (!boxRef.current) return;
    const ro = new ResizeObserver(([e]) => { const w = e.contentRect.width; if (w > 0) setZoom(Math.max(0, Math.log2(w / 512))); });
    ro.observe(boxRef.current);
    return () => ro.disconnect();
  }, [shapes]);
  useEffect(() => {
    fetch(asset("/data/fish/countries.geojson")).then((r) => r.json()).then((d: FC) => {
      setShapes(d);
      setSel(d.features.find((f) => f.properties.name === "Senegal")?.properties ?? null);
    }).catch(() => {});
    fetch(asset("/data/fish/points.geojson")).then((r) => r.json()).then(setPoints).catch(() => {});
  }, []);
  const key = `${scen}_${year}` as Key;

  const overlays: Overlay[] = useMemo(() => {
    if (!shapes) return [];
    const paint = (fc: FC) => ({ ...fc, features: fc.features.map((f) => ({ ...f, properties: { ...f.properties, color: colour(f.properties[key]), r: 1.3 } })) });
    const out: Overlay[] = [{ id: "fish", kind: "fill", color: "#ffffff", opacity: 0.92, data: paint(shapes) as GeoJSON.FeatureCollection }];
    if (points) out.push({ id: "fishpts", kind: "point", color: "#5b6670", width: 0.8, data: paint(points) as GeoJSON.FeatureCollection });
    return out;
  }, [shapes, points, key]);

  const onHover = useCallback((h: HoverInfo | null) => setHover((h?.props as Props | undefined) ?? null), []);
  const onSelect = useCallback((h: HoverInfo) => { if (h.props?.name) setSel(h.props as unknown as Props); }, []);

  if (!shapes) return <div className={styles.placeholder} />;
  const show = hover ?? sel;
  return (
    <div className={styles.wrap}>
      <div className={styles.toolbar}>
        <div className={styles.seg} role="group" aria-label="Emissions">
          <button aria-pressed={scen === "ssp126"} onClick={() => setScen("ssp126")}>Low emissions</button>
          <button aria-pressed={scen === "ssp585"} onClick={() => setScen("ssp585")}>Very high emissions</button>
        </div>
        <div className={styles.seg} role="group" aria-label="Period">
          <button aria-pressed={year === "2050"} onClick={() => setYear("2050")}>2040s</button>
          <button aria-pressed={year === "2100"} onClick={() => setYear("2100")}>2090s</button>
        </div>
      </div>
      <p className={styles.headline}>
        Projected change in the fish that each country’s waters can hold, {year === "2050" ? "in the 2040s" : "in the 2090s"}, under{" "}
        {scen === "ssp126" ? "low" : "very high"} emissions. Select a country for its numbers.
      </p>
      <div className={styles.layout}>
        <div className={styles.mapCol}>
          <div className={styles.mapBox} ref={boxRef}>
            <EarthMap look="data" projection="mercator" view={{ center: [20, 5], zoom }} overlays={overlays} onHover={onHover} onSelect={onSelect}
              className={styles.map} ariaLabel="Map of countries coloured by projected change in fish biomass in their waters. Select a country for details." />
          </div>
          <ul className={styles.legend} aria-label="Legend">
            {BINS.map((b) => <li key={b.label}><i style={{ background: b.color, borderRadius: 2 }} />{b.label}</li>)}
          </ul>
        </div>
        <aside className={styles.panel} aria-live="polite">
          {show && (<>
            <p className={styles.place}>{show.name}</p>
            <dl className={styles.stats}>
              <div><dt>2090s, very high emissions</dt><dd className="tnum">{pct(show.ssp585_2100)}</dd></div>
              <div><dt>2090s, low emissions</dt><dd className="tnum">{pct(show.ssp126_2100)}</dd></div>
              <div><dt>2040s, very high</dt><dd className="tnum">{pct(show.ssp585_2050)}</dd></div>
            </dl>
            <p className="small faint">
              Change in exploitable fish biomass in national waters relative to 2005–2014, ensemble mean of the FishMIP models, without
              fishing.{show.agree_ssp585_2100 != null && ` Under very high emissions, ${show.agree_ssp585_2100.toFixed(0)}% of models agree on the direction of change by the 2090s.`}
            </p>
          </>)}
          <p className="small faint">
            <span className="evidence evidence--model">Projection</span> Blanchard and Novaglio (eds) (2024), FAO Fisheries and Aquaculture
            Technical Paper 707, <a href="https://doi.org/10.4060/cd1379en">doi:10.4060/cd1379en</a>; data <a href="https://doi.org/10.5281/zenodo.13988998">doi:10.5281/zenodo.13988998</a>.
            Colours are drawn on each country’s land area for readability; the values refer to its marine waters. Small island states are
            also shown as dots.
          </p>
        </aside>
      </div>
    </div>
  );
}
