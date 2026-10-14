"use client";

import { useFrame, useThree } from "@react-three/fiber";
import { Euler, Quaternion, Vector2, Vector3, type PerspectiveCamera } from "three";
import { visual, type Station } from "@/config/visual";
import { stage } from "@/lib/stage";
import { perSection, smoothstep } from "./canvas";
import { sceneState } from "./state";

interface Pose {
  camera: Vector3;
  target: Vector3;
  machine: Vector3;
  rotation: Quaternion;
  /** Deslocamento do assunto em retrato (painel embaixo): esquerda e cima, em frações da tela. */
  portraitShift: Vector2;
}

const pose = (): Pose => ({
  camera: new Vector3(),
  target: new Vector3(),
  machine: new Vector3(),
  rotation: new Quaternion(),
  portraitShift: new Vector2(),
});
const screenUp = new Vector3();
const screenRight = new Vector3();
const shift = new Vector2();
const euler = new Euler();
const explodeLift = new Vector3(...visual.machine.explodeLift);
const from = pose();
const to = pose();
const projected = new Vector3();

/** Câmera e máquina de uma seção, como o st() do protótipo. */
function poseAt(index: number, time: number, out: Pose) {
  const station: Station = visual.stations[index];
  const bob = Math.sin(time * visual.bob.speed) * visual.bob.amplitude;
  out.portraitShift.set(0, 0);
  if (station.kind !== "session" && station.portraitShift) out.portraitShift.fromArray(station.portraitShift);

  if (station.kind === "fixed") {
    out.camera.fromArray(station.camera);
    out.target.fromArray(station.target);
    out.machine.fromArray(station.machine);
    out.machine.y += bob;
    const { tilt, spin, follow = [0, 0] } = station.rotation;
    const spinFactor = stage.reducedMotion ? visual.machine.reducedSpin : 1;
    const { mouse } = sceneState;
    euler.set(tilt[0] + follow[0] * mouse.y, tilt[1] + spin * time * spinFactor + follow[1] * mouse.x, tilt[2], "ZXY");
    out.rotation.setFromEuler(euler);
  } else if (station.kind === "session") {
    const { orbit, targetOffset } = visual.session;
    const tip = sceneState.sessionFocus;
    const zoom = sceneState.sessionZoom;
    const c = Math.cos(sceneState.sessionAngle);
    const s = Math.sin(sceneState.sessionAngle);
    out.camera.set(
      tip.x + (orbit[0] * c + orbit[1] * s) * zoom,
      tip.y + zoom,
      tip.z + (-orbit[0] * s + orbit[1] * c) * zoom,
    );
    out.target.copy(tip).add(projected.fromArray(targetOffset));
    out.machine.copy(sceneState.sessionTip);
    out.machine.y += sceneState.sessionLift;
    out.rotation.setFromEuler(euler.set(...visual.session.tilt, "XYZ"));
  }
}

/** Interpola câmera e máquina (posição em smoothstep, rotação em slerp) entre as seções vizinhas de p. */
export function CameraRig() {
  const camera = useThree((state) => state.camera) as PerspectiveCamera;
  const size = useThree((state) => state.size);

  useFrame(() => {
    // Em telas mais estreitas que a de referência (retrato), abre o campo de
    // visão para manter a largura da cena, até o limite da config.
    const { referenceAspect, max } = visual.responsiveFov;
    const aspect = size.width / size.height;
    const base = visual.camera.fov;
    const fov =
      aspect >= referenceAspect
        ? base
        : Math.min(max, (2 * Math.atan((Math.tan((base * Math.PI) / 360) * referenceAspect) / aspect) * 180) / Math.PI);
    if (Math.abs(camera.fov - fov) > 0.01) {
      camera.fov = fov;
      camera.updateProjectionMatrix();
    }

    const last = visual.stations.length - 1;
    const p = Math.min(last, Math.max(0, sceneState.p));
    const i = Math.min(last - 1, Math.floor(p));
    const f = smoothstep(0, 1, p - i);
    poseAt(i, sceneState.time, from);
    poseAt(i + 1, sceneState.time, to);

    camera.position.lerpVectors(from.camera, to.camera, f);
    if (sceneState.machineOn && !stage.reducedMotion) {
      const tremor = visual.vibration.cameraTremor;
      camera.position.x += (Math.random() - 0.5) * tremor;
      camera.position.y += (Math.random() - 0.5) * tremor;
    }
    sceneState.focus.lerpVectors(from.target, to.target, f);
    camera.lookAt(sceneState.focus);
    // Retrato: move câmera e alvo juntos (para a direita e para baixo) e o
    // assunto vai para a esquerda e para cima na tela, longe do painel.
    shift.lerpVectors(from.portraitShift, to.portraitShift, f);
    if (aspect < 1 && (shift.x !== 0 || shift.y !== 0)) {
      const height = 2 * camera.position.distanceTo(sceneState.focus) * Math.tan((camera.fov * Math.PI) / 360);
      screenRight.set(1, 0, 0).applyQuaternion(camera.quaternion).multiplyScalar(shift.x * height * aspect);
      screenUp.set(0, 1, 0).applyQuaternion(camera.quaternion).multiplyScalar(-shift.y * height);
      camera.position.add(screenRight).add(screenUp);
      sceneState.focus.add(screenRight).add(screenUp);
    }
    camera.updateMatrixWorld();
    sceneState.machine.lerpVectors(from.machine, to.machine, f);
    sceneState.machineQuat.slerpQuaternions(from.rotation, to.rotation, f);
    sceneState.explode = perSection(visual.machine.explodeBySection, p);
    sceneState.machine.addScaledVector(explodeLift, sceneState.explode);

    projected.copy(sceneState.machine).project(camera);
    sceneState.machineScreen.set(projected.x * 0.5 + 0.5, projected.y * 0.5 + 0.5);
  }, -1);

  return null;
}
