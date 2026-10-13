import type { LabeledPart } from "@/config/visual";

export const LABELED_PARTS: readonly LabeledPart[] = ["tip", "grip", "coil", "arm"];

/**
 * Etiquetas HTML das peças, registradas pela camada de etiquetas da página.
 * A cena escreve posição e opacidade direto no estilo a cada quadro.
 */
export const machineLabels = new Map<LabeledPart, HTMLElement>();
