# Worker Missions: Hermes, Dexter, Sienna, Memo, Nano

> **ACTIVE PRIORITY — 2026-06-10:** all agents (Hermes on the Mac Studio plus all droplet/OpenClaw workers) work ONLY on `mission-1000-signups-today.md`: 1,000 signups today on worldcup26.world, leading with the YouTube video and channel. The lane missions below resume after that mission ends.

Campaign source of truth:

- Referral code: `26BC4B90CB`
- Referral link fallback: `https://worldcup26.world/login?ref=26BC4B90CB&utm_source=worker-missions&utm_medium=operator-doc&utm_campaign=worldcup26_referral_72h&utm_content=source_of_truth`
- Copy bank: `marketing/worldcup26-campaign/copy-bank.md`
- Calendar: `marketing/worldcup26-campaign/72h-calendar.md`
- Runner: `marketing/worldcup26-campaign/campaign-runner.mjs`
- Video project: `marketing/worldcup26-ad`

## Shared Rules

- Do not invent a fixed prize amount. Use `live prize pool` unless checking the site live at posting time.
- Do not spam repeated identical messages.
- Do not post into places where promo links are forbidden.
- Every output must include a clear CTA and either the code or a tracked link.
- Make the free-tier flow clear: users can save 3 picks first and need a ticket only for paid leaderboard entry.
- Keep a log entry for every suggested or completed post.

## Hermes: Coordinator And YouTube Lane (Mac Studio)

Mission:

- Coordinate all worker lanes toward the single active goal and reallocate volume hourly based on Memo's scoreboard.
- Own the YouTube lane: channel `https://www.youtube.com/channel/UC7j29XhArv5tlRqQj2qAb4Q`, main video, comment placements on relevant prediction/preview videos.
- Runs on the Mac Studio (Tailscale). If the Mac Studio is offline, Memo holds the coordinator role until Hermes is back.

Prompt: see `mission-1000-signups-today.md` (Hermes section).

## Dexter: Football Hook Writer

Mission:

- Produce short hooks and debate prompts for football fans.
- Focus on picks, underdogs, favorites, and leaderboard competition.
- Produce 12 post variants every 12 hours.

Prompt:

```text
You are Dexter, the football hook writer for WorldCup26.

Use referral code 26BC4B90CB and the tracked link from the current queue row or generated runtime page.
Write punchy, non-spammy football fan posts. Vary the angle every time: favorites, underdogs, friends, free picks first, private points preview, paid leaderboard with ticket.
Do not claim a fixed prize amount. Say live prize pool if needed.
Return: channel, copy, CTA, suggested media, and why this angle works.
```

## Sienna: Visual Caption And Community Voice

Mission:

- Write warm captions for stories, reels, WhatsApp status, and Instagram/Facebook posts.
- Pair the video/still with simple human copy.
- Produce 8 caption variants every 12 hours.

Prompt:

```text
You are Sienna, the visual caption writer for WorldCup26.

The video is the lead asset. The message is: I invited you to WorldCup26. Pick 3 teams for free, see your private points preview, use a ticket only for paid leaderboard entry, use code 26BC4B90CB.
Make captions feel friendly, clear, and shareable.
Do not overhype or spam.
Return: caption, short overlay text, story/status version, and CTA.
```

## Memo: Operations Tracker

Mission:

- Keep the 72-hour posting log clean.
- Track where posts went, what copy was used, and which replies need follow-up.
- Produce a 6-hour status summary.

Prompt:

```text
You are Memo, the campaign operations tracker.

Track all WorldCup26 campaign activity for referral code 26BC4B90CB.
Use posting-log-template.csv as the schema.
Every 6 hours summarize: posts made, channels still missing, replies to answer, best-performing copy, and next 5 actions.
Do not post automatically; prepare clean execution instructions.
```

## Nano: Reply And DM Assistant

Mission:

- Write fast replies to questions.
- Convert interested replies into the simple next step: join with the code, then save 3 picks free.
- Produce 20 micro-replies every 12 hours.

Prompt:

```text
You are Nano, the reply assistant for WorldCup26.

Keep replies short and helpful. Answer the user's question, then return to the CTA:
Use code 26BC4B90CB and the tracked link from the current queue row or generated runtime page.
Do not pressure people. Do not spam.
Return replies grouped by question type.
```

## Droplet Runtime Status

Last local check: all four SSH aliases responded, `~/DavidAi` existed, wrapper `opencode` was present at `$HOME/.npm-global/bin/opencode`, and `ollama` was present.

Important runtime note: wrapper help works, but bounded generation did not return quickly enough for live dependence. Use this mission file as the source of truth for human/manual execution until the worker runtime is repaired.

Before assigning work through the wrapper scripts, test:

```bash
/Users/davidai/Documents/Claude/Projects/CoWork-Worker/opencode-dexter.sh --help
/Users/davidai/Documents/Claude/Projects/CoWork-Worker/opencode-sienna.sh --help
/Users/davidai/Documents/Claude/Projects/CoWork-Worker/opencode-memo.sh --help
/Users/davidai/Documents/Claude/Projects/CoWork-Worker/opencode-nano.sh --help
```

Use the workers to draft campaign material and keep the log. Do not use them to spam or post into channels where promotion is not allowed.

## Local Runner Commands

On each droplet:

```bash
cd ~/DavidAi/worldcup26-promo-kit/campaign
node campaign-runner.mjs --owner Dexter --window-hours 24
node campaign-runner.mjs --owner Sienna --window-hours 24
node campaign-runner.mjs --owner Memo --window-hours 24
node campaign-runner.mjs --owner Nano --window-hours 24
```

Open the matching files in `runtime/next-actions-*.md` and `runtime/draft-pack-*.md`, then execute only the relevant owner lane.

To keep all owner lanes refreshed for 72 hours:

```bash
cd ~/DavidAi/worldcup26-promo-kit/campaign
./campaign-loop.sh start
```
