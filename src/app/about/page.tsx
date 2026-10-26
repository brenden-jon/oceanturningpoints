import type { Metadata } from "next";
import { abs, asset } from "@/lib/site";
import Link from "next/link";
import { FORTHCOMING, IN_PROGRESS, PROFILES, PUBLICATIONS } from "@/lib/publications";
import styles from "./about.module.css";

export const metadata: Metadata = {
  title: "About",
  description: "Ocean Turning Points is an independent guide to the big ocean changes, created and curated by Dr Brenden Jongman. How it works, who is behind it, and how it is kept independent.",
  alternates: { canonical: abs("/about/") },
};

export default function About() {
  return (
    <div className={`wrap ${styles.page}`}>
      <header className={styles.head}>
        <h1>An independent guide to the big ocean changes</h1>
      </header>

      <div className={styles.grid}>
        <div className="prose">
          <p className={styles.lead}>
            Ocean Turning Points explains the big changes under way or possible in the ocean: how likely each is, what it would mean
            for people and economies, and which decisions should change. It turns published science and open data into maps, charts
            and short explainers, with particular attention to developing countries.
          </p>
          <p>
            It follows six changes: the Atlantic overturning circulation, coral reefs, the ice sheets, El Niño, fish stocks on the
            move and the subpolar North Atlantic, and keeps an eye on the Southern Ocean. It is written for people who make or advise
            on decisions, in finance and planning ministries, development banks, insurers and adaptation agencies. It does not make
            its own forecasts or run campaigns. Every map and claim traces to peer-reviewed work or an official dataset, and each
            topic shows the date it was last reviewed.
          </p>

          <h2 id="curator">Curator</h2>
          <div className={styles.curator}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img className={styles.portrait} src={asset("/img/brenden-jongman.jpg")} alt="Dr Brenden Jongman" width={800} height={800} />
            <div>
              <p>
                Ocean Turning Points is created and curated by <strong>Dr Brenden Jongman</strong>, who works on climate resilience,
                ocean systems and adaptation and has spent more than 15 years at the intersection of research, policy and
                implementation.
              </p>
              <p>
                At the World Bank, Brenden has led global programmes on nature-based solutions, ocean and coastal resilience, and
                disaster risk financing, after earlier work with the Red Cross, the European Commission and VU University Amsterdam.
                Brenden is an Honorary Research Associate at the University of Oxford’s Environmental Change Institute and holds a PhD
                in climate risk management from VU University Amsterdam. The research has appeared in <em>Nature</em>, <em>PNAS</em>{" "}
                and <em>Nature Climate Change</em>.
              </p>
            </div>
          </div>
          <p className={styles.links}>
            <a href={PROFILES.website}>Personal website</a>
            <a href={PROFILES.scholar}>Google Scholar</a>
            {PROFILES.substack && <a href={PROFILES.substack}>Substack</a>}
            <a href={PROFILES.linkedin}>LinkedIn</a>
          </p>

          <h2 id="independence">Independence</h2>
          <p>
            This is a personal, independent project. It is not affiliated with, funded by or endorsed by the World Bank, the
            University of Oxford or any other organisation, and nothing on it represents their views or their research programmes.
            It carries no advertising and receives no funding.
          </p>

          <h2 id="credits">Data and credits</h2>
          <p>
            Ocean Turning Points depends on the scientists who publish their model output and observations openly. Each map and chart names its
            sources next to it; the full list, licences and processing steps are in <Link href="/science/methods/">methods and data</Link>.
            Earth imagery is NASA’s Blue Marble, served by NASA GIBS. Coastlines and borders are from Natural Earth.
          </p>
        </div>

        <aside className={styles.pubs} aria-labelledby="pubs">
          <h2 id="pubs">Research by Brenden Jongman</h2>
          <h3 className={styles.pubGroup}>Forthcoming</h3>
          <ol>
            {FORTHCOMING.map((p) => (
              <li key={p.title}>
                <span className={styles.pubTitle}>{p.title}</span>
                <span className={styles.pubMeta}>{p.authors} (forthcoming).</span>
              </li>
            ))}
          </ol>
          <h3 className={styles.pubGroup}>Work in progress</h3>
          <ol>
            {IN_PROGRESS.map((p) => (
              <li key={p.title}>
                <span className={styles.pubTitle}>{p.title}</span>
                <span className={styles.pubMeta}>{p.text}</span>
              </li>
            ))}
          </ol>
          <h3 className={styles.pubGroup}>Selected published research</h3>
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
          <p className="small muted">A fuller list is on <a href={PROFILES.scholar}>Google Scholar</a>.</p>
        </aside>
      </div>
    </div>
  );
}
