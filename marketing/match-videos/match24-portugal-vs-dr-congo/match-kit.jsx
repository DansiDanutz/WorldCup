// match-kit.jsx — shared primitives for the Match 24 video (loads after animations.jsx)
// Dark cinematic broadcast theme. Episode 24 is IMAGE-BASED: Ken-Burns motion on
// still PNGs (no generated video clips). SOCCER ONLY — round-neck shirts, a pitch
// with goals; never gridiron.
// NOTE: the .civ / .ecu colour slots and FlagCIV / FlagECU names are reused from
// the Ep15 template as generic HOME / AWAY slots — here HOME = Portugal (dark red),
// AWAY = DR Congo (sky blue). Renaming throughout would only add risk.

const SANS = '"Inter", system-ui, -apple-system, "Segoe UI", Roboto, sans-serif';

const MV = {
  bg: '#07090f',
  panel: 'rgba(13,18,30,0.86)',
  text: '#f4f6fa',
  muted: '#93a0b4',
  gold: '#ffd24a',
  goldDeep: '#c9942e',
  // Portugal — A Seleção: dark red + green  (HOME slot)
  civ: '#aa151b',
  civGreen: '#1f8a4c',
  // DR Congo — the Leopards: sky blue + red + yellow  (AWAY slot)
  ecu: '#007fff',
  ecuBlue: '#005bbb',
  ecuRed: '#ce1126',
  ecuYellow: '#f7d618',
  green: '#106b4f',
  line: 'rgba(255,255,255,0.14)',
};

// Image-based episode: keep the render-settle hooks as harmless no-ops so the
// shared render.mjs (which calls window.__videosSettled) never wedges.
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
    const target = Math.min((local * rate) % clipDur, clipDur - 0.07);
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

// ── Ken Burns still (the workhorse of this episode) ──────────────────────────
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
// FlagCIV / FlagECU names kept as generic HOME / AWAY flag slots (see header note).
// HOME = Portugal: vertical green (2/5) / dark red (3/5) with a central crest token.
function FlagCIV({ w = 120 }) {
  const h = w * 2 / 3;
  return (
    <div style={{ width: w, height: h, borderRadius: w * 0.05, position: 'relative', overflow: 'hidden', display: 'flex', boxShadow: '0 6px 18px rgba(0,0,0,0.45)' }}>
      <div style={{ width: '40%', background: '#1f8a4c' }} />
      <div style={{ width: '60%', background: '#aa151b' }} />
      {/* armillary-sphere / shield token on the green-red seam */}
      <div style={{ position: 'absolute', left: '40%', top: '50%', transform: 'translate(-50%,-50%)', width: h * 0.4, height: h * 0.4, borderRadius: '50%', background: '#f7d618', border: '2px solid rgba(255,255,255,0.85)' }} />
    </div>
  );
}

// AWAY = DR Congo: sky-blue field with a diagonal red stripe edged in yellow, and
// a yellow star in the upper hoist (a crisp abstraction of the national flag).
function FlagECU({ w = 120 }) {
  const h = w * 2 / 3;
  return (
    <div style={{ width: w, height: h, borderRadius: w * 0.05, position: 'relative', overflow: 'hidden', boxShadow: '0 6px 18px rgba(0,0,0,0.45)', background: '#007fff' }}>
      {/* diagonal red stripe, yellow-edged */}
      <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(115deg, transparent 38%, #f7d618 38%, #f7d618 42%, #ce1126 42%, #ce1126 58%, #f7d618 58%, #f7d618 62%, transparent 62%)' }} />
      {/* yellow star, upper hoist */}
      <div style={{ position: 'absolute', left: '16%', top: '20%', width: h * 0.26, height: h * 0.26, background: '#f7d618', clipPath: 'polygon(50% 0%, 61% 35%, 98% 35%, 68% 57%, 79% 91%, 50% 70%, 21% 91%, 32% 57%, 2% 35%, 39% 35%)' }} />
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

// Slide-in lower third for player segments.
function LowerThird({ start, name, role, line, accent = MV.civ }) {
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
          <div style={{ fontFamily: SANS, fontWeight: 700, fontSize: 26, color: accent, letterSpacing: '0.22em', textTransform: 'uppercase', marginTop: 6 }}>{role}</div>
          {line && <div style={{ fontFamily: SANS, fontWeight: 500, fontSize: 24, color: MV.muted, marginTop: 10, maxWidth: 640 }}>{line}</div>}
        </div>
      </div>
    </div>
  );
}

// Match scoreboard chip (top center). POR — COD.
function ScoreBug({ start, civ = 0, ecu = 0, minute }) {
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
      <div style={{ ...cell, background: MV.civ, color: '#fff' }}>POR</div>
      <div style={{ ...cell, fontSize: 38, color: MV.gold }}>{civ} — {ecu}</div>
      <div style={{ ...cell, background: MV.ecu, color: '#06203a' }}>COD</div>
      {minute && <div style={{ ...cell, fontSize: 26, color: MV.muted, borderLeft: `1px solid ${MV.line}` }}>{minute}</div>}
    </div>
  );
}

// Stat row for team intro side panels
function StatLine({ label, value, accent = MV.gold, delay = 0, start }) {
  const t = useTime();
  const local = t - start - delay;
  const p = Easing.easeOutCubic(clamp(local / 0.6, 0, 1));
  if (local < 0) return null;
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', gap: 30, opacity: p, transform: `translateY(${(1 - p) * 18}px)`, padding: '13px 0', borderBottom: `1px solid ${MV.line}` }}>
      <span style={{ fontFamily: SANS, fontWeight: 600, fontSize: 26, color: MV.muted }}>{label}</span>
      <span style={{ fontFamily: SANS, fontWeight: 800, fontSize: 26, color: accent, textAlign: 'right' }}>{value}</span>
    </div>
  );
}

