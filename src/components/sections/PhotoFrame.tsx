import Image from "next/image";
import type { ImageRef } from "@/config/site";
import { Icon, type IconName } from "../Icon";
import styles from "./sections.module.css";

export interface PhotoFrameProps {
  image: ImageRef;
  /** A foto já está em /public (quem decide é o servidor). */
  hasPhoto: boolean;
  /** Texto mostrado enquanto a foto não foi colocada em /public. */
  placeholder: string;
  icon?: IconName;
  sizes: string;
  className: string;
}

/** Foto em preto e branco (ganha cor no hover do card) ou espaço reservado. */
export function PhotoFrame({ image, hasPhoto, placeholder, icon = "photo", sizes, className }: PhotoFrameProps) {
  return (
    <div className={`${styles.slot} ${className}`}>
      <div className={styles.reveal}>
        {hasPhoto ? (
          <Image src={image.src} alt={image.alt} fill sizes={sizes} className={styles.photo} />
        ) : (
          <div className={styles.placeholder}>
            <Icon name={icon} size={20} />
            <span>{placeholder}</span>
          </div>
        )}
      </div>
    </div>
  );
}
