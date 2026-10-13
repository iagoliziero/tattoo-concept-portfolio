"use client";

import { site } from "@/config/site";
import { LABELED_PARTS, machineLabels } from "./scene/labels";
import styles from "./MachineLabels.module.css";

/** Etiquetas das peças na vista explodida; a cena posiciona cada uma a cada quadro. */
export function MachineLabels() {
  return (
    <div className={styles.layer} aria-hidden="true">
      {LABELED_PARTS.map((part) => (
        <div
          key={part}
          className={styles.label}
          ref={(element) => {
            if (!element) return;
            machineLabels.set(part, element);
            return () => {
              machineLabels.delete(part);
            };
          }}
        >
          <span className={styles.dot} />
          {site.machine.labels[part]}
        </div>
      ))}
    </div>
  );
}
