#!/usr/bin/env node
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const REFERRAL_CODE = "26BC4B90CB";
const REFERRAL_LINK = `https://worldcup26.world/login?ref=${REFERRAL_CODE}`;

const args = parseArgs(process.argv.slice(2));
const campaignDir = args.root
  ? path.resolve(args.root)
  : path.dirname(fileURLToPath(import.meta.url));
const runtimeDir = path.join(campaignDir, "runtime");
const now = args.now ? new Date(args.now) : new Date();

await mkdir(runtimeDir, { recursive: true });

const proofRows = await readCsv(path.join(runtimeDir, "posting-log-live.csv"));
const proofSla = await readJson(path.join(runtimeDir, "proof-sla.json"), {});
const proofStall = await readJson(path.join(runtimeDir, "proof-stall.json"), {});
const proofRescue = await readJson(path.join(runtimeDir, "proof-rescue.json"), {});
const socialRescue = await readJson(path.join(runtimeDir, "social-rescue-pack.json"), {});

const payload = buildPayload({
  proofRows,
  proofSla,
  proofStall,
  proofRescue,
  socialRescue,
});

await writeFile(path.join(runtimeDir, "proof-audit.json"), `${JSON.stringify(payload, null, 2)}\n`);
await writeFile(path.join(runtimeDir, "proof-audit.md"), renderMarkdown(payload));
await writeFile(path.join(runtimeDir, "proof-audit.txt"), renderText(payload));
await writeFile(path.join(runtimeDir, "proof-audit.html"), renderHtml(payload));

if (!args.quiet) {
  process.stdout.write(renderText(payload));
}

function buildPayload({ proofRows, proofSla, proofStall, proofRescue, socialRescue }) {
  const normalizedProofRows = proofRows.map(normalizeProofRow);
  const externalRows = normalizedProofRows.filter((row) => row.external);
  const internalRows = normalizedProofRows.filter((row) => !row.external);
  const publicUrlRows = externalRows.filter((row) => row.proofKind === "public-url");
  const privateNoteRows = externalRows.filter((row) => row.proofKind === "private-note");
  const invalidRows = normalizedProofRows.filter((row) => row.invalidReason);
  const latestExternal = latestByTimestamp(externalRows);
  const latestAny = latestByTimestamp(normalizedProofRows);
  const doNow = Array.isArray(proofSla.doNow) ? proofSla.doNow.map(normalizeDoNow) : [];
  const firstAction = doNow[0] ?? null;
  const latestExternalAgeMinutes = proofStall.latestExternalProofAgeMinutes == null
    ? ageMinutesFromRow(latestExternal)
    : Number(proofStall.latestExternalProofAgeMinutes);
  const latestAnyAgeMinutes = proofStall.latestAnyProofAgeMinutes == null
    ? ageMinutesFromRow(latestAny)
    : Number(proofStall.latestAnyProofAgeMinutes);
  const proofState = String(proofSla.proofState ?? stateFromAge(latestExternalAgeMinutes));
  const socialFirst = normalizeSocialFirst(socialRescue);

  return {
    schema: "worldcup26-proof-audit-v1",
    generatedAt: now.toISOString(),
    generatedAtEest: formatEestLogTime(now),
    referralCode: REFERRAL_CODE,
    referralLink: REFERRAL_LINK,
    ok: invalidRows.length === 0 && normalizedProofRows.length > 0,
    proofState,
    proofActivityFresh: proofState === "fresh",
    counts: {
      proofRows: normalizedProofRows.length,
      externalProofRows: externalRows.length,
      internalRows: internalRows.length,
      publicUrlProofRows: publicUrlRows.length,
      privateNoteProofRows: privateNoteRows.length,
      invalidProofRows: invalidRows.length,
      urgentOpenRows: Number(proofSla.counts?.urgentOpenRows ?? proofStall.counts?.urgentOpenRows ?? 0),
      doNowRows: doNow.length,
      rescueActions: Array.isArray(proofRescue.actions) ? proofRescue.actions.length : 0,
      socialActions: Array.isArray(socialRescue.actions) ? socialRescue.actions.length : 0,
    },
    latestExternalProofAgeMinutes: latestExternalAgeMinutes,
    latestExternalProofAgeLabel: formatAge(latestExternalAgeMinutes),
    latestAnyProofAgeMinutes: latestAnyAgeMinutes,
    latestAnyProofAgeLabel: formatAge(latestAnyAgeMinutes),
    latestExternalProof: latestExternal,
    latestAnyProof: latestAny,
    firstMissingProofAction: firstAction,
    socialFirstAction: socialFirst,
    latestPublicProofUrls: publicUrlRows
      .sort((left, right) => right.timestampMs - left.timestampMs)
      .slice(0, 8)
      .map((row) => ({
        timestampEest: row.timestampEest,
        owner: row.owner,
        channel: row.channel,
        proofUrl: row.proofUrl,
      })),
    invalidRows: invalidRows.map((row) => ({
      timestampEest: row.timestampEest,
      owner: row.owner,
      channel: row.channel,
      proofUrl: row.proofUrl,
      reason: row.invalidReason,
    })),
    requiredProof:
      "Only log after a real post, story, message, upload, reply, or approval request exists. Public URL is best; private proof must include account/channel, audience/count, and exact time.",
    nextProofTemplate: firstAction
      ? buildProofTemplate(firstAction)
      : "No immediate missing proof action is currently open.",
    truth:
      "This audit proves campaign proof bookkeeping only. It does not prove a new external post unless a public URL or specific private-channel note is present in the proof log.",
  };
}

