import type { Metadata } from "next";
import Link from "next/link";
import HeroGlobe from "@/components/HeroGlobe";
import { num, rainAt, tempAt } from "@/lib/amocData";
import { allTopics } from "@/lib/science";
import { SITE, asset, abs } from "@/lib/site";
import styles from "./page.module.css";

export const metadata: Metadata = {
  title: { absolute: `${SITE.name}: how the ocean is changing, and what it means for people` },
  description:
    "An independent, evidence-led atlas of ocean change: the Atlantic circulation, polar oceans, coral reefs and ice sheets, and what their changes mean for people around the world.",
  alternates: { canonical: abs("/") },
  openGraph: { images: [abs("/og/home.jpg")] },
};

const CHANNELS = [
  { title: "Rain and food", text: "Shifts in ocean circulation move the tropical rain belts that feed monsoon farming in Africa, South Asia and Latin America.", topic: "amoc" },
  { title: "Coastal flooding", text: "Ice-sheet loss raises the sea everywhere; reefs and currents change how much of that reaches particular coasts.", topic: "ice-sheets" },
  { title: "Heat and cold extremes", text: "The North Atlantic shapes European weather. A sharp change in its circulation would bring harsher winters to the north, even in a warmer world.", topic: "subpolar-gyre" },
  { title: "Fisheries and livelihoods", text: "Warming, acidification and reef loss affect the fish that coastal communities depend on for food and income.", topic: "coral-reefs" },
  { title: "The global climate", text: "The Southern Ocean takes up much of the extra heat and carbon we add. Changes there feed back on warming itself.", topic: "southern-ocean" },
];

export default function Home() {
  const topics = allTopics();
  const london = { pi: tempAt("London", "winter", "pi_on"), off: tempAt("London", "winter", "rcp45_off") };
  const niamey = rainAt("Niamey", "jja");
  const mumbai = rainAt("Mumbai", "jja");

  return (
    <>
      <section className={styles.hero}>
        <div className={`wrap ${styles.heroGrid}`}>
          <div className={styles.heroText}>
            <h1 className="display">How is the ocean changing, and what does it mean for people?</h1>
            <p className="standfirst">
              The ocean stores most of the heat we add to the climate and moves it around the planet. Some of its systems may be
              approaching thresholds. This atlas explains what is changing, what the evidence shows, and who would feel it.
            </p>
            <p className={styles.actions}>
              <Link className="button" href="/questions/amoc-collapse/">Explore the Atlantic circulation</Link>
              <Link className="button button--quiet" href="/science/">Read the science</Link>
            </p>
          </div>
          <HeroGlobe className={styles.globeBox} />
        </div>
      </section>

      <section className={`section ${styles.featured}`} aria-labelledby="featured">
        <div className="wrap">
          <p className="eyebrow">Featured question</p>
          <div className={styles.featureGrid}>
            <div>
              <h2 id="featured" className={styles.featureH}>
                <Link href="/questions/amoc-collapse/">What would happen if the Atlantic circulation collapsed?</Link>
              </h2>
              <p className={styles.featureLead}>
                A collapse of the Atlantic Meridional Overturning Circulation is unlikely this century on current evidence, but not
                ruled out, and its effects would be felt far beyond the Atlantic. Explore published climate-model experiments and
                twenty years of direct measurements.
              </p>
              <dl className={styles.facts}>
                <div>
                  <dt className="tnum">{num(london.off, 1)} °C</dt>
                  <dd>London’s average winter in a world 2 °C warmer with the AMOC collapsed, against {num(london.pi, 1)} °C before industrialisation</dd>
                </div>
                <div>
                  <dt className="tnum">{num(niamey.mean)}%</dt>
                  <dd>June–August rainfall at Niamey in the Sahel after a collapse, average of four models</dd>
                </div>
                <div>
                  <dt className="tnum">{num(mumbai.mean)}%</dt>
                  <dd>Monsoon rainfall at Mumbai, same experiments. Models agree on the direction, not the size</dd>
                </div>
              </dl>
              <p><Link className="textlink" href="/questions/amoc-collapse/">Open the explorer</Link></p>
            </div>
            <Link href="/questions/amoc-collapse/" className={styles.featureImages} aria-label="Open the AMOC explorer">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={asset("/img/amoc-winter.jpg")} alt="Map of winter temperature change around the North Atlantic after an AMOC collapse in a 2 °C warmer world: strong cooling over the North Atlantic, Scandinavia and the British Isles." width={960} height={672} />
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={asset("/img/amoc-rain.jpg")} alt="Map of June–August rainfall change after an AMOC collapse, four-model average: drying across the Sahel and India, wetter conditions over the Gulf of Guinea." width={960} height={384} />
              <span className={styles.imgNote}>Winter temperature (top) and summer rainfall (bottom) after a collapse. Blue: colder; brown: drier.</span>
            </Link>
          </div>
        </div>
      </section>

      <section className="section" aria-labelledby="changes">
        <div className="wrap">
          <p className="eyebrow">What is changing</p>
          <h2 id="changes" className={styles.h2}>Ocean systems under pressure</h2>
          <ol className={styles.topics}>
            {topics.map((t) => (
              <li key={t.slug}>
                <Link href={`/science/${t.slug}/`} className={styles.topic}>
                  <span className="eyebrow">{t.title}</span>
                  <span className={styles.topicQ}>{t.question}</span>
                  <span className={styles.topicP}>{t.keyPoints[0]}</span>
                </Link>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className={`section ${styles.world}`} aria-labelledby="world">
        <div className={`wrap ${styles.worldGrid}`}>
          <div>
            <p className="eyebrow">Why it matters worldwide</p>
            <h2 id="world" className={styles.h2}>Ocean change reaches people through a few channels</h2>
            <p className={styles.worldLead}>
              The places with most at stake are often far from the ocean systems that are changing, and many have the least room to
              absorb a shock. A collapse of the Atlantic circulation, for example, would reach far more people through tropical rainfall
              than through Europe’s winters.
            </p>
          </div>
          <ul className={styles.channels}>
            {CHANNELS.map((c) => (
              <li key={c.title}>
                <h3>{c.title}</h3>
                <p>{c.text} <Link href={`/science/${c.topic}/`}>Read more</Link></p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="section" aria-labelledby="how">
        <div className={`wrap ${styles.howGrid}`}>
          <div>
            <p className="eyebrow">How this site works</p>
            <h2 id="how" className={styles.h2}>Published science, shown with its uncertainty</h2>
          </div>
          <ul className={styles.principles}>
            <li><strong>Only published evidence.</strong> Every map, chart and claim traces to peer-reviewed research or an official dataset, cited where it is used.</li>
            <li><strong>Observations and models kept apart.</strong> Measurements are labelled as observed; model experiments are labelled as experiments, not forecasts.</li>
            <li><strong>Uncertainty is part of the answer.</strong> Where models disagree, you see each one. Where evidence is thin, we say so.</li>
            <li><strong>Reviewed and dated.</strong> Every topic shows when it was last checked against new research.</li>
          </ul>
          <p className={styles.howLink}><Link className="textlink" href="/science/methods/">Methods and data sources</Link></p>
        </div>
      </section>
    </>
  );
}
