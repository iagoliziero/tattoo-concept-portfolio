"use client";

import { useFrame, useThree } from "@react-three/fiber";
import { useMemo, useRef } from "react";
import {
  AdditiveBlending,
  ConeGeometry,
  DoubleSide,
  Object3D,
  Vector3,
  type Mesh,
  type PointLight,
  type SpotLight,
} from "three";
import { visual } from "@/config/visual";
import { lightColor, perSection } from "./canvas";
import { sceneState } from "./state";

const offset = new Vector3(...visual.lights.key.offset);
const direction = new Vector3();

const beamVertex = /* glsl */ `
uniform float uLength;
varying float vT;
varying vec3 vN;
varying vec3 vV;
void main() {
  vT = position.z / uLength;
  vec4 mv = modelViewMatrix * vec4(position, 1.);
  vV = -mv.xyz;
  vN = normalMatrix * normal;
  gl_Position = projectionMatrix * mv;
}`;

const beamFragment = /* glsl */ `
uniform float uT;
uniform float uI;
varying float vT;
varying vec3 vN;
varying vec3 vV;
void main() {
  float e = abs(dot(normalize(vN), normalize(vV)));
  float a = pow(e, 2.) * (1. - vT) * smoothstep(0., .08, vT) * uI;
  a *= .85 + .15 * sin(uT * 1.3 + vT * 9.);
  gl_FragColor = vec4(vec3(1., .86, .7) * a, a);
}`;

/**
 * Spot quente seguindo o foco da câmera (com o feixe volumétrico), recorte
 * vermelho, ambiente fraco, luz fraca seguindo o mouse e a luz do neon.
 */
export function Lights() {
  const { ambient, key, rim, mouse, neon } = visual.lights;
  const camera = useThree((state) => state.camera);
  const keyLight = useRef<SpotLight>(null);
  const mouseLight = useRef<PointLight>(null);
  const neonLight = useRef<PointLight>(null);
  const beam = useRef<Mesh>(null);
  const target = useMemo(() => new Object3D(), []);

  const beamGeometry = useMemo(() => {
    const { length, radiusRatio } = visual.beam;
    const geometry = new ConeGeometry(length * radiusRatio, length, 48, 1, true);
    geometry.translate(0, -length / 2, 0);
    geometry.rotateX(-Math.PI / 2);
    return geometry;
  }, []);
  const beamUniforms = useMemo(
    () => ({
      uT: { value: 0 },
      uI: { value: visual.beam.intensity },
      uLength: { value: visual.beam.length },
    }),
    [],
  );

  useFrame(() => {
    target.position.copy(sceneState.focus);
    target.updateMatrixWorld();
    keyLight.current?.position.copy(sceneState.focus).add(offset);
    if (beam.current && keyLight.current) {
      beam.current.position.copy(keyLight.current.position);
      beam.current.lookAt(target.position);
    }
    beamUniforms.uT.value = sceneState.time;

    if (mouseLight.current) {
      direction.set(sceneState.pointer.x, sceneState.pointer.y, 0.5).unproject(camera).sub(camera.position).normalize();
      mouseLight.current.position.copy(camera.position).addScaledVector(direction, mouse.reach);
      mouseLight.current.intensity = mouse.intensity * perSection(mouse.perSection, sceneState.p);
    }
    if (neonLight.current) neonLight.current.intensity = neon.intensity * sceneState.neon;
  });

  return (
    <>
      <ambientLight color={lightColor(ambient.color)} intensity={ambient.intensity} />
      <spotLight
        name="key"
        ref={keyLight}
        color={lightColor(key.color)}
        intensity={key.intensity}
        distance={key.distance}
        angle={key.angle}
        penumbra={key.penumbra}
        decay={key.decay}
        target={target}
        castShadow
        shadow-mapSize={[visual.renderer.shadowMapSize, visual.renderer.shadowMapSize]}
        shadow-bias={visual.renderer.shadowBias}
        shadow-normalBias={visual.renderer.shadowNormalBias}
        shadow-camera-near={visual.renderer.shadowNear}
        shadow-camera-far={visual.renderer.shadowFar}
      />
      <primitive object={target} />
      <directionalLight color={lightColor(rim.color)} intensity={rim.intensity} position={rim.position} />
      <pointLight
        ref={mouseLight}
        name="mouseLight"
        color={lightColor(mouse.color)}
        intensity={mouse.intensity}
        distance={mouse.distance}
        decay={mouse.decay}
      />
      <pointLight
        ref={neonLight}
        name="neonLight"
        color={lightColor(neon.color)}
        intensity={neon.intensity}
        distance={neon.distance}
        decay={neon.decay}
        position={neon.position}
      />
      <mesh ref={beam} name="beam" geometry={beamGeometry} frustumCulled={false}>
        <shaderMaterial
          uniforms={beamUniforms}
          vertexShader={beamVertex}
          fragmentShader={beamFragment}
          transparent
          depthWrite={false}
          blending={AdditiveBlending}
          side={DoubleSide}
        />
      </mesh>
    </>
  );
}
