import type { Metadata } from "next";
import Link from "next/link";
import DecisionLens from "@/components/DecisionLens";
import { ArticleLd } from "@/components/JsonLd";
import PathwaysMap from "@/components/PathwaysMap";
import { CHANGES } from "@/lib/changes";
import { LENS_LABELS, type LensKey } from "@/lib/decisions";
import { abs } from "@/lib/site";
import styles from "../changes/coral-reefs/coral.module.css";
import own from "./decisions.module.css";
import PhotoFigure from "@/components/PhotoFigure";

const TITLE = "How to decide when the future ocean is uncertain";
const DESCRIPTION = "A practical guide to decisions under deep uncertainty for a changing ocean: which decisions to change now, which to assess, and which are robust; adaptive pathways, stress tests, avoiding lock-in, coastal setbacks and no-regret options such as nature-based solutions.";

export const metadata: Metadata = {
  title: "Deciding under deep uncertainty: adaptive pathways, stress tests and no-regret options",
  description: DESCRIPTION,
  alternates: { canonical: abs("/decisions/") },
  openGraph: { title: TITLE, description: DESCRIPTION, url: abs("/decisions/"), images: [abs("/og/science.png")], type: "article", siteName: "Ocean Turning Points" },
};

const lensKey = (slug: string) => (slug === "fish-on-the-move" ? "fish" : slug) as LensKey;

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
            Whether or when the Atlantic circulation collapses, and how fast the ice sheets melt, cannot be predicted. Decisions can still
            be made: choose actions that work across many possible futures, change now the decisions that would be expensive to get wrong,
            and plan when to look again.
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
          <div className={own.tree}>
            <div className={own.q}><span>1</span>Would the decision fail, or prove costly, if the change were larger, faster or in the other direction?</div>
            <div className={own.branch}>
              <p className={own.answer}>No</p>
              <div className={`${own.type} ${own.stay}`}><h3>{LENS_LABELS.stay.title}</h3><p>{LENS_LABELS.stay.text}</p></div>
            </div>
            <p className={own.yes}>Yes</p>
            <div className={own.q}><span>2</span>Is it long-lived or hard to reverse, and being decided now?</div>
            <div className={own.branch}>
              <p className={own.answer}>Yes</p>
              <div className={`${own.type} ${own.act}`}><h3>{LENS_LABELS.act.title}</h3><p>{LENS_LABELS.act.text}</p></div>
              <p className={own.answer}>Not yet</p>
              <div className={`${own.type} ${own.assess}`}><h3>{LENS_LABELS.assess.title}</h3><p>{LENS_LABELS.assess.text}</p></div>
            </div>
          </div>
          <p className={`small faint ${own.lead}`} style={{ marginTop: "1.5rem" }}>
            This lens is Ocean Turning Points’ own synthesis. It builds on Hallegatte (2009) on no-regret options, flexibility and safety margins;
            on adaptive policy pathways (Haasnoot et al., 2013); and on matching the information to the decision (Hinkel et al., 2019).
          </p>
        </div>
      </section>

      <section className="section section--alt" aria-labelledby="pathways">
        <div className="wrap">
          <p className="kicker">Principles</p>
          <h2 id="pathways" className={styles.h2}>Robust, adaptive and monitored</h2>
          <div className={`prose ${own.lead}`}>
            <p>
              When experts cannot agree how likely different futures are, the best plan is the one that works acceptably across many of them, not
              the one tuned to a single forecast: “monitor and adapt” rather than “predict, then act” (Lempert et al., 2003; Marchau et al., 2019).
              Adaptive pathways put this into practice. Each action works until the change is too large for it, its adaptation tipping point
              (Kwadijk et al., 2010). The plan maps which action can follow which, and watches signposts so the next step is ready in time
              (Haasnoot et al., 2013).
            </p>
          </div>
          <PathwaysMap />
          <div className={own.principles}>
            <div><h3>Stress-test against high-end outcomes</h3><p>For long-lived, critical and hard-to-reverse decisions, use high-end scenarios, not central estimates (Hinkel et al., 2019).</p></div>
            <div><h3>Keep options open</h3><p>Designs that can be raised, extended or staged are worth paying a little more for when the future is unclear (Haasnoot et al., 2019).</p></div>
            <div><h3>Link monitoring to decisions</h3><p>Agree in advance which observations trigger a review, and move the trigger earlier if change speeds up.</p></div>
          </div>
          <div className={own.case}>
            <h3>In practice: London’s flood defences</h3>
            <p>
              The Thames Estuary 2100 plan monitors ten indicators that trigger decision points, which move earlier if the sea rises faster
              (Ranger et al., 2013). In 2023 the deadline for deciding how to replace the Thames Barrier was brought forward from 2050 to 2040;
              the 2026 review found sea level rising at 4.1 mm a year, in line with the plan (UK Environment Agency).
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
                Some decisions made today will still stand when the ocean has changed a great deal. Actions focused on short-term gains can lock
                in vulnerability: seawalls reduce impacts now but can increase exposure later unless they are part of a long-term adaptive plan
                (<i>high confidence</i>; IPCC, 2022). Ignoring sea-level rise beyond 2100 leads to costly retrofits and stranded assets
                (Haasnoot et al., 2021).
              </p>
            </div>
            <div className="prose">
              <h3>Coastal setbacks, handled with care</h3>
              <p>
                Keeping new buildings back from the shore is among the cheapest adaptations, because nothing has been built yet. Setback zones could
                at least halve the exposure of new urban development in most EU countries by 2100 (Wolff et al., 2023). Moving existing communities
                is different: slow, costly and often inequitable, so where it may be needed the work on land, finance and consent has to start
                decades ahead, with the people affected (Siders et al., 2019; Haasnoot et al., 2021).
              </p>
            </div>
          </div>
          <PhotoFigure photos={["sea-defence-tuvalu-reclamation"]} caption="Sandbag walls at Tuvalu’s land reclamation project on Funafuti, October 2025, which is building raised land as a buffer against sea-level rise and storm surges." wide />
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
              Early warning, social protection, risk finance, and protecting and restoring mangroves, reefs, marshes and fish stocks pay off across
              almost any future (IPCC, 2022). <Link href="/responses/#protect">Protecting the ocean</Link>. They have limits: ecosystem-based
              adaptation loses effectiveness as warming rises (<i>high confidence</i>; IPCC, 2022), and it is no substitute for cutting emissions
              (Seddon et al., 2021).
            </p>
          </div>
          <PhotoFigure photos={["mangroves-saloum-senegal"]} caption="Mangroves in the Saloum Delta National Park, Senegal, July 2023." wide />
        </div>
      </section>

      <section className="section" aria-labelledby="bychange">
        <div className="wrap">
          <p className="kicker">Applying the lens</p>
          <h2 id="bychange" className={styles.h2}>Decisions for each big change</h2>
          {CHANGES.map((c, i) => (
            <details key={c.slug} className={own.changeBlock} open={i === 0}>
              <summary><span className={own.changeName}>{c.title}</span><span className={own.changeStatus}>{c.status}</span></summary>
              <DecisionLens change={lensKey(c.slug)} compact />
              <p className="small"><Link className="more" href={`${c.story}${c.slug === "coral-reefs" ? "#responses" : "#decide"}`}>{c.title}: the full story</Link></p>
            </details>
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
              2026).
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
            Steps follow <a href="https://doi.org/10.1038/s41893-026-01961-1">Jongman and Hall (2026)</a>; Biesbroek et al. (2025) reach closely matching conclusions. <Link href="/about/">Brenden Jongman</Link> is the curator of Ocean Turning Points. <Link href="/changes/atlantic-circulation/">The Atlantic circulation</Link>.
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
            <i>Climate Risk Management</i> 34, 100355; Hinkel, J. et al. (2019), <i>Earth’s Future</i> 7, 320–337; Ranger, N. et al. (2013), <i>EURO
            Journal on Decision Processes</i> 1, 233–262; UK Environment Agency, Thames Estuary 2100 updates (2023) and 15-year monitoring review
            (2026); IPCC (2022), AR6 Working Group II Summary for Policymakers and Cross-Chapter Paper 2; Wolff, C. et al. (2023), <i>Scientific
            Reports</i> 13, 5515; Siders, A. R. et al. (2019), <i>Science</i>{" "}
            365, 761–763; Hallegatte, S. (2012), World Bank Policy Research Working Paper 6058; Narayan, S. et al. (2016), <i>PLoS ONE</i> 11,
            e0154735; Menéndez, P. et al. (2020), <i>Scientific Reports</i> 10, 4404; Beck, M. W. et al. (2018), <i>Nature Communications</i> 9,
            2186; Reguero, B. G. et al. (2018), <i>PLoS ONE</i> 13, e0192132; Seddon, N. et al. (2021), <i>Global Change Biology</i> 27,
            1518–1546; Biesbroek, R. et al. (2025), <i>Regional Environmental Change</i> 25, 93; Jongman, B. &amp; Hall, J. W. (2026), <i>Nature Sustainability</i>, doi:10.1038/s41893-026-01961-1.
          </p>
        </div>
      </section>
    </article>
  );
}
