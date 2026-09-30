// Emit the YouTube chapter list straight from film.json, so the upload kit can
// never drift from the cut. Timestamps FLOOR to the chapter boundary: a marker a
// second late would land the viewer inside the card fly-in instead of on it.
import fs from 'node:fs';
const film = JSON.parse(fs.readFileSync('film.json', 'utf8'));
const NAMES = {
  'JOE GAETJENS': 'The Vanished Hero', 'GARRINCHA': 'Joy of the People',
  'ANTONIO CARBAJAL': 'The Eternal Keeper', 'SÓCRATES': 'The Doctor',
  'ROGER MILLA': 'The Dancing Lion', 'LUCIEN LAURENT': 'The First Goal',
  'ANDRÉS ESCOBAR': 'The Gentleman', 'LEV YASHIN': 'The Black Spider',
  'LUIS MONTI': 'Two Nations', 'TOSTÃO': 'Eyes of a Champion',
};
const cap = s => s.split(' ').map(w => w[0] + w.slice(1).toLowerCase()).join(' ');
const mm = s => Math.floor(s / 60) + ':' + String(Math.floor(s % 60)).padStart(2, '0');
const rows = [['0:00', 'Cold open']];
for (const c of film.chapters) rows.push([mm(c.at), `${cap(c.name)} — ${NAMES[c.name]}`]);
const last = film.chapters[film.chapters.length - 1];
rows.push([mm(last.at + last.dur), 'Collect the legends']);
const w = Math.max(...rows.map(r => r[0].length));
console.log(rows.map(([t, n]) => `${t.padEnd(w)}  ${n}`).join('\n'));
