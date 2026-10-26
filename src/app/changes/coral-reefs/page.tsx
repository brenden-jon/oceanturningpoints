import type { Metadata } from "next";
import StoryBrief from "@/components/StoryBrief";
import Link from "next/link";
import DecisionLens from "@/components/DecisionLens";
import BleachingEvents from "@/components/BleachingEvents";
import { ReefFloodSavings, ReefLivelihoods, ReefLongTerm } from "@/components/ReefBenefits";
import ReefMap from "@/components/ReefMap";
import ThresholdChart, { OCEAN_THRESHOLDS } from "@/components/ThresholdChart";
import { ArticleLd } from "@/components/JsonLd";
import { abs } from "@/lib/site";
import { WDPA_CITATION } from "@/lib/wdpa";
import styles from "./coral.module.css";

const TITLE = "Are coral reefs passing a tipping point?";
const DESCRIPTION = "Marine heatwaves are bleaching reefs faster than they can recover. See today’s heat stress, the four global bleaching events, where the tipping threshold lies, and what protection can and cannot do.";

export const metadata: Metadata = {
  title: "Coral reef tipping point: are reefs passing it?",
  description: DESCRIPTION,
  alternates: { canonical: abs("/changes/coral-reefs/") },
  openGraph: { title: TITLE, description: DESCRIPTION, url: abs("/changes/coral-reefs/"), images: [abs("/og/science.png")], type: "article", siteName: "Ocean Turning Points" },
};

