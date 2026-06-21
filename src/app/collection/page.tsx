'use client';

import { useState } from 'react';

type Card = {
  number: string;
  name: string;
  nation: string;
  episode: number;
  match: string;
  portrait: string;
  landscape: string;
};

// Mirrors public/special-cards/cards.json — the WorldCup26 Legends collection.
const CARDS: Card[] = [
  { number: '001', name: 'The Mariachi',          nation: 'Mexico',       episode: 1,  match: 'Mexico vs South Africa',        portrait: '/special-cards/legend-001-portrait.png', landscape: '/special-cards/legend-001-landscape.png' },
  { number: '002', name: 'The Mountain Sage',     nation: 'South Korea',  episode: 2,  match: 'South Korea vs Czech Republic', portrait: '/special-cards/legend-002-portrait.png', landscape: '/special-cards/legend-002-landscape.png' },
  { number: '003', name: 'The Northern Guardian', nation: 'Canada',       episode: 3,  match: 'Canada vs Bosnia',              portrait: '/special-cards/legend-003-portrait.png', landscape: '/special-cards/legend-003-landscape.png' },
  { number: '004', name: 'The Jazz Trumpeter',    nation: 'USA',          episode: 4,  match: 'USA vs Paraguay',               portrait: '/special-cards/legend-004-portrait.png', landscape: '/special-cards/legend-004-landscape.png' },
  { number: '005', name: 'The Atlas Horseman',    nation: 'Morocco',      episode: 5,  match: 'Brazil vs Morocco',             portrait: '/special-cards/legend-005-portrait.png', landscape: '/special-cards/legend-005-landscape.png' },
  { number: '006', name: 'The Fennec',            nation: 'Algeria',      episode: 6,  match: 'Argentina vs Algeria',          portrait: '/special-cards/legend-006-portrait.png', landscape: '/special-cards/legend-006-landscape.png' },
  { number: '007', name: 'The Citadelle Sentinel',nation: 'Haiti',        episode: 7,  match: 'Brazil vs Haiti',               portrait: '/special-cards/legend-007-portrait.png', landscape: '/special-cards/legend-007-landscape.png' },
  { number: '008', name: 'The Elder',             nation: 'Ghana',        episode: 11, match: 'England vs Ghana',       portrait: '/special-cards/legend-008-portrait.png', landscape: '/special-cards/legend-008-landscape.png' },
  { number: '009', name: 'The Falconer',          nation: 'Qatar',        episode: 9,  match: 'Qatar vs Switzerland',   portrait: '/special-cards/legend-009-portrait.png', landscape: '/special-cards/legend-009-landscape.png' },
  { number: '010', name: 'The Lone Piper',        nation: 'Scotland',     episode: 10, match: 'Haiti vs Scotland',      portrait: '/special-cards/legend-010-portrait.png', landscape: '/special-cards/legend-010-landscape.png' },
  { number: '011', name: 'The Wanderer',          nation: 'Australia',    episode: 11, match: 'Australia vs Turkey',    portrait: '/special-cards/legend-011-portrait.png', landscape: '/special-cards/legend-011-landscape.png' },
  { number: '012', name: 'The Beach Keeper',      nation: 'Curaçao',      episode: 12, match: 'Germany vs Curaçao',     portrait: '/special-cards/legend-012-portrait.png', landscape: '/special-cards/legend-012-landscape.png' },
  { number: '013', name: 'The Blue Samurai Elder',nation: 'Japan',        episode: 14, match: 'Netherlands vs Japan',   portrait: '/special-cards/legend-013-portrait.png', landscape: '/special-cards/legend-013-landscape.png' },
  { number: '014', name: 'The Windmill Keeper',   nation: 'Netherlands',  episode: 14, match: 'Netherlands vs Japan',   portrait: '/special-cards/legend-014-portrait.png', landscape: '/special-cards/legend-014-landscape.png' },
  { number: '015', name: 'The Peacemaker',        nation: 'Ivory Coast',  episode: 15, match: 'Ivory Coast vs Ecuador', portrait: '/special-cards/legend-015-portrait.png', landscape: '/special-cards/legend-015-landscape.png' },
  { number: '016', name: 'The Firekeeper',        nation: 'Sweden',       episode: 16, match: 'Sweden vs Tunisia',      portrait: '/special-cards/legend-016-portrait.png', landscape: '/special-cards/legend-016-landscape.png' },
  { number: '017', name: 'The Lighthouse Keeper', nation: 'Cape Verde',   episode: 17, match: 'Spain vs Cape Verde',    portrait: '/special-cards/legend-017-portrait.png', landscape: '/special-cards/legend-017-landscape.png' },
  { number: '018', name: 'Keeper of the Two Crowns', nation: 'Egypt',     episode: 18, match: 'Belgium vs Egypt',       portrait: '/special-cards/legend-018-portrait.png', landscape: '/special-cards/legend-018-landscape.png' },
  { number: '019', name: 'The Ghost of the Maracaná', nation: 'Uruguay',  episode: 19, match: 'Saudi Arabia vs Uruguay', portrait: '/special-cards/legend-019-portrait.png', landscape: '/special-cards/legend-019-landscape.png' },
  { number: '020', name: 'The Unbeaten',          nation: 'New Zealand',  episode: 20, match: 'Iran vs New Zealand',    portrait: '/special-cards/legend-020-portrait.png', landscape: '/special-cards/legend-020-landscape.png' },
  { number: '021', name: 'The Dancing Lion',      nation: 'Senegal',      episode: 21, match: 'France vs Senegal',      portrait: '/special-cards/legend-021-portrait.png', landscape: '/special-cards/legend-021-landscape.png' },
  { number: '024', name: 'The Leopard',           nation: 'DR Congo',     episode: 24, match: 'Portugal vs DR Congo',   portrait: '/special-cards/legend-024-portrait.png', landscape: '/special-cards/legend-024-landscape.png' },
  { number: '037', name: 'The Island Elder',      nation: 'Curaçao',      episode: 37, match: 'Ecuador vs Curaçao',     portrait: '/special-cards/legend-037-portrait.png', landscape: '/special-cards/legend-037-landscape.png' },
  { number: '038', name: 'The Eagle-Keeper',      nation: 'Tunisia',      episode: 38, match: 'Japan vs Tunisia',       portrait: '/special-cards/legend-038-portrait.png', landscape: '/special-cards/legend-038-landscape.png' },
  { number: '039', name: 'The Falconer',          nation: 'Saudi Arabia', episode: 39, match: 'Spain vs Saudi Arabia',  portrait: '/special-cards/legend-039-portrait.png', landscape: '/special-cards/legend-039-landscape.png' },
  { number: '040', name: 'The Spirit of Persia',  nation: 'Iran',         episode: 40, match: 'Belgium vs Iran',        portrait: '/special-cards/legend-040-portrait.png', landscape: '/special-cards/legend-040-landscape.png' },
  { number: '041', name: 'The Charrúa',           nation: 'Uruguay',      episode: 41, match: 'Uruguay vs Cape Verde',  portrait: '/special-cards/legend-041-portrait.png', landscape: '/special-cards/legend-041-landscape.png' },
  { number: '042', name: 'The Navigator',         nation: 'New Zealand',  episode: 42, match: 'Egypt vs New Zealand',   portrait: '/special-cards/legend-042-portrait.png', landscape: '/special-cards/legend-042-landscape.png' },
  { number: '043', name: 'The Clockmaker',        nation: 'Austria',      episode: 43, match: 'Argentina vs Austria',  portrait: '/special-cards/legend-043-portrait.png', landscape: '/special-cards/legend-043-landscape.png' },
];

