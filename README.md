# Tattoo Lucas

Landing page e portfólio do tatuador Lucas Camargo (@tattoolucas): uma máquina
de bobina em 3D que se monta sozinha, tatua o braço, mostra a cicatrização na
pele e deixa o visitante desenhar.

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
| Fotos do portfólio | `public/portfolio/` (`jesus.jpg`, `odin.jpg`, `aguia.jpg`, `armadura.jpg`, `catrina.jpg`, `navio.jpg`) |
| Foto do Lucas (retrato 4:5) | `public/lucas.jpg` |
| Envio do pedido de orçamento | `src/lib/quote.ts` |
| Desenho da tatuagem da sessão | `src/components/scene/tattooArt.ts` |

Sem as fotos, aparece um espaço reservado no lugar de cada uma. Os caminhos
podem ser trocados em `site.ts`.

## Antes de publicar

1. **Envio do orçamento**: `src/lib/quote.ts` ainda não manda o pedido para
   lugar nenhum. Em desenvolvimento ele só aparece no console; no site
   publicado o formulário mostra "Não foi possível enviar agora", para nenhum
   pedido se perder calado. O arquivo explica como ligar o WhatsApp ou um
   serviço de formulário.
2. **Domínio**: preencher `url` em `src/config/site.ts`. Sem ele, a imagem de
   compartilhamento sai com endereço relativo e o sitemap fica vazio.
3. **Endereço e WhatsApp**: `artist.address` e `artist.whatsapp` em
   `site.ts` entram nos dados estruturados (schema.org TattooParlor).

## Como está organizado

- `src/app/`: página, layout com metadados, imagem de compartilhamento e
  ícones (gerados no build com a Pirata One), robots e sitemap.
- `src/components/sections/`: as seis seções em HTML real, renderizadas no
  servidor.
- `src/components/scene/`: a cena 3D, carregada só no navegador. Cada
  arquivo cuida de uma parte: fundo, luzes, bancada, braço, tatuagem, máquina,
  sessão, desenho do visitante, pós-processamento.
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
- O aviso "THREE.Clock deprecated" no console vem de dentro do
  `@react-three/fiber`, não do código do site.
