import type { MetadataRoute } from "next";
import { allTopics } from "@/lib/science";
import { abs } from "@/lib/site";

export const dynamic = "force-static";

/** Every public page, with the ones people search for most given the highest priority. */
const PAGES: [string, number, MetadataRoute.Sitemap[number]["changeFrequency"]][] = [
  ["/", 1, "daily"],
  ["/changes/", 0.9, "weekly"],
  ["/changes/atlantic-circulation/", 0.9, "monthly"],
  ["/changes/coral-reefs/", 0.9, "weekly"],
  ["/changes/el-nino/", 0.9, "daily"],
  ["/changes/ice-sheets/", 0.9, "monthly"],
  ["/changes/subpolar-gyre/", 0.8, "monthly"],
  ["/changes/southern-ocean/", 0.8, "monthly"],
  ["/changes/fish-on-the-move/", 0.8, "monthly"],
  ["/future/", 0.9, "monthly"],
  ["/impacts/", 0.9, "monthly"],
  ["/decisions/", 0.9, "monthly"],
  ["/science/latest/", 0.8, "weekly"],
  ["/ocean-now/", 0.8, "daily"],
  ["/responses/", 0.8, "monthly"],
  ["/monitoring/", 0.7, "weekly"],
  ["/science/", 0.7, "weekly"],
  ["/science/glossary/", 0.4, "monthly"],
  ["/science/methods/", 0.4, "monthly"],
  ["/about/", 0.5, "monthly"],
];

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  return [
    ...PAGES.map(([p, priority, changeFrequency]) => ({ url: abs(p), lastModified: now, changeFrequency, priority })),
    ...allTopics().map((t) => ({ url: abs(`/science/${t.slug}/`), lastModified: new Date(t.updated), changeFrequency: "monthly" as const, priority: 0.6 })),
  ];
}
