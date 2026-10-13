// story-kit.jsx — the Deep Dive scene library. Every visual here is drawn in code
// (SVG + CSS, a pure function of useTime()), so episodes need no generated footage.
//
// The drawn scenes never draw a face: people appear as typography, numbers,
// faceless shirts, dots on a pitch and lines on a map. Faces come only from
// ClipShot, which plays owner-approved clips from the library (library/clips.json
// records who each clip shows). On-screen words are labels of four words or fewer,
// names, numbers and dates — never a sentence (rule #10).
/* global React, useTime */

const SK = {
  bg: '#07090f', green: '#106b4f', gold: '#ffd24a', text: '#f4f6fa',
  muted: '#93a0b4', red: '#d21034', ink: '#1b1a17', paper: '#efe6d2',
};
const skClamp = (v, a, b) => Math.max(a, Math.min(b, v));
const skEase = (p) => 1 - Math.pow(1 - p, 3);
const skInOut = (p) => (p < 0.5 ? 4 * p * p * p : 1 - Math.pow(-2 * p + 2, 3) / 2);
const skBack = (p) => { const c = 1.70158; return 1 + (c + 1) * Math.pow(p - 1, 3) + c * Math.pow(p - 1, 2); };
const skRnd = (i) => ((i * 2654435761) % 1000) / 1000;
const FONT = '"Inter", sans-serif';

// Shared visibility helper: returns null outside the window, else local time +
// a fade-out multiplier, so every scene enters and leaves the same way.
function useWindow(from, dur, fade = 0.6) {
  const t = useTime();
  if (t < from || t > from + dur) return null;
  const lt = t - from;
  return { lt, out: skClamp((from + dur - t) / fade, 0, 1), inn: skClamp(lt / fade, 0, 1) };
}

function Eyebrow({ text, color = SK.gold, delay = 0, lt }) {
  const p = skEase(skClamp((lt - delay) / 0.7, 0, 1));
  return (
    <div style={{ fontFamily: FONT, fontWeight: 800, fontSize: 34, letterSpacing: '.5em',
      color, opacity: p, transform: `translateY(${(1 - p) * 20}px)` }}>{text}</div>
  );
}

