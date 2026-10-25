import fs from "node:fs";
import path from "node:path";
import type { Metadata } from "next";
import Link from "next/link";
import FishMap from "@/components/FishMap";
import HBars from "@/components/HBars";
import StoryBrief from "@/components/StoryBrief";
import { abs } from "@/lib/site";
import styles from "../coral-reefs/coral.module.css";
import own from "./fish.module.css";

const TITLE = "Where will the fish go?";
const DESCRIPTION = "Warming is shrinking the fish the ocean can hold and moving stocks towards the poles and across borders. Projections for every coastal country, the die-offs already seen, who depends most on fish, and what can be done.";

export const metadata: Metadata = {
  title: "Fish on the move",
  description: DESCRIPTION,
  alternates: { canonical: abs("/changes/fish-on-the-move/") },
  openGraph: { title: TITLE, description: DESCRIPTION, url: abs("/changes/fish-on-the-move/"), images: [abs("/og/science.png")], type: "article", siteName: "Ocean Turning Points" },
};

interface Summary { median: Record<string, number>; declining: Record<string, number>; countries: number; continents: Record<string, Record<string, number>> }

export default function FishPage() {
  const s = JSON.parse(fs.readFileSync(path.join(process.cwd(), "public", "data", "fish", "summary.json"), "utf8")) as Summary;
  const conts = Object.entries(s.continents).sort((a, b) => a[1].ssp585_2100 - b[1].ssp585_2100);
  return (
    <article>
      <header className={`wrap ${styles.hero}`}>
        <div>
          <p className="label"><Link href="/changes/">Big changes</Link> · Fish on the move</p>
          <h1 className={styles.title}>{TITLE}</h1>
        </div>
        <div className={styles.heroSide}>
          <p className={styles.standfirst}>
            A warmer ocean holds fewer fish, and the fish it holds are moving towards the poles and across borders. The countries that
            depend most on fish for food and income have the least room to adapt.
          </p>
          <StoryBrief answers={[
            ["Warming shrinks the amount of fish the ocean can support and shifts where they live. Marine heatwaves can wipe out whole stocks within a year or two.", "#observed"],
            ["Already under way: warming cut sustainable fish yields by 4% over 1930–2010. Models project about 5% less fish for every degree of warming (medium confidence).", "#likely"],
            ["Less food and income for coastal communities, lost revenue for small island states, and disputes over stocks that cross borders.", "#stakes"],
            ["Limit warming, end overfishing, and adapt quotas and agreements as stocks move. Rebuilt and protected stocks cope better.", "#decide"],
          ]} />
          <p className={styles.chips}>
            <span className="evidence evidence--model">Model projections</span>
            <span className="evidence evidence--obs">Observed changes</span>
            <span className="evidence">Reviewed 25 October 2026</span>
          </p>
        </div>
      </header>

      <section className="wrap" aria-label="Projected change in fish biomass by country">
        <FishMap />
      </section>

      <section className="section" aria-labelledby="observed">
        <div className="wrap">
          <p className="kicker">What we observe</p>
          <h2 id="observed" className={styles.h2}>Fish are already moving, and some stocks have collapsed</h2>
          <div className={styles.split} style={{ alignItems: "start" }}>
            <div className="prose">
              <p>
                Fish and other marine animals have moved towards the poles by about 59 km a decade since the 1950s (IPCC, 2022,{" "}
                <i>high confidence</i>). Warming reduced the sustainable yield of 235 fish populations by 4.1% between 1930 and 2010, and
                by 15–35% in five regions (Free et al., 2019). Catches around the world are increasingly made up of warm-water species
                (Cheung et al., 2013).
              </p>
              <p>
                The sharpest losses come from marine heatwaves. The IPCC finds with high confidence that they have caused the collapse of
                regional fisheries and aquaculture. Where heat combines with heavy fishing, a stock can collapse and fail to recover, the
                closest that fisheries come to a tipping point.
              </p>
            </div>
            <ul className={own.events}>
              <li><b>−71%</b><span>Pacific cod in the Gulf of Alaska after the 2014–16 marine heatwave, a fishery worth US$103 million (Barbeaux et al., 2020).</span></li>
              <li><b>10 billion</b><span>snow crabs vanished from the Bering Sea after the 2018–19 heatwave (Szuwalski et al., 2023).</span></li>
              <li><b>−90%</b><span>bull kelp along 350 km of northern California after 2014, closing a US$44 million abalone fishery (Rogers-Bennett and Catton, 2019).</span></li>
              <li><b>5 years</b><span>of consecutive mass die-offs across the Mediterranean, 2015–2019, affecting 50 groups of species (Garrabou et al., 2022).</span></li>
            </ul>
          </div>
        </div>
      </section>

      <section className="section section--alt" aria-labelledby="likely">
        <div className="wrap">
          <p className="kicker">How likely</p>
          <h2 id="likely" className={styles.h2}>Less fish almost everywhere if emissions stay high</h2>
          <div className={styles.split} style={{ alignItems: "start" }}>
            <div className="prose">
              <p>
                Ecosystem models project about 5% less marine animal life for every degree of warming (Lotze et al., 2019). By 2100 the
                latest model ensemble projects a 19% decline under very high emissions and 7% under very low emissions (Tittensor et al.,
                2021). The IPCC gives a range of about 6% to 16% with medium confidence.
              </p>
              <p>
                Country by country, the fish that national waters can hold falls by a median of {Math.abs(s.median.ssp585_2100)}% by the
                2090s under very high emissions, and in {s.declining.ssp585_2100} of {s.countries} countries. Under very low emissions the
                median loss is {Math.abs(s.median.ssp126_2100)}%. The biggest losses are in the tropics, including Papua New Guinea, the
                Solomon Islands, Senegal and Peru, but countries such as Norway and the United Kingdom also lose (Blanchard and Novaglio, 2024).
              </p>
              <div className={own.box}>
                <h3>Is this a tipping point?</h3>
                <p>
                  Partly. The global decline is gradual, roughly in step with warming. Individual systems can tip: the Global Tipping
                  Points Report 2023 has high confidence that cod fisheries and kelp forests can pass tipping points, from which recovery
                  is slow. Newfoundland’s cod took more than two decades to recover only partly after its collapse.
                </p>
              </div>
            </div>
            <figure className={styles.panel} style={{ margin: 0 }}>
              <p style={{ margin: "0 0 0.25rem", fontWeight: 600 }}>Median change in fish biomass by the 2090s, by continent</p>
              <p className="small faint" style={{ margin: "0 0 0.9rem" }}>Countries’ national waters, relative to 2005–2014</p>
              <p className={own.key}><i style={{ background: "#c8452c" }} />Very high emissions <i style={{ background: "#9aa5b1", marginLeft: "1rem" }} />Very low emissions</p>
              {conts.map(([c, v]) => (
                <div key={c} className={own.group}>
                  <p>{c}</p>
                  <HBars max={35} labelWidth="none" rows={[
                    { label: `${c} high`, value: -v.ssp585_2100, text: `${v.ssp585_2100}%` },
                    { label: `${c} low`, value: -v.ssp126_2100, text: `${v.ssp126_2100}%`, muted: true },
                  ]} color="#c8452c" />
                </div>
              ))}
              <figcaption className="small faint" style={{ marginTop: "0.8rem" }}>
                <span className="evidence evidence--model">Projection</span> FishMIP ensemble, Blanchard and Novaglio (eds) (2024), FAO
                Technical Paper 707. Bars show the size of the loss.
              </figcaption>
            </figure>
          </div>
        </div>
      </section>

      <section className="section" aria-labelledby="stakes">
        <div className="wrap">
          <p className="kicker">What it would mean</p>
          <h2 id="stakes" className={styles.h2}>Food, jobs and public revenue</h2>
          <ul className={styles.stats}>
            <li><b>65 million</b><span>people work in fishing and fish farming, 85% of them in Asia (FAO, 2026).</span></li>
            <li><b>40%+</b><span>of the world’s people get at least a fifth of their animal protein from fish and other aquatic foods (FAO, 2026).</span></li>
            <li><b>Up to 84%</b><span>of government revenue comes from tuna fishing licences in some Pacific island states (FAO, 2026).</span></li>
            <li><b>US$90 million</b><span>a year in tuna access fees lost by 10 Pacific island states by 2050 under high emissions, as tuna move to the high seas (Bell et al., 2021).</span></li>
            <li><b>23%</b><span>of fish stocks shared between countries will have shifted by 2030, affecting 78% of national waters (Palacios-Abrantes et al., 2022).</span></li>
            <li><b>×3</b><span>the fishing pressure, and half the fish, in regions without strong fisheries management (Hilborn et al., 2020).</span></li>
          </ul>
          <p className={`small faint ${styles.note}`}>
            Fish matter most for nutrition in tropical countries, where reef and coastal fish supply iron, zinc and calcium that diets
            lack (Hicks et al., 2019). Reef fisheries are covered on the <Link href="/changes/coral-reefs/#livelihoods">coral reefs</Link> page.
          </p>
        </div>
      </section>

      <section className="section section--alt" aria-labelledby="decide">
        <div className="wrap">
          <p className="kicker">What can be done</p>
          <h2 id="decide" className={styles.h2}>Healthy stocks cope better with a warming ocean</h2>
          <div className={styles.responses}>
            <div>
              <h3>Limit warming</h3>
              <p>
                The difference between emissions pathways is the largest lever: a median loss of {Math.abs(s.median.ssp126_2100)}% against{" "}
                {Math.abs(s.median.ssp585_2100)}% by the 2090s. Mitigation lowers the risk for almost all of 25,000 species assessed, and
                benefits food-insecure people in low-income countries most (Boyce et al., 2022). <Link href="/responses/#warming">How much emissions must fall</Link>.
              </p>
            </div>
            <div>
              <h3>End overfishing</h3>
              <p>
                The IPCC finds with very high confidence that management that eliminates overfishing helps fisheries adapt. Where stocks
                are assessed and managed, they are on average increasing (Hilborn et al., 2020). Rebuilt stocks partly offset losses from
                warming, especially under low emissions (FAO, 2026).
              </p>
            </div>
            <div>
              <h3>Plan for stocks that move</h3>
              <p>
                Quotas, licences and agreements built on where fish used to be will come under strain as stocks cross borders. Agreements
                that can adjust shares as fish move reduce the risk of conflict and lost revenue; governance is not yet prepared for this
                (Pinsky et al., 2018).
              </p>
            </div>
            <div>
              <h3>Protect and restore</h3>
              <p>
                Fully protected areas rebuild fish populations, and fish spill over into nearby fisheries. Plan nutrition and livelihoods
                for coastal communities where catches are projected to fall most. <Link href="/responses/#recover">Where the ocean has recovered</Link>.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="section" aria-labelledby="data">
        <div className="wrap prose">
          <h2 id="data" className={styles.h2}>About these data and sources</h2>
          <p>
            <b>Map and continent chart:</b> FishMIP ensemble projections of exploitable fish biomass (10 g to 100 kg, without fishing) in
            national waters, relative to 2005–2014: Blanchard, J. L. &amp; Novaglio, C. (eds) (2024), FAO Fisheries and Aquaculture Technical
            Paper 707, <a href="https://doi.org/10.4060/cd1379en">doi:10.4060/cd1379en</a>; data <a href="https://doi.org/10.5281/zenodo.13988998">doi:10.5281/zenodo.13988998</a>{" "}
            (Apache-2.0). Country shapes: Natural Earth.
          </p>
          <p>
            <b>Studies:</b> IPCC AR6 Working Group II, Chapter 3 (Cooley et al., 2022); Free et al. (2019), <i>Science</i> 363; Cheung et al.
            (2013), <i>Nature</i> 497; Lotze et al. (2019), <i>PNAS</i> 116; Tittensor et al. (2021), <i>Nature Climate Change</i> 11; Barbeaux
            et al. (2020), <i>Frontiers in Marine Science</i> 7; Szuwalski et al. (2023), <i>Science</i> 382; Rogers-Bennett &amp; Catton (2019),{" "}
            <i>Scientific Reports</i> 9; Garrabou et al. (2022), <i>Global Change Biology</i> 28; Bell et al. (2021), <i>Nature Sustainability</i> 4;
            Palacios-Abrantes et al. (2022), <i>Global Change Biology</i> 28; Pinsky et al. (2018), <i>Science</i> 360; Hilborn et al. (2020), <i>PNAS</i> 117; Boyce et al. (2022),{" "}
            <i>Nature Climate Change</i> 12; Hicks et al. (2019), <i>Nature</i> 574; FAO (2026), <i>The State of World Fisheries and
            Aquaculture 2026</i>; Global Tipping Points Report 2023.
          </p>
        </div>
      </section>
    </article>
  );
}
