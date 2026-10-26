import styles from "./PathwaysMap.module.css";

/**
 * Schematic adaptation-pathways "metro map", drawn for Ocean Turning Points after Haasnoot et al. (2013).
 * Illustrative only: no thresholds are taken from a real plan.
 */
const X0 = 170, X1 = 730;
const LINES = [
  { y: 60, label: "Current defences", lines: ["Current defences"], colour: "#8a949e", from: X0, to: 280 },
  { y: 120, label: "Raise and strengthen defences", lines: ["Raise and", "strengthen defences"], colour: "#0a62b8", from: 280, to: 520 },
  { y: 180, label: "New storm-surge barrier", lines: ["New storm-surge", "barrier"], colour: "#d9901e", from: 520, to: X1, open: true },
  { y: 240, label: "Setbacks and nature-based buffers", lines: ["Setbacks and", "nature-based buffers"], colour: "#1f7a5a", from: X0, to: 430 },
  { y: 300, label: "Move back from the highest-risk areas", lines: ["Move back from the", "highest-risk areas"], colour: "#6b4bb0", from: 430, to: X1, open: true },
];
const SWITCHES: { x: number; y1: number; y2: number; dashed?: boolean }[] = [
  { x: 280, y1: 60, y2: 120 },
  { x: 520, y1: 120, y2: 180 },
  { x: 430, y1: 240, y2: 300 },
];

export default function PathwaysMap() {
  return (
    <figure className={styles.fig}>
      <div className={styles.scroll}>
        <svg viewBox="0 0 760 390" role="img" aria-labelledby="pw-title pw-desc" className={styles.svg}>
          <title id="pw-title">Schematic adaptation pathways for a coastal city</title>
          <desc id="pw-desc">
            Five actions shown as metro lines against the amount of sea-level rise. Current defences work until a first tipping point, where
            the plan switches to raising defences, and later to a new barrier. Setbacks and nature-based buffers run alongside until they too
            reach their limit, when moving back from the highest-risk areas begins. Trigger points sit ahead of each tipping point by the time
            needed to prepare the next action.
          </desc>
          {/* axis */}
          <line x1={X0} x2={X1 + 10} y1={345} y2={345} stroke="var(--line-2)" />
          <path d={`M${X1 + 10} 341 L${X1 + 18} 345 L${X1 + 10} 349 Z`} fill="var(--line-2)" />
          <text x={X0} y={368} className={styles.axis}>Today</text>
          <text x={X1 + 18} y={368} textAnchor="end" className={styles.axis}>More sea-level rise →</text>

          {/* trigger / lead time on first tipping point */}
          <line x1={222} x2={222} y1={40} y2={330} stroke="var(--alert)" strokeDasharray="3 4" />
          <text x={222} y={30} textAnchor="middle" className={styles.trigger}>Trigger: decide</text>
          <line x1={226} x2={274} y1={330} y2={330} stroke="var(--alert)" />
          <text x={250} y={322} textAnchor="middle" className={styles.lead}>lead time</text>

          {SWITCHES.map((s, i) => (
            <line key={i} x1={s.x} x2={s.x} y1={s.y1} y2={s.y2} stroke="var(--text-3)" strokeWidth={2} strokeDasharray={s.dashed ? "4 4" : undefined} />
          ))}
          {LINES.map((l) => (
            <g key={l.label}>
              {l.lines.map((t, i) => (
                <text key={t} x={X0 - 14} y={l.y + 4 + (i - (l.lines.length - 1) / 2) * 15} textAnchor="end" className={styles.name}>{t}</text>
              ))}
              {l.from > X0 && <line x1={X0} x2={l.from} y1={l.y} y2={l.y} stroke={l.colour} strokeOpacity={0.25} strokeWidth={2} strokeDasharray="2 5" />}
              <line x1={l.from} x2={l.to} y1={l.y} y2={l.y} stroke={l.colour} strokeWidth={7} strokeLinecap="round" />
              {l.open
                ? <path d={`M${l.to + 4} ${l.y - 8} L${l.to + 16} ${l.y} L${l.to + 4} ${l.y + 8} Z`} fill={l.colour} />
                : <line x1={l.to + 6} x2={l.to + 6} y1={l.y - 13} y2={l.y + 13} stroke="var(--text)" strokeWidth={3} />}
            </g>
          ))}
          {SWITCHES.flatMap((s) => [s.y1, s.y2].map((y) => (
            <circle key={`${s.x}-${y}`} cx={s.x} cy={y} r={7} fill="var(--bg)" stroke="var(--text)" strokeWidth={2.5} />
          )))}
        </svg>
      </div>
      <ul className={styles.legend}>
        <li><i className={styles.tp} /> Adaptation tipping point: the action no longer meets its goal</li>
        <li><i className={styles.st} /> Switch to another action</li>
        <li><i className={styles.tr} /> Trigger point: start preparing the next action</li>
      </ul>
      <figcaption className="small faint">
        Schematic drawn for Ocean Turning Points, after the adaptive policy pathways of Haasnoot et al. (2013). Illustrative: the actions and their
        order are typical of coastal plans, but the positions are not taken from any real plan.
      </figcaption>
    </figure>
  );
}
