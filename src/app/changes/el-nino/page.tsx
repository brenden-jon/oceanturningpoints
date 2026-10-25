import fs from "node:fs";
import path from "node:path";
import type { Metadata } from "next";
import Link from "next/link";
import { EnsoWeekly, type EnsoData } from "@/components/EnsoCharts";
import ExtremeElNinoChart from "@/components/ExtremeElNinoChart";
import OceanNowGlobe from "@/components/OceanNowGlobe";
import { abs } from "@/lib/site";
import styles from "./elnino.module.css";

const TITLE = "Is warming locking the Pacific into El Niño?";
const DESCRIPTION = "A strong El Niño is under way in 2026. New research finds that warming makes extreme El Niños more frequent and can hold the Pacific in a more El Niño-like state for centuries after net zero. What this means for Australia, the tropics and planning.";

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: abs("/changes/el-nino/") },
  openGraph: { title: TITLE, description: DESCRIPTION, url: abs("/changes/el-nino/"), images: [abs("/og/science.png")], type: "article", siteName: "Ocean Turning Points" },
};

const DATA = path.join(process.cwd(), "public", "data", "now");
const read = (f: string) => JSON.parse(fs.readFileSync(path.join(DATA, f), "utf8"));
const day = (iso: string) => new Date(iso.slice(0, 10) + "T12:00:00Z").toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric", timeZone: "UTC" });
const signed = (v: number, d = 1) => `${v > 0 ? "+" : v < 0 ? "−" : ""}${Math.abs(v).toFixed(d)}`;

/** Share of winter–spring seasons in drought by the end of the century under very high emissions (RCP8.5),
 * against 10% by definition in the pre-industrial climate. Delage & Power (2020), Climate Dynamics. */
const DROUGHT = [
  { city: "Perth", value: 60 },
  { city: "Adelaide", value: 35 },
  { city: "Melbourne", value: 30 },
  { city: "Sydney, Canberra, Brisbane", value: 22.5, label: "20–25%" },
  { city: "Pre-industrial", value: 10, base: true },
];

