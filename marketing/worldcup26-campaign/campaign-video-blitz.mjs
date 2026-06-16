#!/usr/bin/env node
import { mkdir, stat, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const REFERRAL_CODE = "26BC4B90CB";
const REFERRAL_LINK = `https://worldcup26.world/login?ref=${REFERRAL_CODE}`;
const WORKERS = ["Dexter", "Sienna", "Memo", "Nano"];
const VIDEO_ASSETS = [
  "media/worldcup26-main-video-vertical.mp4",
  "media/worldcup26-main-video.mp4",
  "media/worldcup26-referral-story.jpg",
  "media/worldcup26-qr-story.jpg",
];

const args = parseArgs(process.argv.slice(2));
const campaignDir = args.root
  ? path.resolve(args.root)
  : path.dirname(fileURLToPath(import.meta.url));
const runtimeDir = path.join(campaignDir, "runtime");
const now = args.now ? new Date(args.now) : new Date();

await mkdir(runtimeDir, { recursive: true });

const payload = await buildPayload();

await writeFile(path.join(runtimeDir, "video-blitz.json"), `${JSON.stringify(payload, null, 2)}\n`);
await writeFile(path.join(runtimeDir, "video-blitz.txt"), renderText(payload));
await writeFile(path.join(runtimeDir, "video-blitz.md"), renderMarkdown(payload));
await writeFile(path.join(runtimeDir, "video-blitz.html"), renderHtml(payload));

for (const pack of payload.workerPacks) {
  await writeFile(path.join(runtimeDir, `video-blitz-${pack.slug}.json`), `${JSON.stringify(pack, null, 2)}\n`);
  await writeFile(path.join(runtimeDir, `video-blitz-${pack.slug}.txt`), renderWorkerText(pack));
  await writeFile(path.join(runtimeDir, `video-blitz-${pack.slug}.html`), renderWorkerHtml(pack));
}

if (!args.quiet) {
  process.stdout.write(renderText(payload));
}

if (!payload.ok) {
  process.exitCode = 1;
}

async function buildPayload() {
  const assets = await Promise.all(VIDEO_ASSETS.map(readAsset));
  const actions = buildActions();
  const workerPacks = WORKERS.map((worker, index) => {
    const assigned = actions.filter((_, actionIndex) => actionIndex % WORKERS.length === index);
    return {
      schema: "worldcup26-video-blitz-worker-v1",
      generatedAt: now.toISOString(),
      generatedAtEest: formatEestLogTime(now),
      ok: assigned.length >= 4,
      state: "manual-video-blitz-ready",
      worker,
      slug: slugify(worker),
      referralCode: REFERRAL_CODE,
      referralLink: REFERRAL_LINK,
      actions: assigned,
      firstAction: assigned[0] ?? null,
      proofRule:
        "This pack prepares video uploads only. Log proof only after a real public video URL exists, or a precise private upload/story note exists.",
    };
  });

  return {
    schema: "worldcup26-video-blitz-v1",
    generatedAt: now.toISOString(),
    generatedAtEest: formatEestLogTime(now),
    ok: assets.every((asset) => asset.ok) && workerPacks.every((pack) => pack.ok),
    state: "manual-video-blitz-ready",
    referralCode: REFERRAL_CODE,
    referralLink: REFERRAL_LINK,
    assets,
    actionCount: actions.length,
    workerPacks,
    proofRule:
      "Generated video actions are not proof. A real Shorts/Reels/TikTok/X/Status post needs a real URL or exact private-channel proof note before logging.",
    qualityRule:
      "Use the vertical MP4 for Shorts/Reels/TikTok/Stories. Put the code in the first caption lines. Reply to comments quickly and help anyone who asks how to pick 3 teams.",
  };
}

async function readAsset(assetPath) {
  try {
    const info = await stat(path.join(campaignDir, assetPath));
    return {
      path: assetPath,
      ok: info.size > 10_000,
      bytes: info.size,
    };
  } catch {
    return {
      path: assetPath,
      ok: false,
      bytes: 0,
    };
  }
}

function buildActions() {
  const rows = [
    ["YouTube Shorts", "Upload vertical video as a Short", "media/worldcup26-main-video-vertical.mp4", "https://studio.youtube.com/channel/UC7j29XhArv5tlRqQj2qAb4Q/videos/upload", "youtube-shorts"],
    ["TikTok", "Upload vertical video with World Cup picks hook", "media/worldcup26-main-video-vertical.mp4", "https://www.tiktok.com/upload", "tiktok-upload"],
    ["Instagram Reels", "Upload vertical video as a Reel", "media/worldcup26-main-video-vertical.mp4", "https://www.instagram.com/", "instagram-reels"],
    ["Facebook Reels", "Upload vertical video as a Reel", "media/worldcup26-main-video-vertical.mp4", "https://www.facebook.com/reels/create", "facebook-reels"],
    ["WhatsApp Status", "Post main video to status", "media/worldcup26-main-video.mp4", "https://web.whatsapp.com/", "whatsapp-status"],
    ["X Video Post", "Post video with 3-team question", "media/worldcup26-main-video-vertical.mp4", "https://x.com/compose/post", "x-video-post"],
    ["Instagram Story", "Post story image with link/code sticker", "media/worldcup26-referral-story.jpg", "https://www.instagram.com/", "instagram-story"],
    ["Facebook Story", "Post story image with link/code sticker", "media/worldcup26-referral-story.jpg", "https://www.facebook.com/stories/create", "facebook-story"],
    ["YouTube Community", "Post QR story image and invite copy", "media/worldcup26-qr-story.jpg", "https://www.youtube.com/", "youtube-community"],
    ["Telegram Channel", "Post video to a football-friendly channel or group", "media/worldcup26-main-video.mp4", "https://web.telegram.org/", "telegram-video"],
    ["Discord Football", "Post video only where promotion is allowed", "media/worldcup26-main-video.mp4", "https://discord.com/channels/@me", "discord-video"],
    ["Reddit Football", "Use video only in allowed self-promo threads", "media/worldcup26-main-video.mp4", "https://www.reddit.com/search/?q=World%20Cup%202026%20predictions", "reddit-video"],
    ["Facebook Groups", "Ask admin approval, then post video if allowed", "media/worldcup26-main-video.mp4", "https://www.facebook.com/groups/search/groups/?q=world%20cup%202026%20football", "facebook-groups-video"],
    ["LinkedIn Post", "Post simple founder/product update with video", "media/worldcup26-main-video.mp4", "https://www.linkedin.com/feed/", "linkedin-video"],
    ["Threads", "Post pick-3 challenge with image/video", "media/worldcup26-referral-square.jpg", "https://www.threads.net/", "threads-post"],
    ["Bluesky", "Post pick-3 football challenge", "media/worldcup26-referral-square.jpg", "https://bsky.app/", "bluesky-post"],
  ];

  return rows.map(([platform, action, asset, openUrl, slug], index) => {
    const link = withUtm(REFERRAL_LINK, {
      utm_source: slug,
      utm_medium: "manual-video",
      utm_campaign: "worldcup26_video_blitz",
      utm_content: `slot_${String(index + 1).padStart(2, "0")}`,
    });
    const copy = renderCaption(platform, link);
    return {
      id: `video-${String(index + 1).padStart(2, "0")}`,
      platform,
      action,
      asset,
      openUrl,
      link,
      copy,
      proofCommand:
        `node campaign-public-channel-attempts.mjs --add --owner "<Dexter|Sienna|Memo|Nano>" --platform "${platform}" --channel "video blitz" --status "posted" --attempt-url "<REAL_PUBLIC_URL_OR_PRIVATE_VIDEO_NOTE>" --detail "${platform}: posted/uploaded from <account> at YYYY-MM-DD HH:mm EEST; asset ${asset}; code ${REFERRAL_CODE} and WorldCup26 link included" --next-action "watch comments/replies; help anyone who asks how to pick 3 teams; rerun referral activity after 15 minutes"`,
    };
  });
}

function renderCaption(platform, link) {
  return [
    "Pick 3 teams before the World Cup starts.",
    "Free preview first. Paid leaderboard only if you use a ticket later.",
    "",
    `Code: ${REFERRAL_CODE}`,
    link,
    "",
    "#WorldCup2026 #Football #Soccer #Predictions",
  ].join("\n");
}

function renderText(payload) {
  const lines = [
    `WorldCup26 video blitz ${payload.generatedAtEest}`,
    `ok=${payload.ok ? "yes" : "no"} state=${payload.state}`,
    `code=${payload.referralCode}`,
    `link=${payload.referralLink}`,
    `assets=${payload.assets.map((asset) => `${asset.path}:${asset.ok ? "ok" : "missing"}:${asset.bytes}`).join(",")}`,
    `actions=${payload.actionCount} worker_packs=${payload.workerPacks.map((pack) => `${pack.worker}:${pack.actions.length}`).join(",")}`,
    `proof_rule=${payload.proofRule}`,
    `quality=${payload.qualityRule}`,
    "",
  ];
  for (const pack of payload.workerPacks) {
    lines.push(`${pack.worker}: runtime/video-blitz-${pack.slug}.html actions=${pack.actions.length} first=${pack.firstAction?.platform || "-"}`);
  }
  lines.push("", "top_actions:");
  for (const action of payload.workerPacks.flatMap((pack) => pack.actions).slice(0, 8)) {
    lines.push(`- ${action.id} ${action.platform}`);
    lines.push(`  asset=${action.asset}`);
    lines.push(`  open=${action.openUrl}`);
    lines.push(`  copy=${oneLine(action.copy)}`);
  }
  lines.push("");
  return lines.join("\n");
}

function renderWorkerText(pack) {
  const lines = [
    `WorldCup26 video blitz / ${pack.worker} ${pack.generatedAtEest}`,
    `ok=${pack.ok ? "yes" : "no"} state=${pack.state}`,
    `rule=${pack.proofRule}`,
    "",
  ];
  for (const action of pack.actions) {
    lines.push(`- ${action.id} ${action.platform}`);
    lines.push(`  action=${action.action}`);
    lines.push(`  asset=${action.asset}`);
    lines.push(`  open=${action.openUrl}`);
    lines.push(`  copy=${oneLine(action.copy)}`);
    lines.push(`  proof=${action.proofCommand.replace("<Dexter|Sienna|Memo|Nano>", pack.worker)}`);
  }
  lines.push("");
  return lines.join("\n");
}

function renderMarkdown(payload) {
  return `# WorldCup26 Video Blitz

Generated: ${payload.generatedAtEest}

- State: \`${payload.state}\`
- Actions: ${payload.actionCount}
- Referral code: \`${payload.referralCode}\`

${payload.proofRule}

## Worker Packs

${payload.workerPacks.map((pack) => `- [${pack.worker}](video-blitz-${pack.slug}.html): ${pack.actions.length} actions, first ${pack.firstAction?.platform || "-"}`).join("\n")}

## Assets

${payload.assets.map((asset) => `- \`${asset.path}\`: ${asset.ok ? "ok" : "missing"} (${asset.bytes} bytes)`).join("\n")}
`;
}

function renderHtml(payload) {
  const cards = payload.workerPacks.map((pack) => `
    <a class="card" href="video-blitz-${escapeAttr(pack.slug)}.html">
      <span>${escapeHtml(pack.worker)}</span>
      <strong>${pack.actions.length}</strong>
      <small>${escapeHtml(pack.firstAction?.platform || "-")}</small>
    </a>`).join("");
  const rows = payload.assets.map((asset) => `
    <tr><td>${escapeHtml(asset.path)}</td><td>${asset.ok ? "ok" : "missing"}</td><td>${asset.bytes}</td></tr>`).join("");
  return pageShell("WorldCup26 Video Blitz", `
    <section class="hero">
      <span class="pill">${escapeHtml(payload.state)}</span>
      <h1>Video Blitz</h1>
      <p>${escapeHtml(payload.qualityRule)}</p>
      <div class="cards">${cards}</div>
    </section>
    <section class="warn"><h2>Proof rule</h2><p>${escapeHtml(payload.proofRule)}</p></section>
    <section><h2>Assets</h2><table><tbody>${rows}</tbody></table></section>
  `);
}

function renderWorkerHtml(pack) {
  const rows = pack.actions.map((action) => `
    <article class="action">
      <span class="pill">${escapeHtml(action.platform)}</span>
      <h2>${escapeHtml(action.action)}</h2>
      <p><strong>Asset:</strong> ${escapeHtml(action.asset)}</p>
      <div class="grid">
        <a class="button gold" href="${escapeAttr(action.openUrl)}">Open platform</a>
        <a class="button" href="../${escapeAttr(action.asset)}">Open asset</a>
        <button data-copy="${escapeAttr(action.copy)}">Copy caption</button>
        <button data-copy="${escapeAttr(action.proofCommand.replace("<Dexter|Sienna|Memo|Nano>", pack.worker))}">Copy proof command</button>
      </div>
      <pre>${escapeHtml(action.copy)}</pre>
    </article>`).join("");
  return pageShell(`WorldCup26 Video Blitz / ${pack.worker}`, `
    <section class="hero">
      <span class="pill">${escapeHtml(pack.worker)}</span>
      <h1>Video Posts</h1>
      <p>${escapeHtml(pack.proofRule)}</p>
    </section>
    ${rows}
  `);
}

function pageShell(title, body) {
  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>${escapeHtml(title)}</title>
  <style>
    :root{color-scheme:dark;--bg:#02130e;--panel:#0b2a20;--line:rgba(255,255,255,.14);--text:#f8fff9;--muted:#bfd2c8;--gold:#ffd974;--mint:#75efb4;--green:#0d7b5d;--red:#ff8377}
    *{box-sizing:border-box}body{margin:0;background:radial-gradient(circle at 12% 0%,rgba(255,217,116,.2),transparent 24rem),radial-gradient(circle at 90% 10%,rgba(117,239,180,.18),transparent 26rem),var(--bg);color:var(--text);font-family:Inter,ui-sans-serif,system-ui,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif}
    main{width:min(1020px,100%);margin:0 auto;padding:12px 10px 42px}section,.action{border:1px solid var(--line);border-radius:10px;background:rgba(11,42,32,.94);padding:16px;margin-bottom:10px}.hero{border-color:rgba(255,217,116,.58);background:linear-gradient(135deg,rgba(255,217,116,.2),rgba(11,42,32,.95))}
    h1{margin:0;font-size:clamp(42px,10vw,76px);line-height:.9}h2{margin:0 0 10px;font-size:24px}p{margin:0 0 10px;color:var(--muted);line-height:1.35}.pill{display:inline-flex;margin-bottom:10px;padding:7px 10px;border-radius:999px;background:linear-gradient(135deg,var(--gold),var(--mint));color:#03140f;font-weight:950;text-transform:uppercase;font-size:12px}
    .cards,.grid{display:grid;grid-template-columns:repeat(4,1fr);gap:8px;margin-top:14px}.card{border:1px solid var(--line);border-radius:8px;padding:10px;background:rgba(0,0,0,.18);color:var(--text);text-decoration:none}.card span{display:block;color:var(--muted);font-weight:850;font-size:11px;text-transform:uppercase}.card strong{display:block;color:var(--gold);font-size:28px;line-height:1}.card small{color:var(--muted)}
    table{width:100%;border-collapse:collapse}td{border-top:1px solid var(--line);padding:8px}a{color:var(--mint);font-weight:850}.button,button{border:1px solid rgba(117,239,180,.5);border-radius:8px;background:var(--green);color:#fff;font:inherit;font-weight:850;padding:10px;cursor:pointer;text-align:center;text-decoration:none}.gold{background:linear-gradient(135deg,var(--gold),var(--mint));color:#03140f;border:0}.warn{border-color:rgba(255,131,119,.55);background:rgba(255,131,119,.1)}pre{white-space:pre-wrap;overflow-wrap:anywhere;border:1px solid var(--line);border-radius:8px;background:rgba(0,0,0,.2);padding:10px}
    @media(max-width:760px){.cards,.grid{grid-template-columns:1fr 1fr}h1{font-size:42px}}@media(max-width:460px){.cards,.grid{grid-template-columns:1fr}}
  </style>
</head>
<body><main>${body}</main><script>document.addEventListener("click",async e=>{const b=e.target.closest("button[data-copy]");if(!b)return;try{await navigator.clipboard.writeText(b.dataset.copy);b.textContent="Copied"}catch{prompt("Copy this",b.dataset.copy)}})</script></body>
</html>`;
}

function parseArgs(argv) {
  const parsed = {};
  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    if (arg === "--quiet") parsed.quiet = true;
    else if (arg === "--root") {
      parsed.root = argv[index + 1];
      index += 1;
    } else if (arg === "--now") {
      parsed.now = argv[index + 1];
      index += 1;
    }
  }
  return parsed;
}

function withUtm(url, params) {
  const parsed = new URL(url);
  for (const [key, value] of Object.entries(params)) {
    parsed.searchParams.set(key, value);
  }
  return parsed.toString();
}

function slugify(value) {
  return String(value ?? "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

function oneLine(value) {
  return String(value ?? "").replace(/\s+/g, " ").trim();
}

function formatEestLogTime(date) {
  return new Intl.DateTimeFormat("en-GB", {
    timeZone: "Europe/Bucharest",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).format(date).replace(",", "");
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
