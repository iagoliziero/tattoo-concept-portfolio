import { useSyncExternalStore } from "react";

// Estado compartilhado entre a rolagem, a interface e a cena 3D.
// `p` vai de 0 a 5, uma unidade por seção: inteiro enquanto a seção está
// fixa na tela e fracionário na passagem de uma para a outra. A cena lê
// `stage.p` a cada quadro; componentes React usam `useStage`.

export type SessionStatus = "idle" | "running" | "done";
export type DrawTool = "line" | "shade";

export interface StageState {
  p: number;
  section: number;
  sound: boolean;
  /** Cicatrização mostrada na pele: 0 = Dia 0 ... 4 = Dia 30. */
  heal: number;
  sessionStatus: SessionStatus;
  /** Andamento da sessão, de 0 a 1. */
  sessionProgress: number;
  /** Conta os pedidos de "Ver de novo"; a cena recomeça quando muda. */
  sessionReplays: number;
  /** Ferramenta do "tatue você mesmo" e se já há algo desenhado no braço. */
  drawTool: DrawTool;
  hasDrawing: boolean;
}

const initial: StageState = {
  p: 0,
  section: 0,
  sound: false,
  heal: 4,
  sessionStatus: "idle",
  sessionProgress: 0,
  sessionReplays: 0,
  drawTool: "line",
  hasDrawing: false,
};
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
  get heal() {
    return state.heal;
  },
  get sessionReplays() {
    return state.sessionReplays;
  },
  get sessionProgress() {
    return state.sessionProgress;
  },
  get drawTool() {
    return state.drawTool;
  },
  get hasDrawing() {
    return state.hasDrawing;
  },
  setP(p: number) {
    if (p !== state.p) set({ p, section: Math.round(p) });
  },
  setSound(sound: boolean) {
    if (sound !== state.sound) set({ sound });
  },
  setHeal(heal: number) {
    if (heal !== state.heal) set({ heal });
  },
  setSession(sessionStatus: SessionStatus, sessionProgress: number) {
    if (sessionStatus !== state.sessionStatus || sessionProgress !== state.sessionProgress) {
      set({ sessionStatus, sessionProgress });
    }
  },
  replaySession() {
    set({ sessionReplays: state.sessionReplays + 1 });
  },
  setDrawTool(drawTool: DrawTool) {
    if (drawTool !== state.drawTool) set({ drawTool });
  },
  setHasDrawing(hasDrawing: boolean) {
    if (hasDrawing !== state.hasDrawing) set({ hasDrawing });
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
