import type { Metadata } from "next";
import { abs } from "@/lib/site";
import Link from "next/link";
import { HysteresisChart, ObservedChart, ScenarioRunsChart } from "@/components/AmocCharts";
import AmocExplorer from "@/components/AmocExplorer";
import ExplorerLink from "@/components/ExplorerLink";
import { num, rain, rainAt, series, temp, tempAt } from "@/lib/amocData";
import { formatDate, getTopic } from "@/lib/science";
import styles from "./page.module.css";

const TITLE = "What would happen if the Atlantic circulation collapsed?";
const DESCRIPTION =
  "Explore published climate-model experiments of an AMOC collapse: colder winters in northwest Europe in a warming world, and weaker monsoons across West Africa and South Asia.";

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: abs("/changes/atlantic-circulation/") },
  openGraph: { title: TITLE, description: DESCRIPTION, url: abs("/changes/atlantic-circulation/"), images: [abs("/og/amoc-collapse.png")], type: "article", siteName: "Ocean Turning Points" },
  twitter: { card: "summary_large_image", title: TITLE, description: DESCRIPTION, images: [abs("/og/amoc-collapse.png")] },
};

export default function AmocPage() {
  const topic = getTopic("amoc")!;
  const t = temp();
  const r = rain();
  const s = series();
  const models = (r.source.models as string[]).length;

  // Every number below is read from the same files the maps use.
  const london = { pi: tempAt("London", "winter", "pi_on"), off: tempAt("London", "winter", "rcp45_off"), on: tempAt("London", "winter", "rcp45_on") };
  const londonCold = { pi: tempAt("London", "cold-extreme", "pi_on"), off: tempAt("London", "cold-extreme", "rcp45_off") };
  const edinCold = tempAt("Edinburgh", "cold-extreme", "rcp45_off");
  const niamey = rainAt("Niamey", "jja");
  const kano = rainAt("Kano", "jja");
  const mumbai = rainAt("Mumbai", "jja");
  const delhi = rainAt("Delhi", "jja");
  const caracas = rainAt("Caracas", "jja");
  const manaus = rainAt("Manaus", "jja");
  const wam = r.validation["West African monsoon"];
  const runs = s.scenarioRuns.runs;

  const regions = [
    {
      id: "europe", region: "Northwest Europe", figure: `${num(london.off, 1)} °C`,
      lead: `Average winter temperature in London in a world about 2 °C warmer, with the AMOC collapsed, against ${num(london.pi, 1)} °C before industrialisation.`,
      detail: `Once-a-decade cold days fall to about ${num(londonCold.off)} °C in London and ${num(edinCold)} °C in Edinburgh, and winter sea ice spreads far further south. One model (CESM).`,
      query: "show=temperature&var=winter&compare=total-2c-collapse&ice=1&region=europe&view=globe",
    },
    {
      id: "sahel", region: "West Africa and the Sahel", figure: `${num(niamey.mean, 0)}%`,
      lead: `Change in June–August rainfall at Niamey, the four-model average after a collapse. Kano: ${num(kano.mean)}%.`,
      detail: `All four models agree it gets drier; they differ on how much, from ${num(niamey.max)}% to ${num(niamey.min)}% at Niamey. This is the main rainy season for farming across the Sahel.`,
      query: "show=rainfall&season=jja&region=westafrica&view=globe",
    },
    {
      id: "southasia", region: "South Asia", figure: `${num(mumbai.mean)}%`,
      lead: `Change in June–August monsoon rainfall at Mumbai, four-model average. Delhi: ${num(delhi.mean)}%.`,
      detail: `Models range from ${num(mumbai.max)}% to ${num(mumbai.min)}% at Mumbai. Across the whole Indian monsoon region, the published four-model estimate is a fall of about 19% (Ben-Yami et al., 2024).`,
      query: "show=rainfall&season=jja&region=southasia&view=globe",
    },
    {
      id: "americas", region: "Caribbean and South America", figure: `${num(caracas.mean)}%`,
      lead: `Change in June–August rainfall at Caracas. Farther south the pattern flips: Manaus gets ${num(manaus.mean, 0, true)}% in the same season.`,
      detail: "The tropical rain belt moves south, drying Central America, the Caribbean and northern South America while wetting parts of Amazonia and northeast Brazil.",
      query: "show=rainfall&season=jja&region=americas&view=globe",
    },
  ];

  return (
    <article>
      <header className={`wrap ${styles.hero}`}>
        <div>
          <p className="label"><Link href="/changes/">Questions</Link> · Atlantic circulation</p>
          <h1 className={styles.title}>{TITLE}</h1>
        </div>
        <div className={styles.heroSide}>
        <p className={styles.standfirst}>
          A collapse of the Atlantic Meridional Overturning Circulation (AMOC) is considered unlikely this century, but its effects
          would be large. Climate-model experiments show colder winters in northwest Europe even in a warmer world, and weaker
          monsoons for hundreds of millions of people in West Africa and South Asia.
        </p>
        <p className={styles.chips}>
          <span className="evidence evidence--model">Model experiments</span>
          <span className="evidence evidence--obs">Observations to {s.rapid.end.slice(0, 4)}</span>
          <span className="evidence">Reviewed {formatDate(topic.reviewed)}</span>
        </p>
        </div>
      </header>

      <section id="explorer" className={`wrap ${styles.explorer}`} aria-label="Scenario explorer">
        <AmocExplorer />
      </section>

      <section className={`wrap ${styles.reading}`} aria-labelledby="reading">
        <h2 id="reading" className={styles.readingH}>Reading these maps</h2>
        <div className={styles.readingGrid}>
          <div>
            <h3>These are experiments</h3>
            <p>
              The maps show the climate a model settles into once its AMOC has collapsed. Modellers trigger the collapse by adding
              fresh water to the North Atlantic. The results show what a collapse would do. They say nothing about when, or whether,
              one will happen.
            </p>
          </div>
          <div>
            <h3>Collapse alone, or collapse plus warming</h3>
            <p>
              Temperature comes from one model, run in five different states. Some comparisons isolate the collapse. Others show the
              total change since pre-industrial times, combining the cooling with greenhouse warming. Comparisons marked “note” mix
              two model set-ups; the note under the map explains how.
            </p>
          </div>
          <div>
            <h3>Where models agree</h3>
            <p>
              Rainfall is the average of {models} independent models. Dots mark places where all of them agree on whether it gets
              wetter or drier. The table under the map lists each model’s value, so the range is visible.
            </p>
          </div>
        </div>
      </section>

      <section className={`section ${styles.band}`} aria-labelledby="where">
        <div className="wrap">
          <p className="kicker">Consequences</p>
          <h2 id="where" className={styles.h2}>What would a collapse mean where people live?</h2>
          <p className={`lede ${styles.sub}`}>
            Europe’s cooling gets most of the attention. Many more people would be affected by changes in rainfall, as the tropical
            rain belt shifts south and the monsoons of the Northern Hemisphere weaken.
          </p>
          <ul className={styles.regions}>
            {regions.map((x) => (
              <li key={x.id} className={styles.regionCard}>
                <p className="kicker">{x.region}</p>
                <p className={`tnum ${styles.figure}`}>{x.figure}</p>
                <p className={styles.lead}>{x.lead}</p>
                <p className="small muted">{x.detail}</p>
                <ExplorerLink query={x.query} className="more">Show on the map</ExplorerLink>
              </li>
            ))}
          </ul>
          <div className={styles.alsoGrid}>
            <div>
              <h3>Sea level on Atlantic coasts</h3>
              <p className="small">
                As currents reorganise, water piles up in the North Atlantic. In CESM experiments, local sea level rises by up to about
                4 mm a year near densely populated coasts during a collapse, comparable to today’s global average rate (van Westen,
                Katsman &amp; Le Bars, 2026). Not yet mapped here.
              </p>
            </div>
            <div>
              <h3>A warmer south</h3>
              <p className="small">
                Heat no longer carried north stays in the Southern Hemisphere, which warms. This “bipolar seesaw” is seen in models
                and in records of past abrupt climate change. <ExplorerLink query="show=temperature&var=annual&compare=effect-pi&ice=0&region=global&view=globe">See the pattern</ExplorerLink>.
              </p>
            </div>
            <div>
              <h3>Who is most exposed</h3>
              <p className="small">
                The regions facing the largest rainfall changes include some of the poorest, most farming-dependent economies, from the
                Sahel to the Caribbean. Weather shocks already push millions of people into poverty each year (Hallegatte et al., 2016).
              </p>
            </div>
          </div>
          <p className={`small muted ${styles.cardFoot}`}>
            Figures for named places are single model grid cells, about 100–250 km across, from idealised experiments. They indicate
            the direction and rough size of change across a region and should not be read as local forecasts. The four-model average for the West African
            monsoon in our processing is {num(wam.ensembleMeanOfPercent, 1)}%, against {num(wam.published, 1)}% published by Ben-Yami et al. (2024).
          </p>
        </div>
      </section>

      <section className="section" aria-labelledby="observed">
        <div className={`wrap ${styles.split}`}>
          <div className="prose">
            <p className="kicker">What we observe</p>
            <h2 id="observed" className={styles.h2}>Is it already weakening?</h2>
            <p>
              Since 2004, instruments moored across the Atlantic at 26.5°N have measured the circulation directly. It averages
              {" "}{s.rapid.mean} Sv, roughly fifteen times the combined flow of all the world’s rivers, and swings a lot from month to month.
            </p>
            <p>
              The record shows a weaker state since about 2008 (Smeed et al., 2018), but twenty years is too short to separate a
              trend from natural variation. Longer, indirect records disagree: a sea-surface temperature fingerprint suggests a
              decline of about 15% since the mid-twentieth century (Caesar et al., 2018), while a reconstruction from ship-based
              measurements finds no overall decline since 1981 (Worthington et al., 2021).
            </p>
          </div>
          <ObservedChart />
        </div>
      </section>

      <section className={`section ${styles.band}`} aria-labelledby="tipping">
        <div className="wrap">
          <p className="kicker">What could change</p>
          <h2 id="tipping" className={styles.h2}>Why scientists talk about a tipping point</h2>
          <div className={styles.split}>
            <div className="prose">
              <p>
                Dense, salty water sinking in the far north drives the circulation, and the circulation brings salt north. Fresh water
                or warming weakens the sinking, which brings less salt, which weakens it further. Beyond a threshold, this feedback can
                carry the AMOC into a much weaker state that persists even if the push is removed.
              </p>
              <p>
                In this experiment, fresh water is added to the North Atlantic of a climate model very slowly, over 2,200 model
                years. The circulation weakens gradually and then, at about {s.hysteresis.freshwaterAtThatYear?.toFixed(2)} Sv of
                forcing, falls from about 10 Sv to near zero in roughly 150 years, quickly by the standards of this experiment.
              </p>
            </div>
            <HysteresisChart />
          </div>
          <div className={`${styles.split} ${styles.splitGap}`}>
            <div className="prose">
              <p>
                The temperature maps above come from runs started at two points on this curve. Starting closer to the threshold, both
                warming scenarios tip the circulation, to about {num(runs.CESM_1500_RCP45.mean2400to2499, 1)} Sv. Starting further
                away, moderate warming leaves it running at {num(runs.CESM_0600_RCP45.mean2400to2499, 1)} Sv, but high warming
                still brings it down to {num(runs.CESM_0600_RCP85.mean2400to2499, 1)} Sv.
              </p>
              <p>
                Nobody knows where the real ocean sits on a curve like this. That uncertainty is what the scientific debate is about,
                and it is why the same model can produce very different futures.
              </p>
            </div>
            <ScenarioRunsChart />
          </div>
        </div>
      </section>

      <section className="section" aria-labelledby="sure">
        <div className="wrap">
          <p className="kicker">What we know and don’t know</p>
          <h2 id="sure" className={styles.h2}>How likely is a collapse?</h2>
          <div className={styles.split}>
            <div className="prose">
              <p>
                The IPCC’s latest assessment found the AMOC very likely to weaken this century, with medium confidence that it will
                not collapse abruptly before 2100. Research since then has pulled in both directions.
              </p>
              <div className={styles.evidence}>
                <div>
                  <h3>Pointing to higher risk</h3>
                  <ul>
                    <li>Early-warning statistics in the fingerprint record suggest lost stability (Boers, 2021; Ditlevsen &amp; Ditlevsen, 2023).</li>
                    <li>A physics-based indicator places today’s AMOC on a course towards tipping (van Westen et al., 2024).</li>
                    <li>Observation-constrained projections give a ~50% weakening by 2100 (Portmann et al., 2026).</li>
                    <li>CMIP6 runs extended past 2100 shut down in all high-emission cases (Drijfhout et al., 2025).</li>
                    <li>Fast warming can tip the AMOC at lower temperatures than slow warming (van Westen, Börner &amp; Dijkstra, 2026).</li>
                  </ul>
                </div>
                <div>
                  <h3>Pointing to lower risk</h3>
                  <ul>
                    <li>The IPCC assessed a collapse before 2100 as unlikely, with medium confidence (IPCC, 2021).</li>
                    <li>Southern Ocean winds sustain a weakened AMOC in 34 models, even under extreme forcing (Baker et al., 2025).</li>
                    <li>A 30-year reconstruction at 26°N shows no overall decline (Worthington et al., 2021).</li>
                    <li>Statistical early warnings depend on proxies whose link to the AMOC is debated.</li>
                  </ul>
                </div>
              </div>
            </div>
            <div className={styles.confidence}>
              <table>
                <caption>How sure are we?</caption>
                <tbody>
                  {topic.confidence.map((c) => (
                    <tr key={c.claim}>
                      <th scope="row">{c.claim}<span>{c.basis}</span></th>
                      <td><span className={`${styles.level} ${styles[`level_${c.level}`]}`}>{c.level}</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <p className="small muted">
                Full discussion and references: <Link href="/science/amoc/">the AMOC in the science section</Link>.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className={`section ${styles.band}`} aria-labelledby="decide">
        <div className={`wrap ${styles.split}`}>
          <div className="prose">
            <p className="kicker">Why it matters for decisions</p>
            <h2 id="decide" className={styles.h2}>Planning for a risk that may not happen</h2>
            <p>
              On current evidence a collapse is unlikely this century, and planning for it should not displace adaptation that is
              needed now. Dams, ports, irrigation schemes and crop programmes built today will still be in use when the question is
              better understood. The direction of many effects is clearer than their size, so the most useful measures are those that
              help across the range of outcomes.
            </p>
          </div>
          <ol className={styles.steps}>
            <li><strong>Screen exposure.</strong> Identify the countries and sectors most sensitive to a shift in monsoon rainfall or North Atlantic climate.</li>
            <li><strong>Stress-test long-lived investments.</strong> Run an AMOC-collapse scenario alongside standard projections.</li>
            <li><strong>Prefer options that work either way.</strong> Drought-tolerant farming and flexible water storage pay off whether or not the circulation collapses.</li>
            <li><strong>Link monitoring to decisions.</strong> Tie observations from arrays such as RAPID and OSNAP to thresholds that would trigger action.</li>
            <li><strong>Count it in global risk.</strong> Reflect AMOC risk in risk assessments and in the case for limiting both the amount and the rate of warming.</li>
          </ol>
        </div>
        <p className={`wrap small muted ${styles.attrib}`}>
          This framing follows work by <Link href="/about/">Brenden Jongman</Link>, the curator of this site, and Jim Hall on adapting
          to the risk of Atlantic circulation change.
        </p>
      </section>

      <section className="section" aria-labelledby="data">
        <div className="wrap prose">
          <p className="kicker">References and data</p>
          <h2 id="data" className={styles.h2}>About these data</h2>
          <p>
            All data are published, openly licensed model output and observations, processed with a documented, reproducible
            pipeline. Values are not smoothed or re-scaled beyond what is described here. <Link href="/science/methods/">Methods for the whole site</Link>.
          </p>

          <details className="disclosure" open>
            <summary>Temperature: one model, five climate states</summary>
            <div className={styles.disclosureBody}>
              <p>
                Source: van Westen &amp; Baatsen (2025), <em>Geophysical Research Letters</em>, <a href="https://doi.org/10.1029/2025GL114611">doi:10.1029/2025GL114611</a>;
                data <a href="https://doi.org/10.5281/zenodo.15490235">doi:10.5281/zenodo.15490235</a>, CC BY 4.0. Model: CESM 1.0.5, atmosphere about 2°, ocean
                about 1°. Each state is a 100-year average. Greenhouse forcing follows RCP4.5 or RCP8.5 to 2100 and is then held fixed; ice sheets
                are fixed. “+2 °C” and “+4 °C” are approximate global warming in these runs relative to pre-industrial.
              </p>
              <div className={styles.tableWrap}>
                <table className={`${styles.dataTable} tnum`}>
                  <thead><tr><th>State</th><th>Background fresh water</th><th>AMOC</th><th>Model run</th></tr></thead>
                  <tbody>
                    {Object.values(t.scenarios).map((x) => (
                      <tr key={x.run}>
                        <th scope="row">{x.label}</th>
                        <td>{x.freshwaterSv.toFixed(2)} Sv</td>
                        <td>{x.amocSv === null ? "collapsed" : `${x.amocSv.toFixed(1)} Sv`}</td>
                        <td><code>{x.run}</code></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <p>
                We matched the published files to model runs by comparing them with the authors’ run-level data (agreement within about
                0.1 °C). Comparisons between states with the same background fresh water isolate the collapse cleanly; the two that
                mix 0.18 and 0.45 Sv are flagged in the explorer. Cold and hot extremes are once-in-ten-year values from extreme-value
                fits by the original authors. A similar view of these scenarios for Europe is at{" "}
                <a href="https://amocscenarios.org">amocscenarios.org</a>, made by the same research group.
              </p>
            </div>
          </details>

          <details className="disclosure">
            <summary>Rainfall: four models after the same experiment</summary>
            <div className={styles.disclosureBody}>
              <p>
                Method from Ben-Yami et al. (2024), <em>Earth’s Future</em>, <a href="https://doi.org/10.1029/2023EF003959">doi:10.1029/2023EF003959</a>;
                data from NAHosMIP (Jackson, Bellomo et al.), <a href="https://doi.org/10.5281/zenodo.14884357">doi:10.5281/zenodo.14884357</a>, CC BY 4.0,
                protocol <a href="https://doi.org/10.5194/gmd-16-1975-2023">Jackson et al. (2023)</a>. Models: {(r.source.models as string[]).join(", ")}.
              </p>
              <p>
                For each model, rainfall after its AMOC has collapsed, and after the added fresh water has been switched off, is compared
                with the same model’s pre-industrial climate. The difference therefore reflects the collapse itself. Percentage changes are computed per
                model, interpolated to a common 0.5° grid, then averaged. Areas where any model’s control climate gets less than 0.3 mm a day
                are left blank. As the original authors caution, with four models the average shows the pattern where models agree; it is not
                the most accurate prediction.
              </p>
              <p>
                Check against the paper (annual means over approximate regional boxes; the paper’s exact regions differ):
              </p>
              <ul>
                {Object.entries(r.validation).map(([k, v]) => (
                  <li key={k} className="tnum">{k}: ours {num(v.ensembleMeanOfPercent, 1, true)}%, published {num(v.published, 1, true)}%</li>
                ))}
              </ul>
              <p>
                The West African figure matches closely. Our Indian and southern Amazon boxes are approximations of the paper’s regions,
                so these figures differ in size but agree in direction.
              </p>
            </div>
          </details>

          <details className="disclosure">
            <summary>Observations and model time series</summary>
            <div className={styles.disclosureBody}>
              <p>
                RAPID-MOCHA-WBTS array at 26.5°N, v2024.1a, National Oceanography Centre and partners,
                <a href="https://doi.org/10.5285/48d0bf43-0598-ceb2-e063-7086abc062f1"> doi:10.5285/48d0bf43-0598-ceb2-e063-7086abc062f1</a>. Variable: overturning
                transport, 10-day low-pass filtered; we show monthly and calendar-year means. The freshwater experiment is from
                van Westen &amp; Baatsen (2026), <a href="https://doi.org/10.5281/zenodo.18785979">doi:10.5281/zenodo.18785979</a>, described in van Westen, Kliphuis &amp; Dijkstra (2024).
                Scenario-run time series: <a href="https://doi.org/10.5281/zenodo.14586440">doi:10.5281/zenodo.14586440</a>.
              </p>
            </div>
          </details>
        </div>
      </section>
    </article>
  );
}
