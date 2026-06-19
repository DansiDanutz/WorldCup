// match-scenes.jsx — the twelve scenes of Episode 33: SCOTLAND vs MOROCCO (300s).
// Scene windows must match the SCENES table in match.html and narration.json.
// CLIP-BASED: real Higgsfield (Kling 3.0) video animations via VideoSprite. SOCCER ONLY —
// round-neck shirts, a pitch with goals, never gridiron.
// NO SUBTITLES (CLAUDE.md #10): zero sentence/caption text — only title cards, short
// section labels (<=4 words), player NAME labels, the score bug, OUR PREDICTION, the CTA.
// REAL-RESULTS-ONLY: the 0-0 is OUR PREDICTION (decided by two saves).
// Story spine: Scotland 1974 — the first nation ever eliminated from a World Cup without
// losing a match (unbeaten, out on goal difference); Morocco 2022 — the first African
// team to reach a World Cup semifinal (4th). Two nations bound by glorious near-misses.
// Legend 033 = the Ghost of Goal Difference. Palette: Scotland royal blue; Morocco red+green.

// ── 1. Cold open (0–16): two ghosts of glorious heartbreak ───────────────────
function SceneColdOpen() {
  const { localTime: lt } = useSprite();
  const beat = Math.pow(Math.max(0, Math.sin(lt * Math.PI * 1.1)), 8);
  const titleP = Easing.easeOutCubic(clamp((lt - 12.3) / 1.4, 0, 1));
  return (
    <div style={{ position: 'absolute', inset: 0, background: '#000' }}>
      {/* the Tartan ghost of '74, then the Atlas spirit of '22 */}
      <VideoSprite src="assets/ghost-74.mp4" start={0} dur={8} dim={0.26}
        style={{ filter: 'brightness(0.7) contrast(1.16) saturate(0.92)' }} />
      <VideoSprite src="assets/ghost-atlas.mp4" start={8} dur={8} dim={0.26}
        style={{ filter: 'brightness(0.74) contrast(1.14) saturate(1.05)' }} />
      <div style={{ position: 'absolute', inset: 0, background: `radial-gradient(ellipse at 50% 78%, rgba(0,101,191,0.16) 0%, transparent 55%)` }} />
      <div style={{ position: 'absolute', inset: 0, background: `radial-gradient(ellipse at center, rgba(193,39,45,${(0.4 * beat).toFixed(3)}) 0%, transparent 62%)` }} />
      <Vignette strength={0.85} />
      {lt > 12.3 && (
        <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 30, opacity: titleP, zIndex: 22 }}>
          <Kicker size={32} color="#cfe0f5">A true story</Kicker>
          <TitleReveal text="GLORIOUS HEARTBREAK" start={12.4} size={92} color={MV.gold} />
        </div>
      )}
      <Letterbox />
    </div>
  );
}

// ── 2. Recap + title card (16–28) ────────────────────────────────────────────
function SceneTitle() {
  const { localTime: lt } = useSprite();
  const recapP = Easing.easeOutCubic(clamp(lt / 0.9, 0, 1)) * Math.max(0, Math.min(1, (10.5 - lt) / 1.0));
  const p1 = Easing.easeOutCubic(clamp((lt - 10.0) / 1.0, 0, 1));
  const p2 = Easing.easeOutBack(clamp((lt - 10.6) / 1.0, 0, 1));
  const p3 = Easing.easeOutCubic(clamp((lt - 11.4) / 0.9, 0, 1));
  return (
    <div style={{ position: 'absolute', inset: 0, background: `linear-gradient(180deg, #0a0f1c 0%, #11182b 55%, #0a0f1c 100%)` }}>
      <VideoSprite src="assets/atlas-hopeful.mp4" start={16} dur={14} dim={0.58} fit="cover" style={{ filter: "brightness(0.66) saturate(1.05)" }} />
      <div style={{ position: "absolute", inset: 0, background: "linear-gradient(180deg, rgba(7,10,18,0.45), rgba(7,10,18,0.8))" }} />
      <AmbientParticles start={16} dur={12} count={34} color="193,39,45" />
      {/* RECAP — OUR PREDICTION from Ep32 (never stated as a real result) */}
      {recapP > 0.01 && (
        <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 22, opacity: recapP }}>
          <Kicker size={26} color={MV.muted}>Last time · our prediction</Kicker>
          <BigTitle size={62} color={MV.text} glow={MV.gold} style={{ maxWidth: 1500 }}>USA 2 — 1 AUSTRALIA</BigTitle>
        </div>
      )}
      {/* TITLE CARD */}
      {lt >= 9.5 && (
        <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 40 }}>
          <div style={{ opacity: p1, transform: `translateY(${(1 - p1) * -30}px)` }}>
            <Kicker color={MV.aut}>WorldCup26 Legends · Episode 33</Kicker>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 70, opacity: clamp(p2, 0, 1), transform: `scale(${p2})` }}>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 20 }}>
              <Waving><FlagSCO w={230} /></Waving>
              <BigTitle size={62} glow={MV.aut}>SCOTLAND</BigTitle>
            </div>
            <BigTitle size={120} color={MV.gold}>VS</BigTitle>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 20 }}>
              <Waving speed={1.9}><FlagMAR w={230} /></Waving>
              <BigTitle size={62} glow={MV.jor}>MOROCCO</BigTitle>
            </div>
          </div>
          <div style={{ opacity: p3, transform: `translateY(${(1 - p3) * 26}px)`, fontFamily: '"Inter",sans-serif', fontWeight: 600, fontSize: 32, color: MV.muted, letterSpacing: '0.08em' }}>
            THE TARTAN ARMY vs THE ATLAS LIONS
          </div>
        </div>
      )}
      <Letterbox />
    </div>
  );
}

