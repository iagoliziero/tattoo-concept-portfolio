import { Quaternion, Vector2, Vector3 } from "three";
import { visual } from "@/config/visual";

// Estado da cena, atualizado a cada quadro pelo Director e pelo CameraRig e
// lido pelos outros componentes dentro do useFrame, sem re-render do React.
export const sceneState = {
  /** Modo leve (celular e telas de toque): menos efeitos e partículas. */
  light: false,
  time: 0,
  /** stage.p suavizado: é o que move câmera, máquina e fundo. */
  p: 0,
  /** Cursor em [-0.5, 0.5] a partir do centro, suavizado. */
  mouse: new Vector2(),
  /** Cursor em coordenadas normalizadas da tela, [-1, 1]. */
  pointer: new Vector2(),
  /** Para onde a câmera olha agora. */
  focus: new Vector3(),
  /** Posição da máquina agora (ponta da agulha). */
  machine: new Vector3(),
  machineQuat: new Quaternion(),
  /** Quanto a máquina está explodida (0 a 1). */
  explode: 0,
  /** Máquina projetada na tela, em [0, 1] a partir do canto inferior esquerdo. */
  machineScreen: new Vector2(...visual.backdrop.glow),
  /** Brilho do neon (1 = aceso), com as piscadas. */
  neon: 1,
  /** Máquina ligada agora (sessão), e o mesmo suavizado de 0 a 1 (fundo mais vermelho). */
  machineOn: false,
  power: 0,
  /** Ponta da agulha na sessão: crua (move a máquina) e suavizada (a câmera segue). */
  sessionTip: new Vector3(),
  sessionFocus: new Vector3(),
  sessionLift: visual.session.lift as number,
  sessionZoom: visual.session.zoom as number,
  sessionAngle: 0,
};
