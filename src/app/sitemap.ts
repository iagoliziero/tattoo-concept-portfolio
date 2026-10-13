import type { MetadataRoute } from "next";
import { site } from "@/config/site";

// O sitemap precisa do endereço completo; fica vazio até site.url ser preenchido.
export default function sitemap(): MetadataRoute.Sitemap {
  const url: string | null = site.url;
  return url ? [{ url, changeFrequency: "monthly", priority: 1 }] : [];
}
