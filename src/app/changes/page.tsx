import type { Metadata } from "next";
import Link from "next/link";
import ThresholdChart from "@/components/ThresholdChart";
import { ALSO_FOLLOWED, CHANGES } from "@/lib/changes";
import { abs, asset } from "@/lib/site";
import styles from "./changes.module.css";

export const metadata: Metadata = {
  title: "Big changes",
  description: "The large changes under way in the ocean: what each one is, how likely it is, what it would mean, and what can be done.",
  alternates: { canonical: abs("/changes/") },
};


export default function Changes() {
  return (
    <div className="wrap">
      <header className={styles.head}>
        <h1 className={styles.title}>The big changes</h1>
        <p className="lede">
          Six big ocean changes matter for development, investment and public finance. For each, four questions:
          what it is, how likely the change is, what it would mean for people and economies, and what can be done about it.
        </p>
        <ul className={styles.subnav}>
          <li><Link href="/future/"><b>The future ocean</b><span>What is already expected, and three futures at 1.5, 2.7 and 4°C</span></Link></li>
          <li><Link href="/impacts/"><b>Impacts by region and sector</b><span>What the changes mean for your region, from food and water to coasts and public finance</span></Link></li>
          <li><Link href="/decisions/"><b>How to decide</b><span>Which decisions to change now, which to assess and which are robust</span></Link></li>
        </ul>
      </header>



      <ol className={styles.changes}>
        {CHANGES.map((c) => (
          <li key={c.slug} className={styles.change}>
            <figure className={styles.image}>
              <Link href={c.story || `/science/${c.slug}/`} tabIndex={-1} aria-hidden>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={asset(c.card ?? `/img/topics/${c.slug}.jpg`)} alt="" width={1200} height={800} loading="lazy" />
              </Link>
              <figcaption className="small faint">{c.image}{c.cardCredit ? <> {c.cardCredit}.</> : null}</figcaption>
            </figure>
            <div className={styles.body}>
              <h2><Link href={c.story || `/science/${c.slug}/`}>{c.title}</Link></h2>
              <dl>
                <dt>What is it?</dt><dd>{c.what}</dd>
                <dt>How likely is it?</dt><dd>{c.likely}</dd>
                <dt>What would it mean?</dt><dd>{c.means}</dd>
                <dt>What can be done?</dt><dd>{c.done}</dd>
              </dl>
              <p className={styles.links}>
                {c.story && <Link className="button" href={c.story}>{c.storyLabel}</Link>}
                {c.science !== false && <Link className="more" href={`/science/${c.slug}/`}>Evidence and references</Link>}
              </p>
            </div>
          </li>
        ))}
      </ol>
      <aside className={styles.also} aria-label="Also followed">
        <p className="label">Also followed</p>
        {ALSO_FOLLOWED.map((a) => (
          <p key={a.slug}><Link href={a.href}><b>{a.title}</b></Link>: {a.text}</p>
        ))}
      </aside>
      <p className={`small faint ${styles.credit}`}>
        Images: NOAA Coral Reef Watch (reefs, El Niño); NASA Blue Marble (ice sheets, Southern Ocean) with NOAA CoastWatch currents;
        circulation diagrams after Buckley and Marshall (2016). <Link href="/responses/">What can be done across all of them</Link>.
      </p>

      <section className={styles.risks} aria-labelledby="risks">
        <h2 id="risks">Where the risks fall</h2>
        <p>Regions where several of these changes meet, from the evidence on this site.</p>
        <div className={styles.tableWrap}>
          <table>
            <thead><tr><th scope="col">Region</th><th scope="col">Ocean changes</th><th scope="col">Main sectors exposed</th></tr></thead>
            <tbody>
              <tr><th scope="row">Sahel and West Africa</th><td>Monsoon drying after an <Link href="/changes/atlantic-circulation/">Atlantic circulation</Link> collapse; El Niño</td><td>Rain-fed farming, water</td></tr>
              <tr><th scope="row">South Asia</th><td>Monsoon drying after an Atlantic circulation collapse; sea-level rise in deltas</td><td>Farming, coastal cities</td></tr>
              <tr><th scope="row">Small island states</th><td><Link href="/changes/coral-reefs/">Reef loss</Link> (94% of people live within 100 km of a reef); <Link href="/changes/ice-sheets/">sea-level rise</Link></td><td>Coastal protection, fisheries, tourism</td></tr>
              <tr><th scope="row">Southeast Asia</th><td>Reef loss (half of the world’s reef fishers); sea-level rise</td><td>Fisheries, coastal assets</td></tr>
              <tr><th scope="row">Southern Africa, Central America, Indonesia</th><td><Link href="/science/el-nino/">El Niño</Link> droughts</td><td>Food, water, hydropower</td></tr>
              <tr><th scope="row">Pacific coast of South America</th><td>El Niño marine heatwaves and coastal rains</td><td>Anchovy fishery, floods</td></tr>
            </tbody>
          </table>
        </div>
      </section>

      <section className={styles.thresholds} aria-labelledby="thresholds">
        <h2 id="thresholds">Tipping points in context</h2>
        <p>
          A tipping point is a level of warming beyond which a system keeps changing on its own, even if warming stops. The chart shows
          scientists’ best estimates of that level for five ocean and ice systems, against today’s warming of about 1.4°C. The estimates
          are wide ranges, based on models, observations and past climates.
        </p>
        <ThresholdChart />
        <div className={styles.context}>
          <div>
            <h3>Change starts before any threshold</h3>
            <p>
              Living coral cover has roughly halved since the 1950s, the ice sheets are losing ice ever faster, and the Atlantic circulation
              is very likely to weaken this century whether or not it tips. These gradual changes already matter for decisions.
            </p>
          </div>
          <div>
            <h3>What crossing a threshold means</h3>
            <p>
              Passing a threshold sets the direction, not the speed: reefs change within about a decade, the Atlantic circulation over
              decades to centuries, ice sheets over thousands of years. Bringing warming back down quickly can still limit the damage.
            </p>
          </div>
        </div>
        <h3 className={styles.termsH}>How to read the warnings</h3>
        <div className={styles.tableWrap}>
          <table className={styles.terms}>
            <thead><tr><th scope="col">When you read…</th><th scope="col">It means</th><th scope="col">Example</th></tr></thead>
            <tbody>
              <tr><th scope="row">“Crossing a tipping point”</th><td>Warming has passed the level beyond which the system keeps changing on its own. It says nothing about how fast.</td><td>Warm-water coral reefs (Global Tipping Points Report 2025)</td></tr>
              <tr><th scope="row">“Critically Endangered”</th><td>An ecosystem faces a very high risk of collapse within about 50 years. Much of it can still be alive today.</td><td>122 of 127 shallow coral reef ecosystems (IUCN Red List of Ecosystems, 2026)</td></tr>
              <tr><th scope="row">“Very likely”, “likely”</th><td>IPCC probability terms: very likely means 90–100%, likely means 66–100%.</td><td>The Atlantic circulation will very likely weaken this century</td></tr>
              <tr><th scope="row">“Medium confidence”</th><td>How strong and consistent the IPCC judges the evidence to be, separate from probability.</td><td>Medium confidence that the Atlantic circulation will not collapse before 2100</td></tr>
              <tr><th scope="row">“Cannot be ruled out”, “low likelihood, high impact”</th><td>An outcome too uncertain to give a probability, but serious enough to plan for.</td><td>Sea-level rise approaching 2 m by 2100 (IPCC, 2021)</td></tr>
              <tr><th scope="row">“A planetary boundary has been crossed”</th><td>Humanity has left the range considered safe for a stable Earth system. Risk rises; it is not a point of sudden change.</td><td>Ocean acidification (Planetary Health Check 2025)</td></tr>
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
