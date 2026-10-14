import { visual } from "@/config/visual";
import { context2d, makeCanvas, type Canvas2D } from "./draw";

// Texturas procedurais, portadas do protótipo. Sem three.js: as maiores são
// desenhadas num Web Worker (ver sceneTextures.ts).

const rand = Math.random;

/** Pele: manchas, veias sutis, poros, sardas e bordas transparentes. */
export function skinCanvas(width: number, height: number) {
  return makeCanvas(width, height, (g, w, h) => {
    g.fillStyle = visual.arm.skin;
    g.fillRect(0, 0, w, h);
    for (let i = 0; i < 40; i++) {
      const x = rand() * w;
      const y = rand() * h;
      const r = 50 + rand() * 120;
      const gr = g.createRadialGradient(x, y, 0, x, y, r);
      gr.addColorStop(0, rand() < 0.5 ? "rgba(185,100,80,.13)" : "rgba(238,196,164,.11)");
      gr.addColorStop(1, "rgba(0,0,0,0)");
      g.fillStyle = gr;
      g.fillRect(x - r, y - r, 2 * r, 2 * r);
    }
    g.lineCap = "round";
    for (let k = 0; k < 3; k++) {
      g.strokeStyle = "rgba(80,95,130,.07)";
      g.lineWidth = 5 + rand() * 4;
      g.beginPath();
      let x = w * (0.3 + rand() * 0.4);
      g.moveTo(x, 0);
      for (let y = 0; y <= h; y += 40) {
        x += (rand() - 0.5) * 30;
        g.lineTo(x, y);
      }
      g.stroke();
    }
    for (let i = 0; i < 9000; i++) {
      g.fillStyle = rand() < 0.5 ? "rgba(140,85,62,.12)" : "rgba(240,198,168,.09)";
      g.fillRect(rand() * w, rand() * h, 1.5, 1.5);
    }
    for (let i = 0; i < 50; i++) {
      g.fillStyle = "rgba(115,64,44,.22)";
      g.beginPath();
      g.arc(rand() * w, rand() * h, 1 + rand() * 1.6, 0, Math.PI * 2);
      g.fill();
    }
    g.globalCompositeOperation = "destination-in";
    for (const [dx, dy, edge] of [
      [w, 0, 0.18],
      [0, h, 0.12],
    ]) {
      const lg = g.createLinearGradient(0, 0, dx, dy);
      lg.addColorStop(0, "rgba(0,0,0,0)");
      lg.addColorStop(edge, "rgba(0,0,0,1)");
      lg.addColorStop(1 - edge, "rgba(0,0,0,1)");
      lg.addColorStop(1, "rgba(0,0,0,0)");
      g.fillStyle = lg;
      g.fillRect(0, 0, w, h);
    }
  });
}

/** Relevo da pele: poros e microlinhas. */
export function skinBumpCanvas(width: number, height: number) {
  return makeCanvas(width, height, (g, w, h) => {
    g.fillStyle = "#808080";
    g.fillRect(0, 0, w, h);
    for (let i = 0; i < 14000; i++) {
      g.fillStyle = rand() < 0.6 ? "rgba(40,40,40,.35)" : "rgba(200,200,200,.25)";
      g.fillRect(rand() * w, rand() * h, 1.2, 1.2);
    }
    g.strokeStyle = "rgba(60,60,60,.18)";
    g.lineWidth = 1;
    for (let i = 0; i < 260; i++) {
      const x = rand() * w;
      const y = rand() * h;
      const a = rand() * 0.6 - 0.3 + (rand() < 0.5 ? 0 : 1.57);
      g.beginPath();
      g.moveTo(x, y);
      g.lineTo(x + Math.cos(a) * 14, y + Math.sin(a) * 14);
      g.stroke();
    }
  });
}

/** Madeira escura envernizada da bancada. */
export function woodCanvas() {
  return makeCanvas(1024, 512, (g, w, h) => {
    g.fillStyle = "#1f1610";
    g.fillRect(0, 0, w, h);
    for (let i = 0; i < 180; i++) {
      const y = rand() * h;
      const amp = 4 + rand() * 10;
      const freq = 0.004 + rand() * 0.01;
      const phase = rand() * 6;
      g.strokeStyle = rand() < 0.5 ? "rgba(10,6,4,.35)" : "rgba(70,48,32,.25)";
      g.lineWidth = 0.6 + rand() * 2;
      g.beginPath();
      for (let x = 0; x <= w; x += 8) {
        const yy = y + Math.sin(x * freq + phase) * amp;
        if (x) g.lineTo(x, yy);
        else g.moveTo(x, yy);
      }
      g.stroke();
    }
  });
}

/** Rótulo dos frascos de tinta. */
export function bottleLabelCanvas(text: string) {
  return makeCanvas(256, 128, (g, w, h) => {
    g.fillStyle = visual.colors.text;
    g.fillRect(0, 0, w, h);
    g.fillStyle = visual.colors.redDark;
    g.fillRect(0, 10, w, 8);
    g.fillRect(0, h - 18, w, 8);
    g.fillStyle = "#1a1918";
    g.font = "bold 30px serif";
    g.textAlign = "center";
    g.fillText(text, w / 2, h / 2 + 10);
  });
}

/** Letreiro neon: letras em contorno com três camadas de brilho. */
export function drawNeon(canvas: Canvas2D, displayFamily: string, title: string, subtitle: string) {
  const g = context2d(canvas);
  const { width: w, height: h } = canvas;
  g.clearRect(0, 0, w, h);
  g.textAlign = "center";
  g.textBaseline = "middle";
  g.lineJoin = "round";
  const lines: [string, string, number][] = [
    [title, `150px ${displayFamily}`, 130],
    [subtitle, "300 38px sans-serif", 255],
  ];
  const glow: [number, string, number][] = [
    [14, "rgba(226,75,74,.35)", 40],
    [6, "rgba(255,120,110,.9)", 18],
    [2.2, "rgba(255,235,230,1)", 4],
  ];
  for (const [text, font, y] of lines) {
    g.font = font;
    for (const [lineWidth, color, blur] of glow) {
      g.lineWidth = lineWidth;
      g.strokeStyle = color;
      g.shadowColor = "rgba(226,75,74,1)";
      g.shadowBlur = blur;
      g.strokeText(text, w / 2, y);
    }
  }
}

/** Ponto suave para as partículas de poeira. */
export function dotCanvas() {
  return makeCanvas(32, 32, (g) => {
    const r = g.createRadialGradient(16, 16, 0, 16, 16, 16);
    r.addColorStop(0, "rgba(255,255,255,1)");
    r.addColorStop(1, "rgba(255,255,255,0)");
    g.fillStyle = r;
    g.fillRect(0, 0, 32, 32);
  });
}
