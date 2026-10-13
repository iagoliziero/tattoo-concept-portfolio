import { BlendFunction, Effect, EffectAttribute } from "postprocessing";
import { Uniform, Vector3 } from "three";
import { visual } from "@/config/visual";
import { toneMappingGlsl } from "./toneMapping";

// Os dois passes reproduzem a ordem do protótipo (three r128), onde a cena já
// chegava ao pós-processamento com tone mapping e em sRGB:
//   1. ToDisplayEffect: ACES + sRGB (valores "de tela" no buffer);
//   2. bloom (threshold sobre esses valores) e FinishEffect: aberração
//      cromática nas bordas, toque quente, contraste, vinheta e grão.
// No fim o postprocessing converte o resultado para sRGB; por isso o
// FinishEffect devolve o valor de tela já "linearizado".

export class ToDisplayEffect extends Effect {
  constructor() {
    super(
      "ToDisplayEffect",
      /* glsl */ `
${toneMappingGlsl}
void mainImage(const in vec4 inputColor, const in vec2 uv, out vec4 outputColor) {
  outputColor = vec4(linearToSrgb(acesFilmic(inputColor.rgb)), inputColor.a);
}`,
      { blendFunction: BlendFunction.SRC },
    );
  }
}

const finishShader = /* glsl */ `
uniform float aberration;
uniform vec3 warm;
uniform float contrast;
uniform float vignette;
uniform float grain;
${toneMappingGlsl}
float hash(vec2 c) { return fract(sin(dot(c, vec2(12.9898, 78.233))) * 43758.5453); }

void mainImage(const in vec4 inputColor, const in vec2 uv, out vec4 outputColor) {
  vec2 d = uv - 0.5;
  float shift = aberration * dot(d, d);
  // O bloom já está somado em inputColor; o deslocamento vale só para a cena.
  vec3 base = texture2D(inputBuffer, uv).rgb;
  vec3 glow = inputColor.rgb - base;
  vec3 c = vec3(texture2D(inputBuffer, uv + d * shift).r, base.g, texture2D(inputBuffer, uv - d * shift).b) + glow;
  c *= warm;
  c = mix(c, smoothstep(0.0, 1.0, c), contrast);
  c *= 1.0 - vignette * dot(d, d);
  c += (hash(floor(uv * resolution) + fract(time * 7.0)) - 0.5) * grain;
  outputColor = vec4(srgbToLinear(clamp(c, 0.0, 1.0)), inputColor.a);
}`;

export class FinishEffect extends Effect {
  constructor() {
    const { chromaticAberration, warmTint, contrastMix, vignette, grain } = visual.post.final;
    super("FinishEffect", finishShader, {
      attributes: EffectAttribute.CONVOLUTION,
      blendFunction: BlendFunction.SRC,
      uniforms: new Map<string, Uniform>([
        ["aberration", new Uniform(chromaticAberration)],
        ["warm", new Uniform(new Vector3(...warmTint))],
        ["contrast", new Uniform(contrastMix)],
        ["vignette", new Uniform(vignette)],
        ["grain", new Uniform(grain)],
      ]),
    });
  }
}
