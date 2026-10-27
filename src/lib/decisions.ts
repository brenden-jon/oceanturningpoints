/**
 * The Ocean Turning Points decision lens: for each big change, which decisions should change now,
 * which need assessment now, and where current plans are robust. This is Ocean Turning Points' own
 * synthesis, built on decision-making-under-deep-uncertainty literature (Hallegatte 2009;
 * Haasnoot et al. 2013; Hinkel et al. 2019; IPCC AR6 WGII) and Jongman & Hall (2026, Nature Sustainability).
 */
export type LensKey = "amoc" | "ice-sheets" | "coral-reefs" | "el-nino" | "subpolar-gyre" | "southern-ocean" | "fish";

export interface Lens { act: string[]; assess: string[]; stay: string[] }

export const LENS: Record<LensKey, Lens> = {
  amoc: {
    act: [
      "Long-lived assets designed now in exposed regions, such as water storage in the Sahel or ports on Atlantic coasts: build in margins or adjustability rather than sizing to the average projection.",
      "Keep the Atlantic observing arrays funded; a gap in the record cannot be made up later.",
    ],
    assess: [
      "Screen which countries and portfolios are most exposed, and stress-test investments, design standards and climate finance against weakening and collapse scenarios.",
      "Link Atlantic monitoring to trigger points at which plans and standards are reviewed.",
      "Carry a collapse, and its carbon-cycle feedback, as an explicit scenario in carbon budgets.",
    ],
    stay: [
      "Drought-tolerant crops, efficient irrigation, social protection and early warning remain valuable whether or not the circulation weakens.",
    ],
  },
  "ice-sheets": {
    act: [
      "Avoid new development in low-lying land that will be exposed later this century; setback zones for new building are cheap now and costly later.",
      "Build seawalls only as part of a long-term adaptive plan, so they do not lock people into rising risk.",
      "Start the long lead-time work, on land, finance and consent, where pathways show relocation may be needed.",
    ],
    assess: [
      "Find when current coastal strategies stop working, and test them against high-end sea-level rise.",
      "Monitor sea-level rise and Antarctic signals, with decision points that move earlier if the rise speeds up.",
      "Use upper-bound sea levels for decisions that are long-lived, critical and hard to reverse.",
    ],
    stay: [
      "Near-term protection, flood-proofing, early warning and beach nourishment to about 2050: sea level by mid-century differs little between emissions scenarios.",
    ],
  },
  "coral-reefs": {
    act: [
      "Do not rely on reefs as the only defence for coastal assets designed to last past mid-century; plan a fallback.",
    ],
    assess: [
      "Map which coasts lose protection as reefs degrade, and what hybrid or engineered defences would be needed.",
      "Plan the transition for communities that depend on reef fisheries and tourism.",
    ],
    stay: [
      "Reduce local pressures and protect and restore reefs where they can survive: it pays off now and buys time, though for a limited period.",
    ],
  },
  "el-nino": {
    act: [
      "Agree forecast triggers, actions and pre-arranged finance before the next event, where they do not yet exist.",
    ],
    assess: [
      "Test reservoir operating rules, food reserves, insurance and fisheries management against stronger and more frequent extreme events.",
    ],
    stay: [
      "Seasonal forecasts, early warning, forecast-based finance and social protection: proven tools that work under any El Niño future.",
    ],
  },
  "subpolar-gyre": {
    act: [
      "Commit long-term funding for observations in the subpolar North Atlantic (OSNAP, Argo, Labrador Sea surveys): a gap in the record cannot be filled later.",
    ],
    assess: [
      "Include abrupt regional cooling of several degrees in European and North Atlantic risk assessments.",
      "Test winter peak energy demand, heating standards and North Atlantic fisheries quota-setting against 2–3°C of regional cooling.",
    ],
    stay: [
      "Use decadal climate forecasts, which draw much of their skill from this region, in fisheries and seasonal energy planning.",
    ],
  },
  "southern-ocean": {
    act: [
      "Keep mitigation ambition high and do not count on a stable ocean carbon sink in carbon-budget planning.",
    ],
    assess: [
      "Test how carbon budgets change if the Southern Ocean sink weakens, and how much Antarctica could add to high-end sea-level rise.",
    ],
    stay: [
      "Precautionary, ecosystem-based management of the krill fishery and protection of Antarctic waters.",
    ],
  },
  fish: {
    act: [
      "New or renegotiated fisheries agreements should include rules for stocks that move across borders.",
    ],
    assess: [
      "Test port, processing and fleet investments that depend on particular stocks or fishing grounds.",
      "Plan nutrition and livelihoods where catches are projected to fall most.",
    ],
    stay: [
      "End overfishing, cut other pressures and diversify livelihoods: healthy stocks cope better with warming.",
    ],
  },
};

export const LENS_LABELS = {
  act: { title: "Act now", text: "Long-lived, hard to reverse, and sensitive to the change: decide differently today." },
  assess: { title: "Assess now", text: "High stakes but unclear answers: stress-test, monitor and set trigger points." },
  stay: { title: "Stay the course", text: "Pays off whatever happens, or is cheap to adjust later: keep going." },
} as const;