// ── 3. Tease (28–46.5) ───────────────────────────────────────────────────────
function SceneTease() {
  const { localTime: lt } = useSprite();
  const a = Easing.easeOutCubic(clamp((lt - 0.4) / 1.0, 0, 1));
  return (
    <div style={{ position: 'absolute', inset: 0, background: '#05060a' }}>
      <VideoSprite src="assets/stadium-night.mp4" start={30} dur={20} dim={0.42} fit="cover" />
      <Vignette strength={0.5} />
      <AmbientParticles start={28} dur={18.5} count={26} color="255,209,74" />
      <div style={{ position: 'absolute', top: 200, left: 0, right: 0, textAlign: 'center', zIndex: 25, opacity: a, transform: `translateY(${(1 - a) * 24}px)` }}>
        <div style={{ fontFamily: '"Inter",sans-serif', fontWeight: 900, fontSize: 76, color: MV.text, letterSpacing: '0.03em', marginTop: 18, textShadow: '0 4px 22px rgba(0,0,0,0.85)' }}>
          TARTAN vs ATLAS
        </div>
      </div>
      <Letterbox />
    </div>
  );
}

// ── 4. History (46.5–150): Scotland 1974 unbeaten-out + Morocco 2022 semifinal ─
function HistoryPlate({ start, end, year, venue, score, accent = MV.gold, stamp }) {
  const t = useTime();
  if (t < start || t > end) return null;
  const p = Easing.easeOutBack(clamp((t - start) / 0.8, 0, 1));
  const fade = t > end - 0.6 ? (end - t) / 0.6 : 1;
  const stampP = stamp ? Easing.easeOutBack(clamp((t - start - 1.6) / 0.5, 0, 1)) : 0;
  return (
    <div style={{ position: 'absolute', inset: 0, zIndex: 25, display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: clamp(p, 0, 1) * clamp(fade, 0, 1) }}>
      <div style={{ transform: `scale(${0.86 + 0.14 * p})`, background: MV.panel, border: `1px solid ${MV.line}`, borderRadius: 24, padding: '52px 100px', textAlign: 'center', position: 'relative', boxShadow: '0 30px 110px rgba(0,0,0,0.65)', backdropFilter: 'blur(4px)', maxWidth: 1200 }}>
        <div style={{ fontFamily: '"Inter",sans-serif', fontWeight: 800, fontSize: 30, color: MV.muted, letterSpacing: '0.30em' }}>{venue}</div>
        <div style={{ fontFamily: '"Inter",sans-serif', fontWeight: 900, fontSize: 96, color: accent, lineHeight: 1.05, margin: '14px 0 6px', textShadow: `0 0 60px ${accent}44` }}>{score}</div>
        <div style={{ fontFamily: '"Inter",sans-serif', fontWeight: 800, fontSize: 42, color: MV.text, letterSpacing: '0.06em' }}>{year}</div>
        {stamp && stampP > 0 && (
          <div style={{ position: 'absolute', top: -34, right: -60, transform: `rotate(-12deg) scale(${stampP})`, border: `5px solid ${MV.jorGreen}`, color: MV.jorGreen, borderRadius: 14, padding: '10px 26px', fontFamily: '"Inter",sans-serif', fontWeight: 900, fontSize: 32, letterSpacing: '0.08em', background: 'rgba(7,9,15,0.85)' }}>{stamp}</div>
        )}
      </div>
    </div>
  );
}

