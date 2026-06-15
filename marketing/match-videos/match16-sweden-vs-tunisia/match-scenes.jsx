// match-scenes.jsx — the twelve scenes of the Match 16 video (300s timeline).
// Sweden vs Tunisia, Group F. Scene windows must match the SCENES table in
// match.html and the VO slots in narration.json.
// IMAGE-BASED: Ken-Burns motion on still PNGs. SOCCER ONLY — round-neck shirts,
// a pitch with goals, never gridiron. REAL-RESULTS-ONLY: the 1-1 is OUR PREDICTION.
// NOTE: nested <Sprite> windows are GLOBAL seconds (Sprite reads the timeline clock).
// Theme: SWEDEN = the FROST (blue #006aa7 + yellow #fecc00); TUNISIA = the FIRE
// (red #e70013 + white). The "old man keeping a flame" = Legend 016 the Firekeeper.

// ── 1. Cold open (0–13): 1978 Tunisia — "they opened the door" ───────────────
function SceneColdOpen() {
  const { localTime: lt } = useSprite();
  const beat = Math.pow(Math.max(0, Math.sin(lt * Math.PI * 1.1)), 8);
  const line1P = Easing.easeOutCubic(clamp((lt - 1.0) / 1.4, 0, 1)) * (lt > 8.6 ? Math.max(0, (10.0 - lt) / 1.4) : 1);
  const titleP = Easing.easeOutCubic(clamp((lt - 10.0) / 1.2, 0, 1));
  return (
    <div style={{ position: 'absolute', inset: 0, background: '#000' }}>
      {/* Tunisia in red — the shirt that opened the door (dark, ember-lit) */}
      <KenBurns src="assets/player-mejbri.png" start={0} dur={13} from={1.16} to={1.32} panY={-26}
        dim={0.5} style={{ filter: 'brightness(0.46) contrast(1.18) saturate(1.1) grayscale(0.18)' }} />
      {/* ember base in Tunisia red/fire so the screen never reads as dead air */}
      <div style={{ position: 'absolute', inset: 0, background: `radial-gradient(ellipse at 50% 80%, rgba(255,90,31,0.20) 0%, transparent 55%)` }} />
      {/* keeper's-flame heartbeat glow */}
      <div style={{ position: 'absolute', inset: 0, background: `radial-gradient(ellipse at center, rgba(231,0,19,${(0.42 * beat).toFixed(3)}) 0%, transparent 62%)` }} />
      {line1P > 0.01 && (
        <div style={{
          position: 'absolute', left: 160, right: 160, bottom: 200, textAlign: 'center', zIndex: 22,
          opacity: line1P,
          fontFamily: '"Inter",sans-serif', fontWeight: 800, fontSize: 46, color: '#ffe3d4',
          letterSpacing: '0.04em', lineHeight: 1.25, textShadow: '0 4px 22px rgba(0,0,0,0.9)',
        }}>1978 — a tiny North African nation walked in unwanted… and kicked a door wide open for a whole continent.</div>
      )}
      <Vignette strength={0.85} />
      {lt > 10.0 && (
        <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 30, opacity: titleP, zIndex: 22 }}>
          <Kicker size={32} color="#ffd9c4">A true story</Kicker>
          <TitleReveal text="THEY OPENED THE DOOR" start={10.1} size={104} color={MV.tun} />
        </div>
      )}
      <Letterbox />
    </div>
  );
}

// ── 2. Recap + title card (13–29) ────────────────────────────────────────────
// Ep15 recap is OUR PREDICTION (Ivory Coast 1-1 Ecuador) — never a real result.
function SceneTitle() {
  const { localTime: lt } = useSprite();
  // first ~5s carries the Ep15 recap line, then the Ep16 title settles
  const recapP = Easing.easeOutCubic(clamp(lt / 0.9, 0, 1)) * Math.max(0, Math.min(1, (5.5 - lt) / 1.0));
  const p1 = Easing.easeOutCubic(clamp((lt - 5.0) / 1.0, 0, 1));
  const p2 = Easing.easeOutBack(clamp((lt - 5.8) / 1.0, 0, 1));
  const p3 = Easing.easeOutCubic(clamp((lt - 6.8) / 0.9, 0, 1));
  return (
    <div style={{ position: 'absolute', inset: 0, background: `linear-gradient(180deg, #061528 0%, #0a1c33 55%, #061528 100%)` }}>
      <div style={{ position: 'absolute', inset: 0, background: `radial-gradient(ellipse at 50% 30%, rgba(255,90,31,0.10) 0%, transparent 55%)` }} />
      <AmbientParticles start={13} dur={16} count={34} color="255,204,0" />
      {/* RECAP — OUR PREDICTION from Ep15 (never stated as a real result) */}
      {recapP > 0.01 && (
        <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 22, opacity: recapP }}>
          <Kicker size={26} color={MV.muted}>Last time · our prediction</Kicker>
          <BigTitle size={62} color={MV.text} glow={MV.gold} style={{ maxWidth: 1500 }}>IVORY COAST 1 — 1 ECUADOR</BigTitle>
          <div style={{ fontFamily: '"Inter",sans-serif', fontWeight: 600, fontSize: 30, color: MV.muted, letterSpacing: '0.06em' }}>African power against the mountain</div>
        </div>
      )}
      {/* TITLE CARD */}
      {lt >= 4.6 && (
        <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 40 }}>
          <div style={{ opacity: p1, transform: `translateY(${(1 - p1) * -30}px)` }}>
            <Kicker color={MV.swe}>WorldCup26 Legends · Episode 16</Kicker>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 70, opacity: clamp(p2, 0, 1), transform: `scale(${p2})` }}>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 20 }}>
              <Waving><FlagSWE w={240} /></Waving>
              <BigTitle size={62} glow={MV.swe}>SWEDEN</BigTitle>
            </div>
            <BigTitle size={120} color={MV.gold}>VS</BigTitle>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 20 }}>
              <Waving speed={1.9}><FlagTUN w={230} /></Waving>
              <BigTitle size={62} glow={MV.tun}>TUNISIA</BigTitle>
            </div>
          </div>
          <div style={{ opacity: p3, transform: `translateY(${(1 - p3) * 26}px)`, fontFamily: '"Inter",sans-serif', fontWeight: 600, fontSize: 32, color: MV.muted, letterSpacing: '0.08em' }}>
            GROUP F · THE NORTHERN WINTER × THE DESERT SUN
          </div>
        </div>
      )}
      <Letterbox />
    </div>
  );
}

