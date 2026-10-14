"use client";

import { useFrame, useThree } from "@react-three/fiber";
import { useEffect, useMemo, useRef } from "react";
import { Vector3 } from "three";
import { visual } from "@/config/visual";
import { stage } from "@/lib/stage";
import { smoothstep } from "./canvas";
import { LABELED_PARTS, machineLabels } from "./labels";
import { buildMachine, MACHINE_PARTS, NEEDLE_REST_Y } from "./machineModel";
import { sceneState } from "./state";

const point = new Vector3();
const shake = new Vector3();
const labelWidths = new WeakMap<HTMLElement, number>();

/** easeOutBack: chega ao lugar passando um pouco e voltando. */
function settle(t: number, overshoot: number) {
  const u = t - 1;
  return 1 + (overshoot + 1) * u * u * u + overshoot * u * u;
}

/**
 * A máquina: segue a pose calculada pelo CameraRig, monta-se peça por peça na
 * abertura e se abre na vista explodida, com as etiquetas projetadas na tela.
 */
export function Machine() {
  const model = useMemo(() => buildMachine(), []);
  useEffect(() => model.dispose, [model]);
  const camera = useThree((state) => state.camera);
  const size = useThree((state) => state.size);
  const mountedAt = useRef<number | null>(null);

  useFrame(() => {
    const { root, parts } = model;
    const { assembly, explode, labelAnchors, labelsFrom } = visual.machine;
    root.position.copy(sceneState.machine);
    root.quaternion.copy(sceneState.machineQuat);

    mountedAt.current ??= sceneState.time;
    const elapsed = stage.reducedMotion ? Infinity : sceneState.time - mountedAt.current - assembly.start;
    const w = sceneState.explode;

    for (const part of MACHINE_PARTS) {
      const group = parts[part];
      const t = Math.min(1, Math.max(0, (elapsed - assembly.delay[part]) / assembly.duration));
      group.visible = elapsed >= assembly.delay[part];
      const away = 1 - (t < 1 ? settle(t, assembly.overshoot) : 1);
      const [fx, fy, fz] = assembly.from[part];
      const [ex, ey, ez] = explode[part];
      group.position.set(fx * away + ex * w, fy * away + ey * w, fz * away + ez * w);
      group.rotation.y = assembly.spin * away;
    }

    // Ligada: agulha oscilando, armadura tremendo e a máquina inteira vibrando.
    const on = sceneState.machineOn && !stage.reducedMotion;
    const { needle, armature, jitter } = visual.vibration;
    const phase = sceneState.time * Math.PI * 2;
    model.needle.position.y = NEEDLE_REST_Y - (on ? needle.reach + Math.sin(phase * needle.rate) * needle.amplitude : 0);
    model.armature.rotation.z = on ? Math.sin(phase * armature.rate) * armature.angle : 0;
    if (on) root.position.add(shake.set(Math.random() - 0.5, Math.random() - 0.5, Math.random() - 0.5).multiplyScalar(jitter));

    root.updateMatrixWorld();
    const opacity = smoothstep(labelsFrom, 1, w);
    for (const part of LABELED_PARTS) {
      const label = machineLabels.get(part);
      if (!label) continue;
      if (opacity < 0.001) {
        label.style.opacity = "0";
        continue;
      }
      point.fromArray(labelAnchors[part]).add(parts[part].position);
      root.localToWorld(point).project(camera);
      const x = (point.x * 0.5 + 0.5) * size.width;
      const y = (-point.y * 0.5 + 0.5) * size.height;
      // Perto da borda direita, a etiqueta vira para o lado esquerdo do ponto.
      const width = (labelWidths.get(label) ?? labelWidths.set(label, label.offsetWidth).get(label))!;
      const flip = x - 11 + width > size.width - 8;
      label.style.transform = `translate3d(${x.toFixed(1)}px, ${y.toFixed(1)}px, 0) translate(${flip ? "calc(11px - 100%)" : "-11px"}, -50%)`;
      label.dataset.flip = String(flip);
      label.style.opacity = opacity.toFixed(3);
    }
  });

  return <primitive object={model.root} />;
}
