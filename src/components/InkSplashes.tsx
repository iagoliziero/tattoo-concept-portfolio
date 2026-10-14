"use client";

import { useEffect, useRef } from "react";
import { visual } from "@/config/visual";
import { stage } from "@/lib/stage";
import styles from "./InkSplashes.module.css";

// Respingos de tinta num canvas 2D por cima da página: ao clicar numa área
// vazia e ao enviar o pedido de orçamento.

interface Drop {
  x: number;
  y: number;
  vx: number;
  vy: number;
  r: number;
  life: number;
  rgb: string;
}

const drops: Drop[] = [];
let wake: (() => void) | null = null;

function pickColor() {
  const { colors } = visual.splash;
  let roll = Math.random() * colors.reduce((sum, c) => sum + c.weight, 0);
  for (const color of colors) {
    roll -= color.weight;
    if (roll <= 0) return color.rgb;
  }
  return colors[0].rgb;
}

/** Solta n gotas no ponto (x, y) da tela. */
export function splat(x: number, y: number, n: number) {
  if (stage.reducedMotion) return;
  const { speed, lift, radius } = visual.splash;
  for (let i = 0; i < n; i++) {
    const angle = Math.random() * Math.PI * 2;
    const s = speed[0] + Math.random() * (speed[1] - speed[0]);
    drops.push({
      x,
      y,
      vx: Math.cos(angle) * s,
      vy: Math.sin(angle) * s - lift,
      r: radius[0] + Math.random() * (radius[1] - radius[0]),
      life: 1,
      rgb: pickColor(),
    });
  }
  wake?.();
}

export function InkSplashes() {
  const canvas = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const el = canvas.current;
    if (!el) return;
    const g = el.getContext("2d")!;
    let frame = 0;
    let last = 0;

    const resize = () => {
      const dpr = Math.min(devicePixelRatio, 2);
      el.width = innerWidth * dpr;
      el.height = innerHeight * dpr;
      g.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    const tick = (now: number) => {
      const k = Math.min(3, (now - last) / (1000 / 60));
      last = now;
      const { gravity, drag, life } = visual.splash;
      const fade = k / (life * 60);
      g.clearRect(0, 0, innerWidth, innerHeight);
      for (let i = drops.length - 1; i >= 0; i--) {
        const d = drops[i];
        d.vy += gravity * k;
        d.vx *= drag ** k;
        d.x += d.vx * k;
        d.y += d.vy * k;
        d.life -= fade;
        if (d.life <= 0) {
          drops.splice(i, 1);
          continue;
        }
        g.fillStyle = `rgba(${d.rgb},${d.life.toFixed(3)})`;
        g.beginPath();
        g.arc(d.x, d.y, d.r * Math.sqrt(d.life), 0, Math.PI * 2);
        g.fill();
      }
      frame = drops.length ? requestAnimationFrame(tick) : 0;
    };
    wake = () => {
      if (frame) return;
      last = performance.now();
      frame = requestAnimationFrame(tick);
    };

    // Clique numa área vazia: o alvo é a cena 3D.
    const onClick = (event: MouseEvent) => {
      const onScene = (event.target as Element | null)?.closest?.("[data-scene]");
      if (!onScene) return;
      splat(event.clientX, event.clientY, visual.splash.onClick);
    };

    resize();
    window.addEventListener("resize", resize);
    window.addEventListener("click", onClick);
    return () => {
      cancelAnimationFrame(frame);
      wake = null;
      window.removeEventListener("resize", resize);
      window.removeEventListener("click", onClick);
    };
  }, []);

  return <canvas ref={canvas} className={styles.canvas} aria-hidden="true" />;
}
