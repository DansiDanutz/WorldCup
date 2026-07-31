// match-kit.jsx — shared primitives for "WorldCup26 Bonus - Norway: The Viking Row"
// (loads after animations.jsx). Dark cinematic broadcast theme. CLIP-BASED film:
// every visual window is a real video clip (VideoSprite), never a Ken-Burns still.
// SOCCER ONLY — round-neck shirts, a pitch with goals; never gridiron.

const SANS = '"Inter", system-ui, -apple-system, "Segoe UI", Roboto, sans-serif';

const MV = {
  bg: '#07090f',
  panel: 'rgba(13,18,30,0.86)',
  text: '#f4f6fa',
  muted: '#93a0b4',
  gold: '#ffd24a',
  goldDeep: '#c9942e',
  // Norway: red / white / indigo blue
  nor: '#ba0c2f',
  norBlue: '#00205b',
  norWhite: '#ffffff',
  line: 'rgba(255,255,255,0.14)',
};

window.__pendingVideoSeeks = 0;
window.__videosSettled = () => window.__pendingVideoSeeks === 0;

function VideoSprite({ src, start, dur, fit = 'cover', style = {}, dim = 0, rate = 1 }) {
  const t = useTime();
  const ref = React.useRef(null);
  const local = t - start;
  const visible = local >= 0 && local < dur;
  React.useEffect(() => {
    const v = ref.current;
    if (!v || !visible) return;
    const clipDur = (isFinite(v.duration) && v.duration > 0.2) ? v.duration : 5;
    // NO-REPEAT: stretch each clip to play once across its window (slight slow-mo),
    // clamped at the end — never loop the same animation (CLAUDE.md #11).
    const autoRate = Math.min(rate, (clipDur - 0.1) / Math.max(dur, 0.1));
    const target = Math.min(local * autoRate, clipDur - 0.07);
    if (!v.paused) v.pause();
    if (Math.abs(v.currentTime - target) > 1 / 60) {
      window.__pendingVideoSeeks++;
      let done = false;
      const settle = () => { if (!done) { done = true; window.__pendingVideoSeeks--; } };
      const onSeeked = () => { if (v.requestVideoFrameCallback) { v.requestVideoFrameCallback(() => settle()); setTimeout(settle, 90); } else setTimeout(settle, 60); };
      v.addEventListener('seeked', onSeeked, { once: true });
      v.addEventListener('error', settle, { once: true });
      setTimeout(settle, 1200);
      v.currentTime = Math.max(0, target);
    }
  }, [local, visible]);
  if (!visible) return null;
  return (<video ref={ref} src={src} muted playsInline preload="auto" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: fit, filter: dim ? `brightness(${1 - dim})` : 'none', ...style }} />);
}
function ClipSprite({ id, ...rest }) { const c = (window.MV_CLIPS || []).find((x) => x.id === id); if (!c) return null; return <VideoSprite src={c.src} start={c.at} dur={c.dur} rate={c.rate || 1} {...rest} />; }

// ── Cinematic dressing ───────────────────────────────────────────────────────
function Letterbox({ size = 90 }) {
  const bar = { position: 'absolute', left: 0, right: 0, height: size, background: '#000', zIndex: 30 };
  return (<>
    <div style={{ ...bar, top: 0 }} />
    <div style={{ ...bar, bottom: 0 }} />
  </>);
}

function Vignette({ strength = 0.55 }) {
  return <div style={{
    position: 'absolute', inset: 0, zIndex: 20, pointerEvents: 'none',
    background: `radial-gradient(ellipse at center, transparent 52%, rgba(0,0,0,${strength}) 100%)`,
  }} />;
}

// Norway flag — red field, white-fimbriated indigo Nordic cross.
function FlagNOR({ w = 120 }) {
  const h = w * 8 / 11;
  const wx = w * 0.34, ww = w * 0.18;
  const hy = h * 0.36, hh = h * 0.28;
  return (
    <div style={{ width: w, height: h, borderRadius: w * 0.04, position: 'relative', overflow: 'hidden', boxShadow: '0 6px 18px rgba(0,0,0,0.45)', background: '#ba0c2f' }}>
      <div style={{ position: 'absolute', left: wx, top: 0, bottom: 0, width: ww, background: '#fff' }} />
      <div style={{ position: 'absolute', left: 0, right: 0, top: hy, height: hh, background: '#fff' }} />
      <div style={{ position: 'absolute', left: wx + ww * 0.22, top: 0, bottom: 0, width: ww * 0.56, background: '#00205b' }} />
      <div style={{ position: 'absolute', left: 0, right: 0, top: hy + hh * 0.22, height: hh * 0.56, background: '#00205b' }} />
    </div>
  );
}

