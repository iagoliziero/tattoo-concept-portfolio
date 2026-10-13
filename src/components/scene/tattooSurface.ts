import { visual, type HealingLayers } from "@/config/visual";
import { surfacePoint, TATTOO_PATCH, type SurfacePoint } from "./armGeometry";
import { makeCanvas } from "./canvas";
import type { Stroke } from "./tattooArt";

// A tatuagem na pele: o desenho em tinta e as camadas da cicatrização,
// pré-calculadas a partir dele e compostas num canvas quando o dia muda.

const { width: W, height: H } = TATTOO_PATCH;
// Centro e raio da região inflamada, em pixels do canvas (protótipo).
const SWELL = { x: 386, y: 305, squash: 0.42, radius: 380 };

const supportsFilter =
  typeof CanvasRenderingContext2D !== "undefined" && "filter" in CanvasRenderingContext2D.prototype;

/** Desfoque; sem ctx.filter (Safari), aproxima reduzindo e ampliando a imagem. */
function blurred(source: HTMLCanvasElement, px: number) {
  if (supportsFilter) {
    return makeCanvas(W, H, (g) => {
      g.filter = `blur(${px}px)`;
      g.drawImage(source, 0, 0);
    });
  }
  const k = Math.max(1, px);
  const small = makeCanvas(Math.ceil(W / k), Math.ceil(H / k), (g, w, h) => {
    g.imageSmoothingQuality = "high";
    g.drawImage(source, 0, 0, w, h);
  });
  return makeCanvas(W, H, (g) => {
    g.imageSmoothingQuality = "high";
    g.drawImage(small, 0, 0, W, H);
  });
}

function tinted(source: HTMLCanvasElement, color: string) {
  return makeCanvas(W, H, (g) => {
    g.drawImage(source, 0, 0);
    g.globalCompositeOperation = "source-in";
    g.fillStyle = color;
    g.fillRect(0, 0, W, H);
  });
}

/** Mancha elíptica centrada na tatuagem (vermelhidão e máscara do brilho). */
function swellSpot(g: CanvasRenderingContext2D, inner: number, from: string, to: string) {
  g.save();
  g.translate(SWELL.x, SWELL.y);
  g.scale(1, SWELL.squash);
  const gradient = g.createRadialGradient(0, 0, inner, 0, 0, SWELL.radius);
  gradient.addColorStop(0, from);
  gradient.addColorStop(1, to);
  g.fillStyle = gradient;
  g.fillRect(-400, -400, 800, 800);
  g.restore();
}

/** Desenha os traços em tinta: halo avermelhado largo e linha escura com sombra curta. */
function inkCanvas(strokes: Stroke[]) {
  const { line, halo } = visual.tattoo;
  const a: SurfacePoint = { x: 0, y: 0, z: 0, u: 0, v: 0 };
  const b: SurfacePoint = { x: 0, y: 0, z: 0, u: 0, v: 0 };
  return makeCanvas(W, H, (g) => {
    g.lineCap = "round";
    g.lineJoin = "round";
    for (const stroke of strokes) {
      for (let i = 1; i < stroke.length; i++) {
        surfacePoint(stroke[i - 1][0], stroke[i - 1][1], a);
        surfacePoint(stroke[i][0], stroke[i][1], b);
        g.strokeStyle = halo.color;
        g.lineWidth = halo.width;
        g.beginPath();
        g.moveTo(a.u, a.v);
        g.lineTo(b.u, b.v);
        g.stroke();
        g.shadowColor = line.shadow;
        g.shadowBlur = line.blur;
        g.strokeStyle = line.color;
        g.lineWidth = line.width;
        g.beginPath();
        g.moveTo(a.u, a.v);
        g.lineTo(b.u, b.v);
        g.stroke();
        g.shadowBlur = 0;
      }
    }
  });
}

