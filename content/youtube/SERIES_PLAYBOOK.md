# WorldCup26 Legends — Series Playbook (Knowledge File)

> **Living document.** After EVERY episode: add a row to the Results Log and move
> anything learned into DO / DON'T. Claude reads this file before producing any
> new episode (see /CLAUDE.md).

## Why view counts differed (channel audit, 2026-06-12)

| Video | Views | Why |
|---|---|---|
| Launch Film FINAL (Jun 7) | 1,672 | It was the **promoted asset of the 72h paid+organic campaign** (Meta ads, WhatsApp/Telegram pushes, referral links, premiere). Distribution, not just content. |
| Ep1 Mexico vs South Africa (Jun 10) | 370 | **Premiere** + first-wave campaign posts + **published the day BEFORE the real opening match** (caught the search/interest wave). Topical "JUNE 11" thumbnail. |
| Ep2 South Korea vs Czech Republic (Jun 12) | 0 (at audit) | Published as a plain upload (no Premiere), **after** the real June 11 match window, with **zero promotion** so far. The view gap is a distribution gap, not content quality. |

**Core law of this channel: Views = Packaging × Timing × Distribution × Retention.**
A 10/10 video with 0/10 distribution gets ~0 views. Every episode needs all four.

## DO (what worked — keep doing)

1. **Publish 24–48h BEFORE the real match**, never after. Our format is a
   "storytellers' prophecy" — it only sells before kickoff.
2. **Schedule as a Premiere** (not plain upload): creates a countdown page,
   subscriber notifications, and live chat at minute one.
3. **Push every episode through the campaign machine in the first hour:**
   WhatsApp/Telegram groups, X first-wave posts, referral links from
   `marketing/worldcup26-campaign/copy-bank.md`. The Launch Film proved this
   is worth ~1,000+ views per asset.
4. **Topical thumbnails**: big date or 3-word emotional headline ("JUNE 11",
   "HIS LAST DANCE"), one face, tear/emotion, thick black-outlined gold text.
5. **Cold-open hook in the first 8 seconds** — heartbeat / question / flash-cuts.
   Never open with a logo.
6. **Real history beats invented drama**: the "Mr. Five-Zero" 2001 story is
   shareable because it's TRUE and little-known. Every episode needs one
   verified "wait, what?" fact (researched, with sources).
7. **Brian (ElevenLabs) as the one constant voice** — series identity.
8. **Mystery Supporter segment** in every episode (collectible tie-in to the
   app, recurring Easter egg, cross-episode hook).
9. **Professional audio chain**: real music cues (not AI-extracted), SFX hits
   on story beats, side-chain duck under VO, master to −14 LUFS.
9b. **Narration at natural speed, always**: length-check every Brian line
   against its timeline slot (script in the project README); rewrite and
   regenerate any line that spills. NEVER tempo-stretch the voice — Ep2's
   sped-up lines were audible and flagged by the channel owner.
9c. **Use the paid asset library in every episode**: previous episodes' player
   animations and crowd clips (recap beats, app-promo video cards). Nothing
   we generated goes unused.
10. **Motivated predictions only**: when the storytellers show a score, say
    explicitly that it is OUR PREDICTION and give the reasoning first
    (the history chapter, form, pace vs experience, the numbers on screen).
    Never present a score as a mystic vision with no basis — viewers trust
    (and argue with) a reasoned call, and arguments are comments.
11. **Every montage card must be ANIMATED** — never Ken Burns stills when a
    player clip exists; animate missing players before the render (Ep3 fix,
    flagged by the channel owner).
12. **End on next-episode tease + Subscribe/Like/Share + worldcup26.world.**
13. **Targeted share trigger**: don't say "share this" — name WHO to send it to
    ("send this to the friend who still doubts American soccer"). Specific
    recipients convert far better than generic share asks (Ep4+).
14. **Comment-bait cliffhanger**: when canon allows, freeze the drama at its
    peak and ask viewers to comment their ending (Ep4: "Comment 1 or 2").
    Comments are the strongest algorithm signal we can ask for.
15. **Every episode must be UNIQUE**: new true-history hook, new structural
    twist, new sound/visual idea. Same skeleton, never the same episode.
