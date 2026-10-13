import { Vector2, Vector3 } from "three";
import { visual } from "@/config/visual";

// Estado da cena, atualizado a cada quadro pelo Director e pelo CameraRig e
// lido pelos outros componentes dentro do useFrame, sem re-render do React.
export const sceneState = {
  time: 0,
  /** stage.p suavizado: é o que move câmera, máquina e fundo. */
  p: 0,
  /** Cursor em [-0.5, 0.5] a partir do centro, suavizado. */
  mouse: new Vector2(),
  /** Cursor em coordenadas normalizadas da tela, [-1, 1]. */
  pointer: new Vector2(),
  /** Para onde a câmera olha agora. */
  focus: new Vector3(),
  /** Posição da máquina agora. */
  machine: new Vector3(),
  /** Máquina projetada na tela, em [0, 1] a partir do canto inferior esquerdo. */
  machineScreen: new Vector2(...visual.backdrop.glow),
  /** Brilho do neon (1 = aceso), com as piscadas. */
  neon: 1,
  /** Ponta da agulha na sessão (a fase 4 faz ela percorrer a tatuagem). */
  sessionTip: new Vector3(),
  sessionLift: visual.session.lift,
  sessionZoom: visual.session.zoom,
  sessionAngle: 0,
  /** Ponta da agulha no "tatue você mesmo" (a fase 6 faz ela seguir o mouse). */
  drawTip: new Vector3(...visual.draw.tip),
  drawLift: visual.draw.lift,
};
