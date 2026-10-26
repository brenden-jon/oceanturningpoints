import type { MetadataRoute } from "next";
import { abs } from "@/lib/site";

export const dynamic = "force-static";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: "*", allow: "/", disallow: ["/questions/", "/atlas/", "/changes/sea-level/"] },
    sitemap: abs("/sitemap.xml"),
  };
}
