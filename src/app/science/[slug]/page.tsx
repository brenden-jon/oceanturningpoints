import type { Metadata } from "next";
import { abs } from "@/lib/site";
import Link from "next/link";
import { notFound } from "next/navigation";
import { allTopics, formatDate, getTopic } from "@/lib/science";
import fs from "node:fs";
import path from "node:path";
import OceanNowGlobe from "@/components/OceanNowGlobe";
import { ObservedChart } from "@/components/AmocCharts";
import { EnsoHistory } from "@/components/EnsoCharts";
import ReefMap from "@/components/ReefMap";
import SeaIceChart from "@/components/SeaIceChart";
import { GlobalProjectionChart, IceSheetChart } from "@/components/SeaLevelCharts";
import { asset } from "@/lib/site";
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
        <p className="label"><Link href="/science/">Science</Link> · {topic.title}</p>
        <h1 className={styles.title}>{topic.question}</h1>
        <p className="lede">{topic.summary}</p>
        <p className={`small faint ${styles.meta}`}>
          Last reviewed {formatDate(topic.reviewed)}. {topic.status}.
        </p>
      </header>

      <TopicVisual slug={topic.slug} live={topic.live} explorer={topic.explorer} />

      {topic.decisions && (
        <section className={`wrap ${styles.decisions}`} aria-labelledby="dec">
          <h2 id="dec">What it means for decisions</h2>
          <p>{topic.decisions}</p>
        </section>
      )}

      <div className={`wrap ${styles.summaryGrid}`}>
        <section className={styles.keyPoints} aria-labelledby="kp">
          <h2 id="kp">In brief</h2>
          <ul>{topic.keyPoints.map((k) => <li key={k}>{k}</li>)}</ul>
          {topic.explorer && (
            <p><Link className="button" href={topic.explorer}>Explore the data</Link></p>
          )}
        </section>
        {topic.confidence.length > 0 && (
          <section className={styles.confidence} aria-labelledby="conf">
            <h2 id="conf">How sure are we?</h2>
            <table>
              <thead><tr><th scope="col">Statement</th><th scope="col">How sure</th></tr></thead>
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
              Where the IPCC gives a likelihood (likely, very likely) or a confidence level, it is stated in the basis. Otherwise this is
              our reading of the published evidence.
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
          <h2 id="rel">Related topics</h2>
          <ul className={styles.cards}>
            {related.map((t) => t && (
              <li key={t.slug}>
                <Link href={`/science/${t.slug}/`} className={styles.card}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={asset(`/img/topics/${t.slug}.jpg`)} alt="" width={1200} height={800} loading="lazy" />
                  <span className={styles.cardT}>{t.title}</span>
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

const NOW = path.join(process.cwd(), "public", "data", "now");
const readNow = (f: string) => JSON.parse(fs.readFileSync(path.join(NOW, f), "utf8"));

/** The data picture that opens each topic, before the text. */
function TopicVisual({ slug, live, explorer }: { slug: string; live?: { layer: "ssta" | "dhw"; view: string; caption: string }; explorer?: string }) {
  const m = readNow("manifest.json");
  const globe = (layer: "ssta" | "dhw", view: string) => (
    <OceanNowGlobe ssta={m.ssta} dhw={m.dhw} currents={m.currents} initialLayer={layer} initialView={view} compact />
  );
  let body: React.ReactNode = null, caption = "";
  if (slug === "amoc") {
    caption = "Twenty years of direct measurements of the Atlantic overturning circulation.";
    body = <ObservedChart />;
  } else if (slug === "el-nino") {
    caption = live?.caption ?? "";
    body = (<>{globe("ssta", "pacific")}<figure className={styles.visualFig}><figcaption><strong>El Niño and La Niña since 1950</strong> · three-month index; red above +0.5°C is El Niño</figcaption><EnsoHistory data={readNow("enso.json")} /></figure></>);
  } else if (slug === "coral-reefs") {
    caption = "Heat stress at the world’s coral reef regions, from satellites. Select a region to see its history since 1985.";
    body = <ReefMap />;
  } else if (slug === "southern-ocean") {
    const ice = readNow("sea_ice.json");
    caption = "Antarctic sea ice this year, against the 1981–2010 median and the lowest on record for each day.";
    body = (<figure className={styles.visualFig}><SeaIceChart h={ice.antarctic} name="Antarctic" y={[0, 24]} /><figcaption className="small faint">NSIDC Sea Ice Index, version 4. Updated daily.</figcaption></figure>);
  } else if (slug === "ice-sheets") {
    const sl = JSON.parse(fs.readFileSync(path.join(process.cwd(), "public", "data", "sealevel", "sealevel.json"), "utf8"));
    caption = "Ice lost from Greenland and Antarctica so far, and how far the sea could rise by 2300 if they destabilise.";
    body = (<div className={styles.visualPair}><div className={styles.visualFig}><IceSheetChart d={sl} /></div><div className={styles.visualFig}><GlobalProjectionChart d={sl} /></div></div>);
  } else if (slug === "subpolar-gyre") {
    caption = "Today’s sea-surface temperature compared with normal across the North Atlantic.";
    body = globe("ssta", "atlantic");
  } else if (live) {
    caption = live.caption;
    body = globe(live.layer, live.view);
  }
  if (!body) return null;
  return (
    <section className={`wrap ${styles.live}`} aria-label="Data">
      <p className={styles.liveCaption}>{caption}</p>
      {body}
      {explorer && explorer !== "/ocean-now/" && slug !== "coral-reefs" && (
        <p className={styles.visualMore}><Link className="button" href={explorer}>{slug === "ice-sheets" ? "See projections for 16 coastal cities" : "Explore the data"}</Link></p>
      )}
    </section>
  );
}
