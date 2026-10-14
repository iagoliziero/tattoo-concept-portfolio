"use client";

import { useFrame } from "@react-three/fiber";
import { useEffect, useRef } from "react";
import { Vector2 } from "three";
import { visual } from "@/config/visual";
import { stage } from "@/lib/stage";
import { surfacePoint, type SurfacePoint } from "./armGeometry";
import { sceneState } from "./state";

const cursor = new Vector2();
const tip: SurfacePoint = { x: 0, y: 0, z: 0, u: 0, v: 0 };
const hash = (n: number) => {
  const s = Math.sin(n * 127.1) * 43758.5453;
  return s - Math.floor(s);
};

/** Brilho do neon: aceso com uma oscilação leve e, de vez em quando, uma piscada. */
function neonFlicker(t: number) {
  const { rate, chance, dim, hum } = visual.neon.flicker;
  const slot = Math.floor(t * rate);
  if (hash(slot) < chance) return dim[0] + (dim[1] - dim[0]) * hash(slot + 0.5);
  return 1 - hum / 2 + (hum / 2) * Math.sin(t * 23) * Math.sin(t * 5.7);
}

/** Primeiro a rodar em cada quadro: tempo, rolagem suavizada, cursor e neon. */
export function Director() {
  const cuts = useRef(stage.cuts);

  useEffect(() => {
    sceneState.p = stage.p;
    const [along, around] = visual.session.start;
    surfacePoint(along, around, tip);
    sceneState.sessionTip.set(tip.x, tip.y, tip.z);
    sceneState.sessionFocus.copy(sceneState.sessionTip);

    const onMove = (event: PointerEvent) => {
      // Com movimento reduzido, o cursor não mexe a máquina, a luz nem o fundo.
      if (event.pointerType === "touch" || stage.reducedMotion) return;
      cursor.set(event.clientX / innerWidth - 0.5, event.clientY / innerHeight - 0.5);
      sceneState.pointer.set((event.clientX / innerWidth) * 2 - 1, -(event.clientY / innerHeight) * 2 + 1);
    };
    const onOut = (event: PointerEvent) => {
      if (event.relatedTarget) return;
      cursor.set(0, 0);
      sceneState.pointer.set(0, 0);
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    document.addEventListener("pointerout", onOut);
    return () => {
      window.removeEventListener("pointermove", onMove);
      document.removeEventListener("pointerout", onOut);
    };
  }, []);

  useFrame((_, delta) => {
    const dt = Math.min(delta, 0.05);
    const follow = 1 - Math.exp(-dt * visual.camera.follow);
    // Com movimento reduzido, o tempo do ambiente para: fumaça, feixe, poeira e
    // máquina flutuando ficam parados (a sessão anda pelo próprio relógio).
    if (!stage.reducedMotion) sceneState.time += dt;
    // Salto pelos links: corta direto, sem atravessar as seções do meio.
    if (stage.cuts !== cuts.current) {
      cuts.current = stage.cuts;
      sceneState.p = stage.p;
    }
    sceneState.p += (stage.p - sceneState.p) * follow;
    if (Math.abs(stage.p - sceneState.p) < 1e-4) sceneState.p = stage.p;
    sceneState.mouse.lerp(cursor, follow);
    sceneState.neon = stage.reducedMotion ? 1 : neonFlicker(sceneState.time);
  }, -2);

  return null;
}
