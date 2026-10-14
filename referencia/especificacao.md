# Landing page 3D — modelo para tatuador

Quero criar a landing page/portfólio de um tatuador: escura,
cinematográfica, cheia de 3D e de interações criativas. A estrela é uma
máquina de tatuar de bobina em 3D que se monta sozinha, desce até um braço,
repassa uma tatuagem com zoom na agulha, mostra o ciclo de cicatrização na
própria pele 3D e, no final, deixa o visitante pegar a máquina com o mouse e
tatuar o braço.

O arquivo index.html anexo é o protótipo aprovado. Use-o como referência
visual e de comportamento (cores, luzes, materiais, animações, valores).

Antes de escrever código, analise o projeto (ou crie um novo), apresente um
plano em fases e confirme as dependências. Textos, dados, imagens e
parâmetros visuais ficam num arquivo de configuração tipado.

=====================================================================
## Stack

- Next.js (App Router, TypeScript) + React Three Fiber + drei +
  @react-three/postprocessing, three.js atual, GSAP + ScrollTrigger.
- Cena 3D em componentes client ('use client'), carregados com next/dynamic
  e ssr: false. Conteúdo textual renderizado no servidor, fora do canvas.
- O protótipo usa three r128: converter APIs antigas (outputEncoding →
  outputColorSpace, sRGBEncoding → SRGBColorSpace, EffectComposer antigo →
  @react-three/postprocessing) e recalibrar as intensidades de luz para a
  iluminação física atual, comparando lado a lado com o protótipo.
- Scroll nativo com seções "pinadas" via ScrollTrigger (não sequestrar a
  roda do mouse).

=====================================================================
## 1. Dados do tatuador

- Dados de exemplo, a trocar pelos de cada cliente: nome ("Nome
  Sobrenome"), marca ("Seu Estúdio"), Instagram ("@seuinstagram", link a
  preencher)
- Cidade e estado ("Sua Cidade, UF") · ano em que começou (calcular anos
  automaticamente) · seguidores no Instagram (número editável)
- História: duas ou três frases sobre a trajetória do tatuador
- Portfólio (fotos em /public/portfolio): título, legenda e estilos de cada
  trabalho, com filtros por estilo
- Foto do tatuador 4:5. A preencher: endereço do estúdio, WhatsApp, link do
  Instagram. Sem eles, os botões de contato ficam no lugar, sem link.

=====================================================================
## 2. Identidade visual

- Fundo #090807, texto #F1EFE8, secundários #D3D1C7 e #888780, vermelho
  #E24B4A (escuro #A32D2D, texto sobre vermelho #501313), dourado #d9ae58.
- Títulos em Pirata One; textos em sans limpa.
- Header fixo semitransparente: marca + navegação (Início, Sessão, Cura,
  Trabalhos, Sobre, Tatuar) + botão de som. Linha de progresso à direita.
- Cursor: anel de 34px com atraso + ponto vermelho; cresce sobre itens
  interativos; diminui sobre o braço na seção de tatuar; desligado no toque.
- Clique em área vazia solta respingos de tinta (canvas 2D por cima).

=====================================================================
## 3. Renderização

- ACES Filmic, saída sRGB, cores de material convertidas para linear.
- Sombras suaves 2048 (bias -0.0003, normalBias 0.02).
- Environment via PMREM de uma cena simples (softbox branco em cima, faixa
  vermelha à esquerda, faixa quente à direita).
- Pipeline: fundo em shader → cena → bloom (força 0.5, raio 0.5,
  threshold 0.88) → passe final (grão, vinheta, aberração cromática leve nas
  bordas, toque quente). MSAA 4x.

## 4. Fundo e ambiente

- Shader de tela cheia: fumaça fbm com domain warping (mais vermelha no
  final e com a máquina ligada), brilho atrás da máquina seguindo a posição
  dela na tela, raios de luz do canto superior, vinheta.
- Neon "Tattoo / arte na pele" (editável) atrás da máquina, letras em
  contorno, sem tone mapping (cor ~2.2 para bloom), piscando, com luz
  vermelha junto.
- Spot quente seguindo o foco da câmera, recorte vermelho, ambiente fraco,
  luz fraca seguindo o mouse (quase apagada nos closes).
- Feixe volumétrico do refletor, poeira dourada, bancada de madeira
  envernizada, batoques de tinta e frascos "Black ink".

=====================================================================
## 5. A máquina

Modelo glTF de qualidade com licença livre, ou modelada com primitivas
(ponta da agulha na origem, tubo para +Y):
- LatheGeometry cromada para biqueira e grip, luva recartilhada preta com
  O-rings vermelhos, tubo cromado, morsa em cromo negro, manípulo de latão.
- Quadro em Shape com cantos arredondados, extrudado com bisel, cromo negro
  com clearcoat e gravação dourada (filete + vinhas com espirais e rosetas)
  num canvas alinhado ao Shape, também como bumpMap negativo.
- Bobinas de cobre com resina (clearcoat 1), arruelas vermelhas, armadura e
  molas de aço, parafuso de contato e manípulos de latão, bornes, capacitor
  azul, fios, cabo vermelho com plugue cromado. MeshPhysicalMaterial.
