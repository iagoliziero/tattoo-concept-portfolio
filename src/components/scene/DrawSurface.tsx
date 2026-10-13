"use client";

import { useFrame } from "@react-three/fiber";
import { useEffect, useMemo, useRef } from "react";
import { visual } from "@/config/visual";
import { drawingCanvas, drawingVersion } from "@/lib/drawing";
import { ARM_RADIUS, DRAW_PATCH } from "./armGeometry";
import { canvasTexture } from "./canvas";
import { useStudioEnvironment } from "./StudioEnvironment";

/** O desenho do visitante, num terceiro segmento de cilindro na área livre do braço. */
export function DrawSurface() {
  const environment = useStudioEnvironment();
  const texture = useMemo(() => canvasTexture(drawingCanvas(), { srgb: true }), []);
  const shown = useRef(-1);
  useEffect(() => () => texture.dispose(), [texture]);

  useFrame(() => {
    const version = drawingVersion();
    if (version === shown.current) return;
    shown.current = version;
    texture.needsUpdate = true;
  });

  const { center, length, thetaStart, thetaSpan } = DRAW_PATCH;
  return (
    <mesh rotation-z={Math.PI / 2} position={[center, -ARM_RADIUS, 0]} receiveShadow renderOrder={3}>
      <cylinderGeometry args={[ARM_RADIUS + 0.004, ARM_RADIUS + 0.004, length, 96, 1, true, thetaStart, thetaSpan]} />
      <meshStandardMaterial
        map={texture}
        transparent
        roughness={visual.draw.roughness}
        metalness={0}
        envMap={environment}
        envMapIntensity={visual.draw.envMapIntensity}
        depthWrite={false}
        polygonOffset
        polygonOffsetFactor={-2}
      />
    </mesh>
  );
}
