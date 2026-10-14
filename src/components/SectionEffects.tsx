"use client";

import { useEffect } from "react";
import { stage } from "@/lib/stage";

/**
 * O que acontece ao entrar em cada seção, como o onEnter do protótipo:
 * Início mostra a pele curada e Sessão o Dia 0. Na Cura, o dia segue a
 * rolagem (ScrollController).
 */
function onEnter(section: number) {
  if (section === 0) stage.setHeal(4);
  if (section === 1) stage.setHeal(0);
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
    return unsubscribe;
  }, []);
  return null;
}
