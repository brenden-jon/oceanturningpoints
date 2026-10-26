/**
 * Gridded scientific fields in the browser.
 *
 * Each layer arrives as an 8-bit greyscale PNG on a regular 0.5° grid
 * (rows north to south), with decoding metadata from the pipeline:
 *   pixel 0      -> no data
 *   pixel 1..255 -> vmin + (p - 1) / 254 * (vmax - vmin)
 *
 * We decode it once into a Float32Array of physical values. That single
 * array drives both the colour rendering and the hover read-outs, so what a
 * visitor sees and what they can query are always the same numbers.
 */

export interface GridSpec {
  lat0: number; lat1: number; lon0: number; lon1: number;
  res: number; w: number; h: number;
}

export interface EncodedLayer { file: string; vmin: number; vmax: number; step: number }

export interface Field {
  grid: GridSpec;
  values: Float32Array; // row-major, row 0 = northernmost latitude
}

export type Lut = number[][]; // 256 x [r, g, b]

const cache = new Map<string, Promise<Field>>();

export function loadField(url: string, layer: EncodedLayer, grid: GridSpec): Promise<Field> {
  const key = url;
  const hit = cache.get(key);
  if (hit) return hit;
  const p = (async () => {
    const res = await fetch(url);
    if (!res.ok) throw new Error(`Could not load ${url} (${res.status})`);
    const bitmap = await createImageBitmap(await res.blob(), { colorSpaceConversion: "none", premultiplyAlpha: "none" });
    const canvas = document.createElement("canvas");
    canvas.width = bitmap.width;
    canvas.height = bitmap.height;
    const ctx = canvas.getContext("2d", { willReadFrequently: true })!;
    ctx.drawImage(bitmap, 0, 0);
    const px = ctx.getImageData(0, 0, bitmap.width, bitmap.height).data;
    const n = bitmap.width * bitmap.height;
    const values = new Float32Array(n);
    const span = layer.vmax - layer.vmin;
    for (let i = 0; i < n; i++) {
      const q = px[i * 4];
      values[i] = q === 0 ? NaN : layer.vmin + ((q - 1) / 254) * span;
    }
    return { grid, values };
  })();
  cache.set(key, p);
  p.catch(() => cache.delete(key));
  return p;
}

/** Bilinear sample at a longitude/latitude. Returns null over missing data. */
export function sampleField(f: Field, lon: number, lat: number): number | null {
  const { grid: g, values } = f;
  let L = lon;
  while (L < g.lon0) L += 360;
  while (L > g.lon1) L -= 360;
  const x = (L - g.lon0) / g.res;
  const y = (g.lat1 - lat) / g.res; // row 0 is the northern edge
  if (y < 0 || y > g.h - 1) return null;
  const x0 = Math.floor(x), y0 = Math.floor(y);
  const x1 = Math.min(x0 + 1, g.w - 1), y1 = Math.min(y0 + 1, g.h - 1);
  const fx = x - x0, fy = y - y0;
  const v00 = values[y0 * g.w + x0], v10 = values[y0 * g.w + x1];
  const v01 = values[y1 * g.w + x0], v11 = values[y1 * g.w + x1];
  if (![v00, v10, v01, v11].every(Number.isFinite)) {
    const nearest = values[Math.round(y) * g.w + Math.round(x)];
    return Number.isFinite(nearest) ? nearest : null;
  }
  return (v00 * (1 - fx) + v10 * fx) * (1 - fy) + (v01 * (1 - fx) + v11 * fx) * fy;
}

export const MERCATOR_MAX_LAT = 85.05112878;

/**
 * Colour a field into an image whose rows are spaced in Web Mercator.
 *
 * MapLibre maps an image source onto the map linearly in Mercator
 * coordinates, so an equirectangular grid placed directly would put every
 * feature at the wrong latitude (badly so at high latitudes). We therefore
 * resample row by row: each output row is a Mercator y, converted back to the
 * latitude whose data it should show.
 */
export function renderMercator(
  f: Field,
  lut: Lut,
  domain: [number, number],
  width = 1440,
  height = 1440,
  alpha = 255,
  fadeLow = false,
): ImageData {
  const img = new ImageData(width, height);
  const out = img.data;
  const [d0, d1] = domain;
  const span = d1 - d0;
  const yMax = Math.PI; // Mercator y at 85.0511°
  for (let r = 0; r < height; r++) {
    const ym = yMax - (2 * yMax * (r + 0.5)) / height;
    const lat = (2 * Math.atan(Math.exp(ym)) - Math.PI / 2) * (180 / Math.PI);
    for (let c = 0; c < width; c++) {
      const lon = -180 + (360 * (c + 0.5)) / width;
      const v = sampleField(f, lon, lat);
      const o = (r * width + c) * 4;
      if (v === null) { out[o + 3] = 0; continue; }
      let t = (v - d0) / span;
      t = t < 0 ? 0 : t > 1 ? 1 : t;
      const rgb = lut[Math.round(t * (lut.length - 1))];
      out[o] = rgb[0]; out[o + 1] = rgb[1]; out[o + 2] = rgb[2];
      out[o + 3] = fadeLow ? Math.round(alpha * (0.45 + 0.55 * t)) : alpha;
    }
  }
  return img;
}

/** CSS gradient for a legend bar, sampled from the same lookup table. */
export function lutGradient(lut: Lut, stops = 24): string {
  const parts: string[] = [];
  for (let i = 0; i <= stops; i++) {
    const rgb = lut[Math.round((i / stops) * (lut.length - 1))];
    parts.push(`rgb(${rgb[0]},${rgb[1]},${rgb[2]}) ${((i / stops) * 100).toFixed(1)}%`);
  }
  return `linear-gradient(90deg, ${parts.join(", ")})`;
}

export function formatValue(v: number, units: string, signed = true, fixedDigits?: number): string {
  const abs = Math.abs(v);
  const digits = fixedDigits ?? (units === "days" || units === "%" || abs >= 20 ? 0 : 1);
  const s = v.toFixed(digits);
  const clean = s === "-0.0" || s === "-0" ? s.slice(1) : s;
  const sign = signed && v > 0 && clean !== "0" && clean !== "0.0" ? "+" : "";
  const minus = clean.startsWith("-") ? "−" + clean.slice(1) : clean;
  return `${sign}${minus}${units === "days" ? " days" : units === "%" ? "%" : ` ${units}`}`;
}
