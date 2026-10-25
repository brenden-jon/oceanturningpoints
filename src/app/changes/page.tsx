import type { Metadata } from "next";
import Link from "next/link";
import ThresholdChart from "@/components/ThresholdChart";
import { abs, asset } from "@/lib/site";
import styles from "./changes.module.css";

export const metadata: Metadata = {
  title: "Big changes",
  description: "The large changes under way in the ocean: what is changing, who and what is exposed, and what decision-makers can do.",
  alternates: { canonical: abs("/changes/") },
};

const CHANGES = [
  {
    slug: "el-nino", title: "El Niño and the tropical Pacific", story: "/ocean-now/", storyLabel: "See today’s El Niño",
    horizon: "Now, every few years; forecastable months ahead",
    change: "As of October 2026 a strong El Niño is under way. Warming is expected to make El Niño’s rainfall swings larger.",
    people: "Droughts and floods across the tropics, food shortages, sharp falls in fish catches and coral bleaching, with economic losses that last for years.",
    decisions: "Act on seasonal forecasts with agreed triggers and pre-arranged finance, and size reserves and insurance for stronger events.",
  },
  {
    slug: "coral-reefs", title: "Coral reefs", story: "/changes/coral-reefs/", storyLabel: "See heat stress at every reef region",
    horizon: "Under way",
    change: "The Global Tipping Points Report 2025 assesses that warm-water reefs are crossing their thermal tipping point, estimated at about 1.2°C of global warming (range 1.0–1.5°C). Today’s warming is about 1.4°C. Reefs tip place by place.",
    people: "Reefs protect coasts from waves and support fisheries and tourism; about a billion people live within 100 km of one.",
    decisions: "Protect the reefs most likely to survive, reduce local pressures, and plan for weaker natural coastal protection.",
  },
  {
    slug: "ice-sheets", title: "Ice sheets and sea level", story: null, storyLabel: "",
    horizon: "Certain to continue for centuries; the pace depends on emissions",
    change: "Greenland and Antarctica are losing ice faster. Sea level will keep rising for centuries; how fast depends on emissions and on ice dynamics that are hard to predict.",
    people: "More frequent coastal flooding, salt water in farmland and aquifers, and loss of land in deltas and on low islands.",
    decisions: "Design coastal infrastructure for a range of sea levels, and keep options open to raise defences or move later.",
  },
  {
    slug: "amoc", title: "Atlantic circulation", story: "/changes/atlantic-circulation/", storyLabel: "Explore the scenarios",
    horizon: "Weakening very likely this century; collapse a low-likelihood, high-impact risk",
    change: "Very likely to weaken this century. The IPCC has medium confidence that it will not collapse before 2100; newer studies disagree on that risk.",
    people: "Much colder winters in northwest Europe, weaker monsoons in West Africa and South Asia, and faster sea-level rise on North Atlantic coasts.",
    decisions: "Stress-test long-lived investments against a collapse, and link Atlantic monitoring to decision triggers.",
  },
  {
    slug: "subpolar-gyre", title: "Subpolar North Atlantic", story: null, storyLabel: "",
    horizon: "Possible within a decade in a minority of models",
    change: "In some climate models, winter convection south of Greenland shuts down within a decade, cooling the region abruptly.",
    people: "Rapid cooling around the North Atlantic, shifts in European weather and changes to fisheries.",
    decisions: "Include abrupt regional cooling in European climate risk assessments, and keep the observing arrays running.",
  },
  {
    slug: "southern-ocean", title: "Southern Ocean", story: null, storyLabel: "",
    horizon: "Slow changes under way, with long-term effects on warming and sea level",
    change: "Dense water forming around Antarctica is declining in key regions, and Antarctic sea ice has fallen to record lows since 2016.",
    people: "The Southern Ocean absorbs much of the heat and carbon people add; changes affect global warming, sea level and the krill fishery.",
    decisions: "Sustain Southern Ocean observations, and avoid assuming the ocean carbon sink will keep pace.",
  },
];

