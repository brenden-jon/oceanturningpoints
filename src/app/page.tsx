import fs from "node:fs";
import path from "node:path";
import type { Metadata } from "next";
import Link from "next/link";
import HeroLoop from "@/components/HeroLoop";
import VideoBand from "@/components/VideoBand";
import { num, rainAt, tempAt } from "@/lib/amocData";
import { CHANGES } from "@/lib/changes";
import { SITE, abs, asset } from "@/lib/site";
import styles from "./page.module.css";

export const metadata: Metadata = {
  title: { absolute: `${SITE.name}: the big ocean changes and what they mean for decisions` },
  description:
    "An independent guide to the big changes in the ocean: a possible collapse of the Atlantic circulation (AMOC), coral reefs passing a tipping point, ice sheets and sea-level rise, El Niño, shifting fish stocks and North Atlantic cooling. How likely each is, what it would mean, and which decisions should change.",
  alternates: { canonical: abs("/") },
  openGraph: {
    title: `${SITE.name}: the big ocean changes and what they mean for decisions`,
    description: "How likely each big ocean change is, what it would mean for people and economies, and which decisions should change. Independent and evidence-led.",
    url: abs("/"), images: [{ url: abs("/og/ocean-turning-points.jpg"), width: 1200, height: 630, alt: "Globe of the Pacific showing El Niño heat, with the words: The big ocean changes, and what they mean for decisions" }],
  },
  twitter: { card: "summary_large_image", images: [abs("/og/ocean-turning-points.jpg")] },
};


const NOW = path.join(process.cwd(), "public", "data", "now");
const readNow = (f: string) => JSON.parse(fs.readFileSync(path.join(NOW, f), "utf8"));
const day = (iso: string) => new Date(iso.slice(0, 10) + "T12:00:00Z").toLocaleDateString("en-GB", { day: "numeric", month: "long", timeZone: "UTC" });

