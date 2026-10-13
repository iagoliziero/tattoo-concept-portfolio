import { visual } from "@/config/visual";
import { surfacePoint, type SurfacePoint } from "./armGeometry";
import type { Segment } from "./tattooArt";

export interface Needle extends SurfacePoint {
  /** Altura da agulha acima da pele. */
  lift: number;
  /** Na pele, traçando. */
  down: boolean;
}

export const makeNeedle = (): Needle => ({ x: 0, y: 0, z: 0, u: 0, v: 0, lift: 0, down: false });

/**
 * A sessão do protótipo: a agulha percorre os traços da tatuagem a velocidade
 * constante e sobe entre um traço e outro, descendo e subindo em liftTime.
 */
export function createSession(segments: Segment[], total: number) {
  let index = 0;
  let inSegment = 0;
  let elapsed = 0;

  const session = {
    started: false,
    done: false,
    get progress() {
      return Math.min(1, elapsed / total);
    },
    start() {
      session.started = true;
    },
    reset() {
      index = 0;
      inSegment = 0;
      elapsed = 0;
      session.started = false;
      session.done = false;
    },
    /** Pula para o fim (quem sai no meio ou passa direto pela seção). */
    finish() {
      index = segments.length;
      inSegment = 0;
      elapsed = total;
      session.started = true;
      session.done = true;
    },
    step(dt: number) {
      elapsed += dt;
      let rest = dt;
      while (rest > 0 && index < segments.length) {
        const segment = segments[index];
        const used = Math.min(rest, segment.duration - inSegment);
        inSegment += used;
        rest -= used;
        if (inSegment >= segment.duration - 1e-6) {
          index++;
          inSegment = 0;
        }
      }
      if (index >= segments.length) session.done = true;
    },
    /** Onde a agulha está agora. */
    needle(out: Needle) {
      const { start, lift, liftTime } = visual.session;
      out.down = false;
      if (!session.started || index >= segments.length) {
        const [along, around] = session.started ? segments[segments.length - 1].b : start;
        surfacePoint(along, around, out);
        out.lift = lift;
        return out;
      }
      const segment = segments[index];
      const last = index === segments.length - 1;
      let f: number;
      out.lift = 0;
      if (segment.draw) {
        f = inSegment / segment.duration;
        out.down = true;
      } else {
        f = Math.min(1, Math.max(0, (inSegment - liftTime) / (segment.duration - 2 * liftTime)));
        const rising = index === 0 ? 1 : inSegment / liftTime;
        const landing = last ? 1 : (segment.duration - inSegment) / liftTime;
        out.lift = lift * Math.min(1, rising, landing);
      }
      surfacePoint(
        segment.a[0] + (segment.b[0] - segment.a[0]) * f,
        segment.a[1] + (segment.b[1] - segment.a[1]) * f,
        out,
      );
      return out;
    },
  };
  return session;
}

export type Session = ReturnType<typeof createSession>;
