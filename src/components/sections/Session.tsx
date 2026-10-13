import { site, type SectionId } from "@/config/site";
import ui from "../ui.module.css";
import styles from "./sections.module.css";
import { SessionStatus } from "./SessionStatus";

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
        <SessionStatus />
      </div>
    </section>
  );
}
