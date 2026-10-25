"use client";

import dynamic from "next/dynamic";
import { useEffect, useRef, useState } from "react";
import { WDPA_CITATION, WDPA_LAYER, WDPA_RELEASE } from "@/lib/wdpa";
import HBars from "./HBars";
import LineChart from "./LineChart";
import styles from "./ReefMap.module.css";

const EarthMap = dynamic(() => import("./EarthMap"), { ssr: false });

/** All marine and coastal protected areas, as drawn by UNEP-WCMC's map service (never downloaded or redistributed). */
export function MpaMap() {
  const boxRef = useRef<HTMLDivElement>(null);
  const [zoom, setZoom] = useState(0.8);
  useEffect(() => {
    if (!boxRef.current) return;
    const ro = new ResizeObserver(([e]) => { const w = e.contentRect.width; if (w > 0) setZoom(Math.max(0, Math.log2(w / 512))); });
    ro.observe(boxRef.current);
    return () => ro.disconnect();
  }, []);
  return (
    <figure style={{ margin: 0 }}>
      <div className={styles.mapBox} ref={boxRef}>
        <EarthMap look="data" projection="mercator" view={{ center: [10, 5], zoom }} raster={{ ...WDPA_LAYER, opacity: 0.85 }}
          className={styles.map} ariaLabel="World map of marine and coastal protected areas, from the World Database on Protected and Conserved Areas. Zoom in to see individual areas." />
      </div>
      <figcaption className="small faint" style={{ marginTop: "0.7rem", maxWidth: "95ch" }}>
        <span className="evidence evidence--obs">Official records</span> Every marine and coastal protected area reported by governments
        and other authorities. Zoom in to see individual sites. Being on the map says nothing about how well an area is protected or
        managed. Source: {WDPA_CITATION} Available at <a href="https://www.protectedplanet.net/">protectedplanet.net</a>. Drawn by
        UNEP-WCMC’s map service; the data are not copied or offered for download here.
      </figcaption>
    </figure>
  );
}

/** Share of the global ocean in protected areas and OECMs, 1 January each year, rebuilt by Protected Planet from the current database. */
const COVER: [number, number][] = [
  [2010, 3.06], [2012, 3.53], [2014, 4.03], [2016, 4.85], [2017, 6.11], [2018, 7.32], [2020, 8.1], [2022, 8.45], [2024, 8.75], [2025, 10.01], [2026.8, 10.04],
];

export function MpaCoverageChart() {
  const [hx, setHx] = useState<number | null>(null);
  const n = hx == null ? null : COVER.reduce((p, c) => (Math.abs(c[0] - hx) < Math.abs(p[0] - hx) ? c : p));
  return (
    <figure style={{ margin: 0 }}>
      <p style={{ margin: "0 0 0.25rem", fontWeight: 600 }}>Share of the ocean in protected areas</p>
      <p className="small faint" style={{ margin: "0 0 0.6rem" }}>Per cent of the global ocean, against the 30% target for 2030</p>
      <LineChart ariaLabel="Share of the global ocean in marine protected areas and other effective area-based conservation measures, 2010 to 2026, rising from 3 to 10 per cent, against a 30 per cent target for 2030."
        x={[2010, 2030]} y={[0, 32]} xTicks={[2010, 2015, 2020, 2025, 2030]} yTicks={[0, 10, 20, 30]} yLabel="%" height={220}
        series={[{ id: "c", points: COVER, color: "#0a62b8", width: 2.4 }]}
        rules={[{ y: 30, label: "Global target: 30% by 2030", dash: "4 3", color: "#b24a2a" }]}
        onHoverX={setHx} hoverX={hx}
        hoverText={n ? `${Math.floor(n[0])}: ${n[1].toFixed(1)}% of the ocean` : "About 10% of the ocean today."} />
      <p className="small faint" style={{ margin: "0.6rem 0 0" }}>
        Protected areas and other effective area-based conservation measures (OECMs), 1 January of each year; last point October 2026.
        UNEP-WCMC and IUCN, Protected Planet (WDPCA), {WDPA_RELEASE} release. Earlier years are
        rebuilt from today’s database, so they can differ from figures published at the time. The 2017 jump is the Ross Sea MPA.
      </p>
    </figure>
  );
}

/** Level of protection, MPAs only, MPAtlas (Marine Conservation Institute) analysis of 20 October 2026, per cent of the global ocean. */
export function ProtectionQuality() {
  return (
    <figure style={{ margin: 0 }}>
      <p style={{ margin: "0 0 0.25rem", fontWeight: 600 }}>How strongly the ocean is protected</p>
      <p className="small faint" style={{ margin: "0 0 0.9rem" }}>Per cent of the global ocean, marine protected areas only</p>
      <HBars max={30} labelWidth="13rem" rule={{ at: 30, label: "30%" }} rows={[
        { label: "Fully or highly protected, in place", value: 3.54, text: "3.5%" },
        { label: "Lightly or minimally protected", value: 4.32, text: "4.3%", muted: true },
        { label: "Designated but not yet in place", value: 1.35, text: "1.4%", muted: true },
      ]} color="#1f7a5a" />
      <p className="small faint" style={{ margin: "0.9rem 0 0" }}>
        Fully or highly protected areas ban or tightly limit extraction such as fishing and mining; their benefits are much larger
        than those of lightly protected areas (Grorud-Colvert et al., 2021). Source: <a href="https://mpatlas.org/">MPAtlas</a>,
        Marine Conservation Institute, analysis of 20 October 2026, using The MPA Guide.
      </p>
    </figure>
  );
}

/** Finance for ocean protection, US$ billion a year. */
export function ProtectionFinanceChart() {
  return (
    <figure style={{ margin: 0 }}>
      <p style={{ margin: "0 0 0.25rem", fontWeight: 600 }}>Money for ocean protection, against what is needed</p>
      <p className="small faint" style={{ margin: "0 0 0.9rem" }}>US$ billion a year</p>
      <HBars max={24} labelWidth="13rem" rows={[
        { label: "Needed to manage 30% of the ocean well", value: 16, text: "about $16bn" },
        { label: "Spent on ocean protection today", value: 1.8, text: "about $1.8bn", muted: true },
        { label: "Fisheries subsidies that expand fishing capacity (2018)", value: 22.2, text: "$22.2bn" },
      ]} color="#0a62b8" />
      <p className="small faint" style={{ margin: "0.9rem 0 0" }}>
        Need and spending: Systemiq, <i>Ocean Protection Gap Report 2026</i>, commissioned by the Bloomberg Ocean Fund; about 95% of
        the need is long-term management rather than creating new areas. Subsidies: Sumaila et al. (2019), <i>Marine Policy</i>,{" "}
        <a href="https://doi.org/10.1016/j.marpol.2019.103695">doi:10.1016/j.marpol.2019.103695</a>.
      </p>
    </figure>
  );
}
