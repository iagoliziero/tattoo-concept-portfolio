import type { Canvas2D } from "./draw";
import { drawTattooLayers, TEXTURE_DRAWERS } from "./textureDrawers";

// Web Worker: desenha as texturas procedurais em OffscreenCanvas e devolve
// ImageBitmaps para a página, que fica livre enquanto isso (ver sceneTextures.ts).

const scope = self as unknown as {
  onmessage: (() => void) | null;
  postMessage(message: unknown, transfer: Transferable[]): void;
};

scope.onmessage = () => {
  const transfer: Transferable[] = [];
  const bitmap = (canvas: Canvas2D) => {
    const image = (canvas as OffscreenCanvas).transferToImageBitmap();
    transfer.push(image);
    return image;
  };
  const textures = Object.fromEntries(Object.entries(TEXTURE_DRAWERS).map(([name, draw]) => [name, bitmap(draw())]));
  const tattoo = Object.fromEntries(Object.entries(drawTattooLayers()).map(([name, layer]) => [name, bitmap(layer)]));
  scope.postMessage({ ...textures, tattoo }, transfer);
};
