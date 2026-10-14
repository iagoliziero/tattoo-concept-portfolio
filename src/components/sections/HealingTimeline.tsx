"use client";

import { site } from "@/config/site";
import { stage, useStage } from "@/lib/stage";
import ui from "../ui.module.css";
import styles from "./sections.module.css";

/**
 * Dia atual, dica de cuidado e a linha do tempo. O dia muda um por vez com a
 * rolagem; arrastar o controle (ou usar as setas) leva ao dia mais próximo.
 */
export function HealingTimeline() {
  const { healing } = site;
  const heal = useStage((s) => s.heal);
  const last = healing.stages.length - 1;
  const current = healing.stages[Math.min(last, Math.max(0, Math.round(heal)))];

  return (
    <>
      <p className={`${ui.display} ${styles.stageTitle}`} aria-live="polite">
        {current.title}
      </p>
      <p className={styles.stageTip}>{current.tip}</p>
      <input
        type="range"
        min={0}
        max={last * 100}
        step={1}
        value={Math.round(heal * 100)}
        onKeyDown={(event) => {
          // Setas pulam de um dia para o outro (o passo fino fica para o arraste).
          const forward = event.key === "ArrowRight" || event.key === "ArrowUp";
          const back = event.key === "ArrowLeft" || event.key === "ArrowDown";
          if (!forward && !back) return;
          event.preventDefault();
          const next = forward ? Math.floor(heal + 1e-6) + 1 : Math.ceil(heal - 1e-6) - 1;
          stage.seekHeal(Math.min(last, Math.max(0, next)));
        }}
        onChange={(event) => stage.seekHeal(Number(event.target.value) / 100)}
        aria-label={healing.sliderLabel}
        aria-valuetext={current.title}
        className={styles.range}
      />
      <div className={styles.marks} aria-hidden="true">
        {healing.dayMarks.map((mark) => (
          <span key={mark}>{mark}</span>
        ))}
      </div>
    </>
  );
}
