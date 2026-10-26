import Link from "next/link";
import { SITE } from "@/lib/site";
import styles from "./SiteFooter.module.css";

export default function SiteFooter() {
  return (
    <footer className={styles.footer}>
      <div className={`wrap ${styles.inner}`}>
        <p className={styles.name}>{SITE.name}</p>
        <p>
          An independent science platform created and curated by <Link href="/about/">{SITE.creator}</Link>. It is not
          affiliated with or endorsed by any institution, and uses published research, official reports and open data, each credited with its licence.
        </p>
        <p>
          <Link href="/science/methods/">Methods and data</Link>
          <span aria-hidden> · </span>
          <Link href="/science/glossary/">Glossary</Link>
          <span aria-hidden> · </span>
          <Link href="/about/">About</Link>
        </p>
      </div>
    </footer>
  );
}
