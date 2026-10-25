import fs from "node:fs";
import path from "node:path";
import type { Metadata } from "next";
import Link from "next/link";
import SeaLevelCities, { type City } from "@/components/SeaLevelCities";
import { GlobalProjectionChart, IceSheetChart, ObservedSeaLevelChart, type SeaLevelData } from "@/components/SeaLevelCharts";
import { abs } from "@/lib/site";
import styles from "../coral-reefs/coral.module.css";
import own from "./sealevel.module.css";

const TITLE = "How much will the sea rise on the world’s most exposed coasts?";
const DESCRIPTION = "IPCC sea-level projections for sixteen coastal cities in developing countries, how often today’s rare floods will occur, the ice sheets behind the rise, and what Jakarta, the Mekong Delta and Bangladesh show about the decisions involved.";

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: abs("/changes/sea-level/") },
  openGraph: { title: TITLE, description: DESCRIPTION, url: abs("/changes/sea-level/"), images: [abs("/og/science.png")], type: "article", siteName: "Ocean Turning Points" },
};

const every = (af: number | string | undefined) => {
  if (af === undefined) return "–";
  if (af === "capped" || (typeof af === "number" && af >= 100)) return "every year or more";
  const y = 100 / (af as number);
  return y >= 2 ? `every ${Math.round(y)} years` : "every 1–2 years";
};

