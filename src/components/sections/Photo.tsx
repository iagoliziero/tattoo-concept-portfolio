import { hasPublicFile } from "@/lib/server";
import { PhotoFrame, type PhotoFrameProps } from "./PhotoFrame";

/** PhotoFrame que confere no servidor se a foto já foi colocada em /public. */
export function Photo(props: Omit<PhotoFrameProps, "hasPhoto">) {
  return <PhotoFrame {...props} hasPhoto={hasPublicFile(props.image.src)} />;
}
