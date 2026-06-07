import assert from "node:assert/strict";
import { readFileSync, readdirSync } from "node:fs";
import { join, relative } from "node:path";
import { describe, it } from "node:test";

const scannedRoots = ["src", "tests", "scripts", "docs"];
const duplicateArtifactPattern = /(?:^|[/\\])[^/\\]*(?: copy| \d+)\.(?:css|js|mjs|ts|tsx|md)$/i;
const temporaryArtifactPattern = /\.(?:bak|orig|tmp)$/i;
const sessionClientComponents = [
  "src/components/admin-console.tsx",
  "src/components/dashboard.tsx",
  "src/components/login-register.tsx",
  "src/components/my-standing.tsx",
  "src/components/wallet-screen.tsx",
];

describe("source hygiene", () => {
  it("keeps production source folders free of duplicate editor artifacts", () => {
    const artifacts = scannedRoots.flatMap((root) =>
      walk(root).filter(
        (path) => duplicateArtifactPattern.test(path) || temporaryArtifactPattern.test(path),
      ),
    );

    assert.deepEqual(artifacts, []);
  });

  it("keeps generated local artifacts out of git and Vercel uploads", () => {
    const gitignore = readFileSync(".gitignore", "utf8");
    const vercelignore = readFileSync(".vercelignore", "utf8");

    for (const ignoreFile of [gitignore, vercelignore]) {
      assert.match(ignoreFile, /\*\.tsbuildinfo/);
      assert.match(ignoreFile, /\/\*\.png/);
      assert.match(ignoreFile, /\/\*\.jpg/);
      assert.match(ignoreFile, /\/\*\.jpeg/);
      assert.match(ignoreFile, /\/\*\.zip/);
    }

    assert.match(vercelignore, /^supabase\/$/m);
  });

  it("keeps client auth session reads tolerant of stale browser tokens", () => {
    for (const path of sessionClientComponents) {
      const source = readFileSync(path, "utf8");

      assert.match(source, /\.getSession\(\)/, `${path} should read the Supabase session`);
      assert.match(source, /\.catch\(\(\) => setSession\(null\)\)/, `${path} should fail closed on stale tokens`);
    }
  });
});

function walk(root: string): string[] {
  const entries = readdirSync(root, { withFileTypes: true });
  const paths: string[] = [];

  for (const entry of entries) {
    const fullPath = join(root, entry.name);

    if (entry.isDirectory()) {
      paths.push(...walk(fullPath));
      continue;
    }

    if (entry.isFile()) {
      paths.push(relative(".", fullPath));
    }
  }

  return paths;
}
