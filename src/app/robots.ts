import type { MetadataRoute } from "next";
import { site } from "@/config/site";

export default function robots(): MetadataRoute.Robots {
  const url: string | null = site.url;
  return {
    rules: { userAgent: "*", allow: "/" },
    sitemap: url ? `${url}/sitemap.xml` : undefined,
  };
}
