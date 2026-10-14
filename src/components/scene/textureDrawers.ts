import { site } from "@/config/site";
import { SKIN_SIZE } from "./armGeometry";
import { coilCanvas, engravingCanvas, knurlCanvas } from "./machineTextures";
import { TATTOO_STROKES } from "./tattooArt";
import { tattooLayers } from "./tattooSurface";
import { bottleLabelCanvas, skinBumpCanvas, skinCanvas, woodCanvas } from "./textures";

// As texturas procedurais que a cena desenha antes de aparecer. Sem three.js
// nem DOM: rodam no Web Worker (textureWorker.ts) ou, sem ele, na página.

export const TEXTURE_DRAWERS = {
  skin: () => skinCanvas(...SKIN_SIZE),
  skinBump: () => skinBumpCanvas(...SKIN_SIZE),
  wood: woodCanvas,
  label: () => bottleLabelCanvas(site.scene.bottleLabel),
  coil: coilCanvas,
  knurl: knurlCanvas,
  engraving: engravingCanvas,
};

export type TextureName = keyof typeof TEXTURE_DRAWERS;

export const drawTattooLayers = () => tattooLayers(TATTOO_STROKES);
