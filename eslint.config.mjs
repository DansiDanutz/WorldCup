import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";

export default defineConfig([
  ...nextVitals,
  // marketing/ and claudeyoutube/ hold vendored, browser-runtime video artifacts
  // (React/Babel via CDN globals, cross-file component definitions) and standalone
  // Node render scripts — not part of the Next app, so they are not linted.
  globalIgnores([".next/**", ".next_bad_*/**", ".vercel/**", "node_modules/**", "marketing/**", "claudeyoutube/**"]),
]);
