import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";

export default defineConfig([
  ...nextVitals,
  // marketing/ holds vendored, browser-runtime ad artifacts (React/Babel via
  // CDN globals) and standalone Node render scripts — not part of the Next app.
  globalIgnores([".next/**", "node_modules/**", "marketing/**"]),
]);

