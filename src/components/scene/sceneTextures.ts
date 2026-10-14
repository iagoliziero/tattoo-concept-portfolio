import { createContext, useContext } from "react";
import { makeCanvas, type Canvas2D } from "./draw";
import type { TattooLayers } from "./tattooSurface";
import { drawTattooLayers, TEXTURE_DRAWERS, type TextureName } from "./textureDrawers";

// As texturas procedurais da cena (pele, madeira, gravação da máquina, camadas
// da cicatrização...) são desenhadas num Web Worker com OffscreenCanvas: a cena
// entra na primeira interação, e a página não pode travar bem nessa hora. Sem
// worker, são desenhadas na página, uma por tarefa.

/** Texturas prontas: canvases da página e as camadas da cicatrização. */
export type SceneTextures = Record<TextureName, Canvas2D> & { tattoo: TattooLayers<CanvasImageSource> };
type Drawn = Record<TextureName, Canvas2D | ImageBitmap> & { tattoo: TattooLayers<CanvasImageSource> };

let request: Promise<SceneTextures> | null = null;

/** Começa a desenhar as texturas (uma vez só) e devolve a promessa. */
export function loadSceneTextures() {
  request ??= (
    canUseWorker()
      ? inWorker().catch((error: unknown) => {
          console.warn("Texturas da cena desenhadas na página: o worker falhou.", error);
          return onPage();
        })
      : onPage()
  ).then(toCanvases);
  return request;
}

export const SceneTexturesContext = createContext<SceneTextures | null>(null);

export function useSceneTextures() {
  const textures = useContext(SceneTexturesContext);
  if (!textures) throw new Error("useSceneTextures precisa estar dentro de SceneTexturesContext.");
  return textures;
}

function canUseWorker() {
  return (
    typeof Worker !== "undefined" &&
    typeof OffscreenCanvas !== "undefined" &&
    "transferToImageBitmap" in OffscreenCanvas.prototype
  );
}

function inWorker() {
  return new Promise<Drawn>((resolve, reject) => {
    const worker = new Worker(new URL("./textureWorker.ts", import.meta.url), { type: "module" });
    worker.onmessage = (event: MessageEvent<Drawn>) => {
      worker.terminate();
      resolve(event.data);
    };
    // Sem OffscreenCanvas 2D (Safari antigo) o worker falha: desenha na página.
    worker.onerror = (event) => {
      event.preventDefault();
      worker.terminate();
      reject(new Error(event.message));
    };
    worker.postMessage(null);
  });
}

const nextTask = () => new Promise((resolve) => setTimeout(resolve, 0));

/** Sem worker: uma textura por tarefa, para nenhuma travar a página por muito tempo. */
async function onPage(): Promise<Drawn> {
  const drawn: Partial<Drawn> = {};
  for (const name of Object.keys(TEXTURE_DRAWERS) as TextureName[]) {
    drawn[name] = TEXTURE_DRAWERS[name]();
    await nextTask();
  }
  drawn.tattoo = drawTattooLayers();
  return drawn as Drawn;
}

/**
 * Os ImageBitmaps do worker viram canvases da página: a textura sobe para a GPU
 * pelo mesmo caminho de antes (CanvasTexture), com as mesmas cores e
 * transparência. As camadas da cicatrização ficam como estão: só são
 * desenhadas por cima de outro canvas.
 */
function toCanvases({ tattoo, ...textures }: Drawn): SceneTextures {
  const isBitmap = (image: unknown): image is ImageBitmap =>
    typeof ImageBitmap !== "undefined" && image instanceof ImageBitmap;
  const canvases = Object.fromEntries(
    Object.entries(textures).map(([name, image]) => {
      if (!isBitmap(image)) return [name, image];
      const canvas = makeCanvas(image.width, image.height, (g) => g.drawImage(image, 0, 0));
      image.close();
      return [name, canvas];
    }),
  ) as Record<TextureName, Canvas2D>;
  return { ...canvases, tattoo };
}
