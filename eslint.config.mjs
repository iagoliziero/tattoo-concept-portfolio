import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  {
    // A cena 3D segue o padrão do three.js/R3F: uniforms, texturas e luzes são
    // criados uma vez e mutados a cada quadro no useFrame, as texturas
    // procedurais usam Math.random e recursos que dependem do renderizador
    // WebGL (como o mapa de ambiente) só podem ser gerados depois da montagem,
    // num efeito. Essas regras existem para o React Compiler, que não está
    // ligado neste projeto.
    files: ["src/components/scene/**"],
    rules: {
      "react-hooks/immutability": "off",
      "react-hooks/purity": "off",
      "react-hooks/set-state-in-effect": "off",
    },
  },
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
  ]),
]);

export default eslintConfig;
