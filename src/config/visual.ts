// Parâmetros visuais do site, num lugar só e tipados.
// Valores tirados do protótipo aprovado (referencia/index.html, three r128).
// As fases seguintes acrescentam aqui os parâmetros da cena que forem usando.

export type Hex = `#${string}`;
export type Rgba = `rgba(${string})`;
export type CssColor = Hex | Rgba;
export type Vec3 = readonly [number, number, number];

export type MachinePart = "tip" | "grip" | "tube" | "frame" | "coil" | "arm";
export type LabeledPart = "tip" | "grip" | "coil" | "arm";

export type MaterialName =
  | "chrome"
  | "steel"
  | "brass"
  | "knurl"
  | "sleeve"
  | "red"
  | "coil"
  | "capBlue"
  | "cord"
  | "blackChrome";

export interface MaterialParams {
  color: Hex;
  metalness: number;
  roughness: number;
  clearcoat?: number;
  clearcoatRoughness?: number;
  bumpScale?: number;
}

/** Peso de cada camada da cicatrização num estágio (0 a 1). */
export interface HealingLayers {
  /** vermelhidão */
  red: number;
  /** traço borrado pelo inchaço */
  blur: number;
  /** brilho de pomada */
  gloss: number;
  /** véu leitoso */
  milk: number;
  /** pelinhas de descamação */
  flakes: number;
  /** opacidade da tinta */
  ink: number;
}

export interface VisualConfig {
  colors: {
    background: Hex;
    text: Hex;
    textSecondary: Hex;
    textBody: Hex;
    textMuted: Hex;
    red: Hex;
    redDark: Hex;
    onRed: Hex;
    gold: Hex;
    border: Hex;
    borderSoft: Hex;
    line: Hex;
    success: Hex;
    error: Hex;
    optionBg: Hex;
    headerBg: Rgba;
    headerBorder: Rgba;
    panelBg: Rgba;
    ghostBg: Rgba;
    chipBg: Rgba;
    cardBg: Rgba;
    slotBg: Rgba;
    fieldBg: Rgba;
  };
  fonts: {
    /** Títulos. Carregada com next/font/google no layout. */
    display: "Pirata One";
    /** Reserva dos títulos enquanto a Pirata One carrega. */
    displayFallback: string;
    /** Textos: sans limpa do sistema, como no protótipo. */
    body: string;
    mono: string;
  };
  layout: {
    headerHeight: number;
    radius: number;
    panelRadius: number;
    minStageHeight: number;
  };
  scroll: {
    sections: number;
    /** Quanto da altura da tela cada seção fica fixa antes de seguir. */
    holdRatio: number;
    /** Espera depois que a rolagem para, antes de encaixar na seção (s). */
    snapDelay: number;
    snapDuration: { min: number; max: number };
  };
  renderer: {
    maxPixelRatio: number;
    toneMappingExposure: number;
    shadowMapSize: number;
    shadowBias: number;
    shadowNormalBias: number;
  };
  camera: { fov: number; near: number; far: number };
  fog: { color: Hex; near: number; far: number };
  lights: {
    ambient: { color: Hex; intensity: number };
    key: {
      color: Hex;
      intensity: number;
      distance: number;
      angle: number;
      penumbra: number;
      decay: number;
    };
  };
  post: {
    msaaSamples: number;
    bloom: { strength: number; radius: number; threshold: number };
    final: {
      chromaticAberration: number;
      warmTint: Vec3;
      contrastMix: number;
      vignette: number;
      grain: number;
    };
  };
  materials: Record<MaterialName, MaterialParams>;
  machine: {
    /** Deslocamento de cada peça na vista explodida (seção Sobre). */
    explode: Record<MachinePart, Vec3>;
    /** Atraso de entrada de cada peça na montagem, em segundos. */
    assemblyDelay: Record<MachinePart, number>;
    assemblyDuration: number;
    /** Ponto 3D de onde sai a etiqueta HTML de cada peça. */
    labelAnchors: Record<LabeledPart, Vec3>;
  };
  /** Dia 0, 3, 7, 15 e 30, na mesma ordem dos textos em site.ts. */
  healing: readonly [HealingLayers, HealingLayers, HealingLayers, HealingLayers, HealingLayers];
}

