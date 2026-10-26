import type { Metadata } from "next";
import Link from "next/link";
import HBars from "@/components/HBars";
import { ArticleLd } from "@/components/JsonLd";
import { abs } from "@/lib/site";
import styles from "../changes/coral-reefs/coral.module.css";
import own from "./future.module.css";

const TITLE = "What ocean should we plan for?";
const DESCRIPTION = "The ocean change already locked in (warming, sea-level rise, marine heatwaves, acidification, oxygen loss) and three possible ocean futures at about 1.5, 2.7 and 4°C of warming, combining expected trends with tipping-point risks, with what each means for planning.";

export const metadata: Metadata = {
  title: "The future ocean: expected change and three futures at 1.5, 2.7 and 4°C",
  description: DESCRIPTION,
  alternates: { canonical: abs("/future/") },
  openGraph: { title: TITLE, description: DESCRIPTION, url: abs("/future/"), images: [abs("/og/science.png")], type: "article", siteName: "Ocean Turning Points" },
};

type Band = "certain" | "likely" | "possible";
const FUTURES: { title: string; sub: string; plan: string; rows: Record<Band, string[]> }[] = [
  {
    title: "Fastest feasible cuts",
    sub: "Warming peaks at about 1.7–1.8°C around 2050 and returns towards 1.4°C by 2100 (close to SSP1-1.9 and SSP1-2.6)",
    plan: "What to aim for",
    rows: {
      certain: [
        "The ocean keeps warming past 2100; the change is irreversible for centuries.",
        "Sea level 0.3–0.6 m higher by 2100, still rising about 4–5 mm a year; 2–3 m committed over 2,000 years.",
        "Former 1-in-100-year sea levels every year at about 60% of tide gauges by 2100.",
        "Marine heatwaves about 16 times as frequent as before industrialisation.",
        "Coral reefs decline by a further 70–90%.",
        "Acidification stops worsening once CO₂ falls.",
      ],
      likely: [
        "About 6% less fish and other marine animal life by the end of the century.",
        "The Atlantic circulation weakens; collapse before 2100 is not expected.",
        "Extreme El Niño events about twice as common, staying so for centuries.",
        "Greenland and West Antarctica remain at risk of tipping over the long term.",
      ],
      possible: [
        "Collapse of winter sinking in the subpolar North Atlantic.",
        "Northern Atlantic circulation shuts down after 2100 in about a quarter of models.",
      ],
    },
  },
  {
    title: "Current policies and pledges",
    sub: "About 2.6–2.8°C by 2100 and still rising (close to SSP2-4.5)",
    plan: "What to plan for",
    rows: {
      certain: [
        "Sea level 0.4–0.8 m higher by 2100, rising about twice as fast as today; 2–10 m committed over 2,000 years.",
        "Former 1-in-100-year sea levels every year at more than half of tide gauges by 2100.",
        "Marine heatwaves between 23 and 41 times as frequent as before industrialisation.",
        "More than 99% of warm-water coral reefs lost.",
        "Ocean still acidifying and losing oxygen in 2100.",
      ],
      likely: [
        "Several ocean and ice tipping systems pass their thresholds; ice sheets committed to multi-metre loss.",
        "Fish biomass falls most in tropical countries and small island states.",
        "Arctic ice-free in September at least once a decade.",
      ],
      possible: [
        "Atlantic circulation collapse: northern shutdown by 2300 in more than a third of models.",
        "Abrupt North Atlantic cooling of 2–3°C if the subpolar gyre collapses.",
        "Faster ice-sheet loss: up to about 0.9 m by 2100 and 2.5 m by 2300.",
      ],
    },
  },
  {
    title: "High emissions",
    sub: "About 4°C by 2100 (SSP3-7.0 to SSP5-8.5). Not the expected path, but concentrations this high cannot be ruled out",
    plan: "What to stress-test against",
    rows: {
      certain: [
        "Sea level 0.55–1.0 m higher by 2100, rising about three times as fast as today; 12–16 m committed over 2,000 years.",
        "Marine heatwaves about 50 times as frequent, with permanent heatwave conditions in parts of the tropics and the Arctic.",
        "Polar and subpolar seas corrosive to shells all year.",
        "Warm-water coral reefs effectively gone as functioning ecosystems.",
      ],
      likely: [
        "About 16–19% less marine animal life; 90% of 25,000 assessed species at high or critical risk.",
        "Atlantic circulation collapse by 2300 about as likely as not; northern shutdown in about 70% of models.",
        "Most ocean and cryosphere tipping systems past their central thresholds.",
      ],
      possible: [
        "Sea level approaching 2 m by 2100 and 5 m by 2150; up to about 16 m by 2300.",
        "Carbon released from the Southern Ocean after an Atlantic collapse, adding about 0.2°C of warming.",
      ],
    },
  },
];

