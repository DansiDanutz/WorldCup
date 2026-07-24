# 2026 Algorithm — Channel Configuration Plan (`@DansLab-Kimi`)

> Created 2026-06-15. Source: *"How To Beat The NEW YouTube Algorithm in 2026
> (For Faceless Channels)"* (https://www.youtube.com/watch?v=G9LfE3k-IEI).
> This doc maps that video's advice to **exact channel settings/actions** for our
> faceless series. It COMPLEMENTS `CHANNEL_GROWTH_ACTION_PLAN.md` (§2 config,
> §3 feed, §4 packaging) — read that for copy-paste values; read this for the
> 2026-specific changes. Where they overlap, the growth plan wins on values.

## What changed in 2026 (the 6 findings)

1. **May 22 2026 algo update: subscriber count, channel history, and channel age
   no longer decide who gets seen.** Distribution is now per-video on
   packaging + retention + satisfaction. → Our biggest historical handicaps
   (split channels, low authority, "DansLab" branding, 0 logged watch hours)
   no longer throttle *reach*. Every new upload competes on merit. This is good
   news — lean into packaging/retention, stop fearing the channel's small base.
2. **Retention QUALITY > raw minutes.** "Watch time + satisfaction = session
   contribution." A viewer finishing 100% of an 8-min video + liking it beats
   someone passively watching 40% of a 25-min video. → Favor **tighter, fully-
   retained** episodes over long ones with a sagging curve.
3. **Hook in the first ~7 seconds; build LOOPS into Shorts; make content
   bingeable.** → Cold-open hook ≤7s (we say 8 — tighten to 7), Shorts that
   seam end→start so they replay, and an autoplay binge path.
4. **Build off-platform authority to avoid the "content-farm" flag.** Matching
   social accounts under the **same name** as the channel, **Pinterest** to rank
   thumbnails in Google Images, **Medium** SEO articles built from video
   transcripts. → NEW workstream for us (see §C).
5. **AI transparency does NOT hurt you.** YouTube says disclosing
   altered/synthetic content won't limit audience or monetization; properly
   labeled AI gets normal distribution. → Set the disclosure correctly and stop
   treating our Pixar/AI pipeline as a risk to hide (see §B).
6. **Diversify revenue; ads complement, not dictate.** → Our worldcup26.world
   game + funnel already does this; keep ads as upside, not the plan.

---

## A. In-channel configuration (YouTube Studio) — do once

Most base config lives in `CHANNEL_GROWTH_ACTION_PLAN.md §2`. The 2026-specific
additions/changes:

- [ ] **Name ↔ identity match (finding 4).** The off-platform-authority play only
      works if the channel and every social use the **same searchable name**.
      This reinforces the existing rename rec: channel **WorldCup26 Legends**,
      handle **@worldcup26legends**. Pick the name now — §C accounts must match it.
- [ ] **Upload defaults → "Altered or synthetic content" = declare it (finding 5).**
      Settings → Upload defaults, and per-video in the Checks step: mark that
      the content is **altered/synthetic (AI-generated visuals)**. Keep
      **"No, not made for kids"** (unchanged, still mandatory for funding).
- [ ] **Keep category Sports, embedding on, Standard license** (unchanged).
- [ ] **Featured/trailer + "All Episodes" playlist autoplay (finding 3 binge).**
      Channel home → set the All-Episodes playlist as the featured section and
      ensure episodes chain via end screens so a session rolls into the next ep.

## B. AI disclosure — the correct, monetization-safe setting (finding 5)

- Tick **"Altered or synthetic content"** when it could mislead (realistic
  scenes/people) — our Pixar style is stylized but uses real player likenesses,
  so **declare it**. This adds an info-panel; per YouTube it does **not** reduce
  reach or monetization.
- Do NOT do this in titles/thumbnails (no "AI" in packaging — it hurts CTR);
  only in the disclosure field.
- This removes the fear that drove past hesitation; our pipeline is compliant.

## C. Off-platform authority (finding 4) — NEW, highest new-leverage workstream

Goal: prove to YouTube we're a real brand, not a content farm, and create
external watch-time/click signals (which also feed the YPP watch-hours North Star).

- [ ] **Same-name accounts** (handle `@worldcup26legends` everywhere): X,
      Instagram, TikTok, Pinterest, Medium, plus the existing Telegram/WhatsApp.
      Same avatar/banner as the channel.
- [ ] **Pinterest:** pin every episode **thumbnail** (links back to the video) →
      ranks our thumbnails in Google Images, a free top-of-funnel.
- [ ] **Medium (or the worldcup26.world blog):** publish an SEO article per
      episode **built from the VO transcript** (the script already exists), with
      the episode embedded. Titles = the fixture + "story/prediction." This both
      ranks in Google and drives **external watch time that counts toward YPP**.
- [ ] **Cross-link** all of the above to the canonical channel + worldcup26.world.

> This dovetails with the existing organic-distribution lever in
> `MONETIZATION_STATUS.md`: external embeds/clicks → valid public watch hours.

## D. Retention & hook upgrades (findings 2 & 3) — bake into production

Update the per-episode checklist in `SERIES_PLAYBOOK.md`:

- [ ] **Cold-open hook ≤7s** (was 8) — heartbeat/question/flash-cut, never a logo.
- [ ] **Tighten episode length to what holds the curve.** Prefer a fully-retained
      ~8–10 min cut over a padded longer one; cut any segment where retention sags.
- [ ] **Shorts must LOOP** — last frame seams into the first so they auto-replay;
      hook headline in first second; pinned comment → full episode.
- [ ] **Open loop early ("COMING UP — MINUTE 83"), pay off late** (already our
      strongest device — keep, and place the promise inside the first 30s).
- [ ] After 48h, log the **retention %** (not just views) in `SERIES_PLAYBOOK.md`
      and iterate hooks toward higher completion.

---

## Priority order (what to configure first)

1. **Pick the final name** (WorldCup26 Legends / @worldcup26legends) — unblocks §C.
2. **Set AI "altered content" upload default** (§B) — 5 min, removes risk.
3. **Stand up same-name social + Pinterest + Medium** (§C) — the new growth lever.
4. **Apply the ≤7s-hook + loop-Shorts + tighter-cut rules** to the next episode (§D).
5. Everything else (consolidation, rename, premieres, Shorts cadence, packaging)
   stays as already specified in `CHANNEL_GROWTH_ACTION_PLAN.md`.

> Owner-action items (I can't do these inside YouTube Studio): the Studio toggles
> in §A/§B and creating the social accounts in §C. I CAN: generate the Medium
> articles from transcripts, the Pinterest pin set, and the per-episode hook/Short
> changes. Say the word and I'll produce those next.
