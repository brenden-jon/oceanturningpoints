import Link from "next/link";
import { SITE } from "@/lib/site";
import styles from "./SiteFooter.module.css";

export default function SiteFooter() {
  return (
    <footer className={styles.footer}>
      <div className={`wrap ${styles.inner}`}>
        <div>
          <p className={styles.name}>{SITE.name}</p>
          <p className={styles.tag}>{SITE.tagline}</p>
        </div>
        <div className={styles.cols}>
          <p className="small">
            An independent science platform created and curated by{" "}
            <Link href="/about/">{SITE.creator}</Link>. It is not affiliated with, sponsored by or endorsed by any
            institution, and draws only on published science and openly licensed data.
          </p>
          <p className="small muted">
            Every map and chart states its source, its method and its limitations.{" "}
            <Link href="/science/methods/">How this site handles evidence</Link>.
          </p>
        </div>
      </div>
    </footer>
  );
}
