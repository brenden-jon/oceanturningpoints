"use client";

import { useState } from "react";
import LineChart, { type Series } from "./LineChart";
import styles from "./ReefMap.module.css";
import own from "./IceSheetCities.module.css";

type Q = { p17: number; p50: number; p83: number; p95?: number };
export interface City {
  name: string; country: string; lat: number; lon: number; location: string; caveat: string | null;
  series: Record<string, [number, number, number, number][]>;
  y2050: Record<string, Q>; y2100: Record<string, Q>;
  low: Record<"2100" | "2150" | "2300", Q>;
}

/**
 * Three ways of looking at the same coast. The first two are the IPCC's medium-confidence projections, which most
 * plans use. The third is its low-confidence projection, which adds ice-sheet processes such as ice-cliff collapse
 * whose likelihood cannot be assessed: the "rapid ice loss" storyline.
 */
const LINES = [
  { id: "ssp245-medium", label: "Moderate emissions", note: "the range most plans use", color: "#8a949e" },
  { id: "ssp585-medium", label: "Very high emissions", note: "likely range", color: "#d9901e" },
  { id: "ssp585-low", label: "Very high emissions with rapid ice-sheet loss", note: "cannot be ruled out", color: "#9e1b1b" },
] as const;
const YEARS = [
  { y: 2050, max: 1 },
  { y: 2100, max: 3 },
  { y: 2150, max: 7 },
] as const;
const m = (v: number) => `${v.toFixed(1)} m`;

