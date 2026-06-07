// shared.jsx — WorldCup26 launch video: tokens, device frame, brand atoms.
// Loaded after animations.jsx + worldcup-data.js. Exports to window.
const { Sprite, useTime, useSprite, Easing, interpolate, animate, clamp } = window;

// ── Brand tokens (verbatim from colors_and_type.css) ────────────────────────
const C = {
  bg: '#f7faf9', surface: '#ffffff', surfaceStrong: '#f0f5f2', paperSoft: '#fbfdfc',
  text: '#0c1d1a', muted: '#5d6f69', border: '#d8e3df', borderStrong: '#b8c7c1',
  green: '#106b4f', greenSoft: '#e5f3ee', gold: '#c9942e', red: '#b84a45',
  greenDeep: '#0a3328', greenNight: '#06170f', greenMid: '#0f4d39',
  p1a: '#106b4f', p1b: '#e5f3ee', p1bd: '#9ac9b8', p1t: '#0b513b',
  p2a: '#2f5fbd', p2b: '#e9effb', p2bd: '#a9c0ec', p2t: '#244c96',
  p3a: '#b66b16', p3b: '#fff0dd', p3bd: '#e4bd86', p3t: '#81500f',
  whatsapp: '#25D366', whatsappDeep: '#128C7E',
};
const FONT = "'Inter', system-ui, -apple-system, sans-serif";
const PICKS = [
  { a: C.p1a, b: C.p1b, bd: C.p1bd, t: C.p1t },
  { a: C.p2a, b: C.p2b, bd: C.p2bd, t: C.p2t },
  { a: C.p3a, b: C.p3b, bd: C.p3bd, t: C.p3t },
];

// ── Small helpers ───────────────────────────────────────────────────────────
const lerp = (a, b, t) => a + (b - a) * t;
// pulse 0→1→0 across a window
const inOut = (lt, start, rise, hold, fall) => {
  if (lt < start) return 0;
  if (lt < start + rise) return Easing.easeOutCubic((lt - start) / rise);
  if (lt < start + rise + hold) return 1;
  if (lt < start + rise + hold + fall) return 1 - Easing.easeInCubic((lt - start - rise - hold) / fall);
  return 0;
};
const flag = (id, w = 160) => window.wcFlag ? window.wcFlag(id, w) : '';

// ── Trophy glyph (from brand-mark.svg) ──────────────────────────────────────
function Trophy({ size = 24, stroke = '#fff', sw = 2 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
      stroke={stroke} strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round">
      <path d="M10 14.66v1.626a2 2 0 0 1-.976 1.696A5 5 0 0 0 7 21.978" />
      <path d="M14 14.66v1.626a2 2 0 0 0 .976 1.696A5 5 0 0 1 17 21.978" />
      <path d="M18 9h1.5a1 1 0 0 0 0-5H18" />
      <path d="M4 22h16" />
      <path d="M6 9a6 6 0 0 0 12 0V3a1 1 0 0 0-1-1H7a1 1 0 0 0-1 1z" />
      <path d="M6 9H4.5a1 1 0 0 1 0-5H6" />
    </svg>
  );
}

// ── Brand mark: green rounded square + white trophy ─────────────────────────
function BrandMark({ size = 38, radius = 8 }) {
  return (
    <div style={{
      width: size, height: size, borderRadius: radius, background: C.green,
      display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
      boxShadow: `0 ${size * 0.26}px ${size * 0.63}px rgba(16,107,79,.28)`,
    }}>
      <Trophy size={size * 0.55} stroke="#fff" sw={2} />
    </div>
  );
}

function Logo({ scale = 1, dark = false }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 12 * scale }}>
      <BrandMark size={38 * scale} radius={8 * scale} />
      <span style={{
        fontFamily: FONT, fontWeight: 800, fontSize: 24 * scale,
        letterSpacing: '-0.02em', color: dark ? '#fff' : C.text,
      }}>WorldCup</span>
    </div>
  );
}

// ── Flag chip (rounded rect, hairline) ──────────────────────────────────────
function Flag({ id, w = 40, h, radius = 4 }) {
  const hh = h || Math.round(w * 0.68);
  return (
    <div style={{
      width: w, height: hh, borderRadius: radius, overflow: 'hidden', flexShrink: 0,
      boxShadow: 'inset 0 0 0 1px rgba(12,29,26,.10)', background: C.surfaceStrong,
    }}>
      <img src={flag(id, w <= 60 ? 80 : 160)} alt="" draggable="false"
        style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
    </div>
  );
}

