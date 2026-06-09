#!/usr/bin/env node
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const REFERRAL_CODE = "26BC4B90CB";
const BASE_LINK = `https://worldcup26.world/login?ref=${REFERRAL_CODE}`;
const OPERATOR_ACCOUNT = "david2015bestai@gmail.com";

const args = parseArgs(process.argv.slice(2));
const campaignDir = args.root
  ? path.resolve(args.root)
  : path.dirname(fileURLToPath(import.meta.url));
const runtimeDir = path.join(campaignDir, "runtime");
const now = args.now ? new Date(args.now) : new Date();

await mkdir(runtimeDir, { recursive: true });

const payload = buildPayload();

await writeFile(path.join(runtimeDir, "x-football-openclaw.json"), `${JSON.stringify(payload, null, 2)}\n`);
await writeFile(path.join(runtimeDir, "x-football-openclaw.txt"), renderText(payload));
await writeFile(path.join(runtimeDir, "x-football-openclaw.md"), renderMarkdown(payload));
await writeFile(path.join(runtimeDir, "x-football-openclaw.html"), renderHtml(payload));
for (const worker of payload.workerPacks) {
  await writeFile(path.join(runtimeDir, `x-openclaw-${worker.slug}.json`), `${JSON.stringify(worker, null, 2)}\n`);
  await writeFile(path.join(runtimeDir, `x-openclaw-${worker.slug}.txt`), renderWorkerText(worker, payload));
  await writeFile(path.join(runtimeDir, `x-openclaw-${worker.slug}.md`), renderWorkerMarkdown(worker, payload));
  await writeFile(path.join(runtimeDir, `x-openclaw-${worker.slug}.html`), renderWorkerHtml(worker, payload));
}

if (!args.quiet) {
  process.stdout.write(renderText(payload));
}

function buildPayload() {
  const searches = buildSearches();
  const accountSearches = buildAccountSearches();
  const drafts = buildDrafts();
  const actions = searches.flatMap((search, searchIndex) =>
    drafts.slice(0, 2).map((draft, draftIndex) => {
      const id = `x-${searchIndex + 1}-${draftIndex + 1}`;
      const link = withUtm(BASE_LINK, {
        utm_source: "x",
        utm_medium: "manual-reply",
        utm_campaign: "worldcup26_football_openclaw",
        utm_content: `${search.slug}_${draft.slug}`,
      });
      const copy = draft.copy(link);
      return {
        id,
        owner: ["Dexter", "Sienna", "Memo", "Nano"][(searchIndex + draftIndex) % 4],
        query: search.query,
        searchUrl: search.url,
        targetSignal: search.signal,
        replyStyle: draft.title,
        link,
        copy,
        intentUrl: `https://twitter.com/intent/tweet?text=${encodeURIComponent(copy)}`,
        proofCommand:
          `node campaign-public-channel-attempts.mjs --add --owner "${["Dexter", "Sienna", "Memo", "Nano"][(searchIndex + draftIndex) % 4]}" --platform "X" --channel "football manual replies" --status "replied" --attempt-url "<real-x-reply-url-or-private-note>" --detail "Manual X reply from ${OPERATOR_ACCOUNT} at YYYY-MM-DD HH:mm EEST; target=<@handle or tweet URL>; search='${search.query}'; code ${REFERRAL_CODE} and WorldCup26 link included" --next-action "watch replies, then run campaign-referral-activity.mjs after 15 minutes"`,
      };
    }),
  );
  const workerPacks = buildWorkerPacks({ searches, accountSearches, actions });

  return {
    schema: "worldcup26-x-football-openclaw-v1",
    generatedAt: now.toISOString(),
    generatedAtEest: formatEestLogTime(now),
    ok: actions.length > 0,
    state: "manual-x-outreach-ready",
    operatorAccount: OPERATOR_ACCOUNT,
    referralCode: REFERRAL_CODE,
    referralLink: BASE_LINK,
    dailyCap: 24,
    perHourCap: 6,
    searches,
    accountSearches,
    drafts,
    actions,
    workerPacks,
    proofRule:
      "This agent finds and drafts. It does not auto-post. Log proof only after a real X reply URL exists, or after a precise private note says which account replied to which handle/tweet and when.",
    qualityRule:
      "Reply only where the tweet is genuinely about football, World Cup, national teams, predictions, or fan picks. Personalize the first sentence before posting. Skip ads, giveaways, politics fights, and unrelated celebrity posts.",
  };
}

