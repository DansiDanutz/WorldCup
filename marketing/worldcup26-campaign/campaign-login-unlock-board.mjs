#!/usr/bin/env node
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const REFERRAL_CODE = "26BC4B90CB";
const REFERRAL_LINK = `https://worldcup26.world/login?ref=${REFERRAL_CODE}`;
const BLOCKED_STATUSES = new Set(["login_required", "blocked", "approval_required"]);

const args = parseArgs(process.argv.slice(2));
const campaignDir = args.root
  ? path.resolve(args.root)
  : path.dirname(fileURLToPath(import.meta.url));
const runtimeDir = path.join(campaignDir, "runtime");
const now = args.now ? new Date(args.now) : new Date();

await mkdir(runtimeDir, { recursive: true });

const publicAttempts = await readJson(path.join(runtimeDir, "public-channel-attempts.json"), {});
const oneClickShare = await readJson(path.join(runtimeDir, "one-click-share.json"), {});
const publicTargets = await readJson(path.join(runtimeDir, "public-outreach-targets.json"), {});
const payload = buildPayload({ publicAttempts, oneClickShare, publicTargets });

await writeFile(path.join(runtimeDir, "login-unlock-board.json"), `${JSON.stringify(payload, null, 2)}\n`);
await writeFile(path.join(runtimeDir, "login-unlock-board.txt"), renderText(payload));
await writeFile(path.join(runtimeDir, "login-unlock-board.md"), renderMarkdown(payload));
await writeFile(path.join(runtimeDir, "login-unlock-board.html"), renderHtml(payload));

if (!args.quiet) {
  process.stdout.write(renderText(payload));
}

function buildPayload({ publicAttempts, oneClickShare, publicTargets }) {
  const latestAttempts = Array.isArray(publicAttempts.latestAttempts)
    ? publicAttempts.latestAttempts.map(normalizeAttempt)
    : [];
  const blockedAttempts = latestAttempts.filter((attempt) => BLOCKED_STATUSES.has(attempt.status));
  const cards = blockedAttempts.map((attempt) => buildCard(attempt, { oneClickShare, publicTargets }));
  const uniquePlatforms = [...new Set(blockedAttempts.map((attempt) => attempt.platform).filter(Boolean))];
  const failures = [
    blockedAttempts.length === 0 ? "No blocked public-channel attempts found." : "",
    cards.some((card) => !card.authUrl && !card.publishUrl)
      ? "One or more unlock cards has no auth or publish URL."
      : "",
    cards.some((card) => !card.copy || !card.copy.includes(REFERRAL_CODE) || !card.copy.includes("worldcup26.world"))
      ? "One or more unlock cards is missing referral copy."
      : "",
  ].filter(Boolean);

  return {
    schema: "worldcup26-login-unlock-board-v1",
    generatedAt: now.toISOString(),
    generatedAtEest: formatEestLogTime(now),
    referralCode: REFERRAL_CODE,
    referralLink: REFERRAL_LINK,
    ok: failures.length === 0,
    failures,
    counts: {
      blocked: blockedAttempts.length,
      loginRequired: blockedAttempts.filter((attempt) => attempt.status === "login_required").length,
      approvalRequired: blockedAttempts.filter((attempt) => attempt.status === "approval_required").length,
      platforms: uniquePlatforms.length,
      cards: cards.length,
    },
    uniquePlatforms,
    cards,
    rule:
      "This unlock board does not prove posting. Complete login/verification in the owned account, publish/send the action, then log proof only after a real public URL or precise private-channel note exists.",
  };
}

function buildCard(attempt, sources) {
  const platformKey = platformKeyFor(attempt);
  const action = bestActionFor(platformKey, sources);
  const links = platformLinks(platformKey, attempt, action);
  const copy = action.copy || fallbackCopy(attempt);
  const proofCommand = action.proofCommand || proofCommandFor(attempt, action);
  return {
    id: slugify(`${attempt.owner}-${attempt.platform}-${attempt.channel}`),
    owner: attempt.owner,
    platform: attempt.platform,
    platformKey,
    channel: attempt.channel,
    status: attempt.status,
    statusLabel: statusLabel(attempt.status),
    attemptedAt: attempt.timestampEest,
    attemptedUrl: attempt.attemptUrl,
    detail: attempt.detail,
    nextAction: attempt.nextAction,
    authUrl: links.authUrl,
    publishUrl: links.publishUrl,
    verifyUrl: links.verifyUrl,
    asset: action.asset || assetFor(platformKey),
    copy,
    proofCommand,
    steps: stepsFor(platformKey, links, action),
  };
}

