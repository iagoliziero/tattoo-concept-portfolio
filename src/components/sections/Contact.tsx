import { site, type SectionId } from "@/config/site";
import { Icon } from "../Icon";
import ui from "../ui.module.css";
import { QuoteForm } from "./QuoteForm";
import styles from "./sections.module.css";

export function Contact({ id }: { id: SectionId }) {
  const { contact, artist } = site;
  const whatsapp: string | null = artist.whatsapp;
  const address: string | null = artist.address;

  return (
    <section
      id={id}
      data-section
      className={`${styles.section} ${styles.panelDownOnPhone}`}
      aria-labelledby={`${id}-title`}
    >
      <div className={`${ui.panel} ${styles.contactPanel}`}>
        <p className={`${ui.kicker} ${ui.tight}`}>{contact.kicker}</p>
        <h2 id={`${id}-title`} className={`${ui.display} ${styles.contactTitle}`}>
          {contact.title}
        </h2>
        <p className={styles.small}>{contact.text}</p>

        <div className={styles.contactActions}>
          <a
            href={artist.instagram.url}
            target="_blank"
            rel="noopener"
            className={`${ui.button} ${ui.primary} ${styles.contactButton}`}
          >
            <Icon name="instagram" size={20} />
            {contact.instagramCta}
          </a>
          {whatsapp && (
            <a
              href={`https://wa.me/${whatsapp}?text=${encodeURIComponent(contact.whatsappMessage)}`}
              target="_blank"
              rel="noopener"
              className={`${ui.button} ${ui.ghost} ${styles.contactButton}`}
            >
              <Icon name="whatsapp" size={20} />
              {contact.whatsappCta}
            </a>
          )}
        </div>
        <p className={styles.contactMeta}>
          <span>
            <Icon name="instagram" size={16} />
            {artist.instagram.handle}
          </span>
          <span>
            <Icon name="mapPin" size={16} />
            {address ?? `${artist.city}, ${artist.state}`}
          </span>
        </p>

        <h3 className={styles.formTitle}>{contact.form.title}</h3>
        <QuoteForm />
      </div>
    </section>
  );
}
