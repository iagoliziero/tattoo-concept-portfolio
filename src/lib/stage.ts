import { useSyncExternalStore } from "react";

// Estado compartilhado entre a rolagem, a interface e a cena 3D.
// `p` vai de 0 a 5, uma unidade por seção: inteiro enquanto a seção está
// fixa na tela e fracionário na passagem de uma para a outra. A cena lê
// `stage.p` a cada quadro; componentes React usam `useStage`.

export type SessionStatus = "idle" | "running" | "done";

export interface StageState {
  p: number;
  section: number;
  /** A seção mais adiante já alcançada (revelações e contadores rodam uma vez). */
  furthest: number;
  /** Cicatrização mostrada na pele: 0 = Dia 0 ... 4 = Dia 30. */
  heal: number;
  sessionStatus: SessionStatus;
  /** Andamento da sessão, de 0 a 1. */
  sessionProgress: number;
  /** Conta os pedidos de "Ver de novo"; a cena recomeça quando muda. */
  sessionReplays: number;
  /** Conta os saltos dos links do menu; a cena corta direto para `p` quando muda. */
  cuts: number;
}

const initial: StageState = {
  p: 0,
  section: 0,
  furthest: 0,
  heal: 4,
  sessionStatus: "idle",
  sessionProgress: 0,
  sessionReplays: 0,
  cuts: 0,
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

// Quem sabe converter um dia da cura em posição de rolagem (o ScrollController).
type HealSeeker = (heal: number, smooth: boolean) => void;
let healSeeker: HealSeeker | null = null;

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
  get furthest() {
    return state.furthest;
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
  get cuts() {
    return state.cuts;
  },
  setP(p: number) {
    if (p === state.p) return;
    const section = Math.round(p);
    set({ p, section, furthest: Math.max(state.furthest, section) });
  },
  setHeal(heal: number) {
    if (heal !== state.heal) set({ heal });
  },
  setSession(sessionStatus: SessionStatus, sessionProgress: number) {
    if (sessionStatus !== state.sessionStatus || sessionProgress !== state.sessionProgress) {
      set({ sessionStatus, sessionProgress });
    }
  },
  /** Rola a página até o dia da cura pedido (o ScrollController registra como). */
  seekHeal(heal: number, smooth = true) {
    healSeeker?.(heal, smooth);
  },
  setHealSeeker(seeker: HealSeeker | null) {
    healSeeker = seeker;
  },
  /** Depois de um salto da rolagem: a cena vai direto para `p`, sem passar pelas seções do meio. */
  cut() {
    set({ cuts: state.cuts + 1 });
  },
  replaySession() {
    set({ sessionReplays: state.sessionReplays + 1 });
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
