// Caminho do Chrome instalado, para os scripts com puppeteer-core.
import { existsSync } from "node:fs";

const { PROGRAMFILES, LOCALAPPDATA } = process.env;
const candidates = {
  win32: [
    `${PROGRAMFILES}\\Google\\Chrome\\Application\\chrome.exe`,
    `${process.env["PROGRAMFILES(X86)"]}\\Google\\Chrome\\Application\\chrome.exe`,
    `${LOCALAPPDATA}\\Google\\Chrome\\Application\\chrome.exe`,
  ],
  darwin: ["/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"],
  linux: ["/usr/bin/google-chrome", "/usr/bin/chromium", "/usr/bin/chromium-browser"],
};

export function chromePath() {
  const path = process.env.CHROME_PATH ?? candidates[process.platform]?.find((file) => existsSync(file));
  if (!path) throw new Error("Chrome não encontrado: defina CHROME_PATH com o caminho do executável.");
  return path;
}

/**
 * O Chrome sem janela herda a preferência de animações do sistema: num
 * Windows com "Mostrar animações" desligado, a página veria movimento
 * reduzido. Os testes fixam o caso comum (sem preferência), como no
 * PageSpeed Insights; o movimento reduzido é testado à parte.
 */
export const normalMotion = ["--force-prefers-no-reduced-motion"];

/** Celular de referência do Lighthouse (Moto G Power) e uma tela grande comum. */
export const viewports = {
  mobile: { width: 412, height: 823, deviceScaleFactor: 1.75, isMobile: true, hasTouch: true },
  desktop: { width: 1440, height: 900, deviceScaleFactor: 1 },
};