function buildWorkerPacks({ searches, accountSearches, actions }) {
  const workers = ["Dexter", "Sienna", "Memo", "Nano"];
  return workers.map((worker, index) => {
    const assignedActions = actions.filter((action) => action.owner === worker);
    const assignedAccountSearches = accountSearches.filter((_, searchIndex) => searchIndex % workers.length === index);
    const assignedSearches = searches.filter((_, searchIndex) => searchIndex % workers.length === index);
    return {
      schema: "worldcup26-x-openclaw-worker-pack-v1",
      generatedAt: now.toISOString(),
      generatedAtEest: formatEestLogTime(now),
      ok: assignedActions.length > 0 && assignedAccountSearches.length > 0 && assignedSearches.length > 0,
      state: "manual-x-worker-ready",
      worker,
      slug: slugify(worker),
      operatorAccount: OPERATOR_ACCOUNT,
      referralCode: REFERRAL_CODE,
      referralLink: BASE_LINK,
      perHourCap: 2,
      dailyCap: 6,
      accountSearches: assignedAccountSearches,
      searches: assignedSearches,
      actions: assignedActions,
      firstAction: assignedActions[0] ?? null,
      proofRule:
        "Do not log this pack as proof. Log only after this worker manually replies from X and has a real reply URL or precise private proof note.",
    };
  });
}

function buildSearches() {
  const rows = [
    ["world cup 2026 predictions", "People already talking about favorites or dark horses."],
    ["pick 3 teams world cup", "People discussing team picks or fantasy-style selections."],
    ["who will win world cup 2026", "Prediction threads with natural invite fit."],
    ["football fans world cup", "General football fan conversations."],
    ["soccer fans world cup 2026", "US/international soccer audience."],
    ["national team football predictions", "National-team discussion without club noise."],
    ["world cup groups football", "Fans talking about groups, draw, fixtures, or paths."],
    ["football prediction game", "Users already interested in prediction-game mechanics."],
  ];
  return rows.map(([query, signal]) => ({
    slug: slugify(query),
    query,
    signal,
    url: `https://x.com/search?q=${encodeURIComponent(`${query} -giveaway -crypto`)}&src=typed_query&f=live`,
  }));
}

function buildAccountSearches() {
  const rows = [
    ["world cup 2026", "Accounts with World Cup 2026 in bio/name or recent profile context."],
    ["football predictions", "Accounts built around predictions, match opinions, or fan picks."],
    ["soccer predictions", "US/international accounts using soccer language."],
    ["football fan", "Fan accounts likely to enjoy a simple pick-3 challenge."],
    ["world cup fan", "World Cup-focused fan accounts."],
    ["national team football", "National-team accounts and supporter profiles."],
    ["football community", "Community accounts where permission-first replies fit."],
    ["football analytics", "Analyst accounts where the points/leaderboard angle may fit."],
  ];
  return rows.map(([query, signal], index) => ({
    id: `acct-${index + 1}`,
    slug: slugify(query),
    query,
    signal,
    url: `https://x.com/search?q=${encodeURIComponent(query)}&src=typed_query&f=user`,
    action:
      "Open the account search, pick only real football accounts with recent activity, then reply to a relevant recent football post instead of cold-DM spam.",
  }));
}

function buildDrafts() {
  return [
    {
      slug: "three-picks",
      title: "Ask for 3 picks",
      copy: (link) => `Good football question. I am asking people for exactly 3 World Cup picks before the event starts.\n\nYou can save your 3 teams free and see your private points preview here:\n${link}\n\nCode: ${REFERRAL_CODE}`,
    },
    {
      slug: "bold-prediction",
      title: "React to prediction",
      copy: (link) => `That is a bold pick. I built a small WorldCup26 game for this exact debate: pick 3 teams, track points, then join the paid leaderboard only if you want.\n\nFree picks first:\n${link}\n\nCode: ${REFERRAL_CODE}`,
    },
    {
      slug: "friendly-challenge",
      title: "Friendly challenge",
      copy: (link) => `I like seeing real football opinions before the tournament starts. Want to lock 3 teams and compare later?\n\nWorldCup26 lets you pick free first:\n${link}\n\nUse code ${REFERRAL_CODE}`,
    },
    {
      slug: "fan-thread",
      title: "Fan thread",
      copy: (link) => `For anyone in this football thread: choose 3 teams now and see how your picks would score when the matches start.\n\nFree preview first, leaderboard ticket optional later:\n${link}\n\nInvite code ${REFERRAL_CODE}`,
    },
  ];
}