// ── 3. Tease (29–49): welcome back + "a striker the PL gave up on" ───────────
function SceneTease() {
  const { localTime: lt } = useSprite();
  const a = Easing.easeOutCubic(clamp((lt - 0.4) / 1.0, 0, 1));
  // second beat (~40 global → lt ~11): "a striker the Premier League gave up on comes back to haunt it"
  const b = Easing.easeOutBack(clamp((lt - 10.5) / 1.0, 0, 1)) * Math.max(0, Math.min(1, (19.5 - lt) / 1.0));
  return (
    <div style={{ position: 'absolute', inset: 0, background: '#04060c' }}>
      <PitchBackdrop tint="#0a2335" dim={0.25} />
      <Vignette strength={0.5} />
      <AmbientParticles start={29} dur={20} count={26} color="154,216,255" />
      {/* frost vs fire headline */}
      <div style={{ position: 'absolute', top: 200, left: 0, right: 0, textAlign: 'center', zIndex: 25, opacity: a, transform: `translateY(${(1 - a) * 24}px)` }}>
        <Kicker size={28} color={MV.frost}>The deep northern winter · the desert sun</Kicker>
        <div style={{ fontFamily: '"Inter",sans-serif', fontWeight: 900, fontSize: 80, color: MV.text, letterSpacing: '0.03em', marginTop: 18, textShadow: '0 4px 22px rgba(0,0,0,0.85)' }}>
          FROST&nbsp;&nbsp;MEETS&nbsp;&nbsp;FIRE
        </div>
      </div>
      {/* the tease */}
      {b > 0.01 && (
        <div style={{ position: 'absolute', left: 0, right: 0, bottom: 210, display: 'flex', justifyContent: 'center', zIndex: 26, opacity: clamp(b, 0, 1), transform: `scale(${0.9 + 0.1 * clamp(b,0,1)})` }}>
          <div style={{ background: MV.panel, border: `1px solid ${MV.line}`, borderRadius: 999, padding: '20px 52px', display: 'flex', alignItems: 'center', gap: 18 }}>
            <span style={{ fontSize: 30 }}>⚽</span>
            <span style={{ fontFamily: '"Inter",sans-serif', fontWeight: 800, fontSize: 34, color: MV.gold, letterSpacing: '0.04em' }}>Late on — a striker the Premier League gave up on comes back to haunt it</span>
          </div>
        </div>
      )}
      <Letterbox />
    </div>
  );
}

// ── 4. History (49–106): the real 1978 Rosario story + 2022 France ───────────
function HistoryPlate({ start, end, year, venue, score, note, accent = MV.gold, stamp }) {
  const t = useTime();
  if (t < start || t > end) return null;
  const p = Easing.easeOutBack(clamp((t - start) / 0.8, 0, 1));
  const fade = t > end - 0.6 ? (end - t) / 0.6 : 1;
  const stampP = stamp ? Easing.easeOutBack(clamp((t - start - 1.6) / 0.5, 0, 1)) : 0;
  return (
    <div style={{
      position: 'absolute', inset: 0, zIndex: 25, display: 'flex', alignItems: 'center', justifyContent: 'center',
      opacity: clamp(p, 0, 1) * clamp(fade, 0, 1),
    }}>
      <div style={{
        transform: `scale(${0.86 + 0.14 * p})`,
        background: MV.panel, border: `1px solid ${MV.line}`, borderRadius: 24,
        padding: '52px 100px', textAlign: 'center', position: 'relative',
        boxShadow: '0 30px 110px rgba(0,0,0,0.65)', backdropFilter: 'blur(4px)', maxWidth: 1160,
      }}>
        <div style={{ fontFamily: '"Inter",sans-serif', fontWeight: 800, fontSize: 30, color: MV.muted, letterSpacing: '0.34em' }}>{venue}</div>
        <div style={{ fontFamily: '"Inter",sans-serif', fontWeight: 900, fontSize: 116, color: accent, lineHeight: 1.05, margin: '14px 0 6px', textShadow: `0 0 60px ${accent}44` }}>{score}</div>
        <div style={{ fontFamily: '"Inter",sans-serif', fontWeight: 800, fontSize: 44, color: MV.text, letterSpacing: '0.06em' }}>{year}</div>
        {note && <div style={{ fontFamily: '"Inter",sans-serif', fontWeight: 600, fontSize: 27, color: MV.muted, marginTop: 14, maxWidth: 860 }}>{note}</div>}
        {stamp && stampP > 0 && (
          <div style={{
            position: 'absolute', top: -34, right: -60, transform: `rotate(-12deg) scale(${stampP})`,
            border: `5px solid ${MV.tun}`, color: MV.tun, borderRadius: 14, padding: '10px 26px',
            fontFamily: '"Inter",sans-serif', fontWeight: 900, fontSize: 32, letterSpacing: '0.08em',
            background: 'rgba(7,9,15,0.85)',
          }}>{stamp}</div>
        )}
      </div>
    </div>
  );
}

