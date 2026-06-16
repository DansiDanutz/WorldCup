// match-scenes.jsx — the twelve scenes of the Match 24 video (300s timeline).
// Scene windows must match the SCENES table in match.html and narration.json.
// CLIP-BASED: real fal video animations (VideoSprite). SOCCER ONLY.
// a pitch with goals, never gridiron. REAL-RESULTS-ONLY: the 3-1 is OUR PREDICTION.
// NOTE: nested <Sprite> windows are GLOBAL seconds (Sprite reads the timeline clock).
// HISTORY handled with NUANCE/RESPECT: the 1974 Leopards / Mwepu Ilunga story is a
// misunderstood act of courage under a dictatorship — never mockery.
// The .civ colour slot = Portugal (dark red); .ecu = DR Congo (sky blue).

// ── 1. Cold open (0–16): the 1974 Ilunga free-kick — "they laughed. they were wrong." ─
function SceneColdOpen() {
  const { localTime: lt } = useSprite();
  const beat = Math.pow(Math.max(0, Math.sin(lt * Math.PI * 1.1)), 8);
  const line1P = Easing.easeOutCubic(clamp((lt - 1.2) / 1.4, 0, 1)) * (lt > 10.5 ? Math.max(0, (12.0 - lt) / 1.5) : 1);
  const titleP = Easing.easeOutCubic(clamp((lt - 12.3) / 1.4, 0, 1));
  return (
    <div style={{ position: 'absolute', inset: 0, background: '#000' }}>
      {/* a Leopards defender — the face of that misunderstood night (dark, archival) */}
      <VideoSprite src="assets/mbemba.mp4" start={0} dur={16} from={1.18} to={1.32} panY={-30}
        dim={0.5} style={{ filter: 'brightness(0.4) contrast(1.2) saturate(0.9) grayscale(0.55)' }} />
      {/* ember base in DR Congo sky-blue so the screen never reads as dead air */}
      <div style={{ position: 'absolute', inset: 0, background: `radial-gradient(ellipse at 50% 78%, rgba(0,127,255,0.16) 0%, transparent 55%)` }} />
      {/* heartbeat glow */}
      <div style={{ position: 'absolute', inset: 0, background: `radial-gradient(ellipse at center, rgba(0,127,255,${(0.45 * beat).toFixed(3)}) 0%, transparent 62%)` }} />
      {line1P > 0.01 && (
        <div style={{
          position: 'absolute', left: 160, right: 160, bottom: 200, textAlign: 'center', zIndex: 22,
          opacity: line1P,
          fontFamily: '"Inter",sans-serif', fontWeight: 800, fontSize: 46, color: '#d8e8ff',
          letterSpacing: '0.04em', lineHeight: 1.25, textShadow: '0 4px 22px rgba(0,0,0,0.9)',
        }}>He ran out of the wall and booted the free kick away — and the world laughed.</div>
      )}
      <Vignette strength={0.85} />
      {lt > 12.3 && (
        <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 30, opacity: titleP, zIndex: 22 }}>
          <Kicker size={32} color="#d8e8ff">A true story</Kicker>
          <TitleReveal text="THEY WERE WRONG" start={12.4} size={120} color={MV.ecu} />
        </div>
      )}
      <Letterbox />
    </div>
  );
}