// ── Phone device frame ──────────────────────────────────────────────────────
// Renders children inside a clean mobile screen. Includes status bar.
function Phone({ children, screenBg = C.bg, width = 452, height = 936, statusDark = true }) {
  const bezel = 13;
  return (
    <div style={{
      width, height, borderRadius: 58, background: '#0a1713', padding: bezel,
      boxShadow: '0 50px 110px rgba(8,30,22,.42), 0 14px 40px rgba(8,30,22,.30), inset 0 0 0 2px rgba(255,255,255,.06)',
      position: 'relative', flexShrink: 0,
    }}>
      <div style={{
        width: '100%', height: '100%', borderRadius: 46, overflow: 'hidden',
        background: screenBg, position: 'relative',
      }}>
        {/* status bar */}
        <div style={{
          height: 52, display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between',
          padding: '0 30px 8px', fontFamily: FONT, fontWeight: 700, fontSize: 16,
          color: statusDark ? C.text : '#fff', position: 'relative', zIndex: 5,
        }}>
          <span>9:41</span>
          <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
            <Bars dark={statusDark} /><Wifi dark={statusDark} /><Batt dark={statusDark} />
          </div>
        </div>
        {/* notch */}
        <div style={{
          position: 'absolute', top: 13, left: '50%', transform: 'translateX(-50%)',
          width: 120, height: 30, borderRadius: 16, background: '#0a1713', zIndex: 6,
        }} />
        <div style={{ position: 'absolute', inset: 0, top: 52, overflow: 'hidden' }}>
          {children}
        </div>
      </div>
    </div>
  );
}
function Bars({ dark }) {
  const c = dark ? C.text : '#fff';
  return (<svg width="20" height="14" viewBox="0 0 20 14" fill="none">
    {[0, 1, 2, 3].map(i => <rect key={i} x={i * 5.2} y={10 - i * 3} width="3.4" height={4 + i * 3} rx="1" fill={c} />)}
  </svg>);
}
function Wifi({ dark }) {
  const c = dark ? C.text : '#fff';
  return (<svg width="18" height="14" viewBox="0 0 18 14" fill="none">
    <path d="M9 12.5l2.2-2.7a3.4 3.4 0 0 0-4.4 0L9 12.5z" fill={c} />
    <path d="M3.4 6.6a8.5 8.5 0 0 1 11.2 0" stroke={c} strokeWidth="1.7" strokeLinecap="round" />
    <path d="M5.8 9.1a5 5 0 0 1 6.4 0" stroke={c} strokeWidth="1.7" strokeLinecap="round" />
  </svg>);
}
function Batt({ dark }) {
  const c = dark ? C.text : '#fff';
  return (<svg width="26" height="14" viewBox="0 0 26 14" fill="none">
    <rect x="1" y="2.5" width="21" height="9" rx="2.5" stroke={c} strokeOpacity="0.45" strokeWidth="1.3" />
    <rect x="2.8" y="4.3" width="15" height="5.4" rx="1.3" fill={c} />
    <rect x="23.4" y="5" width="1.8" height="4" rx="0.9" fill={c} fillOpacity="0.45" />
  </svg>);
}

// ── App chrome atoms (mobile) ───────────────────────────────────────────────
function Eyebrow({ children, color = C.green, style }) {
  return <div style={{
    fontFamily: FONT, fontWeight: 850, fontSize: 12, letterSpacing: '0.08em',
    textTransform: 'uppercase', color, ...style,
  }}>{children}</div>;
}
function Pill({ children, bg = C.greenSoft, color = C.green, border, style }) {
  return <span style={{
    display: 'inline-flex', alignItems: 'center', gap: 6, padding: '5px 12px',
    borderRadius: 999, background: bg, color, fontFamily: FONT, fontWeight: 720,
    fontSize: 13, border: border ? `1px solid ${border}` : 'none', ...style,
  }}>{children}</span>;
}

