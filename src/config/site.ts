// Textos, dados e imagens do site, tipados.
// Para trocar uma foto, coloque o arquivo no caminho indicado dentro de /public.

import type { LabeledPart } from "./visual";

export type SectionId = "inicio" | "sessao" | "cura" | "trabalhos" | "sobre" | "tatuar";
export type PortfolioCategory = "Religioso" | "Realismo" | "Black & gray";

export interface ImageRef {
  /** Caminho a partir de /public. */
  src: string;
  alt: string;
}

export interface PortfolioItem {
  id: string;
  title: string;
  category: PortfolioCategory;
  caption: string;
  image: ImageRef;
}

export interface HealingStage {
  title: string;
  tip: string;
}

export interface SiteConfig {
  /**
   * Endereço do site publicado, como "https://tattoolucas.com.br". Usado na
   * imagem de compartilhamento, no sitemap e nos dados estruturados. A preencher.
   */
  url: string | null;
  artist: {
    name: string;
    brand: string;
    city: string;
    state: string;
    /** Ano em que começou a tatuar; os anos de carreira são calculados. */
    since: number;
    instagram: {
      handle: string;
      url: string;
      followers: { value: number; suffix: string };
    };
    /** A preencher. */
    address: string | null;
    /** A preencher, só números com DDI e DDD (ex.: 5511999999999). */
    whatsapp: string | null;
    /** Retrato 4:5. */
    photo: ImageRef;
  };
  meta: { title: string; description: string; imageAlt: string };
  nav: readonly { id: SectionId; label: string }[];
  sound: { on: string; off: string; label: string };
  hero: {
    kicker: string;
    titleLines: readonly [string, string];
    text: string;
    primaryCta: { label: string; to: SectionId };
    secondaryCta: { label: string; to: SectionId };
    scrollHint: string;
  };
  session: {
    kicker: string;
    title: string;
    text: string;
    status: { idle: string; running: string; done: string };
    replay: string;
  };
  healing: {
    kicker: string;
    title: string;
    text: string;
    sliderLabel: string;
    dayMarks: readonly string[];
    disclaimer: string;
    /** Dia 0, 3, 7, 15 e 30. */
    stages: readonly [HealingStage, HealingStage, HealingStage, HealingStage, HealingStage];
  };
  portfolio: {
    kicker: string;
    title: string;
    filters: readonly { value: PortfolioCategory | "all"; label: string }[];
    items: readonly PortfolioItem[];
    instagramCta: string;
  };
  about: {
    kicker: string;
    title: string;
    story: string;
    yearsLabel: string;
    followersLabel: string;
    machineHint: string;
  };
  tattoo: {
    kicker: string;
    title: string;
    text: string;
    /** Versão do texto para telas de toque. */
    textTouch: string;
    tools: { line: string; shade: string; clear: string };
    form: {
      name: string;
      idea: string;
      ideaLabel: string;
      place: string;
      places: readonly string[];
      submit: string;
      errors: { name: string; idea: string; place: string };
      sending: string;
      failed: string;
      sent: string;
      sentWithDrawing: string;
      reply: string;
      drawingAlt: string;
    };
  };
  machine: { labels: Record<LabeledPart, string> };
  /** Textos que aparecem dentro da cena 3D. */
  scene: { neonTitle: string; neonSubtitle: string; bottleLabel: string };
}

const artist = {
  name: "Lucas Camargo",
  brand: "Tattoo Lucas",
  city: "São Paulo",
  state: "SP",
  since: 2004,
  instagram: {
    handle: "@tattoolucas",
    url: "https://www.instagram.com/tattoolucas/",
    followers: { value: 160, suffix: " mil+" },
  },
  address: null,
  whatsapp: null,
  photo: { src: "/lucas.jpg", alt: "Foto de Lucas Camargo" },
} as const satisfies SiteConfig["artist"];