function renderText(payload) {
  const lines = [
    `WorldCup26 X football OpenClaw ${payload.generatedAtEest}`,
    `ok=${payload.ok ? "yes" : "no"} state=${payload.state} account=${payload.operatorAccount}`,
    `code=${payload.referralCode}`,
    `link=${payload.referralLink}`,
    `caps=per_hour:${payload.perHourCap} daily:${payload.dailyCap}`,
    `worker_packs=${payload.workerPacks.length} pack_actions=${payload.workerPacks.map((pack) => `${pack.worker}:${pack.actions.length}`).join(",")}`,
    `rule=${payload.proofRule}`,
    `quality=${payload.qualityRule}`,
    "",
    "account_searches:",
  ];
  for (const accountSearch of payload.accountSearches) {
    lines.push(`- ${accountSearch.id} ${accountSearch.query}`);
    lines.push(`  users=${accountSearch.url}`);
    lines.push(`  action=${accountSearch.action}`);
  }
  lines.push("");
  lines.push(
    "top_actions:",
  );
  for (const action of payload.actions.slice(0, 12)) {
    lines.push(`- ${action.id} ${action.owner} / ${action.query}`);
    lines.push(`  search=${action.searchUrl}`);
    lines.push(`  intent=${action.intentUrl}`);
    lines.push(`  copy=${oneLine(action.copy)}`);
    lines.push(`  proof=${action.proofCommand}`);
  }
  lines.push("");
  return lines.join("\n");
}

