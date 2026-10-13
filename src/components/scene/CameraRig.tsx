"use client";

import { useFrame, useThree } from "@react-three/fiber";
import { Vector3 } from "three";
import { visual } from "@/config/visual";
import { smoothstep } from "./canvas";
import { sceneState } from "./state";

interface Pose {
  camera: Vector3;
  target: Vector3;
  machine: Vector3;
}

const pose = (): Pose => ({ camera: new Vector3(), target: new Vector3(), machine: new Vector3() });
const from = pose();
const to = pose();
const projected = new Vector3();

/** Câmera e máquina de uma seção, como o st() do protótipo. */
function poseAt(index: number, time: number, out: Pose) {
  const station = visual.stations[index];
  const bob = Math.sin(time * visual.bob.speed) * visual.bob.amplitude;

  if (station.kind === "fixed") {
    out.camera.fromArray(station.camera);
    out.target.fromArray(station.target);
    out.machine.fromArray(station.machine);
    out.machine.y += bob;
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
  } else {
    out.camera.fromArray(station.camera);
    out.target.fromArray(station.target);
    out.machine.copy(sceneState.drawTip);
    out.machine.y += sceneState.drawLift;
  }
}

/** Interpola câmera e máquina entre as duas seções vizinhas de p. */
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

    projected.copy(sceneState.machine).project(camera);
    sceneState.machineScreen.set(projected.x * 0.5 + 0.5, projected.y * 0.5 + 0.5);
  }, -1);

  return null;
}
