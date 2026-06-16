# WorldCup26 — Launch & Engagement Kit

Ready-to-use copy and a daily playbook for promoting **worldcup26.world**. Pairs
with the engagement CLI (`scripts/x-engage.mjs`, see `docs/X_ENGAGEMENT.md`):
search relevant conversations, then reply with value — don't only broadcast.

> Compliance note: this is a real-money prize product. Keep promos honest — no
> "guaranteed win" claims. Where the platform allows, include **18+**, link
> Terms/Privacy, and respect geo-eligibility. Engage; don't spam.

## Positioning

- **One-liner:** Pick 3 teams before the FIFA World Cup 2026. Earn points every
  match they play. Climb the leaderboard.
- **Why it's fun:** One decision, a whole tournament of stakes. Underdog teams
  carry higher coefficients — bold picks pay off.
- **Proof points:** 48 teams · 104 matches · transparent coefficients (1.00–3.00)
  · live leaderboard.

## X / Twitter

### Launch thread
1. The World Cup 2026 is coming. One question decides your whole tournament:
   **which 3 teams do you ride with?** 🌍⚽ Build your bracket → worldcup26.world
2. Every match your teams play earns points. Group stage to the final — your
   score climbs with them. No daily grind, just one sharp call.
3. Underdogs carry higher coefficients (up to 3.00). Pick safe and steady, or
   swing for the upset multiplier. Your call. 48 teams, 104 matches.
4. See the live leaderboard and full coefficient table before you lock in →
   worldcup26.world  (18+, where eligible)

### Single posts (rotate)
- 3 teams. 104 matches. 1 leaderboard. Who's your World Cup 2026 trio? ⚽
  worldcup26.world
- Favorites are safe. Underdogs pay the multiplier. What's your bracket telling
  you? → worldcup26.world
- Lock your 3 before kickoff. Watch the points roll in every match. 🏆
  worldcup26.world

### Reply templates (use after `x-engage search`)
Map to the CLI presets — keep replies specific to the thread, then invite:
- **worldcup / football:** "Love this. If you had to ride with just 3 teams for
  the whole tournament, who makes your cut? (that's basically the game over at
  worldcup26.world)"
- **predictions:** "Solid call. We score this exact thing match-by-match —
  higher coefficient for the underdogs. Curious how your bracket'd rank →
  worldcup26.world"
- **fantasy:** "If you like the pick-em angle, this is 3 teams + a live
  leaderboard, no daily lineup grind: worldcup26.world"

## WhatsApp / Telegram (referral-driven shares)
- Quick one: pick your 3 World Cup 2026 teams and we race on the leaderboard 👇
  worldcup26.world — send me your trio once you lock in.
- Building my World Cup bracket — 3 teams, points every match. Bet you can't
  beat my picks 😏 worldcup26.world

## Hashtags
Primary: #WorldCup2026 #WorldCup26 · Secondary: #FIFAWorldCup #football #soccer
#predictions · Use 2–3 max per post; over-tagging hurts reach.

## Daily engagement playbook (15 min)
1. `npm run x:engage -- me` — confirm auth once.
2. `npm run x:engage -- search --preset predictions --min-likes 3 --lang en` —
   surface high-traction prediction talk.
3. Reply to 3–5 with a specific, on-thread reply template (dry-run first; add
   `--confirm` to send). Quality over volume.
4. `npm run x:engage -- search --preset worldcup --max 30` — like a few genuinely
   good takes (`like <id> --confirm`).
5. Post one rotation post (above) once per day, not more.

Cadence: a handful of thoughtful replies/day compounds far better than a wall of
broadcasts. The product spreads on shared links — so the OG preview card
(`/opengraph-image`) does a lot of the selling; make sure every link is the bare
`worldcup26.world` so it unfurls.
