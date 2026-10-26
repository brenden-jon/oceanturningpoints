/**
 * The knowledge base: one Markdown file per topic in content/science.
 *
 * Read at build time only. Each file has YAML frontmatter (see
 * content/science/README.md) and seven sections under fixed H2 headings, so
 * every topic reads the same way and can be reviewed the same way.
 */
import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";
import { marked } from "marked";

const DIR = path.join(process.cwd(), "content", "science");

export const SECTIONS = [
  "The system",
  "What we observe",
  "What could change",
  "Consequences",
  "What we know and don't know",
  "Why it matters for decisions",
  "References and data",
] as const;

export interface Confidence { claim: string; level: "high" | "medium" | "low"; basis: string }

export interface TopicMeta {
  slug: string;
  title: string;
  question: string;
  summary: string;
  order: number;
  updated: string;
  reviewed: string;
  status: string;
  related: string[];
  explorer?: string;
  live?: { layer: "ssta" | "dhw"; view: string; caption: string };
  decisions?: string;
  keyPoints: string[];
  confidence: Confidence[];
}

export interface Section { id: string; title: string; html: string }
export interface Topic extends TopicMeta { sections: Section[]; wordCount: number }

export const slugify = (s: string) =>
  s.toLowerCase().replace(/['’]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");

function files(): string[] {
  return fs.readdirSync(DIR).filter((f) => f.endsWith(".md") && !f.startsWith("_") && f !== "README.md");
}

function parse(file: string): Topic {
  const raw = fs.readFileSync(path.join(DIR, file), "utf8");
  const { data, content } = matter(raw);
  const slug = file.replace(/\.md$/, "");
  const parts = content.split(/^## +/m).slice(1);
  const sections: Section[] = parts.map((p) => {
    const nl = p.indexOf("\n");
    const title = p.slice(0, nl).trim();
    const body = p.slice(nl + 1);
    return { id: slugify(title), title, html: marked.parse(body, { async: false }) as string };
  });
  const missing = SECTIONS.filter((s) => !sections.some((x) => x.title.replace(/’/g, "'") === s));
  if (missing.length) throw new Error(`${file}: missing sections ${missing.join(", ")}`);
  return {
    slug,
    title: data.title,
    question: data.question,
    summary: data.summary,
    order: data.order ?? 99,
    updated: String(data.updated),
    reviewed: String(data.reviewed ?? data.updated),
    status: data.status ?? "",
    related: data.related ?? [],
    explorer: data.explorer,
    live: data.live,
    decisions: data.decisions,
    keyPoints: data.keyPoints ?? [],
    confidence: data.confidence ?? [],
    sections,
    wordCount: content.split(/\s+/).length,
  };
}

/** Same order as the big changes everywhere else on the site; topics not listed keep their own order, after these. */
const SITE_ORDER = ["amoc", "coral-reefs", "ice-sheets", "el-nino", "fish-on-the-move", "subpolar-gyre", "southern-ocean"];

export function allTopics(): Topic[] {
  const rank = (t: Topic) => { const i = SITE_ORDER.indexOf(t.slug); return i < 0 ? 100 + t.order : i; };
  return files().map(parse).sort((a, b) => rank(a) - rank(b));
}

export function getTopic(slug: string): Topic | undefined {
  return allTopics().find((t) => t.slug === slug);
}

export function formatDate(iso: string): string {
  const d = new Date(`${iso}T12:00:00Z`);
  return d.toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric", timeZone: "UTC" });
}
