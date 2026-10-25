"use client";

import maplibregl, { type Map as MLMap, type StyleSpecification } from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import { useEffect, useRef, useState } from "react";
import { MERCATOR_MAX_LAT } from "@/lib/field";
import { asset } from "@/lib/site";

/**
 * The Earth, as a globe or a flat map.
 *
 * Two looks share one component:
 *   - "satellite": NASA Blue Marble imagery, for the planetary view.
 *   - "data": a quiet base of coastlines and borders under a scientific
 *     field rendered by the caller (see lib/field.ts).
 * The page around the map is always light; only the Earth itself is dark.
 */

export interface Overlay {
  id: string;
  data: GeoJSON.FeatureCollection;
  kind: "line" | "point";
  color: string;
  width?: number;
  dash?: number[];
  opacity?: number;
  label?: string;
}

export interface HoverInfo { lon: number; lat: number; x: number; y: number }

interface Props {
  look: "satellite" | "night" | "data";
  projection?: "globe" | "mercator";
  view: { center: [number, number]; zoom: number };
  image?: HTMLCanvasElement | null;   // a rendered field, Mercator-spaced
  imageKey?: string;                   // changes whenever the image content changes
  imageOpacity?: number;
  overlays?: Overlay[];
  interactive?: boolean;
  spin?: boolean;
  onHover?: (h: HoverInfo | null) => void;
  onSelect?: (h: HoverInfo) => void;
  onReady?: (map: MLMap) => void;   // gives overlays (e.g. currents) access to the map
  space?: "light" | "dark";          // colour around the globe: page white, or night sky
  raster?: { id: string; tiles: string[]; attribution: string; opacity?: number } | null; // e.g. a map service drawn above the field
  className?: string;
  ariaLabel: string;
}

const PAPER = "#ffffff";
const IMAGE_COORDS: [[number, number], [number, number], [number, number], [number, number]] = [
  [-180, MERCATOR_MAX_LAT], [180, MERCATOR_MAX_LAT], [180, -MERCATOR_MAX_LAT], [-180, -MERCATOR_MAX_LAT],
];

function baseStyle(look: Props["look"], projection: "globe" | "mercator"): StyleSpecification {
  const style: StyleSpecification = {
    version: 8,
    projection: { type: projection },
    sources: {
      coast110: { type: "geojson", data: asset("/data/geo/coastline_110m.geojson") },
      coast50: { type: "geojson", data: asset("/data/geo/coastline_50m.geojson") },
      borders: { type: "geojson", data: asset("/data/geo/borders_50m.geojson") },
    },
    // On the globe the background paints the planet's surface, so the satellite
    // look starts as a deep-ocean sphere while imagery tiles load.
    layers: [{ id: "space", type: "background", paint: { "background-color": look === "data" ? PAPER : look === "night" ? "#05080d" : "#0f2c4f" } }],
  };

  if (look === "satellite") {
    style.sources.marble = {
      type: "raster",
      tiles: ["https://gibs.earthdata.nasa.gov/wmts/epsg3857/best/BlueMarble_ShadedRelief_Bathymetry/default/GoogleMapsCompatible_Level8/{z}/{y}/{x}.jpg"],
      tileSize: 256,
      maxzoom: 8,
      attribution: 'Imagery: <a href="https://earthobservatory.nasa.gov/features/BlueMarble">NASA Blue Marble</a> via GIBS',
    };
    style.layers.push({ id: "marble", type: "raster", source: "marble", paint: { "raster-saturation": -0.05, "raster-fade-duration": 300 } });
  } else if (look === "night") {
    style.sources.night = {
      type: "raster",
      tiles: ["https://gibs.earthdata.nasa.gov/wmts/epsg3857/best/VIIRS_Black_Marble/default/2016-01-01/GoogleMapsCompatible_Level8/{z}/{y}/{x}.png"],
      tileSize: 256,
      maxzoom: 8,
      attribution: 'Night lights: <a href="https://earthobservatory.nasa.gov/features/NightLights">NASA Black Marble 2016</a> via GIBS',
    };
    style.layers.push({ id: "night", type: "raster", source: "night", paint: { "raster-fade-duration": 300 } });
  } else {
    // A plain, pale ocean so the scientific field carries all the colour.
    style.layers.push({ id: "sea", type: "background", paint: { "background-color": "#eef3f3" } });
  }
  return style;
}

