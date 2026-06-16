#!/usr/bin/env node
import { renameSync, writeFileSync } from "node:fs";
import { mkdir, readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const REFERRAL_CODE = "26BC4B90CB";
const REFERRAL_LINK = "https://worldcup26.world/login?ref=26BC4B90CB";

const args = parseArgs(process.argv.slice(2));
const campaignDir = args.root
  ? path.resolve(args.root)
  : path.dirname(fileURLToPath(import.meta.url));
const runtimeDir = path.join(campaignDir, "runtime");
const generatedAt = args.now ? new Date(args.now) : new Date();
const generatedAtEest = formatEestLogTime(generatedAt);

await mkdir(runtimeDir, { recursive: true });

const postNowRows = await readCsv(path.join(runtimeDir, "post-now.csv"));
const status = await readJson(path.join(runtimeDir, "campaign-status.json"));
const proofAudit = await readJson(path.join(runtimeDir, "proof-audit.json"));
const proofSla = await readJson(path.join(runtimeDir, "proof-sla.json"));
const zeroSignupRescue = await readJson(path.join(runtimeDir, "zero-signup-rescue.json"));
const operatorPush = await readJson(path.join(runtimeDir, "operator-push-packet.json"));
const operatorRows = operatorRowsFrom(operatorPush);
const rows = operatorRows.length >= 4 ? operatorRows : postNowRows;
const zeroSignup = summarizeZeroSignup(zeroSignupRescue);
const proofRows = Number(
  proofAudit?.counts?.proofRows ??
    proofSla?.counts?.proofRows ??
    status?.postingProof?.loggedCount ??
    0,
);
const urgentRows = Number(
  operatorPush?.urgentOpenRows ??
    proofAudit?.counts?.urgentOpenRows ??
    proofSla?.counts?.urgentOpenRows ??
    rows.length,
);
const sheet = renderSheet({
  generatedAtEest,
  rows,
  proofRows,
  urgentRows,
  zeroSignup,
});
const brief = renderOperatorBrief({
  generatedAtEest,
  rows,
  proofRows,
  urgentRows,
  zeroSignup,
});
const actionCenter = renderHtml({
  generatedAtEest,
  rows,
  proofRows,
  urgentRows,
  zeroSignup,
});
const actionCenterHealth = buildActionCenterHealth({
  generatedAt,
  generatedAtEest,
  rows,
  proofRows,
  urgentRows,
  zeroSignup,
  actionCenter,
  sheet,
  brief,
});

writeOutput(path.join(runtimeDir, "phone-action-sheet.md"), sheet);
writeOutput(path.join(runtimeDir, "urgent-phone-action-sheet.md"), sheet);
writeOutput(path.join(runtimeDir, "urgent-phone-handoff.md"), brief);
writeOutput(path.join(runtimeDir, "todays-10-handoff.md"), brief);
writeOutput(path.join(runtimeDir, "phone-action-center.html"), actionCenter);
writeOutput(
  path.join(runtimeDir, "phone-action-center.json"),
  `${JSON.stringify(actionCenterHealth, null, 2)}\n`,
);

if (!args.quiet) {
  process.stdout.write(
    [
      "WorldCup26 phone action sheet ready",
      `Generated: ${generatedAtEest}`,
      `Actions rendered: ${rows.length}`,
      `Urgent rows needing real proof: ${urgentRows}`,
      "Output: runtime/phone-action-sheet.md",
      "Output: runtime/urgent-phone-handoff.md",
      "Output: runtime/phone-action-center.html",
      "Output: runtime/phone-action-center.json",
      "",
    ].join("\n"),
  );
}

function buildActionCenterHealth({
  generatedAt,
  generatedAtEest,
  rows,
  proofRows,
  urgentRows,
  zeroSignup,
  actionCenter,
  sheet,
  brief,
}) {
  const actionCount = rows.length;
  const qrBlockCount = countMatches(actionCenter, 'class="qr-block"');
  const trackedQrCount = countMatches(actionCenter, "quickchart.io/qr?");
  const assetBlockCount = countMatches(actionCenter, 'class="asset-block"');
  const videoPreviewCount = countMatches(actionCenter, "<video ");
  const imagePreviewCount = countMatches(actionCenter, "<img ");
  const shareButtonCount = countMatches(actionCenter, "whatsapp://send") +
    countMatches(actionCenter, "telegram.me/share") +
    countMatches(actionCenter, "twitter.com/intent/tweet") +
    countMatches(actionCenter, "facebook.com/sharer");
  const firstAction = rows[0]
    ? {
        priority: String(rows[0].priority ?? ""),
        owner: String(rows[0].owner ?? ""),
        channel: String(rows[0].channel ?? ""),
    action: String(rows[0].action ?? ""),
    asset: String(rows[0].asset ?? ""),
    trackedLink: String(rows[0].tracked_link ?? ""),
    proofCommand: String(rows[0].proof_command ?? ""),
  }
    : null;
  const owners = [...new Set(rows.map((row) => String(row.owner ?? "").trim()).filter(Boolean))];
  const failures = [
    actionCount <= 0 ? "No phone actions rendered." : "",
    urgentRows < actionCount ? "Urgent count is lower than rendered action count." : "",
    !actionCenter.includes(REFERRAL_CODE) ? "Referral code is missing from phone action center." : "",
    !actionCenter.includes(REFERRAL_LINK) ? "Referral link is missing from phone action center." : "",
    qrBlockCount < actionCount ? "Each action must include a tracked QR block." : "",
    trackedQrCount < actionCount ? "Each action must include a generated tracked QR URL." : "",
    assetBlockCount < actionCount ? "Each action must include an asset block." : "",
    !actionCenter.includes("worldcup26-main-video.mp4")
      ? "Main campaign video is missing from the action center."
      : "",
    owners.length < 3 ? "Expected the active phone/social workers in the phone action queue." : "",
    !firstAction ? "Missing first action." : "",
    zeroSignup.zeroSignup && !actionCenter.includes("ZERO SIGNUPS")
      ? "Zero-signup alert is missing from the phone action center."
      : "",
  ].filter(Boolean);

  return {
    schema: "worldcup26-phone-action-center-v1",
    generatedAt: generatedAt.toISOString(),
    generatedAtEest,
    referralCode: REFERRAL_CODE,
    referralLink: REFERRAL_LINK,
    ok: failures.length === 0,
    failures,
    proofRows,
    urgentRows,
    zeroSignupState: zeroSignup.state,
    zeroSignup: zeroSignup.zeroSignup,
    zeroSignupCounts: zeroSignup.counts,
    zeroSignupVariants: zeroSignup.variantCount,
    actionCount,
    ownerCount: owners.length,
    owners,
    qrBlockCount,
    trackedQrCount,
    assetBlockCount,
    videoPreviewCount,
    imagePreviewCount,
    shareButtonCount,
    sheetBytes: Buffer.byteLength(sheet),
    briefBytes: Buffer.byteLength(brief),
    htmlBytes: Buffer.byteLength(actionCenter),
    firstAction,
    rule:
      "This validates the phone handoff artifact only. It does not prove a post, story, message, or reply happened.",
  };
}

function countMatches(value, needle) {
  if (!needle) return 0;
  return String(value ?? "").split(needle).length - 1;
}

function summarizeZeroSignup(row) {
  const counts = row?.counts ?? {};
  const acceptedReferrals = Number(counts.acceptedReferrals ?? 0);
  const signupSaves = Number(counts.signupSaves ?? 0);
  const entries = Number(counts.entries ?? 0);
  const variants = Array.isArray(row?.creativeVariants) ? row.creativeVariants : [];
  return {
    state: String(row?.state ?? "missing"),
    zeroSignup: Boolean(row?.zeroSignup ?? (acceptedReferrals === 0 && signupSaves === 0 && entries === 0)),
    generatedAtEest: String(row?.generatedAtEest ?? ""),
    counts: { acceptedReferrals, signupSaves, entries },
    variantCount: variants.length,
    firstVariant: variants[0]
      ? {
          owner: String(variants[0].owner ?? ""),
          channel: String(variants[0].channel ?? ""),
          hook: String(variants[0].hook ?? ""),
          asset: String(variants[0].asset ?? ""),
          link: String(variants[0].link ?? ""),
        }
      : null,
  };
}

function operatorRowsFrom(operatorPush) {
  const actions = Array.isArray(operatorPush?.actions) ? operatorPush.actions : [];
  if (operatorPush?.actionMode !== "zero-signup-rescue" || actions.length < 4) return [];
  return actions.map((action) => {
    const share = shareMapFrom(action.shareLinks);
    return {
      priority: String(action.priority ?? ""),
      scheduled_at_eest: String(action.ageLabel || "now"),
      owner: String(action.owner ?? ""),
      channel: String(action.channel ?? ""),
      mode: "zero-signup rescue",
      action: String(action.action ?? ""),
      asset: String(action.asset ?? ""),
      tracked_link: String(action.trackedLink || action.link || REFERRAL_LINK),
      primary_copy: String(action.copy ?? ""),
      first_comment: "",
      whatsapp_share_url: share.whatsapp,
      telegram_share_url: share.telegram,
      x_share_url: share.x,
      facebook_share_url: share.facebook,
      proof_command: String(action.proofCommand || action.attemptCommand || ""),
    };
  });
}

function shareMapFrom(shareLinks) {
  const share = { whatsapp: "", telegram: "", x: "", facebook: "" };
  if (!Array.isArray(shareLinks)) return share;
  for (const link of shareLinks) {
    const key = String(link.key || link.label || "").toLowerCase();
    const url = String(link.url || "");
    if (key.includes("whatsapp")) share.whatsapp ||= url;
    else if (key.includes("telegram")) share.telegram ||= url;
    else if (key === "x" || key.includes("twitter")) share.x ||= url;
    else if (key.includes("facebook")) share.facebook ||= url;
  }
  return share;
}

function renderZeroSignupMarkdown(zeroSignup) {
  if (!zeroSignup.zeroSignup) {
    return `Zero-signup state: ${zeroSignup.state || "not critical"}`;
  }
  const first = zeroSignup.firstVariant
    ? `\nFirst rescue variant: ${zeroSignup.firstVariant.owner} / ${zeroSignup.firstVariant.channel} - ${zeroSignup.firstVariant.hook}`
    : "";
  return `ZERO SIGNUPS: accepted ${zeroSignup.counts.acceptedReferrals}, signup saves ${zeroSignup.counts.signupSaves}, entries ${zeroSignup.counts.entries}. Lead every phone/social action with free picks first, not payment.${first}`;
}

function renderZeroSignupHtml(zeroSignup) {
  if (!zeroSignup.zeroSignup) {
    return "";
  }
  const first = zeroSignup.firstVariant
    ? `<p><strong>First rescue:</strong> ${escapeHtml(zeroSignup.firstVariant.owner)} / ${escapeHtml(
        zeroSignup.firstVariant.channel,
      )} - ${escapeHtml(zeroSignup.firstVariant.hook)}</p>`
    : "";
  return `<section class="zero-alert" aria-label="Zero signup rescue">
      <strong>ZERO SIGNUPS - push free picks first</strong>
      <p>Accepted ${zeroSignup.counts.acceptedReferrals}, signup saves ${zeroSignup.counts.signupSaves}, entries ${zeroSignup.counts.entries}. Every phone/social action must lead with: pick 3 teams free, track private points, paid leaderboard later only with a ticket.</p>
      ${first}
    </section>`;
}

function renderSheet({ generatedAtEest, rows, proofRows, urgentRows, zeroSignup }) {
  const grouped = groupBy(rows, (row) => row.owner || "Unassigned");
  const topSix = rows.slice(0, 6);
  const fastOrder = rows
    .map((row, index) => `${index + 1}. ${row.owner} - ${row.channel} - ${row.action}`)
    .join("\n");
  const topSixRows = topSix.map(renderTopSixMarkdown).join("\n\n");
  const workerSections = [...grouped.entries()]
    .map(([owner, ownerRows]) => renderWorker(owner, ownerRows))
    .join("\n\n");

  return `# WorldCup26 Phone Action Sheet

Generated: ${generatedAtEest}
Referral code: \`${REFERRAL_CODE}\`
Referral link: ${REFERRAL_LINK}
Live proof rows: ${proofRows}
Urgent rows needing real proof: ${urgentRows}
${renderZeroSignupMarkdown(zeroSignup)}

Use this on the phone/social apps. Do not run a proof command until the post, story, message batch, reply, or permission request really happened.

## Fast Order

${fastOrder || "No urgent rows currently need proof."}

## Top 6 First

${topSixRows || "No urgent rows currently need proof."}

${workerSections}
`;
}

function renderOperatorBrief({ generatedAtEest, rows, proofRows, urgentRows, zeroSignup }) {
  const workerCounts = [...groupBy(rows, (row) => row.owner || "Unassigned").entries()]
    .map(([owner, ownerRows]) => `${owner}: ${ownerRows.length}`)
    .join(" / ");
  const topSixRows = rows.slice(0, 6).map(renderBriefRow).join("\n\n");
  const actionRows = rows.map(renderBriefRow).join("\n\n");

  return `# WorldCup26 Urgent Phone Handoff

Generated: ${generatedAtEest}
Referral code: ${REFERRAL_CODE}
Referral link: ${REFERRAL_LINK}

Proof rows logged: ${proofRows}
Real actions still needing proof: ${urgentRows}
Worker split: ${workerCounts || "none"}
${renderZeroSignupMarkdown(zeroSignup)}

QR share assets:
- Story/status: \`media/worldcup26-qr-story.jpg\`
- Feed/square: \`media/worldcup26-qr-square.jpg\`
- Raw QR: \`media/worldcup26-referral-qr.png\`

Use this when posting from a phone. Every item needs the referral code or link. Do not mark an item done until the real post, message, story, reply, upload, or approval request happened.

## The ${rows.length} Actions

### Do These 6 First

${topSixRows || "No urgent rows currently need proof."}

### Full Queue

${actionRows || "No urgent rows currently need proof."}

## Proof Rule

After a real action happens, log it with the proof command in \`runtime/phone-action-sheet.md\` or \`runtime/phone-action-center.html\`.

For private channels, use a clear note like:

\`\`\`text
private-whatsapp: sent to 12 warm contacts from personal phone at YYYY-MM-DD HH:mm EEST; code ${REFERRAL_CODE} and link included; replies 2
\`\`\`

For public channels, use the public post/video/story URL whenever one exists.
`;
}

function renderBriefRow(row) {
  const proofStatus = proofStatusFor(row.mode);
  const proofNote = proofNoteFor(row);
  const qrLink = qrUrlFor(row.tracked_link);
  const copy = String(row.primary_copy ?? "").trim();
  const firstLine = copy.split(/\n+/).find(Boolean) ?? "";
  return `### ${row.priority}. ${row.owner} - ${row.channel}

- [ ] Real action done
- Time: ${row.scheduled_at_eest}
- Action: ${row.action}
- Asset: \`${row.asset}\`
- Link: ${row.tracked_link}
- Tracked QR: ${qrLink || "-"}
- Proof type: ${proofStatus}
- Proof note template: ${proofNote}
- Exact proof command: ${row.proof_command || "-"}
- Opening line: ${firstLine}`;
}

function renderTopSixMarkdown(row, index) {
  const qrLink = qrUrlFor(row.tracked_link);
  return `### ${index + 1}. ${row.owner} - ${row.channel}

- Action: ${row.action}
- Asset: \`${row.asset}\`
- Link: ${row.tracked_link}
- Tracked QR: ${qrLink || "-"}
- Proof note template: ${proofNoteFor(row)}

\`\`\`text
${String(row.primary_copy ?? "").trim()}
\`\`\``;
}

function renderHtml({ generatedAtEest, rows, proofRows, urgentRows, zeroSignup }) {
  const grouped = groupBy(rows, (row) => row.owner || "Unassigned");
  const topSix = rows.slice(0, 6);
  const proofBuilderRows = rows.map((row) => ({
    priority: String(row.priority ?? "").trim(),
    owner: String(row.owner ?? "").trim() || "Unassigned",
    channel: String(row.channel ?? "").trim(),
    action: String(row.action ?? "").trim(),
    status: proofStatusFor(row.mode),
      proofNote: proofNoteFor(row),
      proofCommand: String(row.proof_command ?? ""),
  }));
  const orderItems = rows
    .map(
      (row, index) =>
        `<li><span>${index + 1}</span><strong>${escapeHtml(row.owner)}</strong><em>${escapeHtml(
          row.channel,
        )}</em></li>`,
    )
    .join("");
  const sections = [...grouped.entries()]
    .map(([owner, ownerRows]) => renderWorkerHtml(owner, ownerRows))
    .join("\n");

  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>WorldCup26 Phone Action Center</title>
  <style>
    :root {
      color-scheme: dark;
      --bg: #03140f;
      --panel: #0a2b21;
      --panel-2: #11372b;
      --line: rgba(255, 255, 255, 0.14);
      --text: #f7fff9;
      --muted: #b7cbc3;
      --gold: #ffd974;
      --mint: #74f0b2;
      --green: #0b7a59;
      --danger: #ff9f9f;
    }
    * { box-sizing: border-box; }
    body {
      margin: 0;
      background:
        radial-gradient(circle at 8% 0%, rgba(116, 240, 178, 0.16), transparent 26rem),
        radial-gradient(circle at 90% 5%, rgba(255, 217, 116, 0.16), transparent 24rem),
        var(--bg);
      color: var(--text);
      font-family: Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
    }
    main { width: min(980px, 100%); margin: 0 auto; padding: 14px 10px 48px; }
    header, section, article {
      border: 1px solid var(--line);
      background: rgba(10, 43, 33, 0.9);
      border-radius: 14px;
      padding: 14px;
      margin-bottom: 10px;
    }
    h1, h2, h3, p { margin: 0; }
    h1 { font-size: clamp(30px, 9vw, 56px); line-height: 0.92; letter-spacing: 0; }
    h2 { font-size: 20px; margin-bottom: 10px; }
    h3 { font-size: 18px; }
    .sub { color: var(--muted); margin-top: 8px; line-height: 1.35; }
    .metrics { display: grid; grid-template-columns: repeat(3, 1fr); gap: 8px; margin-top: 14px; }
    .metric { background: rgba(255, 255, 255, 0.07); border: 1px solid var(--line); border-radius: 10px; padding: 10px; }
    .metric span { display: block; color: var(--muted); font-size: 11px; font-weight: 850; text-transform: uppercase; }
    .metric strong { display: block; margin-top: 4px; color: var(--gold); font-size: 20px; overflow-wrap: anywhere; }
    .order { list-style: none; padding: 0; margin: 0; display: grid; gap: 6px; }
    .order li { display: grid; grid-template-columns: 34px 72px 1fr; align-items: center; gap: 8px; padding: 9px; border: 1px solid var(--line); border-radius: 10px; background: rgba(255, 255, 255, 0.055); }
    .order span { display: grid; place-items: center; width: 28px; height: 28px; color: #052119; background: var(--gold); border-radius: 8px; font-weight: 950; }
    .order strong { color: var(--text); }
    .order em { color: var(--muted); font-style: normal; font-size: 13px; }
    article { background: rgba(17, 55, 43, 0.86); }
    .row-meta { display: grid; gap: 5px; color: var(--muted); font-size: 13px; margin-top: 8px; }
    .copy {
      white-space: pre-wrap;
      overflow-wrap: anywhere;
      margin-top: 10px;
      border: 1px solid var(--line);
      background: #03140f;
      border-radius: 10px;
      padding: 11px;
      font-size: 14px;
      line-height: 1.35;
    }
    .asset-block, .qr-block {
      display: grid;
      gap: 8px;
      margin-top: 10px;
      border: 1px solid var(--line);
      background: rgba(3, 20, 15, 0.74);
      border-radius: 10px;
      padding: 10px;
    }
    .asset-block img, .asset-block video {
      width: 100%;
      max-height: 260px;
      border: 1px solid var(--line);
      border-radius: 10px;
      background: #03140f;
      object-fit: cover;
    }
    .asset-block a, .qr-block a {
      color: var(--gold);
      font-weight: 850;
      overflow-wrap: anywhere;
      text-decoration: none;
    }
    .qr-block img {
      width: min(172px, 100%);
      border: 7px solid #fff;
      border-radius: 10px;
      background: #fff;
    }
    .buttons { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 8px; margin-top: 10px; }
    button, a.button {
      min-height: 44px;
      border-radius: 10px;
      border: 1px solid rgba(116, 240, 178, 0.38);
      background: rgba(116, 240, 178, 0.13);
      color: var(--text);
      padding: 10px;
      font: inherit;
      font-weight: 850;
      text-align: center;
      text-decoration: none;
      cursor: pointer;
    }
    .primary { background: var(--green); border-color: var(--green); }
    .gold { color: #03140f; background: var(--gold); border-color: var(--gold); }
    .warn { color: var(--danger); font-weight: 850; }
    .zero-alert {
      border-color: rgba(255, 217, 116, 0.52);
      background:
        linear-gradient(135deg, rgba(255, 217, 116, 0.18), rgba(116, 240, 178, 0.1)),
        rgba(10, 43, 33, 0.96);
    }
    .zero-alert strong { color: var(--gold); }
    .zero-alert p { margin-top: 7px; color: var(--text); line-height: 1.4; }
    .proof-form { display: grid; gap: 9px; }
    .proof-grid { display: grid; grid-template-columns: 1fr; gap: 9px; }
    label { display: grid; gap: 5px; color: var(--muted); font-size: 12px; font-weight: 900; text-transform: uppercase; }
    select, input, textarea {
      width: 100%;
      border: 1px solid var(--line);
      border-radius: 10px;
      background: rgba(3, 20, 15, 0.9);
      color: var(--text);
      font: inherit;
      font-size: 14px;
      padding: 11px;
    }
    textarea { min-height: 92px; resize: vertical; line-height: 1.35; }
    textarea.command-output {
      min-height: 118px;
      color: var(--gold);
      font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", monospace;
      font-size: 12px;
    }
    .proof-template {
      border: 1px solid rgba(255, 217, 116, 0.32);
      background: rgba(255, 217, 116, 0.08);
      border-radius: 10px;
      padding: 10px;
      color: var(--muted);
      font-size: 13px;
      line-height: 1.35;
      overflow-wrap: anywhere;
    }
    @media (min-width: 760px) {
      .worker-grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 10px; }
      .metrics { grid-template-columns: repeat(4, 1fr); }
      .proof-grid { grid-template-columns: 1fr 130px; }
    }
  </style>
</head>
<body>
  <main>
    <header>
      <h1>WorldCup26 Phone Action Center</h1>
      <p class="sub">Generated ${escapeHtml(generatedAtEest)}. Post only from owned accounts or approved communities. Log proof only after the real action happened.</p>
      <div class="metrics">
        <div class="metric"><span>Code</span><strong>${REFERRAL_CODE}</strong></div>
        <div class="metric"><span>Proof rows</span><strong>${proofRows}</strong></div>
        <div class="metric"><span>Need proof</span><strong>${urgentRows}</strong></div>
        <div class="metric"><span>Actions</span><strong>${rows.length}</strong></div>
      </div>
      <div class="buttons">
        <button class="primary" data-copy="${escapeAttr(REFERRAL_LINK)}">Copy referral link</button>
        <button data-copy="${escapeAttr(`Code: ${REFERRAL_CODE}\n${REFERRAL_LINK}`)}">Copy code + link</button>
        <a class="button gold" href="../media/worldcup26-qr-story.jpg" target="_blank" rel="noreferrer">Open QR story</a>
        <a class="button" href="../media/worldcup26-qr-square.jpg" target="_blank" rel="noreferrer">Open QR square</a>
        <a class="button" href="../media/worldcup26-main-video.mp4" target="_blank" rel="noreferrer">Open video</a>
      </div>
    </header>

    ${renderZeroSignupHtml(zeroSignup)}

    <section>
      <h2>Fast Order</h2>
      <ol class="order">${orderItems || "<li>No urgent rows currently need proof.</li>"}</ol>
    </section>

    <section>
      <h2>Top 6 First</h2>
      <p class="sub">Start here when a logged-in phone/social account is available. These are the oldest external actions still missing real proof.</p>
      <div class="worker-grid top-six-grid">
        ${topSix.map(renderActionHtml).join("\n") || "<article><h3>No urgent rows</h3><p class=\"sub\">No urgent rows currently need proof.</p></article>"}
      </div>
    </section>

    <section id="proof-builder">
      <h2>Proof Builder</h2>
      <p class="sub">Use after a real post, story, message batch, reply, upload, or permission request happened. Paste the public URL when possible; for private channels paste a clear note.</p>
      <div class="proof-form" aria-label="Build proof command">
        <label for="proof-priority">
          Action
          <select id="proof-priority">
            ${proofBuilderRows
              .map(
                (row) =>
                  `<option value="${escapeAttr(row.priority)}">#${escapeHtml(row.priority)} ${escapeHtml(
                    row.owner,
                  )} - ${escapeHtml(row.channel)}</option>`,
              )
              .join("")}
          </select>
        </label>
        <div class="proof-template" id="proof-template">Select an action to load the proof-note template.</div>
        <p class="sub warn" id="proof-warning">Replace the template with real account, audience, and time details before copying a command.</p>
        <label for="proof-url">
          Proof URL or private note
          <textarea id="proof-url" placeholder="Paste public post URL or private proof note"></textarea>
        </label>
        <div class="proof-grid">
          <label for="proof-replies">
            Replies
            <input id="proof-replies" inputmode="numeric" placeholder="0" />
          </label>
          <label for="proof-status">
            Status
            <input id="proof-status" readonly />
          </label>
        </div>
        <label for="proof-signup-notes">
          Signup / click notes
          <textarea id="proof-signup-notes" placeholder="Optional: visible clicks, DMs, signup notes, or verification context"></textarea>
        </label>
        <label for="proof-next-followup">
          Next follow-up
          <textarea id="proof-next-followup" placeholder="Optional: who to reply to next, when to repost, or approval follow-up"></textarea>
        </label>
        <label for="proof-command">
          Command to run from the campaign folder
          <textarea class="command-output" id="proof-command" readonly></textarea>
        </label>
        <div class="buttons">
          <button class="primary" id="build-proof-command" type="button">Build command</button>
          <button data-copy-target="#proof-command" id="copy-proof-command" type="button">Copy command</button>
        </div>
      </div>
    </section>

    ${sections}
  </main>
  <script>
    const proofRows = ${safeJson(proofBuilderRows)};
    const proofRowsByPriority = new Map(proofRows.map((row) => [String(row.priority), row]));
    const proofSelect = document.querySelector("#proof-priority");
    const proofTemplate = document.querySelector("#proof-template");
    const proofUrl = document.querySelector("#proof-url");
    const proofReplies = document.querySelector("#proof-replies");
    const proofStatus = document.querySelector("#proof-status");
    const proofSignupNotes = document.querySelector("#proof-signup-notes");
    const proofNextFollowup = document.querySelector("#proof-next-followup");
    const proofCommand = document.querySelector("#proof-command");
    const proofWarning = document.querySelector("#proof-warning");
    const copyProofCommand = document.querySelector("#copy-proof-command");

    function proofStillHasPlaceholder(value) {
      const proof = String(value || "").trim();
      if (!proof) return true;
      const upper = proof.toUpperCase();
      const blocked = [
        "POST_URL_OR_PRIVATE_NOTE",
        "YYYY-MM-DD",
        "HH:MM",
        "<GROUP/CHANNEL>",
        "<PHONE/ACCOUNT>",
        "<ACCOUNT>",
        "<N>",
        "HTTPS://...",
        "HTTP://..."
      ];
      return /<[^>]+>/.test(proof) || blocked.some((token) => upper.includes(token));
    }

    function shellQuoteBrowser(value) {
      const quote = String.fromCharCode(39);
      const escapedQuote = quote + String.fromCharCode(92) + quote + quote;
      return quote + String(value || "").replaceAll(quote, escapedQuote) + quote;
    }

    function selectedProofRow() {
      return proofRowsByPriority.get(String(proofSelect?.value || "")) || proofRows[0] || null;
    }

    function refreshProofTemplate() {
      const row = selectedProofRow();
      if (!row) return;
      proofTemplate.textContent = row.proofNote;
      proofStatus.value = row.status;
      proofUrl.value = "";
      proofUrl.placeholder = row.proofNote;
      buildProofCommand();
    }

    function buildProofCommand() {
      const row = selectedProofRow();
      if (!row) return;
      const proofValue = proofUrl.value.trim();
      if (proofStillHasPlaceholder(proofValue)) {
        proofCommand.value = "";
        proofCommand.placeholder = "Add a real public URL or a specific private proof note first.";
        proofWarning.textContent = "A proof command will appear after you replace placeholders with real account, audience, time, and proof details.";
        copyProofCommand.disabled = true;
        return;
      }
      if (row.proofCommand && String(row.priority).startsWith("zs-")) {
        proofCommand.value = row.proofCommand;
      } else {
        const parts = [
          "node campaign-proof-log.mjs",
          "--priority " + shellQuoteBrowser(row.priority),
          "--proof-url " + shellQuoteBrowser(proofValue),
          "--status " + shellQuoteBrowser(proofStatus.value || row.status),
        ];
        if (proofReplies.value.trim()) parts.push("--reply-count " + shellQuoteBrowser(proofReplies.value.trim()));
        if (proofSignupNotes.value.trim()) parts.push("--signup-notes " + shellQuoteBrowser(proofSignupNotes.value.trim()));
        if (proofNextFollowup.value.trim()) parts.push("--next-followup " + shellQuoteBrowser(proofNextFollowup.value.trim()));
        proofCommand.value = parts.join(" ");
      }
      proofWarning.textContent = "Command ready. Run it only from the campaign folder after the real action happened.";
      copyProofCommand.disabled = false;
    }

    proofSelect?.addEventListener("change", refreshProofTemplate);
    for (const input of [proofUrl, proofReplies, proofStatus, proofSignupNotes, proofNextFollowup]) {
      input?.addEventListener("input", buildProofCommand);
    }
    document.querySelector("#build-proof-command")?.addEventListener("click", buildProofCommand);
    refreshProofTemplate();

    document.addEventListener("click", async (event) => {
      const button = event.target.closest("[data-copy], [data-copy-target]");
      if (!button) return;
      const targetSelector = button.getAttribute("data-copy-target");
      const target = targetSelector ? document.querySelector(targetSelector) : null;
      const value = target ? target.value || target.textContent || "" : button.getAttribute("data-copy") || "";
      if (targetSelector === "#proof-command" && !value.trim()) {
        const old = button.textContent;
        button.textContent = "Add proof first";
        setTimeout(() => { button.textContent = old; }, 1400);
        return;
      }
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

function renderWorkerHtml(owner, rows) {
  return `<section>
    <h2>${escapeHtml(owner)}</h2>
    <div class="worker-grid">
      ${rows.map(renderActionHtml).join("\n")}
    </div>
  </section>`;
}

function renderActionHtml(row) {
  const combinedCopy = [row.primary_copy, row.first_comment ? `Follow-up:\n${row.first_comment}` : ""]
    .filter(Boolean)
    .join("\n\n");
  const proofStatus = proofStatusFor(row.mode);
  const proofNote = proofNoteFor(row);
  const assetLink = assetHref(row.asset);
  const qrLink = qrUrlFor(row.tracked_link);
  const shareButtons = [
    row.whatsapp_share_url ? `<a class="button" href="${escapeAttr(row.whatsapp_share_url)}">WhatsApp</a>` : "",
    row.telegram_share_url ? `<a class="button" href="${escapeAttr(row.telegram_share_url)}">Telegram</a>` : "",
    row.x_share_url ? `<a class="button" href="${escapeAttr(row.x_share_url)}">X</a>` : "",
    row.facebook_share_url ? `<a class="button" href="${escapeAttr(row.facebook_share_url)}">Facebook</a>` : "",
  ].filter(Boolean);
  const exactProofButton = row.proof_command
    ? `<button class="secondary" data-copy="${escapeAttr(row.proof_command)}">Copy exact proof command</button>`
    : "";

  return `<article>
    <h3>Priority ${escapeHtml(row.priority)} - ${escapeHtml(row.channel)}</h3>
    <div class="row-meta">
      <div><strong>Scheduled:</strong> ${escapeHtml(row.scheduled_at_eest)}</div>
      <div><strong>Action:</strong> ${escapeHtml(row.action)}</div>
      <div><strong>Asset:</strong> ${escapeHtml(row.asset)}</div>
      <div><strong>Proof type:</strong> ${escapeHtml(proofStatus)}</div>
    </div>
    ${renderAssetBlock(row.asset, assetLink)}
    ${renderQrBlock(row.tracked_link, qrLink)}
    <div class="copy">${escapeHtml(combinedCopy)}</div>
    <div class="buttons">
      <button class="primary" data-copy="${escapeAttr(combinedCopy)}">Copy post</button>
      <button data-copy="${escapeAttr(row.tracked_link)}">Copy link</button>
      ${qrLink ? `<a class="button gold" href="${escapeAttr(qrLink)}" target="_blank" rel="noreferrer">Open QR</a>` : ""}
      <button data-copy="${escapeAttr(proofNote)}">Copy proof note</button>
      ${exactProofButton}
      <a class="button" href="#proof-builder">Proof builder</a>
      ${assetLink ? `<a class="button gold" href="${escapeAttr(assetLink)}" target="_blank" rel="noreferrer">Open asset</a>` : ""}
      ${shareButtons.join("\n")}
    </div>
    <p class="sub warn">Do not log this until the post/message/reply really happened.</p>
  </article>`;
}

function renderAssetBlock(asset, href) {
  const value = String(asset ?? "").trim();
  if (!value) return "";
  const preview = renderAssetPreview(value, href);
  const link = href
    ? `<a href="${escapeAttr(href)}" target="_blank" rel="noreferrer">${escapeHtml(value)}</a>`
    : `<span>${escapeHtml(value)}</span>`;
  return `<div class="asset-block"><strong>Asset</strong>${preview}${link}</div>`;
}

function renderAssetPreview(asset, href) {
  if (!href) return "";
  if (/\.(png|jpe?g|webp|gif)$/i.test(asset)) {
    return `<img src="${escapeAttr(href)}" alt="${escapeAttr(asset)}" loading="lazy" />`;
  }
  if (/\.(mp4|webm|mov)$/i.test(asset)) {
    return `<video controls preload="metadata" src="${escapeAttr(href)}"></video>`;
  }
  return "";
}

function renderQrBlock(link, qrLink) {
  const tracked = String(link ?? "").trim();
  if (!tracked || !qrLink) return "";
  return `<div class="qr-block">
      <strong>Scan exact tracked link</strong>
      <img src="${escapeAttr(qrLink)}" alt="QR for ${escapeAttr(tracked)}" loading="lazy" />
      <a href="${escapeAttr(tracked)}" target="_blank" rel="noreferrer">${escapeHtml(tracked)}</a>
    </div>`;
}

function assetHref(asset) {
  const value = String(asset ?? "").trim();
  if (!value) return "";
  if (value.startsWith("media/")) return `../${value}`;
  if (value.startsWith("assets/")) return `../${value}`;
  if (value.startsWith("campaign/")) return `../${value.slice("campaign/".length)}`;
  if (value.endsWith(".md") || value.endsWith(".csv")) return `../${value}`;
  return "";
}

function qrUrlFor(value) {
  const text = String(value ?? "").trim();
  if (!text) return "";
  return `https://quickchart.io/qr?text=${encodeURIComponent(text)}&size=420&margin=2&ecLevel=M&format=png`;
}

function renderWorker(owner, rows) {
  return `## ${owner}

${rows.map(renderRow).join("\n\n")}`;
}

function renderRow(row) {
  const combinedCopy = [row.primary_copy, row.first_comment ? `Follow-up:\n${row.first_comment}` : ""]
    .filter(Boolean)
    .join("\n\n");
  const proofStatus = proofStatusFor(row.mode);
  const proofNote = proofNoteFor(row);
  const qrLink = qrUrlFor(row.tracked_link);
  const shareLines = [
    row.whatsapp_share_url ? `- WhatsApp share: ${row.whatsapp_share_url}` : "",
    row.telegram_share_url ? `- Telegram share: ${row.telegram_share_url}` : "",
    row.x_share_url ? `- X share: ${row.x_share_url}` : "",
    row.facebook_share_url ? `- Facebook share: ${row.facebook_share_url}` : "",
  ].filter(Boolean);

  return `### Priority ${row.priority}: ${row.channel}

- Scheduled: ${row.scheduled_at_eest}
- Action: ${row.action}
- Asset: \`${row.asset}\`
- Link: ${row.tracked_link}
- Tracked QR: ${qrLink || "-"}
- Proof type: ${proofStatus}

Copy:

\`\`\`text
${combinedCopy}
\`\`\`

After real action, use the Phone Action Center proof builder. Start from this note, replace every placeholder with the real account, time, destination, and result, then copy the generated command:

\`\`\`text
${proofNote}
\`\`\`

${row.proof_command ? `Exact proof command for this live action:\n\n\`\`\`bash\n${row.proof_command}\n\`\`\`\n` : ""}

${shareLines.length ? `Phone share links:\n\n${shareLines.join("\n")}` : "Phone share links: use the tracked link above."}`;
}

function proofStatusFor(mode) {
  const value = String(mode ?? "").toLowerCase();
  if (value.includes("approval")) return "requested";
  if (value.includes("repl")) return "replied";
  if (value.includes("outreach")) return "sent";
  if (value.includes("internal")) return "logged";
  return "posted";
}

function proofNoteFor(row) {
  const channel = String(row.channel ?? "").toLowerCase();
  const mode = String(row.mode ?? "").toLowerCase();
  const action = String(row.action ?? "").toLowerCase();
  const asset = String(row.asset ?? "").trim() || "asset";
  const codePart = `code ${REFERRAL_CODE} and link included`;

  if (channel.includes("whatsapp") && channel.includes("status")) {
    return `private-whatsapp-status: posted status from <phone/account> at YYYY-MM-DD HH:mm EEST; visible to contacts; asset ${asset}; ${codePart}`;
  }
  if (channel.includes("whatsapp")) {
    return `private-whatsapp: sent to <N> warm contacts from <phone/account> at YYYY-MM-DD HH:mm EEST; asset ${asset}; ${codePart}; replies <N>`;
  }
  if (channel.includes("instagram") || channel.includes("facebook story") || channel.includes("meta story")) {
    return `private-meta-story: story posted from <account> at YYYY-MM-DD HH:mm EEST; screenshot saved on phone; asset ${asset}; code/link sticker or caption included`;
  }
  if (channel.includes("short") || channel.includes("reel") || channel.includes("tiktok") || channel.includes("youtube")) {
    return `public-video-url-preferred: paste Shorts/Reels/TikTok/YouTube URL; if processing use private-video-note: uploaded from <account> at YYYY-MM-DD HH:mm EEST; asset ${asset}; ${codePart}`;
  }
  if (channel.includes("football") || mode.includes("approval") || action.includes("permission")) {
    return `approval-request: asked admin <group/channel> at YYYY-MM-DD HH:mm EEST; asset/copy ready; ${codePart}; post only after allowed`;
  }
  if (channel.includes("dm") || channel.includes("repl") || mode.includes("repl")) {
    return `private-reply-note: replied to <thread/contact initials> at YYYY-MM-DD HH:mm EEST; ${codePart}; next follow-up <date/action>`;
  }
  return `manual-post-note: posted from <account/destination> at YYYY-MM-DD HH:mm EEST; asset ${asset}; ${codePart}; replace with public URL when available`;
}

async function readCsv(filePath) {
  try {
    return parseCsv(await readFile(filePath, "utf8"))
      .filter((row) => String(row.priority ?? "").trim())
      .sort((left, right) => Number(left.priority) - Number(right.priority));
  } catch {
    return [];
  }
}

async function readJson(filePath) {
  try {
    return JSON.parse(await readFile(filePath, "utf8"));
  } catch {
    return null;
  }
}

function parseArgs(argv) {
  const result = {};
  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    if (arg === "--quiet") result.quiet = true;
    else if (arg === "--root") result.root = argv[++index];
    else if (arg === "--now") result.now = argv[++index];
  }
  return result;
}

function parseCsv(text) {
  const rows = [];
  let row = [];
  let field = "";
  let inQuotes = false;

  for (let index = 0; index < text.length; index += 1) {
    const char = text[index];
    const next = text[index + 1];

    if (char === '"' && inQuotes && next === '"') {
      field += '"';
      index += 1;
      continue;
    }
    if (char === '"') {
      inQuotes = !inQuotes;
      continue;
    }
    if (char === "," && !inQuotes) {
      row.push(field);
      field = "";
      continue;
    }
    if ((char === "\n" || char === "\r") && !inQuotes) {
      if (char === "\r" && next === "\n") index += 1;
      row.push(field);
      rows.push(row);
      row = [];
      field = "";
      continue;
    }
    field += char;
  }

  if (field || row.length) {
    row.push(field);
    rows.push(row);
  }

  const [headers = [], ...body] = rows;
  return body
    .filter((values) => values.some((value) => String(value ?? "").trim()))
    .map((values) =>
      Object.fromEntries(headers.map((header, index) => [header, values[index] ?? ""])),
    );
}

function groupBy(values, selector) {
  const groups = new Map();
  for (const value of values) {
    const key = selector(value);
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key).push(value);
  }
  return groups;
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

function safeJson(value) {
  return JSON.stringify(value)
    .replaceAll("<", "\\u003c")
    .replaceAll(">", "\\u003e")
    .replaceAll("&", "\\u0026");
}

function formatEestLogTime(date) {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Europe/Bucharest",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).formatToParts(date);
  const part = (type) => parts.find((entry) => entry.type === type)?.value ?? "00";
  return `${part("year")}-${part("month")}-${part("day")} ${part("hour")}:${part("minute")} +0300`;
}

function writeOutput(filePath, content) {
  const tempPath = `${filePath}.${process.pid}.tmp`;
  writeFileSync(tempPath, content);
  renameSync(tempPath, filePath);
}
