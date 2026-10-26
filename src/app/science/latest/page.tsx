import type { Metadata } from "next";
import Link from "next/link";
import ResearchList from "@/components/ResearchList";
import { fmtMonth, latestResearch, TOPIC_NAMES } from "@/lib/research";
import { abs } from "@/lib/site";
import styles from "../science.module.css";

export const metadata: Metadata = {
  title: "Latest ocean research: AMOC, coral reefs, ice sheets, El Niño and more",
  description: "New peer-reviewed research and major reports on the big changes in the ocean, each with a one-line plain-English summary and a link to the source. Updated regularly.",
  alternates: { canonical: abs("/science/latest/") },
};

export default function LatestPage() {
  const papers = latestResearch();
  return (
    <div className="wrap">
      <header className={styles.indexHead}>
        <p className="label"><Link href="/science/">Science</Link> · Latest research</p>
        <h1 className={styles.title}>Latest research</h1>
        <p className="lede">
          New studies and reports on the big ocean changes, newest first. Each summary is written from the paper’s abstract and every reference
          is checked against its publisher’s record. Inclusion is not endorsement: some findings are contested, and the topic pages explain how
          they fit with the rest of the evidence.
        </p>
      </header>
      <section style={{ paddingBottom: "4rem" }}>
        <ResearchList papers={papers} topics={TOPIC_NAMES} dates={papers.map((p) => fmtMonth(p.date))} />
      </section>
    </div>
  );
}