- 6 grupos (biqueira, grip, tubo, quadro, bobinas, armadura): montagem
  animada na abertura (atraso ~0.12s, ~1.3s cada) e vista explodida na
  seção Sobre com etiquetas HTML projetadas das peças.
- Ligada: vibração, agulha oscilando, armadura tremendo, gotículas de tinta.

=====================================================================
## 6. Braço, tatuagem e ciclo de vida

- Braço: segmento de cilindro deitado; pele procedural (#c48867, manchas,
  veias sutis, poros, sardas, bordas transparentes), material fosco
  (roughness ~0.66, envMapIntensity ~0.25, sem emissivo), bump sutil.
- Tatuagem (serpente com punhal, fácil de trocar por SVG) desenhada num
  canvas aplicado num segundo segmento de cilindro sobre a pele.
- Função que converte coordenadas do desenho em posição 3D na superfície e
  em pixel no canvas (e o inverso, a partir de um ponto 3D do raycast).
- Ciclo de vida com 5 estágios interpolados por um valor de 0 a 4:
  Dia 0 recém-feita, Dia 3 desinchando, Dia 7 descamação, Dia 15 fase
  leitosa, Dia 30 cicatrizada. Camadas pré-calculadas a partir da tatuagem:
  vermelhidão (halo elíptico + tatuagem borrada tingida de vermelho), traço
  levemente borrado (inchaço), véu leitoso, pelinhas de descamação, faixas
  de brilho de pomada. Compor num canvas quando o valor mudar.
- Material da tatuagem em MeshPhysicalMaterial: clearcoat e roughness
  acompanham o brilho de pomada (fresca = clearcoat alto e roughness baixo;
  curada = fosca), para o reflexo reagir de verdade à luz.
- Cada estágio tem título e dica de cuidado; aviso "Siga sempre as
  orientações do seu tatuador".

## 7. Tatue você mesmo

- Uma área livre do braço (ao lado da tatuagem, fora das bordas
  transparentes) tem um terceiro canvas/segmento para o desenho do visitante.
- Raycast do mouse no braço: a ponta da agulha segue o ponto com suavização,
  com a máquina mais inclinada para não tampar a vista; segurar o clique
  liga a máquina (vibração, gotículas, zumbido) e pinta no canvas.
- Ferramentas: Traço (linha escura ~3.4px com leve vermelhidão), Sombra
  (pinceladas radiais muito transparentes que acumulam como graywash),
  Limpar.
- Formulário ao lado: nome, ideia, local do corpo; validação por campo; o
  pedido sai com miniatura do desenho anexada (em produção, enviar a imagem
  junto ao WhatsApp/serviço de formulário escolhido).

=====================================================================
## 8. Seções e câmera (FOV ~38, interpolação smoothstep/slerp)

1. Início: máquina flutuando à direita, girando e reagindo ao cursor; texto
   com cidade e ano, nome gigante, frase, botões "Tatue você mesmo" e
   "Ver trabalhos".
2. A sessão: máquina desce inclinada; push-in na agulha ao ligar; percorre
   as linhas da tatuagem pronta (~1.6 un/s, levanta ~0.16 entre traços),
   deixando a pele no estado "recém-feita"; micro tremor; painel com LED,
   status, progresso e "Ver de novo".
3. Ciclo de vida: câmera de cima sobre a tatuagem (deslocada para ficar ao
   lado do painel); linha do tempo roda sozinha de 0 a 30 dias ao entrar e
   pode ser arrastada; máquina flutua ao fundo.
4. Portfólio: câmera recua; filtros Todos, Religioso, Realismo, Black &
   gray; cards com foto em preto e branco que ganha cor no hover, revelação
   animada, inclinação 3D, lightbox; link para o Instagram.
5. Sobre: foto do tatuador, história, contadores (anos de carreira e
   seguidores), máquina em vista explodida com etiquetas.
6. Tatue você mesmo: câmera de cima sobre a área livre do braço; painel com
   ferramentas e formulário; contato (Instagram, cidade e estado).

## 9. Som (Web Audio, desligado por padrão)

Zumbido: dente-de-serra ~110 Hz + quadrada 55 Hz em passa-banda 900 Hz,
mais ruído passa-alta 2500 Hz; liga sempre que a máquina vibra.

## 10. SEO, performance e acessibilidade

- HTML real (h1 com o nome), metadata, Open Graph, dados estruturados de
  estúdio de tatuagem (TattooParlor).
- Pausar renderização fora da tela/aba oculta; pixel ratio máx. 2; modo
  leve no celular (sem MSAA e bloom, menos partículas); no toque, a seção
  de tatuar usa arrastar com o dedo.
- prefers-reduced-motion: sem vibração e tremores, máquina já montada.
- Teclado, foco visível, aria-labels, contraste adequado.

## 11. Processo

Fases, testando e me mostrando cada uma: (1) estrutura, conteúdo, config,
scroll; (2) fundo, luzes, bancada, braço; (3) máquina, montagem, vista
explodida; (4) sessão; (5) ciclo de vida; (6) tatue você mesmo + formulário;
(7) portfólio, sobre, cursor, respingos, som, pós-processamento;
(8) performance, responsividade, acessibilidade e SEO. Ao final de cada fase:
rodar, checar o console e fazer commit.
```