// ── 2. Recap + title card (16–28) ────────────────────────────────────────────
function SceneTitle() {
  const { localTime: lt } = useSprite();
  // first ~10s carries the Ep23 recap line, then the Ep24 title settles
  const recapP = Easing.easeOutCubic(clamp(lt / 0.9, 0, 1)) * Math.max(0, Math.min(1, (10.5 - lt) / 1.0));
  const p1 = Easing.easeOutCubic(clamp((lt - 10.0) / 1.0, 0, 1));
  const p2 = Easing.easeOutBack(clamp((lt - 10.6) / 1.0, 0, 1));
  const p3 = Easing.easeOutCubic(clamp((lt - 11.4) / 0.9, 0, 1));
  return (
    <div style={{ position: 'absolute', inset: 0, background: `linear-gradient(180deg, #0a0f1c 0%, #11182b 55%, #0a0f1c 100%)` }}>
      <div style={{ position: 'absolute', inset: 0, background: `radial-gradient(ellipse at 50% 30%, rgba(170,21,27,0.12) 0%, transparent 55%)` }} />
      <AmbientParticles start={16} dur={12} count={34} color="0,127,255" />
      {/* RECAP — OUR PREDICTION from Ep23 (never stated as a real result) */}
      {recapP > 0.01 && (
        <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 22, opacity: recapP }}>
          <Kicker size={26} color={MV.muted}>Last time · our prediction</Kicker>
          <BigTitle size={62} color={MV.text} glow={MV.gold} style={{ maxWidth: 1500 }}>AUSTRIA 2 — 1 JORDAN</BigTitle>
          <div style={{ fontFamily: '"Inter",sans-serif', fontWeight: 600, fontSize: 30, color: MV.muted, letterSpacing: '0.06em' }}>We predicted Austria would edge it</div>
        </div>
      )}
      {/* TITLE CARD */}
      {lt >= 9.5 && (
        <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 40 }}>
          <div style={{ opacity: p1, transform: `translateY(${(1 - p1) * -30}px)` }}>
            <Kicker color={MV.civ}>WorldCup26 Legends · Episode 24</Kicker>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 70, opacity: clamp(p2, 0, 1), transform: `scale(${p2})` }}>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 20 }}>
              <Waving><FlagCIV w={230} /></Waving>
              <BigTitle size={62} glow={MV.civ}>PORTUGAL</BigTitle>
            </div>
            <BigTitle size={120} color={MV.gold}>VS</BigTitle>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 20 }}>
              <Waving speed={1.9}><FlagECU w={230} /></Waving>
              <BigTitle size={62} glow={MV.ecu}>DR CONGO</BigTitle>
            </div>
          </div>
          <div style={{ opacity: p3, transform: `translateY(${(1 - p3) * 26}px)`, fontFamily: '"Inter",sans-serif', fontWeight: 600, fontSize: 32, color: MV.muted, letterSpacing: '0.08em' }}>
            GROUP K · THE GOLDEN CHASE AND THE SPIRIT OF THE LEOPARDS
          </div>
        </div>
      )}
      <Letterbox />
    </div>
  );
}

// ── 3. Tease (28–46.5): the golden chase + "at the death, the oldest man settles it" ─
function SceneTease() {
  const { localTime: lt } = useSprite();
  const a = Easing.easeOutCubic(clamp((lt - 0.4) / 1.0, 0, 1));
  // second beat (~37.5 global → lt ~9.5): "at the death, the oldest man on the pitch settles it"
  const b = Easing.easeOutBack(clamp((lt - 8.5) / 1.0, 0, 1)) * Math.max(0, Math.min(1, (18.0 - lt) / 1.0));
  return (
    <div style={{ position: 'absolute', inset: 0, background: '#05060a' }}>
      <PitchBackdrop tint="#1a0a10" dim={0.25} />
      <Vignette strength={0.5} />
      <AmbientParticles start={28} dur={18.5} count={26} color="247,214,24" />
      {/* the chase headline */}
      <div style={{ position: 'absolute', top: 200, left: 0, right: 0, textAlign: 'center', zIndex: 25, opacity: a, transform: `translateY(${(1 - a) * 24}px)` }}>
        <Kicker size={28} color={MV.civ}>A legend's last chance · a continent's first door</Kicker>
        <div style={{ fontFamily: '"Inter",sans-serif', fontWeight: 900, fontSize: 76, color: MV.text, letterSpacing: '0.03em', marginTop: 18, textShadow: '0 4px 22px rgba(0,0,0,0.85)' }}>
          THE GOLDEN CHASE
        </div>
      </div>
      {/* the tease */}
      {b > 0.01 && (
        <div style={{ position: 'absolute', left: 0, right: 0, bottom: 210, display: 'flex', justifyContent: 'center', zIndex: 26, opacity: clamp(b, 0, 1), transform: `scale(${0.9 + 0.1 * clamp(b,0,1)})` }}>
          <div style={{ background: MV.panel, border: `1px solid ${MV.line}`, borderRadius: 999, padding: '20px 52px', display: 'flex', alignItems: 'center', gap: 18 }}>
            <span style={{ fontSize: 30 }}>⚽</span>
            <span style={{ fontFamily: '"Inter",sans-serif', fontWeight: 800, fontSize: 34, color: MV.gold, letterSpacing: '0.04em' }}>At the death — the oldest man on the pitch settles it</span>
          </div>
        </div>
      )}
      <Letterbox />
    </div>
  );
}

