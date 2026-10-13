"use client";

import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { visual } from "@/config/visual";
import { stage } from "@/lib/stage";

gsap.registerPlugin(ScrollTrigger, useGSAP);

/**
 * Rolagem nativa: cada seção fica fixa por um trecho (holdRatio da altura da
 * tela) e depois dá lugar à próxima. Daqui sai `stage.p`, que a cena usa para
 * mover câmera e máquina. Ao parar no meio de uma passagem, a página encaixa
 * na seção mais próxima, como o protótipo fazia.
 */
export function ScrollController() {
  useGSAP(() => {
    // No celular, a barra de endereço que some e aparece não recalcula as seções.
    ScrollTrigger.config({ ignoreMobileResize: true });
    const sections = gsap.utils.toArray<HTMLElement>("[data-section]");
    const { holdRatio, snapDelay, snapDuration } = visual.scroll;
    const reduceMotion = matchMedia("(prefers-reduced-motion: reduce)").matches;

    const pins = sections.map((section) =>
      ScrollTrigger.create({
        trigger: section,
        start: "top top",
        end: () => `+=${Math.round(window.innerHeight * holdRatio)}`,
        pin: true,
        anticipatePin: 1,
      }),
    );
    const last = pins.length - 1;

    // Inteiro enquanto a seção está fixa; fração na passagem entre duas.
    const progressAt = (y: number) => {
      for (let i = 0; i <= last; i++) {
        const pin = pins[i];
        if (y > pin.end) continue;
        if (i === 0 || y >= pin.start) return i;
        const prev = pins[i - 1];
        return i - 1 + (y - prev.end) / (pin.start - prev.end);
      }
      return last;
    };
    const update = () => stage.setP(progressAt(window.scrollY));

    ScrollTrigger.create({
      start: 0,
      end: "max",
      onUpdate: update,
      onRefresh: update,
      snap: {
        snapTo: (value) => {
          const max = ScrollTrigger.maxScroll(window);
          const p = progressAt(value * max);
          const i = Math.round(p);
          if (p === i) return value;
          return (i > p ? pins[i].start : pins[i].end) / max;
        },
        delay: snapDelay,
        duration: reduceMotion ? 0 : snapDuration,
        ease: "power2.inOut",
      },
    });

    // Links para #secao levam ao meio do trecho fixo daquela seção.
    const onClick = (event: MouseEvent) => {
      const link = (event.target as Element | null)?.closest('a[href^="#"]');
      const href = link?.getAttribute("href");
      const i = sections.findIndex((section) => `#${section.id}` === href);
      if (i < 0) return;
      event.preventDefault();
      window.scrollTo({
        top: (pins[i].start + pins[i].end) / 2,
        behavior: reduceMotion ? "auto" : "smooth",
      });
    };
    document.addEventListener("click", onClick);
    return () => document.removeEventListener("click", onClick);
  });

  return null;
}
