"use client";

import { useState } from "react";
import HBars from "./HBars";

/** Beck et al. (2018), Nature Communications 9, 2186, Table 1 and Supplementary Table 1 (CC BY 4.0).
 * Benefit = present reefs compared with reefs that have lost their top metre; present climate; 2011 US$. */
const AVERTED = [
  ["Indonesia", 639], ["Philippines", 590], ["Malaysia", 452], ["Mexico", 452], ["Cuba", 401], ["Saudi Arabia", 138],
  ["Dominican Republic", 96], ["United States", 94], ["Taiwan", 61], ["Jamaica", 46], ["Viet Nam", 42], ["Myanmar", 33],
  ["Thailand", 32], ["Bahamas", 14], ["Belize", 9],
] as const;
const SHARE = [
  ["Cayman Islands", 6.81], ["Belize", 4.28], ["Grenada", 3.76], ["Bahamas", 3.7], ["Jamaica", 2.67], ["Cuba", 2.61],
  ["Philippines", 2.37], ["Dominican Republic", 2.19], ["Malaysia", 1.54], ["Antigua and Barbuda", 1.5], ["Seychelles", 1.14],
  ["Turks and Caicos", 0.88], ["New Caledonia", 0.83], ["Indonesia", 0.72],
] as const;

export function ReefFloodSavings() {
  const [view, setView] = useState<"usd" | "share">("usd");
  return (
    <figure style={{ margin: 0 }}>
      <div style={{ display: "flex", justifyContent: "space-between", gap: "1rem", flexWrap: "wrap", alignItems: "baseline", marginBottom: "1rem" }}>
        <p style={{ margin: 0, fontWeight: 600 }}>{view === "usd" ? "Flood damage reefs prevent each year" : "Assets reefs protect in a 1-in-100-year storm"}</p>
        <div className="seg" role="group" aria-label="Measure" style={{ display: "inline-grid", gridAutoFlow: "column", background: "#e3e6e9", borderRadius: 9, padding: 2, gap: 2 }}>
          {([["usd", "US$ a year"], ["share", "Share of national assets"]] as const).map(([k, l]) => (
            <button key={k} aria-pressed={view === k} onClick={() => setView(k)}
              style={{ border: 0, borderRadius: 7, padding: "0.35rem 0.7rem", font: "500 0.82rem/1 var(--font)", cursor: "pointer",
                background: view === k ? "#fff" : "transparent", boxShadow: view === k ? "0 1px 3px rgba(0,0,0,.14)" : undefined }}>{l}</button>
          ))}
        </div>
      </div>
      {view === "usd" ? (
        <HBars max={700} rows={AVERTED.map(([c, v]) => ({ label: c, value: v, text: `$${v}m` }))} />
      ) : (
        <HBars max={7.5} color="#1f7a5a" rows={SHARE.map(([c, v]) => ({ label: c, value: v, text: `${v}%` }))} />
      )}
      <figcaption className="small faint" style={{ marginTop: "1rem" }}>
        <span className="evidence evidence--model">Model estimate</span>{" "}
        {view === "usd"
          ? "Expected annual flood damage avoided by today’s reefs compared with reefs that have lost their top metre, top 15 countries, 2011 US$."
          : "Built capital protected from a 1-in-100-year storm, as a share of each country’s built capital: small islands depend most."}{" "}
        Beck et al. (2018), <i>Nature Communications</i>, <a href="https://doi.org/10.1038/s41467-018-04568-z">doi:10.1038/s41467-018-04568-z</a>, CC BY 4.0.
        The published rankings do not include China or Singapore.
      </figcaption>
    </figure>
  );
}

