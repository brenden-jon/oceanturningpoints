import fs from "node:fs";
import path from "node:path";
import type { Metadata } from "next";
import Link from "next/link";
import { EnsoHistory, EnsoWeekly, type EnsoData } from "@/components/EnsoCharts";
import OceanNowGlobe from "@/components/OceanNowGlobe";
import SeaIceChart from "@/components/SeaIceChart";
import WorldSstChart from "@/components/WorldSstChart";
import { abs, asset } from "@/lib/site";
import styles from "./ocean-now.module.css";

export const metadata: Metadata = {
  title: "The ocean now",
  description: "Today’s signals of the big ocean changes: El Niño, marine heatwaves and coral heat stress, with seasonal outlooks, updated daily.",
  alternates: { canonical: abs("/ocean-now/") },
};

const DATA = path.join(process.cwd(), "public", "data", "now");
const read = (f: string) => JSON.parse(fs.readFileSync(path.join(DATA, f), "utf8"));
const day = (iso: string) => new Date(iso.slice(0, 10) + "T12:00:00Z").toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric", timeZone: "UTC" });
const ordinal = (n: number) => n === 1 ? "lowest" : `${n}${["th", "st", "nd", "rd"][(n % 100 > 10 && n % 100 < 14) || n % 10 > 3 ? 0 : n % 10]} lowest`;
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
  const oniLast = enso.oni[enso.oni.length - 1];
  const roniLast = enso.roni[enso.roni.length - 1];
  const isRecord = enso.latest.nino34 >= enso.weeklyRecord.nino34;
  const sst = read("sst_world.json");
  const sstRecordThisYear = sst.recordDaily.year === Number(sst.date.slice(0, 4));
  const ice = read("sea_ice.json");
  const maps = m.seaIceMaps;

  return (
    <div className={styles.page}>
      <header className={`wrap ${styles.head}`}>
        <h1>The ocean now</h1>
        <p className="lede">
          Today’s signals of the big changes: sea temperatures, marine heatwaves and coral heat stress, El Niño, fishing, and sea ice at
          both poles. Updated daily from satellites, ocean buoys and vessel tracking.
        </p>
      </header>

      <section className="wrap" aria-label="Ocean conditions today">
        <OceanNowGlobe ssta={m.ssta} dhw={m.dhw} currents={m.currents} bleachOutlook={m.bleachingOutlook} sstOutlook={m.sstOutlook} fishing={m.fishing} />
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
                <Link className="more" href="/changes/el-nino/">How a warming climate is changing El Niño</Link>
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

      <section className="section" aria-labelledby="sst">
        <div className="wrap">
          <p className="kicker">The ocean surface</p>
          <h2 id="sst" className={styles.h2}>{sstRecordThisYear ? `A new record in ${sst.recordDaily.year}` : "Sea-surface temperature"}</h2>
          <div className={styles.ensoGrid}>
            <div className={styles.ensoText}>
              <dl className={styles.stats}>
                <div>
                  <dt>Average sea-surface temperature, 60°S–60°N, {day(sst.date)}</dt>
                  <dd className="tnum">{sst.latest.toFixed(1)}°C</dd>
                </div>
                <div>
                  <dt>Compared with the 1991–2020 average for the same day</dt>
                  <dd className="tnum">{signed(sst.anomaly, 2)}°C</dd>
                </div>
              </dl>
              <p>
                {sstRecordThisYear
                  ? <>On {day(sst.recordDaily.date)} the average ocean surface reached {sst.recordDaily.value.toFixed(2)}°C, the highest daily value since the satellite record began in 1982, just above the previous peak of {sst.previousYearlyMax.value.toFixed(2)}°C in {sst.previousYearlyMax.year}.</>
                  : <>The highest daily value since the satellite record began in 1982 is {sst.recordDaily.value.toFixed(2)}°C, on {day(sst.recordDaily.date)}.</>}{" "}
                The ocean surface has warmed with the climate, and El Niño years add a temporary boost on top.
              </p>
              <p className={styles.links}><Link className="more" href="/changes/coral-reefs/">What marine heat does to coral reefs</Link></p>
            </div>
            <div className={styles.charts}>
              <figure>
                <figcaption><strong>Daily sea-surface temperature, every year since 1982</strong><span className="small faint"> · 60°S–60°N</span></figcaption>
                <WorldSstChart d={sst} />
              </figure>
            </div>
          </div>
          <p className={`small faint ${styles.source}`}>
            <span className="evidence evidence--obs">Observed</span>{" "}
            <a href={sst.source.url}>Climate Reanalyzer</a>, Climate Change Institute, University of Maine (CC BY 4.0), from NOAA OISST v2.1. The
            most recent days are preliminary.
          </p>
        </div>
      </section>

      <section className="section section--alt" aria-labelledby="ice">
        <div className="wrap">
          <p className="kicker">Sea ice</p>
          <h2 id="ice" className={styles.h2}>Sea ice at both poles</h2>
          <div className={styles.iceGrid}>
            {([["arctic", "Arctic", "north", [0, 18]], ["antarctic", "Antarctic", "south", [0, 22]]] as const).map(([k, name, code, y]) => {
              const h = ice[k];
              return (
                <figure key={k}>
                  <figcaption>
                    <strong>{name}: {h.extent.toFixed(2)} million km²</strong> on {day(h.date)},{" "}
                    {Math.abs(h.extent - h.median8110).toFixed(2)} million km² {h.extent < h.median8110 ? "below" : "above"} the 1981–2010 median
                    {h.rankLowest ? `; the ${ordinal(h.rankLowest)} for the date in ${h.years} years` : ""}.
                  </figcaption>
                  {maps?.[code] && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img className={styles.iceMap} src={asset(`/data/now/${maps[code].file}`)} width={maps[code].w} height={maps[code].h} loading="lazy"
                      alt={`Map of ${name} sea-ice extent on ${day(maps[code].date)}, with the 1981–2010 median ice edge in orange.`} />
                  )}
                  <SeaIceChart h={h} name={name} y={y as unknown as [number, number]} />
                </figure>
              );
            })}
          </div>
          <p className={`small faint ${styles.source}`}>
            <span className="evidence evidence--obs">Observed</span>{" "}
            National Snow and Ice Data Center, Sea Ice Index version 4 (doi:10.7265/a98x-0f50): daily extent maps and values. Extent is the area of
            ocean with at least 15% ice. Maps: white is ice, orange is the median ice edge for 1981–2010; yellow marks missing satellite data.{" "}
            <Link href="/changes/southern-ocean/">Antarctic sea ice and the Southern Ocean</Link>.
          </p>
        </div>
      </section>

      <p className={`wrap small faint ${styles.updated}`}>Data refreshed {day(m.updated)}.</p>
    </div>
  );
}
