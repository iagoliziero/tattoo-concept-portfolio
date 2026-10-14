// Testa a cena 3D num build de produção rodando (npm run build && npm start).
//
// 1. Custo de entrada: celular emulado com a CPU 4x mais lenta (como o
//    Lighthouse). Acorda a cena e mede o tempo até o primeiro quadro e as
//    tarefas longas no caminho. O Lighthouse não vê esse custo, porque a cena
//    só entra depois de uma interação.
// 2. Telas: foto de cada seção no celular e numa tela grande (mais a Cura no
//    Dia 30), e os erros do console.
//
// Uso: node scripts/testar-cena.mjs [url] [pasta das fotos]
//      node scripts/testar-cena.mjs [url] --custo N   (só o custo de entrada, N vezes, com a mediana)

import { mkdir, writeFile } from "node:fs/promises";
import puppeteer from "puppeteer-core";
import { chromePath, viewports } from "./chrome.mjs";

const url = process.argv[2] ?? "http://localhost:3000";
const costOnly = process.argv[3] === "--custo";
const repeats = costOnly ? Number(process.argv[4] ?? 3) : 1;
const out = costOnly ? "perf/telas" : (process.argv[3] ?? "perf/telas");
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
const READY = '[data-scene][data-ready="true"]';

function collectErrors(page) {
  const errors = [];
  page.on("pageerror", (error) => errors.push(error.message));
  page.on("console", (message) => {
    if (message.type() === "error" || message.type() === "warn") errors.push(`${message.type()}: ${message.text()}`);
  });
  return errors;
}

/** Tarefas longas desde o começo da página, registradas no próprio navegador. */
function watchLongTasks(page) {
  return page.evaluateOnNewDocument(() => {
    window.__longTasks = [];
    new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) window.__longTasks.push([entry.startTime, entry.duration]);
    }).observe({ type: "longtask", buffered: true });
  });
}

const blocking = (tasks) => Math.round(tasks.reduce((sum, [, duration]) => sum + Math.max(0, duration - 50), 0));

async function entryCost(browser) {
  const page = await browser.newPage();
  const errors = collectErrors(page);
  // Texturas desenhadas num Web Worker (sceneTextures.ts): conta quantos a página criou.
  let workers = 0;
  page.on("workercreated", () => (workers += 1));
  await page.setViewport(viewports.mobile);
  const cdp = await page.createCDPSession();
  await cdp.send("Emulation.setCPUThrottlingRate", { rate: 4 });
  await watchLongTasks(page);
  await page.goto(url, { waitUntil: "load", timeout: 120_000 });
  await sleep(1500);
  const wokeAt = await page.evaluate(() => {
    const now = performance.now();
    window.dispatchEvent(new Event("pointerdown"));
    return now;
  });
  await page.waitForSelector(READY, { timeout: 180_000 });
  const readyAt = await page.evaluate(() => performance.now());
  await sleep(3000);
  const tasks = await page.evaluate(() => window.__longTasks);
  const before = tasks.filter(([start]) => start < wokeAt);
  const after = tasks.filter(([start]) => start >= wokeAt);
  await page.close();
  return {
    carregamentoAntesDaCena: { tarefasLongas: before.length, bloqueioMs: blocking(before) },
    entradaDaCena: {
      ateOPrimeiroQuadroMs: Math.round(readyAt - wokeAt),
      tarefasLongas: after.length,
      bloqueioMs: blocking(after),
      maiorTarefaMs: Math.round(Math.max(0, ...after.map(([, duration]) => duration))),
      workers,
      /** [início depois do gatilho, duração], em ms. */
      tarefas: after.map(([start, duration]) => [Math.round(start - wokeAt), Math.round(duration)]),
    },
    erros: errors,
  };
}

async function screens(browser, name, viewport) {
  const page = await browser.newPage();
  const errors = collectErrors(page);
  await page.setViewport(viewport);
  await page.goto(url, { waitUntil: "load", timeout: 120_000 });
  await sleep(500);
  await page.screenshot({ path: `${out}/${name}-0-antes-da-cena.png` });
  await page.evaluate(() => window.dispatchEvent(new Event("pointerdown")));
  await page.waitForSelector(READY, { timeout: 180_000 });
  await sleep(3000);
  const ids = await page.$$eval("[data-section]", (sections) => sections.map((section) => section.id));
  for (const [i, id] of ids.entries()) {
    await page.evaluate((target) => document.querySelector(`a[href="#${target}"]`)?.click(), id);
    // A sessão leva alguns segundos tatuando; as outras só esperam a câmera.
    await sleep(i === 1 ? 7000 : 3000);
    await page.screenshot({ path: `${out}/${name}-${i + 1}-${id}.png` });
    if (i === 2) {
      // Cura: cada seta avança um dia, até o Dia 30.
      for (let day = 0; day < 4; day++) {
        await page.keyboard.press("ArrowDown");
        await sleep(1200);
      }
      await page.screenshot({ path: `${out}/${name}-${i + 1}-${id}-dia30.png` });
    }
  }
  await page.close();
  return errors;
}

await mkdir(out, { recursive: true });
const browser = await puppeteer.launch({ executablePath: chromePath(), headless: true });
try {
  if (costOnly) {
    // Um Chrome novo (perfil temporário) por rodada: o cache de shaders começa
    // vazio, como na primeira visita de alguém. No mesmo navegador, a segunda
    // rodada reaproveitaria os shaders já compilados.
    const runs = [];
    for (let i = 0; i < repeats; i++) {
      const fresh = await puppeteer.launch({ executablePath: chromePath(), headless: true });
      const { entradaDaCena, erros } = await entryCost(fresh);
      await fresh.close();
      runs.push(entradaDaCena);
      console.log(JSON.stringify({ ...entradaDaCena, erros }));
    }
    const median = [...runs].sort((a, b) => a.bloqueioMs - b.bloqueioMs)[Math.floor(runs.length / 2)];
    console.log("Mediana pelo bloqueio:", JSON.stringify(median));
    process.exit(0);
  }
  const cost = await entryCost(browser);
  const mobileErrors = await screens(browser, "mobile", viewports.mobile);
  const desktopErrors = await screens(browser, "desktop", viewports.desktop);
  const result = { ...cost, erros: [...cost.erros, ...mobileErrors, ...desktopErrors] };
  await writeFile(`${out}/resultado.json`, JSON.stringify(result, null, 2));
  console.log(JSON.stringify(result, null, 2));
  console.log(`Fotos em ${out}/`);
} finally {
  await browser.close();
}