// ── Shirt — a faceless football shirt (front or back) in national colours ─────
function ShirtSVG({ colors = ['#c60b1e', '#ffc400'], number, name, back = true, w = 420 }) {
  const [c1, c2] = colors;
  const h = w * 1.05;
  return (
    <svg width={w} height={h} viewBox="0 0 400 420">
      <defs>
        <linearGradient id={`sh-${c1}`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor={c1} />
          <stop offset="1" stopColor={c1} stopOpacity="0.72" />
        </linearGradient>
      </defs>
      <path d="M120 20 L160 8 Q200 34 240 8 L280 20 L388 78 L350 170 L310 152 L310 412 L90 412 L90 152 L50 170 L12 78 Z"
        fill={`url(#sh-${c1})`} stroke="rgba(0,0,0,.35)" strokeWidth="4" />
      <path d="M160 8 Q200 34 240 8" fill="none" stroke={c2} strokeWidth="10" />
      <path d="M12 78 L50 170" stroke={c2} strokeWidth="8" />
      <path d="M388 78 L350 170" stroke={c2} strokeWidth="8" />
      {back && name ? (
        <text x="200" y="128" textAnchor="middle" fontFamily="Inter, sans-serif" fontWeight="900"
          fontSize={name.length > 9 ? 30 : 38} letterSpacing="3" fill={c2}>{name.toUpperCase()}</text>
      ) : null}
      {number != null && number !== '' ? (
        <text x="200" y={back ? 300 : 250} textAnchor="middle" fontFamily="Inter, sans-serif" fontWeight="900"
          fontSize={back ? 170 : 90} fill={c2} stroke="rgba(0,0,0,.25)" strokeWidth="3">{number}</text>
      ) : null}
      <path d="M90 152 L90 412 L310 412 L310 152" fill="none" stroke="rgba(255,255,255,.08)" strokeWidth="2" />
    </svg>
  );
}

// PlayerTitle — the episode's cold-open title: DID YOU KNOW? / NAME / hook label.
function PlayerTitle({ from, dur, name, label, number, colors, nation }) {
  const w = useWindow(from, dur, 0.7); if (!w) return null;
  const { lt, out } = w;
  const shirtP = skBack(skClamp((lt - 0.2) / 0.9, 0, 1));
  const labelP = skEase(skClamp((lt - 1.4) / 0.8, 0, 1));
  return (
    <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center',
      justifyContent: 'center', gap: 90, opacity: out, zIndex: 9 }}>
      <div style={{ opacity: skClamp(shirtP, 0, 1), transform: `translateY(${(1 - skClamp(shirtP, 0, 1)) * 80}px) rotate(${Math.sin(lt * 0.6) * 2}deg)`,
        filter: 'drop-shadow(0 40px 60px rgba(0,0,0,.7))' }}>
        <ShirtSVG colors={colors} number={number} name={name.split(' ').slice(-1)[0]} w={420} />
      </div>
      <div style={{ maxWidth: 1000 }}>
        <Eyebrow text="DID YOU KNOW?" lt={lt} delay={0.1} />
        <div style={{ marginTop: 24, fontFamily: FONT, fontWeight: 900, fontSize: name.length > 14 ? 118 : 150,
          lineHeight: 0.98, color: SK.text, display: 'flex', flexWrap: 'wrap' }}>
          {(() => {
            // wrap between words, never inside one (a name must not break mid-word)
            let n = 0;
            return name.toUpperCase().split(' ').map((word, wi) => (
              <span key={wi} style={{ display: 'inline-flex', whiteSpace: 'nowrap', marginRight: '0.28em' }}>
                {[...word].map((ch) => {
                  const i = n++;
                  const cp = skClamp(skBack(skClamp((lt - 0.45 - i * 0.04) / 0.5, 0, 1)), 0, 1.1);
                  return <span key={i} style={{ display: 'inline-block', opacity: skClamp(cp, 0, 1),
                    transform: `translateY(${(1 - skClamp(cp, 0, 1)) * 60}px)`, textShadow: '0 10px 40px rgba(0,0,0,.8)' }}>{ch}</span>;
                })}
              </span>
            ));
          })()}
        </div>
        <div style={{ marginTop: 30, display: 'flex', alignItems: 'center', gap: 22, opacity: labelP,
          transform: `translateX(${(1 - labelP) * 40}px)` }}>
          <div style={{ width: 70, height: 6, background: colors[1] || SK.gold }} />
          <div style={{ fontFamily: FONT, fontWeight: 800, fontSize: 52, color: SK.gold, letterSpacing: '.06em' }}>{label}</div>
        </div>
        {nation ? <div style={{ marginTop: 18, fontFamily: FONT, fontWeight: 700, fontSize: 30,
          letterSpacing: '.4em', color: SK.muted, opacity: labelP }}>{nation.toUpperCase()}</div> : null}
      </div>
    </div>
  );
}

// Jersey — the shirt alone, spotlit and turning, with a ≤4-word label.
function Jersey({ from, dur, colors, number, name, label, back = true }) {
  const w = useWindow(from, dur); if (!w) return null;
  const { lt, out } = w;
  const p = skBack(skClamp(lt / 1.0, 0, 1));
  const turn = Math.sin(lt * 0.5) * 8;
  return (
    <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center',
      justifyContent: 'center', opacity: out, zIndex: 9 }}>
      <div style={{ position: 'absolute', width: 900, height: 900, borderRadius: '50%',
        background: `radial-gradient(circle, ${colors[0]}44 0%, transparent 62%)`, filter: 'blur(10px)' }} />
      <div style={{ transform: `perspective(1400px) rotateY(${turn}deg) scale(${0.75 + 0.25 * skClamp(p, 0, 1.1)})`,
        opacity: skClamp(p, 0, 1), filter: 'drop-shadow(0 50px 70px rgba(0,0,0,.75))' }}>
        <ShirtSVG colors={colors} number={number} name={name} back={back} w={500} />
      </div>
      {label ? <div style={{ marginTop: 30, fontFamily: FONT, fontWeight: 900, fontSize: 56, color: SK.gold,
        letterSpacing: '.12em', opacity: skEase(skClamp((lt - 0.9) / 0.7, 0, 1)) }}>{label}</div> : null}
    </div>
  );
}

