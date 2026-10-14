import { site, type SectionId } from "@/config/site";
import { getCareerYears } from "@/lib/server";
import ui from "../ui.module.css";
import { CountUp } from "./CountUp";
import { Photo } from "./Photo";
import styles from "./sections.module.css";

export async function About({ id }: { id: SectionId }) {
  const { about, artist } = site;
  const years = await getCareerYears();
  const { value, suffix } = artist.instagram.followers;

  return (
    <section id={id} data-section className={`${styles.section} ${styles.overScene}`} aria-labelledby={`${id}-title`}>
      <p className={ui.kicker}>{about.kicker}</p>
      <h2 id={`${id}-title`} className={`${ui.display} ${styles.aboutTitle}`}>
        {about.title}
      </h2>
      <div className={styles.aboutRow}>
        <Photo
          image={artist.photo}
          placeholder="Foto do tatuador"
          icon="user"
          // Mesma largura do .portrait: clamp(120px, 12vw, 240px).
          sizes="(max-width: 1000px) 120px, (max-width: 2000px) 12vw, 240px"
          className={styles.portrait}
        />
        <p className={`${ui.text} ${ui.compact}`}>{about.story}</p>
      </div>
      <dl className={styles.counters}>
        <div className={styles.counter}>
          <dt className={styles.counterLabel}>{about.yearsLabel}</dt>
          <dd className={`${ui.display} ${styles.counterValue}`}>
            <CountUp value={years} />
          </dd>
        </div>
        <div className={styles.counter}>
          <dt className={styles.counterLabel}>{about.followersLabel}</dt>
          <dd className={`${ui.display} ${styles.counterValue}`}>
            <CountUp value={value} suffix={suffix} />
          </dd>
        </div>
      </dl>
      <p className={styles.machineHint}>{about.machineHint}</p>
    </section>
  );
}
