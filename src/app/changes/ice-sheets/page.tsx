import fs from "node:fs";
import path from "node:path";
import type { Metadata } from "next";
import StoryBrief from "@/components/StoryBrief";
import Link from "next/link";
import DecisionLens from "@/components/DecisionLens";
import CommitmentChart from "@/components/CommitmentChart";
import IceSheetCities, { type City } from "@/components/IceSheetCities";
import { GlobalProjectionChart, IceSheetChart, type SeaLevelData } from "@/components/SeaLevelCharts";
import ThresholdChart, { OCEAN_THRESHOLDS } from "@/components/ThresholdChart";
import { ArticleLd } from "@/components/JsonLd";
import { abs, asset } from "@/lib/site";
import styles from "../coral-reefs/coral.module.css";
import own from "./icesheets.module.css";
import PhotoFigure from "@/components/PhotoFigure";

const TITLE = "What if the ice sheets pass their tipping points?";
const DESCRIPTION = "Greenland and West Antarctica have tipping points that would lock in metres of sea-level rise. Where the thresholds lie, whether they have been crossed, how much rise each level of warming commits, how fast it could come, and what it means for coastal investments.";

export const metadata: Metadata = {
  title: "Ice-sheet tipping points and sea-level rise",
  description: DESCRIPTION,
  alternates: { canonical: abs("/changes/ice-sheets/") },
  openGraph: { title: TITLE, description: DESCRIPTION, url: abs("/changes/ice-sheets/"), images: [abs("/og/science.png")], type: "article", siteName: "Ocean Turning Points" },
};

const ICE = OCEAN_THRESHOLDS.filter((t) => t.id === "greenland" || t.id === "wais");

