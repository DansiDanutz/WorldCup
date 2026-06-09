#!/usr/bin/env node
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const REFERRAL_CODE = "26BC4B90CB";
const REFERRAL_LINK = `https://worldcup26.world/login?ref=${REFERRAL_CODE}`;
const OPERATOR_ACCOUNT = "david2015bestai@gmail.com";
const WORKERS = ["Dexter", "Sienna", "Memo", "Nano"];

const args = parseArgs(process.argv.slice(2));
const campaignDir = args.root
  ? path.resolve(args.root)
  : path.dirname(fileURLToPath(import.meta.url));
const runtimeDir = path.join(campaignDir, "runtime");
const now = args.now ? new Date(args.now) : new Date();

await mkdir(runtimeDir, { recursive: true });

const payload = buildPayload();

await writeFile(path.join(runtimeDir, "x-account-watchlist.json"), `${JSON.stringify(payload, null, 2)}\n`);
await writeFile(path.join(runtimeDir, "x-account-watchlist.txt"), renderText(payload));
await writeFile(path.join(runtimeDir, "x-account-watchlist.md"), renderMarkdown(payload));
await writeFile(path.join(runtimeDir, "x-account-watchlist.html"), renderHtml(payload));

for (const pack of payload.workerPacks) {
  await writeFile(path.join(runtimeDir, `x-account-watchlist-${pack.slug}.json`), `${JSON.stringify(pack, null, 2)}\n`);
  await writeFile(path.join(runtimeDir, `x-account-watchlist-${pack.slug}.txt`), renderWorkerText(pack));
  await writeFile(path.join(runtimeDir, `x-account-watchlist-${pack.slug}.html`), renderWorkerHtml(pack));
}

if (!args.quiet) {
  process.stdout.write(renderText(payload));
}

function buildPayload() {
  const accounts = buildAccounts();
  const workerPacks = WORKERS.map((worker, workerIndex) => {
    const assigned = accounts.filter((_, index) => index % WORKERS.length === workerIndex);
    return {
      schema: "worldcup26-x-account-watchlist-worker-v1",
      generatedAt: now.toISOString(),
      generatedAtEest: formatEestLogTime(now),
      ok: assigned.length >= 6,
      state: "manual-x-account-reply-watchlist-ready",
      worker,
      slug: slugify(worker),
      operatorAccount: OPERATOR_ACCOUNT,
      referralCode: REFERRAL_CODE,
      referralLink: REFERRAL_LINK,
      accounts: assigned,
      firstAccount: assigned[0] ?? null,
      perHourCap: 3,
      dailyCap: 12,
      action:
        "Open each account, choose only a recent football or World Cup post where a pick-3 reply makes sense, personalize the first sentence, then reply manually from X.",
      proofRule:
        "This watchlist is not proof. Log proof only after a real X reply URL exists, or after a precise private note says which account replied to which handle/post and when.",
    };
  });

  return {
    schema: "worldcup26-x-account-watchlist-v1",
    generatedAt: now.toISOString(),
    generatedAtEest: formatEestLogTime(now),
    ok: workerPacks.every((pack) => pack.ok),
    state: "manual-x-account-reply-watchlist-ready",
    operatorAccount: OPERATOR_ACCOUNT,
    referralCode: REFERRAL_CODE,
    referralLink: REFERRAL_LINK,
    accountCount: accounts.length,
    workerPacks,
    accounts,
    proofRule:
      "This creates real places to look, not proof. Never log a planned reply. Log only after a real X reply URL or precise private proof note exists.",
    qualityRule:
      "Reply only to real football, World Cup, national team, prediction, ranking, or fan-debate posts. Skip unrelated posts, giveaways, political fights, and obvious bot engagement traps.",
  };
}

