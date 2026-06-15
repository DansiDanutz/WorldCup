// match-kit.jsx — shared primitives for the Match 21 video (loads after animations.jsx)
// CLIP-BASED cinematic broadcast theme + frame-exact <VideoSprite>/<ClipSprite>
// for the paid Higgsfield animation clips. (Ported from the Ep13 clip kit.)
// HARD RULES: NO subtitles / NO caption sentences. The only text allowed on screen
// is the title card, player NAME labels (surname only), the FRA—SEN score bug, the
// "OUR PREDICTION" watermark, and worldcup26.world. SOCCER ONLY.

const SANS = '"Inter", system-ui, -apple-system, "Segoe UI", Roboto, sans-serif';

const MV = {
  bg: '#07090f',
  panel: 'rgba(13,18,30,0.86)',
  text: '#f4f6fa',
  muted: '#93a0b4',
  gold: '#ffd24a',
  goldDeep: '#c9942e',
  // France — Les Bleus: navy / white / red
  fra: '#1a2f6b',
  fraDeep: '#0e1c47',
  fraRed: '#e31b23',
  // Senegal — Lions of Teranga: green / yellow / red
  sen: '#00853f',
  senYellow: '#fdef42',
  senRed: '#e31b23',
  green: '#106b4f',
  line: 'rgba(255,255,255,0.14)',
};

// ── Frame-exact video playback ───────────────────────────────────────────────
// The renderer drives the timeline with window.__seek(t) while paused; each
// mounted VideoSprite must then show the exact source frame for that playhead.
window.__pendingVideoSeeks = 0;
window.__videosSettled = () => window.__pendingVideoSeeks === 0;

function VideoSprite({ src, start, dur, fit = 'cover', style = {}, dim = 0, rate = 1 }) {
  const t = useTime();
  const { playing } = useTimeline();
  const ref = React.useRef(null);
  const local = t - start;
  const visible = local >= 0 && local < dur;

  React.useEffect(() => {
    const v = ref.current;
    if (!v || !visible) return;
    const clipDur = (isFinite(v.duration) && v.duration > 0.2) ? v.duration : 5;
    const target = Math.min((local * rate) % clipDur, clipDur - 0.07);
    if (playing) {
      if (v.paused) v.play().catch(() => {});
      if (Math.abs(v.currentTime - target) > 0.4) v.currentTime = target;
    } else {
      if (!v.paused) v.pause();
      if (Math.abs(v.currentTime - target) > 1 / 60) {
        window.__pendingVideoSeeks++;
        let done = false;
        const settle = () => { if (!done) { done = true; window.__pendingVideoSeeks--; } };
        const onSeeked = () => {
          if (v.requestVideoFrameCallback) {
            v.requestVideoFrameCallback(() => settle());
            setTimeout(settle, 90);
          } else setTimeout(settle, 60);
        };
        v.addEventListener('seeked', onSeeked, { once: true });
        v.addEventListener('error', settle, { once: true });
        setTimeout(settle, 1200);
        v.currentTime = Math.max(0, target);
      }
    }
  }, [local, visible, playing]);

  if (!visible) return null;
  return (
    <video
      ref={ref}
      src={src}
      muted
      playsInline
      preload="auto"
      style={{
        position: 'absolute', inset: 0, width: '100%', height: '100%',
        objectFit: fit,
        filter: dim ? `brightness(${1 - dim})` : 'none',
        ...style,
      }}
    />
  );
}

// Looks up a clip window from clips.json (loaded into window.MV_CLIPS at boot)
function ClipSprite({ id, ...rest }) {
  const c = (window.MV_CLIPS || []).find((x) => x.id === id);
  if (!c) return null;
  return <VideoSprite src={c.src} start={c.at} dur={c.dur} rate={c.rate || 1} {...rest} />;
}

// ── Ken Burns still (last-resort fallback ONLY for the player line-up shots) ──
function KenBurns({ src, start, dur, from = 1.0, to = 1.12, panX = 0, panY = 0, dim = 0, fit = 'cover', style = {} }) {
  const t = useTime();
  const local = t - start;
  if (local < 0 || local >= dur) return null;
  const p = clamp(local / dur, 0, 1);
  const s = from + (to - from) * Easing.easeInOutSine(p);
  return (
    <img src={src} alt="" style={{
      position: 'absolute', inset: 0, width: '100%', height: '100%',
      objectFit: fit,
      transform: `scale(${s}) translate(${panX * p}px, ${panY * p}px)`,
      transformOrigin: 'center',
      filter: dim ? `brightness(${1 - dim})` : 'none',
      ...style,
    }} />
  );
}

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