function bestActionFor(platformKey, { oneClickShare, publicTargets }) {
  const oneClickActions = Array.isArray(oneClickShare.actions) ? oneClickShare.actions : [];
  const publicTargetActions = Array.isArray(publicTargets.targets) ? publicTargets.targets : [];
  const candidates = [
    ...oneClickActions.map((action) => ({
      channel: String(action.channel ?? ""),
      platform: String(action.platform ?? ""),
      copy: String(action.copy ?? ""),
      asset: String(action.asset ?? ""),
      trackedLink: String(action.trackedLink || action.link || ""),
      proofCommand: String(action.proofCommand || ""),
    })),
    ...publicTargetActions.map((target) => ({
      channel: String(target.platform ?? ""),
      platform: String(target.platform ?? ""),
      copy: String(target.copy ?? ""),
      asset: String(target.asset ?? ""),
      trackedLink: String(target.link ?? ""),
      proofCommand: String(target.proofCommand || ""),
    })),
  ];
  const checks = platformChecks(platformKey);
  return candidates.find((candidate) =>
    checks.some((check) => `${candidate.channel} ${candidate.platform}`.toLowerCase().includes(check)),
  ) ?? {};
}

function platformChecks(platformKey) {
  if (platformKey === "youtube") return ["youtube", "short"];
  if (platformKey === "instagram") return ["instagram", "reel"];
  if (platformKey === "facebook") return ["facebook"];
  if (platformKey === "linkedin") return ["linkedin"];
  if (platformKey === "x") return ["x /", "x search", "twitter"];
  return [platformKey];
}

function platformLinks(platformKey, attempt, action) {
  if (platformKey === "youtube") {
    return {
      authUrl: "https://accounts.google.com/",
      verifyUrl: "https://myaccount.google.com/security-checkup",
      publishUrl: "https://studio.youtube.com/channel/UC7j29XhArv5tlRqQj2qAb4Q/videos/upload",
    };
  }
  if (platformKey === "instagram") {
    return {
      authUrl: "https://www.instagram.com/accounts/login/",
      verifyUrl: "https://www.instagram.com/accounts/two_factor_login/",
      publishUrl: "https://www.instagram.com/create/select/",
    };
  }
  if (platformKey === "facebook") {
    return {
      authUrl: "https://www.facebook.com/login/",
      verifyUrl: "",
      publishUrl:
        attempt.attemptUrl && attempt.attemptUrl.includes("facebook.com")
          ? attempt.attemptUrl
          : `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(action.trackedLink || REFERRAL_LINK)}`,
    };
  }
  if (platformKey === "linkedin") {
    return {
      authUrl: "https://www.linkedin.com/login",
      verifyUrl: "",
      publishUrl:
        attempt.attemptUrl && attempt.attemptUrl.includes("linkedin.com")
          ? attempt.attemptUrl
          : `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(action.trackedLink || REFERRAL_LINK)}`,
    };
  }
  if (platformKey === "x") {
    return {
      authUrl: "https://x.com/i/flow/login",
      verifyUrl: "",
      publishUrl:
        action.copy
          ? `https://twitter.com/intent/tweet?text=${encodeURIComponent(action.copy)}`
          : attempt.attemptUrl || "https://x.com/compose/post",
    };
  }
  return {
    authUrl: attempt.attemptUrl || "",
    verifyUrl: "",
    publishUrl: action.trackedLink || REFERRAL_LINK,
  };
}

