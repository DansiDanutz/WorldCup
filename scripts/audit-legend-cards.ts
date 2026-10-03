// Audit every Legend card: does its video exist, can it play inside the app (the
// unlock now needs an embed), which channel is it on, does it have real art, and is
// the copy clean. Re-run whenever cards or videos change.
//
//   node --experimental-strip-types --import ./tests/register.mjs scripts/audit-legend-cards.ts
//
// Writes docs/LEGEND_CARD_AUDIT.md and prints a summary. Exits 1 if any card is
// broken (missing/removed/non-embeddable video, missing art file, banned wording).

import { existsSync, writeFileSync } from "node:fs";

import { LEGEND_CARDS, type LegendCard } from "@/lib/legend-cards";
import { getYouTubeVideoId } from "@/lib/youtube-watch-progress";

const CANONICAL_CHANNEL = "@DansLab-WorldCup";
const CONCURRENCY = 8;
const BANNED = /\b(odds|bet|bets|betting|wager|stake|jackpot|bookmaker|cash prize|prize money|win money)\b/i;

type VideoCheck = { status: number; title?: string; channel?: string };
type Finding = { severity: "error" | "warn"; card: string; message: string };

async function oembed(videoId: string): Promise<VideoCheck> {
  const url = `https://www.youtube.com/oembed?format=json&url=${encodeURIComponent(`https://www.youtube.com/watch?v=${videoId}`)}`;
  for (let attempt = 0; attempt < 3; attempt += 1) {
    try {
      const response = await fetch(url);
      if (response.status === 200) {
        const body = (await response.json()) as { title?: string; author_url?: string };
        return { status: 200, title: body.title, channel: body.author_url?.split("/").pop() };
      }
      if (response.status < 500) {
        return { status: response.status };
      }
    } catch {
      // retry transient network errors
    }
    await new Promise((resolve) => setTimeout(resolve, 800 * (attempt + 1)));
  }
  return { status: 0 };
}

async function mapLimit<T, R>(items: T[], limit: number, fn: (item: T) => Promise<R>): Promise<R[]> {
  const results: R[] = new Array(items.length);
  let next = 0;
  await Promise.all(
    Array.from({ length: limit }, async () => {
      while (next < items.length) {
        const index = next;
        next += 1;
        results[index] = await fn(items[index]);
      }
    }),
  );
  return results;
}

function describeStatus(status: number) {
  return status === 401
    ? "embedding disabled — cannot unlock in-app"
    : status === 404 || status === 400
      ? "video missing, private or removed"
      : status === 0
        ? "could not reach YouTube"
        : `YouTube returned ${status}`;
}

function copyIssues(card: LegendCard): string[] {
  const issues: string[] = [];
  const fields: Array<[string, string | undefined]> = [
    ["title", card.title],
    ["subtitle", card.subtitle],
    ["story", card.story],
  ];
  for (const [name, value] of fields) {
    if (!value || !value.trim()) {
      issues.push(`${name} is empty`);
      continue;
    }
    if (/\b(undefined|null|NaN|TODO|TBD|lorem)\b/.test(value)) issues.push(`${name} contains placeholder text`);
    if (/ {2,}/.test(value)) issues.push(`${name} has double spaces`);
    if (/\.\.\.$|…$/.test(value.trim()) && name !== "story") issues.push(`${name} is truncated ("…")`);
    if (/^[a-z]/.test(value.trim())) issues.push(`${name} starts lowercase`);
    if (BANNED.test(value)) issues.push(`${name} uses betting wording ("${value.match(BANNED)?.[0]}")`);
  }
  if (card.title.length > 64) issues.push(`title is ${card.title.length} chars (cards clip past ~64)`);
  if (card.story && card.story.length < 60) issues.push(`story is only ${card.story.length} chars`);
  return issues;
}

