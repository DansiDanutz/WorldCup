// intro-scenes.jsx — Ep105 · SceneIntro: the POWERFUL, extended (~24s) mystic opening that plants
// the mystery (owner brief). The ghosts of the Argentina–England rivalry rise: mist + embers, the
// two crests emerging from shadow, a section-tease of 1986, a glowing "VS" igniting between them, the
// "WorldCup26 Legends · The Semifinal" wordmark — then a whoosh into the title. Wordless except Brian's
// haunting opening lines (narration L0/L1). Footage-backed throughout (Rule #25). Reuses FlagARG /
// FlagENG / FS / NightField / helpers from match-scenes.jsx (loaded first). Rendered as the first
// scene of the single body timeline (0–24) rather than a separate pre-roll — one continuous, unified
// audio+video render.

function IntroEmberField() {
  const t = useTime();
  const glow = 0.4 + 0.28 * Math.sin(t * 0.9);
  return (
    <div style={{ position: 'absolute', inset: 0, zIndex: 0 }}>
      <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse at 50% 48%, #101728 0%, #080b14 62%, #05060c 100%)' }} />
      <div style={{ position: 'absolute', inset: 0, background: `radial-gradient(ellipse at 50% 46%, rgba(233,198,90,${(0.14 * glow).toFixed(3)}) 0%, transparent 56%)` }} />
    </div>
  );
}

