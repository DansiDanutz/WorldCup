# MISSION: 1,000 Signups Today

Status: ACTIVE — this mission overrides all other lanes until it is completed or the day ends.

Date: 2026-06-10 (EEST day, 00:00–23:59)
Goal: **1,000 new signups on `https://worldcup26.world` today.**
Owner of record: operator (David). Coordinator agent: **Hermes** (Mac Studio).
Executing agents: **Hermes, Dexter, Sienna, Memo, Nano** — all droplets, all OpenClaw/opencode workers. Every agent works ONLY on this mission today.

## Lead Assets

1. **YouTube channel:** `https://www.youtube.com/channel/UC7j29XhArv5tlRqQj2qAb4Q`
2. **Main video (public URL):** `VIDEO_URL_TBD`
   - No public video URL exists in this repo yet. As soon as the final ad is live on the channel, replace `VIDEO_URL_TBD` here and in the prompts below, then re-sync to all droplets.
   - If the video is not yet uploaded: render per `video-handoff.md` (`marketing/worldcup26-ad`, output `WorldCup26_Ad.mp4`), upload to the channel as a public video + a Short, then paste both URLs here.
3. Promo media already on every droplet: `media/worldcup26-main-video.mp4`, `media/worldcup26-referral-16x9.jpg`, `media/worldcup26-qr-story.jpg`, `media/worldcup26-qr-square.jpg`.
4. Copy bank: `copy-bank.md`. Reply bank: `campaign-response-kit.mjs`. Outreach target map: `campaign-public-outreach-targets.mjs`.

## Tracked Links

Base: `https://worldcup26.world/login?ref=26BC4B90CB`

Campaign tag for today: `utm_campaign=worldcup26_1000_today`

Per-agent links (use these so Memo can attribute signups per agent):

- Hermes: `https://worldcup26.world/login?ref=26BC4B90CB&utm_source=hermes&utm_medium=comment&utm_campaign=worldcup26_1000_today&utm_content=SLOT`
- Dexter: `https://worldcup26.world/login?ref=26BC4B90CB&utm_source=dexter&utm_medium=post&utm_campaign=worldcup26_1000_today&utm_content=SLOT`
- Sienna: `https://worldcup26.world/login?ref=26BC4B90CB&utm_source=sienna&utm_medium=video&utm_campaign=worldcup26_1000_today&utm_content=SLOT`
- Memo: `https://worldcup26.world/login?ref=26BC4B90CB&utm_source=memo&utm_medium=ops&utm_campaign=worldcup26_1000_today&utm_content=SLOT`
- Nano: `https://worldcup26.world/login?ref=26BC4B90CB&utm_source=nano&utm_medium=reply&utm_campaign=worldcup26_1000_today&utm_content=SLOT`

Replace `SLOT` with a short unique tag per post (`h09_yt1`, `h14_reddit2`, ...) so every placement is individually measurable.

## Target Split (sums to 1,000)

| Agent | Lane | Signup target | Output cadence |
| --- | --- | ---: | --- |
| Hermes | YouTube comments + community coordination, video pushes | 250 | 10 placements/hour drafted, coordinate reallocation every hour |
| Dexter | X posts/replies, football forums, debate hooks | 250 | 8 hooks/hour, every one pointing to the video or app |
| Sienna | Shorts/Reels/TikTok captions, stories, status, video reposts | 250 | 6 caption+placement packs/hour |
| Nano | Replies, DMs, WhatsApp/Telegram/Discord groups (where allowed) | 200 | 15 micro-replies/hour |
| Memo | Attribution, hourly scoreboard, reallocation calls | 50 (overflow) | Hourly report, see checkpoint protocol |

## Where To Comment (best + permitted)

Priority order — highest conversion first. Comment ONLY from logged-in owned accounts and only where promotion/links are permitted; where links are not allowed, lead with the video title/channel name and the code `26BC4B90CB` instead of a URL.

