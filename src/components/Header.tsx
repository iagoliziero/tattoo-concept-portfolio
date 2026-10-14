"use client";

import { site } from "@/config/site";
import { useStage } from "@/lib/stage";
import styles from "./Header.module.css";

/** Marca, navegação e o contato em destaque (último item, como botão). */
export function Header() {
  const section = useStage((s) => s.section);

  return (
    <header className={styles.header}>
      <a href={`#${site.nav[0].id}`} className={styles.brand}>
        {site.artist.brand}
      </a>
      <nav aria-label="Seções" className={styles.nav}>
        {site.nav.map((item, i) => (
          <a
            key={item.id}
            href={`#${item.id}`}
            className={item.id === "contato" ? `${styles.link} ${styles.cta}` : styles.link}
            aria-current={i === section ? "location" : undefined}
          >
            {item.label}
          </a>
        ))}
      </nav>
    </header>
  );
}
