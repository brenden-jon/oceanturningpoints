import type { Metadata } from "next";
import Link from "next/link";
import DecisionLens from "@/components/DecisionLens";
import HBars from "@/components/HBars";
import StoryBrief from "@/components/StoryBrief";
import ThresholdChart, { OCEAN_THRESHOLDS } from "@/components/ThresholdChart";
import { ArticleLd } from "@/components/JsonLd";
import { abs, asset } from "@/lib/site";
import styles from "../coral-reefs/coral.module.css";
import own from "../atlantic-circulation/page.module.css";
import PhotoFigure from "@/components/PhotoFigure";

const TITLE = "Could the North Atlantic cool abruptly?";
const DESCRIPTION = "South of Greenland, surface water sinks every winter. In some climate models this stops within a decade, cooling the region by several degrees. What the gyre is, how likely a collapse is, what it would mean and what can be done.";

export const metadata: Metadata = {
  title: "Subpolar gyre collapse: could the North Atlantic cool abruptly?",
  description: DESCRIPTION,
  alternates: { canonical: abs("/changes/subpolar-gyre/") },
  openGraph: { title: TITLE, description: DESCRIPTION, url: abs("/changes/subpolar-gyre/"), images: [abs("/og/science.png")], type: "article", siteName: "Ocean Turning Points" },
};

const SPG = OCEAN_THRESHOLDS.filter((t) => t.id === "spg" || t.id === "amoc");

