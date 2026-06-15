# Episode 24 — Portugal vs DR Congo

**Group K · real kickoff Wed 17 June 2026, 20:00** · Mystery Supporter: **Legend 024 — the Leopard**
Script: `narration.json` · Predicted score (OUR PREDICTION): **Portugal 3–1 DR Congo**

> Packaging status: narration script ✅, scenes/render project ✅, upload pack ✅, thumbnail config ✅.
> Built from the Ep15 image-based template: React/Babel 300s timeline → Playwright frame render →
> ElevenLabs Brian VO → two-stage ffmpeg mux. IMAGE-BASED (Ken-Burns on player stills) — no generated clips.

## The true-history hook (verified) — handled with NUANCE / RESPECT, not mockery
In **1974 (West Germany)**, a nation then called **Zaire** — today's **DR Congo** — became the
**first Black African / sub-Saharan / Central African nation ever to reach a World Cup finals**.
They arrived as reigning African champions, the **Leopards** (AFCON winners **1968** as Congo-Kinshasa
and **1974** as Zaire — two titles). The tournament turned cruel (a **9–0** loss to Yugoslavia). In the
Brazil game (~78', score 2–0), defender **Mwepu Ilunga** burst out of the defensive wall and booted the
free kick away before it was taken, earning a yellow. For decades the clip was mocked by commentators as
"African ignorance." The truth, told later: dictator **Mobutu Sese Seko**, humiliated by the heavy
defeats, had the squad threatened over how badly they were losing; the players' bonuses had been withheld;
**Ilunga has said he acted in protest / to be sent off** — a frightened man, not a clown. The spine of the
episode: a misunderstood act of **courage**, a door kicked open for a continent. Portugal's counter-story:
**Euro 2016 champions** still chasing a first World Cup, with **Cristiano Ronaldo (41)** in his **sixth and
final** World Cup — the one trophy he has never lifted.

### Sources
- The Greatness Index — Zaire 1974 / Ilunga / Mobutu, the most misread World Cup clip:
  https://www.thegreatnessindex.com/post/zaire-world-cup-dream-ends-in-farce-and-fear
- Sky HISTORY — the dark story of Zaire's 9–0 defeat at the 1974 World Cup:
  https://www.history.co.uk/article/the-dark-story-of-zaires-9-nil-defeat-in-the-1974-world-cup
- Wikipedia — Mwepu Ilunga (the free kick, the yellow card, the protest):
  https://en.wikipedia.org/wiki/Mwepu_Ilunga
- CAF Online — DR Congo, multiple names, two AFCON titles (1968, 1974):
  https://www.cafonline.com/caf-africa-cup-of-nations/news/dr-congo-multiple-names-two-titles
- Sports Gazette — AFCON Archives 1970s: the Leopards of Zaire:
  https://sportsgazette.co.uk/afcon-archives-1970s-the-leopards-of-zaire/
- AOL / PA — Ronaldo confirms 2026 will be his final major tournament:
  https://www.aol.com/articles/cristiano-ronaldo-provides-further-details-134908061.html

## Title
`The Free Kick the World Got Wrong | Portugal vs DR Congo — World Cup 2026 (Ep.24)`

## Description, chapters, tags
See `content/youtube/UPLOAD_PACKS.md` → **Episode 24**.

## Thumbnail
Star face: **RONALDO** (POR, dark red). Away star: **WISSA** (COD, sky blue). Hook: **THE FREE KICK<br>THEY GOT WRONG**.
Config entry in `marketing/match-videos/_thumbnail-kit/thumbnails.config.json` (ep 24).
Rebuild: `cd ../_thumbnail-kit && node gen-thumbnails.mjs --ep 24 --install`.

## Shorts (plan)
1. **THE FREE KICK THEY GOT WRONG** — the 1974 Ilunga cold open (post 24h before premiere).
2. **RONALDO AT THE DEATH** — the 3–1 climax (post day-of).
3. **LEGEND 024: THE LEOPARD** — the mystery-supporter reveal (post day after).

## Build / render commands
```
npm install
npm run serve &                                  # range-capable static server on :8098
FPS=30 DURATION=300 OUT=frames node render.mjs   # ~9000 frames -> frames/f_%05d.jpg
# (VO + mux + thumbnail are downstream, run later)
npm run voice                                     # ElevenLabs Brian VO -> audio/line_NN.mp3
npm run mux                                       # -> WorldCup26_Match24_POR_COD.mp4
```

## Music
"Crossing the Chasm", "Desert City", "Five Armies", "Invariance" — Kevin MacLeod (incompetech.com), CC BY 4.0.
