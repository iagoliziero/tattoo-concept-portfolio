"use client";

import { useFrame, useThree } from "@react-three/fiber";
import { useMemo } from "react";
import { Vector2 } from "three";
import { visual } from "@/config/visual";
import { smoothstep } from "./canvas";
import { toneMappingGlsl } from "./post/toneMapping";
import { sceneState } from "./state";

// Fundo em tela cheia: fumaça fbm com domain warping, brilho atrás da máquina,
// raios de luz do canto superior e vinheta. Shader do protótipo. As cores já
// estão no espaço da tela: sem pós-processamento saem direto; com ele, saem
// pelo tone mapping inverso, para o passe final devolver a mesma cor.

const vertexShader = /* glsl */ `
varying vec2 vUv;
void main() {
  vUv = uv;
  gl_Position = vec4(position.xy, 0., 1.);
}`;

const fragmentShader = /* glsl */ `
uniform float uT;
uniform vec2 uR;
uniform vec2 uO;
uniform vec2 uL;
uniform float uRed;
uniform float uPost;
varying vec2 vUv;
${toneMappingGlsl}
float h(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
float n(vec2 p) {
  vec2 i = floor(p), f = fract(p);
  f = f * f * (3. - 2. * f);
  return mix(mix(h(i), h(i + vec2(1., 0.)), f.x), mix(h(i + vec2(0., 1.)), h(i + vec2(1., 1.)), f.x), f.y);
}
float fbm(vec2 p) {
  float v = 0., a = .5;
  for (int i = 0; i < 5; i++) { v += a * n(p); p = p * 2.03 + vec2(1.7, 9.2); a *= .5; }
  return v;
}
void main() {
  vec2 asp = vec2(uR.x / uR.y, 1.);
  vec2 p = (vUv - .5) * asp * 2.2 + uO;
  float t = uT * .035;
  vec2 q = vec2(fbm(p + vec2(0., t)), fbm(p + vec2(5.2, 1.3) - t * .8));
  float s = fbm(p + 2.4 * q + vec2(t * .7, -t * 1.2));
  float w = smoothstep(.42, .92, s);
  vec3 c = vec3(.034, .029, .026);
  vec3 sm = mix(vec3(.13, .11, .095), vec3(.36, .07, .055), clamp(uRed * 1.4 * q.y, 0., 1.));
  c += sm * w * .75;
  float d = length((vUv - uL) * asp);
  c += vec3(.24, .16, .11) * exp(-d * d * 4.5) * (.5 + .6 * s);
  vec2 dv = vUv - vec2(.85, 1.25);
  float an = atan(dv.y, dv.x);
  float ry = pow(max(0., n(vec2(an * 24., t * 6.)) - .45), 1.5) * 1.6;
  c += vec3(.15, .11, .08) * ry * smoothstep(1.5, .3, length(dv * asp)) * .55;
  c *= 1. - .6 * pow(length((vUv - .5) * vec2(1.15, 1.35)), 2.4);
  if (uPost > .5) c = acesFilmicInverse(srgbToLinear(c));
  gl_FragColor = vec4(c, 1.);
}`;

export function Backdrop({ post }: { post: boolean }) {
  const size = useThree((state) => state.size);
  const uniforms = useMemo(
    () => ({
      uT: { value: 0 },
      uR: { value: new Vector2(1, 1) },
      uO: { value: new Vector2() },
      uL: { value: new Vector2(...visual.backdrop.glow) },
      uRed: { value: visual.backdrop.redBase as number },
      uPost: { value: post ? 1 : 0 },
    }),
    [post],
  );

  useFrame(() => {
    const { redBase, redAtEnd, redWhenOn, parallax } = visual.backdrop;
    const { mouse, p } = sceneState;
    uniforms.uT.value = sceneState.time;
    uniforms.uR.value.set(size.width, size.height);
    uniforms.uO.value.set(mouse.x * parallax.mouse + p * parallax.scroll, -mouse.y * parallax.mouse);
    uniforms.uL.value.copy(sceneState.machineScreen);
    uniforms.uRed.value = redBase + redAtEnd * smoothstep(3.5, 5, p) + redWhenOn * sceneState.power;
  });

  return (
    <mesh frustumCulled={false} renderOrder={-1000}>
      <planeGeometry args={[2, 2]} />
      <shaderMaterial
        uniforms={uniforms}
        vertexShader={vertexShader}
        fragmentShader={fragmentShader}
        depthTest={false}
        depthWrite={false}
      />
    </mesh>
  );
}
