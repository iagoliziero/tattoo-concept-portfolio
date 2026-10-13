import { site, type SectionId } from "@/config/site";
import { Icon } from "../Icon";
import ui from "../ui.module.css";
import { Photo } from "./Photo";
import styles from "./sections.module.css";

export function Portfolio({ id }: { id: SectionId }) {
  const { portfolio, artist } = site;

  return (
    <section
      id={id}
      data-section
      className={`${styles.section} ${styles.top}`}
      aria-labelledby={`${id}-title`}
    >
      <div className={styles.portfolioHead}>
        <div>
          <p className={`${ui.kicker} ${ui.snug}`}>{portfolio.kicker}</p>
          <h2 id={`${id}-title`} className={`${ui.display} ${styles.portfolioTitle}`}>
            {portfolio.title}
          </h2>
        </div>
        <div className={styles.filters} role="group" aria-label="Filtrar trabalhos">
          {portfolio.filters.map((filter, i) => (
            <button key={filter.value} type="button" className={ui.chip} aria-pressed={i === 0}>
              {filter.label}
            </button>
          ))}
        </div>
      </div>
      <ul className={styles.grid}>
        {portfolio.items.map((item) => (
          <li key={item.id} className={styles.card} data-category={item.category}>
            <Photo
              image={item.image}
              placeholder={`Foto: ${item.title}`}
              sizes="(max-width: 600px) 50vw, 240px"
              className={styles.cardPhoto}
            />
            <h3 className={styles.cardTitle}>{item.title}</h3>
            <p className={styles.cardCaption}>{item.caption}</p>
          </li>
        ))}
      </ul>
      <a href={artist.instagram.url} target="_blank" rel="noopener" className={styles.instagram}>
        <Icon name="instagram" size={15} />
        {portfolio.instagramCta}
      </a>
    </section>
  );
}
