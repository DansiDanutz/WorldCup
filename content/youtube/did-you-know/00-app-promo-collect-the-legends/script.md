# App Promo — "Collect the Legends" (WorldCup26.world explainer/ad) ✅ DONE

**Final:** `dyk_app_promo_wc26.mp4` · 1080×1920 · 9:16 · 50.0s · H.264 + AAC · −16.8 LUFS (voice-forward)
**Type:** advertisement for the worldcup26.world **Legendary Cards** feature — what the app is, the
10 Did You Know legends, and how you **collect + unlock** a card by watching its YouTube Short.
Drives to **worldcup26.world** (not the channel). Built from REAL app screenshots.

## Delivered to
- Project: `~/Desktop/DavidAi/Videos/dyk-app-promo/` (sources, `hf/`, render)
- READY: `~/Desktop/WorldCup26_Shorts_READY/00_App-Promo_Collect-the-Legends.mp4`
- Repo: this folder (`00-app-promo-collect-the-legends/`) + `UPLOAD_KIT.md`

## Brian VO (ElevenLabs eleven_multilingual_v2, voice-forward mix)
> Football remembers its champions… but it forgot its legends. The keeper who hid in goal to escape
> his father. The boy with broken legs who became the joy of a nation. The man who beat England…
> then vanished without a trace. At worldcup26.world, every one of them is a legendary card — locked,
> and waiting for you to set it free. Here's how it works. Open a card. Read its story. Then watch its
> short tale on YouTube… and the card is yours. Collected, forever. Ten legends are live right now —
> a hundred and seventy-seven cards in all. And every single one is free. Start your collection
> today… only at worldcup26.world.

## Real app screens used (captured 2026-06-28 after the dedup upgrade, Playwright 440px portrait)
- `assets/app-screens/screen_collection.png` — Legend Card Collection (header + "X / 177 collected")
- `assets/app-screens/screen_loop.png` — "Finish the card loop": Read the Pulse → Listen → Open
  YouTube → Collect the card (the real collect/unlock quest)
- `assets/app-screens/screen_card_locked.png` — a locked "Did You Know? Short" LEGENDARY card
  (Laurent · "The First Goal") with Open YouTube / Unlock card

> The app's **Legends** tab lists exactly our 10 Shorts as "DID YOU KNOW? SHORT" LEGENDARY cards
> (10 live, 177 total) — confirmed live in-app.

## Composition — 7 beats over `bg.mp4` (HyperFrames `hf/index.html`, GSAP)
1. **Hook (0–8s)** — "COLLECT THE LEGENDS" + a strip of legendary-card faces.
2. **The forgotten (8–17s)** — 3 legends with ≤4-word labels: Carbajal "HE HID IN GOAL", Garrincha
   "BROKEN LEGS", Gaetjens "BEAT ENGLAND" (matches the VO hooks).
3. **The app (17–24s)** — real Legend Card Collection screen in a phone frame; "177 legendary cards".
4. **How to unlock (24–30.5s)** — real loop screen + 4 designed step chips: ① READ ② LISTEN ③ WATCH ④ COLLECT.
5. **Unlock reveal (30.5–35s)** — locked card → padlock dissolves → "✓ COLLECTED" stamp → "Yours forever".
6. **10 legends (35–42s)** — 5×2 grid of all 10 card arts + stat chips "10 LIVE · 177 CARDS · 100% FREE".
7. **CTA (42–50s)** — fan of cards + "Collect the legends" + `worldcup26.world` pill + "Watch · Unlock · Keep — free".

## On-screen text (designed HyperFrames cards only — NO sentence subtitles, rule #10)
Opener `COLLECT THE LEGENDS` · step labels `READ/LISTEN/WATCH/COLLECT` · stat chips
`10 LIVE · 177 CARDS · 100% FREE` · end `worldcup26.world`. (The phone screenshots show the real app
UI as the product itself — not narration captions.)

## Monetization-safety (rule #0)
Made-for-kids = NO · AI disclosure = YES · cleared/original score · no betting/odds/prizes ·
"free to play · just for fun" framing · soccer-only · 100% AI visuals + real app UI.

## Render note (sandbox)
macOS TCC intermittently denies subprocess file access under `~/Desktop` (hyperframes hit `EPERM` on
its temp compiled dir). Fix that worked: stage `hf/` in the session scratchpad, render there, copy
`overlayed.mp4` + final back. Re-use if a Desktop render throws EPERM.

## Rebuild
```
# stage hf/ in a TCC-free dir if Desktop render EPERMs, then:
cd hf && npx hyperframes render . -o overlayed.mp4 --resolution portrait --fps 30
ffmpeg -i overlayed.mp4 -i ../assets/audio/narration_master.mp3 -map 0:v:0 -map 1:a:0 \
  -c:v copy -c:a aac -b:a 256k -shortest dyk_app_promo_wc26.mp4
```
