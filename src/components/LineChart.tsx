"use client";

import { scaleLinear } from "d3-scale";
import { area, line } from "d3-shape";
import { useEffect, useRef, useState } from "react";
import styles from "./LineChart.module.css";

/**
 * A small, honest line chart: SVG, fixed explicit axes, labelled directly.
 * The caller decides the domains; nothing is auto-scaled to flatter a trend.
 */

export interface Series {
  id: string;
  points: [number, number | null][];
  color: string;
  width?: number;
  opacity?: number;
  dash?: string;
  label?: string;          // drawn at the series' last point
  labelDy?: number;
  band?: [number, number, number][]; // optional shaded range: [x, low, high]
}

export interface Band { x0: number; x1: number; label?: string; fill?: string }
export interface Rule { x?: number; y?: number; label?: string; dash?: string; color?: string; align?: "start" | "end" }

interface Props {
  series: Series[];
  x: [number, number];
  y: [number, number];
  xTicks: number[];
  yTicks: number[];
  xFormat?: (v: number) => string;
  yFormat?: (v: number) => string;
  yLabel: string;
  xLabel?: string;
  bands?: Band[];
  rules?: Rule[];
  height?: number;
  ariaLabel: string;
  onHoverX?: (x: number | null) => void;
  hoverX?: number | null;
  hoverText?: string | null;
}

export default function LineChart({
  series, x, y, xTicks, yTicks, xFormat = String, yFormat = String, yLabel, xLabel,
  bands = [], rules = [], height = 300, ariaLabel, onHoverX, hoverX, hoverText,
}: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const [w, setW] = useState(720);
  useEffect(() => {
    if (!ref.current) return;
    const ro = new ResizeObserver(([e]) => setW(Math.max(280, Math.round(e.contentRect.width))));
    ro.observe(ref.current);
    return () => ro.disconnect();
  }, []);

  const hasLabels = series.some((s) => s.label);
  const m = { t: 18, r: hasLabels && w > 520 ? 118 : 14, b: xLabel ? 44 : 30, l: 40 };
  const sx = scaleLinear().domain(x).range([m.l, w - m.r]);
  const sy = scaleLinear().domain(y).range([height - m.b, m.t]);
  const path = line<[number, number | null]>()
    .defined((d) => d[1] !== null && Number.isFinite(d[1]))
    .x((d) => sx(d[0]))
    .y((d) => sy(d[1] as number));

  const move = (e: React.PointerEvent<SVGRectElement>) => {
    if (!onHoverX) return;
    const r = (e.currentTarget as SVGRectElement).getBoundingClientRect();
    const px = ((e.clientX - r.left) / r.width) * (w - m.l - m.r) + m.l;
    onHoverX(sx.invert(px));
  };

  return (
    <div ref={ref} className={styles.wrap}>
      <svg width={w} height={height} role="img" aria-label={ariaLabel} className={styles.svg}>
        {bands.map((b, i) => (
          <g key={i}>
            <rect x={sx(b.x0)} y={m.t} width={Math.max(0, sx(b.x1) - sx(b.x0))} height={height - m.t - m.b}
              fill={b.fill ?? "rgba(21,54,71,0.05)"} />
            {b.label && <text x={sx(b.x0) + 6} y={m.t + 12} className={styles.bandLabel}>{b.label}</text>}
          </g>
        ))}
        {yTicks.map((t) => (
          <g key={`y${t}`}>
            <line x1={m.l} x2={w - m.r} y1={sy(t)} y2={sy(t)} className={t === 0 ? styles.zero : styles.grid} />
            <text x={m.l - 8} y={sy(t)} dy="0.32em" textAnchor="end" className={styles.tick}>{yFormat(t)}</text>
          </g>
        ))}
        {xTicks.map((t) => (
          <text key={`x${t}`} x={sx(t)} y={height - m.b + 18} textAnchor="middle" className={styles.tick}>{xFormat(t)}</text>
        ))}
        <text x={m.l} y={m.t - 6} className={styles.axisLabel}>{yLabel}</text>
        {xLabel && <text x={(m.l + w - m.r) / 2} y={height - 6} textAnchor="middle" className={styles.axisLabel}>{xLabel}</text>}
        {rules.map((r, i) => r.y !== undefined ? (
          <g key={`r${i}`}>
            <line x1={m.l} x2={w - m.r} y1={sy(r.y)} y2={sy(r.y)} stroke={r.color ?? "var(--text)"} strokeDasharray={r.dash ?? "4 4"} strokeWidth={1} />
            {r.label && <text x={w - m.r - 4} y={sy(r.y) - 6} textAnchor="end" className={styles.ruleLabel}>{r.label}</text>}
          </g>
        ) : (
          <g key={`r${i}`}>
            <line x1={sx(r.x!)} x2={sx(r.x!)} y1={m.t} y2={height - m.b} stroke={r.color ?? "var(--text)"} strokeDasharray={r.dash ?? "4 4"} strokeWidth={1} />
            {r.label && <text x={sx(r.x!) + (r.align === "end" ? -6 : 6)} y={m.t + 12} textAnchor={r.align === "end" ? "end" : "start"} className={styles.ruleLabel}>{r.label}</text>}
          </g>
        ))}
        {series.filter((s) => s.band).map((s) => (
          <path key={`b${s.id}`} fill={s.color} fillOpacity={0.14} stroke="none"
            d={area<[number, number, number]>().x((d) => sx(d[0])).y0((d) => sy(d[1])).y1((d) => sy(d[2]))(s.band!) ?? ""} />
        ))}
        {series.map((s) => (
          <path key={s.id} d={path(s.points) ?? ""} fill="none" stroke={s.color} strokeWidth={s.width ?? 1.6}
            strokeOpacity={s.opacity ?? 1} strokeDasharray={s.dash} strokeLinejoin="round" />
        ))}
        {w > 520 && series.filter((s) => s.label).map((s) => {
          const last = [...s.points].reverse().find((p) => p[1] !== null);
          if (!last) return null;
          return (
            <text key={`l${s.id}`} x={sx(last[0]) + 8} y={sy(last[1] as number) + (s.labelDy ?? 0)} dy="0.32em"
              className={styles.seriesLabel} fill={s.color}>{s.label}</text>
          );
        })}
        {hoverX != null && hoverX >= x[0] && hoverX <= x[1] && (
          <line x1={sx(hoverX)} x2={sx(hoverX)} y1={m.t} y2={height - m.b} className={styles.cursor} />
        )}
        {onHoverX && (
          <rect x={m.l} y={m.t} width={w - m.l - m.r} height={height - m.t - m.b} fill="transparent"
            onPointerMove={move} onPointerLeave={() => onHoverX(null)} />
        )}
      </svg>
      {hoverText && <p className={styles.hover} aria-live="polite">{hoverText}</p>}
    </div>
  );
}
