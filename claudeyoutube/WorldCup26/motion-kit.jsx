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

// ═══ v3 ADDITIONS — identity-safe visuals ════════════════════════════════════
// No human likenesses. Named people appear as NAME PLATES (honest) and their
// achievement as data/typography. Nothing on screen ever claims to be a person.

// NamePlate — the honest substitute for a player clip: name + record + year.
function NamePlate({ from, dur, name, stat, meta, accent = MK.gold }) {
  const t = useTime(); if (t < from || t > from + dur) return null;
  const lt = t - from, out = mkClamp((from + dur - t) / 0.7, 0, 1);
  const p = mkEase(mkClamp(lt / 0.8, 0, 1));
  const sp = mkBack(mkClamp((lt - 0.5) / 0.8, 0, 1));
  const chars = [...name];
  return (
    <div style={{ position:'absolute', inset:0, display:'flex', flexDirection:'column',
      alignItems:'center', justifyContent:'center', opacity:out, zIndex:9 }}>
      <div style={{ width: 3 + p*520, height:4, background:`linear-gradient(90deg,transparent,${accent},transparent)`, marginBottom:44 }} />
      <div style={{ fontFamily:'"Inter",sans-serif', fontWeight:900, fontSize: name.length>16?104:150,
        lineHeight:1, color:MK.text, letterSpacing:'-0.01em', display:'flex', whiteSpace:'pre' }}>
        {chars.map((ch,i)=>{const cp=mkBack(mkClamp((lt-0.25-i*0.045)/0.5,0,1));
          return <span key={i} style={{ display:'inline-block', opacity:mkClamp(cp,0,1),
            transform:`translateY(${(1-mkClamp(cp,0,1))*70}px) rotateX(${(1-mkClamp(cp,0,1))*70}deg)`,
            textShadow:'0 10px 40px rgba(0,0,0,.85)' }}>{ch===' '?' ':ch}</span>;})}
      </div>
      {stat ? <div style={{ marginTop:34, fontFamily:'"Inter",sans-serif', fontWeight:900,
        fontSize:190, lineHeight:1, color:accent, opacity:mkClamp(sp,0,1),
        transform:`scale(${0.6+0.4*mkClamp(sp,0,1.15)})`, textShadow:`0 0 90px ${accent}66` }}>{stat}</div> : null}
      {meta ? <div style={{ marginTop:28, fontFamily:'"Inter",sans-serif', fontWeight:800, fontSize:44,
        letterSpacing:'.4em', color:MK.muted, opacity:mkEase(mkClamp((lt-1.2)/0.8,0,1)) }}>{meta}</div> : null}
      <div style={{ width: 3 + p*520, height:4, background:`linear-gradient(90deg,transparent,${accent},transparent)`, marginTop:44 }} />
    </div>
  );
}

// ImpactText — intro-grade slam with expanding shockwave rings.
function ImpactText({ from, dur, text, size = 210, accent = MK.gold, rings = true }) {
  const t = useTime(); if (t < from || t > from + dur) return null;
  const lt = t - from, out = mkClamp((from + dur - t) / 0.5, 0, 1);
  const p = mkClamp(lt / 0.28, 0, 1);
  const settle = mkEase(mkClamp((lt - 0.28) / 0.5, 0, 1));
  const scale = p < 1 ? 2.6 - 1.6 * mkEase(p) : 1 + 0.012 * Math.sin(lt * 3);
  const r = [];
  if (rings) for (let i = 0; i < 3; i++) {
    const rp = mkClamp((lt - 0.2 - i * 0.12) / 1.1, 0, 1);
    if (rp > 0 && rp < 1) r.push(<div key={i} style={{ position:'absolute', left:'50%', top:'50%',
      width: rp*1900, height: rp*1900, marginLeft:-(rp*950), marginTop:-(rp*950), borderRadius:'50%',
      border:`3px solid ${accent}`, opacity:(1-rp)*0.5 }} />);
  }
  return (
    <div style={{ position:'absolute', inset:0, display:'flex', alignItems:'center',
      justifyContent:'center', opacity:out, zIndex:10 }}>
      {r}
      <div style={{ fontFamily:'"Inter",sans-serif', fontWeight:900, fontSize:size, lineHeight:1,
        color:accent, transform:`scale(${scale})`, opacity:mkClamp(p*1.2,0,1),
        filter:`blur(${(1-p)*14}px)`, textShadow:`0 0 ${60+settle*40}px ${accent}77, 0 12px 50px rgba(0,0,0,.9)`,
        letterSpacing:'-0.02em', whiteSpace:'pre' }}>{text}</div>
    </div>
  );
}