function SceneHistory() {
  const S = 46.5;
  const t = useTime();
  const scotBg = t < 101;
  return (
    <div style={{ position: 'absolute', inset: 0, background: '#05060a' }}>
      {scotBg ? (
        <VideoSprite src="assets/history-1974.mp4" start={S} dur={54.5} dim={0.7}
          style={{ filter: 'brightness(0.3) saturate(0.7) contrast(1.1) sepia(0.3)' }} />
      ) : (
        <VideoSprite src="assets/history-2022.mp4" start={101} dur={49} dim={0.68}
          style={{ filter: 'brightness(0.3) saturate(1.0) contrast(1.1)' }} />
      )}
      <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse at center, transparent 30%, rgba(5,6,10,0.82) 100%)' }} />
      <AmbientParticles start={S} dur={103.5} count={28} color={scotBg ? '79,147,221' : '193,39,45'} maxR={4} />
      <div style={{ position: 'absolute', top: 116, left: 0, right: 0, textAlign: 'center', zIndex: 26 }}>
        <Kicker size={28} color={scotBg ? MV.aut : MV.jor}>Chapter One · The True History</Kicker>
        <div style={{ fontFamily: '"Inter",sans-serif', fontWeight: 900, fontSize: 50, color: MV.text, letterSpacing: '0.04em', marginTop: 16, textShadow: '0 4px 22px rgba(0,0,0,0.8)' }}>
          {scotBg ? 'THE UNBEATEN' : 'THE ATLAS LIONS'}
        </div>
      </div>
      <div style={{ position: 'absolute', bottom: 124, left: 0, right: 0, display: 'flex', justifyContent: 'center', zIndex: 26, opacity: 0.95 }}>
        {scotBg ? <FlagSCO w={120} /> : <FlagMAR w={120} />}
      </div>
      {/* SCOTLAND 1974 (narration ~54–84) */}
      <HistoryPlate start={S + 6.0}  end={S + 16.0} year="1974 · WEST GERMANY" venue="SCOTLAND" score="NEVER LOST" accent={MV.aut} />
      <HistoryPlate start={S + 16.0} end={S + 26.0} year="DREW BRAZIL · BEAT ZAIRE" venue="UNBEATEN" score="0 — 0" accent={MV.gold} />
      <HistoryPlate start={S + 26.0} end={S + 37.0} year="OUT ON GOAL DIFFERENCE" venue="THE CRUELLEST EXIT" score="FIRST EVER" accent={MV.aut} stamp="1974" />
      {/* MOROCCO 2022 (narration ~84–113) */}
      <HistoryPlate start={S + 56.0} end={S + 66.0} year="2022 · QATAR" venue="MOROCCO" score="BEAT SPAIN" accent={MV.jor} stamp="2022" />
      <HistoryPlate start={S + 66.0} end={S + 77.0} year="FIRST AFRICAN SEMIFINAL" venue="THE ATLAS LIONS" score="LAST FOUR" accent={MV.jorGreen} />
      <HistoryPlate start={S + 77.0} end={S + 103.5} year="THE GREATEST RUN" venue="AFRICA'S BEST EVER" score="4TH" accent={MV.jor} />
      <Vignette strength={0.5} />
      <Letterbox />
    </div>
  );
}

