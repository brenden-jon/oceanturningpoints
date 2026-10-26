import type { Metadata } from "next";
import Link from "next/link";
import MonitoringMap from "@/components/MonitoringMap";
import ObservingRecords from "@/components/ObservingRecords";
import { ArticleLd } from "@/components/JsonLd";
import { abs } from "@/lib/site";
import styles from "../changes/coral-reefs/coral.module.css";
import own from "./monitoring.module.css";
import PhotoFigure from "@/components/PhotoFigure";

const TITLE = "Who is watching the ocean?";
const DESCRIPTION = "The floats, moorings, ships, tide gauges and satellites that observe the ocean, who runs them, what satellites can and cannot see, and why long, unbroken records matter for decisions on the big ocean changes.";

export const metadata: Metadata = {
  title: "Ocean monitoring: map of Argo floats, buoys, tide gauges and AMOC arrays",
  description: DESCRIPTION,
  alternates: { canonical: abs("/monitoring/") },
  openGraph: { title: TITLE, description: DESCRIPTION, url: abs("/monitoring/"), images: [abs("/og/science.png")], type: "article", siteName: "Ocean Turning Points" },
};

const GAPS: { change: string; href: string; need: string; have: string; gap: string }[] = [
  {
    change: "Atlantic circulation", href: "/changes/atlantic-circulation/",
    need: "Flow across the whole Atlantic, without breaks, for decades.",
    have: "Five measurement lines; the longest, at 26.5°N, began in 2004.",
    gap: "Telling a decline apart from natural swings needs 29–67 years of record (Lobelle et al., 2020); the measured weakening is not expected to stand out clearly until the 2040s (McCarthy et al., 2025). The main arrays face funding gaps within 18 months (Gunnarsson et al., 2026).",
  },
  {
    change: "Subpolar North Atlantic", href: "/changes/subpolar-gyre/",
    need: "Winter mixing in a few small basins south of Greenland.",
    have: "The OSNAP array since 2014, plus floats.",
    gap: "Until OSNAP, the key sinking was thought to happen mainly in the Labrador Sea; it happens mostly further east (Lozier et al., 2019). Floats alone may be too sparse for these small regions (Gunnarsson et al., 2026).",
  },
  {
    change: "Ice sheets", href: "/changes/ice-sheets/",
    need: "Warm water reaching the Antarctic ice shelves, and the deep ocean.",
    have: "A few floats under sea ice; about 200 deep floats worldwide.",
    gap: "Few floats work under sea ice, almost no sensors are fixed to the ice, and there is little data outside summer (Newman et al., 2019).",
  },
  {
    change: "Coral reefs", href: "/changes/coral-reefs/",
    need: "Heat stress, and what it does to corals.",
    have: "Daily satellite sea temperature; surveys at more than 12,000 sites in 73 countries since 1978.",
    gap: "Satellites track heat on every reef: 84% of reef area had bleaching-level heat in 2023–2025 (NOAA). Surveys of what the corals did are patchy, and only coral and algal cover are measured consistently enough for a global picture (GCRMN, 2021).",
  },
  {
    change: "El Niño", href: "/changes/el-nino/",
    need: "Heat and winds across the tropical Pacific, every day.",
    have: "Moored buoys along the equator, floats and satellites.",
    gap: "In 2012–2014 the mooring array delivered about 40% of its data instead of the usual 80–90%. The redesign that followed doubled floats near the equator (Smith et al., 2019).",
  },
  {
    change: "Fish on the move", href: "/changes/fish-on-the-move/",
    need: "Where fish stocks are, and how many.",
    have: "Scientific stock assessments, which cover some regions far better than others.",
    gap: "Assessed stocks make up only about half of the world’s catch, and stocks without assessments tend to be in worse shape (Hilborn et al., 2020).",
  },
  {
    change: "Ocean carbon sink", href: "/changes/southern-ocean/",
    need: "Carbon taken up by the ocean, in every season.",
    have: "Ship measurements at the surface, and floats with carbon-related sensors.",
    gap: "Adding winter float data cut the estimated Southern Ocean uptake by about a third (Bushinsky et al., 2019). Ship-based CO2 coverage has fallen back to early-2000s levels (Global Carbon Budget 2024).",
  },
];

