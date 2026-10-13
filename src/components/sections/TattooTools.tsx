"use client";

import { site } from "@/config/site";
import { clearDrawing } from "@/lib/drawing";
import { stage, useStage } from "@/lib/stage";
import ui from "../ui.module.css";
import styles from "./sections.module.css";

/** Traço, Sombra (graywash) e Limpar. */
export function TattooTools() {
  const { tools } = site.tattoo;
  const tool = useStage((s) => s.drawTool);

  return (
    <div className={styles.tools} role="group" aria-label="Ferramentas de desenho">
      <button type="button" className={ui.tool} aria-pressed={tool === "line"} onClick={() => stage.setDrawTool("line")}>
        {tools.line}
      </button>
      <button type="button" className={ui.tool} aria-pressed={tool === "shade"} onClick={() => stage.setDrawTool("shade")}>
        {tools.shade}
      </button>
      <button type="button" className={ui.tool} onClick={clearDrawing}>
        {tools.clear}
      </button>
    </div>
  );
}
