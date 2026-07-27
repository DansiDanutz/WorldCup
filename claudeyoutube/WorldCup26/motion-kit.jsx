// motion-kit.jsx — Remotion-style procedural motion graphics for the documentary.
// Everything is a pure function of useTime() (frame-exact, no wall-clock), so the
// renderer captures it deterministically. NO sentence text — labels ≤4 words,
// numbers, names and years only (hard rule #10).
/* global React, MV, useTime, Easing */

const MK = {
  bg: '#07090f', green: '#106b4f', gold: '#ffd24a',
  text: '#f4f6fa', muted: '#93a0b4', red: '#d21034',
};
const mkClamp = (v, a, b) => Math.max(a, Math.min(b, v));
const mkEase = p => 1 - Math.pow(1 - p, 3);
const mkBack = p => { const c = 1.70158; return 1 + (c + 1) * Math.pow(p - 1, 3) + c * Math.pow(p - 1, 2); };
// deterministic per-index pseudo-random
const mkRnd = i => ((i * 2654435761) % 1000) / 1000;
const mkRnd2 = i => ((i * 1597334677) % 1000) / 1000;

// ── AmbientStadium ───────────────────────────────────────────────────────────
// Always-on animated base layer: tinted stadium glow, drifting bokeh, sweeping
// light beams, floor haze. Guarantees no frame is ever black.
function AmbientStadium({ from = 0, dur = 9999, tint = MK.green, intensity = 1 }) {
  const t = useTime();
  if (t < from || t > from + dur) return null;
  const lt = t - from;
  const beams = [];
  for (let i = 0; i < 3; i++) {
    const ang = Math.sin(lt * 0.07 + i * 2.1) * 25 + (i - 1) * 30;
    beams.push(
      <div key={'b' + i} style={{
        position: 'absolute', left: `${25 + i * 25}%`, top: '-40%', width: 190, height: '150%',
        background: `linear-gradient(180deg, ${tint}26 0%, transparent 78%)`,
        transform: `rotate(${ang}deg)`, transformOrigin: 'top center', filter: 'blur(26px)',
      }} />
    );
  }
  const dots = [];
  for (let i = 0; i < 34; i++) {
    const r1 = mkRnd(i + 7), r2 = mkRnd2(i + 3);
    const x = (r1 * 1920 + Math.sin(lt * (0.14 + r2 * 0.3) + i) * 70) % 1920;
    const y = 1080 - ((lt * (7 + r2 * 16)) + r2 * 1080) % 1160 + 40;
    const o = (0.04 + 0.16 * r2) * intensity * (0.65 + 0.35 * Math.sin(lt * 1.1 + i));
    dots.push(<div key={'d' + i} style={{
      position: 'absolute', left: x, top: y, width: 3 + r2 * 6, height: 3 + r2 * 6,
      borderRadius: '50%', background: `rgba(255,210,74,${o.toFixed(3)})`, filter: 'blur(1px)',
    }} />);
  }
  return (
    <div style={{ position: 'absolute', inset: 0, overflow: 'hidden' }}>
      <div style={{ position: 'absolute', inset: 0, background: `
        radial-gradient(1500px 800px at 50% 120%, ${tint}30 0%, transparent 62%),
        radial-gradient(1200px 800px at ${50 + Math.sin(lt * 0.11) * 12}% -25%, #16223d55 0%, transparent 60%),
        linear-gradient(180deg,#0a0f1a 0%, #07090f 55%, #05070b 100%)` }} />
      {beams}
      {dots}
      <div style={{ position: 'absolute', left: 0, right: 0, bottom: 0, height: 300,
        background: `linear-gradient(0deg, ${tint}17 0%, transparent 100%)`, filter: 'blur(8px)' }} />
    </div>
  );
}

