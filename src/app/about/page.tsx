import type { Metadata } from "next";
import { abs } from "@/lib/site";
import Link from "next/link";
import { PROFILES, PUBLICATIONS } from "@/lib/publications";
import styles from "./about.module.css";

export const metadata: Metadata = {
  title: "About",
  description: "Ocean Turning Points is an independent science platform created and curated by Brenden Jongman. How it works, who is behind it, and how it is kept independent.",
  alternates: { canonical: abs("/about/") },
};

export default function About() {
  return (
    <div className={`wrap ${styles.page}`}>
      <header className={styles.head}>
        <p className="eyebrow">About</p>
        <h1>An independent atlas of ocean change</h1>
      </header>

      <div className={styles.grid}>
        <div className="prose">
          <p className={styles.lead}>
            Ocean Turning Points explains how the ocean is changing, what that could mean for people, and how sure we can be. It
            puts published climate science and open data into maps, charts and short explainers, with particular attention to the
            consequences for developing countries.
          </p>
          <p>
            The site covers ocean systems that are changing now or could change abruptly: the Atlantic overturning circulation, the
            subpolar North Atlantic, the Southern Ocean, coral reefs and the ice sheets. It does not make forecasts, run campaigns or
            publish new research. Every map and claim traces to peer-reviewed work or an official dataset, and each topic shows the
            date it was last reviewed.
          </p>

          <h2 id="curator">Curator</h2>
          <p>
            Ocean Turning Points is created and curated by Brenden Jongman. Brenden works on climate and disaster risk and on
            adaptation, and has published research on global flood risk, the benefits of adaptation, and how to finance disaster
            risk. Brenden is affiliated with the World Bank Group and with the Environmental Change Institute at the University of
            Oxford.
          </p>
          <p className={styles.links}>
            <a href={PROFILES.orcid}>ORCID profile</a>
            <a href={PROFILES.linkedin}>LinkedIn</a>
            {PROFILES.website && <a href={PROFILES.website}>Personal website</a>}
          </p>

          <h2 id="independence">Independence</h2>
          <p>
            This is a personal, independent project. It is not affiliated with, funded by or endorsed by the World Bank, the
            University of Oxford or any other organisation, and nothing on it represents their views or their research programmes.
            It carries no advertising and receives no funding.
          </p>

          <h2 id="credits">Data and credits</h2>
          <p>
            The site depends on the scientists who publish their model output and observations openly. Each map and chart names its
            sources next to it; the full list, licences and processing steps are in <Link href="/science/methods/">methods and data</Link>.
            Earth imagery is NASA’s Blue Marble, served by NASA GIBS. Coastlines and borders are from Natural Earth.
          </p>
        </div>

        <aside className={styles.pubs} aria-labelledby="pubs">
          <h2 id="pubs" className="eyebrow">Selected published research by Brenden Jongman</h2>
          <ol>
            {PUBLICATIONS.map((p) => (
              <li key={p.doi}>
                <span className={styles.pubTitle}>
                  <a href={`https://doi.org/${p.doi}`}>{p.title}</a>
                </span>
                <span className={styles.pubMeta}>
                  {p.authors} ({p.year}). <em>{p.venue}</em>{p.details ? `, ${p.details}` : ""}.
                </span>
              </li>
            ))}
          </ol>
          <p className="small muted">Published, peer-reviewed work only. A fuller list is on the ORCID profile.</p>
        </aside>
      </div>
    </div>
  );
}
