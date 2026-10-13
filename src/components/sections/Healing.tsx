import { site, type SectionId } from "@/config/site";
import ui from "../ui.module.css";
import { HealingTimeline } from "./HealingTimeline";
import styles from "./sections.module.css";

export function Healing({ id }: { id: SectionId }) {
  const { healing } = site;

  return (
    <section id={id} data-section className={`${styles.section} ${styles.panelDownOnPhone}`} aria-labelledby={`${id}-title`}>
      <div className={`${ui.panel} ${styles.healingPanel}`}>
        <p className={`${ui.kicker} ${ui.tight}`}>{healing.kicker}</p>
        <h2 id={`${id}-title`} className={`${ui.display} ${styles.healingTitle}`}>
          {healing.title}
        </h2>
        <p className={styles.small}>{healing.text}</p>
        <HealingTimeline />
        <p className={styles.disclaimer}>{healing.disclaimer}</p>
      </div>
    </section>
  );
}
