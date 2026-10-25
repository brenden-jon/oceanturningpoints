import type { Metadata } from "next";
import { abs } from "@/lib/site";
import Link from "next/link";
import { notFound } from "next/navigation";
import { allTopics, formatDate, getTopic } from "@/lib/science";
import styles from "../science.module.css";

export function generateStaticParams() {
  return allTopics().map((t) => ({ slug: t.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const t = getTopic((await params).slug);
  if (!t) return {};
  return {
    title: t.question,
    description: t.summary,
    alternates: { canonical: abs(`/science/${t.slug}/`) },
    openGraph: {
      title: t.question, description: t.summary, url: abs(`/science/${t.slug}/`), type: "article", siteName: "Ocean Turning Points",
      images: [abs(t.explorer ? "/og/amoc-collapse.png" : "/og/science.png")],
    },
  };
}

const LEVEL: Record<string, string> = { high: "High", medium: "Medium", low: "Low" };

export default async function TopicPage({ params }: { params: Promise<{ slug: string }> }) {
  const topic = getTopic((await params).slug);
  if (!topic) notFound();
  const topics = allTopics();
  const related = topic.related.map((s) => topics.find((t) => t.slug === s)).filter(Boolean);

  return (
    <article className={styles.article}>
      <header className={`wrap ${styles.head}`}>
        <p className="eyebrow"><Link href="/science/">Science</Link> · {topic.title}</p>
        <h1 className={styles.title}>{topic.question}</h1>
        <p className="standfirst">{topic.summary}</p>
        <p className={`small muted ${styles.meta}`}>
          Reviewed {formatDate(topic.reviewed)} · {topic.status}
        </p>
      </header>

      <div className={`wrap ${styles.summaryGrid}`}>
        <section className={styles.keyPoints} aria-labelledby="kp">
          <h2 id="kp" className="eyebrow">In brief</h2>
          <ul>{topic.keyPoints.map((k) => <li key={k}>{k}</li>)}</ul>
          {topic.explorer && (
            <p><Link className="button" href={topic.explorer}>Explore the data</Link></p>
          )}
        </section>
        {topic.confidence.length > 0 && (
          <section className={styles.confidence} aria-labelledby="conf">
            <h2 id="conf" className="eyebrow">How sure are we?</h2>
            <table>
              <thead><tr><th scope="col">Claim</th><th scope="col">Confidence</th></tr></thead>
              <tbody>
                {topic.confidence.map((c) => (
                  <tr key={c.claim}>
                    <th scope="row">{c.claim}<span>{c.basis}</span></th>
                    <td><span className={`${styles.level} ${styles[`level_${c.level}`]}`}>{LEVEL[c.level] ?? c.level}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
            <p className="small muted">
              Our summary of the evidence, using IPCC confidence language where the IPCC has assessed the claim.
            </p>
          </section>
        )}
      </div>

      <div className={`wrap ${styles.body}`}>
        <nav className={styles.toc} aria-label="Sections">
          <ol>
            {topic.sections.map((s) => <li key={s.id}><a href={`#${s.id}`}>{s.title}</a></li>)}
          </ol>
        </nav>
        <div className={`prose ${styles.prose}`}>
          {topic.sections.map((s) => (
            <section key={s.id} id={s.id} className={s.id === "references-and-data" ? styles.refs : undefined}>
              <h2>{s.title}</h2>
              <div dangerouslySetInnerHTML={{ __html: s.html }} />
            </section>
          ))}
        </div>
      </div>

      {related.length > 0 && (
        <aside className={`wrap ${styles.related}`} aria-labelledby="rel">
          <h2 id="rel" className="eyebrow">Related topics</h2>
          <ul className={styles.cards}>
            {related.map((t) => t && (
              <li key={t.slug}>
                <Link href={`/science/${t.slug}/`} className={styles.card}>
                  <span className="eyebrow">{t.title}</span>
                  <span className={styles.cardQ}>{t.question}</span>
                </Link>
              </li>
            ))}
          </ul>
        </aside>
      )}
    </article>
  );
}
