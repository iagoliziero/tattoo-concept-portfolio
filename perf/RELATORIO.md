# Relatório · desempenho mobile

Branch `perf/otimizacao-mobile`, um commit por etapa. Números etapa a etapa,
com todas as rodadas, em [`medicoes.md`](medicoes.md).

## Resumo

Lighthouse mobile, mediana de 3 rodadas. Antes (`main`) e depois medidos em
sequência, na mesma máquina e com as mesmas opções:

| | Nota | FCP | LCP | TBT | CLS | Speed Index | JS na carga |
|---|---|---|---|---|---|---|---|
| Antes | 36 | 3,73 s | 4,85 s | 21 313 ms | 0 | 12,04 s | 474 KB |
| Depois | **80** | 1,76 s | 2,86 s | 497 ms | 0 | 4,13 s | 200 KB |

SEO, Acessibilidade e Boas práticas: 100 antes e 100 depois.

- **Nota ≥ 85: não atingida** nesta máquina. A mediana final é 80 (rodadas de
  77 a 81). Na etapa 1 deu 85, com a máquina menos carregada e o Chrome
  herdando o movimento reduzido do Windows (ver "Como foi medido").
- **LCP < 2,5 s: não** (2,86 s). **TBT < 200 ms: não** (497 ms).
  **CLS < 0,1: sim** (0 em todas as rodadas).
- O que mais pesava (a cena 3D inteira dentro da carga, com 15 a 21 s de
  bloqueio) saiu da carga. O que sobra é hidratação do React/Next e a criação
  dos trechos fixos da rolagem (GSAP). O que falta para 85+ está em "O que
  ficou de fora".

O Lighthouse não vê a cena 3D (ela entra depois da primeira interação), mas o
visitante sente. Custo dela ao entrar, num celular emulado com CPU 4x mais
lenta e Chrome novo a cada rodada (cache de shaders vazio, como na primeira
visita), mediana de 3:

| | Até o primeiro quadro | Bloqueio da página | Maior tarefa |
|---|---|---|---|
| Antes (cena original) | 9,5 s | 9,1 s | 6,7 s |
| Depois | **5,7–6,4 s** | **4,9–5,2 s** | **2,4–2,6 s** |

## Como foi medido

- `npm run build && npm start`, Lighthouse 13.5 (Moto G Power emulado,
  412 px, CPU 4x e 4G lenta simulados), 3 rodadas, mediana pela nota
  (`perf/medir.mjs`). Analisador de bundle do Turbopack (`next analyze`;
  o `@next/bundle-analyzer` só funciona com webpack).
- Custo da cena: `npm run cena:testar -- <url> --custo 3`. Fotos de cada
  seção a cada etapa: `npm run cena:testar` (em `perf/telas/`, fora do git).
- Máquina: Windows 10, Intel HD 620 (Direct3D 11), 8 GB de RAM com 1 a 3 GB
  livres durante as medições. A mesma build variou de 75 a 81 entre rodadas;
  diferenças de 3 a 5 pontos entre etapas que não mexem na carga são ruído.
- O Chrome sem janela herda a preferência de animações do sistema, e neste
  Windows ela está desligada: as etapas 0 a 5 rodaram com movimento reduzido
  (igual para todas). A etapa 6 e a comparação final fixam "sem preferência"
  (`--force-prefers-no-reduced-motion`), como no PageSpeed Insights.
  **Isso vale para o seu navegador também**: com "Efeitos de animação"
  desligado no Windows (Configurações › Acessibilidade › Efeitos visuais),
  o site mostra a versão com movimento reduzido.

## Arquivos

| Arquivo | Antes | Depois |
|---|---|---|
| Modelos 3D (.glb/.gltf), texturas e HDR | nenhum | nenhum |
| Imagem do estúdio, celular (`public/cena/inicio-mobile.webp`) | não existia | 21 KB na fonte; servida em AVIF com 5,8 KB |
| Imagem do estúdio, tela grande (`public/cena/inicio-desktop.webp`) | não existia | 247 KB na fonte; servida em AVIF com 9,9 KB (1920 px) |
| Fotos em `public/` | nenhuma (modelo sem fotos) | nenhuma |
| JS na carga (transferido) | 474 KB | 200 KB |
| JS da cena 3D, celular (comprimido) | 269 KB, baixado na carga | 255 KB + 10 KB do worker, só quando a cena entra |
| Pós-processamento (comprimido) | dentro do chunk 3D | 20 KB num chunk à parte, só em telas grandes |