// ── Squad montage grid ───────────────────────────────────────────────────────
function SquadGrid({ start, end, players, accent }) {
  const t = useTime();
  if (t < start || t > end) return null;
  const fade = t > end - 0.5 ? (end - t) / 0.5 : 1;
  return (
    <div style={{ position: 'absolute', inset: 0, zIndex: 25, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 30, opacity: clamp(fade, 0, 1), padding: '0 70px' }}>
      {players.map((p, i) => {
        const cp = Easing.easeOutBack(clamp((t - start - 0.25 - i * 0.28) / 0.7, 0, 1));
        return (
          <div key={i} style={{ width: 280, transform: `translateY(${(1 - cp) * 90}px) scale(${0.85 + 0.15 * cp})`, opacity: clamp(cp, 0, 1), borderRadius: 22, overflow: 'hidden', background: MV.panel, border: `1px solid ${MV.line}`, boxShadow: `0 26px 80px rgba(0,0,0,0.6)` }}>
            <div style={{ height: 318, overflow: 'hidden' }}>
              <VideoSprite src={p.clip} start={start} dur={end - start} fit="cover" />
            </div>
            <div style={{ padding: '18px 16px 20px', textAlign: 'center', borderTop: `4px solid ${accent}` }}>
              <div style={{ fontFamily: '"Inter",sans-serif', fontWeight: 900, fontSize: 24, color: MV.text }}>{p.name}</div>
              <div style={{ fontFamily: '"Inter",sans-serif', fontWeight: 700, fontSize: 16, color: MV.muted, letterSpacing: '0.16em', marginTop: 5 }}>{p.role}</div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ── 5. Scotland squad (150–178) ──────────────────────────────────────────────
function SceneScotland() {
  const { localTime: lt } = useSprite();
  const S = 150.0;
  const headerP = Easing.easeOutCubic(clamp(lt / 0.9, 0, 1));
  return (
    <div style={{ position: 'absolute', inset: 0, background: '#0a0c14' }}>
      <PitchBackdrop tint="#0a1c3a" dim={0.4} />
      <div style={{ position: 'absolute', inset: 0, zIndex: 22, pointerEvents: 'none', background: `linear-gradient(90deg, rgba(0,101,191,0.22) 0%, transparent 30%, transparent 70%, rgba(255,255,255,0.10) 100%)` }} />
      <div style={{ position: 'absolute', top: 108, left: 0, right: 0, display: 'flex', justifyContent: 'center', zIndex: 26, opacity: headerP, transform: `translateY(${(1 - headerP) * -24}px)` }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 26, background: MV.panel, border: `1px solid ${MV.line}`, borderRadius: 999, padding: '16px 44px' }}>
          <FlagSCO w={74} />
          <span style={{ fontFamily: '"Inter",sans-serif', fontWeight: 900, fontSize: 40, color: MV.text, letterSpacing: '0.10em' }}>SCOTLAND · THE TARTAN ARMY</span>
        </div>
      </div>
      <SquadGrid start={S + 0.4} end={S + 27.0} accent={MV.aut} players={[
        { clip: 'assets/player-mctominay.mp4', name: 'McTOMINAY', role: 'MIDFIELD · GOALS' },
        { clip: 'assets/player-robertson.mp4', name: 'ROBERTSON', role: 'CAPTAIN · FULL-BACK' },
        { clip: 'assets/player-tierney.mp4', name: 'TIERNEY', role: 'THE WARRIOR' },
        { clip: 'assets/player-mcginn.mp4', name: 'McGINN', role: 'TWENTY GOALS' },
        { clip: 'assets/player-shankland.mp4', name: 'SHANKLAND', role: 'THE STRIKER' },
      ]} />
      <Sprite start={150.0} end={160.0}><LowerThird start={150.4} name="SCOTT McTOMINAY" role="Midfield · Goals" accent={MV.aut} /></Sprite>
      <Sprite start={160.0} end={170.0}><LowerThird start={160.4} name="ANDY ROBERTSON" role="Captain" accent={MV.aut} /></Sprite>
      <Sprite start={170.0} end={178.0}><LowerThird start={170.3} name="JOHN McGINN" role="Twenty Goals" accent={MV.autSoft} /></Sprite>
      <Vignette strength={0.42} />
      <Letterbox />
    </div>
  );
}

// ── 6. Morocco squad (178–195) ───────────────────────────────────────────────
function SceneMorocco() {
  const { localTime: lt } = useSprite();
  const S = 178.0;
  const headerP = Easing.easeOutCubic(clamp(lt / 0.9, 0, 1));
  return (
    <div style={{ position: 'absolute', inset: 0, background: '#0a0c14' }}>
      <PitchBackdrop tint="#2a0a0e" dim={0.4} />
      <div style={{ position: 'absolute', inset: 0, zIndex: 22, pointerEvents: 'none', background: `linear-gradient(90deg, rgba(193,39,45,0.24) 0%, transparent 30%, transparent 70%, rgba(0,98,51,0.2) 100%)` }} />
      <div style={{ position: 'absolute', top: 108, left: 0, right: 0, display: 'flex', justifyContent: 'center', zIndex: 26, opacity: headerP, transform: `translateY(${(1 - headerP) * -24}px)` }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 26, background: MV.panel, border: `1px solid ${MV.line}`, borderRadius: 999, padding: '16px 44px' }}>
          <FlagMAR w={74} />
          <span style={{ fontFamily: '"Inter",sans-serif', fontWeight: 900, fontSize: 40, color: MV.text, letterSpacing: '0.10em' }}>MOROCCO · THE ATLAS LIONS</span>
        </div>
      </div>
      <SquadGrid start={S + 0.4} end={S + 16.5} accent={MV.jor} players={[
        { clip: 'assets/player-hakimi.mp4', name: 'HAKIMI', role: 'RIGHT-BACK · PACE' },
        { clip: 'assets/player-ziyech.mp4', name: 'ZIYECH', role: 'THE MAGIC LEFT' },
        { clip: 'assets/player-ennesyri.mp4', name: 'EN-NESYRI', role: 'THE TOWER' },
        { clip: 'assets/player-amrabat.mp4', name: 'AMRABAT', role: 'THE ENGINE' },
        { clip: 'assets/player-khannouss.mp4', name: 'EL-KHANNOUSS', role: 'THE PLAYMAKER' },
      ]} />
      <Sprite start={178.0} end={187.0}><LowerThird start={178.3} name="ACHRAF HAKIMI" role="Right-Back · Pace" accent={MV.jor} /></Sprite>
      <Sprite start={187.0} end={195.0}><LowerThird start={187.3} name="YOUSSEF EN-NESYRI" role="The Tower" accent={MV.jorGreen} /></Sprite>
      <Vignette strength={0.42} />
      <Letterbox />
    </div>
  );
}

// ── 7. The duel (195–213): Highland fire vs Desert wind ──────────────────────
function SceneDuel() {
  const { localTime: lt } = useSprite();
  const slideP = Easing.easeOutQuart(clamp(lt / 1.1, 0, 1));
  const vsP = Easing.easeOutBack(clamp((lt - 0.9) / 0.8, 0, 1));
  const shake = lt > 0.9 && lt < 1.25 ? Math.sin(lt * 160) * 7 * (1.25 - lt) / 0.35 : 0;
  return (
    <div style={{ position: 'absolute', inset: 0, background: '#05060a', transform: `translate(${shake}px, ${-shake}px)` }}>
      <div style={{ position: 'absolute', top: 0, bottom: 0, left: 0, width: '50%', overflow: 'hidden', transform: `translateX(${(1 - slideP) * -100}%)` }}>
        <VideoSprite src="assets/player-mctominay.mp4" start={195} dur={18.5} rate={0.6} fit="cover" />
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(90deg, rgba(0,101,191,0.38), transparent 65%)' }} />
        <div style={{ position: 'absolute', bottom: 150, left: 90, fontFamily: '"Inter",sans-serif', fontWeight: 900, fontSize: 58, color: '#fff', textShadow: '0 4px 26px rgba(0,0,0,0.9)' }}>
          HIGHLAND FIRE
          <div style={{ fontSize: 27, fontWeight: 700, color: MV.gold, letterSpacing: '0.2em', marginTop: 8 }}>SCOTLAND</div>
        </div>
      </div>
      <div style={{ position: 'absolute', top: 0, bottom: 0, right: 0, width: '50%', overflow: 'hidden', transform: `translateX(${(1 - slideP) * 100}%)` }}>
        <VideoSprite src="assets/player-hakimi.mp4" start={195} dur={18.5} rate={0.6} fit="cover" />
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(270deg, rgba(193,39,45,0.42), transparent 65%)' }} />
        <div style={{ position: 'absolute', bottom: 150, right: 90, textAlign: 'right', fontFamily: '"Inter",sans-serif', fontWeight: 900, fontSize: 58, color: '#fff', textShadow: '0 4px 26px rgba(0,0,0,0.9)' }}>
          DESERT WIND
          <div style={{ fontSize: 27, fontWeight: 700, color: MV.gold, letterSpacing: '0.2em', marginTop: 8 }}>MOROCCO</div>
        </div>
      </div>
      <div style={{ position: 'absolute', top: 0, bottom: 0, left: 'calc(50% - 3px)', width: 6, background: `linear-gradient(180deg, transparent, ${MV.gold}, transparent)`, zIndex: 24, opacity: slideP }} />
      <div style={{ position: 'absolute', top: '50%', left: '50%', zIndex: 26, transform: `translate(-50%,-50%) scale(${vsP}) rotate(${(1 - vsP) * 20}deg)`, opacity: clamp(vsP, 0, 1), width: 210, height: 210, borderRadius: '50%', background: MV.panel, border: `5px solid ${MV.gold}`, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: `0 0 90px ${MV.gold}66` }}>
        <span style={{ fontFamily: '"Inter",sans-serif', fontWeight: 900, fontSize: 92, color: MV.gold }}>VS</span>
      </div>
      <Letterbox />
    </div>
  );
}

// ── 8. Match drama (213–256): OUR PREDICTION 0-0, decided by two saves ───────
// McTominay header → Bounou tips it over (~221). En-Nesyri header → Gordon claws it (~233).
// Speed-ramp the saves. Score stays 0-0 to the whistle. Full-time = OUR PREDICTION.
function SceneDrama() {
  const { localTime: lt } = useSprite();
  const S = 213.0;
  return (
    <div style={{ position: 'absolute', inset: 0, background: '#000' }}>
      {/* the corner swung in → the header */}
      <VideoSprite src="assets/corner-swing.mp4" start={S} dur={8.5} from={1.08} to={1.2} dim={0.16} />
      {/* SAVE 1 — Bounou tips McTominay's header over (speed-ramp: slow dread → snap) */}
      <Sprite start={221} end={233}>
        <VideoSprite src="assets/keeper-save-mor.mp4" start={221} dur={12} rate={0.4} dim={0.12} />
      </Sprite>
      {/* anxious Tartan reaction overlay */}
      <Sprite start={229} end={233}>
        <VideoSprite src="assets/tartan-anxious.mp4" start={229} dur={4} dim={0.3} style={{ opacity: 0.5 }} />
      </Sprite>
      {/* SAVE 2 — Gordon claws En-Nesyri's header away */}
      <Sprite start={233} end={245}>
        <VideoSprite src="assets/keeper-save-scot.mp4" start={233} dur={12} rate={0.4} dim={0.12} />
      </Sprite>
      <Sprite start={241} end={245}>
        <VideoSprite src="assets/atlas-anxious.mp4" start={241} dur={4} dim={0.3} style={{ opacity: 0.5 }} />
      </Sprite>
      {/* full-time handshake */}
      <Sprite start={245} end={256}>
        <VideoSprite src="assets/handshake.mp4" start={245} dur={11} from={1.06} to={1.18} dim={0.2} />
      </Sprite>
      {/* OUR PREDICTION watermark — REAL-RESULTS-ONLY rule */}
      <div style={{ position: 'absolute', top: 116, left: 0, right: 0, textAlign: 'center', zIndex: 25 }}>
        <Kicker size={24} color={MV.gold}>Our Prediction · Our Story</Kicker>
      </div>
      {/* score bug holds 0-0 throughout */}
      <Sprite start={213.0} end={221.0}><ScoreBug start={S + 0.4} aut={0} jor={0} minute="33rd min" /></Sprite>
      {/* SAVE flashes (blue for Bounou denying Scotland, red for Gordon denying Morocco) */}
      <GoalFlash at={S + 8.0} color={MV.aut} />
      <Sprite start={221.0} end={233.0}><ScoreBug start={S + 8.0} aut={0} jor={0} minute="SAVE! BOUNOU" /></Sprite>
      <GoalFlash at={S + 20.0} color={MV.jor} />
      <Sprite start={233.0} end={245.0}><ScoreBug start={S + 20.0} aut={0} jor={0} minute="SAVE! GORDON" /></Sprite>
      <Sprite start={245.0} end={250.0}><ScoreBug start={S + 32.0} aut={0} jor={0} minute="full time" /></Sprite>
      <Sprite start={250.0} end={256.0}><FullTimeCard start={S + 37.0} /></Sprite>
      <Vignette strength={0.42} />
      <Letterbox />
    </div>
  );
}

function FullTimeCard({ start }) {
  const t = useTime();
  const local = t - start;
  const p = Easing.easeOutCubic(clamp(local / 1.0, 0, 1));
  return (
    <div style={{ position: 'absolute', inset: 0, zIndex: 26, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(2,3,6,0.62)', opacity: p }}>
      <div style={{ background: MV.panel, border: `1px solid ${MV.line}`, borderRadius: 26, padding: '54px 100px', textAlign: 'center', transform: `scale(${0.92 + 0.08 * p})`, boxShadow: '0 30px 120px rgba(0,0,0,0.7)' }}>
        <Kicker size={26} color={MV.gold}>Our Prediction · Full Time</Kicker>
        <div style={{ display: 'flex', alignItems: 'center', gap: 56, marginTop: 36 }}>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16 }}>
            <FlagSCO w={150} />
            <span style={{ fontFamily: '"Inter",sans-serif', fontWeight: 800, fontSize: 34, color: MV.text }}>SCOTLAND</span>
          </div>
          <BigTitle size={170} color={MV.gold}>0 — 0</BigTitle>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16 }}>
            <FlagMAR w={150} />
            <span style={{ fontFamily: '"Inter",sans-serif', fontWeight: 800, fontSize: 34, color: MV.text }}>MOROCCO</span>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── 9. Verdict (256–266): do you agree? SCOTLAND / MOROCCO ───────────────────
function SceneVerdict() {
  const { localTime: lt } = useSprite();
  const S = 256.0;
  const headP = Easing.easeOutCubic(clamp(lt / 0.8, 0, 1));
  const a = Easing.easeOutBack(clamp((lt - 1.2) / 0.7, 0, 1));
  const b = Easing.easeOutBack(clamp((lt - 1.6) / 0.7, 0, 1));
  return (
    <div style={{ position: 'absolute', inset: 0, background: '#0a0f1c' }}>
      <VideoSprite src="assets/tartan-hopeful.mp4" start={S} dur={10} dim={0.55} fit="cover" style={{ filter: 'brightness(0.6)' }} />
      <div style={{ position: 'absolute', inset: 0, background: 'rgba(8,12,22,0.6)' }} />
      <div style={{ position: 'absolute', top: 150, left: 0, right: 0, textAlign: 'center', zIndex: 25, opacity: headP }}>
        <div style={{ fontFamily: '"Inter",sans-serif', fontWeight: 900, fontSize: 72, color: MV.gold, marginTop: 18, letterSpacing: '0.04em' }}>DO YOU AGREE?</div>
      </div>
      <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 70, zIndex: 26, marginTop: 60 }}>
        <div style={{ opacity: clamp(a, 0, 1), transform: `translateY(${(1 - a) * 50}px) scale(${0.85 + 0.15 * a})`, background: 'rgba(0,101,191,0.16)', border: `2px solid ${MV.aut}`, borderRadius: 22, padding: '34px 60px', textAlign: 'center', minWidth: 420 }}>
          <div style={{ fontFamily: '"Inter",sans-serif', fontWeight: 900, fontSize: 52, color: MV.autSoft, letterSpacing: '0.06em' }}>“SCOTLAND”</div>
        </div>
        <div style={{ opacity: clamp(b, 0, 1), transform: `translateY(${(1 - b) * 50}px) scale(${0.85 + 0.15 * b})`, background: 'rgba(193,39,45,0.18)', border: `2px solid ${MV.jor}`, borderRadius: 22, padding: '34px 60px', textAlign: 'center', minWidth: 420 }}>
          <div style={{ fontFamily: '"Inter",sans-serif', fontWeight: 900, fontSize: 52, color: '#f08a8f', letterSpacing: '0.06em' }}>“MOROCCO”</div>
        </div>
      </div>
      <Vignette strength={0.5} />
      <Letterbox />
    </div>
  );
}

// ── 10. Mystery Supporter (266–284): Legend 033 — the Ghost of Goal Difference ─
function SceneMystery() {
  const { localTime: lt } = useSprite();
  const S = 266.0;
  const inP = Easing.easeOutCubic(clamp((lt - 0.6) / 1.4, 0, 1));
  const plateP = Easing.easeOutBack(clamp((lt - 4.2) / 0.9, 0, 1));
  return (
    <div style={{ position: 'absolute', inset: 0, background: '#02030a' }}>
      <VideoSprite src="assets/legend-033.mp4" start={S} dur={18} from={1.12} to={1.26} panY={-16}
        dim={0.3} style={{ filter: 'brightness(0.5) contrast(1.12) saturate(1.0)' }} />
      <div style={{ position: 'absolute', inset: 0, zIndex: 21, pointerEvents: 'none', opacity: 0.5, background: `radial-gradient(ellipse at ${20 + Math.sin(lt * 0.3) * 14}% 75%, rgba(0,101,191,0.16) 0%, transparent 45%), radial-gradient(ellipse at ${78 - Math.sin(lt * 0.22) * 12}% 30%, rgba(193,39,45,0.14) 0%, transparent 50%)` }} />
      <AmbientParticles start={S} dur={18} count={46} color="200,210,255" maxR={3.5} zIndex={22} />
      <div style={{ position: 'absolute', top: 118, left: 0, right: 0, textAlign: 'center', zIndex: 25, opacity: inP }}>
        <Kicker size={26} color="#bcd0ee">The Mystery Supporter · Legend No. 033</Kicker>
      </div>
      {plateP > 0 && (
        <div style={{ position: 'absolute', left: 110, bottom: 150, zIndex: 25, opacity: clamp(plateP, 0, 1), transform: `translateY(${(1 - plateP) * 50}px)` }}>
          <div style={{ background: 'rgba(8,12,20,0.9)', border: '1px solid rgba(160,190,235,0.4)', borderRadius: 18, padding: '28px 44px', backdropFilter: 'blur(6px)' }}>
            <div style={{ fontFamily: '"Inter",sans-serif', fontWeight: 900, fontSize: 52, color: '#eaf2ff', letterSpacing: '0.02em' }}>THE GHOST OF GOAL DIFFERENCE</div>
            <div style={{ fontFamily: '"Inter",sans-serif', fontWeight: 700, fontSize: 24, color: '#bcd0ee', letterSpacing: '0.14em', marginTop: 8 }}>1974 · THE UNBEATEN EXIT</div>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 12, marginTop: 18, background: 'rgba(255,210,74,0.12)', border: '1px solid rgba(255,210,74,0.5)', borderRadius: 999, padding: '10px 24px' }}>
              <span style={{ fontSize: 26 }}>✦</span>
              <span style={{ fontFamily: '"Inter",sans-serif', fontWeight: 800, fontSize: 24, color: MV.gold, letterSpacing: '0.08em' }}>COLLECT HIM INSIDE THE GAME · worldcup26.world</span>
            </div>
          </div>
        </div>
      )}
      <Vignette strength={0.55} />
      <Letterbox />
    </div>
  );
}