// StatCounter — one big number counting up, with a short label.
function StatCounter({ from, dur, value, decimals = 0, prefix = '', suffix = '', label, accent = SK.gold, sub }) {
  const w = useWindow(from, dur); if (!w) return null;
  const { lt, out } = w;
  const p = skInOut(skClamp((lt - 0.3) / Math.min(2.2, dur * 0.45), 0, 1));
  const v = (value * p).toFixed(decimals);
  const pop = skBack(skClamp((lt - 0.3 - Math.min(2.2, dur * 0.45)) / 0.4, 0, 1));
  const done = p >= 1;
  return (
    <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center',
      justifyContent: 'center', opacity: out, zIndex: 9 }}>
      {label ? <Eyebrow text={label} lt={lt} color={SK.muted} /> : null}
      <div style={{ marginTop: 26, fontFamily: FONT, fontWeight: 900, fontSize: 260, lineHeight: 1, color: accent,
        fontVariantNumeric: 'tabular-nums', textShadow: `0 0 ${done ? 110 : 50}px ${accent}66`,
        transform: `scale(${done ? 1 + 0.06 * skClamp(1 - Math.abs(pop - 1), 0, 1) : 1})` }}>
        {prefix}{Number(v).toLocaleString('en-US', { minimumFractionDigits: decimals, maximumFractionDigits: decimals })}{suffix}
      </div>
      {sub ? <div style={{ marginTop: 24, fontFamily: FONT, fontWeight: 800, fontSize: 44, color: SK.text,
        letterSpacing: '.2em', opacity: skEase(skClamp((lt - 1.6) / 0.7, 0, 1)) }}>{sub}</div> : null}
    </div>
  );
}

// RouteMap — an abstract dotted map with an animated journey between two points.
// Points are [x, y] in a 1600x700 field; no coastlines are drawn, so nothing is
// claimed beyond the two labelled places.
function RouteMap({ from, dur, a, b, label, stops = [], dashed = true, unit }) {
  const w = useWindow(from, dur); if (!w) return null;
  const { lt, out } = w;
  const W = 1600, H = 700;
  const pts = [a, ...stops, b];
  const segs = pts.length - 1;
  const travel = skInOut(skClamp((lt - 0.8) / Math.max(1.5, dur - 2.4), 0, 1));
  const dots = [];
  for (let gx = 0; gx < 40; gx++) for (let gy = 0; gy < 18; gy++) {
    const i = gx * 18 + gy;
    const o = 0.06 + 0.1 * skRnd(i);
    dots.push(<circle key={i} cx={20 + gx * 40} cy={20 + gy * 40} r={2.4} fill={`rgba(147,160,180,${o})`} />);
  }
  // build a smooth path through the points
  let d = `M ${pts[0].x} ${pts[0].y}`;
  for (let i = 1; i < pts.length; i++) {
    const p0 = pts[i - 1], p1 = pts[i];
    const mx = (p0.x + p1.x) / 2, my = Math.min(p0.y, p1.y) - Math.abs(p1.x - p0.x) * 0.18;
    d += ` Q ${mx} ${my} ${p1.x} ${p1.y}`;
  }
  const seg = Math.min(segs - 1, Math.floor(travel * segs));
  const sp = travel * segs - seg;
  const p0 = pts[seg], p1 = pts[seg + 1];
  const mx = (p0.x + p1.x) / 2, my = Math.min(p0.y, p1.y) - Math.abs(p1.x - p0.x) * 0.18;
  const bx = (1 - sp) * (1 - sp) * p0.x + 2 * (1 - sp) * sp * mx + sp * sp * p1.x;
  const by = (1 - sp) * (1 - sp) * p0.y + 2 * (1 - sp) * sp * my + sp * sp * p1.y;
  const pin = (pt, i, delay) => {
    const pp = skBack(skClamp((lt - delay) / 0.5, 0, 1));
    return (
      <g key={i} opacity={skClamp(pp, 0, 1)} transform={`translate(${pt.x} ${pt.y}) scale(${skClamp(pp, 0, 1.2)})`}>
        <circle r="34" fill={`${SK.gold}22`} />
        <circle r="12" fill={SK.gold} />
        <text y="-48" textAnchor="middle" fontFamily="Inter, sans-serif" fontWeight="900" fontSize="34"
          fill={SK.text} letterSpacing="3">{(pt.name || '').toUpperCase()}</text>
      </g>
    );
  };
  return (
    <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center',
      justifyContent: 'center', opacity: out, zIndex: 9 }}>
      {label ? <Eyebrow text={label} lt={lt} /> : null}
      <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} style={{ marginTop: 20 }}>
        {dots}
        <path d={d} fill="none" stroke="rgba(255,210,74,.18)" strokeWidth="6" strokeDasharray={dashed ? '4 14' : 'none'} strokeLinecap="round" />
        <path d={d} fill="none" stroke={SK.gold} strokeWidth="6" strokeLinecap="round" pathLength="1"
          strokeDasharray="1 1" strokeDashoffset={1 - travel} />
        {pts.map((pt, i) => pin(pt, i, 0.2 + (i / Math.max(1, segs)) * Math.max(0.2, dur - 2.6)))}
        <circle cx={bx} cy={by} r="16" fill="#fff" style={{ filter: 'drop-shadow(0 0 18px #ffd24a)' }} />
      </svg>
      {unit ? <div style={{ marginTop: 8, fontFamily: FONT, fontWeight: 900, fontSize: 64, color: SK.gold,
        opacity: skEase(skClamp((lt - 1.2) / 0.7, 0, 1)) }}>{unit}</div> : null}
    </div>
  );
}