// App panel header used inside phone screens
function PanelHead({ eyebrow, title, sub }) {
  return (
    <div style={{ padding: '20px 26px 14px' }}>
      <Eyebrow>{eyebrow}</Eyebrow>
      <div style={{ fontFamily: FONT, fontWeight: 800, fontSize: 30, color: C.text, letterSpacing: '-0.02em', margin: '8px 0 6px' }}>{title}</div>
      {sub && <div style={{ fontFamily: FONT, fontWeight: 400, fontSize: 15, lineHeight: 1.5, color: C.muted }}>{sub}</div>}
    </div>
  );
}

// ── Caption block for the side panel (16:9 app scenes) ──────────────────────
// Animates in/out via a nested Sprite; place at absolute coords.
function Caption({ start, end, x, y, eyebrow, title, sub, w = 720, align = 'left', titleSize = 76 }) {
  return (
    <Sprite start={start} end={end}>
      {({ localTime, duration }) => {
        const inT = Easing.easeOutCubic(clamp(localTime / 0.55, 0, 1));
        const outT = Easing.easeInCubic(clamp((localTime - (duration - 0.4)) / 0.4, 0, 1));
        const op = inT * (1 - outT);
        const ty = (1 - inT) * 26 - outT * 14;
        return (
          <div style={{
            position: 'absolute', left: x, top: y, width: w, textAlign: align,
            opacity: op, transform: `translateY(${ty}px)`, willChange: 'transform,opacity',
          }}>
            {eyebrow && <div style={{ marginBottom: 18 }}><Eyebrow style={{ fontSize: 16, letterSpacing: '0.16em' }}>{eyebrow}</Eyebrow></div>}
            <div style={{ fontFamily: FONT, fontWeight: 800, fontSize: titleSize, lineHeight: 1.02, letterSpacing: '-0.03em', color: C.text }}>{title}</div>
            {sub && <div style={{ fontFamily: FONT, fontWeight: 400, fontSize: 26, lineHeight: 1.5, color: C.muted, marginTop: 22, maxWidth: 640, marginLeft: align === 'center' ? 'auto' : 0, marginRight: align === 'center' ? 'auto' : 0 }}>{sub}</div>}
          </div>
        );
      }}
    </Sprite>
  );
}

// A finger/tap indicator that pulses at a point
function Tap({ x, y, at, dur = 0.7, size = 56 }) {
  const t = useTime();
  const lt = t - at;
  if (lt < -0.05 || lt > dur) return null;
  const p = clamp(lt / dur, 0, 1);
  const ringScale = 0.4 + p * 1.6;
  const ringOp = (1 - p) * 0.5;
  const dotScale = lt < 0.12 ? Easing.easeOutBack(clamp(lt / 0.12, 0, 1)) : (lt > dur - 0.18 ? 1 - clamp((lt - (dur - 0.18)) / 0.18, 0, 1) : 1);
  return (
    <div style={{ position: 'absolute', left: x, top: y, transform: 'translate(-50%,-50%)', pointerEvents: 'none', zIndex: 40 }}>
      <div style={{ position: 'absolute', left: 0, top: 0, transform: `translate(-50%,-50%) scale(${ringScale})`, width: size, height: size, borderRadius: 999, border: `3px solid ${C.green}`, opacity: ringOp }} />
      <div style={{ position: 'absolute', left: 0, top: 0, transform: `translate(-50%,-50%) scale(${dotScale})`, width: size * 0.62, height: size * 0.62, borderRadius: 999, background: 'rgba(16,107,79,.22)', border: `2px solid ${C.green}` }} />
    </div>
  );
}

// rolling number (counts toward value)
function rollNum(value, lt, start, dur, decimals = 2) {
  const p = Easing.easeOutCubic(clamp((lt - start) / dur, 0, 1));
  return (value * p).toFixed(decimals);
}

// timecode label for commenting
function Timecode() {
  const t = useTime();
  const ref = React.useRef(null);
  React.useEffect(() => {
    if (!ref.current) return;
    const root = ref.current.closest('[data-video-root]') || ref.current.parentElement;
    const m = Math.floor(t / 60), s = Math.floor(t % 60);
    if (root) root.setAttribute('data-screen-label', `${m}:${String(s).padStart(2, '0')}`);
  }, [Math.floor(t)]);
  return <div ref={ref} style={{ position: 'absolute', width: 0, height: 0 }} />;
}

Object.assign(window, {
  C, FONT, PICKS, lerp, inOut, flag,
  Trophy, BrandMark, Logo, Flag, Phone,
  Eyebrow, Pill, PanelHead, Caption, Tap, rollNum, Timecode,
});
