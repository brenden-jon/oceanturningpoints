import fs from "node:fs";
import path from "node:path";

/**
 * Curated list of recent research. To add an entry, append it to content/data/latest_research.json
 * (newest dates first is not required; the list is sorted on build). Verify the DOI on Crossref and
 * write a one-sentence plain summary from the abstract.
 */
export interface Paper {
  date: string; topic: string; title: string; authors: string; venue: string;
  doi: string | null; url?: string; summary: string; type: "article" | "report"; verified: string;
}

export const TOPIC_NAMES: Record<string, { name: string; href: string }> = {
  amoc: { name: "Atlantic circulation", href: "/changes/atlantic-circulation/" },
  "subpolar-gyre": { name: "Subpolar North Atlantic", href: "/changes/subpolar-gyre/" },
  "coral-reefs": { name: "Coral reefs", href: "/changes/coral-reefs/" },
  "ice-sheets": { name: "Ice sheets and sea level", href: "/changes/ice-sheets/" },
  "el-nino": { name: "El Niño", href: "/changes/el-nino/" },
  "southern-ocean": { name: "Southern Ocean", href: "/changes/southern-ocean/" },
  fish: { name: "Fish and marine life", href: "/changes/fish-on-the-move/" },
  observation: { name: "Ocean observation", href: "/monitoring/" },
  protection: { name: "Protection and finance", href: "/responses/" },
  decisions: { name: "Decisions and adaptation", href: "/decisions/" },
  general: { name: "The ocean as a whole", href: "/future/" },
};

export function latestResearch(): Paper[] {
  const all = JSON.parse(fs.readFileSync(path.join(process.cwd(), "content", "data", "latest_research.json"), "utf8")) as Paper[];
  return all.sort((a, b) => b.date.localeCompare(a.date));
}

export const fmtMonth = (d: string) =>
  new Date((d.length === 7 ? `${d}-15` : d) + "T12:00:00Z").toLocaleDateString("en-GB", d.length === 7 ? { month: "long", year: "numeric" } : { day: "numeric", month: "long", year: "numeric" });