export function createTattooSurface(strokes: Stroke[]) {
  const ink = inkCanvas(strokes);

  // Traço levemente borrado pelo inchaço
  const swollen = blurred(ink, 1.6);

  // Vermelhidão: halo elíptico mais a tatuagem borrada tingida de vermelho
  const redness = makeCanvas(W, H, (g) => {
    swellSpot(g, 20, "rgba(196,71,58,.4)", "rgba(196,71,58,0)");
    g.drawImage(tinted(blurred(ink, 14), "#c4473a"), 0, 0);
    g.drawImage(tinted(blurred(ink, 6), "#b03a30"), 0, 0);
  });

  // Véu leitoso
  const milk = tinted(blurred(ink, 3), "#efe6de");

  // Pelinhas de descamação, só sobre a tatuagem
  const flakes = makeCanvas(W, H, (g) => {
    for (let i = 0; i < 460; i++) {
      const x = 40 + Math.random() * 700;
      const y = 180 + Math.random() * 250;
      const r = 3 + Math.random() * 9;
      const sides = 5 + Math.floor(Math.random() * 3);
      g.fillStyle = "rgba(232,212,196,.92)";
      g.strokeStyle = "rgba(90,60,50,.4)";
      g.lineWidth = 0.8;
      g.beginPath();
      for (let k = 0; k < sides; k++) {
        const angle = (k / sides) * Math.PI * 2;
        const rr = r * (0.5 + Math.random() * 0.6);
        const px = x + Math.cos(angle) * rr;
        const py = y + Math.sin(angle) * rr;
        if (k) g.lineTo(px, py);
        else g.moveTo(px, py);
      }
      g.closePath();
      g.fill();
      g.stroke();
    }
    g.globalCompositeOperation = "destination-in";
    g.drawImage(blurred(ink, 6), 0, 0);
  });

  // Faixas de brilho de pomada
  const gloss = makeCanvas(W, H, (g, w, h) => {
    g.save();
    g.translate(w / 2, h / 2);
    g.rotate(-0.35);
    for (let i = 0; i < 5; i++) {
      const y0 = -120 + i * 55 + Math.random() * 15;
      const band = g.createLinearGradient(0, y0 - 12, 0, y0 + 12);
      band.addColorStop(0, "rgba(255,255,255,0)");
      band.addColorStop(0.5, `rgba(255,255,255,${(0.3 + Math.random() * 0.25).toFixed(2)})`);
      band.addColorStop(1, "rgba(255,255,255,0)");
      g.fillStyle = band;
      g.fillRect(-w, y0 - 12, 2 * w, 24);
    }
    g.restore();
    g.globalCompositeOperation = "destination-in";
    swellSpot(g, 30, "#000", "rgba(0,0,0,0)");
  });

  const composite = makeCanvas(W, H);
  const out = composite.getContext("2d")!;
  const stages = visual.healing;

  /**
   * Compõe a pele no dia v (0 = Dia 0 ... 4 = Dia 30), interpolando os pesos
   * das camadas entre os dois estágios vizinhos. Devolve o brilho de pomada.
   */
  function compose(v: number) {
    const i = Math.min(stages.length - 2, Math.max(0, Math.floor(v)));
    const f = Math.min(1, Math.max(0, v - i));
    const from: HealingLayers = stages[i];
    const to: HealingLayers = stages[i + 1];
    const at = (key: keyof HealingLayers) => from[key] + (to[key] - from[key]) * f;

    out.clearRect(0, 0, W, H);
    out.globalAlpha = at("red");
    out.drawImage(redness, 0, 0);
    const blur = at("blur");
    const amount = at("ink");
    out.globalAlpha = amount * (1 - blur);
    out.drawImage(ink, 0, 0);
    out.globalAlpha = amount * blur;
    out.drawImage(swollen, 0, 0);
    out.globalAlpha = at("milk");
    out.drawImage(milk, 0, 0);
    out.globalAlpha = at("flakes");
    out.drawImage(flakes, 0, 0);
    const shine = at("gloss");
    out.globalAlpha = shine * 0.85;
    out.drawImage(gloss, 0, 0);
    out.globalAlpha = 1;
    return shine;
  }

  return { canvas: composite, compose };
}
