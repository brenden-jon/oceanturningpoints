"use client";

import dynamic from "next/dynamic";
import { useEffect, useRef, useState } from "react";

// MapLibre is large; load it after the page text so the headline paints first.
const EarthMap = dynamic(() => import("./EarthMap"), { ssr: false });

/**
 * The homepage Earth. Globe size in MapLibre follows zoom, not the container,
 * so the zoom is derived from the box width to keep the whole planet in view.
 */
const REF_WIDTH = 560;
const REF_ZOOM = 1.75;

export default function HeroGlobe({ className }: { className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const [zoom, setZoom] = useState<number | null>(null);
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
          view={{ center: [-28, 18], zoom }}
          interactive={false}
          spin
          className="hero-globe-map"
          ariaLabel="The Earth from space, NASA Blue Marble imagery, slowly turning"
        />
      )}
    </div>
  );
}
