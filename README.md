# Tattoo Concept Portfolio

Modelo de landing page e portfólio para tatuador: uma máquina de bobina em 3D
que se monta sozinha, tatua o braço e mostra a cicatrização na pele conforme a
página rola. Termina no contato, com pedido de orçamento e imagem de
referência. Os dados do tatuador vêm de exemplo; para montar o site de um
cliente, veja [Para um novo tatuador](#para-um-novo-tatuador).

Next.js (App Router, TypeScript), React Three Fiber, drei,
@react-three/postprocessing, three.js e GSAP ScrollTrigger. O protótipo
aprovado e a especificação estão em `referencia/`.

## Rodar

```bash
npm install
npm run dev      # http://localhost:3000
npm run build    # build de produção
npm run start    # serve o build
npm run lint
```

## Onde mexer

| O quê | Onde |
|---|---|
| Textos, dados do tatuador, portfólio, formulário, domínio | `src/config/site.ts` |
| Cores, fontes, câmera, luzes, materiais, animações, efeitos | `src/config/visual.ts` |
| Fotos do portfólio (8, em duas linhas de 4) | `public/portfolio/tatto-ex1.jpg` a `tatto-ex8.jpg`; títulos e filtros em `site.ts` |
| Foto do tatuador (retrato 4:5) | `public/tatuador.jpg` |
| Envio do pedido de orçamento | `src/lib/quote.ts` |
| Desenho da tatuagem da sessão | `src/components/scene/tattooArt.ts` |

Se alguma foto faltar, aparece um espaço reservado no lugar. Os caminhos
podem ser trocados em `site.ts`.

## Para um novo tatuador

O modelo vem sem fotos e com dados de exemplo ("Nome Sobrenome", "Seu
Estúdio", "Sua Cidade", "@seuinstagram"). Em `src/config/site.ts`:

- `artist`: nome, marca (aparece no menu), cidade, estado, ano em que começou
  (os anos de carreira são calculados), Instagram (perfil, link e
  seguidores), endereço, WhatsApp e foto. O ícone do site usa a inicial do
  nome.
- `hero.titleLines`: o nome em duas linhas, no topo.
- `about.story`: a história do tatuador.
- `portfolio.filters` e `portfolio.items`: estilos, títulos, legendas e fotos
  dos trabalhos.
- `scene.neonTitle` e `scene.neonSubtitle`: o letreiro de neon atrás da
  máquina.

Enquanto o link do Instagram (`artist.instagram.url`) e o WhatsApp
(`artist.whatsapp`) estiverem vazios, os botões de contato continuam no lugar,
mas não levam a lugar nenhum.

## Antes de publicar

1. **Envio do orçamento**: `src/lib/quote.ts` ainda não manda o pedido para
   lugar nenhum. Em desenvolvimento ele só aparece no console; no site
   publicado o formulário mostra "Não foi possível enviar agora", para nenhum
   pedido se perder calado. O arquivo explica como ligar o WhatsApp ou um
   serviço de formulário.
2. **Domínio**: preencher `url` em `src/config/site.ts`. Sem ele, a imagem de
   compartilhamento sai com endereço relativo e o sitemap fica vazio.
3. **Contatos**: `artist.instagram.url`, `artist.whatsapp` e
   `artist.address` em `site.ts`. Preenchidos, os botões "Chamar no
   Instagram", "Chamar no WhatsApp" e "Ver todos os trabalhos no Instagram"
   passam a abrir os contatos, e os três entram nos dados estruturados
   (schema.org TattooParlor).

## Como está organizado

- `src/app/`: página, layout com metadados, imagem de compartilhamento e
  ícones (gerados no build com a Pirata One), robots e sitemap.
- `src/components/sections/`: as seis seções em HTML real, renderizadas no
  servidor.
- `src/components/scene/`: a cena 3D, carregada só no navegador. Cada
  arquivo cuida de uma parte: fundo, luzes, bancada, braço, tatuagem, máquina,
  sessão, pós-processamento.
- `src/lib/stage.ts`: estado compartilhado entre rolagem, interface e cena.
- `assets/fonts/`: Pirata One em TTF para as imagens geradas (licença OFL em
  `assets/fonts/OFL.txt`).

## Notas

- As luzes foram recalibradas para a iluminação física do three.js atual,
  comparando com o protótipo (three r128) renderizado lado a lado. Os valores
  originais estão comentados em `visual.ts`.
- Em celulares e telas de toque a cena entra em modo leve (sem MSAA e bloom,
  menos partículas). Com `prefers-reduced-motion`, não há vibração, tremores,
  cursor próprio nem respingos, e a máquina já aparece montada.
- A Cura anda em etapas: cada gesto (roda, trackpad, swipe, setas) avança ou
  volta um dia; no Dia 30 o próximo gesto para baixo segue para os Trabalhos e,
  no Dia 0, um para cima volta à Sessão (`visual.scroll.healingStep`).
- Os links do menu pulam direto para a seção, sem animar as do caminho.
- O aviso "THREE.Clock deprecated" no console vem de dentro do
  `@react-three/fiber`, não do código do site.
