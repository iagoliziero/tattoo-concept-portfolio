import { visual } from "@/config/visual";
import { stage } from "./stage";

// Linha do tempo da cicatrização correndo sozinha do Dia 0 ao Dia 30.
// Qualquer toque no controle, ou a troca de seção, cancela a corrida.

let run = 0;

export function startAutoHeal() {
  const id = ++run;
  stage.setHeal(0);
  const { delay, duration } = visual.healingAuto;
  const begin = performance.now() + delay * 1000;
  const last = visual.healing.length - 1;
  const tick = (now: number) => {
    if (id !== run) return;
    const t = Math.max(0, (now - begin) / (duration * 1000));
    stage.setHeal(Math.min(last, t * last));
    if (t < 1) requestAnimationFrame(tick);
  };
  requestAnimationFrame(tick);
}

export function cancelAutoHeal() {
  run++;
}