function SceneHistory() {
  const S = 49.0;
  return (
    <div style={{ position: 'absolute', inset: 0, background: '#05060a' }}>
      <KenBurns src="assets/player-talbi.png" start={S} dur={57} from={1.1} to={1.24} panX={-20}
        dim={0.72} style={{ filter: 'brightness(0.28) saturate(0.8) contrast(1.1) grayscale(0.18)' }} />
      <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse at center, transparent 30%, rgba(5,6,10,0.82) 100%)' }} />
      <AmbientParticles start={S} dur={57} count={28} color="255,90,31" maxR={4} />
      {/* chapter header */}
      <div style={{ position: 'absolute', top: 116, left: 0, right: 0, textAlign: 'center', zIndex: 26 }}>
        <Kicker size={28} color={MV.tun}>Chapter One · The True History</Kicker>
        <div style={{ fontFamily: '"Inter",sans-serif', fontWeight: 900, fontSize: 52, color: MV.text, letterSpacing: '0.04em', marginTop: 16, textShadow: '0 4px 22px rgba(0,0,0,0.8)' }}>
          WHAT THIS SHIRT CARRIES
        </div>
      </div>
      {/* flag, always present */}
      <div style={{ position: 'absolute', bottom: 124, left: 0, right: 0, display: 'flex', justifyContent: 'center', zIndex: 26, opacity: 0.95 }}>
        <FlagTUN w={120} />
      </div>
      {/* beats synced to narration (49 history intro, 60 Rosario 3-1, 71 the door, 80 France 2022, 90 the ache, 101 tonight) */}
      <HistoryPlate start={S + 0.5}  end={S + 11.0} year="2 JUNE 1978" venue="ROSARIO · 2,500 MILES FROM HOME" score="WRITTEN OFF" note="A tiny nation, dismissed before kickoff. And this part is true." accent={MV.fire} />
      <HistoryPlate start={S + 11.0} end={S + 22.0} year="TUNISIA 3 — 1 MEXICO" venue="1978 WORLD CUP · GROUP STAGE" score="3 — 1" note="The first African nation EVER to win a match at a World Cup." accent={MV.tun} stamp="1978" />
      <HistoryPlate start={S + 22.0} end={S + 31.0} year="THE DOOR WAS OPEN" venue="AFTER THAT DAY" score="A CONTINENT BELIEVED" note="No African team had done it before. After Rosario, the whole continent believed." accent={MV.gold} />
      <HistoryPlate start={S + 31.0} end={S + 41.0} year="30 NOVEMBER 2022" venue="EDUCATION CITY · QATAR" score="TUNISIA 1 — 0 FRANCE" note="They kept knocking — and beat the world champions, one to nothing." accent={MV.tun} />
      <HistoryPlate start={S + 41.0} end={S + 51.5} year="THE ACHE" venue="ACROSS EVERY TOURNAMENT" score="NEVER PAST THE GROUP" note="The door they opened for everyone… they have never once walked through." accent={MV.text} />
      <HistoryPlate start={S + 51.5} end={S + 57.0} year="TONIGHT · GROUP F" venue="THEY TRY AGAIN" score="TUN × SWE" note="Tonight they try again — against the frost." accent={MV.swe} />
      <Vignette strength={0.5} />
      <Letterbox />
    </div>
  );
}

