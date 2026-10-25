"use client";

import type { Map as MLMap } from "maplibre-gl";
import dynamic from "next/dynamic";
import { useEffect, useRef, useState } from "react";
import CurrentsLayer, { type CurrentsMeta } from "./CurrentsLayer";

// MapLibre is large; load it after the page text so the headline paints first.
const EarthMap = dynamic(() => import("./EarthMap"), { ssr: false });

/**
 * The homepage Earth with today's surface currents. Globe size in MapLibre
 * follows zoom, not the container, so zoom is derived from the box width to
 * keep the whole planet in view. The globe stays still so the current trails
 * can build up.
 */
const REF_WIDTH = 560;
const REF_ZOOM = 1.75;

export default function HeroGlobe({ className, currents }: { className?: string; currents?: CurrentsMeta }) {
  const ref = useRef<HTMLDivElement>(null);
  const [zoom, setZoom] = useState<number | null>(null);
  const [map, setMap] = useState<MLMap | null>(null);
  useEffect(() => {
    if (!ref.current) return;
    const ro = new ResizeObserver(([e]) => {
      const w = e.contentRect.width;
      if (w > 0) setZoom(REF_ZOOM + Math.log2(w / REF_WIDTH));
    });
    ro.observe(ref.current);
    return () => ro.disconnect();
  }, []);
  return (
    <div ref={ref} className={className}>
      {zoom !== null && (
        <EarthMap
          look="satellite"
          projection="globe"
          view={{ center: [-38, 24], zoom }}
          interactive={false}
          spin={!currents}
          onReady={setMap}
          className="hero-globe-map"
          ariaLabel="The Earth from space with today's ocean surface currents in the Atlantic"
        />
      )}
      {currents && <CurrentsLayer map={map} meta={currents} />}
    </div>
  );
}