// ── 4. History (46.5–98): the real Drogba / Bouaké peace story ───────────────
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
            border: `5px solid ${MV.civGreen}`, color: MV.civGreen, borderRadius: 14, padding: '10px 26px',
            fontFamily: '"Inter",sans-serif', fontWeight: 900, fontSize: 32, letterSpacing: '0.08em',
            background: 'rgba(7,9,15,0.85)',
          }}>{stamp}</div>
        )}
      </div>
    </div>
  );
}

function SceneHistory() {
  const S = 46.5;
  return (
    <div style={{ position: 'absolute', inset: 0, background: '#05060a' }}>
      <VideoSprite src="assets/mbemba.mp4" start={S} dur={51.5} from={1.1} to={1.24} panX={-20}
        dim={0.72} style={{ filter: 'brightness(0.24) saturate(0.6) contrast(1.12) grayscale(0.4)' }} />
      <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse at center, transparent 30%, rgba(5,6,10,0.82) 100%)' }} />
      <AmbientParticles start={S} dur={51.5} count={28} color="0,127,255" maxR={4} />
      {/* chapter header */}
      <div style={{ position: 'absolute', top: 116, left: 0, right: 0, textAlign: 'center', zIndex: 26 }}>
        <Kicker size={28} color={MV.ecu}>Chapter One · The True History</Kicker>
        <div style={{ fontFamily: '"Inter",sans-serif', fontWeight: 900, fontSize: 52, color: MV.text, letterSpacing: '0.04em', marginTop: 16, textShadow: '0 4px 22px rgba(0,0,0,0.8)' }}>
          THE SPIRIT OF THE LEOPARDS
        </div>
      </div>
      {/* flag, always present */}
      <div style={{ position: 'absolute', bottom: 124, left: 0, right: 0, display: 'flex', justifyContent: 'center', zIndex: 26, opacity: 0.95 }}>
        <FlagECU w={120} />
      </div>
      {/* beats synced to narration (46.5, 58, 70, 82, 92, 98) — handled with respect */}
      <HistoryPlate start={S + 0.5}  end={S + 11.0} year="WEST GERMANY · 1974" venue="A NATION THEN CALLED ZAIRE" score="THE LEOPARDS" note="The first Black African team ever to reach a World Cup finals — and reigning African champions." accent={MV.ecu} />
      <HistoryPlate start={S + 11.0} end={S + 23.0} year="KINGS OF A CONTINENT" venue="AFRICA CUP OF NATIONS" score="1968 · 1974" note="Champions of Africa — first as Congo-Kinshasa, then as Zaire. Two crowns. A team with real pedigree." accent={MV.ecuYellow} />
      <HistoryPlate start={S + 23.0} end={S + 35.0} year="THE TOURNAMENT TURNED CRUEL" venue="ZAIRE 0 — YUGOSLAVIA 9" score="0 — 9" note="Overwhelmed, humiliated. And back home a dictator, Mobutu, was watching, and seething." accent={MV.ecuRed} />
      <HistoryPlate start={S + 35.0} end={S + 45.5} year="THE WALL · v BRAZIL, ~78'" venue="MWEPU ILUNGA · MISUNDERSTOOD" score="NOT IGNORANCE" note="Threatened by Mobutu, bonuses withheld, he booted the free kick away on purpose — a frightened man's protest. Courage, not a joke." accent={MV.text} stamp="THE TRUTH" />
      <HistoryPlate start={S + 45.5} end={S + 51.5} year="TONIGHT · GROUP K" venue="A DOOR, KICKED OPEN" score="POR × COD" note="That is the shirt DR Congo wear — a door opened for a whole continent. Tonight they face Portugal." accent={MV.civ} />
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

// ── 5. Portugal (98–134): A Seleção, the golden chase ─────────────────────────
function SceneIvory() {
  const { localTime: lt } = useSprite();
  const S = 98.0;
  const headerP = Easing.easeOutCubic(clamp(lt / 0.9, 0, 1));
  return (
    <div style={{ position: 'absolute', inset: 0, background: '#0a0c14' }}>
      <PitchBackdrop tint="#1a0a10" dim={0.4} />
      <div style={{ position: 'absolute', inset: 0, zIndex: 22, pointerEvents: 'none', background: `linear-gradient(90deg, rgba(170,21,27,0.24) 0%, transparent 30%, transparent 70%, rgba(31,138,76,0.16) 100%)` }} />
      <div style={{ position: 'absolute', top: 108, left: 0, right: 0, display: 'flex', justifyContent: 'center', zIndex: 26, opacity: headerP, transform: `translateY(${(1 - headerP) * -24}px)` }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 26, background: MV.panel, border: `1px solid ${MV.line}`, borderRadius: 999, padding: '16px 44px' }}>
          <FlagCIV w={74} />
          <span style={{ fontFamily: '"Inter",sans-serif', fontWeight: 900, fontSize: 40, color: MV.text, letterSpacing: '0.10em' }}>A SELEÇÃO · EUROPEAN CHAMPIONS 2016</span>
        </div>
      </div>
      <SquadGrid start={S + 0.4} end={S + 9.0} accent={MV.civ} players={[
        { img: 'assets/squad/por-1-Ronaldo.png',  name: 'C. RONALDO',     role: 'THE LEGEND' },
        { img: 'assets/squad/por-2-Bruno.png',    name: 'B. FERNANDES',   role: 'THE CREATOR' },
        { img: 'assets/squad/por-3-Bernardo.png', name: 'BERNARDO SILVA', role: 'THE MAGICIAN' },
        { img: 'assets/squad/por-4-Leao.png',     name: 'RAFAEL LEÃO',    role: 'THE FLYER' },
        { img: 'assets/squad/por-5-Dias.png',     name: 'RÚBEN DIAS',     role: 'THE WALL' },
      ]} />
      {/* line beats: 108 European champions, 116 Bruno/Bernardo/Leão/Dias, 127 Ronaldo */}
      <Sprite start={108.0} end={116.0}>
        <VideoSprite src="assets/stadium.mp4" start={108} dur={8} from={1.04} to={1.14} dim={0.18} style={{ zIndex: 10 }} />
        <LowerThird start={108.4} name="EUROPEAN CHAMPIONS" role="Euro 2016 · still chasing" line="Kings of Europe a decade ago — but a World Cup has always slipped through their fingers." accent={MV.civ} />
      </Sprite>
      <Sprite start={116.0} end={127.0}>
        <VideoSprite src="assets/bruno.mp4" start={116} dur={11} from={1.04} to={1.16} panX={20} dim={0.18} style={{ zIndex: 10 }} />
        <LowerThird start={116.4} name="BRUNO · BERNARDO · LEÃO · DIAS" role="The Golden Generation" line="Bruno unlocks any door, Bernardo brings the silk, Leão the pace — and Dias, a wall in dark red." accent={MV.civ} />
      </Sprite>
      <Sprite start={127.0} end={134.0}>
        <VideoSprite src="assets/ronaldo.mp4" start={127} dur={7} from={1.04} to={1.14} dim={0.18} style={{ zIndex: 10 }} />
        <LowerThird start={127.3} name="CRISTIANO RONALDO" role="41 · Sixth & final World Cup" line="One last time. The one trophy the greatest goalscorer alive has never lifted." accent={MV.civGreen} />
      </Sprite>
      <Vignette strength={0.42} />
      <Letterbox />
    </div>
  );
}