// ── KineticWords ─────────────────────────────────────────────────────────────
// Big word-by-word kinetic typography. words: [{w, at}] relative seconds, ≤4 words
// visible per beat. Words punch in with scale+blur, drift subtly, fade before end.
function KineticWords({ from, dur, words, size = 150, color = MK.text, accent = MK.gold }) {
  const t = useTime();
  if (t < from || t > from + dur) return null;
  const lt = t - from;
  const fadeOut = mkClamp((from + dur - t) / 0.6, 0, 1);
  return (
    <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center',
      justifyContent: 'center', flexWrap: 'wrap', gap: '0.35em', padding: '0 180px',
      opacity: fadeOut, zIndex: 8 }}>
      {words.map((it, i) => {
        const p = mkBack(mkClamp((lt - it.at) / 0.5, 0, 1));
        if (p <= 0) return null;
        const drift = Math.sin(lt * 0.8 + i * 1.7) * 4;
        return (
          <span key={i} style={{
            fontFamily: '"Inter",system-ui,sans-serif', fontWeight: 900,
            fontSize: it.big ? size * 1.5 : size, lineHeight: 1.04,
            color: it.gold ? accent : color, whiteSpace: 'pre',
            opacity: mkClamp(p, 0, 1),
            transform: `translateY(${(1 - mkClamp(p, 0, 1)) * 90 + drift}px) scale(${0.7 + 0.3 * mkClamp(p, 0, 1.12)})`,
            textShadow: it.gold ? `0 0 70px ${accent}55, 0 8px 30px rgba(0,0,0,.8)` : '0 8px 30px rgba(0,0,0,.8)',
            filter: `blur(${(1 - mkClamp(p, 0, 1)) * 8}px)`,
          }}>{it.w}</span>
        );
      })}
    </div>
  );
}

// ── BarChartGrow ─────────────────────────────────────────────────────────────
// Animated horizontal bar chart (e.g. winner's prize 1982→2026). Bars grow in
// sequence with counting values; the last bar lands with a gold flash.
function BarChartGrow({ from, dur, title, bars, unit = '$', suffix = 'M' }) {
  const t = useTime();
  if (t < from || t > from + dur) return null;
  const lt = t - from;
  const fadeOut = mkClamp((from + dur - t) / 0.7, 0, 1);
  const maxV = Math.max(...bars.map(b => b.v));
  const step = Math.min(1.5, (dur - 3) / bars.length);
  return (
    <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center', opacity: fadeOut, zIndex: 8 }}>
      <div style={{ fontFamily: '"Inter",sans-serif', fontWeight: 800, fontSize: 46,
        letterSpacing: '.42em', color: MK.muted, marginBottom: 60,
        opacity: mkEase(mkClamp(lt / 0.7, 0, 1)) }}>{title}</div>
      {bars.map((b, i) => {
        const p = mkEase(mkClamp((lt - 0.8 - i * step) / 1.1, 0, 1));
        const val = Math.round(b.v * p);
        const last = i === bars.length - 1;
        const flash = last && p >= 1 ? 0.5 + 0.5 * Math.sin(lt * 3) : 0;
        return (
          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 34, width: 1240, marginBottom: 26, opacity: p > 0 ? 1 : 0 }}>
            <span style={{ fontFamily: '"Inter",sans-serif', fontWeight: 800, fontSize: 44, color: MK.text, width: 120 }}>{b.label}</span>
            <div style={{ flex: 1, height: 46, borderRadius: 8, background: 'rgba(255,255,255,.07)', overflow: 'hidden' }}>
              <div style={{ width: `${(b.v / maxV) * 100 * p}%`, height: '100%', borderRadius: 8,
                background: last ? `linear-gradient(90deg, ${MK.gold}, #ffe9a3)` : `linear-gradient(90deg, ${MK.green}, #1ea97a)`,
                boxShadow: last ? `0 0 ${30 + flash * 40}px ${MK.gold}66` : 'none' }} />
            </div>
            <span style={{ fontFamily: '"Inter",sans-serif', fontWeight: 900, fontSize: 52,
              color: last ? MK.gold : MK.text, width: 220, textAlign: 'right' }}>{unit}{val}{suffix}</span>
          </div>
        );
      })}
    </div>
  );
}