export default function IceSheetsPage() {
  const d = JSON.parse(fs.readFileSync(path.join(process.cwd(), "public", "data", "sealevel", "sealevel.json"), "utf8")) as SeaLevelData & { cities: City[] };
  const g2300 = (id: string) => d.global[id].find((p) => p[0] === 2300)!;
  const lost = d.iceSheets.series.greenland.at(-1)![1] + d.iceSheets.series.antarctica.at(-1)![1];
  return (
    <article>
      <ArticleLd path="/changes/ice-sheets/" title={TITLE} description={DESCRIPTION} about={["Greenland ice sheet", "West Antarctic ice sheet", "Sea-level rise", "Climate tipping points"]} />
      <header className={`wrap ${styles.hero}`}>
        <div>
          <p className="label"><Link href="/changes/">Big changes</Link> · Ice sheets</p>
          <h1 className={styles.title}>{TITLE}</h1>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img className={styles.heroImg} src={asset("/img/topics/ice-sheets.jpg")} alt="" width={1200} height={800} />
        </div>
        <div className={styles.heroSide}>
          <p className={styles.standfirst}>
            The Global Tipping Points Report 2025 has high confidence that the Greenland and West Antarctic ice sheets have tipping
            points, and finds them at risk since about 1°C of warming. Parts may already have crossed. Tipping would not flood coasts
            overnight. It would lock in metres of sea-level rise over centuries to millennia, and nobody can yet say how fast.
          </p>
          <StoryBrief answers={[
            ["Greenland and Antarctica hold enough ice to raise the sea by about 65 m. Past a threshold, feedbacks keep an ice sheet shrinking even if warming stops.", "#commit"],
            ["High confidence that both have tipping points, at risk since about 1°C of warming; whether parts of West Antarctica have already passed one is disputed.", "#threshold"],
            ["Metres of sea-level rise locked in over centuries to millennia. How fast it comes is the main uncertainty for coastal cities, deltas and islands.", "#coasts"],
            ["Keep peak warming as low as possible and bring it back towards 1°C; plan ports, defences and new districts for a high-end rise.", "#decide"],
          ]} />
        </div>
      </header>

      <section className="section" aria-labelledby="commit" style={{ paddingTop: "1rem" }}>
        <div className={`wrap ${styles.split}`}>
          <div className="prose">
            <p className="kicker">The stakes</p>
            <h2 id="commit">Long-term sea-level rise by peak warming</h2>
            <p>
              Ice sheets respond slowly, so today’s warming will play out over centuries. The IPCC estimates that over the next 2,000
              years sea level will rise by about 2–3 m if warming is limited to 1.5°C, 2–6 m if it is limited to 2°C, and 19–22 m at
              5°C (<i>low confidence</i>). The commitment grows faster than warming: each extra degree adds more than the one before.
            </p>
            <p>
              Tipping points are why. Past a threshold, feedbacks keep the ice retreating even if warming stops: a thinning Greenland
              surface sits in warmer air, and West Antarctic glaciers resting on bedrock below sea level retreat into ever deeper water.
            </p>
            <ul className={own.stake}>
              <li><b>7.4 m</b><span>of sea level held in the Greenland ice sheet (Morlighem et al., 2017)</span></li>
              <li><b>3.3 m</b><span>in the part of West Antarctica most prone to runaway retreat (Bamber et al., 2009)</span></li>
              <li><b>58 m</b><span>in the whole Antarctic ice sheet (Fretwell et al., 2013)</span></li>
            </ul>
          </div>
          <div className={styles.panel} style={{ background: "var(--bg-alt)" }}>
            <CommitmentChart />
          </div>
        </div>
      </section>

      <section className="section section--alt" aria-labelledby="threshold">
        <div className="wrap">
          <p className="kicker">Thresholds</p>
          <h2 id="threshold" className={styles.h2}>Thresholds and evidence of crossing</h2>
          <div className={styles.split}>
            <div className="prose">
              <p>
                The Global Tipping Points Report 2025 puts the threshold for Greenland at 0.8–3.4°C of warming and for West Antarctica at
                1–3°C, and suggests a precautionary limit of 0.5°C for West Antarctica. The IPCC judges that a West Antarctic threshold may
                lie close to 1.5–2°C (<i>medium confidence</i>). Today’s warming is about 1.4°C.
              </p>
              <p>
                Once lost, the ice does not come back on any timescale that matters to people. In one model, West Antarctica only
                regrows once temperatures fall at least 1°C below pre-industrial (Garbe et al., 2020).
              </p>
            </div>
            <div className={styles.panel}>
              <ThresholdChart items={ICE} />
            </div>
          </div>
          <div className={own.tableWrap} style={{ marginTop: "2.5rem" }}>
            <table className={own.table}>
              <caption>Has West Antarctica already passed a tipping point? What the studies say</caption>
              <thead><tr><th scope="col">Assessment</th><th scope="col">Finding</th></tr></thead>
              <tbody>
                <tr><th scope="row">IPCC (2021)<span>Assessment</span></th><td>Changes in the Amundsen Sea are “compatible with, but not unequivocally indicating” runaway retreat (<i>medium confidence</i>).</td></tr>
                <tr><th scope="row">Hill et al. (2023)<span>Three ice-sheet models</span></th><td>No sign yet of self-sustaining retreat; today’s retreat is driven by ocean warming.</td></tr>
                <tr><th scope="row">Reese et al. (2023)<span>Ice-sheet model</span></th><td>Irreversible retreat under today’s climate cannot be excluded, but is not yet inevitable.</td></tr>
                <tr><th scope="row">Bett et al. (2024)<span>Coupled ice–ocean model</span></th><td>Thwaites Glacier retreats even with no ocean melting: a tipping point may have been passed.</td></tr>
                <tr><th scope="row">van den Akker et al. (2025)<span>Model ensemble</span></th><td>If today’s climate persists, Thwaites and Pine Island glaciers collapse in every run, over several centuries.</td></tr>
                <tr><th scope="row">Global Tipping Points Report (2025)<span>Synthesis</span></th><td>Parts of the polar ice sheets may already have crossed tipping points.</td></tr>
              </tbody>
            </table>
          </div>
        </div>
      </section>

      <section className="section" aria-labelledby="observed">
        <div className="wrap">
          <p className="kicker">What we observe</p>
          <h2 id="observed" className={styles.h2}>Ice loss has quadrupled since the 1990s</h2>
          <div className={styles.split}>
            <div className="prose">
              <p>
                Satellites show the two ice sheets lost about 11,300 billion tonnes of ice between 1979 and 2023 (Otosaka et al., 2026),
                adding {lost.toFixed(0)} mm to sea level since 1992. The rate of loss rose fourfold between the 1990s and the 2010s
                (IPCC, 2021).
              </p>
              <p>
                In West Antarctica, loss from Thwaites Glacier has increased more than fivefold since the 1990s, and the pattern of
                thinning suggests possible runaway retreat (Goldberg et al., 2026). The ice shelf in front of Pine Island Glacier has lost
                almost all of the resistance that holds the glacier back (Wells-Moran et al., 2026). Signs of faster Antarctic loss could
                become visible within a few decades (IPCC, 2021).
              </p>
            </div>
            <div className={styles.panel} style={{ background: "var(--bg-alt)" }}><IceSheetChart d={d} /></div>
          </div>
        </div>
      </section>

      <section className="section section--alt" aria-labelledby="speed">
        <div className="wrap">
          <p className="kicker">How fast</p>
          <h2 id="speed" className={styles.h2}>Projections to 2300</h2>
          <div className={styles.split}>
            <div className="prose">
              <p>
                The IPCC’s likely range for 2100 is 0.28–0.55 m under very low emissions and 0.63–1.01 m under very high emissions. Under
                very high emissions it cannot rule out a rise approaching 2 m by 2100 and 5 m by 2150, because of ice-sheet processes it
                cannot yet model with confidence.
              </p>
              <p>
                Projections that include those processes reach a median of {g2300("ssp585-low")[2].toFixed(1)} m by 2300 under very high
                emissions, and up to about 16 m. Under very low emissions the median is {g2300("ssp126-low")[2].toFixed(1)} m. The
                fastest scenarios rely on ice cliffs collapsing under their own weight, a process that has not been observed and is
                disputed (Edwards et al., 2019; Morlighem et al., 2024). It affects how fast the sea rises and makes little difference to how far it eventually goes.
              </p>
            </div>
            <div className={styles.panel}><GlobalProjectionChart d={d} /></div>
          </div>
        </div>
      </section>

      <section className="section" aria-labelledby="coasts">
        <div className="wrap">
          <p className="kicker">The coasts</p>
          <h2 id="coasts" className={styles.h2}>What ice-sheet loss would mean for exposed cities</h2>
          <p className={own.intro}>
            Ice lost from Antarctica raises the sea most far from Antarctica, including in the tropics, because the ice sheet’s gravity
            no longer pulls water towards it (Mitrovica et al., 2009). Many of the most exposed cities are also sinking.
          </p>
        </div>
        <div className="wrap">
          <IceSheetCities cities={d.cities} globalLow={{ high: g2300("ssp585-low")[2], low: g2300("ssp126-low")[2] }} />
          <PhotoFigure photos={["ice-shelf-thwaites", "atoll-road-tuvalu"]} caption="The edge of the Thwaites Ice Shelf, West Antarctica, October 2012 (left), and a road along a narrow strip of low-lying atoll land in Tuvalu, 2011 (right)." />
        </div>
      </section>

      <section className="section section--alt" aria-labelledby="decide">
        <div className="wrap">
          <p className="kicker">What decision-makers can do</p>
          <h2 id="decide" className={styles.h2}>Planning for high-end sea-level rise</h2>
          <div className={styles.responses}>
            <div>
              <h3>Keep peak warming as low as possible</h3>
              <p>
                The commitment is set by how high warming peaks and how long it stays there. Ice sheets respond slowly, so a short
                overshoot of 1.5°C may not tip them, but the safe long-term level is likely closer to 1°C (Stokes et al., 2025). A recent
                review calls for warming to peak below 2°C, return below 1.5°C within this century and to about 1°C thereafter (Ritchie et
                al., 2026). <Link href="/responses/">How much emissions must fall</Link>.
              </p>
            </div>
            <div>
              <h3>Test long-lived assets against a high-end rise</h3>
              <p>
                Ports, power plants, airports, delta polders and new urban districts will stand beyond 2100. A single best estimate is the
                wrong basis for them: decision-makers should use high-end scenarios matched to how much risk they can tolerate (Hinkel et
                al., 2019). Only 13% of practitioners surveyed consider a high-end scenario, and use of projections is lower in developing
                countries (Hirschfeld et al., 2023).
              </p>
            </div>
            <div>
              <h3>Keep options open and set triggers</h3>
              <p>
                Adaptive pathways plan a sequence of measures, with agreed sea levels or Antarctic signals at which to switch, and avoid
                building what cannot later be raised or moved. Seawalls without a long-term plan can lock in exposure (IPCC, 2022).
              </p>
            </div>
            <div>
              <h3>Face the adaptation commitment early</h3>
              <p>
                Ignoring rise beyond 2100 creates a commitment gap that leads to costly retrofits and stranded assets (Haasnoot et al.,
                2021). Atoll islands and tropical deltas will reach limits to adaptation first (Magnan et al., 2022), and some may need
                planned relocation.
              </p>
            </div>
          </div>
          <div className={own.cases2}>
            <article>
              <h3>The Netherlands tests its delta plan against Antarctica</h3>
              <p>
                Dutch planners re-examined their coastal strategy against fast Antarctic ice-loss storylines. Sand nourishment could need to
                be up to 20 times larger than today by 2100, storm-surge barriers would close more often until they closed permanently, and
                the expected lifetime of investments would shrink drastically (Haasnoot et al., 2020).
              </p>
            </article>
            <article>
              <h3>Exposure doubles at 0.75 m</h3>
              <p>
                Without further adaptation, the number of people exposed to a 1-in-100-year coastal flood roughly doubles with 0.75 m of
                rise above 2020 and triples at 1.4 m (IPCC, 2022). Under a high-end scenario, 0.75 m could arrive around 2080 (Haasnoot
                et al., 2021). The IPCC finds sea-level rise an existential threat for some small islands and low-lying coasts.
              </p>
            </article>
          </div>
        </div>
        <div className="wrap" style={{ marginTop: "2.5rem" }}>
          <h3 style={{ fontSize: "1.2rem", marginBottom: "0.9rem" }}>Which decisions should change</h3>
          <DecisionLens change="ice-sheets" />
          <p className="small" style={{ marginTop: "1rem" }}><Link className="more" href="/impacts/?change=ice-sheets">What this change means region by region and sector by sector</Link></p>
        </div>
      </section>

      <section className="section" aria-labelledby="data">
        <div className="wrap prose">
          <h2 id="data" className={styles.h2}>About these data and sources</h2>
          <p>
            <b>Projections:</b> IPCC AR6 sea-level projections (Garner et al., 2021, <a href="https://doi.org/10.5281/zenodo.6382554">doi:10.5281/zenodo.6382554</a>,
            CC BY 4.0; method Kopp et al., 2023), relative to 1995–2014. City values are at the nearest suitable tide gauge or 1° grid
            cell, and include vertical land motion estimated from tide gauges but not present-day subsidence that no gauge records.
            The rapid ice-loss values are the IPCC’s low-confidence projections, which include marine ice-cliff instability; the IPCC
            could not assess their likelihood. <b>Commitment:</b> IPCC AR6 WGI Table 9.10 (Fox-Kemper et al., 2021).
            <b> Ice sheets:</b> IMBIE (Otosaka et al., 2026, <a href="https://doi.org/10.1038/s41597-026-08088-0">doi:10.1038/s41597-026-08088-0</a>),
            Open Government Licence. <b>Thresholds:</b> Armstrong McKay et al. (2022) as updated by the Global Tipping Points Report 2025.
          </p>
          <p>
            <b>Studies:</b> Hill et al. (2023) and Reese et al. (2023), <i>The Cryosphere</i> 17; Bett et al. (2024), <i>The Cryosphere</i> 18;
            van den Akker et al. (2025), <i>The Cryosphere</i> 19; Garbe et al. (2020), <i>Nature</i> 585; Goldberg et al. (2026),{" "}
            <i>Geophysical Research Letters</i> 53; Wells-Moran et al. (2026), <i>PNAS</i> 123; Edwards et al. (2019), <i>Nature</i> 566;
            Morlighem et al. (2024), <i>Science Advances</i> 10; Stokes et al. (2025), <i>Communications Earth &amp; Environment</i> 6;
            Ritchie et al. (2026), <i>Environmental Research Letters</i> 21; Hinkel et al. (2019), <i>Earth’s Future</i> 7; Hirschfeld et
            al. (2023), <i>Communications Earth &amp; Environment</i> 4; Haasnoot et al. (2020), <i>Environmental Research Letters</i> 15;
            Haasnoot et al. (2021), <i>Climate Risk Management</i> 34; Magnan et al. (2022), <i>Scientific Reports</i> 12; Mitrovica et al.
            (2009), <i>Science</i> 323; Morlighem et al. (2017), <i>Geophysical Research Letters</i> 44; Bamber et al. (2009),{" "}
            <i>Science</i> 324; Fretwell et al. (2013), <i>The Cryosphere</i> 7. <Link href="/science/ice-sheets/">Full evidence and references</Link>.
          </p>
        </div>
      </section>
    </article>
  );
}
