# OWNER ACTIONS — what only you can do (Claude can't)

> Updated 2026-06-16. Everything in code/content is done & live. The items below
> need YOUR access (YouTube Studio, social accounts, a lawyer, secret rotation).
> Ordered by impact on the **North Star: bank valid watch hours → monetization.**
> Tick them off as you go.

---

## 🔴 NOW — the monetization unlock (nothing else matters until this is done)
- [ ] **Consolidate ALL episodes onto `@DansLab-Kimi`** (public, not made-for-kids).
      *Why:* watch time reads **0** only because content is split across two
      channels. This single move turns 0 → real watch hours. **Done when:** every
      finished episode is public on `@DansLab-Kimi` and the other channel is retired.
- [ ] **Run the 3 monetization-safe toggles on every video** (full list:
      `content/youtube/PREUPLOAD_CHECKLIST.md`):
  - [ ] **"No, not made for kids"** (video + channel default).
  - [ ] **"Altered or synthetic content"** ticked (AI/Pixar visuals).
  - [ ] **Music cleared & credited** on every episode — *the #1 demonetization risk*
        (only Ep2's credits are currently logged; verify the rest).

## 🟠 EXTERNAL WATCH TIME — publish the assets Claude already made
*(These count toward YPP and rank you in Google — the assets are ready in the repo.)*
- [ ] **Create same-name accounts:** Medium + Pinterest (handle `@worldcup26legends`).
- [ ] **Publish the 23 blog articles** (`content/youtube/blog/`) on Medium/your site,
      **embedding the episode video** at the `<!-- EMBED -->` marker. Big nations first.
- [ ] **Pin every thumbnail** to Pinterest (copy from `content/youtube/PINTEREST_PINS.md`).
- [ ] Update the **descriptions of already-published videos** to drop the old
      "prize pool" wording (their audio still says it — re-render only if you care).

## 🔐 SECURITY — do today
- [ ] **Rotate the football-data.org API key** — it was pasted in chat. Make a new one
      at football-data.org, then update the `FOOTBALL_DATA_API_KEY` env var in Vercel
      (or ask Claude to update it with a valid token). Results keep working meanwhile.
- [ ] **Revoke the Vercel token** you shared (vercel.com/account/tokens) — Claude is
      done with it.

## ⚖️ DECISIONS & LEGAL (free-play is safe; these are about going further)
- [ ] **Agent deal:** currently **paused & hidden**. Decide: keep paused, or re-enable.
      If agents handle **real money**, a lawyer must review that specific path.
- [ ] **Real-money relaunch:** only after legal sign-off. The whole money system is
      intact behind one flag — set `NEXT_PUBLIC_WORLDCUP_FUN_MODE=false` (or remove it)
      in Vercel + redeploy to switch it back on. Don't, until a lawyer clears it.
- [ ] **See a lawyer** on `docs/LEGAL_READINESS.md` (game classification/licensing,
      KYC/AML, full Terms/Privacy, FIFA trademark & player-likeness).

## 🔁 DAILY OPERATING LOOP (the growth habit — `CHANNEL_GROWTH_ACTION_PLAN.md`)
- [ ] Post **2–4 Shorts/day** (looped; pinned comment → full episode).
- [ ] **Premiere the next episode ≥48h before its real kickoff** (order: `SCHEDULE.md`).
- [ ] **First-hour push** on each premiere (WhatsApp/Telegram/X/community).
- [ ] **Reply to every comment** same day (strongest signal you can request).
- [ ] Log **watch hours + retention % + subs** daily in `MONETIZATION_STATUS.md`.

---

## What Claude already did this session (for reference)
- ✅ **Auto-scoring:** live results from football-data.org applied every 10 min +
      admin "Run results now" button. (Verified caught up.)
- ✅ **Free-play pivot:** wallet, paid pool, and agent deal all OFF & hidden;
      money endpoints return 403; free leaderboard works. Reversible via one flag.
- ✅ **All prize/gambling wording removed** from every video/blog/scene/description.
- ✅ **Legal:** FIFA non-affiliation + responsible-play on Terms; `LEGAL_READINESS.md`.
- ✅ **Growth assets:** 23 SEO blog articles, Pinterest pins, 2026-algorithm plan,
      Romayroh knowledge file, reusable script prompt, 2-week roadmap.
- ✅ **Pre-upload compliance checklist** (`content/youtube/PREUPLOAD_CHECKLIST.md`).

## Where to look
- Pre-upload gate → `content/youtube/PREUPLOAD_CHECKLIST.md`
- Growth plan → `content/youtube/CHANNEL_GROWTH_ACTION_PLAN.md` + `GROWTH_ROADMAP_2WK.md`
- Legal → `docs/LEGAL_READINESS.md`
- Production order → `content/youtube/SCHEDULE.md`
- Monetization tracking → `content/youtube/MONETIZATION_STATUS.md`
