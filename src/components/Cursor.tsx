"use client";

import { useEffect, useRef } from "react";
import { visual } from "@/config/visual";
import { stage } from "@/lib/stage";
import styles from "./Cursor.module.css";

const INTERACTIVE = 'a, button, input, select, textarea, label, [role="button"], [data-cursor="grow"]';

/**
 * Cursor do protótipo: anel com atraso e ponto vermelho. Cresce sobre itens
 * clicáveis e encolhe sobre o braço no "tatue você mesmo". Só com mouse e sem
 * prefers-reduced-motion; no toque e com movimento reduzido fica o do sistema.
 */
export function Cursor() {
  const ring = useRef<HTMLDivElement>(null);
  const dot = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fine = matchMedia("(pointer: fine)");
    if (!fine.matches || stage.reducedMotion) return;
    const root = document.documentElement;
    const { follow, grow, onArm, pressed } = visual.cursor;
    const target = { x: -100, y: -100 };
    const ringAt = { x: -100, y: -100 };
    let over = false;
    let down = false;
    let visible = false;
    let frame = 0;
    let last = performance.now();

    const show = (on: boolean) => {
      visible = on;
      root.classList.toggle(styles.active, on);
    };
    const onMove = (event: PointerEvent) => {
      if (event.pointerType !== "mouse") return;
      target.x = event.clientX;
      target.y = event.clientY;
      over = Boolean((event.target as Element | null)?.closest?.(INTERACTIVE));
      if (!visible) {
        ringAt.x = target.x;
        ringAt.y = target.y;
        show(true);
      }
    };
    const onDown = () => (down = true);
    const onUp = () => (down = false);
    const onOut = (event: PointerEvent) => {
      if (!event.relatedTarget) show(false);
    };

    const tick = (now: number) => {
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      const k = 1 - Math.exp(-dt * follow);
      ringAt.x += (target.x - ringAt.x) * k;
      ringAt.y += (target.y - ringAt.y) * k;
      const scale = (over ? grow : stage.cursorOnArm ? onArm : 1) * (down ? pressed : 1);
      if (ring.current) {
        ring.current.style.transform = `translate3d(${ringAt.x}px, ${ringAt.y}px, 0) translate(-50%, -50%) scale(${scale})`;
        ring.current.dataset.over = String(over);
      }
      if (dot.current) dot.current.style.transform = `translate3d(${target.x}px, ${target.y}px, 0) translate(-50%, -50%)`;
      frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);

    window.addEventListener("pointermove", onMove, { passive: true });
    window.addEventListener("pointerdown", onDown);
    window.addEventListener("pointerup", onUp);
    document.addEventListener("pointerout", onOut);
    return () => {
      cancelAnimationFrame(frame);
      show(false);
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerdown", onDown);
      window.removeEventListener("pointerup", onUp);
      document.removeEventListener("pointerout", onOut);
    };
  }, []);

  const { ring: ringSize, dot: dotSize } = visual.cursor;
  return (
    <>
      <div ref={ring} className={styles.ring} style={{ width: ringSize, height: ringSize }} aria-hidden="true" />
      <div ref={dot} className={styles.dot} style={{ width: dotSize, height: dotSize }} aria-hidden="true" />
    </>
  );
}
