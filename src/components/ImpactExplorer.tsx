"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import styles from "./ImpactExplorer.module.css";

interface Item { change: string; sector: string; text: string; source: string; doi?: string; url?: string; evidence: string; confidence?: string; caveat?: string; link?: string | null }
interface Region { id: string; name: string; summary: string; items: Item[] }
export interface ImpactData {
  meta: { note: string; updated: string };
  sectors: { id: string; name: string }[];
  changes: { id: string; name: string; kind: string; link: string | null }[];
  evidenceTypes: { id: string; name: string; note: string }[];
  regions: Region[];
  global: Item[];
}

const EVIDENCE: Record<string, string> = { observed: "evidence--obs", projection: "", model: "evidence--model", assessment: "evidence--caveat" };
const KIND_COLOUR: Record<string, string> = { tipping: "#b24a2a", variability: "#6b4bb0", expected: "#0a62b8" };

export default function ImpactExplorer({ data }: { data: ImpactData }) {
  const [region, setRegion] = useState(data.regions[0].id);
  const [sector, setSector] = useState("all");
  const [change, setChange] = useState("all");
  useEffect(() => {
    const p = new URLSearchParams(window.location.search);
    const r = p.get("region"); const c = p.get("change"); const s = p.get("sector");
    if (r && data.regions.some((x) => x.id === r)) setRegion(r);
    else if (c) { const first = data.regions.find((x) => x.items.some((it) => it.change === c)); if (first) setRegion(first.id); }
    if (c) setChange(c);
    if (s) setSector(s);
  }, [data]);
  useEffect(() => {
    const p = new URLSearchParams();
    p.set("region", region);
    if (sector !== "all") p.set("sector", sector);
    if (change !== "all") p.set("change", change);
    window.history.replaceState(null, "", `?${p.toString()}`);
  }, [region, sector, change]);

  const reg = data.regions.find((r) => r.id === region)!;
  const changes = useMemo(() => Object.fromEntries(data.changes.map((c) => [c.id, c])), [data]);
  const items = [...reg.items, ...data.global].filter((it) => (sector === "all" || it.sector === sector) && (change === "all" || it.change === change));
  const bySector = data.sectors.map((s) => ({ ...s, items: items.filter((it) => it.sector === s.id) })).filter((s) => s.items.length);
  const presentChanges = Array.from(new Set(reg.items.map((it) => it.change)));

  return (
    <div className={styles.wrap}>
      <div className={styles.regions} role="group" aria-label="Choose a region">
        {data.regions.map((r) => (
          <button key={r.id} aria-pressed={r.id === region} onClick={() => { setRegion(r.id); if (change !== "all" && !r.items.some((it) => it.change === change)) setChange("all"); }}>{r.name}</button>
        ))}
      </div>

      <div className={styles.head}>
        <h2>{reg.name}</h2>
        <p>{reg.summary}</p>
      </div>

      <div className={styles.filters}>
        <label>
          <span>Sector</span>
          <select value={sector} onChange={(e) => setSector(e.target.value)}>
            <option value="all">All sectors</option>
            {data.sectors.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
          </select>
        </label>
        <div className={styles.changes} role="group" aria-label="Filter by change">
          <button aria-pressed={change === "all"} onClick={() => setChange("all")}>All changes</button>
          {presentChanges.map((c) => (
            <button key={c} aria-pressed={change === c} onClick={() => setChange(c)}>
              <i style={{ background: KIND_COLOUR[changes[c]?.kind] ?? "#999" }} />{changes[c]?.name ?? c}
            </button>
          ))}
        </div>
      </div>

      {bySector.length === 0 && <p className="faint">No statements for this combination yet.</p>}
      <div className={styles.sectors}>
        {bySector.map((s) => (
          <section key={s.id} className={styles.sector} aria-label={s.name}>
            <h3>{s.name}</h3>
            <ul>
              {s.items.map((it, i) => (
                <li key={i}>
                  <p className={styles.change}>
                    <i style={{ background: KIND_COLOUR[changes[it.change]?.kind] ?? "#999" }} />
                    {changes[it.change]?.link ? <Link href={changes[it.change].link!}>{changes[it.change]?.name}</Link> : changes[it.change]?.name}
                    {data.global.includes(it) && <span className={styles.globalTag}>All regions</span>}
                  </p>
                  <p className={styles.text}>{it.text}</p>
                  <p className={`small faint ${styles.meta}`}>
                    <span className={`evidence ${EVIDENCE[it.evidence] ?? ""}`}>{data.evidenceTypes.find((e) => e.id === it.evidence)?.name ?? it.evidence}</span>{" "}
                    {it.doi ? <a href={`https://doi.org/${it.doi}`}>{it.source}</a> : it.url ? <a href={it.url}>{it.source}</a> : it.source}
                    {it.confidence ? `. ${it.confidence}` : ""}{it.caveat ? `. ${it.caveat}` : ""}
                  </p>
                </li>
              ))}
            </ul>
          </section>
        ))}
      </div>
      <p className={`small faint ${styles.note}`}>
        <i style={{ background: KIND_COLOUR.tipping }} className={styles.dot} /> possible tipping or abrupt change{" "}
        <i style={{ background: KIND_COLOUR.variability }} className={styles.dot} /> natural variability changing with warming{" "}
        <i style={{ background: KIND_COLOUR.expected }} className={styles.dot} /> expected change. {data.meta.note}
      </p>
    </div>
  );
}
