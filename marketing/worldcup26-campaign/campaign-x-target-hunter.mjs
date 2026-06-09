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

await writeFile(path.join(runtimeDir, "x-target-hunter.json"), `${JSON.stringify(payload, null, 2)}\n`);
await writeFile(path.join(runtimeDir, "x-target-hunter.txt"), renderText(payload));
await writeFile(path.join(runtimeDir, "x-target-hunter.md"), renderMarkdown(payload));
await writeFile(path.join(runtimeDir, "x-target-hunter.html"), renderHtml(payload));
for (const pack of payload.workerPacks) {
  await writeFile(path.join(runtimeDir, `x-target-hunter-${pack.slug}.json`), `${JSON.stringify(pack, null, 2)}\n`);
  await writeFile(path.join(runtimeDir, `x-target-hunter-${pack.slug}.txt`), renderWorkerText(pack, payload));
  await writeFile(path.join(runtimeDir, `x-target-hunter-${pack.slug}.md`), renderWorkerMarkdown(pack, payload));
  await writeFile(path.join(runtimeDir, `x-target-hunter-${pack.slug}.html`), renderWorkerHtml(pack, payload));
}

if (!args.quiet) {
  process.stdout.write(renderText(payload));
}

function buildPayload() {
  const lanes = buildLanes();
  const workerPacks = WORKERS.map((worker, index) => {
    const assigned = lanes.filter((_, laneIndex) => laneIndex % WORKERS.length === index);
    return {
      schema: "worldcup26-x-target-hunter-worker-pack-v1",
      generatedAt: now.toISOString(),
      generatedAtEest: formatEestLogTime(now),
      ok: assigned.length >= 10,
      state: "manual-x-target-hunting-ready",
      worker,
      slug: slugify(worker),
      operatorAccount: OPERATOR_ACCOUNT,
      referralCode: REFERRAL_CODE,
      referralLink: REFERRAL_LINK,
      perHourCap: 20,
      dailyCap: 80,
      lanes: assigned,
      firstLane: assigned[0] ?? null,
      action:
        "Open each lane, collect real football accounts/tweets, then use x-openclaw worker replies only where the conversation genuinely fits.",
      proofRule:
        "This hunter is discovery only. Do not log proof for opening searches. Log proof only after a real reply/post URL or precise private proof note exists.",
    };
  });
  return {
    schema: "worldcup26-x-target-hunter-v1",
    generatedAt: now.toISOString(),
    generatedAtEest: formatEestLogTime(now),
    ok: workerPacks.every((pack) => pack.ok),
    state: "manual-x-target-hunting-ready",
    operatorAccount: OPERATOR_ACCOUNT,
    referralCode: REFERRAL_CODE,
    referralLink: REFERRAL_LINK,
    laneCount: lanes.length,
    workers: WORKERS,
    lanes,
    workerPacks,
    proofRule:
      "Target hunting is not posting proof. It only creates places to look. Real proof requires a real X reply URL or precise private proof note.",
    qualityRule:
      "Prioritize small and mid-sized active football accounts, prediction threads, national-team fan accounts, and replies from real people. Skip bots, giveaway threads, politics, crypto shill threads, and unrelated celebrity posts.",
  };
}

