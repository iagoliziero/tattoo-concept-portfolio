"use client";

import { useFrame } from "@react-three/fiber";
import { useEffect, useMemo, useRef } from "react";
import { AdditiveBlending, BufferAttribute, BufferGeometry, type Points } from "three";
import { visual } from "@/config/visual";
import { stage } from "@/lib/stage";
import { canvasTexture } from "./canvas";
import { sceneState } from "./state";
import { dotCanvas } from "./textures";

/** Poeira dourada flutuando na luz, com uma deriva lenta. */
export function Dust({ count }: { count: number }) {
  const { size, color, opacity, min, max } = visual.dust;
  const points = useRef<Points>(null);
  const { geometry, dot } = useMemo(() => {
    const positions = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      for (let k = 0; k < 3; k++) positions[i * 3 + k] = min[k] + Math.random() * (max[k] - min[k]);
    }
    const geometry = new BufferGeometry();
    geometry.setAttribute("position", new BufferAttribute(positions, 3));
    return { geometry, dot: canvasTexture(dotCanvas(), { srgb: true }) };
  }, [count, min, max]);
  useEffect(
    () => () => {
      geometry.dispose();
      dot.dispose();
    },
    [geometry, dot],
  );

  useFrame(() => {
    if (!points.current || stage.reducedMotion) return;
    points.current.rotation.y = sceneState.time * 0.02;
    points.current.position.y = Math.sin(sceneState.time * 0.2) * 0.05;
  });

  return (
    <points ref={points} name="dust" geometry={geometry}>
      <pointsMaterial
        size={size}
        map={dot}
        color={color}
        transparent
        opacity={opacity}
        depthWrite={false}
        blending={AdditiveBlending}
      />
    </points>
  );
}
