import fs from "node:fs";
import path from "node:path";
import type { Metadata } from "next";
import Link from "next/link";
import HeroGlobe from "@/components/HeroGlobe";
import { num, rainAt, tempAt } from "@/lib/amocData";
import { allTopics } from "@/lib/science";
import { SITE, abs, asset } from "@/lib/site";
import styles from "./page.module.css";

export const metadata: Metadata = {
  title: { absolute: `${SITE.name}: how the ocean is changing, and what it means for decisions` },
  description:
    "An independent atlas of ocean change: the Atlantic circulation, polar oceans, coral reefs and ice sheets, and what their changes mean for people around the world.",
  alternates: { canonical: abs("/") },
  openGraph: { images: [abs("/og/home.jpg")] },
};

const CHANNELS = [
  { title: "Rain and harvests", text: "Changes in ocean circulation move the tropical rain belts that monsoon farming depends on, from the Sahel to South Asia.", topic: "amoc" },
  { title: "Coastal flooding", text: "Melting ice sheets raise global sea level. Sinking land, currents, reefs and the shape of the coast decide how much reaches each shoreline.", topic: "ice-sheets" },
  { title: "Winters and heat", text: "The North Atlantic sets much of Europe’s weather. A sharp change in its circulation would bring colder winters, even as the planet warms.", topic: "subpolar-gyre" },
  { title: "Fish and livelihoods", text: "Heat, acidification and reef loss change what coastal fisheries can catch, with the largest effects in the tropics.", topic: "coral-reefs" },
  { title: "Global warming itself", text: "The Southern Ocean absorbs a large share of the heat and carbon dioxide that people add. Changes there feed back on how fast the world warms.", topic: "southern-ocean" },
];

const NOW = path.join(process.cwd(), "public", "data", "now");
const readNow = (f: string) => JSON.parse(fs.readFileSync(path.join(NOW, f), "utf8"));
const day = (iso: string) => new Date(iso.slice(0, 10) + "T12:00:00Z").toLocaleDateString("en-GB", { day: "numeric", month: "long", timeZone: "UTC" });

