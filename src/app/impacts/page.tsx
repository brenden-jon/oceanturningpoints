import fs from "node:fs";
import path from "node:path";
import type { Metadata } from "next";
import Link from "next/link";
import ImpactExplorer, { type ImpactData } from "@/components/ImpactExplorer";
import { ArticleLd } from "@/components/JsonLd";
import { abs } from "@/lib/site";
import styles from "../changes/coral-reefs/coral.module.css";

const TITLE = "What the big ocean changes mean for your region";
const DESCRIPTION = "Impacts of AMOC collapse, coral reef loss, sea-level rise, El Niño, shifting fish stocks and other ocean changes, region by region and sector by sector: food, water, coasts, fisheries, health, energy, tourism and public finance.";

export const metadata: Metadata = {
  title: "Ocean change impacts by region and sector",
  description: DESCRIPTION,
  alternates: { canonical: abs("/impacts/") },
  openGraph: { title: TITLE, description: DESCRIPTION, url: abs("/impacts/"), images: [abs("/og/science.png")], type: "article", siteName: "Ocean Turning Points" },
};

export default function ImpactsPage() {
  const data = JSON.parse(fs.readFileSync(path.join(process.cwd(), "content", "data", "impacts.json"), "utf8")) as ImpactData;
  const n = data.regions.reduce((a, r) => a + r.items.length, 0);
  return (
    <article>
      <ArticleLd path="/impacts/" title={TITLE} description={DESCRIPTION} about={["Climate impacts", "Ocean change", "Regional climate risk", "Adaptation"]} />
      <header className={`wrap ${styles.hero}`}>
        <div>
          <p className="label"><Link href="/changes/">Big changes</Link> · Impacts</p>
          <h1 className={styles.title}>{TITLE}</h1>
        </div>
        <div className={styles.heroSide}>
          <p className={styles.standfirst}>
            The same ocean change plays out differently from place to place. Choose a region to see which of the big changes matter there,
            and what they mean for food, water, coasts, fisheries, health, energy, tourism and public finance.
          </p>
          <p className={styles.chips}>
            <span className="evidence">{n} sourced statements across {data.regions.length} regions</span>
            <span className="evidence">Updated {new Date(data.meta.updated + "T12:00:00Z").toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" })}</span>
          </p>
        </div>
      </header>
      <section className="wrap" style={{ paddingBottom: "4rem" }} aria-label="Impacts by region and sector">
        <ImpactExplorer data={data} />
      </section>
    </article>
  );
}