16. **On-screen open loops (Ep6+)**: a ChapterBar showing named chapters ahead
    and a ~3s "COMING UP — MINUTE 83" climax flash near the 40s mark. Promise
    the payoff early, deliver it late — the strongest retention device we use.
17. **Speed-ramp the climax (Ep6+)**: long slow-motion build (rate ~0.35) into a
    hard snap to real time on the decisive beat, with stacked heartbeat SFX
    under the slow section and a braam on the snap.
18. **Two mystery legends can share one episode** when both nations have a
    natural ghost — sell them as a collectible DUO (Ep6: Legends 006 & 007).
19. **Hook-first titles**: the emotional hook goes BEFORE the pipe, search
    terms after ("The Night Football Betrayed Algeria | Argentina vs Algeria —
    World Cup 2026"). Search-style titles get truncated to the generic part
    and earn ~zero CTR on a low-authority channel (proved by Ep2/Ep3, Jun 13).
20. **Every video on the channel must be on-brand**: hide/unlist test uploads
    (the WhatsApp video) — off-brand content confuses the algorithm's channel
    identity. Site → channel funnel: the worldcup26.world dashboard banner
    links to the series (added Jun 13).

## DON'T (what cost us — never repeat)

1. ❌ Don't upload after the match the episode is about (Ep2 mistake — lost the
   pre-match search wave).
2. ❌ Don't publish without a same-day promotion plan (Ep2 had none at launch).
3. ❌ Don't use plain "Publish" when a Premiere is possible.
4. ❌ Don't ship a generic description ("South Korea take on the Czech
   Republic…"). Lead with the story hook + a question, include keywords from
   `content/youtube/SEO_KEYWORDS.md`, chapters, app link, music attribution.
5. ❌ Don't leave the first comment empty — pin a comment with the app link and
   a question that begs replies ("Did you pick Korea? 🇰🇷 or are you on Schick?").
6. ❌ Don't skip the Shorts cut. Every episode must spawn 2–3 vertical Shorts
   (the 16s cold open, the goal moment, the Mystery Supporter) that point to
   the full video — Shorts are the channel's free discovery engine.
7. ❌ Don't claim fixed prize amounts in video copy; say "live prize pool"
   (compliance rule from the campaign pack).
8. ❌ Don't drift from canon: scores/dates must match the Stories files and
   earlier episodes (Ep1 = 0-0 draw; Ep2 = KOR 1-0 CZE, Son 41').
8b. ❌ **Never present our own predictions as real results.** Recaps of earlier
   episodes must say "OUR PREDICTION: ..." — not "last night this happened".
   Only matches that have REALLY been played may be stated as fact (flagged
   by the channel owner after Ep4's recap treated the Ep3 prediction as a
   result). On-screen recap plates carry the label "OUR PREDICTION".

## Soccer-only prompt template (mandatory for player/fan/stadium generations)

Always include in generation prompts: "SOCCER player / SOCCER jersey (round
neck football shirt), NO helmet, NO shoulder pads, NOT american football" and
for venues: "football/soccer stadium with a grass pitch and goals". Review
every generated image for the correct sport before use — nano-banana drew an
NFL quarterback for the Ep4 'USA' thumbnail until the prompt was hardened.

## Per-episode production checklist

- [ ] Story researched: real H2H history with one "wait, what?" fact (web-verified)
- [ ] Script: cold-open hook → title → stadium → HISTORY chapter → squads (montage
      + animated players + lower thirds) → duel → match drama (goal/SFX/fans) →
      verdict → Mystery Supporter → app promo → CTA + next tease (300s)
- [ ] Brian VO generated; music cues + SFX placed; mix ducked, −14 LUFS
- [ ] Thumbnail: 1 face + ≤4 words + flags + episode badge (guide: THUMBNAIL_GUIDE.md)
- [ ] Title: `WorldCup26 [Team A] vs [Team B] | [Story Hook] — FIFA World Cup 2026 Match N`
- [ ] Description: hook line + question + chapters + worldcup26.world + tags + music credit
- [ ] **Premiere scheduled ≥24h before the real match kickoff**
- [ ] 2–3 Shorts cut and scheduled (hook / goal / mystery legend)
- [ ] First-hour push: WhatsApp, Telegram, X first-wave, community post, pinned comment
- [ ] End screen + cards linking previous episode and the playlist
- [ ] After 48h: log results below + add new learnings above

