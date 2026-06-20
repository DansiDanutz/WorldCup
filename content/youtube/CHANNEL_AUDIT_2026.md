# WorldCup26 Legends — YouTube Channel Monetization Audit

**Date:** 2026-06-20 · **Channel under review:** the link you shared, `@danslab-worldcup`
(the project's canonical handle on record is `@DansLab-Kimi`). **Goal of this audit:**
confirm whether YouTube Partner Program (YPP) monetization is open / will open, and list
the exact upgrades so that when you cross the threshold you qualify with **zero problems**.

> ⚠️ **Method & limits.** I cannot see your private YouTube Studio (monetization tab,
> analytics, 2-Step Verification, AdSense link) — those require your login. This audit
> combines: (a) your project's own Studio snapshot in `MONETIZATION_STATUS.md`, (b) the
> current YPP rules, and (c) the monetization-safety standard already built into the
> series. Every item you must confirm in Studio is marked **[confirm in Studio]**.

---

## 1. The YPP requirements (current rules, two tiers)

YPP opens in two stages. There is **no "switch"** — YouTube opens the application
automatically the moment you meet a tier.

| Requirement | Tier 1 — Fan funding (Super Thanks, memberships, Shopping) | Tier 2 — Ad revenue + Premium share |
|---|---|---|
| Subscribers | **500** | **1,000** |
| Public uploads in last 90 days | **3** | **3** |
| Valid public **watch hours** (last 365 days) | **3,000** *(OR Shorts below)* | **4,000** *(OR Shorts below)* |
| — OR valid public **Shorts views** (last 90 days) | **3,000,000** | **10,000,000** |
| 2-Step Verification on the Google account | **Required** | **Required** |
| No active Community Guidelines strikes | **Required** | **Required** |
| Follow all YouTube monetization / advertiser-friendly policies | **Required** | **Required** |
| Live in a country where YPP is available | **Required** | **Required** |
| Linked **AdSense / payments** account | needed to get paid | needed to get paid |

---

## 2. Current status vs requirements (from the project snapshot)

| Requirement | Status | Note |
|---|---|---|
| 500 subscribers | ✅ **1,327** | Tier-1 and Tier-2 sub gates BOTH met |
| 1,000 subscribers | ✅ **1,327** | |
| 3 public uploads / 90 days | ⚠️ **reads 3** | Low — because the catalog is split across two channels (see Finding A). With consolidation this jumps to 20+ |
| 3,000 watch hours / 365 days | ❌ **0** | **THE blocker.** 0 because the watched episodes are on the *other* channel |
| 3,000,000 Shorts views / 90 days | ❌ **0** | Secondary path; harder |
| 2-Step Verification | ❓ **[confirm in Studio]** | Must be ON or the application is blocked even after you hit the hours |
| No active strikes | ❓ **[confirm in Studio]** | One active strike blocks YPP |
| AdSense linked | ❓ **[confirm in Studio]** | Needed to receive payment |
| Advertiser-friendly content | ✅ **strong** | Series already follows a strict monetization-safety standard (§4) |

**Bottom line:** you are **subscriber-eligible today**. The only hard blockers are
**watch hours (0)** and the **unverified account-level gates** (2SV / strikes / AdSense).
Everything else is in good shape.

---

## 3. Findings — what is actually stopping monetization

### 🔴 Finding A — the catalog is split across two channels (the cause of "0")
This is the single most important finding. The project records the canonical channel as
**`@DansLab-Kimi`** with **1,327 subs but only ~3 public uploads and 0 watch hours** — yet
20+ episodes have been produced. That math only works if **most episodes (and all their
watch time) live on a *second* channel.** Two `UC…` IDs were seen historically
(`UC7kFHZYDL2Z5eB8i9CVNyWg` and `UC7j29XhArv5tlRqQj2qAb4Q`).

**The link you gave is `@danslab-worldcup`, which is *not* the recorded `@DansLab-Kimi`.**
So either (a) you renamed the main channel, or (b) this is the second channel. Either way,
**watch hours only accrue on the ONE channel where the audience + the videos both live.**
Splitting them = 0 forever.

➡️ **#1 action: pick ONE channel and put everything on it** (details in §5-A).

### 🔴 Finding B — watch hours are at 0 and only grow with public, consolidated content
Even with great videos, hours = (views × average view duration). With the catalog
fragmented and several episodes unlisted/on the wrong channel, almost nothing is counting.
The fix is consolidation + the watch-hour playbook (§5-F).

### 🟠 Finding C — "Made for kids" risk (Pixar-style animation)
Pixar-style 3D can be **auto-flagged or mis-set as "Made for kids,"** which **disables fan
funding, comments, and personalized ads** — it would void monetization even after you
qualify. Must be **"No, not made for kids"** on every video + the channel default.

### 🟠 Finding D — account-level gates unverified (2SV / strikes / AdSense)
These don't show publicly. If 2-Step Verification is off, or there's an active strike, or
AdSense isn't linked, you can hit 4,000 hours and **still** be unable to turn on money.
These take 10 minutes to fix now and remove all surprise.

### 🟡 Finding E — branding/handle mismatch hurts discovery (slows watch hours)
The name reads "DansLab," but 100% of the content is "WorldCup26 Legends." That mismatch
costs search, click-trust, and the algorithm's topic modelling — i.e. it slows the very
watch-hours you need. `@danslab-worldcup` is better than `@DansLab-Kimi` (it has the
keyword), but a fully football-searchable name is ideal.

---

## 4. What is already DONE right (keep it)

The series already ships to a strict standard — these protect monetization once it's on:
- ✅ 100% AI-generated visuals (no copyrighted match footage / club / FIFA logos).
- ✅ Original, non-repetitious (no-repeat clip rule) — avoids "reused content" demonetization.
- ✅ Cleared/original music (AI score / Kevin MacLeod CC-BY), credited.
- ✅ No gambling/betting/prize wording — "free to play, just for fun, no prizes."
- ✅ Real-results-only (scorelines labelled OUR PREDICTION) + non-affiliation (FIFA) line.
- ✅ No subtitles/sentences, soccer-only, no profanity/violence.
- ✅ AI/"altered or synthetic content" disclosure standard exists (must be ticked per upload).

This is genuinely advertiser-friendly content. The risk is **configuration**, not content.

---

## 5. The upgrades / changes to be 100% sure you qualify — in priority order

### A. Consolidate to ONE channel (the money move) — do first
1. In Studio → **Settings → Channel → Advanced**, confirm which `UC…` ID `@danslab-worldcup`
   resolves to, and identify the second channel.
2. Choose the channel that **holds the 1,327 subscribers** as the keeper (subs are hard to
   move; videos are easy).
3. **Re-upload every episode + bonus to the keeper channel**, set **Public**, **Not made
   for kids**, AI disclosure ticked. (YouTube can't "merge" channels, so re-upload.)
4. On the retired channel: change videos to **Private** (don't delete originals until the
   keeper is fully live), and put a "we've moved → [keeper link]" note on its banner.
5. Build the **"WorldCup26 Legends — All Episodes" playlist**, set as the featured section,
   with autoplay + end screens → next episode (session watch time = cheapest hours).

### B. Turn on the account-level gates now (don't wait for the threshold)
- [ ] **Enable 2-Step Verification** on the channel's Google account. *(YPP-blocking if off.)*
- [ ] **Check for strikes:** Studio → Content → check for any Community Guidelines strike
      or active Copyright claims; resolve/dispute before applying.
- [ ] **Prepare AdSense:** have a Google AdSense account ready to link (you link it during
      the YPP application; having it ready = instant payout setup).
- [ ] Studio → **Earn → "Get notified when eligible"** = ON.

### C. Lock the monetization-safety config on EVERY video (and as channel defaults)
- [ ] **Made for kids = "No"** — channel default AND each video. *(Finding C — critical.)*
- [ ] **"Altered or synthetic content" = Yes** (Checks step) — required for AI visuals; does
      not reduce reach.
- [ ] **Non-affiliation + "predictions, not results, not betting advice"** line in every
      description.
- [ ] Music credited; no prize/betting wording anywhere. *(Already standard — verify on the
      3 oldest live videos, which may predate the rule.)*

### D. Bank watch hours fast (the 3,000–4,000h path — realistic vs Shorts)
- 3,000h/yr ≈ ~165 full-equivalent views/day on 5-min episodes. Levers, in order:
  1. **Consolidation** (exposes the catalog to the 1,327 existing subs + notifications).
  2. **Playlist + autoplay + end screens** → binge sessions.
  3. **Premiere every new episode ≥48h before kickoff** (concentrated live watch time).
  4. **Shorts 2–4/day** → pinned-comment funnel into the 5-min episodes (Shorts are the
     discovery engine, not the monetization path).
  5. **Big-nation episodes** (Brazil/Germany/France/Spain/Portugal/Argentina) = more views ×
     longer sessions.
  6. **Organic distribution counts** (WhatsApp/Telegram/X/community). ⚠️ Keep **paid** ads
     pointed at worldcup26.world, NOT at the videos — paid-driven watch time can be ruled
     *non-valid* and excluded from the threshold.

### E. Branding/SEO (accelerates D)
- [ ] Channel name → **"WorldCup26 Legends"**; keep/own a football-searchable handle
      (`@danslab-worldcup` is acceptable; `@worldcup26legends` is ideal).
- [ ] Banner with upload schedule; channel trailer = the best episode or a series sizzle;
      keyword-rich channel description; link to worldcup26.world.
- [ ] Hook-first titles + 1-face/≤4-word thumbnails on every video (retitle the old ones).

---

## 6. Pre-application final checklist (run the day you cross the threshold)

When watch hours approach 4,000 (or you choose to apply at Tier-1 / 3,000h), confirm ALL:

- [ ] 1,000 subscribers ✅ (have 1,327)
- [ ] ≥ 3 public uploads in the last 90 days ✅ (easily met after consolidation)
- [ ] 4,000 valid public watch hours / 365 days **(or 3,000 for Tier-1 fan funding)**
- [ ] 2-Step Verification ON
- [ ] Zero active Community Guidelines strikes
- [ ] Every video: Not made for kids · AI disclosure · cleared music · no prize wording
- [ ] AdSense account ready to link
- [ ] Country supported · all videos advertiser-friendly
- [ ] "Get notified" ON so the application opens the instant you qualify

If every box is ticked, the YPP review (human + automated) should pass **with no problems**,
because the content standard is already advertiser-friendly — the only things that ever
fail reviews here are *config* (made-for-kids, missing AI disclosure, an unresolved claim),
all of which are covered above.

---

## 7. One-line answer to "is monetization open and will I qualify?"

- **Open now?** No — **watch hours read 0**, almost certainly because the catalog and the
  audience are on **two different channels**. That's the whole blocker.
- **Will you qualify with the current setup?** **Subscribers yes; watch-time no — until you
  consolidate.** Do §5-A (one channel), §5-B (2SV/strikes/AdSense), §5-C (made-for-kids +
  AI disclosure) and you remove every blocker except the hours — and the hours then start
  climbing immediately off your existing 1,327 subs + the live World Cup window.
