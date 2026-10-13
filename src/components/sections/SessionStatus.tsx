"use client";

import { useEffect, useRef, type CSSProperties } from "react";
import { site } from "@/config/site";
import { visual } from "@/config/visual";
import { stage, useStage } from "@/lib/stage";
import ui from "../ui.module.css";
import styles from "./sections.module.css";

/** LED, status, progresso e "Ver de novo" do painel da sessão. */
export function SessionStatus() {
  const status = useStage((s) => s.sessionStatus);
  const meter = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const draw = () => {
      if (meter.current) meter.current.style.transform = `scaleX(${stage.sessionProgress})`;
    };
    draw();
    return stage.subscribe(draw);
  }, []);

  const blink = { "--led-period": `${1 / visual.session.ledBlink}s` } as CSSProperties;
  return (
    <>
      <div className={styles.status} role="status">
        <span className={styles.led} data-status={status} style={blink} />
        <span>{site.session.status[status]}</span>
      </div>
      <div className={styles.meter}>
        <div ref={meter} className={styles.meterFill} />
      </div>
      <button
        type="button"
        className={`${ui.button} ${ui.ghost} ${ui.small} ${styles.replay}`}
        data-shown={status === "done"}
        onClick={() => stage.replaySession()}
      >
        {site.session.replay}
      </button>
    </>
  );
}
