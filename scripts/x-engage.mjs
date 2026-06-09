// X (Twitter) engagement CLI for WorldCup26.
//
// Purpose: stop being broadcast-only. Find relevant WorldCup / football
// conversations and engage them (reply / like), in addition to posting.
//
// Usage:
//   node scripts/x-engage.mjs me
//   node scripts/x-engage.mjs search "World Cup 2026" --max 25 --min-likes 3
//   node scripts/x-engage.mjs search --preset worldcup --max 30 --lang en
//   node scripts/x-engage.mjs presets
//   node scripts/x-engage.mjs reply <tweetId> "your reply text" --confirm
//   node scripts/x-engage.mjs post "your tweet text" --confirm
//   node scripts/x-engage.mjs like <tweetId> --confirm
//
// Write actions (post/reply/like) are DRY-RUN by default. Pass --confirm
// (or set X_ENGAGE_LIVE=1) to actually send. Posting to X is public and
// irreversible, so the gate is intentional.

import { createXClient, loadCredentials } from "./lib/x-client.mjs";

// Curated discovery queries. `-is:retweet -is:reply` keeps us on original
// conversations; `lang:en` is appended from --lang when provided.
const PRESETS = {
  worldcup:
    '("World Cup 2026" OR "WorldCup2026" OR #WorldCup2026 OR "FIFA World Cup") -is:retweet',
  predictions:
    '("World Cup" (predict OR prediction OR bracket OR "who wins" OR pick)) -is:retweet -is:reply',
  fantasy:
    '("World Cup" (fantasy OR "pick em" OR leaderboard OR "my picks")) -is:retweet -is:reply',
  football:
    '(football OR soccer) ("World Cup" OR qualifiers OR national team) -is:retweet -is:reply',
};

function parseArgs(argv) {
  const args = { _: [] };
  for (let i = 0; i < argv.length; i += 1) {
    const token = argv[i];
    if (token.startsWith("--")) {
      const key = token.slice(2);
      const next = argv[i + 1];
      if (next === undefined || next.startsWith("--")) {
        args[key] = true;
      } else {
        args[key] = next;
        i += 1;
      }
    } else {
      args._.push(token);
    }
  }
  return args;
}

function engagementScore(metrics = {}) {
  const { like_count = 0, reply_count = 0, retweet_count = 0, quote_count = 0 } =
    metrics;
  return like_count + reply_count * 2 + retweet_count * 2 + quote_count * 2;
}

function fmtTweet(tweet, authorsById) {
  const author = authorsById.get(tweet.author_id);
  const handle = author ? `@${author.username}` : tweet.author_id;
  const m = tweet.public_metrics ?? {};
  const stats = `♥${m.like_count ?? 0} ↺${m.retweet_count ?? 0} 💬${
    m.reply_count ?? 0
  }`;
  const text = tweet.text.replace(/\s+/g, " ").trim();
  return [
    `https://x.com/${author ? author.username : "i"}/status/${tweet.id}`,
    `  ${handle}  [${stats}]  (${tweet.lang ?? "?"})`,
    `  ${text}`,
  ].join("\n");
}

async function runSearch(client, args) {
  let query = args._[0];
  if (args.preset) {
    const preset = PRESETS[args.preset];
    if (!preset) {
      throw new Error(
        `Unknown preset "${args.preset}". Available: ${Object.keys(PRESETS).join(", ")}`,
      );
    }
    query = preset;
  }
  if (!query) {
    throw new Error('Provide a search query or --preset <name>. Try "presets".');
  }
  if (args.lang && typeof args.lang === "string") {
    query += ` lang:${args.lang}`;
  }

  const maxResults = Number(args.max ?? 20);
  const result = await client.searchRecent(query, { maxResults });
  const tweets = result.data ?? [];
  const authorsById = new Map(
    (result.includes?.users ?? []).map((u) => [u.id, u]),
  );

  const minLikes = Number(args["min-likes"] ?? 0);
  const ranked = tweets
    .filter((t) => (t.public_metrics?.like_count ?? 0) >= minLikes)
    .sort(
      (a, b) =>
        engagementScore(b.public_metrics) - engagementScore(a.public_metrics),
    );

  console.log(`Query: ${query}`);
  console.log(`Returned ${tweets.length} tweets, ${ranked.length} after filters.\n`);
  if (ranked.length === 0) {
    console.log("No conversations matched. Loosen --min-likes or try a preset.");
    return;
  }
  for (const tweet of ranked) {
    console.log(fmtTweet(tweet, authorsById));
    console.log("");
  }
  console.log(
    "Engage with:  node scripts/x-engage.mjs reply <tweetId> \"...\" --confirm",
  );
}

