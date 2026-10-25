"use client";

import { useEffect, useState } from "react";
import { asset } from "@/lib/site";
import LineChart from "./LineChart";

/** Southern Ocean CO2 uptake, difference from the 1985–2018 mean (MPI-SOM-FFN v2025). */
export function SouthernCarbonChart() {
  const [d, setD] = useState<{ series: [number, number][] } | null>(null);
  const [hx, setHx] = useState<number | null>(null);
  useEffect(() => { fetch(asset("/data/southern/co2_uptake.json")).then((r) => r.json()).then(setD).catch(() => {}); }, []);
  if (!d) return <div style={{ height: 260 }} />;
  const s = d.series;
  const n = hx == null ? null : s.reduce((a, b) => (Math.abs(b[0] - hx) < Math.abs(a[0] - hx) ? b : a));
  return (
    <figure style={{ margin: 0 }}>
      <p style={{ margin: "0 0 0.25rem", fontWeight: 600 }}>Carbon taken up by the ocean south of 35°S</p>
      <p className="small faint" style={{ margin: "0 0 0.6rem" }}>Difference from the 1985–2018 average, billion tonnes of carbon a year; above zero means more uptake</p>
      <LineChart ariaLabel="Southern Ocean carbon uptake compared with its 1985 to 2018 average: weaker in the 1990s, lowest around 2001, then stronger after 2000."
        x={[1982, 2025]} y={[-0.4, 0.4]} xTicks={[1985, 1995, 2005, 2015, 2024]} yTicks={[-0.4, -0.2, 0, 0.2, 0.4]} yLabel="PgC/yr" height={230}
        yFormat={(v) => (v > 0 ? `+${v.toFixed(1)}` : v.toFixed(1))}
        series={[{ id: "u", points: s, color: "#0a62b8", width: 2 }]}
        rules={[{ y: 0, color: "#9aa5b1" }]}
        onHoverX={setHx} hoverX={hx}
        hoverText={n ? `${n[0]}: ${n[1] > 0 ? "+" : ""}${n[1].toFixed(2)} PgC/yr` : "Uptake weakened in the 1990s and recovered after 2000."} />
      <figcaption className="small faint" style={{ marginTop: "0.6rem" }}>
        <span className="evidence evidence--obs">Observation-based estimate</span> Area-weighted annual air–sea CO₂ flux from the MPI-SOM-FFN
        v2025 product (Jersild, Landschützer, Gruber and Bakker; NOAA NCEI 0160558, <a href="https://doi.org/10.7289/v5z899n6">doi:10.7289/v5z899n6</a>),
        which interpolates ship and buoy measurements of surface CO₂. Shown as a difference from the average because estimates of the total
        vary between products.
      </figcaption>
    </figure>
  );
}
