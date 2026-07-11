// match-scenes.jsx — "WorldCup26 Bonus - Norway: The Viking Row" (100s, clip-based).
// Every scene plays a REAL video clip (ClipSprite → clips.json). NO subtitles,
// NO sentence text on screen (rule #10): only the title card, ≤4-word labels,
// player NAME + position, the RO! RO! chant label, and the worldcup26.world CTA.

// ── 0-8s · Cold open: the stadium breathes ───────────────────────────────────
function SceneColdOpen() {
  const { localTime: lt } = useSprite();
  return (
    <div style={{ position: 'absolute', inset: 0, background: MV.bg }}>
      <ClipSprite id="stadium" dim={0.28} />
      <Vignette strength={0.6} />
      <Letterbox />
      <div style={{ position: 'absolute', inset: 0, zIndex: 25, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 30 }}>
        {lt > 2.2 && <Kicker color={MV.gold} size={30}>WorldCup26 Bonus</Kicker>}
        {lt > 2.8 && <TitleReveal text="NORWAY" start={2.8} size={190} color="#fff" />}
        {lt > 4.4 && <Kicker color={MV.nor} size={40}>The Viking Row</Kicker>}
      </div>
      <AmbientParticles start={0} dur={8} color="255,255,255" count={28} />
    </div>
  );
}

// ── 8-16s · The Gjallarhorn sounds ───────────────────────────────────────────
function SceneHorn() {
  return (
    <div style={{ position: 'absolute', inset: 0, background: MV.bg }}>
      <ClipSprite id="horn" />
      <Vignette strength={0.5} />
      <Letterbox />
    </div>
  );
}

// ── 16-24s · The Row begins ──────────────────────────────────────────────────
function SceneRow() {
  return (
    <div style={{ position: 'absolute', inset: 0, background: MV.bg }}>
      <ClipSprite id="row1" />
      <ChantPulse start={16.6} dur={6.6} />
      <Vignette strength={0.5} />
      <Letterbox />
    </div>
  );
}

// ── Player hero scenes (silent clips; Brian + the score carry them) ──────────
function SceneHaaland() {
  return (
    <div style={{ position: 'absolute', inset: 0, background: MV.bg }}>
      <ClipSprite id="haaland" />
      <LowerThird start={25.2} name="ERLING HAALAND" role="Striker" />
      <Vignette strength={0.5} />
      <Letterbox />
    </div>
  );
}
function SceneOdegaard() {
  return (
    <div style={{ position: 'absolute', inset: 0, background: MV.bg }}>
      <ClipSprite id="odegaard" />
      <LowerThird start={37.1} name="MARTIN ØDEGAARD" role="Captain · Midfield" />
      <Vignette strength={0.5} />
      <Letterbox />
    </div>
  );
}
function SceneNusa() {
  return (
    <div style={{ position: 'absolute', inset: 0, background: MV.bg }}>
      <ClipSprite id="nusa" />
      <LowerThird start={49.1} name="ANTONIO NUSA" role="Winger" />
      <Vignette strength={0.5} />
      <Letterbox />
    </div>
  );
}
function SceneSorloth() {
  return (
    <div style={{ position: 'absolute', inset: 0, background: MV.bg }}>
      <ClipSprite id="sorloth" />
      <LowerThird start={61.1} name="ALEXANDER SØRLOTH" role="Striker" />
      <Vignette strength={0.5} />
      <Letterbox />
    </div>
  );
}
function SceneBerge() {
  return (
    <div style={{ position: 'absolute', inset: 0, background: MV.bg }}>
      <ClipSprite id="berge" />
      <LowerThird start={73.1} name="SANDER BERGE" role="Midfield" />
      <Vignette strength={0.5} />
      <Letterbox />
    </div>
  );
}

