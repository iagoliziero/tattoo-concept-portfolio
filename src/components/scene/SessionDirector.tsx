"use client";

import { useFrame } from "@react-three/fiber";
import { useMemo, useRef } from "react";
import { visual } from "@/config/visual";
import { stage } from "@/lib/stage";
import { emitDroplet } from "./InkMist";
import { createSession, makeNeedle } from "./session";
import { sceneState } from "./state";
import { SESSION_PATH } from "./tattooArt";

const needle = makeNeedle();

/**
 * A sessão: começa quando a rolagem chega à seção, percorre a tatuagem com a
 * máquina ligada (push-in, balanço, gotículas) e termina sozinha se o
 * visitante sair. O dia mostrado na pele ao entrar em cada seção fica com o
 * SectionEffects da página.
 */
export function SessionDirector() {
  const session = useMemo(() => createSession(SESSION_PATH.segments, SESSION_PATH.total), []);
  const lastSection = useRef<number | null>(null);
  const replays = useRef(stage.sessionReplays);
  const clock = useRef(0);
  const pending = useRef(0);

  useFrame((_, delta) => {
    const dt = Math.min(delta, 0.05);
    const config = visual.session;
    const p = sceneState.p;

    const section = Math.round(p);
    if (section !== lastSection.current) {
      lastSection.current = section;
      if (section >= 2 && !session.started) session.finish();
    }
    if (stage.sessionReplays !== replays.current) {
      replays.current = stage.sessionReplays;
      session.reset();
    }

    if (!session.started && Math.abs(p - 1) < config.startWithin) session.start();
    const inside = Math.abs(p - 1) < config.leaveBeyond;
    if (session.started && !session.done && !inside) session.finish();
    const running = session.started && !session.done && inside;
    if (running) session.step(dt);

    session.needle(needle);
    sceneState.sessionTip.set(needle.x, needle.y, needle.z);
    sceneState.sessionFocus.lerp(sceneState.sessionTip, 1 - Math.exp(-dt * config.tipFollow));
    sceneState.sessionLift = needle.lift;

    const ease = 1 - Math.exp(-dt * config.zoomFollow);
    sceneState.sessionZoom += ((running ? config.zoomActive : config.zoom) - sceneState.sessionZoom) * ease;
    if (running) clock.current += dt;
    const sway = running ? config.sway.amplitude * Math.sin(clock.current * config.sway.speed) : 0;
    sceneState.sessionAngle += (sway - sceneState.sessionAngle) * ease;

    sceneState.machineOn = running || sceneState.drawing;
    sceneState.power += ((sceneState.machineOn ? 1 : 0) - sceneState.power) * (1 - Math.exp(-dt * 6));

    if (running && needle.down && !stage.reducedMotion) {
      pending.current += visual.droplets.rate * dt;
      while (pending.current >= 1) {
        pending.current -= 1;
        emitDroplet(needle.x, needle.y, needle.z);
      }
    }

    stage.setSession(running ? "running" : session.done ? "done" : "idle", session.progress);
  }, -1.5);

  return null;
}
