import { site } from "@/config/site";
import { shareImage } from "./brandImage";

export const alt = site.meta.imageAlt;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function Image() {
  return shareImage(size);
}
