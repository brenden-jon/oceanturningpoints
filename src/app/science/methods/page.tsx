import type { Metadata } from "next";
import { abs } from "@/lib/site";
import Link from "next/link";
import styles from "../science.module.css";
import m from "./methods.module.css";

export const metadata: Metadata = {
  title: "Methods and data",
  description: "How Ocean Turning Points chooses sources, processes data, shows uncertainty and keeps its content up to date.",
  alternates: { canonical: abs("/science/methods/") },
};

const DATA = [
  { name: "CESM AMOC scenario fields", who: "van Westen & Baatsen, Utrecht University", use: "Temperature maps, sea-ice edges", licence: "CC BY 4.0", doi: "10.5281/zenodo.15490235" },
  { name: "AMOC-TEMP-Extremes v1", who: "van Westen & Baatsen", use: "Scenario-run AMOC time series; run identification", licence: "CC BY 4.0", doi: "10.5281/zenodo.14586440" },
  { name: "AMOC in the PI quasi-equilibrium hosing simulation", who: "van Westen & Baatsen", use: "Tipping-point chart", licence: "CC BY 4.0", doi: "10.5281/zenodo.18785979" },
  { name: "NAHosMIP monthly temperature and precipitation v3", who: "Jackson, Bellomo et al.", use: "Four-model rainfall maps", licence: "CC BY 4.0", doi: "10.5281/zenodo.14884357" },
  { name: "RAPID-MOCHA-WBTS AMOC time series v2024.1a", who: "National Oceanography Centre and partners", use: "Observed AMOC chart", licence: "Open Government Licence; acknowledgement required", doi: "10.5285/48d0bf43-0598-ceb2-e063-7086abc062f1" },
  { name: "Coral Reef Watch SST anomaly and Degree Heating Weeks v3.1", who: "NOAA Coral Reef Watch", use: "Ocean now, coral reefs, El Niño (daily)", licence: "Use without restriction, with credit", doi: "10.3390/rs12233856" },
  { name: "Blended near-real-time surface currents", who: "NOAA CoastWatch", use: "Animated currents (daily)", licence: "Public domain", url: "https://coastwatch.noaa.gov/erddap/griddap/noaacwBLENDEDNRTcurrentsDaily.html" },
  { name: "ENSO indices and diagnostic discussion", who: "NOAA Climate Prediction Center", use: "El Niño status and charts (daily)", licence: "Public domain", url: "https://www.cpc.ncep.noaa.gov/products/analysis_monitoring/enso_advisory/ensodisc.shtml" },
  { name: "Sea Ice Index, version 4", who: "National Snow and Ice Data Center", use: "Sea-ice charts (daily)", licence: "Free with citation", doi: "10.7265/a98x-0f50" },
  { name: "World Database on Protected Areas", who: "UNEP-WCMC and IUCN, Protected Planet", use: "Marine protected areas, shown via UNEP-WCMC’s map service", licence: "Non-commercial use with attribution", url: "https://www.protectedplanet.net/" },
  { name: "Blue Marble: Shaded Relief and Bathymetry", who: "NASA Earth Observatory, via NASA GIBS", use: "Earth imagery", licence: "Public domain (NASA)", url: "https://earthobservatory.nasa.gov/features/BlueMarble" },
  { name: "Natural Earth coastlines, land and borders", who: "Natural Earth", use: "Base map lines", licence: "Public domain", url: "https://www.naturalearthdata.com/" },
];

