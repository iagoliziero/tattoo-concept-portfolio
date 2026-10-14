// Soma o tempo de CPU da thread principal num trace do Chrome (Lighthouse com
// --save-assets): tempo próprio por função e as tarefas mais longas.
// Uso: node perf/cpu.mjs <arquivo.trace.json>

import { readFileSync } from "node:fs";

const raw = JSON.parse(readFileSync(process.argv[2], "utf8"));
const events = Array.isArray(raw) ? raw : raw.traceEvents;

const main = events.find((e) => e.name === "thread_name" && e.args?.name === "CrRendererMain");
const sameThread = (e) => e.pid === main.pid && e.tid === main.tid;

// Perfil de CPU: o evento Profile abre e os ProfileChunk trazem nós e amostras.
const nodes = new Map();
const self = new Map();
const profileIds = new Set(events.filter((e) => e.name === "Profile" && e.pid === main.pid).map((e) => e.id));
for (const e of events) {
  if (e.name !== "ProfileChunk" || !profileIds.has(e.id)) continue;
  const { cpuProfile, timeDeltas = [] } = e.args.data;
  for (const node of cpuProfile?.nodes ?? []) nodes.set(node.id, node);
  const samples = cpuProfile?.samples ?? [];
  samples.forEach((id, i) => self.set(id, (self.get(id) ?? 0) + (timeDeltas[i] ?? 0) / 1000));
}

const label = (node) => {
  const { functionName, url, lineNumber, columnNumber } = node.callFrame;
  const file = url ? url.split("/").pop() : "";
  return `${functionName || "(anônima)"}${file ? `  ${file}:${lineNumber}:${columnNumber}` : ""}`;
};

const byFunction = new Map();
for (const [id, ms] of self) {
  const node = nodes.get(id);
  if (!node) continue;
  const key = label(node);
  byFunction.set(key, (byFunction.get(key) ?? 0) + ms);
}
const total = [...byFunction.values()].reduce((a, b) => a + b, 0);
console.log(`Tempo amostrado na thread principal: ${total.toFixed(0)} ms (sem simulação de CPU)\n`);
console.log("Maior tempo próprio por função:");
for (const [key, ms] of [...byFunction.entries()].sort((a, b) => b[1] - a[1]).slice(0, 35)) {
  console.log(`  ${ms.toFixed(0).padStart(6)} ms  ${key}`);
}

// Tarefas longas observadas (sem simulação) e o que as abriu.
const tasks = events
  .filter((e) => sameThread(e) && e.name === "RunTask" && e.dur > 50_000)
  .sort((a, b) => b.dur - a.dur)
  .slice(0, 12);
const t0 = events.find((e) => e.name === "navigationStart" && sameThread(e))?.ts ?? tasks[0]?.ts ?? 0;
console.log("\nTarefas longas observadas:");
for (const task of tasks) {
  const end = task.ts + task.dur;
  const inside = events.filter(
    (e) => sameThread(e) && e.ts >= task.ts && e.ts < end && e.ph === "X" && e !== task && e.dur > task.dur * 0.15,
  );
  const names = [...new Set(inside.map((e) => e.name))].slice(0, 8).join(", ");
  console.log(`  ${(task.dur / 1000).toFixed(0).padStart(6)} ms @ ${((task.ts - t0) / 1000).toFixed(0)} ms  [${names}]`);
}
