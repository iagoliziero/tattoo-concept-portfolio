"use client";

import { PerformanceMonitor } from "@react-three/drei";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { lazy, Suspense, use, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import * as THREE from "three";
import { visual } from "@/config/visual";
import { stage } from "@/lib/stage";
import { Arm } from "./Arm";
import { Backdrop } from "./Backdrop";
import { CameraRig } from "./CameraRig";
import { Director } from "./Director";
import { InkMist } from "./InkMist";
import { Dust } from "./Dust";
import { Lights } from "./Lights";
import { Machine } from "./Machine";
import { Neon } from "./Neon";
import { loadSceneTextures, SceneTexturesContext } from "./sceneTextures";
import { SessionDirector } from "./SessionDirector";
import { StudioEnvironment } from "./StudioEnvironment";
import { Tattoo } from "./Tattoo";
import { sceneState } from "./state";
import { Workbench } from "./Workbench";

// O pós-processamento só roda fora do modo leve: vem num chunk próprio, que o
// celular nunca baixa.
const PostProcessing = lazy(() => import("./post/PostProcessing").then((m) => ({ default: m.PostProcessing })));

// Enquanto os shaders compilam, a cena não desenha: um quadro antes da hora
// ficaria parado esperando a compilação (ver Warmup).
let warming = false;

/** Com movimento reduzido, a cena só desenha quando algo muda (ver RenderOnDemand). */
const runningLoop = () => (stage.reducedMotion ? "demand" : "always");

/** Pausa a renderização com a aba oculta (e não volta no meio da compilação). */
function PauseWhenHidden() {
  const setFrameloop = useThree((state) => state.setFrameloop);
  const invalidate = useThree((state) => state.invalidate);
  useEffect(() => {
    const onChange = () => {
      setFrameloop(document.hidden || warming ? "never" : runningLoop());
      if (!document.hidden) invalidate();
    };
    document.addEventListener("visibilitychange", onChange);
    return () => document.removeEventListener("visibilitychange", onChange);
  }, [setFrameloop, invalidate]);
  return null;
}

/**
 * Movimento reduzido: a cena é uma imagem parada que só muda quando a
 * pessoa rola, avança a cura ou a sessão anda. Desenha nessas horas e até
 * câmera, máquina e zoom assentarem; no resto do tempo, nenhum quadro.
 */
function RenderOnDemand() {
  const invalidate = useThree((state) => state.invalidate);
  const camera = useThree((state) => state.camera);
  const last = useMemo(() => ({ camera: new THREE.Vector3(), machine: new THREE.Vector3(), zoom: 0, power: 0 }), []);

  useEffect(() => stage.subscribe(() => invalidate()), [invalidate]);
  useFrame(() => {
    const moving =
      sceneState.machineOn ||
      last.camera.distanceToSquared(camera.position) > 1e-8 ||
      last.machine.distanceToSquared(sceneState.machine) > 1e-8 ||
      Math.abs(last.zoom - sceneState.sessionZoom) > 1e-5 ||
      Math.abs(last.power - sceneState.power) > 1e-4;
    last.camera.copy(camera.position);
    last.machine.copy(sceneState.machine);
    last.zoom = sceneState.sessionZoom;
    last.power = sceneState.power;
    if (moving) invalidate();
  });
  return null;
}

/** Celular e telas de toque: sem pós-processamento nem sombras dinâmicas, menos partículas. */
function detectLightMode() {
  const light = matchMedia(visual.lightMode.query).matches;
  sceneState.light = light;
  return light;
}

/** Avisa quando os primeiros quadros já foram desenhados (shaders compilados, texturas enviadas). */
function ReadySignal({ frames, onReady }: { frames: number; onReady: () => void }) {
  const drawn = useRef(0);
  const invalidate = useThree((state) => state.invalidate);
  // Desenhando sob demanda, a cena pode já ter parado quando este sinal monta.
  useEffect(() => invalidate(), [invalidate]);
  useFrame(() => {
    drawn.current += 1;
    if (drawn.current === frames) onReady();
    else if (drawn.current < frames) invalidate();
  });
  return null;
}

/**
 * Compila os shaders antes do primeiro quadro sem travar a página: com
 * KHR_parallel_shader_compile, o navegador compila em paralelo e a cena só
 * volta a desenhar quando todos estão prontos. Sem a extensão, o primeiro
 * quadro compila como antes. Depois, avisa quando a cena está na tela.
 */
function Warmup({ onReady }: { onReady: () => void }) {
  const gl = useThree((state) => state.gl);
  const scene = useThree((state) => state.scene);
  const camera = useThree((state) => state.camera);
  const setFrameloop = useThree((state) => state.setFrameloop);
  const invalidate = useThree((state) => state.invalidate);
  const [compiled, setCompiled] = useState(false);

  useLayoutEffect(() => {
    let active = true;
    warming = true;
    setFrameloop("never");
    gl.compileAsync(scene, camera).then(() => {
      if (!active) return;
      warming = false;
      if (!document.hidden) {
        setFrameloop(runningLoop());
        invalidate();
      }
      setCompiled(true);
    });
    return () => {
      active = false;
      warming = false;
    };
  }, [gl, scene, camera, setFrameloop, invalidate]);

  return compiled ? <ReadySignal frames={2} onReady={onReady} /> : null;
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

/** O estúdio, a pele e a máquina: esperam as texturas procedurais ficarem prontas. */
function StudioContents({ post, light }: { post: boolean; light: boolean }) {
  const textures = use(loadSceneTextures());
  const { renderer, lightMode } = visual;

  return (
    <SceneTexturesContext value={textures}>
      <Backdrop post={post} />
      <Lights post={post} shadowMapSize={renderer.shadowMapSize} />
      <Neon post={post} />
      <Workbench />
      <Arm />
      <Tattoo />
      <Machine />
      <InkMist />
      <Dust count={light ? lightMode.dust : visual.dust.count} />
    </SceneTexturesContext>
  );
}

// As texturas começam a ser desenhadas (num worker) assim que este chunk
// carrega, junto com a criação do canvas WebGL.
loadSceneTextures();

export default function Scene({ onReady }: { onReady: () => void }) {
  const { fov, near, far } = visual.camera;
  const [light] = useState(detectLightMode);
  const [reducedMotion] = useState(() => stage.reducedMotion);
  const post = visual.post.enabled && !light;
  const { renderer, fog } = visual;
  const [dpr, setDpr] = useState<number>(renderer.maxPixelRatio);

  return (
    <Canvas
      dpr={[renderer.minPixelRatio, dpr]}
      camera={{ fov, near, far }}
      gl={{ antialias: true }}
      // Sombras dinâmicas só fora do modo leve: no celular, cada material compila sem elas e não há o passe extra de sombra.
      shadows={light ? false : "percentage"}
      onCreated={({ gl }) => {
        gl.toneMappingExposure = visual.renderer.toneMappingExposure;
        // Ler o log de cada shader no primeiro uso trava a página (caro no
        // Direct3D, mesmo já compilado). Em desenvolvimento a checagem fica.
        gl.debug.checkShaderErrors = process.env.NODE_ENV === "development";
      }}
    >
      <fog attach="fog" args={[fog.color, fog.near, fog.far]} />
      <PauseWhenHidden />
      <Director />
      <SessionDirector />
      <CameraRig />
      {/*
        O mapa de ambiente é gerado já na criação do canvas, enquanto o worker
        desenha as texturas: quando o estúdio monta, os materiais nascem com
        ele e os shaders compilam uma vez só (Warmup). A cena só aparece com
        as texturas e o pós-processamento (se houver) prontos: nada troca de
        visual na frente de ninguém.
      */}
      <StudioEnvironment>
        <Suspense fallback={null}>
          <StudioContents post={post} light={light} />
          {post && <PostProcessing />}
          <Warmup onReady={onReady} />
          {reducedMotion ? (
            <RenderOnDemand />
          ) : (
            // Em aparelhos que não acompanham, a resolução desce até minPixelRatio.
            // (Desenhando só sob demanda, a taxa de quadros não diz nada.)
            <PerformanceMonitor
              flipflops={renderer.adaptiveFlipflops}
              onDecline={() => setDpr(renderer.minPixelRatio)}
              onIncline={() => setDpr(renderer.maxPixelRatio)}
              onFallback={() => setDpr(renderer.minPixelRatio)}
            />
          )}
        </Suspense>
      </StudioEnvironment>
      {process.env.NODE_ENV === "development" && <DevHandle />}
    </Canvas>
  );
}
