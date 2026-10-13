"use client";

import { useFrame, useThree } from "@react-three/fiber";
import { Euler, Quaternion, Vector3 } from "three";
import { visual, type Station } from "@/config/visual";
import { stage } from "@/lib/stage";
import { perSection, smoothstep } from "./canvas";
import { sceneState } from "./state";

interface Pose {
  camera: Vector3;
  target: Vector3;
  machine: Vector3;
  rotation: Quaternion;
}

const pose = (): Pose => ({
  camera: new Vector3(),
  target: new Vector3(),
  machine: new Vector3(),
  rotation: new Quaternion(),
});
const euler = new Euler();
const explodeLift = new Vector3(...visual.machine.explodeLift);
const from = pose();
const to = pose();
const projected = new Vector3();

/** Câmera e máquina de uma seção, como o st() do protótipo. */
function poseAt(index: number, time: number, out: Pose) {
  const station: Station = visual.stations[index];
  const bob = Math.sin(time * visual.bob.speed) * visual.bob.amplitude;

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
    const tip = sceneState.sessionTip;
    const zoom = sceneState.sessionZoom;
    const c = Math.cos(sceneState.sessionAngle);
    const s = Math.sin(sceneState.sessionAngle);
    out.camera.set(
      tip.x + (orbit[0] * c + orbit[1] * s) * zoom,
      tip.y + zoom,
      tip.z + (-orbit[0] * s + orbit[1] * c) * zoom,
    );
    out.target.copy(tip).add(projected.fromArray(targetOffset));
    out.machine.copy(tip);
    out.machine.y += sceneState.sessionLift;
    out.rotation.setFromEuler(euler.set(...visual.session.tilt, "XYZ"));
  } else {
    out.camera.fromArray(station.camera);
    out.target.fromArray(station.target);
    out.machine.copy(sceneState.drawTip);
    out.machine.y += sceneState.drawLift;
    out.rotation.setFromEuler(euler.set(...visual.draw.tilt, "XYZ"));
  }
}

/** Interpola câmera e máquina (posição em smoothstep, rotação em slerp) entre as seções vizinhas de p. */
export function CameraRig() {
  const camera = useThree((state) => state.camera);

  useFrame(() => {
    const last = visual.stations.length - 1;
    const p = Math.min(last, Math.max(0, sceneState.p));
    const i = Math.min(last - 1, Math.floor(p));
    const f = smoothstep(0, 1, p - i);
    poseAt(i, sceneState.time, from);
    poseAt(i + 1, sceneState.time, to);

    camera.position.lerpVectors(from.camera, to.camera, f);
    sceneState.focus.lerpVectors(from.target, to.target, f);
    camera.lookAt(sceneState.focus);
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