Não havia modelos nem texturas em arquivo para comprimir com gltf-transform:
a máquina é feita de primitivas e as texturas são desenhadas em canvas na
hora. O equivalente aqui foi tirar esse desenho da thread principal (etapa 3).

## O que foi feito em cada etapa

| Etapa | Commit | Nota (mediana) | LCP | TBT | Cena: 1º quadro / bloqueio / maior tarefa |
|---|---|---|---|---|---|
| 0 · medição base | `2738e4e` | 46 | 4,29 s | 15 113 ms | (dentro da carga) |
| 1 · início sem a cena 3D | `36078f9` | 85 | 2,72 s | 422 ms | 8,4 s / 7,9 s / 5,7 s |
| 2 · pós-processamento sob demanda | `67cee5a` | 81 | 2,84 s | 498 ms | 9,5 s / 9,1 s / 6,7 s |
| 3 · texturas num Web Worker | `97879a5` | (carga igual) | | | 9,8 s / 9,0 s / 6,5 s |
| 4 · shaders sem travar a página | `b1984c6` | 79 | 2,61 s | 729 ms | 5,7 s / 4,9 s / 2,6 s |
| 5 · tamanhos das imagens | `9cdb912` | 81 | 2,85 s | 467 ms | (sem mudança) |
| 6 · movimento reduzido e aparelhos limitados | `c4eb13a` | 78* | 2,90 s | 553 ms | 6,4 s / 5,2 s / 2,4 s* |

\* Sem preferência de movimento reduzido; as anteriores rodaram com ela.
As notas das etapas 2 a 6 variam com a máquina: a carga medida é a mesma
desde a etapa 1 (mesmos 200 KB de JS).

1. **Início sem a cena 3D na carga.** Era a causa de quase todo o TBT: o
   chunk da three.js (990 KB sem compressão) era baixado e executado logo
   depois da hidratação, e o primeiro quadro compilava todos os shaders de
   uma vez (5,3 s observados). Agora a cena só carrega na primeira interação
   (toque, rolagem, mouse, teclado) ou 4,5 s depois de a página ficar
   ociosa. Até lá, uma imagem do estúdio fica no fundo (next/image, AVIF,
   prioridade alta); com o primeiro quadro pronto, a cena aparece por cima
   em 0,8 s e a máquina se monta como antes. Nada muda de lugar: CLS 0. O
   elemento de LCP é o parágrafo do início, não o canvas nem a imagem.
   *Por que o estúdio sem a máquina:* com a máquina na imagem, ela sumiria
   na troca, porque a cena começa com as peças voando para se montar. Seria
   preciso tirar a montagem, que é um efeito.
2. **Pós-processamento sob demanda.** Bloom, grão, vinheta e aberração só
   rodam em telas grandes; agora vêm num chunk à parte, que o celular nunca
   baixa. *O que não se aplica:* separar uma cena por seção, montar perto da
   tela e desmontar ao sair. É uma cena só, contínua, sempre no fundo, com a
   câmera viajando entre as seções.
3. **Texturas num Web Worker.** Pele, relevo, madeira, gravação da máquina,
   bobinas, rótulo e as camadas da cicatrização são desenhadas com
   OffscreenCanvas fora da thread principal (sem worker, uma por tarefa). Na
   medição, poupa ~0,5 s de bloqueio quando a cena entra, que é justamente
   quando a pessoa começou a rolar. No caminho apareceu uma compilação dupla
   de shaders (um quadro saía antes do mapa de ambiente), corrigida.
