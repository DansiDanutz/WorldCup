# WorldCup26 Legends — Match 2: South Korea vs Czech Republic

A 5-minute (300s, 1920×1080, 30fps) cinematic match video for the
[DansLab YouTube channel](https://www.youtube.com/watch?v=myNgytIwZ0U), the follow-up
to the Match 1 (Mexico vs South Africa) inaugural video — upgraded with:

- **Background music** — an epic orchestral/taiko anthem generated with Higgsfield
  (`music/anthem-source.mp4`), looped for the full runtime and side-chain **ducked
  under the narration** so Brian always cuts through.
- **Animated players** — the Pixar character images of Son Heung-min, Kim Min-jae,
  Lee Kang-in, Patrik Schick, Tomáš Souček and Adam Hložek brought to life as
  cinematic 5s clips (Higgsfield kling 2.6 image-to-video).
- **Supporter emotions** — four animated crowd-emotion clips: the euphoric Korean
  ultra crying tears of joy, the anxious Korean fans, the hopeful Czech ultra and
  the heartbroken Czech fan in tears.
- **Brian (ElevenLabs) narration** — same voice and pipeline as the channel ad
  (`narration.json` is the single source of truth; `eleven_multilingual_v2`).
- **A cold-open hook** — 16 seconds of heartbeat, subliminal flash-cuts and the
  "ONE LAST DANCE" reveal before the title card. No slow intro, no logo first.
- **Outro CTA** — worldcup26.world app promo (pick 3 teams, goals score for you,
  free to play) + animated SUBSCRIBE / LIKE / SHARE buttons + next-episode tease.

Story source: `content/Stories/South-Korea-vs-Czech-Republic.md`
("The Last Waltz of Sonaldo") — Group A, Estadio Akron, Guadalajara, June 12 2026.

## Timeline (300s)

| t (s) | Scene | VO / visuals |
|-------|-------|--------------|
| 0–16 | Cold open | Heartbeat in the dark, flash glimpses, "ONE LAST DANCE" |
| 16–28 | Title card | Match 2 of 104 · flags · venue |
| 28–46 | Stadium | Akron flyover clip + stat strip |
| 46–106 | South Korea | Son / Kim / Lee animated, lower thirds |
| 106–158 | Czech Republic | Schick / Souček / Hložek + hopeful ultra |
| 158–186 | The Duel | Kim vs Schick split screen, "VS" badge |
| 186–242 | The Drama | 41' Son goal (flash + confetti), joy, Schick chance, Hwang tackle, FT 1–0 card |
| 242–262 | Verdict | Group A table after Matchday 1 |
| 262–286 | App promo | worldcup26.world — pick 3, free to play |
| 286–300 | CTA outro | Subscribe / Like / Share + Canada tease |

## Files

| File | Purpose |
| --- | --- |
| `match.html` + `*.jsx` | The animated video. React + Babel timeline (300s), `window.__seek(t)` clock. |
| `narration.json` | Brian's VO script — one line per beat with `at` start times. |
| `clips.json` | Generated-clip placements (visual **and** audio) — single source of truth for `match.html` and `mux.mjs`. |
| `render.mjs` | Playwright frame renderer; waits for `<video>` clips to settle so generated footage is frame-exact. |
| `gen_audio.mjs` | ElevenLabs per-line MP3 generation (voice **Brian**). |
| `mux.mjs` | Builds VO + ducked anthem + clip FX audio and muxes with the frames into the final MP4. |
| `fetch_assets.mjs` | Re-downloads all Higgsfield assets from `assets-urls.json`. |
| `jobs-manifest.json` | Higgsfield job IDs for every generated asset. |

## Render the video

```bash
cd marketing/match-videos/match02-south-korea-vs-czech-republic
npm install
npx playwright install chromium   # one-time

# 0) (only if assets/ is empty) re-fetch the generated clips/images
npm run fetch-assets

# 1) Serve over HTTP (Babel can't fetch .jsx over file://)
npm run serve &                   # http://127.0.0.1:8098/match.html

# 2) Render all frames (30fps × 300s = 9000 JPEGs -> ./frames)
npm run render

# 3) Brian's voiceover (resumable; skips lines already generated)
ELEVENLABS_API_KEY=sk_... VOICE_NAME=Brian npm run voice

# 4) Mux frames + VO + music + clip FX -> WorldCup26_Match02_KOR_CZE.mp4
npm run mux
```

No ElevenLabs key handy? `NO_VO=1 npm run mux` produces a music+FX preview cut.

The final MP4 is gitignored (like the 90s ad) — upload it to YouTube directly.

## YouTube metadata (suggested)

- **Title:** WorldCup26 South Korea vs Czech Republic | Sonaldo's Last Dance Begins — FIFA World Cup 2026 Match 2
- **Description hook:** Son Heung-min's farewell World Cup starts tonight in
  Guadalajara. The Monster vs The Marksman. One goal, two heartbreaks, and the
  story nobody saw coming. Pick your 3 teams free at https://worldcup26.world
- **Tags:** see `content/youtube/SEO_KEYWORDS.md`; thumbnail per
  `content/youtube/THUMBNAIL_GUIDE.md` (Son close-up + "HIS LAST DANCE" text).
