import fs from "node:fs";
import path from "node:path";
import type { Metadata } from "next";
import Link from "next/link";
import SeaIceChart from "@/components/SeaIceChart";
import { SouthernCarbonChart } from "@/components/SouthernCharts";
import StoryBrief from "@/components/StoryBrief";
import { abs, asset } from "@/lib/site";
import styles from "../coral-reefs/coral.module.css";
import own from "../atlantic-circulation/page.module.css";

const TITLE = "Is the ocean around Antarctica changing course?";
const DESCRIPTION = "The Southern Ocean absorbs much of the heat and carbon people add and feeds the deep ocean with cold, oxygen-rich water. That deep circulation is slowing and Antarctic sea ice has hit record lows. What it means and what can be done.";

export const metadata: Metadata = {
  title: "Southern Ocean",
  description: DESCRIPTION,
  alternates: { canonical: abs("/changes/southern-ocean/") },
  openGraph: { title: TITLE, description: DESCRIPTION, url: abs("/changes/southern-ocean/"), images: [abs("/og/science.png")], type: "article", siteName: "Ocean Turning Points" },
};

export default function SouthernPage() {
  const ice = JSON.parse(fs.readFileSync(path.join(process.cwd(), "public", "data", "now", "sea_ice.json"), "utf8"));
  return (
    <article>
      <header className={`wrap ${styles.hero}`}>
        <div>
          <p className="label"><Link href="/changes/">Big changes</Link> · Southern Ocean</p>
          <h1 className={styles.title}>{TITLE}</h1>
        </div>
        <div className={styles.heroSide}>
          <p className={styles.standfirst}>
            The Southern Ocean is where much of the extra heat and carbon in the climate system goes into the ocean. The cold water that
            sinks around Antarctica is thinning, and sea ice has fallen to record lows since 2016. These are slow changes with global reach.
          </p>
          <StoryBrief answers={[
            ["The ocean circling Antarctica. It takes up a large share of the heat and carbon people add, and the water that sinks there fills and ventilates the deep ocean.", "#what"],
            ["Already under way: bottom water is thinning and its export has slowed in two basins; the IPCC expects the decline to continue (medium confidence). No tipping threshold has been estimated.", "#likely"],
            ["Faster ice-shelf melt and sea-level rise, a possibly weaker ocean carbon sink that shrinks carbon budgets, and pressure on the krill at the base of the Antarctic food web.", "#means"],
            ["Limit warming; protect Antarctic waters through the Antarctic treaty system; manage the krill fishery for a changing ocean; observe the deep ocean.", "#decide"],
          ]} />
          <p className={styles.chips}>
            <span className="evidence evidence--obs">Observations, sea ice updated daily</span>
            <span className="evidence">Reviewed 25 October 2026</span>
          </p>
        </div>
      </header>

      <section className={`wrap ${own.what}`} aria-labelledby="what">
        <figure className={own.whatFig}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={asset("/img/topics/southern-ocean.jpg")} width={1200} height={800}
            alt="Antarctica seen from above, with the fastest surface currents of the surrounding ocean highlighted as a bright ring: the Antarctic Circumpolar Current." />
          <figcaption className="small faint">Surface currents around Antarctica in October 2026; the bright ring is the Antarctic Circumpolar Current. NOAA CoastWatch currents on NASA Blue Marble.</figcaption>
        </figure>
        <div className="prose">
          <p className="kicker">What it is</p>
          <h2 id="what">The ocean that connects all the others</h2>
          <p>
            The Southern Ocean circles Antarctica and links the Atlantic, Indian and Pacific oceans. Deep water rises to the surface here,
            exchanges heat and carbon with the air, and moves north again. Around the Antarctic coast, freezing sea ice leaves salt behind,
            making the densest water in the ocean, which sinks to the sea floor as Antarctic Bottom Water and spreads north.
          </p>
          <p>
            South of 30°S the ocean took up 35–43% of the heat gained by the world’s upper ocean in 1970–2017 (<i>high confidence</i>;
            Meredith et al., 2019). In models it took up about 43% of the carbon the ocean has absorbed from human emissions (Frölicher et
            al., 2015).
          </p>
        </div>
      </section>

      <section className={`section ${own.band}`} aria-labelledby="likely">
        <div className="wrap">
          <p className="kicker">What we observe, and how likely</p>
          <h2 id="likely" className={styles.h2}>Slow changes, already measured</h2>
          <div className={styles.split} style={{ alignItems: "start" }}>
            <div className="prose">
              <p>
                Antarctic Bottom Water has warmed, freshened and thinned for decades (<i>high confidence</i>). Its export from the Australian
                Antarctic Basin fell by 4.0 million cubic metres a second between 1994 and 2009 before partly recovering (Gunn et al., 2023),
                and the volume of the densest bottom water in the Weddell Sea has fallen by about 30% since 1992 (Zhou et al., 2023).
              </p>
              <p>
                The IPCC expects bottom-water formation to keep declining, with medium confidence; models point to meltwater from Antarctic ice
                shelves as the main driver (Li et al., 2023). The Global Tipping Points Report 2025 rates the Southern Ocean overturning as a
                tipping system with medium confidence, but no warming threshold has been estimated.
              </p>
              <p>
                Antarctic sea ice rose slowly to a record high in 2014, then fell sharply, setting a record low in 2023. The 2026 winter maximum
                was the third lowest on record. Whether sea ice has shifted into a lasting new state is uncertain (Hobbs et al., 2024).
              </p>
            </div>
            <div className={styles.panel} style={{ background: "var(--bg)" }}>
              <SeaIceChart h={ice.antarctic} name="Antarctic" y={[0, 24]} />
              <p className="small faint" style={{ margin: "0.6rem 0 0" }}>
                <span className="evidence evidence--obs">Observed</span> NSIDC Sea Ice Index, version 4. Updated daily.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="section" aria-labelledby="means">
        <div className="wrap">
          <p className="kicker">What it would mean</p>
          <h2 id="means" className={styles.h2}>Sea level, the carbon budget and the Antarctic food web</h2>
          <div className={styles.split} style={{ alignItems: "start" }}>
            <div className="prose">
              <p>
                <b>Sea level.</b> As bottom water contracts, warmer deep water reaches the Antarctic continental shelf more easily, where it
                melts ice shelves from below (Li et al., 2023). That is the main way the West Antarctic ice sheet is losing ice.{" "}
                <Link href="/changes/ice-sheets/">Ice sheets and sea level</Link>.
              </p>
              <p>
                <b>Carbon.</b> The Southern Ocean’s carbon uptake weakened in the 1990s and recovered after 2000, variations that current
                models reproduce poorly (Gruber et al., 2019). A weaker sink would leave more carbon in the air and shrink the remaining carbon
                budget for everyone. In one model, a collapse of the Atlantic circulation releases carbon from the Southern Ocean, adding about
                0.2°C of warming (Nian et al., 2026).
              </p>
              <p>
                <b>Krill and fisheries.</b> Krill, the food of whales, seals and penguins, have contracted southward in the South Atlantic sector
                (Atkinson et al., 2019). The krill fishery reached its catch limit and closed early in both 2025 and 2026. Further afield, one model
                finds that nutrients trapped in the Southern Ocean could cut potential fish yields worldwide by more than 20% by 2300 under sustained
                high emissions (Moore et al., 2018).
              </p>
            </div>
            <div className={styles.panel} style={{ background: "var(--bg-alt)" }}>
              <SouthernCarbonChart />
            </div>
          </div>
        </div>
      </section>

      <section className={`section ${own.band}`} aria-labelledby="decide">
        <div className="wrap">
          <p className="kicker">What can be done</p>
          <h2 id="decide" className={styles.h2}>Limit warming, protect Antarctic waters, watch the deep ocean</h2>
          <div className={styles.responses}>
            <div style={{ background: "var(--bg)" }}><h3>Limit warming</h3><p>Meltwater from ice shelves is the main projected driver, and ice-shelf melt follows ocean warming. A recent review finds that stabilising climate with minimal overshoot of 1.5°C is imperative (Abram et al., 2025). <Link href="/responses/#warming">How much emissions must fall</Link>.</p></div>
            <div style={{ background: "var(--bg)" }}><h3>Protect Antarctic waters</h3><p>The Ross Sea marine protected area, in force since 2017, covers 1.55 million km², 72% of it closed to commercial fishing. Proposals for East Antarctica, the Weddell Sea and the Antarctic Peninsula have not been agreed since 2016. Protection shields ecosystems from fishing; it cannot stop warming.</p></div>
            <div style={{ background: "var(--bg)" }}><h3>Manage krill for a changing ocean</h3><p>Researchers propose catch limits that follow the krill stock and its variable recruitment, and restoring limits on where catches are taken (Meyer et al., 2025).</p></div>
            <div style={{ background: "var(--bg)" }}><h3>Observe the deep ocean</h3><p>Standard Argo floats measure only the top 2,000 m. Deep floats, repeat ship sections and biogeochemical floats are needed to track bottom water and carbon. <Link href="/monitoring/">Ocean monitoring</Link>.</p></div>
          </div>
        </div>
      </section>

      <section className="section" aria-labelledby="data">
        <div className="wrap prose">
          <h2 id="data" className={styles.h2}>Sources</h2>
          <p>
            Meredith et al. (2019), IPCC Special Report on the Ocean and Cryosphere, Chapter 3; Frölicher et al. (2015), <i>Journal of Climate</i> 28;
            Gunn et al. (2023), <i>Nature Climate Change</i> 13; Zhou et al. (2023), <i>Nature Climate Change</i> 13; Li et al. (2023), <i>Nature</i>{" "}
            615; Hobbs et al. (2024), <i>Journal of Climate</i> 37; Gruber et al. (2019), <i>Annual Review of Marine Science</i> 11; Nian et al. (2026),{" "}
            <i>Communications Earth &amp; Environment</i> 7; Atkinson et al. (2019), <i>Nature Climate Change</i> 9; Moore et al. (2018), <i>Science</i>{" "}
            359; Abram et al. (2025), <i>Nature</i> 644; Meyer et al. (2025), <i>PNAS</i> 122; Global Tipping Points Report 2025; IPCC AR6 Working Group I.
            Sea ice: NSIDC Sea Ice Index v4. Carbon uptake: MPI-SOM-FFN v2025, NOAA NCEI 0160558. Ross Sea MPA: CCAMLR Conservation Measure 91-05.{" "}
            <Link href="/science/southern-ocean/">Full evidence and references</Link>.
          </p>
        </div>
      </section>
    </article>
  );
}