// ── 6. DR Congo (134–169.5): the Leopards ─────────────────────────────────────
function SceneEcuador() {
  const { localTime: lt } = useSprite();
  const S = 134.0;
  const headerP = Easing.easeOutCubic(clamp(lt / 0.9, 0, 1));
  return (
    <div style={{ position: 'absolute', inset: 0, background: '#0a0c14' }}>
      <PitchBackdrop tint="#06223f" dim={0.4} />
      <div style={{ position: 'absolute', inset: 0, zIndex: 22, pointerEvents: 'none', background: `linear-gradient(90deg, rgba(0,127,255,0.24) 0%, transparent 30%, transparent 70%, rgba(247,214,24,0.14) 100%)` }} />
      <div style={{ position: 'absolute', top: 108, left: 0, right: 0, display: 'flex', justifyContent: 'center', zIndex: 26, opacity: headerP, transform: `translateY(${(1 - headerP) * -24}px)` }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 26, background: MV.panel, border: `1px solid ${MV.line}`, borderRadius: 999, padding: '16px 44px' }}>
          <FlagECU w={74} />
          <span style={{ fontFamily: '"Inter",sans-serif', fontWeight: 900, fontSize: 40, color: MV.text, letterSpacing: '0.10em' }}>LES LÉOPARDS · NOT HERE TO MAKE UP NUMBERS</span>
        </div>
      </div>
      <SquadGrid start={S + 0.4} end={S + 10.0} accent={MV.ecu} players={[
        { img: 'assets/squad/cod-1-Wissa.png',    name: 'YOANE WISSA',    role: 'THE FINISHER' },
        { img: 'assets/squad/cod-2-Bakambu.png',  name: 'CÉDRIC BAKAMBU', role: 'THE GLOBETROTTER' },
        { img: 'assets/squad/cod-3-Mbemba.png',   name: 'CHANCEL MBEMBA', role: 'CAPTAIN · WALL' },
        { img: 'assets/squad/cod-4-Silas.png',    name: 'SILAS KATOMPA',  role: 'THE SPARK' },
        { img: 'assets/squad/cod-5-Masuaku.png',  name: 'A. MASUAKU',     role: 'THE STEEL' },
      ]} />
      {/* line beats: 134 header, 140 Wissa/Bakambu, 150 Mbemba, 160 Silas/Masuaku */}
      <Sprite start={140.0} end={150.0}>
        <VideoSprite src="assets/wissa.mp4" start={140} dur={10} from={1.04} to={1.14} dim={0.2} style={{ zIndex: 10 }} />
        <LowerThird start={140.3} name="WISSA · BAKAMBU" role="The Front Line" line="Wissa is sharp and fearless; Bakambu has scored on almost every continent he's played." accent={MV.ecu} />
      </Sprite>
      <Sprite start={150.0} end={160.0}>
        <VideoSprite src="assets/mbemba.mp4" start={150} dur={10} from={1.04} to={1.16} panX={-20} dim={0.2} style={{ zIndex: 10 }} />
        <LowerThird start={150.3} name="CHANCEL MBEMBA" role="The Captain · Defence" line="Marshals the back — a leader who has tamed strikers across Europe." accent={MV.ecu} />
      </Sprite>
      <Sprite start={160.0} end={169.5}>
        <VideoSprite src="assets/stadium.mp4" start={160} dur={9.5} from={1.04} to={1.14} dim={0.2} style={{ zIndex: 10 }} />
        <LowerThird start={160.3} name="SILAS · MASUAKU" role="Speed & Steel" line="Silas carries it forward, Masuaku gives them grit. A young team with an old, proud soul." accent={MV.ecuBlue} />
      </Sprite>
      <Vignette strength={0.42} />
      <Letterbox />
    </div>
  );
}