async function main() {
  const findings: Finding[] = [];
  const rows: string[] = [];
  const cards = LEGEND_CARDS;

  // Every video should reveal exactly one card.
  const byVideo = new Map<string, string[]>();
  for (const card of cards) {
    const id = getYouTubeVideoId(card.youtube);
    if (id) byVideo.set(id, [...(byVideo.get(id) ?? []), card.id]);
  }

  const titles = new Map<string, string[]>();
  for (const card of cards) titles.set(card.title.trim().toLowerCase(), [...(titles.get(card.title.trim().toLowerCase()) ?? []), card.id]);

  const checks = await mapLimit(cards, CONCURRENCY, async (card) => {
    const videoId = getYouTubeVideoId(card.youtube);
    return { card, videoId, video: videoId ? await oembed(videoId) : null };
  });

  const channels = new Map<string, number>();
  let placeholders = 0;

  for (const { card, videoId, video } of checks) {
    const problems: string[] = [];

    if (!card.youtube) {
      findings.push({ severity: "error", card: card.id, message: "no video link — card can never unlock" });
      problems.push("no video");
    } else if (!videoId) {
      findings.push({ severity: "error", card: card.id, message: `unparseable video link: ${card.youtube}` });
      problems.push("bad link");
    } else if (video && video.status !== 200) {
      findings.push({ severity: "error", card: card.id, message: `${describeStatus(video.status)} (${videoId})` });
      problems.push(describeStatus(video.status));
    }

    if (video?.channel) {
      // Reported once in the summary: which channel is canonical is a channel
      // decision, not a per-card defect.
      channels.set(video.channel, (channels.get(video.channel) ?? 0) + 1);
    }

    if (videoId && (byVideo.get(videoId)?.length ?? 0) > 1) {
      findings.push({ severity: "warn", card: card.id, message: `video ${videoId} is shared with ${byVideo.get(videoId)!.filter((id) => id !== card.id).join(", ")}` });
      problems.push("shared video");
    }

    if (card.image.startsWith("data:image/svg")) {
      placeholders += 1;
      problems.push("placeholder art");
    } else if (card.image.startsWith("/") && !existsSync(`public${card.image}`)) {
      findings.push({ severity: "error", card: card.id, message: `art file missing: public${card.image}` });
      problems.push("art missing");
    }

    if ((titles.get(card.title.trim().toLowerCase())?.length ?? 0) > 1) {
      findings.push({ severity: "warn", card: card.id, message: `duplicate title "${card.title}"` });
    }

    for (const issue of copyIssues(card)) {
      findings.push({ severity: /betting|placeholder text|empty/.test(issue) ? "error" : "warn", card: card.id, message: issue });
      problems.push(issue);
    }

    rows.push(
      `| \`${card.id}\` | ${card.kind} | ${card.title.replace(/\|/g, "\\|")} | ${video?.status ?? "—"} | ${video?.channel ?? "—"} | ${card.image.startsWith("data:") ? "placeholder" : "art"} | ${problems.length ? problems.join("; ") : "ok"} |`,
    );
  }

  const errors = findings.filter((finding) => finding.severity === "error");
  const warnings = findings.filter((finding) => finding.severity === "warn");
  const live = checks.filter((check) => check.video?.status === 200).length;
  const channelLine = [...channels].map(([name, count]) => `${name}: ${count}`).join(" · ");

  const report = [
    "# Legend card audit",
    "",
    `Generated by \`scripts/audit-legend-cards.ts\`. ${cards.length} cards.`,
    "",
    `- **Playable in-app:** ${live}/${cards.length}`,
    `- **Channels:** ${channelLine || "—"} (canonical: ${CANONICAL_CHANNEL})`,
    `- **Placeholder art (generated SVG, not a designed card):** ${placeholders}`,
    `- **Errors:** ${errors.length} · **Warnings:** ${warnings.length}`,
    "",
    "## Findings",
    "",
    ...(findings.length ? findings.map((f) => `- **${f.severity}** \`${f.card}\` — ${f.message}`) : ["None."]),
    "",
    "## Every card",
    "",
    "| Card | Kind | Title | oEmbed | Channel | Art | Status |",
    "|---|---|---|---|---|---|---|",
    ...rows,
    "",
  ].join("\n");

  writeFileSync("docs/LEGEND_CARD_AUDIT.md", report);
  console.log(`cards ${cards.length} · playable ${live} · placeholders ${placeholders} · errors ${errors.length} · warnings ${warnings.length}`);
  console.log(`channels: ${channelLine}`);
  for (const f of errors) console.log(`  ERROR ${f.card}: ${f.message}`);
  process.exitCode = errors.length ? 1 : 0;
}

await main();
