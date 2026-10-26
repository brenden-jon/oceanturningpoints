"use client";

import Link from "next/link";
import { useState } from "react";
import type { Paper } from "@/lib/research";
import styles from "./ResearchList.module.css";

export default function ResearchList({ papers, topics, dates }: { papers: Paper[]; topics: Record<string, { name: string; href: string }>; dates: string[] }) {
  const [topic, setTopic] = useState("all");
  const present = Object.keys(topics).filter((t) => papers.some((p) => p.topic === t));
  const shown = papers.map((p, i) => ({ p, d: dates[i] })).filter(({ p }) => topic === "all" || p.topic === topic);
  return (
    <div className={styles.wrap}>
      <div className={styles.filters} role="group" aria-label="Filter by topic">
        <button aria-pressed={topic === "all"} onClick={() => setTopic("all")}>All topics</button>
        {present.map((t) => <button key={t} aria-pressed={topic === t} onClick={() => setTopic(t)}>{topics[t].name}</button>)}
      </div>
      <ol className={styles.list}>
        {shown.map(({ p, d }) => (
          <li key={(p.doi ?? p.url ?? p.title)}>
            <p className={styles.meta}>
              <time>{d}</time> · <Link href={topics[p.topic]?.href ?? "/science/"}>{topics[p.topic]?.name ?? p.topic}</Link>
              {p.type === "report" && <span className={styles.report}>Report</span>}
            </p>
            <h3><a href={p.doi ? `https://doi.org/${p.doi}` : p.url}>{p.title}</a></h3>
            <p className={styles.summary}>{p.summary}</p>
            <p className={`small faint ${styles.cite}`}>{p.authors}, <i>{p.venue}</i>{p.doi ? <> · doi:{p.doi}</> : null}</p>
          </li>
        ))}
      </ol>
    </div>
  );
}