// ── 7. The duel (169.5–188.5): golden chase vs the Leopards ───────────────────
function SceneDuel() {
  const { localTime: lt } = useSprite();
  const slideP = Easing.easeOutQuart(clamp(lt / 1.1, 0, 1));
  const vsP = Easing.easeOutBack(clamp((lt - 0.9) / 0.8, 0, 1));
  const shake = lt > 0.9 && lt < 1.25 ? Math.sin(lt * 160) * 7 * (1.25 - lt) / 0.35 : 0;
  return (
    <div style={{ position: 'absolute', inset: 0, background: '#05060a', transform: `translate(${shake}px, ${-shake}px)` }}>
      <div style={{ position: 'absolute', top: 0, bottom: 0, left: 0, width: '50%', overflow: 'hidden', transform: `translateX(${(1 - slideP) * -100}%)` }}>
        <VideoSprite src="assets/ronaldo.mp4" start={0} dur={300} fit="cover" />
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(90deg, rgba(170,21,27,0.4), transparent 65%)' }} />
        <div style={{ position: 'absolute', bottom: 150, left: 90, fontFamily: '"Inter",sans-serif', fontWeight: 900, fontSize: 58, color: '#fff', textShadow: '0 4px 26px rgba(0,0,0,0.9)' }}>
          THE CHASE
          <div style={{ fontSize: 27, fontWeight: 700, color: MV.gold, letterSpacing: '0.2em', marginTop: 8 }}>PORTUGAL · THE GOLDEN GENERATION</div>
        </div>
      </div>
      <div style={{ position: 'absolute', top: 0, bottom: 0, right: 0, width: '50%', overflow: 'hidden', transform: `translateX(${(1 - slideP) * 100}%)` }}>
        <VideoSprite src="assets/wissa.mp4" start={0} dur={300} fit="cover" />
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(270deg, rgba(0,127,255,0.42), transparent 65%)' }} />
        <div style={{ position: 'absolute', bottom: 150, right: 90, textAlign: 'right', fontFamily: '"Inter",sans-serif', fontWeight: 900, fontSize: 58, color: '#fff', textShadow: '0 4px 26px rgba(0,0,0,0.9)' }}>
          THE PRIDE
          <div style={{ fontSize: 27, fontWeight: 700, color: MV.gold, letterSpacing: '0.2em', marginTop: 8 }}>DR CONGO · THE LEOPARDS</div>
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
      <Sprite start={183.5} end={188.5}>
        <div style={{ position: 'absolute', left: 0, right: 0, bottom: 0, top: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 27, background: 'rgba(0,0,0,0.55)' }}>
          <BigTitle size={70} color={MV.text} style={{ maxWidth: 1400 }}>
            Our prediction — Portuguese class, Congolese pride, and one old king who is not finished yet. Watch.
          </BigTitle>
        </div>
      </Sprite>
      <Letterbox />
    </div>
  );
}