// ── Type & cards ─────────────────────────────────────────────────────────────
function BigTitle({ children, size = 110, color = MV.text, spacing = '0.02em', glow = MV.gold, style = {} }) {
  return (
    <div style={{
      fontFamily: SANS, fontWeight: 900, fontSize: size, color,
      letterSpacing: spacing, lineHeight: 1.04, textAlign: 'center',
      textShadow: glow ? `0 0 42px ${glow}55, 0 4px 24px rgba(0,0,0,0.8)` : '0 4px 24px rgba(0,0,0,0.8)',
      ...style,
    }}>{children}</div>
  );
}

function Kicker({ children, color = MV.gold, size = 30 }) {
  return (
    <div style={{
      fontFamily: SANS, fontWeight: 800, fontSize: size, color,
      letterSpacing: '0.42em', textTransform: 'uppercase', textAlign: 'center',
      textShadow: '0 2px 14px rgba(0,0,0,0.8)',
    }}>{children}</div>
  );
}

// Slide-in lower third: player NAME + position ONLY — never a sentence (rule #10).
function LowerThird({ start, name, role, accent = MV.nor }) {
  const t = useTime();
  const local = t - start;
  if (local < 0) return null;
  const inP = Easing.easeOutCubic(clamp(local / 0.8, 0, 1));
  return (
    <div style={{
      position: 'absolute', left: 110, bottom: 150, zIndex: 25,
      transform: `translateX(${(1 - inP) * -80}px)`, opacity: inP,
    }}>
      <div style={{ display: 'flex', alignItems: 'stretch' }}>
        <div style={{ width: 14, background: accent, borderRadius: '6px 0 0 6px' }} />
        <div style={{ background: MV.panel, backdropFilter: 'blur(6px)', padding: '26px 44px 24px 34px', borderRadius: '0 14px 14px 0', border: `1px solid ${MV.line}`, borderLeft: 'none' }}>
          <div style={{ fontFamily: SANS, fontWeight: 900, fontSize: 56, color: MV.text, letterSpacing: '0.01em' }}>{name}</div>
          <div style={{ fontFamily: SANS, fontWeight: 700, fontSize: 26, color: MV.gold, letterSpacing: '0.22em', textTransform: 'uppercase', marginTop: 6 }}>{role}</div>
        </div>
      </div>
    </div>
  );
}

// Pulsing chant word for the RO! RO! bursts — a ≤4-word chant label, not a sentence.
function ChantPulse({ start, dur, bpm = 66 }) {
  const t = useTime();
  const local = t - start;
  if (local < 0 || local >= dur) return null;
  const beat = (local * bpm) / 60;
  const pulse = 1 + 0.10 * Math.max(0, Math.sin(beat * Math.PI * 2));
  const inP = Easing.easeOutBack(clamp(local / 0.5, 0, 1));
  const fade = local > dur - 0.6 ? (dur - local) / 0.6 : 1;
  return (
    <div style={{
      position: 'absolute', inset: 0, zIndex: 26, display: 'flex', alignItems: 'flex-end', justifyContent: 'center',
      paddingBottom: 170, pointerEvents: 'none', opacity: Math.min(inP, fade),
    }}>
      <div style={{
        fontFamily: SANS, fontWeight: 900, fontSize: 120, color: '#fff', letterSpacing: '0.06em',
        transform: `scale(${pulse})`,
        textShadow: `0 0 60px ${MV.nor}cc, 0 8px 30px rgba(0,0,0,0.85)`, WebkitTextStroke: `3px ${MV.nor}`,
      }}>RO! RO!</div>
    </div>
  );
}

// Confetti burst (deterministic per-frame — no RNG drift between frames).
function Confetti({ start, dur, count = 90, zIndex = 24, colors }) {
  const t = useTime();
  const local = t - start;
  if (local < 0 || local > dur) return null;
  const W = 1920, H = 1080;
  const pal = colors || [MV.nor, '#fff', MV.norBlue, MV.gold];
  const pieces = [];
  for (let i = 0; i < count; i++) {
    const seed = (i * 2654435761 % 1000) / 1000;
    const seed2 = (i * 1597334677 % 1000) / 1000;
    const x = seed * W;
    const speed = 220 + seed2 * 260;
    const y = ((local * speed) + seed2 * H) % (H + 60) - 30;
    const rot = (local * (120 + seed * 240) + seed * 360) % 360;
    pieces.push(
      <div key={i} style={{
        position: 'absolute', left: x, top: y, width: 12 + seed * 10, height: 7 + seed2 * 8,
        background: pal[i % pal.length], opacity: 0.85,
        transform: `rotate(${rot}deg)`, borderRadius: 2,
      }} />
    );
  }
  return <div style={{ position: 'absolute', inset: 0, zIndex, pointerEvents: 'none', overflow: 'hidden' }}>{pieces}</div>;
}