function normalizeProofRow(row) {
  const proofUrl = String(row.proof_url ?? "").trim();
  const timestampEest = String(row.timestamp_eest ?? "").trim();
  const timestamp = parseEestLogTime(timestampEest);
  const channel = String(row.channel ?? "").trim();
  const status = String(row.status ?? "").trim();
  const proofKind = classifyProofKind(proofUrl);
  const external = isExternal(row, proofUrl, proofKind);
  const invalidReason = invalidProofReason(proofUrl);

  return {
    timestampEest,
    timestampMs: timestamp ? timestamp.getTime() : 0,
    scheduledAtEest: String(row.scheduled_at_eest ?? "").trim(),
    owner: String(row.owner ?? "").trim(),
    channel,
    asset: String(row.asset ?? "").trim(),
    link: String(row.link ?? "").trim(),
    status,
    proofUrl,
    proofKind,
    external,
    invalidReason,
    replyCount: String(row.reply_count ?? "").trim(),
    signupNotes: String(row.signup_notes ?? "").trim(),
    nextFollowup: String(row.next_followup ?? "").trim(),
  };
}

function normalizeDoNow(row) {
  return {
    priority: String(row.priority ?? "").trim(),
    owner: String(row.owner ?? "").trim(),
    channel: String(row.channel ?? "").trim(),
    action: String(row.action ?? "").trim(),
    asset: String(row.asset ?? "").trim(),
    ageLabel: String(row.ageLabel ?? "").trim(),
    trackedLink: String(row.trackedLink ?? "").trim(),
    proofStatus: String(row.proofStatus ?? "posted").trim(),
    proofNote: String(row.proofNote ?? "").trim(),
    proofCommand: String(row.proofCommand ?? "").trim(),
  };
}

function normalizeSocialFirst(socialRescue) {
  const first = Array.isArray(socialRescue.actions) ? socialRescue.actions[0] : null;
  if (!first) return null;
  return {
    priority: String(first.priority ?? "").trim(),
    owner: String(first.owner ?? "").trim(),
    channel: String(first.channel ?? "").trim(),
    asset: String(first.asset ?? "").trim(),
    phoneAction: String(first.phoneAction ?? first.phone ?? "").trim(),
    shareLinks: Array.isArray(first.shareLinks) ? first.shareLinks.length : 0,
  };
}

