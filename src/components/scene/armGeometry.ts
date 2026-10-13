import { visual } from "@/config/visual";

// Geometria do braço: um segmento de cilindro deitado ao longo do eixo X, com
// o topo da pele em y = 0. As coordenadas do desenho são (ao longo do braço,
// em volta do braço), em unidades da cena, com (0, 0) no topo do braço.

const { radius, length, span, textureWidth, tattoo, drawArea } = visual.arm;

export const ARM_RADIUS = radius;
export const ARM_LENGTH = length;
export const ARM_THETA_START = Math.PI / 2 - span / 2;
export const ARM_SPAN = span;
export const SKIN_SIZE = [textureWidth, Math.round((textureWidth * length) / (radius * span))] as const;

/** Faixa da pele que recebe um canvas: a tatuagem ou a área livre de desenho. */
export interface Patch {
  /** Centro ao longo do braço. */
  center: number;
  length: number;
  thetaStart: number;
  thetaSpan: number;
  /** Tamanho do canvas, em pixels. */
  width: number;
  height: number;
}

function patch(center: number, patchLength: number, width: number): Patch {
  const thetaSpan = tattoo.span;
  return {
    center,
    length: patchLength,
    thetaStart: Math.PI / 2 - thetaSpan / 2,
    thetaSpan,
    width,
    height: Math.round((width * patchLength) / (radius * thetaSpan)),
  };
}

export const TATTOO_PATCH = patch(0, tattoo.length, tattoo.textureWidth);
export const DRAW_PATCH = patch(drawArea.center, drawArea.length, drawArea.textureWidth);

export interface SurfacePoint {
  x: number;
  y: number;
  z: number;
  /** Pixel no canvas da faixa. */
  u: number;
  v: number;
}

/** Coordenadas do desenho → ponto 3D na pele e pixel no canvas da faixa. */
export function surfacePoint(along: number, around: number, out: SurfacePoint, area = TATTOO_PATCH) {
  const theta = Math.PI / 2 - around / radius;
  out.x = along;
  out.y = radius * Math.sin(theta) - radius;
  out.z = radius * Math.cos(theta);
  out.u = ((theta - area.thetaStart) / area.thetaSpan) * area.width;
  out.v = ((along - area.center + area.length / 2) / area.length) * area.height;
  return out;
}

/**
 * O inverso: ponto 3D na pele (vindo do raycast) → pixel no canvas da faixa.
 * Devolve null fora da faixa ou perto demais da borda (margens ao longo do
 * braço, em unidades da cena, e em volta dele, em radianos).
 */
export function pixelAt(
  point: { x: number; y: number; z: number },
  area: Patch,
  marginAlong = 0,
  marginAround = 0,
) {
  const theta = Math.atan2(point.y + radius, point.z);
  if (Math.abs(point.x - area.center) > area.length / 2 - marginAlong) return null;
  const from = area.thetaStart + marginAround;
  const to = area.thetaStart + area.thetaSpan - marginAround;
  if (theta < from || theta > to) return null;
  return {
    u: ((theta - area.thetaStart) / area.thetaSpan) * area.width,
    v: ((point.x - area.center + area.length / 2) / area.length) * area.height,
  };
}
