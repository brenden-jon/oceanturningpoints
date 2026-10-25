import fs from "node:fs";
import path from "node:path";
import type { Metadata } from "next";
import Link from "next/link";
import BleachingEvents from "@/components/BleachingEvents";
import OceanNowGlobe from "@/components/OceanNowGlobe";
import ThresholdChart, { OCEAN_THRESHOLDS } from "@/components/ThresholdChart";
import { abs } from "@/lib/site";
import styles from "./coral.module.css";

const TITLE = "Are coral reefs passing a tipping point?";
const DESCRIPTION = "Marine heatwaves are bleaching reefs faster than they can recover. See today’s heat stress, the four global bleaching events, where the tipping threshold lies, and what protection can and cannot do.";

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: abs("/changes/coral-reefs/") },
  openGraph: { title: TITLE, description: DESCRIPTION, url: abs("/changes/coral-reefs/"), images: [abs("/og/science.png")], type: "article", siteName: "Ocean Turning Points" },
};

export default function CoralPage() {
  const m = JSON.parse(fs.readFileSync(path.join(process.cwd(), "public", "data", "now", "manifest.json"), "utf8"));
  return (
    <article>
      <header className={`wrap ${styles.hero}`}>
        <div>
          <p className="label"><Link href="/changes/">Big changes</Link> · Coral reefs</p>
          <h1 className={styles.title}>{TITLE}</h1>
        </div>
        <div className={styles.heroSide}>
          <p className={styles.standfirst}>
            Warm-water reefs are bleaching more often than they can recover. The Global Tipping Points Report 2025 assesses that,
            at today’s warming of about 1.4°C, reefs are crossing their thermal tipping point. Close to a billion people live near
            them, and many coasts rely on them to break the waves.
          </p>
          <p className={styles.chips}>
            <span className="evidence evidence--obs">Satellite observations, updated daily</span>
            <span className="evidence">Reviewed 24 October 2026</span>
          </p>
        </div>
      </header>

      <section className="wrap" aria-label="Coral heat stress today">
        <OceanNowGlobe ssta={m.ssta} dhw={m.dhw} currents={m.currents} bleachOutlook={m.bleachingOutlook} sstOutlook={m.sstOutlook} initialLayer="dhw" initialView="coral" protectedAreas />
      </section>

      <section className="section" aria-labelledby="events">
        <div className={`wrap ${styles.split}`}>
          <div className="prose">
            <p className="kicker">What we observe</p>
            <h2 id="events">Bleaching has become a near-annual threat</h2>
            <p>
              When the sea stays too warm for weeks, corals expel the algae that feed them and turn white. If the heat lasts, they die.
              NOAA has recorded four global bleaching events. Each has reached more of the world’s reefs than the last, and the gap
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
          <h2 id="threshold" className={styles.h2}>The first tipping point assessed as being crossed</h2>
          <div className={styles.split}>
            <div className="prose">
              <p>
                The Global Tipping Points Report 2025 places the thermal tipping point for warm-water reefs at about 1.2°C of global
                warming, with a range of 1.0–1.5°C. With warming now about 1.4°C, it assesses that tipping is likely under way. Reefs
                tip reef by reef and region by region, so some will persist for longer than others.
              </p>
              <p>
                The IPCC projects a further 70–90% decline in reefs at 1.5°C of warming (<i>high confidence</i>) and more than 99% at 2°C
                (<i>very high confidence</i>). IUCN’s first global Red List of Ecosystems assessment, published in October 2026,
                classifies 122 of 127 shallow reef ecosystems (96%) as Critically Endangered: at very high risk of collapse within 50
                years under intermediate emissions. IUCN stresses that most reefs still have living coral.
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

      <section className="section" aria-labelledby="people">
        <div className="wrap">
          <p className="kicker">Consequences</p>
          <h2 id="people" className={styles.h2}>What reefs do for people</h2>
          <ul className={styles.stats}>
            <li><b>~1 billion</b><span>people live within 100 km of a coral reef, in 117 countries; in small island developing states, 94% do (Sing Wong et al., 2022).</span></li>
            <li><b>97%</b><span>of incoming wave energy is removed by reefs on average, most of it at the reef crest (Ferrario et al., 2014).</span></li>
            <li><b>×2</b><span>expected annual flood damage on reef coasts if reefs lost their top metre, and three times the damage from frequent storms (Beck et al., 2018).</span></li>
            <li><b>US$272bn</b><span>damage from a 100-year storm on reef coasts without that protection, up 91% (Beck et al., 2018).</span></li>
            <li><b>6 million</b><span>people fish on coral reefs, half of them in Southeast Asia, many collecting by hand for food (Teh et al., 2013).</span></li>
            <li><b>US$36bn</b><span>a year in reef tourism, about 9% of coastal tourism value in reef countries (Spalding et al., 2017).</span></li>
          </ul>
          <p className={`small faint ${styles.note}`}>
            Flood figures compare today’s reefs with reefs that have lost their top metre of structure, a plausible result of
            degradation; they are model estimates of avoided damage. The largest absolute savings accrue to Indonesia, the
            Philippines, Malaysia, Mexico and Cuba. Living near a reef indicates possible dependence, which varies widely.
          </p>
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
                often and how badly reefs bleach.
              </p>
            </div>
            <div>
              <h3>Protect and manage</h3>
              <p>
                Effective marine protected areas, clean water, sustainable fisheries and control of coral-eating starfish help reefs
                recover between heatwaves. They do little to stop bleaching itself: in 2016 on the Great Barrier Reef, water quality
                and fishing pressure made little difference to how much coral bleached (Hughes et al., 2017). Protection matters most
                for reefs that are coping better with heat. Switch on marine protected areas on the globe above to see where they are.
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
      </section>

      <section className="section" aria-labelledby="data">
        <div className="wrap prose">
          <h2 id="data" className={styles.h2}>About these data</h2>
          <p>
            <b>Heat stress and sea-surface temperature:</b> NOAA Coral Reef Watch daily 5 km products, version 3.1 (Skirving et al.,
            2020), shown at 0.25°, refreshed daily. Degree Heating Weeks sum the heat above the warmest month of a normal year over the
            past 12 weeks; 4 and 8 °C-weeks are NOAA’s risk levels for reef-wide bleaching and for bleaching with mortality. Use without
            restriction, with credit to NOAA Coral Reef Watch.
          </p>
          <p>
            <b>Marine protected areas:</b> World Database on Protected Areas, UNEP-WCMC and IUCN (2026), Protected Planet, displayed
            through UNEP-WCMC’s map service; not redistributed. <b>Bleaching events:</b> NOAA (2026). <b>Thresholds:</b> Armstrong McKay
            et al. (2022) and the Global Tipping Points Report 2025. <b>IUCN assessment:</b> IUCN Red List of Ecosystems, October 2026.
          </p>
        </div>
      </section>
    </article>
  );
}