// ── 8. Match drama (188.5–243.5): OUR PREDICTION — Portugal 3-1 DR Congo ──────
// Leão strikes (1-0, ~196.5). Wissa answers for the Leopards (1-1, ~208). Leão
// again off Bernardo (2-1, ~221). Ronaldo at the death (3-1, ~234). FT = PREDICTION.
function SceneDrama() {
  const { localTime: lt } = useSprite();
  const S = 188.5;
  return (
    <div style={{ position: 'absolute', inset: 0, background: '#000' }}>
      <VideoSprite src="assets/leao.mp4" start={S} dur={20} from={1.1} to={1.26} panX={-30} dim={0.18} />
      <Sprite start={S + 16} end={S + 30}>
        <VideoSprite src="assets/wissa.mp4" start={S + 16} dur={14} from={1.08} to={1.22} panX={20} dim={0.16} />
      </Sprite>
      <Sprite start={S + 30} end={S + 55}>
        <VideoSprite src="assets/ronaldo.mp4" start={S + 30} dur={25} from={1.08} to={1.24} panX={-20} dim={0.16} />
      </Sprite>
      {/* OUR PREDICTION watermark — REAL-RESULTS-ONLY rule */}
      <div style={{ position: 'absolute', top: 116, left: 0, right: 0, textAlign: 'center', zIndex: 25 }}>
        <Kicker size={24} color={MV.gold}>Our Prediction · Our Story</Kicker>
      </div>

      {/* 0-0 (188.5) → 1-0 Leão (~196.5) */}
      <Sprite start={188.5} end={196.5}>
        <ScoreBug start={S + 0.4} civ={0} ecu={0} minute="1st half" />
      </Sprite>
      <GoalFlash at={S + 8.0} color={MV.civ} />
      <Confetti start={S + 8.2} dur={10} colors={[MV.civ, '#fff', MV.civGreen, MV.gold]} />
      <Sprite start={196.5} end={208}>
        <ScoreBug start={S + 8.0} civ={1} ecu={0} minute="LEÃO" />
      </Sprite>

      {/* 1-1 Wissa (~208) */}
      <GoalFlash at={S + 19.5} color={MV.ecu} />
      <Confetti start={S + 19.7} dur={9} colors={[MV.ecu, '#fff', MV.ecuYellow, MV.ecuRed]} />
      <Sprite start={208} end={221}>
        <ScoreBug start={S + 19.5} civ={1} ecu={1} minute="WISSA" />
      </Sprite>

      {/* 2-1 Leão (~221) */}
      <GoalFlash at={S + 32.5} color={MV.civ} />
      <Confetti start={S + 32.7} dur={9} colors={[MV.civ, '#fff', MV.civGreen, MV.gold]} />
      <Sprite start={221} end={233.5}>
        <ScoreBug start={S + 32.5} civ={2} ecu={1} minute="LEÃO" />
      </Sprite>

      {/* 3-1 Ronaldo at the death (~234) */}
      <GoalFlash at={S + 45.5} color={MV.gold} />
      <Confetti start={S + 45.7} dur={10} colors={[MV.civ, '#fff', MV.gold, MV.civGreen]} />
      <Sprite start={233.5} end={238.5}>
        <ScoreBug start={S + 45.5} civ={3} ecu={1} minute="RONALDO" />
      </Sprite>

      <Sprite start={238.5} end={243.5}>
        <FullTimeCard start={S + 50.5} />
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
            <FlagCIV w={150} />
            <span style={{ fontFamily: '"Inter",sans-serif', fontWeight: 800, fontSize: 34, color: MV.text }}>PORTUGAL</span>
          </div>
          <BigTitle size={170} color={MV.gold}>3 — 1</BigTitle>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16 }}>
            <FlagECU w={150} />
            <span style={{ fontFamily: '"Inter",sans-serif', fontWeight: 800, fontSize: 34, color: MV.text }}>DR CONGO</span>
          </div>
        </div>
        <div style={{ fontFamily: '"Inter",sans-serif', fontWeight: 600, fontSize: 30, color: MV.muted, marginTop: 34, maxWidth: 980 }}>
          Leão twice, Ronaldo at the death — Wissa keeps the Leopards roaring. The chase goes on; pride stays intact.
        </div>
      </div>
    </div>
  );
}

