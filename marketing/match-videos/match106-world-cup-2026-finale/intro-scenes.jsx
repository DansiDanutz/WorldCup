// intro-scenes.jsx — Ep106 · SceneIntro: the ~24s mystic opening of the GRAND FINALE.
//
// ARC (emotional, not decorative):
//   0.0–4.6   THE ALTAR      — a golden crown ignites in the mist of an empty stadium.
//   4.6–9.6   THE QUESTION   — a golden statue of a player crumbles to dust: "WHO DOES THE GAME REMEMBER?"
//   9.6–14.6  THE DUEL       — THE CROWN vs THE GHOSTS, typographic split with a light seam (NO emoji).
//  14.6–19.6  THE TEASE      — Sant Jordi's dragon in crimson mist, a rose blooming: "WHERE BLOOD FALLS · A ROSE".
//  19.6–24.0  THE THEME      — the thesis line, then a fast wipe into the title card.
//
// Every beat sits on real photoreal footage (Rule #25/#27) — never text on an empty dark gradient.
// Reuses FS / NightField / GOLD / Kicker / AmbientParticles / Vignette from match-scenes.jsx (loaded first).
// Rendered as scene 1 of the single body timeline (0–24), not a separate pre-roll.

function IntroEmberField() {
  const t = useTime();
  const glow = 0.55 + 0.3 * Math.sin(t * 0.9);
  // luminance FLOOR — the base ground is never near-black (keeps the mystic open clear of blackdetect, Rule #25).
  return (
    <div style={{ position: 'absolute', inset: 0, zIndex: 0 }}>
      <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse at 50% 48%, #2a3654 0%, #17203a 52%, #0c1220 100%)' }} />
      <div style={{ position: 'absolute', inset: 0, background: `radial-gradient(ellipse at 50% 46%, rgba(233,198,90,${(0.34 * glow).toFixed(3)}) 0%, transparent 62%)` }} />
      <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse at 50% 62%, rgba(120,150,210,0.14) 0%, transparent 55%)' }} />
    </div>
  );
}

// A word of the CROWN/GHOSTS duel — designed type, no emoji. `side` = -1 left, +1 right.
function DuelWord({ p, side, label, color, ghost }) {
  const t = useTime();
  const shimmer = 0.5 + 0.5 * Math.sin(t * 2.2 + (ghost ? 1.6 : 0));
  return (
    <div style={{
      flex: 1, textAlign: 'center', opacity: clamp(p, 0, 1),
      transform: `translateX(${(1 - p) * side * 70}px) scale(${0.94 + p * 0.06})`,
    }}>
      <div style={{
        fontFamily: SANS, fontWeight: 900, fontSize: 62, color,
        letterSpacing: '0.08em', lineHeight: 1,
        textShadow: ghost
          ? `0 0 ${26 + shimmer * 20}px rgba(206,220,238,0.75), 0 4px 26px rgba(0,0,0,0.9)`
          : `0 0 ${22 + shimmer * 26}px rgba(233,198,90,0.85), 0 4px 26px rgba(0,0,0,0.9)`,
        filter: ghost ? 'blur(0.4px)' : 'none',
        opacity: ghost ? 0.82 + shimmer * 0.14 : 1,
      }}>{label}</div>
      <div style={{
        margin: '18px auto 0', height: 3, width: 168 * clamp(p, 0, 1),
        background: `linear-gradient(90deg, transparent, ${color}, transparent)`,
        boxShadow: `0 0 16px ${color}`,
      }} />
    </div>
  );
}