function renderMarkdown(payload) {
  return `# WorldCup26 X Football OpenClaw

Generated: ${payload.generatedAtEest}

- State: \`${payload.state}\`
- X account to use manually: \`${payload.operatorAccount}\`
- Per-hour cap: ${payload.perHourCap}
- Daily cap: ${payload.dailyCap}
- Referral code: \`${payload.referralCode}\`

${payload.proofRule}

${payload.qualityRule}

## Account Search Lanes

${payload.accountSearches.map((search) => `- [${search.query}](${search.url}) - ${search.signal}`).join("\n")}

## Worker Packs

${payload.workerPacks.map((pack) => `- [${pack.worker}](x-openclaw-${pack.slug}.html): ${pack.accountSearches.length} account searches, ${pack.searches.length} live searches, ${pack.actions.length} replies, cap ${pack.perHourCap}/h ${pack.dailyCap}/d`).join("\n")}

## Searches

${payload.searches.map((search) => `- [${search.query}](${search.url}) - ${search.signal}`).join("\n")}

## Reply Queue

${payload.actions.slice(0, 16).map((action) => `### ${action.id} - ${action.owner} - ${action.replyStyle}

Search: [${action.query}](${action.searchUrl})

\`\`\`text
${action.copy}
\`\`\`

[Open X compose](${action.intentUrl})

\`\`\`bash
${action.proofCommand}
\`\`\`
`).join("\n")}
`;
}

function renderHtml(payload) {
  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>WorldCup26 X Football OpenClaw</title>
  <style>
    :root{color-scheme:dark;--bg:#03140f;--panel:#0b2a20;--line:rgba(255,255,255,.15);--text:#f8fff9;--muted:#bad0c6;--gold:#ffd974;--mint:#74f0b2;--green:#0f7b5d;--blue:#7eb6ff}
    *{box-sizing:border-box}body{margin:0;background:radial-gradient(circle at 8% 0%,rgba(255,217,116,.22),transparent 24rem),radial-gradient(circle at 90% 6%,rgba(126,182,255,.16),transparent 26rem),var(--bg);color:var(--text);font-family:Inter,ui-sans-serif,system-ui,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif}
    main{width:min(980px,100%);margin:0 auto;padding:12px 10px 44px}section,.card{border:1px solid var(--line);border-radius:10px;background:rgba(11,42,32,.94);padding:14px;margin-bottom:10px}
    .hero{border-color:rgba(255,217,116,.66);background:linear-gradient(135deg,rgba(255,217,116,.18),rgba(11,42,32,.96))}
    .pill{display:inline-flex;margin-bottom:10px;padding:7px 10px;border-radius:999px;background:linear-gradient(135deg,var(--gold),var(--mint));color:#03140f;font-weight:950;text-transform:uppercase;font-size:12px}
    h1{margin:0 0 8px;font-size:clamp(38px,10vw,76px);line-height:.9}h2{margin:0 0 10px;font-size:22px}h3{margin:0 0 8px;font-size:18px}p{margin:0 0 8px;color:var(--muted);line-height:1.35}
    .stats{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:8px;margin-top:12px}.stats div{border:1px solid var(--line);border-radius:8px;padding:10px;background:rgba(255,255,255,.06)}.stats span{display:block;color:var(--muted);font-size:11px;font-weight:900;text-transform:uppercase}.stats strong{font-size:22px;color:var(--gold)}
    .grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:10px}.button,button{min-height:44px;border:1px solid rgba(116,240,178,.42);border-radius:8px;background:var(--green);color:#fff;font:inherit;font-weight:950;display:flex;align-items:center;justify-content:center;text-align:center;text-decoration:none;padding:9px;cursor:pointer}.gold{background:var(--gold);color:#03140f;border-color:var(--gold)}.blue{background:#0f4d7b}
    pre{white-space:pre-wrap;overflow-wrap:anywhere;border:1px solid var(--line);border-radius:8px;background:rgba(0,0,0,.25);padding:10px;line-height:1.35}.actions{display:grid;grid-template-columns:1fr;gap:10px}.row{display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-top:8px}.mono{font-family:ui-monospace,SFMono-Regular,Menlo,Monaco,Consolas,"Liberation Mono",monospace;font-size:12px}
    @media(max-width:760px){.stats,.grid,.row{grid-template-columns:1fr}h1{font-size:42px}}
  </style>
</head>
<body>
  <main>
    <section class="hero">
      <span class="pill">${escapeHtml(payload.state)}</span>
      <h1>X Football OpenClaw</h1>
      <p>Use the logged-in X account <strong>${escapeHtml(payload.operatorAccount)}</strong>. Search football conversations, personalize the first sentence, reply manually, then log only real proof.</p>
      <div class="stats">
        ${metric("Searches", payload.searches.length)}
        ${metric("Accounts", payload.accountSearches.length)}
        ${metric("Drafts", payload.drafts.length)}
        ${metric("Queue", payload.actions.length)}
      </div>
    </section>
    <section>
      <h2>Worker Packs</h2>
      <div class="grid">
        ${payload.workerPacks.map((pack) => `<a class="button gold" href="x-openclaw-${escapeAttr(pack.slug)}.html">${escapeHtml(pack.worker)} · ${pack.actions.length} replies</a>`).join("")}
      </div>
    </section>
    <section>
      <h2>Find Football Accounts</h2>
      <div class="grid">
        ${payload.accountSearches.map((search) => `<a class="button blue" href="${escapeAttr(search.url)}" target="_blank" rel="noreferrer">${escapeHtml(search.query)}</a>`).join("")}
      </div>
      <p>Open an account, choose a recent football post, personalize a reply from the queue, then log only the real reply URL.</p>
    </section>
    <section>
      <h2>Search Football Now</h2>
      <div class="grid">
        ${payload.searches.map((search) => `<a class="button blue" href="${escapeAttr(search.url)}" target="_blank" rel="noreferrer">${escapeHtml(search.query)}</a>`).join("")}
      </div>
    </section>
    <section>
      <h2>Reply Queue</h2>
      <div class="actions">
        ${payload.actions.slice(0, 16).map(renderActionHtml).join("")}
      </div>
    </section>
    <section>
      <h2>Rules</h2>
      <p>${escapeHtml(payload.qualityRule)}</p>
      <p>${escapeHtml(payload.proofRule)}</p>
    </section>
  </main>
  <script>
    document.addEventListener("click", async (event) => {
      const button = event.target.closest("[data-copy]");
      if (!button) return;
      const value = button.dataset.copy || "";
      try {
        await navigator.clipboard.writeText(value);
        const old = button.textContent;
        button.textContent = "Copied";
        setTimeout(() => { button.textContent = old; }, 1200);
      } catch {
        window.prompt("Copy this", value);
      }
    });
  </script>
</body>
</html>`;
}

