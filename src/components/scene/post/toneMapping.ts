import { visual } from "@/config/visual";

// Tone mapping ACES Filmic igual ao do three (com a exposição da config) e o
// inverso dele, para o fundo: no protótipo o shader do fundo escrevia a cor
// final direto na tela; aqui ele escreve o valor que, depois do tone mapping
// do passe final, volta exatamente àquela cor.

const exposure = visual.renderer.toneMappingExposure.toFixed(4);

export const toneMappingGlsl = /* glsl */ `
const mat3 ACES_IN = mat3(vec3(0.59719, 0.07600, 0.02840), vec3(0.35458, 0.90834, 0.13383), vec3(0.04823, 0.01566, 0.83777));
const mat3 ACES_OUT = mat3(vec3(1.60475, -0.10208, -0.00327), vec3(-0.53108, 1.10813, -0.07276), vec3(-0.07367, -0.00605, 1.07602));
const mat3 ACES_IN_INV = mat3(vec3(1.764741, -0.147028, -0.036337), vec3(-0.675778, 1.160252, -0.162436), vec3(-0.088963, -0.013224, 1.198773));
const mat3 ACES_OUT_INV = mat3(vec3(0.643038, 0.059269, 0.005962), vec3(0.311187, 0.931436, 0.063929), vec3(0.045775, 0.009295, 0.930118));
const float EXPOSURE = ${exposure};

vec3 rrtAndOdtFit(vec3 v) {
  vec3 a = v * (v + 0.0245786) - 0.000090537;
  vec3 b = v * (0.983729 * v + 0.4329510) + 0.238081;
  return a / b;
}

vec3 rrtAndOdtFitInverse(vec3 y) {
  y = clamp(y, 0.0, 0.98);
  vec3 A = 0.983729 * y - 1.0;
  vec3 B = 0.4329510 * y - 0.0245786;
  vec3 C = 0.238081 * y + 0.000090537;
  return (-B - sqrt(B * B - 4.0 * A * C)) / (2.0 * A);
}

vec3 acesFilmic(vec3 color) {
  color *= EXPOSURE / 0.6;
  return clamp(ACES_OUT * rrtAndOdtFit(ACES_IN * color), 0.0, 1.0);
}

vec3 acesFilmicInverse(vec3 color) {
  return max(ACES_IN_INV * rrtAndOdtFitInverse(ACES_OUT_INV * color), 0.0) * 0.6 / EXPOSURE;
}

vec3 linearToSrgb(vec3 c) {
  return mix(1.055 * pow(c, vec3(1.0 / 2.4)) - 0.055, c * 12.92, vec3(lessThanEqual(c, vec3(0.0031308))));
}

vec3 srgbToLinear(vec3 c) {
  return mix(pow((c + 0.055) / 1.055, vec3(2.4)), c / 12.92, vec3(lessThanEqual(c, vec3(0.04045))));
}
`;