export const visual = {
  colors: {
    background: "#090807",
    text: "#F1EFE8",
    textSecondary: "#D3D1C7",
    textBody: "#B4B2A9",
    textMuted: "#888780",
    red: "#E24B4A",
    redDark: "#A32D2D",
    onRed: "#501313",
    gold: "#d9ae58",
    border: "#5F5E5A",
    borderSoft: "#444441",
    line: "#2C2C2A",
    success: "#97C459",
    error: "#F09595",
    optionBg: "#141312",
    headerBg: "rgba(9,8,7,.6)",
    headerBorder: "rgba(68,68,65,.6)",
    panelBg: "rgba(11,10,9,.8)",
    ghostBg: "rgba(11,10,9,.6)",
    chipBg: "rgba(11,10,9,.7)",
    cardBg: "rgba(14,13,12,.9)",
    slotBg: "rgba(20,19,18,.9)",
    fieldBg: "rgba(11,10,9,.75)",
  },
  fonts: {
    display: "Pirata One",
    displayFallback: "Georgia,'Times New Roman',serif",
    body: "system-ui,-apple-system,'Segoe UI',Roboto,sans-serif",
    mono: "ui-monospace,SFMono-Regular,Menlo,Consolas,monospace",
  },
  layout: {
    headerHeight: 52,
    radius: 8,
    panelRadius: 10,
    minStageHeight: 560,
  },
  scroll: {
    sections: 6,
    holdRatio: 0.6,
    snapDelay: 0.2,
    snapDuration: { min: 0.3, max: 0.8 },
  },
  renderer: {
    maxPixelRatio: 2,
    toneMappingExposure: 1.05,
    shadowMapSize: 2048,
    shadowBias: -0.0003,
    shadowNormalBias: 0.02,
  },
  camera: { fov: 38, near: 0.03, far: 80 },
  fog: { color: "#0c0a09", near: 12, far: 30 },
  lights: {
    // Intensidades do three r128 (luzes legadas). No three atual as luzes são
    // físicas: a fase 2 recalibra estes valores comparando com o protótipo.
    ambient: { color: "#ffe8d6", intensity: 0.22 },
    key: {
      color: "#fff0dd",
      intensity: 2.8,
      distance: 40,
      angle: 0.55,
      penumbra: 0.65,
      decay: 1,
    },
  },
  post: {
    msaaSamples: 4,
    bloom: { strength: 0.5, radius: 0.5, threshold: 0.88 },
    final: {
      chromaticAberration: 0.016,
      warmTint: [1.03, 0.99, 0.94],
      contrastMix: 0.25,
      vignette: 0.72,
      grain: 0.035,
    },
  },
  materials: {
    chrome: { color: "#f4f2ec", metalness: 1, roughness: 0.07, clearcoat: 0.3 },
    steel: { color: "#d9d6ce", metalness: 1, roughness: 0.22 },
    brass: { color: "#e3b65c", metalness: 1, roughness: 0.2, clearcoat: 0.4 },
    knurl: { color: "#d6a84f", metalness: 1, roughness: 0.3, bumpScale: 0.01 },
    sleeve: { color: "#161514", metalness: 0.6, roughness: 0.45, clearcoat: 0.3, bumpScale: 0.012 },
    red: { color: "#b0231c", metalness: 0.75, roughness: 0.28, clearcoat: 0.8, clearcoatRoughness: 0.15 },
    coil: { color: "#ffffff", metalness: 0.85, roughness: 0.33, clearcoat: 1, clearcoatRoughness: 0.06, bumpScale: 0.006 },
    capBlue: { color: "#1d4f8f", metalness: 0.2, roughness: 0.3, clearcoat: 1 },
    cord: { color: "#8f1d1d", metalness: 0.1, roughness: 0.38, clearcoat: 0.6 },
    blackChrome: { color: "#1b1a19", metalness: 1, roughness: 0.22, clearcoat: 0.6 },
  },
  machine: {
    explode: {
      tip: [0, -0.8, 0],
      grip: [0, -0.4, 0],
      tube: [0, 0, 0],
      frame: [0.3, 0.32, 0],
      coil: [0.3, 0.9, 0],
      arm: [0.3, 1.5, 0],
    },
    assemblyDelay: { tip: 0, grip: 0.12, tube: 0.24, frame: 0.36, coil: 0.5, arm: 0.64 },
    assemblyDuration: 1.3,
    labelAnchors: {
      tip: [0, 0.22, 0.09],
      grip: [0, 0.9, 0.17],
      coil: [0.68, 2.76, 0.2],
      arm: [0.55, 3.15, 0.08],
    },
  },
  healing: [
    { red: 0.9, blur: 0.7, gloss: 1, milk: 0, flakes: 0, ink: 1 },
    { red: 0.45, blur: 0.45, gloss: 0.35, milk: 0.06, flakes: 0.12, ink: 1 },
    { red: 0.15, blur: 0.3, gloss: 0, milk: 0.18, flakes: 0.9, ink: 0.93 },
    { red: 0.04, blur: 0.2, gloss: 0, milk: 0.45, flakes: 0.12, ink: 0.86 },
    { red: 0, blur: 0, gloss: 0, milk: 0, flakes: 0, ink: 0.95 },
  ],
} as const satisfies VisualConfig;
