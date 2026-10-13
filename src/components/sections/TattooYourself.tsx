import { site, type SectionId } from "@/config/site";
import { Icon } from "../Icon";
import ui from "../ui.module.css";
import { QuoteForm } from "./QuoteForm";
import styles from "./sections.module.css";

export function TattooYourself({ id }: { id: SectionId }) {
  const { tattoo, artist } = site;

  return (
    <section id={id} data-section className={styles.section} aria-labelledby={`${id}-title`}>
      <div className={`${ui.panel} ${styles.tattooPanel}`}>
        <p className={`${ui.kicker} ${ui.tight}`}>{tattoo.kicker}</p>
        <h2 id={`${id}-title`} className={`${ui.display} ${styles.tattooTitle}`}>
          {tattoo.title}
        </h2>
        <p className={styles.small}>{tattoo.text}</p>
        <div className={styles.tools} role="group" aria-label="Ferramentas de desenho">
          <button type="button" className={ui.tool} aria-pressed={true}>
            {tattoo.tools.line}
          </button>
          <button type="button" className={ui.tool} aria-pressed={false}>
            {tattoo.tools.shade}
          </button>
          <button type="button" className={ui.tool}>
            {tattoo.tools.clear}
          </button>
        </div>
        <QuoteForm />
        <div className={styles.contact}>
          <a href={artist.instagram.url} target="_blank" rel="noopener">
            <Icon name="instagram" size={14} />
            {artist.instagram.handle}
          </a>
          <span>
            <Icon name="mapPin" size={14} />
            {artist.city}, {artist.state}
          </span>
        </div>
      </div>
    </section>
  );
}
