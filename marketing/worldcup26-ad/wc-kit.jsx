// wc-kit.jsx — WorldCup26 ad shared primitives (loads after animations.jsx)
// Exports brand mark, flags, team rows, leaderboard rows, pick chips, count-up.

const SANS = '"Inter", system-ui, -apple-system, "Segoe UI", Roboto, sans-serif';

// Brand tokens (mirror colors_and_type.css so JS math can use them too)
const WC = {
  bg: '#f7faf9',
  surface: '#ffffff',
  surfaceStrong: '#f0f5f2',
  paperSoft: '#fbfdfc',
  text: '#0c1d1a',
  muted: '#5d6f69',
  border: '#d8e3df',
  borderStrong: '#b8c7c1',
  green: '#106b4f',
  greenSoft: '#e5f3ee',
  gold: '#c9942e',
  red: '#b84a45',
  shadow: '0 16px 45px rgba(17,43,36,0.08)',
  picks: [
    { accent: '#106b4f', bg: '#e5f3ee', border: '#9ac9b8', textc: '#0b513b' },
    { accent: '#2f5fbd', bg: '#e9effb', border: '#a9c0ec', textc: '#244c96' },
    { accent: '#b66b16', bg: '#fff0dd', border: '#e4bd86', textc: '#81500f' },
  ],
};

// ── number helpers ──────────────────────────────────────────────────────────
const fmtCoef = (n) => Number(n).toFixed(2);
const fmtPts = (n) => Number(n).toFixed(2);
const fmtMoney = (n) =>
  '$' + Math.round(n).toLocaleString('en-US');

// useCountUp — eased numeric tween driven by the global playhead.
function useCountUp(from, to, start, end, ease = Easing.easeOutCubic) {
  const t = useTime();
  return animate({ from, to, start, end, ease })(t);
}

// ── Trophy mark (Lucide trophy, white stroke) ────────────────────────────────
function Trophy({ size = 24, color = '#ffffff', stroke = 2 }) {
  const s = size / 24;
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
      stroke={color} strokeWidth={stroke} strokeLinecap="round" strokeLinejoin="round"
      style={{ display: 'block' }}>
      <path d="M10 14.66v1.626a2 2 0 0 1-.976 1.696A5 5 0 0 0 7 21.978" />
      <path d="M14 14.66v1.626a2 2 0 0 0 .976 1.696A5 5 0 0 1 17 21.978" />
      <path d="M18 9h1.5a1 1 0 0 0 0-5H18" />
      <path d="M4 22h16" />
      <path d="M6 9a6 6 0 0 0 12 0V3a1 1 0 0 0-1-1H7a1 1 0 0 0-1 1z" />
      <path d="M6 9H4.5a1 1 0 0 1 0-5H6" />
    </svg>
  );
}

// Brand lockup: trophy on green rounded square + WorldCup wordmark
function BrandMark({ size = 38, showWord = true, wordSize = 22, glow = true }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: size * 0.34 }}>
      <div style={{
        width: size, height: size,
        borderRadius: size * 0.21,
        background: WC.green,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        boxShadow: glow ? `0 ${size * 0.26}px ${size * 0.63}px rgba(16,107,79,.28)` : 'none',
        flexShrink: 0,
      }}>
        <Trophy size={size * 0.53} stroke={2} />
      </div>
      {showWord && (
        <span style={{
          fontFamily: SANS, fontWeight: 800, fontSize: wordSize,
          color: WC.text, letterSpacing: '-0.02em',
        }}>WorldCup</span>
      )}
    </div>
  );
}

// ── Flag tile ─────────────────────────────────────────────────────────────────
function FlagTile({ id, w = 40, h, radius = 4, ring = true }) {
  const height = h || Math.round(w * 0.68);
  return (
    <div style={{
      width: w, height: height, borderRadius: radius,
      overflow: 'hidden', flexShrink: 0,
      boxShadow: ring ? `inset 0 0 0 1px rgba(12,29,26,.10)` : 'none',
      background: WC.surfaceStrong,
    }}>
      <img src={window.wcFlag(id, 160)} alt="" draggable="false"
        style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
    </div>
  );
}

// ── Eyebrow / kicker ─────────────────────────────────────────────────────────
function Eyebrow({ children, color = WC.green, style }) {
  return (
    <div style={{
      fontFamily: SANS, fontWeight: 850, fontSize: 15,
      letterSpacing: '0.16em', textTransform: 'uppercase', color,
      ...style,
    }}>{children}</div>
  );
}

