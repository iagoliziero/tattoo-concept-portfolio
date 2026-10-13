"use client";

import { Bloom, EffectComposer, EffectGroup } from "@react-three/postprocessing";
import { BlendFunction } from "postprocessing";
import { useEffect, useMemo } from "react";
import { visual } from "@/config/visual";
import { FinishEffect, ToDisplayEffect } from "./FinishEffect";

/**
 * Cena com MSAA 4x -> tone mapping para a tela -> bloom -> passe final
 * (aberração, toque quente, contraste, vinheta, grão). Ver FinishEffect.ts.
 */
export function PostProcessing() {
  const { msaaSamples, bloom } = visual.post;
  const { toDisplay, finish } = useMemo(() => ({ toDisplay: new ToDisplayEffect(), finish: new FinishEffect() }), []);
  useEffect(
    () => () => {
      toDisplay.dispose();
      finish.dispose();
    },
    [toDisplay, finish],
  );

  return (
    <EffectComposer multisampling={msaaSamples}>
      <EffectGroup>
        <primitive object={toDisplay} />
      </EffectGroup>
      <EffectGroup>
        <Bloom
          mipmapBlur
          intensity={bloom.intensity}
          radius={bloom.radius}
          luminanceThreshold={bloom.threshold}
          luminanceSmoothing={bloom.smoothing}
          blendFunction={BlendFunction.ADD}
        />
        <primitive object={finish} />
      </EffectGroup>
    </EffectComposer>
  );
}