function renderWorkerText(worker, payload) {
  const lines = [
    `WorldCup26 X OpenClaw ${worker.worker} ${worker.generatedAtEest}`,
    `ok=${worker.ok ? "yes" : "no"} state=${worker.state} account=${worker.operatorAccount}`,
    `code=${worker.referralCode}`,
    `link=${worker.referralLink}`,
    `caps=per_hour:${worker.perHourCap} daily:${worker.dailyCap}`,
    `rule=${worker.proofRule}`,
    "",
    "account_searches:",
  ];
  for (const search of worker.accountSearches) {
    lines.push(`- ${search.id} ${search.query}`);
    lines.push(`  users=${search.url}`);
    lines.push(`  action=${search.action}`);
  }
  lines.push("", "live_searches:");
  for (const search of worker.searches) {
    lines.push(`- ${search.query}`);
    lines.push(`  search=${search.url}`);
  }
  lines.push("", "reply_actions:");
  for (const action of worker.actions) {
    lines.push(`- ${action.id} ${action.query}`);
    lines.push(`  search=${action.searchUrl}`);
    lines.push(`  intent=${action.intentUrl}`);
    lines.push(`  copy=${oneLine(action.copy)}`);
    lines.push(`  proof=${action.proofCommand}`);
  }
  lines.push("");
  return lines.join("\n");
}

function renderWorkerMarkdown(worker, payload) {
  return `# WorldCup26 X OpenClaw - ${worker.worker}

Generated: ${worker.generatedAtEest}

- X account: \`${worker.operatorAccount}\`
- Per-hour cap: ${worker.perHourCap}
- Daily cap: ${worker.dailyCap}
- Referral code: \`${worker.referralCode}\`

${worker.proofRule}

## Account Searches

${worker.accountSearches.map((search) => `- [${search.query}](${search.url}) - ${search.signal}`).join("\n")}

## Live Searches

${worker.searches.map((search) => `- [${search.query}](${search.url}) - ${search.signal}`).join("\n")}

## Reply Actions

${worker.actions.map((action) => `### ${action.id} - ${action.replyStyle}

Search: [${action.query}](${action.searchUrl})

\`\`\`text
${action.copy}
\`\`\`

[Open X compose](${action.intentUrl})

\`\`\`bash
${action.proofCommand}
\`\`\`
`).join("\n")}

