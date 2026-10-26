import type { Metadata } from "next";
import Link from "next/link";
import DecisionLens from "@/components/DecisionLens";
import { ArticleLd } from "@/components/JsonLd";
import { LENS_LABELS } from "@/lib/decisions";
import { abs } from "@/lib/site";
import styles from "../changes/coral-reefs/coral.module.css";
import own from "./decisions.module.css";

const TITLE = "How to decide when the future ocean is uncertain";
const DESCRIPTION = "A practical guide to decisions under deep uncertainty for a changing ocean: which decisions to change now, which to assess, and which are robust; adaptive pathways, stress tests, avoiding lock-in, coastal setbacks and no-regret options such as nature-based solutions.";

export const metadata: Metadata = {
  title: "Deciding under deep uncertainty: adaptive pathways, stress tests and no-regret options",
  description: DESCRIPTION,
  alternates: { canonical: abs("/decisions/") },
  openGraph: { title: TITLE, description: DESCRIPTION, url: abs("/decisions/"), images: [abs("/og/science.png")], type: "article", siteName: "Ocean Turning Points" },
};

const CHANGES: { key: Parameters<typeof DecisionLens>[0]["change"]; name: string; href: string }[] = [
  { key: "amoc", name: "Atlantic circulation", href: "/changes/atlantic-circulation/" },
  { key: "ice-sheets", name: "Ice sheets and sea level", href: "/changes/ice-sheets/" },
  { key: "coral-reefs", name: "Coral reefs", href: "/changes/coral-reefs/" },
  { key: "el-nino", name: "El Niño", href: "/changes/el-nino/" },
  { key: "fish", name: "Fish on the move", href: "/changes/fish-on-the-move/" },
  { key: "subpolar-gyre", name: "Subpolar North Atlantic", href: "/changes/subpolar-gyre/" },
  { key: "southern-ocean", name: "Southern Ocean", href: "/changes/southern-ocean/" },
];