1. **Our own YouTube channel**: pinned comment on the main video, community-tab post, replies to every viewer comment within 15 minutes.
2. **YouTube prediction/preview videos** (search: "World Cup 2026 predictions", "World Cup 2026 favorites", newest-first filter — see `campaign-public-outreach-targets.mjs` for live search URLs): add a real opinion on the video's topic first, then the 3-picks question + link/code.
3. **X**: replies under big football accounts' World Cup posts, own-feed hooks, quote posts of the video.
4. **Reddit**: only subreddits whose rules allow self-promo/links (check each sub's rules first); otherwise contribute to prediction threads with the question angle, no link, channel name only.
5. **Facebook groups / Discord / Telegram / WhatsApp groups**: only where admins allow promo or after asking; warm personal invites are always allowed.
6. **Football forums and comment sections of news articles** about World Cup 2026 squads/fixtures, where links are permitted.

Every comment must:
- React to the actual content it is posted under (one specific sentence minimum).
- Use a DIFFERENT wording every time — rotate `copy-bank.md` hooks, never paste the same text twice in the same venue.
- Point to either the video (`VIDEO_URL_TBD`), the channel, or the tracked signup link — pick whichever fits the venue.
- Include the free-first flow: pick 3 teams free, private points preview, ticket only for paid leaderboard.
- Never claim a fixed prize amount — say `live prize pool`.

## Hard Rules (unchanged from shared rules — they protect the goal)

- No identical repeated messages, no posting where promo is forbidden, no fake accounts, no engagement-bait that violates a platform's rules. A banned account posts zero links for the rest of the day; staying alive is part of the 1,000 target.
- Owned/approved accounts only.
- Every placement gets a log row (see proof protocol below).

## Agent Prompts (paste into each worker)

### Hermes (Mac Studio — coordinator + YouTube lane)

```text
You are Hermes, today's campaign coordinator for WorldCup26.

Single goal: 1000 signups today on worldcup26.world. Your lane: YouTube.
Lead assets: channel https://www.youtube.com/channel/UC7j29XhArv5tlRqQj2qAb4Q and the main video (VIDEO_URL_TBD).
Draft 10 YouTube comment placements per hour: pick real, recent, relevant videos (World Cup 2026 predictions/previews), write a one-line genuine reaction to that video, then the 3-free-picks question and the tracked link https://worldcup26.world/login?ref=26BC4B90CB&utm_source=hermes&utm_medium=comment&utm_campaign=worldcup26_1000_today&utm_content=SLOT (unique SLOT per placement).
Also: keep our own video's comment section answered, draft one community-tab post per 3 hours.
Every hour, read Memo's scoreboard and reallocate: move drafting power to whichever lane is converting best.
Vary every comment. Never repeat copy. Never post where promo is forbidden. Never claim a fixed prize; say live prize pool. Free flow: 3 picks free, private preview, ticket only for paid leaderboard.
```

### Dexter (droplet — X + forums)

```text
You are Dexter. Single goal today: 1000 signups on worldcup26.world; your share is 250 via X and football forums.
Produce 8 placements per hour: punchy hooks, debate prompts, and replies under large football accounts' World Cup posts. Each placement points to the video (VIDEO_URL_TBD), the channel, or your tracked link https://worldcup26.world/login?ref=26BC4B90CB&utm_source=dexter&utm_medium=post&utm_campaign=worldcup26_1000_today&utm_content=SLOT with a unique SLOT.
Vary the angle every time: favorites, underdogs, friends-group, free-picks-first. No fixed prize claims. No identical reposts. Return: venue, exact copy, CTA, SLOT tag.
```

### Sienna (droplet — short-form video + stories)

```text
You are Sienna. Single goal today: 1000 signups on worldcup26.world; your share is 250 via short-form video surfaces.
Produce 6 packs per hour: caption + overlay text + story/status version for Shorts, Reels, TikTok, WhatsApp Status, Facebook story. The video is the lead asset (VIDEO_URL_TBD / media/worldcup26-main-video.mp4). Always include code 26BC4B90CB and your tracked link https://worldcup26.world/login?ref=26BC4B90CB&utm_source=sienna&utm_medium=video&utm_campaign=worldcup26_1000_today&utm_content=SLOT with a unique SLOT.
Warm, human, shareable. No hype claims, no fixed prize amount. Return: platform, caption, overlay, story version, SLOT tag.
```

### Nano (droplet — replies, DMs, groups)

```text
You are Nano. Single goal today: 1000 signups on worldcup26.world; your share is 200 via replies, DMs, and permitted groups.
Produce 15 micro-replies per hour, grouped by question type (how it works, is it free, prize, how to join). Each ends with: pick 3 teams free with code 26BC4B90CB, link https://worldcup26.world/login?ref=26BC4B90CB&utm_source=nano&utm_medium=reply&utm_campaign=worldcup26_1000_today&utm_content=SLOT (unique SLOT). Where links are banned, use the channel name + code only.
Helpful first, CTA second. No pressure, no spam, no repeats. Return replies grouped by question type.
```

### Memo (droplet — scoreboard + reallocation)

```text
You are Memo, today's scoreboard. Single goal: 1000 signups today on worldcup26.world.
Every hour produce: signups so far vs hourly pace needed (cumulative target = hour_index * 42), per-agent attribution from utm_source, top 3 converting placements, bottom 3, and a reallocation call (which lane gains/loses drafting volume next hour). Track every placement row in runtime/posting-log-live.csv via campaign-proof-log.mjs. Flag any venue where we got flagged/removed — that venue is dead for the rest of the day.
```

## Hourly Checkpoint Protocol

- Cumulative pace line: **42 signups/hour** (1,000 / 24). At each checkpoint Memo reports actual vs pace.
- Behind pace 2 checkpoints in a row → Hermes shifts all agents' next-hour volume to the single best-converting venue.
- Signup attribution source: site analytics by `utm_source` within `utm_campaign=worldcup26_1000_today`, plus referral count on code `26BC4B90CB`.

## Proof Protocol

Unchanged: every real placement is logged with `campaign-proof-log.mjs` (public URL, or private-channel note for DMs/status). Drafted-but-not-posted does not count toward anything.

## Activation (run on each droplet)

```bash
cd ~/DavidAi/worldcup26-promo-kit/campaign
node campaign-runner.mjs --window-hours 24
./campaign-loop.sh start   # watchdog cron keeps it alive
```

Then open `runtime/worker-inbox-<agent>.md` and work the mission prompts above as the priority layer on top of the queue.

## Known Blockers (must be cleared by operator)

1. **Hermes / Mac Studio is OFFLINE on Tailscale** (last seen earlier today). Wake the Mac Studio, confirm Tailscale shows Connected, restart the Hermes gateway, then give Hermes the coordinator prompt. Until then, Memo holds the coordinator role.
2. **`VIDEO_URL_TBD`** — paste the public YouTube video URL (and Short URL) here and in the prompts, then re-sync the kit to all droplets.
3. Browser sessions on the posting machine: X is logged in (`@NervixAi`); Facebook sharer, WhatsApp Web, Telegram Web were logged out at last audit — log them in or those lanes stay manual-on-phone.
