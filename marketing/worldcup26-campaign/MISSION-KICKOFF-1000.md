# MISSION: KICKOFF-1000

**Issued:** 2026-06-10
**Window:** now → first whistle, 2026-06-11 19:00 UTC (Mexico vs South Africa, Estadio Azteca)
**Goal:** 1,000 signups before kickoff. Every worker, every lane, every hour.
**Campaign tag:** `worldcup26_kickoff_1000` (new UTM campaign — do NOT reuse `worldcup26_referral_72h` so today's results are measurable on their own)

Tracked link template (replace `SOURCE` and `CONTENT` per post):

```text
https://worldcup26.world/login?ref=26BC4B90CB&utm_source=SOURCE&utm_medium=manual-post&utm_campaign=worldcup26_kickoff_1000&utm_content=CONTENT
```

## The one message of the day

> The World Cup starts in HOURS. Every team locks at its first kickoff.
> Pick your 3 teams FREE before the first whistle — after that, the best teams are gone.
> 2 minutes, no card, no payment. Code: 26BC4B90CB

The site now shows a live countdown and "Entry Free" — screenshots of the countdown
strip are today's freshest visual asset. Take a new one each hour; the ticking clock
IS the urgency.

## Honest math (Memo enforces this)

1,000 signups needs roughly:

| Path | Conversion | Needed volume |
| --- | --- | --- |
| Cold public posts/replies | ~2–5% click→signup | ~25,000+ qualified views — NOT reachable from our 4 accounts alone |
| Warm 1:1 invites | ~20–40% | ~3,000 warm conversations — not reachable alone |
| **Referral chain** | each signup invites 3+, ~30% land | **the ONLY exponential lever we own** |
| Paid boost | bought reach | the only way to buy views we don't have |

Conclusion the whole fleet operates by: every single signup must be onboarded into
inviting their friends within minutes, and the operator should put any available ad
budget behind the best Short/post today. Public posting feeds the top of the funnel;
the chain and the boost are what can reach four digits.

**Milestone ladder (Memo reports at every mark):** 25 by +4h · 100 by +12h ·
300 by +24h · 1,000 by kickoff. If a milestone is missed, do not slow down —
reallocate to whichever lane the UTM data says is converting.

## Standing rules (unchanged, non-negotiable)

These exist because breaking them gets the domain link-banned on WhatsApp/X within
hours, which ends the campaign on the spot:

- Owned accounts, allowed groups, and welcome contexts only. No promo where promo is forbidden.
- Never the same message twice to the same place. Vary copy every post (use `copy-bank.md` + the hooks below).
- Respect per-account caps (X replies: 2/hour, 6/day per account unless the operator raises them).
- No fixed prize claims — "live prize pool" only. 18+/geo rules apply.
- Every post: tracked link or code. Every action: proof row (`campaign-proof-log.mjs` / `campaign-public-channel-attempts.mjs`). Unproven work doesn't exist.

## Worker orders — OpenClaw fleet (Dexter, Sienna, Memo, Nano)

### Dexter — public pressure (X + football communities)

- Each hour: 1 public countdown post on the owned X account, rotating hooks (below), `utm_source=x`.
- Each hour: up to cap, reply into live searches (`world cup 2026 predictions`, `world cup 2026 -giveaway -crypto`, team-specific searches as group draws trend). Lead with football opinion, end with link. Use the `x-openclaw-dexter.md` reply patterns but swap in kickoff-countdown copy.
- Post the "Group A locks first" angle: Mexico, South Africa, Korea Republic, Czechia lock TOMORROW at their kickoffs — name teams, create the deadline per fan base.

Hour-rotation hooks (vary, never repeat consecutively):
1. "World Cup starts tomorrow. You get 3 teams. Who are yours?" + link
2. "Every team locks at its first kickoff. All 48 are still open right now." + countdown screenshot
3. "Free entry, 2 minutes, no card. The leaderboard runs all tournament." + link
4. "Underdog math: Norway pays ×1.6 on every point. Favorites are safe, underdogs multiply." + link
5. "[TEAM] fans: your team locks [DAY]. Pick before the whistle." + link

### Sienna — visual blitz (Stories, Status, Reels/Shorts)

- WhatsApp Status + Instagram/Facebook Story every 2 hours: countdown screenshot or QR story card, fresh caption each time, `utm_source=story`/`whatsapp-status`.
- 4 short-form videos today across TikTok/Reels/Shorts/Facebook Reels: cut from `media/worldcup26-main-video.mp4`, first frame = the ticking countdown, caption = the one message of the day. `utm_source=tiktok|reels|shorts|fb-reels`.
- Refresh the QR cards' caption: "Scan before the first whistle."

### Memo — measurement and command (the goal lives here)

- Every hour: run `campaign-referral-activity.mjs` and `campaign-signup-conversion-audit.mjs`; write the running signup total + per-UTM-source breakdown to the war room and `runtime/posting-log-live.csv`.
- Every 4 hours: milestone report — total vs ladder, best lane, worst lane, explicit reallocation order ("Dexter shift to team-lock angles", "Sienna double Status cadence", etc.).
- Audit proof rows continuously; flag any lane posting without proof.
- Maintain a "winning copy" note: the single best-performing hook so far, so all workers converge on what converts.

### Nano — warm conversion and the chain (highest conversion per message)

- Warm 1:1 invites all day (WhatsApp/Telegram/Messenger personal): 30–50 genuine conversations, personal framing ("game starts tomorrow, I want you on my board"), `utm_source=whatsapp-personal`.
- **Chain duty — the mission-critical lane:** within 15 minutes of every known signup, message them: congratulate, confirm their 3 picks are saved, then: "You have your own invite link in the app — send it to 3 friends before kickoff; you earn a cut of anything they win." Walk them to the Invite section.
- Answer every public question/reply within 15 minutes (use `campaign-response-kit.mjs` templates), always ending at the CTA.

## Hermes fleet — portable brief (paste into the Hermes system as-is)

> **Mission KICKOFF-1000 — WorldCup26.world**
> Goal: drive signups to https://worldcup26.world before the World Cup kicks off
> 2026-06-11 19:00 UTC. Use link:
> `https://worldcup26.world/login?ref=26BC4B90CB&utm_source=hermes&utm_medium=agent&utm_campaign=worldcup26_kickoff_1000&utm_content=<agent-name>`
> Message: "World Cup starts in hours. Pick 3 teams free before they lock at kickoff.
> 2 minutes, no card. Code 26BC4B90CB." Vary wording every post.
> Allowed: accounts and channels you own or where promotion is explicitly welcome;
> honest claims only ("free entry", "live prize pool" — never a fixed amount); 18+
> framing. Forbidden: repeated identical messages, unsolicited mass-DMs, posting where
> promo is banned, fake engagement. Log every action with its URL and UTM content tag
> so results are attributable. Report signups-by-source hourly if you can read the
> site analytics; otherwise report actions taken.

## Operator actions (the two levers the agents cannot pull)

1. **Paid boost** — any budget available today goes on the best short-form video,
   football interests, eligible countries, straight to the tracked `/login` link
   (`utm_source=paid-meta` / `paid-x`). Use the kit's `campaign-paid-*` tooling and
   ad manager links. This is the only purchasable reach.
2. **YouTube fix** — retitle the launch film, first-line link + pinned comment with
   `utm_source=youtube&utm_campaign=worldcup26_kickoff_1000` (full steps in
   `marketing/LAST_48_HOURS_PLAYBOOK.md`).

## Deploy this mission to the droplets (run from the operator Mac)

```bash
cd /Users/davidai/Documents/WorldCup
git pull origin claude/hopeful-shannon-mffwzg   # or main after merge

for host in dexter sienna memo nano; do
  scp marketing/worldcup26-campaign/MISSION-KICKOFF-1000.md \
    "$host":~/DavidAi/worldcup26-promo-kit/campaign/MISSION-KICKOFF-1000.md
  ssh "$host" 'cd ~/DavidAi/worldcup26-promo-kit/campaign && ./campaign-watchdog.sh && ./campaign-loop.sh status | head -20'
done
```

Then verify each droplet's dispatch board references today's mission and the loops are
alive (`campaign-loop.pid` present, watchdog cron firing every 5 minutes).

## End-of-mission report (Memo compiles at kickoff)

- Total signups (admin metrics) vs 1,000.
- Signups by `utm_source` — keep what worked, cut what didn't.
- Proof-row count per worker.
- The chain coefficient: signups with a referrer ÷ total signups — if this is under
  30%, Nano's chain lane is tomorrow's first fix, because group-stage days (June
  11–17) are still live signup days: every team that hasn't played is still pickable.