// TacticalPitch — top-down pitch; players are dots, the ball moves through
// keyframes. frames: [{t (0..1), ball:[x,y], home:[[x,y]...], away:[[x,y]...]}]
// in a 105x68 metre space. Used to reconstruct a famous moment without footage.
function TacticalPitch({ from, dur, frames, label, homeColor = SK.gold, awayColor = '#4a90e2', trail = true }) {
  const w = useWindow(from, dur); if (!w) return null;
  const { lt, out } = w;
  const W = 1500, H = 972, sx = W / 105, sy = H / 68;
  const prog = skClamp((lt - 0.6) / Math.max(1, dur - 1.8), 0, 1);
  let k = 0;
  while (k < frames.length - 2 && prog > frames[k + 1].t) k++;
  const f0 = frames[k], f1 = frames[Math.min(k + 1, frames.length - 1)];
  const span = Math.max(1e-6, f1.t - f0.t);
  const q = skInOut(skClamp((prog - f0.t) / span, 0, 1));
  const lerp = (a, b) => [a[0] + (b[0] - a[0]) * q, a[1] + (b[1] - a[1]) * q];
  const ball = lerp(f0.ball, f1.ball);
  const team = (key, color) => (f0[key] || []).map((pt, i) => {
    const p = lerp(pt, (f1[key] || [])[i] || pt);
    return <circle key={key + i} cx={p[0] * sx} cy={p[1] * sy} r="17" fill={color} stroke="rgba(0,0,0,.5)" strokeWidth="4" />;
  });
  const path = trail ? frames.slice(0, k + 1).map((f) => f.ball).concat([ball]) : [];
  return (
    <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center',
      justifyContent: 'center', opacity: out, zIndex: 9 }}>
      {label ? <div style={{ marginBottom: 16 }}><Eyebrow text={label} lt={lt} /></div> : null}
      <svg width={W * 0.78} height={H * 0.78} viewBox={`0 0 ${W} ${H}`}
        style={{ transform: `perspective(1600px) rotateX(${14 - 6 * skEase(skClamp(lt / 1.2, 0, 1))}deg)`,
          filter: 'drop-shadow(0 40px 60px rgba(0,0,0,.6))' }}>
        <rect width={W} height={H} rx="12" fill="#0f3d2c" />
        {Array.from({ length: 10 }, (_, i) => <rect key={i} x={i * W / 10} width={W / 10} height={H} fill={i % 2 ? '#124632' : '#0f3d2c'} />)}
        <g fill="none" stroke="rgba(255,255,255,.55)" strokeWidth="4">
          <rect x="6" y="6" width={W - 12} height={H - 12} />
          <line x1={W / 2} y1="6" x2={W / 2} y2={H - 6} />
          <circle cx={W / 2} cy={H / 2} r={9.15 * sx} />
          <rect x="6" y={(34 - 20.16) * sy} width={16.5 * sx} height={40.32 * sy} />
          <rect x={W - 6 - 16.5 * sx} y={(34 - 20.16) * sy} width={16.5 * sx} height={40.32 * sy} />
          <rect x="6" y={(34 - 9.16) * sy} width={5.5 * sx} height={18.32 * sy} />
          <rect x={W - 6 - 5.5 * sx} y={(34 - 9.16) * sy} width={5.5 * sx} height={18.32 * sy} />
        </g>
        {path.length > 1 ? <polyline points={path.map((p) => `${p[0] * sx},${p[1] * sy}`).join(' ')} fill="none"
          stroke={SK.gold} strokeWidth="5" strokeDasharray="10 12" opacity="0.8" /> : null}
        {team('away', awayColor)}
        {team('home', homeColor)}
        <circle cx={ball[0] * sx} cy={ball[1] * sy} r="11" fill="#fff" style={{ filter: 'drop-shadow(0 0 12px #fff)' }} />
      </svg>
    </div>
  );
}

