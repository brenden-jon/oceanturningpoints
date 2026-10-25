import type { Metadata } from "next";
import { abs } from "@/lib/site";
import Link from "next/link";
import { allTopics, formatDate } from "@/lib/science";
import styles from "./science.module.css";

export const metadata: Metadata = {
  title: "Science",
  description: "Short, referenced explainers on the ocean systems that are changing: what we observe, what could change, the consequences for people, and how sure we are.",
  alternates: { canonical: abs("/science/") },
  openGraph: { images: [abs("/og/science.png")], siteName: "Ocean Turning Points" },
};

export default function SciencePage() {
  const topics = allTopics();
  return (
    <div className="wrap">
      <header className={styles.indexHead}>
        <p className="eyebrow">Science</p>
        <h1 className={styles.title}>What is changing in the ocean, and how do we know?</h1>
        <p className="standfirst">
          Each topic follows the same path: how the system works, what has been observed, what could change, the
          consequences for people, what remains uncertain and why it matters for decisions. Every claim is referenced to
          published work.
        </p>
      </header>
      <ol className={styles.index}>
        {topics.map((t, i) => (
          <li key={t.slug}>
            <Link href={`/science/${t.slug}/`} className={styles.indexItem}>
              <span className={`tnum ${styles.num}`}>{String(i + 1).padStart(2, "0")}</span>
              <span className={styles.indexText}>
                <span className="eyebrow">{t.title}</span>
                <span className={styles.indexQ}>{t.question}</span>
                <span className={styles.indexSummary}>{t.summary}</span>
                <span className="small muted">Reviewed {formatDate(t.reviewed)}{t.explorer ? " · Interactive data" : ""}</span>
              </span>
            </Link>
          </li>
        ))}
      </ol>
      <p className={`small muted ${styles.indexFoot}`}>
        How sources are chosen, how data are processed and how uncertainty is shown: <Link href="/science/methods/">methods and data</Link>.
      </p>
    </div>
  );
}
