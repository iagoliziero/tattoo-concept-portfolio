import { site, type SectionId } from "@/config/site";
import ui from "../ui.module.css";
import styles from "./sections.module.css";

export function Healing({ id }: { id: SectionId }) {
  const { healing } = site;
  const last = healing.stages.length - 1;
  const current = healing.stages[last];

  return (
    <section id={id} data-section className={styles.section} aria-labelledby={`${id}-title`}>
      <div className={`${ui.panel} ${styles.healingPanel}`}>
        <p className={`${ui.kicker} ${ui.tight}`}>{healing.kicker}</p>
        <h2 id={`${id}-title`} className={`${ui.display} ${styles.healingTitle}`}>
          {healing.title}
        </h2>
        <p className={styles.small}>{healing.text}</p>
        <p className={`${ui.display} ${styles.stageTitle}`} aria-live="polite">
          {current.title}
        </p>
        <p className={styles.stageTip}>{current.tip}</p>
        <input
          type="range"
          min={0}
          max={last * 100}
          step={1}
          defaultValue={last * 100}
          aria-label={healing.sliderLabel}
          className={styles.range}
        />
        <div className={styles.marks} aria-hidden="true">
          {healing.dayMarks.map((mark) => (
            <span key={mark}>{mark}</span>
          ))}
        </div>
        <p className={styles.disclaimer}>{healing.disclaimer}</p>
      </div>
    </section>
  );
}
