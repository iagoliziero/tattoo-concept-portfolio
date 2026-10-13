"use client";

import { useEffect, useRef } from "react";
import { visual } from "@/config/visual";
import { stage } from "@/lib/stage";
import styles from "./ProgressLine.module.css";

/** Linha fina à direita que acompanha a posição entre as seções. */
export function ProgressLine() {
  const fill = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const last = visual.scroll.sections - 1;
    const draw = () => {
      if (fill.current) fill.current.style.transform = `scaleY(${stage.p / last})`;
    };
    draw();
    return stage.subscribe(draw);
  }, []);

  return (
    <div className={styles.track} aria-hidden="true">
      <div ref={fill} className={styles.fill} />
    </div>
  );
}