// Artifact — a designed object from the story: a napkin, a photo, a ticket, a
// shirt frame. Handwriting is drawn as abstract strokes (not legible sentences);
// only the date and a ≤4-word title are real text.
function Artifact({ from, dur, kind = 'napkin', title, date, accent = SK.gold }) {
  const w = useWindow(from, dur); if (!w) return null;
  const { lt, out } = w;
  const p = skBack(skClamp(lt / 1.0, 0, 1));
  const write = skClamp((lt - 0.8) / Math.max(1.2, dur * 0.5), 0, 1);
  const tilt = -4 + Math.sin(lt * 0.4) * 1.5;
  const strokes = [];
  for (let i = 0; i < 7; i++) {
    const y = 150 + i * 52, len = 320 + skRnd(i + 3) * 260;
    let d = `M 70 ${y}`;
    for (let x = 0; x < len; x += 26) d += ` q 6 ${-14 - skRnd(i * 31 + x) * 8} 13 0 t 13 0`;
    strokes.push(<path key={i} d={d} fill="none" stroke="#2a3b8f" strokeWidth="3.4" strokeLinecap="round"
      pathLength="1" strokeDasharray="1 1" strokeDashoffset={skClamp(1 - (write * 7 - i), 0, 1)} opacity="0.85" />);
  }
  const isPhoto = kind === 'polaroid';
  return (
    <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center',
      gap: 80, opacity: out, zIndex: 9 }}>
      <div style={{ transform: `rotate(${tilt}deg) scale(${0.7 + 0.3 * skClamp(p, 0, 1.08)})`, opacity: skClamp(p, 0, 1),
        filter: 'drop-shadow(0 40px 60px rgba(0,0,0,.7))' }}>
        {isPhoto ? (
          <div style={{ width: 620, height: 700, background: '#f7f3ea', padding: '34px 34px 120px', position: 'relative' }}>
            <div style={{ width: '100%', height: '100%', background: `radial-gradient(circle at 40% 45%, #f3d9b0 0%, #c89a64 38%, #4a3626 100%)`,
              filter: `blur(${18 - 10 * write}px) sepia(.5)`, opacity: 0.6 + 0.4 * write }} />
            <div style={{ position: 'absolute', left: 0, right: 0, bottom: 34, textAlign: 'center', fontFamily: FONT,
              fontWeight: 800, fontSize: 40, color: SK.ink, letterSpacing: '.18em' }}>{date}</div>
          </div>
        ) : (
          <svg width="720" height="620" viewBox="0 0 720 620">
            <path d="M20 30 L700 18 L690 600 L30 592 Z" fill={SK.paper} />
            {Array.from({ length: 18 }, (_, i) => <line key={i} x1={20 + i * 38} y1="18" x2={20 + i * 38} y2="600"
              stroke="rgba(0,0,0,.035)" strokeWidth="14" />)}
            {strokes}
            <text x="640" y="560" textAnchor="end" fontFamily="Georgia, serif" fontStyle="italic" fontSize="44"
              fill="#2a3b8f" opacity={skClamp(write * 1.5 - 0.4, 0, 1)}>{date}</text>
          </svg>
        )}
      </div>
      {title ? <div style={{ maxWidth: 640 }}>
        <Eyebrow text={kind === 'polaroid' ? 'THE PHOTO' : 'THE DOCUMENT'} lt={lt} color={SK.muted} delay={0.4} />
        <div style={{ marginTop: 22, fontFamily: FONT, fontWeight: 900, fontSize: 92, lineHeight: 1.02, color: accent,
          opacity: skEase(skClamp((lt - 0.8) / 0.8, 0, 1)) }}>{title}</div>
      </div> : null}
    </div>
  );
}

// VersusBars — two values compared as growing bars (e.g. age 15 vs 39).
function VersusBars({ from, dur, rows, label, unit = '' }) {
  const w = useWindow(from, dur); if (!w) return null;
  const { lt, out } = w;
  const max = Math.max(...rows.map((r) => r.value));
  return (
    <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center',
      justifyContent: 'center', opacity: out, zIndex: 9 }}>
      {label ? <div style={{ marginBottom: 60 }}><Eyebrow text={label} lt={lt} /></div> : null}
      {rows.map((r, i) => {
        const p = skInOut(skClamp((lt - 0.5 - i * 0.5) / 1.4, 0, 1));
        return (
          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 34, margin: '20px 0', width: 1400 }}>
            <div style={{ width: 330, textAlign: 'right', fontFamily: FONT, fontWeight: 900, fontSize: 46, color: SK.text,
              letterSpacing: '.06em' }}>{r.label}</div>
            <div style={{ flex: 1, height: 70, background: 'rgba(255,255,255,.06)', borderRadius: 12, overflow: 'hidden' }}>
              <div style={{ width: `${(r.value / max) * 100 * p}%`, height: '100%', borderRadius: 12,
                background: r.accent === 'red' ? SK.red : `linear-gradient(90deg, ${SK.green}, ${SK.gold})` }} />
            </div>
            <div style={{ width: 230, fontFamily: FONT, fontWeight: 900, fontSize: 60, color: SK.gold,
              fontVariantNumeric: 'tabular-nums' }}>{Math.round(r.value * p)}{unit}</div>
          </div>
        );
      })}
    </div>
  );
}