export default function MonitoringPage() {
  return (
    <article>
      <ArticleLd path="/monitoring/" title={TITLE} description={DESCRIPTION} about={["Global Ocean Observing System", "Argo", "Ocean observation", "RAPID array", "OceanEye"]} />
      <header className={`wrap ${styles.hero}`}>
        <div>
          <p className="label"><Link href="/responses/">What can be done</Link> · Monitoring</p>
          <h1 className={styles.title}>{TITLE}</h1>
        </div>
        <div className={styles.heroSide}>
          <p className={styles.standfirst}>
            About 8,000 floats, buoys, ships and tide gauges report from the ocean, more than half of them run by the United States. Most
            measure the surface or the top 2,000 m. The big changes play out where coverage is thin: the deep ocean, around Antarctica, in
            winter and along coasts. The direct record of the Atlantic circulation starts only in 2004.
          </p>
        </div>
      </header>

      <section className="wrap" aria-label="Map of ocean observing platforms">
        <MonitoringMap />
      </section>

      <section className="section" aria-labelledby="enough">
        <div className="wrap">
          <p className="kicker">Thousands of points, but enough for what?</p>
          <h2 id="enough" className={styles.h2}>Where the big changes fall through the gaps</h2>
          <div className={`prose ${own.lead}`}>
            <p>
              The map looks crowded, but each network was built for a particular job: weather forecasts, seasonal forecasts, the heat in the
              upper ocean. Most were designed for the top 2,000 m of the open, ice-free ocean, over months to years. The big changes happen
              largely outside that design: in the deep ocean, next to Antarctic ice, in high-latitude winters, along coasts, and in trends that
              take decades to emerge.
            </p>
          </div>
          <div className={own.gapTable} role="table" aria-label="Observing needs and gaps for each big change">
            <div className={own.gapHead} role="row">
              <span role="columnheader">Change</span><span role="columnheader">What needs measuring</span><span role="columnheader">What exists</span><span role="columnheader">The gap</span>
            </div>
            {GAPS.map((g) => (
              <div key={g.change} className={own.gapRow} role="row">
                <span role="cell" className={own.gapName}><Link href={g.href}>{g.change}</Link></span>
                <span role="cell"><i className={own.gapLabel}>Needs</i>{g.need}</span>
                <span role="cell"><i className={own.gapLabel}>Exists</i>{g.have}</span>
                <span role="cell" className={own.gapGap}><i className={own.gapLabel}>Gap</i>{g.gap}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="section section--alt" aria-labelledby="today">
        <div className="wrap">
          <p className="kicker">The system today</p>
          <h2 id="today" className={styles.h2}>Status of the global observing system</h2>
          <ul className={own.stats}>
            <li><b>9,389</b><span>platforms in the Global Ocean Observing System, from 64 contributing countries, making more than 120,000 observations a day (GOOS, 2025).</span></li>
            <li><b>55%</b><span>of the way to a complete Argo array: global, full-depth, and measuring chemistry and biology as well as heat (GOOS, 2025).</span></li>
            <li><b>Over half</b><span>of the world’s ocean temperature profiles come from the United States. Removing them would raise the error in the ocean heating rate by 163% (Zhu et al., 2026).</span></li>
            <li><b>83%</b><span>of the multi-sensor biogeochemical floats now operating are US floats, funded by a project that ends in October 2026 (GO-BGC).</span></li>
          </ul>
          <p className={`small faint ${styles.note}`}>
            Against each network’s own target, Argo and weather-reporting ships are above 85%, drifting buoys and repeat ship surveys 70–85%,
            tide gauges, coastal radars and gliders 30–50%. GOOS rates the system as “subcritical”, with declining drifting buoy and ship-based observations, reliance on a few contributors and
            no secure long-term funding (GOOS 2025 Status Report). Removing all US data would degrade ocean heat monitoring more than removing
            80% of all data at random (Zhu et al., 2026).
          </p>
        </div>
      </section>

      <section className="section" aria-labelledby="see">
        <div className="wrap">
          <p className="kicker">Satellites and sensors in the water</p>
          <h2 id="see" className={styles.h2}>Satellite and in-water observations compared</h2>
          <div className={own.two}>
            <div className={own.card}>
              <h3>From space</h3>
              <p>Satellites see the surface of the whole ocean, often every day.</p>
              <ul>
                <li><b>Sea-surface temperature</b>: marine heatwaves and coral bleaching alerts.</li>
                <li><b>Sea level</b>: the rise of the ocean and the shape of currents, from radar altimeters.</li>
                <li><b>Ocean colour</b>: algae and productivity near the surface.</li>
                <li><b>Sea ice</b>, surface salinity and winds.</li>
                <li><b>Ships at sea</b>: radar and optical images reveal fishing vessels that do not broadcast their position.</li>
              </ul>
            </div>
            <div className={own.card}>
              <h3>Only from inside the ocean</h3>
              <p>Most of the ocean’s heat, carbon and movement lies below the surface, out of a satellite’s view.</p>
              <ul>
                <li><b>Heat below the surface</b>, which sets up El Niño and marine heatwaves months ahead.</li>
                <li><b>Ocean heat content</b>, the main measure of how fast the planet is gaining energy.</li>
                <li><b>The Atlantic overturning</b>, measured by moored arrays across whole ocean basins.</li>
                <li><b>Carbon, oxygen and nutrients</b> at depth, from biogeochemical floats and research ships.</li>
                <li><b>Sea level at the coast</b>, where people live, from tide gauges.</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      <section className="section section--alt" aria-labelledby="records">
        <div className="wrap">
          <p className="kicker">Why continuity matters</p>
          <h2 id="records" className={styles.h2}>Long-term decisions rest on short records</h2>
          <div className={styles.split} style={{ alignItems: "start" }}>
            <div className="prose">
              <p>
                Decisions that are revisited often, such as coral bleaching alerts, can draw on satellite records several decades long.
                Seasonal forecasts of El Niño and marine heatwaves need heat measured below the surface by moorings and floats.
              </p>
              <p>
                Decisions that play out over decades, on the Atlantic circulation, the carbon budget and the ocean carbon sink, rest on
                direct records only 12 to 22 years long. Direct measurement of the Atlantic circulation began in 2004 at 26.5°N and in
                2014 in the subpolar North Atlantic. Earlier changes have to be inferred from indirect evidence, and those inferences
                disagree.
              </p>
              <p>
                For these decisions a gap cannot be made up later. A missing year at 26.5°N is a year permanently lost from a record that is
                already too short to separate a trend from natural swings.
              </p>
            </div>
            <div className={styles.panel}>
              <ObservingRecords />
            </div>
          </div>
          <PhotoFigure photos={["argo-float-deployment"]} caption="Crew deploy an Argo float from NOAA Ship Ronald H. Brown. Each float profiles the top 2,000 m of the ocean every ten days." narrow />
        </div>
      </section>

      <section className="section" aria-labelledby="flux">
        <div className="wrap">
          <p className="kicker">2026</p>
          <h2 id="flux" className={styles.h2}>Funding changes in 2026</h2>
          <ol className={own.timeline}>
            <li><time>21 May</time><p>The US National Science Foundation begins removing four of the five arrays of its Ocean Observatories Initiative, including the Irminger Sea array south of Greenland.</p></li>
            <li><time>18 June</time><p>After the US Senate passes a bill to save the observatories, NSF stops the removal; one array already out of the water is to be redeployed.</p></li>
            <li><time>28 August</time><p>The GO-BGC project, which deployed most of the world’s biogeochemical floats, confirms it will end on 31 October 2026 with no near-term US deployments planned.</p></li>
            <li><time>23 September</time><p>The European Union and Canada launch the <b>OceanEye International Alliance for the Global Ocean Observing System</b> in New York: 30 countries and the EU, with pledges of at least €211 million.</p></li>
          </ol>
          <div className={own.oceaneye}>
            <h3>OceanEye</h3>
            <p>
              OceanEye is an EU initiative, announced in March 2026, to strengthen global ocean observation. Its international alliance, co-chaired
              at launch by the President of the European Commission and the Prime Minister of Canada and organised with UNESCO’s
              Intergovernmental Oceanographic Commission and the World Meteorological Organization, aims to maintain existing platforms, close
              data gaps and strengthen the coordination of the Global Ocean Observing System, including OceanOPS. Members include ocean
              countries from every region, among them Angola, Brazil, Cabo Verde, Madagascar, Mauritius, Namibia and Palau. Further pledges are
              expected at COP31, the Our Ocean Conference and the 2028 UN Ocean Conference.
            </p>
            <p className="small faint">
              Sources: European Commission, <a href="https://commission.europa.eu/topics/fisheries-and-ocean/reinforcing-global-ocean-observation_en">Reinforcing
              global ocean observation</a>; Prime Minister of Canada, 23 September 2026. The Commission’s press release of 24 September gives
              “almost €220 million”.
            </p>
          </div>
        </div>
      </section>

      <section className="section section--alt" aria-labelledby="stronger">
        <div className="wrap">
          <p className="kicker">What would make it stronger</p>
          <h2 id="stronger" className={styles.h2}>Treat ocean observation as critical infrastructure</h2>
          <div className={styles.responses}>
            <div style={{ background: "var(--bg-alt)" }}>
              <h3>Protect the long records</h3>
              <p>
                A gap in a seasonal forecast input degrades one season’s forecasts. A gap in the Atlantic circulation arrays, deep and
                biogeochemical floats, repeat ship surveys or long tide-gauge records is permanent. These are best funded through stable,
                multi-year arrangements.
              </p>
            </div>
            <div style={{ background: "var(--bg-alt)" }}>
              <h3>Connect observations to decisions</h3>
              <p>
                Observations deliver most when observing needs are set with the people who act on them, and when monitoring is linked to
                decision points in adaptation plans, early action, risk finance and mitigation accounting, including in small island and
                coastal developing states.
              </p>
            </div>
            <div style={{ background: "var(--bg-alt)" }}>
              <h3>Broaden who contributes</h3>
              <p>
                When one country’s data matter more than 80% of everyone else’s, the system is fragile. Lower-cost sensors, observations from
                commercial and fishing vessels, regional programmes and the capacity-building provisions of the High Seas Treaty can widen the base.
              </p>
            </div>
            <div style={{ background: "var(--bg-alt)" }}>
              <h3>Keep the data open</h3>
              <p>
                Free, timely data sharing, as Argo has practised since 2000, is what turns individual national platforms into a global system that
                every country can use.
              </p>
            </div>
          </div>
          <p className={`small muted ${styles.note}`}>
            This section follows Jongman (forthcoming). <Link href="/about/">Brenden Jongman</Link> is the curator of this site.
          </p>
        </div>
      </section>

      <section className="section" aria-labelledby="data">
        <div className="wrap prose">
          <h2 id="data" className={styles.h2}>About these data and sources</h2>
          <p>
            <b>Map:</b> platform positions from <a href="https://www.ocean-ops.org/">OceanOPS</a>, the WMO-IOC centre for the Global Ocean
            Observing System, reproduced for non-commercial use with acknowledgement; refreshed weekly. Satellite missions are not shown.
          </p>
          <p>
            <b>Sources:</b> Global Ocean Observing System, <i>2025 Status Report</i>; Zhu et al. (2026), <i>Nature Climate Change</i> 16, 657–660;
            Argo (2000), Argo float data and metadata from the Global Data Assembly Centre, SEANOE, doi:10.17882/42182; GO-BGC project notice,
            28 August 2026; US National Science Foundation, update on the Ocean Observatories Initiative, 18 June 2026; McCarthy et al. (2015),{" "}
            <i>Progress in Oceanography</i> 130; Lozier et al. (2019), <i>Science</i> 363, 516–521; IPCC AR6 Working Group I, Chapter 9;
            Lobelle et al. (2020), <i>Geophysical Research Letters</i> 47, e2020GL089974; McCarthy et al. (2025), <i>Geophysical Research
            Letters</i> 52, e2025GL115055; Gunnarsson et al. (2026), <i>AMOC Observation as Critical Infrastructure</i>, Reykjavik Institute (policy
            report); Owens et al. (2022), <i>Marine Technology Society Journal</i> 56(3), 84–90; Roemmich et al. (2019), <i>Frontiers in Marine
            Science</i> 6, 439; Argo Steering Team (2024), AST-25 report; Newman et al. (2019), <i>Frontiers in Marine Science</i> 6, 433; Moltmann
            et al. (2019), <i>Frontiers in Marine Science</i> 6, 291; Smith et al. (2019), <i>Frontiers in Marine Science</i> 6, 31; Souter et al.
            (eds) (2021), <i>Status of Coral Reefs of the World: 2020</i>, GCRMN; NOAA Coral Reef Watch (2026); Hilborn et al. (2020), <i>PNAS</i>{" "}
            117, 2218–2224; Bushinsky et al. (2019), <i>Global Biogeochemical Cycles</i> 33, 1370–1388; Friedlingstein et al. (2025), Global Carbon
            Budget 2024, <i>Earth System Science Data</i> 17, 965–1039; Jongman (forthcoming).
          </p>
        </div>
      </section>
    </article>
  );
}
