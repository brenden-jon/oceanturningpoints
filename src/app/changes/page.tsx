import type { Metadata } from "next";
import Link from "next/link";
import ThresholdChart from "@/components/ThresholdChart";
import { abs, asset } from "@/lib/site";
import styles from "./changes.module.css";

export const metadata: Metadata = {
  title: "Big changes",
  description: "The large changes under way in the ocean: what each one is, how likely it is, what it would mean, and what can be done.",
  alternates: { canonical: abs("/changes/") },
};

const CHANGES = [
  {
    slug: "el-nino", title: "El Niño and the tropical Pacific", story: "/changes/el-nino/", storyLabel: "How El Niño is changing",
    image: "Sea temperature compared with normal across the Pacific in October 2026: the red tongue along the equator is El Niño.",
    what: "A natural warming of the eastern tropical Pacific every few years that shifts rain and drought around the world. A strong El Niño is under way in 2026.",
    likely: "El Niño will keep coming. Stronger extremes under warming are expected (medium confidence); a lasting El Niño-like Pacific is plausible but contested. It is not assessed as a tipping system.",
    means: "Droughts and floods across the tropics, food shortages, disease outbreaks and sharp falls in fish catches, with economic losses that last for years.",
    done: "Act on seasonal forecasts with agreed triggers and pre-arranged finance; size reserves and insurance for stronger events. Earlier net zero limits the long-term shift.",
  },
  {
    slug: "coral-reefs", title: "Coral reefs", story: "/changes/coral-reefs/", storyLabel: "See heat stress at every reef region",
    image: "Peak heat stress at reef regions of the Indian Ocean and Pacific in 2023–2025; darker red means coral deaths were likely.",
    what: "When the sea stays too hot for weeks, corals bleach and many die. Reefs now bleach more often than they can recover.",
    likely: "Happening now. Reefs are assessed as crossing their thermal tipping point, about 1.2°C of warming (range 1.0–1.5°C), and IUCN lists 96% of reef ecosystems as Critically Endangered.",
    means: "About a billion people live within 100 km of a reef. Losing reefs weakens natural flood defences and cuts fish and tourism income.",
    done: "Bring warming back towards 1.2°C and below; protect the reefs most likely to survive and reduce local pressures; plan for weaker natural defences.",
  },
  {
    slug: "ice-sheets", title: "Ice sheets", story: "/changes/ice-sheets/", storyLabel: "Thresholds, commitment and the coast",
    image: "The Greenland and Antarctic ice sheets, which together hold enough ice to raise the sea by about 65 metres.",
    what: "Greenland and Antarctica are losing ice four times faster than in the 1990s. Past a threshold, feedbacks keep an ice sheet shrinking even if warming stops.",
    likely: "High confidence that both have tipping points, at risk since about 1°C of warming. Whether parts of West Antarctica have already passed one is disputed.",
    means: "Metres of sea-level rise, locked in over centuries to millennia. How fast it comes is the main uncertainty for coasts, deltas and islands.",
    done: "Keep peak warming low and bring it back towards 1°C; test ports, defences and new districts against a high-end rise.",
  },
  {
    slug: "amoc", title: "Atlantic circulation", story: "/changes/atlantic-circulation/", storyLabel: "Explore the scenarios",
    image: "The Atlantic overturning circulation: warm water flows north near the surface (red), sinks in the far north and returns south at depth (blue).",
    what: "A system of currents that carries warm water north through the Atlantic and cold water back south at depth. It keeps northwest Europe mild and holds the tropical rain belts in place.",
    likely: "Weakening this century is very likely. A collapse is a low-likelihood, high-impact risk: the IPCC has medium confidence it will not happen before 2100, and newer studies disagree.",
    means: "Much colder winters in northwest Europe, weaker monsoons in West Africa and South Asia, and faster sea-level rise on North Atlantic coasts, lasting centuries.",
    done: "Limit both the amount and the speed of warming; stress-test long-lived investments against a collapse and favour measures that help either way.",
  },
  {
    slug: "subpolar-gyre", title: "Subpolar North Atlantic", story: null, storyLabel: "",
    image: "The subpolar gyre: an anticlockwise loop of currents south of Greenland, with the winter sinking regions in the Labrador and Irminger Seas.",
    what: "A loop of currents south of Greenland where surface water sinks every winter, one of the engines of the Atlantic circulation.",
    likely: "Possible this century: in a minority of climate models winter sinking shuts down within a decade. Threshold estimate about 1.8°C, with a wide range (1.1–3.8°C).",
    means: "Rapid regional cooling around the North Atlantic, shifts in European weather, and changes to fisheries.",
    done: "Include abrupt regional cooling in European climate risk assessments, and keep the ocean observing arrays running.",
  },
  {
    slug: "southern-ocean", title: "Southern Ocean", story: null, storyLabel: "",
    image: "Surface currents around Antarctica in October 2026: the bright band is the Antarctic Circumpolar Current.",
    what: "The ocean around Antarctica absorbs much of the heat and carbon people add, and forms the dense water that fills the deep ocean.",
    likely: "Slow changes are under way: dense-water formation is declining in key regions, and Antarctic sea ice has been at record lows since 2016.",
    means: "Changes feed back on global warming and sea level, and affect the krill fishery at the base of the Antarctic food web.",
    done: "Sustain Southern Ocean observations, and do not assume the ocean carbon sink will keep pace.",
  },
];

export default function Changes() {
  return (
    <div className="wrap">
      <header className={styles.head}>
        <h1 className={styles.title}>The big changes</h1>
        <p className="lede">
          Six ocean systems are changing in ways that matter for development, investment and public finance. For each, four questions:
          what it is, how likely the change is, what it would mean for people and economies, and what can be done about it. They are
          ordered by how soon they demand attention.
        </p>
      </header>



      <ol className={styles.changes}>
        {CHANGES.map((c) => (
          <li key={c.slug} className={styles.change}>
            <figure className={styles.image}>
              <Link href={c.story ?? `/science/${c.slug}/`} tabIndex={-1} aria-hidden>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={asset(`/img/topics/${c.slug}.jpg`)} alt="" width={1200} height={800} loading="lazy" />
              </Link>
              <figcaption className="small faint">{c.image}</figcaption>
            </figure>
            <div className={styles.body}>
              <h2><Link href={c.story ?? `/science/${c.slug}/`}>{c.title}</Link></h2>
              <dl>
                <dt>What is it?</dt><dd>{c.what}</dd>
                <dt>How likely is it?</dt><dd>{c.likely}</dd>
                <dt>What would it mean?</dt><dd>{c.means}</dd>
                <dt>What can be done?</dt><dd>{c.done}</dd>
              </dl>
              <p className={styles.links}>
                {c.story && <Link className="button" href={c.story}>{c.storyLabel}</Link>}
                <Link className="more" href={`/science/${c.slug}/`}>Evidence and references</Link>
              </p>
            </div>
          </li>
        ))}
      </ol>
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
        <h2 id="thresholds">Tipping points are one part of the picture</h2>
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
            <h3>Crossing is not the same as collapse</h3>
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
