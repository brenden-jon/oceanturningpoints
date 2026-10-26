import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import SiteFooter from "@/components/SiteFooter";
import SiteHeader from "@/components/SiteHeader";
import { SiteLd } from "@/components/JsonLd";
import { SITE, abs } from "@/lib/site";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter", display: "swap" });

export const metadata: Metadata = {
  metadataBase: new URL(SITE.url),
  title: { default: SITE.name, template: `%s — ${SITE.name}` },
  description: "Independent, evidence-led guide to the big changes in the ocean — AMOC collapse risk, coral reef tipping points, ice sheets and sea-level rise, El Niño, the Southern Ocean and fisheries — and what they mean for decisions.",
  keywords: ["AMOC", "AMOC collapse", "Atlantic Meridional Overturning Circulation", "ocean tipping points", "coral reef tipping point", "ice sheet tipping point", "sea-level rise", "El Niño", "climate change ocean", "marine protected areas", "ocean observing"],
  authors: [{ name: SITE.creator, url: abs("/about/") }],
  openGraph: { siteName: SITE.name, type: "website", images: [abs("/og/home.jpg")] },
  twitter: { card: "summary_large_image" },
};

export const viewport: Viewport = { themeColor: "#ffffff", width: "device-width", initialScale: 1 };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={inter.variable}>
      <body>
        <a href="#main" className="skip">Skip to content</a>
        <SiteHeader />
        <main id="main">{children}</main>
        <SiteFooter />
        <SiteLd />
        {/* Privacy-friendly analytics, switched on by setting one of these at build time (see docs/README.md). */}
        {process.env.NEXT_PUBLIC_GOATCOUNTER && (
          <script data-goatcounter={`https://${process.env.NEXT_PUBLIC_GOATCOUNTER}.goatcounter.com/count`} async src="https://gc.zgo.at/count.js" />
        )}
        {process.env.NEXT_PUBLIC_CF_BEACON && (
          <script defer src="https://static.cloudflareinsights.com/beacon.min.js" data-cf-beacon={JSON.stringify({ token: process.env.NEXT_PUBLIC_CF_BEACON })} />
        )}
      </body>
    </html>
  );
}