## Results log

| Ep | Match | Published | Format | Views @48h | Likes | Learnings |
|---|---|---|---|---|---|---|
| 0 | Launch Film | Jun 7 | Premiere + paid campaign | 2,000 (Jun 13) | 2 | Distribution works; campaign machine = ~2k views |
| 1 | MEX vs RSA | Jun 10 | Premiere, day before match | 627 (Jun 13) | 4 | Pre-match timing + premiere works organically; still growing |
| 2 | KOR vs CZE | Jun 12 | Plain upload, after match, no promo | 83 (Jun 13) | _…_ | Late + unpromoted = cold start. Rescue: Shorts + retitle + pin (VIEWS_RESCUE_PLAN.md) |
| 2b | CAN vs BIH (live) | Jun 12 | Plain upload, no promo | 11 (Jun 13, 9h) | _…_ | Confirms the pattern: zero fuel = zero impressions, regardless of quality |
| 3 | CAN vs BIH | _delivered Jun 12_ | master + thumbnail handed off | _log at 48h_ | _…_ | Mystery cold open, all-animated cards, range-server fix, motion QA born |
| 4 | USA vs PAR | _delivered Jun 12_ | master + thumbnail handed off | _log at 48h_ | _…_ | 1930 hook, cliffhanger comment-bait (1 or 2), auto-subtitles, soccer-only prompts |
| 5 | BRA vs MAR | _delivered Jun 12_ | master + thumbnail handed off | _log at 48h_ | _…_ | Prophet framing, StarCounter, new music identity (samba/bazaar), Tangier 2023 hook |
| 6 | ARG vs ALG | Jun 13 | hook title + mystery thumb | **979** (h1) | 2 | 🔥 BREAKOUT. Messi/Argentina star-power + "The Night Football Betrayed Algeria" hook + mystery thumbnail. Near Launch-Film numbers with ZERO ad spend |
| 5 | BRA vs MAR | Jun 13 | hook title + mystery thumb | 207 (h1) | 2 | Brazil draws well; "Kings Have a Secret" |
| 7 | BRA vs HAI | Jun 13 | hook title + mystery thumb | 300 (h1) | 2 | Brazil again; supermarket-worker hook |
| 4 | USA vs PAR | Jun 13 | hook title | 4 (fresh) | 2 | just uploaded |
| 9 | QAT vs SUI | Jun 13 | hook title + mystery thumb | 0 (fresh) | — | just uploaded |
| 10 | HAI vs SCO | Jun 13 | hook title + mystery thumb | 0 (fresh) | — | just uploaded |

**KEY LEARNING (Jun 13, real data): star-power teams massively outperform.**
Argentina/Messi = 979, Brazil = 200-300, vs neutral matchups = 28-108. PRIORITISE
big-audience nations (Argentina, Brazil, England, Germany, France, Spain, Portugal,
Netherlands) and put their superstar on the mystery thumbnail. The hook-first title +
mystery thumbnail formula is validated (Ep5-6-7 with it: 200-979; old generic-titled
Ep2-3 without it: 28-108). RETITLE Ep2 (Korea) and Ep3 (Canada) to the hook format —
they still carry the old "Highlights & All Goals" titles and are leaving views on the table.

## Ep2 recovery actions (do now)

1. Pin a comment: "He scored in the 41st minute… exactly like our storytellers
   said. 👁️ Pick your 3 teams free → worldcup26.world"
2. Cut 3 Shorts from the master: 0:00–0:16 (heartbeat hook), 3:15–3:30 (GOAL +
   crying fans), 4:16–4:30 (Taekwondo Master) — each ending "full story on the
   channel".
3. Community post with the thumbnail + "Did the prophecy come true?"
4. Push through the campaign channels with the copy-bank links.
5. Ep3 (Canada) must be PREMIERED before Canada's real kickoff.
