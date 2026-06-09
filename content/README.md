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
2. **Character/** - Pixar-style player character images
3. **Match/** - Match details with mysterious stories

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
│   │   └── (Pixar-style images)
│   └── Match/
│       └── [Opponent].md (one per group match)
```
