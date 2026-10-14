// Resume relatórios do Lighthouse (JSON) e aponta a mediana pela nota.
// Uso: node perf/resumo.mjs perf/baseline-1.json perf/baseline-2.json perf/baseline-3.json

import { readFileSync } from "node:fs";

const files = process.argv.slice(2);
if (!files.length) {
  console.error("Uso: node perf/resumo.mjs <relatorio.json>...");
  process.exit(1);
}

const ms = (v) => `${Math.round(v)} ms`;
const s = (v) => `${(v / 1000).toFixed(2)} s`;

const runs = files.map((file) => {
  const lhr = JSON.parse(readFileSync(file, "utf8"));
  const audit = (id) => lhr.audits[id];
  // No Lighthouse 13 o elemento de LCP vem no insight de LCP.
  const lcpElement = (audit("lcp-breakdown-insight")?.details?.items ?? []).find((item) => item.type === "node");
  const weight = audit("total-byte-weight")?.details?.items ?? [];
  const byType = {};
  for (const item of audit("network-requests")?.details?.items ?? []) {
    const type = item.resourceType ?? "Other";
    byType[type] = (byType[type] ?? 0) + (item.transferSize ?? 0);
  }
  return {
    file,
    score: Math.round(lhr.categories.performance.score * 100),
    fcp: audit("first-contentful-paint").numericValue,
    lcp: audit("largest-contentful-paint").numericValue,
    tbt: audit("total-blocking-time").numericValue,
    cls: audit("cumulative-layout-shift").numericValue,
    si: audit("speed-index").numericValue,
    tti: audit("interactive")?.numericValue,
    totalBytes: audit("total-byte-weight").numericValue,
    byType,
    lcpElement: lcpElement ? `${lcpElement.nodeLabel} (${lcpElement.selector})` : "?",
    heaviest: weight.slice(0, 8).map((i) => `${(i.totalBytes / 1024).toFixed(1)} KB  ${i.url}`),
    mainThread: (audit("mainthread-work-breakdown")?.details?.items ?? []).map(
      (i) => `${i.groupLabel}: ${ms(i.duration)}`,
    ),
    bootup: (audit("bootup-time")?.details?.items ?? [])
      .slice(0, 6)
      .map((i) => `${ms(i.total)} (script ${ms(i.scripting)})  ${i.url}`),
    longTasks: (audit("long-tasks")?.details?.items ?? []).slice(0, 8).map((i) => `${ms(i.duration)} @ ${ms(i.startTime)}  ${i.url}`),
    lcpPhases: (audit("lcp-breakdown-insight")?.details?.items?.[0]?.items ?? []).map(
      (i) => `${i.label ?? i.subpart}: ${ms(i.duration)}`,
    ),
  };
});

for (const r of runs) {
  console.log(
    `${r.file}: nota ${r.score} · FCP ${s(r.fcp)} · LCP ${s(r.lcp)} · TBT ${ms(r.tbt)} · CLS ${r.cls.toFixed(3)} · SI ${s(r.si)} · JS ${(r.byType.Script / 1024).toFixed(0)} KB`,
  );
}

const median = [...runs].sort((a, b) => a.score - b.score || a.tbt - b.tbt)[Math.floor(runs.length / 2)];
console.log(`\nMediana: ${median.file}`);
console.log(JSON.stringify(median, null, 2));
