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
          <svg className={styles.glyph} viewBox="0 0 32 32" aria-hidden>
            <circle cx="16" cy="16" r="14.5" fill="none" stroke="currentColor" strokeWidth="1.4" />
            <path d="M5 19c3.5-4 7.5-4 11 0s7.5 4 11 0" fill="none" stroke="var(--atlantic)" strokeWidth="1.8" strokeLinecap="round" />
            <path d="M6.5 12.5c3-3 6.5-3 9.5 0" fill="none" stroke="var(--seaglass)" strokeWidth="1.6" strokeLinecap="round" />
          </svg>
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
