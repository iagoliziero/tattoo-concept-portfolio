"use client";

import { site } from "@/config/site";
import ui from "../ui.module.css";
import styles from "./sections.module.css";

// Fase 1: só a estrutura. Validação por campo e envio com o desenho na fase 6.
export function QuoteForm() {
  const { form } = site.tattoo;

  return (
    <form className={styles.form} noValidate onSubmit={(event) => event.preventDefault()}>
      <input
        name="name"
        className={ui.field}
        placeholder={form.name}
        aria-label={form.name}
        autoComplete="name"
      />
      <input name="idea" className={ui.field} placeholder={form.idea} aria-label={form.ideaLabel} />
      <select name="place" className={ui.field} aria-label={form.place} defaultValue="">
        <option value="">{form.place}</option>
        {form.places.map((place) => (
          <option key={place}>{place}</option>
        ))}
      </select>
      <button type="submit" className={`${ui.button} ${ui.primary} ${styles.submit}`}>
        {form.submit}
      </button>
      <div className={styles.sent} role="status" />
    </form>
  );
}
