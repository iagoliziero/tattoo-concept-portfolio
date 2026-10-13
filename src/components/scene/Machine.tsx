"use client";

import { useFrame, useThree } from "@react-three/fiber";
import { useEffect, useMemo, useRef } from "react";
import { Vector3 } from "three";
import { visual } from "@/config/visual";
import { stage } from "@/lib/stage";
import { smoothstep } from "./canvas";
import { LABELED_PARTS, machineLabels } from "./labels";
import { buildMachine, MACHINE_PARTS } from "./machineModel";
import { sceneState } from "./state";

const point = new Vector3();

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
      label.style.transform = `translate3d(${x.toFixed(1)}px, ${y.toFixed(1)}px, 0) translate(-9px, -50%)`;
      label.style.opacity = opacity.toFixed(3);
    }
  });

  return <primitive object={model.root} />;
}