function addLines(map: MLMap, look: Props["look"]) {
  const ink = look === "data" ? "#153647" : "rgba(255,255,255,0.35)";
  map.addLayer({ id: "borders", type: "line", source: "borders",
    paint: { "line-color": ink, "line-width": 0.4, "line-opacity": look === "data" ? 0.28 : look === "night" ? 0.35 : 0 } });
  map.addLayer({ id: "coast110", type: "line", source: "coast110", maxzoom: 3,
    paint: { "line-color": ink, "line-width": 0.7, "line-opacity": look === "data" ? 0.7 : 0 } });
  map.addLayer({ id: "coast50", type: "line", source: "coast50", minzoom: 3,
    paint: { "line-color": ink, "line-width": 0.8, "line-opacity": look === "data" ? 0.75 : 0 } });
}

function applySky(map: MLMap, projection: "globe" | "mercator", space: "light" | "dark" = "light") {
  if (projection !== "globe") return;
  if (space === "dark") {
    map.setSky({ "sky-color": "#060b12", "horizon-color": "#1d3a5c", "fog-color": "#060b12", "sky-horizon-blend": 0.5,
      "horizon-fog-blend": 0.6, "fog-ground-blend": 0, "atmosphere-blend": ["interpolate", ["linear"], ["zoom"], 0, 1, 3, 0.5, 6, 0] });
    return;
  }
  // A thin, pale-blue limb. fog-ground-blend stays at zero: higher values
  // wash the fog colour over the planet's surface instead of only its edge.
  map.setSky({
    "sky-color": PAPER,
    "horizon-color": "#d6e6f2",
    "fog-color": PAPER,
    "sky-horizon-blend": 0.6,
    "horizon-fog-blend": 0.5,
    "fog-ground-blend": 0,
    "atmosphere-blend": ["interpolate", ["linear"], ["zoom"], 0, 0.85, 3, 0.4, 6, 0],
  });
}

