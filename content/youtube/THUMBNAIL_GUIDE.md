# WorldCup26 — Thumbnail Design Guide

## Thumbnail Dimensions & Specs

- **Resolution:** 1280×720 (16:9) minimum, 1920×1080 preferred
- **Format:** PNG for graphics-heavy, JPG for photo-heavy
- **Max file size:** 2MB for YouTube
- **Safe zone:** Keep main subject and text within center 80% (avoid edges)
- **Mobile-friendly:** Text must be readable at 120×68px (YouTube mobile feed)

## Design System

### Color Palette
```
Primary Gold:     #FFD700  (trophy, highlights, accents)
Pitch Green:      #2E8B57  (grass, backgrounds, secondary)
Sky Blue:         #87CEEB  (sky, gradients, tertiary)
Dark Navy:        #1A1A2E  (text, shadows, contrast)
Alert Red:        #E63946  (urgency, "SHOCK", "BREAKING")
Electric Cyan:    #00D4AA  (numbers, stats, coefficients)
```

### Typography
- **Headlines:** Oswald / Bebas Neue / Impact — bold, condensed, uppercase
- **Numbers:** Druk Wide / Anton — extra bold, huge scale
- **Subtitles:** Montserrat SemiBold — clean, readable at small sizes
- **Never use:** More than 2 fonts per thumbnail, script fonts, thin weights

### Text Rules
- Max 3-5 words in headline
- Text takes up 30-40% of thumbnail area
- Stroke/outline: 4-6px black or dark shadow for readability
- Text hierarchy: Headline (biggest) > Number/Stat > Small label

## Thumbnail Templates (8 Proven Formulas)

### Template 1: "Player Face + Big Number"
**Use for:** Team spotlights, player features, stat reveals

```
[Left 60%]  Pixar character face, intense expression, looking at camera
[Right 40%] Huge number "1.6x" or "$500K" in Electric Cyan
             Small label: "COEFFICIENT" or "PRIZE POOL"
[Top]       Tiny country flag + team name
[Bottom]    "Pick 3 Teams" logo watermark
```
**Examples:**
- Haaland's face + "1.6x" + "NORWAY COEFFICIENT"
- Messi's face + "5x" + "WORLD CUP WINS"

### Template 2: "Before/After Shock"
**Use for:** Underdog stories, comeback narratives, curse breaks

```
[Left 50%]   Sad fan character, gray desaturated, "2010"
[Center]     Arrow → or VS symbol
[Right 50%]  Same character exploding with joy, full color, "2026"
[Bottom]     "THE CURSE IS BROKEN?" in Alert Red
```
**Examples:**
- England 1966 → England 2026 "60 YEARS"
- Curaçao sad → Curaçao celebrating "FIRST WORLD CUP"

### Template 3: "Mystery Supporter"
**Use for:** Mystery supporter series, legendary fan stories

```
[Center]     Shadowy figure in team colors, back to camera
[Atmosphere] Heavy fog, stadium lights piercing through
[Text]       "The Fan Nobody Knows" in white with glow
[Bottom]     Country flag + "MYSTERY REVEALED"
[Accent]     Subtle glowing eyes or silhouette hint
```
**Examples:**
- Brazil: Shaman silhouette + "The Feathered Prophet"
- Scotland: Nessie costume outline + "50 Years of Mystery"

### Template 4: "Pick 3 Math"
**Use for:** Strategy videos, coefficient explainers, pick reveals

```
[Top]        "MY 3 TEAMS" in bold white
[Center]     3 character portraits in a row
             + × ÷ symbols between them
[Bottom]     Huge number: "= 47 POINTS" or "$12,400"
[Accent]     Team flags above each portrait
```
**Examples:**
- France + Norway + Japan = 52 points
- "Underdog Math" with 3 smaller nations

### Template 5: "Group of Death"
**Use for:** Group stage previews, tough match previews

```
[Background] Dark stadium, spotlights
[Center]     4 team flags in a circle or grid
[Overlay]    Skull icon or danger symbol
[Text]       "GROUP OF DEATH" in Alert Red
[Bottom]     "Who Survives?"
```

### Template 6: "The Late Entry Hack"
**Use for:** Strategy videos, app tutorials, "secret" tips

```
[Left]       Calendar showing "Match Day 10" circled in red
[Right]      Clock showing "11:59 PM" with urgent glow
[Center]     Character looking shocked/surprised
[Text]       "LATE ENTRY HACK" + "Don't Miss Out!"
[Color]      Urgent red and gold palette
```

### Template 7: "Upset Alert"
**Use for:** Match reactions, prediction videos, upset previews

```
[Top]        "UPSET ALERT" in flashing-style text
[Left]       Giant team logo (favorite)
[Right]      Giant team logo (underdog) with explosion effect
[Bottom]     "[UNDERDOG] BEAT [FAVORITE]?!"
[Accent]     Warning stripes, alert siren graphics
```

### Template 8: "Mascot/Trophy Hero Shot"
**Use for:** Channel intro, game promos, general World Cup content

```
[Center]     Cuppie (golden trophy mascot) in dynamic pose
[Background] World Cup stadium, fireworks, confetti
[Text]       "Pick 3. Win Big." or "WorldCup26.world"
[Bottom]     "Free Entry for First 1,000"
[Style]      Epic, cinematic, movie poster vibes
```

## A/B Testing Framework

For every video, create 2 thumbnails and test:

| Variant | Change | Hypothesis |
|---------|--------|------------|
| A | Face looking at camera | Eye contact increases CTR |
| B | Face looking at text/product | Directs attention to value prop |
| A | Bright, saturated colors | Stands out in feed |
| B | Dark, moody, cinematic | Premium feel, intrigue |
| A | Text says "SHOCK" | Urgency drives clicks |
| B | Text says "SECRET" | Curiosity drives clicks |

## Tools & Workflow

1. **Character renders:** Generated via Fal.ai GPT-Image-2 (existing pipeline)
2. **Composition:** Figma / Canva / Photoshop
3. **Text effects:** Layer styles (drop shadow, outer glow, stroke)
4. **Batch processing:** Script to auto-place characters into template frames
5. **Export:** PNG-24, 1920×1080, then compress with TinyPNG

## Common Mistakes to Avoid

- ❌ Too much text (YouTube truncates, mobile unreadable)
- ❌ Clickbait that doesn't match video (hurts retention)
- ❌ Bland expressions (surprise/curiosity/anger work best)
- ❌ Cluttered backgrounds (blur or simplify)
- ❌ Ignoring mobile preview (test at 120px wide)
- ❌ Inconsistent branding (colors/fonts should be recognizable)

## Seasonal Thumbnail Calendar

| Phase | Theme | Dominant Color |
|-------|-------|---------------|
| Pre-qualification | "Road to 2026" | Gold + Green |
| Qualifiers | "Who's In?" | Green + White |
| Group draw | "GROUP OF DEATH" | Red + Black |
| Pre-tournament | "My 3 Teams" | Team colors + Gold |
| Group stage | Daily reactions | Alert Red |
| Knockouts | "SURVIVE" | Dark + Gold |
| Final | "CHAMPION" | Gold + confetti |