// ── Flags (pure CSS approximations, crisp at any size) ───────────────────────
// France: vertical navy / white / red tricolore.
function FlagFRA({ w = 120 }) {
  const h = w * 2 / 3;
  return (
    <div style={{ width: w, height: h, borderRadius: w * 0.05, position: 'relative', overflow: 'hidden', display: 'flex', boxShadow: '0 6px 18px rgba(0,0,0,0.45)' }}>
      <div style={{ flex: 1, background: '#1a2f6b' }} />
      <div style={{ flex: 1, background: '#fff' }} />
      <div style={{ flex: 1, background: '#e31b23' }} />
    </div>
  );
}

// Senegal: vertical green / yellow / red, with a green five-pointed star centred.
function FlagSEN({ w = 120 }) {
  const h = w * 2 / 3;
  const star = h * 0.42;
  return (
    <div style={{ width: w, height: h, borderRadius: w * 0.05, position: 'relative', overflow: 'hidden', display: 'flex', boxShadow: '0 6px 18px rgba(0,0,0,0.45)' }}>
      <div style={{ flex: 1, background: '#00853f' }} />
      <div style={{ flex: 1, background: '#fdef42' }} />
      <div style={{ flex: 1, background: '#e31b23' }} />
      <div style={{
        position: 'absolute', left: '50%', top: '50%', transform: 'translate(-50%,-50%)',
        width: star, height: star, background: '#00853f',
        clipPath: 'polygon(50% 0%, 61% 35%, 98% 35%, 68% 57%, 79% 91%, 50% 70%, 21% 91%, 32% 57%, 2% 35%, 39% 35%)',
      }} />
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

// Player NAME label (surname only — NO role sentence). Slides in bottom-left.
function NameLabel({ start, name, accent = MV.fra }) {
  const t = useTime();
  const local = t - start;
  if (local < 0) return null;
  const inP = Easing.easeOutCubic(clamp(local / 0.7, 0, 1));
  return (
    <div style={{
      position: 'absolute', left: 110, bottom: 150, zIndex: 25,
      transform: `translateX(${(1 - inP) * -80}px)`, opacity: inP,
      display: 'flex', alignItems: 'stretch',
    }}>
      <div style={{ width: 16, background: accent, borderRadius: '6px 0 0 6px' }} />
      <div style={{ background: MV.panel, backdropFilter: 'blur(6px)', padding: '20px 52px 20px 38px', borderRadius: '0 14px 14px 0', border: `1px solid ${MV.line}`, borderLeft: 'none' }}>
        <div style={{ fontFamily: SANS, fontWeight: 900, fontSize: 72, color: MV.text, letterSpacing: '0.04em', textTransform: 'uppercase', lineHeight: 1 }}>{name}</div>
      </div>
    </div>
  );
}

// Match scoreboard chip (top center). FRA — SEN.
function ScoreBug({ start, fra = 0, sen = 0, minute }) {
  const t = useTime();
  const local = t - start;
  if (local < 0) return null;
  const inP = Easing.easeOutBack(clamp(local / 0.7, 0, 1));
  const cell = { fontFamily: SANS, fontWeight: 900, fontSize: 34, color: MV.text, padding: '10px 18px' };
  return (
    <div style={{
      position: 'absolute', top: 118, left: '50%', zIndex: 26,
      transform: `translateX(-50%) scale(${inP})`, opacity: clamp(inP, 0, 1),
      display: 'flex', alignItems: 'center',
      background: MV.panel, border: `1px solid ${MV.line}`, borderRadius: 14,
      boxShadow: '0 10px 36px rgba(0,0,0,0.5)', overflow: 'hidden',
    }}>
      <div style={{ ...cell, background: MV.fraDeep, color: '#fff' }}>FRA</div>
      <div style={{ ...cell, fontSize: 38, color: MV.gold }}>{fra} — {sen}</div>
      <div style={{ ...cell, background: MV.sen, color: '#fff' }}>SEN</div>
      {minute && <div style={{ ...cell, fontSize: 26, color: MV.muted, borderLeft: `1px solid ${MV.line}` }}>{minute}</div>}
    </div>
  );
}

// "OUR PREDICTION" watermark chip (top-right) — allowed graphic furniture.
function PredictionMark({ start = 0 }) {
  const t = useTime();
  if (t < start) return null;
  return (
    <div style={{
      position: 'absolute', top: 116, right: 70, zIndex: 26,
      background: 'rgba(7,9,15,0.7)', border: `1px solid ${MV.gold}66`, borderRadius: 999,
      padding: '10px 24px', display: 'flex', alignItems: 'center', gap: 12,
    }}>
      <span style={{ width: 9, height: 9, borderRadius: '50%', background: MV.gold, boxShadow: `0 0 10px ${MV.gold}` }} />
      <span style={{ fontFamily: SANS, fontWeight: 900, fontSize: 22, color: MV.gold, letterSpacing: '0.22em' }}>OUR PREDICTION</span>
    </div>
  );
}

// Golden goal flash (NO sentence text — the score bug carries the number).
function GoalFlash({ at, color = MV.gold }) {
  const t = useTime();
  const local = t - at;
  if (local < 0 || local > 3.4) return null;
  const flash = local < 0.35 ? 1 - local / 0.35 : 0;
  const p = Easing.easeOutBack(clamp(local / 0.55, 0, 1));
  const fade = local > 2.7 ? 1 - (local - 2.7) / 0.7 : 1;
  return (<>
    <div style={{ position: 'absolute', inset: 0, zIndex: 27, background: '#fff', opacity: flash * 0.9 }} />
    <div style={{
      position: 'absolute', inset: 0, zIndex: 28, display: 'flex', alignItems: 'center', justifyContent: 'center',
      opacity: fade, transform: `scale(${0.6 + 0.4 * p}) rotate(${(1 - p) * -6}deg)`,
    }}>
      <div style={{
        fontFamily: SANS, fontWeight: 900, fontSize: 230, color, letterSpacing: '0.04em',
        textShadow: `0 0 80px ${color}aa, 0 10px 40px rgba(0,0,0,0.8)`, WebkitTextStroke: '4px rgba(70,40,0,0.45)',
      }}>GOAL</div>
    </div>
  </>);
}

// Confetti burst (deterministic per-frame — no RNG drift between frames).
function Confetti({ start, dur, count = 90, zIndex = 24, colors }) {
  const t = useTime();
  const local = t - start;
  if (local < 0 || local > dur) return null;
  const W = 1920, H = 1080;
  const pal = colors || [MV.gold, '#fff', MV.fra, MV.sen];
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

// CTA icon buttons (no sentence — icon + single word).
function CtaButton({ start, delay, label, icon, accent, x }) {
  const t = useTime();
  const local = t - start - delay;
  if (local < 0) return null;
  const p = Easing.easeOutBack(clamp(local / 0.6, 0, 1));
  const pulse = 1 + 0.035 * Math.sin(Math.max(0, local - 0.6) * 4.2);
  return (
    <div style={{
      position: 'absolute', left: x, top: 600, transform: `translateX(-50%) scale(${p * pulse})`, opacity: clamp(p, 0, 1),
      display: 'flex', alignItems: 'center', gap: 18,
      background: accent, borderRadius: 999, padding: '26px 52px',
      boxShadow: `0 18px 60px ${accent}66`,
    }}>
      <span style={{ fontSize: 44 }}>{icon}</span>
      <span style={{ fontFamily: SANS, fontWeight: 900, fontSize: 42, color: '#fff', letterSpacing: '0.02em' }}>{label}</span>
    </div>
  );
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

// Slow ambient particle drift (deterministic) — depth on hold frames.
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

// Gentle flag wave wrapper.
function Waving({ children, speed = 1.6, amount = 2.2 }) {
  const t = useTime();
  return (
    <div style={{
      transform: `rotate(${Math.sin(t * speed) * amount * 0.4}deg) skewY(${Math.sin(t * speed * 1.3) * amount * 0.35}deg)`,
      transformOrigin: 'left center',
    }}>{children}</div>
  );
}

// Subtle animated film grain for cinematic drama grades.
const GRAIN_URI = "data:image/svg+xml;utf8," + encodeURIComponent(
  `<svg xmlns='http://www.w3.org/2000/svg' width='240' height='240'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2'/><feColorMatrix type='saturate' values='0'/></filter><rect width='240' height='240' filter='url(%23n)' opacity='0.5'/></svg>`);
function FilmGrain({ start, dur, opacity = 0.07 }) {
  const t = useTime();
  const local = t - start;
  if (local < 0 || local > dur) return null;
  const jx = Math.floor((local * 24) % 7) * 31;
  const jy = Math.floor((local * 17) % 5) * 47;
  return <div style={{
    position: 'absolute', inset: 0, zIndex: 29, pointerEvents: 'none', opacity,
    backgroundImage: `url("${GRAIN_URI}")`, backgroundPosition: `${jx}px ${jy}px`, mixBlendMode: 'overlay',
  }} />;
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
