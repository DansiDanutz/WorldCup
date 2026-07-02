// intro-scenes.jsx — Ep92 · 15s MYSTIC INTRO (rule #20). Wordless, atmospheric face-off: El Dorado
// and the Black Star, the two flags rising from shadow, an igniting "VS", the WorldCup26 Legends
// wordmark, then a whoosh-fade into the cold open. Reuses FlagCO/FlagGH from match-scenes.jsx.

const INTRO_DUR = 15.0;

function IntroBackdrop() {
  const t = useTime();
  const glow = 0.35 + 0.25 * Math.sin(t * 1.1);
  return (
    <div style={{ position: 'absolute', inset: 0, zIndex: 0, background: 'radial-gradient(ellipse at 50% 48%, #0c1020 0%, #05060c 70%)' }}>
      <div style={{ position: 'absolute', inset: 0, background: `radial-gradient(ellipse at 50% 50%, rgba(255,205,90,${(0.10 * glow).toFixed(3)}) 0%, transparent 55%)` }} />
    </div>
  );
}

function SceneIntro() {
  const t = useTime();
  const titleP = Easing.easeOutCubic(clamp((t - 0.6) / 1.6, 0, 1));
  const flagP = Easing.easeOutCubic(clamp((t - 2.4) / 1.8, 0, 1));
  const namesP = Easing.easeOutCubic(clamp((t - 3.6) / 1.4, 0, 1));
  const drift = Easing.easeInOutCubic(clamp((t - 5.8) / 4.0, 0, 1));
  const vsP = Easing.easeOutBack(clamp((t - 7.6) / 0.7, 0, 1));
  const ring = clamp((t - 7.6) / 1.3, 0, 1);
  const themeP = Easing.easeOutCubic(clamp((t - 9.6) / 1.2, 0, 1));
  const sweep = clamp((t - 10.2) / 2.4, 0, 1);
  const pulse = 0.5 + 0.5 * Math.sin(t * 3.2);
  const fadeOut = clamp((t - 13.7) / 1.2, 0, 1);
  const leftX = -430 + drift * 150, rightX = 430 - drift * 150;
  const sideUnit = (flag, name, x, accent) => (
    <div style={{ position: 'absolute', left: '50%', top: '46%', transform: `translate(-50%,-50%) translateX(${x}px)`, opacity: flagP, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 22, zIndex: 12 }}>
      <div style={{ filter: `drop-shadow(0 0 ${22 + pulse * 16}px ${accent}cc)`, transform: `translateY(${(1 - flagP) * 36}px)` }}><Waving speed={1.5}>{flag}</Waving></div>
      <div style={{ opacity: namesP, transform: `translateY(${(1 - namesP) * 16}px)`, fontFamily: '"Inter",sans-serif', fontWeight: 900, fontSize: 50, letterSpacing: '0.04em', color: '#fff', textShadow: `0 4px 26px rgba(0,0,0,0.9), 0 0 26px ${accent}66` }}>{name}</div>
    </div>
  );
  return (
    <div style={{ position: 'absolute', inset: 0 }}>
      <IntroBackdrop />
      <AmbientParticles start={0} dur={INTRO_DUR} count={64} color="252,222,150" maxR={3.6} zIndex={6} />
      <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse at 50% 120%, rgba(0,0,0,0.55) 0%, transparent 55%)', zIndex: 4 }} />
      <div style={{ position: 'absolute', top: 96, left: 0, right: 0, textAlign: 'center', zIndex: 20, opacity: titleP * (1 - fadeOut) }}>
        <Kicker size={30} color="#e8c97a">WorldCup26 Legends</Kicker>
      </div>
      {sideUnit(<FlagCO w={300} />, 'COLOMBIA', leftX, '#fcd116')}
      {sideUnit(<FlagGH w={300} />, 'GHANA', rightX, '#006b3f')}
      {ring > 0 && ring < 1 && <div style={{ position: 'absolute', left: '50%', top: '46%', zIndex: 14, pointerEvents: 'none', width: 620, height: 620, transform: `translate(-50%,-50%) scale(${0.3 + ring * 1.6})`, opacity: (1 - ring) * 0.85, borderRadius: '50%', border: '3px solid rgba(255,225,150,0.75)', boxShadow: '0 0 70px rgba(245,208,22,0.6)' }} />}
      {vsP > 0 && (
        <div style={{ position: 'absolute', left: '50%', top: '46%', transform: `translate(-50%,-50%) scale(${vsP})`, zIndex: 16, opacity: 1 - fadeOut }}>
          <div style={{ fontFamily: '"Inter",sans-serif', fontWeight: 900, fontSize: 150, color: MV.gold, textShadow: `0 0 ${30 + pulse * 30}px rgba(245,208,22,0.9), 0 6px 30px rgba(0,0,0,0.9)` }}>VS</div>
        </div>
      )}
      {sweep > 0 && sweep < 1 && <div style={{ position: 'absolute', top: 0, bottom: 0, left: `${sweep * 130 - 25}%`, width: '20%', background: 'linear-gradient(105deg, transparent, rgba(255,240,200,0.16), transparent)', transform: 'skewX(-16deg)', zIndex: 18, pointerEvents: 'none' }} />}
      <div style={{ position: 'absolute', bottom: 120, left: 0, right: 0, textAlign: 'center', zIndex: 20, opacity: themeP * (1 - fadeOut) }}>
        <div style={{ display: 'inline-block', fontFamily: '"Inter",sans-serif', fontWeight: 800, fontSize: 30, letterSpacing: '0.30em', color: '#ffe9a0', textShadow: '0 2px 18px rgba(0,0,0,0.85)' }}>EL DORADO AND THE BLACK STAR</div>
      </div>
      <Vignette strength={0.55} />
      <div style={{ position: 'absolute', inset: 0, zIndex: 40, background: '#05060c', opacity: fadeOut }} />
    </div>
  );
}
