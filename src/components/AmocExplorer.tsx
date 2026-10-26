"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import EarthMap, { type HoverInfo, type Overlay } from "./EarthMap";
import {
  formatValue, loadField, lutGradient, MERCATOR_MAX_LAT, renderMercator, sampleField,
  type EncodedLayer, type Field, type GridSpec, type Lut,
} from "@/lib/field";
import { asset } from "@/lib/site";
import styles from "./AmocExplorer.module.css";

/* ------------------------------------------------------------------ types */

interface Scenario { label: string; warming: string; amoc: string; amocSv: number | null; freshwaterSv: number; run: string }
interface Comparison { id: string; a: string; b: string; clean: boolean; title: string; subtitle: string; isolates: string; caveat?: string }
interface Variable { id: string; var: string; label: string; detail: string; units: string; scale: "temperature" | "days"; domain: number }
interface TempPlace { name: string; country: string; lat: number; lon: number; region: string; values: Record<string, Record<string, number | null>> }
interface TempManifest {
  source: Record<string, string>; grid: GridSpec; scenarios: Record<string, Scenario>;
  comparisons: Comparison[]; variables: Variable[];
  layers: (EncodedLayer & { variable: string; comparison: string })[];
  places: TempPlace[]; seaIce: string;
}
interface RainPlace { name: string; country: string; lat: number; lon: number; region: string;
  rain: Record<string, { mean: number | null; perModel: Record<string, number | null> }> }
interface RainManifest {
  source: Record<string, string | string[]>; grid: GridSpec; domain: number;
  seasons: Record<string, string>;
  layers: { season: string; mean: EncodedLayer; agreement: EncodedLayer }[];
  places: RainPlace[];
}
interface Scales { temperature: { lut: Lut }; days: { lut: Lut }; rainfall: { lut: Lut } }

type Family = "temperature" | "rainfall";
interface State {
  family: Family; variable: string; comparison: string; season: string;
  region: string; projection: "globe" | "mercator"; ice: boolean;
}

/* ------------------------------------------------------------- constants */

const REGIONS: Record<string, { label: string; center: [number, number]; zoom: number; places: string[] }> = {
  atlantic: { label: "Atlantic world", center: [-22, 24], zoom: 1.45, places: ["europe", "africa", "americas"] },
  europe: { label: "Europe", center: [8, 53], zoom: 3.1, places: ["europe"] },
  westafrica: { label: "West Africa & Sahel", center: [-2, 12], zoom: 3.3, places: ["africa"] },
  southasia: { label: "South Asia", center: [80, 21], zoom: 3.2, places: ["asia"] },
  americas: { label: "Americas", center: [-72, 8], zoom: 2.15, places: ["americas"] },
  global: { label: "Whole Earth", center: [10, 10], zoom: 1.05, places: ["europe", "africa", "asia", "americas"] },
};

const MOMENTS: { id: string; label: string; question: string; state: Partial<State> }[] = [
  { id: "winters", label: "Europe’s winters", question: "Why could Europe have colder winters in a warming world?",
    state: { family: "temperature", variable: "winter", comparison: "total-2c-collapse", region: "europe", ice: true } },
  { id: "extremes", label: "The coldest days", question: "How cold could a once-a-decade winter day become?",
    state: { family: "temperature", variable: "cold-extreme", comparison: "total-2c-collapse", region: "europe", ice: false } },
  { id: "sahel", label: "West Africa’s rains", question: "What happens to the West African monsoon?",
    state: { family: "rainfall", season: "jja", region: "westafrica" } },
  { id: "monsoon", label: "The Indian monsoon", question: "Does the Indian summer monsoon weaken?",
    state: { family: "rainfall", season: "jja", region: "southasia" } },
  { id: "seesaw", label: "A shifting balance", question: "Why does the south warm while the north cools?",
    state: { family: "temperature", variable: "annual", comparison: "effect-pi", region: "global", ice: false } },
];

export const EXPLORER_EVENT = "otp:amoc-view";

