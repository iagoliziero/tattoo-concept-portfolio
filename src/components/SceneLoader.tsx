"use client";

import dynamic from "next/dynamic";
import styles from "./SceneLoader.module.css";

// A cena 3D só existe no navegador: o texto da página vem pronto do servidor.
const Scene = dynamic(() => import("./scene/Scene"), { ssr: false });

export function SceneLoader() {
  return (
    <div className={styles.stage} aria-hidden="true">
      <Scene />
    </div>
  );
}