export default function SeaLevelPage() {
  const d = JSON.parse(fs.readFileSync(path.join(process.cwd(), "public", "data", "sealevel", "sealevel.json"), "utf8")) as SeaLevelData & { cities: City[] };
  const flooded = d.cities.filter((c) => c.floods);
  const g2100 = (id: string) => d.global[id].find((p) => p[0] === 2100)!;
  return (
    <article>
      <header className={`wrap ${styles.hero}`}>
        <div>
          <p className="label"><Link href="/changes/">Big changes</Link> · Sea level</p>
          <h1 className={styles.title}>{TITLE}</h1>
        </div>
        <div className={styles.heroSide}>
          <p className={styles.standfirst}>
            Melting ice sheets and warming water are raising the sea, and the rise will continue for centuries. For deltas and low
            coasts in developing countries, the bigger near-term danger is often the land itself sinking. Floods that were rare will
            become routine within decades.
          </p>
          <ul className={own.brief}>
            <li><b>Known:</b> sea level will keep rising under every scenario.</li>
            <li><b>Uncertain:</b> how fast the ice sheets will melt, and how fast land will sink where groundwater is pumped.</li>
            <li><b>What to do:</b> plan coastal investments for a range of sea levels, and tackle subsidence where it dominates.</li>
          </ul>
        </div>
      </header>

      <section className="wrap" aria-label="Sea-level rise at coastal cities">
        <SeaLevelCities cities={d.cities} />
      </section>

      <section className="section" aria-labelledby="floods">
        <div className={`wrap ${styles.split}`}>
          <div className="prose">
            <p className="kicker">What it means for flooding</p>
            <h2 id="floods">Rare floods become routine</h2>
            <p>
              A small rise in average sea level makes high water much more frequent, because storm surges and high tides start from a
              higher base. The IPCC projects that floods which occurred once a century in the recent past will occur at least once a
              year at more than half of all tide gauge locations by 2100 (<i>high confidence</i>).
            </p>
            <p>
              The change is fastest where tides and storms vary little, as on islands and in the Caribbean. In Bangladesh, cyclone
              surges and large tides already reach far above normal sea level, so the multiplier is smaller. That is a feature of the
              statistics: the absolute risk there remains among the highest in the world.
            </p>
          </div>
          <div className={own.tableWrap}>
            <table className={`${own.table} tnum`}>
              <caption>How often today’s 1-in-100-year flood would occur, intermediate emissions</caption>
              <thead><tr><th scope="col">Place (tide gauge)</th><th scope="col">2050</th><th scope="col">2100</th></tr></thead>
              <tbody>
                {flooded.map((c) => (
                  <tr key={c.name}>
                    <th scope="row">{c.name}<span>{c.floods!.station}</span></th>
                    <td>{every(c.floods!["ssp245-2050"])}</td>
                    <td>{every(c.floods!["ssp245-2100"])}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <p className="small faint">
              Median estimates for extreme still water levels, without waves or flood defences. IPCC AR6 Working Group I, Figure 9.32
              data (CEDA, CC BY 4.0).
            </p>
          </div>
        </div>
      </section>

      <section className="section section--alt" aria-labelledby="drivers">
        <div className="wrap">
          <p className="kicker">What is changing</p>
          <h2 id="drivers" className={styles.h2}>Where the water comes from</h2>
          <div className={own.twoCharts}>
            <div className={own.chartCard}><IceSheetChart d={d} /></div>
            <div className={own.chartCard}><ObservedSeaLevelChart d={d} /></div>
          </div>
          <div className={`${styles.split} ${own.gap}`}>
            <div className="prose">
              <p>
                Global sea level rose by about 20 cm between 1901 and 2018, and the rate in 2006–2018 was nearly three times that of
                1901–1971 (IPCC, 2021). Melting glaciers and ice sheets became the largest contributors, ahead of the expansion of
                warming seawater. Greenland and
                Antarctica together added about {(d.iceSheets.series.greenland.at(-1)![1] + d.iceSheets.series.antarctica.at(-1)![1]).toFixed(0)} mm
                between 1992 and 2023.
              </p>
              <p>
                By 2100 the IPCC’s central estimate is about {g2100("ssp245-medium")[2].toFixed(2)} m under intermediate emissions,
                with a likely range of {g2100("ssp245-medium")[1].toFixed(2)}–{g2100("ssp245-medium")[3].toFixed(2)} m. A rise
                approaching 2 m by 2100 cannot be ruled out under very high emissions if the Antarctic ice sheet becomes unstable. The
                ice sheets respond slowly, so the rise continues for centuries even if warming stops; the Global Tipping Points
                Report places the thresholds for Greenland and West Antarctica around 1.5°C of warming.{" "}
                <Link href="/science/ice-sheets/">The ice sheets in detail</Link>.
              </p>
            </div>
            <div className={own.chartCard}><GlobalProjectionChart d={d} /></div>
          </div>
        </div>
      </section>

      <section className="section" aria-labelledby="cases">
        <div className="wrap">
          <p className="kicker">Case studies</p>
          <h2 id="cases" className={styles.h2}>Three coasts, three kinds of decision</h2>
          <div className={own.cases}>
            <article>
              <h3>Jakarta: a sinking capital</h3>
              <p className={own.fact}>Parts of the city sank 3–10 cm a year between 1982 and 2014, far faster than the sea is rising (Abidin et al., 2015).</p>
              <p>
                The main cause is groundwater pumping. A 3 m coastal dyke could lose its ability to stop floods by about 2040 if
                subsidence continues, while a 1 m dyke would be enough if it stopped (Takagi et al., 2017). Indonesia has pursued a
                giant sea wall and is moving government functions to a new capital, Nusantara, in East Kalimantan. Researchers argue
                that the sea wall treats the symptom more than the cause (Garschagen et al., 2018).
              </p>
              <p className={own.lesson}><b>Decision:</b> engineered defence and relocation are only durable if the underlying subsidence is stopped.</p>
            </article>
            <article>
              <h3>Mekong Delta: lower than thought</h3>
              <p className={own.fact}>The delta’s average height is about 0.8 m above sea level, far lower than earlier global data suggested (Minderhoud et al., 2019).</p>
              <p>
                Groundwater pumping makes the delta sink about 1.1 cm a year on average, close to ten times faster than global sea-level
                rise (Minderhoud et al., 2017). Dams and sand mining starve it of sediment. Depending mainly on how groundwater is
                managed, 23–90% of the delta could be below sea level by 2100 (Schmitt et al., 2021). Viet Nam has begun to shift from
                trying to keep floods out towards controlled seasonal flooding in the upper delta.
              </p>
              <p className={own.lesson}><b>Decision:</b> water, sediment and land-use policy across borders matter as much as dykes.</p>
            </article>
            <article>
              <h3>Bangladesh: polders or tides</h3>
              <p className={own.fact}>Islands embanked since the 1960s have lost 1.0–1.5 m of height, while the neighbouring mangrove forest stayed stable (Auerbach et al., 2015).</p>
              <p>
                Embankments (polders) keep out tides and the sediment they carry, so the land inside sinks. When Cyclone Aila breached
                embankments in 2009, flooded land gained tens of centimetres of sediment within two years. Tidal river management
                deliberately opens embankments to rebuild land, an approach that grew from local protest (van Staveren et al., 2016).
              </p>
              <p className={own.lesson}><b>Decision:</b> working with sediment can keep land above the rising sea; reinforcing walls alone can lock in sinking.</p>
            </article>
          </div>
        </div>
      </section>

      <section className="section section--alt" aria-labelledby="decide">
        <div className="wrap">
          <p className="kicker">What it means for decisions</p>
          <h2 id="decide" className={styles.h2}>Planning coasts for a rise that will not stop</h2>
          <div className={styles.responses}>
            <div><h3>Plan for a range, with triggers</h3><p>Design ports, defences and coastal towns for the IPCC likely range, test them against about 2 m by 2100, and agree in advance the sea levels at which to raise defences, change land use or move. This adaptive pathways approach avoids both over-building and lock-in.</p></div>
            <div><h3>Stop the land sinking</h3><p>In many deltas and coastal cities, groundwater pumping lowers the land faster than the sea rises. Alternative water supplies and pumping controls can be the most effective flood protection available.</p></div>
            <div><h3>Use natural defences where they work</h3><p>Mangroves, reefs and sediment management reduce flood risk. They need space and protection, and they work best alongside engineered defences.</p></div>
            <div><h3>Prepare for relocation where needed</h3><p>For some low islands and deltas, managed retreat will become part of the answer. Planning it early, with the people affected, costs less and is fairer than moving after disasters.</p></div>
          </div>
        </div>
      </section>

      <section className="section" aria-labelledby="data">
        <div className="wrap prose">
          <h2 id="data" className={styles.h2}>About these data</h2>
          <p>
            <b>City projections:</b> IPCC AR6 sea-level projections (Garner et al., 2021, <a href="https://doi.org/10.5281/zenodo.6382554">doi:10.5281/zenodo.6382554</a>,
            CC BY 4.0; method Kopp et al., 2023), at the nearest suitable tide gauge or 1° grid cell, relative to 1995–2014. They include
            vertical land motion estimated from tide gauges, but not present-day subsidence that no gauge records, so values for
            Jakarta, the Mekong and Lagos understate local rise. <b>Flood frequency:</b> IPCC AR6 Working Group I Figure 9.32 data
            (<a href="https://doi.org/10.5285/6b33327d0d0d4bcca872b431279086db">CEDA</a>, CC BY 4.0), median amplification of the 1-in-100-year
            extreme still water level at tide gauges within 100 km. <b>Ice sheets:</b> IMBIE (Otosaka et al., 2026), Open Government
            Licence. <b>Observed sea level:</b> NOAA Laboratory for Satellite Altimetry. We thank the authors of the IPCC AR6 sea-level
            projections and the NASA Sea Level Change Team, who developed and hosted the original projection tool.
          </p>
          <p>
            <b>Case studies:</b> Abidin et al. (2015) <a href="https://doi.org/10.5194/piahs-370-15-2015">doi:10.5194/piahs-370-15-2015</a>;
            Takagi et al. (2017) <a href="https://doi.org/10.3390/su9040619">doi:10.3390/su9040619</a>; Garschagen et al. (2018) <a href="https://doi.org/10.3390/su10082934">doi:10.3390/su10082934</a>;
            Minderhoud et al. (2017) <a href="https://doi.org/10.1088/1748-9326/aa7146">doi:10.1088/1748-9326/aa7146</a>; Minderhoud et al. (2019) <a href="https://doi.org/10.1038/s41467-019-11602-1">doi:10.1038/s41467-019-11602-1</a>;
            Schmitt et al. (2021) <a href="https://doi.org/10.1073/pnas.2026127118">doi:10.1073/pnas.2026127118</a>; Auerbach et al. (2015) <a href="https://doi.org/10.1038/nclimate2472">doi:10.1038/nclimate2472</a>;
            van Staveren et al. (2016) <a href="https://doi.org/10.2166/wp.2016.029">doi:10.2166/wp.2016.029</a>; IPCC (2021) <a href="https://doi.org/10.1017/9781009157896.001">Summary for Policymakers</a>.
          </p>
        </div>
      </section>
    </article>
  );
}
