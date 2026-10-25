"use client";

import { useState } from "react";
import LineChart from "./LineChart";

export interface IceHemi {
  date: string; extent: number; median8110: number; rankLowest: number | null; years: number;
  thisYear: [number, number][]; lastYear: [number, number][]; median: (number | null)[]; recordLow: ([number, number] | null)[];
}

const MONTH_STARTS = [1, 32, 60, 91, 121, 152, 182, 213, 244, 274, 305, 335];
const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const doyLabel = (d: number) => { let m = 0; while (m < 11 && MONTH_STARTS[m + 1] <= d) m++; return `${d - MONTH_STARTS[m] + 1} ${MONTHS[m]}`; };

export default function SeaIceChart({ h, name, y }: { h: IceHemi; name: string; y: [number, number] }) {
  const [hx, setHx] = useState<number | null>(null);
  const year = Number(h.date.slice(0, 4));
  const median = h.median.map((v, i) => [i + 1, v] as [number, number | null]);
  const low = h.recordLow.map((r, i) => [i + 1, r ? r[1] : null] as [number, number | null]);
  const d = hx == null ? null : Math.max(1, Math.min(365, Math.round(hx)));
  const at = (s: [number, number][]) => s.find((p) => p[0] === d)?.[1];
  const text = d == null ? `${name}: this year (red), last year (grey), the 1981–2010 median (dashed) and the lowest on record for each day (dotted).`
    : `${doyLabel(d)}: ${year} ${at(h.thisYear)?.toFixed(2) ?? "–"} · ${year - 1} ${at(h.lastYear)?.toFixed(2) ?? "–"} · median ${h.median[d - 1]?.toFixed(2) ?? "–"} · record low ${h.recordLow[d - 1]?.[1].toFixed(2) ?? "–"} (${h.recordLow[d - 1]?.[0] ?? "–"}) million km²`;
  return (
    <LineChart
      ariaLabel={`${name} sea-ice extent through the year: ${year}, ${year - 1}, the 1981–2010 median and the record low.`}
      x={[1, 365]} y={y} xTicks={MONTH_STARTS.filter((_, i) => i % 2 === 0)} xFormat={(v) => MONTHS[MONTH_STARTS.indexOf(v)]}
      yTicks={Array.from({ length: Math.floor((y[1] - y[0]) / 4) + 1 }, (_, i) => y[0] + i * 4)} yLabel="million km²"
      series={[
        { id: "median", points: median, color: "#7d8792", width: 1.4, dash: "5 4" },
        { id: "low", points: low, color: "#7d8792", width: 1.2, dash: "1 3" },
        { id: "last", points: h.lastYear, color: "#b9c0c7", width: 1.6 },
        { id: "this", points: h.thisYear, color: "#b24a2a", width: 2.4 },
      ]}
      onHoverX={setHx} hoverX={hx} hoverText={text} height={260}
    />
  );
}