function buildProofTemplate(action) {
  const proofNote = action.proofNote || "REAL_POST_URL_OR_SPECIFIC_PRIVATE_NOTE";
  return [
    `Priority #${action.priority}: ${action.owner} / ${action.channel}`,
    `Do first: ${action.action}`,
    `Asset: ${action.asset}`,
    "After it exists, replace every placeholder in this command:",
    action.proofCommand || `node campaign-proof-log.mjs --priority "${action.priority}" --proof-url "${proofNote}" --status "${action.proofStatus || "posted"}"`,
  ].join("\n");
}

function isExternal(row, proofUrl, proofKind) {
  const channel = String(row.channel ?? "").toLowerCase();
  const status = String(row.status ?? "").toLowerCase();
  if (channel.includes("campaign ops") || channel.includes("proof audit") || channel.includes("internal")) return false;
  if (status === "logged" && proofUrl.toLowerCase().startsWith("internal-log:")) return false;
  return proofKind === "public-url" || proofKind === "private-note";
}

function classifyProofKind(value) {
  const proof = String(value ?? "").trim();
  if (!proof) return "missing";
  if (isHttpUrl(proof)) return "public-url";
  if (proof.toLowerCase().startsWith("internal-log:")) return "internal-log";
  return "private-note";
}

function invalidProofReason(value) {
  const proof = String(value ?? "").trim();
  if (!proof) return "missing proof_url";
  const upper = proof.toUpperCase();
  const placeholders = [
    "ADD_POST_URL_OR_ACCOUNT_NOTE",
    "POST_URL_OR_PRIVATE_NOTE",
    "PUBLIC_X_POST_URL",
    "PUBLIC_FACEBOOK_POST_URL",
    "REAL_POST_URL",
    "YYYY-MM-DD",
    "HH:MM",
    "<GROUP/CHANNEL>",
    "<PHONE/ACCOUNT>",
    "<ACCOUNT>",
    "<N>",
  ];
  if (/<[^>]+>/.test(proof)) return "placeholder angle token";
  if (placeholders.some((placeholder) => upper.includes(placeholder))) return "placeholder token";
  return "";
}

function latestByTimestamp(rows) {
  const row = rows
    .filter((candidate) => candidate.timestampMs > 0)
    .sort((left, right) => right.timestampMs - left.timestampMs)[0];
  if (!row) return null;
  return {
    timestampEest: row.timestampEest,
    ageLabel: formatAge(ageMinutesFromRow(row)),
    owner: row.owner,
    channel: row.channel,
    status: row.status,
    asset: row.asset,
    proofKind: row.proofKind,
    proofUrl: row.proofUrl,
  };
}

function ageMinutesFromRow(row) {
  if (!row?.timestampMs) return null;
  return Math.max(0, Math.floor((now.getTime() - row.timestampMs) / 60_000));
}

function stateFromAge(minutes) {
  if (minutes == null) return "missing";
  if (minutes >= 90) return "critical";
  if (minutes >= 60) return "warning";
  return "fresh";
}

