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