// ── Squad montage grid (uses the generated still library) ────────────────────
function SquadGrid({ start, end, players, accent }) {
  const t = useTime();
  if (t < start || t > end) return null;
  const fade = t > end - 0.5 ? (end - t) / 0.5 : 1;
  return (
    <div style={{
      position: 'absolute', inset: 0, zIndex: 25, display: 'flex', alignItems: 'center', justifyContent: 'center',
      gap: 34, opacity: clamp(fade, 0, 1), padding: '0 90px',
    }}>
      {players.map((p, i) => {
        const cp = Easing.easeOutBack(clamp((t - start - 0.25 - i * 0.28) / 0.7, 0, 1));
        return (
          <div key={i} style={{
            width: 290, transform: `translateY(${(1 - cp) * 90}px) scale(${0.85 + 0.15 * cp})`, opacity: clamp(cp, 0, 1),
            borderRadius: 22, overflow: 'hidden', background: MV.panel, border: `1px solid ${MV.line}`,
            boxShadow: `0 26px 80px rgba(0,0,0,0.6)`,
          }}>
            <div style={{ height: 322, overflow: 'hidden' }}>
              <img src={p.img} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', transform: `scale(${1.02 + 0.05 * clamp((t - start) / (end - start), 0, 1)})` }} />
            </div>
            <div style={{ padding: '18px 16px 20px', textAlign: 'center', borderTop: `4px solid ${accent}` }}>
              <div style={{ fontFamily: '"Inter",sans-serif', fontWeight: 900, fontSize: 25, color: MV.text }}>{p.name}</div>
              <div style={{ fontFamily: '"Inter",sans-serif', fontWeight: 700, fontSize: 17, color: MV.muted, letterSpacing: '0.16em', marginTop: 5 }}>{p.role}</div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ── 5. Sweden (106–142): the frost — Gyokeres + Isak ─────────────────────────
function SceneSweden() {
  const { localTime: lt } = useSprite();
  const S = 106.0;
  const headerP = Easing.easeOutCubic(clamp(lt / 0.9, 0, 1));
  return (
    <div style={{ position: 'absolute', inset: 0, background: '#0a0f18' }}>
      <PitchBackdrop tint="#0a2540" dim={0.4} />
      <div style={{ position: 'absolute', inset: 0, zIndex: 22, pointerEvents: 'none', background: `linear-gradient(90deg, rgba(0,106,167,0.26) 0%, transparent 30%, transparent 70%, rgba(254,204,0,0.16) 100%)` }} />
      <div style={{ position: 'absolute', top: 108, left: 0, right: 0, display: 'flex', justifyContent: 'center', zIndex: 26, opacity: headerP, transform: `translateY(${(1 - headerP) * -24}px)` }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 26, background: MV.panel, border: `1px solid ${MV.line}`, borderRadius: 999, padding: '16px 44px' }}>
          <FlagSWE w={88} />
          <span style={{ fontFamily: '"Inter",sans-serif', fontWeight: 900, fontSize: 40, color: MV.text, letterSpacing: '0.10em' }}>SWEDEN · THE FROST</span>
        </div>
      </div>
      <SquadGrid start={S + 0.4} end={S + 8.0} accent={MV.swe} players={[
        { img: 'assets/squad/swe-1-Gyokeres.png', name: 'V. GYÖKERES',   role: 'THE FREIGHT TRAIN' },
        { img: 'assets/squad/swe-2-Isak.png',     name: 'ALEX. ISAK',    role: 'THE ELEGANCE' },
        { img: 'assets/squad/swe-3-Elanga.png',   name: 'A. ELANGA',     role: 'THE FLYER' },
        { img: 'assets/squad/swe-4-Bergvall.png', name: 'L. BERGVALL',   role: 'THE YOUNG ENGINE' },
        { img: 'assets/squad/swe-5-Lindelof.png', name: 'V. LINDELÖF',   role: 'THE ANCHOR' },
      ]} />
      {/* line beats: 106 forged in winters, 115 Gyokeres the freight train, 124 came back a beast, 133 Isak */}
      <Sprite start={115.0} end={124.0}>
        <KenBurns src="assets/player-gyokeres.png" start={115} dur={9} from={1.04} to={1.16} panX={20} dim={0.18} style={{ zIndex: 10 }} />
        <LowerThird start={115.4} name="VIKTOR GYÖKERES" role="The Freight Train · Striker" line="A few years ago he couldn't hold a Premier League place — written off, shipped out." accent={MV.swe} />
      </Sprite>
      <Sprite start={124.0} end={133.0}>
        <KenBurns src="assets/player-gyokeres.png" start={124} dur={9} from={1.06} to={1.18} panX={-20} dim={0.18} style={{ zIndex: 10 }} />
        <LowerThird start={124.4} name="CAME BACK A BEAST" role="All muscle · all menace" line="He went away, scored a mountain of goals — the man defenders now have nightmares about." accent={MV.sweBlue} />
      </Sprite>
      <Sprite start={133.0} end={142.0}>
        <KenBurns src="assets/player-isak.png" start={133} dur={9} from={1.04} to={1.14} dim={0.18} style={{ zIndex: 10 }} />
        <LowerThird start={133.3} name="ALEXANDER ISAK" role="The Elegance · Striker" line="Where Gyökeres is power, Isak is grace — so smooth defenders forget to move." accent={MV.swe} />
      </Sprite>
      <Vignette strength={0.42} />
      <Letterbox />
    </div>
  );
}

// ── 6. Tunisia (142–170): the fire — Talbi the wall + Mejbri ─────────────────
function SceneTunisia() {
  const { localTime: lt } = useSprite();
  const S = 142.0;
  const headerP = Easing.easeOutCubic(clamp(lt / 0.9, 0, 1));
  return (
    <div style={{ position: 'absolute', inset: 0, background: '#140a0c' }}>
      <PitchBackdrop tint="#3a1010" dim={0.42} />
      <div style={{ position: 'absolute', inset: 0, zIndex: 22, pointerEvents: 'none', background: `linear-gradient(90deg, rgba(231,0,19,0.26) 0%, transparent 30%, transparent 70%, rgba(255,90,31,0.18) 100%)` }} />
      <div style={{ position: 'absolute', top: 108, left: 0, right: 0, display: 'flex', justifyContent: 'center', zIndex: 26, opacity: headerP, transform: `translateY(${(1 - headerP) * -24}px)` }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 26, background: MV.panel, border: `1px solid ${MV.line}`, borderRadius: 999, padding: '16px 44px' }}>
          <FlagTUN w={80} />
          <span style={{ fontFamily: '"Inter",sans-serif', fontWeight: 900, fontSize: 40, color: MV.text, letterSpacing: '0.10em' }}>TUNISIA · THE FIRE</span>
        </div>
      </div>
      <SquadGrid start={S + 0.4} end={S + 8.0} accent={MV.tun} players={[
        { img: 'assets/squad/tun-2-Talbi.png',   name: 'M. TALBI',      role: 'THE WALL' },
        { img: 'assets/squad/tun-1-Mejbri.png',  name: 'H. MEJBRI',     role: 'THE POINT TO PROVE' },
        { img: 'assets/squad/tun-3-Skhiri.png',  name: 'E. SKHIRI',     role: 'THE MIDFIELD HEART' },
        { img: 'assets/squad/tun-4-Achouri.png', name: 'E. ACHOURI',    role: 'THE SPARK' },
        { img: 'assets/squad/tun-5-Bronn.png',   name: 'D. BRONN',      role: 'THE STOPPER' },
      ]} />
      {/* line beats: 142 a man who studies strikers, 150 Talbi homework, 160 Mejbri proving them wrong */}
      <Sprite start={150.0} end={160.0}>
        <KenBurns src="assets/player-talbi.png" start={150} dur={10} from={1.04} to={1.16} panX={-18} dim={0.2} style={{ zIndex: 10 }} />
        <LowerThird start={150.3} name="MONTASSAR TALBI" role="The Wall · Centre-back" line="Knows Gyökeres's runs, knows Isak's patterns — a defender who does his homework on Europe's best." accent={MV.tun} />
      </Sprite>
      <Sprite start={160.0} end={170.0}>
        <KenBurns src="assets/player-mejbri.png" start={160} dur={10} from={1.05} to={1.18} dim={0.2} style={{ zIndex: 10 }} />
        <LowerThird start={160.3} name="HANNIBAL MEJBRI" role="The Point to Prove · Midfield" line="Once told he wasn't good enough for the Premier League — now plays every minute like he's still proving them wrong." accent={MV.fire} />
      </Sprite>
      <Vignette strength={0.42} />
      <Letterbox />
    </div>
  );
}

// ── 7. The duel (170–189): frost vs fire ─────────────────────────────────────
function SceneDuel() {
  const { localTime: lt } = useSprite();
  const slideP = Easing.easeOutQuart(clamp(lt / 1.1, 0, 1));
  const vsP = Easing.easeOutBack(clamp((lt - 0.9) / 0.8, 0, 1));
  const shake = lt > 0.9 && lt < 1.25 ? Math.sin(lt * 160) * 7 * (1.25 - lt) / 0.35 : 0;
  return (
    <div style={{ position: 'absolute', inset: 0, background: '#05060a', transform: `translate(${shake}px, ${-shake}px)` }}>
      {/* LEFT — Sweden / the frost (Gyokeres) */}
      <div style={{ position: 'absolute', top: 0, bottom: 0, left: 0, width: '50%', overflow: 'hidden', transform: `translateX(${(1 - slideP) * -100}%)` }}>
        <img src="assets/player-gyokeres.png" alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', filter: 'saturate(1.1) brightness(0.92)' }} />
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(90deg, rgba(0,106,167,0.4), transparent 65%)' }} />
        <div style={{ position: 'absolute', bottom: 150, left: 90, fontFamily: '"Inter",sans-serif', fontWeight: 900, fontSize: 64, color: '#fff', textShadow: '0 4px 26px rgba(0,0,0,0.9)' }}>
          THE FROST
          <div style={{ fontSize: 27, fontWeight: 700, color: MV.frost, letterSpacing: '0.2em', marginTop: 8 }}>SWEDEN · THE FREIGHT TRAIN</div>
        </div>
      </div>
      {/* RIGHT — Tunisia / the fire (Mejbri) */}
      <div style={{ position: 'absolute', top: 0, bottom: 0, right: 0, width: '50%', overflow: 'hidden', transform: `translateX(${(1 - slideP) * 100}%)` }}>
        <img src="assets/player-mejbri.png" alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', filter: 'saturate(1.15) brightness(0.92)' }} />
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(270deg, rgba(231,0,19,0.42), transparent 65%)' }} />
        <div style={{ position: 'absolute', bottom: 150, right: 90, textAlign: 'right', fontFamily: '"Inter",sans-serif', fontWeight: 900, fontSize: 64, color: '#fff', textShadow: '0 4px 26px rgba(0,0,0,0.9)' }}>
          THE FIRE
          <div style={{ fontSize: 27, fontWeight: 700, color: MV.fire, letterSpacing: '0.2em', marginTop: 8 }}>TUNISIA · THE WALL THAT DID ITS HOMEWORK</div>
        </div>
      </div>
      <div style={{ position: 'absolute', top: 0, bottom: 0, left: 'calc(50% - 3px)', width: 6, background: `linear-gradient(180deg, transparent, ${MV.gold}, transparent)`, zIndex: 24, opacity: slideP }} />
      <div style={{
        position: 'absolute', top: '50%', left: '50%', zIndex: 26,
        transform: `translate(-50%,-50%) scale(${vsP}) rotate(${(1 - vsP) * 20}deg)`, opacity: clamp(vsP, 0, 1),
        width: 210, height: 210, borderRadius: '50%', background: MV.panel, border: `5px solid ${MV.gold}`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        boxShadow: `0 0 90px ${MV.gold}66`,
      }}>
        <span style={{ fontFamily: '"Inter",sans-serif', fontWeight: 900, fontSize: 92, color: MV.gold }}>VS</span>
      </div>
      <Sprite start={184.0} end={189.0}>
        <div style={{ position: 'absolute', left: 0, right: 0, bottom: 0, top: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 27, background: 'rgba(0,0,0,0.55)' }}>
          <BigTitle size={66} color={MV.text} style={{ maxWidth: 1450 }}>
            Our prediction — Swedish steel, Tunisian heart, and a striker with a grudge against the game that doubted him. Watch.
          </BigTitle>
        </div>
      </Sprite>
      <Letterbox />
    </div>
  );
}

// ── 8. Match drama (189–243): OUR PREDICTION 1-1 ─────────────────────────────
// Isak free kick, Gyokeres pounces on the rebound (1-0, ~200). Tunisia come in
// waves of red. Mejbri drives, the fire answers (1-1, ~220). Full-time = PREDICTION.
function SceneDrama() {
  const { localTime: lt } = useSprite();
  const S = 189.0;
  return (
    <div style={{ position: 'absolute', inset: 0, background: '#000' }}>
      <KenBurns src="assets/player-gyokeres.png" start={S} dur={31} from={1.1} to={1.28} panX={-30} dim={0.18} />
      <Sprite start={211} end={232}>
        <KenBurns src="assets/player-mejbri.png" start={211} dur={21} from={1.08} to={1.24} panX={20} dim={0.16} />
      </Sprite>
      {/* OUR PREDICTION watermark — REAL-RESULTS-ONLY rule */}
      <div style={{ position: 'absolute', top: 116, left: 0, right: 0, textAlign: 'center', zIndex: 25 }}>
        <Kicker size={24} color={MV.gold}>Our Prediction · Our Story</Kicker>
      </div>

      <Sprite start={189.0} end={200.0}>
        <ScoreBug start={S + 0.4} swe={0} tun={0} minute="1st half" />
      </Sprite>
      <GoalFlash at={S + 11.0} color={MV.swe} />
      <Confetti start={S + 11.2} dur={12} colors={[MV.swe, '#fff', MV.sweBlue, MV.gold]} />
      <Sprite start={200.0} end={211}>
        <ScoreBug start={S + 11.0} swe={1} tun={0} minute="GYÖKERES" />
      </Sprite>
      <Sprite start={211} end={220.5}>
        <ScoreBug start={S + 22.0} swe={1} tun={0} minute="2nd half" />
      </Sprite>
      <GoalFlash at={S + 31.5} color={MV.tun} />
      <Confetti start={S + 31.7} dur={11} colors={[MV.tun, '#fff', MV.fire, MV.gold]} />
      <Sprite start={220.5} end={232}>
        <ScoreBug start={S + 31.5} swe={1} tun={1} minute="MEJBRI · THE FIRE" />
      </Sprite>

      <Sprite start={232} end={243.0}>
        <FullTimeCard start={S + 43.5} />
      </Sprite>
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
            <FlagSWE w={156} />
            <span style={{ fontFamily: '"Inter",sans-serif', fontWeight: 800, fontSize: 34, color: MV.text }}>SWEDEN</span>
          </div>
          <BigTitle size={170} color={MV.gold}>1 — 1</BigTitle>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16 }}>
            <FlagTUN w={150} />
            <span style={{ fontFamily: '"Inter",sans-serif', fontWeight: 800, fontSize: 34, color: MV.text }}>TUNISIA</span>
          </div>
        </div>
        <div style={{ fontFamily: '"Inter",sans-serif', fontWeight: 600, fontSize: 30, color: MV.muted, marginTop: 34, maxWidth: 1000 }}>
          The frost would not melt. The fire would not die. Two warriors, flat on the grass, both having given everything.
        </div>
      </div>
    </div>
  );
}

// ── 9. Verdict (243–252): do you agree? FROST / FIRE ─────────────────────────
function SceneVerdict() {
  const { localTime: lt } = useSprite();
  const S = 243.0;
  const headP = Easing.easeOutCubic(clamp(lt / 0.8, 0, 1));
  const a = Easing.easeOutBack(clamp((lt - 1.2) / 0.7, 0, 1));
  const b = Easing.easeOutBack(clamp((lt - 1.6) / 0.7, 0, 1));
  return (
    <div style={{ position: 'absolute', inset: 0, background: '#0a0f1c' }}>
      <PitchBackdrop tint="#10202e" dim={0.45} />
      <div style={{ position: 'absolute', top: 150, left: 0, right: 0, textAlign: 'center', zIndex: 25, opacity: headP }}>
        <Kicker size={30} color={MV.text}>A night nobody loses — and nobody forgets</Kicker>
        <div style={{ fontFamily: '"Inter",sans-serif', fontWeight: 900, fontSize: 72, color: MV.gold, marginTop: 18, letterSpacing: '0.04em' }}>DO YOU AGREE?</div>
      </div>
      <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 70, zIndex: 26, marginTop: 60 }}>
        <div style={{ opacity: clamp(a, 0, 1), transform: `translateY(${(1 - a) * 50}px) scale(${0.85 + 0.15 * a})`, background: 'rgba(0,106,167,0.16)', border: `2px solid ${MV.sweBlue}`, borderRadius: 22, padding: '34px 60px', textAlign: 'center', minWidth: 420 }}>
          <div style={{ fontFamily: '"Inter",sans-serif', fontWeight: 900, fontSize: 56, color: MV.frost, letterSpacing: '0.06em' }}>“FROST”</div>
          <div style={{ fontFamily: '"Inter",sans-serif', fontWeight: 600, fontSize: 26, color: MV.muted, marginTop: 12 }}>if Sweden's strikers are too much</div>
        </div>
        <div style={{ opacity: clamp(b, 0, 1), transform: `translateY(${(1 - b) * 50}px) scale(${0.85 + 0.15 * b})`, background: 'rgba(231,0,19,0.16)', border: `2px solid ${MV.tun}`, borderRadius: 22, padding: '34px 60px', textAlign: 'center', minWidth: 420 }}>
          <div style={{ fontFamily: '"Inter",sans-serif', fontWeight: 900, fontSize: 56, color: MV.fire, letterSpacing: '0.06em' }}>“FIRE”</div>
          <div style={{ fontFamily: '"Inter",sans-serif', fontWeight: 600, fontSize: 26, color: MV.muted, marginTop: 12 }}>if Tunisia finally walk through the door</div>
        </div>
      </div>
      <Vignette strength={0.5} />
      <Letterbox />
    </div>
  );
}

