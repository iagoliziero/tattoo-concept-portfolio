// Textos, dados e imagens do site, tipados.
// Para trocar uma foto, coloque o arquivo no caminho indicado dentro de /public.

import type { LabeledPart } from "./visual";

export type SectionId = "inicio" | "sessao" | "cura" | "trabalhos" | "sobre" | "contato";
export type PortfolioCategory = "Religioso" | "Realismo" | "Black & gray" | "Colorido";

export interface ImageRef {
  /** Caminho a partir de /public. */
  src: string;
  alt: string;
}

export interface PortfolioItem {
  id: string;
  title: string;
  /** Filtros em que o trabalho aparece. */
  categories: readonly PortfolioCategory[];
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
  contact: {
    kicker: string;
    title: string;
    text: string;
    instagramCta: string;
    whatsappCta: string;
    /** Mensagem que já abre escrita no WhatsApp. */
    whatsappMessage: string;
    form: {
      title: string;
      name: string;
      idea: string;
      ideaLabel: string;
      place: string;
      places: readonly string[];
      image: {
        label: string;
        hint: string;
        change: string;
        remove: string;
        /** Tamanho máximo, em MB. */
        maxMb: number;
        tooBig: string;
        wrongType: string;
      };
      submit: string;
      errors: { name: string; idea: string; place: string };
      sending: string;
      failed: string;
      sent: string;
      sentWithImage: string;
      reply: string;
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
    description: `${artist.name}, tatuador especialista em realismo e black & gray em ${artist.city} desde ${artist.since}. Veja o portfólio, a cicatrização dia a dia e peça seu orçamento.`,
    imageAlt: `${artist.name}, tatuador de realismo e black & gray em ${artist.city}`,
  },
  nav: [
    { id: "inicio", label: "Início" },
    { id: "sessao", label: "Sessão" },
    { id: "cura", label: "Cura" },
    { id: "trabalhos", label: "Trabalhos" },
    { id: "sobre", label: "Sobre" },
    { id: "contato", label: "Contato" },
  ],
  hero: {
    kicker: `Tatuador · ${artist.city} · desde ${artist.since}`,
    titleLines: ["Lucas", "Camargo"],
    text: "Realismo e black & gray de São Paulo. Do grafite à agulha, mais de duas décadas criando peças exclusivas para cada cliente.",
    primaryCta: { label: "Pedir orçamento", to: "contato" },
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
    text: "Role a página e veja a tatuagem cicatrizar na pele, dia a dia.",
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
      { value: "Colorido", label: "Colorido" },
    ],
    // Fotos em public/portfolio.
    items: [
      {
        id: "polvo",
        title: "Polvo e caveira",
        categories: ["Realismo", "Black & gray"],
        caption: "Black & gray · braço fechado",
        image: { src: "/portfolio/tatto-ex1.jpg", alt: "Braço fechado em black and gray com caveira, polvo, bússola e tinteiro" },
      },
      {
        id: "anjo-maria",
        title: "Anjo e Maria",
        categories: ["Religioso", "Realismo", "Black & gray"],
        caption: "Black & gray · braço fechado",
        image: { src: "/portfolio/tatto-ex2.jpg", alt: "Braço fechado com anjo em oração, terço, nuvens e Nossa Senhora" },
      },
      {
        id: "crucificacao",
        title: "Crucificação",
        categories: ["Religioso", "Realismo", "Black & gray"],
        caption: "Black & gray · costas",
        image: { src: "/portfolio/tatto-ex3.jpg", alt: "Costas fechadas com Cristo crucificado, anjos, pomba e portões do céu" },
      },
      {
        id: "anjo-guardiao",
        title: "Anjo guardião",
        categories: ["Religioso", "Realismo", "Black & gray"],
        caption: "Black & gray · braço e mão",
        image: { src: "/portfolio/tatto-ex4.jpg", alt: "Braço fechado com estátua de anjo no ombro e rosto de Cristo na mão" },
      },
      {
        id: "aguias-caveiras",
        title: "Águias e caveiras",
        categories: ["Black & gray"],
        caption: "Black & gray · costas",
        image: { src: "/portfolio/tatto-ex5.jpg", alt: "Costas fechadas com duas águias, caveiras e ornamentos em black and gray" },
      },
      {
        id: "rosas-olho",
        title: "Rosas e olho",
        categories: ["Black & gray"],
        caption: "Black & gray · braço fechado",
        image: { src: "/portfolio/tatto-ex6.jpg", alt: "Braço fechado com rosas, árvore, ornamentos e olho dentro de um triângulo" },
      },
      {
        id: "sao-jorge",
        title: "São Jorge",
        categories: ["Religioso", "Colorido"],
        caption: "Colorido · braço",
        image: { src: "/portfolio/tatto-ex7.jpg", alt: "São Jorge colorido a cavalo enfrentando o dragão" },
      },
      {
        id: "jesus",
        title: "Jesus em oração",
        categories: ["Religioso", "Realismo", "Black & gray"],
        caption: "Realismo · antebraço",
        image: { src: "/portfolio/tatto-ex8.jpg", alt: "Rosto de Jesus com coroa de espinhos e mãos em oração no antebraço" },
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
  contact: {
    kicker: "06 · Contato",
    title: "Fale com o Lucas",
    text: "Conte sua ideia e, se tiver, mande uma imagem de referência. O Lucas responde com o orçamento.",
    instagramCta: "Chamar no Instagram",
    whatsappCta: "Chamar no WhatsApp",
    whatsappMessage: "Olá, Lucas! Vim pelo site e quero um orçamento.",
    form: {
      title: "Ou peça pelo site",
      name: "Seu nome",
      idea: "Conte a ideia: tema, tamanho, referência",
      ideaLabel: "Sua ideia",
      place: "Local do corpo",
      places: ["Braço", "Antebraço", "Costas", "Perna", "Peito", "Outro"],
      image: {
        label: "Imagem de referência",
        hint: "Opcional · JPG, PNG ou WEBP até 10 MB",
        change: "Trocar imagem",
        remove: "Remover",
        maxMb: 10,
        tooBig: "A imagem precisa ter até 10 MB.",
        wrongType: "Envie uma imagem (JPG, PNG ou WEBP).",
      },
      submit: "Pedir orçamento",
      errors: {
        name: "Diga como podemos te chamar.",
        idea: "Descreva a ideia ou envie uma imagem de referência.",
        place: "Escolha o local do corpo.",
      },
      sending: "Enviando…",
      failed: "Não foi possível enviar agora. Tente de novo em instantes.",
      sent: "Pedido enviado.",
      sentWithImage: "Pedido enviado com sua referência.",
      reply: "O Lucas responde em breve.",
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