function isLive(args) {
  return args.confirm === true || process.env.X_ENGAGE_LIVE === "1";
}

async function runWrite(client, action, args) {
  const live = isLive(args);
  if (action === "post") {
    const text = args._[0];
    if (!text) throw new Error('Provide the tweet text: post "..."');
    if (!live) {
      console.log("[dry-run] would POST tweet:\n  " + text);
      console.log("\nAdd --confirm to send.");
      return;
    }
    const res = await client.postTweet(text);
    console.log(`Posted: https://x.com/i/status/${res.data?.id}`);
  } else if (action === "reply") {
    const [tweetId, text] = args._;
    if (!tweetId || !text) throw new Error('Usage: reply <tweetId> "..."');
    if (!live) {
      console.log(`[dry-run] would REPLY to ${tweetId}:\n  ${text}`);
      console.log("\nAdd --confirm to send.");
      return;
    }
    const res = await client.reply(tweetId, text);
    console.log(`Replied: https://x.com/i/status/${res.data?.id}`);
  } else if (action === "like") {
    const [tweetId] = args._;
    if (!tweetId) throw new Error("Usage: like <tweetId>");
    if (!live) {
      console.log(`[dry-run] would LIKE ${tweetId}. Add --confirm to send.`);
      return;
    }
    await client.like(tweetId);
    console.log(`Liked ${tweetId}.`);
  }
}

async function main() {
  const [, , command, ...rest] = process.argv;
  const args = parseArgs(rest);

  if (!command || command === "help" || command === "--help") {
    console.log(
      [
        "X engagement CLI — commands:",
        "  me                         Verify auth, show the signed-in account",
        "  presets                    List curated WorldCup/football queries",
        "  search <q> | --preset <p>  Find conversations (flags: --max --min-likes --lang)",
        "  reply <tweetId> <text>     Reply to a tweet (--confirm to send)",
        "  post <text>                Post a tweet (--confirm to send)",
        "  like <tweetId>             Like a tweet (--confirm to send)",
      ].join("\n"),
    );
    return;
  }

  if (command === "presets") {
    for (const [name, q] of Object.entries(PRESETS)) {
      console.log(`${name}:\n  ${q}\n`);
    }
    return;
  }

  const creds = loadCredentials();
  if (!creds.hasUserContext && !creds.hasBearer) {
    throw new Error(
      "No X credentials found. Set X_API_KEY/X_API_SECRET/X_ACCESS_TOKEN/" +
        "X_ACCESS_TOKEN_SECRET (read+write) or X_BEARER_TOKEN (search only). " +
        "See docs/X_ENGAGEMENT.md.",
    );
  }
  const client = createXClient(creds);

  switch (command) {
    case "me": {
      const res = await client.me();
      const u = res.data ?? {};
      console.log(`Authenticated as @${u.username} (${u.name}) — id ${u.id}`);
      console.log("Auth mode: OAuth 1.0a user-context (read + write).");
      break;
    }
    case "search":
      await runSearch(client, args);
      break;
    case "post":
    case "reply":
    case "like":
      await runWrite(client, command, args);
      break;
    default:
      throw new Error(`Unknown command "${command}". Run with no args for help.`);
  }
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});
