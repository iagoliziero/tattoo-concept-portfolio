"use client";

import { Canvas } from "@react-three/fiber";
import { visual } from "@/config/visual";

// Fase 1: só o palco. Fundo, luzes, bancada e braço entram na fase 2.
export default function Scene() {
  const { fov, near, far } = visual.camera;

  return (
    <Canvas
      dpr={[1, visual.renderer.maxPixelRatio]}
      camera={{ fov, near, far, position: [0, 2.3, 7.4] }}
      gl={{ antialias: true }}
    >
      <color attach="background" args={[visual.colors.background]} />
    </Canvas>
  );
}
