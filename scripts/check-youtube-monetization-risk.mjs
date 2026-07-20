#!/usr/bin/env node

import { readdirSync, readFileSync, statSync } from "node:fs";
import path from "node:path";

const root = process.cwd();
const strict = process.argv.includes("--strict");
const scanRoots = ["content/youtube", "marketing/match-videos"];
const textExtensions = new Set([
  ".md",
  ".txt",
  ".json",
  ".jsx",
  ".tsx",
  ".ts",
  ".mjs",
  ".html",
]);
const ignoredNames = new Set(["node_modules", ".git", "package-lock.json"]);

const riskyPatterns = [
  { label: "live prize pool", pattern: /\blive prize pool\b/i },
  { label: "prize pool", pattern: /\bprize pool\b/i },
  { label: "cash prize", pattern: /\bcash prize\b/i },
  { label: "win money", pattern: /\bwin money\b/i },
  { label: "betting/bet CTA", pattern: /\b(bet|betting|wager|odds)\b/i },
  { label: "official/highlights framing", pattern: /\b(official highlights|full match|live broadcast)\b/i },
];

const requiredTemplatePhrases = [
  "PREDICTION - NOT ACTUAL MATCH FOOTAGE",
  "Altered or synthetic content is disclosed in YouTube Studio",
  "Free to play - bragging rights only. No prizes, no betting, nothing to buy.",
];

function walk(relativeDir, files = []) {
  const absoluteDir = path.join(root, relativeDir);

  let entries;
  try {
    entries = readdirSync(absoluteDir);
  } catch {
    return files;
  }

  for (const entry of entries) {
    if (ignoredNames.has(entry)) {
      continue;
    }

    const relativePath = path.join(relativeDir, entry);
    const absolutePath = path.join(root, relativePath);
    const stats = statSync(absolutePath);

    if (stats.isDirectory()) {
      walk(relativePath, files);
      continue;
    }

    if (textExtensions.has(path.extname(entry))) {
      files.push(relativePath);
    }
  }

  return files;
}

function findRiskyLanguage(files) {
  const findings = [];

  for (const file of files) {
    const text = readFileSync(path.join(root, file), "utf8");
    const lines = text.split(/\r?\n/);

    lines.forEach((line, index) => {
      for (const riskyPattern of riskyPatterns) {
        if (riskyPattern.pattern.test(line)) {
          findings.push({
            file,
            line: index + 1,
            risk: riskyPattern.label,
            text: line.trim().slice(0, 180),
          });
        }
      }
    });
  }

  return findings;
}

function checkSafeTemplate() {
  const templatePath = path.join(root, "content/youtube/YPP_SAFE_UPLOAD_TEMPLATE.md");
  let template = "";

  try {
    template = readFileSync(templatePath, "utf8");
  } catch {
    return requiredTemplatePhrases.map((phrase) => ({ phrase, present: false }));
  }

  return requiredTemplatePhrases.map((phrase) => ({
    phrase,
    present: template.includes(phrase),
  }));
}

const files = scanRoots.flatMap((scanRoot) => walk(scanRoot));
const findings = findRiskyLanguage(files);
const templateChecks = checkSafeTemplate();
const missingTemplateChecks = templateChecks.filter((check) => !check.present);

console.log(`Scanned ${files.length} YouTube/content text files.`);

if (findings.length > 0) {
  console.log("\nRisky wording to review:");
  for (const finding of findings) {
    console.log(`- ${finding.file}:${finding.line} [${finding.risk}] ${finding.text}`);
  }
} else {
  console.log("\nNo risky wording found in scanned YouTube/content text files.");
}

if (missingTemplateChecks.length > 0) {
  console.log("\nMissing safe-template phrases:");
  for (const check of missingTemplateChecks) {
    console.log(`- ${check.phrase}`);
  }
} else {
  console.log("\nSafe upload template contains the required YPP phrases.");
}

if (strict && (findings.length > 0 || missingTemplateChecks.length > 0)) {
  process.exitCode = 1;
}