function buildAccounts() {
  const rows = [
    ["FIFAWorldCup", "Official World Cup conversation", "World Cup 2026 posts and national-team questions"],
    ["fifaworldcup_es", "Spanish World Cup conversation", "Spanish-language World Cup posts"],
    ["FIFAcom", "FIFA general football feed", "global football and national-team posts"],
    ["ESPNFC", "large football discussion feed", "prediction, ranking, and fan debate posts"],
    ["brfootball", "football culture and viral posts", "debate posts, rankings, and fan questions"],
    ["433", "football culture feed", "fan-friendly comment sections"],
    ["goal", "football news feed", "World Cup and national-team news"],
    ["OneFootball", "football app/media feed", "international football posts"],
    ["BBCSport", "broad sports news feed", "reply only under football posts"],
    ["SkyFootball", "football news and clips", "reply only under national-team or prediction posts"],
    ["CBSSportsGolazo", "US football audience", "World Cup, USMNT, Concacaf posts"],
    ["FOXSoccer", "US soccer audience", "World Cup and national-team posts"],
    ["MenInBlazers", "US/UK football fan culture", "fun fan debate posts"],
    ["TheAthleticFC", "analysis audience", "prediction and tactical discussion posts"],
    ["FourFourTwo", "football magazine audience", "rankings, lists, and fan questions"],
    ["OptaAnalyst", "stats and analysis audience", "prediction/stat posts"],
    ["OptaJoe", "stats audience", "football facts that can lead to prediction replies"],
    ["Squawka", "stats and comparison audience", "team/player comparison posts"],
    ["premierleague", "large football audience", "reply only where World Cup/national team angle fits"],
    ["ChampionsLeague", "large football audience", "reply only where player/national-team comments fit"],
    ["CONMEBOL", "South American football", "national-team and tournament posts"],
    ["Concacaf", "North American football", "host-region football posts"],
    ["CAF_Online", "African football", "national-team posts"],
    ["afcasiancup", "Asian football", "national-team posts"],
    ["UEFAcom", "European football", "national-team posts"],
    ["USMNT", "USA national team", "World Cup host-country audience"],
    ["miseleccionmx", "Mexico national team", "World Cup host-country audience"],
    ["CanadaSoccerEN", "Canada national team", "World Cup host-country audience"],
    ["Argentina", "Argentina national team", "fan debate and title-defense posts"],
    ["CBF_Futebol", "Brazil national team", "fan debate posts"],
    ["England", "England national team", "fan debate posts"],
    ["equipedefrance", "France national team", "fan debate posts"],
    ["DFB_Team", "Germany national team", "fan debate posts"],
    ["selecaoportugal", "Portugal national team", "fan debate posts"],
    ["SEFutbol", "Spain national team", "fan debate posts"],
    ["OnsOranje", "Netherlands national team", "fan debate posts"],
  ];

  return rows.map(([handle, lane, signal], index) => {
    const link = withUtm(REFERRAL_LINK, {
      utm_source: "x-account-watchlist",
      utm_medium: "manual-reply",
      utm_campaign: "worldcup26_football_openclaw",
      utm_content: handle.toLowerCase(),
    });
    const copy = renderReply({ handle, link });
    return {
      id: `xacct-${String(index + 1).padStart(2, "0")}`,
      handle,
      lane,
      signal,
      profileUrl: `https://x.com/${handle}`,
      searchUrl: `https://x.com/search?q=${encodeURIComponent(`from:${handle} ("World Cup" OR football OR soccer OR prediction OR teams OR fans) -giveaway -crypto`)}&src=typed_query&f=live`,
      link,
      copy,
      proofCommand:
        `node campaign-x-reply-log.mjs --worker "<Dexter|Sienna|Memo|Nano>" --proof-url "<REAL_X_REPLY_URL_OR_PRIVATE_NOTE>" --target "@${handle}" --query "account watchlist ${handle}"`,
      next:
        "Open the profile/search, pick a recent relevant post, personalize the first sentence, reply manually, then log proof only after the reply exists.",
    };
  });
}

function renderReply({ handle, link }) {
  return `This is exactly the kind of football debate I am collecting before the World Cup.\n\nI am asking people to pick only 3 teams, save them free, and see how their points would look when the matches start:\n${link}\n\nCode: ${REFERRAL_CODE}`;
}

function renderText(payload) {
  const lines = [
    `WorldCup26 X account watchlist ${payload.generatedAtEest}`,
    `ok=${payload.ok ? "yes" : "no"} state=${payload.state} account=${payload.operatorAccount}`,
    `code=${payload.referralCode}`,
    `link=${payload.referralLink}`,
    `accounts=${payload.accountCount} packs=${payload.workerPacks.map((pack) => `${pack.worker}:${pack.accounts.length}`).join(",")}`,
    `proof_rule=${payload.proofRule}`,
    `quality=${payload.qualityRule}`,
    "",
  ];
  for (const pack of payload.workerPacks) {
    lines.push(`${pack.worker}: file=runtime/x-account-watchlist-${pack.slug}.html accounts=${pack.accounts.length} first=${pack.firstAccount?.handle || "-"}`);
  }
  lines.push("", "top_accounts:");
  for (const account of payload.accounts.slice(0, 16)) {
    lines.push(`- ${account.id} @${account.handle} ${account.lane}`);
    lines.push(`  profile=${account.profileUrl}`);
    lines.push(`  search=${account.searchUrl}`);
    lines.push(`  copy=${oneLine(account.copy)}`);
  }
  lines.push("");
  return lines.join("\n");
}

function renderWorkerText(pack) {
  const lines = [
    `WorldCup26 X account watchlist / ${pack.worker} ${pack.generatedAtEest}`,
    `ok=${pack.ok ? "yes" : "no"} state=${pack.state} account=${pack.operatorAccount}`,
    `cap=${pack.perHourCap}/h ${pack.dailyCap}/d`,
    `rule=${pack.proofRule}`,
    "",
  ];
  for (const account of pack.accounts) {
    lines.push(`- ${account.id} @${account.handle} ${account.lane}`);
    lines.push(`  profile=${account.profileUrl}`);
    lines.push(`  search=${account.searchUrl}`);
    lines.push(`  copy=${oneLine(account.copy)}`);
    lines.push(`  proof=${account.proofCommand.replace("<Dexter|Sienna|Memo|Nano>", pack.worker)}`);
  }
  lines.push("");
  return lines.join("\n");
}