function stepsFor(platformKey, links, action) {
  const common = [
    "Open login or verification in the owned account.",
    "Return to the publish link after the account is unlocked.",
    "Use the prepared asset and caption. Keep code 26BC4B90CB and the worldcup26.world invite link visible.",
    "After the post/message exists, copy the public URL or write a precise private-channel proof note.",
  ];
  if (platformKey === "youtube") {
    return [
      "Complete Google / YouTube Studio 'Verify it is you'.",
      `Upload ${action.asset || "media/worldcup26-main-video-vertical.mp4"} as a Short.`,
      "Paste the caption, include code 26BC4B90CB and the invite link.",
      "Publish, then log the public YouTube URL.",
    ];
  }
  if (platformKey === "instagram") {
    return [
      "Complete Instagram 2FA for the owned account.",
      "Open Create and upload the story/reel asset.",
      "Put code 26BC4B90CB and the invite link in the caption, bio/link sticker, or screenshot note.",
      "Publish, then log the URL or exact private story proof note.",
    ];
  }
  if (platformKey === "x") {
    return [
      "Log into the owned X account, then open the compose link.",
      "If X strips the media, post the text first and attach the image/video manually.",
      "Publish, then copy the post URL.",
      "Log the public X URL with the copied proof command.",
    ];
  }
  if (platformKey === "facebook") {
    return [
      "Log into Facebook in this browser or another owned session.",
      "Open the share/publish link and paste the caption.",
      "Publish to profile/page/story or request group approval first.",
      "Log the public URL or exact private/group approval proof note.",
    ];
  }
  if (platformKey === "linkedin") {
    return [
      "Log into LinkedIn in this browser or another owned session.",
      "Open the share link and paste the free-picks copy.",
      "Publish from the owned profile/page.",
      "Log the public LinkedIn URL.",
    ];
  }
  return common;
}

function proofCommandFor(attempt, action) {
  return [
    "node campaign-public-channel-attempts.mjs --add",
    `--owner ${shellQuote(attempt.owner)}`,
    `--platform ${shellQuote(attempt.platform)}`,
    `--channel ${shellQuote(attempt.channel)}`,
    '--status "posted"',
    `--attempt-url ${shellQuote(action.trackedLink || attempt.attemptUrl || REFERRAL_LINK)}`,
    `--detail ${shellQuote(`${attempt.platform}: posted from <account> at YYYY-MM-DD HH:mm EEST; code ${REFERRAL_CODE}; link included; public URL/private note <paste here>`)}`,
    '--next-action "watch replies/signups; follow up with anyone who asks for help"',
  ].join(" ");
}

function fallbackCopy(attempt) {
  const link = attempt.attemptUrl && attempt.attemptUrl.includes("worldcup26.world")
    ? attempt.attemptUrl
    : REFERRAL_LINK;
  return `Pick 3 teams free for WorldCup26 and watch your private points preview.\n\nCode ${REFERRAL_CODE}\n${link}`;
}

function assetFor(platformKey) {
  if (platformKey === "youtube" || platformKey === "instagram") return "media/worldcup26-main-video-vertical.mp4";
  if (platformKey === "facebook" || platformKey === "x" || platformKey === "linkedin") return "media/worldcup26-referral-16x9.jpg";
  return "media/worldcup26-main-video.mp4";
}

function platformKeyFor(attempt) {
  const value = `${attempt.platform} ${attempt.channel} ${attempt.attemptUrl}`.toLowerCase();
  if (value.includes("youtube") || value.includes("youtu.be")) return "youtube";
  if (value.includes("instagram")) return "instagram";
  if (value.includes("facebook") || value.includes("fb.com")) return "facebook";
  if (value.includes("linkedin")) return "linkedin";
  if (value.includes("x.com") || value.includes("twitter") || value.includes(" x ")) return "x";
  return slugify(attempt.platform);
}

function normalizeAttempt(row) {
  return {
    timestampEest: String(row.timestampEest ?? row.timestamp_eest ?? "").trim(),
    owner: String(row.owner ?? "").trim(),
    platform: String(row.platform ?? "").trim(),
    channel: String(row.channel ?? "").trim(),
    status: normalizeStatus(row.status),
    attemptUrl: String(row.attemptUrl ?? row.attempt_url ?? "").trim(),
    detail: String(row.detail ?? "").trim(),
    nextAction: String(row.nextAction ?? row.next_action ?? "").trim(),
  };
}

function normalizeStatus(value) {
  return String(value ?? "")
    .trim()
    .toLowerCase()
    .replaceAll("-", "_")
    .replaceAll(" ", "_");
}

function statusLabel(value) {
  return normalizeStatus(value).replaceAll("_", " ");
}

