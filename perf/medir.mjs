// Roda o Lighthouse mobile três vezes contra um build de produção rodando
// (npm run build && npm start) e guarda só o relatório da mediana pela nota.
// Uso: node perf/medir.mjs <etapa> [url] [categorias]

import { execSync } from "node:child_process";
import { readFileSync, renameSync, rmSync } from "node:fs";

const [label, url = "http://localhost:3000", categories = "performance"] = process.argv.slice(2);
if (!label) {
  console.error("Uso: node perf/medir.mjs <etapa> [url] [categorias]");
  process.exit(1);
}

// Aquece o otimizador de imagens: a primeira conversão para AVIF não entra na medida.
const html = await (await fetch(url)).text();
const images = new Set([...html.matchAll(/\/_next\/image\?[^\s"',]+/g)].map((m) => m[0].replaceAll("&amp;", "&")));
for (const path of images) await fetch(new URL(path, url), { headers: { accept: "image/avif,image/webp,*/*" } });

const runs = [1, 2, 3].map((n) => {
  const file = `perf/${label}-${n}.json`;
  execSync(
    `npx -y lighthouse@13.5.0 ${url} --only-categories=${categories} --output=json --output-path=${file} --chrome-flags="--headless=new" --quiet`,
    { stdio: "inherit" },
  );
  const lhr = JSON.parse(readFileSync(file, "utf8"));
  return { file, score: lhr.categories.performance?.score ?? 0, tbt: lhr.audits["total-blocking-time"]?.numericValue ?? 0 };
});

execSync(`node perf/resumo.mjs ${runs.map((r) => r.file).join(" ")}`, { stdio: "inherit" });
const median = [...runs].sort((a, b) => a.score - b.score || a.tbt - b.tbt)[1];
renameSync(median.file, `perf/${label}.json`);
for (const run of runs) if (run !== median) rmSync(run.file);
console.log(`\nMediana guardada em perf/${label}.json`);
