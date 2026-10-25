"use client";

import type { Map as MLMap } from "maplibre-gl";
import { useEffect, useRef } from "react";
import { asset } from "@/lib/site";

/**
 * Surface currents drawn as moving particles.
 *
 * Each particle is carried by NOAA's measured daily current field: at every
 * frame it looks up the velocity at its position and moves accordingly, leaving
 * a fading trail. Direction and relative speed therefore come from the data.
 * The particles are a way of drawing a vector field; they are not water parcels
 * or drifters, and their on-screen speed is greatly accelerated.
 */

export interface CurrentsMeta {
  file: string;
  date: string;
  grid: { lat0: number; lon0: number; res: number; h: number; w: number };
  encoding: { clip: number };
}

interface Field { u: Float32Array; v: Float32Array; ok: Uint8Array; meta: CurrentsMeta }

let cache: Promise<Field> | null = null;
function loadField(meta: CurrentsMeta): Promise<Field> {
  cache ??= (async () => {
    const res = await fetch(asset(`/data/now/${meta.file}`));
    const bmp = await createImageBitmap(await res.blob(), { colorSpaceConversion: "none", premultiplyAlpha: "none" });
    const c = document.createElement("canvas");
    c.width = bmp.width; c.height = bmp.height;
    const ctx = c.getContext("2d", { willReadFrequently: true })!;
    ctx.drawImage(bmp, 0, 0);
    const px = ctx.getImageData(0, 0, bmp.width, bmp.height).data;
    const n = bmp.width * bmp.height, k = meta.encoding.clip;
    const u = new Float32Array(n), v = new Float32Array(n), ok = new Uint8Array(n);
    for (let i = 0; i < n; i++) {
      ok[i] = px[i * 4 + 3] > 127 ? 1 : 0;
      u[i] = -k + (px[i * 4] / 255) * 2 * k;
      v[i] = -k + (px[i * 4 + 1] / 255) * 2 * k;
    }
    return { u, v, ok, meta };
  })();
  cache.catch(() => { cache = null; });
  return cache;
}

const COUNT_PER_MPX = 5200;   // particles per million screen pixels
const MAX_AGE = 220;          // frames before a particle is respawned
const PX_PER_MS = 1.6;        // screen pixels per frame for a 1 m/s current