// ── RO! RO! chant bursts between the players (clip audio leads, no VO) ───────
function SceneBurstDrummer() {
  return (
    <div style={{ position: 'absolute', inset: 0, background: MV.bg }}>
      <ClipSprite id="drummer" />
      <ChantPulse start={32.3} dur={3.4} />
      <Vignette strength={0.45} />
      <Letterbox />
    </div>
  );
}
function SceneBurstFlags() {
  return (
    <div style={{ position: 'absolute', inset: 0, background: MV.bg }}>
      <ClipSprite id="row2" />
      <ChantPulse start={44.3} dur={3.4} />
      <Vignette strength={0.45} />
      <Letterbox />
    </div>
  );
}
function SceneBurstFamily() {
  return (
    <div style={{ position: 'absolute', inset: 0, background: MV.bg }}>
      <ClipSprite id="family" />
      <ChantPulse start={56.3} dur={3.4} />
      <Vignette strength={0.45} />
      <Letterbox />
    </div>
  );
}
function SceneBurstFlares() {
  return (
    <div style={{ position: 'absolute', inset: 0, background: MV.bg }}>
      <ClipSprite id="flares" />
      <ChantPulse start={68.3} dur={3.4} />
      <Vignette strength={0.45} />
      <Letterbox />
    </div>
  );
}

// ── 80-88s · They rowed past Brazil (real, 5 July 2026) ─────────────────────
function SceneCelebration() {
  return (
    <div style={{ position: 'absolute', inset: 0, background: MV.bg }}>
      <ClipSprite id="celebration" />
      <Confetti start={80.6} dur={7} count={110} />
      <Vignette strength={0.45} />
      <Letterbox />
    </div>
  );
}

// ── 88-94s · The longship sails on ───────────────────────────────────────────
function SceneFinale() {
  const { localTime: lt } = useSprite();
  return (
    <div style={{ position: 'absolute', inset: 0, background: MV.bg }}>
      <ClipSprite id="finale" />
      {lt > 3.4 && (
        <div style={{ position: 'absolute', left: 0, right: 0, bottom: 160, zIndex: 25, display: 'flex', justifyContent: 'center' }}>
          <Kicker color="#fff" size={34}>Ro! Ro!</Kicker>
        </div>
      )}
      <Vignette strength={0.5} />
      <Letterbox />
    </div>
  );
}

// ── 94-100s · CTA: worldcup26.world (free game, no prizes) ───────────────────
function SceneCTA() {
  const { localTime: lt } = useSprite();
  const inP = Easing.easeOutCubic(clamp(lt / 1.0, 0, 1));
  const chips = ['FREE TO PLAY', 'JUST FOR FUN', 'NO PRIZES'];
  return (
    <div style={{ position: 'absolute', inset: 0, background: `linear-gradient(160deg, #10192e 0%, #07090f 70%)` }}>
      <div style={{ position: 'absolute', inset: 0, background: `radial-gradient(ellipse at 50% 20%, rgba(186,12,47,0.30) 0%, transparent 60%)` }} />
      <AmbientParticles start={94} dur={6} count={34} />
      <div style={{ position: 'absolute', inset: 0, zIndex: 25, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 34, opacity: inP }}>
        <div style={{ transform: `translateY(${(1 - inP) * 40}px)` }}><FlagNOR w={130} /></div>
        <Kicker color="#9fb4d8" size={30}>Pick Your 3 Teams</Kicker>
        <BigTitle size={104} color="#fff" glow={MV.nor}>worldcup26.world</BigTitle>
        <div style={{ display: 'flex', gap: 26, marginTop: 6 }}>
          {chips.map((c, i) => {
            const cp = Easing.easeOutBack(clamp((lt - 1.0 - i * 0.3) / 0.6, 0, 1));
            return (
              <div key={i} style={{
                opacity: clamp(cp, 0, 1), transform: `scale(${cp})`,
                fontFamily: '"Inter",sans-serif', fontWeight: 800, fontSize: 30, color: '#fff',
                letterSpacing: '0.14em', padding: '16px 34px', borderRadius: 999,
                border: `2px solid ${MV.line}`, background: 'rgba(255,255,255,0.06)',
              }}>{c}</div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
