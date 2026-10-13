"use client";

import { useEffect, useState, useSyncExternalStore } from "react";
import { visual } from "@/config/visual";
import { stage } from "@/lib/stage";

const ABOUT_SECTION = 4;
type Phase = "final" | "waiting" | "counting";

/**
 * Número que conta do zero ao chegar pela primeira vez na seção Sobre.
 * No servidor e com movimento reduzido, mostra direto o valor final.
 */
export function CountUp({ value, suffix = "" }: { value: number; suffix?: string }) {
  const phase = useSyncExternalStore<Phase>(
    stage.subscribe,
    () => (stage.reducedMotion ? "final" : stage.furthest >= ABOUT_SECTION ? "counting" : "waiting"),
    () => "final",
  );
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (phase !== "counting") return;
    const start = performance.now();
    const duration = visual.countUp.duration * 1000;
    let frame = 0;
    const tick = (now: number) => {
      const k = Math.min(1, (now - start) / duration);
      setProgress(k);
      if (k < 1) frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [phase]);

  const eased = 1 - (1 - progress) ** 3;
  const shown = phase === "final" ? value : phase === "waiting" ? 0 : Math.round(value * eased);
  return (
    <>
      {shown.toLocaleString("pt-BR")}
      {suffix}
    </>
  );
}
