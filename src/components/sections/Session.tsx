import { site, type SectionId } from "@/config/site";
import ui from "../ui.module.css";
import styles from "./sections.module.css";

export function Session({ id }: { id: SectionId }) {
  const { session } = site;

  return (
    <section
      id={id}
      data-section
      className={`${styles.section} ${styles.bottom}`}
      aria-labelledby={`${id}-title`}
    >
      <div className={`${ui.panel} ${styles.sessionPanel}`}>
        <p className={`${ui.kicker} ${ui.tight}`}>{session.kicker}</p>
        <h2 id={`${id}-title`} className={`${ui.display} ${styles.sessionTitle}`}>
          {session.title}
        </h2>
        <p className={styles.small}>{session.text}</p>
        <div className={styles.status} role="status">
          <span className={styles.led} />
          <span>{session.idleStatus}</span>
        </div>
        <div className={styles.meter}>
          <div className={styles.meterFill} />
        </div>
        <button
          type="button"
          className={`${ui.button} ${ui.ghost} ${ui.small} ${styles.replay}`}
        >
          {session.replay}
        </button>
      </div>
    </section>
  );
}
