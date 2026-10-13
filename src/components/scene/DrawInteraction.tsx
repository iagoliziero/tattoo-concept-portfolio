"use client";

import { useFrame, useThree } from "@react-three/fiber";
import { useEffect, useRef } from "react";
import { Raycaster, Vector2, Vector3 } from "three";
import { visual } from "@/config/visual";
import { paint, type CanvasPoint } from "@/lib/drawing";
import { stage } from "@/lib/stage";
import { DRAW_PATCH, pixelAt } from "./armGeometry";
import { emitDroplet } from "./InkMist";
import { sceneState } from "./state";

interface Hit extends CanvasPoint {
  point: Vector3;
}

/**
 * "Tatue você mesmo": o raycast do cursor no braço move a agulha (com
 * suavização) e, com o botão pressionado, liga a máquina e pinta na área livre.
 */
export function DrawInteraction() {
  const camera = useThree((state) => state.camera);
  const scene = useThree((state) => state.scene);
  const gl = useThree((state) => state.gl);
  const target = useRef(new Vector3(...visual.draw.tip));
  const stroke = useRef<{ drawing: boolean; last: Hit | null }>({ drawing: false, last: null });
  const pending = useRef(0);

  useEffect(() => {
    const ray = new Raycaster();
    const ndc = new Vector2();
    const active = () => Math.abs(sceneState.p - 5) < visual.draw.activeWithin;
    const hit = (event: { clientX: number; clientY: number }): Hit | null => {
      const arm = scene.getObjectByName("arm");
      if (!arm) return null;
      const rect = gl.domElement.getBoundingClientRect();
      ndc.set(((event.clientX - rect.left) / rect.width) * 2 - 1, -((event.clientY - rect.top) / rect.height) * 2 + 1);
      ray.setFromCamera(ndc, camera);
      const found = ray.intersectObject(arm, false)[0];
      if (!found) return null;
      const { along, around } = visual.draw.margin;
      const pixel = pixelAt(found.point, DRAW_PATCH, along, around);
      return pixel && { point: found.point.clone(), ...pixel };
    };

    const onDown = (event: PointerEvent) => {
      const onScene = (event.target as Element | null)?.closest?.("[data-scene]");
      if (!active() || !onScene || event.button !== 0) return;
      const h = hit(event);
      if (!h) return;
      stroke.current = { drawing: true, last: h };
      target.current.copy(h.point);
      (event.target as Element).setPointerCapture?.(event.pointerId);
      paint(h, h);
    };
    const onMove = (event: PointerEvent) => {
      if (!active()) {
        stage.setCursorOnArm(false);
        return;
      }
      const h = hit(event);
      stage.setCursorOnArm(Boolean(h));
      if (!h) return;
      target.current.copy(h.point);
      const { drawing, last } = stroke.current;
      if (drawing && last) {
        paint(last, h);
        stroke.current.last = h;
      }
    };
    const onEnd = () => {
      stroke.current = { drawing: false, last: null };
    };

    // No toque, um gesto que começa sobre a área livre desenha em vez de rolar a página.
    const onTouchStart = (event: TouchEvent) => {
      const touch = event.touches[0];
      const onScene = (event.target as Element | null)?.closest?.("[data-scene]");
      if (event.touches.length === 1 && onScene && active() && hit(touch)) event.preventDefault();
    };

    window.addEventListener("touchstart", onTouchStart, { passive: false });
    window.addEventListener("pointerdown", onDown);
    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onEnd);
    window.addEventListener("pointercancel", onEnd);
    return () => {
      window.removeEventListener("touchstart", onTouchStart);
      window.removeEventListener("pointerdown", onDown);
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onEnd);
      window.removeEventListener("pointercancel", onEnd);
    };
  }, [camera, scene, gl]);

  useFrame((_, delta) => {
    const dt = Math.min(delta, 0.05);
    const { follow, liftFollow, lift } = visual.draw;
    const { drawing } = stroke.current;
    sceneState.drawTip.lerp(target.current, 1 - Math.exp(-dt * follow));
    sceneState.drawLift += ((drawing ? 0 : lift) - sceneState.drawLift) * (1 - Math.exp(-dt * liftFollow));
    sceneState.drawing = drawing;

    if (drawing && !stage.reducedMotion) {
      pending.current += (sceneState.light ? visual.lightMode.droplets : visual.droplets.rate) * dt;
      while (pending.current >= 1) {
        pending.current -= 1;
        const tip = sceneState.drawTip;
        emitDroplet(tip.x, tip.y, tip.z);
      }
    }
  }, -1.6);

  return null;
}
