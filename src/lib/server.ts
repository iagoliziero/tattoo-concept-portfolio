import fs from "node:fs";
import path from "node:path";
import { cacheLife } from "next/cache";
import { site } from "@/config/site";

/** Anos de carreira, recalculados uma vez por dia. */
export async function getCareerYears() {
  "use cache";
  cacheLife("days");
  return new Date().getFullYear() - site.artist.since;
}

/** Diz se a foto configurada já foi colocada em /public. */
export function hasPublicFile(src: string) {
  return fs.existsSync(path.join(process.cwd(), "public", src));
}