[Back to full OpenClaw](x-football-openclaw.html)
`;
}

function renderWorkerHtml(worker, payload) {
  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>WorldCup26 X OpenClaw - ${escapeHtml(worker.worker)}</title>
  <style>
    :root{color-scheme:dark;--bg:#03140f;--panel:#0b2a20;--line:rgba(255,255,255,.15);--text:#f8fff9;--muted:#bad0c6;--gold:#ffd974;--mint:#74f0b2;--green:#0f7b5d;--blue:#0f4d7b}
    *{box-sizing:border-box}body{margin:0;background:radial-gradient(circle at 8% 0%,rgba(255,217,116,.22),transparent 24rem),radial-gradient(circle at 90% 6%,rgba(116,240,178,.15),transparent 26rem),var(--bg);color:var(--text);font-family:Inter,ui-sans-serif,system-ui,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif}
    main{width:min(920px,100%);margin:0 auto;padding:12px 10px 44px}section,.card{border:1px solid var(--line);border-radius:10px;background:rgba(11,42,32,.94);padding:14px;margin-bottom:10px}.hero{border-color:rgba(255,217,116,.66);background:linear-gradient(135deg,rgba(255,217,116,.18),rgba(11,42,32,.96))}
    h1{margin:0 0 8px;font-size:clamp(38px,10vw,72px);line-height:.9}h2{margin:0 0 10px;font-size:22px}h3{margin:0 0 8px;font-size:18px}p{margin:0 0 8px;color:var(--muted);line-height:1.35}.pill{display:inline-flex;margin-bottom:10px;padding:7px 10px;border-radius:999px;background:linear-gradient(135deg,var(--gold),var(--mint));color:#03140f;font-weight:950;text-transform:uppercase;font-size:12px}
    .stats{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:8px;margin-top:12px}.stats div{border:1px solid var(--line);border-radius:8px;padding:10px;background:rgba(255,255,255,.06)}.stats span{display:block;color:var(--muted);font-size:11px;font-weight:900;text-transform:uppercase}.stats strong{font-size:22px;color:var(--gold)}
    .grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:10px}.button,button{min-height:44px;border:1px solid rgba(116,240,178,.42);border-radius:8px;background:var(--green);color:#fff;font:inherit;font-weight:950;display:flex;align-items:center;justify-content:center;text-align:center;text-decoration:none;padding:9px;cursor:pointer}.gold{background:var(--gold);color:#03140f;border-color:var(--gold)}.blue{background:var(--blue)}
    pre{white-space:pre-wrap;overflow-wrap:anywhere;border:1px solid var(--line);border-radius:8px;background:rgba(0,0,0,.25);padding:10px;line-height:1.35}.actions{display:grid;grid-template-columns:1fr;gap:10px}.row{display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-top:8px}.mono{font-family:ui-monospace,SFMono-Regular,Menlo,Monaco,Consolas,"Liberation Mono",monospace;font-size:12px}
    @media(max-width:760px){.stats,.grid,.row{grid-template-columns:1fr}h1{font-size:42px}}
  </style>
</head>
<body>
  <main>
    <section class="hero">
      <span class="pill">${escapeHtml(worker.state)}</span>
      <h1>${escapeHtml(worker.worker)} X Pack</h1>
      <p>Use <strong>${escapeHtml(worker.operatorAccount)}</strong>. Open a football account/search, personalize, reply manually, then log a real URL.</p>
      <div class="stats">
        ${metric("Accounts", worker.accountSearches.length)}
        ${metric("Searches", worker.searches.length)}
        ${metric("Replies", worker.actions.length)}
        ${metric("Daily cap", worker.dailyCap)}
      </div>
    </section>
    <section>
      <h2>Account Searches</h2>
      <div class="grid">
        ${worker.accountSearches.map((search) => `<a class="button blue" href="${escapeAttr(search.url)}" target="_blank" rel="noreferrer">${escapeHtml(search.query)}</a>`).join("")}
      </div>
    </section>
    <section>
      <h2>Live Searches</h2>
      <div class="grid">
        ${worker.searches.map((search) => `<a class="button blue" href="${escapeAttr(search.url)}" target="_blank" rel="noreferrer">${escapeHtml(search.query)}</a>`).join("")}
      </div>
    </section>
    <section>
      <h2>Replies</h2>
      <div class="actions">
        ${worker.actions.map(renderActionHtml).join("")}
      </div>
    </section>
    <section>
      <h2>Proof Rule</h2>
      <p>${escapeHtml(worker.proofRule)}</p>
      <a class="button gold" href="x-football-openclaw.html">Back to full OpenClaw</a>
    </section>
  </main>
  <script>
    document.addEventListener("click", async (event) => {
      const button = event.target.closest("[data-copy]");
      if (!button) return;
      const value = button.dataset.copy || "";
      try {
        await navigator.clipboard.writeText(value);
        const old = button.textContent;
        button.textContent = "Copied";
        setTimeout(() => { button.textContent = old; }, 1200);
      } catch {
        window.prompt("Copy this", value);
      }
    });
  </script>
</body>
</html>`;
}

function renderActionHtml(action) {
  return `<article class="card">
    <h3>${escapeHtml(action.id)} - ${escapeHtml(action.owner)} - ${escapeHtml(action.replyStyle)}</h3>
    <p>${escapeHtml(action.targetSignal)}</p>
    <pre>${escapeHtml(action.copy)}</pre>
    <div class="row">
      <a class="button blue" href="${escapeAttr(action.searchUrl)}" target="_blank" rel="noreferrer">Open search</a>
      <a class="button gold" href="${escapeAttr(action.intentUrl)}" target="_blank" rel="noreferrer">Open compose</a>
      <button data-copy="${escapeAttr(action.copy)}">Copy reply</button>
      <button data-copy="${escapeAttr(action.proofCommand)}">Copy proof command</button>
    </div>
    <pre class="mono">${escapeHtml(action.proofCommand)}</pre>
  </article>`;
}

function withUtm(url, params) {
  const parsed = new URL(url);
  for (const [key, value] of Object.entries(params)) {
    parsed.searchParams.set(key, value);
  }
  return parsed.toString();
}

function metric(label, value) {
  return `<div><span>${escapeHtml(label)}</span><strong>${escapeHtml(String(value))}</strong></div>`;
}

function oneLine(value) {
  return String(value ?? "").replace(/\s+/g, " ").trim();
}

function slugify(value) {
  return String(value ?? "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 48);
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

function parseArgs(argv) {
  const parsed = {};
  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    if (arg === "--quiet") {
      parsed.quiet = true;
    } else if (arg === "--root") {
      parsed.root = argv[index + 1];
      index += 1;
    } else if (arg === "--now") {
      parsed.now = argv[index + 1];
      index += 1;
    }
  }
  return parsed;
}

function escapeHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function escapeAttr(value) {
  return escapeHtml(value).replaceAll("`", "&#096;");
}