const DEFAULT: State = { family: "temperature", variable: "winter", comparison: "total-2c-collapse", season: "jja", region: "atlantic", projection: "globe", ice: true };

/* ----------------------------------------------------------- url state */

function readUrl(search?: string): Partial<State> {
  if (typeof window === "undefined") return {};
  const q = new URLSearchParams(search ?? window.location.search);
  const s: Partial<State> = {};
  const f = q.get("show"); if (f === "temperature" || f === "rainfall") s.family = f;
  const v = q.get("var"); if (v) s.variable = v;
  const c = q.get("compare"); if (c) s.comparison = c;
  const se = q.get("season"); if (se) s.season = se;
  const r = q.get("region"); if (r && REGIONS[r]) s.region = r;
  const p = q.get("view"); if (p === "flat") s.projection = "mercator"; else if (p === "globe") s.projection = "globe";
  const i = q.get("ice"); if (i === "1") s.ice = true; else if (i === "0") s.ice = false;
  return s;
}

function writeUrl(s: State) {
  const q = new URLSearchParams();
  q.set("show", s.family);
  if (s.family === "temperature") { q.set("var", s.variable); q.set("compare", s.comparison); q.set("ice", s.ice ? "1" : "0"); }
  else q.set("season", s.season);
  q.set("region", s.region);
  q.set("view", s.projection === "globe" ? "globe" : "flat");
  window.history.replaceState(null, "", `${window.location.pathname}?${q.toString()}`);
}

/* ------------------------------------------------------------ component */

