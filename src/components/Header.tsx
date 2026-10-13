"use client";

import { site } from "@/config/site";
import { enableSound } from "@/lib/sound";
import { stage, useStage } from "@/lib/stage";
import { Icon } from "./Icon";
import styles from "./Header.module.css";

export function Header() {
  const section = useStage((s) => s.section);
  const sound = useStage((s) => s.sound);

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
            className={styles.link}
            aria-current={i === section ? "location" : undefined}
          >
            {item.label}
          </a>
        ))}
        <button
          type="button"
          className={styles.sound}
          aria-pressed={sound}
          aria-label={sound ? site.sound.on : site.sound.off}
          onClick={() => {
            if (!sound) enableSound();
            stage.setSound(!sound);
          }}
        >
          <Icon name={sound ? "volume" : "volumeOff"} size={14} />
          <span>{site.sound.label}</span>
        </button>
      </nav>
    </header>
  );
}
