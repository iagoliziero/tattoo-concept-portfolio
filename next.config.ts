import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  cacheComponents: true,
  partialPrefetching: true,
  images: {
    // AVIF onde o navegador aceita, WebP no resto.
    formats: ["image/avif", "image/webp"],
    // 60: imagem do estúdio enquanto a cena 3D carrega (visual.sceneEntry); 75: o padrão.
    qualities: [60, 75],
  },
};

export default nextConfig;
