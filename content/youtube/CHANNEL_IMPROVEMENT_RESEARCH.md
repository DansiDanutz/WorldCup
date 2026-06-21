# WorldCup26 Legends — Channel Quality Research & Improvement Plan

> **Living research file.** Real 2026 web research on what's currently working to
> raise quality and (the North Star) VALID PUBLIC WATCH HOURS. Every item below is
> tied to OUR stack: React/CSS/Babel 300s timeline → Playwright frame render →
> Higgsfield (Kling/Veo) clips → ElevenLabs "Brian" VO → two-stage ffmpeg mux.
> Pair this with `SERIES_PLAYBOOK.md` (DO/DON'T) and `MONETIZATION_STATUS.md`.

---

## Entry — 2026-06-21

Context for weighing every change: the ONE missing YPP requirement is watch
hours (`MONETIZATION_STATUS.md`). So we rank by **watch-HOURS impact**
(views × avg-minutes-watched × session continuation), not by polish for its own
sake. Sources are linked inline.

---

### 1. Retention / watch-time for 3–8 min cinematic episodes

**1a. Front-load the curiosity gap + promise in the first 15s; verify ≥50% retention at 0:15.**
- WHY: ~20% of viewers drop in the first 15s, and a clear value-promise in those
  15s lifts 1-minute retention ~18%; if you're below 50% at 0:10–0:15 the hook
  failed. (https://buildmyplays.com/youtube-video-hook-strategies-viewer-retention/,
  https://socialrails.com/blog/youtube-audience-retention-complete-guide)
- HOW: We already cold-open on the spoken secret (DON'T #0, playbook §"Retention").
  Add a Studio QA step: after the first 48h, read the retention graph at 0:15 and
  if <50%, swap the opening clip on the NEXT episode. Keep the 3-beat hook:
  0:00–0:05 dramatic clip, 0:05–0:15 the verified "did-you-know" claim as the
  promise, 0:15–0:30 stakes + open loop.

**1b. Push episode length toward 8–12 min at held retention — this multiplies watch-hours per view and unlocks mid-rolls.**
- WHY: total watch-hours = views × avg-minutes-watched, so a longer episode at the
  same retention % banks more hours per view; 8+ min unlocks mid-roll ads and most
  high-performers sit 7–15 min; 50%+ avg view duration makes a video ~3× more
  likely to be recommended. (https://medium.com/write-your-world/how-long-should-a-youtube-video-be-for-maximum-engagement-ec05568c8522,
  https://www.dataslayer.ai/blog/youtube-algorithm-2025-how-to-get-your-videos-recommended)
- HOW: Our timeline is hard-coded to 300s. Test an **8-minute (480s) variant** on a
  star-power matchup (Argentina/Brazil/England) by extending the timeline constant
  and adding ONE more high-retention act (a second verified history beat or a
  rival-legend duel) — NOT filler. Length-adjusted target for 5–10 min: good 45%+,
  excellent 60%+ (https://socialrails.com/blog/youtube-audience-retention-complete-guide).
  Log the watch-hours delta before standardizing; if retention craters, stay at 5 min.

**1c. Build a real "All Episodes" autoplay playlist + use a 2-element end screen (1 video + subscribe).**
- WHY: autoplay removes the decision window and is the single strongest session-time
  multiplier; end-screen playlist links add ~3.2 extra min of watch time per session
  and clickers watch ~3:32 vs ~1:40 site-average; the 2-element layout beats the
  4-grid. (https://miraflow.ai/blog/youtube-playlists-strategy-2026-binge-sessions,
  https://www.tubeanalytics.net/blog/youtube-cards-end-screens-checklist-for-retention)
- HOW: Order the playlist chronologically as a curated "journey," set it to autoplay,
  and point every episode's end-screen video element at the NEXT chronological
  episode (matches our existing "real next-fixture end card", playbook EP33+ #3).
  This is also the cheapest watch-hours lever we have — no new render needed for the
  back catalog, just Studio config.

**1d. Plant an open loop (Zeigarnik) early and pay it off at the very end; consider DROPPING chapters on episodic content.**
- WHY: hinting at a later payoff keeps viewers to the resolution; but chapters make
  videos skippable and can LOWER average view duration as viewers jump and leave.
  (https://socialrails.com/blog/youtube-audience-retention-complete-guide,
  https://www.timpeakman.com/blog/youtube-chapters-are-they-killing-your-watch-time)
- HOW: Keep the Mystery Supporter / "LEGEND 0NN · STAY TO THE END" chip (playbook
  EP33+ #2) as the loop. For the binge-watch goal, **remove chapter timestamps** from
  episode descriptions and A/B a chaptered vs non-chaptered episode in Studio — we
  currently add chapters (checklist line), and for a 5-min binge series they likely
  cost average-view-duration more than the SEO is worth.

**1e. Move the strongest CTA to mid-video; prioritize comments over likes.**
- WHY: 2026 algorithm weights "session contribution" and satisfaction signals over
  raw duration, weights comments above likes, and rewards mid-video CTAs over
  end-only. (https://vidiq.com/blog/post/understanding-youtube-algorithm/)
- HOW: We already comment-bait ("Comment 1 or 2", playbook DO #14). Add one
  mid-video "predict the score" engagement chip at the prediction beat (we have the
  chip — make sure it fires ~mid-timeline, not only at the outro).

---

### 2. Thumbnail + title packaging (CTR)

**2a. Cut thumbnail text to 0–3 words; never 7+.**
- WHY: <4 words gets ~30% higher CTR than text-heavy designs.
  (https://ampifire.com/blog/best-youtube-thumbnail-guide-examples-best-practices-2026-for-high-ctr/)
- HOW: Matches our ≤4-word rule — tighten to ≤3. Enforce in the thumbnail QA line.

**2b. One face, exaggerated surprise/shock emotion, face ≥25–30% of frame.**
- WHY: faces get ~35% higher CTR; strong-emotion thumbnails boost CTR 20–30%.
  (https://ampifire.com/blog/best-youtube-thumbnail-guide-examples-best-practices-2026-for-high-ctr/)
- HOW: Already in playbook (mystery legend, max-emotion face). Keep the SOCCER-ONLY
  review — verify kit is a round-neck football shirt, never NFL, before publishing.

**2c. Front-load the title's hook + keyword in the first ~48 characters (mobile-first).**
- WHY: mobile truncates titles at ~48–55 chars (iOS 48–52, Android 50–55), desktop
  search ~60; chars 80–100 are mostly algorithmic signal, not viewer-facing.
  (https://fluxnote.io/guides/youtube-title-character-limit-2026)
- HOW: Our hook-first format ("The Night Football Betrayed Algeria | …") already does
  this — verify the EMOTIONAL HOOK lands inside 48 chars (count it), with the fixture
  name + "(Ep.N)" after. The curiosity title MUST pay off or retention drops the CTR
  over time.

**2d. Run every thumbnail through Studio "Test & Compare" — but know it now judges WATCH-TIME SHARE, not raw CTR.**
- WHY: in 2026 YouTube picks the Test & Compare winner by watch-time share over up
  to 14 days, so a high-click/low-retention thumbnail loses to a lower-click/
  higher-retention one. (https://ampifire.com/blog/best-youtube-thumbnail-guide-examples-best-practices-2026-for-high-ctr/)
- HOW: We already generate a phone-vs-no-phone A/B (EP33+ #7). Submit BOTH as
  Test & Compare variants on every episode and let YouTube pick by watch-time. Aim
  for a 4%+ CTR floor (https://vidiq.com/blog/post/understanding-youtube-algorithm/).

---

### 3. AI video generation quality (cinematic, character-consistent)

**3a. Stay image-to-video; register each legend as a reusable Kling 3.0 "Element" / character reference (1–4 angles).**
- WHY: the biggest consistency gain is animating a locked still rather than
  re-describing the character in text per scene; Kling 3.0 Elements takes 1–4
  reference images and Motion Control improves facial identity through complex
  motion. (https://motion.verticalstudio.ai/blog/ai-character-consistency-guide,
  https://blog.mage.space/article/best-ai-video-generators-consistent-characters-2026/9459a229-806d-4a73-8abf-a19db645a248)
- HOW: We already produce team character images in `content/images/`. Feed those as
  the I2V start frame in Higgsfield; register each Mystery Supporter / recurring
  player once via Higgsfield's `show_characters` / `show_reference_elements`, and
  let the PROMPT describe only action + camera (keep the soccer-only guard clauses).

**3b. Chain shots last-frame → first-frame and keep clips 3–5s to stop identity drift.**
- WHY: starting clip N+1 from clip N's last frame "forces visual continuity"; short
  3–5s generations prevent drift accumulation of face/object identity.
  (https://motion.verticalstudio.ai/blog/ai-character-consistency-guide,
  https://genra.ai/blog/why-ai-videos-look-fake-how-to-fix)
- HOW: In `clips.json`, when two consecutive cards show the same legend, export the
  last frame of the first Higgsfield clip and use it as the start frame of the next
  (Higgsfield supports start-frame I2V). Keep our per-card clips short — we already
  cut fast.

**3c. One clean camera move per clip via Kling presets + depth layers; never a static "talking-poster".**
- WHY: one clean move per generation reads as cinematic, and avoiding common camera
  mistakes succeeds 79% vs 34% of the time; a dolly without fore/mid/background
  becomes a flat zoom — depth sells the move.
  (https://videoai.me/blog/kling-ai-camera-movement-prompts,
  https://www.glbgpt.com/resources/kling-ai-camera-movements-explained/)
- HOW: Use Higgsfield `motion_control` / `presets_show` to pick a preset per shot
  (slow push-in, orbit ~30°/5s) instead of free-text camera language; this directly
  fixes the playbook's "every montage card must be ANIMATED" rule with INTENTIONAL
  motion, not random drift.

**3d. Route hero clips through Kling 3.0, wide establishers through Veo 3.1; do NOT build on Sora 2 (sunsetting).**
- WHY: Veo 3.1 leads prompt-adherence + native 4K for establishers; Kling 3.0 is
  best-in-class for character consistency + cinematic motion; OpenAI is discontinuing
  Sora web/app (Apr 2026) and API (Sep 2026) — unsafe for a long-running series.
  (https://lushbinary.com/blog/ai-video-generation-sora-veo-kling-seedance-comparison/,
  https://www.flowhunt.io/blog/best-ai-video-generators-2026/)
- HOW: When picking a Higgsfield model per shot, call `models_explore(action:'recommend')`
  with the shot goal; default character shots → Kling, stadium/crowd establishers →
  Veo. Record the model per clip in `jobs-manifest.json`.

**3e. Kill the "AI look": upscale spatially then interpolate, and unify EVERY clip under one ffmpeg LUT + grain.**
- WHY: upscale-then-interpolate is the correct order; the worst mistake is exporting
  4K at 10–15 Mbps H.264 (throws away invented detail); a shared LUT gives consistent
  grading so clips read as one shot library, and grain/motion-blur hide AI tells.
  (https://morphed.app/blog/ai-video-upscaler, https://genra.ai/blog/why-ai-videos-look-fake-how-to-fix,
  https://digitalsynopsis.com/tools/ai-videos-look-fake-how-to-fix/)
- HOW: Optionally round-trip hero clips through Topaz Video AI (spatial upscale →
  Chronos/Aion interpolation to 60fps) before mux; at minimum, in the ffmpeg video
  stage apply ONE shared LUT + light film grain (`noise`) + subtle vignette across
  all clips, and encode the intermediate at high bitrate / ProRes — not 10–15 Mbps.
  (Higgsfield `upscale_video` is a fast fallback to 2K/4K.)

---

### 4. Premium sports-broadcast motion graphics (React/CSS)

**4a. Replace boxed score elements with a single gradient-glass bar; logos not 3-letter codes; tabular numerals.**
- WHY: 2026 broadcast direction (Fox NFL 2025, Super Bowl LIX) is typography-centric,
  gradient-backed, de-boxed; tabular nums stop scores jittering.
  (https://www.newscaststudio.com/2025/09/25/fox-sports-nfl-score-bug-2025-season/,
  https://www.sportsvideo.org/2026/06/09/designing-the-modern-scorebug-how-broadcast-graphics-teams-are-rethinking-the-most-important-element-on-screen/)
- HOW (CSS): one rounded bar, `linear-gradient(180deg, rgba(0,0,0,.85), rgba(0,0,0,.65))`
  over a team-color tint; 4–6px team-color accent stripe each side; logos 36–44px;
  score in heaviest weight; `font-variant-numeric: tabular-nums`.

**4b. Animate lower-thirds as a directional slide+clip-path wipe with staggered text, held 3–6s.**
- WHY: slide/fade reveals "feel natural" and don't distract; broadcast readability
  wants the plate parseable in ≤2s and held long enough to read twice.
  (https://wasp3d.com/blogs/https-wasp3d-com-blogs-sports-lower-thirds-for-broadcasts-design-animation-and-best-practices,
  https://www.schoolofmotion.com/blog/sports-lower-thirds)
- HOW (CSS): bar `transform: translateX(-24px→0)` + `clip-path` wipe ~450ms ease-out;
  text rises `translateY(8px→0)` + opacity over 300ms staggered +80ms after the bar;
  on-screen 3000–6000ms. Renders fine in Playwright/Chromium.

**4c. Standardize typography: geometric/condensed bold sans, ALL-CAPS scores/codes with tight tracking, italic only for action callouts.**
- WHY: broadcast houses (ESPN/SportsCenter Gotham, CFP Nordt) use clean geometric
  sans for strength + legibility at small sizes.
  (https://www.newscaststudio.com/2024/12/20/espn-college-football-playoff-broadcast-design-score-bug/)
- HOW (CSS): titles `font-weight:700–800`, `letter-spacing:.02–.06em`,
  `text-transform:uppercase`; info text one weight lighter for hierarchy.

**4d. Tune custom cubic-bezier easings (mild overshoot ≤1.3) instead of CSS `ease`/linear; exits faster than entrances.**
- WHY: tuned easing is one of the most impactful premium-feel details; overshoot
  above ~1.5 "feels cartoonish."
  (https://motion.dev/docs/easing-functions, https://joshcollinsworth.com/blog/easing-curves)
- HOW (CSS): entrance `cubic-bezier(.22,1,.36,1)` (~450ms), gentle pop
  `cubic-bezier(.34,1.30,.64,1)`, exits `~200–250ms`; kinetic word reveals stagger
  60–90ms/word. Add a faint grain panel (`opacity:.04–.06`, `mix-blend-mode:overlay`)
  and `backdrop-filter: blur(12px) saturate(1.2)` glass on graphic panels.

---

### 5. Audio (music, loudness, ducking, SFX, narration)

**5a. Two-pass master to −14 LUFS integrated, true peak ≤ −1 dBTP.**
- WHY: YouTube normalizes to −14 LUFS (only turns loud down), recommends TP < −1
  dBTP to avoid AAC clipping. (https://www.criticallisteninglab.com/en/learn/loudness/youtube,
  https://audio.rswaver.com/blog/youtube-loudness-standards)
- HOW (ffmpeg): `loudnorm=I=-14:TP=-1.0:LRA=11`, two-pass for accuracy, in the audio
  master stage. (−16 LUFS is a safer alt for dialogue-heavy mixes.)

**5b. Sidechain-duck the music to Brian's VO: 2–4 dB reduction, ratio ~2:1, attack <2ms.**
- WHY: ducking keeps speech on top and "considerably improves clarity."
  (https://strongmocha.com/creator-sound-design/sidechain-ducking/,
  https://www.sweetwater.com/insync/what-is-sidechain-compression/)
- HOW (ffmpeg): `sidechaincompress=threshold=0.05:ratio=2:attack=5:release=250`
  (music = main, VO = sidechain), or keyed `volume` duck of −5 to −8 dB during VO;
  keep ambience/SFX bed ~12–18 dB under peak VO.

**5c. Stack riser → ~150–300ms silence → braam/impact → tail on each goal/reveal; split SFX across frequency bands.**
- WHY: trailer cinematics layer sources; risers "followed by a hit or brief silence"
  and braams signal "something epic"; banding sharp/sweep/rumble avoids mud.
  (https://blog.native-instruments.com/sound-in-film/,
  https://www.asoundeffect.com/sound-library/cinematic-riser-build-up-sfx/,
  https://www.ableton.com/en/blog/learn-how-to-make-high-impact-sounds-for-movies-and-trailers/)
- HOW (`clips.json` sfx): riser ramps 1.5–3s into the GoalFlash, drop a short
  silence/breath before the braam, crossfade a crowd swell under the goal. Pairs with
  our speed-ramp climax (EP33+ #1).

**5d. Brian: ElevenLabs Multilingual v2, speed 1.0, pace via punctuation/breaks — never time-stretch.**
- WHY: v2 is the stable narration model; speed range 0.7–1.2 with extreme values
  hurting quality, so write tighter copy instead of speeding the render.
  (https://elevenlabs.io/docs/overview/capabilities/text-to-speech/best-practices,
  https://neuraplus-ai.github.io/blog/best-settings-for-elevenlabs-ai-voice-quality-improvement-2026.html)
- HOW: v2, Stability ~35–50, Similarity ~75; pauses via `<break time="0.4s"/>`–
  `<break time="1.5s"/>` (≤3s); emphasis via CAPS + ellipses. Enforces the existing
  DO #9b (length-check every line against its slot, NEVER tempo-stretch — Ep2 was
  flagged). Source music from a stems-bearing library (Epidemic/Artlist) so risers
  and percussion can be soloed as stingers.

---

### 6. New / evolving in 2026 worth tracking

- **Series/session signal is now explicitly rewarded** — repeat viewing within a
  topic is a strong ranking signal, directly favoring our episodic format; small
  channels with strong early CTR + retention get broad testing in days, not weeks.
  (https://vidiq.com/blog/post/understanding-youtube-algorithm/)
- **Test & Compare judges watch-time share, not CTR** (see 2d) — re-tooled in 2026.
- **Sora 2 sunset** (see 3d) — don't adopt; Kling 3.0 / Veo 3.1 are the safe bets.
- **Topaz Starlight 2.5 / Aion** preserve grain + motion blur while upscaling 4K
  heavy-motion (https://www.mindstudio.ai/blog/ai-video-generation-2026-kling-topaz).
- **Shorts: viewed-vs-swiped in first 1–3s** is the #1 distribution signal; loop the
  ending to frame 1 to drive replays (already in playbook).
  (https://vidiq.com/blog/post/understanding-youtube-algorithm/)

---

## DO NEXT — prioritized checklist (rank = impact ÷ effort)

Action these per-episode (and once for the back catalog where noted). Highest
watch-hours leverage first.

1. **[Back catalog, once — highest ROI] Build a chronological "All Episodes"
   autoplay playlist + set every end-screen video element to the next episode**
   (2-element layout). Banks session/binge watch-hours with NO new render. (§1c)
2. **Submit BOTH thumbnail variants to Studio "Test & Compare" every episode** and
   let YouTube pick by watch-time share; target 4%+ CTR. (§2d)
3. **QA retention at 0:15 after 48h; if <50%, swap the cold-open clip next episode.**
   Keep the 3-beat 15s hook + promise. (§1a)
4. **Two-pass ffmpeg `loudnorm=I=-14:TP=-1.0:LRA=11` + sidechain duck −3 dB/2:1/
   <2ms under Brian** in the audio master stage. (§5a, §5b)
5. **Apply ONE shared LUT + light grain + vignette across ALL clips in the ffmpeg
   video stage; encode the intermediate at high bitrate/ProRes** (not 10–15 Mbps).
   Kills the spliced-from-different-models AI look. (§3e)
6. **Verify the title's emotional hook lands inside the first 48 chars; thumbnail
   text ≤3 words.** (§2c, §2a)
7. **Register each recurring legend as a Higgsfield/Kling Element (1–4 angles) and
   chain shots last-frame→first-frame**; keep clips 3–5s. (§3a, §3b)
8. **One Kling/Higgsfield preset camera move per clip (push-in/orbit) with depth
   layers** — no static cards, no random drift. (§3c)
9. **Upgrade the score bug + lower-thirds to gradient-glass, tabular-nums, ALL-CAPS
   geometric sans, custom cubic-bezier(.22,1,.36,1) ~450ms entrances** in the React
   timeline. (§4a–§4d)
10. **A/B one 8-minute (480s) variant on a star-power matchup** (extra high-retention
    act, not filler) and log the watch-hours delta before standardizing; also A/B
    drop chapters on a 5-min episode. (§1b, §1d)
