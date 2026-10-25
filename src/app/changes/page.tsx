import type { Metadata } from "next";
import Link from "next/link";
import { abs, asset } from "@/lib/site";
import styles from "./changes.module.css";

export const metadata: Metadata = {
  title: "Big changes",
  description: "The large changes under way in the ocean, what they mean for people, and what they mean for decisions.",
  alternates: { canonical: abs("/changes/") },
};

const CHANGES = [
  {
    slug: "amoc", title: "Atlantic circulation", story: "/changes/atlantic-circulation/", storyLabel: "Explore the scenarios",
    change: "Very likely to weaken this century. A collapse is considered unlikely before 2100 but cannot be ruled out.",
    people: "Much colder winters in northwest Europe, weaker monsoons in West Africa and South Asia, and faster sea-level rise on North Atlantic coasts.",
    decisions: "Stress-test long-lived investments against a collapse, and link Atlantic monitoring to decision triggers.",
  },
  {
    slug: "el-nino", title: "El Niño and the tropical Pacific", story: "/ocean-now/", storyLabel: "See today’s El Niño",
    change: "A strong El Niño is under way in 2026. Warming is expected to make El Niño’s rainfall swings larger.",
    people: "Droughts and floods across the tropics, food shortages, collapsing fish catches and coral bleaching, with economic losses that last for years.",
    decisions: "Act on seasonal forecasts with agreed triggers and pre-arranged finance, and size reserves and insurance for stronger events.",
  },
  {
    slug: "coral-reefs", title: "Coral reefs", story: null, storyLabel: "",
    change: "Warm-water reefs are assessed to be crossing their thermal tipping point, estimated at about 1.2°C of global warming.",
    people: "Reefs protect coasts from waves and support fisheries and tourism; about a billion people live within 100 km of one.",
    decisions: "Protect the reefs most likely to survive, reduce local pressures, and plan for weaker natural coastal protection.",
  },
  {
    slug: "ice-sheets", title: "Ice sheets and sea level", story: null, storyLabel: "",
    change: "Greenland and Antarctica are losing ice faster. Sea level will keep rising for centuries; how fast depends on emissions and on ice dynamics that are hard to predict.",
    people: "More frequent coastal flooding, salt water in farmland and aquifers, and loss of land in deltas and on low islands.",
    decisions: "Design coastal infrastructure for a range of sea levels, and keep options open to raise defences or move later.",
  },
  {
    slug: "subpolar-gyre", title: "Subpolar North Atlantic", story: null, storyLabel: "",
    change: "In some climate models, winter convection south of Greenland shuts down within a decade, cooling the region abruptly.",
    people: "Rapid cooling around the North Atlantic, shifts in European weather and changes to fisheries.",
    decisions: "Include abrupt regional cooling in European climate risk assessments, and keep the observing arrays running.",
  },
  {
    slug: "southern-ocean", title: "Southern Ocean", story: null, storyLabel: "",
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
          Six ocean systems are changing in ways that matter for people around the world. For each one: what is changing, what it
          means for people, and what it means for decisions.
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
              <dl>
                <dt>What is changing</dt><dd>{c.change}</dd>
                <dt>What it means for people</dt><dd>{c.people}</dd>
                <dt>What it means for decisions</dt><dd>{c.decisions}</dd>
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
    </div>
  );
}
