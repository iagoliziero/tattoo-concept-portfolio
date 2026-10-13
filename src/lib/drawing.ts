import { visual } from "@/config/visual";
import { DRAW_PATCH } from "@/components/scene/armGeometry";
import { stage } from "./stage";

// O desenho do visitante na área livre do braço. Fica fora da cena 3D porque
// o formulário também precisa dele (miniatura e anexo do pedido).

export interface CanvasPoint {
  u: number;
  v: number;
}

let canvas: HTMLCanvasElement | null = null;
let version = 0;

export function drawingCanvas() {
  if (!canvas) {
    canvas = document.createElement("canvas");
    canvas.width = DRAW_PATCH.width;
    canvas.height = DRAW_PATCH.height;
  }
  return canvas;
}

/** Muda a cada pincelada ou limpeza; a cena reenvia a textura quando muda. */
export function drawingVersion() {
  return version;
}

/** Pinta de a até b com a ferramenta escolhida (Traço ou Sombra). */
export function paint(a: CanvasPoint, b: CanvasPoint) {
  const g = drawingCanvas().getContext("2d")!;
  const { line, halo, shade } = visual.draw;
  if (stage.drawTool === "line") {
    g.lineCap = "round";
    g.strokeStyle = halo.color;
    g.lineWidth = halo.width;
    g.beginPath();
    g.moveTo(a.u, a.v);
    g.lineTo(b.u, b.v);
    g.stroke();
    g.strokeStyle = line.color;
    g.lineWidth = line.width;
    g.beginPath();
    g.moveTo(a.u, a.v);
    g.lineTo(b.u, b.v);
    g.stroke();
  } else {
    const steps = Math.max(1, Math.hypot(b.u - a.u, b.v - a.v) / shade.spacing);
    const transparent = shade.color.replace(/[\d.]+\)$/, "0)");
    for (let i = 0; i < steps; i++) {
      const x = a.u + ((b.u - a.u) * i) / steps;
      const y = a.v + ((b.v - a.v) * i) / steps;
      const r = shade.radius;
      const gradient = g.createRadialGradient(x, y, 0, x, y, r);
      gradient.addColorStop(0, shade.color);
      gradient.addColorStop(1, transparent);
      g.fillStyle = gradient;
      g.fillRect(x - r, y - r, 2 * r, 2 * r);
    }
  }
  version++;
  stage.setHasDrawing(true);
}

export function clearDrawing() {
  const c = drawingCanvas();
  c.getContext("2d")!.clearRect(0, 0, c.width, c.height);
  version++;
  stage.setHasDrawing(false);
}

/** O desenho como PNG, para anexar ao pedido; null se não há desenho. */
export function drawingBlob(): Promise<Blob | null> {
  if (!stage.hasDrawing) return Promise.resolve(null);
  return new Promise((resolve) => drawingCanvas().toBlob(resolve, "image/png"));
}

export function drawingDataUrl() {
  return stage.hasDrawing ? drawingCanvas().toDataURL("image/png") : null;
}
