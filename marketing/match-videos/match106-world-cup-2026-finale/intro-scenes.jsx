// intro-scenes.jsx — Ep106 · SceneIntro: the ~24s mystic opening of the GRAND FINALE. A lone golden
// trophy glows in the mist of an empty stadium — "who does the game remember?" The theme rises: the
// CROWN vs the GOLDEN GHOSTS, and the Legend-106 tease (Sant Jordi — where blood falls, a rose). Wordless
// but for Brian's opening lines (L0/L1). Footage-backed throughout (Rule #25). Reuses FS / NightField /
// GOLD / Kicker / Waving / AmbientParticles / Vignette / flags from match-scenes.jsx (loaded first).
// Rendered as scene 1 of the single body timeline (0–24), not a separate pre-roll.

function IntroEmberField() {
  const t = useTime();
  const glow = 0.55 + 0.3 * Math.sin(t * 0.9);
  // luminance FLOOR — the base ground is never near-black (keeps the mystic open clear of blackdetect).
  return (
    <div style={{ position: 'absolute', inset: 0, zIndex: 0 }}>
      <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse at 50% 48%, #2a3654 0%, #17203a 52%, #0c1220 100%)' }} />
      <div style={{ position: 'absolute', inset: 0, background: `radial-gradient(ellipse at 50% 46%, rgba(233,198,90,${(0.34 * glow).toFixed(3)}) 0%, transparent 62%)` }} />
      <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse at 50% 62%, rgba(120,150,210,0.14) 0%, transparent 55%)' }} />
    </div>
  );
}