function buildLanes() {
  const rows = [
    ["live", "World Cup 2026 predictions", "prediction threads already close to the game idea"],
    ["live", "who wins World Cup 2026", "fans naming favorites"],
    ["live", "World Cup dark horse", "underdog pick debates"],
    ["live", "pick three teams World Cup", "direct pick-three framing"],
    ["live", "best national team 2026", "national-team debates"],
    ["live", "World Cup group stage predictions", "fixtures and group-stage forecast threads"],
    ["live", "football prediction game", "prediction-game users"],
    ["live", "soccer prediction game", "US soccer prediction users"],
    ["live", "Argentina World Cup 2026", "Argentina fan conversations"],
    ["live", "Brazil World Cup 2026", "Brazil fan conversations"],
    ["live", "England World Cup 2026", "England fan conversations"],
    ["live", "France World Cup 2026", "France fan conversations"],
    ["live", "Germany World Cup 2026", "Germany fan conversations"],
    ["live", "Portugal World Cup 2026", "Portugal fan conversations"],
    ["live", "Spain World Cup 2026", "Spain fan conversations"],
    ["live", "USA World Cup 2026", "US host-country fan conversations"],
    ["live", "Mexico World Cup 2026", "Mexico host-country fan conversations"],
    ["live", "Canada World Cup 2026", "Canada host-country fan conversations"],
    ["live", "Nigeria World Cup 2026", "Nigeria fan conversations"],
    ["live", "Morocco World Cup 2026", "Morocco fan conversations"],
    ["live", "Japan World Cup 2026", "Japan fan conversations"],
    ["live", "Korea World Cup 2026", "Korea fan conversations"],
    ["live", "Netherlands World Cup 2026", "Netherlands fan conversations"],
    ["live", "Croatia World Cup 2026", "Croatia fan conversations"],
    ["user", "World Cup 2026", "profiles focused on the next World Cup"],
    ["user", "football predictions", "prediction accounts"],
    ["user", "soccer predictions", "US/international prediction accounts"],
    ["user", "football fan account", "active fan accounts"],
    ["user", "World Cup fan", "World Cup fan accounts"],
    ["user", "national team football", "national-team supporter accounts"],
    ["user", "football community", "community accounts"],
    ["user", "football analytics", "analyst accounts"],
    ["user", "Argentina football fan", "Argentina fan accounts"],
    ["user", "Brazil football fan", "Brazil fan accounts"],
    ["user", "England football fan", "England fan accounts"],
    ["user", "France football fan", "France fan accounts"],
    ["user", "Germany football fan", "Germany fan accounts"],
    ["user", "Portugal football fan", "Portugal fan accounts"],
    ["user", "Spain football fan", "Spain fan accounts"],
    ["user", "USA soccer fan", "US soccer fan accounts"],
    ["user", "Mexico football fan", "Mexico fan accounts"],
    ["user", "Canada soccer fan", "Canada fan accounts"],
    ["live", "football fans follow back World Cup", "small fan accounts and reply-heavy threads"],
    ["live", "World Cup debate football", "debate threads"],
    ["live", "rank World Cup teams", "ranking threads"],
    ["live", "top 3 teams World Cup", "exact top-three discussions"],
    ["live", "football leaderboard game", "leaderboard/game framing"],
    ["live", "World Cup fantasy football", "fantasy-style football audience"],
  ];
  return rows.map(([type, query, signal], index) => {
    const searchQuery = type === "live" ? `${query} -giveaway -crypto -airdrop` : query;
    return {
      id: `xh-${String(index + 1).padStart(2, "0")}`,
      type,
      query,
      signal,
      url: `https://x.com/search?q=${encodeURIComponent(searchQuery)}&src=typed_query&f=${type}`,
      next:
        type === "user"
          ? "Open promising profiles, choose a recent football post, then reply naturally if WorldCup26 fits."
          : "Open latest posts, reply only to real football discussion where pick-3 or prediction angle fits.",
    };
  });
}

function renderText(payload) {
  const lines = [
    `WorldCup26 X target hunter ${payload.generatedAtEest}`,
    `ok=${payload.ok ? "yes" : "no"} state=${payload.state} account=${payload.operatorAccount}`,
    `code=${payload.referralCode}`,
    `link=${payload.referralLink}`,
    `lanes=${payload.laneCount} worker_packs=${payload.workerPacks.length} pack_lanes=${payload.workerPacks.map((pack) => `${pack.worker}:${pack.lanes.length}`).join(",")}`,
    `rule=${payload.proofRule}`,
    `quality=${payload.qualityRule}`,
    "",
  ];
  for (const pack of payload.workerPacks) {
    lines.push(`${pack.worker}: ${pack.lanes.length} lanes first=${pack.firstLane?.query || "-"}`);
    lines.push(`  file=runtime/x-target-hunter-${pack.slug}.html`);
  }
  lines.push("", "top_lanes:");
  for (const lane of payload.lanes.slice(0, 18)) {
    lines.push(`- ${lane.id} ${lane.type} ${lane.query}`);
    lines.push(`  url=${lane.url}`);
    lines.push(`  next=${lane.next}`);
  }
  lines.push("");
  return lines.join("\n");
}

function renderMarkdown(payload) {
  return `# WorldCup26 X Target Hunter

Generated: ${payload.generatedAtEest}

- State: \`${payload.state}\`
- X account: \`${payload.operatorAccount}\`
- Referral code: \`${payload.referralCode}\`
- Lanes: ${payload.laneCount}

${payload.proofRule}

${payload.qualityRule}

## Workers

${payload.workerPacks.map((pack) => `- [${pack.worker}](x-target-hunter-${pack.slug}.html): ${pack.lanes.length} lanes, first ${pack.firstLane?.query || "-"}`).join("\n")}

## Lanes

${payload.lanes.map((lane) => `- [${lane.id} ${lane.type} - ${lane.query}](${lane.url}) - ${lane.signal}`).join("\n")}
`;
}

function renderWorkerText(pack) {
  const lines = [
    `WorldCup26 X target hunter / ${pack.worker} ${pack.generatedAtEest}`,
    `ok=${pack.ok ? "yes" : "no"} state=${pack.state} account=${pack.operatorAccount}`,
    `code=${pack.referralCode}`,
    `link=${pack.referralLink}`,
    `lanes=${pack.lanes.length} cap=${pack.perHourCap}/h ${pack.dailyCap}/d`,
    `action=${pack.action}`,
    `rule=${pack.proofRule}`,
    "",
  ];
  for (const lane of pack.lanes) {
    lines.push(`- ${lane.id} ${lane.type} ${lane.query}`);
    lines.push(`  signal=${lane.signal}`);
    lines.push(`  url=${lane.url}`);
    lines.push(`  next=${lane.next}`);
  }
  lines.push("");
  return lines.join("\n");
}