export default function SubpolarPage() {
  return (
    <article>
      <ArticleLd path="/changes/subpolar-gyre/" title={TITLE} description={DESCRIPTION} about={["Subpolar gyre", "North Atlantic", "Climate tipping points", "Labrador Sea convection"]} />
      <header className={`wrap ${styles.hero}`}>
        <div>
          <p className="label"><Link href="/changes/">Big changes</Link> · Subpolar North Atlantic</p>
          <h1 className={styles.title}>{TITLE}</h1>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img className={styles.heroImg} src={asset("/img/topics/subpolar-gyre.jpg")} alt="" width={1200} height={800} />
        </div>
        <div className={styles.heroSide}>
          <p className={styles.standfirst}>
            If winter sinking south of Greenland stopped, the region could cool by 2–3°C within about a decade, even as the rest of the world
            warms. In climate models it is also the first step towards a wider Atlantic shutdown.
          </p>
          <StoryBrief answers={[
            ["A loop of currents south of Greenland where surface water cools and sinks every winter, one of the engines of the wider Atlantic circulation.", "#what"],
            ["Possible this century: a minority of climate models show collapse, more often among those that best match observations. The tipping threshold is uncertain, about 1.8°C (1.1–3.8°C).", "#likely"],
            ["Abrupt cooling around the North Atlantic, shifts in European weather, changes in tropical rainfall and in fisheries.", "#means"],
            ["Limit warming; include abrupt regional cooling in risk assessments; keep the ocean observing arrays running.", "#decide"],
          ]} />
          <p className={styles.chips}>
            <span className="evidence evidence--model">Model studies</span>
            <span className="evidence evidence--obs">Observations since 2014</span>
            <span className="evidence">Reviewed 25 October 2026</span>
          </p>
        </div>
      </header>

      <section className={`wrap ${own.what}`} aria-labelledby="what">
        <figure className={own.whatFig}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={asset("/img/topics/subpolar-gyre.jpg")} width={1200} height={800}
            alt="Map of the North Atlantic south of Greenland: warm water arrives from the south-west and an anticlockwise loop of cold currents runs around the Labrador and Irminger Seas, where surface water sinks in winter." />
          <figcaption className="small faint">Simplified diagram: warm water arriving (red), the anticlockwise gyre (blue) and the main winter sinking regions. After Buckley and Marshall (2016).</figcaption>
        </figure>
        <div className="prose">
          <p className="kicker">What it is</p>
          <h2 id="what">How the subpolar gyre works</h2>
          <p>
            Warm, salty water from the south enters a large anticlockwise loop of currents between Labrador, Greenland and Iceland. In
            winter, cold air takes its heat, and in the Labrador and Irminger Seas the surface water becomes dense enough to sink, in some
            winters to more than 2,000 m. This sinking helps drive the deep, southward branch of the{" "}
            <Link href="/changes/atlantic-circulation/">Atlantic circulation</Link>.
          </p>
          <p>
            Sinking needs surface water that is cold and salty enough. Warming and extra fresh water from melting ice make it lighter. A
            simple model shows two stable states, with and without winter sinking (Born and Stocker, 2014). A collapse of the gyre would be
            faster and more regional than a collapse of the whole Atlantic circulation, but the two are linked: in every climate model run beyond
            2100, the shutdown of the wider Atlantic overturning is preceded by a collapse of winter sinking in the Labrador, Irminger and Nordic
            Seas around mid-century (Drijfhout et al., 2025).
          </p>
          <PhotoFigure photos={["research-vessel-shetland"]} caption="The research vessel Celtic Explorer at sea off Shetland, August 2014." wide />
        </div>
      </section>

      <section className={`section ${own.band}`} aria-labelledby="likely">
        <div className="wrap">
          <p className="kicker">How likely</p>
          <h2 id="likely" className={styles.h2}>Collapse in climate models</h2>
          <div className={styles.split} style={{ alignItems: "start" }}>
            <div className="prose">
              <p>
                In 7 of 40 older-generation climate models (CMIP5) and 4 of 35 current ones (CMIP6), winter sinking in the gyre collapses
                this century, cooling the region within about a decade (Sgubin et al., 2017; Swingedouw et al., 2021). Collapse is more
                common in the models that best reproduce the observed layering of the ocean: up to 46% and 36% of those subsets.
              </p>
              <p>
                The Global Tipping Points Report 2025 assesses the gyre as a tipping system with medium confidence and says a collapse cannot
                be ruled out at current warming. Its threshold estimate is about 1.8°C of global warming, with a range of 1.1–3.8°C
                (Armstrong McKay et al., 2022). Today’s warming is about 1.4°C.
              </p>
              <p>
                Direct measurements of overturning in the region began only in 2014 (Lozier et al., 2019), and winter sinking in the Labrador
                Sea swings widely: it reached its deepest in the 1996–2023 record in 2018, then shut down in the winters of 2021 and 2023 (Yashayaev, 2024). Measurements also show that most of the
                overturning happens east of Greenland rather than in the Labrador Sea (Lozier et al., 2019), so those two winters do not by themselves
                mean the Atlantic circulation is weakening. The record is too short to say whether the real ocean is close to a threshold.
              </p>
            </div>
            <div className={styles.panel} style={{ background: "var(--bg)" }}>
              <p style={{ margin: "0 0 0.25rem", fontWeight: 600 }}>Climate models in which winter sinking collapses this century</p>
              <p className="small faint" style={{ margin: "0 0 0.9rem" }}>Share of models</p>
              <HBars max={50} labelWidth="13rem" rows={[
                { label: "All CMIP5 models (7 of 40)", value: 17.5, text: "18%", muted: true },
                { label: "CMIP5, 11 most realistic", value: 45.5, text: "46%" },
                { label: "All CMIP6 models (4 of 35)", value: 11.4, text: "11%", muted: true },
                { label: "CMIP6, 11 most realistic", value: 36.4, text: "up to 36%" },
              ]} color="#0a62b8" />
              <p className="small faint" style={{ margin: "0.9rem 0 1.6rem" }}>
                <span className="evidence evidence--model">Model study</span> Sgubin et al. (2017), <i>Nature Communications</i>; Swingedouw et
                al. (2021), <i>Annals of the New York Academy of Sciences</i>. “Most realistic”: closest to observed stratification; small samples.
              </p>
              <ThresholdChart items={SPG} />
            </div>
          </div>
        </div>
      </section>

      <section className="section" aria-labelledby="means">
        <div className="wrap">
          <p className="kicker">What it would mean</p>
          <h2 id="means" className={styles.h2}>Regional cooling within a decade</h2>
          <ul className={styles.stats}>
            <li><b>2–3°C</b><span>cooling around the North Atlantic in the models that show a collapse, within about ten years (Armstrong McKay et al., 2022).</span></li>
            <li><b>~10 years</b><span>for the change to unfold, far faster than an Atlantic circulation collapse or ice-sheet loss.</span></li>
            <li><b>Rainfall</b><span>shifts in the tropics, notably the Sahel and the Amazon, in the CMIP6 collapse events (Swingedouw et al., 2021).</span></li>
          </ul>
          <div className={`prose ${styles.wide}`} style={{ marginTop: "2rem" }}>
            <p>
              A collapse would shift the jet stream and European weather. Recent cold anomalies in the gyre have been followed by summer
              heatwaves in central Europe, a statistical link rather than a rule (Duchez et al., 2016). Plankton, blue whiting and pilot
              whales have moved with past swings of the gyre (Hátún et al., 2009). The economic consequences of a collapse have not been
              quantified.
            </p>
          </div>
        </div>
      </section>

      <section className={`section ${own.band}`} aria-labelledby="decide">
        <div className="wrap">
          <p className="kicker">What can be done</p>
          <h2 id="decide" className={styles.h2}>Risk assessment, monitoring and emissions</h2>
          <div className={styles.responses}>
            <div style={{ background: "var(--bg)" }}><h3>Limit warming</h3><p>Every tenth of a degree avoided lowers the chance of passing a threshold that may already be within reach. <Link href="/responses/#warming">How much emissions must fall</Link>.</p></div>
            <div style={{ background: "var(--bg)" }}><h3>Count it in risk assessments</h3><p>European and North Atlantic climate risk assessments, energy planning and fisheries management can test their plans against an abrupt regional cooling of several degrees.</p></div>
            <div style={{ background: "var(--bg)" }}><h3>Keep the observing arrays running</h3><p>The OSNAP array has measured overturning here only since 2014. A gap now would be permanent. <Link href="/monitoring/">Ocean monitoring</Link>.</p></div>
            <div style={{ background: "var(--bg)" }}><h3>Link signals to decisions</h3><p>Tie observations of winter sinking, salinity and overturning to agreed points at which plans are reviewed.</p></div>
          </div>
        </div>
        <div className="wrap" style={{ marginTop: "2.5rem" }}>
          <h3 style={{ fontSize: "1.2rem", marginBottom: "0.9rem" }}>Which decisions should change</h3>
          <DecisionLens change="subpolar-gyre" />
          <p className="small" style={{ marginTop: "1rem" }}><Link className="more" href="/impacts/?change=subpolar-gyre">What this change means region by region and sector by sector</Link></p>
        </div>
      </section>

      <section className="section" aria-labelledby="data">
        <div className="wrap prose">
          <h2 id="data" className={styles.h2}>Sources</h2>
          <p>
            Sgubin et al. (2017), <i>Nature Communications</i> 8, 14375; Swingedouw et al. (2021), <i>Annals of the New York Academy of
            Sciences</i> 1504; Armstrong McKay et al. (2022), <i>Science</i> 377; Global Tipping Points Report 2025; Born &amp; Stocker (2014),{" "}
            <i>Journal of Physical Oceanography</i> 44; Lozier et al. (2019), <i>Science</i> 363; Drijfhout et al. (2025), <i>Environmental Research Letters</i>, doi:10.1088/1748-9326/adfa3b; Yashayaev (2024), <i>Communications Earth &amp;
            Environment</i> 5; Duchez et al. (2016), <i>Environmental Research Letters</i> 11; Hátún et al. (2009), <i>Progress in
            Oceanography</i> 80; Buckley &amp; Marshall (2016), <i>Reviews of Geophysics</i> 54.{" "}
            <Link href="/science/subpolar-gyre/">Full evidence and references</Link>.
          </p>
        </div>
      </section>
    </article>
  );
}
