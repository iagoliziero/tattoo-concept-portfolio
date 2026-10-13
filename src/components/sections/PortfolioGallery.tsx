"use client";

import Image from "next/image";
import { useEffect, useRef, useState, useSyncExternalStore, type CSSProperties, type PointerEvent } from "react";
import { site, type PortfolioCategory, type PortfolioItem } from "@/config/site";
import { visual } from "@/config/visual";
import { stage } from "@/lib/stage";
import ui from "../ui.module.css";
import { PhotoFrame } from "./PhotoFrame";
import styles from "./sections.module.css";

export interface GalleryItem extends PortfolioItem {
  hasPhoto: boolean;
}

type Filter = PortfolioCategory | "all";
const PORTFOLIO_SECTION = 3;

/**
 * Filtros, cards com revelação animada na primeira chegada à seção,
 * inclinação 3D seguindo o ponteiro e lightbox para as fotos.
 */
export function PortfolioGallery({ items, headingId }: { items: GalleryItem[]; headingId: string }) {
  const { portfolio } = site;
  const { revealDuration, revealStagger, tilt, lift } = visual.portfolio;
  const [filter, setFilter] = useState<Filter>("all");
  const [open, setOpen] = useState<GalleryItem | null>(null);
  const dialog = useRef<HTMLDialogElement>(null);
  // No servidor tudo vem revelado; no navegador, revela ao chegar na seção.
  const revealed = useSyncExternalStore(
    stage.subscribe,
    () => stage.reducedMotion || stage.furthest >= PORTFOLIO_SECTION,
    () => true,
  );

  const onTilt = (event: PointerEvent<HTMLElement>) => {
    if (stage.reducedMotion) return;
    const card = event.currentTarget;
    const r = card.getBoundingClientRect();
    const x = (event.clientX - r.left) / r.width - 0.5;
    const y = (event.clientY - r.top) / r.height - 0.5;
    card.style.transform = `perspective(500px) rotateX(${(-y * tilt[0]).toFixed(1)}deg) rotateY(${(x * tilt[1]).toFixed(1)}deg) translateY(-${lift}px)`;
  };
  const resetTilt = (event: PointerEvent<HTMLElement>) => {
    event.currentTarget.style.transform = "";
  };
  // Abre depois que o conteúdo renderiza, para o foco ir ao botão Fechar.
  useEffect(() => {
    if (open && !dialog.current?.open) dialog.current?.showModal();
  }, [open]);

  return (
    <>
      <div className={styles.portfolioHead}>
        <div>
          <p className={`${ui.kicker} ${ui.snug}`}>{portfolio.kicker}</p>
          <h2 id={headingId} className={`${ui.display} ${styles.portfolioTitle}`}>
            {portfolio.title}
          </h2>
        </div>
        <div className={styles.filters} role="group" aria-label="Filtrar trabalhos">
          {portfolio.filters.map((f) => (
            <button
              key={f.value}
              type="button"
              className={ui.chip}
              aria-pressed={filter === f.value}
              onClick={() => setFilter(f.value)}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      <ul className={styles.grid} data-revealed={revealed}>
        {items.map((item, i) => {
          const dimmed = filter !== "all" && item.category !== filter;
          const content = (
            <>
              <PhotoFrame
                image={item.image}
                hasPhoto={item.hasPhoto}
                placeholder={`Foto: ${item.title}`}
                sizes="(max-width: 600px) 50vw, 240px"
                className={styles.cardPhoto}
              />
              <h3 className={styles.cardTitle}>{item.title}</h3>
              <p className={styles.cardCaption}>{item.caption}</p>
            </>
          );
          const cardProps = {
            className: styles.card,
            onPointerMove: onTilt,
            onPointerLeave: resetTilt,
            style: {
              "--reveal-duration": `${revealDuration}s`,
              "--reveal-delay": `${i * revealStagger}s`,
            } as CSSProperties,
          };
          return (
            <li key={item.id} className={styles.cardItem} data-dimmed={dimmed} inert={dimmed}>
              {item.hasPhoto ? (
                <button type="button" {...cardProps} aria-label={`${item.title}: ampliar foto`} onClick={() => setOpen(item)}>
                  {content}
                </button>
              ) : (
                <div {...cardProps}>{content}</div>
              )}
            </li>
          );
        })}
      </ul>

      <dialog
        ref={dialog}
        className={styles.lightbox}
        aria-labelledby="lightbox-title"
        onClose={() => setOpen(null)}
        onClick={(event) => {
          if (event.target === event.currentTarget) dialog.current?.close();
        }}
      >
        {open && (
          <figure className={styles.lightboxFigure}>
            <div className={styles.lightboxImage}>
              <Image src={open.image.src} alt={open.image.alt} fill sizes="90vw" />
            </div>
            <figcaption>
              <h3 id="lightbox-title" className={`${ui.display} ${styles.lightboxTitle}`}>
                {open.title}
              </h3>
              <p className={styles.cardCaption}>{open.caption}</p>
            </figcaption>
            <button
              type="button"
              className={`${ui.button} ${ui.ghost} ${ui.small} ${styles.lightboxClose}`}
              onClick={() => dialog.current?.close()}
              autoFocus
            >
              Fechar
            </button>
          </figure>
        )}
      </dialog>
    </>
  );
}