function SceneIntro() {
  const t = useTime();
  const titleP = Easing.easeOutCubic(clamp((t - 1.4) / 1.6, 0, 1));
  const q1 = clamp((t - 4.0) / 0.8, 0, 1) * clamp((8.8 - t) / 0.7, 0, 1);       // WHO DOES THE GAME REMEMBER?
  const crownP = Easing.easeOutBack(clamp((t - 9.4) / 0.8, 0, 1));
  const ghostP = Easing.easeOutBack(clamp((t - 10.4) / 0.8, 0, 1));
  const vsGlow = 0.5 + 0.5 * Math.sin(t * 3.0);
  const teaseP = clamp((t - 14.4) / 0.8, 0, 1) * clamp((18.4 - t) / 0.7, 0, 1);  // Sant Jordi riddle
  const themeP = Easing.easeOutCubic(clamp((t - 19.4) / 1.2, 0, 1));
  const sweep = clamp((t - 16.8) / 2.6, 0, 1);
  const fadeOut = clamp((t - 23.2) / 0.8, 0, 1);
  const words = (crownP + ghostP) / 2;
  return (
    <div style={{ position: 'absolute', inset: 0 }}>
      <IntroEmberField />
      {/* footage-backed atmosphere so no frame is ever empty/black (Rule #25) */}
      <FS id="trophy-altar" br={1.95} /><FS id="ghost-mist" dim={0.4} /><FS id="faceoff-silhouette" dim={0.4} /><FS id="embers-rise" dim={0.45} /><FS id="light-rays-gold" dim={0.4} />
      {/* translucent atmospheric haze OVER the beds — lifts the mystic-dark open clear of the black-frame floor (#25) while keeping the misty-stadium mood */}
      <div style={{ position: 'absolute', inset: 0, zIndex: 5, background: 'radial-gradient(ellipse at 50% 44%, rgba(74,98,160,0.34) 0%, rgba(48,64,112,0.18) 46%, transparent 74%)' }} />
      <div style={{ position: 'absolute', inset: 0, zIndex: 5, background: 'linear-gradient(180deg, rgba(40,54,96,0.40) 0%, rgba(30,42,78,0.10) 26%, transparent 55%, rgba(24,34,64,0.34) 100%)' }} />
      <div style={{ position: 'absolute', inset: 0, zIndex: 5, background: `radial-gradient(ellipse at 50% 46%, rgba(233,198,90,0.16) 0%, transparent 52%)` }} />
      <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse at 50% 120%, rgba(0,0,0,0.35) 0%, transparent 55%)', zIndex: 4 }} />
      <AmbientParticles start={0} dur={24} count={70} color="245,205,120" maxR={3.8} zIndex={6} />
      <div style={{ position: 'absolute', top: 92, left: 0, right: 0, textAlign: 'center', zIndex: 20, opacity: titleP * (1 - fadeOut) }}>
        <Kicker size={30} color="#f4dca8">WorldCup26 Legends · The Grand Finale</Kicker>
      </div>
      {q1 > 0.01 && (
        <div style={{ position: 'absolute', left: 0, right: 0, top: '44%', textAlign: 'center', zIndex: 21, opacity: q1, transform: 'translateY(-50%)' }}>
          <div style={{ display: 'inline-block', fontFamily: SANS, fontWeight: 900, fontSize: 60, color: '#fff', letterSpacing: '0.03em', textShadow: '0 4px 30px rgba(0,0,0,0.9)' }}>WHO DOES THE GAME<br />REMEMBER?</div>
        </div>
      )}
      {words > 0.01 && (t < 14.2) && (
        <div style={{ position: 'absolute', left: 0, right: 0, top: '45%', transform: 'translateY(-50%)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 56, zIndex: 16 }}>
          <div style={{ opacity: clamp(crownP, 0, 1), transform: `scale(${crownP})`, textAlign: 'center' }}>
            <div style={{ fontSize: 66 }}>👑</div>
            <div style={{ fontFamily: SANS, fontWeight: 900, fontSize: 54, color: GOLD, letterSpacing: '0.06em', textShadow: `0 0 ${20 + vsGlow * 22}px rgba(233,198,90,0.8)` }}>THE CROWN</div>
          </div>
          <div style={{ fontFamily: SANS, fontWeight: 900, fontSize: 40, color: '#9fb0c8', opacity: clamp(Math.min(crownP, ghostP), 0, 1) }}>vs</div>
          <div style={{ opacity: clamp(ghostP, 0, 1), transform: `scale(${ghostP})`, textAlign: 'center' }}>
            <div style={{ fontSize: 66 }}>👻</div>
            <div style={{ fontFamily: SANS, fontWeight: 900, fontSize: 54, color: '#cdd6e6', letterSpacing: '0.06em', textShadow: '0 0 22px rgba(200,214,230,0.6)' }}>THE GHOSTS</div>
          </div>
        </div>
      )}
      {teaseP > 0.01 && (
        <div style={{ position: 'absolute', left: 0, right: 0, bottom: 150, textAlign: 'center', zIndex: 21, opacity: teaseP }}>
          <div style={{ display: 'inline-block', fontFamily: SANS, fontWeight: 800, fontSize: 30, color: '#f0d6a4', letterSpacing: '0.20em', textShadow: '0 2px 18px rgba(0,0,0,0.85)' }}>WHERE BLOOD FALLS · A ROSE</div>
        </div>
      )}
      {sweep > 0 && sweep < 1 && <div style={{ position: 'absolute', top: 0, bottom: 0, left: `${sweep * 130 - 25}%`, width: '20%', background: 'linear-gradient(105deg, transparent, rgba(255,235,190,0.16), transparent)', transform: 'skewX(-16deg)', zIndex: 18, pointerEvents: 'none' }} />}
      <div style={{ position: 'absolute', bottom: 116, left: 0, right: 0, textAlign: 'center', zIndex: 20, opacity: themeP * (1 - fadeOut) }}>
        <div style={{ display: 'inline-block', fontFamily: SANS, fontWeight: 800, fontSize: 30, letterSpacing: '0.16em', color: '#f0d6a4', textShadow: '0 2px 18px rgba(0,0,0,0.85)' }}>CHAMPIONS ARE REMEMBERED · SCORERS ARE MOURNED</div>
      </div>
      <Vignette strength={0.5} />
      <div style={{ position: 'absolute', inset: 0, zIndex: 40, background: '#05060c', opacity: fadeOut }} />
    </div>
  );
}
