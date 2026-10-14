import { visual } from "@/config/visual";
import { makeCanvas } from "./draw";

// Texturas da máquina desenhadas em canvas, e o contorno do quadro que elas
// acompanham. Sem three.js, para poderem ser desenhadas num Web Worker.

/** Contorno do quadro: M/L = ponto (x, y), Q = curva quadrática (controle, ponto). */
export const FRAME_OUTLINE = [
  ["M", -0.14, 2.14],
  ["L", 0.14, 2.14],
  ["L", 0.14, 2.3],
  ["L", 1.3, 2.3],
  ["Q", 1.48, 2.3, 1.48, 2.48],
  ["L", 1.48, 3.34],
  ["Q", 1.48, 3.52, 1.3, 3.52],
  ["L", 0.68, 3.52],
  ["Q", 0.52, 3.52, 0.52, 3.44],
  ["Q", 0.52, 3.36, 0.62, 3.36],
  ["L", 1.24, 3.36],
  ["Q", 1.32, 3.36, 1.32, 3.28],
  ["L", 1.32, 2.54],
  ["Q", 1.32, 2.46, 1.24, 2.46],
  ["L", 0, 2.46],
  ["Q", -0.14, 2.46, -0.14, 2.32],
] as const;

/** A textura da gravação usa repeat .6 e offset (.1, -.25) sobre as UVs do Shape. */
export const ENGRAVING_REPEAT = [0.6, 0.6] as const;
export const ENGRAVING_OFFSET = [0.1, -0.25] as const;
const toCanvas = (x: number, y: number) => [(x * 0.6 + 0.1) * 1024, (1 - (y * 0.6 - 1.25)) * 1024] as const;

export function coilCanvas() {
  return makeCanvas(64, 512, (g, w, h) => {
    g.fillStyle = "#6e3a14";
    g.fillRect(0, 0, w, h);
    for (let y = 0; y < h; y += 4) {
      g.fillStyle = "#d68a48";
      g.fillRect(0, y, w, 2.4);
      g.fillStyle = "rgba(255,220,180,.35)";
      g.fillRect(0, y + 0.6, w, 0.7);
    }
  });
}

export function knurlCanvas() {
  return makeCanvas(128, 128, (g, w, h) => {
    g.fillStyle = "#8a8a8a";
    g.fillRect(0, 0, w, h);
    g.strokeStyle = "#1e1e1e";
    g.lineWidth = 3;
    for (let i = -h; i < w + h; i += 9) {
      g.beginPath();
      g.moveTo(i, 0);
      g.lineTo(i + h, h);
      g.stroke();
      g.beginPath();
      g.moveTo(i + h, 0);
      g.lineTo(i, h);
      g.stroke();
    }
  });
}

/** Gravação dourada do quadro: filete no contorno, vinhas com espirais e rosetas. */
export function engravingCanvas() {
  const gold = visual.colors.gold;
  const base = visual.machine.engravingBase;
  return makeCanvas(1024, 1024, (g) => {
    g.fillStyle = base;
    g.fillRect(0, 0, 1024, 1024);
    const outline = () => {
      g.beginPath();
      for (const c of FRAME_OUTLINE) {
        if (c[0] === "Q") {
          const [ax, ay] = toCanvas(c[1], c[2]);
          const [bx, by] = toCanvas(c[3], c[4]);
          g.quadraticCurveTo(ax, ay, bx, by);
        } else {
          const [x, y] = toCanvas(c[1], c[2]);
          if (c[0] === "M") g.moveTo(x, y);
          else g.lineTo(x, y);
        }
      }
      g.closePath();
    };
    g.lineJoin = "round";
    outline();
    g.strokeStyle = gold;
    g.lineWidth = 40;
    g.stroke();
    outline();
    g.strokeStyle = base;
    g.lineWidth = 30;
    g.stroke();

    g.strokeStyle = gold;
    g.lineWidth = 3.2;
    g.lineCap = "round";
    const curl = (x: number, y: number, size: number, dir: number) => {
      g.beginPath();
      for (let i = 0; i <= 40; i++) {
        const t = i / 40;
        const a = dir * t * Math.PI * 2.3;
        const r = size * (1 - t * 0.85);
        const [px, py] = toCanvas(x + Math.cos(a) * r, y + Math.sin(a) * r);
        if (i) g.lineTo(px, py);
        else g.moveTo(px, py);
      }
      g.stroke();
    };
    const vine = (x0: number, y0: number, x1: number, y1: number, amp: number, n: number) => {
      const dx = x1 - x0;
      const dy = y1 - y0;
      const len = Math.hypot(dx, dy);
      const nx = -dy / len;
      const ny = dx / len;
      g.beginPath();
      for (let i = 0; i <= 200; i++) {
        const t = i / 200;
        const w = Math.sin(t * n * Math.PI) * amp;
        const [px, py] = toCanvas(x0 + dx * t + nx * w, y0 + dy * t + ny * w);
        if (i) g.lineTo(px, py);
        else g.moveTo(px, py);
      }
      g.stroke();
      for (let k = 0; k < n; k++) {
        const t = (k + 0.5) / n;
        const side = k % 2 ? -1 : 1;
        curl(x0 + dx * t + nx * amp * side * 1.7, y0 + dy * t + ny * amp * side * 1.7, amp * 0.85, side);
      }
    };
    vine(0.2, 2.38, 1.18, 2.38, 0.022, 8);
    vine(1.4, 2.58, 1.4, 3.26, 0.022, 6);
    vine(0.74, 3.44, 1.22, 3.44, 0.022, 4);
    const rose = (x: number, y: number) => {
      const [cx, cy] = toCanvas(x, y);
      g.beginPath();
      g.arc(cx, cy, 9, 0, Math.PI * 2);
      g.stroke();
      for (let k = 0; k < 6; k++) {
        const a = (k / 6) * Math.PI * 2;
        g.beginPath();
        g.ellipse(cx + Math.cos(a) * 16, cy + Math.sin(a) * 16, 7, 3.5, a, 0, Math.PI * 2);
        g.stroke();
      }
    };
    rose(1.4, 2.38);
    rose(1.4, 3.44);
  });
}
