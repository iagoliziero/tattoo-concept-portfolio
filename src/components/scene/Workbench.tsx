"use client";

import { useEffect, useMemo } from "react";
import { DoubleSide, MeshPhysicalMaterial } from "three";
import { visual } from "@/config/visual";
import { canvasTexture } from "./canvas";
import { useSceneTextures } from "./sceneTextures";
import { useStudioEnvironment } from "./StudioEnvironment";

/** Bancada de madeira envernizada, batoques de tinta e frascos "Black ink". */
export function Workbench() {
  const { table, inkCaps, bottles } = visual;
  const environment = useStudioEnvironment();
  const sources = useSceneTextures();
  const { wood, label, cupMaterial } = useMemo(
    () => ({
      wood: canvasTexture(sources.wood, { srgb: true, repeat: table.repeat }),
      label: canvasTexture(sources.label, { srgb: true }),
      // Plástico translúcido dos batoques e dos bicos dos frascos.
      cupMaterial: new MeshPhysicalMaterial({
        color: visual.colors.text,
        metalness: 0,
        roughness: 0.3,
        transparent: true,
        opacity: 0.88,
        side: DoubleSide,
        clearcoat: 0.5,
      }),
    }),
    [sources, table.repeat],
  );
  useEffect(
    () => () => {
      wood.dispose();
      label.dispose();
      cupMaterial.dispose();
    },
    [wood, label, cupMaterial],
  );

  return (
    <>
      <mesh rotation-x={-Math.PI / 2} position-y={table.y} receiveShadow>
        <planeGeometry args={[table.size, table.size]} />
        <meshPhysicalMaterial
          map={wood}
          roughness={table.roughness}
          metalness={0}
          clearcoat={table.clearcoat}
          clearcoatRoughness={table.clearcoatRoughness}
          envMap={environment}
          envMapIntensity={table.envMapIntensity}
        />
      </mesh>

      {inkCaps.map(({ position: [x, z], ink }) => (
        <group key={`${x},${z}`} position={[x, table.y, z]}>
          <mesh position-y={0.07} castShadow material={cupMaterial}>
            <cylinderGeometry args={[0.11, 0.09, 0.14, 24, 1, true]} />
          </mesh>
          <mesh position-y={0.12}>
            <cylinderGeometry args={[0.1, 0.1, 0.012, 24]} />
            <meshPhysicalMaterial color={ink} roughness={0.05} clearcoat={1} />
          </mesh>
        </group>
      ))}

      {bottles.map(([x, z]) => (
        <group key={`${x},${z}`} position={[x, table.y, z]}>
          <mesh position-y={0.4} castShadow>
            <cylinderGeometry args={[0.24, 0.24, 0.8, 32]} />
            <meshPhysicalMaterial color="#141312" roughness={0.08} clearcoat={1} />
          </mesh>
          <mesh position-y={0.42}>
            <cylinderGeometry args={[0.246, 0.246, 0.36, 32, 1, true]} />
            <meshPhysicalMaterial map={label} roughness={0.6} />
          </mesh>
          <mesh position-y={0.89}>
            <cylinderGeometry args={[0.12, 0.12, 0.18, 24]} />
            <meshPhysicalMaterial color="#141312" roughness={0.4} />
          </mesh>
          <mesh position-y={1.05} material={cupMaterial}>
            <cylinderGeometry args={[0.02, 0.06, 0.14, 16]} />
          </mesh>
        </group>
      ))}
    </>
  );
}
