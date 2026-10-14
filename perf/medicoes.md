# Medições de desempenho (mobile)

Como cada etapa é medida:

```bash
npm run build && npm start          # nunca em modo dev
npx lighthouse@13.5.0 http://localhost:3000 --only-categories=performance \
  --output=json --output-path=./perf/<etapa>-N.json --chrome-flags="--headless=new"
node perf/resumo.mjs perf/<etapa>-1.json perf/<etapa>-2.json perf/<etapa>-3.json
npx next analyze --output --snapshot <etapa>
npx next analyze export --snapshot <etapa> > bundle.jsonl && node perf/bundle.mjs bundle.jsonl
```

Lighthouse 13.5 em modo mobile padrão (Moto G Power emulado, 412 px, CPU 4x
e rede 4G lenta simulados), três rodadas por etapa, vale a mediana pela nota.
Só o relatório da mediana fica no repositório (`perf/<etapa>.json`).

- `resumo.mjs`: nota, métricas, elemento de LCP, maiores arquivos, tarefas longas.
- `bundle.mjs`: chunks de cliente da rota `/` a partir do analisador do
  Turbopack (`next analyze`; o `@next/bundle-analyzer` só funciona com webpack).
- `cpu.mjs`: tempo de CPU por função num trace do Chrome
  (`--save-assets --additional-trace-categories=disabled-by-default-v8.cpu_profiler`).

## Etapa 0 · baseline

| Rodada | Nota | FCP | LCP | TBT | CLS | Speed Index |
|---|---|---|---|---|---|---|
| 1 | 56 | 1,25 s | 2,73 s | 20 850 ms | 0 | 24,19 s |
| 2 (mediana) | **46** | 0,92 s | 4,29 s | 15 113 ms | 0 | 11,43 s |
| 3 | 39 | 3,67 s | 4,28 s | 14 602 ms | 0 | 11,93 s |

- **Elemento de LCP**: o parágrafo do hero ("Tatuagens exclusivas em…"), texto
  que já vem do servidor. Não é o canvas.
- **JS**: 474 KB transferidos na carga (Lighthouse). Pelo analisador, 278 KB
  (comprimido) no carregamento inicial (Next/React 211 KB, GSAP e componentes
  ~72 KB) e mais 269 KB num chunk assíncrono (990 KB sem compressão) com
  three.js 178 KB, React Three Fiber 51 KB e postprocessing 18 KB. Esse chunk é
  pedido logo depois da hidratação, então entra na carga mesmo assim.
- **Modelos 3D, texturas e HDR**: nenhum arquivo. A máquina é modelada com
  primitivas (`machineModel.ts`), as texturas são desenhadas em canvas na hora
  (pele, relevo, madeira, gravação dourada, bobinas, tatuagem) e o ambiente vem
  de uma cena simples convertida com PMREM.
- **Imagens em /public**: nenhuma (o modelo genérico vem sem fotos). Fontes:
  15,7 KB (duas woff2 da Pirata One, via next/font).
- **Tecnologia**: React Three Fiber 9 sobre three.js r186, num único `<Canvas>`
  fixo atrás da página; a câmera viaja entre as seções. Não existe uma cena por
  seção. O drei está instalado, mas não é usado.

### Maiores causas (por impacto estimado)

1. **Compilação de shaders no primeiro quadro 3D**: uma tarefa de 5,3 s
   observada (sem simulação de CPU), quase toda em `getProgramParameter` /
   `getProgramInfoLog` do three.js, que esperam a compilação e o link de cada
   programa de forma síncrona. Muitos materiais físicos diferentes
   (MeshPhysicalMaterial com verniz, mapas, relevo, sombras, névoa, envMap).
   Sozinha responde pela maior parte dos 15 s de TBT.
2. **A cena começa logo depois da hidratação**: o chunk da three.js é baixado,
   compilado e executado durante a carga, e todo o trabalho 3D cai dentro da
   janela que o Lighthouse mede.
3. **Montagem da cena na thread principal**: tarefa de 1,5 s observada com a
   árvore do R3F, as texturas procedurais geradas de uma vez (pele 768×1120 com
   9 mil pontos, relevo com 14 mil, gravação 1024×1024, madeira 1024×512,
   camadas da cicatrização com quatro desfoques) e o mapa de ambiente.
4. **Primeira pintura atrasada**: o HTML e o CSS ficam prontos em 0,14–0,3 s,
   mas o primeiro quadro com conteúdo só é exibido entre 0,5 e 2,6 s,
   disputando a thread com a hidratação e o chunk 3D. Por isso o LCP simulado
   fica em 4,3 s mesmo sendo texto.
5. **Custo contínuo de renderização**: o canvas desenha sempre (fumaça em
   shader de tela cheia, sombras, materiais físicos, partículas). Pesa menos no
   TBT, mas pesa no celular de verdade. Menores: 191 KB de JS sem uso estimado,
   14 KB de polyfills, 110 ms de CSS bloqueante.

## Etapa 1 · início sem a cena 3D na carga

