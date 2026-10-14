"use client";

import { useFrame, useThree } from "@react-three/fiber";
import { useEffect, useMemo, useRef } from "react";
import { AdditiveBlending, type MeshBasicMaterial } from "three";
import { site } from "@/config/site";
import { visual } from "@/config/visual";
import { canvasTexture, makeCanvas } from "./canvas";
import { sceneState } from "./state";
import { drawNeon } from "./textures";

/** Letreiro de neon atrás da máquina (textos em site.scene), sem tone mapping para o bloom pegar. */
export function Neon({ post }: { post: boolean }) {
  const { position, rotationY, size, canvas: canvasSize } = visual.neon;
  const glow = post ? visual.post.neonGlow : visual.neon.glow;
  const material = useRef<MeshBasicMaterial>(null);
  const invalidate = useThree((state) => state.invalidate);
  const { canvas, texture } = useMemo(() => {
    const canvas = makeCanvas(...canvasSize);
    return { canvas, texture: canvasTexture(canvas, { srgb: true }) };
  }, [canvasSize]);

  useEffect(() => {
    // A Pirata One vem do next/font com outro nome de família: lemos o nome
    // real da variável CSS e redesenhamos quando a fonte terminar de carregar.
    const family =
      getComputedStyle(document.documentElement).getPropertyValue("--font-display-face").trim() || "serif";
    const draw = () => {
      drawNeon(canvas, family, site.scene.neonTitle, site.scene.neonSubtitle);
      texture.needsUpdate = true;
      // Com movimento reduzido a cena só desenha quando pedem.
      invalidate();
    };
    draw();
    document.fonts.load(`150px ${family}`).then(draw, () => {});
    return () => texture.dispose();
  }, [canvas, texture, invalidate]);

  useFrame(() => {
    material.current?.color.setScalar(glow * sceneState.neon);
  });

  return (
    <mesh position={position} rotation-y={rotationY}>
      <planeGeometry args={size} />
      <meshBasicMaterial
        ref={material}
        map={texture}
        transparent
        depthWrite={false}
        blending={AdditiveBlending}
        toneMapped={false}
        fog={false}
      />
    </mesh>
  );
}