function renderText(payload) {
  const lines = [
    `WorldCup26 login unlock board ${payload.generatedAtEest}`,
    `ok=${payload.ok ? "yes" : "no"} blocked=${payload.counts.blocked} login_required=${payload.counts.loginRequired} platforms=${payload.uniquePlatforms.join(",") || "-"}`,
    `code=${payload.referralCode}`,
    `rule=${payload.rule}`,
    "",
    "unlock_now:",
  ];
  for (const card of payload.cards) {
    lines.push(
      `- ${card.owner} / ${card.platform} / ${card.channel} status=${card.status}`,
      `  auth=${card.authUrl || "-"}`,
      `  verify=${card.verifyUrl || "-"}`,
      `  publish=${card.publishUrl || "-"}`,
      `  asset=${card.asset}`,
      `  copy=${card.copy}`,
      `  proof_after_post=${card.proofCommand}`,
    );
  }
  lines.push("", `Rule: ${payload.rule}`, "");
  return lines.join("\n");
}

function renderMarkdown(payload) {
  return `# WorldCup26 Login Unlock Board

Generated: ${payload.generatedAtEest}

- Status: ${payload.ok ? "ready" : "not ready"}
- Blocked attempts: ${payload.counts.blocked}
- Login required: ${payload.counts.loginRequired}
- Platforms: ${payload.uniquePlatforms.join(", ") || "-"}
- Referral code: \`${payload.referralCode}\`
- Referral link: ${payload.referralLink}

${payload.rule}

${payload.cards.map(renderCardMarkdown).join("\n\n") || "No blocked login cards are currently open."}
`;
}

function renderCardMarkdown(card) {
  return `## ${card.owner} / ${card.platform} / ${card.channel}

- Status: ${card.statusLabel}
- Attempted: ${card.attemptedAt || "-"}
- Login: ${card.authUrl || "-"}
- Verify: ${card.verifyUrl || "-"}
- Publish: ${card.publishUrl || "-"}
- Asset: \`${card.asset}\`

Steps:
${card.steps.map((step) => `- ${step}`).join("\n")}

\`\`\`text
${card.copy}
\`\`\`

\`\`\`bash
${card.proofCommand}
\`\`\``;
}