// Heartbeat — an ECG trace racing then settling (a medical-story beat).
function Heartbeat({ from, dur, bpmFrom = 180, bpmTo = 70, label }) {
  const w = useWindow(from, dur); if (!w) return null;
  const { lt, out } = w;
  const settle = skInOut(skClamp((lt - dur * 0.45) / (dur * 0.35), 0, 1));
  const bpm = bpmFrom + (bpmTo - bpmFrom) * settle;
  const W = 1500, H = 360, mid = H / 2;
  const period = 60 / bpm;
  let d = '';
  for (let x = 0; x <= W; x += 3) {
    const tt = lt - (W - x) / 520;
    const ph = ((tt % period) + period) % period / period;
    let y = 0;
    if (ph > 0.1 && ph < 0.14) y = -40;
    else if (ph >= 0.14 && ph < 0.17) y = 120;
    else if (ph >= 0.17 && ph < 0.21) y = -150;
    else if (ph >= 0.21 && ph < 0.25) y = 30;
    else if (ph > 0.4 && ph < 0.5) y = -26 * Math.sin((ph - 0.4) / 0.1 * Math.PI);
    d += `${x === 0 ? 'M' : 'L'} ${x} ${mid + y * 0.9} `;
  }
  const col = settle < 0.5 ? SK.red : SK.green;
  return (
    <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center',
      justifyContent: 'center', opacity: out, zIndex: 9 }}>
      {label ? <Eyebrow text={label} lt={lt} /> : null}
      <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} style={{ marginTop: 30 }}>
        {Array.from({ length: 16 }, (_, i) => <line key={i} x1={i * 100} y1="0" x2={i * 100} y2={H} stroke="rgba(255,255,255,.05)" />)}
        <path d={d} fill="none" stroke={col} strokeWidth="6" strokeLinejoin="round" style={{ filter: `drop-shadow(0 0 14px ${col})` }} />
      </svg>
      <div style={{ marginTop: 20, fontFamily: FONT, fontWeight: 900, fontSize: 110, color: col,
        fontVariantNumeric: 'tabular-nums' }}>{Math.round(bpm)} BPM</div>
    </div>
  );
}

