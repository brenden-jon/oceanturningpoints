import fs from "node:fs";
import path from "node:path";
import type { Metadata } from "next";
import Link from "next/link";
import { EnsoHistory, EnsoWeekly, type EnsoData } from "@/components/EnsoCharts";
import OceanNowGlobe from "@/components/OceanNowGlobe";
import SeaIceChart, { type IceHemi } from "@/components/SeaIceChart";
import { abs } from "@/lib/site";
import styles from "./ocean-now.module.css";

export const metadata: Metadata = {
  title: "The ocean now",
  description: "Today’s sea-surface temperature anomalies, coral heat stress, currents, El Niño and sea ice, updated daily from satellite and ocean observations.",
  alternates: { canonical: abs("/ocean-now/") },
};

const DATA = path.join(process.cwd(), "public", "data", "now");
const read = (f: string) => JSON.parse(fs.readFileSync(path.join(DATA, f), "utf8"));
const day = (iso: string) => new Date(iso.slice(0, 10) + "T12:00:00Z").toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric", timeZone: "UTC" });
const signed = (v: number, d = 1) => `${v > 0 ? "+" : v < 0 ? "−" : ""}${Math.abs(v).toFixed(d)}`;

export default function OceanNow() {
  const m = read("manifest.json");
  const enso = read("enso.json") as EnsoData & {
    latest: { week: string; nino34: number; relative34: number };
    weeklyRecord: { week: string; nino34: number };
    discussion: { status: string | null; issued: string | null; url: string };
    oni: { season: string; year: number; value: number }[];
    roni: { season: string; year: number; value: number }[];
  };
  const ice = read("sea_ice.json") as { arctic: IceHemi; antarctic: IceHemi };
  const ordinal = (n: number) => `${n}${n % 10 === 1 && n !== 11 ? "st" : n % 10 === 2 && n !== 12 ? "nd" : n % 10 === 3 && n !== 13 ? "rd" : "th"}`;
  const oniLast = enso.oni[enso.oni.length - 1];
  const roniLast = enso.roni[enso.roni.length - 1];
  const isRecord = enso.latest.nino34 >= enso.weeklyRecord.nino34;

  return (
    <div className={styles.page}>
      <header className={`wrap ${styles.head}`}>
        <h1>The ocean now</h1>
        <p className="lede">
          What the ocean is doing today, and what it means for the months ahead. El Niño and marine heatwaves bring drought, floods
          and coral bleaching, and seasonal forecasts give months of warning. Updated daily from satellites and ocean buoys.
        </p>
      </header>

      <section className="wrap" aria-label="Ocean conditions today">
        <OceanNowGlobe ssta={m.ssta} dhw={m.dhw} currents={m.currents} bleachOutlook={m.bleachingOutlook} sstOutlook={m.sstOutlook} />
      </section>

      <section className={`section section--alt ${styles.enso}`} aria-labelledby="enso">
        <div className="wrap">
          <p className="kicker">Tropical Pacific</p>
          <h2 id="enso" className={styles.h2}>{enso.discussion.status?.includes("El Niño") ? (enso.latest.relative34 >= 1.5 ? "A strong El Niño is under way" : "El Niño is under way") : enso.discussion.status?.includes("La Niña") ? "La Niña is under way" : "El Niño and La Niña"}</h2>
          <div className={styles.ensoGrid}>
            <div className={styles.ensoText}>
              <dl className={styles.stats}>
                <div>
                  <dt>NOAA status</dt>
                  <dd className={styles.status}>{enso.discussion.status ?? "Not available"}</dd>
                </div>
                <div>
                  <dt>Central Pacific sea temperature compared with normal (Niño-3.4), week of {day(enso.latest.week)}</dt>
                  <dd className="tnum">{signed(enso.latest.nino34)}°C</dd>
                </div>
                <div>
                  <dt>The same, minus the warming of the whole tropics (relative index)</dt>
                  <dd className="tnum">{signed(enso.latest.relative34)}°C</dd>
                </div>
                <div>
                  <dt>Three-month relative index, used by NOAA to judge strength ({roniLast.season} {roniLast.year})</dt>
                  <dd className="tnum">{signed(roniLast.value, 2)}°C</dd>
                </div>
              </dl>
              <p>
                Sea-surface temperatures in the central-eastern equatorial Pacific are {signed(enso.latest.nino34)}°C above
                normal{isRecord ? ", the highest weekly value in NOAA’s record, which starts in 1981" : ""}. The relative index
                subtracts the warming of the whole tropics, which is how NOAA now judges El Niño strength; on that measure this event
                is strong but has not yet passed the 1982 record.
              </p>
              <p>
                El Niño shifts rainfall around the world. It typically brings drought to southern Africa, Indonesia, Australia,
                Central America and northern South America, heavy rain to coastal Peru and Ecuador and parts of East Africa, and
                mass coral bleaching. Its effect on global temperature peaks in the following year.
              </p>
              <p className={styles.links}>
                <Link className="more" href="/science/el-nino/">How a warming climate is changing El Niño</Link>
              </p>
            </div>
            <div className={styles.charts}>
              <figure>
                <figcaption><strong>Weekly Niño-3.4 temperature anomaly</strong><span className="small faint"> · last three years</span></figcaption>
                <EnsoWeekly data={enso} />
              </figure>
              <figure>
                <figcaption><strong>Three-month index since 1950</strong><span className="small faint"> · ONI {oniLast.season} {oniLast.year}: {signed(oniLast.value, 2)}°C</span></figcaption>
                <EnsoHistory data={enso} />
              </figure>
            </div>
          </div>
          <p className={`small faint ${styles.source}`}>
            <span className="evidence evidence--obs">Observed</span>{" "}
            NOAA Climate Prediction Center: weekly Niño indices (OISST v2.1, 1991–2020 base), Oceanic Niño Index and Relative
            Oceanic Niño Index (ERSSTv6). The indices use a 1991–2020 normal; the globe above uses Coral Reef Watch’s 1985–2012 normal,
            so values differ slightly. Status from the ENSO diagnostic discussion{enso.discussion.issued ? ` of ${enso.discussion.issued}` : ""}.{" "}
            <a href={enso.discussion.url}>NOAA discussion</a>
          </p>
        </div>
      </section>

      <section className="section" aria-labelledby="ice">
        <div className="wrap">
          <p className="kicker">Polar oceans</p>
          <h2 id="ice" className={styles.h2}>Sea ice at the poles</h2>
          <div className={styles.iceGrid}>
            {([["antarctic", "Antarctic", [0, 24]], ["arctic", "Arctic", [0, 16]]] as const).map(([k, name, y]) => {
              const h = ice[k];
              return (
                <figure key={k}>
                  <figcaption>
                    <strong>{name}</strong>
                    <span className="tnum"> · {h.extent.toFixed(2)} million km² on {day(h.date)}
                      {h.rankLowest ? `, the ${ordinal(h.rankLowest)} lowest for the date in ${h.years} years` : ""}</span>
                  </figcaption>
                  <SeaIceChart h={h} name={name} y={[y[0], y[1]]} />
                </figure>
              );
            })}
          </div>
          <p className={styles.iceText}>
            Antarctic sea ice grew slowly until 2014 and has been unusually low since 2016, with record lows in 2023. Arctic sea ice
            has declined in every month of the year since satellite records began in 1979. Less sea ice exposes darker ocean that
            absorbs more sunlight, and around Antarctica it changes where dense, deep water forms. <Link className="more" href="/science/southern-ocean/">Southern Ocean</Link>
          </p>
          <p className={`small faint ${styles.source}`}>
            <span className="evidence evidence--obs">Observed</span>{" "}
            NSIDC Sea Ice Index, version 4 (Fetterer et al., <a href="https://doi.org/10.7265/a98x-0f50">doi:10.7265/a98x-0f50</a>).
            Extent is the area of ocean with at least 15% ice cover. Median and record low for each day are calculated here from the
            daily record since 1978.
          </p>
        </div>
      </section>

      <p className={`wrap small faint ${styles.updated}`}>Data refreshed {day(m.updated)}.</p>
    </div>
  );
}