// ── FlagWall ─────────────────────────────────────────────────────────────────
// Mosaic of animated CSS flag tiles (solid tri-color blocks, no emblems) that
// flip in one-by-one — the "48 nations" moment. colors: array of [c1,c2,c3].
function FlagWall({ from, dur, colors }) {
  const t = useTime();
  if (t < from || t > from + dur) return null;
  const lt = t - from;
  const fadeOut = mkClamp((from + dur - t) / 0.6, 0, 1);
  const cols = 8, w = 168, h = 106, gap = 18;
  return (
    <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: fadeOut, zIndex: 8 }}>
      <div style={{ display: 'flex', flexWrap: 'wrap', width: cols * (w + gap), gap }}>
        {colors.map((c, i) => {
          const p = mkBack(mkClamp((lt - 0.3 - i * 0.09) / 0.5, 0, 1));
          if (p <= 0) return <div key={i} style={{ width: w, height: h }} />;
          const sway = Math.sin(lt * 1.4 + i) * 2.4;
          return (
            <div key={i} style={{ width: w, height: h, display: 'flex', borderRadius: 8, overflow: 'hidden',
              opacity: mkClamp(p, 0, 1), boxShadow: '0 10px 26px rgba(0,0,0,.55)',
              transform: `perspective(700px) rotateY(${(1 - mkClamp(p, 0, 1)) * 80 + sway}deg) scale(${0.7 + 0.3 * mkClamp(p, 0, 1)})` }}>
              {c.map((col, k) => <div key={k} style={{ flex: 1, background: col }} />)}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ── TrophyGlow ───────────────────────────────────────────────────────────────
// Original abstract golden trophy silhouette (pure CSS shapes — NOT the FIFA
// trophy) rising with light rays. Used for champions moments.
function TrophyGlow({ from, dur, label }) {
  const t = useTime();
  if (t < from || t > from + dur) return null;
  const lt = t - from;
  const p = mkEase(mkClamp(lt / 1.6, 0, 1));
  const fadeOut = mkClamp((from + dur - t) / 0.7, 0, 1);
  const pulse = 1 + 0.02 * Math.sin(lt * 2.2);
  const rays = [];
  for (let i = 0; i < 10; i++) {
    const a = i * 36 + lt * 6;
    rays.push(<div key={i} style={{ position: 'absolute', left: '50%', top: '46%', width: 5, height: 420,
      background: `linear-gradient(180deg, ${MK.gold}30, transparent)`, transformOrigin: 'top center',
      transform: `rotate(${a}deg)`, filter: 'blur(3px)', opacity: p * 0.7 }} />);
  }
  return (
    <div style={{ position: 'absolute', inset: 0, opacity: fadeOut, zIndex: 8 }}>
      {rays}
      <div style={{ position: 'absolute', left: '50%', top: '46%', transform: `translate(-50%,-50%) translateY(${(1 - p) * 160}px) scale(${p * pulse})`, opacity: p }}>
        <div style={{ width: 190, height: 210, margin: '0 auto', borderRadius: '95px 95px 22px 22px',
          background: `radial-gradient(circle at 38% 28%, #ffe9a3, ${MK.gold} 55%, #b78a1e)`,
          boxShadow: `0 0 110px ${MK.gold}77` }} />
        <div style={{ width: 56, height: 62, margin: '-8px auto 0', background: `linear-gradient(180deg, ${MK.gold}, #a97f19)` }} />
        <div style={{ width: 170, height: 34, margin: '0 auto', borderRadius: 10, background: `linear-gradient(180deg, #caa22e, #7c5d10)` }} />
      </div>
      {label ? <div style={{ position: 'absolute', left: 0, right: 0, top: '74%', textAlign: 'center',
        fontFamily: '"Inter",sans-serif', fontWeight: 800, fontSize: 46, letterSpacing: '.4em',
        color: MK.gold, opacity: mkEase(mkClamp((lt - 1.4) / 0.8, 0, 1)) }}>{label}</div> : null}
    </div>
  );
}

// ── ScoreTicker ──────────────────────────────────────────────────────────────
// Animated score/stat plate (e.g. "SPAIN 1 — 0 ARGENTINA · 106'") with a punch
// on the number. Names + numbers only.
function ScoreTicker({ from, dur, left, right, score, note }) {
  const t = useTime();
  if (t < from || t > from + dur) return null;
  const lt = t - from;
  const p = mkBack(mkClamp(lt / 0.7, 0, 1));
  const fadeOut = mkClamp((from + dur - t) / 0.6, 0, 1);
  return (
    <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: fadeOut, zIndex: 8 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 50, padding: '44px 90px', borderRadius: 26,
        background: 'rgba(6,9,15,.82)', border: `1px solid ${MK.gold}44`, boxShadow: `0 30px 90px rgba(0,0,0,.6)`,
        transform: `scale(${0.8 + 0.2 * mkClamp(p, 0, 1.1)}) translateY(${(1 - mkClamp(p, 0, 1)) * 60}px)`, opacity: mkClamp(p, 0, 1) }}>
        <span style={{ fontFamily: '"Inter",sans-serif', fontWeight: 900, fontSize: 78, color: MK.text }}>{left}</span>
        <span style={{ fontFamily: '"Inter",sans-serif', fontWeight: 900, fontSize: 110, color: MK.gold,
          textShadow: `0 0 60px ${MK.gold}55`, transform: `scale(${1 + 0.06 * Math.sin(lt * 2.6)})` }}>{score}</span>
        <span style={{ fontFamily: '"Inter",sans-serif', fontWeight: 900, fontSize: 78, color: MK.text }}>{right}</span>
        {note ? <span style={{ fontFamily: '"Inter",sans-serif', fontWeight: 800, fontSize: 44, color: MK.muted, marginLeft: 26 }}>{note}</span> : null}
      </div>
    </div>
  );
}

// ── PitchLines ───────────────────────────────────────────────────────────────
// Slow animated soccer-pitch line drawing (center circle + halfway + penalty
// boxes) glowing in — an elegant story-neutral filler visual.
function PitchLines({ from, dur, tint = MK.green }) {
  const t = useTime();
  if (t < from || t > from + dur) return null;
  const lt = t - from;
  const p = mkEase(mkClamp(lt / 2.2, 0, 1));
  const fadeOut = mkClamp((from + dur - t) / 0.8, 0, 1);
  const stroke = `rgba(244,246,250,${0.5 * p * fadeOut})`;
  const dash = 3000 - 3000 * p;
  return (
    <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 7, opacity: fadeOut }}>
      <svg width="1520" height="900" viewBox="0 0 1520 900" style={{ filter: `drop-shadow(0 0 18px ${tint})`, transform: `perspective(1100px) rotateX(38deg) translateY(${(1 - p) * 60}px)` }}>
        <rect x="30" y="30" width="1460" height="840" rx="8" fill="none" stroke={stroke} strokeWidth="5" strokeDasharray="3000" strokeDashoffset={dash} />
        <line x1="760" y1="30" x2="760" y2="870" stroke={stroke} strokeWidth="5" />
        <circle cx="760" cy="450" r="150" fill="none" stroke={stroke} strokeWidth="5" strokeDasharray="945" strokeDashoffset={945 - 945 * p} />
        <rect x="30" y="240" width="250" height="420" fill="none" stroke={stroke} strokeWidth="5" />
        <rect x="1240" y="240" width="250" height="420" fill="none" stroke={stroke} strokeWidth="5" />
      </svg>
    </div>
  );
}

// exported globals for match-scenes.jsx
window.MotionKit = { AmbientStadium, KineticWords, BarChartGrow, FlagWall, TrophyGlow, ScoreTicker, PitchLines, MK };
