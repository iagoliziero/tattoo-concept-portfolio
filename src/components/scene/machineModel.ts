import {
  BoxGeometry,
  CatmullRomCurve3,
  CylinderGeometry,
  ExtrudeGeometry,
  Group,
  LatheGeometry,
  Mesh,
  MeshPhysicalMaterial,
  Shape,
  TorusGeometry,
  TubeGeometry,
  Vector2,
  Vector3,
  type BufferGeometry,
  type Texture,
} from "three";
import { visual, type MachinePart, type MaterialName, type MaterialParams } from "@/config/visual";
import { canvasTexture } from "./canvas";
import type { Canvas2D } from "./draw";
import { ENGRAVING_OFFSET, ENGRAVING_REPEAT, FRAME_OUTLINE } from "./machineTextures";

// Máquina de bobina modelada com primitivas, portada do protótipo: ponta da
// agulha na origem e tubo apontando para +Y. Medidas em unidades da cena.

export const MACHINE_PARTS: readonly MachinePart[] = ["tip", "grip", "tube", "frame", "coil", "arm"];
/** Altura do centro da agulha parada, escondida dentro da biqueira. */
export const NEEDLE_REST_Y = 0.26;

export interface MachineModel {
  root: Group;
  parts: Record<MachinePart, Group>;
  /** Agulha e armadura: a fase 4 faz as duas vibrarem com a máquina ligada. */
  needle: Mesh;
  armature: Mesh;
  dispose: () => void;
}

const cylinder = (top: number, bottom: number, height: number, segments = 32, open = false) =>
  new CylinderGeometry(top, bottom, height, segments, 1, open);
const lathe = (points: readonly (readonly [number, number])[], segments = 56) =>
  new LatheGeometry(points.map(([x, y]) => new Vector2(x, y)), segments);

