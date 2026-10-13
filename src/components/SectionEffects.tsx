"use client";

import { useEffect } from "react";
import { cancelAutoHeal, startAutoHeal } from "@/lib/healing";
import { stage } from "@/lib/stage";

/**
 * O que acontece ao entrar em cada seção, como o onEnter do protótipo:
 * Início mostra a pele curada, Sessão o Dia 0, Cura roda a linha do tempo.
 */
function onEnter(section: number) {
  if (section !== 2) cancelAutoHeal();
  if (section === 0) stage.setHeal(4);
  if (section === 1) stage.setHeal(0);
  if (section === 2) startAutoHeal();
}

export function SectionEffects() {
  useEffect(() => {
    let current = stage.section;
    onEnter(current);
    const unsubscribe = stage.subscribe(() => {
      if (stage.section === current) return;
      current = stage.section;
      onEnter(current);
    });
    return () => {
      unsubscribe();
      cancelAutoHeal();
    };
  }, []);
  return null;
}