export default function EarthMap({
  look, projection = "globe", view, image, imageKey, imageOpacity = 0.92, overlays = [],
  interactive = true, spin = false, onHover, onSelect, onReady, space = "light", raster = null, className, ariaLabel,
}: Props) {
  const el = useRef<HTMLDivElement>(null);
  const mapRef = useRef<MLMap | null>(null);
  const [ready, setReady] = useState(false);
  const touched = useRef(false);

  // ---- create once
  useEffect(() => {
    if (!el.current || mapRef.current) return;
    const map = new maplibregl.Map({
      container: el.current,
      style: baseStyle(look, projection),
      center: view.center,
      zoom: view.zoom,
      minZoom: 0,
      maxZoom: 7,
      interactive,
      scrollZoom: interactive,
      // In a long article, plain scrolling should scroll the page; zooming
      // needs Ctrl/Cmd + scroll (or two fingers on touch screens).
      cooperativeGestures: interactive,
      dragRotate: false,
      pitchWithRotate: false,
      attributionControl: { compact: true },
      renderWorldCopies: false,
    });
    if (interactive) map.addControl(new maplibregl.NavigationControl({ showCompass: false }), "bottom-right");
    for (const ev of ["mousedown", "touchstart", "wheel"] as const) map.on(ev, () => { touched.current = true; });

    // Readiness is polled as well as awaited: with a warm cache the style can
    // finish loading before a 'load' listener attaches, and the event is not
    // replayed. Polling waits rather than forcing readiness on a timer.
    let done = false;
    const markReady = () => {
      if (done) return;
      done = true;
      addLines(map, look);
      applySky(map, projection, space);
      mapRef.current = map;
      setReady(true);
      onReady?.(map);
    };
    map.on("load", markReady);
    const poll = (n = 0) => { if (done) return; if (map.isStyleLoaded()) markReady(); else setTimeout(() => poll(n + 1), Math.min(1000, 120 + n * 60)); };
    poll();

    return () => { map.remove(); mapRef.current = null; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ---- projection switch
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !ready) return;
    map.setProjection({ type: projection });
    applySky(map, projection, space);
  }, [projection, ready]);

  // ---- camera
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !ready) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    map.easeTo({ center: view.center, zoom: view.zoom, duration: reduce ? 0 : 1100 });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [view.center[0], view.center[1], view.zoom, ready]);

  // ---- the scientific field
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !ready) return;
    const src = map.getSource("field") as maplibregl.ImageSource | undefined;
    if (!image) {
      if (map.getLayer("field")) map.removeLayer("field");
      if (src) map.removeSource("field");
      return;
    }
    const url = image.toDataURL("image/png");
    if (src) {
      src.updateImage({ url, coordinates: IMAGE_COORDS });
    } else {
      map.addSource("field", { type: "image", url, coordinates: IMAGE_COORDS });
      map.addLayer({ id: "field", type: "raster", source: "field",
        paint: { "raster-opacity": imageOpacity, "raster-fade-duration": 0, "raster-resampling": "linear" } },
        "borders");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [imageKey, ready]);

  useEffect(() => {
    const map = mapRef.current;
    if (map && ready && map.getLayer("field")) map.setPaintProperty("field", "raster-opacity", imageOpacity);
  }, [imageOpacity, ready]);

  // ---- an external raster service (e.g. protected areas), above the field
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !ready) return;
    for (const l of map.getStyle().layers ?? []) if (l.id.startsWith("rs-") && l.id !== `rs-${raster?.id}`) map.removeLayer(l.id);
    for (const id of Object.keys(map.getStyle().sources ?? {})) if (id.startsWith("rs-") && id !== `rs-${raster?.id}`) map.removeSource(id);
    if (raster && !map.getSource(`rs-${raster.id}`)) {
      map.addSource(`rs-${raster.id}`, { type: "raster", tiles: raster.tiles, tileSize: 256, attribution: raster.attribution });
      map.addLayer({ id: `rs-${raster.id}`, type: "raster", source: `rs-${raster.id}`, paint: { "raster-opacity": raster.opacity ?? 0.85 } }, "borders");
    }
  }, [raster?.id, ready]); // eslint-disable-line react-hooks/exhaustive-deps

  // ---- overlays (sea-ice edges, places, arrays)
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !ready) return;
    const wanted = new Set(overlays.map((o) => o.id));
    for (const layer of map.getStyle().layers ?? []) {
      if (layer.id.startsWith("ov-") && !wanted.has(layer.id.slice(3).replace(/-label$/, ""))) map.removeLayer(layer.id);
    }
    for (const id of Object.keys(map.getStyle().sources ?? {})) {
      if (id.startsWith("ov-") && !wanted.has(id.slice(3))) map.removeSource(id);
    }
    for (const o of overlays) {
      const sid = `ov-${o.id}`;
      const existing = map.getSource(sid) as maplibregl.GeoJSONSource | undefined;
      if (existing) existing.setData(o.data);
      else map.addSource(sid, { type: "geojson", data: o.data });
      if (!map.getLayer(sid)) {
        if (o.kind === "line") {
          map.addLayer({ id: sid, type: "line", source: sid,
            paint: { "line-color": o.color, "line-width": o.width ?? 1.6, "line-opacity": o.opacity ?? 1,
              ...(o.dash ? { "line-dasharray": o.dash } : {}) } });
        } else {
          // Points may carry their own "color" and "r" (radius) properties.
          map.addLayer({ id: sid, type: "circle", source: sid,
            paint: {
              "circle-radius": ["interpolate", ["linear"], ["zoom"], 1, ["*", 2.6, ["coalesce", ["get", "r"], 1]], 5, ["*", 5, ["coalesce", ["get", "r"], 1]]],
              "circle-color": ["coalesce", ["get", "color"], "#ffffff"],
              "circle-stroke-color": o.color, "circle-stroke-width": o.width ?? 1.6, "circle-opacity": o.opacity ?? 1 } });
        }
      }
    }
  }, [overlays, ready]);

  // ---- hover and select
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !ready) return;
    const move = (e: maplibregl.MapMouseEvent) => onHover?.({ lon: e.lngLat.lng, lat: e.lngLat.lat, x: e.point.x, y: e.point.y });
    const leave = () => onHover?.(null);
    const click = (e: maplibregl.MapMouseEvent) => onSelect?.({ lon: e.lngLat.lng, lat: e.lngLat.lat, x: e.point.x, y: e.point.y });
    map.on("mousemove", move);
    map.on("mouseout", leave);
    map.on("click", click);
    return () => { map.off("mousemove", move); map.off("mouseout", leave); map.off("click", click); };
  }, [onHover, onSelect, ready]);

  // ---- slow rotation, stopped for good by any interaction
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !ready || !spin) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    let raf = 0, last = performance.now();
    const step = (t: number) => {
      const dt = t - last; last = t;
      if (!touched.current && !document.hidden) {
        const c = map.getCenter();
        map.setCenter([c.lng + dt * 0.0022, c.lat]);
      }
      raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [spin, ready]);

  return <div ref={el} className={className} role="region" aria-label={ariaLabel} />;
}