export default function Methods() {
  return (
    <article className={styles.article}>
      <header className={`wrap ${styles.head}`}>
        <p className="label"><Link href="/science/">Science</Link> · Methods</p>
        <h1 className={styles.title}>How this site handles evidence</h1>
        <p className="lede">
          The aim is that anyone can see where a number comes from, what kind of evidence it is, and how much weight it can bear.
        </p>
      </header>

      <div className={`wrap ${m.body}`}>
        <div className="prose">
          <h2>Sources</h2>
          <p>
            We use peer-reviewed research, assessments by the Intergovernmental Panel on Climate Change (IPCC), and official, openly
            licensed datasets. Each reference is checked against its publisher’s record before it is cited. We do not publish new
            research or unpublished results, and we do not use material shared in confidence.
          </p>

          <h2>Kinds of evidence</h2>
          <p>Every map and chart is labelled with the kind of evidence it shows, because they answer different questions.</p>
          <ul>
            <li><span className="evidence evidence--obs">Observed</span> Direct measurements, such as the RAPID array. They tell us what has happened, over the period measured.</li>
            <li><span className="evidence evidence--model">Model experiment</span> Idealised simulations designed to isolate a process, such as adding fresh water until the AMOC collapses. They show the effect of a change. They do not say when, or whether, it will happen.</li>
            <li><span className="evidence evidence--forecast">Forecast</span> Seasonal outlooks issued by forecasting centres such as NOAA. Their skill is measured and falls with lead time.</li>
            <li><span className="evidence">Projection</span> Simulations driven by a scenario of future emissions. They are conditional on that scenario and are not forecasts.</li>
          </ul>
          <p>
            We also keep apart historical and future periods; a scenario and a prediction; exposure (who or what is in harm’s way)
            and damage (what is lost); and a hypothetical comparison, such as a coast with no reef at all, and a realistic one, such
            as a reef that degrades.
          </p>

          <h2>Uncertainty and confidence</h2>
          <p>
            Where the IPCC has assessed a statement, we use its calibrated language: confidence (low, medium, high) for the strength
            of evidence and agreement, and likelihood terms (likely, very likely) for probabilities. Where it has not, the “How sure
            are we?” tables give our own reading of the published evidence, with the basis stated.
          </p>
          <p>
            When several models are available we show the range across them as well as the average. Rainfall maps mark where all models agree
            on the direction of change, and tables list each model’s value.
          </p>

          <h2>Processing</h2>
          <p>
            All processing is done by a documented, open pipeline that downloads the original files, records their sources and
            checks results against the published papers. Model fields are placed on a common 0.5° latitude-longitude grid, finer than
            any model used, so no model detail is lost; the finer grid adds no real detail. The site decodes the same values for colouring and for the numbers shown when
            you hover, so what you see and what you can read are always identical.
          </p>
          <p>
            Colour scales are perceptually uniform and readable with common forms of colour-blindness: cmocean “balance” for
            temperature (Thyng et al., 2016) and the brown-to-blue-green ColorBrewer scale for rainfall, the convention used by the
            IPCC. Each variable has a fixed, stated range that is shared across comparisons, so colours mean the same thing from one
            map to the next. Values beyond the range are shown at the end colour and marked “≤” or “≥” in the legend.
          </p>
          <p>
            Values for named places are taken from the model grid cell containing the place. Climate-model cells are typically 100 to
            250 km across, so these figures describe the surrounding region.
          </p>

          <h2>Limitations</h2>
          <ul>
            <li>The AMOC temperature maps come from a single model (CESM). Other models give the same pattern of change but different magnitudes.</li>
            <li>AMOC experiments use artificial freshwater forcing to produce a collapse. Ice sheets are fixed, and greenhouse forcing is held constant after 2100.</li>
            <li>Four models is a small ensemble. The average shows where models agree; it is not the single most likely outcome.</li>
            <li>Rainfall changes are percentages relative to each model’s pre-industrial climate; they are not added to today’s observed rainfall.</li>
            <li>Daily satellite products are less reliable near coasts and sea ice. Coral heat stress indicates bleaching risk; how reefs respond varies locally.</li>
          </ul>

          <h2>Review and corrections</h2>
          <p>
            Each topic shows the date it was last reviewed against new research. Topics are reviewed at least once a year and when
            major studies or assessments are published. Corrections are made openly and noted on the page concerned.
          </p>

          <h2>References</h2>
          <ol className={m.refs}>
            <li>Ben-Yami, M., Good, P., Jackson, L. C., et al. (2024). Impacts of AMOC collapse on monsoon rainfall: a multi-model comparison. <em>Earth’s Future</em>, 12, e2023EF003959. <a href="https://doi.org/10.1029/2023EF003959">doi:10.1029/2023EF003959</a></li>
            <li>Jackson, L. C., Alastrué de Asenjo, E., Bellomo, K., et al. (2023). Understanding AMOC stability: the North Atlantic Hosing Model Intercomparison Project. <em>Geoscientific Model Development</em>, 16, 1975–1995. <a href="https://doi.org/10.5194/gmd-16-1975-2023">doi:10.5194/gmd-16-1975-2023</a></li>
            <li>Román, M. O., Wang, Z., Sun, Q., et al. (2018). NASA’s Black Marble nighttime lights product suite. <em>Remote Sensing of Environment</em>, 210, 113–143. <a href="https://doi.org/10.1016/j.rse.2018.03.017">doi:10.1016/j.rse.2018.03.017</a></li>
            <li>Thyng, K. M., Greene, C. A., Hetland, R. D., et al. (2016). True colors of oceanography: guidelines for effective and accurate colormap selection. <em>Oceanography</em>, 29, 9–13. <a href="https://doi.org/10.5670/oceanog.2016.66">doi:10.5670/oceanog.2016.66</a></li>
            <li>van Westen, R. M. &amp; Baatsen, M. L. J. (2025). European temperature extremes under different AMOC scenarios in the Community Earth System Model. <em>Geophysical Research Letters</em>, 52, e2025GL114611. <a href="https://doi.org/10.1029/2025GL114611">doi:10.1029/2025GL114611</a></li>
          </ol>
        </div>

        <aside className={m.data} aria-labelledby="datasets">
          <h2 id="datasets">Datasets used on this site</h2>
          <ul>
            {DATA.map((d) => (
              <li key={d.name}>
                <strong>{d.name}</strong>
                <span>{d.who}</span>
                <span>Used for: {d.use}</span>
                <span>Licence: {d.licence}</span>
                {d.doi ? <a href={`https://doi.org/${d.doi}`}>doi:{d.doi}</a> : d.url ? <a href={d.url}>{d.url.replace(/^https?:\/\//, "").replace(/\/$/, "")}</a> : null}
              </li>
            ))}
          </ul>
        </aside>
      </div>
    </article>
  );
}
