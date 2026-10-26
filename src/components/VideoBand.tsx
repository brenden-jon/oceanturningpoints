"use client";

import Link from "next/link";
import { useEffect, useRef } from "react";
import { asset } from "@/lib/site";
import styles from "./VideoBand.module.css";

/** Full-width looping footage with a short message. Plays muted; stays on the poster for reduced motion. */
export default function VideoBand({ src, poster, kicker, title, text, href, linkText, caption }: {
  src: string; poster: string; kicker: string; title: string; text: string; href: string; linkText: string; caption: string;
}) {
  const ref = useRef<HTMLVideoElement>(null);
  useEffect(() => {
    const v = ref.current;
    if (!v) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) { v.pause(); return; }
    const io = new IntersectionObserver(([e]) => { if (e.isIntersecting) v.play().catch(() => {}); else v.pause(); }, { threshold: 0.2 });
    io.observe(v);
    return () => io.disconnect();
  }, []);
  return (
    <section className={styles.band} aria-label={title}>
      <video ref={ref} className={styles.video} src={asset(src)} poster={asset(poster)} autoPlay muted loop playsInline preload="auto" aria-hidden />
      <div className={styles.shade} />
      <div className={`wrap ${styles.text}`}>
        <p className={styles.kicker}>{kicker}</p>
        <h2>{title}</h2>
        <p className={styles.lede}>{text}</p>
        <p><Link className={styles.link} href={href}>{linkText}</Link></p>
      </div>
      <p className={styles.caption}>{caption}</p>
    </section>
  );
}
