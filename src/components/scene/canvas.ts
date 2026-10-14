import { CanvasTexture, Color, LinearFilter, LinearSRGBColorSpace, RepeatWrapping, SRGBColorSpace } from "three";
import type { LightColor } from "@/config/visual";
import type { Canvas2D } from "./draw";

export { makeCanvas } from "./draw";

/**
 * Textura de canvas. `srgb` para cores; mapas de relevo ficam lineares.
 * `sharp` desliga os mipmaps: listras finas (como o fio das bobinas) continuam
 * visíveis de longe, ao custo de um leve serrilhado.
 */
export function canvasTexture(
  canvas: Canvas2D,
  { srgb = false, repeat, sharp = false }: { srgb?: boolean; repeat?: readonly [number, number]; sharp?: boolean } = {},
) {
  const texture = new CanvasTexture(canvas);
  if (srgb) texture.colorSpace = SRGBColorSpace;
  if (sharp) {
    texture.generateMipmaps = false;
    texture.minFilter = LinearFilter;
  }
  if (repeat) {
    texture.wrapS = texture.wrapT = RepeatWrapping;
    texture.repeat.set(...repeat);
  }
  texture.anisotropy = 8;
  return texture;
}

export function lightColor({ hex, space }: LightColor) {
  return new Color().setStyle(hex, space === "linear" ? LinearSRGBColorSpace : SRGBColorSpace);
}

export const smoothstep = (a: number, b: number, x: number) => {
  const t = Math.min(1, Math.max(0, (x - a) / (b - a)));
  return t * t * (3 - 2 * t);
};

/** Valor de uma lista por seção, interpolado na posição p. */
export function perSection(values: readonly number[], p: number) {
  const i = Math.min(values.length - 1, Math.max(0, Math.floor(p)));
  const j = Math.min(values.length - 1, i + 1);
  return values[i] + (values[j] - values[i]) * smoothstep(0, 1, p - i);
}