| Rodada | Nota | FCP | LCP | TBT | CLS | Speed Index | JS na carga |
|---|---|---|---|---|---|---|---|
| 1 | 81 | 1,49 s | 2,94 s | 471 ms | 0 | 4,03 s | 200 KB |
| 2 | 86 | 1,40 s | 2,73 s | 329 ms | 0 | 4,12 s | 200 KB |
| 3 (mediana) | **85** | 0,92 s | 2,72 s | 422 ms | 0 | 2,70 s | 200 KB |

- A cena só carrega na primeira interação (toque, rolagem, mouse, teclado)
  ou 4,5 s depois de a página carregar e ficar ociosa. Até lá, uma imagem do
  estúdio sem a máquina (`public/cena/`, 6 KB em AVIF no celular) fica no
  fundo; com o primeiro quadro pronto a cena aparece por cima em 0,8 s e a
  máquina se monta como antes. Nada muda de posição: CLS 0.
- O elemento de LCP continua sendo o parágrafo do hero (texto), não o canvas
  nem a imagem.
- Custo da cena quando ela entra (`npm run cena:testar`, celular emulado, CPU
  4x): 8,4 s até o primeiro quadro, 7,9 s de bloqueio, maior tarefa 5,7 s.
  O Lighthouse não vê esse custo; é o alvo das etapas 3 e 4.
- O FCP observado nas rodadas do Lighthouse (1,2–2,6 s) é bem maior que fora
  dele (0,17–0,33 s com o Chrome já aberto): parte do atraso é o Chrome frio
  que o Lighthouse abre a cada rodada. Uma página HTML trivial pinta em 92 ms
  no mesmo ambiente, então o resto vem do trabalho de JS antes da pintura.

## Etapa 2 · partes da cena sob demanda

| Rodada | Nota | FCP | LCP | TBT | CLS | Speed Index | JS na carga |
|---|---|---|---|---|---|---|---|
| 1 | 71 | 1,46 s | 2,64 s | 1 247 ms | 0 | 3,49 s | 200 KB |
| 2 | 83 | 1,36 s | 2,79 s | 418 ms | 0 | 4,06 s | 200 KB |
| 3 (mediana) | **81** | 1,43 s | 2,84 s | 498 ms | 0 | 4,07 s | 200 KB |

- O pós-processamento (bloom, grão, vinheta, aberração) só existe fora do
  modo leve e agora vem num chunk próprio (20 KB comprimido, 75 KB bruto),
  que o celular nunca baixa. O JS 3D do celular foi de 269 para 253 KB
  comprimido. Com pós-processamento, a cena só aparece depois que ele chegou,
  então o visual não troca na frente de ninguém. `perf/bundle-etapa2.txt`.
- Three.js não está no carregamento inicial (`next analyze`): fica num chunk
  assíncrono que só é pedido quando a cena acorda.
- A carga medida pelo Lighthouse é a mesma da etapa 1 (mesmos scripts; um
  chunk de 6,5 KB com as referências dos imports mudou 28 bytes). A queda de
  85 para 81 é ruído: a máquina estava com pouca memória livre (1–3 GB de
  8 GB) e a rodada 1 teve um TBT fora da curva. Por isso não foi revertida.
- O que o roteiro pedia ao pé da letra (uma cena por seção, montar a ~1 tela
  de distância, desmontar ao sair) não se aplica: é uma cena só, contínua, com
  a câmera viajando entre as seções, sempre visível no fundo. A pausa com a
  aba oculta já existia.

## Etapa 3 · texturas fora da thread principal

Não há modelos .glb/.gltf, texturas em arquivo nem HDR para comprimir com
gltf-transform: tudo é desenhado em canvas na hora. O equivalente aqui foi
tirar esse desenho (pele 768×1120, relevo, madeira, gravação 1024×1024,
bobinas, recartilhado, rótulo e as seis camadas da cicatrização) da thread
principal: ele roda num Web Worker com OffscreenCanvas e volta como
ImageBitmap. Sem worker (Safari antigo), desenha na página, uma textura por
tarefa. A cicatrização não é sequência de imagens: são seis camadas
compostas num canvas conforme o dia, e isso continua igual.

Custo da cena ao entrar (celular emulado, CPU 4x, Chrome novo a cada rodada
para o cache de shaders começar vazio; medianas de 3):

| | Até o 1º quadro | Bloqueio | Maior tarefa |
|---|---|---|---|
| Etapa 2 | 9,52 s | 9,06 s | 6,73 s |
| Etapa 3 | 9,75 s | 8,98 s | 6,45 s |

- Praticamente empate: aqui a compilação de shaders (maior tarefa, o
  primeiro quadro) domina tudo. Quando ela sair do caminho (etapa 4), o
  desenho das texturas passa a ser uma fatia maior; o worker é reavaliado lá.
- Armadilha encontrada no caminho: com o estúdio esperando as texturas, um
  quadro era desenhado antes do mapa de ambiente existir e todos os shaders
  compilavam duas vezes (12,8 s). O ambiente agora é gerado junto com o
  canvas, enquanto o worker desenha, e os shaders compilam uma vez.
- `willReadFrequently` (canvas na CPU) foi testado e não ajudou.
- Visual conferido nas fotos de cada seção: pele, tatuagem do Dia 0 ao 30,
  bancada e gravação da máquina iguais às da etapa 2.
- O Lighthouse não muda (a cena não carrega durante a medição).