export default function CollectionPage() {
  const [orientation, setOrientation] = useState<'portrait' | 'landscape'>('portrait');

  return (
    <main style={{ minHeight: '100vh', background: 'radial-gradient(1200px 600px at 50% -10%, #11204a 0%, #060814 60%)', color: '#f5f3ee', padding: '48px 20px 80px' }}>
      <div style={{ maxWidth: 1180, margin: '0 auto' }}>
        <p style={{ letterSpacing: 4, fontSize: 13, color: '#e9c46a', textTransform: 'uppercase', margin: 0 }}>WorldCup26 Legends</p>
        <h1 style={{ fontSize: 42, fontWeight: 800, margin: '6px 0 4px' }}>The Collection</h1>
        <p style={{ color: '#a9b2c7', maxWidth: 640, margin: '0 0 22px' }}>
          Every episode hides one Mystery Supporter — a Legend. Collect them all.
        </p>

        <div style={{ display: 'inline-flex', gap: 6, background: '#0e1430', border: '1px solid #243056', borderRadius: 999, padding: 4, marginBottom: 28 }}>
          {(['portrait', 'landscape'] as const).map((o) => (
            <button key={o} onClick={() => setOrientation(o)}
              style={{ border: 'none', cursor: 'pointer', padding: '8px 18px', borderRadius: 999, fontSize: 13, fontWeight: 700, textTransform: 'capitalize',
                background: orientation === o ? '#e9c46a' : 'transparent', color: orientation === o ? '#0a0e1f' : '#cdd5e6' }}>
              {o}
            </button>
          ))}
        </div>

        <div style={{ display: 'grid', gap: 22, gridTemplateColumns: orientation === 'portrait' ? 'repeat(auto-fill, minmax(220px, 1fr))' : 'repeat(auto-fill, minmax(360px, 1fr))' }}>
          {CARDS.map((c) => (
            <figure key={c.number} style={{ margin: 0, background: '#0c1124', border: '1px solid #26315a', borderRadius: 16, overflow: 'hidden', boxShadow: '0 16px 40px rgba(0,0,0,.45)' }}>
              <img src={orientation === 'portrait' ? c.portrait : c.landscape} alt={`Legend ${c.number} — ${c.name}`} loading="lazy"
                style={{ width: '100%', aspectRatio: orientation === 'portrait' ? '9 / 16' : '16 / 9', objectFit: 'cover', display: 'block' }} />
              <figcaption style={{ padding: '12px 14px 14px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                  <strong style={{ fontSize: 16 }}>{c.name}</strong>
                  <span style={{ color: '#e9c46a', fontWeight: 800, fontSize: 13 }}>#{c.number}</span>
                </div>
                <div style={{ color: '#9aa6c2', fontSize: 12, marginTop: 3 }}>{c.nation} · Ep.{c.episode} · {c.match}</div>
              </figcaption>
            </figure>
          ))}
        </div>

        <p style={{ color: '#7d87a3', fontSize: 13, marginTop: 32 }}>
          New Legend every matchday at <a href="https://worldcup26.world" style={{ color: '#e9c46a' }}>worldcup26.world</a> — free, just for fun, no prizes.
        </p>
      </div>
    </main>
  );
}
