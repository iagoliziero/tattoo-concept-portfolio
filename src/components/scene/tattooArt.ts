import { visual } from "@/config/visual";

// A tatuagem como lista de traços, em coordenadas do desenho: (ao longo do
// braço, em volta do braço), em unidades da cena, com (0, 0) no topo do braço.
// Para trocar o desenho, basta outra função que devolva traços: um SVG pode
// ser convertido amostrando cada caminho em pontos e escalando para essa área
// (cerca de ±1 ao longo e ±1.4 em volta).

export type Point2 = readonly [number, number];
export type Stroke = Point2[];

const circle = (x: number, z: number, r: number, n: number, a0: number): Stroke => {
  const points: Stroke = [];
  for (let i = 0; i <= n; i++) {
    const t = a0 + (i / n) * Math.PI * 2;
    points.push([x + Math.cos(t) * r, z + Math.sin(t) * r]);
  }
  return points;
};

/** Serpente enrolada num punhal, a tatuagem do protótipo. */
export function serpentAndDagger(): Stroke[] {
  const strokes: Stroke[] = [];
  // Espinha da serpente e largura do corpo ao longo de s (0 = cabeça, 1 = cauda).
  const spine = (s: number): Point2 => [0.26 * Math.sin(s * Math.PI * 2.6 + 0.4) * (1 - 0.3 * s), -0.85 + s * 1.95];
  const width = (s: number) => 0.045 * (1 - 0.75 * s) + 0.006;

  // Cabeça, olho e língua bifurcada
  const [hx, head] = spine(0);
  const hz = head - 0.03;
  const outline: Stroke = [];
  for (let i = 0; i <= 24; i++) {
    const t = (i / 24) * Math.PI * 2;
    outline.push([hx + Math.cos(t) * 0.075, hz + Math.sin(t) * 0.095]);
  }
  strokes.push(outline);
  strokes.push(circle(hx + 0.028, hz - 0.03, 0.012, 8, 0));
  strokes.push([[hx, hz - 0.095], [hx, hz - 0.16], [hx - 0.025, hz - 0.19]]);
  strokes.push([[hx, hz - 0.16], [hx + 0.025, hz - 0.19]]);

  // Contorno do corpo
  const left: Stroke = [];
  const right: Stroke = [];
  for (let i = 5; i <= 100; i++) {
    const s = i / 100;
    const [ax, az] = spine(s);
    const [bx, bz] = spine(s + 0.01);
    const len = Math.hypot(bx - ax, bz - az);
    const w = width(s);
    left.push([ax - ((bz - az) / len) * w, az + ((bx - ax) / len) * w]);
    right.push([ax + ((bz - az) / len) * w, az - ((bx - ax) / len) * w]);
  }
  strokes.push(left.concat(right.reverse()));

  // Escamas
  for (let k = 1; k <= 7; k++) {
    const s = k / 8;
    const [ax, az] = spine(s);
    const [bx, bz] = spine(s + 0.01);
    const len = Math.hypot(bx - ax, bz - az);
    const tx = (bx - ax) / len;
    const tz = (bz - az) / len;
    const w = width(s) * 0.6;
    strokes.push([[ax - tz * w, az + tx * w], [ax + tx * w * 0.8, az + tz * w * 0.8], [ax + tz * w, az - tx * w]]);
  }

  // Punhal: lâmina, fio, guarda com remates, cabo com amarração e pomo
  strokes.push([[0, 1.2], [-0.1, -0.1], [0.1, -0.1], [0, 1.2]]);
  strokes.push([[0, 1.06], [0, -0.06]]);
  strokes.push([[-0.22, -0.16], [0.22, -0.16], [0.22, -0.1], [-0.22, -0.1], [-0.22, -0.16]]);
  strokes.push(circle(-0.255, -0.13, 0.035, 14, 0));
  strokes.push(circle(0.255, -0.13, 0.035, 14, Math.PI));
  strokes.push([[-0.045, -0.16], [-0.045, -0.6], [0.045, -0.6], [0.045, -0.16]]);
  for (const z of [-0.24, -0.34, -0.44, -0.54]) strokes.push([[-0.045, z], [0.045, z - 0.05]]);
  strokes.push(circle(0, -0.655, 0.055, 18, Math.PI / 2));

  return strokes;
}

/** Um trecho do percurso da agulha: traçando (draw) ou se deslocando entre traços. */
export interface Segment {
  a: Point2;
  b: Point2;
  draw: boolean;
  duration: number;
}

/** Percurso da agulha: do ponto de espera, cada traço em ordem, até o ponto final. */
export function sessionPath(strokes: Stroke[]) {
  const { start, end, speed, travel } = visual.session;
  const segments: Segment[] = [];
  const add = (a: Point2, b: Point2, draw: boolean) => {
    const length = Math.hypot(b[0] - a[0], b[1] - a[1]);
    const duration = draw ? Math.max(0.001, length / speed) : travel.base + length * travel.perUnit;
    segments.push({ a, b, draw, duration });
  };
  let previous: Point2 = start;
  for (const stroke of strokes) {
    add(previous, stroke[0], false);
    for (let i = 1; i < stroke.length; i++) add(stroke[i - 1], stroke[i], true);
    previous = stroke[stroke.length - 1];
  }
  add(previous, end, false);
  const total = segments.reduce((sum, s) => sum + s.duration, 0);
  return { segments, total };
}

/** O desenho e o percurso usados no site (fixos: calculados uma vez). */
export const TATTOO_STROKES = serpentAndDagger();
export const SESSION_PATH = sessionPath(TATTOO_STROKES);
