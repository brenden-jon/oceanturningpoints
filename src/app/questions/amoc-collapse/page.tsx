import type { Metadata } from "next";
import Redirect from "@/components/Redirect";
import { abs } from "@/lib/site";

export const metadata: Metadata = { title: "Moved", robots: { index: false }, alternates: { canonical: abs("/changes/atlantic-circulation/") } };

export default function Moved() {
  return <Redirect to="/changes/atlantic-circulation/" />;
}
