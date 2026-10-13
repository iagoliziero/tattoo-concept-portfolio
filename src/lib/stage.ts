import { useSyncExternalStore } from "react";

// Estado compartilhado entre a rolagem, a interface e a cena 3D.
// `p` vai de 0 a 5, uma unidade por seção: inteiro enquanto a seção está
// fixa na tela e fracionário na passagem de uma para a outra. A cena lê
// `stage.p` a cada quadro; componentes React usam `useStage`.

export interface StageState {
  p: number;
  section: number;
  sound: boolean;
}

const initial: StageState = { p: 0, section: 0, sound: false };
let state: StageState = initial;
const listeners = new Set<() => void>();

function set(next: Partial<StageState>) {
  state = { ...state, ...next };
  listeners.forEach((listener) => listener());
}

// prefers-reduced-motion, acompanhando mudanças do sistema enquanto a página está aberta.
let reducedMotion: MediaQueryList | null = null;
function reducedMotionQuery() {
  if (!reducedMotion && typeof window !== "undefined") {
    reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  }
  return reducedMotion;
}

export const stage = {
  /** Sem vibração, tremores, piscadas e derivas. */
  get reducedMotion() {
    return reducedMotionQuery()?.matches ?? false;
  },
  get p() {
    return state.p;
  },
  get section() {
    return state.section;
  },
  get sound() {
    return state.sound;
  },
  setP(p: number) {
    if (p !== state.p) set({ p, section: Math.round(p) });
  },
  setSound(sound: boolean) {
    if (sound !== state.sound) set({ sound });
  },
  subscribe(listener: () => void) {
    listeners.add(listener);
    return () => {
      listeners.delete(listener);
    };
  },
};

export function useStage<T>(select: (s: StageState) => T): T {
  return useSyncExternalStore(
    stage.subscribe,
    () => select(state),
    () => select(initial),
  );
}
