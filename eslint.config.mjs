import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";

export default defineConfig([
  ...nextVitals,
  // marketing/ holds vendored, browser-runtime ad artifacts (React/Babel via
  // CDN globals) and standalone Node render scripts — not part of the Next app.
  // deepwaterart/ is a standalone Vite app with its own package.json and
  // toolchain; it is built and linted from inside that folder, not from here.
  globalIgnores([
    ".next/**",
    ".next_bad_*/**",
    ".vercel/**",
    "node_modules/**",
    "marketing/**",
    "deepwaterart/**",
  ]),
]);
