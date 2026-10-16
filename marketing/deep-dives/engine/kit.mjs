// kit.mjs <episode-dir> — writes <episode>/UPLOAD_KIT.md: title, description with
// chapters straight from film.json, tags, sources and the monetization checklist.
import fs from 'node:fs';
import path from 'node:path';
import { loadEpisode, outputName } from './lib.mjs';

const epDir = path.resolve(process.argv[2] || '.');
const ep = loadEpisode(epDir);
const film = JSON.parse(fs.readFileSync(path.join(epDir, 'build/film.json'), 'utf8'));
const ts = (s) => `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, '0')}`;
const cap = (s) => s.toLowerCase().replace(/(^|\s)\S/g, (c) => c.toUpperCase());
const chapters = [`0:00 ${ep.card.title}`, ...film.chapters.map((c) => `${ts(c.at)} ${cap(c.title)}`)];
const phone = film.graphics.find((g) => g.type === 'phone');
if (phone) chapters.push(`${ts(phone.at - 6)} Collect the card`);
const P = ep.player;
const tags = [...new Set([P.name, ...(ep.tags || []), 'did you know football', 'football facts', 'soccer stories',
  'world cup 2026', 'worldcup26', 'legend cards', `${P.nation} football`])].join(', ');

const kit = `# UPLOAD KIT — Did You Know? Ep.${ep.number}: ${P.name}

**File:** \`output/${outputName(ep)}\` · ${ts(film.duration)} · 1920x1080 · H.264 + AAC
**Thumbnail:** \`output/thumbnail.jpg\` (1280x720, hook: "${ep.thumbnail.hook}")
**Card:** \`public/legend-cards/deep-dive/${ep.slug}.png\` → goes live in the album once this video's link is known

## Title
\`\`\`
${ep.title}
\`\`\`

## Description
\`\`\`
${ep.card.story}

${chapters.join('\n')}

COLLECT THE CARD
"${ep.card.title}" is a legendary card at worldcup26.world. Watch this story to the
end and it unlocks in your album — free to play, just for fun, no prizes.
→ https://worldcup26.world

SOURCES
${ep.sources.map((s) => `• ${s.url}`).join('\n')}

MUSIC
Kevin MacLeod (incompetech.com) — licensed under Creative Commons: By Attribution 4.0
https://creativecommons.org/licenses/by/4.0/
Cues: Dreams Become Real · Ascending the Vale · Fanfare for Space

DISCLOSURE
All visuals are AI-generated football scenes and original motion graphics. No real
match footage, broadcast clips or copyrighted photographs are used. Player likenesses
are stylised AI depictions used for storytelling. Narration is an AI voice.
Not affiliated with, endorsed by, or associated with FIFA, any club or any player.
"World Cup" is used descriptively to refer to the tournament.
\`\`\`

## Tags
\`\`\`
${tags}
\`\`\`

## Pinned comment
\`\`\`
Did you know this one? 👇 This story is now a legendary card — watch to the end and
collect "${ep.card.title}" free at worldcup26.world (just for fun, no prizes).
\`\`\`

## Upload checklist (⚠️ monetization)
- [ ] Channel: **@DansLab-WorldCup**, public (or a Premiere)
- [ ] Made for kids → **No**
- [ ] Altered/synthetic content → **Yes** (AI visuals and narration voice)
- [ ] Music credit in the description (above)
- [ ] Thumbnail uploaded; title ≤100 chars, player name first
- [ ] Added to the "Did You Know? Deep Dives" playlist; pinned comment posted
- [ ] Reply with the video link (or it is picked up from the channel feed) so the card goes live in the app
`;
fs.writeFileSync(path.join(epDir, 'UPLOAD_KIT.md'), kit);
console.log('kit ->', path.relative(process.cwd(), path.join(epDir, 'UPLOAD_KIT.md')));
