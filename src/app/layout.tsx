import type { Metadata, Viewport } from "next";
import { Pirata_One } from "next/font/google";
import type { CSSProperties } from "react";
import { site } from "@/config/site";
import { visual } from "@/config/visual";
import "./globals.css";

const display = Pirata_One({
  weight: "400",
  subsets: ["latin", "latin-ext"],
  variable: "--font-display-face",
});

export const metadata: Metadata = {
  title: site.meta.title,
  description: site.meta.description,
};

export const viewport: Viewport = {
  themeColor: visual.colors.background,
  colorScheme: "dark",
};

// As cores e medidas da config viram variáveis CSS (--c-background, --c-red...),
// então os estilos nunca repetem um valor que já está em visual.ts.
const kebab = (key: string) => key.replace(/[A-Z]/g, (c) => `-${c.toLowerCase()}`);
const cssVariables = {
  ...Object.fromEntries(
    Object.entries(visual.colors).map(([key, value]) => [`--c-${kebab(key)}`, value]),
  ),
  "--font-display": `var(--font-display-face), ${visual.fonts.displayFallback}`,
  "--font-body": visual.fonts.body,
  "--font-mono": visual.fonts.mono,
  "--header-h": `${visual.layout.headerHeight}px`,
  "--radius": `${visual.layout.radius}px`,
  "--radius-panel": `${visual.layout.panelRadius}px`,
  "--stage-min-h": `${visual.layout.minStageHeight}px`,
} as CSSProperties;

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="pt-BR" className={display.variable} style={cssVariables}>
      <body>{children}</body>
    </html>
  );
}
