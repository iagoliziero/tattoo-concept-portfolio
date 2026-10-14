"use client";

import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { visual } from "@/config/visual";
import { stage } from "@/lib/stage";

gsap.registerPlugin(ScrollTrigger, useGSAP);

const HEALING = 2;
const LAST_DAY = visual.healing.length - 1;

/**
 * Rolagem nativa: cada seção fica fixa por um trecho (holdRatio da altura da
 * tela) e depois dá lugar à próxima. Daqui sai `stage.p`, que a cena usa para
 * mover câmera e máquina. Ao parar no meio de uma passagem, a página encaixa
 * na seção mais próxima, como o protótipo fazia.
 *
 * A Cura fica fixa por mais tempo (healingHold) e anda em etapas: cada gesto
 * avança ou volta um dia (ver healingSteps). Só depois do último dia (ou antes
 * do primeiro, subindo) a página segue para a seção vizinha.
 */
export function ScrollController() {
  useGSAP(() => {
    // No celular, a barra de endereço que some e aparece não recalcula as seções.
    ScrollTrigger.config({ ignoreMobileResize: true });
    const sections = gsap.utils.toArray<HTMLElement>("[data-section]");
    const { holdRatio, healingHold, snapDelay, snapDuration } = visual.scroll;
    const reduceMotion = matchMedia("(prefers-reduced-motion: reduce)").matches;

    const pins = sections.map((section, i) =>
      ScrollTrigger.create({
        trigger: section,
        start: "top top",
        end: () => `+=${Math.round(window.innerHeight * (i === HEALING ? healingHold : holdRatio))}`,
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

    // Dia da cura a partir da rolagem: 0 ao chegar na Cura, o último ao sair.
    // Antes disso (Início e Sessão), quem decide o dia é o SectionEffects.
    const healing = pins[HEALING];
    const healAt = (y: number) => {
      const t = Math.min(1, Math.max(0, (y - healing.start) / (healing.end - healing.start)));
      return t * LAST_DAY;
    };
    const update = () => {
      const y = window.scrollY;
      stage.setP(progressAt(y));
      if (y >= pins[HEALING - 1].end) stage.setHeal(healAt(y));
    };

    const steps = healingSteps(healing, reduceMotion, {
      up: () => pins[HEALING - 1].end,
      down: () => pins[HEALING + 1].start + 1,
    });
    // Controle da linha do tempo: vai até o dia pedido.
    stage.setHealSeeker((heal, smooth) => steps.goTo(Math.round(heal), smooth));

    ScrollTrigger.create({
      start: 0,
      end: "max",
      onUpdate: update,
      onRefresh: update,
      snap: {
        snapTo: (value) => {
          const max = ScrollTrigger.maxScroll(window);
          const y = value * max;
          // Na Cura, para sempre num dia (barra de rolagem, inércia do celular).
          if (steps.inside(y)) return steps.yOf(steps.stepAt(y)) / max;
          const p = progressAt(y);
          const i = Math.round(p);
          if (p === i) return value;
          return (i > p ? pins[i].start : pins[i].end) / max;
        },
        delay: snapDelay,
        duration: reduceMotion ? 0 : snapDuration,
        ease: "power2.inOut",
      },
    });

    // Links para #secao pulam direto para o começo do trecho fixo daquela
    // seção (na Cura, o Dia 0), sem rolar pelo caminho: a cena corta para lá
    // e as seções do meio não animam. Daí em diante, a rolagem volta ao normal.
    const onClick = (event: MouseEvent) => {
      const link = (event.target as Element | null)?.closest('a[href^="#"]');
      const href = link?.getAttribute("href");
      const i = sections.findIndex((section) => `#${section.id}` === href);
      if (i < 0) return;
      event.preventDefault();
      steps.stop();
      window.scrollTo({ top: pins[i].start + 1, behavior: "instant" });
      update();
      stage.cut();
    };
    document.addEventListener("click", onClick);
    return () => {
      document.removeEventListener("click", onClick);
      steps.dispose();
      stage.setHealSeeker(null);
    };
  });

  return null;
}

type Mode = "none" | "step" | "native";

/**
 * Cura em etapas. Dentro do trecho fixo da Cura, roda do mouse, trackpad,
 * swipe e teclado não rolam a página: cada gesto leva ao dia seguinte (ou ao
 * anterior), numa transição animada, e novos avanços ficam bloqueados até ela
 * terminar e o gesto acabar (a inércia do trackpad conta como o mesmo gesto).
 * No último dia, um novo gesto para baixo leva à próxima seção (exits.down);
 * no primeiro, um gesto para cima volta à anterior (exits.up). Dali em diante
 * a rolagem é a da página.
 */
function healingSteps(
  healing: ScrollTrigger,
  reduceMotion: boolean,
  exits: { up: () => number; down: () => number },
) {
  const { duration, gestureGap, swipe } = visual.scroll.healingStep;
  const stepLength = () => (healing.end - healing.start) / LAST_DAY;
  const yOf = (k: number) => healing.start + k * stepLength();
  const stepAt = (y: number) => Math.min(LAST_DAY, Math.max(0, Math.round((y - healing.start) / stepLength())));
  const inside = (y: number) => y >= healing.start - 1 && y <= healing.end + 1;

  let tween: gsap.core.Tween | null = null;
  let target = -1;
  // Como o gesto atual está sendo usado: ainda nada, já avançou uma etapa, ou
  // rolando a página (chegou de fora da Cura ou está saindo dela).
  let mode: Mode = "none";
  let lastWheel = -Infinity;
  let touchY = 0;

  const stop = () => {
    tween?.kill();
    tween = null;
  };
  const glide = (y: number, smooth = true) => {
    stop();
    if (!smooth || reduceMotion) {
      window.scrollTo({ top: y, behavior: "instant" });
      return;
    }
    const scroll = { y: window.scrollY };
    tween = gsap.to(scroll, {
      y,
      duration,
      ease: "power2.inOut",
      onUpdate: () => window.scrollTo({ top: scroll.y, behavior: "instant" }),
      onComplete: () => {
        tween = null;
      },
    });
  };
  const goTo = (k: number, smooth = true) => {
    k = Math.min(LAST_DAY, Math.max(0, k));
    if (tween && target === k) return;
    glide(yOf(k), smooth);
    target = k;
  };

  /** Um movimento na direção `dir` (1 desce, -1 sobe). `ready`: já conta como gesto. */
  const handle = (dir: 1 | -1, prevent: () => void, ready: boolean) => {
    // Gesto já usado (ou transição em curso): o resto dele não faz nada.
    if (tween || mode === "step") {
      prevent();
      return;
    }
    const y = window.scrollY;
    if (!inside(y)) {
      if (mode === "none") mode = "native";
      return;
    }
    const k = stepAt(y);
    const leaving = (k === LAST_DAY && dir > 0) || (k === 0 && dir < 0);
    if (mode === "native") {
      // Gesto que veio de fora: para no dia mais próximo e espera o próximo.
      if (leaving) return;
      prevent();
      if (Math.abs(y - yOf(k)) > 1) goTo(k);
      return;
    }
    prevent();
    if (!ready) return;
    mode = "step";
    if (!leaving) goTo(k + dir);
    else {
      target = -1;
      glide(dir > 0 ? exits.down() : exits.up());
    }
  };

  const onWheel = (event: WheelEvent) => {
    if (event.ctrlKey || event.deltaY === 0 || Math.abs(event.deltaY) < Math.abs(event.deltaX)) return;
    // Pausa entre eventos encerra o gesto; a inércia do trackpad não pausa.
    if (event.timeStamp - lastWheel > gestureGap * 1000) mode = "none";
    lastWheel = event.timeStamp;
    handle(event.deltaY > 0 ? 1 : -1, () => event.preventDefault(), true);
  };

  const onTouchStart = (event: TouchEvent) => {
    touchY = event.touches[0].clientY;
    mode = "none";
  };
  const onTouchMove = (event: TouchEvent) => {
    if (event.touches.length > 1) return;
    const dy = touchY - event.touches[0].clientY;
    if (dy === 0) return;
    handle(dy > 0 ? 1 : -1, () => event.cancelable && event.preventDefault(), Math.abs(dy) >= swipe);
  };

  const onKey = (event: KeyboardEvent) => {
    const el = event.target as HTMLElement | null;
    if (el?.closest("input, textarea, select, [contenteditable]") || event.altKey || event.ctrlKey || event.metaKey) return;
    const down = event.key === "ArrowDown" || event.key === "PageDown" || (event.key === " " && !event.shiftKey);
    const up = event.key === "ArrowUp" || event.key === "PageUp" || (event.key === " " && event.shiftKey);
    if (!down && !up) return;
    if (!event.repeat) mode = "none";
    handle(down ? 1 : -1, () => event.preventDefault(), true);
  };

  window.addEventListener("wheel", onWheel, { passive: false });
  window.addEventListener("touchstart", onTouchStart, { passive: true });
  window.addEventListener("touchmove", onTouchMove, { passive: false });
  window.addEventListener("keydown", onKey);

  return {
    inside,
    stepAt,
    yOf,
    goTo,
    stop,
    dispose() {
      stop();
      window.removeEventListener("wheel", onWheel);
      window.removeEventListener("touchstart", onTouchStart);
      window.removeEventListener("touchmove", onTouchMove);
      window.removeEventListener("keydown", onKey);
    },
  };
}
