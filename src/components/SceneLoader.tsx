"use client";

import dynamic from "next/dynamic";
import { getImageProps } from "next/image";
import { Component, useEffect, useState, type CSSProperties, type ReactNode } from "react";
import { visual } from "@/config/visual";
import styles from "./SceneLoader.module.css";

// A cena 3D só existe no navegador: o texto da página vem pronto do servidor.
const Scene = dynamic(() => import("./scene/Scene"), { ssr: false });

// Qualquer um destes mostra que alguém está usando a página: a cena começa a carregar.
const WAKE_EVENTS = ["pointerdown", "pointermove", "touchstart", "wheel", "keydown", "scroll"] as const;

// Estúdio em imagem enquanto a cena não chega: uma para o modo leve (celular),
// que não tem pós-processamento, e outra para telas grandes.
const { autoStart, fade, placeholder, minDeviceMemory } = visual.sceneEntry;
// Uma <img> só (o <picture> escolhe o arquivo): carrega já, com prioridade alta.
const common = {
  alt: "",
  sizes: "100vw",
  quality: placeholder.quality,
  loading: "eager",
  fetchPriority: "high",
} as const;
const {
  props: { srcSet: mobileSrcSet },
} = getImageProps({ ...common, ...placeholder.mobile });
const { props: desktopImage } = getImageProps({ ...common, ...placeholder.desktop });

/**
 * Sem WebGL2 (o three.js atual exige) ou com memória muito baixa, a página
 * fica com a imagem do estúdio: o conteúdo é todo HTML e não depende da cena.
 */
function canRunScene() {
  const memory = (navigator as Navigator & { deviceMemory?: number }).deviceMemory;
  if (memory !== undefined && memory < minDeviceMemory) return false;
  return typeof WebGL2RenderingContext !== "undefined";
}

/** Na primeira interação ou, sem ela, depois que a página carregou e ficou ociosa. */
function useWake() {
  const [awake, setAwake] = useState(false);
  useEffect(() => {
    if (awake || !canRunScene()) return;
    const wake = () => setAwake(true);
    const options = { passive: true, capture: true } as const;
    for (const type of WAKE_EVENTS) window.addEventListener(type, wake, options);
    let timer = 0;
    let idle = 0;
    const later = () => {
      timer = window.setTimeout(() => {
        if ("requestIdleCallback" in window) idle = requestIdleCallback(wake, { timeout: 1000 });
        else wake();
      }, autoStart);
    };
    if (document.readyState === "complete") later();
    else window.addEventListener("load", later, { once: true });
    return () => {
      for (const type of WAKE_EVENTS) window.removeEventListener(type, wake, options);
      window.removeEventListener("load", later);
      clearTimeout(timer);
      if (idle) cancelIdleCallback(idle);
    };
  }, [awake]);
  return awake;
}

/** Se a cena falhar (contexto WebGL recusado, GPU bloqueada), só ela some: a imagem e a página ficam. */
class SceneBoundary extends Component<{ children: ReactNode }, { failed: boolean }> {
  state = { failed: false };

  static getDerivedStateFromError() {
    return { failed: true };
  }

  componentDidCatch(error: unknown) {
    console.warn("Cena 3D desligada; fica a imagem do estúdio.", error);
  }

  render() {
    return this.state.failed ? null : this.props.children;
  }
}

/**
 * Palco da cena 3D, fixo atrás da página. Abre com a imagem do estúdio; a cena
 * carrega depois (ver visual.sceneEntry) e, com o primeiro quadro pronto,
 * aparece por cima dela. Nada muda de lugar na troca.
 */
export function SceneLoader() {
  const awake = useWake();
  const [ready, setReady] = useState(false);

  return (
    <div
      className={styles.stage}
      aria-hidden="true"
      data-scene
      data-ready={ready}
      style={{ "--fade": `${fade}s` } as CSSProperties}
    >
      <picture>
        <source media={visual.lightMode.query} srcSet={mobileSrcSet} />
        <img {...desktopImage} alt="" className={styles.placeholder} />
      </picture>
      {awake && (
        <div className={styles.scene}>
          <SceneBoundary>
            <Scene onReady={() => setReady(true)} />
          </SceneBoundary>
        </div>
      )}
    </div>
  );
}