// Letter-staggered title reveal with a gold shine sweep.
function TitleReveal({ text, start, size = 150, color = MV.gold, stagger = 0.055, shine = true }) {
  const t = useTime();
  const local = t - start;
  if (local < 0) return null;
  const chars = String(text).split('');
  const shineX = -40 + clamp((local - chars.length * stagger - 0.2) / 1.1, 0, 1) * 180;
  return (
    <div style={{ position: 'relative', display: 'flex', justifyContent: 'center', overflow: 'visible' }}>
      <div style={{ display: 'flex' }}>
        {chars.map((ch, i) => {
          const p = Easing.easeOutBack(clamp((local - i * stagger) / 0.5, 0, 1));
          return (
            <span key={i} style={{
              fontFamily: '"Inter",sans-serif', fontWeight: 900, fontSize: size, color,
              letterSpacing: '0.02em', lineHeight: 1.04, whiteSpace: 'pre',
              opacity: clamp(p, 0, 1),
              transform: `translateY(${(1 - p) * 70}px) scale(${0.6 + 0.4 * p})`,
              textShadow: `0 0 42px ${color}55, 0 4px 24px rgba(0,0,0,0.8)`,
              display: 'inline-block',
            }}>{ch}</span>
          );
        })}
      </div>
      {shine && (
        <div style={{
          position: 'absolute', inset: '-10% -5%', pointerEvents: 'none',
          background: `linear-gradient(115deg, transparent ${shineX - 12}%, rgba(255,255,255,0.5) ${shineX}%, transparent ${shineX + 12}%)`,
          mixBlendMode: 'overlay',
        }} />
      )}
    </div>
  );
}

// Slow ambient particle drift (deterministic) — depth and life on hold frames.
function AmbientParticles({ start, dur, count = 40, color = '255,210,74', maxR = 5, zIndex = 21 }) {
  const t = useTime();
  const local = t - start;
  if (local < 0 || local > dur) return null;
  const W = 1920, H = 1080;
  const dots = [];
  for (let i = 0; i < count; i++) {
    const s1 = (i * 2654435761 % 1000) / 1000;
    const s2 = (i * 1597334677 % 1000) / 1000;
    const s3 = (i * 805306457 % 1000) / 1000;
    const x = (s1 * W + Math.sin(local * (0.25 + s2 * 0.4) + s3 * 6.28) * 60) % W;
    const y = H - ((local * (14 + s2 * 26)) + s3 * H) % (H + 40) + 20;
    const r = 1.5 + s2 * maxR;
    const o = 0.12 + 0.3 * s3 * (0.6 + 0.4 * Math.sin(local * 1.4 + i));
    dots.push(<div key={i} style={{
      position: 'absolute', left: x, top: y, width: r * 2, height: r * 2, borderRadius: '50%',
      background: `rgba(${color},${Math.max(0, o).toFixed(3)})`,
      filter: 'blur(1px)',
    }} />);
  }
  return <div style={{ position: 'absolute', inset: 0, zIndex, pointerEvents: 'none', overflow: 'hidden' }}>{dots}</div>;
}

// Cinematic transitions at scene boundaries: luminous flash or dip-to-black.
function TransitionLayer() {
  const t = useTime();
  let flash = 0, dip = 0;
  for (const tr of (window.MV_TRANSITIONS || [])) {
    const d = t - tr.at;
    if (tr.type === 'flash') {
      if (d > -0.12 && d < 0.3) flash = Math.max(flash, d < 0 ? (d + 0.12) / 0.12 : 1 - d / 0.3);
    } else {
      if (d > -0.4 && d < 0.4) dip = Math.max(dip, 1 - Math.abs(d) / 0.4);
    }
  }
  if (flash <= 0 && dip <= 0) return null;
  return (<>
    {dip > 0 && <div style={{ position: 'absolute', inset: 0, zIndex: 40, background: '#000', opacity: clamp(dip, 0, 1) }} />}
    {flash > 0 && <div style={{ position: 'absolute', inset: 0, zIndex: 41, background: '#fff', opacity: clamp(flash * 0.85, 0, 1) }} />}
  </>);
}
