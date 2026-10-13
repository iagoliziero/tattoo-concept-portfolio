"use client";

import { useFrame } from "@react-three/fiber";
import { useEffect, useMemo, useRef } from "react";
import type { MeshPhysicalMaterial } from "three";
import { visual } from "@/config/visual";
import { stage } from "@/lib/stage";
import { ARM_RADIUS, TATTOO_PATCH } from "./armGeometry";
import { canvasTexture } from "./canvas";
import { useStudioEnvironment } from "./StudioEnvironment";
import { TATTOO_STROKES } from "./tattooArt";
import { createTattooSurface } from "./tattooSurface";

/**
 * A tatuagem num segundo segmento de cilindro sobre a pele. Recompõe o canvas
 * quando o dia da cicatrização muda; o verniz e a rugosidade acompanham o
 * brilho de pomada, para o reflexo reagir de verdade à luz.
 */
export function Tattoo() {
  const environment = useStudioEnvironment();
  const material = useRef<MeshPhysicalMaterial>(null);
  const shown = useRef(-1);
  const { surface, texture } = useMemo(() => {
    const surface = createTattooSurface(TATTOO_STROKES);
    return { surface, texture: canvasTexture(surface.canvas, { srgb: true }) };
  }, []);
  useEffect(() => () => texture.dispose(), [texture]);

  useFrame(() => {
    const heal = stage.heal;
    if (Math.abs(heal - shown.current) < 0.004 || !material.current) return;
    shown.current = heal;
    const gloss = surface.compose(heal);
    texture.needsUpdate = true;
    const { roughnessDry, roughnessWet } = visual.tattoo;
    // Nunca 0: zerar o verniz troca o shader e travaria um quadro.
    material.current.clearcoat = Math.max(0.001, gloss);
    material.current.roughness = roughnessDry - (roughnessDry - roughnessWet) * gloss;
  });

  const { length, thetaStart, thetaSpan, center } = TATTOO_PATCH;
  const { roughness, clearcoatRoughness, envMapIntensity } = visual.tattoo;
  return (
    <mesh rotation-z={Math.PI / 2} position={[center, -ARM_RADIUS, 0]} receiveShadow renderOrder={2}>
      <cylinderGeometry args={[ARM_RADIUS + 0.004, ARM_RADIUS + 0.004, length, 96, 1, true, thetaStart, thetaSpan]} />
      <meshPhysicalMaterial
        ref={material}
        map={texture}
        transparent
        roughness={roughness}
        metalness={0}
        clearcoat={0.001}
        clearcoatRoughness={clearcoatRoughness}
        envMap={environment}
        envMapIntensity={envMapIntensity}
        depthWrite={false}
        polygonOffset
        polygonOffsetFactor={-2}
      />
    </mesh>
  );
}