export default function Home() {
  const now = readNow("manifest.json");
  const london = { pi: tempAt("London", "winter", "pi_on"), off: tempAt("London", "winter", "rcp45_off") };
  const niamey = rainAt("Niamey", "jja");
  const enso = readNow("enso.json");
  const isRecord = enso.latest.nino34 >= enso.weeklyRecord.nino34;
  const rainCheck = JSON.parse(fs.readFileSync(path.join(process.cwd(), "public", "data", "amoc", "rainfall", "manifest.json"), "utf8")).validation;

  return (
    <>
      <section className={styles.hero}>
        <HeroLoop className={styles.heroVideo} />
        <div className={styles.heroShade} aria-hidden />
        <div className={`wrap ${styles.heroInner}`}>
          <div className={styles.heroText}>
            <h1 className="display">Which big ocean changes should the world plan for?</h1>
            <p className={`lede ${styles.heroLede}`}>
              An independent guide to the big changes in the ocean, from a possible Atlantic circulation collapse to coral reefs passing a
              tipping point: how likely each is, what it would mean, and which decisions should change.
            </p>
            <p className={styles.actions}>
              <Link className="button" href="/changes/">The big changes</Link>
              <Link className={styles.heroMore} href="/decisions/">How to decide ›</Link>
            </p>
            <p className={styles.heroCredit}>
              Ocean currents modelled by NASA/JPL and MIT (ECCO2, NASA Perpetual Ocean 2); land cover and city lights from NASA Blue Marble
              and Black Marble. <Link href="/ocean-now/">Today’s currents and sea temperatures</Link>
        </p>
          </div>
        </div>

      </section>

      <section className={styles.nowStrip} aria-label="The ocean now">
        <div className={`wrap ${styles.nowInner}`}>
          <span className={styles.nowDot} aria-hidden />
          <p>
            <strong>{now.enso.status ?? "El Niño update"}.</strong> Niño-3.4 sea temperatures are{" "}
            {Math.abs(now.enso.nino34).toFixed(1)}°C {now.enso.nino34 >= 0 ? "above" : "below"} normal (week of {day(now.enso.week)})
            {isRecord ? ", the highest weekly value in NOAA’s record since 1981" : ""}. Seasonal forecasts give months of warning of the
            droughts, floods and coral bleaching that El Niño brings.
          </p>
          <Link className="more" href="/ocean-now/">The ocean now</Link>
        </div>
      </section>

      <section className="section" aria-labelledby="changes">
        <div className="wrap">
          <h2 id="changes" className={styles.h2}>Six big changes</h2>
          <p className={`lede ${styles.sub}`}>They differ in how soon they arrive, how likely they are and what can be done about them.</p>
          <ul className={styles.tiles}>
            {CHANGES.map((c) => (
              <li key={c.slug}>
                <Link href={c.story} className={styles.tile}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={asset(c.card ?? `/img/topics/${c.slug}.jpg`)} alt="" width={1200} height={800} loading="lazy" />
                  <span className={styles.status}>{c.status}</span>
                  <span className={styles.tileTitle}>{c.title}</span>
                  <span className={styles.tileQ}>{c.question}</span>
                  {c.cardCredit && <span className={styles.tileCredit}>{c.cardCredit}</span>}
                </Link>
              </li>
            ))}
          </ul>
          <p className={styles.allLink}><Link className="more" href="/changes/">Compare all six: what each is, how likely, what it would mean, what can be done</Link></p>
        </div>
      </section>

      <section className={`section section--alt ${styles.featured}`} aria-labelledby="featured">
        <div className={`wrap ${styles.featureGrid}`}>
          <div className={styles.featureText}>
            <p className="kicker">Atlantic circulation</p>
            <h2 id="featured">What would happen if the Atlantic circulation collapsed?</h2>
            <p className={styles.featureLead}>
              The Atlantic Meridional Overturning Circulation is very likely to weaken this century. Whether it could collapse is
              disputed. Model experiments show what a collapse would do: much colder winters in northwest Europe and much less rain
              across the Sahel and South Asia.
            </p>
            <dl className={styles.facts}>
              <div>
                <dt className="tnum">{num(london.off, 1)}°C</dt>
                <dd>Average winter temperature in London in a world 2°C warmer with a collapsed circulation. In the same model’s pre-industrial climate it was {num(london.pi, 1)}°C.</dd>
              </div>
              <div>
                <dt className="tnum">{num(rainCheck["West African monsoon"].published)}%</dt>
                <dd>Change in West African monsoon rainfall, average of four climate models (Ben-Yami et al., 2024). At Niamey, Niger, June–August rainfall falls by about {num(-niamey.mean)}%.</dd>
              </div>
              <div>
                <dt className="tnum">{num(rainCheck["Indian summer monsoon"].published)}%</dt>
                <dd>Change in Indian summer monsoon rainfall in the same four models. All four show drying; they differ on how much.</dd>
              </div>
            </dl>
            <p className="small faint">
              Temperature: one model (CESM), a world about 2°C warmer, several centuries after greenhouse gases stop rising. Rainfall: four
              models, the collapse alone with no added warming. Neither is a forecast.
            </p>
            <p><Link className="button" href="/changes/atlantic-circulation/">Explore the scenarios</Link></p>
          </div>
          <Link href="/changes/atlantic-circulation/" className={styles.featureImages} aria-label="Open the Atlantic circulation scenarios">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={asset("/img/amoc-winter.jpg")} alt="Map of winter temperature change around the North Atlantic after a collapse in a world 2°C warmer: strong cooling over the North Atlantic, Scandinavia and the British Isles." width={960} height={672} />
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={asset("/img/amoc-rain.jpg")} alt="Map of June–August rainfall change after a collapse, four-model average: drying across the Sahel and India, wetter conditions over the Gulf of Guinea." width={960} height={384} />
            <span className="small faint">Top: winter temperature change (blue is colder). Bottom: summer rainfall change (brown is drier).</span>
          </Link>
        </div>
      </section>

      <VideoBand
        src="/video/sharks-fakarava.mp4" poster="/video/sharks-fakarava.jpg"
        kicker="Recovery" title="Ocean life can come back"
        text="Where fishing stops and reefs are protected, fish and sharks return, often faster than expected. At Cabo Pulmo in Mexico, fish biomass rose more than fivefold in ten years after the community closed its reef to fishing."
        href="/responses/#recover" linkText="Examples of recovery"
        caption="Grey reef sharks over the reef in the south pass of Fakarava, French Polynesia."
      />

      <section className="section" aria-labelledby="routes">
        <div className="wrap">
          <h2 id="routes" className={styles.h2}>From evidence to decisions</h2>
          <ul className={styles.routes}>
            <li><Link href="/future/"><b>The future ocean</b><span>What is already expected, and three futures at 1.5, 2.7 and 4°C.</span></Link></li>
            <li><Link href="/impacts/"><b>Impacts in your region</b><span>Food, water, coasts, fisheries and public finance in thirteen regions.</span></Link></li>
            <li><Link href="/decisions/"><b>How to decide</b><span>Which decisions to change now, which to assess and which are robust.</span></Link></li>
            <li><Link href="/responses/"><b>What can be done</b><span>How far emissions must fall, protecting the ocean, and paying for it.</span></Link></li>
            <li><Link href="/monitoring/"><b>Who is watching the ocean</b><span>Every observing platform on one map, and why long records matter.</span></Link></li>
            <li><Link href="/science/latest/"><b>Latest research</b><span>New studies on the big changes, with plain summaries.</span></Link></li>
          </ul>
        </div>
      </section>

      <section className="section section--alt" aria-labelledby="how">
        <div className="wrap">
          <h2 id="how" className={styles.h2}>How we work</h2>
          <ul className={styles.principles}>
            <li><h3>Published evidence only</h3><p>Every map, chart and statement comes from peer-reviewed research or an official dataset, cited where it is used.</p></li>
            <li><h3>Measurements and models labelled</h3><p>Observations are marked as observed. Model experiments are marked as experiments, and never presented as forecasts.</p></li>
            <li><h3>Uncertainty shown</h3><p>Where models disagree, each one is shown. Where the evidence is thin, the text says so.</p></li>
            <li><h3>Reviewed and dated</h3><p>Every topic shows when it was last checked against new research.</p></li>
          </ul>
          <p><Link className="more" href="/science/methods/">Methods and data sources</Link></p>
        </div>
      </section>
    </>
  );
}