// ── 10. Mystery Supporter (252–272): Legend 016 — the Firekeeper ─────────────
function SceneMystery() {
  const { localTime: lt } = useSprite();
  const S = 252.0;
  const inP = Easing.easeOutCubic(clamp((lt - 0.6) / 1.4, 0, 1));
  const plateP = Easing.easeOutBack(clamp((lt - 4.2) / 0.9, 0, 1));
  return (
    <div style={{ position: 'absolute', inset: 0, background: '#0a0302' }}>
      <KenBurns src="assets/player-talbi.png" start={S} dur={20} from={1.16} to={1.3} panY={-20}
        dim={0.34} style={{ filter: 'brightness(0.42) contrast(1.12) saturate(1.05) grayscale(0.2)' }} />
      {/* ember light — the keeper's flame */}
      <div style={{
        position: 'absolute', inset: 0, zIndex: 21, pointerEvents: 'none', opacity: 0.55,
        background: `radial-gradient(ellipse at ${22 + Math.sin(lt * 0.3) * 12}% 74%, rgba(255,90,31,0.22) 0%, transparent 45%),` +
                    `radial-gradient(ellipse at ${76 - Math.sin(lt * 0.22) * 12}% 32%, rgba(231,0,19,0.14) 0%, transparent 50%)`,
      }} />
      <AmbientParticles start={S} dur={20} count={50} color="255,160,90" maxR={3.5} zIndex={22} />
      <div style={{ position: 'absolute', top: 118, left: 0, right: 0, textAlign: 'center', zIndex: 25, opacity: inP }}>
        <Kicker size={26} color="#ffbf8a">The Mystery Supporter · Legend No. 016</Kicker>
      </div>
      {plateP > 0 && (
        <div style={{
          position: 'absolute', left: 110, bottom: 150, zIndex: 25,
          opacity: clamp(plateP, 0, 1), transform: `translateY(${(1 - plateP) * 50}px)`,
        }}>
          <div style={{ background: 'rgba(14,8,6,0.9)', border: '1px solid rgba(255,140,80,0.45)', borderRadius: 18, padding: '28px 44px', backdropFilter: 'blur(6px)' }}>
            <div style={{ fontFamily: '"Inter",sans-serif', fontWeight: 900, fontSize: 54, color: '#ffeede', letterSpacing: '0.02em' }}>THE FIREKEEPER</div>
            <div style={{ fontFamily: '"Inter",sans-serif', fontWeight: 700, fontSize: 24, color: '#ffbf8a', letterSpacing: '0.14em', marginTop: 8, maxWidth: 800 }}>HE WAS IN ROSARIO IN '78 — HE CARRIES AN EMBER FROM THE NIGHT A CONTINENT LEARNED IT BELONGED</div>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 12, marginTop: 18, background: 'rgba(255,90,31,0.14)', border: '1px solid rgba(255,90,31,0.5)', borderRadius: 999, padding: '10px 24px' }}>
              <span style={{ fontSize: 26 }}>✦</span>
              <span style={{ fontFamily: '"Inter",sans-serif', fontWeight: 800, fontSize: 24, color: MV.fire, letterSpacing: '0.08em' }}>COLLECT HIM INSIDE THE GAME · worldcup26.world</span>
            </div>
          </div>
        </div>
      )}
      <Vignette strength={0.55} />
      <Letterbox />
    </div>
  );
}

