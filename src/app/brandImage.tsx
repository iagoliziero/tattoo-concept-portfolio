import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { ImageResponse } from "next/og";
import { site } from "@/config/site";
import { visual } from "@/config/visual";

// Imagens geradas no build: compartilhamento (Open Graph) e ícones do site.
// A Pirata One vem em TTF de assets/fonts (licença OFL, em assets/fonts/OFL.txt).

// Lida no topo do módulo, como na documentação: assim as imagens saem prontas do build.
const pirataOne = await readFile(join(process.cwd(), "assets/fonts/PirataOne-Regular.ttf"));
const fonts = [{ name: "Pirata One", data: pirataOne, style: "normal" as const, weight: 400 as const }];
const { colors } = visual;

export function shareImage(size: { width: number; height: number }) {
  const { artist } = site;
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          padding: "0 96px",
          background: `radial-gradient(circle at 78% 40%, #3a1d14 0%, ${colors.background} 62%)`,
          color: colors.text,
        }}
      >
        <div style={{ display: "flex", fontSize: 30, letterSpacing: 5, color: colors.red }}>
          {`Tatuador · ${artist.city} · desde ${artist.since}`}
        </div>
        <div style={{ display: "flex", fontFamily: "Pirata One", fontSize: 170, lineHeight: 0.95, marginTop: 18 }}>
          {artist.name}
        </div>
        <div style={{ display: "flex", fontSize: 34, color: colors.textSecondary, marginTop: 28 }}>
          Portfólio e orçamento · {artist.instagram.handle}
        </div>
      </div>
    ),
    { ...size, fonts },
  );
}

/** Ícone com a inicial do nome do tatuador. */
export function iconImage(size: { width: number; height: number }) {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: colors.background,
          color: colors.red,
          fontFamily: "Pirata One",
          fontSize: size.height * 0.86,
          lineHeight: 1,
          borderRadius: size.width > 64 ? 0 : size.width * 0.2,
        }}
      >
        {site.artist.name.charAt(0)}
      </div>
    ),
    { ...size, fonts },
  );
}
