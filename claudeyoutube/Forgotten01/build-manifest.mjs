// Builds the anthology chapter manifest + story-only VO.
// Source of truth for each legend is its finished Short folder under content/youtube/did-you-know/.
import { spawnSync } from 'node:child_process';
import fs from 'node:fs'; import path from 'node:path';
const F = 'node_modules/ffmpeg-static/ffmpeg';
const SRC = '../../content/youtube/did-you-know';
const CARDS = '../../public/legend-cards/did-you-know';
const cuts = JSON.parse(fs.readFileSync('build/vo-cuts.json', 'utf8'));

// name + <=4-word card label (rule #10: name labels and short labels only, never sentences)
const META = {
  '01-gaetjens-the-vanished-hero':      { name: 'JOE GAETJENS',      label: 'THE VANISHED HERO',   meta: 'HAITI · 1950' },
  '02-garrincha-the-joy-of-the-people': { name: 'GARRINCHA',         label: 'JOY OF THE PEOPLE',   meta: 'BRAZIL · 1962' },
  '03-carbajal-the-eternal-keeper':     { name: 'ANTONIO CARBAJAL',  label: 'THE ETERNAL KEEPER',  meta: 'MEXICO · 5 CUPS' },
  '04-socrates-the-doctor':             { name: 'SÓCRATES',          label: 'THE DOCTOR',          meta: 'BRAZIL · 1982' },
  '05-milla-the-dancing-lion':          { name: 'ROGER MILLA',       label: 'THE DANCING LION',    meta: 'CAMEROON · 1990' },
  '06-laurent-the-first-goal':          { name: 'LUCIEN LAURENT',    label: 'THE FIRST GOAL',      meta: 'FRANCE · 1930' },
  '07-escobar-the-gentleman':           { name: 'ANDRÉS ESCOBAR',    label: 'THE GENTLEMAN',       meta: 'COLOMBIA · 1994' },
  '08-yashin-the-black-spider':         { name: 'LEV YASHIN',        label: 'THE BLACK SPIDER',    meta: 'USSR · 1963' },
  '09-monti-two-nations':               { name: 'LUIS MONTI',        label: 'TWO NATIONS',         meta: '1930 · 1934' },
  '10-tostao-eyes-of-a-champion':       { name: 'TOSTÃO',            label: 'EYES OF A CHAMPION',  meta: 'BRAZIL · 1970' },
};

fs.mkdirSync('vo', { recursive: true });
const chapters = [];
for (const c of cuts) {
  const dir = path.join(SRC, c.slug);
  const m = META[c.slug]; if (!m) { console.warn('no META for', c.slug); continue; }
  // story-only VO: trim at the CTA silence, fade the last 250ms so the cut is inaudible
  const dst = `vo/${c.slug}.m4a`;
  const r = spawnSync(F, ['-y', '-i', path.join(dir, 'assets/audio/vo_brian.mp3'),
    '-t', String(c.story),
    '-af', `afade=t=out:st=${Math.max(0, c.story - 0.25).toFixed(2)}:d=0.25,loudnorm=I=-16:TP=-1.5:LRA=11`,
    '-c:a', 'aac', '-b:a', '192k', dst], { encoding: 'utf8' });
  if (r.status !== 0) { console.error('VO FAIL', c.slug, (r.stderr||'').slice(-300)); continue; }
  const card = fs.readdirSync(CARDS).find(f => f.startsWith(c.slug.slice(0, 2)));
  const clips = fs.existsSync(path.join(dir, 'assets/clips'))
    ? fs.readdirSync(path.join(dir, 'assets/clips')).filter(f => f.endsWith('.mp4')).sort() : [];
  const images = fs.existsSync(path.join(dir, 'assets/images'))
    ? fs.readdirSync(path.join(dir, 'assets/images')).filter(f => /\.(png|jpe?g)$/.test(f) && f !== 'card.png').sort() : [];
  chapters.push({ slug: c.slug, ...m, vo: dst, voDur: c.story,
    card: `${CARDS}/${card}`, srcDir: dir, clips, images });
  console.log(`${m.name.padEnd(18)} vo=${c.story.toFixed(1)}s clips=${clips.length} imgs=${images.length} card=${card ? 'OK' : 'MISSING'}`);
}
fs.writeFileSync('build/chapters.json', JSON.stringify(chapters, null, 2) + '\n');
const total = chapters.reduce((a, c) => a + c.voDur, 0);
console.log(`\n${chapters.length} chapters · story VO ${total.toFixed(0)}s (${(total/60).toFixed(1)} min) · ${chapters.reduce((a,c)=>a+c.clips.length,0)} clips · ${chapters.reduce((a,c)=>a+c.images.length,0)} images`);