// ── 11. App promo (284–292): worldcup26.world ────────────────────────────────
function SceneApp() {
  const { localTime: lt } = useSprite();
  const S = 284.0;
  const inP = Easing.easeOutCubic(clamp(lt / 1.0, 0, 1));
  const cards = [
    { name: 'SCOTLAND', mult: '3× PER GOAL', pts: 'UNDERDOG', flag: <FlagSCO w={86} />, hot: true },
    { name: 'MOROCCO', mult: '2× PER GOAL', pts: 'TOP PICK', flag: <FlagMAR w={86} />, hot: true },
    { name: 'BRAZIL', mult: '1× PER GOAL', pts: '', flag: <div style={{ width: 86, height: 57, borderRadius: 6, background: 'linear-gradient(135deg,#159b46 55%,#ffd24a 55%)' }} /> },
  ];
  return (
    <div style={{ position: 'absolute', inset: 0, background: `linear-gradient(160deg, #0d2a20 0%, #07090f 70%)` }}>
      <VideoSprite src="assets/atlas-jubilant.mp4" start={S} dur={8} dim={0.7} fit="cover" style={{ filter: 'brightness(0.4)' }} />
      <div style={{ position: 'absolute', inset: 0, background: `radial-gradient(ellipse at 50% 20%, rgba(16,107,79,0.4) 0%, rgba(7,9,15,0.85) 65%)` }} />
      <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 30, opacity: inP }}>
        <Kicker color="#7fd6b5" size={30}>The Prediction Game</Kicker>
        <BigTitle size={100} color="#fff" glow={MV.green}>worldcup26.world</BigTitle>
        <div style={{ display: 'flex', gap: 36, marginTop: 8 }}>
          {cards.map((c, i) => {
            const cp = Easing.easeOutBack(clamp((lt - 1.2 - i * 0.35) / 0.7, 0, 1));
            return (
              <div key={i} style={{ transform: `translateY(${(1 - cp) * 60}px) scale(${0.8 + 0.2 * cp})`, opacity: clamp(cp, 0, 1), background: 'rgba(255,255,255,0.07)', border: `1px solid ${c.hot ? 'rgba(255,210,74,0.5)' : 'rgba(255,255,255,0.18)'}`, borderRadius: 22, padding: '34px 46px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16, minWidth: 290, boxShadow: '0 24px 70px rgba(0,0,0,0.45)' }}>
                {c.flag}
                <div style={{ fontFamily: '"Inter",sans-serif', fontWeight: 900, fontSize: 30, color: '#fff' }}>{c.name}</div>
                <div style={{ fontFamily: '"Inter",sans-serif', fontWeight: 800, fontSize: 26, color: MV.gold }}>{c.mult}</div>
                <div style={{ fontFamily: '"Inter",sans-serif', fontWeight: 800, fontSize: 26, color: c.hot ? '#6ee7a8' : '#9fb2a9' }}>{c.pts}</div>
              </div>
            );
          })}
        </div>
        <div style={{ fontFamily: '"Inter",sans-serif', fontWeight: 800, fontSize: 32, color: MV.gold, letterSpacing: '0.05em', marginTop: 6 }}>
          FREE TO PLAY · LIVE LEADERBOARD · JUST FOR FUN
        </div>
      </div>
      <Letterbox />
    </div>
  );
}

