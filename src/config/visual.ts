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
  | "blackChrome"
  | "frame"
  | "wireRed"
  | "wireBlack";

export interface MaterialParams {
  color: Hex;
  metalness: number;
  roughness: number;
  clearcoat?: number;
  clearcoatRoughness?: number;
  bumpScale?: number;
}

/**
 * Cor de luz. "srgb" é convertida para linear, como o Lc() do protótipo.
 * "linear" é usada direto: o protótipo passava hex numérico ao three r128,
 * que não convertia, e o three atual converteria.
 */
export interface LightColor {
  hex: Hex;
  space: "srgb" | "linear";
}

/** Imagem em /public, com o tamanho em pixels. */
export interface PlaceholderImage {
  src: string;
  width: number;
  height: number;
}

/**
 * Rotação da máquina flutuando, como no st() do protótipo: ângulos base
 * (radianos, ordem ZXY), giro contínuo em torno do eixo vertical (rad/s) e,
 * opcionalmente, quanto o cursor inclina (eixo X) e gira (eixo Y) a máquina.
 */
export interface FloatingRotation {
  tilt: Vec3;
  spin: number;
  follow?: readonly [number, number];
}

/**
 * Em retrato (painel embaixo), quanto o assunto se desloca:
 * [para a esquerda, em fração da distância câmera–alvo (vale igual em qualquer
 * largura de tela, então centraliza do celular ao tablet); para cima, em
 * fração da altura da tela (o espaço que o painel ocupa embaixo)].
 */
export type PortraitShift = readonly [number, number];

