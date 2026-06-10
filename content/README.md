# FIFA World Cup 2026 - Content Generation System

## Tournament Overview
- **Dates**: June 11 - July 19, 2026
- **Hosts**: USA, Canada, Mexico
- **Teams**: 48 (first-ever 48-team World Cup)
- **Format**: 12 groups of 4, top 2 + 8 best 3rd advance to Round of 32
- **Total Matches**: 104

## Groups

| Group | Team 1 | Team 2 | Team 3 | Team 4 |
|-------|--------|--------|--------|--------|
| A | Mexico (H) | South Africa | South Korea | Czech Republic |
| B | Canada (H) | Bosnia & Herzegovina | Qatar | Switzerland |
| C | Brazil | Morocco | Haiti | Scotland |
| D | USA (H) | Paraguay | Australia | Turkey |
| E | Germany | Curacao | Ivory Coast | Ecuador |
| F | Netherlands | Japan | Sweden | Tunisia |
| G | Belgium | Egypt | Iran | New Zealand |
| H | Spain | Cape Verde | Saudi Arabia | Uruguay |
| I | France | Senegal | Iraq | Norway |
| J | Argentina | Algeria | Austria | Jordan |
| K | Portugal | DR Congo | Uzbekistan | Colombia |
| L | England | Croatia | Ghana | Panama |

## First-Time Qualifiers
- Cape Verde
- Curacao
- Jordan
- Uzbekistan

## Content Pipeline
1. **Info/** - Team data, player CVs, stats, stories
2. **Character/** - Pixar-style player character image prompts
3. **Match/** - Match details with mysterious stories
4. **Stories/** - One narrative per group match (72 total), used for narration
5. **Supporters/** - Ultra-fan and mystery-supporter image prompts per team
6. **images/** - Generated player character PNGs (`images/<Team>/`) and supporter PNGs (`images/Supporters/<Team>/`)
7. **videos/** - Generated 6s player character clips (`videos/<Team>/`)
8. **match_videos/** - Assembled match presentation videos

## Video Production (scripts/)

| Script | Purpose |
| --- | --- |
| `generate_images.py` | Batch player character images (Fal.ai) |
| `generate_videos.py` | Batch 6s player clips from images (Seedance) |
| `generate_supporter_prompts.py` | Supporter prompt scaffolding |
| `generate_story_audio.mjs` | ElevenLabs **Brian** voiceover per story line (`narration/<Match>.json` -> `narration/audio/<Match>/line_XX.mp3`); needs `ELEVENLABS_API_KEY` |
| `make_match_presentation.py` | Full match presentation: design-system title cards (Inter, ink/green/gold), player clips with lower-thirds, supporter stills, story interlude, CTA, narration mux |
| `generate_match_videos.py` | Legacy simple concat assembler |

Build a match presentation (after player videos + supporter images exist):

```bash
python3 scripts/make_match_presentation.py Mexico-vs-South-Africa
# optional Brian voiceover first:
ELEVENLABS_API_KEY=sk_... node scripts/generate_story_audio.mjs Mexico-vs-South-Africa
```

Per-match presentation configs live in `scripts/presentations/<Match>.json`,
narration scripts in `scripts/narration/<Match>.json`.

## Folder Structure
```
WorldCup/
├── [TeamName]/
│   ├── Info/
│   │   ├── team-overview.md
│   │   ├── squad.md
│   │   ├── [PlayerName].md (one per player)
│   │   └── trainer.md
│   ├── Character/
│   │   └── (Pixar-style image prompts)
│   └── Match/
│       └── [Opponent].md (one per group match)
├── Stories/[TeamA]-vs-[TeamB].md
├── Supporters/[TeamName]/{Ultra-Fan,Mystery-Supporter}-prompt.md
├── images/[TeamName]/[Player].png
├── images/Supporters/[TeamName]/{Ultra-Fan,Mystery-Supporter}.png
├── videos/[TeamName]/[Player].mp4
└── match_videos/[TeamA]-vs-[TeamB].mp4
```
