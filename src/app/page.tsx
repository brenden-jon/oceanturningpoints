import type { Metadata } from "next";
import Link from "next/link";
import HeroGlobe from "@/components/HeroGlobe";
import { num, rainAt, tempAt } from "@/lib/amocData";
import { allTopics } from "@/lib/science";
import { SITE, abs, asset } from "@/lib/site";
import styles from "./page.module.css";

export const metadata: Metadata = {
  title: { absolute: `${SITE.name}: how the ocean is changing, and what it means for people` },
  description:
    "An independent atlas of ocean change: the Atlantic circulation, polar oceans, coral reefs and ice sheets, and what their changes mean for people around the world.",
  alternates: { canonical: abs("/") },
  openGraph: { images: [abs("/og/home.jpg")] },
};

const CHANNELS = [
  { title: "Rain and harvests", text: "Changes in ocean circulation move the tropical rain belts that monsoon farming depends on, from the Sahel to South Asia.", topic: "amoc" },
  { title: "Coastal flooding", text: "Melting ice sheets raise sea level everywhere. Reefs, currents and the shape of the coast decide how much reaches each shoreline.", topic: "ice-sheets" },
  { title: "Winters and heat", text: "The North Atlantic sets much of Europe’s weather. A sharp change in its circulation would bring colder winters, even as the planet warms.", topic: "subpolar-gyre" },
  { title: "Fish and livelihoods", text: "Heat, acidification and reef loss change what coastal fisheries can catch, with the largest effects in the tropics.", topic: "coral-reefs" },
  { title: "Global warming itself", text: "The Southern Ocean absorbs a large share of the heat and carbon dioxide that people add. Changes there feed back on how fast the world warms.", topic: "southern-ocean" },
];

export default function Home() {
  const topics = allTopics();
  const london = { pi: tempAt("London", "winter", "pi_on"), off: tempAt("London", "winter", "rcp45_off") };
  const niamey = rainAt("Niamey", "jja");
  const mumbai = rainAt("Mumbai", "jja");

  return (
    <>
      <section className={styles.hero}>
        <div className={`wrap ${styles.heroText}`}>
          <h1 className="display">How is the ocean changing, and what does it mean for people?</h1>
          <p className={`lede ${styles.heroLede}`}>
            The ocean has taken up most of the heat added by greenhouse gases. This atlas shows what that is doing to currents,
            reefs, ice and rainfall, using published research and open data.
          </p>
          <p className={styles.actions}>
            <Link className="button" href="/questions/amoc-collapse/">Explore the Atlantic scenarios</Link>
            <Link className="more" href="/science/">Read the science</Link>
          </p>
        </div>
        <HeroGlobe className={styles.globeBox} />
      </section>

      <section className={`section section--alt ${styles.featured}`} aria-labelledby="featured">
        <div className={`wrap ${styles.featureGrid}`}>
          <div className={styles.featureText}>
            <p className="kicker">Atlantic circulation</p>
            <h2 id="featured">What would happen if the Atlantic circulation collapsed?</h2>
            <p className={styles.featureLead}>
              Climate models agree that the Atlantic Meridional Overturning Circulation will weaken this century. Whether it could
              collapse is disputed. Model experiments show what a collapse would do: much colder winters in northwest Europe and
              much less rain across the Sahel and South Asia.
            </p>
            <dl className={styles.facts}>
              <div>
                <dt className="tnum">{num(london.off, 1)}°C</dt>
                <dd>Average winter temperature in London in a world 2°C warmer with a collapsed circulation. Before industrialisation it was {num(london.pi, 1)}°C.</dd>
              </div>
              <div>
                <dt className="tnum">{num(niamey.mean)}%</dt>
                <dd>Change in June–August rainfall at Niamey, Niger, averaged over four climate models.</dd>
              </div>
              <div>
                <dt className="tnum">{num(mumbai.mean)}%</dt>
                <dd>Change in monsoon rainfall at Mumbai in the same experiments. All four models show drying; they differ on how much.</dd>
              </div>
            </dl>
            <p><Link className="button" href="/questions/amoc-collapse/">Explore the scenarios</Link></p>
          </div>
          <Link href="/questions/amoc-collapse/" className={styles.featureImages} aria-label="Open the Atlantic circulation scenarios">
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
          <p className={`lede ${styles.sub}`}>Each is changing now, and each could change faster if warming passes certain thresholds.</p>
          <ul className={styles.tiles}>
            {topics.map((t) => (
              <li key={t.slug}>
                <Link href={`/science/${t.slug}/`} className={styles.tile}>
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
            <h2 id="people" className={styles.h2}>How ocean change reaches people</h2>
            <p className="lede">
              The countries with most at stake are often far from the ocean systems that are changing, and many have the least
              room to absorb a shock.
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