export default function CoralPage() {
  return (
    <article>
      <ArticleLd path="/changes/coral-reefs/" title={TITLE} description={DESCRIPTION} about={["Coral reefs", "Coral bleaching", "Climate tipping points", "Coastal protection", "Reef fisheries"]} />
      <header className={`wrap ${styles.hero}`}>
        <div>
          <p className="label"><Link href="/changes/">Big changes</Link> · Coral reefs</p>
          <h1 className={styles.title}>{TITLE}</h1>
        </div>
        <div className={styles.heroSide}>
          <p className={styles.standfirst}>
            Coral reefs are the first large ocean system assessed as passing a tipping point. Close to a billion people live near
            them, and many coasts rely on them to break the waves.
          </p>
          <StoryBrief answers={[
            ["When the sea stays too hot for weeks, corals bleach and many die. Reefs now bleach more often than they can recover.", "#events"],
            ["It is happening now. Reefs are assessed as crossing their thermal tipping point, and IUCN lists 96% of reef ecosystems as Critically Endangered.", "#threshold"],
            ["Weaker natural flood defences, and lost fish and income for many of the billion people who live near reefs.", "#coasts"],
            ["Bring warming back towards 1.2°C and below; protect the reefs most likely to survive; plan for weaker natural defences.", "#responses"],
          ]} />
          <p className={styles.chips}>
            <span className="evidence evidence--obs">Satellite observations, updated weekly</span>
            <span className="evidence">Reviewed 24 October 2026</span>
          </p>
        </div>
      </header>

      <section className="wrap" aria-label="Heat stress at the world’s reefs">
        <ReefMap />
      </section>

      <section className="section" aria-labelledby="events">
        <div className={`wrap ${styles.split}`}>
          <div className="prose">
            <p className="kicker">What we observe</p>
            <h2 id="events">Bleaching is becoming more frequent</h2>
            <p>
              When the sea stays too warm for weeks, corals expel the algae that feed them and turn white. If the heat lasts, they die.
              NOAA has recorded four global bleaching events. In each, a larger share of the world’s reef area was exposed to heat
              strong enough to cause bleaching, and the gap
              between severe events has shrunk from 25–30 years in the early 1980s to about six (Hughes et al., 2018).
            </p>
            <p>
              The fastest-growing corals need 10–15 years to recover. Reefs that bleach every few years do not get that time. Living
              coral cover worldwide has roughly halved since the 1950s (Eddy et al., 2021).
            </p>
          </div>
          <BleachingEvents />
        </div>
      </section>

      <section className="section section--alt" aria-labelledby="threshold">
        <div className="wrap">
          <p className="kicker">What could change</p>
          <h2 id="threshold" className={styles.h2}>The thermal tipping point for reefs</h2>
          <div className={styles.split}>
            <div className="prose">
              <p>
                The Global Tipping Points Report 2025 places the thermal tipping point for warm-water reefs at about 1.2°C of global
                warming, with a range of 1.0–1.5°C, and assesses that reefs are crossing it. Today’s warming is about 1.4°C. Reefs tip
                place by place, so some will last longer than others.
              </p>
              <p>
                The IPCC projects a further 70–90% decline in reefs at 1.5°C of warming (<i>high confidence</i>) and more than 99% at 2°C
                (<i>very high confidence</i>). IUCN’s first global Red List of Ecosystems assessment, published in October 2026,
                classifies 122 of 127 shallow reef ecosystems (96%) as Critically Endangered: at very high risk of collapse within 50
                years under intermediate emissions. IUCN stresses that most reefs still have living coral.
              </p>
              <p>
                These warnings measure different things. The tipping point says warming has passed the level at which reefs as we know
                them can persist at large scale. The IPCC figures say how much reef is projected to be lost at each level of warming.
                The Red List rates the risk that each reef ecosystem collapses within 50 years. Together they say that most reefs are
                still alive, and that most are on course to be lost unless warming is brought back down.
              </p>
              <p>
                How fast corals can adapt is debated, and some studies suggest more scope than the most-cited models (Klein et al.,
                2024). None suggests that today’s reefs can persist at 2°C.
              </p>
            </div>
            <div className={styles.panel}>
              <ThresholdChart items={OCEAN_THRESHOLDS} />
            </div>
          </div>
        </div>
      </section>

      <section className="section" aria-labelledby="coasts">
        <div className="wrap">
          <p className="kicker">Consequences for coasts</p>
          <h2 id="coasts" className={styles.h2}>Coastal protection by reefs</h2>
          <div className={styles.split} style={{ alignItems: "start" }}>
            <div className="prose">
              <p>
                Close to a billion people live within 100 km of a coral reef, in 117 countries; in small island states, 94% do (Sing
                Wong et al., 2022). A healthy reef removes on average 97% of the energy of incoming waves (Ferrario et al., 2014). If
                reefs lost their top metre of structure, a plausible result of degradation, expected annual flood damage on reef
                coasts would double, and damage from a 1-in-100-year storm would rise by 91% to US$272 billion (Beck et al., 2018).
              </p>
              <p>
                In absolute terms the largest savings are in Indonesia, the Philippines, Malaysia, Mexico and Cuba. Relative to the size
                of their economies, small islands such as Belize, Grenada and the Bahamas depend most.
              </p>
              <ReefLongTerm />
              <p style={{ marginTop: "1.5rem" }}>
                The two pressures compound. Dead reefs stop growing and start to erode just as the sea rises, so the water over them
                deepens and larger waves reach the shore. In the Caribbean, more than 70% of reefs are projected to be eroding by 2040,
                and at least 99% by 2100 if warming exceeds 2°C (Perry et al., 2025). Restoration can offset only a few tens of
                centimetres, and only with strong emission cuts.
              </p>
            </div>
            <div className={styles.panel} style={{ background: "var(--bg-alt)" }}>
              <ReefFloodSavings />
            </div>
          </div>
        </div>
      </section>

      <section className="section section--alt" aria-labelledby="livelihoods">
        <div className="wrap">
          <p className="kicker">Consequences for livelihoods</p>
          <h2 id="livelihoods" className={styles.h2}>Fisheries, tourism and livelihoods</h2>
          <div className={`prose ${styles.wide}`}>
            <p>
              About 6 million people fish on coral reefs, half of them in Southeast Asia, and at least a quarter are gleaners collecting
              by hand for food (Teh et al., 2013). Tropical fish are rich in the calcium, iron and zinc that diets
              in many coastal countries lack (Hicks et al., 2019). Catch per unit of fishing effort on reefs has fallen by 60% since 1950,
              and reef-fish catches peaked in 2002 despite rising effort (Eddy et al., 2021).
            </p>
            <p>
              Bleaching does not empty a fishery overnight. In the Seychelles, catches held up for two decades after the 1998 bleaching,
              but became less stable (Robinson et al., 2019). The larger loss comes when dead reefs collapse into rubble: fisheries
              productivity is then at least 35% lower (Rogers et al., 2018). Coral reef fisheries in the tropical Pacific could fall by 20%
              by 2050 under high emissions (Bell et al., 2013).
            </p>
          </div>
          <div className={styles.panel} style={{ marginTop: "2rem" }}>
            <ReefLivelihoods />
          </div>
        </div>
      </section>

      <section className="section section--alt" aria-labelledby="responses">
        <div className="wrap">
          <p className="kicker">Responses</p>
          <h2 id="responses" className={styles.h2}>What protection, restoration and planning can do</h2>
          <div className={styles.responses}>
            <div>
              <h3>Limit warming</h3>
              <p>
                Temperature is the dominant driver. The Global Tipping Points Report concludes that warming must return below 1.2°C,
                and eventually towards 1°C, to keep functional reefs at meaningful scale. Every tenth of a degree avoided reduces how
                often and how badly reefs bleach. <Link href="/responses/#warming">How much emissions must fall</Link>.
              </p>
            </div>
            <div>
              <h3>Protect and manage</h3>
              <p>
                Effective marine protected areas, clean water, sustainable fisheries and control of coral-eating starfish help reefs
                recover between heatwaves. They do little to stop bleaching itself: in 2016 on the Great Barrier Reef, water quality
                and fishing pressure made little difference to how much coral bleached (Hughes et al., 2017). Protection matters most
                for reefs that are coping better with heat. Switch on marine protected areas on the map above to see where they are, or
                see <Link href="/responses/#protect">what protection can achieve worldwide</Link>.
              </p>
            </div>
            <div>
              <h3>Restore and adapt, with care</h3>
              <p>
                Restoration works at the scale of individual sites; the median project covers about 100 square metres
                (Boström-Einarsson et al., 2020) and it cannot be scaled up to replace global losses (Mulà et al., 2025). Breeding
                heat-tolerant corals shows promise in trials (Humanes et al., 2024) and remains experimental.
              </p>
            </div>
            <div>
              <h3>Plan for weaker natural defences</h3>
              <p>
                On reef coasts, flood defences, building codes and land-use plans should be tested against degraded reefs and higher
                seas. Communities that depend on reef fisheries and tourism face transitions that are easier to manage if planned
                early.
              </p>
            </div>
          </div>
          <p className={styles.more}>
            <Link className="more" href="/science/coral-reefs/">Full evidence, uncertainties and 25 references</Link>
          </p>
        </div>
        <div className="wrap" style={{ marginTop: "2.5rem" }}>
          <h3 style={{ fontSize: "1.2rem", marginBottom: "0.9rem" }}>Which decisions should change</h3>
          <DecisionLens change="coral-reefs" />
          <p className="small" style={{ marginTop: "1rem" }}><Link className="more" href="/impacts/?change=coral-reefs">What this change means region by region and sector by sector</Link></p>
        </div>
      </section>

      <section className="section" aria-labelledby="data">
        <div className="wrap prose">
          <h2 id="data" className={styles.h2}>About these data</h2>
          <p>
            <b>Heat stress at reef regions:</b> NOAA Coral Reef Watch regional virtual stations, version 3.1, updated weekly (Skirving et al.,
            2020). Degree Heating Weeks add up how much, and for how long, the sea has been at least 1°C warmer than its usual warmest
            month over the past 12 weeks; 4 °C-weeks is roughly one month at 1°C above that level. NOAA treats 4 and 8 °C-weeks as the
            levels at which reef-wide bleaching, and bleaching with coral deaths, become likely. Use without
            restriction, with credit to NOAA Coral Reef Watch.
          </p>
          <p>
            <b>Marine protected areas:</b> {WDPA_CITATION} Available at <a href="https://www.protectedplanet.net/">protectedplanet.net</a>.
            Displayed through UNEP-WCMC’s map service; not redistributed. <b>Bleaching events:</b> NOAA (2026). <b>Thresholds:</b> Armstrong McKay
            et al. (2022) and the Global Tipping Points Report 2025. <b>IUCN assessment:</b> IUCN Red List of Ecosystems, October 2026.
            <b> Coasts and livelihoods:</b> Beck et al. (2018), <i>Nature Communications</i> 9; Perry et al. (2025), <i>Nature</i> 646;
            Ferrario et al. (2014), <i>Nature Communications</i> 5; Sing Wong et al. (2022), <i>Global Change Biology</i> 28; Teh et al.
            (2013), <i>PLoS ONE</i> 8; Spalding et al. (2017), <i>Marine Policy</i> 82; Hicks et al. (2019), <i>Nature</i> 574; Eddy et al.
            (2021), <i>One Earth</i> 4; Robinson et al. (2019), <i>Nature Ecology &amp; Evolution</i> 3; Rogers et al. (2018), <i>Journal of
            Applied Ecology</i> 55; Bell et al. (2013), <i>Nature Climate Change</i> 3.
          </p>
        </div>
      </section>
    </article>
  );
}
