// Testa a cena em aparelhos limitados, num build de produção rodando
// (npm run build && npm start):
// 1. Sem WebGL: a página continua inteira e a imagem do estúdio fica no fundo.
// 2. Movimento reduzido: com a cena parada, quanto a página gasta de CPU
//    (comparado ao movimento normal) e se a sessão ainda tatua.
//
// Uso: node scripts/testar-fallbacks.mjs [url] [pasta das fotos]

import { mkdir, writeFile } from "node:fs/promises";
import puppeteer from "puppeteer-core";
import { chromePath, normalMotion, viewports } from "./chrome.mjs";

const url = process.argv[2] ?? "http://localhost:3000";
const out = process.argv[3] ?? "perf/telas/fallbacks";
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
const READY = '[data-scene][data-ready="true"]';

async function withoutWebGL() {
  const browser = await puppeteer.launch({ executablePath: chromePath(), headless: true, args: ["--disable-3d-apis"] });
  try {
    const page = await browser.newPage();
    const uncaught = [];
    page.on("pageerror", (error) => uncaught.push(error.message));
    await page.setViewport(viewports.mobile);
    await page.goto(url, { waitUntil: "load" });
    await page.evaluate(() => window.dispatchEvent(new Event("pointerdown")));
    await sleep(6000);
    const state = await page.evaluate(() => {
      const image = document.querySelector("[data-scene] img");
      return {
        cenaPronta: document.querySelector("[data-scene]")?.getAttribute("data-ready"),
        imagemVisivel: image ? getComputedStyle(image).visibility === "visible" && image.complete : false,
        titulo: document.querySelector("h1")?.textContent,
        secoes: document.querySelectorAll("[data-section]").length,
      };
    });
    await page.screenshot({ path: `${out}/sem-webgl.png` });
    return { ...state, errosNaoTratados: uncaught };
  } finally {
    await browser.close();
  }
}

/** CPU da thread principal (ms por segundo) com a página parada, cena já na tela. */
async function idleCost(reduced) {
  const browser = await puppeteer.launch({ executablePath: chromePath(), headless: true, args: normalMotion });
  try {
    const page = await browser.newPage();
    if (reduced) await page.emulateMediaFeatures([{ name: "prefers-reduced-motion", value: "reduce" }]);
    // Conta as chamadas de desenho do WebGL: parada, a cena sob demanda não desenha nada.
    await page.evaluateOnNewDocument(() => {
      window.__draws = 0;
      const proto = WebGL2RenderingContext.prototype;
      for (const name of ["drawElements", "drawArrays"]) {
        const original = proto[name];
        proto[name] = function (...args) {
          window.__draws += 1;
          return original.apply(this, args);
        };
      }
    });
    await page.setViewport(viewports.mobile);
    await page.goto(url, { waitUntil: "load" });
    await page.evaluate(() => window.dispatchEvent(new Event("pointerdown")));
    await page.waitForSelector(READY, { timeout: 180_000 });
    await sleep(2000);
    const cdp = await page.createCDPSession();
    await cdp.send("Performance.enable");
    const task = async () =>
      (await cdp.send("Performance.getMetrics")).metrics.find((m) => m.name === "TaskDuration").value;
    const before = await task();
    const drawsBefore = await page.evaluate(() => window.__draws);
    await sleep(4000);
    const cpuMsPerSecond = Math.round(((await task()) - before) * 1000) / 4;
    const drawsPerSecond = Math.round(((await page.evaluate(() => window.__draws)) - drawsBefore) / 4);
    let session = null;
    if (reduced) {
      // A sessão continua sendo conteúdo: a máquina ainda tatua.
      await page.evaluate(() => document.querySelector('a[href="#sessao"]')?.click());
      await sleep(7000);
      session = await page.evaluate(() => document.querySelector('[role="status"]')?.textContent?.trim());
      await page.screenshot({ path: `${out}/reduzido-sessao.png` });
    }
    return {
      cpuMsPorSegundoParada: cpuMsPerSecond,
      desenhosWebGLPorSegundoParada: drawsPerSecond,
      ...(session ? { statusDaSessao: session } : {}),
    };
  } finally {
    await browser.close();
  }
}

await mkdir(out, { recursive: true });
const result = {
  semWebGL: await withoutWebGL(),
  movimentoNormal: await idleCost(false),
  movimentoReduzido: await idleCost(true),
};
await writeFile(`${out}/resultado.json`, JSON.stringify(result, null, 2));
console.log(JSON.stringify(result, null, 2));