function renderText(payload) {
  const lines = [
    `WorldCup26 proof audit ${payload.generatedAtEest}`,
    `ok=${payload.ok ? "yes" : "no"} state=${payload.proofState} proof_fresh=${payload.proofActivityFresh ? "yes" : "no"} latest_external=${payload.latestExternalProofAgeLabel} external=${payload.counts.externalProofRows} public=${payload.counts.publicUrlProofRows} private=${payload.counts.privateNoteProofRows} internal=${payload.counts.internalRows} invalid=${payload.counts.invalidProofRows} urgent=${payload.counts.urgentOpenRows}`,
    `code=${payload.referralCode}`,
    `link=${payload.referralLink}`,
    "",
  ];

  if (payload.latestExternalProof) {
    lines.push("latest_external_proof:");
    lines.push(`- ${payload.latestExternalProof.timestampEest} ${payload.latestExternalProof.owner} / ${payload.latestExternalProof.channel}`);
    lines.push(`  kind=${payload.latestExternalProof.proofKind} proof=${payload.latestExternalProof.proofUrl}`);
    lines.push("");
  }

  if (payload.firstMissingProofAction) {
    lines.push("next_real_action:");
    lines.push(`- #${payload.firstMissingProofAction.priority} ${payload.firstMissingProofAction.owner} / ${payload.firstMissingProofAction.channel} age=${payload.firstMissingProofAction.ageLabel}`);
    lines.push(`  action=${payload.firstMissingProofAction.action}`);
    lines.push(`  asset=${payload.firstMissingProofAction.asset}`);
    lines.push("  proof_template:");
    for (const line of payload.nextProofTemplate.split("\n")) lines.push(`    ${line}`);
    lines.push("");
  }

  if (payload.latestPublicProofUrls.length > 0) {
    lines.push("latest_public_urls:");
    for (const row of payload.latestPublicProofUrls.slice(0, 5)) {
      lines.push(`- ${row.timestampEest} ${row.owner} / ${row.channel}: ${row.proofUrl}`);
    }
    lines.push("");
  }

  if (payload.invalidRows.length > 0) {
    lines.push("invalid_rows:");
    for (const row of payload.invalidRows.slice(0, 8)) {
      lines.push(`- ${row.timestampEest} ${row.owner} / ${row.channel}: ${row.reason}`);
    }
    lines.push("");
  }

  lines.push(`Required proof: ${payload.requiredProof}`);
  lines.push(`Truth rule: ${payload.truth}`);
  lines.push("");
  return lines.join("\n");
}

function renderMarkdown(payload) {
  return `# WorldCup26 Proof Audit

Generated: ${payload.generatedAtEest}

- Status: ${payload.ok ? "audit ok" : "audit has invalid proof rows"}
- Proof state: ${payload.proofState}
- Proof fresh: ${payload.proofActivityFresh ? "yes" : "no"}
- Latest external proof age: ${payload.latestExternalProofAgeLabel}
- External proof rows: ${payload.counts.externalProofRows}
- Public URL proof rows: ${payload.counts.publicUrlProofRows}
- Private-note proof rows: ${payload.counts.privateNoteProofRows}
- Internal rows: ${payload.counts.internalRows}
- Invalid proof rows: ${payload.counts.invalidProofRows}
- Urgent open rows: ${payload.counts.urgentOpenRows}
- Referral code: \`${payload.referralCode}\`
- Referral link: ${payload.referralLink}

## Latest External Proof

${payload.latestExternalProof ? renderProofMarkdown(payload.latestExternalProof) : "No external proof row exists yet."}

## Next Real Action

${payload.firstMissingProofAction ? renderActionMarkdown(payload.firstMissingProofAction, payload.nextProofTemplate) : "No immediate missing proof action is currently open."}

## Latest Public URLs

${payload.latestPublicProofUrls.map((row) => `- ${row.timestampEest} ${row.owner} / ${row.channel}: ${row.proofUrl}`).join("\n") || "No public proof URLs are logged yet."}

## Invalid Rows

${payload.invalidRows.map((row) => `- ${row.timestampEest} ${row.owner} / ${row.channel}: ${row.reason}`).join("\n") || "No placeholder or missing proof rows found in the live log."}

## Required Proof

${payload.requiredProof}

${payload.truth}
`;
}

function renderProofMarkdown(proof) {
  return `- Time: ${proof.timestampEest}
- Owner: ${proof.owner}
- Channel: ${proof.channel}
- Kind: ${proof.proofKind}
- Proof: ${proof.proofUrl}`;
}

