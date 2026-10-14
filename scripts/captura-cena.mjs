// Gera as imagens do estúdio que aparecem enquanto a cena 3D carrega
// (visual.sceneEntry.placeholder): a cena do início sem a máquina, que se
// monta por cima quando a cena chega. Uma imagem para o modo leve (celular,
// sem pós-processamento) e outra para telas grandes. Rode de novo sempre que
// mudar algo que aparece no fundo do início: neon, cores, luzes, bancada.
//
// Uso: npm run dev (em outro terminal) e depois npm run cena:captura [url]
// Precisa do modo de desenvolvimento, que expõe a cena em window.__scene.

import { mkdir } from "node:fs/promises";
import { dirname } from "node:path";
import puppeteer from "puppeteer-core";
import sharp from "sharp";
import { chromePath } from "./chrome.mjs";

const url = process.argv[2] ?? "http://localhost:3000";
// Proporções de celulares e monitores comuns. Com object-fit: cover, telas
// mais estreitas cortam as laterais, como a câmera da cena também faz.
const variants = [
  {
    file: "public/cena/inicio-mobile.webp",
    viewport: { width: 412, height: 915, deviceScaleFactor: 1.5, isMobile: true, hasTouch: true },
  },
  { file: "public/cena/inicio-desktop.webp", viewport: { width: 1920, height: 1080, deviceScaleFactor: 1 } },
];

const browser = await puppeteer.launch({ executablePath: chromePath(), headless: true });
try {
  for (const { file, viewport } of variants) {
    const page = await browser.newPage();
    // Sem piscadas do neon e sem montagem: o quadro fica estável para a foto.
    await page.emulateMediaFeatures([{ name: "prefers-reduced-motion", value: "reduce" }]);
    await page.setViewport(viewport);
    await page.goto(url, { waitUntil: "load", timeout: 180_000 });
    await page.evaluate(() => window.dispatchEvent(new Event("scroll")));
    await page.waitForSelector('[data-scene][data-ready="true"]', { timeout: 180_000 });
    const hasScene = await page.evaluate(() => Boolean(window.__scene));
    if (!hasScene) throw new Error("window.__scene não existe: rode com npm run dev.");
    await page.evaluate(() => {
      window.__scene.scene.getObjectByName("machine").visible = false;
      // Indicador do modo de desenvolvimento do Next (fica num shadow DOM).
      for (const portal of document.querySelectorAll("nextjs-portal")) portal.remove();
    });
    await page.addStyleTag({
      content: "body > :not([data-scene]), [data-scene] picture { visibility: hidden !important; }",
    });
    await new Promise((resolve) => setTimeout(resolve, 1500));
    const png = await page.screenshot({ type: "png" });
    await mkdir(dirname(file), { recursive: true });
    const info = await sharp(png).webp({ quality: 90 }).toFile(file);
    console.log(`${file}: ${info.width}×${info.height}, ${(info.size / 1024).toFixed(0)} KB`);
    console.log(`  em visual.sceneEntry.placeholder: width ${info.width}, height ${info.height}`);
    await page.close();
  }
} finally {
  await browser.close();
}