// ── 9. Verdict (243.5–252.5): do you agree? SELEÇÃO / LEOPARDS ────────────────
function SceneVerdict() {
  const { localTime: lt } = useSprite();
  const S = 243.5;
  const headP = Easing.easeOutCubic(clamp(lt / 0.8, 0, 1));
  const a = Easing.easeOutBack(clamp((lt - 1.2) / 0.7, 0, 1));
  const b = Easing.easeOutBack(clamp((lt - 1.6) / 0.7, 0, 1));
  return (
    <div style={{ position: 'absolute', inset: 0, background: '#0a0f1c' }}>
      <PitchBackdrop tint="#1a0a10" dim={0.45} />
      <div style={{ position: 'absolute', top: 150, left: 0, right: 0, textAlign: 'center', zIndex: 25, opacity: headP }}>
        <Kicker size={30} color={MV.text}>The chase goes on — the Leopards walk off proud</Kicker>
        <div style={{ fontFamily: '"Inter",sans-serif', fontWeight: 900, fontSize: 72, color: MV.gold, marginTop: 18, letterSpacing: '0.04em' }}>DO YOU AGREE?</div>
      </div>
      <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 70, zIndex: 26, marginTop: 60 }}>
        <div style={{ opacity: clamp(a, 0, 1), transform: `translateY(${(1 - a) * 50}px) scale(${0.85 + 0.15 * a})`, background: 'rgba(170,21,27,0.16)', border: `2px solid ${MV.civ}`, borderRadius: 22, padding: '34px 60px', textAlign: 'center', minWidth: 420 }}>
          <div style={{ fontFamily: '"Inter",sans-serif', fontWeight: 900, fontSize: 56, color: '#ff5d63', letterSpacing: '0.06em' }}>“SELEÇÃO”</div>
          <div style={{ fontFamily: '"Inter",sans-serif', fontWeight: 600, fontSize: 26, color: MV.muted, marginTop: 12 }}>if Ronaldo finally lifts it</div>
        </div>
        <div style={{ opacity: clamp(b, 0, 1), transform: `translateY(${(1 - b) * 50}px) scale(${0.85 + 0.15 * b})`, background: 'rgba(0,127,255,0.18)', border: `2px solid ${MV.ecu}`, borderRadius: 22, padding: '34px 60px', textAlign: 'center', minWidth: 420 }}>
          <div style={{ fontFamily: '"Inter",sans-serif', fontWeight: 900, fontSize: 56, color: MV.ecu, letterSpacing: '0.06em' }}>“LEOPARDS”</div>
          <div style={{ fontFamily: '"Inter",sans-serif', fontWeight: 600, fontSize: 26, color: MV.muted, marginTop: 12 }}>if the door swings open again</div>
        </div>
      </div>
      <Vignette strength={0.5} />
      <Letterbox />
    </div>
  );
}