/** Câmera e máquina de uma seção. Na sessão, câmera e máquina seguem a agulha. */
export type Station =
  | { kind: "fixed"; camera: Vec3; target: Vec3; machine: Vec3; rotation: FloatingRotation; portraitShift?: PortraitShift }
  | { kind: "session" };

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
    labelBg: Rgba;
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
    /**
     * Cura: a seção fica fixa por mais tempo e a rolagem dentro dela avança
     * (ou volta) os dias da cicatrização. Em alturas de tela.
     */
    healingHold: number;
    /**
     * Cura em etapas: cada gesto (roda, trackpad, swipe, tecla) avança ou volta
     * um dia. duration: transição entre dias (s); gestureGap: pausa sem eventos
     * que encerra um gesto (s), para a inércia do trackpad contar como um só;
     * swipe: quanto o dedo precisa andar para contar (px).
     */
    healingStep: { duration: number; gestureGap: number; swipe: number };
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
    shadowNear: number;
    shadowFar: number;
  };
  camera: {
    fov: number;
    near: number;
    far: number;
    /** Rapidez com que câmera e cena seguem a rolagem (1/s). */
    follow: number;
  };
  /** Ponto de vista de cada seção, na ordem da navegação. */
  stations: readonly [Station, Station, Station, Station, Station, Station];
  session: {
    /** Onde a agulha espera antes de começar e onde para no fim (coordenadas do desenho). */
    start: readonly [number, number];
    end: readonly [number, number];
    /** Velocidade da agulha percorrendo um traço (unidades/s). */
    speed: number;
    /** Tempo de um deslocamento entre traços: base + distância x perUnit (s). */
    travel: { base: number; perUnit: number };
    /** Altura da agulha fora da pele e tempo para subir/descer (s). */
    lift: number;
    liftTime: number;
    /** Afastamento da câmera parada e com a máquina ligada (push-in). */
    zoom: number;
    zoomActive: number;
    /** Rapidez da aproximação e do afastamento (1/s). */
    zoomFollow: number;
    /** Afastamento lateral e frontal da câmera em relação à agulha. */
    orbit: readonly [number, number];
    /** Balanço da câmera em volta da agulha durante a sessão (rad, rad/s). */
    sway: { amplitude: number; speed: number };
    targetOffset: Vec3;
    /** Rapidez com que a câmera segue a agulha (1/s; protótipo: .08 por quadro). */
    tipFollow: number;
    /** Começa quando p chega a esta distância da seção; termina sozinha ao sair desta. */
    startWithin: number;
    leaveBeyond: number;
    /** Piscadas por segundo do LED com a máquina ligada. */
    ledBlink: number;
    /** Inclinação da máquina tatuando (radianos, ordem XYZ). */
    tilt: Vec3;
  };
  /** Máquina ligada. Desligado com prefers-reduced-motion. */
  vibration: {
    /** Agulha: desce `reach` para fora da biqueira e oscila (unidades, Hz). */
    needle: { amplitude: number; rate: number; reach: number };
    armature: { angle: number; rate: number };
    /** Tremor da máquina inteira e da câmera (unidades da cena). */
    jitter: number;
    cameraTremor: number;
  };
  /** Gotículas de tinta saindo da agulha. */
  droplets: {
    capacity: number;
    /** Por segundo, com a agulha na pele. */
    rate: number;
    life: number;
    /** Velocidade lateral e de subida (mín., máx.) e gravidade. */
    spread: readonly [number, number];
    rise: readonly [number, number];
    gravity: number;
    /** Tamanho em pixels a 1 unidade da câmera. */
    size: number;
  };
  tattoo: {
    /** Traço: linha escura com sombra curta e um halo avermelhado largo. */
    line: { width: number; color: Rgba; shadow: Rgba; blur: number };
    halo: { width: number; color: Rgba };
    roughness: number;
    clearcoatRoughness: number;
    envMapIntensity: number;
    /** Rugosidade seca e com pomada (o brilho de pomada interpola entre as duas). */
    roughnessDry: number;
    roughnessWet: number;
  };
  /** Balanço vertical da máquina flutuando: amplitude e velocidade. */
  bob: { amplitude: number; speed: number };
  fog: { color: Hex; near: number; far: number };
  environment: {
    /**
     * Cor de fundo do estúdio, linear. O código do protótipo pedia #070606, mas
     * no three r128 esse fundo saía como um cinza claro e uniforme, e é esse
     * cinza que deixa os metais prateados e a bancada clara no visual aprovado.
     * Para um ambiente escuro, com reflexo só dos painéis, use valores perto de 0.
     */
    fill: Vec3;
    blur: number;
    /** Painéis de luz que viram o reflexo dos metais (cores lineares, HDR). */
    panels: readonly { size: readonly [number, number]; rgb: Vec3; position: Vec3 }[];
  };
  backdrop: {
    /** Posição padrão do brilho, em fração da tela (x, y a partir de baixo). */
    glow: readonly [number, number];
    redBase: number;
    /** Vermelho extra na última seção e com a máquina ligada. */
    redAtEnd: number;
    redWhenOn: number;
    /** Deslocamento da fumaça com o mouse e com a rolagem. */
    parallax: { mouse: number; scroll: number };
  };
  lights: {
    ambient: { color: LightColor; intensity: number };
    key: {
      color: LightColor;
      intensity: number;
      distance: number;
      angle: number;
      penumbra: number;
      decay: number;
      /** Posição em relação ao ponto para onde a câmera olha. */
      offset: Vec3;
    };
    rim: { color: LightColor; intensity: number; position: Vec3 };
    mouse: {
      color: LightColor;
      intensity: number;
      distance: number;
      decay: number;
      /** Distância da câmera até a luz, na direção do cursor. */
      reach: number;
      /** Força em cada seção (quase apagada nos closes). */
      perSection: readonly [number, number, number, number, number, number];
    };
    neon: { color: LightColor; intensity: number; distance: number; decay: number; position: Vec3 };
  };
  neon: {
    position: Vec3;
    rotationY: number;
    size: readonly [number, number];
    /** Multiplicador de cor acima de 1, para o bloom pegar. */
    glow: number;
    canvas: readonly [number, number];
    flicker: {
      /** Sorteios de piscada por segundo. */
      rate: number;
      /** Chance de apagar em cada sorteio. */
      chance: number;
      /** Brilho mínimo e máximo durante uma piscada. */
      dim: readonly [number, number];
      /** Oscilação leve do brilho aceso. */
      hum: number;
    };
  };
  beam: { length: number; radiusRatio: number; intensity: number };
  dust: { count: number; size: number; color: Hex; opacity: number; min: Vec3; max: Vec3 };
  arm: {
    radius: number;
    length: number;
    /** Abertura do segmento de cilindro, em radianos. */
    span: number;
    skin: Hex;
    roughness: number;
    bumpScale: number;
    envMapIntensity: number;
    textureWidth: number;
    tattoo: { span: number; length: number; textureWidth: number };
    /** Multiplica a cor da pele (1 = textura como está). */
    brightness: number;
  };
  table: {
    y: number;
    size: number;
    roughness: number;
    clearcoat: number;
    clearcoatRoughness: number;
    envMapIntensity: number;
    repeat: readonly [number, number];
  };
  inkCaps: readonly { position: readonly [number, number]; ink: Hex }[];
  bottles: readonly (readonly [number, number])[];
  post: {
    /** Pós-processamento ligado (a fase 8 desliga no modo leve do celular). */
    enabled: boolean;
    msaaSamples: number;
    /** Bloom com desfoque em mipmaps, somado à cena antes do tone mapping. */
    bloom: { intensity: number; radius: number; threshold: number; smoothing: number };
    /**
     * Grão, vinheta, aberração cromática nas bordas, toque quente e contraste,
     * aplicados como no protótipo: depois do tone mapping, no espaço da tela.
     */
    final: {
      chromaticAberration: number;
      warmTint: Vec3;
      contrastMix: number;
      vignette: number;
      grain: number;
    };
    /**
     * O feixe e o neon iam direto para a tela no protótipo, sem tone mapping;
     * aqui passam por ele, e estes fatores repõem o brilho original.
     */
    beamScale: number;
    neonGlow: number;
  };
  materials: Record<MaterialName, MaterialParams>;
  machine: {
    /** Deslocamento de cada peça na vista explodida (eixos da máquina). */
    explode: Record<MachinePart, Vec3>;
    /** Quanto a máquina está explodida em cada seção (0 a 1). */
    explodeBySection: readonly [number, number, number, number, number, number];
    /** Quanto a máquina inteira sobe quando explodida, para a biqueira não entrar no braço. */
    explodeLift: Vec3;
    /** Montagem na abertura da página. */
    assembly: {
      /** Espera antes da primeira peça (s). */
      start: number;
      /** Atraso de cada peça em relação à primeira (s). */
      delay: Record<MachinePart, number>;
      /** Duração da entrada de cada peça (s). */
      duration: number;
      /** De onde cada peça vem, em relação ao lugar dela (eixos da máquina). */
      from: Record<MachinePart, Vec3>;
      /** Giro em volta do eixo da máquina enquanto a peça entra (rad). */
      spin: number;
      /** Passada além do lugar antes de assentar (curva easeOutBack; 0 = sem). */
      overshoot: number;
    };
    /** Fator do giro contínuo quando o sistema pede menos movimento. */
    reducedSpin: number;
    /** Ponto de onde sai a etiqueta HTML de cada peça (eixos da máquina). */
    labelAnchors: Record<LabeledPart, Vec3>;
    /** A partir de quanto da vista explodida as etiquetas começam a aparecer. */
    labelsFrom: number;
    /** Fundo da gravação do quadro (o dourado vem de colors.gold). */
    engravingBase: Hex;
  };
  /** Dia 0, 3, 7, 15 e 30, na mesma ordem dos textos em site.ts. */
  healing: readonly [HealingLayers, HealingLayers, HealingLayers, HealingLayers, HealingLayers];
  /** Cursor: anel com atraso e ponto vermelho (desligado no toque e com movimento reduzido). */
  cursor: {
    ring: number;
    dot: number;
    /** Rapidez do anel seguindo o ponteiro (1/s; protótipo ~ .2 por quadro). */
    follow: number;
    /** Escala do anel sobre itens clicáveis e pressionado. */
    grow: number;
    pressed: number;
  };
  /** Respingos de tinta ao clicar em área vazia (canvas 2D por cima). */
  splash: {
    onClick: number;
    onSubmit: number;
    /** Velocidade (px por quadro a 60 fps), impulso para cima e raio (mín., máx.). */
    speed: readonly [number, number];
    lift: number;
    radius: readonly [number, number];
    gravity: number;
    drag: number;
    /** Duração (s). */
    life: number;
    /** Cores RGB e a chance de cada uma. */
    colors: readonly { rgb: string; weight: number }[];
  };
  /** Portfólio: duas linhas de quatro, revelação das fotos e inclinação 3D dos cards. */
  portfolio: {
    columns: number;
    revealDuration: number;
    revealStagger: number;
    tilt: readonly [number, number];
    lift: number;
  };
  /** Contadores do Sobre. */
  countUp: { duration: number };
  /**
   * Modo leve (celular e telas de toque): sem MSAA nem bloom, menos
   * partículas, sombras e resolução menores. Liga quando `query` casa.
   */
  lightMode: { query: string; maxPixelRatio: number; shadowMapSize: number; dust: number; droplets: number };
  /**
   * Entrada da cena 3D. A página abre com uma imagem estática do estúdio e a
   * cena só carrega na primeira interação (toque, rolagem, mouse, teclado) ou,
   * sem interação, `autoStart` ms depois de a página carregar e ficar ociosa.
   * Com o primeiro quadro pronto, a cena aparece sobre a imagem em `fade` s e
   * a máquina se monta como antes.
   */
  sceneEntry: {
    autoStart: number;
    fade: number;
    /** Imagens do estúdio sem a máquina, geradas por `npm run cena:captura` (ver README). */
    placeholder: { mobile: PlaceholderImage; desktop: PlaceholderImage; quality: number };
  };
  /** Em telas mais estreitas que a de referência, o campo de visão abre até este limite. */
  responsiveFov: { referenceAspect: number; max: number };
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
    // A especificação pede #501313, que dá 3,7:1 sobre o vermelho; #300a0a dá 4,55:1 (WCAG AA).
    onRed: "#300a0a",
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
    labelBg: "rgba(11,10,9,.72)",
  },
  fonts: {
    display: "Pirata One",
    displayFallback: "Georgia,'Times New Roman',serif",
    body: "system-ui,-apple-system,'Segoe UI',Roboto,sans-serif",
    mono: "ui-monospace,SFMono-Regular,Menlo,Consolas,monospace",
  },
  layout: {
    headerHeight: 72,
    radius: 8,
    panelRadius: 10,
    minStageHeight: 560,
  },
  scroll: {
    sections: 6,
    holdRatio: 0.6,
    healingHold: 3,
    healingStep: { duration: 0.7, gestureGap: 0.2, swipe: 24 },
    snapDelay: 0.2,
    snapDuration: { min: 0.3, max: 0.8 },
  },
  renderer: {
    maxPixelRatio: 2,
    toneMappingExposure: 1.05,
    shadowMapSize: 2048,
    shadowBias: -0.0003,
    shadowNormalBias: 0.02,
    shadowNear: 2,
    shadowFar: 30,
  },
  camera: { fov: 38, near: 0.03, far: 80, follow: 3.7 },
  stations: [
    {
      kind: "fixed",
      camera: [0, 2.3, 7.4],
      target: [0.9, 2.1, 0],
      machine: [1.9, 0.5, 0.3],
      rotation: { tilt: [0.1, 0.6, -0.2], spin: 0.35, follow: [-0.25, 0.8] },
    },
    { kind: "session" },
    {
      kind: "fixed",
      camera: [-0.75, 3.1, 1.7],
      target: [-0.75, -0.1, 0.15],
      machine: [1.7, 1.3, -1.6],
      rotation: { tilt: [0.12, 0, 0.2], spin: 0.3 },
      // Em retrato o painel desce: a tatuagem vai para o centro e sobe.
      portraitShift: [0.21, 0.22],
    },
    {
      kind: "fixed",
      camera: [0.6, 4.4, 5.6],
      target: [0.7, 0.2, 0],
      machine: [3, 1.1, -1.4],
      rotation: { tilt: [0.15, 0, 0.2], spin: 0.3 },
    },
    {
      // Sobre. No protótipo: câmera [0, 2.5, 8.4], alvo [1.3, 2.4, 0], que
      // enquadram a máquina montada; recuados para caber a vista explodida.
      kind: "fixed",
      camera: [0, 2.9, 10.6],
      target: [1.3, 3, 0],
      machine: [2.3, 0.55, 0],
      rotation: { tilt: [0.06, 0.8, -0.08], spin: 0.25 },
    },
    {
      // Contato: máquina flutuando à direita do painel.
      kind: "fixed",
      camera: [0.4, 2.6, 7.6],
      target: [1.2, 1.8, 0],
      machine: [2.2, 0.55, 0.4],
      rotation: { tilt: [0.08, 1.2, -0.15], spin: 0.3, follow: [-0.2, 0.6] },
    },
  ],
  // Percurso, velocidade, alturas, zoom parado e inclinação: protótipo.
  // Push-in, balanço, rapidez do zoom e LED: definidos aqui.
  session: {
    start: [0, 0.3],
    end: [0.45, 0.5],
    speed: 1.6,
    travel: { base: 0.16, perUnit: 0.25 },
    lift: 0.16,
    liftTime: 0.08,
    zoom: 1.35,
    zoomActive: 0.95,
    zoomFollow: 1.4,
    orbit: [1.25, 1.7],
    sway: { amplitude: 0.22, speed: 0.35 },
    targetOffset: [0, 0.26, -0.1],
    tipFollow: 5,
    startWithin: 0.05,
    leaveBeyond: 0.5,
    ledBlink: 3,
    tilt: [-0.45, 2.05, 0],
  },
  vibration: {
    needle: { amplitude: 0.03, rate: 19, reach: 0.03 },
    armature: { angle: 0.03, rate: 19 },
    jitter: 0.004,
    cameraTremor: 0.004,
  },
  droplets: {
    capacity: 240,
    rate: 70,
    life: 0.55,
    spread: [0.05, 0.3],
    rise: [0.15, 0.45],
    gravity: 1.6,
    size: 7,
  },
  tattoo: {
    line: { width: 3, color: "rgba(24,17,15,.96)", shadow: "rgba(25,16,14,.6)", blur: 2.5 },
    halo: { width: 10, color: "rgba(190,70,55,.05)" },
    roughness: 0.4,
    clearcoatRoughness: 0.06,
    envMapIntensity: 0.4,
    roughnessDry: 0.5,
    roughnessWet: 0.12,
  },
  bob: { amplitude: 0.06, speed: 1.1 },
  fog: { color: "#0c0a09", near: 12, far: 30 },
  environment: {
    fill: [0.66, 0.645, 0.64],
    blur: 0.035,
    panels: [
      { size: [8, 2.5], rgb: [6, 5.6, 5.2], position: [0, 9, 1] },
      { size: [1.5, 9], rgb: [4.5, 0.5, 0.42], position: [-8, 1, -1] },
      { size: [2, 7], rgb: [4, 3, 2.2], position: [8, 2, 3] },
      { size: [7, 1.5], rgb: [0.6, 0.6, 0.6], position: [0, 2, -9] },
      { size: [3, 3], rgb: [1.2, 1.1, 1], position: [4, -6, 4] },
    ],
  },
  backdrop: {
    glow: [0.7, 0.55],
    redBase: 0.2,
    redAtEnd: 0.55,
    redWhenOn: 0.35,
    parallax: { mouse: 0.06, scroll: 0.1 },
  },
  lights: {
    // O protótipo usava as luzes legadas do three r128 (queda linear com a
    // distância). Aqui as luzes são físicas: intensidades multiplicadas por pi
    // e decay escolhido para a queda física reproduzir a curva antiga entre a
    // distância de trabalho e o fundo da cena; conferido renderizando os dois
    // lado a lado. Valores originais (intensidade/decay): ambiente .22,
    // principal 2.8/1, recorte 1.3, mouse .7/2, neon 2.5/1.5.
    ambient: { color: { hex: "#ffe8d6", space: "srgb" }, intensity: 0.69 },
    key: {
      color: { hex: "#fff0dd", space: "linear" },
      intensity: 16.3,
      distance: 40,
      angle: 0.55,
      penumbra: 0.65,
      decay: 0.4,
      offset: [1.6, 7.5, 3.2],
    },
    rim: { color: { hex: "#E24B4A", space: "srgb" }, intensity: 4.08, position: [-5, 3, -4] },
    mouse: {
      color: { hex: "#fff6ee", space: "linear" },
      intensity: 3.14,
      distance: 6,
      decay: 1.5,
      reach: 3,
      perSection: [1, 0.12, 0.35, 1, 1, 0.12],
    },
    neon: {
      color: { hex: "#ff4a40", space: "srgb" },
      intensity: 25.1,
      distance: 16,
      decay: 1,
      position: [3.8, 4.2, -8],
    },
  },
  neon: {
    position: [3.8, 4.4, -9],
    rotationY: -0.15,
    size: [4.4, 1.375],
    glow: 2.2,
    canvas: [1024, 320],
    flicker: { rate: 8, chance: 0.015, dim: [0.25, 0.6], hum: 0.06 },
  },
  beam: { length: 12, radiusRatio: 0.28, intensity: 0.09 },
  dust: {
    count: 420,
    size: 0.03,
    color: "#FAC775",
    opacity: 0.6,
    min: [-5, -1, -5],
    max: [5, 5, 4],
  },
  arm: {
    radius: 2,
    length: 7,
    span: 2.4,
    skin: "#c48867",
    roughness: 0.66,
    bumpScale: 0.0015,
    envMapIntensity: 0.25,
    textureWidth: 768,
    tattoo: { span: 1.44, length: 2, textureWidth: 880 },
    // Pedido do cliente: pele um pouco menos clara que no protótipo.
    brightness: 0.8,
  },
  table: {
    y: -1,
    size: 40,
    roughness: 0.48,
    clearcoat: 0.35,
    clearcoatRoughness: 0.25,
    // 1 no protótipo. O reflexo rasante do verniz saía mais forte no r128;
    // 1.2 equilibra a bancada ao fundo (planos abertos) e vista de cima,
    // medido lado a lado.
    envMapIntensity: 1.2,
    repeat: [3, 6],
  },
  inkCaps: [
    { position: [-2.4, -3.3], ink: "#141210" },
    { position: [-2.05, -3], ink: "#141210" },
    { position: [-1.75, -3.4], ink: "#5F5E5A" },
    { position: [-1.45, -3.05], ink: "#141210" },
    { position: [-1.15, -3.45], ink: "#888780" },
    { position: [-1.9, -3.75], ink: "#2C2C2A" },
  ],
  bottles: [
    [-0.6, -3.4],
    [-0.2, -3.05],
  ],
  post: {
    enabled: true,
    msaaSamples: 4,
    // Protótipo (UnrealBloom): força .5, raio .5, threshold .88. Ajustado na comparação lado a lado.
    bloom: { intensity: 0.5, radius: 0.5, threshold: 0.88, smoothing: 0.03 },
    final: {
      chromaticAberration: 0.016,
      warmTint: [1.03, 0.99, 0.94],
      contrastMix: 0.25,
      vignette: 0.72,
      grain: 0.035,
    },
    beamScale: 1,
    neonGlow: 2.2,
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
    // Quadro em cromo negro com a gravação dourada (cor vem do canvas).
    frame: { color: "#ffffff", metalness: 1, roughness: 0.26, clearcoat: 0.7, clearcoatRoughness: 0.12, bumpScale: -0.004 },
    wireRed: { color: "#b0231c", metalness: 0, roughness: 0.4, clearcoat: 0.5 },
    wireBlack: { color: "#1a1918", metalness: 0, roughness: 0.4, clearcoat: 0.5 },
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
    explodeBySection: [0, 0, 0, 0, 1, 0],
    explodeLift: [0, 0.4, 0],
    // Atrasos e duração do protótipo. Origem, giro e passada definidos aqui:
    // as peças de cima vêm do lado para onde se afastam na vista explodida;
    // biqueira, grip e tubo vêm pela frente, para não atravessar braço e bancada.
    assembly: {
      start: 0.35,
      delay: { tip: 0, grip: 0.12, tube: 0.24, frame: 0.36, coil: 0.5, arm: 0.64 },
      duration: 1.3,
      from: {
        tip: [0, -0.5, 2.2],
        grip: [0, -0.3, 1.6],
        tube: [0, 0, 1.2],
        frame: [0.9, 1, 0],
        coil: [0.9, 2.7, 0],
        arm: [0.9, 4.5, 0],
      },
      spin: 0.7,
      overshoot: 0.9,
    },
    reducedSpin: 0.2,
    labelAnchors: {
      tip: [0, 0.22, 0.09],
      grip: [0, 0.9, 0.17],
      coil: [0.68, 2.76, 0.2],
      arm: [0.55, 3.15, 0.08],
    },
    labelsFrom: 0.5,
    engravingBase: "#131211",
  },
  // Tamanhos do protótipo; escalas definidas aqui.
  cursor: { ring: 34, dot: 5, follow: 13, grow: 1.6, pressed: 0.85 },
  // Quantidades, velocidades, raios e cores do protótipo; física definida aqui.
  splash: {
    onClick: 40,
    onSubmit: 90,
    speed: [1, 8],
    lift: 2,
    radius: [1, 5],
    gravity: 0.25,
    drag: 0.985,
    life: 0.8,
    colors: [
      { rgb: "226,75,74", weight: 0.35 },
      { rgb: "163,45,45", weight: 0.35 },
      { rgb: "241,239,232", weight: 0.3 },
    ],
  },
  // Revelação (.9 s) e inclinação (10°/12°, -3 px) do protótipo.
  portfolio: { columns: 4, revealDuration: 0.9, revealStagger: 0.08, tilt: [10, 12], lift: 3 },
  countUp: { duration: 1.4 },
  lightMode: {
    query: "(pointer: coarse), (max-width: 767.98px)",
    maxPixelRatio: 1.5,
    shadowMapSize: 1024,
    dust: 160,
    droplets: 35,
  },
  sceneEntry: {
    autoStart: 4500,
    fade: 0.8,
    placeholder: {
      mobile: { src: "/cena/inicio-mobile.webp", width: 618, height: 1373 },
      desktop: { src: "/cena/inicio-desktop.webp", width: 1920, height: 1080 },
      quality: 60,
    },
  },
  responsiveFov: { referenceAspect: 1.6, max: 62 },
  healing: [
    { red: 0.9, blur: 0.7, gloss: 1, milk: 0, flakes: 0, ink: 1 },
    { red: 0.45, blur: 0.45, gloss: 0.35, milk: 0.06, flakes: 0.12, ink: 1 },
    { red: 0.15, blur: 0.3, gloss: 0, milk: 0.18, flakes: 0.9, ink: 0.93 },
    { red: 0.04, blur: 0.2, gloss: 0, milk: 0.45, flakes: 0.12, ink: 0.86 },
    { red: 0, blur: 0, gloss: 0, milk: 0, flakes: 0, ink: 0.95 },
  ],
} as const satisfies VisualConfig;