export const site = {
  url: null,
  artist,
  meta: {
    title: `${artist.name} · Tatuador de realismo e black & gray em ${artist.city}`,
    description: `${artist.name}, tatuador especialista em realismo e black & gray em ${artist.city} desde ${artist.since}. Veja a cicatrização, o portfólio e desenhe sua ideia direto na pele.`,
    imageAlt: `${artist.name}, tatuador de realismo e black & gray em ${artist.city}`,
  },
  nav: [
    { id: "inicio", label: "Início" },
    { id: "sessao", label: "Sessão" },
    { id: "cura", label: "Cura" },
    { id: "trabalhos", label: "Trabalhos" },
    { id: "sobre", label: "Sobre" },
    { id: "tatuar", label: "Tatuar" },
  ],
  sound: {
    label: "Som",
    on: "Desligar som da máquina",
    off: "Ligar som da máquina",
  },
  hero: {
    kicker: `Tatuador · ${artist.city} · desde ${artist.since}`,
    titleLines: ["Lucas", "Camargo"],
    text: "Realismo e black & gray de São Paulo. Do grafite à agulha, mais de duas décadas criando peças exclusivas para cada cliente.",
    primaryCta: { label: "Tatue você mesmo", to: "tatuar" },
    secondaryCta: { label: "Ver trabalhos", to: "trabalhos" },
    scrollHint: "Role para ver a máquina em ação",
  },
  session: {
    kicker: "02 · A sessão",
    title: "Cada sombra conta",
    text: "Material estéril, técnica apurada e paciência para cada detalhe.",
    status: { idle: "Máquina em espera", running: "Tatuando…", done: "Sessão concluída" },
    replay: "Ver de novo",
  },
  healing: {
    kicker: "03 · Ciclo de vida",
    title: "Da agulha à pele curada",
    text: "Arraste a linha do tempo e veja a tatuagem cicatrizar na pele, dia a dia.",
    sliderLabel: "Linha do tempo da cicatrização",
    dayMarks: ["Dia 0", "3", "7", "15", "30"],
    disclaimer: "Siga sempre as orientações do seu tatuador.",
    stages: [
      {
        title: "Dia 0 · Recém-feita",
        tip: "Pele avermelhada e sensível, com brilho de pomada. Mantenha limpa e siga o curativo indicado.",
      },
      {
        title: "Dia 3 · Desinchando",
        tip: "A vermelhidão diminui. Lave com sabonete neutro e use uma camada fina de pomada, como indicado.",
      },
      {
        title: "Dia 7 · Descamação",
        tip: "Coceira e pelinhas soltando. Não coce nem arranque: hidrate e deixe sair sozinho.",
      },
      {
        title: "Dia 15 · Fase leitosa",
        tip: "O desenho pode parecer opaco e esbranquiçado. É normal: a pele nova ainda está se formando.",
      },
      {
        title: "Dia 30 · Cicatrizada",
        tip: "Cinzas assentados e traço nítido. Use protetor solar para preservar o degradê por anos.",
      },
    ],
  },
  portfolio: {
    kicker: "04 · Portfólio",
    title: "Trabalhos do Lucas",
    filters: [
      { value: "all", label: "Todos" },
      { value: "Religioso", label: "Religioso" },
      { value: "Realismo", label: "Realismo" },
      { value: "Black & gray", label: "Black & gray" },
    ],
    items: [
      {
        id: "jesus",
        title: "Jesus",
        category: "Religioso",
        caption: "Black & gray · religioso",
        image: { src: "/portfolio/jesus.jpg", alt: "Jesus em black and gray" },
      },
      {
        id: "odin",
        title: "Odin",
        category: "Realismo",
        caption: "Realismo · mitologia nórdica",
        image: { src: "/portfolio/odin.jpg", alt: "Odin realista" },
      },
      {
        id: "aguia",
        title: "Águia",
        category: "Black & gray",
        caption: "Black & gray · fauna",
        image: { src: "/portfolio/aguia.jpg", alt: "Águia em black and gray" },
      },
      {
        id: "armadura",
        title: "Armadura",
        category: "Realismo",
        caption: "Realismo · antebraço",
        image: { src: "/portfolio/armadura.jpg", alt: "Armadura realista no antebraço" },
      },
      {
        id: "catrina",
        title: "Catrina",
        category: "Black & gray",
        caption: "Black & gray · chicano",
        image: { src: "/portfolio/catrina.jpg", alt: "Catrina chicana" },
      },
      {
        id: "navio",
        title: "Navio",
        category: "Black & gray",
        caption: "Black & gray · marítimo",
        image: { src: "/portfolio/navio.jpg", alt: "Navio em black and gray" },
      },
    ],
    instagramCta: "Ver todos os trabalhos no Instagram",
  },
  about: {
    kicker: "05 · Sobre",
    title: "Do grafite à agulha",
    story:
      "Lucas começou a tatuar em 2004, depois de anos no grafite, que até hoje guia sua composição. Hoje se dedica quase só ao preto e cinza, com peças exclusivas para cada cliente.",
    yearsLabel: "anos de carreira",
    followersLabel: "seguidores no Instagram",
    machineHint: "A máquina, peça por peça →",
  },
  tattoo: {
    kicker: "06 · Tatue você mesmo",
    title: "Desenhe direto na pele",
    text: "Segure o clique sobre o braço: a máquina segue o mouse e tatua. Use Sombra para fazer graywash.",
    textTouch: "Arraste o dedo sobre o braço: a máquina segue e tatua. Use Sombra para fazer graywash.",
    tools: { line: "Traço", shade: "Sombra", clear: "Limpar" },
    form: {
      name: "Seu nome",
      idea: "Conte a ideia: tema, referência",
      ideaLabel: "Sua ideia",
      place: "Local do corpo",
      places: ["Braço", "Antebraço", "Costas", "Perna", "Peito", "Outro"],
      submit: "Pedir orçamento com desenho",
      errors: {
        name: "Diga como podemos te chamar.",
        idea: "Descreva a ideia ou desenhe no braço.",
        place: "Escolha o local do corpo.",
      },
      sending: "Enviando…",
      failed: "Não foi possível enviar agora. Tente de novo em instantes.",
      sent: "Pedido enviado.",
      sentWithDrawing: "Pedido enviado com seu desenho.",
      reply: "O Lucas responde em breve.",
      drawingAlt: "Seu desenho",
    },
  },
  machine: {
    labels: {
      tip: "Biqueira de aço cirúrgico",
      grip: "Grip recartilhado",
      coil: "Bobinas de cobre",
      arm: "Armadura e molas",
    },
  },
  scene: {
    neonTitle: "Lucas",
    neonSubtitle: "black & gray · realismo",
    bottleLabel: "Black ink",
  },
} as const satisfies SiteConfig;
