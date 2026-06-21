# Last 48 Hours Before Kickoff — Signup Playbook

Kickoff: June 11, 2026, 13:00 Mexico City (19:00 UTC). Every team locks at its own
first kickoff, so the real "full choice" window ends June 11 and the join window
effectively closes around June 17 when the last group-stage first matches play.

## Why the launch film produced ~5 signups

Walk the viewer's journey:

1. **They never saw it.** The film sits on a small personal channel. YouTube gives a
   new channel almost no impressions, and a 90-second brand film gives the algorithm
   nothing to rank (no search intent, no retention hook). 5 signups from a few hundred
   views is a *normal* conversion rate — the input volume was the problem.
2. **The title sells nothing.** "WorldCup26 Launch Film FINAL" is an internal file
   name, not a reason to click. Nobody searches it, nobody clicks it.
3. **The click path was cold.** Viewers who did click landed on the app dashboard
   with "Players 1", an empty leaderboard, "Prize pool TBA" and "Due Checks 0" —
   it read as an unfinished internal tool, not a live game. (Fixed in the app: live
   kickoff countdown, "Entry Free" framing, corrected facts, single dominant CTA.)

## Hour 0–2: fix the existing video (no new content needed)

- **Retitle:** `Pick 3 Teams Before June 11 — Free World Cup 2026 Game (48 Nations, 104 Matches)`
- **Description, first line (links above the fold):**
  `⚽ Free entry, 2 minutes: https://worldcup26.world/login?ref=26BC4B90CB&utm_source=youtube&utm_medium=video&utm_campaign=launch48`
- **Pin a comment** with the same link + "Kickoff is June 11 — all 48 teams are
  open until the first whistle."
- **End screen + card** pointing to the link (YouTube Studio, 2 minutes of work).
- Always use the `?ref=...&utm_...` form — the app records UTM attribution, so you
  will finally *see* which channel produces signups.

## Hour 2–24: distribution that actually works in 48 hours

SEO and subscriber growth are out of reach in 2 days. These are not:

1. **Cut 3–5 Shorts from the film** (15–30s each) with countdown urgency hooks:
   "Every team locks at kickoff. 48 open right now." Shorts get cold-start
   distribution that long-form never will. Post the same cuts to TikTok, Reels,
   and X. Use the link-in-bio + pinned comment pattern.
2. **WhatsApp/Telegram direct invites** are the highest-converting channel you
   have. Personal message + your referral link. Target: 30–50 conversations/day
   per person (templates in `worldcup26-campaign/`). The product's own WhatsApp
   share flow does the rest after each signup.
3. **X conversation engagement** — `npm run x:engage -- search --preset predictions`,
   reply to 5–10 live World Cup prediction threads/day (templates in
   `LAUNCH_KIT.md`). Replies in active threads outperform broadcast posts from a
   zero-follower account.
4. **Small paid boost, only if budget exists:** $50–100/day boost on the best
   Short (not the 90s film), targeted at football interests in eligible
   countries, link straight to `/login?ref=...`. With a 2-day window, paid is the
   only way to buy reach you don't have organically.

## Hour 24–48: ride the kickoff moment

- The countdown strip on the site is live and flips to "World Cup is live — teams
  lock one by one" after the first whistle. Mirror that message everywhere:
  *joining late with unplayed teams is still possible* — keep posting through
  June 12–17, each matchday is a fresh "last chance for [team]" hook.
- Post a "Group A locks in X hours" Short/tweet before each first-match day.
- After every signup, the referral loop (5%/3% of winnings) is the engine —
  remind every new player to send their invite link to their group chat.

## Measure

Check signups by source in the admin metrics (UTM is stored at signup). Whatever
channel produced signups by hour 24, double down on it for hour 24–48 and drop
the rest.
