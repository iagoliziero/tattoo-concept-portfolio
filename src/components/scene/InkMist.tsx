"use client";

import { useFrame, useThree } from "@react-three/fiber";
import { useEffect, useMemo } from "react";
import { BufferAttribute, BufferGeometry } from "three";
import { visual } from "@/config/visual";

// Gotículas de tinta que saltam da agulha com a máquina ligada.
const { capacity } = visual.droplets;
const positions = new Float32Array(capacity * 3);
const velocities = new Float32Array(capacity * 3);
const life = new Float32Array(capacity);
let next = 0;
let alive = 0;

export function emitDroplet(x: number, y: number, z: number) {
  const { spread, rise } = visual.droplets;
  const i = next;
  next = (next + 1) % capacity;
  const angle = Math.random() * Math.PI * 2;
  const speed = spread[0] + Math.random() * (spread[1] - spread[0]);
  positions.set([x, y, z], i * 3);
  velocities.set([Math.cos(angle) * speed, rise[0] + Math.random() * (rise[1] - rise[0]), Math.sin(angle) * speed], i * 3);
  if (life[i] <= 0) alive++;
  life[i] = 1;
}

const vertexShader = /* glsl */ `
attribute float aLife;
uniform float uSize;
varying float vLife;
void main() {
  vec4 mv = modelViewMatrix * vec4(position, 1.);
  gl_PointSize = uSize * aLife / -mv.z;
  gl_Position = projectionMatrix * mv;
  vLife = aLife;
}`;

const fragmentShader = /* glsl */ `
varying float vLife;
void main() {
  if (length(gl_PointCoord - .5) > .5) discard;
  gl_FragColor = vec4(.06, .045, .04, vLife * .9);
}`;

export function InkMist() {
  const dpr = useThree((state) => state.viewport.dpr);
  const geometry = useMemo(() => {
    const g = new BufferGeometry();
    g.setAttribute("position", new BufferAttribute(positions, 3));
    g.setAttribute("aLife", new BufferAttribute(life, 1));
    return g;
  }, []);
  const uniforms = useMemo(() => ({ uSize: { value: visual.droplets.size as number } }), []);
  useEffect(() => () => geometry.dispose(), [geometry]);

  useFrame((_, delta) => {
    uniforms.uSize.value = visual.droplets.size * dpr;
    if (alive === 0) return;
    const dt = Math.min(delta, 0.05);
    const { gravity, life: seconds } = visual.droplets;
    alive = 0;
    for (let i = 0; i < capacity; i++) {
      if (life[i] <= 0) continue;
      life[i] = Math.max(0, life[i] - dt / seconds);
      if (life[i] > 0) alive++;
      const o = i * 3;
      velocities[o + 1] -= gravity * dt;
      positions[o] += velocities[o] * dt;
      positions[o + 1] += velocities[o + 1] * dt;
      positions[o + 2] += velocities[o + 2] * dt;
    }
    geometry.attributes.position.needsUpdate = true;
    geometry.attributes.aLife.needsUpdate = true;
  });

  return (
    <points geometry={geometry} frustumCulled={false}>
      <shaderMaterial
        uniforms={uniforms}
        vertexShader={vertexShader}
        fragmentShader={fragmentShader}
        transparent
        depthWrite={false}
      />
    </points>
  );
}
