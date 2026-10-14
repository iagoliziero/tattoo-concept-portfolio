// Textos, dados e imagens do site, tipados.
// Para trocar uma foto, coloque o arquivo no caminho indicado dentro de /public.
// Os dados do tatuador (nome, marca, cidade, contatos, história, portfólio) são
// de exemplo: troque pelos do cliente. A lista do que preencher está no README.

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
   * Endereço do site publicado, como "https://seuestudio.com.br". Usado na
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
      /** A preencher. Sem ele, os botões do Instagram ficam no lugar, mas sem link. */
      url: string | null;
      followers: { value: number; suffix: string };
    };
    /** A preencher. */
    address: string | null;
    /**
     * A preencher, só números com DDI e DDD (ex.: 5511999999999). Sem ele, o
     * botão do WhatsApp fica no lugar, mas sem link.
     */
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
  name: "Nome Sobrenome",
  brand: "Seu Estúdio",
  city: "Sua Cidade",
  state: "UF",
  since: 2015,
  instagram: {
    handle: "@seuinstagram",
    url: null,
    followers: { value: 10, suffix: " mil+" },
  },
  address: null,
  whatsapp: null,
  photo: { src: "/tatuador.jpg", alt: "Foto do tatuador" },
} as const satisfies SiteConfig["artist"];

export const site = {
  url: null,
  artist,
  meta: {
    title: `${artist.name} · Tatuador em ${artist.city}`,
    description: `${artist.name}, tatuador em ${artist.city} desde ${artist.since}. Veja o portfólio, a cicatrização dia a dia e peça seu orçamento.`,
    imageAlt: `${artist.name}, tatuador em ${artist.city}`,
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
    titleLines: ["Nome", "Sobrenome"],
    text: `Tatuagens exclusivas em ${artist.city}, do primeiro esboço à pele cicatrizada. Cada peça nasce da sua ideia e é desenhada só para você.`,
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
    title: "Trabalhos recentes",
    filters: [
      { value: "all", label: "Todos" },
      { value: "Religioso", label: "Religioso" },
      { value: "Realismo", label: "Realismo" },
      { value: "Black & gray", label: "Black & gray" },
      { value: "Colorido", label: "Colorido" },
    ],
    // Fotos em public/portfolio. Títulos, legendas e filtros são de exemplo;
    // no alt, descreva o que aparece na foto.
    items: [
      {
        id: "trabalho-1",
        title: "Trabalho 01",
        categories: ["Realismo", "Black & gray"],
        caption: "Black & gray · braço fechado",
        image: { src: "/portfolio/tatto-ex1.jpg", alt: "Trabalho 01 do portfólio" },
      },
      {
        id: "trabalho-2",
        title: "Trabalho 02",
        categories: ["Religioso", "Realismo", "Black & gray"],
        caption: "Black & gray · braço fechado",
        image: { src: "/portfolio/tatto-ex2.jpg", alt: "Trabalho 02 do portfólio" },
      },
      {
        id: "trabalho-3",
        title: "Trabalho 03",
        categories: ["Religioso", "Realismo", "Black & gray"],
        caption: "Black & gray · costas",
        image: { src: "/portfolio/tatto-ex3.jpg", alt: "Trabalho 03 do portfólio" },
      },
      {
        id: "trabalho-4",
        title: "Trabalho 04",
        categories: ["Religioso", "Realismo", "Black & gray"],
        caption: "Black & gray · braço e mão",
        image: { src: "/portfolio/tatto-ex4.jpg", alt: "Trabalho 04 do portfólio" },
      },
      {
        id: "trabalho-5",
        title: "Trabalho 05",
        categories: ["Black & gray"],
        caption: "Black & gray · costas",
        image: { src: "/portfolio/tatto-ex5.jpg", alt: "Trabalho 05 do portfólio" },
      },
      {
        id: "trabalho-6",
        title: "Trabalho 06",
        categories: ["Black & gray"],
        caption: "Black & gray · braço fechado",
        image: { src: "/portfolio/tatto-ex6.jpg", alt: "Trabalho 06 do portfólio" },
      },
      {
        id: "trabalho-7",
        title: "Trabalho 07",
        categories: ["Religioso", "Colorido"],
        caption: "Colorido · braço",
        image: { src: "/portfolio/tatto-ex7.jpg", alt: "Trabalho 07 do portfólio" },
      },
      {
        id: "trabalho-8",
        title: "Trabalho 08",
        categories: ["Religioso", "Realismo", "Black & gray"],
        caption: "Realismo · antebraço",
        image: { src: "/portfolio/tatto-ex8.jpg", alt: "Trabalho 08 do portfólio" },
      },
    ],
    instagramCta: "Ver todos os trabalhos no Instagram",
  },
  about: {
    kicker: "05 · Sobre",
    title: "Por trás da máquina",
    story: `Começou a tatuar em ${artist.since} e, desde então, transforma ideias em peças únicas. Cada projeto começa numa conversa e ganha um desenho feito do zero.`,
    yearsLabel: "anos de carreira",
    followersLabel: "seguidores no Instagram",
    machineHint: "A máquina, peça por peça →",
  },
  contact: {
    kicker: "06 · Contato",
    title: "Marque sua sessão",
    text: "Conte sua ideia e, se tiver, mande uma imagem de referência. A resposta vem com o orçamento.",
    instagramCta: "Chamar no Instagram",
    whatsappCta: "Chamar no WhatsApp",
    whatsappMessage: "Olá! Vim pelo site e quero um orçamento.",
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
      reply: "Você recebe a resposta em breve.",
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
    neonTitle: "Tattoo",
    neonSubtitle: "arte na pele",
    bottleLabel: "Black ink",
  },
} as const satisfies SiteConfig;