export default function IceSheetCities({ cities, globalLow }: { cities: City[]; globalLow: { high: number; low: number } }) {
  const [year, setYear] = useState<(typeof YEARS)[number]>(YEARS[2]);
  const [sel, setSel] = useState<City>(cities.find((c) => c.name === "New York") ?? cities[0]);
  const [long, setLong] = useState(false);
  const [hx, setHx] = useState<number | null>(null);

  const at = (c: City, id: string, y: number) => c.series[id].find((p) => p[0] === y)!;
  const rows = [...cities].sort((a, b) => at(b, "ssp585-low", year.y)[3] - at(a, "ssp585-low", year.y)[3]);
  const pct = (v: number) => `${Math.min(100, (v / year.max) * 100)}%`;
  const ticks = Array.from({ length: year.max + 1 }, (_, i) => i);

  // City detail: to 2150 for all three, or to 2300 for the rapid-loss storyline under very low and very high emissions.
  const end = long ? 2300 : 2150;
  const ser = (id: string, color: string): Series => ({
    id, color, width: id === "ssp585-low" ? 2.4 : 1.8,
    points: sel.series[id].filter((p) => p[0] <= end).map((p) => [p[0], p[2]] as [number, number]),
    band: sel.series[id].filter((p) => p[0] <= end).map((p) => [p[0], p[1], p[3]] as [number, number, number]),
  });
  const detail: Series[] = long
    ? [ser("ssp126-low", "#1f7a5a"), ser("ssp585-low", "#9e1b1b")]
    : LINES.map((l) => ser(l.id, l.color));
  const near = hx == null ? null : Math.round(hx / 10) * 10;
  const hv = (id: string) => sel.series[id].find((p) => p[0] === near);
  const hoverIds = long ? ["ssp126-low", "ssp585-low"] : LINES.map((l) => l.id);
  const name = (id: string) => (id === "ssp126-low" ? "Very low emissions, rapid ice loss" : LINES.find((l) => l.id === id)!.label);

  return (
    <div className={styles.wrap}>
      <p className={styles.headline}>
        How much higher could the sea be if the ice sheets give way faster than expected? For each city, the bars show the likely
        range under moderate and very high emissions, and the range with rapid ice-sheet loss, which the IPCC cannot rule out.
      </p>

      <div className={styles.layout}>
        <div>
          <div className={own.controls}>
            <div className={own.seg} role="group" aria-label="Year">
              {YEARS.map((y) => <button key={y.y} aria-pressed={year.y === y.y} onClick={() => setYear(y)}>{y.y}</button>)}
            </div>
            <ul className={own.legend}>
              {LINES.map((l) => <li key={l.id}><i style={{ background: l.color }} /><span><b>{l.label}</b> {l.note}</span></li>)}
            </ul>
          </div>

          <div className={own.chart} role="table" aria-label={`Sea-level rise by ${year.y}, metres, by city`}>
            <div className={own.axis} aria-hidden>
              <span />
              <div className={own.ticks}>{ticks.map((t) => <span key={t} style={{ left: pct(t) }}>{t} m</span>)}</div>
            </div>
            {rows.map((c) => (
              <button key={c.name} role="row" className={own.row} aria-pressed={c.name === sel.name} onClick={() => setSel(c)}
                aria-label={`${c.name}: ${LINES.map((l) => `${l.label} ${at(c, l.id, year.y)[1].toFixed(1)} to ${at(c, l.id, year.y)[3].toFixed(1)} m`).join("; ")}`}>
                <span className={own.name}>{c.name}</span>
                <span className={own.track}>
                  {ticks.map((t) => <i key={t} className={own.grid} style={{ left: pct(t) }} />)}
                  {LINES.map((l, k) => {
                    const v = at(c, l.id, year.y);
                    return (
                      <span key={l.id} className={own.bar} style={{ top: `${2 + k * 7}px`, left: pct(v[1]), width: `calc(${pct(v[3])} - ${pct(v[1])})`, background: l.color }}>
                        <b style={{ left: `${((v[2] - v[1]) / Math.max(0.001, v[3] - v[1])) * 100}%` }} />
                      </span>
                    );
                  })}
                </span>
                <span className={`${own.val} tnum`}>{at(c, "ssp585-low", year.y)[3].toFixed(1)}</span>
              </button>
            ))}
          </div>
          <p className="small faint" style={{ marginTop: "0.6rem" }}>
            Bars: 17th to 83rd percentile; tick: median. Right-hand number: upper end with rapid ice-sheet loss, in metres. Sorted by that value.
            Select a city for its full projection.
          </p>
        </div>

        <aside className={styles.panel} aria-live="polite">
          <p className={styles.place}>{sel.name}, {sel.country}</p>
          <dl className={styles.stats}>
            <div><dt>2100, moderate emissions</dt><dd className="tnum">{m(sel.y2100["ssp245-medium"].p50)}</dd></div>
            <div><dt>2150, very high emissions</dt><dd className="tnum">up to {m(at(sel, "ssp585-medium", 2150)[3])}</dd></div>
            <div><dt>2150, with rapid ice loss</dt><dd className="tnum" style={{ color: "#9e1b1b" }}>up to {m(sel.low["2150"].p83)}</dd></div>
          </dl>
          <div className={own.seg} role="group" aria-label="Time span">
            <button aria-pressed={!long} onClick={() => setLong(false)}>To 2150</button>
            <button aria-pressed={long} onClick={() => setLong(true)}>To 2300</button>
          </div>
          <ul className={own.legend}>
            {(long
              ? [{ id: "ssp126-low", label: "Very low emissions", note: "with rapid ice loss", color: "#1f7a5a" }, { ...LINES[2], label: "Very high emissions", note: "with rapid ice loss" }]
              : LINES
            ).map((l) => <li key={l.id}><i style={{ background: l.color }} /><span><b>{l.label}</b> {l.note}</span></li>)}
          </ul>
          <LineChart ariaLabel={`Projected sea-level rise at ${sel.name} to ${end}`} height={230}
            x={[2020, end]} y={long ? [0, 20] : [0, 7]} xTicks={long ? [2050, 2100, 2150, 2200, 2250, 2300] : [2050, 2100, 2150]}
            yTicks={long ? [0, 5, 10, 15, 20] : [0, 1, 2, 3, 4, 5, 6, 7]} yLabel="metres" yFormat={(v) => v.toFixed(0)}
            series={detail} onHoverX={setHx} hoverX={hx}
            hoverText={near && hv(hoverIds[hoverIds.length - 1]) ? `${near}: ${hoverIds.map((id) => `${name(id)} ${hv(id)?.[2].toFixed(1)} m (up to ${hv(id)?.[3].toFixed(1)})`).join(" · ")}` : "Lines: medians. Shading: 17th to 83rd percentile."} />
          {long ? (
            <p className={own.compare}>
              By 2300, with rapid ice loss, the median here is <b>{m(sel.low["2300"].p50)}</b> under very high emissions and{" "}
              <b>{m(sel.series["ssp126-low"].find((p) => p[0] === 2300)![2])}</b> under very low emissions. Globally the medians are{" "}
              {m(globalLow.high)} and {m(globalLow.low)}: cutting emissions is what keeps the long-term rise manageable.
            </p>
          ) : (
            <p className={own.compare}>
              By 2150 the likely range under very high emissions reaches <b>{m(at(sel, "ssp585-medium", 2150)[3])}</b>. If the ice sheets
              give way faster, the rise could reach <b>{m(sel.low["2150"].p83)}</b>. Defences, ports and districts built today will
              still stand then.
            </p>
          )}
          <p className="small faint">
            Relative to 1995–2014, including local land movement measured at the gauge. Location used: {sel.location}. Rapid ice loss is
            the IPCC’s low-confidence projection: processes such as ice-cliff collapse that it could not rule out, but whose likelihood it
            could not assess.
          </p>
          {sel.caveat === "subsidence" && <p className={own.caveat}>Land here is also sinking because of groundwater pumping and sediment compaction, which these values do not fully capture.</p>}
          {sel.caveat === "gauge-subsidence" && <p className={own.caveat}>The tide gauge here recorded rapid subsidence in the 20th century, which the projection carries forward. How fast the land sinks in future depends on how groundwater and sediment are managed.</p>}
        </aside>
      </div>
    </div>
  );
}