4. **Shaders sem travar a página.** `compileAsync` com
   KHR_parallel_shader_compile antes do primeiro quadro, checagem de erros
   de shader desligada em produção, sem sombras dinâmicas no celular, `dpr`
   entre 1 e 1,5 com o `PerformanceMonitor` do drei e a geometria do feixe
   liberada ao sair. Auditoria: nenhum objeto criado e nenhum estado React
   alterado dentro de `useFrame`. `frameloop="demand"` não se aplica no modo
   normal: fumaça, poeira, neon, máquina flutuando e feixe animam o tempo
   todo.
5. **Imagens e o resto da página.** `sizes` refeitos a partir do CSS
   (retrato, cards do portfólio, lightbox); galeria e retrato com lazy
   loading (conferido no HTML); a imagem do estúdio com `loading="eager"`.
   Fontes (next/font, swap, só a Pirata One) e terceiros (nenhum) já estavam
   certos.
6. **Aparelhos limitados.** Com movimento reduzido a cena vira imagem
   parada e só desenha quando algo muda: com a página parada, 285 → 39,5
   ms/s de CPU e nenhum desenho WebGL; a sessão continua tatuando. Sem
   WebGL2 a cena nem carrega, e um error boundary desliga só a cena se o
   WebGL falhar (antes, a página inteira caía). Abaixo de 1 GB de memória
   declarada, fica a imagem.

### Tentado e revertido

- **CSS embutido no HTML** (`experimental.inlineCss`): mediana 80 com, 81
  sem; LCP 2,98 s com, 2,85 s sem.
- **`willReadFrequently` nas texturas**: nenhum ganho.
- **Espaçadores da rolagem vindos do servidor** (`pinSpacer`, para o GSAP não
  mover as seções na hidratação): mediana 75 contra 80, LCP sem melhora.

## O que ficou de fora e o que ainda daria para fazer

Em ordem de ganho estimado na nota:

1. **Trechos fixos da rolagem com CSS `position: sticky` em vez do `pin` do
   GSAP.** A criação dos 6 trechos custa ~160 ms de CPU com layout forçado,
   dentro da hidratação (~600 ms na simulação 4x), e é a maior parte do TBT
   restante. Ganho estimado: TBT de ~500 para ~150–250 ms, +5 a 8 pontos. Não
   foi feito porque mexe na mecânica da rolagem (encaixe nas seções, Cura em
   etapas, saltos do menu), com risco de mudar o comportamento visual.
   Precisa da sua aprovação.
2. **Menos JS na hidratação.** Cursor, respingos, etiquetas da máquina e
   contadores podem carregar depois da primeira pintura (`next/dynamic` ou
   em momento ocioso). Ganho estimado: 20–40 KB e ~0,1–0,2 s de LCP, +1 a 3
   pontos.
3. **Mapa de ambiente pré-gerado.** O PMREM roda na entrada da cena
   (1,6–2,2 s com CPU 4x) e o three r186 só o gera de forma síncrona. Gerado
   no build e carregado como textura, a entrada fica ~1,5 s mais rápida. Não
   muda o Lighthouse e precisa comparar os reflexos lado a lado.
4. **Primeiro quadro no Direct3D** (~2,4 s com CPU 4x): mesmo com
   compilação paralela, o driver finaliza variantes dos shaders no primeiro
   desenho. Juntar materiais físicos parecidos (hoje são 14 só na máquina)
   reduziria as variantes. Ganho estimado: ~1 s na entrada. No Android
   (OpenGL ES/Vulkan) a compilação paralela costuma resolver mais.
5. **Cicatrização.** Hoje são 6 camadas compostas num canvas 2D (880×611) a
   cada mudança de dia e reenviadas à GPU. Opções, que o roteiro pedia para
   mostrar antes de implementar:
   - (a) shader que mistura as camadas na GPU, com os pesos de cada dia
     como uniforms: sem composição na CPU nem reenvio. É a recomendada;
   - (b) compor no worker;
   - (c) resolução menor no celular.

   Nenhuma foi implementada.
6. **Ajustes que dependem de você:** limite de memória para ficar só com a
   imagem (hoje < 1 GB, bem conservador; 2 GB pegaria mais aparelhos fracos)
   e sombra no celular (desligada como pedido; uma sombra simples sob a
   máquina devolveria parte do efeito por quase nada).
