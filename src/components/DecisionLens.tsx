import Link from "next/link";
import { LENS, LENS_LABELS, type LensKey } from "@/lib/decisions";
import styles from "./DecisionLens.module.css";

/** Act now / Assess now / Stay the course for one big change. */
export default function DecisionLens({ change, compact = false }: { change: LensKey; compact?: boolean }) {
  const l = LENS[change];
  return (
    <div className={styles.lens}>
      {(["act", "assess", "stay"] as const).map((k) => (
        <div key={k} className={`${styles.col} ${styles[k]}`}>
          <h3>{LENS_LABELS[k].title}</h3>
          {!compact && <p className={styles.def}>{LENS_LABELS[k].text}</p>}
          <ul>{l[k].map((t) => <li key={t}>{t}</li>)}</ul>
        </div>
      ))}
      {!compact && (
        <p className={`small faint ${styles.note}`}>
          The three decision types are Ocean Turning Points’ own lens, built on research on deciding under deep uncertainty.{" "}
          <Link href="/decisions/">How to decide under uncertainty</Link>.
        </p>
      )}
    </div>
  );
}