// Golden goal flash + text burst used at the goal moments.
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
      }}>GOAL!</div>
    </div>
  </>);
}

// Confetti burst (deterministic per-frame — no RNG drift between frames).
function Confetti({ start, dur, count = 90, zIndex = 24, colors }) {
  const t = useTime();
  const local = t - start;
  if (local < 0 || local > dur) return null;
  const W = 1920, H = 1080;
  const pal = colors || [MV.gold, '#fff', MV.civ, MV.civGreen];
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

// CTA buttons (subscribe / like / share) with staged pop-ins and a pulsing ring.
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

// ── 10/10 polish layer ───────────────────────────────────────────────────────

// Letter-staggered title reveal with a gold shine sweep — replaces flat fades.
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

// Gentle flag wave (applied as a wrapper so the CSS flags feel alive).
function Waving({ children, speed = 1.6, amount = 2.2 }) {
  const t = useTime();
  return (
    <div style={{
      transform: `rotate(${Math.sin(t * speed) * amount * 0.4}deg) skewY(${Math.sin(t * speed * 1.3) * amount * 0.35}deg)`,
      transformOrigin: 'left center',
    }}>{children}</div>
  );
}

// A reusable "pitch with goals" CSS backdrop — soccer-only, never gridiron.
// Green turf, centre circle + halfway line, and a goal frame top & bottom.
function PitchBackdrop({ tint = '#0a3a1e', dim = 0 }) {
  return (
    <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', filter: dim ? `brightness(${1 - dim})` : 'none' }}>
      <div style={{ position: 'absolute', inset: 0, background: `linear-gradient(180deg, ${tint} 0%, #06160c 100%)` }} />
      {/* mowed stripes */}
      {Array.from({ length: 10 }).map((_, i) => (
        <div key={i} style={{ position: 'absolute', left: `${i * 10}%`, top: 0, bottom: 0, width: '10%', background: i % 2 ? 'rgba(255,255,255,0.025)' : 'transparent' }} />
      ))}
      {/* halfway line + centre circle */}
      <div style={{ position: 'absolute', left: 0, right: 0, top: '50%', height: 4, background: 'rgba(255,255,255,0.18)' }} />
      <div style={{ position: 'absolute', left: '50%', top: '50%', width: 260, height: 260, marginLeft: -130, marginTop: -130, borderRadius: '50%', border: '4px solid rgba(255,255,255,0.18)' }} />
      {/* soccer goal frames (round-neck-shirt era, NO goalposts cross-bars of gridiron) */}
      <div style={{ position: 'absolute', left: '50%', top: 0, width: 420, height: 120, marginLeft: -210, border: '6px solid rgba(255,255,255,0.22)', borderTop: 'none' }} />
      <div style={{ position: 'absolute', left: '50%', bottom: 0, width: 420, height: 120, marginLeft: -210, border: '6px solid rgba(255,255,255,0.22)', borderBottom: 'none' }} />
    </div>
  );
}

// Cinematic transitions at scene boundaries: luminous flash or dip-to-black.
// Boundaries are read from window.MV_TRANSITIONS = [{at, type:'flash'|'dip'}].
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
