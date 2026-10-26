import type { Metadata } from "next";
import Link from "next/link";
import PathwaysChart from "@/components/PathwaysChart";
import { MpaCoverageChart, MpaMap, ProtectionFinanceChart, ProtectionQuality } from "@/components/ProtectionCharts";
import { ArticleLd } from "@/components/JsonLd";
import { abs } from "@/lib/site";
import { WDPA_CITATION } from "@/lib/wdpa";
import styles from "../changes/coral-reefs/coral.module.css";
import own from "./responses.module.css";

const TITLE = "What can be done about the big ocean changes?";
const DESCRIPTION = "How far emissions must fall to keep ocean and ice tipping points out of reach, what marine protection can and cannot do to make the ocean more resilient, every marine protected area on one map, and how protection is paid for.";

export const metadata: Metadata = {
  title: "What can be done: emissions, marine protection and ocean finance",
  description: DESCRIPTION,
  alternates: { canonical: abs("/responses/") },
  openGraph: { title: TITLE, description: DESCRIPTION, url: abs("/responses/"), images: [abs("/og/science.png")], type: "article", siteName: "Ocean Turning Points" },
};

export default function ResponsesPage() {
  return (
    <article>
      <ArticleLd path="/responses/" title={TITLE} description={DESCRIPTION} about={["Climate mitigation", "Marine protected areas", "30x30", "Ocean finance"]} />
      <header className={`wrap ${styles.hero}`}>
        <div>
          <p className="label">What can be done</p>
          <h1 className={styles.title}>{TITLE}</h1>
        </div>
        <div className={styles.heroSide}>
          <p className={styles.standfirst}>
            Three things, working on different timescales. Cutting emissions is the only way to keep tipping thresholds out of reach,
            and the world is not on track. Protecting the ocean now helps reefs, fish stocks and coasts recover between shocks, though
            it cannot stop the heat. And changes that can no longer be avoided have to be planned for.
          </p>
          <p className={styles.chips}>
            <a className="more" href="#warming">Limit warming</a>
            <a className="more" href="#protect">Protect the ocean</a>
            <a className="more" href="#recover">The ocean can recover</a>
            <a className="more" href="#finance">Pay for protection</a>
          </p>
        </div>
      </header>

      <section className="section" aria-labelledby="warming" style={{ paddingTop: "1rem" }}>
        <div className="wrap">
          <p className="kicker">1 · Limit warming</p>
          <h2 id="warming" className={styles.h2}>How much emissions must fall</h2>
          <div className={`prose ${own.lead}`}>
            <p>
              Today’s policies lead to about 2.8°C of warming by 2100, and the full set of national pledges to about 2.6°C (UNEP, 2026).
              Both pass the estimated thresholds for coral reefs, the ice sheets and the subpolar North Atlantic, and enter the range
              in which an Atlantic circulation collapse becomes possible. Holding warming to 1.5°C without overshooting it is no longer
              possible. The fastest feasible cuts would still peak at about 1.8°C before carbon removal brings warming back down.
            </p>
          </div>
          <div className={styles.panel} style={{ background: "var(--bg-alt)", marginTop: "2rem" }}>
            <PathwaysChart />
          </div>
          <ul className={own.stats}>
            <li><b>130 Gt</b><span>of CO₂ left from the start of 2026 for an even chance of holding warming to 1.5°C: a little more than three years of current emissions (Forster et al., 2026).</span></li>
            <li><b>−45%</b><span>cut in greenhouse gas emissions by 2035, from 2025 levels, on the fastest feasible path. Countries’ pledges deliver 11–15% (UNEP, 2026).</span></li>
            <li><b>+0.1°C</b><span>added to peak warming by every five more years of emissions at today’s level (UNEP, 2026).</span></li>
            <li><b>320 Gt</b><span>of CO₂ to be removed from the air this century to bring warming back below 1.5°C on that path, about eight years of 2024 emissions (UNEP, 2026).</span></li>
          </ul>
          <p className={`small faint ${own.note}`}>
            Warming values are those the world would likely not exceed (a 66% chance). Carbon budgets shift by about 200 Gt either way
            depending on how far methane and other gases are cut.
          </p>

          <div className={`prose ${own.lead}`} style={{ marginTop: "3rem" }}>
            <h3>Peak warming and overshoot both matter</h3>
            <p>
              In a model of four interacting tipping systems (Greenland, West Antarctica, the Atlantic circulation and the Amazon),
              following current policies this century commits the world to a 45% risk that at least one tips by 2300, even if
              temperatures are later brought back below 1.5°C. Paths that overshoot 1.5°C by less than 0.1°C keep that risk below 1%
              (Möller et al., 2024). A recent review concludes that warming must peak below 2°C, return below 1.5°C within this
              century and fall to about 1°C after that (Ritchie et al., 2026).
            </p>
          </div>
          <div className={own.byChange}>
            <div>
              <h3><Link href="/changes/coral-reefs/">Coral reefs</Link></h3>
              <p>Fast-responding systems such as reefs are especially vulnerable to overshoot (Ritchie et al., 2026). Keeping functional reefs at scale needs warming back below 1.2°C and eventually towards 1°C (Global Tipping Points Report 2025). Until then, protection decides which reefs come through.</p>
            </div>
            <div>
              <h3><Link href="/changes/ice-sheets/">Ice sheets</Link></h3>
              <p>Slow to respond, so a short overshoot may not tip them, but each degree of peak warming commits metres of eventual sea-level rise. The safe long-term level is likely closer to 1°C (Stokes et al., 2025).</p>
            </div>
            <div>
              <h3><Link href="/changes/atlantic-circulation/">Atlantic circulation</Link></h3>
              <p>There is some evidence that the circulation responds to how fast the world warms as well as how far, so limiting the rate of warming could itself be a goal (Global Tipping Points Report 2025).</p>
            </div>
            <div>
              <h3><Link href="/changes/el-nino/">El Niño</Link></h3>
              <p>In model runs, every delay in reaching net zero made the shift to a more El Niño-like Pacific larger and longer-lasting (Sengupta et al., 2026).</p>
            </div>
          </div>
        </div>
      </section>

      <section className="section section--alt" aria-labelledby="protect">
        <div className="wrap">
          <p className="kicker">2 · Protect the ocean</p>
          <h2 id="protect" className={styles.h2}>Protecting the ocean now</h2>
          <div className={`prose ${own.lead}`}>
            <p>
              Warming sets the pressure; local pressures decide how much a system can take. Overfishing, pollution and habitat loss can
              lower the point at which reefs tip (Ritchie et al., 2026). Well-run protected areas remove some of those pressures and help
              ecosystems recover between shocks. Governments have agreed to protect 30% of the ocean by 2030, through areas that are
              “effectively conserved and managed” (Kunming-Montreal Global Biodiversity Framework, Target 3).
            </p>
          </div>
          <div style={{ marginTop: "2rem" }}>
            <MpaMap />
          </div>
          <div className={own.two}>
            <div className={own.card}><MpaCoverageChart /></div>
            <div className={own.card}><ProtectionQuality /></div>
          </div>
          <div className={`prose ${own.lead}`} style={{ marginTop: "2.5rem" }}>
            <p>
              About 10% of the ocean is now in protected areas, up from 3% in 2010. Most of it lies in national waters, where 23% is
              protected. On the high seas, which cover 61% of the ocean, it is under 2% (Protected Planet, October 2026). The High Seas
              Treaty entered into force on 17 January 2026 and makes high-seas protected areas possible for the first time; its first
              meeting of the parties is due in January 2027. Strong protection is rarer: 3.5% of the ocean is fully or highly protected
              in areas that are actually in place (MPAtlas, October 2026).
            </p>
          </div>

          <div className={own.evidenceGrid}>
            <div>
              <h3>What protection does</h3>
              <ul>
                <li>Fish biomass in no-take reserves is typically about three times that of comparable fished areas (median +194% across 124 reserves; Lester et al., 2009).</li>
                <li>Reserves that are no-take, enforced, old, large and isolated hold five times the biomass of large fish and 14 times the shark biomass of fished areas. Most protected areas have only one or two of these features and look like fished sites (Edgar et al., 2014).</li>
                <li>On the Great Barrier Reef, reef communities inside protected zones recovered 20% faster after disturbances (Mellin et al., 2016).</li>
                <li>Fish spill over to nearby fisheries: tuna catch rates rose near Hawaii’s expanded Papahānaumokuākea monument (Medoff et al., 2022).</li>
                <li>Mangroves avert more than US$65 billion of flood damage a year; without them 15 million more people would be flooded every year (Menéndez et al., 2020).</li>
              </ul>
            </div>
            <div>
              <h3>What it cannot do</h3>
              <ul>
                <li>Protection gives little or no resistance to extreme heat. During the 2016 bleaching on the Great Barrier Reef, local protection and water quality made little difference (Hughes et al., 2017).</li>
                <li>After mass bleaching in the Seychelles, being in a no-take reserve did not predict which reefs recovered (Graham et al., 2015).</li>
                <li>Protected areas warm like everywhere else: under very high emissions, climate change emerges by mid-century in 42% of no-take reserves (Bruno et al., 2018).</li>
                <li>So where protection goes matters. Choosing reefs with the best chance of coping with heat and reseeding others, as in a global portfolio of 50 reef areas, spreads the risk (Beyer et al., 2018).</li>
                <li>Paper parks do little. Protected areas with adequate staff had effects 2.9 times larger than those without (Gill et al., 2017).</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      <section className="section" aria-labelledby="recover">
        <div className="wrap">
          <p className="kicker">The ocean can recover</p>
          <h2 id="recover" className={styles.h2}>Examples of recovery</h2>
          <div className={`prose ${own.lead}`}>
            <p>
              The changes on this site are serious, but they are not the whole story. Marine life recovers, often faster than expected,
              when fishing, hunting and habitat loss are brought under control. A review of decades of evidence concluded that substantial
              recovery of marine life is achievable by 2050, if the major pressures, including climate change, are reduced (Duarte et al.,
              2020).
            </p>
          </div>
          <ul className={own.recover}>
            <li><b>+463%</b><span><strong>Cabo Pulmo, Mexico.</strong> Fish biomass rose more than fivefold between 1999 and 2009, after the local community backed closing its reef to fishing (Aburto-Oropeza et al., 2011).</span></li>
            <li><b>93%</b><span><strong>Humpback whales.</strong> The western South Atlantic population, hunted down to about 450 animals in the 1950s, is back to 93% of its size before whaling (Zerbini et al., 2019).</span></li>
            <li><b>+28%</b><span><strong>Green turtles.</strong> Numbers have risen since the 1970s with beach protection and curbs on harvest and trade; IUCN moved the species from Endangered to Least Concern in 2025.</span></li>
            <li><b>Rising</b><span><strong>Managed fish stocks.</strong> Where stocks are assessed and managed, about half of the world’s catch, they are on average increasing (Hilborn et al., 2020).</span></li>
            <li><b>+37%</b><span><strong>Sea otters and kelp.</strong> Where sea otters have returned on Canada’s Pacific coast, kelp forests recover and the ecosystem holds 37% more life (Gregr et al., 2020).</span></li>
            <li><b>−23%</b><span><strong>Mangrove loss.</strong> The rate of global mangrove loss fell by 23% between 2000–2010 and 2010–2020 (FAO, 2023).</span></li>
          </ul>
          <p className={`small faint ${own.note}`}>
            Recovery depends on removing local pressures and on limiting warming: protection cannot shield reefs from heat (see above), and
            fish stocks rebuild best under low emissions. As the 2025 film <i>Ocean with David Attenborough</i> puts it, “the ocean can recover
            faster than we had ever imagined”.
          </p>
        </div>
      </section>

      <section className="section section--alt" aria-labelledby="finance">
        <div className="wrap">
          <p className="kicker">3 · Pay for protection</p>
          <h2 id="finance" className={styles.h2}>Protection is funded at about a tenth of what it needs</h2>
          <div className={styles.split} style={{ alignItems: "start" }}>
            <div className="prose">
              <p>
                Managing 30% of the ocean well would cost about US$16 billion a year, most of it for running protected areas rather than
                creating them. About US$1.8 billion is spent (Systemiq, 2026). In a global survey, 65% of protected areas reported budgets
                too small for basic management (Gill et al., 2017). Governments spend more each year on fisheries subsidies that expand
                fishing capacity than the whole gap (Sumaila et al., 2019).
              </p>
              <p>
                The investment case is positive. A peer-reviewed global study finds that the benefits of expanding marine protection exceed
                the costs by a factor of 1.4 to 2.7 (Brander et al., 2020). In Indonesia, a district-by-district cost-benefit analysis
                found that mangrove conservation and restoration pay off in most districts, and that conserving existing mangroves
                generally gives higher returns than restoring lost ones (van Zanten et al., 2025, co-authored by the curator of this site).
              </p>
              <p>
                Countries have agreed to mobilise at least US$200 billion a year for biodiversity by 2030 and to cut harmful subsidies by
                US$500 billion a year (Global Biodiversity Framework, Targets 18 and 19). A World Trade Organization agreement banning some
                harmful fisheries subsidies entered into force in September 2025.
              </p>
            </div>
            <div className={styles.panel} style={{ background: "var(--bg-alt)" }}>
              <ProtectionFinanceChart />
            </div>
          </div>

          <div className={own.tableWrap}>
            <table className={own.table}>
              <caption>Debt conversions that fund ocean protection</caption>
              <thead><tr><th scope="col">Country</th><th scope="col">Debt treated</th><th scope="col">For conservation</th><th scope="col">Protection commitment</th></tr></thead>
              <tbody>
                <tr><th scope="row">Seychelles, 2016</th><td>US$21.6m bought back</td><td>Trust fund (SeyCCAT), grants since 2018</td><td>30% of national waters, declared 2020</td></tr>
                <tr><th scope="row">Belize, 2021</th><td>US$553m bond bought back at 55 cents</td><td>About US$180m over 20 years</td><td>30% of its ocean by 2026</td></tr>
                <tr><th scope="row">Ecuador, 2023</th><td>About US$1.6bn of bonds</td><td>More than US$450m over about 18 years</td><td>Galápagos marine reserves</td></tr>
                <tr><th scope="row">Gabon, 2023</th><td>US$500m</td><td>US$163m over 15 years</td><td>30% of its ocean</td></tr>
                <tr><th scope="row">Bahamas, 2024</th><td>US$300m</td><td>US$124m over 15 years</td><td>Expanded marine protected areas</td></tr>
              </tbody>
            </table>
          </div>
          <p className={`small faint ${own.note}`}>
            Sources: SeyCCAT case study (2025); The Nature Conservancy, Belize case study and Gabon and Bahamas announcements; US
            International Development Finance Corporation, Ecuador. Figures for Ecuador, Gabon and the Bahamas are as reported by the
            arranging parties. The IMF notes that such swaps are usually too small to restore debt sustainability and that their efficiency
            case is narrow (Chamon et al., 2022). The first sovereign blue bond, US$15 million for Seychelles fisheries in 2018, has been
            followed by a market of about US$15 billion (World Bank, 2025).
          </p>
        </div>
      </section>

      <section className="section" aria-labelledby="plan">
        <div className="wrap">
          <p className="kicker">Plan for what cannot be avoided</p>
          <h2 id="plan" className={styles.h2}>Decisions for each change</h2>
          <div className={`${styles.responses} ${own.planCards}`}>
            <div><h3><Link href="/changes/el-nino/#decide">El Niño</Link></h3><p>Act on forecasts with agreed triggers and pre-arranged finance; size reserves and insurance for stronger events.</p></div>
            <div><h3><Link href="/changes/coral-reefs/#responses">Coral reefs</Link></h3><p>Protect the reefs most likely to survive, support reef fishers through change, and plan for weaker natural coastal defences.</p></div>
            <div><h3><Link href="/changes/fish-on-the-move/#decide">Fish on the move</Link></h3><p>End overfishing and adapt quotas and agreements as stocks shift across borders.</p></div>
            <div><h3><Link href="/changes/ice-sheets/#decide">Ice sheets</Link></h3><p>Test long-lived coastal assets against a high-end rise and keep options open to raise defences or move.</p></div>
            <div><h3><Link href="/changes/atlantic-circulation/#decide">Atlantic circulation</Link></h3><p>Stress-test long-lived investments against a collapse and favour measures that pay off either way.</p></div>
            <div><h3><Link href="/changes/subpolar-gyre/#decide">Subpolar North Atlantic</Link></h3><p>Include abrupt regional cooling in risk assessments and link observations to decision points.</p></div>
            <div><h3><Link href="/changes/southern-ocean/#decide">Southern Ocean</Link></h3><p>Protect Antarctic waters, manage krill for a changing ocean and avoid assuming the carbon sink will keep pace.</p></div>
            <div><h3><Link href="/monitoring/">Keep watching</Link></h3><p>Long, unbroken ocean records underpin every one of these decisions. See who monitors the ocean, and where the gaps are.</p></div>
          </div>
        </div>
      </section>

      <section className="section section--alt" aria-labelledby="data">
        <div className="wrap prose">
          <h2 id="data" className={styles.h2}>Sources</h2>
          <p>
            <b>Emissions and warming:</b> UNEP (2026), <i>Emissions Gap Report 2026</i>; Forster et al. (2026), <i>Earth System Science
            Data</i> 18, 3889; Möller et al. (2024), <i>Nature Communications</i> 15, 6192; Ritchie et al. (2026), <i>Environmental Research
            Letters</i> 21, 043001; Stokes et al. (2025), <i>Communications Earth &amp; Environment</i> 6; Sengupta et al. (2026),{" "}
            <i>Communications Earth &amp; Environment</i> 7, 810; Global Tipping Points Report 2025; Armstrong McKay et al. (2022), <i>Science</i> 377.
          </p>
          <p>
            <b>Protected areas:</b> {WDPA_CITATION} Available at <a href="https://www.protectedplanet.net/">protectedplanet.net</a>.
            MPAtlas, Marine Conservation Institute (2026). Convention on Biological Diversity, Kunming-Montreal Global Biodiversity
            Framework. United Nations Treaty Collection, Agreement on Marine Biological Diversity of Areas beyond National Jurisdiction.
          </p>
          <p>
            <b>Evidence on protection:</b> Lester et al. (2009), <i>Marine Ecology Progress Series</i> 384; Edgar et al. (2014), <i>Nature</i> 506;
            Gill et al. (2017), <i>Nature</i> 543; Grorud-Colvert et al. (2021), <i>Science</i> 373; Mellin et al. (2016), <i>Ecology Letters</i> 19;
            Medoff et al. (2022), <i>Science</i> 378; Hughes et al. (2017), <i>Nature</i> 543; Graham et al. (2015), <i>Nature</i> 518; Bruno et al.
            (2018), <i>Nature Climate Change</i> 8; Beyer et al. (2018), <i>Conservation Letters</i> 11; Menéndez et al. (2020),{" "}
            <i>Scientific Reports</i> 10.
          </p>
          <p>
            <b>Recovery:</b> Duarte et al. (2020), <i>Nature</i> 580; Aburto-Oropeza et al. (2011), <i>PLoS ONE</i> 6; Zerbini et al. (2019),{" "}
            <i>Royal Society Open Science</i> 6; IUCN Red List update, October 2025; Hilborn et al. (2020), <i>PNAS</i> 117; Gregr et al. (2020),{" "}
            <i>Science</i> 368; FAO (2023), <i>The world’s mangroves 2000–2020</i>.
          </p>
          <p>
            <b>Finance:</b> Systemiq (2026), <i>Ocean Protection Gap Report 2026</i>; Brander et al. (2020), <i>Marine Policy</i> 116; Sumaila et
            al. (2019), <i>Marine Policy</i> 109; van Zanten et al. (2025), <i>Frontiers in Environmental Science</i> 13,{" "}
            <a href="https://doi.org/10.3389/fenvs.2025.1459034">doi:10.3389/fenvs.2025.1459034</a>; Chamon et al. (2022), IMF Working Paper 22/162.
          </p>
        </div>
      </section>
    </article>
  );
}