function SceneIntro() {
  const t = useTime();

  // ── beat envelopes ────────────────────────────────────────────────────────────
  const titleP = Easing.easeOutCubic(clamp((t - 1.2) / 1.6, 0, 1));
  const titleOut = clamp((t - 8.6) / 0.8, 0, 1);

  const qIn = Easing.easeOutCubic(clamp((t - 5.0) / 0.9, 0, 1));
  const qOut = clamp((9.1 - t) / 0.7, 0, 1);
  const q = qIn * clamp(qOut, 0, 1);

  const crownP = Easing.easeOutCubic(clamp((t - 10.0) / 0.9, 0, 1));
  const ghostP = Easing.easeOutCubic(clamp((t - 10.7) / 0.9, 0, 1));
  const duelOut = clamp((14.2 - t) / 0.6, 0, 1);
  const seam = clamp((t - 9.8) / 1.4, 0, 1);

  const teaseP = Easing.easeOutCubic(clamp((t - 15.2) / 0.9, 0, 1)) * clamp((19.2 - t) / 0.7, 0, 1);
  const legendP = clamp((t - 16.4) / 0.9, 0, 1) * clamp((19.2 - t) / 0.7, 0, 1);

  const themeP = Easing.easeOutCubic(clamp((t - 20.0) / 1.1, 0, 1));
  const sweep = clamp((t - 21.4) / 2.2, 0, 1);
  const fadeOut = clamp((t - 23.4) / 0.6, 0, 1);

  return (
    <div style={{ position: 'absolute', inset: 0 }}>
      <IntroEmberField />

      {/* Footage beds — one distinct clip per beat, no repeats, no loops (Rules #11/#25). */}
      <FS id="crown-ignite" br={1.55} />
      <FS id="ghost-statue" br={1.5} />
      <FS id="faceoff-silhouette" dim={0.34} />
      <FS id="dragon-rose" br={1.45} />
      <FS id="light-rays-gold" dim={0.34} />

      {/* Translucent atmospheric haze OVER the beds — holds the mystic open clear of the
          black-frame floor (#25) while keeping the misty-stadium mood. */}
      <div style={{ position: 'absolute', inset: 0, zIndex: 5, background: 'radial-gradient(ellipse at 50% 44%, rgba(74,98,160,0.30) 0%, rgba(48,64,112,0.16) 46%, transparent 74%)' }} />
      <div style={{ position: 'absolute', inset: 0, zIndex: 5, background: 'linear-gradient(180deg, rgba(40,54,96,0.38) 0%, rgba(30,42,78,0.10) 26%, transparent 55%, rgba(24,34,64,0.32) 100%)' }} />
      <div style={{ position: 'absolute', inset: 0, zIndex: 5, background: 'radial-gradient(ellipse at 50% 46%, rgba(233,198,90,0.15) 0%, transparent 52%)' }} />
      <div style={{ position: 'absolute', inset: 0, zIndex: 4, background: 'radial-gradient(ellipse at 50% 120%, rgba(0,0,0,0.32) 0%, transparent 55%)' }} />

      <AmbientParticles start={0} dur={24} count={78} color="245,205,120" maxR={3.9} zIndex={6} />

      {/* ── 1.2–8.6 · the wordmark ─────────────────────────────────────────────── */}
      <div style={{ position: 'absolute', top: 92, left: 0, right: 0, textAlign: 'center', zIndex: 20, opacity: titleP * (1 - titleOut) }}>
        <Kicker size={30} color="#f4dca8">WorldCup26 Legends · The Grand Finale</Kicker>
      </div>

      {/* ── 5.0–9.1 · THE QUESTION, over the crumbling golden statue ───────────── */}
      {q > 0.01 && (
        <div style={{ position: 'absolute', left: 0, right: 0, top: '46%', textAlign: 'center', zIndex: 21, opacity: q, transform: `translateY(calc(-50% + ${(1 - qIn) * 22}px))` }}>
          <div style={{ display: 'inline-block', fontFamily: SANS, fontWeight: 900, fontSize: 64, color: '#fff', letterSpacing: '0.03em', lineHeight: 1.08, textShadow: '0 6px 34px rgba(0,0,0,0.92)' }}>
            WHO DOES THE GAME<br />REMEMBER?
          </div>
        </div>
      )}

      {/* ── 10.0–14.2 · THE DUEL — designed type, no emoji ─────────────────────── */}
      {duelOut > 0.01 && (crownP + ghostP) > 0.01 && (
        <div style={{ position: 'absolute', inset: 0, zIndex: 16, opacity: clamp(duelOut, 0, 1) }}>
          {/* the light seam that splits the frame */}
          <div style={{
            position: 'absolute', left: '50%', top: `${26 + (1 - seam) * 14}%`, bottom: `${26 + (1 - seam) * 14}%`,
            width: 2, marginLeft: -1,
            background: 'linear-gradient(180deg, transparent, rgba(255,236,190,0.85), transparent)',
            boxShadow: '0 0 26px rgba(255,226,160,0.75)', opacity: seam,
          }} />
          <div style={{ position: 'absolute', left: 0, right: 0, top: '45%', transform: 'translateY(-50%)', display: 'flex', alignItems: 'center' }}>
            <DuelWord p={crownP} side={-1} label="THE CROWN" color={GOLD} />
            <DuelWord p={ghostP} side={1} label="THE GHOSTS" color="#d6dfee" ghost />
          </div>
        </div>
      )}

      {/* ── 15.2–19.2 · the Legend-106 tease (Sant Jordi) ──────────────────────── */}
      {teaseP > 0.01 && (
        <div style={{ position: 'absolute', left: 0, right: 0, bottom: 158, textAlign: 'center', zIndex: 21, opacity: teaseP }}>
          <div style={{ display: 'inline-block', fontFamily: SANS, fontWeight: 800, fontSize: 34, color: '#f0d6a4', letterSpacing: '0.20em', textShadow: '0 2px 20px rgba(0,0,0,0.9)' }}>
            WHERE BLOOD FALLS · A ROSE
          </div>
        </div>
      )}
      {legendP > 0.01 && (
        <div style={{ position: 'absolute', left: 0, right: 0, bottom: 112, textAlign: 'center', zIndex: 21, opacity: legendP * 0.9 }}>
          <div style={{ display: 'inline-block', fontFamily: SANS, fontWeight: 800, fontSize: 21, color: '#c8bda4', letterSpacing: '0.30em' }}>LEGEND 106 · UNKNOWN</div>
        </div>
      )}

      {/* ── 20.0–24.0 · the thesis, then the wipe ──────────────────────────────── */}
      <div style={{ position: 'absolute', bottom: 116, left: 0, right: 0, textAlign: 'center', zIndex: 20, opacity: themeP * (1 - fadeOut) }}>
        <div style={{ display: 'inline-block', fontFamily: SANS, fontWeight: 800, fontSize: 31, letterSpacing: '0.16em', color: '#f0d6a4', textShadow: '0 2px 20px rgba(0,0,0,0.9)' }}>
          CHAMPIONS REMEMBERED · SCORERS MOURNED
        </div>
      </div>

      {sweep > 0 && sweep < 1 && (
        <div style={{ position: 'absolute', top: 0, bottom: 0, left: `${sweep * 130 - 25}%`, width: '20%', background: 'linear-gradient(105deg, transparent, rgba(255,235,190,0.18), transparent)', transform: 'skewX(-16deg)', zIndex: 18, pointerEvents: 'none' }} />
      )}

      <Vignette strength={0.46} />
      {/* short, sub-1s handoff into the title card — never a long fade to black (Rule #25) */}
      <div style={{ position: 'absolute', inset: 0, zIndex: 40, background: '#0a1020', opacity: fadeOut * 0.72 }} />
    </div>
  );
}
