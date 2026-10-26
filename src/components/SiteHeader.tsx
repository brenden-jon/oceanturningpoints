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
          <svg viewBox="0 0 64 64" width="26" height="26" aria-hidden="true" className={styles.logo}>
            <defs><clipPath id="hdr-c"><circle cx="32" cy="32" r="30" /></clipPath></defs>
            <circle cx="32" cy="32" r="30" fill="#0b3d6e" />
            <g clipPath="url(#hdr-c)" fill="none" strokeLinecap="round" strokeLinejoin="round">
              <path d="M34 26 C 38 21, 42 21, 46 26 S 54 31, 58 26 S 66 21, 70 26" stroke="#fff" strokeOpacity="0.35" strokeWidth="2.6" strokeDasharray="0.1 4.6" />
              <path d="M-4 26 C 0 21, 4 21, 8 26 S 16 31, 20 26 S 28 21, 34 26 L 40 42 C 44 47, 48 47, 52 42 S 60 37, 64 42 S 70 47, 74 42" stroke="#fff" strokeWidth="4.2" />
            </g>
            <circle cx="34" cy="26" r="3.6" fill="#ff6b3d" />
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