// ── 12. CTA outro (292–300) ──────────────────────────────────────────────────
function SceneCTA() {
  const { localTime: lt } = useSprite();
  const S = 292;
  const inP = Easing.easeOutCubic(clamp(lt / 0.8, 0, 1));
  return (
    <div style={{ position: 'absolute', inset: 0, background: '#07090f' }}>
      <VideoSprite src="assets/tartan-jubilant.mp4" start={S} dur={8} dim={0.62} fit="cover" style={{ filter: 'brightness(0.45)' }} />
      <div style={{ position: 'absolute', inset: 0, zIndex: 23, background: 'radial-gradient(ellipse at 50% 35%, transparent 0%, rgba(7,9,15,0.88) 75%)' }} />
      <div style={{ position: 'absolute', top: 200, left: 0, right: 0, textAlign: 'center', zIndex: 25, opacity: inP }}>
        <div style={{ marginTop: 24 }}><TitleReveal text="JOIN THE LEGENDS" start={S + 0.5} size={86} color={MV.text} /></div>
      </div>
      <div style={{ position: 'absolute', inset: 0, zIndex: 26 }}>
        <CtaButton start={S} delay={1.2} label="SUBSCRIBE" icon="🔔" accent="#0065BF" x={500} />
        <CtaButton start={S} delay={1.6} label="LIKE" icon="👍" accent="#c1272d" x={960} />
        <CtaButton start={S} delay={2.0} label="SHARE" icon="📣" accent="#c9942e" x={1400} />
      </div>
      <Sprite start={296.6} end={300}><NextMatchTease start={S + 4.6} /></Sprite>
      <Letterbox />
    </div>
  );
}

function NextMatchTease({ start }) {
  const t = useTime();
  const p = Easing.easeOutCubic(clamp((t - start) / 0.8, 0, 1));
  return (
    <div style={{ position: 'absolute', left: 0, right: 0, bottom: 150, display: 'flex', justifyContent: 'center', zIndex: 26, opacity: p, transform: `translateY(${(1 - p) * 24}px)` }}>
      <div style={{ background: MV.panel, border: `1px solid ${MV.line}`, borderRadius: 999, padding: '20px 54px', display: 'flex', alignItems: 'center', gap: 22 }}>
        <span style={{ fontFamily: '"Inter",sans-serif', fontWeight: 700, fontSize: 26, color: MV.muted, letterSpacing: '0.14em' }}>NEXT · EPISODE 34</span>
        <span style={{ fontFamily: '"Inter",sans-serif', fontWeight: 900, fontSize: 30, color: MV.gold }}>✦ BRAZIL vs HAITI · worldcup26.world</span>
      </div>
    </div>
  );
}