function renderMarkdown(payload) {
  return `# WorldCup26 X Account Watchlist

Generated: ${payload.generatedAtEest}

- X account: \`${payload.operatorAccount}\`
- Accounts: ${payload.accountCount}
- Referral code: \`${payload.referralCode}\`

${payload.proofRule}

${payload.qualityRule}

## Workers

${payload.workerPacks.map((pack) => `- [${pack.worker}](x-account-watchlist-${pack.slug}.html): ${pack.accounts.length} accounts, first @${pack.firstAccount?.handle || "-"}`).join("\n")}

## Accounts

${payload.accounts.map((account) => `- [@${account.handle}](${account.profileUrl}) - ${account.lane}`).join("\n")}
`;
}

function renderHtml(payload) {
  const cards = payload.workerPacks.map((pack) => `
    <a class="card" href="x-account-watchlist-${escapeAttr(pack.slug)}.html">
      <span>${escapeHtml(pack.worker)}</span>
      <strong>${pack.accounts.length}</strong>
      <small>@${escapeHtml(pack.firstAccount?.handle || "-")}</small>
    </a>`).join("");
  const rows = payload.accounts.map((account) => renderAccountRow(account, null)).join("");
  return pageShell("WorldCup26 X Account Watchlist", `
    <section class="hero">
      <span class="pill">${escapeHtml(payload.state)}</span>
      <h1>X Account Watchlist</h1>
      <p>${escapeHtml(payload.qualityRule)}</p>
      <div class="cards">${cards}</div>
    </section>
    <section class="warn"><h2>Proof rule</h2><p>${escapeHtml(payload.proofRule)}</p></section>
    <section><h2>Accounts</h2><table><tbody>${rows}</tbody></table></section>
  `);
}

function renderWorkerHtml(pack) {
  const rows = pack.accounts.map((account) => renderAccountRow(account, pack.worker)).join("");
  return pageShell(`WorldCup26 X Account Watchlist / ${pack.worker}`, `
    <section class="hero">
      <span class="pill">${escapeHtml(pack.worker)}</span>
      <h1>Reply Watchlist</h1>
      <p>${escapeHtml(pack.action)}</p>
    </section>
    <section class="warn"><h2>Proof rule</h2><p>${escapeHtml(pack.proofRule)}</p></section>
    <section><h2>${escapeHtml(pack.worker)} accounts</h2><table><tbody>${rows}</tbody></table></section>
  `);
}

function renderAccountRow(account, worker) {
  const proof = worker ? account.proofCommand.replace("<Dexter|Sienna|Memo|Nano>", worker) : account.proofCommand;
  return `
    <tr>
      <td><strong>@${escapeHtml(account.handle)}</strong><small>${escapeHtml(account.lane)}</small></td>
      <td><a href="${escapeAttr(account.profileUrl)}">Profile</a> <a href="${escapeAttr(account.searchUrl)}">Search</a></td>
      <td><button data-copy="${escapeAttr(account.copy)}">Copy reply</button></td>
      <td><button data-copy="${escapeAttr(proof)}">Copy proof command</button></td>
    </tr>`;
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
    main{width:min(1060px,100%);margin:0 auto;padding:12px 10px 42px}section{border:1px solid var(--line);border-radius:10px;background:rgba(11,42,32,.94);padding:16px;margin-bottom:10px}.hero{border-color:rgba(255,217,116,.58);background:linear-gradient(135deg,rgba(255,217,116,.2),rgba(11,42,32,.95))}
    h1{margin:0;font-size:clamp(42px,10vw,72px);line-height:.9}h2{margin:0 0 10px;font-size:24px}p{margin:0 0 10px;color:var(--muted);line-height:1.35}.pill{display:inline-flex;margin-bottom:10px;padding:7px 10px;border-radius:999px;background:linear-gradient(135deg,var(--gold),var(--mint));color:#03140f;font-weight:950;text-transform:uppercase;font-size:12px}
    .cards{display:grid;grid-template-columns:repeat(4,1fr);gap:8px;margin-top:14px}.card{border:1px solid var(--line);border-radius:8px;padding:10px;background:rgba(0,0,0,.18);color:var(--text);text-decoration:none}.card span{display:block;color:var(--muted);font-weight:850;font-size:11px;text-transform:uppercase}.card strong{display:block;color:var(--gold);font-size:28px;line-height:1}.card small{color:var(--muted)}
    table{width:100%;border-collapse:collapse}td{border-top:1px solid var(--line);padding:8px;vertical-align:top}td small{display:block;color:var(--muted)}a{color:var(--mint);font-weight:850;margin-right:8px}button{border:1px solid rgba(117,239,180,.5);border-radius:8px;background:var(--green);color:#fff;font:inherit;font-weight:850;padding:8px;cursor:pointer}.warn{border-color:rgba(255,131,119,.55);background:rgba(255,131,119,.1)}
    @media(max-width:760px){.cards{grid-template-columns:1fr 1fr}h1{font-size:42px}td{display:block;border-top:0;padding:4px 0}tr{display:block;border-top:1px solid var(--line);padding:8px 0}}
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
