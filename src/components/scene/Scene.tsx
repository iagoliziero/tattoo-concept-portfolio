"use client";

import { Canvas, useThree } from "@react-three/fiber";
import { useEffect, useState } from "react";
import * as THREE from "three";
import { visual } from "@/config/visual";
import { setBuzz } from "@/lib/sound";
import { stage } from "@/lib/stage";
import { Arm } from "./Arm";
import { Backdrop } from "./Backdrop";
import { CameraRig } from "./CameraRig";
import { Director } from "./Director";
import { DrawInteraction } from "./DrawInteraction";
import { DrawSurface } from "./DrawSurface";
import { InkMist } from "./InkMist";
import { Dust } from "./Dust";
import { Lights } from "./Lights";
import { Machine } from "./Machine";
import { Neon } from "./Neon";
import { PostProcessing } from "./post/PostProcessing";
import { SessionDirector } from "./SessionDirector";
import { StudioEnvironment } from "./StudioEnvironment";
import { Tattoo } from "./Tattoo";
import { sceneState } from "./state";
import { Workbench } from "./Workbench";

/** Pausa a renderização (e o zumbido) com a aba oculta. */
function PauseWhenHidden() {
  const setFrameloop = useThree((state) => state.setFrameloop);
  useEffect(() => {
    const onChange = () => {
      setFrameloop(document.hidden ? "never" : "always");
      if (document.hidden) setBuzz(false);
    };
    document.addEventListener("visibilitychange", onChange);
    return () => document.removeEventListener("visibilitychange", onChange);
  }, [setFrameloop]);
  return null;
}

/** Celular e telas de toque: sem MSAA e bloom, menos partículas, sombras e resolução menores. */
function detectLightMode() {
  const light = matchMedia("(pointer: coarse)").matches || innerWidth < 768;
  sceneState.light = light;
  return light;
}

/** Só em desenvolvimento: expõe a cena para os scripts de comparação. */
function DevHandle() {
  const scene = useThree((state) => state.scene);
  const camera = useThree((state) => state.camera);
  useEffect(() => {
    const w = window as unknown as Record<string, unknown>;
    w.__scene = { scene, camera, state: sceneState, stage, THREE };
    return () => {
      delete w.__scene;
    };
  }, [scene, camera]);
  return null;
}

export default function Scene() {
  const { fov, near, far } = visual.camera;
  const [light] = useState(detectLightMode);
  const post = visual.post.enabled && !light;
  const { renderer, lightMode } = visual;
  const { fog } = visual;

  return (
    <Canvas
      dpr={[1, light ? lightMode.maxPixelRatio : renderer.maxPixelRatio]}
      camera={{ fov, near, far }}
      gl={{ antialias: true }}
      shadows="percentage"
      onCreated={({ gl }) => {
        gl.toneMappingExposure = visual.renderer.toneMappingExposure;
      }}
    >
      <fog attach="fog" args={[fog.color, fog.near, fog.far]} />
      <PauseWhenHidden />
      <Director />
      <DrawInteraction />
      <SessionDirector />
      <CameraRig />
      <StudioEnvironment>
        <Backdrop post={post} />
        <Lights post={post} shadowMapSize={light ? lightMode.shadowMapSize : renderer.shadowMapSize} />
        <Neon post={post} />
        <Workbench />
        <Arm />
        <Tattoo />
        <DrawSurface />
        <Machine />
        <InkMist />
        <Dust count={light ? lightMode.dust : visual.dust.count} />
      </StudioEnvironment>
      {post && <PostProcessing />}
      {process.env.NODE_ENV === "development" && <DevHandle />}
    </Canvas>
  );
}