function renderWorkerMarkdown(pack) {
  return `# X Target Hunter / ${pack.worker}

Generated: ${pack.generatedAtEest}

- Lanes: ${pack.lanes.length}
- Cap: ${pack.perHourCap}/h, ${pack.dailyCap}/day

${pack.proofRule}

${pack.lanes.map((lane) => `## ${lane.id} ${lane.query}

[Open X search](${lane.url})

${lane.next}
`).join("\n")}
`;
}

function renderHtml(payload) {
  const workerCards = payload.workerPacks.map((pack) => `
    <a class="card" href="x-target-hunter-${escapeAttr(pack.slug)}.html">
      <span>${escapeHtml(pack.worker)}</span>
      <strong>${pack.lanes.length} lanes</strong>
      <small>${escapeHtml(pack.firstLane?.query || "-")}</small>
    </a>`).join("");
  const rows = payload.lanes.map((lane) => `
    <tr>
      <td>${escapeHtml(lane.id)}</td>
      <td>${escapeHtml(lane.type)}</td>
      <td><a href="${escapeAttr(lane.url)}">${escapeHtml(lane.query)}</a></td>
      <td>${escapeHtml(lane.signal)}</td>
    </tr>`).join("");
  return pageShell("WorldCup26 X Target Hunter", `
    <section class="hero">
      <span class="pill">${escapeHtml(payload.state)}</span>
      <h1>X Target Hunter</h1>
      <p>${escapeHtml(payload.qualityRule)}</p>
      <div class="stats">
        <div><span>Lanes</span><strong>${payload.laneCount}</strong></div>
        <div><span>Workers</span><strong>${payload.workerPacks.length}</strong></div>
        <div><span>Account</span><strong>X</strong></div>
      </div>
    </section>
    <section><h2>Worker packs</h2><div class="cards">${workerCards}</div></section>
    <section><h2>All lanes</h2><table><tbody>${rows}</tbody></table></section>
    <section class="warn"><h2>Proof rule</h2><p>${escapeHtml(payload.proofRule)}</p></section>
  `);
}

function renderWorkerHtml(pack) {
  const rows = pack.lanes.map((lane) => `
    <tr>
      <td>${escapeHtml(lane.id)}</td>
      <td>${escapeHtml(lane.type)}</td>
      <td><a href="${escapeAttr(lane.url)}">${escapeHtml(lane.query)}</a></td>
      <td>${escapeHtml(lane.next)}</td>
    </tr>`).join("");
  return pageShell(`WorldCup26 X Target Hunter / ${pack.worker}`, `
    <section class="hero">
      <span class="pill">${escapeHtml(pack.worker)}</span>
      <h1>Target Hunter</h1>
      <p>${escapeHtml(pack.action)}</p>
      <div class="stats">
        <div><span>Lanes</span><strong>${pack.lanes.length}</strong></div>
        <div><span>Cap / hour</span><strong>${pack.perHourCap}</strong></div>
        <div><span>Daily cap</span><strong>${pack.dailyCap}</strong></div>
      </div>
    </section>
    <section><h2>Lanes</h2><table><tbody>${rows}</tbody></table></section>
    <section class="warn"><h2>Proof rule</h2><p>${escapeHtml(pack.proofRule)}</p></section>
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
    main{width:min(1040px,100%);margin:0 auto;padding:12px 10px 42px}section{border:1px solid var(--line);border-radius:10px;background:rgba(11,42,32,.94);padding:16px;margin-bottom:10px}.hero{border-color:rgba(255,217,116,.58);background:linear-gradient(135deg,rgba(255,217,116,.2),rgba(11,42,32,.95))}
    h1{margin:0;font-size:clamp(42px,10vw,76px);line-height:.9}h2{margin:0 0 10px;font-size:24px}p{margin:0 0 10px;color:var(--muted);line-height:1.35}.pill{display:inline-flex;margin-bottom:10px;padding:7px 10px;border-radius:999px;background:linear-gradient(135deg,var(--gold),var(--mint));color:#03140f;font-weight:950;text-transform:uppercase;font-size:12px}
    .stats,.cards{display:grid;grid-template-columns:repeat(4,1fr);gap:8px;margin-top:14px}.stats div,.card{border:1px solid var(--line);border-radius:8px;padding:10px;background:rgba(0,0,0,.18);color:var(--text);text-decoration:none}.stats span,.card span{display:block;color:var(--muted);font-weight:850;font-size:11px;text-transform:uppercase}.stats strong,.card strong{display:block;color:var(--gold);font-size:26px;line-height:1}.card small{display:block;margin-top:6px;color:var(--muted)}
    table{width:100%;border-collapse:collapse}td{border-top:1px solid var(--line);padding:9px;vertical-align:top}a{color:var(--mint);font-weight:850}.warn{border-color:rgba(255,131,119,.55);background:rgba(255,131,119,.1)}
    @media(max-width:760px){.stats,.cards{grid-template-columns:1fr 1fr}h1{font-size:42px}td{display:block;border-top:0;padding:4px 0}tr{display:block;border-top:1px solid var(--line);padding:8px 0}}
  </style>
</head>
<body><main>${body}</main></body>
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

function slugify(value) {
  return String(value ?? "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
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
    .replaceAll('"', "&quot;");
}

function escapeAttr(value) {
  return escapeHtml(value).replaceAll("'", "&#39;");
}
