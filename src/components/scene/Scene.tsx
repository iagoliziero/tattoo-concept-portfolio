"use client";

import { Canvas, useThree } from "@react-three/fiber";
import { useEffect } from "react";
import * as THREE from "three";
import { visual } from "@/config/visual";
import { Arm } from "./Arm";
import { Backdrop } from "./Backdrop";
import { CameraRig } from "./CameraRig";
import { Director } from "./Director";
import { Dust } from "./Dust";
import { Lights } from "./Lights";
import { Neon } from "./Neon";
import { StudioEnvironment } from "./StudioEnvironment";
import { sceneState } from "./state";
import { Workbench } from "./Workbench";

/** Só em desenvolvimento: expõe a cena para os scripts de comparação. */
function DevHandle() {
  const scene = useThree((state) => state.scene);
  const camera = useThree((state) => state.camera);
  useEffect(() => {
    const w = window as unknown as Record<string, unknown>;
    w.__scene = { scene, camera, state: sceneState, THREE };
    return () => {
      delete w.__scene;
    };
  }, [scene, camera]);
  return null;
}

export default function Scene() {
  const { fov, near, far } = visual.camera;
  const { fog } = visual;

  return (
    <Canvas
      dpr={[1, visual.renderer.maxPixelRatio]}
      camera={{ fov, near, far }}
      gl={{ antialias: true }}
      shadows="percentage"
      onCreated={({ gl }) => {
        gl.toneMappingExposure = visual.renderer.toneMappingExposure;
      }}
    >
      <fog attach="fog" args={[fog.color, fog.near, fog.far]} />
      <Director />
      <CameraRig />
      <StudioEnvironment>
        <Backdrop />
        <Lights />
        <Neon />
        <Workbench />
        <Arm />
        <Dust />
      </StudioEnvironment>
      {process.env.NODE_ENV === "development" && <DevHandle />}
    </Canvas>
  );
}