// ── 10. Mystery Supporter (252.5–272.5): Legend 024 — the Leopard ─────────────
function SceneMystery() {
  const { localTime: lt } = useSprite();
  const S = 252.5;
  const inP = Easing.easeOutCubic(clamp((lt - 0.6) / 1.4, 0, 1));
  const plateP = Easing.easeOutBack(clamp((lt - 4.2) / 0.9, 0, 1));
  return (
    <div style={{ position: 'absolute', inset: 0, background: '#02030a' }}>
      <VideoSprite src="assets/mystery.mp4" start={S} dur={20} from={1.16} to={1.3} panY={-20}
        dim={0.32} style={{ filter: 'brightness(0.4) contrast(1.12) saturate(0.95) grayscale(0.4)' }} />
      <div style={{
        position: 'absolute', inset: 0, zIndex: 21, pointerEvents: 'none', opacity: 0.5,
        background: `radial-gradient(ellipse at ${20 + Math.sin(lt * 0.3) * 14}% 75%, rgba(0,127,255,0.18) 0%, transparent 45%),` +
                    `radial-gradient(ellipse at ${78 - Math.sin(lt * 0.22) * 12}% 30%, rgba(247,214,24,0.12) 0%, transparent 50%)`,
      }} />
      <AmbientParticles start={S} dur={20} count={46} color="180,210,255" maxR={3.5} zIndex={22} />
      <div style={{ position: 'absolute', top: 118, left: 0, right: 0, textAlign: 'center', zIndex: 25, opacity: inP }}>
        <Kicker size={26} color="#a9cdff">The Mystery Supporter · Legend No. 024</Kicker>
      </div>
      {plateP > 0 && (
        <div style={{
          position: 'absolute', left: 110, bottom: 150, zIndex: 25,
          opacity: clamp(plateP, 0, 1), transform: `translateY(${(1 - plateP) * 50}px)`,
        }}>
          <div style={{ background: 'rgba(8,12,20,0.9)', border: '1px solid rgba(140,190,255,0.4)', borderRadius: 18, padding: '28px 44px', backdropFilter: 'blur(6px)' }}>
            <div style={{ fontFamily: '"Inter",sans-serif', fontWeight: 900, fontSize: 54, color: '#eaf3ff', letterSpacing: '0.02em' }}>THE LEOPARD</div>
            <div style={{ fontFamily: '"Inter",sans-serif', fontWeight: 700, fontSize: 24, color: '#a9cdff', letterSpacing: '0.16em', marginTop: 8, maxWidth: 760 }}>HE STOOD IN THAT WALL IN '74 — HE CARRIES THE YELLOW CARD THAT WAS NEVER SHAME, ONLY COURAGE</div>
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

// ── 11. App promo (272.5–290): worldcup26.world ──────────────────────────────
function SceneApp() {
  const { localTime: lt } = useSprite();
  const S = 272.5;
  const inP = Easing.easeOutCubic(clamp(lt / 1.0, 0, 1));
  const cards = [
    { name: 'PORTUGAL', coef: 'x1.65', pts: '+1.65', flag: <FlagCIV w={86} />, hot: true },
    { name: 'DR CONGO', coef: 'x3.00', pts: 'UNDERDOG', flag: <FlagECU w={86} />, hot: true },
    { name: 'BRAZIL', coef: 'x1.20', pts: '+0.00', flag: <div style={{ width: 86, height: 57, borderRadius: 6, background: 'linear-gradient(135deg,#159b46 55%,#ffd24a 55%)' }} /> },
  ];
  return (
    <div style={{ position: 'absolute', inset: 0, background: `linear-gradient(160deg, #0d2a20 0%, #07090f 70%)` }}>
      <div style={{ position: 'absolute', inset: 0, background: `radial-gradient(ellipse at 50% 20%, rgba(16,107,79,0.35) 0%, transparent 60%)` }} />
      <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 40, opacity: inP }}>
        <Kicker color="#7fd6b5" size={30}>The Prediction Game</Kicker>
        <BigTitle size={100} color="#fff" glow={MV.green}>worldcup26.world</BigTitle>
        <div style={{ fontFamily: '"Inter",sans-serif', fontWeight: 700, fontSize: 36, color: '#cfe9de', letterSpacing: '0.04em' }}>
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
          FREE TO PLAY · LIVE LEADERBOARD · JUST FOR FUN
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
      <PitchBackdrop tint="#1a0a10" dim={0.55} />
      <AmbientParticles start={S} dur={10} count={28} color="0,127,255" />
      <div style={{ position: 'absolute', inset: 0, zIndex: 23, background: 'radial-gradient(ellipse at 50% 35%, transparent 0%, rgba(7,9,15,0.88) 75%)' }} />
      <div style={{ position: 'absolute', top: 200, left: 0, right: 0, textAlign: 'center', zIndex: 25, opacity: inP }}>
        <Kicker size={30} color={MV.civ}>The legends are only beginning</Kicker>
        <div style={{ marginTop: 24 }}><TitleReveal text="JOIN THE LEGENDS" start={S + 0.5} size={86} color={MV.text} /></div>
      </div>
      <div style={{ position: 'absolute', inset: 0, zIndex: 26 }}>
        <CtaButton start={S} delay={1.2} label="SUBSCRIBE" icon="🔔" accent="#aa151b" x={500} />
        <CtaButton start={S} delay={1.6} label="LIKE" icon="👍" accent="#007fff" x={960} />
        <CtaButton start={S} delay={2.0} label="SHARE" icon="📣" accent="#1f8a4c" x={1400} />
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
        <span style={{ fontFamily: '"Inter",sans-serif', fontWeight: 900, fontSize: 30, color: MV.gold }}>🐆 THE LEGENDS PLAY ON · worldcup26.world</span>
      </div>
    </div>
  );
}