export default function Home() {
  const topics = allTopics();
  const now = readNow("manifest.json");
  const london = { pi: tempAt("London", "winter", "pi_on"), off: tempAt("London", "winter", "rcp45_off") };
  const niamey = rainAt("Niamey", "jja");
  const enso = readNow("enso.json");
  const isRecord = enso.latest.nino34 >= enso.weeklyRecord.nino34;
  const rainCheck = JSON.parse(fs.readFileSync(path.join(process.cwd(), "public", "data", "amoc", "rainfall", "manifest.json"), "utf8")).validation;

  return (
    <>
      <section className={styles.hero}>
        <div className={`wrap ${styles.heroText}`}>
          <h1 className="display">How is the ocean changing, and what does it mean for decisions?</h1>
          <p className={`lede ${styles.heroLede}`}>
            The ocean has absorbed about 90% of the extra heat from greenhouse gases. This atlas shows what that is doing to currents,
            reefs, ice and rainfall, who is exposed, and what governments, investors and planners can do. Everything comes from
            published research and open data.
          </p>
          <p className={styles.actions}>
            <Link className="button" href="/changes/">The big changes</Link>
            <Link className="more" href="/ocean-now/">See the ocean now</Link>
          </p>
        </div>
        <HeroGlobe className={styles.globeBox} currents={now.currents} />
        <p className={`small faint ${styles.globeNote}`}>
          Ocean surface currents on {day(now.currents.date)}, from NOAA satellite data. Imagery: NASA Blue Marble.
        </p>
      </section>

      <section className={styles.nowStrip} aria-label="The ocean now">
        <div className={`wrap ${styles.nowInner}`}>
          <span className={styles.nowDot} aria-hidden />
          <p>
            <strong>{now.enso.status ?? "El Niño update"}.</strong> Niño-3.4 sea temperatures are{" "}
            {now.enso.nino34 > 0 ? "+" : ""}{now.enso.nino34.toFixed(1)}°C above normal (week of {day(now.enso.week)})
            {isRecord ? ", the highest weekly value in NOAA’s record since 1981" : ""}. Seasonal forecasts give months of warning of the
            droughts, floods and coral bleaching that El Niño brings.
          </p>
          <Link className="more" href="/ocean-now/">The ocean now</Link>
        </div>
      </section>

      <section className="section" aria-labelledby="plan">
        <div className="wrap">
          <h2 id="plan" className={styles.h2}>What to plan for, and when</h2>
          <p className={`lede ${styles.sub}`}>The changes differ in how soon they arrive, how certain they are and what can be done about them.</p>
          <ol className={styles.plan}>
            <li>
              <span className={styles.when}>Now, every few years</span>
              <h3><Link href="/ocean-now/">El Niño and marine heatwaves</Link></h3>
              <p>Forecast months ahead. Agree triggers and pre-arranged finance, and size food reserves, insurance and water storage for stronger events than in the past.</p>
            </li>
            <li>
              <span className={styles.when}>Under way</span>
              <h3><Link href="/changes/coral-reefs/">Coral reef loss</Link></h3>
              <p>Plan for less coastal protection, fish and tourism income on reef coasts. Protect the reefs coping best with heat and reduce local pressures.</p>
            </li>
            <li>
              <span className={styles.when}>Certain, for centuries</span>
              <h3><Link href="/science/ice-sheets/">Sea-level rise</Link></h3>
              <p>Design ports, flood defences and coastal towns for a range of sea levels, with agreed points at which to upgrade or adapt further.</p>
            </li>
            <li>
              <span className={styles.when}>Low likelihood, very high impact</span>
              <h3><Link href="/changes/atlantic-circulation/">Atlantic circulation collapse</Link></h3>
              <p>Test long-lived investments in the Sahel, South Asia and around the North Atlantic against a collapse, and favour measures that pay off either way.</p>
            </li>
          </ol>
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
                <dd>Average winter temperature in London in a world 2°C warmer with a collapsed circulation. Before industrialisation it was {num(london.pi, 1)}°C.</dd>
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

      <section className="section" aria-labelledby="systems">
        <div className="wrap">
          <h2 id="systems" className={styles.h2}>The systems we follow</h2>
          <p className={`lede ${styles.sub}`}>
            Each is changing now. Five could pass a tipping point as warming rises. El Niño is not assessed as a tipping system, but its
            rainfall swings are expected to grow.
          </p>
          <ul className={styles.tiles}>
            {topics.map((t) => (
              <li key={t.slug}>
                <Link href={t.slug === "amoc" ? "/changes/atlantic-circulation/" : t.slug === "coral-reefs" ? "/changes/coral-reefs/" : `/science/${t.slug}/`} className={styles.tile}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={asset(`/img/topics/${t.slug}.jpg`)} alt="" width={1200} height={800} loading="lazy" />
                  <span className={styles.tileTitle}>{t.title}</span>
                  <span className={styles.tileQ}>{t.question}</span>
                </Link>
              </li>
            ))}
          </ul>
          <p className={`small faint ${styles.credit}`}>Imagery: NASA Blue Marble.</p>
        </div>
      </section>

      <section className="section section--alt" aria-labelledby="people">
        <div className={`wrap ${styles.peopleGrid}`}>
          <div>
            <h2 id="people" className={styles.h2}>Why it matters for development and decisions</h2>
            <p className="lede">
              Ocean change reaches economies through rainfall, coasts, extreme weather and food. The countries with most at stake are
              often far from the ocean systems that are changing, and many have the least room to absorb a shock.
            </p>
          </div>
          <ul className={styles.channels}>
            {CHANNELS.map((c) => (
              <li key={c.title}>
                <h3><Link href={`/science/${c.topic}/`}>{c.title}</Link></h3>
                <p>{c.text}</p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="section" aria-labelledby="how">
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
