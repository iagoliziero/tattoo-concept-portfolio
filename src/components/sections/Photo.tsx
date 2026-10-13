import Image from "next/image";
import type { ImageRef } from "@/config/site";
import { hasPublicFile } from "@/lib/server";
import { Icon, type IconName } from "../Icon";
import styles from "./sections.module.css";

interface PhotoProps {
  image: ImageRef;
  /** Texto mostrado enquanto a foto não foi colocada em /public. */
  placeholder: string;
  icon?: IconName;
  sizes: string;
  className: string;
}

export function Photo({ image, placeholder, icon = "photo", sizes, className }: PhotoProps) {
  return (
    <div className={`${styles.slot} ${className}`}>
      {hasPublicFile(image.src) ? (
        <Image src={image.src} alt={image.alt} fill sizes={sizes} className={styles.photo} />
      ) : (
        <div className={styles.placeholder}>
          <Icon name={icon} size={20} />
          <span>{placeholder}</span>
        </div>
      )}
    </div>
  );
}
