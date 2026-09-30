// LivingCard — the signature of FORGOTTEN.
//
// Every source clip was generated at 716x1284 (ratio 0.5576) and every legend card
// is 768x1376 (ratio 0.5581). They are the same shape, which is the whole idea:
// the collectible card the app sells IS the frame the film plays inside. A chapter
// opens on the real card, the artwork dissolves, and the legend starts moving in it.
//
// Identity honesty (worldcup-documentary LAW #1): both the card art and the clips
// were authored for THIS legend, so nothing here can ever show the wrong person.
const LC = {
  gold: '#f6b40e', goldLo: '#c9820a', goldHi: '#fff3c4',
  ink: '#05070c', mist: 'rgba(255,210,74,.42)',
};

function lcClamp(v, a, b) { return Math.max(a, Math.min(b, v)); }
function lcEase(t) { return t * t * (3 - 2 * t); }
function lcOut(t) { return 1 - Math.pow(1 - t, 3); }

// The card shell: ornate gold border, inner bevel, shine sweep. Children fill the art window.
function CardShell({ w, h, lit = 1, shine = -1, children }) {
  return (
    <div style={{
      position: 'relative', width: w, height: h, borderRadius: w * 0.055,
      background: `linear-gradient(160deg, ${LC.goldHi} 0%, ${LC.gold} 38%, ${LC.goldLo} 72%, #8a5a06 100%)`,
      padding: Math.round(w * 0.028),
      boxShadow: `0 ${h*0.05}px ${h*0.11}px rgba(0,0,0,.82), 0 0 ${90*lit}px rgba(246,180,14,${0.10+0.26*lit})`,
      overflow: 'hidden',
    }}>
      <div style={{
        position: 'relative', width: '100%', height: '100%', borderRadius: w * 0.038,
        overflow: 'hidden', background: LC.ink,
        boxShadow: 'inset 0 0 0 2px rgba(0,0,0,.55), inset 0 0 44px rgba(0,0,0,.75)',
      }}>
        {children}
      </div>
      {shine >= 0 && shine <= 1 ? (
        <div style={{
          position: 'absolute', top: 0, bottom: 0, width: w * 0.55,
          left: `${-60 + shine * 220}%`, transform: 'skewX(-18deg)', pointerEvents: 'none',
          background: 'linear-gradient(90deg, transparent, rgba(255,255,255,.30), transparent)',
        }} />
      ) : null}
    </div>
  );
}

// One chapter's hero: the card ignites, then the legend moves inside it.
// `media` is [{src, type:'video'|'image', at, dur}] laid out over the chapter window.
function LivingCard({ from, dur, card, media = [], side = 'left', w = 520 }) {
  const t = useTime();
  if (t < from - 0.01 || t > from + dur) return null;
  const lt = t - from;
  const h = Math.round(w / 0.5576);

  // 0.0-1.1s  card flies in       1.1-2.2s  artwork dissolves to motion
  const enter = lcOut(lcClamp(lt / 1.1, 0, 1));
  const ignite = lcEase(lcClamp((lt - 1.1) / 1.1, 0, 1));
  const out = lcClamp((from + dur - t) / 0.9, 0, 1);
  const shine = (lt > 1.4 && lt < 3.0) ? (lt - 1.4) / 1.6 : -1;
  const breathe = Math.sin(lt * 0.42) * 6;

  const active = media.find(m => lt >= m.at && lt < m.at + m.dur);

  const x = side === 'left' ? -1 : 1;
  return (
    <div style={{
      position: 'absolute', top: '50%', left: side === 'left' ? '29%' : '71%',
      transform: `translate(-50%,-50%) translateY(${breathe}px) translateX(${(1-enter)*x*160}px) scale(${0.90+0.10*enter})`,
      opacity: Math.min(enter, out), zIndex: 12,
    }}>
      <CardShell w={w} h={h} lit={ignite} shine={shine}>
        {/* the printed card art — fades as the legend wakes up */}
        <img src={card} style={{
          position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover',
          opacity: 1 - ignite * 0.98,
        }} />
        {/* the legend, moving, inside the same frame */}
        {active ? (
          active.type === 'video'
            // Must go through VideoSprite, not a raw <video>. The renderer drives the
            // timeline paused via window.__seek(t); a bare <video> is never played and
            // never seeked, so it holds its first decoded frame for the whole shot and
            // the film degrades into a slideshow of first frames (hard rule #11).
            // VideoSprite seeks currentTime per frame and registers the pending seek
            // so render.mjs waits for it before screenshotting.
            ? <VideoSprite src={active.src} start={from + active.at} dur={active.dur}
                fit="cover" style={{ opacity: ignite }} />
            : <img src={active.src} style={{
                position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover',
                opacity: ignite,
                transform: `scale(${1.06 + 0.05 * lcClamp((lt - active.at) / active.dur, 0, 1)})` }} />
        ) : null}
        {/* depth + gold rim light */}
        <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none',
          background: `radial-gradient(120% 80% at 50% 12%, transparent 40%, rgba(0,0,0,.55) 100%)` }} />
        <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none',
          boxShadow: `inset 0 0 ${70*ignite}px rgba(246,180,14,${0.16*ignite})` }} />
      </CardShell>
    </div>
  );
}