// ── Panel (white card) ────────────────────────────────────────────────────────
function Panel({ children, style, pad = 24 }) {
  return (
    <div style={{
      background: 'rgba(255,255,255,0.96)',
      border: `1px solid ${WC.border}`,
      borderRadius: 8,
      boxShadow: WC.shadow,
      padding: pad,
      ...style,
    }}>{children}</div>
  );
}

// ── Team row (picker style) ───────────────────────────────────────────────────
// slot: null | 0 | 1 | 2  → unselected or pick color
function TeamRow({ team, slot = null, selected = false, height = 76, big = false }) {
  const pick = slot != null ? WC.picks[slot] : null;
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 18,
      height, padding: `0 22px`,
      background: selected ? pick.bg : WC.paperSoft,
      borderRadius: 8,
      border: `1px solid ${selected ? pick.border : WC.border}`,
      borderLeft: selected ? `5px solid ${pick.accent}` : `1px solid ${WC.border}`,
      transition: 'none',
      boxSizing: 'border-box',
    }}>
      {/* selection dot */}
      <div style={{
        width: 26, height: 26, borderRadius: '50%', flexShrink: 0,
        border: `2px solid ${selected ? pick.accent : WC.borderStrong}`,
        background: selected ? pick.accent : 'transparent',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        {selected && (
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M20 6L9 17l-5-5" />
          </svg>
        )}
      </div>
      <FlagTile id={team.id} w={big ? 48 : 42} radius={5} />
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontFamily: SANS, fontWeight: 760, fontSize: big ? 26 : 22, color: WC.text, letterSpacing: '-0.01em' }}>
          {team.name}
        </div>
        <div style={{ fontFamily: SANS, fontWeight: 650, fontSize: 14, color: WC.muted, marginTop: 2 }}>
          Group {team.group} · {team.confederation}
        </div>
      </div>
      <div style={{ textAlign: 'right' }}>
        <div style={{ fontFamily: SANS, fontWeight: 800, fontSize: big ? 28 : 24, color: WC.green, letterSpacing: '-0.01em' }}>
          {fmtCoef(team.coefficient)}
        </div>
        <div style={{ fontFamily: SANS, fontWeight: 650, fontSize: 13, color: WC.muted, marginTop: 1 }}>
          {team.odds}
        </div>
      </div>
    </div>
  );
}

// ── Pick chip (leaderboard sub-row) ───────────────────────────────────────────
function PickChip({ slot, team, pts, coef, w }) {
  const pick = WC.picks[slot];
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 12,
      background: pick.bg,
      border: `1px solid ${pick.border}`,
      borderLeft: `4px solid ${pick.accent}`,
      borderRadius: 7,
      padding: '10px 14px',
      width: w, boxSizing: 'border-box',
    }}>
      <div style={{ width: 10, height: 10, borderRadius: '50%', background: pick.accent, flexShrink: 0 }} />
      <div style={{ fontFamily: SANS, fontWeight: 850, fontSize: 11, letterSpacing: '0.06em', color: pick.textc, textTransform: 'uppercase' }}>
        PICK {slot + 1}
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, flex: 1, minWidth: 0 }}>
        <FlagTile id={team.id} w={22} radius={3} />
        <span style={{ fontFamily: SANS, fontWeight: 760, fontSize: 16, color: WC.text }}>{team.name}</span>
      </div>
      <span style={{ fontFamily: SANS, fontWeight: 800, fontSize: 16, color: WC.text, fontVariantNumeric: 'tabular-nums' }}>{fmtPts(pts)}</span>
      <span style={{ fontFamily: SANS, fontWeight: 700, fontSize: 13, color: WC.muted }}>×{fmtCoef(coef)}</span>
    </div>
  );
}

// ── Leaderboard row ───────────────────────────────────────────────────────────
function RankBadge({ n, size = 34 }) {
  return (
    <div style={{
      width: size, height: size, borderRadius: 8, flexShrink: 0,
      background: WC.green, color: '#fff',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontFamily: SANS, fontWeight: 850, fontSize: size * 0.5,
    }}>{n}</div>
  );
}

Object.assign(window, {
  SANS, WC, fmtCoef, fmtPts, fmtMoney, useCountUp,
  Trophy, BrandMark, FlagTile, Eyebrow, Panel, TeamRow, PickChip, RankBadge,
});
