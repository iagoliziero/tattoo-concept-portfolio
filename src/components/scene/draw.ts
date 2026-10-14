// Canvas 2D que funciona na página e dentro de um Web Worker (OffscreenCanvas).
// As texturas procedurais usam só isto, sem three.js, para poderem ser
// desenhadas fora da thread principal (ver sceneTextures.ts).

export type Canvas2D = HTMLCanvasElement | OffscreenCanvas;
export type Context2D = CanvasRenderingContext2D | OffscreenCanvasRenderingContext2D;
type Draw = (g: Context2D, w: number, h: number) => void;

export function context2d(canvas: Canvas2D): Context2D {
  // As duas classes têm getContext("2d"); o TypeScript só não junta as sobrecargas.
  return (canvas as HTMLCanvasElement).getContext("2d")!;
}

export function makeCanvas(width: number, height: number, draw?: Draw): Canvas2D {
  const canvas =
    typeof document === "undefined"
      ? new OffscreenCanvas(width, height)
      : Object.assign(document.createElement("canvas"), { width, height });
  if (draw) draw(context2d(canvas), width, height);
  return canvas;
}