/** Monta a máquina com as texturas já desenhadas (machineTextures.ts, num Web Worker). */
export function buildMachine({ coil, knurl, engraving }: { coil: Canvas2D; knurl: Canvas2D; engraving: Canvas2D }): MachineModel {
  const textures: Texture[] = [];
  const texture = (t: Texture) => (textures.push(t), t);

  const engravingTextures = [true, false].map((srgb) => {
    const t = canvasTexture(engraving, { srgb, repeat: ENGRAVING_REPEAT });
    t.offset.set(...ENGRAVING_OFFSET);
    return texture(t);
  });

  const material = (name: MaterialName, maps: { map?: Texture; bumpMap?: Texture } = {}) => {
    const params: MaterialParams = visual.materials[name];
    const { color, metalness, roughness, clearcoat = 0, clearcoatRoughness = 0, bumpScale = 1 } = params;
    return new MeshPhysicalMaterial({ color, metalness, roughness, clearcoat, clearcoatRoughness, bumpScale, ...maps });
  };
  const m = {
    chrome: material("chrome"),
    steel: material("steel"),
    brass: material("brass"),
    knurl: material("knurl", { bumpMap: texture(canvasTexture(knurl, { repeat: [3, 1] })) }),
    sleeve: material("sleeve", { bumpMap: texture(canvasTexture(knurl, { repeat: [10, 4] })) }),
    red: material("red"),
    coil: material("coil", {
      map: texture(canvasTexture(coil, { srgb: true, sharp: true })),
      bumpMap: texture(canvasTexture(coil, { sharp: true })),
    }),
    capBlue: material("capBlue"),
    cord: material("cord"),
    blackChrome: material("blackChrome"),
    frame: material("frame", { map: engravingTextures[0], bumpMap: engravingTextures[1] }),
    wireRed: material("wireRed"),
    wireBlack: material("wireBlack"),
  };

  const root = new Group();
  root.name = "machine";
  const parts = Object.fromEntries(
    MACHINE_PARTS.map((part) => {
      const group = new Group();
      group.name = `machine-${part}`;
      root.add(group);
      return [part, group];
    }),
  ) as Record<MachinePart, Group>;

  const add = (
    part: MachinePart,
    geometry: BufferGeometry,
    mat: MeshPhysicalMaterial,
    position: readonly [number, number, number],
    rotation: readonly [number, number, number] = [0, 0, 0],
  ) => {
    const mesh = new Mesh(geometry, mat);
    mesh.position.set(...position);
    mesh.rotation.set(...rotation);
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    parts[part].add(mesh);
    return mesh;
  };
  const flat = Math.PI / 2;

  // Biqueira e agulha
  const needle = add("tip", cylinder(0.006, 0.006, 0.4, 10), m.chrome, [0, NEEDLE_REST_Y, 0]);
  add(
    "tip",
    lathe([
      [0.005, 0.03], [0.013, 0.042], [0.022, 0.08], [0.042, 0.19], [0.066, 0.31], [0.078, 0.35],
      [0.086, 0.355], [0.086, 0.41], [0.078, 0.42], [0.078, 0.43], [0.092, 0.435], [0.092, 0.455], [0, 0.455],
    ]),
    m.chrome,
    [0, 0, 0],
  );

  // Grip cromado, luva recartilhada preta e O-rings vermelhos
  add(
    "grip",
    lathe([
      [0.092, 0.455], [0.155, 0.47], [0.162, 0.49], [0.162, 0.56], [0.15, 0.575], [0.15, 1.225], [0.162, 1.24],
      [0.162, 1.31], [0.155, 1.33], [0.1, 1.36], [0.072, 1.38], [0.072, 1.42], [0, 1.42],
    ]),
    m.chrome,
    [0, 0, 0],
  );
  add("grip", cylinder(0.165, 0.165, 0.62, 64), m.sleeve, [0, 0.9, 0]);
  for (const y of [0.585, 1.215]) add("grip", new TorusGeometry(0.163, 0.008, 8, 64), m.red, [0, y, 0], [flat, 0, 0]);

  // Tubo cromado, morsa em cromo negro e manípulo de latão
  add("tube", cylinder(0.052, 0.052, 0.86), m.chrome, [0, 1.85, 0]);
  add("tube", new TorusGeometry(0.056, 0.01, 8, 32), m.chrome, [0, 1.44, 0], [flat, 0, 0]);
  add("tube", cylinder(0.1, 0.1, 0.16, 40), m.blackChrome, [0, 2.2, 0]);
  add(
    "tube",
    lathe([[0, 0], [0.045, 0], [0.05, 0.01], [0.05, 0.07], [0.045, 0.08], [0, 0.08]]),
    m.knurl,
    [0, 2.2, 0.1],
    [flat, 0, 0],
  );

  // Quadro extrudado com bisel e gravação
  const shape = new Shape();
  for (const c of FRAME_OUTLINE) {
    if (c[0] === "M") shape.moveTo(c[1], c[2]);
    else if (c[0] === "L") shape.lineTo(c[1], c[2]);
    else shape.quadraticCurveTo(c[1], c[2], c[3], c[4]);
  }
  const frameGeometry = new ExtrudeGeometry(shape, {
    depth: 0.15,
    bevelEnabled: true,
    bevelThickness: 0.018,
    bevelSize: 0.016,
    bevelSegments: 3,
    curveSegments: 10,
  });
  frameGeometry.translate(0, 0, -0.075);
  add("frame", frameGeometry, m.frame, [0, 0, 0]);

  // Bobinas de cobre com resina, arruelas vermelhas e tampas cromadas
  for (const x of [0.42, 0.95]) {
    add("coil", cylinder(0.19, 0.19, 0.54, 64), m.coil, [x, 2.76, 0]);
    add("coil", cylinder(0.228, 0.228, 0.03, 48), m.red, [x, 2.475, 0]);
    add("coil", cylinder(0.228, 0.228, 0.03, 48), m.red, [x, 3.045, 0]);
    add("coil", cylinder(0.065, 0.065, 0.05, 24), m.chrome, [x, 3.085, 0]);
  }

  // Armadura, molas, parafuso de contato, manípulo, barra da agulha
  const armature = add("arm", new BoxGeometry(0.8, 0.05, 0.14), m.steel, [0.37, 3.14, 0]);
  add("arm", new BoxGeometry(0.34, 0.01, 0.1), m.steel, [0.62, 3.19, 0], [0, 0, 0.08]);
  add("arm", new BoxGeometry(0.6, 0.012, 0.1), m.steel, [1.03, 3.16, 0]);
  add("arm", cylinder(0.026, 0.026, 0.4, 16), m.knurl, [0.72, 3.38, 0]);
  add("arm", cylinder(0.05, 0.05, 0.035, 6), m.brass, [0.72, 3.5375, 0]);
  add(
    "arm",
    lathe([[0, 0], [0.06, 0], [0.068, 0.012], [0.068, 0.06], [0.06, 0.072], [0, 0.072]]),
    m.knurl,
    [0.72, 3.56, 0],
  );
  add("arm", cylinder(0.012, 0.012, 0.86, 12), m.chrome, [0, 2.72, 0]);
  add("arm", new TorusGeometry(0.028, 0.013, 10, 20), m.red, [0, 3.14, 0], [flat, 0, 0]);

  // Bornes de latão, capacitor azul, fios e cabo vermelho com plugue cromado
  const sideways = [0, 0, flat] as const;
  for (const y of [2.62, 2.86]) {
    add("frame", cylinder(0.026, 0.026, 0.2, 16), m.brass, [1.58, y, 0], sideways);
    add("frame", cylinder(0.048, 0.048, 0.035, 6), m.brass, [1.52, y, 0], sideways);
    add("frame", cylinder(0.055, 0.055, 0.012, 24), m.red, [1.495, y, 0], sideways);
    add("frame", cylinder(0.04, 0.04, 0.03, 6), m.brass, [1.66, y, 0], sideways);
  }
  add("frame", cylinder(0.045, 0.045, 0.2, 24), m.capBlue, [1.6, 2.74, 0.09]);
  const tube = (points: readonly (readonly [number, number, number])[], segments: number, radius: number, radial: number) =>
    new TubeGeometry(new CatmullRomCurve3(points.map((p) => new Vector3(...p))), segments, radius, radial, false);
  add("frame", tube([[0.42, 2.62, 0.19], [0.75, 2.56, 0.23], [1.2, 2.58, 0.2], [1.5, 2.62, 0.07]], 40, 0.009, 6), m.wireRed, [0, 0, 0]);
  add("frame", tube([[0.95, 2.9, 0.19], [1.2, 2.9, 0.2], [1.5, 2.86, 0.07]], 40, 0.009, 6), m.wireBlack, [0, 0, 0]);
  add(
    "frame",
    tube([[1.7, 2.74, 0], [2.05, 2.62, 0.3], [2.4, 1.8, 0.8], [2.65, 0.6, 1.2], [2.9, -1.3, 1.6]], 60, 0.034, 10),
    m.cord,
    [0, 0, 0],
  );
  add("frame", cylinder(0.05, 0.05, 0.12, 24), m.chrome, [1.72, 2.74, 0], sideways);

  return {
    root,
    parts,
    needle,
    armature,
    dispose: () => {
      root.traverse((object) => {
        if (object instanceof Mesh) object.geometry.dispose();
      });
      Object.values(m).forEach((mat) => mat.dispose());
      textures.forEach((t) => t.dispose());
    },
  };
}