export default function AmocExplorer() {
  const [temp, setTemp] = useState<TempManifest | null>(null);
  const [rain, setRain] = useState<RainManifest | null>(null);
  const [scales, setScales] = useState<Scales | null>(null);
  const [ice, setIce] = useState<GeoJSON.FeatureCollection | null>(null);
  const [state, setState] = useState<State>(DEFAULT);
  const [field, setField] = useState<Field | null>(null);
  const [agreement, setAgreement] = useState<Field | null>(null);
  const [canvas, setCanvas] = useState<HTMLCanvasElement | null>(null);
  const [imageKey, setImageKey] = useState("");
  const [hover, setHover] = useState<(HoverInfo & { value: number | null; agree: number | null }) | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [narrow, setNarrow] = useState(false);

  // ---- load manifests once, then adopt any state in the URL
  useEffect(() => {
    Promise.all([
      fetch(asset("/data/amoc/temperature/manifest.json")).then((r) => r.json()),
      fetch(asset("/data/amoc/rainfall/manifest.json")).then((r) => r.json()),
      fetch(asset("/data/scales.json")).then((r) => r.json()),
    ]).then(([t, r, s]) => {
      setTemp(t); setRain(r); setScales(s);
      fetch(asset(`/data/amoc/temperature/${t.seaIce}`)).then((x) => x.json()).then(setIce).catch(() => {});
      setState((prev) => ({ ...prev, ...readUrl() }));
    }).catch(() => setError("The scenario data could not be loaded. Please try reloading the page."));
    const mq = window.matchMedia("(max-width: 720px)");
    const upd = () => setNarrow(mq.matches);
    upd(); mq.addEventListener("change", upd);
    return () => mq.removeEventListener("change", upd);
  }, []);

  useEffect(() => { if (temp) writeUrl(state); }, [state, temp]);

  // Links elsewhere on the page (see ExplorerLink) can set the view directly.
  useEffect(() => {
    const on = (e: Event) => setState((prev) => ({ ...prev, ...readUrl((e as CustomEvent<string>).detail) }));
    window.addEventListener(EXPLORER_EVENT, on);
    return () => window.removeEventListener(EXPLORER_EVENT, on);
  }, []);

  const variable = temp?.variables.find((v) => v.id === state.variable) ?? temp?.variables[0];
  const comparison = temp?.comparisons.find((c) => c.id === state.comparison) ?? temp?.comparisons[0];

  // ---- load the active field(s)
  useEffect(() => {
    if (!temp || !rain) return;
    let cancelled = false;
    (async () => {
      try {
        if (state.family === "temperature" && variable && comparison) {
          const L = temp.layers.find((l) => l.variable === variable.id && l.comparison === comparison.id)!;
          const f = await loadField(asset(`/data/amoc/temperature/${L.file}`), L, temp.grid);
          if (!cancelled) { setField(f); setAgreement(null); }
        } else {
          const L = rain.layers.find((l) => l.season === state.season) ?? rain.layers[0];
          const [f, a] = await Promise.all([
            loadField(asset(`/data/amoc/rainfall/${L.mean.file}`), L.mean, rain.grid),
            loadField(asset(`/data/amoc/rainfall/${L.agreement.file}`), L.agreement, rain.grid),
          ]);
          if (!cancelled) { setField(f); setAgreement(a); }
        }
      } catch {
        if (!cancelled) setError("This layer could not be loaded.");
      }
    })();
    return () => { cancelled = true; };
  }, [temp, rain, state.family, variable, comparison, state.season]);

  // ---- colour it, Mercator-spaced, with model-agreement stippling for rainfall
  const lut: Lut | null = scales ? (state.family === "rainfall" ? scales.rainfall.lut : variable?.scale === "days" ? scales.days.lut : scales.temperature.lut) : null;
  const domainHalf = state.family === "rainfall" ? rain?.domain ?? 50 : variable?.domain ?? 10;

  useEffect(() => {
    if (!field || !lut) return;
    const W = narrow ? 900 : 1440, H = W;
    const img = renderMercator(field, lut, [-domainHalf, domainHalf], W, H);
    const c = document.createElement("canvas");
    c.width = W; c.height = H;
    const ctx = c.getContext("2d")!;
    ctx.putImageData(img, 0, 0);
    if (agreement) {
      // A dot wherever all four models agree on the direction of change.
      ctx.fillStyle = "rgba(21, 54, 71, 0.55)";
      const step = 2.5;
      const yOf = (lat: number) => {
        const ym = Math.log(Math.tan(Math.PI / 4 + (lat * Math.PI) / 360));
        return ((Math.PI - ym) / (2 * Math.PI)) * H;
      };
      for (let lat = -60; lat <= 70; lat += step) {
        for (let lon = -180 + step / 2; lon < 180; lon += step) {
          const n = sampleField(agreement, lon, lat);
          const v = sampleField(field, lon, lat);
          if (n !== null && v !== null && Math.round(n) >= 4) {
            ctx.beginPath();
            ctx.arc(((lon + 180) / 360) * W, yOf(lat), W / 1440 * 1.35, 0, Math.PI * 2);
            ctx.fill();
          }
        }
      }
    }
    setCanvas(c);
    setImageKey(`${state.family}-${variable?.id}-${comparison?.id}-${state.season}-${W}-${Math.random()}`);
  }, [field, agreement, lut, domainHalf, narrow, state.family, variable?.id, comparison?.id, state.season]);

  // ---- overlays
  const overlays: Overlay[] = useMemo(() => {
    const out: Overlay[] = [];
    if (state.family === "temperature" && state.ice && ice && comparison) {
      const pick = (s: string) => ({ type: "FeatureCollection" as const, features: ice.features.filter((f) => f.properties?.scenario === s) });
      out.push({ id: "ice-ref", kind: "line", data: pick(comparison.b), color: "#153647", width: 1.2, dash: [2, 2], opacity: 0.75 });
      out.push({ id: "ice-scn", kind: "line", data: pick(comparison.a), color: "#ffffff", width: 2.2, opacity: 0.95 });
    }
    const places = (state.family === "temperature" ? temp?.places : rain?.places) ?? [];
    const regions = REGIONS[state.region].places;
    out.push({ id: "places", kind: "point", color: "#153647",
      data: { type: "FeatureCollection", features: places.filter((p) => regions.includes(p.region)).map((p) => ({
        type: "Feature", properties: { name: p.name }, geometry: { type: "Point", coordinates: [p.lon, p.lat] } })) } });
    return out;
  }, [state.family, state.ice, state.region, ice, comparison, temp, rain]);

  // ---- hover read-out
  const onHover = useCallback((h: HoverInfo | null) => {
    if (!h || !field || Math.abs(h.lat) > MERCATOR_MAX_LAT) { setHover(null); return; }
    setHover({ ...h, value: sampleField(field, h.lon, h.lat), agree: agreement ? sampleField(agreement, h.lon, h.lat) : null });
  }, [field, agreement]);

  const set = (patch: Partial<State>) => setState((s) => ({ ...s, ...patch }));
  const region = REGIONS[state.region];
  const view = useMemo(() => ({ center: region.center, zoom: region.zoom - (narrow ? 0.7 : 0) }), [region, narrow]);
  const activeMoment = MOMENTS.find((m) => Object.entries(m.state).every(([k, v]) => (state as unknown as Record<string, unknown>)[k] === v));

  if (error) return <p className="aside-note aside-note--caveat">{error}</p>;

  const units = state.family === "rainfall" ? "%" : variable?.units ?? "";
  const legendLabel = state.family === "rainfall"
    ? `${rain?.seasons[state.season] ?? ""} rainfall, change in the collapsed state (4-model mean)`
    : `${variable?.label ?? ""}: ${comparison?.title ?? ""}`;

  return (
    <div className={styles.explorer}>
      {/* guided moments */}
      <div className={styles.moments} role="tablist" aria-label="Guided views">
        {MOMENTS.map((m) => (
          <button key={m.id} role="tab" aria-selected={activeMoment?.id === m.id}
            className={`${styles.moment} ${activeMoment?.id === m.id ? styles.momentOn : ""}`}
            onClick={() => set(m.state)}>
            <span className={styles.momentLabel}>{m.label}</span>
            <span className={styles.momentQ}>{m.question}</span>
          </button>
        ))}
      </div>

      <div className={styles.stage}>
        {/* controls */}
        <aside className={styles.controls} aria-label="Map controls">
          <fieldset className={`${styles.group} ${styles.full}`}>
            <legend className="label">Show</legend>
            <div className={styles.seg}>
              {(["temperature", "rainfall"] as Family[]).map((f) => (
                <button key={f} aria-pressed={state.family === f} onClick={() => set({ family: f })}>
                  {f === "temperature" ? "Temperature" : "Rainfall"}
                </button>
              ))}
            </div>
          </fieldset>

          {state.family === "temperature" && temp && (
            <>
              <fieldset className={styles.group}>
                <legend className="label">Measure</legend>
                <div className={styles.list}>
                  {temp.variables.map((v) => (
                    <button key={v.id} aria-pressed={state.variable === v.id} onClick={() => set({ variable: v.id })}>{v.label}</button>
                  ))}
                </div>
                <select className={styles.select} aria-label="Measure" value={state.variable} onChange={(e) => set({ variable: e.target.value })}>
                  {temp.variables.map((v) => <option key={v.id} value={v.id}>{v.label}</option>)}
                </select>
              </fieldset>
              <fieldset className={`${styles.group} ${styles.full}`}>
                <legend className="label">Compare</legend>
                <div className={styles.list}>
                  {temp.comparisons.map((c) => (
                    <button key={c.id} aria-pressed={state.comparison === c.id} onClick={() => set({ comparison: c.id })}>
                      <span>{c.title}</span>
                      {!c.clean && <span className={styles.flag} title="See the note under the map">note</span>}
                    </button>
                  ))}
                </div>
                <select className={styles.select} aria-label="Compare" value={state.comparison} onChange={(e) => set({ comparison: e.target.value })}>
                  {temp.comparisons.map((c) => <option key={c.id} value={c.id}>{c.title}{c.clean ? "" : " (see note)"}</option>)}
                </select>
              </fieldset>
              <label className={styles.toggle}>
                <input type="checkbox" checked={state.ice} onChange={(e) => set({ ice: e.target.checked })} />
                <span>March sea-ice edge</span>
              </label>
            </>
          )}

          {state.family === "rainfall" && rain && (
            <fieldset className={styles.group}>
              <legend className="label">Season</legend>
              <div className={styles.list}>
                {Object.entries(rain.seasons).map(([k, label]) => (
                  <button key={k} aria-pressed={state.season === k} onClick={() => set({ season: k })}>{label}</button>
                ))}
              </div>
              <select className={styles.select} aria-label="Season" value={state.season} onChange={(e) => set({ season: e.target.value })}>
                {Object.entries(rain.seasons).map(([k, label]) => <option key={k} value={k}>{label as string}</option>)}
              </select>
            </fieldset>
          )}

          <fieldset className={styles.group}>
            <legend className="label">Region</legend>
            <div className={styles.list}>
              {Object.entries(REGIONS).map(([k, r]) => (
                <button key={k} aria-pressed={state.region === k} onClick={() => set({ region: k })}>{r.label}</button>
              ))}
            </div>
            <select className={styles.select} aria-label="Region" value={state.region} onChange={(e) => set({ region: e.target.value })}>
              {Object.entries(REGIONS).map(([k, r]) => <option key={k} value={k}>{r.label}</option>)}
            </select>
          </fieldset>

          <fieldset className={styles.group}>
            <legend className="label">View</legend>
            <div className={styles.seg}>
              <button aria-pressed={state.projection === "globe"} onClick={() => set({ projection: "globe" })}>Globe</button>
              <button aria-pressed={state.projection === "mercator"} onClick={() => set({ projection: "mercator" })}>Flat map</button>
            </div>
          </fieldset>
        </aside>

        {/* map */}
        <figure className={styles.figure}>
          <div className={styles.mapBox}>
            <EarthMap
              look="data"
              projection={state.projection}
              view={view}
              image={canvas}
              imageKey={imageKey}
              overlays={overlays}
              onHover={onHover}
              onSelect={onHover}
              className={styles.map}
              ariaLabel={`Map: ${legendLabel}`}
            />
            {hover && hover.value !== null && (
              <div className={styles.readout} style={{ left: Math.min(hover.x + 14, 9999), top: hover.y + 14 }} aria-live="polite">
                <strong className="tnum">{formatValue(hover.value, units)}</strong>
                {hover.agree !== null
                  ? <span>{Math.round(hover.agree)} of 4 models agree on the direction</span>
                  : <span>One model (CESM), 100-year average</span>}
                <span className="tnum">{Math.abs(hover.lat).toFixed(1)}°{hover.lat >= 0 ? "N" : "S"}, {Math.abs(hover.lon).toFixed(1)}°{hover.lon >= 0 ? "E" : "W"}</span>
              </div>
            )}
          </div>

          {/* legend */}
          {lut && (
            <figcaption className={styles.legend}>
              <p className={styles.legendTitle}>{legendLabel}</p>
              <div className={styles.bar} style={{ background: lutGradient(lut) }} aria-hidden />
              <div className={`${styles.ticks} tnum`}>
                <span>≤ {formatValue(-domainHalf, units, true, 0)}</span>
                <span>{state.family === "rainfall" ? "no change" : "0"}</span>
                <span>≥ {formatValue(domainHalf, units, true, 0)}</span>
              </div>
              {state.family === "rainfall" ? (
                <p className={styles.legendNote}>
                  <span className={styles.dot} aria-hidden /> Dots mark places where all four models agree on the direction of change.
                  Blank areas are too dry for a percentage change to be meaningful.
                </p>
              ) : (
                <p className={styles.legendNote}>
                  {comparison?.subtitle}. {state.ice && <>White line: March sea-ice edge in the scenario; dashed: in the reference.</>}
                </p>
              )}
            </figcaption>
          )}

          <SourcePanel family={state.family} variable={variable} comparison={comparison} temp={temp} rain={rain} />

          <ShareLink />

          {state.family === "temperature" && comparison && !comparison.clean && comparison.caveat && (
            <p className="aside-note aside-note--caveat">{comparison.caveat}</p>
          )}
        </figure>
      </div>

      {/* places */}
      <Places state={state} temp={temp} rain={rain} variable={variable} comparison={comparison} />
    </div>
  );
}