function SceneIntro() {
  const t = useTime();                     // absolute (Sprite starts at 0)
  const titleP = Easing.easeOutCubic(clamp((t - 1.4) / 1.6, 0, 1));
  const flagP = Easing.easeOutCubic(clamp((t - 2.8) / 2.0, 0, 1));
  const namesP = Easing.easeOutCubic(clamp((t - 4.2) / 1.6, 0, 1));
  const ghostP = clamp((t - 6.2) / 0.8, 0, 1) * clamp((11.4 - t) / 0.7, 0, 1);
  const histP = clamp((t - 12.2) / 0.8, 0, 1) * clamp((15.8 - t) / 0.7, 0, 1);
  const drift = Easing.easeInOutCubic(clamp((t - 6.0) / 8.0, 0, 1));
  const vsP = Easing.easeOutBack(clamp((t - 16.2) / 0.8, 0, 1));
  const ring = clamp((t - 16.2) / 1.4, 0, 1);
  const themeP = Easing.easeOutCubic(clamp((t - 19.6) / 1.2, 0, 1));
  const sweep = clamp((t - 17.0) / 2.6, 0, 1);
  const pulse = 0.5 + 0.5 * Math.sin(t * 3.0);
  const fadeOut = clamp((t - 23.2) / 0.8, 0, 1);
  const leftX = -430 + drift * 150, rightX = 430 - drift * 150;
  const sideUnit = (flag, name, x, accent) => (
    <div style={{ position: 'absolute', left: '50%', top: '45%', transform: `translate(-50%,-50%) translateX(${x}px)`, opacity: flagP, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 22, zIndex: 14 }}>
      <div style={{ filter: `drop-shadow(0 0 ${22 + pulse * 16}px ${accent}cc)`, transform: `translateY(${(1 - flagP) * 36}px)` }}><Waving speed={1.5}>{flag}</Waving></div>
      <div style={{ opacity: namesP, transform: `translateY(${(1 - namesP) * 16}px)`, fontFamily: SANS, fontWeight: 900, fontSize: 46, letterSpacing: '0.04em', color: '#fff', textShadow: `0 4px 26px rgba(0,0,0,0.9), 0 0 26px ${accent}66` }}>{name}</div>
    </div>
  );
  return (
    <div style={{ position: 'absolute', inset: 0 }}>
      <IntroEmberField />
      {/* footage-backed atmosphere so no frame is ever empty/black (Rule #25) */}
      <FS id="ghost-mist" dim={0.5} /><FS id="old-rivalry" dim={0.55} /><FS id="ghost-mist2" dim={0.5} /><FS id="embers-rise" dim={0.55} /><FS id="destiny-rays" dim={0.5} />
      <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse at 50% 120%, rgba(0,0,0,0.55) 0%, transparent 55%)', zIndex: 4 }} />
      <AmbientParticles start={0} dur={24} count={70} color="245,205,120" maxR={3.8} zIndex={6} />
      <div style={{ position: 'absolute', top: 92, left: 0, right: 0, textAlign: 'center', zIndex: 20, opacity: titleP * (1 - fadeOut) }}>
        <Kicker size={30} color="#f4dca8">WorldCup26 Legends · The Semifinal</Kicker>
      </div>
      {sideUnit(<FlagARG w={230} />, 'ARGENTINA', leftX, '#6CACE4')}
      {sideUnit(<FlagENG w={230} />, 'ENGLAND', rightX, '#d21f2a')}
      {ghostP > 0.01 && (
        <div style={{ position: 'absolute', left: 0, right: 0, bottom: 150, textAlign: 'center', zIndex: 21, opacity: ghostP }}>
          <div style={{ display: 'inline-block', fontFamily: SANS, fontWeight: 800, fontSize: 30, color: '#f0d6a4', letterSpacing: '0.22em', textShadow: '0 2px 18px rgba(0,0,0,0.85)' }}>FORTY YEARS OF GHOSTS</div>
        </div>
      )}
      {histP > 0.01 && (
        <div style={{ position: 'absolute', left: 0, right: 0, bottom: 150, textAlign: 'center', zIndex: 21, opacity: histP }}>
          <div style={{ display: 'inline-block', fontFamily: SANS, fontWeight: 900, fontSize: 32, color: '#fff', letterSpacing: '0.16em', textShadow: '0 2px 18px rgba(0,0,0,0.9)' }}>HAND OF GOD · 1986</div>
        </div>
      )}
      {ring > 0 && ring < 1 && <div style={{ position: 'absolute', left: '50%', top: '45%', zIndex: 15, pointerEvents: 'none', width: 620, height: 620, transform: `translate(-50%,-50%) scale(${0.3 + ring * 1.6})`, opacity: (1 - ring) * 0.85, borderRadius: '50%', border: '3px solid rgba(233,198,90,0.75)', boxShadow: '0 0 70px rgba(233,198,90,0.6)' }} />}
      {vsP > 0 && (
        <div style={{ position: 'absolute', left: '50%', top: '45%', transform: `translate(-50%,-50%) scale(${vsP})`, zIndex: 16, opacity: 1 - fadeOut }}>
          <div style={{ fontFamily: SANS, fontWeight: 900, fontSize: 150, color: GOLD, textShadow: `0 0 ${30 + pulse * 30}px rgba(233,198,90,0.9), 0 6px 30px rgba(0,0,0,0.9)` }}>VS</div>
        </div>
      )}
      {sweep > 0 && sweep < 1 && <div style={{ position: 'absolute', top: 0, bottom: 0, left: `${sweep * 130 - 25}%`, width: '20%', background: 'linear-gradient(105deg, transparent, rgba(255,235,190,0.16), transparent)', transform: 'skewX(-16deg)', zIndex: 18, pointerEvents: 'none' }} />}
      <div style={{ position: 'absolute', bottom: 116, left: 0, right: 0, textAlign: 'center', zIndex: 20, opacity: themeP * (1 - fadeOut) }}>
        <div style={{ display: 'inline-block', fontFamily: SANS, fontWeight: 800, fontSize: 30, letterSpacing: '0.16em', color: '#f0d6a4', textShadow: '0 2px 18px rgba(0,0,0,0.85)' }}>THE GHOSTS OF THE SPOT</div>
      </div>
      <Vignette strength={0.5} />
      <div style={{ position: 'absolute', inset: 0, zIndex: 40, background: '#05060c', opacity: fadeOut }} />
    </div>
  );
}