export default function DecisionsPage() {
  return (
    <article>
      <ArticleLd path="/decisions/" title={TITLE} description={DESCRIPTION} about={["Decision making under deep uncertainty", "Adaptive pathways", "Climate adaptation", "Nature-based solutions", "Maladaptation"]} />
      <header className={`wrap ${styles.hero}`}>
        <div>
          <p className="label">Decisions</p>
          <h1 className={styles.title}>{TITLE}</h1>
        </div>
        <div className={styles.heroSide}>
          <p className={styles.standfirst}>
            Nobody can say when, or whether, the Atlantic circulation will collapse or how fast the ice sheets will melt. That does not
            mean waiting. It means choosing actions that work across many possible futures, changing now the decisions that would be
            expensive to get wrong, and planning when to look again.
          </p>
          <p className={styles.chips}>
            <a className="more" href="#types">Three kinds of decision</a>
            <a className="more" href="#pathways">Adaptive pathways</a>
            <a className="more" href="#lockin">Avoiding lock-in</a>
            <a className="more" href="#noregret">No-regret options</a>
          </p>
        </div>
      </header>

      <section className="section" aria-labelledby="types" style={{ paddingTop: "1rem" }}>
        <div className="wrap">
          <p className="kicker">The decision lens</p>
          <h2 id="types" className={styles.h2}>Three kinds of decision</h2>
          <div className={own.types}>
            {(["act", "assess", "stay"] as const).map((k) => (
              <div key={k} className={`${own.type} ${own[k]}`}>
                <h3>{LENS_LABELS[k].title}</h3>
                <p>{LENS_LABELS[k].text}</p>
              </div>
            ))}
          </div>
          <div className={`prose ${own.lead}`} style={{ marginTop: "2rem" }}>
            <p>Three questions sort a decision into one of these:</p>
            <ol>
              <li><b>Is it long-lived and hard to reverse?</b> A port, a dam, a new district or a fisheries treaty, rather than a training programme or a seasonal plan.</li>
              <li><b>Is it sensitive to the direction or size of the change?</b> Would it fail if rainfall fell instead of rose, or if the sea rose 2 m instead of 0.6 m?</li>
              <li><b>Would being wrong be severe?</b> Lives, large sums or options for future generations at stake.</li>
            </ol>
            <p>
              If all three are true and the decision is being made now, it belongs in <b>Act now</b>: build in flexibility or safety margins, or
              avoid the commitment. If it is sensitive but not yet being made, <b>Assess now</b>: stress-test it and set the trigger points at
              which to decide. If it pays off across futures, or is cheap to adjust later, <b>Stay the course</b>.
            </p>
            <p className="small faint">
              This lens is the site’s own synthesis. It builds on Hallegatte (2009), who set out no-regret options, reversible and flexible
              options, safety margins, “soft” strategies and shorter decision horizons; on adaptive policy pathways (Haasnoot et al., 2013); and
              on matching the kind of information to the decision (Hinkel et al., 2019).
            </p>
          </div>
        </div>
      </section>

      <section className="section section--alt" aria-labelledby="pathways">
        <div className="wrap">
          <p className="kicker">Principles</p>
          <h2 id="pathways" className={styles.h2}>Robust, adaptive and monitored</h2>
          <div className={styles.responses}>
            <div>
              <h3>Aim for robust, not optimal</h3>
              <p>
                Under deep uncertainty, experts do not know or cannot agree how the system works or how likely different futures are. The best plan
                is then the one that performs acceptably across many plausible futures, not the one tuned to a single forecast. Decision science
                calls this a shift from “predict, then act” to “monitor and adapt” (Lempert et al., 2003; Marchau et al., 2019).
              </p>
            </div>
            <div>
              <h3>Plan pathways, with signposts and triggers</h3>
              <p>
                Adaptive pathways commit to short-term actions within a long-term vision, map the sequence of options like a metro map, and set
                signposts to monitor and trigger points at which to switch (Haasnoot et al., 2013). Each option has an “adaptation tipping point”:
                the moment it stops meeting its goal (Kwadijk et al., 2010). That is a point where a plan fails, distinct from a climate tipping point.
              </p>
            </div>
            <div>
              <h3>Stress-test against high-end outcomes</h3>
              <p>
                For decisions that are long-lived, critical and hard to reverse, use high-end scenarios or upper bounds, not central estimates
                (Hinkel et al., 2019). A stress test asks what would fail, lock in risk or become unaffordable if the change were larger or faster
                than expected, and only goes deeper where the first screen shows exposure (Ray and Brown, 2015).
              </p>
            </div>
            <div>
              <h3>Keep options open, even at some cost</h3>
              <p>
                Designs that can be raised, extended or repurposed, and investments that can be staged, are worth paying a little more for when the
                future is unclear. Long-lived infrastructure is rarely appraised over its full life; counting the cost of switching pathways later
                changes which options look best (Haasnoot et al., 2019).
              </p>
            </div>
          </div>
          <div className={own.case}>
            <h3>In practice: London’s flood defences</h3>
            <p>
              The Thames Estuary 2100 plan does not fix one sea-level forecast. It monitors ten indicators that trigger decision points, and those
              points move earlier if the sea rises faster (Ranger et al., 2013). In 2023 the deadline for deciding how to replace the Thames Barrier
              was brought forward from 2050 to 2040, and the 2026 monitoring review found sea level rising at 4.1 mm a year, now matching the
              plan’s projection (UK Environment Agency). Its high-end scenario changed the long-term options, but not what needed doing first.
            </p>
          </div>
        </div>
      </section>

      <section className="section" aria-labelledby="lockin">
        <div className="wrap">
          <p className="kicker">Act now</p>
          <h2 id="lockin" className={styles.h2}>Avoiding lock-in</h2>
          <div className={styles.split} style={{ alignItems: "start" }}>
            <div className="prose">
              <p>
                Some decisions made today will still stand when the ocean has changed a great deal. The IPCC warns that actions focused on
                short-term gains can lock in vulnerability that is difficult and expensive to change. Seawalls, for example, reduce impacts in the
                short term but can increase exposure in the long term unless they are part of a long-term adaptive plan (<i>high confidence</i>;
                IPCC, 2022).
              </p>
              <p>
                Ignoring sea-level rise beyond 2100 creates a commitment gap: costly retrofits, stranded assets and less time to adapt (Haasnoot
                et al., 2021). After only 0.15 m more rise, about a million people would need to adapt to permanent flooding, and the number exposed
                to a 1-in-100-year flood doubles at 0.75 m.
              </p>
            </div>
            <div className="prose">
              <h3>Coastal setbacks and relocation, handled with care</h3>
              <p>
                Keeping new buildings back from the shore is among the cheapest adaptations, because nothing has been built yet. Setback zones could
                cut the exposure of new urban development by at least half in most EU countries by 2100 (Wolff et al., 2023), and in Croatia
                combining protection with building restrictions cut projected flood costs by up to 39% (Lincke et al., 2020). Mediterranean countries
                have agreed a minimum 100 m no-build zone along the coast, with broad exceptions (Barcelona Convention ICZM Protocol, Article 8).
              </p>
              <p>
                Moving existing communities is different: slow, costly and contested. Past relocations have often been inequitable, and protection
                tends to be affordable mainly in dense, wealthy places (Siders et al., 2019; IPCC, 2022). Where it may be needed, the work on land,
                finance, law and consent has to start decades ahead and involve the people affected (Haasnoot et al., 2021).
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="section section--alt" aria-labelledby="noregret">
        <div className="wrap">
          <p className="kicker">Stay the course</p>
          <h2 id="noregret" className={styles.h2}>No-regret and low-regret options</h2>
          <ul className={styles.stats}>
            <li><b>4–36×</b><span>the cost: estimated benefits of upgrading weather services and early warning in developing countries (Hallegatte, 2012).</span></li>
            <li><b>2–5×</b><span>cheaper: salt marshes and mangroves compared with submerged breakwaters, for waves up to half a metre (Narayan et al., 2016).</span></li>
            <li><b>US$65bn</b><span>a year in flood damage averted by mangroves; reefs halve expected annual flood damage on reef coasts (Menéndez et al., 2020; Beck et al., 2018).</span></li>
            <li><b>3.5×</b><span>average benefit–cost ratio of nature-based coastal options on the US Gulf Coast, led by wetland and oyster-reef restoration (Reguero et al., 2018).</span></li>
          </ul>
          <div className={`prose ${own.lead}`} style={{ marginTop: "2rem" }}>
            <p>
              Early warning, social protection, climate services and risk finance help across almost any future, and work better combined
              (IPCC, 2022). Protecting and restoring mangroves, reefs, marshes and fish stocks pays off now and buys time. Marine protection
              rebuilds fish populations and helps ecosystems recover between shocks. <Link href="/responses/#protect">Protecting the ocean</Link>.
            </p>
            <p>
              These options have limits. Ecosystem-based adaptation loses effectiveness as warming rises, and above 1.5°C some measures will
              stop working (<i>high confidence</i>; IPCC, 2022). Nature-based solutions are not a substitute for cutting emissions (Seddon et al.,
              2021). A reef that protects a coast today may not do so in 2070, so long-lived designs that depend on it belong in Assess now.
            </p>
          </div>
        </div>
      </section>

      <section className="section" aria-labelledby="bychange">
        <div className="wrap">
          <p className="kicker">Applying the lens</p>
          <h2 id="bychange" className={styles.h2}>Decisions for each big change</h2>
          {CHANGES.map((c) => (
            <div key={c.key} className={own.changeBlock}>
              <h3><Link href={c.href}>{c.name}</Link></h3>
              <DecisionLens change={c.key} compact />
            </div>
          ))}
        </div>
      </section>

      <section className="section section--alt" aria-labelledby="amoc">
        <div className="wrap">
          <p className="kicker">A worked example</p>
          <h2 id="amoc" className={styles.h2}>Planning for an Atlantic circulation collapse</h2>
          <div className={`prose ${own.lead}`}>
            <p>
              Most adaptation is directionally robust: if the broad direction of change is known, well-aimed investments pay off even if they are
              imperfectly sized. A collapse of the Atlantic circulation is different, because it could reverse the direction of change in some
              regions, for example structurally drier West African monsoons. Further weakening is a planning concern this century; collapse should
              enter planning as an explicit stress test. Only two of 91 national adaptation plans mention the circulation at all (Jongman and Hall,
              forthcoming).
            </p>
          </div>
          <ol className={own.steps}>
            <li><b>Screen</b> which countries and portfolios are most exposed: monsoon-dependent farming, Atlantic coasts, fisheries.</li>
            <li><b>Stress-test</b> current investments, design standards and climate finance against weakening and collapse scenarios.</li>
            <li><b>Develop robust strategies</b> that work with and without weakening, keeping options open even at somewhat higher cost.</li>
            <li><b>Connect monitoring to decisions</b>, with thresholds at which plans and standards are reviewed.</li>
            <li><b>Reflect the risk in mitigation accounting</b>, carrying a collapse and its carbon-cycle feedback as an explicit scenario.</li>
          </ol>
          <p className={`small muted ${styles.note}`}>
            Steps follow Jongman and Hall (forthcoming); Biesbroek et al. (2025) reach closely matching conclusions. <Link href="/changes/atlantic-circulation/">The Atlantic circulation</Link>.
          </p>
        </div>
      </section>

      <section className="section" aria-labelledby="data">
        <div className="wrap prose">
          <h2 id="data" className={styles.h2}>Sources</h2>
          <p>
            Marchau, V. et al. (eds) (2019), <i>Decision Making under Deep Uncertainty</i>, Springer, doi:10.1007/978-3-030-05252-2; Lempert, R.,
            Popper, S. &amp; Bankes, S. (2003), <i>Shaping the Next One Hundred Years</i>, RAND; Hallegatte, S. (2009), <i>Global Environmental
            Change</i> 19, 240–247; Kwadijk, J. et al. (2010), <i>WIREs Climate Change</i> 1, 729–740; Haasnoot, M. et al. (2013), <i>Global
            Environmental Change</i> 23, 485–498; Haasnoot, M. et al. (2019), <i>Climatic Change</i> 161, 451–463; Haasnoot, M. et al. (2021),{" "}
            <i>Climate Risk Management</i> 34, 100355; Hinkel, J. et al. (2019), <i>Earth’s Future</i> 7, 320–337; Ray, P. &amp; Brown, C. (2015),{" "}
            <i>Confronting Climate Uncertainty in Water Resources Planning and Project Design</i>, World Bank; Ranger, N. et al. (2013), <i>EURO
            Journal on Decision Processes</i> 1, 233–262; UK Environment Agency, Thames Estuary 2100 updates (2023) and 15-year monitoring review
            (2026); IPCC (2022), AR6 Working Group II Summary for Policymakers and Cross-Chapter Paper 2; Wolff, C. et al. (2023), <i>Scientific
            Reports</i> 13, 5515; Lincke, D. et al. (2020), <i>Regional Environmental Change</i> 20, 46; Siders, A. R. et al. (2019), <i>Science</i>{" "}
            365, 761–763; Hallegatte, S. (2012), World Bank Policy Research Working Paper 6058; Narayan, S. et al. (2016), <i>PLoS ONE</i> 11,
            e0154735; Menéndez, P. et al. (2020), <i>Scientific Reports</i> 10, 4404; Beck, M. W. et al. (2018), <i>Nature Communications</i> 9,
            2186; Reguero, B. G. et al. (2018), <i>PLoS ONE</i> 13, e0192132; Seddon, N. et al. (2021), <i>Global Change Biology</i> 27,
            1518–1546; Biesbroek, R. et al. (2025), <i>Regional Environmental Change</i> 25, 93; Jongman, B. &amp; Hall, J. W. (forthcoming).
          </p>
        </div>
      </section>
    </article>
  );
}
