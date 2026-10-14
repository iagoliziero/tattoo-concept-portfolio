"use client";

import Image from "next/image";
import { useEffect, useRef, useState, useSyncExternalStore, type CSSProperties, type PointerEvent } from "react";
import { site, type PortfolioCategory, type PortfolioItem } from "@/config/site";
import { visual } from "@/config/visual";
import { externalLink } from "@/lib/links";
import { stage } from "@/lib/stage";
import { Icon } from "../Icon";
import ui from "../ui.module.css";
import { PhotoFrame } from "./PhotoFrame";
import styles from "./sections.module.css";

export interface GalleryItem extends PortfolioItem {
  hasPhoto: boolean;
}

type Filter = PortfolioCategory | "all";
const PORTFOLIO_SECTION = 3;

// Largura dos cards para o navegador escolher o arquivo certo. No celular as
// quatro colunas ocupam a largura toda; em telas maiores a grade é limitada
// pela altura da tela ((100svh - 300px) * 0,4 por card, ver .grid).
const CARD_SIZES = [
  "(max-width: 640px) calc(25vw - 14px)",
  "(max-width: 1000px) calc(23vw - 8px)",
  "(max-height: 800px) 200px",
  "(max-height: 1000px) 280px",
  "(max-height: 1200px) 360px",
  "460px",
].join(", ");
// Lightbox: min(92vw, 960px) menos o respiro de 18px de cada lado.
const LIGHTBOX_SIZES = "(max-width: 1043px) calc(92vw - 36px), 924px";

/**
 * Trabalhos em duas linhas de quatro, filtros, revelação animada na primeira chegada à seção, inclinação 3D
 * seguindo o ponteiro e lightbox para as fotos.
 */
export function PortfolioGallery({ items, headingId }: { items: GalleryItem[]; headingId: string }) {
  const { portfolio } = site;
  const { columns, revealDuration, revealStagger, tilt, lift } = visual.portfolio;
  const [filter, setFilter] = useState<Filter>("all");
  const [open, setOpen] = useState<GalleryItem | null>(null);
  const dialog = useRef<HTMLDialogElement>(null);
  // No servidor tudo vem revelado; no navegador, revela ao chegar na seção.
  const revealed = useSyncExternalStore(
    stage.subscribe,
    () => stage.reducedMotion || stage.furthest >= PORTFOLIO_SECTION,
    () => true,
  );

  const shown = items.filter((item) => filter === "all" || item.categories.includes(filter));

  const onTilt = (event: PointerEvent<HTMLElement>) => {
    if (stage.reducedMotion) return;
    const card = event.currentTarget;
    const r = card.getBoundingClientRect();
    const x = (event.clientX - r.left) / r.width - 0.5;
    const y = (event.clientY - r.top) / r.height - 0.5;
    card.style.transform = `perspective(600px) rotateX(${(-y * tilt[0]).toFixed(1)}deg) rotateY(${(x * tilt[1]).toFixed(1)}deg) translateY(-${lift}px)`;
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

      <ul className={styles.grid} data-revealed={revealed} style={{ "--columns": columns } as CSSProperties}>
        {shown.map((item, i) => {
          const content = (
            <>
              <PhotoFrame
                image={item.image}
                hasPhoto={item.hasPhoto}
                placeholder={`Foto: ${item.title}`}
                sizes={CARD_SIZES}
                className={styles.cardPhoto}
              />
              <span className={styles.cardInfo}>
                <span className={styles.cardTitle}>{item.title}</span>
                <span className={styles.cardCaption}>{item.caption}</span>
              </span>
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
            <li key={item.id}>
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

      <div className={styles.portfolioFoot} style={{ "--columns": columns } as CSSProperties}>
        <a {...externalLink(site.artist.instagram.url)} className={styles.instagram}>
          <Icon name="instagram" size={18} />
          {portfolio.instagramCta}
        </a>
      </div>

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
              <Image src={open.image.src} alt={open.image.alt} fill sizes={LIGHTBOX_SIZES} />
            </div>
            <figcaption>
              <h3 id="lightbox-title" className={`${ui.display} ${styles.lightboxTitle}`}>
                {open.title}
              </h3>
              <p className={styles.lightboxCaption}>{open.caption}</p>
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
