// Resume o export do analisador do Turbopack (next analyze export): chunks de
// cliente da rota "/", o que carrega no início e o que vem por import dinâmico,
// e o peso de cada pacote.
// Uso: node perf/bundle.mjs perf/bundle-baseline.jsonl

import { readFileSync } from "node:fs";

const file = process.argv[2];
const lines = readFileSync(file, "utf8").trim().split("\n").map((line) => JSON.parse(line));
const route = "/";
const isClient = (name) => name.includes("/static/");
const kb = (bytes) => `${(bytes / 1024).toFixed(1)} KB`;

const parts = lines.filter((l) => l.type === "part" && l.route === route && isClient(l.filename));
const groups = lines.filter((l) => l.type === "group" && l.route === route);

/** Pacote (node_modules/<nome>) ou arquivo do projeto. */
function owner(sourcePath) {
  const m = sourcePath.match(/node_modules\/((?:@[^/]+\/)?[^/]+)/);
  if (m) return m[1];
  return sourcePath.replace("[project]/", "");
}

const byChunk = new Map();
for (const p of parts) {
  const chunk = byChunk.get(p.filename) ?? { size: 0, compressed: 0, owners: new Map() };
  chunk.size += p.size;
  chunk.compressed += p.compressed_size;
  const o = owner(p.source_path);
  chunk.owners.set(o, (chunk.owners.get(o) ?? 0) + p.compressed_size);
  byChunk.set(p.filename, chunk);
}

const kindOf = new Map();
for (const g of groups) {
  for (const out of g.outputs.filter(isClient)) {
    const kinds = kindOf.get(out) ?? new Set();
    kinds.add(`${g.kind}${g.trigger_module_ident ? ` <- ${owner(g.trigger_module_ident.split(" ")[0])}` : ""}`);
    kindOf.set(out, kinds);
  }
}

const chunks = [...byChunk.entries()].sort((a, b) => b[1].compressed - a[1].compressed);
let total = 0;
for (const [name, chunk] of chunks) {
  if (!name.endsWith(".js")) continue;
  total += chunk.compressed;
  const top = [...chunk.owners.entries()].sort((a, b) => b[1] - a[1]).slice(0, 6);
  console.log(`\n${name.split("/").pop()}  ${kb(chunk.compressed)} comprimido (${kb(chunk.size)} bruto)`);
  console.log(`  grupos: ${[...(kindOf.get(name) ?? ["?"])].join(" | ")}`);
  for (const [o, size] of top) console.log(`  ${kb(size).padStart(9)}  ${o}`);
}
console.log(`\nTotal JS de cliente da rota ${route}: ${kb(total)} comprimido`);

const byOwner = new Map();
for (const p of parts) {
  if (!p.filename.endsWith(".js")) continue;
  const o = owner(p.source_path);
  byOwner.set(o, (byOwner.get(o) ?? 0) + p.compressed_size);
}
console.log("\nMaiores pacotes (comprimido):");
for (const [o, size] of [...byOwner.entries()].sort((a, b) => b[1] - a[1]).slice(0, 15)) {
  console.log(`  ${kb(size).padStart(9)}  ${o}`);
}