const BAND_LABEL: Record<Band, string> = { certain: "Near-certain", likely: "Likely", possible: "Possible, high impact" };

export default function FuturePage() {
  return (
    <article>
      <ArticleLd path="/future/" title={TITLE} description={DESCRIPTION} about={["Ocean warming", "Sea-level rise", "Marine heatwaves", "Ocean acidification", "Climate scenarios", "Tipping points"]} />
      <header className={`wrap ${styles.hero}`}>
        <div>
          <p className="label"><Link href="/changes/">Big changes</Link> · The future ocean</p>
          <h1 className={styles.title}>{TITLE}</h1>
        </div>
        <div className={styles.heroSide}>
          <p className={styles.standfirst}>
            Some ocean changes are locked in for decades whatever happens to emissions. Others depend on how much more the planet warms. A
            few are unlikely but would be so costly that planners should test against them. This page brings them together.
          </p>
          <p className={styles.chips}>
            <a className="more" href="#expected">The change already expected</a>
            <a className="more" href="#futures">Three futures</a>
            <a className="more" href="#planning">What to plan for</a>
          </p>
        </div>
      </header>

      <section className="section" aria-labelledby="expected" style={{ paddingTop: "1rem" }}>
        <div className="wrap">
          <p className="kicker">Before any tipping point</p>
          <h2 id="expected" className={styles.h2}>The change already expected</h2>
          <ul className={own.strip}>
            <li><b>~90%</b><span>of the extra heat trapped by greenhouse gases goes into the ocean; the rate has more than doubled since the late 20th century and set a record in 2025.</span></li>
            <li><b>23 cm</b><span>global sea-level rise since 1901, now rising 3.8 mm a year. A further 10–25 cm by 2050 is expected whether or not emissions fall.</span></li>
            <li><b>58 days</b><span>a year of marine heatwave conditions on average in 2016–2025, against 36 in 2007–2016; 82 days in the record year 2024.</span></li>
            <li><b>−2%</b><span>ocean oxygen since 1960, and surface waters about 17% more acidic since 1985, past the planetary boundary.</span></li>
          </ul>
          <p className={`small faint ${styles.note}`}>
            Sources: IPCC AR6 Working Group I (2021); Forster et al. (2026), <i>Earth System Science Data</i> 18; Pan et al. (2026), <i>Advances in
            Atmospheric Sciences</i> 43; Schmidtko et al. (2017), <i>Nature</i> 542; Copernicus Ocean State Report 10 (2026); Planetary Health Check
            (2026).
          </p>
          <div className={own.two}>
            <figure className={own.card}>
              <p className={own.fh}>Sea-level rise by 2100, by emissions scenario</p>
              <p className="small faint" style={{ margin: "0 0 0.9rem" }}>Likely range and median, metres relative to 1995–2014</p>
              <HBars max={1.7} labelWidth="10rem" rows={[
                { label: "Very low (SSP1-1.9)", value: 0.38, range: [0.28, 0.55], text: "0.28–0.55 m" },
                { label: "Low (SSP1-2.6)", value: 0.44, range: [0.32, 0.62], text: "0.32–0.62 m" },
                { label: "Intermediate (SSP2-4.5)", value: 0.56, range: [0.44, 0.76], text: "0.44–0.76 m" },
                { label: "High (SSP3-7.0)", value: 0.68, range: [0.55, 0.90], text: "0.55–0.90 m" },
                { label: "Very high (SSP5-8.5)", value: 0.77, range: [0.63, 1.01], text: "0.63–1.01 m" },
                { label: "Very high, with rapid ice loss", value: 0.88, range: [0.63, 1.60], text: "0.63–1.60 m" },
              ]} color="#0a62b8" />
              <figcaption className="small faint" style={{ marginTop: "0.9rem" }}>
                <span className="evidence evidence--model">Projection</span> IPCC AR6 WGI, Table 9.9. The last row adds ice-sheet processes the IPCC
                assesses with low confidence; a rise approaching 2 m by 2100 cannot be ruled out.
              </figcaption>
            </figure>
            <figure className={own.card}>
              <p className={own.fh}>Marine heatwave days per year</p>
              <p className="small faint" style={{ margin: "0 0 0.9rem" }}>Average across the ocean between 60°S and 60°N, by decade</p>
              <HBars max={70} labelWidth="8rem" rows={[
                { label: "2000–2009", value: 26, text: "26" },
                { label: "2007–2016", value: 36, text: "36" },
                { label: "2010–2019", value: 43, text: "43" },
                { label: "2014–2023", value: 52, text: "52" },
                { label: "2016–2025", value: 58, text: "58" },
              ]} color="#c0392b" />
              <figcaption className="small faint" style={{ marginTop: "0.9rem" }}>
                <span className="evidence evidence--obs">Observed</span> Forster et al. (2026), Table 10: days above the 99th percentile of 1985–2014,
                mean of four satellite products. Marine heatwaves have roughly doubled in frequency since the 1980s (<i>high confidence</i>; IPCC, 2021).
              </figcaption>
            </figure>
          </div>
          <div className={own.tableWrap}>
            <table className={own.table}>
              <caption>How much emissions matter by 2100</caption>
              <thead><tr><th scope="col"></th><th scope="col">Low (SSP1-2.6)</th><th scope="col">Intermediate (SSP2-4.5)</th><th scope="col">Very high (SSP5-8.5)</th></tr></thead>
              <tbody>
                <tr><th scope="row">Sea level, median</th><td>0.44 m</td><td>0.56 m</td><td>0.77 m</td></tr>
                <tr><th scope="row">Rate of sea-level rise, 2080–2100</th><td>5 mm/yr</td><td>8 mm/yr</td><td>12 mm/yr</td></tr>
                <tr><th scope="row">Surface pH change</th><td>−0.08</td><td>−0.17</td><td>−0.37</td></tr>
                <tr><th scope="row">Oxygen at 100–600 m</th><td>−4%</td><td>−7%</td><td>−11%</td></tr>
                <tr><th scope="row">Marine animal biomass</th><td>−6%</td><td>–</td><td>−16%</td></tr>
                <tr><th scope="row">Models heading for northern Atlantic shutdown by 2300</th><td>25%</td><td>37%</td><td>70%</td></tr>
              </tbody>
            </table>
            <p className="small faint" style={{ marginTop: "0.6rem" }}>
              Changes by 2081–2100 relative to 1995–2014. IPCC AR6 WGI Table 9.9; AR6 WGII Chapter 3 (Cooley et al., 2022); Drijfhout et al.
              (2025), share of models, not a probability.
            </p>
          </div>
        </div>
      </section>

      <section className="section section--alt" aria-labelledby="futures">
        <div className="wrap">
          <p className="kicker">Three futures</p>
          <h2 id="futures" className={styles.h2}>What the ocean could look like at 1.5, 2.7 and 4°C</h2>
          <div className={`prose ${own.lead}`}>
            <p>
              Each future combines the changes the IPCC expects with the tipping-point risks on this site. “Near-certain” and “likely” are this site’s
              bands, built on IPCC likelihood and confidence statements and on tipping-point assessments; “possible” means an outcome that cannot be
              ruled out or appears in a minority of models. No probability is attached to these outcomes beyond what the sources give.
            </p>
          </div>
          <div className={own.futures}>
            {FUTURES.map((f) => (
              <div key={f.title} className={own.future}>
                <p className={own.planTag}>{f.plan}</p>
                <h3>{f.title}</h3>
                <p className={own.sub}>{f.sub}</p>
                {(["certain", "likely", "possible"] as Band[]).map((b) => (
                  <div key={b} className={`${own.band} ${own[b]}`}>
                    <p className={own.bandLabel}>{BAND_LABEL[b]}</p>
                    <ul>{f.rows[b].map((t) => <li key={t}>{t}</li>)}</ul>
                  </div>
                ))}
              </div>
            ))}
          </div>
          <p className={`small faint ${styles.note}`}>
            Sources: IPCC AR6 WGI and WGII (2021, 2022); IPCC SROCC and SR1.5; UNEP Emissions Gap Report 2026; Frölicher et al. (2018), <i>Nature</i>{" "}
            560; Tittensor et al. (2021), <i>Nature Climate Change</i> 11; Boyce et al. (2022), <i>Nature Climate Change</i> 12; Drijfhout et al. (2025);
            Global Tipping Points Report 2025; Armstrong McKay et al. (2022); Sengupta et al. (2026); van de Wal et al. (2022), <i>Earth’s Future</i> 10;
            Nian et al. (2026). Details and caveats are on each <Link href="/changes/">big change</Link> page.
          </p>
        </div>
      </section>

      <section className="section" aria-labelledby="planning">
        <div className="wrap">
          <p className="kicker">Decision-ready</p>
          <h2 id="planning" className={styles.h2}>Plan for one future, test against another, aim for a third</h2>
          <div className={styles.responses}>
            <div style={{ background: "var(--bg-alt)" }}>
              <h3>The next 25 years look similar in every future</h3>
              <p>
                Sea level by 2050, deep-ocean warming and Arctic sea-ice loss differ little between scenarios. For investments with lives under
                about 25 years, the expected ocean is close to fixed, and plans should use it now. Emissions choices decide the second half of the
                century and beyond.
              </p>
            </div>
            <div style={{ background: "var(--bg-alt)" }}>
              <h3>Plan for current policies</h3>
              <p>
                Long-lived plans should at least be robust to the world that current policies lead to: about 2.7°C, more than 99% of reefs lost,
                0.4–0.8 m of sea-level rise by 2100 and rising faster.
              </p>
            </div>
            <div style={{ background: "var(--bg-alt)" }}>
              <h3>Stress-test against the high end</h3>
              <p>
                Critical, hard-to-reverse decisions should be tested against high emissions and against storylines such as an Atlantic collapse or
                2 m of sea-level rise by 2100. Storylines describe plausible outcomes without assigning them a probability (Shepherd et al., 2018);
                the UK has built such scenarios for national risk assessment (Arnell et al., 2025).
              </p>
            </div>
            <div style={{ background: "var(--bg-alt)" }}>
              <h3>Aim for the fastest cuts</h3>
              <p>
                Every tenth of a degree avoided reduces how far the sea eventually rises and how many tipping systems are put at risk. Some changes,
                such as sea-level rise and deep-ocean warming, will not reverse when temperatures come down. <Link href="/responses/#warming">How much emissions must fall</Link>.
              </p>
            </div>
          </div>
          <p className={styles.more}><Link className="more" href="/decisions/">How to decide under deep uncertainty</Link></p>
        </div>
      </section>
    </article>
  );
}