function renderHtml(payload) {
  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>WorldCup26 Login Unlock Board</title>
  <style>
    :root { color-scheme: dark; --bg: #03140f; --panel: #0b2c22; --line: rgba(255,255,255,.16); --text: #f8fff9; --muted: #bed3ca; --gold: #ffd974; --mint: #74f0b2; --red: #ffb4a8; }
    * { box-sizing: border-box; }
    body { margin: 0; color: var(--text); background: radial-gradient(circle at 10% 0%, rgba(255,217,116,.2), transparent 22rem), radial-gradient(circle at 100% 0%, rgba(116,240,178,.16), transparent 24rem), var(--bg); font-family: Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif; }
    main { width: min(980px, 100%); margin: 0 auto; padding: 14px 10px 48px; }
    header, article { border: 1px solid var(--line); border-radius: 10px; background: rgba(11,44,34,.92); padding: 14px; margin-bottom: 10px; }
    h1 { margin: 0 0 8px; font-size: clamp(34px, 8vw, 66px); line-height: .92; }
    h2 { margin: 0 0 6px; font-size: 21px; }
    p, li { color: var(--muted); line-height: 1.4; }
    a { color: var(--gold); overflow-wrap: anywhere; }
    pre { white-space: pre-wrap; overflow-wrap: anywhere; border: 1px solid var(--line); border-radius: 8px; background: rgba(0,0,0,.28); padding: 10px; }
    button, .button { border: 1px solid var(--line); border-radius: 8px; color: #03140f; background: linear-gradient(135deg, var(--gold), var(--mint)); font-weight: 950; padding: 10px 12px; text-decoration: none; cursor: pointer; display: inline-flex; align-items: center; justify-content: center; min-height: 42px; }
    .danger { color: #03140f; background: linear-gradient(135deg, var(--red), var(--gold)); }
    .actions, .meta { display: flex; flex-wrap: wrap; gap: 8px; }
    .pill { border-radius: 999px; padding: 6px 9px; background: rgba(255,255,255,.08); color: var(--muted); font-weight: 800; }
    .grid { display: grid; gap: 10px; grid-template-columns: repeat(2, minmax(0, 1fr)); }
    .copy-state { color: var(--mint); font-size: 13px; min-height: 18px; margin-top: 6px; }
    @media (max-width: 760px) { .grid { grid-template-columns: 1fr; } }
  </style>
</head>
<body>
  <main>
    <header>
      <h1>Login Unlock</h1>
      <p>${escapeHtml(payload.rule)}</p>
      <div class="meta">
        <span class="pill danger">${escapeHtml(String(payload.counts.blocked))} blocked</span>
        <span class="pill">${escapeHtml(String(payload.counts.loginRequired))} login required</span>
        <span class="pill">code ${escapeHtml(payload.referralCode)}</span>
      </div>
    </header>
    <section class="grid">
      ${payload.cards.map(renderCardHtml).join("\n")}
    </section>
  </main>
  <script>
    document.addEventListener("click", async (event) => {
      const button = event.target.closest("[data-copy]");
      if (!button) return;
      const target = document.querySelector(button.getAttribute("data-copy"));
      if (!target) return;
      await navigator.clipboard.writeText(target.textContent.trim());
      const state = button.parentElement.querySelector(".copy-state");
      if (state) state.textContent = "Copied";
      setTimeout(() => { if (state) state.textContent = ""; }, 1400);
    });
  </script>
</body>
</html>`;
}

function renderCardHtml(card) {
  const copyId = `copy-${card.id}`;
  const proofId = `proof-${card.id}`;
  return `<article>
    <h2>${escapeHtml(card.owner)} / ${escapeHtml(card.platform)}</h2>
    <p><strong>${escapeHtml(card.channel)}</strong> - ${escapeHtml(card.statusLabel)}</p>
    <p>${escapeHtml(card.detail)}</p>
    <ol>${card.steps.map((step) => `<li>${escapeHtml(step)}</li>`).join("")}</ol>
    <div class="actions">
      ${card.authUrl ? `<a class="button danger" href="${escapeAttr(card.authUrl)}" target="_blank" rel="noreferrer">Login</a>` : ""}
      ${card.verifyUrl ? `<a class="button danger" href="${escapeAttr(card.verifyUrl)}" target="_blank" rel="noreferrer">Verify</a>` : ""}
      ${card.publishUrl ? `<a class="button" href="${escapeAttr(card.publishUrl)}" target="_blank" rel="noreferrer">Publish</a>` : ""}
      <button type="button" data-copy="#${copyId}">Copy caption</button>
      <button type="button" data-copy="#${proofId}">Copy proof</button>
    </div>
    <div class="copy-state"></div>
    <p>Asset: ${escapeHtml(card.asset)}</p>
    <pre id="${copyId}">${escapeHtml(card.copy)}</pre>
    <pre id="${proofId}">${escapeHtml(card.proofCommand)}</pre>
  </article>`;
}

function formatEestLogTime(date) {
  const parts = new Intl.DateTimeFormat("en-GB", {
    timeZone: "Europe/Bucharest",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).formatToParts(date).reduce((acc, part) => {
    acc[part.type] = part.value;
    return acc;
  }, {});
  return `${parts.year}-${parts.month}-${parts.day} ${parts.hour}:${parts.minute} +0300`;
}

async function readJson(filePath, fallback) {
  try {
    return JSON.parse(await readFile(filePath, "utf8"));
  } catch {
    return fallback;
  }
}

function shellQuote(value) {
  return `"${String(value ?? "").replaceAll("\\", "\\\\").replaceAll('"', '\\"')}"`;
}

function slugify(value) {
  return String(value ?? "item")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "") || "item";
}

function escapeHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

function escapeAttr(value) {
  return escapeHtml(value).replaceAll("'", "&#39;");
}

function parseArgs(rawArgs) {
  const parsed = { quiet: false, root: "", now: "" };
  for (let index = 0; index < rawArgs.length; index += 1) {
    const arg = rawArgs[index];
    if (arg === "--quiet") parsed.quiet = true;
    else if (arg === "--root") parsed.root = String(rawArgs[++index] ?? "");
    else if (arg === "--now") parsed.now = String(rawArgs[++index] ?? "");
  }
  return parsed;
}