// ClockTick — extra-time clock ticking up to a target minute, then a flash.
function ClockTick({ from, dur, to = 106, label = 'EXTRA TIME' }) {
  const t = useTime(); if (t < from || t > from + dur) return null;
  const lt = t - from, out = mkClamp((from + dur - t) / 0.6, 0, 1);
  const p = mkEase(mkClamp(lt / (dur * 0.6), 0, 1));
  const val = Math.round(90 + (to - 90) * p);
  const hit = p >= 1;
  const pulse = hit ? 1 + 0.05 * Math.sin(lt * 8) : 1 + 0.015 * Math.sin(lt * 10);
  return (
    <div style={{ position:'absolute', inset:0, display:'flex', flexDirection:'column',
      alignItems:'center', justifyContent:'center', opacity:out, zIndex:9 }}>
      <div style={{ fontFamily:'"Inter",sans-serif', fontWeight:800, fontSize:46, letterSpacing:'.5em',
        color: hit ? MK.gold : MK.muted, marginBottom:40 }}>{label}</div>
      <div style={{ position:'relative', width:420, height:420, display:'flex', alignItems:'center', justifyContent:'center' }}>
        <svg width="420" height="420" style={{ position:'absolute', inset:0 }}>
          <circle cx="210" cy="210" r="190" fill="none" stroke="rgba(255,255,255,.1)" strokeWidth="8" />
          <circle cx="210" cy="210" r="190" fill="none" stroke={hit?MK.gold:'#fff'} strokeWidth="8"
            strokeDasharray={2*Math.PI*190} strokeDashoffset={2*Math.PI*190*(1-p)}
            transform="rotate(-90 210 210)" style={{ filter:`drop-shadow(0 0 ${hit?26:12}px ${hit?MK.gold:'#fff'})` }} />
        </svg>
        <div style={{ fontFamily:'"Inter",sans-serif', fontWeight:900, fontSize:170,
          color: hit?MK.gold:MK.text, transform:`scale(${pulse})`,
          textShadow:hit?`0 0 80px ${MK.gold}88`:'none' }}>{val}'</div>
      </div>
    </div>
  );
}

// BallToNet — abstract ball arcing into a net. No players, pure geometry.
function BallToNet({ from, dur, accent = MK.gold }) {
  const t = useTime(); if (t < from || t > from + dur) return null;
  const lt = t - from, out = mkClamp((from + dur - t) / 0.6, 0, 1);
  const p = mkEase(mkClamp(lt / 1.6, 0, 1));
  const x = 200 + p * 1200, y = 780 - Math.sin(p * Math.PI) * 420;
  const inNet = p >= 1;
  const trail = [];
  for (let i = 1; i <= 12; i++) {
    const tp = mkClamp(p - i * 0.035, 0, 1);
    if (tp <= 0) continue;
    trail.push(<circle key={i} cx={200 + tp * 1200} cy={780 - Math.sin(tp * Math.PI) * 420}
      r={26 - i * 1.6} fill={accent} opacity={(1 - i / 12) * 0.25} />);
  }
  return (
    <div style={{ position:'absolute', inset:0, opacity:out, zIndex:9 }}>
      <svg width="1920" height="1080" style={{ position:'absolute', inset:0 }}>
        <g stroke="rgba(244,246,250,.55)" strokeWidth="5" fill="none"
           style={{ filter:`drop-shadow(0 0 ${inNet?24:10}px ${inNet?accent:'#5f7'})` }}>
          <rect x="1290" y="420" width="440" height="330" rx="4" />
          {[...Array(9)].map((_,i)=><line key={'v'+i} x1={1290+i*55} y1="420" x2={1290+i*55} y2="750" strokeWidth="1.6" opacity=".55" />)}
          {[...Array(7)].map((_,i)=><line key={'h'+i} x1="1290" y1={420+i*55} x2="1730" y2={420+i*55} strokeWidth="1.6" opacity=".55" />)}
        </g>
        {trail}
        <circle cx={x} cy={y} r="28" fill="#fff" style={{ filter:`drop-shadow(0 0 26px ${accent})` }} />
      </svg>
      {inNet ? <div style={{ position:'absolute', left:'66%', top:'40%', width:520, height:520,
        marginLeft:-260, marginTop:-260, borderRadius:'50%',
        background:`radial-gradient(circle, ${accent}44 0%, transparent 68%)` }} /> : null}
    </div>
  );
}