export default function CurrentsLayer({ map, meta, visible = true, color = "light" }: {
  map: MLMap | null; meta: CurrentsMeta | null; visible?: boolean; color?: "light" | "dark";
}) {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas || !map || !meta || !visible) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    let raf = 0, alive = true;

    loadField(meta).then((f) => {
      if (!alive) return;
      const { grid: g } = f.meta;

      const sample = (lat: number, lon: number): [number, number] | null => {
        let L = lon;
        while (L < g.lon0) L += 360;
        while (L >= g.lon0 + g.w * g.res) L -= 360;
        const y = (g.lat0 - lat) / g.res, x = (L - g.lon0) / g.res;
        const i0 = Math.floor(y), j0 = Math.floor(x), fy = y - i0, fx = x - j0;
        let su = 0, sv = 0, sw = 0;
        for (const [di, dj, w] of [[0, 0, (1 - fy) * (1 - fx)], [0, 1, (1 - fy) * fx], [1, 0, fy * (1 - fx)], [1, 1, fy * fx]] as const) {
          const i = i0 + di, j = (j0 + dj + g.w) % g.w;
          if (i < 0 || i >= g.h || w <= 0) continue;
          const k = i * g.w + j;
          if (!f.ok[k]) continue;
          su += f.u[k] * w; sv += f.v[k] * w; sw += w;
        }
        return sw < 0.5 ? null : [su / sw, sv / sw];
      };

      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      let W = 0, H = 0;
      const resize = () => {
        const r = map.getContainer().getBoundingClientRect();
        W = r.width; H = r.height;
        canvas.width = Math.floor(W * dpr); canvas.height = Math.floor(H * dpr);
        canvas.style.width = `${W}px`; canvas.style.height = `${H}px`;
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      };
      resize();

      // Visible hemisphere on a globe: angular distance from the view centre.
      const facing = (lon: number, lat: number) => {
        if (map.getProjection?.()?.type !== "globe") return true;
        const c = map.getCenter(), r = Math.PI / 180;
        return Math.sin(c.lat * r) * Math.sin(lat * r) + Math.cos(c.lat * r) * Math.cos(lat * r) * Math.cos((lon - c.lng) * r) > 0.08;
      };

      type P = { lon: number; lat: number; age: number };
      const ps: P[] = [];
      const spawn = (p: P) => {
        for (let t = 0; t < 25; t++) {
          const pt = map.unproject([Math.random() * W, Math.random() * H]);
          if (!pt || Math.abs(pt.lat) > 80) continue;
          if (sample(pt.lat, pt.lng) && facing(pt.lng, pt.lat)) { p.lon = pt.lng; p.lat = pt.lat; p.age = Math.floor(Math.random() * MAX_AGE); return; }
        }
        p.age = MAX_AGE;
      };
      const target = () => Math.round((W * H / 1e6) * COUNT_PER_MPX);
      const fill = () => { while (ps.length < target()) { const p = { lon: 0, lat: 0, age: 0 }; spawn(p); ps.push(p); } ps.length = Math.min(ps.length, target()); };
      fill();

      const rgb = color === "light" ? "235,245,255" : "16,48,84";
      const step = () => {
        if (!alive || !map.getContainer()?.isConnected) return; // map was removed (page change)
        ctx.globalCompositeOperation = "destination-out";
        ctx.fillStyle = "rgba(0,0,0,0.035)";
        ctx.fillRect(0, 0, W, H);
        ctx.globalCompositeOperation = "source-over";
        ctx.lineWidth = 0.9;
        ctx.lineCap = "round";
        const degPerPx = 360 / (512 * Math.pow(2, map.getZoom()));
        const k = PX_PER_MS * degPerPx;
        for (const p of ps) {
          if (++p.age > MAX_AGE) { spawn(p); continue; }
          const vel = sample(p.lat, p.lon);
          if (!vel) { spawn(p); continue; }
          const speed = Math.hypot(vel[0], vel[1]);
          const cosLat = Math.max(Math.cos((p.lat * Math.PI) / 180), 0.2);
          const nLon = p.lon + (vel[0] * k) / cosLat, nLat = p.lat + vel[1] * k;
          if (facing(p.lon, p.lat) && facing(nLon, nLat)) {
            const a = map.project([p.lon, p.lat]), b = map.project([nLon, nLat]);
            const dx = b.x - a.x, dy = b.y - a.y;
            if (dx * dx + dy * dy < 400) {
              // Weak flow fades back so the major currents read first.
              const s = Math.min(speed / 0.6, 1);
              ctx.strokeStyle = `rgba(${rgb},${0.06 + 0.84 * Math.pow(s, 0.8)})`;
              ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.stroke();
            }
          } else { spawn(p); continue; }
          p.lon = nLon; p.lat = nLat;
        }
        raf = requestAnimationFrame(step);
      };

      const clear = () => ctx.clearRect(0, 0, W, H);
      const onResize = () => { resize(); fill(); };
      map.on("movestart", clear);
      map.on("resize", onResize);

      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
        for (let i = 0; i < 40; i++) step();
        cancelAnimationFrame(raf);
      } else {
        raf = requestAnimationFrame(step);
      }

      const cleanup = () => {
        cancelAnimationFrame(raf);
        try { map.off("movestart", clear); map.off("resize", onResize); } catch { /* map already removed */ }
        clear();
      };
      (canvas as HTMLCanvasElement & { _cleanup?: () => void })._cleanup = cleanup;
    }).catch(() => {});

    return () => {
      alive = false;
      (canvas as HTMLCanvasElement & { _cleanup?: () => void })._cleanup?.();
    };
  }, [map, meta, visible, color]);

  if (!visible) return null;
  return <canvas ref={ref} aria-hidden style={{ position: "absolute", inset: 0, pointerEvents: "none", zIndex: 2 }} />;
}
