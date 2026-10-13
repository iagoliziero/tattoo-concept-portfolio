"use client";

import { useThree } from "@react-three/fiber";
import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import {
  Color,
  DoubleSide,
  Mesh,
  MeshBasicMaterial,
  PlaneGeometry,
  PMREMGenerator,
  Scene,
  type Texture,
} from "three";
import { visual } from "@/config/visual";

const EnvironmentContext = createContext<Texture | null>(null);

/**
 * O mapa de ambiente, para materiais com envMapIntensity diferente de 1. No
 * three atual essa intensidade só vale quando o material tem envMap próprio;
 * com scene.environment vale a intensidade da cena (no r128 valiam as duas).
 */
export function useStudioEnvironment() {
  return useContext(EnvironmentContext);
}

/**
 * Reflexos dos metais: um estúdio simples (softbox branco em cima, faixa
 * vermelha à esquerda, faixa quente à direita) convertido em mapa de ambiente.
 */
export function StudioEnvironment({ children }: { children: ReactNode }) {
  const gl = useThree((state) => state.gl);
  const scene = useThree((state) => state.scene);
  const [environment, setEnvironment] = useState<Texture | null>(null);

  useEffect(() => {
    const { fill, blur, panels } = visual.environment;
    const studio = new Scene();
    studio.background = new Color().setRGB(fill[0], fill[1], fill[2]);
    for (const { size, rgb, position } of panels) {
      const mesh = new Mesh(new PlaneGeometry(size[0], size[1]), new MeshBasicMaterial({ side: DoubleSide }));
      mesh.material.color.setRGB(rgb[0], rgb[1], rgb[2]);
      mesh.position.fromArray(position);
      mesh.lookAt(0, 0, 0);
      studio.add(mesh);
    }

    const pmrem = new PMREMGenerator(gl);
    const target = pmrem.fromScene(studio, blur);
    pmrem.dispose();
    studio.traverse((object) => {
      if (object instanceof Mesh) {
        object.geometry.dispose();
        object.material.dispose();
      }
    });
    scene.environment = target.texture;
    setEnvironment(target.texture);

    return () => {
      scene.environment = null;
      setEnvironment(null);
      target.dispose();
    };
  }, [gl, scene]);

  return <EnvironmentContext value={environment}>{children}</EnvironmentContext>;
}
