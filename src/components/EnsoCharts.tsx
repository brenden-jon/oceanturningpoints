"use client";

import { useMemo, useState } from "react";
import LineChart from "./LineChart";

export interface EnsoData {
  weekly: { week: string; nino34: number; relative34: number | null }[];
  oni: { season: string; year: number; value: number }[];
  roni: { season: string; year: number; value: number }[];
}

const SEAS = ["DJF", "JFM", "FMA", "MAM", "AMJ", "MJJ", "JJA", "JAS", "ASO", "SON", "OND", "NDJ"];
const decimal = (iso: string) => { const d = new Date(iso + "T12:00:00Z"); const y = d.getUTCFullYear(); return y + (d.getTime() - Date.UTC(y, 0, 1)) / (365.25 * 864e5); };
const seasonX = (s: { season: string; year: number }) => s.year + (SEAS.indexOf(s.season) + 1) / 12;
const fmtDate = (iso: string) => new Date(iso + "T12:00:00Z").toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric", timeZone: "UTC" });

export function EnsoWeekly({ data }: { data: EnsoData }) {
  const [hx, setHx] = useState<number | null>(null);
  const pts = useMemo(() => data.weekly.map((w) => ({ ...w, x: decimal(w.week) })), [data]);
  const x0 = Math.floor(pts[0].x), x1 = pts[pts.length - 1].x + 0.15;
  const near = hx == null ? null : pts.reduce((a, b) => (Math.abs(b.x - hx) < Math.abs(a.x - hx) ? b : a));
  const ticks = Array.from({ length: Math.ceil(x1) - x0 }, (_, i) => x0 + i + 1).filter((t) => t < x1);
  return (
    <LineChart
      ariaLabel="Weekly Niño-3.4 sea surface temperature anomaly over the past three years, with the relative index."
      x={[x0, x1]} y={[-2, 4]} xTicks={ticks} yTicks={[-2, -1, 0, 1, 2, 3, 4]} xFormat={(v) => String(v)}
      yFormat={(v) => (v > 0 ? `+${v}` : v < 0 ? `−${-v}` : "0")} yLabel="°C"
      rules={[{ y: 0.5, label: "El Niño threshold", dash: "3 4", color: "#b24a2a" }, { y: -0.5, label: "La Niña threshold", dash: "3 4", color: "#0a62b8" }]}
      series={[
        { id: "trad", points: pts.map((p) => [p.x, p.nino34]), color: "#b24a2a", width: 2.2, label: "Niño-3.4" },
        { id: "rel", points: pts.map((p) => [p.x, p.relative34]), color: "#7d8792", width: 1.6, dash: "4 3", label: "Relative", labelDy: 10 },
      ]}
      onHoverX={setHx} hoverX={hx}
      hoverText={near ? `Week of ${fmtDate(near.week)}: Niño-3.4 ${near.nino34 > 0 ? "+" : ""}${near.nino34.toFixed(1)} °C${near.relative34 != null ? `, relative ${near.relative34 > 0 ? "+" : ""}${near.relative34.toFixed(1)} °C` : ""}` : "Hover or tap the chart to read weekly values."}
    />
  );
}

export function EnsoHistory({ data }: { data: EnsoData }) {
  const [hx, setHx] = useState<number | null>(null);
  const oni = useMemo(() => data.oni.map((s) => [seasonX(s), s.value] as [number, number]), [data]);
  const roni = useMemo(() => data.roni.map((s) => [seasonX(s), s.value] as [number, number]), [data]);
  const near = hx == null ? null : data.oni.reduce((a, b) => (Math.abs(seasonX(b) - hx) < Math.abs(seasonX(a) - hx) ? b : a));
  const nearR = near ? data.roni.find((r) => r.year === near.year && r.season === near.season) : null;
  const last = data.oni[data.oni.length - 1];
  return (
    <LineChart
      ariaLabel="Oceanic Niño Index since 1950, three-month averages, with the relative index."
      x={[1950, seasonX(last) + 0.5]} y={[-2.5, 3]} xTicks={[1960, 1980, 2000, 2020]} yTicks={[-2, -1, 0, 1, 2, 3]}
      yFormat={(v) => (v > 0 ? `+${v}` : v < 0 ? `−${-v}` : "0")} yLabel="°C"
      rules={[{ y: 0.5, dash: "3 4", color: "#b24a2a" }, { y: -0.5, dash: "3 4", color: "#0a62b8" }]}
      series={[
        { id: "oni", points: oni, color: "#b24a2a", width: 1.4, label: "ONI" },
        { id: "roni", points: roni, color: "#7d8792", width: 1.2, dash: "3 2", label: "Relative", labelDy: 12 },
      ]}
      onHoverX={setHx} hoverX={hx}
      hoverText={near ? `${near.season} ${near.year}: ONI ${near.value > 0 ? "+" : ""}${near.value.toFixed(2)} °C${nearR ? `, relative ${nearR.value > 0 ? "+" : ""}${nearR.value.toFixed(2)} °C` : ""}` : "Strong El Niño years stand out: 1972–73, 1982–83, 1997–98, 2015–16, and now 2026."}
    />
  );
}
