/**
 * Build-time access to the AMOC data manifests, so that numbers quoted in the
 * page text come from exactly the same files the maps draw. Nothing here is
 * typed in by hand.
 */
import fs from "node:fs";
import path from "node:path";

const DATA = path.join(process.cwd(), "public", "data", "amoc");
const read = (p: string) => JSON.parse(fs.readFileSync(path.join(DATA, p), "utf8"));

type Scn = "pi_on" | "pi_off" | "rcp45_on" | "rcp45_off" | "rcp85_off";

export interface TempManifest {
  source: Record<string, string>;
  scenarios: Record<Scn, { label: string; warming: string; amoc: string; amocSv: number | null; freshwaterSv: number; run: string }>;
  comparisons: { id: string; a: Scn; b: Scn; clean: boolean; title: string; subtitle: string; isolates: string; caveat?: string }[];
  variables: { id: string; label: string; detail: string; units: string; domain: number }[];
  places: { name: string; country: string; region: string; values: Record<string, Record<Scn, number | null>> }[];
}
export interface RainManifest {
  source: Record<string, string | string[]>;
  places: { name: string; country: string; region: string; rain: Record<string, { mean: number | null; perModel: Record<string, number | null> }> }[];
  validation: Record<string, { ensembleMeanOfPercent: number; perModel: Record<string, number>; published: number }>;
}
export interface SeriesFile {
  rapid: { start: string; end: string; mean: number; annual: [number, number, number][] };
  hysteresis: { freshwaterAtThatYear: number | null };
  scenarioRuns: { runs: Record<string, { mean2400to2499: number; freshwater: number }> };
}

export const temp = (): TempManifest => read("temperature/manifest.json");
export const rain = (): RainManifest => read("rainfall/manifest.json");
export const series = (): SeriesFile => read("series.json");

export function tempAt(name: string, variable: string, scn: Scn): number {
  const p = temp().places.find((x) => x.name === name);
  const v = p?.values[variable]?.[scn];
  if (v === null || v === undefined) throw new Error(`no ${variable}/${scn} value for ${name}`);
  return v;
}

export function rainAt(name: string, season: string) {
  const p = rain().places.find((x) => x.name === name);
  const r = p?.rain[season];
  if (!r || r.mean === null) throw new Error(`no ${season} rainfall value for ${name}`);
  const per = Object.values(r.perModel).filter((v): v is number => v !== null);
  return { mean: r.mean, min: Math.min(...per), max: Math.max(...per) };
}

/** Typographic number: unicode minus, fixed digits. */
export function num(v: number, digits = 0, signed = false): string {
  const s = Math.abs(v).toFixed(digits);
  if (s === (0).toFixed(digits)) return s;
  return `${v < 0 ? "−" : signed ? "+" : ""}${s}`;
}
