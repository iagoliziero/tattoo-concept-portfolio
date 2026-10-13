import { site, type SectionId } from "@/config/site";
import { Icon } from "../Icon";
import ui from "../ui.module.css";
import styles from "./sections.module.css";

export function Hero({ id }: { id: SectionId }) {
  const { hero } = site;

  return (
    <section id={id} data-section className={`${styles.section} ${styles.overScene}`} aria-labelledby={`${id}-title`}>
      <p className={ui.kicker}>{hero.kicker}</p>
      <h1 id={`${id}-title`} className={`${ui.display} ${styles.heroTitle}`}>
        <span>{hero.titleLines[0]}</span> <span>{hero.titleLines[1]}</span>
      </h1>
      <p className={ui.text}>{hero.text}</p>
      <div className={styles.actions}>
        <a href={`#${hero.primaryCta.to}`} className={`${ui.button} ${ui.primary}`}>
          {hero.primaryCta.label}
        </a>
        <a href={`#${hero.secondaryCta.to}`} className={`${ui.button} ${ui.ghost}`}>
          {hero.secondaryCta.label}
        </a>
      </div>
      <p className={styles.hint}>
        <Icon name="mouse" />
        {hero.scrollHint}
      </p>
    </section>
  );
}
