import type { Metadata } from "next";
import Link from "next/link";
import { allTopics } from "@/lib/science";
import { asset } from "@/lib/site";
import styles from "./questions.module.css";

export const metadata: Metadata = {
  title: "Questions",
  description: "Concrete questions about ocean change, each answered with published data and an honest account of uncertainty.",
  alternates: { canonical: "/questions/" },
};

export default function Questions() {
  const topics = allTopics();
  return (
    <div className="wrap">
      <header className={styles.head}>
        <p className="eyebrow">Questions</p>
        <h1 className={styles.title}>Questions about a changing ocean</h1>
        <p className="standfirst">
          Each question is answered with published data you can explore yourself, and an account of what remains uncertain.
        </p>
      </header>

      <section aria-labelledby="interactive">
        <h2 id="interactive" className="eyebrow">Explore the data</h2>
        <Link href="/questions/amoc-collapse/" className={styles.feature}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={asset("/img/amoc-winter.jpg")} alt="" width={960} height={672} />
          <span className={styles.featureText}>
            <span className="eyebrow">Atlantic circulation</span>
            <span className={styles.featureQ}>What would happen if the Atlantic circulation collapsed?</span>
            <span>
              Maps of temperature and rainfall from published model experiments, twenty years of direct measurements, and what a
              collapse would mean from Europe to the Sahel and South Asia.
            </span>
            <span className="textlink">Open the explorer</span>
          </span>
        </Link>
      </section>

      <section aria-labelledby="explained" className={styles.explained}>
        <h2 id="explained" className="eyebrow">Explained</h2>
        <ul className={styles.list}>
          {topics.map((t) => (
            <li key={t.slug}>
              <Link href={`/science/${t.slug}/`}>
                <span className={styles.q}>{t.question}</span>
                <span className="small muted">{t.summary}</span>
              </Link>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
