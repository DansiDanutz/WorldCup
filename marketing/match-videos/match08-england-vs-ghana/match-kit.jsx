// match-kit.jsx — shared primitives for the Match 2 video (loads after animations.jsx)
// Dark cinematic broadcast theme + frame-exact <VideoSprite> for generated clips.

const SANS = '"Inter", system-ui, -apple-system, "Segoe UI", Roboto, sans-serif';

const MV = {
  bg: '#07090f',
  panel: 'rgba(13,18,30,0.86)',
  text: '#f4f6fa',
  muted: '#93a0b4',
  gold: '#ffd24a',
  goldDeep: '#c9942e',
  kor: '#d4313f',          // Taegeuk red
  korBlue: '#1f4fa3',
  cze: '#dd2c3e',          // Czech red
  czeBlue: '#11457e',
  green: '#106b4f',
  line: 'rgba(255,255,255,0.14)',
};

// ── Frame-exact video playback ───────────────────────────────────────────────
// The renderer drives the timeline with window.__seek(t) while paused; each
// mounted VideoSprite must then show the exact source frame for that playhead.
// We seek the <video> manually and keep a global pending-seek counter so
// render.mjs can wait until every clip has settled before screenshotting.
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
    // Loop the short source for as long as the sprite is on screen, holding
    // just shy of the end so a loop boundary never shows a black frame.
    const target = Math.min((local * rate) % clipDur, clipDur - 0.07);
    if (playing) {
      // Preview mode: free-run playback, only correct large drift.
      if (v.paused) v.play().catch(() => {});
      if (Math.abs(v.currentTime - target) > 0.4) v.currentTime = target;
    } else {
      if (!v.paused) v.pause();
      if (Math.abs(v.currentTime - target) > 1 / 60) {
        window.__pendingVideoSeeks++;
        let done = false;
        const settle = () => { if (!done) { done = true; window.__pendingVideoSeeks--; } };
        const onSeeked = () => {
          // give the compositor a beat to present the seeked frame, racing
          // rVFC against a short timeout (rVFC can stall in headless shell)
          if (v.requestVideoFrameCallback) {
            v.requestVideoFrameCallback(() => settle());
            setTimeout(settle, 90);
          } else setTimeout(settle, 60);
        };
        v.addEventListener('seeked', onSeeked, { once: true });
        v.addEventListener('error', settle, { once: true });
        setTimeout(settle, 1200); // safety: never wedge the renderer
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
// so the visual placement can never drift from the audio mix in mux.mjs.
function ClipSprite({ id, ...rest }) {
  const c = (window.MV_CLIPS || []).find((x) => x.id === id);
  if (!c) return null;
  return <VideoSprite src={c.src} start={c.at} dur={c.dur} rate={c.rate || 1} {...rest} />;
}

// ── Ken Burns still ──────────────────────────────────────────────────────────
function KenBurns({ src, start, dur, from = 1.0, to = 1.12, panX = 0, panY = 0, dim = 0, style = {} }) {
  const t = useTime();
  const local = t - start;
  if (local < 0 || local >= dur) return null;
  const p = clamp(local / dur, 0, 1);
  const s = from + (to - from) * Easing.easeInOutSine(p);
  return (
    <img src={src} alt="" style={{
      position: 'absolute', inset: 0, width: '100%', height: '100%',
      objectFit: 'cover',
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

function FilmGrainPulse({ start, dur, color = '255,210,74', maxOpacity = 0.2, hz = 1.15 }) {
  const t = useTime();
  const local = t - start;
  if (local < 0 || local >= dur) return null;
  const beat = Math.pow(Math.max(0, Math.sin(local * Math.PI * hz)), 6);
  return <div style={{
    position: 'absolute', inset: 0, zIndex: 21, pointerEvents: 'none',
    background: `radial-gradient(ellipse at center, rgba(${color},${(maxOpacity * beat).toFixed(3)}) 0%, transparent 65%)`,
  }} />;
}

// ── Flags (pure CSS approximations, crisp at any size) ───────────────────────
function FlagKOR({ w = 120 }) {
  const h = w * 2 / 3;
  return (
    <div style={{ width: w, height: h, background: '#fff', borderRadius: w * 0.05, position: 'relative', overflow: 'hidden', boxShadow: '0 6px 18px rgba(0,0,0,0.45)' }}>
      <div style={{ position: 'absolute', left: '50%', top: '50%', width: w * 0.34, height: w * 0.34, transform: 'translate(-50%,-50%) rotate(-18deg)', borderRadius: '50%', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', inset: 0, background: '#cd2e3a' }} />
        <div style={{ position: 'absolute', left: 0, right: 0, top: '50%', bottom: 0, background: '#0047a0' }} />
        <div style={{ position: 'absolute', left: '0%', top: '25%', width: '50%', height: '50%', borderRadius: '50%', background: '#cd2e3a' }} />
        <div style={{ position: 'absolute', right: '0%', top: '25%', width: '50%', height: '50%', borderRadius: '50%', background: '#0047a0' }} />
      </div>
      {[-1, 1].map((sx) => [-1, 1].map((sy) => (
        <div key={`${sx}${sy}`} style={{
          position: 'absolute', left: '50%', top: '50%', width: w * 0.16, height: w * 0.115,
          transform: `translate(-50%,-50%) translate(${sx * w * 0.30}px, ${sy * h * 0.30}px) rotate(${sx * sy > 0 ? -34 : 34}deg)`,
          display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
        }}>
          {[0, 1, 2].map((i) => <div key={i} style={{ height: '22%', background: '#0b0b0b' }} />)}
        </div>
      )))}
    </div>
  );
}

function FlagCZE({ w = 120 }) {
  const h = w * 2 / 3;
  return (
    <div style={{ width: w, height: h, borderRadius: w * 0.05, position: 'relative', overflow: 'hidden', boxShadow: '0 6px 18px rgba(0,0,0,0.45)' }}>
      <div style={{ position: 'absolute', inset: 0, background: '#fff' }} />
      <div style={{ position: 'absolute', left: 0, right: 0, top: '50%', bottom: 0, background: '#d7141a' }} />
      <div style={{ position: 'absolute', left: 0, top: 0, width: 0, height: 0, borderTop: `${h / 2}px solid transparent`, borderBottom: `${h / 2}px solid transparent`, borderLeft: `${w * 0.45}px solid #11457e` }} />
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
function LowerThird({ start, name, role, line, accent = MV.kor }) {
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

// Match scoreboard chip (top center)
function ScoreBug({ start, kor = 0, cze = 0, minute, homeLabel = 'CAN', awayLabel = 'BIH', homeColor = '#d52b1e', awayColor = '#002395' }) {
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
      <div style={{ ...cell, background: homeColor }}>{homeLabel}</div>
      <div style={{ ...cell, fontSize: 38, color: MV.gold }}>{kor} — {cze}</div>
      <div style={{ ...cell, background: awayColor }}>{awayLabel}</div>
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

// Golden goal flash + text burst used at the 41' goal moment.
function GoalFlash({ at, text = 'GOAL!', color = MV.gold }) {
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
        textShadow: `0 0 80px ${color}aa, 0 10px 40px rgba(0,0,0,0.8)`, WebkitTextStroke: '4px rgba(120,70,0,0.55)',
      }}>{text}</div>
    </div>
  </>);
}

// Confetti burst (deterministic per-frame — no RNG drift between frames).
function Confetti({ start, dur, count = 90, zIndex = 24 }) {
  const t = useTime();
  const local = t - start;
  if (local < 0 || local > dur) return null;
  const W = 1920, H = 1080;
  const pieces = [];
  for (let i = 0; i < count; i++) {
    const seed = (i * 2654435761 % 1000) / 1000;
    const seed2 = (i * 1597334677 % 1000) / 1000;
    const x = seed * W;
    const speed = 220 + seed2 * 260;
    const y = ((local * speed) + seed2 * H) % (H + 60) - 30;
    const rot = (local * (120 + seed * 240) + seed * 360) % 360;
    const colors = [MV.gold, '#fff', MV.kor, MV.korBlue];
    pieces.push(
      <div key={i} style={{
        position: 'absolute', left: x, top: y, width: 12 + seed * 10, height: 7 + seed2 * 8,
        background: colors[i % colors.length], opacity: 0.85,
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

// Cinematic transitions at scene boundaries: luminous flash or dip-to-black.
// Boundaries are read from window.MV_TRANSITIONS = [{at, type:'flash'|'dip'}].
function TransitionLayer() {
  const t = useTime();
  let flash = 0, dip = 0;
  for (const tr of (window.MV_TRANSITIONS || [])) {
    const d = t - tr.at;
    if (tr.type === 'flash') {
      // 0.12s rise into the cut, 0.25s decay out of it
      if (d > -0.12 && d < 0.3) flash = Math.max(flash, d < 0 ? (d + 0.12) / 0.12 : 1 - d / 0.3);
    } else {
      // 0.35s dip each side of the cut
      if (d > -0.4 && d < 0.4) dip = Math.max(dip, 1 - Math.abs(d) / 0.4);
    }
  }
  if (flash <= 0 && dip <= 0) return null;
  return (<>
    {dip > 0 && <div style={{ position: 'absolute', inset: 0, zIndex: 40, background: '#000', opacity: clamp(dip, 0, 1) }} />}
    {flash > 0 && <div style={{ position: 'absolute', inset: 0, zIndex: 41, background: '#fff', opacity: clamp(flash * 0.85, 0, 1) }} />}
  </>);
}


// ── Episode 3 additions ──────────────────────────────────────────────────────

function FlagCAN({ w = 120 }) {
  const h = w / 2;
  return (
    <div style={{ width: w, height: h, borderRadius: w * 0.04, position: 'relative', overflow: 'hidden', boxShadow: '0 6px 18px rgba(0,0,0,0.45)', display: 'flex' }}>
      <div style={{ width: '25%', background: '#d52b1e' }} />
      <div style={{ width: '50%', background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <span style={{ fontSize: h * 0.62, lineHeight: 1, color: '#d52b1e' }}>🍁</span>
      </div>
      <div style={{ width: '25%', background: '#d52b1e' }} />
    </div>
  );
}

function FlagBIH({ w = 120 }) {
  const h = w / 2;
  return (
    <div style={{ width: w, height: h, borderRadius: w * 0.04, position: 'relative', overflow: 'hidden', background: '#002395', boxShadow: '0 6px 18px rgba(0,0,0,0.45)' }}>
      <div style={{ position: 'absolute', left: w * 0.28, top: -h * 0.12, width: 0, height: 0, borderLeft: `${h * 1.05}px solid transparent`, borderTop: `${h * 1.24}px solid #fecb00` }} />
      {[0.06, 0.24, 0.42, 0.6, 0.78].map((t, i) => (
        <span key={i} style={{ position: 'absolute', left: w * (0.16 + t * 0.13), top: h * (t - 0.06), fontSize: h * 0.2, color: '#fff' }}>★</span>
      ))}
    </div>
  );
}

// Kinetic caption: a key VO phrase slammed on screen word-by-word (retention technique).
function KineticCaption({ start, dur = 3.2, words, color = MV.gold, size = 92, y = '58%' }) {
  const t = useTime();
  const local = t - start;
  if (local < 0 || local > dur) return null;
  const fade = local > dur - 0.5 ? (dur - local) / 0.5 : 1;
  return (
    <div style={{
      position: 'absolute', left: 0, right: 0, top: y, display: 'flex', justifyContent: 'center', gap: 26,
      zIndex: 27, opacity: clamp(fade, 0, 1),
    }}>
      {words.map((w, i) => {
        const p = Easing.easeOutBack(clamp((local - i * 0.18) / 0.4, 0, 1));
        return (
          <span key={i} style={{
            fontFamily: '"Inter",sans-serif', fontWeight: 900, fontSize: size, color,
            transform: `scale(${0.3 + 0.7 * p}) rotate(${(1 - p) * (i % 2 ? 5 : -5)}deg)`, opacity: clamp(p, 0, 1),
            textShadow: `0 0 50px ${color}66, 0 6px 26px rgba(0,0,0,0.9)`, WebkitTextStroke: '3px rgba(0,0,0,0.5)',
            letterSpacing: '0.03em', display: 'inline-block',
          }}>{w}</span>
        );
      })}
    </div>
  );
}

// Animated pick-card with a live video clip inside (uses the paid animation library).
function VideoCard({ clipId, name, coef, delay, start, accent = MV.gold }) {
  const t = useTime();
  const p = Easing.easeOutBack(clamp((t - start - delay) / 0.7, 0, 1));
  if (p <= 0) return null;
  return (
    <div style={{
      width: 380, transform: `translateY(${(1 - p) * 80}px) scale(${0.85 + 0.15 * p})`, opacity: clamp(p, 0, 1),
      borderRadius: 24, overflow: 'hidden', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.2)',
      boxShadow: '0 28px 90px rgba(0,0,0,0.55)',
    }}>
      <div style={{ height: 300, position: 'relative', overflow: 'hidden' }}>
        <ClipSprite id={clipId} />
      </div>
      <div style={{ padding: '20px 18px 22px', textAlign: 'center', borderTop: `4px solid ${accent}` }}>
        <div style={{ fontFamily: '"Inter",sans-serif', fontWeight: 900, fontSize: 30, color: '#fff' }}>{name}</div>
        <div style={{ fontFamily: '"Inter",sans-serif', fontWeight: 800, fontSize: 24, color: accent, marginTop: 6 }}>{coef}</div>
      </div>
    </div>
  );
}

// ── Episode 4 flags ──────────────────────────────────────────────────────────
function FlagUSA({ w = 120 }) {
  const h = w * 0.526;
  return (
    <div style={{ width: w, height: h, borderRadius: w * 0.04, position: 'relative', overflow: 'hidden', boxShadow: '0 6px 18px rgba(0,0,0,0.45)' }}>
      {[...Array(13)].map((_, i) => (
        <div key={i} style={{ position: 'absolute', left: 0, right: 0, top: `${(i / 13) * 100}%`, height: `${100 / 13}%`, background: i % 2 ? '#fff' : '#b22234' }} />
      ))}
      <div style={{ position: 'absolute', left: 0, top: 0, width: '42%', height: `${(7 / 13) * 100}%`, background: '#3c3b6e', display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'center', gap: w * 0.012, padding: w * 0.012 }}>
        {[...Array(15)].map((_, i) => <span key={i} style={{ color: '#fff', fontSize: w * 0.045, lineHeight: 0.8 }}>★</span>)}
      </div>
    </div>
  );
}

function FlagPAR({ w = 120 }) {
  const h = w * 0.55;
  return (
    <div style={{ width: w, height: h, borderRadius: w * 0.04, position: 'relative', overflow: 'hidden', boxShadow: '0 6px 18px rgba(0,0,0,0.45)' }}>
      <div style={{ position: 'absolute', left: 0, right: 0, top: 0, height: '33.4%', background: '#d52b1e' }} />
      <div style={{ position: 'absolute', left: 0, right: 0, top: '33.3%', height: '33.4%', background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ width: h * 0.24, height: h * 0.24, borderRadius: '50%', border: `${Math.max(1.5, w * 0.012)}px solid #c8a200`, background: '#fffbe8', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <span style={{ color: '#c8a200', fontSize: h * 0.13, lineHeight: 1 }}>★</span>
        </div>
      </div>
      <div style={{ position: 'absolute', left: 0, right: 0, bottom: 0, height: '33.4%', background: '#0038a8' }} />
    </div>
  );
}

// ── Episode 5 additions ──────────────────────────────────────────────────────
function FlagBRA({ w = 120 }) {
  const h = w * 0.7;
  return (
    <div style={{ width: w, height: h, borderRadius: w * 0.04, position: 'relative', overflow: 'hidden', background: '#009c3b', boxShadow: '0 6px 18px rgba(0,0,0,0.45)' }}>
      <div style={{ position: 'absolute', left: '50%', top: '50%', width: w * 0.72, height: h * 0.72, transform: 'translate(-50%,-50%) rotate(45deg)', background: '#ffdf00', borderRadius: w * 0.06 }} />
      <div style={{ position: 'absolute', left: '50%', top: '50%', width: h * 0.42, height: h * 0.42, transform: 'translate(-50%,-50%)', borderRadius: '50%', background: '#002776' }} />
    </div>
  );
}

function FlagMAR({ w = 120 }) {
  const h = w * 0.66;
  return (
    <div style={{ width: w, height: h, borderRadius: w * 0.04, position: 'relative', overflow: 'hidden', background: '#c1272d', boxShadow: '0 6px 18px rgba(0,0,0,0.45)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <span style={{ color: '#006233', fontSize: h * 0.5, lineHeight: 1, textShadow: '0 0 2px #006233' }}>✩</span>
    </div>
  );
}

// Animated FIVE STARS counter: Brazil's titles pop in one by one, then the
// drought stamp slams down (Ep5 stat-moment innovation).
function StarCounter({ start }) {
  const t = useTime();
  const local = t - start;
  if (local < 0 || local > 22) return null;
  const years = ['1958', '1962', '1970', '1994', '2002'];
  const stampP = Easing.easeOutBack(clamp((local - 10.6) / 0.5, 0, 1));
  const fade = local > 20.5 ? (22 - local) / 1.5 : 1;
  return (
    <div style={{ position: 'absolute', inset: 0, zIndex: 26, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 30, opacity: clamp(fade, 0, 1) }}>
      <div style={{ display: 'flex', gap: 38 }}>
        {years.map((y, i) => {
          const p = Easing.easeOutBack(clamp((local - 1.0 - i * 1.1) / 0.5, 0, 1));
          return (
            <div key={i} style={{ textAlign: 'center', transform: `scale(${p})`, opacity: clamp(p, 0, 1) }}>
              <div style={{ fontSize: 110, color: '#ffdf00', textShadow: '0 0 50px #ffdf0088, 0 6px 24px rgba(0,0,0,0.8)', lineHeight: 1 }}>★</div>
              <div style={{ fontFamily: '"Inter",sans-serif', fontWeight: 800, fontSize: 30, color: MV.text, marginTop: 8 }}>{y}</div>
            </div>
          );
        })}
      </div>
      {stampP > 0 && (
        <div style={{
          transform: `rotate(-7deg) scale(${stampP})`, marginTop: 16,
          border: '6px solid #d52b1e', color: '#d52b1e', borderRadius: 16, padding: '14px 38px',
          fontFamily: '"Inter",sans-serif', fontWeight: 900, fontSize: 52, letterSpacing: '0.08em',
          background: 'rgba(7,9,15,0.85)',
        }}>0 SINCE 2002</div>
      )}
    </div>
  );
}

// ── Episode 6 additions ──────────────────────────────────────────────────────
function FlagARG({ w = 120 }) {
  const h = w * 0.62;
  return (
    <div style={{ width: w, height: h, borderRadius: w * 0.04, position: 'relative', overflow: 'hidden', boxShadow: '0 6px 18px rgba(0,0,0,0.45)' }}>
      <div style={{ position: 'absolute', left: 0, right: 0, top: 0, height: '33.4%', background: '#74acdf' }} />
      <div style={{ position: 'absolute', left: 0, right: 0, top: '33.3%', height: '33.4%', background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <span style={{ color: '#f6b40e', fontSize: h * 0.22, lineHeight: 1 }}>☀</span>
      </div>
      <div style={{ position: 'absolute', left: 0, right: 0, bottom: 0, height: '33.4%', background: '#74acdf' }} />
    </div>
  );
}

function FlagALG({ w = 120 }) {
  const h = w * 0.66;
  return (
    <div style={{ width: w, height: h, borderRadius: w * 0.04, position: 'relative', overflow: 'hidden', boxShadow: '0 6px 18px rgba(0,0,0,0.45)', display: 'flex' }}>
      <div style={{ width: '50%', background: '#006233' }} />
      <div style={{ width: '50%', background: '#fff' }} />
      <div style={{ position: 'absolute', left: '50%', top: '50%', transform: 'translate(-50%,-50%)', color: '#d21034', fontSize: h * 0.42, lineHeight: 1 }}>☪</div>
    </div>
  );
}

function FlagHTI({ w = 120 }) {
  const h = w * 0.6;
  return (
    <div style={{ width: w, height: h, borderRadius: w * 0.04, position: 'relative', overflow: 'hidden', boxShadow: '0 6px 18px rgba(0,0,0,0.45)' }}>
      <div style={{ position: 'absolute', left: 0, right: 0, top: 0, height: '50%', background: '#00209f' }} />
      <div style={{ position: 'absolute', left: 0, right: 0, bottom: 0, height: '50%', background: '#d21034' }} />
      <div style={{ position: 'absolute', left: '50%', top: '50%', transform: 'translate(-50%,-50%)', width: w * 0.3, height: h * 0.42, background: '#fff', borderRadius: 2, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ width: w * 0.1, height: h * 0.18, background: '#106b21', borderRadius: '50% 50% 0 0' }} />
      </div>
    </div>
  );
}

// Live fan-reaction picture-in-picture (Ep7 innovation): a framed corner box
// showing the crowd reacting WHILE the action plays — broadcast double-feed.
function ReactionPiP({ start, dur, clipId, label, accent = MV.gold }) {
  const t = useTime();
  const local = t - start;
  if (local < 0 || local > dur) return null;
  const p = Easing.easeOutBack(clamp(local / 0.6, 0, 1));
  const out = local > dur - 0.5 ? (dur - local) / 0.5 : 1;
  return (
    <div style={{ position: 'absolute', right: 70, top: 110, zIndex: 30, width: 420, opacity: clamp(p * out, 0, 1), transform: `scale(${0.8 + 0.2 * p})`, transformOrigin: 'top right' }}>
      <div style={{ borderRadius: 18, overflow: 'hidden', border: `3px solid ${accent}`, boxShadow: `0 18px 60px rgba(0,0,0,0.7), 0 0 40px ${accent}33`, position: 'relative', height: 236, background: '#000' }}>
        <ClipSprite id={clipId} />
        <div style={{ position: 'absolute', left: 0, right: 0, bottom: 0, padding: '8px 14px', background: 'linear-gradient(transparent, rgba(0,0,0,0.85))', display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{ width: 10, height: 10, borderRadius: '50%', background: '#ff3b30', boxShadow: '0 0 8px #ff3b30' }} />
          <span style={{ fontFamily: '"Inter",sans-serif', fontWeight: 800, fontSize: 17, color: '#fff', letterSpacing: '0.14em' }}>{label}</span>
        </div>
      </div>
    </div>
  );
}

// Broadcast chapter progress bar — viewers SEE the payoff approaching.
// chapters = [{label, at}], lights up as the playhead passes each chapter.
function ChapterBar({ chapters }) {
  const t = useTime();
  return (
    <div style={{ position: 'absolute', left: 0, right: 0, bottom: 96, display: 'flex', justifyContent: 'center', zIndex: 32 }}>
      <div style={{ display: 'flex', gap: 8, background: 'rgba(5,7,12,0.7)', borderRadius: 999, padding: '8px 18px', backdropFilter: 'blur(4px)' }}>
        {chapters.map((c, i) => {
          const next = i < chapters.length - 1 ? chapters[i + 1].at : 300;
          const active = t >= c.at && t < next;
          const done = t >= next;
          return (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
              <div style={{
                width: active ? 46 : 26, height: 5, borderRadius: 3, transition: 'none',
                background: done ? MV.gold : active ? '#fff' : 'rgba(255,255,255,0.25)',
              }} />
              {active && <span style={{ fontFamily: '"Inter",sans-serif', fontWeight: 800, fontSize: 15, color: '#fff', letterSpacing: '0.12em', whiteSpace: 'nowrap' }}>{c.label}</span>}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// Subtle animated film grain (SVG turbulence) for cinematic drama grades.
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

// "COMING UP" climax flash — plants the payoff promise in the first 30s.
function ComingUp({ start, dur = 2.6, clipId, label }) {
  const t = useTime();
  const local = t - start;
  if (local < 0 || local > dur) return null;
  const p = Easing.easeOutCubic(clamp(local / 0.4, 0, 1));
  const out = local > dur - 0.4 ? (dur - local) / 0.4 : 1;
  return (
    <div style={{ position: 'absolute', inset: 0, zIndex: 31, opacity: clamp(p * out, 0, 1), background: '#000' }}>
      <ClipSprite id={clipId} style={{ filter: 'saturate(1.2) contrast(1.15) brightness(0.85)' }} />
      <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse at center, transparent 40%, rgba(0,0,0,0.7) 100%)' }} />
      <div style={{ position: 'absolute', top: 130, left: 0, right: 0, textAlign: 'center' }}>
        <span style={{ fontFamily: '"Inter",sans-serif', fontWeight: 900, fontSize: 34, color: MV.gold, letterSpacing: '0.4em', background: 'rgba(0,0,0,0.55)', padding: '12px 30px', borderRadius: 999 }}>⏳ COMING UP</span>
      </div>
      <div style={{ position: 'absolute', bottom: 160, left: 0, right: 0, textAlign: 'center' }}>
        <span style={{ fontFamily: '"Inter",sans-serif', fontWeight: 900, fontSize: 44, color: '#fff', textShadow: '0 4px 24px #000' }}>{label}</span>
      </div>
    </div>
  );
}