/* --------------------------------------------------------- source panel */

const EXTREMES = new Set(["cold-extreme", "hot-extreme", "frost-days"]);

function SourcePanel({ family, variable, comparison, temp, rain }: {
  family: Family; variable?: Variable; comparison?: Comparison; temp: TempManifest | null; rain: RainManifest | null;
}) {
  if (family === "temperature" && temp && variable && comparison) {
    const a = temp.scenarios[comparison.a], b = temp.scenarios[comparison.b];
    return (
      <section className={styles.source} aria-label="Where this map comes from">
        <div>
          <h3>What the map shows</h3>
          <p>
            {variable.label} in “{a.label}” minus “{b.label}”. Each state is a 100-year average from one climate model,
            CESM 1.0.5, in which the circulation was made to collapse by adding fresh water to the North Atlantic.
            {EXTREMES.has(variable.id) && " Extremes are once-in-ten-year values estimated by the authors from extreme-value fits."}
          </p>
        </div>
        <div>
          <h3>How reliable it is</h3>
          <dl className={styles.reliability}>
            <dt>Direction of change</dt>
            <dd><b className={styles.high}>High confidence.</b> Climate models consistently show cooling around the North Atlantic after a collapse, strongest in winter.</dd>
            <dt>Size of change</dt>
            <dd><b className={styles.medium}>Model-dependent.</b> Other models cool Europe by different amounts; much depends on how far winter sea ice spreads.{EXTREMES.has(variable.id) && " Extremes are less certain than averages."}</dd>
            <dt>Timing</dt>
            <dd><b className={styles.low}>Not addressed.</b> This is an experiment, not a forecast of when, or whether, a collapse will occur.</dd>
          </dl>
        </div>
        <div>
          <h3>Source</h3>
          <p>
            van Westen &amp; Baatsen (2025), <a href="https://doi.org/10.1029/2025GL114611"><i>Geophysical Research Letters</i></a>.
            Data: <a href="https://doi.org/10.5281/zenodo.15490235">Zenodo</a>, CC BY 4.0. <a href="#data">Full method</a>
          </p>
        </div>
      </section>
    );
  }
  if (family === "rainfall" && rain) {
    const models = (rain.source.models as string[]) ?? [];
    return (
      <section className={styles.source} aria-label="Where this map comes from">
        <div>
          <h3>What the map shows</h3>
          <p>
            Percentage change in rainfall after the circulation has collapsed, compared with each model’s own pre-industrial
            climate, averaged over {models.length} independent climate models ({models.join(", ")}). The models have no
            greenhouse warming added, so the map isolates the effect of the collapse.
          </p>
        </div>
        <div>
          <h3>How reliable it is</h3>
          <dl className={styles.reliability}>
            <dt>Direction of change</dt>
            <dd><b className={styles.high}>Strong where dotted.</b> Dots mark places where all {models.length} models agree on wetter or drier, including the West African and Indian monsoon regions.</dd>
            <dt>Size of change</dt>
            <dd><b className={styles.low}>Uncertain.</b> Models differ two- to fivefold in how much rainfall changes; the table below gives each one.</dd>
            <dt>Timing</dt>
            <dd><b className={styles.low}>Not addressed.</b> These are idealised experiments, not forecasts.</dd>
          </dl>
        </div>
        <div>
          <h3>Source</h3>
          <p>
            Method: Ben-Yami et al. (2024), <a href="https://doi.org/10.1029/2023EF003959"><i>Earth’s Future</i></a>. Data: NAHosMIP,{" "}
            <a href="https://doi.org/10.5281/zenodo.14884357">Zenodo</a>, CC BY 4.0. <a href="#data">Full method and checks</a>
          </p>
        </div>
      </section>
    );
  }
  return null;
}