function renderActionMarkdown(action, template) {
  return `### #${action.priority} ${action.owner} / ${action.channel}

- Age: ${action.ageLabel || "-"}
- Action: ${action.action}
- Asset: \`${action.asset}\`
- Link: ${action.trackedLink}

\`\`\`bash
${template}
\`\`\``;
}

function renderHtml(payload) {
  const stateClass = payload.proofState === "fresh" ? "fresh" : payload.proofState === "warning" ? "warning" : "critical";
  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>WorldCup26 Proof Audit</title>
  <style>
    :root { color-scheme: dark; --bg: #03140f; --panel: #09291f; --line: rgba(255,255,255,.16); --text: #f8fff9; --muted: #bfd4ca; --gold: #ffd974; --mint: #74f0b2; --green: #0b7a59; --danger: #ff9f9f; --warn: #ffcc6a; }
    * { box-sizing: border-box; }
    body { margin: 0; background: radial-gradient(circle at 10% 0%, rgba(255,217,116,.18), transparent 24rem), radial-gradient(circle at 90% 4%, rgba(116,240,178,.16), transparent 24rem), var(--bg); color: var(--text); font-family: Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif; }
    main { width: min(980px, 100%); margin: 0 auto; padding: 12px 10px 48px; }
    header, section, article { border: 1px solid var(--line); border-radius: 8px; background: rgba(9,41,31,.94); }
    header, section { padding: 14px; margin-bottom: 10px; }
    h1 { margin: 0 0 8px; font-size: clamp(34px, 9vw, 64px); line-height: .92; letter-spacing: 0; }
    h2 { margin: 0 0 8px; font-size: 22px; }
    h3 { margin: 0 0 6px; font-size: 18px; }
    p { margin: 0; color: var(--muted); line-height: 1.42; }
    .state { display: inline-flex; margin: 4px 0 12px; padding: 7px 10px; border-radius: 999px; color: #03140f; background: var(--mint); font-weight: 950; text-transform: uppercase; }
    .state.warning { background: var(--warn); }
    .state.critical { background: var(--danger); }
    .stats { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 8px; margin-top: 12px; }
    .stat { border: 1px solid var(--line); border-radius: 8px; padding: 10px; background: rgba(255,255,255,.06); }
    .stat span { display: block; color: var(--muted); font-size: 11px; font-weight: 900; text-transform: uppercase; }
    .stat strong { display: block; color: var(--gold); font-size: 22px; overflow-wrap: anywhere; }
    .cards { display: grid; gap: 10px; }
    article { padding: 12px; }
    pre { white-space: pre-wrap; overflow-wrap: anywhere; margin: 10px 0 0; border: 1px solid var(--line); border-radius: 8px; background: rgba(0,0,0,.24); padding: 10px; line-height: 1.35; }
    .buttons { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 8px; margin-top: 10px; }
    button, a.button { min-height: 44px; border: 1px solid rgba(116,240,178,.42); border-radius: 8px; color: #fff; background: var(--green); display: inline-flex; align-items: center; justify-content: center; padding: 9px; font: inherit; font-weight: 900; text-align: center; text-decoration: none; cursor: pointer; }
    .gold { color: #03140f; background: var(--gold); border-color: var(--gold); }
    .danger { color: #03140f; background: var(--danger); border-color: var(--danger); }
    .muted { color: var(--muted); }
    .url { overflow-wrap: anywhere; }
    @media (min-width: 780px) { .stats { grid-template-columns: repeat(6, minmax(0, 1fr)); } .cards { grid-template-columns: repeat(2, minmax(0, 1fr)); } }
  </style>
</head>
<body>
  <main>
    <header>
      <h1>Proof Audit</h1>
      <span class="state ${escapeAttr(stateClass)}">${escapeHtml(payload.proofState)}</span>
      <p>${escapeHtml(payload.truth)}</p>
      <div class="stats">
        <div class="stat"><span>Fresh</span><strong>${payload.proofActivityFresh ? "yes" : "no"}</strong></div>
        <div class="stat"><span>Latest external</span><strong>${escapeHtml(payload.latestExternalProofAgeLabel)}</strong></div>
        <div class="stat"><span>External</span><strong>${payload.counts.externalProofRows}</strong></div>
        <div class="stat"><span>Public URLs</span><strong>${payload.counts.publicUrlProofRows}</strong></div>
        <div class="stat"><span>Private notes</span><strong>${payload.counts.privateNoteProofRows}</strong></div>
        <div class="stat"><span>Invalid</span><strong>${payload.counts.invalidProofRows}</strong></div>
      </div>
      <div class="buttons">
        <button class="gold" data-copy="${escapeAttr(payload.referralLink)}">Copy referral link</button>
        <button data-copy="${escapeAttr(payload.nextProofTemplate)}">Copy next proof template</button>
      </div>
    </header>
    <section>
      <h2>Latest External Proof</h2>
      ${payload.latestExternalProof ? renderProofHtml(payload.latestExternalProof) : "<p>No external proof row exists yet.</p>"}
    </section>
    <section>
      <h2>Next Real Action</h2>
      ${payload.firstMissingProofAction ? renderActionHtml(payload.firstMissingProofAction, payload.nextProofTemplate) : "<p>No immediate missing proof action is currently open.</p>"}
    </section>
    <section>
      <h2>Latest Public URLs</h2>
      <div class="cards">${payload.latestPublicProofUrls.map(renderPublicUrlHtml).join("") || "<article><p>No public proof URLs are logged yet.</p></article>"}</div>
    </section>
    <section>
      <h2>Invalid Proof Rows</h2>
      <div class="cards">${payload.invalidRows.map(renderInvalidHtml).join("") || "<article><p>No placeholder or missing proof rows found in the live log.</p></article>"}</div>
    </section>
    <section><p><strong>Required proof:</strong> ${escapeHtml(payload.requiredProof)}</p></section>
  </main>
  <script>
    document.addEventListener("click", async (event) => {
      const button = event.target.closest("[data-copy]");
      if (!button) return;
      event.preventDefault();
      const value = button.dataset.copy || "";
      try {
        await navigator.clipboard.writeText(value);
        const old = button.textContent;
        button.textContent = "Copied";
        setTimeout(() => { button.textContent = old; }, 1200);
      } catch {
        window.prompt("Copy this text", value);
      }
    });
  </script>
</body>
</html>`;
}

function renderProofHtml(proof) {
  return `<article>
    <h3>${escapeHtml(proof.owner)} / ${escapeHtml(proof.channel)}</h3>
    <p class="muted">${escapeHtml(proof.timestampEest)} / ${escapeHtml(proof.ageLabel)} / ${escapeHtml(proof.proofKind)}</p>
    <pre>${escapeHtml(proof.proofUrl)}</pre>
  </article>`;
}

function renderActionHtml(action, template) {
  return `<article>
    <h3>#${escapeHtml(action.priority)} ${escapeHtml(action.owner)} / ${escapeHtml(action.channel)}</h3>
    <p class="muted">${escapeHtml(action.ageLabel || "-")} / ${escapeHtml(action.asset)}</p>
    <p>${escapeHtml(action.action)}</p>
    <pre>${escapeHtml(template)}</pre>
    <div class="buttons">
      <a class="button gold" href="${escapeAttr(action.trackedLink)}" target="_blank" rel="noreferrer">Open tracked link</a>
      <button data-copy="${escapeAttr(template)}">Copy template</button>
    </div>
  </article>`;
}

function renderPublicUrlHtml(row) {
  return `<article>
    <h3>${escapeHtml(row.owner)} / ${escapeHtml(row.channel)}</h3>
    <p class="muted">${escapeHtml(row.timestampEest)}</p>
    <p class="url">${escapeHtml(row.proofUrl)}</p>
    <div class="buttons">
      <a class="button gold" href="${escapeAttr(row.proofUrl)}" target="_blank" rel="noreferrer">Open</a>
      <button data-copy="${escapeAttr(row.proofUrl)}">Copy</button>
    </div>
  </article>`;
}

function renderInvalidHtml(row) {
  return `<article>
    <h3>${escapeHtml(row.owner)} / ${escapeHtml(row.channel)}</h3>
    <p class="muted">${escapeHtml(row.timestampEest)} / ${escapeHtml(row.reason)}</p>
    <pre>${escapeHtml(row.proofUrl)}</pre>
  </article>`;
}

async function readJson(filePath, fallback) {
  try {
    return JSON.parse(await readFile(filePath, "utf8"));
  } catch {
    return fallback;
  }
}

async function readCsv(filePath) {
  try {
    return parseCsv(await readFile(filePath, "utf8"));
  } catch {
    return [];
  }
}

function parseCsv(text) {
  const rows = [];
  let row = [];
  let field = "";
  let quoted = false;

  for (let index = 0; index < text.length; index += 1) {
    const char = text[index];
    const next = text[index + 1];
    if (quoted) {
      if (char === '"' && next === '"') {
        field += '"';
        index += 1;
      } else if (char === '"') {
        quoted = false;
      } else {
        field += char;
      }
    } else if (char === '"') {
      quoted = true;
    } else if (char === ",") {
      row.push(field);
      field = "";
    } else if (char === "\n") {
      row.push(field);
      rows.push(row);
      row = [];
      field = "";
    } else if (char !== "\r") {
      field += char;
    }
  }

  if (field.length > 0 || row.length > 0) {
    row.push(field);
    rows.push(row);
  }

  const [header = [], ...data] = rows;
  return data
    .filter((values) => values.some((value) => String(value ?? "").trim().length > 0))
    .map((values) => Object.fromEntries(header.map((key, index) => [key, values[index] ?? ""])));
}

function parseArgs(rawArgs) {
  const parsed = { quiet: false, root: "", now: "" };
  for (let index = 0; index < rawArgs.length; index += 1) {
    const arg = rawArgs[index];
    if (arg === "--quiet") parsed.quiet = true;
    else if (arg === "--root") parsed.root = rawArgs[++index] ?? "";
    else if (arg === "--now") parsed.now = rawArgs[++index] ?? "";
  }
  return parsed;
}

function parseEestLogTime(value) {
  const match = String(value ?? "").match(/^(\d{4})-(\d{2})-(\d{2}) (\d{2}):(\d{2}) \+0300$/);
  if (!match) return null;
  const parsed = new Date(`${match[1]}-${match[2]}-${match[3]}T${match[4]}:${match[5]}:00+03:00`);
  return Number.isFinite(parsed.getTime()) ? parsed : null;
}

function formatEestLogTime(date) {
  const shifted = new Date(date.getTime() + 3 * 60 * 60 * 1000);
  const year = shifted.getUTCFullYear();
  const month = String(shifted.getUTCMonth() + 1).padStart(2, "0");
  const day = String(shifted.getUTCDate()).padStart(2, "0");
  const hour = String(shifted.getUTCHours()).padStart(2, "0");
  const minute = String(shifted.getUTCMinutes()).padStart(2, "0");
  return `${year}-${month}-${day} ${hour}:${minute} +0300`;
}

function formatAge(minutes) {
  if (minutes == null) return "none";
  if (minutes < 60) return `${minutes}m`;
  return `${(minutes / 60).toFixed(1)}h`;
}

function isHttpUrl(value) {
  try {
    const url = new URL(value);
    return url.protocol === "https:" || url.protocol === "http:";
  } catch {
    return false;
  }
}

function escapeHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function escapeAttr(value) {
  return escapeHtml(value).replaceAll("\n", "&#10;");
}
