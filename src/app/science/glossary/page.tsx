import type { Metadata } from "next";
import Link from "next/link";
import { abs } from "@/lib/site";
import styles from "../science.module.css";

export const metadata: Metadata = {
  title: "Glossary",
  description: "Plain definitions of the terms used on Ocean Turning Points, from tipping points to Degree Heating Weeks.",
  alternates: { canonical: abs("/science/glossary/") },
};

const TERMS: [string, string][] = [
  ["AMOC (Atlantic Meridional Overturning Circulation)", "A loop of ocean currents that carries warm water north near the surface of the Atlantic and returns cold water south at depth. The Gulf Stream is part of its surface flow."],
  ["Bleaching", "Corals expelling the algae that live in their tissues and feed them, which turns them white. Bleached corals are alive and can recover if the heat ends soon enough; prolonged heat kills them."],
  ["Confidence (IPCC)", "How strong the evidence and agreement behind a statement are: low, medium or high. It is separate from likelihood."],
  ["Degree Heating Weeks", "A satellite measure of coral heat stress: how much, and for how long, the sea has been at least 1°C warmer than its usual warmest month over the past 12 weeks. Four °C-weeks is roughly one month at 1°C above that level. NOAA treats 4 as the level at which reef-wide bleaching is likely and 8 as the level at which coral deaths are likely."],
  ["El Niño, La Niña and ENSO", "El Niño is a warming of the central and eastern tropical Pacific every few years, with weaker trade winds; La Niña is the opposite. Together they are the El Niño–Southern Oscillation (ENSO), the largest year-to-year swing in the global climate."],
  ["Exposure and damage", "Exposure is who and what is in harm’s way, such as people living below a certain height above the sea. Damage is what is actually lost, which also depends on defences and preparedness."],
  ["Forecast, projection and model experiment", "A forecast predicts conditions in the coming weeks or months from today’s state. A projection describes what could happen under a scenario of future emissions. A model experiment isolates a process, for example by forcing the AMOC to collapse, to see what it would do; it says nothing about when that might happen."],
  ["Likelihood (IPCC)", "Calibrated probability terms: virtually certain (99–100%), very likely (90–100%), likely (66–100%), about as likely as not (33–66%), unlikely (0–33%), very unlikely (0–10%)."],
  ["Marine heatwave", "A period of days to months when sea-surface temperature in a region is unusually high for the time of year."],
  ["Niño-3.4 index", "The sea-surface temperature compared with normal in a box of the central-eastern equatorial Pacific, used to track El Niño. The Oceanic Niño Index (ONI) is its three-month average. The relative index (RONI) subtracts the warming of the whole tropics; NOAA has used it to judge El Niño strength since 2026."],
  ["Planetary boundary", "A precautionary limit on a human pressure on the Earth system, set before the level at which large-scale harm becomes likely. Crossing one raises risk; it is not the same as crossing a tipping point."],
  ["Pre-industrial", "The climate before large-scale fossil-fuel use, usually represented by 1850–1900. Global warming figures such as “1.4°C” are measured from this baseline."],
  ["Relative sea level", "The height of the sea against the land at a particular place. It can rise much faster than the global average where the land is sinking."],
  ["Scenario (SSP, RCP)", "A consistent storyline of future emissions and socioeconomic change used to drive climate models, from very low (SSP1-1.9) to very high (SSP5-8.5) emissions. Older studies use RCPs, such as RCP4.5 and RCP8.5."],
  ["Sea-ice extent", "The area of ocean with at least 15% ice cover."],
  ["Sverdrup (Sv)", "A unit of ocean flow: one million cubic metres of water per second. All the world’s rivers together carry about one sverdrup."],
  ["Tipping point", "A level of warming, or another pressure, beyond which a system keeps changing on its own, even if the pressure stops rising. The change can be abrupt and hard or impossible to reverse."],
  ["Tipping system", "A part of the Earth system that can pass a tipping point, such as warm-water coral reefs, the AMOC or the Greenland ice sheet. Older work calls the large ones tipping elements."],
];

export default function Glossary() {
  return (
    <article className={styles.article}>
      <header className={`wrap ${styles.head}`}>
        <p className="label"><Link href="/science/">Science</Link> · Glossary</p>
        <h1 className={styles.title}>Glossary</h1>
        <p className="lede">Plain definitions of the terms used on this site.</p>
      </header>
      <div className="wrap">
        <dl className={styles.glossary}>
          {TERMS.map(([t, d]) => (
            <div key={t} id={t.split(" ")[0].toLowerCase()}>
              <dt>{t}</dt>
              <dd>{d}</dd>
            </div>
          ))}
        </dl>
      </div>
    </article>
  );
}
