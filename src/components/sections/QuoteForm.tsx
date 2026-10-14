"use client";

import Image from "next/image";
import { useEffect, useRef, useState, type ChangeEvent, type DragEvent, type FormEvent } from "react";
import { site } from "@/config/site";
import { visual } from "@/config/visual";
import { sendQuote } from "@/lib/quote";
import { Icon } from "../Icon";
import { splat } from "../InkSplashes";
import ui from "../ui.module.css";
import styles from "./sections.module.css";

type Field = "name" | "idea" | "place" | "image";
type Errors = Partial<Record<Field, string>>;
type Status = { kind: "idle" } | { kind: "sending" } | { kind: "sent"; thumbnail: string | null } | { kind: "failed" };
type Reference = { file: File; url: string };

const FIELDS: readonly Field[] = ["name", "idea", "place", "image"];
const IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp"];
const errorId = (field: Field) => `quote-${field}-error`;

/** Pedido de orçamento: validação por campo e uma imagem de referência opcional. */
export function QuoteForm() {
  const { form } = site.contact;
  const [errors, setErrors] = useState<Errors>({});
  const [status, setStatus] = useState<Status>({ kind: "idle" });
  const [reference, setReference] = useState<Reference | null>(null);
  const nameRef = useRef<HTMLInputElement>(null);
  const ideaRef = useRef<HTMLInputElement>(null);
  const placeRef = useRef<HTMLSelectElement>(null);
  const imageRef = useRef<HTMLInputElement>(null);
  const refs = { name: nameRef, idea: ideaRef, place: placeRef, image: imageRef };

  // Libera a prévia anterior quando a imagem muda ou o formulário sai da tela.
  useEffect(() => () => {
    if (reference) URL.revokeObjectURL(reference.url);
  }, [reference]);

  const clearError = (field: Field) => () =>
    setErrors((current) => (current[field] ? { ...current, [field]: undefined } : current));

  function pick(file: File | undefined) {
    if (!file) return;
    if (!IMAGE_TYPES.includes(file.type)) {
      setErrors((current) => ({ ...current, image: form.image.wrongType }));
      return;
    }
    if (file.size > form.image.maxMb * 1024 * 1024) {
      setErrors((current) => ({ ...current, image: form.image.tooBig }));
      return;
    }
    setReference({ file, url: URL.createObjectURL(file) });
    setErrors((current) => ({ ...current, image: undefined, idea: undefined }));
  }

  function removeImage() {
    setReference(null);
    setStatus((current) => (current.kind === "sent" ? { kind: "idle" } : current));
    if (imageRef.current) imageRef.current.value = "";
  }

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const button = event.currentTarget.querySelector("button[type=submit]");
    const data = new FormData(event.currentTarget);
    const name = String(data.get("name") ?? "").trim();
    const idea = String(data.get("idea") ?? "").trim();
    const place = String(data.get("place") ?? "");

    const found: Errors = { image: errors.image };
    if (!name) found.name = form.errors.name;
    if (idea.length < 6 && !reference) found.idea = form.errors.idea;
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
      await sendQuote({ name, idea, place, reference: reference?.file ?? null });
      setStatus({ kind: "sent", thumbnail: reference?.url ?? null });
      const r = button?.getBoundingClientRect();
      if (r) splat(r.left + r.width / 2, r.top + r.height / 2, visual.splash.onSubmit);
    } catch (error) {
      console.error(error);
      setStatus({ kind: "failed" });
    }
  }

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

      <div>
        <label
          className={styles.imageField}
          data-filled={Boolean(reference)}
          onDragOver={(event: DragEvent) => event.preventDefault()}
          onDrop={(event: DragEvent) => {
            event.preventDefault();
            pick(event.dataTransfer.files[0]);
          }}
        >
          <input
            ref={imageRef}
            type="file"
            name="image"
            accept={IMAGE_TYPES.join(",")}
            className="sr-only"
            aria-invalid={Boolean(errors.image)}
            aria-describedby={`quote-image-hint${errors.image ? ` ${errorId("image")}` : ""}`}
            onChange={(event: ChangeEvent<HTMLInputElement>) => pick(event.target.files?.[0])}
          />
          {reference ? (
            <Image src={reference.url} alt="" width={56} height={56} unoptimized className={styles.imagePreview} />
          ) : (
            <Icon name="photo" size={24} />
          )}
          <span className={styles.imageText}>
            <span>{reference ? reference.file.name : form.image.label}</span>
            <span id="quote-image-hint" className={styles.imageHint}>
              {reference ? form.image.change : form.image.hint}
            </span>
          </span>
        </label>
        {reference && (
          <button type="button" className={styles.imageRemove} onClick={removeImage}>
            {form.image.remove}
          </button>
        )}
        <p id={errorId("image")} className={ui.error}>
          {errors.image}
        </p>
      </div>

      <button type="submit" className={`${ui.button} ${ui.primary} ${styles.submit}`} disabled={status.kind === "sending"}>
        {status.kind === "sending" ? form.sending : form.submit}
      </button>
      <div className={styles.sent} role="status">
        {status.kind === "sent" && (
          <>
            {status.thumbnail && (
              <Image src={status.thumbnail} alt="" width={40} height={40} unoptimized className={styles.thumbnail} />
            )}
            <span>
              {status.thumbnail ? form.sentWithImage : form.sent} {form.reply}
            </span>
          </>
        )}
        {status.kind === "failed" && <span className={styles.failed}>{form.failed}</span>}
      </div>
    </form>
  );
}
