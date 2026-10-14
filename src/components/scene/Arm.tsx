"use client";

import { useEffect, useMemo } from "react";
import { visual } from "@/config/visual";
import { ARM_LENGTH, ARM_RADIUS, ARM_SPAN, ARM_THETA_START } from "./armGeometry";
import { canvasTexture } from "./canvas";
import { useSceneTextures } from "./sceneTextures";
import { useStudioEnvironment } from "./StudioEnvironment";

/** Braço: segmento de cilindro deitado com pele procedural e bordas que somem. */
export function Arm() {
  const { roughness, bumpScale, envMapIntensity, brightness } = visual.arm;
  const environment = useStudioEnvironment();
  const { skin, skinBump } = useSceneTextures();
  const { map, bump } = useMemo(
    () => ({
      map: canvasTexture(skin, { srgb: true }),
      bump: canvasTexture(skinBump),
    }),
    [skin, skinBump],
  );
  useEffect(
    () => () => {
      map.dispose();
      bump.dispose();
    },
    [map, bump],
  );

  return (
    <mesh name="arm" rotation-z={Math.PI / 2} position-y={-ARM_RADIUS} receiveShadow renderOrder={1}>
      <cylinderGeometry args={[ARM_RADIUS, ARM_RADIUS, ARM_LENGTH, 128, 1, true, ARM_THETA_START, ARM_SPAN]} />
      <meshStandardMaterial
        map={map}
        color={[brightness, brightness, brightness]}
        bumpMap={bump}
        bumpScale={bumpScale}
        roughness={roughness}
        metalness={0}
        transparent
        envMap={environment}
        envMapIntensity={envMapIntensity}
      />
    </mesh>
  );
}