/* ----------------------------------------------------------- share link */

function ShareLink() {
  const [done, setDone] = useState(false);
  const copy = async () => {
    try { await navigator.clipboard.writeText(window.location.href); setDone(true); setTimeout(() => setDone(false), 2200); }
    catch { /* clipboard unavailable: the address bar already holds the link */ }
  };
  return (
    <p className={styles.share}>
      <button type="button" onClick={copy} className={styles.shareBtn}>{done ? "Link copied" : "Copy a link to this view"}</button>
      <span className="small muted">The address keeps the map, measure and region you chose.</span>
    </p>
  );
}

/* --------------------------------------------------------------- places */

function Places({ state, temp, rain, variable, comparison }: {
  state: State; temp: TempManifest | null; rain: RainManifest | null; variable?: Variable; comparison?: Comparison;
}) {
  const regions = REGIONS[state.region].places;
  if (state.family === "temperature" && temp && variable && comparison) {
    const rows = temp.places.filter((p) => regions.includes(p.region));
    const a = temp.scenarios[comparison.a], b = temp.scenarios[comparison.b];
    return (
      <section className={styles.places} aria-labelledby="places-h">
        <h3 id="places-h" className={styles.placesH}>{variable.label} at named places</h3>
        <p className="small muted">{variable.detail}. Each value comes from the model grid cell containing the place, about 200 km across, so it describes the region around it.</p>
        <div className={styles.tableWrap}>
          <table className={`${styles.table} tnum`}>
            <thead><tr><th>Place</th><th>{b.label}</th><th>{a.label}</th><th>Change</th></tr></thead>
            <tbody>
              {rows.map((p) => {
                const vb = p.values[variable.id]?.[comparison.b], va = p.values[variable.id]?.[comparison.a];
                const d = va !== null && vb !== null && va !== undefined && vb !== undefined ? va - vb : null;
                return (
                  <tr key={p.name}>
                    <th scope="row">{p.name}<span>{p.country}</span></th>
                    <td>{vb === null || vb === undefined ? "—" : formatValue(vb, variable.units, false)}</td>
                    <td>{va === null || va === undefined ? "—" : formatValue(va, variable.units, false)}</td>
                    <td className={d !== null && d < 0 ? styles.neg : styles.pos}>{d === null ? "—" : formatValue(d, variable.units)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>
    );
  }
  if (state.family === "rainfall" && rain) {
    const rows = rain.places.filter((p) => regions.includes(p.region));
    const models = (rain.source.models as string[]) ?? [];
    return (
      <section className={styles.places} aria-labelledby="places-h">
        <h3 id="places-h" className={styles.placesH}>{rain.seasons[state.season]} rainfall at named places</h3>
        <p className="small muted">Change in the collapsed-AMOC state relative to each model’s pre-industrial control. Each model’s value is shown so the range is visible. “n/a”: at least one model is too dry here for a percentage change to be meaningful.</p>
        <div className={styles.tableWrap}>
          <table className={`${styles.table} tnum`}>
            <thead><tr><th>Place</th><th>4-model mean</th>{models.map((m) => <th key={m}>{m.replace("-GC31-MM", "").replace("-CM6A-LR", "")}</th>)}</tr></thead>
            <tbody>
              {rows.map((p) => {
                const r = p.rain[state.season];
                return (
                  <tr key={p.name}>
                    <th scope="row">{p.name}<span>{p.country}</span></th>
                    <td className={r.mean !== null && r.mean < 0 ? styles.dry : styles.wet}>{r.mean === null ? "n/a" : formatValue(r.mean, "%")}</td>
                    {models.map((m) => <td key={m} className={styles.model}>{r.perModel[m] === null ? "—" : formatValue(r.perModel[m]!, "%")}</td>)}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>
    );
  }
  return null;
}
