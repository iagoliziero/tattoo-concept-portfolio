import { site, type SectionId } from "@/config/site";
import { hasPublicFile } from "@/lib/server";
import { Icon } from "../Icon";
import { PortfolioGallery } from "./PortfolioGallery";
import styles from "./sections.module.css";

export function Portfolio({ id }: { id: SectionId }) {
  const { portfolio, artist } = site;
  // O servidor sabe quais fotos já estão em /public; o resto é espaço reservado.
  const items = portfolio.items.map((item) => ({ ...item, hasPhoto: hasPublicFile(item.image.src) }));

  return (
    <section
      id={id}
      data-section
      className={`${styles.section} ${styles.top}`}
      aria-labelledby={`${id}-title`}
    >
      <PortfolioGallery items={items} headingId={`${id}-title`} />
      <a href={artist.instagram.url} target="_blank" rel="noopener" className={styles.instagram}>
        <Icon name="instagram" size={15} />
        {portfolio.instagramCta}
      </a>
    </section>
  );
}