export default function ElNinoPage() {
  const m = read("manifest.json");
  const enso = read("enso.json") as EnsoData & {
    latest: { week: string; nino34: number; relative34: number };
    weeklyRecord: { week: string; nino34: number };
    discussion: { status: string | null; issued: string | null; url: string };
    roni: { season: string; year: number; value: number }[];
  };
  const roniLast = enso.roni[enso.roni.length - 1];
  const isRecord = enso.latest.nino34 >= enso.weeklyRecord.nino34;

  return (
    <article>
      <header className={`wrap ${styles.hero}`}>
        <div>
          <p className="label"><Link href="/changes/">Big changes</Link> · El Niño</p>
          <h1 className={styles.title}>{TITLE}</h1>
        </div>
        <div className={styles.heroSide}>
          <p className={styles.standfirst}>
            El Niño is a natural swing, and a strong one is under way in 2026. The bigger question is what warming does to it.
            Most models project more frequent extreme El Niños, and a study published in October 2026 finds that the Pacific can
            stay in a more El Niño-like state for centuries after emissions reach net zero. Observations so far point the other way,
            so treat it as a risk to plan for rather than a settled forecast.
          </p>
          <p className={styles.chips}>
            <span className="evidence evidence--obs">Observations, updated daily</span>
            <span className="evidence evidence--model">Model projections</span>
            <span className="evidence">Reviewed 25 October 2026</span>
          </p>
        </div>
      </header>

      <section className="wrap" aria-label="Sea-surface temperature compared with normal">
        <OceanNowGlobe ssta={m.ssta} dhw={m.dhw} currents={m.currents} bleachOutlook={m.bleachingOutlook} sstOutlook={m.sstOutlook} initialView="pacific" compact />
      </section>

      <section className="section" aria-labelledby="now">
        <div className="wrap">
          <p className="kicker">The 2026 event</p>
          <h2 id="now" className={styles.h2}>One of the strongest El Niños on record</h2>
          <div className={styles.now}>
            <div className="prose">
              <dl className={styles.nowStats}>
                <div>
                  <dt>NOAA status</dt>
                  <dd className={styles.status}>{enso.discussion.status ?? "Not available"}</dd>
                </div>
                <div>
                  <dt>Central Pacific (Niño-3.4) compared with normal, week of {day(enso.latest.week)}</dt>
                  <dd className="tnum">{signed(enso.latest.nino34)}°C</dd>
                </div>
                <div>
                  <dt>Minus the warming of the whole tropics (relative index)</dt>
                  <dd className="tnum">{signed(enso.latest.relative34)}°C</dd>
                </div>
                <div>
                  <dt>Three-month relative index ({roniLast.season} {roniLast.year})</dt>
                  <dd className="tnum">{signed(roniLast.value, 2)}°C</dd>
                </div>
              </dl>
              <p>
                The central Pacific is {signed(enso.latest.nino34)}°C warmer than normal{isRecord ? ", the highest weekly value since NOAA’s record began in 1981" : ""}.
                On 21 October the World Meteorological Organization forecast about +3.8°C for November to January. Western South America
                has already had severe flooding.
              </p>
              <p>
                FEWS NET, the food-security early warning network, rates its concern as high for Southern Africa and much of East Africa.
                It expects food insecurity to peak in Southern Africa between late 2027 and early 2028, well after the event itself.
              </p>
              <p><Link className="more" href="/ocean-now/">Daily indices and seasonal outlooks</Link></p>
            </div>
            <figure className={styles.whiteChart}>
              <figcaption><strong>Weekly Niño-3.4 temperature anomaly</strong><span className="small faint"> · last three years</span></figcaption>
              <EnsoWeekly data={enso} />
              <p className="small faint" style={{ margin: "0.6rem 0 0" }}>
                <span className="evidence evidence--obs">Observed</span> NOAA Climate Prediction Center, OISST v2.1, 1991–2020 normal.
              </p>
            </figure>
          </div>
          <p className={`small faint ${styles.note}`}>
            Sources: WMO Global Seasonal Climate Update, 21 October 2026; WMO update, 22 October 2026; FEWS NET special report on
            2026–27 El Niño food security impacts, 6 October 2026. Event figures will change as the season develops.
          </p>
        </div>
      </section>

      <section className="section section--alt" aria-labelledby="shift">
        <div className="wrap">
          <p className="kicker">The latest research</p>
          <h2 id="shift" className={styles.h2}>A more El Niño-like Pacific that outlasts net zero</h2>
          <div className={styles.split}>
            <div className="prose">
              <p>
                In a normal year the western Pacific is much warmer than the east, and that contrast drives the trade winds. During
                El Niño the contrast weakens. Most climate models project that warming slowly weakens it for good, giving a Pacific
                that is more El Niño-like on average.
              </p>
              <p>
                Sengupta and colleagues (2026) asked what happens after emissions stop. In nine Earth system models, the contrast did not
                recover after net zero; in eight of the nine it kept weakening. The share of El Niño events that are extreme roughly
                doubled and stayed doubled.
              </p>
              <p>
                In 1,000-year runs of one model, the later net zero is reached, the larger and longer-lasting the effect. Reaching net
                zero in 2030, 2045 or 2060 corresponds to long-run warming of about 1.3, 2.0 and 3.0°C in that model.
              </p>
              <p>The reason is the ocean’s memory:</p>
              <ol className={styles.steps}>
                <li>The Southern Ocean and deep ocean keep warming after emissions stop.</li>
                <li>The rain belts near the equator shift, and the southern trade winds weaken and stay weak.</li>
                <li>Less cold water rises along the equator in the east, so the east–west contrast stays weak.</li>
              </ol>
            </div>
            <div className={styles.panel}>
              <ExtremeElNinoChart />
            </div>
          </div>
        </div>
      </section>

      <section className="section" aria-labelledby="extremes">
        <div className="wrap">
          <p className="kicker">Extremes</p>
          <h2 id="extremes" className={styles.h2}>Most studies find bigger swings in both directions</h2>
          <ul className={styles.cards}>
            <li>
              <span className={styles.from}>1 in 20 → 1 in 10 <small>years</small></span>
              <p>Extreme El Niños that move the Pacific rain belt east, in 20 climate models, this century compared with last.</p>
              <cite>Cai et al. (2014), <i>Nature Climate Change</i></cite>
            </li>
            <li>
              <span className={styles.from}>×2 <small>at 1.5°C</small></span>
              <p>Extreme El Niño frequency doubles by 1.5°C of warming and keeps rising for up to a century after temperatures stabilise.</p>
              <cite>Wang et al. (2017), <i>Nature Climate Change</i></cite>
            </li>
            <li>
              <span className={styles.from}>1 in 23 → 1 in 13 <small>years</small></span>
              <p>Extreme La Niña under high emissions, most often in the year after an extreme El Niño: sharper swings from flood to drought.</p>
              <cite>Cai et al. (2015), <i>Nature Climate Change</i></cite>
            </li>
            <li>
              <span className={styles.from}>+12% to +16%</span>
              <p>Larger year-to-year sea temperature swings this century, in about nine in ten of the latest models, under low and very high emissions.</p>
              <cite>Cai et al. (2022), <i>Nature Climate Change</i></cite>
            </li>
            <li>
              <span className={styles.from}>1,000 years</span>
              <p>Galápagos corals show that recent eastern Pacific El Niños are stronger than at any time in the past millennium.</p>
              <cite>Cole et al. (2026), <i>Science</i></cite>
            </li>
            <li>
              <span className={styles.from}>Very likely</span>
              <p>The IPCC judges that El Niño-related rainfall swings will grow in the second half of this century under intermediate and high emissions.</p>
              <cite>IPCC AR6 Working Group I (2021)</cite>
            </li>
          </ul>
          <p className={`small faint ${styles.note}`}>
            These studies measure different things (event frequency, share of events, temperature variability, coral records), so the
            numbers are not directly comparable.
          </p>
        </div>
      </section>

      <section className="section section--alt" aria-labelledby="sure">
        <div className="wrap prose">
          <p className="kicker">How sure</p>
          <h2 id="sure">The real Pacific has not followed the models yet</h2>
          <p>
            Since about 1950 the east–west contrast has strengthened, which is more La Niña-like, while most models simulate the
            opposite. Several studies find this is unlikely to be natural variability alone (Seager et al., 2019, 2022; Sugiura et al.,
            2026). One synthesis argues that the processes behind the recent trend will give way to weakening ones, but that firm
            evidence is not yet available (Watanabe et al., 2024).
          </p>
          <p>
            The two observations can both hold: individual El Niño events have grown stronger even as the average state moved
            La Niña-like. El Niño is not assessed as a tipping system (Global Tipping Points Report 2025). The single model behind the
            long net-zero runs has biases that, its authors note, could inflate the number of extreme events.
          </p>
          <div className={styles.verdict}>
            <div><b>Stronger, more frequent extremes</b><span>Supported by models, theory and coral records. Medium confidence.</span></div>
            <div><b>A lasting El Niño-like average state</b><span>Physically argued and expected by most models, contested by 70 years of observations. Low to medium confidence.</span></div>
          </div>
        </div>
      </section>

      <section className="section" aria-labelledby="australia">
        <div className="wrap">
          <p className="kicker">Australia</p>
          <h2 id="australia" className={styles.h2}>Drought and fire weather already rising</h2>
          <div className={styles.split}>
            <div className="prose">
              <p>
                El Niño, especially together with a positive Indian Ocean Dipole, is the main driver of drought years and extreme fire
                weather in eastern Australia (Harris and Lucas, 2019). Droughts break when La Niña returns, so a Pacific that spends less
                time in La Niña-like states matters as much as El Niño itself (King et al., 2020).
              </p>
              <p>
                The 2019 combination of drought and fire weather before the Black Summer fires had about a 1-in-200 chance in today’s
                climate, and losses were estimated at over A$100 billion (Squire et al., 2021). That season, record swings in the Indian
                Ocean Dipole and the Southern Annular Mode drove more than half of the drought (van Oldenborgh et al., 2021). Fire weather
                and burned forest area are trending up (Canadell et al., 2021).
              </p>
              <p>
                Sengupta and colleagues detect lasting rainfall changes over Australia linked to the El Niño-like state, but give no
                figures and call for more work. No study yet puts a number on how much drier Australia would be under a lasting
                El Niño-like Pacific. Climate conditions since 2000 have already cut average farm profits by about 22% compared with the
                1950–2000 climate (Hughes et al., 2022). Australian wheat production averages about 15% below normal in strong El Niño years (FEWS NET, 2026).
              </p>
            </div>
            <figure className={styles.whiteChart}>
              <p style={{ margin: "0 0 1rem", fontWeight: 600, fontSize: "0.95rem" }}>Share of winter–spring seasons in drought, 2010–2099, high emissions</p>
              <div className={styles.bars}>
                {DROUGHT.map((d) => (
                  <div key={d.city} className={styles.bar}>
                    <span style={{ color: "var(--text-2)" }}>{d.city}</span>
                    <span>
                      <i style={{ width: `${(d.value / 65) * 100}%`, background: d.base ? "#9aa5b1" : undefined }} />
                      <b className="tnum">{d.label ?? `${d.value}%`}</b>
                    </span>
                  </div>
                ))}
              </div>
              <figcaption className="small faint" style={{ marginTop: "1rem" }}>
                <span className="evidence evidence--model">Model projection</span> Seasons drier than the driest 10% of the
                pre-industrial climate, 24 models, very high emissions (RCP8.5), all causes of change. Delage and Power (2020),{" "}
                <i>Climate Dynamics</i>. The authors note that models reproduce El Niño’s effect on Australian rainfall poorly.
              </figcaption>
            </figure>
          </div>
        </div>
      </section>

      <section className="section section--alt" aria-labelledby="stakes">
        <div className="wrap">
          <p className="kicker">Consequences</p>
          <h2 id="stakes" className={styles.h2}>Why this matters for development</h2>
          <ul className={styles.stats}>
            <li><b>US$5.7 trillion</b><span>global income lost after the 1997–98 El Niño, with growth held back for years; the hardest-hit countries are mostly lower-income and tropical (Callahan and Mankin, 2023).</span></li>
            <li><b>6 million</b><span>additional children underweight during the 2015 El Niño, across 51 countries (Anttila-Hughes et al., 2021).</span></li>
            <li><b>9.6 million</b><span>additional dengue cases linked to the 2023–24 El Niño, across 57 countries (Tian et al., 2025).</span></li>
          </ul>
          <p className={`small faint ${styles.note}`}>
            Economic losses grow faster than El Niño strength: in one estimate, losses rise exponentially with larger swings
            (Liu et al., 2023). El Niño can also cause crop failures in several breadbaskets at once (Anderson et al., 2019).
          </p>
        </div>
      </section>

      <section className="section" aria-labelledby="decide">
        <div className="wrap">
          <p className="kicker">What decision-makers can do</p>
          <h2 id="decide" className={styles.h2}>Prepare for stronger events, plan for a shifted baseline</h2>
          <div className={`${styles.responses} ${styles.onWhite}`}>
            <div>
              <h3>Act on the forecast</h3>
              <p>
                El Niño is the most predictable large climate hazard, often months ahead. Agree trigger levels, actions and pre-arranged
                finance in advance, so money moves when the forecast crosses the trigger rather than after the losses (Coughlan de Perez
                et al., 2015). Less than 1% of humanitarian funding currently goes to anticipatory action (UN, 2026).
              </p>
            </div>
            <div>
              <h3>Size buffers for bigger events</h3>
              <p>
                Food reserves, water storage, insurance and contingent credit sized on past El Niños may fall short if extremes become
                twice as common. Losses also persist for years, so recovery support should too.
              </p>
            </div>
            <div>
              <h3>Do not plan on the old normal</h3>
              <p>
                Dams, irrigation, hydropower and fisheries management in El Niño-sensitive regions should be tested against a Pacific
                that spends more time in El Niño-like states. If it happens, the shift lasts for centuries.
              </p>
            </div>
            <div>
              <h3>Earlier net zero limits the shift</h3>
              <p>
                In the model runs, each delay in reaching net zero made the El Niño-like state stronger and longer-lasting. Emission cuts
                are the only lever on the long-term change.
              </p>
            </div>
          </div>
          <p className={styles.more}>
            <Link className="more" href="/science/el-nino/">Full evidence, uncertainties and references</Link>
          </p>
        </div>
      </section>

      <section className="section section--alt" aria-labelledby="data">
        <div className="wrap prose">
          <h2 id="data" className={styles.h2}>About these data and sources</h2>
          <p>
            <b>Globe:</b> sea-surface temperature compared with the 1985–2012 normal, NOAA Coral Reef Watch, updated daily. <b>Indices:</b>{" "}
            NOAA Climate Prediction Center weekly Niño indices and Relative Oceanic Niño Index; status from the{" "}
            <a href={enso.discussion.url}>ENSO diagnostic discussion</a>{enso.discussion.issued ? ` of ${enso.discussion.issued}` : ""}.
          </p>
          <p>
            <b>Research:</b> Sengupta, A. et al. (2026) Ocean thermal inertia sustains a tropical Pacific mean state shift under net zero.{" "}
            <i>Communications Earth &amp; Environment</i> 7, 810 (numbers transcribed, chart redrawn). Cai, W. et al. (2014, 2015, 2022),{" "}
            <i>Nature Climate Change</i>. Wang, G. et al. (2017), <i>Nature Climate Change</i>. Cole, J. E. et al. (2026), <i>Science</i>.
            Watanabe, M. et al. (2024), <i>Nature</i>. Seager, R. et al. (2019), <i>Nature Climate Change</i>.
          </p>
          <p>
            <b>Australia:</b> Delage &amp; Power (2020), <i>Climate Dynamics</i>; King et al. (2020), <i>Nature Climate Change</i>;
            Harris &amp; Lucas (2019), <i>PLOS ONE</i>; Squire et al. (2021), <i>npj Climate and Atmospheric Science</i>; van Oldenborgh
            et al. (2021), <i>Natural Hazards and Earth System Sciences</i>; Canadell et al. (2021), <i>Nature Communications</i>; Hughes
            et al. (2022), <i>Climatic Change</i>.
          </p>
          <p>
            <b>Impacts:</b> Callahan &amp; Mankin (2023), <i>Science</i>; Anttila-Hughes et al. (2021) and Tian et al. (2025),{" "}
            <i>Nature Communications</i>; Liu et al. (2023), <i>Nature Communications</i>; Anderson et al. (2019), <i>Science Advances</i>.
            Coughlan de Perez et al. (2015), <i>Natural Hazards and Earth System Sciences</i>, is co-authored by the curator of this site.
          </p>
        </div>
      </section>
    </article>
  );
}