// DateFlip — split-flap date reveal for the moment everything changed.
function DateFlip({ from, dur, date, label }) {
  const w = useWindow(from, dur); if (!w) return null;
  const { lt, out } = w;
  const chars = [...date];
  return (
    <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center',
      justifyContent: 'center', opacity: out, zIndex: 9 }}>
      {label ? <Eyebrow text={label} lt={lt} /> : null}
      <div style={{ display: 'flex', gap: 14, marginTop: 50 }}>
        {chars.map((ch, i) => {
          const settleAt = 0.5 + i * 0.12;
          const spinning = lt < settleAt;
          const shown = spinning ? '0123456789'[Math.floor((lt * 24 + i * 3) % 10)] : ch;
          const sep = /[^0-9A-Z]/i.test(ch);
          return (
            <div key={i} style={{ width: sep ? 50 : 130, height: 190, borderRadius: 14,
              background: sep ? 'transparent' : 'linear-gradient(180deg,#1b2230 0%,#1b2230 49%,#0d1119 51%,#141a26 100%)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: FONT, fontWeight: 900,
              fontSize: 140, color: spinning ? SK.muted : SK.gold, boxShadow: sep ? 'none' : '0 20px 40px rgba(0,0,0,.6)' }}>
              {sep ? ch : shown}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ChapterMark — "CHAPTER 2" + a ≤4-word chapter name, wiping in.
function ChapterMark({ from, dur, index, title }) {
  const w = useWindow(from, dur, 0.5); if (!w) return null;
  const { lt, out } = w;
  const wipe = skInOut(skClamp(lt / 0.8, 0, 1));
  return (
    <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center',
      justifyContent: 'center', opacity: out, zIndex: 9 }}>
      <div style={{ fontFamily: FONT, fontWeight: 800, fontSize: 40, letterSpacing: '.6em', color: SK.muted,
        opacity: wipe }}>CHAPTER {index}</div>
      <div style={{ marginTop: 26, fontFamily: FONT, fontWeight: 900, fontSize: 130, color: SK.text,
        clipPath: `inset(0 ${(1 - wipe) * 100}% 0 0)`, textShadow: '0 10px 40px rgba(0,0,0,.8)' }}>{title}</div>
      <div style={{ marginTop: 30, width: 600 * wipe, height: 5, background: `linear-gradient(90deg,transparent,${SK.gold},transparent)` }} />
    </div>
  );
}

// ClipShot — one shot from the paid clip library (marketing/deep-dives/library),
// full-bleed with a slow camera push so it never sits still. Vertical clips get a
// blurred cover of themselves behind a contained foreground instead of a crop.
// `dim` darkens the shot when a code overlay sits on top; `tag` is a small place /
// year label (≤4 words, rule #10). Every clip plays once and never loops (preflight).
// Tracked blur boxes (library/clips.json `blur`): keyframes [sourceTime, cx, cy, w, h]
// as fractions of the video frame, interpolated over time — they hide kit-maker
// logos and federation crests (monetization rule #0/#5) as the camera moves.
function blurBox(keys, st) {
  let i = 0; while (i < keys.length - 2 && st > keys[i + 1][0]) i++;
  const a = keys[i], b = keys[Math.min(i + 1, keys.length - 1)];
  const f = b[0] === a[0] ? 0 : skClamp((st - a[0]) / (b[0] - a[0]), 0, 1);
  return a.slice(1).map((v, j) => v + (b[j + 1] - v) * f);
}

function ClipShot({ from, dur, src, rate = 1, offset = 0, vertical, aspect = 16 / 9, blur, dim = 0, tag, k = 0, push = 0.07 }) {
  const w = useWindow(from, dur, 0.18); if (!w) return null;
  const { lt, inn } = w;
  const p = skClamp(lt / Math.max(dur, 0.1), 0, 1);
  const dir = k % 4;
  const scale = 1.03 + push * skInOut(p);
  const dx = (dir === 0 ? -1 : dir === 2 ? 1 : 0) * 22 * p, dy = (dir === 1 ? -1 : dir === 3 ? 1 : 0) * 14 * p;
  const tagIn = skEase(skClamp((lt - 0.35) / 0.6, 0, 1));
  const sprite = { src, start: from, dur, rate, offset };
  return (
    <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', background: '#000', opacity: 0.35 + 0.65 * inn, zIndex: 4 }}>
      <div style={{ position: 'absolute', inset: 0, transform: `translate(${dx}px,${dy}px) scale(${scale})` }}>
        {vertical ? <VideoSprite {...sprite} style={{ filter: 'blur(38px) brightness(.45) saturate(1.2)', transform: 'scale(1.2)' }} /> : null}
        <VideoSprite {...sprite} fit={vertical ? 'contain' : 'cover'} />
        {(blur || []).map((m, i) => {
          // the rect the video actually occupies on the 1920x1080 stage (cover crops, contain letterboxes)
          const fill = vertical ? aspect > 16 / 9 : aspect < 16 / 9;
          const rw = fill ? 1920 : 1080 * aspect, rh = fill ? 1920 / aspect : 1080;
          const rx = (1920 - rw) / 2, ry = (1080 - rh) / 2;
          const [cx, cy, bw, bh] = blurBox(m.keys, offset + lt * rate);
          const x = rx + (cx - bw / 2) * rw, y = ry + (cy - bh / 2) * rh;
          return (
            <div key={i} style={{ position: 'absolute', left: x, top: y, width: bw * rw, height: bh * rh,
              overflow: 'hidden', borderRadius: 18 }}>
              <VideoSprite {...sprite} fit="fill" style={{ inset: 'auto', left: rx - x, top: ry - y, width: rw, height: rh, filter: 'blur(24px) saturate(.85)', transform: 'scale(1.0)' }} />
            </div>
          );
        })}
      </div>
      {/* grade: lifted blacks at the edges, a floor for overlay text */}
      <div style={{ position: 'absolute', inset: 0, background: `rgba(4,6,12,${dim})` }} />
      <div style={{ position: 'absolute', inset: 0, background:
        'linear-gradient(180deg, rgba(5,7,12,.45) 0%, rgba(5,7,12,0) 22%, rgba(5,7,12,0) 66%, rgba(5,7,12,.7) 100%)' }} />
      {tag ? (
        <div style={{ position: 'absolute', left: 90, bottom: 150, display: 'flex', alignItems: 'center', gap: 18,
          opacity: tagIn * skClamp((from + dur - (from + lt)) / 0.3, 0, 1), transform: `translateX(${(1 - tagIn) * -30}px)` }}>
          <div style={{ width: 8, height: 46, background: SK.gold }} />
          <div style={{ fontFamily: FONT, fontWeight: 900, fontSize: 38, letterSpacing: '.28em', color: SK.text,
            textShadow: '0 4px 24px rgba(0,0,0,.9)' }}>{tag}</div>
        </div>
      ) : null}
    </div>
  );
}

// FaceOff — the approved portraits side by side (stills from library clips whose
// `who` is that player), name + meta under each, a VS spark between. Drifts apart
// slowly so it is never a frozen slate.
function FaceOff({ from, dur, faces = [] }) {
  const w = useWindow(from, dur, 0.4); if (!w) return null;
  const { lt, out } = w;
  const p = skBack(skClamp(lt / 0.9, 0, 1)), drift = lt * 6;
  const vs = skEase(skClamp((lt - 0.6) / 0.5, 0, 1));
  return (
    <div style={{ position: 'absolute', inset: 0, opacity: out, zIndex: 8, background: '#05070c' }}>
      {faces.map((f, i) => (
        <div key={i} style={{ position: 'absolute', top: 0, bottom: 0, width: '50%', left: i ? '50%' : 0, overflow: 'hidden',
          transform: `translateX(${(i ? 1 : -1) * ((1 - p) * 300 + drift)}px)` }}>
          <img src={f.src} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover',
            objectPosition: '50% 22%', transform: `scale(${1.04 + lt * 0.012})` }} />
          <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(0deg, rgba(5,7,12,.9) 0%, rgba(5,7,12,0) 45%)' }} />
          <div style={{ position: 'absolute', left: 0, right: 0, bottom: 150, textAlign: 'center',
            opacity: skEase(skClamp((lt - 0.5) / 0.6, 0, 1)) }}>
            <div style={{ fontFamily: FONT, fontWeight: 900, fontSize: 88, color: SK.text, letterSpacing: '-.01em',
              textShadow: '0 8px 30px rgba(0,0,0,.9)' }}>{f.name}</div>
            {f.meta ? <div style={{ marginTop: 10, fontFamily: FONT, fontWeight: 800, fontSize: 32, letterSpacing: '.4em',
              color: SK.gold }}>{f.meta}</div> : null}
          </div>
        </div>
      ))}
      <div style={{ position: 'absolute', left: '50%', top: 0, bottom: 0, width: 6, marginLeft: -3, background: SK.gold,
        transform: `scaleY(${p})`, boxShadow: `0 0 40px ${SK.gold}` }} />
      <div style={{ position: 'absolute', left: '50%', top: '42%', width: 170, height: 170, marginLeft: -85, borderRadius: '50%',
        background: SK.gold, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: FONT, fontWeight: 900,
        fontSize: 72, color: '#1a1405', transform: `scale(${vs})`, boxShadow: `0 0 80px ${SK.gold}aa` }}>VS</div>
    </div>
  );
}