export default function Changes() {
  return (
    <div className="wrap">
      <header className={styles.head}>
        <h1 className={styles.title}>The big changes</h1>
        <p className="lede">
          Six ocean systems are changing in ways that matter for development, investment and public finance. For each: what is
          changing, who and what is exposed, and what decision-makers can do now. They are ordered by how soon they demand attention.
        </p>
      </header>



      <ol className={styles.changes}>
        {CHANGES.map((c) => (
          <li key={c.slug} className={styles.change}>
            <Link href={c.story ?? `/science/${c.slug}/`} className={styles.image} tabIndex={-1} aria-hidden>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={asset(`/img/topics/${c.slug}.jpg`)} alt="" width={1200} height={800} loading="lazy" />
            </Link>
            <div className={styles.body}>
              <h2><Link href={c.story ?? `/science/${c.slug}/`}>{c.title}</Link></h2>
              <p className={styles.horizon}>{c.horizon}</p>
              <dl>
                <dt>What is changing</dt><dd>{c.change}</dd>
                <dt>Who and what is exposed</dt><dd>{c.people}</dd>
                <dt>What decision-makers can do</dt><dd>{c.decisions}</dd>
              </dl>
              <p className={styles.links}>
                {c.story && <Link className="button" href={c.story}>{c.storyLabel}</Link>}
                <Link className="more" href={`/science/${c.slug}/`}>Evidence and references</Link>
              </p>
            </div>
          </li>
        ))}
      </ol>
      <p className={`small faint ${styles.credit}`}>Imagery: NASA Blue Marble.</p>

      <section className={styles.risks} aria-labelledby="risks">
        <h2 id="risks">Where the risks fall</h2>
        <p>Regions where several of these changes meet, from the evidence on this site.</p>
        <div className={styles.tableWrap}>
          <table>
            <thead><tr><th scope="col">Region</th><th scope="col">Ocean changes</th><th scope="col">Main sectors exposed</th></tr></thead>
            <tbody>
              <tr><th scope="row">Sahel and West Africa</th><td>Monsoon drying after an <Link href="/changes/atlantic-circulation/">Atlantic circulation</Link> collapse; El Niño</td><td>Rain-fed farming, water</td></tr>
              <tr><th scope="row">South Asia</th><td>Monsoon drying after an Atlantic circulation collapse; sea-level rise in deltas</td><td>Farming, coastal cities</td></tr>
              <tr><th scope="row">Small island states</th><td><Link href="/changes/coral-reefs/">Reef loss</Link> (94% of people live within 100 km of a reef); <Link href="/science/ice-sheets/">sea-level rise</Link></td><td>Coastal protection, fisheries, tourism</td></tr>
              <tr><th scope="row">Southeast Asia</th><td>Reef loss (half of the world’s reef fishers); sea-level rise</td><td>Fisheries, coastal assets</td></tr>
              <tr><th scope="row">Southern Africa, Central America, Indonesia</th><td><Link href="/science/el-nino/">El Niño</Link> droughts</td><td>Food, water, hydropower</td></tr>
              <tr><th scope="row">Pacific coast of South America</th><td>El Niño marine heatwaves and coastal rains</td><td>Anchovy fishery, floods</td></tr>
            </tbody>
          </table>
        </div>
      </section>

      <section className={styles.thresholds} aria-labelledby="thresholds">
        <h2 id="thresholds">Where the tipping thresholds lie</h2>
        <p>
          A tipping point is a level of warming beyond which a system keeps changing on its own, even if warming stops. The chart shows
          scientists’ best estimates of that level for five ocean and ice systems, against today’s warming of about 1.4°C. Passing a
          threshold commits a system to change at very different speeds: reefs within about a decade, ice sheets over thousands of
          years. El Niño is not shown because it is not assessed as a tipping system.
        </p>
        <ThresholdChart />
      </section>
    </div>
  );
}