// Chapter typography opposite the card: number, name, ≤4-word label, meta.
// Rule #10: labels and names only — never a sentence.
function ChapterPlate({ from, dur, index, name, label, meta, side = 'right' }) {
  const t = useTime();
  if (t < from - 0.01 || t > from + dur) return null;
  const lt = t - from, out = lcClamp((from + dur - t) / 0.8, 0, 1);
  const a = (d) => lcOut(lcClamp((lt - d) / 0.7, 0, 1));
  const align = side === 'right' ? 'right' : 'left';
  return (
    <div style={{
      position: 'absolute', top: '50%', transform: 'translateY(-50%)',
      [side === 'right' ? 'right' : 'left']: 96, width: 740, textAlign: align,
      opacity: out, zIndex: 14, fontFamily: '"Inter",sans-serif',
    }}>
      <div style={{ fontSize: 26, fontWeight: 800, letterSpacing: '.34em', color: '#7fe3bd',
        opacity: a(0.15), transform: `translateY(${(1-a(0.15))*16}px)` }}>
        {String(index).padStart(2, '0')}
      </div>
      <div style={{ marginTop: 14, fontSize: name.length > 15 ? 84 : 104, fontWeight: 900,
        letterSpacing: '-.025em', lineHeight: .98, color: '#fff',
        textShadow: '0 8px 34px rgba(0,0,0,.95)',
        opacity: a(0.32), transform: `translateY(${(1-a(0.32))*26}px)` }}>
        {name}
      </div>
      <div style={{ marginTop: 18, fontSize: 46, fontWeight: 900, letterSpacing: '.02em',
        background: `linear-gradient(180deg,${LC.goldHi},${LC.gold} 60%,${LC.goldLo})`,
        WebkitBackgroundClip: 'text', backgroundClip: 'text', color: 'transparent',
        filter: 'drop-shadow(0 4px 18px rgba(0,0,0,.9))',
        opacity: a(0.55), transform: `translateY(${(1-a(0.55))*20}px)` }}>
        {label}
      </div>
      <div style={{ marginTop: 16, fontSize: 25, fontWeight: 700, letterSpacing: '.20em',
        color: 'rgba(232,238,255,.66)', opacity: a(0.78) }}>
        {meta}
      </div>
      <div style={{ marginTop: 26, marginLeft: side === 'right' ? 'auto' : 0, width: 240, height: 6,
        borderRadius: 3, transformOrigin: side === 'right' ? 'right' : 'left',
        transform: `scaleX(${a(0.9)})`,
        background: `linear-gradient(90deg, transparent, ${LC.gold})` }} />
    </div>
  );
}

Object.assign(window.MotionKit || (window.MotionKit = {}), { LivingCard, ChapterPlate, CardShell, LC });