// YearTimeline — horizontal timeline with year markers lighting up in sequence.
function YearTimeline({ from, dur, years, label }) {
  const t = useTime(); if (t < from || t > from + dur) return null;
  const lt = t - from, out = mkClamp((from + dur - t) / 0.7, 0, 1);
  const step = Math.min(1.2, (dur - 2) / Math.max(1, years.length));
  const lineP = mkEase(mkClamp(lt / 1.0, 0, 1));
  return (
    <div style={{ position:'absolute', inset:0, display:'flex', flexDirection:'column',
      alignItems:'center', justifyContent:'center', opacity:out, zIndex:9 }}>
      {label ? <div style={{ fontFamily:'"Inter",sans-serif', fontWeight:800, fontSize:44,
        letterSpacing:'.44em', color:MK.muted, marginBottom:80 }}>{label}</div> : null}
      <div style={{ position:'relative', width:1480, height:200 }}>
        <div style={{ position:'absolute', left:0, top:96, width:`${lineP*100}%`, height:4,
          background:`linear-gradient(90deg, ${MK.green}, ${MK.gold})` }} />
        {years.map((y,i)=>{
          const p = mkBack(mkClamp((lt - 0.9 - i*step)/0.5,0,1));
          if (p<=0) return null;
          const left = (i/(years.length-1))*1440;
          return (
            <div key={i} style={{ position:'absolute', left, top:0, transform:'translateX(-50%)', opacity:mkClamp(p,0,1) }}>
              <div style={{ fontFamily:'"Inter",sans-serif', fontWeight:900, fontSize:58, color:MK.text,
                transform:`translateY(${(1-mkClamp(p,0,1))*30}px)`, textAlign:'center' }}>{y.v}</div>
              <div style={{ width:22, height:22, borderRadius:'50%', background:MK.gold, margin:'26px auto 0',
                boxShadow:`0 0 ${26*mkClamp(p,0,1)}px ${MK.gold}`, transform:`scale(${mkClamp(p,0,1.2)})` }} />
              <div style={{ marginTop:22, fontFamily:'"Inter",sans-serif', fontWeight:800, fontSize:34,
                letterSpacing:'.16em', color:MK.muted, textAlign:'center', whiteSpace:'nowrap' }}>{y.label||''}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// StadiumBowl — abstract stadium filling with crowd dots (attendance beats).
function StadiumBowl({ from, dur, fillTo = 1, label }) {
  const t = useTime(); if (t < from || t > from + dur) return null;
  const lt = t - from, out = mkClamp((from + dur - t) / 0.7, 0, 1);
  const p = mkEase(mkClamp(lt / 2.4, 0, 1)) * fillTo;
  const dots = [];
  const N = 460;
  for (let i = 0; i < N; i++) {
    if (i / N > p) continue;
    const r1 = mkRnd(i + 11), r2 = mkRnd2(i + 5);
    const ang = r1 * Math.PI * 2;
    const rad = 300 + r2 * 300;
    const x = 960 + Math.cos(ang) * rad * 1.5;
    const y = 540 + Math.sin(ang) * rad * 0.72;
    const tw = 0.45 + 0.55 * Math.abs(Math.sin(lt * 2 + i));
    dots.push(<div key={i} style={{ position:'absolute', left:x, top:y, width:9, height:9, borderRadius:'50%',
      background: i%7===0 ? MK.gold : '#cfe0ff', opacity: tw*0.85 }} />);
  }
  return (
    <div style={{ position:'absolute', inset:0, opacity:out, zIndex:9, overflow:'hidden' }}>
      <div style={{ position:'absolute', left:'50%', top:'50%', width:1500, height:760, marginLeft:-750, marginTop:-380,
        borderRadius:'50%', border:`3px solid rgba(255,255,255,.16)`,
        background:`radial-gradient(ellipse at center, ${MK.green}22 0%, transparent 66%)` }} />
      <div style={{ position:'absolute', left:'50%', top:'50%', width:760, height:400, marginLeft:-380, marginTop:-200,
        borderRadius:12, border:'3px solid rgba(255,255,255,.28)' }} />
      {dots}
      {label ? <div style={{ position:'absolute', left:0, right:0, top:'80%', textAlign:'center',
        fontFamily:'"Inter",sans-serif', fontWeight:800, fontSize:48, letterSpacing:'.38em', color:MK.gold }}>{label}</div> : null}
    </div>
  );
}

Object.assign(window.MotionKit, { NamePlate, ImpactText, ClockTick, BallToNet, YearTimeline, StadiumBowl });

// ═══ v4 — REAL LEGEND CARDS (our own artwork; each card IS the person named) ══

// CardShowcase — one hero legend card, floating with parallax glow + shine sweep.
function CardShowcase({ from, dur, src, name, meta, accent = MK.gold }) {
  const t = useTime(); if (t < from || t > from + dur) return null;
  const lt = t - from, out = mkClamp((from + dur - t) / 0.7, 0, 1);
  const p = mkBack(mkClamp(lt / 0.9, 0, 1));
  const float = Math.sin(lt * 0.9) * 12, tilt = Math.sin(lt * 0.55) * 6;
  const shine = -30 + mkClamp((lt - 0.9) / 2.2, 0, 1) * 170;
  return (
    <div style={{ position:'absolute', inset:0, display:'flex', alignItems:'center',
      justifyContent:'center', gap:90, opacity:out, zIndex:9 }}>
      <div style={{ position:'relative', width:560, height:750, flex:'none',
        transform:`perspective(1400px) rotateY(${tilt}deg) translateY(${float}px) scale(${0.72+0.28*mkClamp(p,0,1.1)})`,
        opacity:mkClamp(p,0,1) }}>
        <div style={{ position:'absolute', inset:-40, borderRadius:40,
          background:`radial-gradient(ellipse at center, ${accent}3a 0%, transparent 68%)`, filter:'blur(24px)' }} />
        <img src={src} style={{ width:'100%', height:'100%', objectFit:'cover', borderRadius:26,
          border:`3px solid ${accent}88`, boxShadow:`0 40px 110px rgba(0,0,0,.8), 0 0 70px ${accent}33` }} />
        <div style={{ position:'absolute', inset:0, borderRadius:26, pointerEvents:'none', overflow:'hidden',
          background:`linear-gradient(115deg, transparent ${shine-10}%, rgba(255,255,255,.28) ${shine}%, transparent ${shine+10}%)` }} />
      </div>
      {name ? (
        <div style={{ maxWidth:820 }}>
          <div style={{ fontFamily:'"Inter",sans-serif', fontWeight:900, fontSize: name.length>15?92:118,
            lineHeight:1.02, color:MK.text, opacity:mkEase(mkClamp((lt-0.4)/0.8,0,1)),
            transform:`translateX(${(1-mkEase(mkClamp((lt-0.4)/0.8,0,1)))*70}px)`,
            textShadow:'0 10px 40px rgba(0,0,0,.8)' }}>{name}</div>
          {meta ? <div style={{ marginTop:26, fontFamily:'"Inter",sans-serif', fontWeight:800, fontSize:44,
            letterSpacing:'.3em', color:accent, opacity:mkEase(mkClamp((lt-1.0)/0.8,0,1)) }}>{meta}</div> : null}
          <div style={{ marginTop:34, width: mkEase(mkClamp((lt-1.3)/0.9,0,1))*420, height:4,
            background:`linear-gradient(90deg, ${accent}, transparent)` }} />
        </div>
      ) : null}
    </div>
  );
}

// CardWall — the collection: dozens of real cards drifting in a parallax grid.
// This is the app's whole promise on screen.
function CardWall({ from, dur, srcs, label, columns = 7 }) {
  const t = useTime(); if (t < from || t > from + dur) return null;
  const lt = t - from, out = mkClamp((from + dur - t) / 0.8, 0, 1);
  const W = 250, H = 336, GAP = 22;
  const rows = Math.ceil(srcs.length / columns);
  const tiles = [];
  srcs.forEach((s, i) => {
    const col = i % columns, row = Math.floor(i / columns);
    const appear = mkBack(mkClamp((lt - 0.15 - (col * 0.05 + row * 0.12)) / 0.55, 0, 1));
    if (appear <= 0) return;
    const drift = Math.sin(lt * 0.5 + col * 0.8 + row) * 9;
    const depth = 0.86 + ((i * 37) % 5) * 0.035;
    tiles.push(
      <div key={i} style={{ position:'absolute', left: col*(W+GAP), top: row*(H+GAP) + drift,
        width:W, height:H, opacity: mkClamp(appear,0,1) * (0.62 + 0.38*depth),
        transform:`scale(${(0.6+0.4*mkClamp(appear,0,1))*depth}) rotate(${((i%7)-3)*0.7}deg)` }}>
        <img src={s} style={{ width:'100%', height:'100%', objectFit:'cover', borderRadius:14,
          border:'2px solid rgba(255,210,74,.4)', boxShadow:'0 18px 44px rgba(0,0,0,.62)' }} />
      </div>
    );
  });
  const scroll = -lt * 16;
  return (
    <div style={{ position:'absolute', inset:0, overflow:'hidden', opacity:out, zIndex:9 }}>
      <div style={{ position:'absolute', left:'50%', top:'50%',
        width: columns*(W+GAP), height: rows*(H+GAP),
        marginLeft: -(columns*(W+GAP))/2, marginTop: -(rows*(H+GAP))/2 + scroll,
        transform:'perspective(1800px) rotateX(9deg)' }}>{tiles}</div>
      <div style={{ position:'absolute', inset:0, pointerEvents:'none',
        background:'linear-gradient(180deg, #07090f 0%, transparent 22%, transparent 74%, #07090f 100%)' }} />
      {label ? <div style={{ position:'absolute', left:0, right:0, bottom:118, textAlign:'center',
        fontFamily:'"Inter",sans-serif', fontWeight:900, fontSize:78, color:MK.gold,
        textShadow:`0 0 60px ${MK.gold}66, 0 8px 30px rgba(0,0,0,.9)`,
        opacity: mkEase(mkClamp((lt-0.8)/1.0,0,1)) }}>{label}</div> : null}
    </div>
  );
}

// PhoneMock — the app in a phone: header, live cards feed, news rows, CTA.
// Used for the closing advert beat.
function PhoneMock({ from, dur, srcs, url = 'worldcup26.world', tag = 'FREE · JUST FOR FUN · NO PRIZES' }) {
  const t = useTime(); if (t < from || t > from + dur) return null;
  const lt = t - from, out = mkClamp((from + dur - t) / 0.8, 0, 1);
  const p = mkBack(mkClamp(lt / 1.1, 0, 1));
  const feed = -((lt * 46) % 900);
  const PW = 430, PH = 840;
  const cards = [];
  for (let i = 0; i < 10; i++) {
    const s = srcs[i % srcs.length];
    cards.push(
      <div key={i} style={{ display:'flex', gap:16, alignItems:'center', padding:'12px 0' }}>
        <img src={s} style={{ width:104, height:140, objectFit:'cover', borderRadius:10,
          border:'2px solid rgba(255,210,74,.45)', flex:'none' }} />
        <div style={{ flex:1 }}>
          <div style={{ height:15, width:'82%', borderRadius:8, background:'rgba(255,255,255,.55)' }} />
          <div style={{ height:11, width:'58%', borderRadius:8, background:'rgba(255,255,255,.26)', marginTop:11 }} />
          <div style={{ height:11, width:'40%', borderRadius:8, background:MK.gold, opacity:.65, marginTop:11 }} />
        </div>
      </div>
    );
  }
  return (
    <div style={{ position:'absolute', inset:0, display:'flex', alignItems:'center',
      justifyContent:'center', gap:70, padding:'0 90px', opacity:out, zIndex:10 }}>
      <div style={{ position:'relative', width:PW, height:PH, flex:'none',
        transform:`perspective(1700px) rotateY(-12deg) rotateX(3deg) translateY(${Math.sin(lt*0.8)*10}px) scale(${0.7+0.3*mkClamp(p,0,1.05)})`,
        opacity:mkClamp(p,0,1) }}>
        <div style={{ position:'absolute', inset:-46, borderRadius:80,
          background:`radial-gradient(ellipse at center, ${MK.green}55 0%, transparent 70%)`, filter:'blur(30px)' }} />
        <div style={{ position:'absolute', inset:0, borderRadius:56, background:'#0b0f16',
          border:'12px solid #1c222e', boxShadow:'0 50px 130px rgba(0,0,0,.85)', overflow:'hidden' }}>
          <div style={{ position:'absolute', left:'50%', top:14, width:150, height:26, marginLeft:-75,
            borderRadius:16, background:'#1c222e', zIndex:3 }} />
          <div style={{ position:'absolute', left:0, right:0, top:0, height:132, zIndex:2,
            background:`linear-gradient(180deg, ${MK.green} 0%, #0b0f16 100%)`,
            display:'flex', alignItems:'flex-end', justifyContent:'center', paddingBottom:14 }}>
            <span style={{ fontFamily:'"Inter",sans-serif', fontWeight:900, fontSize:30,
              letterSpacing:'.12em', color:'#fff' }}>{url}</span>
          </div>
          <div style={{ position:'absolute', left:20, right:20, top:132, bottom:96, overflow:'hidden' }}>
            <div style={{ transform:`translateY(${feed}px)` }}>{cards}{cards}</div>
          </div>
          <div style={{ position:'absolute', left:20, right:20, bottom:22, height:62, borderRadius:16,
            background:`linear-gradient(90deg, ${MK.gold}, #ffe6a1)`, display:'flex', alignItems:'center',
            justifyContent:'center', boxShadow:`0 0 44px ${MK.gold}66` }}>
            <span style={{ fontFamily:'"Inter",sans-serif', fontWeight:900, fontSize:26,
              letterSpacing:'.16em', color:'#1a1405' }}>PICK 3 · FREE</span>
          </div>
        </div>
      </div>
      <div style={{ maxWidth:840, flex:'none' }}>
        <div style={{ fontFamily:'"Inter",sans-serif', fontWeight:900, fontSize:86, lineHeight:1.03,
          color:MK.gold, opacity:mkEase(mkClamp((lt-0.5)/0.9,0,1)),
          transform:`translateX(${(1-mkEase(mkClamp((lt-0.5)/0.9,0,1)))*80}px)`,
          textShadow:`0 0 60px ${MK.gold}55` }}>{url}</div>
        <div style={{ marginTop:30, fontFamily:'"Inter",sans-serif', fontWeight:800, fontSize:46,
          letterSpacing:'.16em', color:MK.text, opacity:mkEase(mkClamp((lt-1.1)/0.9,0,1)), whiteSpace:'nowrap' }}>COLLECT THE LEGENDS</div>
        <div style={{ marginTop:22, fontFamily:'"Inter",sans-serif', fontWeight:800, fontSize:29,
          letterSpacing:'.14em', color:MK.muted, whiteSpace:'nowrap', opacity:mkEase(mkClamp((lt-1.5)/0.9,0,1)) }}>{tag}</div>
      </div>
    </div>
  );
}

// TrophyCup — replaces the old dome shape (which read as a lamp): a proper
// two-handled cup on a plinth, drawn as SVG, rising with light rays.
function TrophyCup({ from, dur, label }) {
  const t = useTime(); if (t < from || t > from + dur) return null;
  const lt = t - from, out = mkClamp((from + dur - t) / 0.7, 0, 1);
  const p = mkEase(mkClamp(lt / 1.5, 0, 1));
  const pulse = 1 + 0.02 * Math.sin(lt * 2.1);
  const rays = [];
  for (let i = 0; i < 12; i++) rays.push(
    <div key={i} style={{ position:'absolute', left:'50%', top:'44%', width:4, height:460,
      background:`linear-gradient(180deg, ${MK.gold}2e, transparent)`, transformOrigin:'top center',
      transform:`rotate(${i*30 + lt*5}deg)`, filter:'blur(3px)', opacity:p*0.65 }} />);
  return (
    <div style={{ position:'absolute', inset:0, opacity:out, zIndex:9 }}>
      {rays}
      <div style={{ position:'absolute', left:'50%', top:'46%', transform:
        `translate(-50%,-50%) translateY(${(1-p)*150}px) scale(${p*pulse})`, opacity:p }}>
        <svg width="330" height="420" viewBox="0 0 330 420">
          <defs>
            <linearGradient id="gld" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#ffe9a3" /><stop offset="45%" stopColor={MK.gold} /><stop offset="100%" stopColor="#a97f19" />
            </linearGradient>
          </defs>
          <path d="M95 40 h140 v92 a70 70 0 0 1 -140 0 z" fill="url(#gld)" />
          <path d="M95 56 q-56 0 -56 46 q0 44 56 52" fill="none" stroke="url(#gld)" strokeWidth="17" strokeLinecap="round" />
          <path d="M235 56 q56 0 56 46 q0 44 -56 52" fill="none" stroke="url(#gld)" strokeWidth="17" strokeLinecap="round" />
          <rect x="150" y="222" width="30" height="70" fill="url(#gld)" />
          <rect x="110" y="292" width="110" height="26" rx="7" fill="url(#gld)" />
          <rect x="88" y="318" width="154" height="40" rx="9" fill="#8c6a14" />
        </svg>
      </div>
      {label ? <div style={{ position:'absolute', left:0, right:0, top:'76%', textAlign:'center',
        fontFamily:'"Inter",sans-serif', fontWeight:800, fontSize:46, letterSpacing:'.4em', color:MK.gold,
        opacity:mkEase(mkClamp((lt-1.3)/0.8,0,1)) }}>{label}</div> : null}
    </div>
  );
}

Object.assign(window.MotionKit, { CardShowcase, CardWall, PhoneMock, TrophyCup });

// CardDrift — background layer of real legend cards flying through frame.
// Layered UNDER typography so no beat is ever a flat text slate.
function CardDrift({ from, dur, srcs, count = 6, opacity = 0.5 }) {
  const t = useTime(); if (t < from || t > from + dur) return null;
  const lt = t - from, out = mkClamp((from + dur - t) / 0.8, 0, 1);
  const inP = mkEase(mkClamp(lt / 0.9, 0, 1));
  const tiles = [];
  for (let i = 0; i < count; i++) {
    const r1 = mkRnd(i + 3), r2 = mkRnd2(i + 9);
    const speed = 46 + r1 * 40;
    const span = 2400;
    const x = ((r1 * span + lt * speed) % span) - 380;
    const y = 90 + r2 * 780 + Math.sin(lt * 0.6 + i) * 26;
    const sc = 0.34 + r2 * 0.42;
    const rot = ((i % 5) - 2) * 5 + Math.sin(lt * 0.4 + i) * 3;
    tiles.push(
      <img key={i} src={srcs[i % srcs.length]} style={{ position:'absolute', left:x, top:y,
        width: 250 * sc * 1.5, height: 336 * sc * 1.5, objectFit:'cover', borderRadius:12,
        border:'2px solid rgba(255,210,74,.34)', boxShadow:'0 20px 50px rgba(0,0,0,.6)',
        transform:`rotate(${rot}deg)`, opacity: opacity * inP * (0.55 + r2 * 0.45), filter:'saturate(.92)' }} />
    );
  }
  return (
    <div style={{ position:'absolute', inset:0, overflow:'hidden', opacity:out, zIndex:6 }}>
      {tiles}
      <div style={{ position:'absolute', inset:0, background:'rgba(7,9,15,.42)' }} />
    </div>
  );
}
Object.assign(window.MotionKit, { CardDrift });
