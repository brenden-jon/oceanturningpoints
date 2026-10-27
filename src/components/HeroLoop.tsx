"use client";

import { useEffect, useRef } from "react";
import { asset } from "@/lib/site";

/** Looping globe animation for the homepage. Muted; stays on its first frame for people who prefer reduced motion. */
export default function HeroLoop({ className }: { className?: string }) {
  const ref = useRef<HTMLVideoElement>(null);
  useEffect(() => {
    const v = ref.current;
    if (!v) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) { v.pause(); v.removeAttribute("autoplay"); return; }
    v.play().catch(() => {});
  }, []);
  return (
    <video ref={ref} className={className} src={asset("/video/ocean-globe.mp4")} poster={asset("/video/ocean-globe.jpg")}
      autoPlay muted loop playsInline preload="auto" aria-hidden />
  );
}