// CornerBug — persistent player name + "DID YOU KNOW?" in the corner (a name
// label, allowed by rule #10), so every frame says who the episode is about.
function CornerBug({ from, dur, name, number, colors }) {
  const w = useWindow(from, dur, 0.8); if (!w) return null;
  const { lt, out } = w;
  const p = skEase(skClamp(lt / 0.8, 0, 1));
  return (
    <div style={{ position: 'absolute', left: 70, top: 116, display: 'flex', alignItems: 'center', gap: 16,
      opacity: out * p, zIndex: 25 }}>
      <div style={{ width: 54, height: 54, borderRadius: 12, background: colors[0], color: colors[1],
        display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: FONT, fontWeight: 900, fontSize: 26 }}>{number}</div>
      <div>
        <div style={{ fontFamily: FONT, fontWeight: 900, fontSize: 24, letterSpacing: '.18em', color: SK.text }}>{name.toUpperCase()}</div>
        <div style={{ fontFamily: FONT, fontWeight: 800, fontSize: 16, letterSpacing: '.4em', color: SK.gold }}>DID YOU KNOW?</div>
      </div>
    </div>
  );
}

Object.assign(window.MotionKit || (window.MotionKit = {}), {
  PlayerTitle, Jersey, StatCounter, RouteMap, TacticalPitch, Artifact, VersusBars,
  Heartbeat, DateFlip, ChapterMark, CornerBug, ClipShot, FaceOff, ShirtSVG, SK,
});