// ── 11. App promo (272–290): worldcup26.world ────────────────────────────────
function SceneApp() {
  const { localTime: lt } = useSprite();
  const S = 272.0;
  const inP = Easing.easeOutCubic(clamp(lt / 1.0, 0, 1));
  const cards = [
    { name: 'TUNISIA', coef: 'x3.00', pts: 'UNDERDOG', flag: <FlagTUN w={86} />, hot: true },
    { name: 'SWEDEN',  coef: 'x2.10', pts: '+2.10',    flag: <FlagSWE w={92} />, hot: true },
    { name: 'BRAZIL',  coef: 'x1.20', pts: '+0.00',    flag: <div style={{ width: 86, height: 57, borderRadius: 6, background: 'linear-gradient(135deg,#159b46 55%,#ffd24a 55%)' }} /> },
  ];
  return (
    <div style={{ position: 'absolute', inset: 0, background: `linear-gradient(160deg, #0d2436 0%, #07090f 70%)` }}>
      <div style={{ position: 'absolute', inset: 0, background: `radial-gradient(ellipse at 50% 20%, rgba(0,106,167,0.32) 0%, transparent 60%)` }} />
      <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 40, opacity: inP }}>
        <Kicker color="#9ad8ff" size={30}>The Prediction Game</Kicker>
        <BigTitle size={100} color="#fff" glow={MV.sweBlue}>worldcup26.world</BigTitle>
        <div style={{ fontFamily: '"Inter",sans-serif', fontWeight: 700, fontSize: 36, color: '#cfe4f0', letterSpacing: '0.04em' }}>
          Pick 3 of the 48 nations. Every goal they score… scores for YOU.
        </div>
        <div style={{ display: 'flex', gap: 36, marginTop: 8 }}>
          {cards.map((c, i) => {
            const cp = Easing.easeOutBack(clamp((lt - 1.2 - i * 0.35) / 0.7, 0, 1));
            return (
              <div key={i} style={{
                transform: `translateY(${(1 - cp) * 60}px) scale(${0.8 + 0.2 * cp})`, opacity: clamp(cp, 0, 1),
                background: 'rgba(255,255,255,0.07)', border: `1px solid ${c.hot ? 'rgba(255,210,74,0.5)' : 'rgba(255,255,255,0.18)'}`, borderRadius: 22,
                padding: '34px 46px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16, minWidth: 290,
                boxShadow: '0 24px 70px rgba(0,0,0,0.45)',
              }}>
                {c.flag}
                <div style={{ fontFamily: '"Inter",sans-serif', fontWeight: 900, fontSize: 30, color: '#fff' }}>{c.name}</div>
                <div style={{ fontFamily: '"Inter",sans-serif', fontWeight: 800, fontSize: 26, color: MV.gold }}>{c.coef}</div>
                <div style={{ fontFamily: '"Inter",sans-serif', fontWeight: 800, fontSize: 26, color: c.hot ? '#6ee7a8' : '#9fb2a9' }}>{c.pts}</div>
              </div>
            );
          })}
        </div>
        <div style={{ fontFamily: '"Inter",sans-serif', fontWeight: 800, fontSize: 32, color: MV.gold, letterSpacing: '0.05em', marginTop: 6 }}>
          FREE TO PLAY · LIVE PRIZE POOL · UNDERDOGS PAY TRIPLE — LIKE TUNISIA TONIGHT
        </div>
      </div>
      <Letterbox />
    </div>
  );
}

