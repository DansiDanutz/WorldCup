// `npm run audit:all` — the full (dev-inclusive) audit at --audit-level=high, minus
// an explicit, dated allowlist of advisories that have NO upstream fix and only
// reach dev tooling. Production dependencies are gated separately and strictly by
// `npm run audit:prod`, which has no allowlist.
//
// Remove an entry as soon as a fixed version exists.
import { execFileSync } from "node:child_process";

const ALLOW = {
  // braces <=3.0.3 stack-exhaustion DoS. Added 2026-10-13: no fixed braces release
  // exists; reached only via eslint-config-next -> @next/eslint-plugin-next ->
  // fast-glob@3.3.1 -> micromatch (lint-time globbing of our own patterns).
  "GHSA-vfj7-8cjw-p6xm": "dev-only lint tooling, no fixed release yet (2026-10-13)",
};

let raw;
try {
  raw = execFileSync("npm", ["audit", "--json"], { encoding: "utf8", stdio: ["ignore", "pipe", "inherit"] });
} catch (error) {
  raw = error.stdout; // npm audit exits non-zero when it finds anything
}
const vulns = JSON.parse(raw).vulnerabilities ?? {};
const ghsa = (via) => (typeof via === "object" && via.url ? via.url.split("/").pop() : null);

// A package is "allowed" when every advisory behind it (directly, or through the
// packages it depends on) is on the allowlist.
const memo = new Map();
function allowed(name, seen = new Set()) {
  if (memo.has(name)) return memo.get(name);
  if (seen.has(name)) return true;
  seen.add(name);
  const v = vulns[name];
  const ok = !!v && v.via.every((via) => (typeof via === "string" ? allowed(via, seen) : Boolean(ALLOW[ghsa(via)])));
  memo.set(name, ok);
  return ok;
}

const blocking = Object.values(vulns).filter((v) => ["high", "critical"].includes(v.severity) && !allowed(v.name));
const skipped = Object.values(vulns).filter((v) => ["high", "critical"].includes(v.severity) && allowed(v.name));
skipped.forEach((v) => console.log(`allowed  ${v.name} (${v.severity}) — ${v.via.map((x) => (typeof x === "string" ? x : ghsa(x))).join(", ")}`));
if (blocking.length) {
  blocking.forEach((v) => console.error(`BLOCKING ${v.name} (${v.severity}) — ${v.via.map((x) => (typeof x === "string" ? x : `${ghsa(x)} ${x.title}`)).join("; ")}`));
  console.error(`\n${blocking.length} high/critical vulnerabilities not covered by the allowlist`);
  process.exit(1);
}
console.log(`audit:all ok — ${skipped.length} allowlisted (${Object.keys(ALLOW).join(", ")}), 0 blocking`);
