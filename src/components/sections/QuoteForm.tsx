"use client";

import Image from "next/image";
import { useRef, useState, type FormEvent } from "react";
import { site } from "@/config/site";
import { visual } from "@/config/visual";
import { drawingBlob, drawingDataUrl } from "@/lib/drawing";
import { sendQuote } from "@/lib/quote";
import { splat } from "../InkSplashes";
import { stage } from "@/lib/stage";
import ui from "../ui.module.css";
import styles from "./sections.module.css";

type Field = "name" | "idea" | "place";
type Errors = Partial<Record<Field, string>>;
type Status = { kind: "idle" } | { kind: "sending" } | { kind: "sent"; thumbnail: string | null } | { kind: "failed" };

const FIELDS: readonly Field[] = ["name", "idea", "place"];
const errorId = (field: Field) => `quote-${field}-error`;

/** Pedido de orçamento: validação por campo e o desenho do braço anexado. */
export function QuoteForm() {
  const { form } = site.tattoo;
  const [errors, setErrors] = useState<Errors>({});
  const [status, setStatus] = useState<Status>({ kind: "idle" });
  const nameRef = useRef<HTMLInputElement>(null);
  const ideaRef = useRef<HTMLInputElement>(null);
  const placeRef = useRef<HTMLSelectElement>(null);
  const refs = { name: nameRef, idea: ideaRef, place: placeRef };

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const button = event.currentTarget.querySelector("button[type=submit]");
    const data = new FormData(event.currentTarget);
    const name = String(data.get("name") ?? "").trim();
    const idea = String(data.get("idea") ?? "").trim();
    const place = String(data.get("place") ?? "");

    const found: Errors = {};
    if (!name) found.name = form.errors.name;
    if (idea.length < 6 && !stage.hasDrawing) found.idea = form.errors.idea;
    if (!place) found.place = form.errors.place;
    setErrors(found);
    const first = FIELDS.find((field) => found[field]);
    if (first) {
      setStatus({ kind: "idle" });
      refs[first].current?.focus();
      return;
    }

    setStatus({ kind: "sending" });
    try {
      const thumbnail = drawingDataUrl();
      await sendQuote({ name, idea, place, drawing: await drawingBlob() });
      setStatus({ kind: "sent", thumbnail });
      const r = button?.getBoundingClientRect();
      if (r) splat(r.left + r.width / 2, r.top + r.height / 2, visual.splash.onSubmit);
    } catch (error) {
      console.error(error);
      setStatus({ kind: "failed" });
    }
  }

  const clearError = (field: Field) => () =>
    setErrors((current) => (current[field] ? { ...current, [field]: undefined } : current));
  const fieldProps = (field: Field) => ({
    name: field,
    className: ui.field,
    "aria-invalid": Boolean(errors[field]),
    "aria-describedby": errors[field] ? errorId(field) : undefined,
    onInput: clearError(field),
  });

  return (
    <form className={styles.form} noValidate onSubmit={onSubmit}>
      <div>
        <input ref={nameRef} {...fieldProps("name")} placeholder={form.name} aria-label={form.name} autoComplete="name" />
        <p id={errorId("name")} className={ui.error}>
          {errors.name}
        </p>
      </div>
      <div>
        <input ref={ideaRef} {...fieldProps("idea")} placeholder={form.idea} aria-label={form.ideaLabel} />
        <p id={errorId("idea")} className={ui.error}>
          {errors.idea}
        </p>
      </div>
      <div>
        <select ref={placeRef} {...fieldProps("place")} aria-label={form.place} defaultValue="" onChange={clearError("place")}>
          <option value="">{form.place}</option>
          {form.places.map((place) => (
            <option key={place}>{place}</option>
          ))}
        </select>
        <p id={errorId("place")} className={ui.error}>
          {errors.place}
        </p>
      </div>
      <button
        type="submit"
        className={`${ui.button} ${ui.primary} ${styles.submit}`}
        disabled={status.kind === "sending"}
      >
        {status.kind === "sending" ? form.sending : form.submit}
      </button>
      <div className={styles.sent} role="status">
        {status.kind === "sent" && (
          <>
            {status.thumbnail && (
              <Image
                src={status.thumbnail}
                alt={form.drawingAlt}
                width={58}
                height={28}
                unoptimized
                className={styles.thumbnail}
                style={{ background: visual.arm.skin }}
              />
            )}
            <span>
              {status.thumbnail ? form.sentWithDrawing : form.sent} {form.reply}
            </span>
          </>
        )}
        {status.kind === "failed" && <span className={styles.failed}>{form.failed}</span>}
      </div>
    </form>
  );
}
