import { site, type SectionId } from "@/config/site";
import { hasPublicFile } from "@/lib/server";
import { PortfolioGallery } from "./PortfolioGallery";
import styles from "./sections.module.css";

export function Portfolio({ id }: { id: SectionId }) {
  // O servidor sabe quais fotos já estão em /public; o resto é espaço reservado.
  const items = site.portfolio.items.map((item) => ({ ...item, hasPhoto: hasPublicFile(item.image.src) }));

  return (
    <section
      id={id}
      data-section
      className={`${styles.section} ${styles.top} ${styles.overScene}`}
      aria-labelledby={`${id}-title`}
    >
      <PortfolioGallery items={items} headingId={`${id}-title`} />
    </section>
  );
}