export function ReefLongTerm() {
  return (
    <figure style={{ margin: 0, display: "grid", gap: "1.8rem" }}>
      <div>
        <p style={{ margin: "0 0 0.25rem", fontWeight: 600 }}>Land flooded by a 1-in-100-year storm on reef coasts</p>
        <p className="small faint" style={{ margin: "0 0 0.9rem" }}>Global, today = 100</p>
        <HBars max={240} labelWidth="13rem" rows={[
          { label: "Today, with reefs", value: 100, muted: true },
          { label: "2100, sea-level rise, reefs intact", value: 164, text: "164 (+64%)" },
          { label: "2100, sea-level rise and reefs lose their top metre", value: 216, text: "216 (+116%)" },
        ]} color="#b24a2a" />
        <p className="small faint" style={{ margin: "0.8rem 0 0" }}>
          Very high emissions (RCP8.5). Beck et al. (2018), <i>Nature Communications</i>, CC BY 4.0.
        </p>
      </div>
      <div>
        <p style={{ margin: "0 0 0.25rem", fontWeight: 600 }}>Extra water depth over Caribbean reefs by 2100</p>
        <p className="small faint" style={{ margin: "0 0 0.9rem" }}>Sea-level rise minus reef growth, range across Florida, Mexico and Bonaire</p>
        <HBars max={1.4} labelWidth="13rem" rule={{ at: 0.5, label: "0.5 m: wave exposure and flood risk commonly rise" }} rows={[
          { label: "Very low emissions (SSP1-2.6)", value: 0.52, range: [0.41, 0.52], text: "0.41–0.52 m" },
          { label: "Intermediate (SSP2-4.5)", value: 0.76, range: [0.65, 0.76], text: "0.65–0.76 m" },
          { label: "Very high (SSP5-8.5)", value: 1.2, range: [1.04, 1.2], text: "1.04–1.20 m" },
        ]} color="#0a62b8" />
        <p className="small faint" style={{ margin: "0.8rem 0 0" }}>
          <span className="evidence evidence--model">Projection</span> Perry et al. (2025), <i>Nature</i>,{" "}
          <a href="https://doi.org/10.1038/s41586-025-09439-4">doi:10.1038/s41586-025-09439-4</a>, CC BY 4.0. Reefs 0–6 m deep in the
          tropical western Atlantic.
        </p>
      </div>
    </figure>
  );
}

/** Teh, Teh & Sumaila (2013), PLoS ONE, Table S3 (CC BY 4.0); Spalding et al. (2017), Marine Policy, Table A1 (CC BY 4.0). */
const FISHERS = [
  ["Indonesia", 1657757], ["India", 958530], ["Philippines", 911754], ["Bangladesh", 230498], ["Egypt", 205260],
  ["Viet Nam", 204546], ["China", 189467], ["Brazil", 144433], ["Myanmar", 123746], ["Tanzania", 108789], ["Papua New Guinea", 107952],
] as const;
const TOURISM = [
  ["Palau", 43.19], ["Maldives", 43.17], ["Seychelles", 6.45], ["Vanuatu", 6.4], ["Bahamas", 6.39], ["Fiji", 5.9],
  ["Micronesia (FSM)", 5.56], ["Antigua and Barbuda", 5.48], ["Belize", 5.12], ["Saint Lucia", 4.31],
] as const;

export function ReefLivelihoods() {
  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 22rem), 1fr))", gap: "2.5rem" }}>
      <figure style={{ margin: 0 }}>
        <p style={{ margin: "0 0 0.25rem", fontWeight: 600 }}>People who fish on coral reefs</p>
        <p className="small faint" style={{ margin: "0 0 0.9rem" }}>Countries with more than 100,000 reef fishers, around 2010</p>
        <HBars max={1800000} color="#1f7a5a" rows={FISHERS.map(([c, v]) => ({ label: c, value: v, text: v >= 1e6 ? `${(v / 1e6).toFixed(2)}m` : `${Math.round(v / 1000)}k` }))} />
        <figcaption className="small faint" style={{ marginTop: "0.9rem" }}>
          About 6 million reef fishers in 99 countries, at least a quarter of them gleaners collecting by hand. Teh, Teh and Sumaila (2013),{" "}
          <i>PLoS ONE</i>, <a href="https://doi.org/10.1371/journal.pone.0065397">doi:10.1371/journal.pone.0065397</a>, CC BY 4.0.
        </figcaption>
      </figure>
      <figure style={{ margin: 0 }}>
        <p style={{ margin: "0 0 0.25rem", fontWeight: 600 }}>Reef tourism as a share of the economy</p>
        <p className="small faint" style={{ margin: "0 0 0.9rem" }}>Visitor spending linked to reefs, % of GDP, highest ten</p>
        <HBars max={48} color="#0a62b8" rows={TOURISM.map(([c, v]) => ({ label: c, value: v, text: `${v.toFixed(1)}%` }))} />
        <figcaption className="small faint" style={{ marginTop: "0.9rem" }}>
          Spalding et al. (2017), <i>Marine Policy</i>, <a href="https://doi.org/10.1016/j.marpol.2017.05.014">doi:10.1016/j.marpol.2017.05.014</a>, CC BY 4.0.
          Reef tourism is worth about US$36 billion a year worldwide.
        </figcaption>
      </figure>
    </div>
  );
}
