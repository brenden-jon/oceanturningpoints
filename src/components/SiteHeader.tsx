"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { NAV, SITE } from "@/lib/site";
import styles from "./SiteHeader.module.css";

export default function SiteHeader() {
  const path = usePathname() ?? "/";
  return (
    <header className={styles.header}>
      <div className={`wrap ${styles.inner}`}>
        <Link href="/" className={styles.mark} aria-label={`${SITE.name}, home`}>
          <span>{SITE.name}</span>
        </Link>
        <nav aria-label="Main">
          <ul className={styles.nav}>
            {NAV.map((n) => {
              const active = path.startsWith(n.href);
              return (
                <li key={n.href}>
                  <Link href={n.href} aria-current={active ? "page" : undefined} className={active ? styles.active : undefined}>
                    {n.label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>
      </div>
    </header>
  );
}
