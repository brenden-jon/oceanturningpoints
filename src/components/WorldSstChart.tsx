"use client";

import { useState } from "react";
import LineChart, { type Series } from "./LineChart";

export interface WorldSst {
  date: string; latest: number; anomaly: number;
  years: Record<string, (number | null)[]>; clim: (number | null)[];
}

const MONTH_STARTS = [1, 32, 60, 91, 121, 152, 182, 213, 244, 274, 305, 335];
const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const doyLabel = (d: number) => { let m = 0; while (m < 11 && MONTH_STARTS[m + 1] <= d) m++; return `${d - MONTH_STARTS[m] + 1} ${MONTHS[m]}`; };
const pts = (d: (number | null)[]) => d.map((v, i) => [i + 1, v] as [number, number | null]);

/** Daily mean sea-surface temperature, 60°S–60°N: every year since 1982, this year in red. */
export default function WorldSstChart({ d }: { d: WorldSst }) {
  const [hx, setHx] = useState<number | null>(null);
  const cur = Number(d.date.slice(0, 4));
  const years = Object.keys(d.years).map(Number).sort();
  const series: Series[] = [
    ...years.filter((y) => y < cur - 1).map((y) => ({ id: String(y), points: pts(d.years[y]), color: y >= 2023 ? "#9aa5b1" : "#d5dae0", width: y >= 2023 ? 1.4 : 1 })),
    { id: "clim", points: pts(d.clim), color: "#4b5560", width: 1.4, dash: "5 4" },
    { id: String(cur - 1), points: pts(d.years[cur - 1]), color: "#6b7580", width: 1.8 },
    { id: String(cur), points: pts(d.years[cur]), color: "#b24a2a", width: 2.6 },
  ];
  const day = hx == null ? null : Math.max(1, Math.min(366, Math.round(hx)));
  const v = (y: number) => d.years[y]?.[(day ?? 1) - 1];
  const text = day == null
    ? `${cur} in red, ${cur - 1} in dark grey, 2023 and 2024 in mid grey, earlier years in light grey; dashed: the 1991–2020 average.`
    : `${doyLabel(day)}: ${cur} ${v(cur)?.toFixed(2) ?? "–"} · ${cur - 1} ${v(cur - 1)?.toFixed(2) ?? "–"} · 2024 ${v(2024)?.toFixed(2) ?? "–"} · 1991–2020 average ${d.clim[day - 1]?.toFixed(2) ?? "–"} °C`;
  return (
    <LineChart
      ariaLabel={`Daily average sea-surface temperature between 60°S and 60°N for every year since 1982, with ${cur} highlighted.`}
      x={[1, 366]} y={[19.6, 21.4]} xTicks={MONTH_STARTS.filter((_, i) => i % 2 === 0)} xFormat={(t) => MONTHS[MONTH_STARTS.indexOf(t)]}
      yTicks={[19.6, 20, 20.4, 20.8, 21.2]} yFormat={(t) => t.toFixed(1)} yLabel="°C"
      series={series} onHoverX={setHx} hoverX={hx} hoverText={text} height={300}
    />
  );
}
