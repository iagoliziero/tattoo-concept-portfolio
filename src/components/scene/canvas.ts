import { CanvasTexture, Color, LinearSRGBColorSpace, RepeatWrapping, SRGBColorSpace } from "three";
import type { LightColor } from "@/config/visual";

type Draw = (g: CanvasRenderingContext2D, w: number, h: number) => void;

export function makeCanvas(width: number, height: number, draw?: Draw) {
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  if (draw) draw(canvas.getContext("2d")!, width, height);
  return canvas;
}

/** Textura de canvas. `srgb` para cores; mapas de relevo ficam lineares. */
export function canvasTexture(
  canvas: HTMLCanvasElement,
  { srgb = false, repeat }: { srgb?: boolean; repeat?: readonly [number, number] } = {},
) {
  const texture = new CanvasTexture(canvas);
  if (srgb) texture.colorSpace = SRGBColorSpace;
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