// ── 12. CTA outro (290–300) ──────────────────────────────────────────────────
function SceneCTA() {
  const { localTime: lt } = useSprite();
  const S = 290;
  const inP = Easing.easeOutCubic(clamp(lt / 0.8, 0, 1));
  return (
    <div style={{ position: 'absolute', inset: 0, background: '#07090f' }}>
      <PitchBackdrop tint="#0a2540" dim={0.55} />
      <AmbientParticles start={S} dur={10} count={28} color="255,204,0" />
      <div style={{ position: 'absolute', inset: 0, zIndex: 23, background: 'radial-gradient(ellipse at 50% 35%, transparent 0%, rgba(7,9,15,0.88) 75%)' }} />
      <div style={{ position: 'absolute', top: 200, left: 0, right: 0, textAlign: 'center', zIndex: 25, opacity: inP }}>
        <Kicker size={30} color={MV.swe}>The legends are only beginning</Kicker>
        <div style={{ marginTop: 24 }}><TitleReveal text="JOIN THE LEGENDS" start={S + 0.5} size={86} color={MV.text} /></div>
      </div>
      <div style={{ position: 'absolute', inset: 0, zIndex: 26 }}>
        <CtaButton start={S} delay={1.2} label="SUBSCRIBE" icon="🔔" accent="#e70013" x={500} />
        <CtaButton start={S} delay={1.6} label="LIKE" icon="👍" accent="#006aa7" x={960} />
        <CtaButton start={S} delay={2.0} label="SHARE" icon="📣" accent="#ff5a1f" x={1400} />
      </div>
      <Sprite start={294.6} end={300}>
        <NextMatchTease start={S + 4.6} />
      </Sprite>
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
        <span style={{ fontFamily: '"Inter",sans-serif', fontWeight: 700, fontSize: 26, color: MV.muted, letterSpacing: '0.14em' }}>WORLDCUP26 LEGENDS</span>
        <span style={{ fontFamily: '"Inter",sans-serif', fontWeight: 900, fontSize: 30, color: MV.gold }}>🔥 THE FIRE BURNS ON · worldcup26.world</span>
      </div>
    </div>
  );
}
