// match-scenes.jsx — the twelve scenes of the Match 18 video (300s timeline).
// Scene windows must match the SCENES table in match.html and narration.json.
// IMAGE-BASED: Ken-Burns motion on still PNGs. SOCCER ONLY — round-neck shirts,
// a pitch with goals, never gridiron. REAL-RESULTS-ONLY: the 2-1 is OUR PREDICTION.
// NOTE: nested <Sprite> windows are GLOBAL seconds (Sprite reads the timeline clock).
// Belgium = Red Devils (red/black/gold). Egypt = Pharaohs (red/white/black).

// ── 1. Cold open (0–16): two crowns, two curses ──────────────────────────────
function SceneColdOpen() {
  const { localTime: lt } = useSprite();
  const beat = Math.pow(Math.max(0, Math.sin(lt * Math.PI * 1.1)), 8);
  const line1P = Easing.easeOutCubic(clamp((lt - 1.2) / 1.4, 0, 1)) * (lt > 10.5 ? Math.max(0, (12.0 - lt) / 1.5) : 1);
  const titleP = Easing.easeOutCubic(clamp((lt - 12.3) / 1.4, 0, 1));
  return (
    <div style={{ position: 'absolute', inset: 0, background: '#000' }}>
      {/* De Bruyne — the conductor as the symbol of the uncrowned No.1 (dark, dramatic) */}
      <KenBurns src="assets/player-debruyne.png" start={0} dur={16} from={1.18} to={1.32} panY={-30}
        dim={0.5} style={{ filter: 'brightness(0.42) contrast(1.18) saturate(1.05) grayscale(0.35)' }} />
      {/* ember base in Belgian red so the screen never reads as dead air */}
      <div style={{ position: 'absolute', inset: 0, background: `radial-gradient(ellipse at 50% 78%, rgba(239,51,64,0.16) 0%, transparent 55%)` }} />
      {/* heartbeat glow (gold) */}
      <div style={{ position: 'absolute', inset: 0, background: `radial-gradient(ellipse at center, rgba(249,214,22,${(0.42 * beat).toFixed(3)}) 0%, transparent 62%)` }} />
      {line1P > 0.01 && (
        <div style={{
          position: 'absolute', left: 160, right: 160, bottom: 200, textAlign: 'center', zIndex: 22,
          opacity: line1P,
          fontFamily: '"Inter",sans-serif', fontWeight: 800, fontSize: 46, color: '#f6e3c6',
          letterSpacing: '0.04em', lineHeight: 1.25, textShadow: '0 4px 22px rgba(0,0,0,0.9)',
        }}>Two crowns. Two curses. One was ranked the best on Earth — and never won a thing.</div>
      )}
      <Vignette strength={0.85} />
      {lt > 12.3 && (
        <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 30, opacity: titleP, zIndex: 22 }}>
          <Kicker size={32} color="#f6e3c6">Two kings, never crowned</Kicker>
          <TitleReveal text="TONIGHT, ONE BREAKS" start={12.4} size={108} color={MV.bel} />
        </div>
      )}
      <Letterbox />
    </div>
  );
}

// ── 2. Recap + title card (16–28) ────────────────────────────────────────────
function SceneTitle() {
  const { localTime: lt } = useSprite();
  // first ~10s carries the Ep17 recap line, then the Ep18 title settles
  const recapP = Easing.easeOutCubic(clamp(lt / 0.9, 0, 1)) * Math.max(0, Math.min(1, (10.5 - lt) / 1.0));
  const p1 = Easing.easeOutCubic(clamp((lt - 10.0) / 1.0, 0, 1));
  const p2 = Easing.easeOutBack(clamp((lt - 10.6) / 1.0, 0, 1));
  const p3 = Easing.easeOutCubic(clamp((lt - 11.4) / 0.9, 0, 1));
  return (
    <div style={{ position: 'absolute', inset: 0, background: `linear-gradient(180deg, #0a0f1c 0%, #1a1010 55%, #0a0f1c 100%)` }}>
      <div style={{ position: 'absolute', inset: 0, background: `radial-gradient(ellipse at 50% 30%, rgba(239,51,64,0.12) 0%, transparent 55%)` }} />
      <AmbientParticles start={16} dur={12} count={34} color="249,214,22" />
      {/* RECAP — OUR PREDICTION from Ep17 (never stated as a real result) */}
      {recapP > 0.01 && (
        <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 22, opacity: recapP }}>
          <Kicker size={26} color={MV.muted}>Last time · our prediction</Kicker>
          <BigTitle size={62} color={MV.text} glow={MV.gold} style={{ maxWidth: 1500 }}>SPAIN — CAPE VERDE</BigTitle>
          <div style={{ fontFamily: '"Inter",sans-serif', fontWeight: 600, fontSize: 30, color: MV.muted, letterSpacing: '0.06em' }}>Our story, not a result</div>
        </div>
      )}
      {/* TITLE CARD */}
      {lt >= 9.5 && (
        <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 40 }}>
          <div style={{ opacity: p1, transform: `translateY(${(1 - p1) * -30}px)` }}>
            <Kicker color={MV.bel}>WorldCup26 Legends · Episode 18</Kicker>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 70, opacity: clamp(p2, 0, 1), transform: `scale(${p2})` }}>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 20 }}>
              <Waving><FlagBEL w={230} /></Waving>
              <BigTitle size={62} glow={MV.bel}>BELGIUM</BigTitle>
            </div>
            <BigTitle size={120} color={MV.belGold}>VS</BigTitle>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 20 }}>
              <Waving speed={1.9}><FlagEGY w={230} /></Waving>
              <BigTitle size={62} glow={MV.egy}>EGYPT</BigTitle>
            </div>
          </div>
          <div style={{ opacity: p3, transform: `translateY(${(1 - p3) * 26}px)`, fontFamily: '"Inter",sans-serif', fontWeight: 600, fontSize: 32, color: MV.muted, letterSpacing: '0.08em' }}>
            GROUP G · THE RED DEVILS AND THE PHARAOHS
          </div>
        </div>
      )}
      <Letterbox />
    </div>
  );
}

// ── 3. Tease (28–46.5): Red Devils & Pharaohs + "the ghost it never beat" ────
function SceneTease() {
  const { localTime: lt } = useSprite();
  const a = Easing.easeOutCubic(clamp((lt - 0.4) / 1.0, 0, 1));
  // second beat (~37.5 global → lt ~9.5): "a golden generation faces the one ghost it has never beaten: itself"
  const b = Easing.easeOutBack(clamp((lt - 8.5) / 1.0, 0, 1)) * Math.max(0, Math.min(1, (18.0 - lt) / 1.0));
  return (
    <div style={{ position: 'absolute', inset: 0, background: '#05060a' }}>
      <PitchBackdrop tint="#10211a" dim={0.25} />
      <Vignette strength={0.5} />
      <AmbientParticles start={28} dur={18.5} count={26} color="249,214,22" />
      {/* devils-and-pharaohs headline */}
      <div style={{ position: 'absolute', top: 200, left: 0, right: 0, textAlign: 'center', zIndex: 25, opacity: a, transform: `translateY(${(1 - a) * 24}px)` }}>
        <Kicker size={28} color={MV.bel}>The Red Devils · The Pharaohs</Kicker>
        <div style={{ fontFamily: '"Inter",sans-serif', fontWeight: 900, fontSize: 76, color: MV.text, letterSpacing: '0.03em', marginTop: 18, textShadow: '0 4px 22px rgba(0,0,0,0.85)' }}>
          TWO KINGS COLLIDE
        </div>
      </div>
      {/* the tease */}
      {b > 0.01 && (
        <div style={{ position: 'absolute', left: 0, right: 0, bottom: 210, display: 'flex', justifyContent: 'center', zIndex: 26, opacity: clamp(b, 0, 1), transform: `scale(${0.9 + 0.1 * clamp(b,0,1)})` }}>
          <div style={{ background: MV.panel, border: `1px solid ${MV.line}`, borderRadius: 999, padding: '20px 52px', display: 'flex', alignItems: 'center', gap: 18 }}>
            <span style={{ fontSize: 30 }}>⚽</span>
            <span style={{ fontFamily: '"Inter",sans-serif', fontWeight: 800, fontSize: 32, color: MV.belGold, letterSpacing: '0.03em' }}>Final minutes — the golden generation faces the one ghost it never beat: itself</span>
          </div>
        </div>
      )}
      <Letterbox />
    </div>
  );
}

// ── 4. History (46.5–98): the two real curses ────────────────────────────────
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
        <div style={{ fontFamily: '"Inter",sans-serif', fontWeight: 900, fontSize: 96, color: accent, lineHeight: 1.05, margin: '14px 0 6px', textShadow: `0 0 60px ${accent}44` }}>{score}</div>
        <div style={{ fontFamily: '"Inter",sans-serif', fontWeight: 800, fontSize: 44, color: MV.text, letterSpacing: '0.06em' }}>{year}</div>
        {note && <div style={{ fontFamily: '"Inter",sans-serif', fontWeight: 600, fontSize: 27, color: MV.muted, marginTop: 14, maxWidth: 860 }}>{note}</div>}
        {stamp && stampP > 0 && (
          <div style={{
            position: 'absolute', top: -34, right: -60, transform: `rotate(-12deg) scale(${stampP})`,
            border: `5px solid ${MV.egy}`, color: MV.egy, borderRadius: 14, padding: '10px 26px',
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
      <KenBurns src="assets/player-salah.png" start={S} dur={51.5} from={1.1} to={1.24} panX={-20}
        dim={0.72} style={{ filter: 'brightness(0.26) saturate(0.7) contrast(1.1) grayscale(0.2)' }} />
      <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse at center, transparent 30%, rgba(5,6,10,0.82) 100%)' }} />
      <AmbientParticles start={S} dur={51.5} count={28} color="200,16,46" maxR={4} />
      {/* chapter header */}
      <div style={{ position: 'absolute', top: 116, left: 0, right: 0, textAlign: 'center', zIndex: 26 }}>
        <Kicker size={28} color={MV.bel}>Chapter One · Two Curses</Kicker>
        <div style={{ fontFamily: '"Inter",sans-serif', fontWeight: 900, fontSize: 52, color: MV.text, letterSpacing: '0.04em', marginTop: 16, textShadow: '0 4px 22px rgba(0,0,0,0.8)' }}>
          CROWNS WITHOUT A CROWN
        </div>
      </div>
      {/* both flags, always present */}
      <div style={{ position: 'absolute', bottom: 124, left: 0, right: 0, display: 'flex', justifyContent: 'center', gap: 36, zIndex: 26, opacity: 0.95 }}>
        <FlagBEL w={110} />
        <FlagEGY w={110} />
      </div>
      {/* beats synced to narration (46.5 1934; 57 7 AFCON / never won; 68.5 BEL No.1; 78.5 2018 semi; 89.5 last dance) */}
      <HistoryPlate start={S + 0.5}  end={S + 10.5} year="ITALY · 1934" venue="FIRST OF AFRICA & ARABIA" score="THE PIONEERS" note="Egypt became the first African and Arab nation ever to play at a World Cup." accent={MV.egy} />
      <HistoryPlate start={S + 10.5} end={S + 22.0} year="SEVEN CROWNS · ONE CURSE" venue="AFRICA CUP OF NATIONS" score="7 × AFRICA" note="A record seven African titles — yet across three World Cups, never a single match won." accent={MV.gold} stamp="EGYPT" />
      <HistoryPlate start={S + 22.0} end={S + 32.0} year="NEARLY FOUR YEARS" venue="FIFA WORLD RANKING" score="No. 1" note="Belgium were ranked the number one team on the planet — and walked away with nothing." accent={MV.bel} />
      <HistoryPlate start={S + 32.0} end={S + 43.0} year="RUSSIA · 2018" venue="THE GOLDEN GENERATION" score="SEMI-FINAL" note="The semi-final of 2018. The talent of a lifetime. And not one trophy to show the world." accent={MV.belGold} />
      <HistoryPlate start={S + 43.0} end={S + 51.5} year="TONIGHT · GROUP G" venue="ALMOST CERTAINLY THE LAST DANCE" score="BEL × EGY" note="Their last dance together — against a king who has waited a hundred years." accent={MV.text} />
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

// ── 5. Belgium (98–134): the Red Devils ──────────────────────────────────────
function SceneBelgium() {
  const { localTime: lt } = useSprite();
  const S = 98.0;
  const headerP = Easing.easeOutCubic(clamp(lt / 0.9, 0, 1));
  return (
    <div style={{ position: 'absolute', inset: 0, background: '#0a0c14' }}>
      <PitchBackdrop tint="#10211a" dim={0.4} />
      <div style={{ position: 'absolute', inset: 0, zIndex: 22, pointerEvents: 'none', background: `linear-gradient(90deg, rgba(239,51,64,0.20) 0%, transparent 30%, transparent 70%, rgba(249,214,22,0.16) 100%)` }} />
      <div style={{ position: 'absolute', top: 108, left: 0, right: 0, display: 'flex', justifyContent: 'center', zIndex: 26, opacity: headerP, transform: `translateY(${(1 - headerP) * -24}px)` }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 26, background: MV.panel, border: `1px solid ${MV.line}`, borderRadius: 999, padding: '16px 44px' }}>
          <FlagBEL w={74} />
          <span style={{ fontFamily: '"Inter",sans-serif', fontWeight: 900, fontSize: 40, color: MV.text, letterSpacing: '0.10em' }}>THE RED DEVILS · THE GOLDEN GENERATION</span>
        </div>
      </div>
      <SquadGrid start={S + 0.4} end={S + 8.0} accent={MV.bel} players={[
        { img: 'assets/squad/bel-1-DeBruyne.png', name: 'KEVIN DE BRUYNE', role: 'THE CONDUCTOR' },
        { img: 'assets/squad/bel-2-Lukaku.png',   name: 'ROMELU LUKAKU',  role: 'THE FINISHER' },
        { img: 'assets/squad/bel-3-Doku.png',     name: 'JEREMY DOKU',    role: 'THE FUTURE' },
        { img: 'assets/squad/bel-4-Courtois.png', name: 'T. COURTOIS',    role: 'THE WALL' },
        { img: 'assets/squad/bel-5-Trossard.png', name: 'L. TROSSARD',    role: 'THE SPARK' },
      ]} />
      {/* line beats: 98 De Bruyne, 104.5 Lukaku, 116 Doku, 126.5 Courtois */}
      <Sprite start={98.0} end={104.5}>
        <KenBurns src="assets/player-debruyne.png" start={98} dur={6.5} from={1.04} to={1.14} dim={0.18} style={{ zIndex: 10 }} />
        <LowerThird start={98.4} name="KEVIN DE BRUYNE" role="The Conductor · Midfield" line="The passer who sees the game three seconds before anyone else." accent={MV.bel} />
      </Sprite>
      <Sprite start={104.5} end={116.0}>
        <KenBurns src="assets/player-lukaku.png" start={104.5} dur={11.5} from={1.04} to={1.16} panX={20} dim={0.18} style={{ zIndex: 10 }} />
        <LowerThird start={104.9} name="ROMELU LUKAKU" role="The Finisher · Striker" line="Belgium's greatest goalscorer — all power and hunger." accent={MV.bel} />
      </Sprite>
      <Sprite start={116.0} end={126.5}>
        <KenBurns src="assets/player-doku.png" start={116} dur={10.5} from={1.04} to={1.16} panX={-20} dim={0.18} style={{ zIndex: 10 }} />
        <LowerThird start={116.4} name="JEREMY DOKU" role="The Future · Winger" line="Electric, fearless — the bridge to whatever comes next." accent={MV.belGold} />
      </Sprite>
      <Sprite start={126.5} end={134.0}>
        <KenBurns src="assets/player-courtois.png" start={126.5} dur={7.5} from={1.04} to={1.14} dim={0.18} style={{ zIndex: 10 }} />
        <LowerThird start={126.9} name="THIBAUT COURTOIS" role="The Wall · Goalkeeper" line="A wall in gloves — a team built to finally finish the story." accent={MV.bel} />
      </Sprite>
      <Vignette strength={0.42} />
      <Letterbox />
    </div>
  );
}

// ── 6. Egypt (134–169.5): the Pharaohs ───────────────────────────────────────
function SceneEgypt() {
  const { localTime: lt } = useSprite();
  const S = 134.0;
  const headerP = Easing.easeOutCubic(clamp(lt / 0.9, 0, 1));
  return (
    <div style={{ position: 'absolute', inset: 0, background: '#0a0c14' }}>
      <PitchBackdrop tint="#1a1010" dim={0.4} />
      <div style={{ position: 'absolute', inset: 0, zIndex: 22, pointerEvents: 'none', background: `linear-gradient(90deg, rgba(200,16,46,0.24) 0%, transparent 30%, transparent 70%, rgba(244,246,250,0.12) 100%)` }} />
      <div style={{ position: 'absolute', top: 108, left: 0, right: 0, display: 'flex', justifyContent: 'center', zIndex: 26, opacity: headerP, transform: `translateY(${(1 - headerP) * -24}px)` }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 26, background: MV.panel, border: `1px solid ${MV.line}`, borderRadius: 999, padding: '16px 44px' }}>
          <FlagEGY w={74} />
          <span style={{ fontFamily: '"Inter",sans-serif', fontWeight: 900, fontSize: 40, color: MV.text, letterSpacing: '0.10em' }}>THE PHARAOHS · SEVEN-TIME KINGS OF AFRICA</span>
        </div>
      </div>
      <SquadGrid start={S + 0.4} end={S + 8.0} accent={MV.egy} players={[
        { img: 'assets/squad/egy-1-Salah.png',     name: 'MOHAMED SALAH',  role: 'CAPTAIN · KING' },
        { img: 'assets/squad/egy-2-Marmoush.png',  name: 'OMAR MARMOUSH',  role: 'PACE & FIRE' },
        { img: 'assets/squad/egy-3-Trezeguet.png', name: 'TREZEGUET',      role: 'THE WINGER' },
        { img: 'assets/squad/egy-4-ElShenawy.png', name: 'EL SHENAWY',     role: 'THE KEEPER' },
        { img: 'assets/squad/egy-5-Abdelkarim.png',name: 'H. ABDELKARIM',  role: 'THE SPINE' },
      ]} />
      {/* line beats: 134 the king across the line, 143.5 Salah, 153.5 Marmoush/spine, 164 uncrowned No.1 vs kings */}
      <Sprite start={143.5} end={153.5}>
        <KenBurns src="assets/player-salah.png" start={143.5} dur={10} from={1.04} to={1.16} panX={-20} dim={0.2} style={{ zIndex: 10 }} />
        <LowerThird start={143.9} name="MOHAMED SALAH" role="The Captain · The King" line="The talisman who carries a nation — chasing the stage that has eluded him for years." accent={MV.egy} />
      </Sprite>
      <Sprite start={153.5} end={164.0}>
        <KenBurns src="assets/player-marmoush.png" start={153.5} dur={10.5} from={1.04} to={1.14} panX={20} dim={0.2} style={{ zIndex: 10 }} />
        <LowerThird start={153.9} name="OMAR MARMOUSH" role="Pace & Fire · Forward" line="Premier League speed — and a disciplined Egyptian spine that does not break easily." accent={MV.egy} />
      </Sprite>
      <Sprite start={164.0} end={169.5}>
        <KenBurns src="assets/player-trezeguet.png" start={164} dur={5.5} from={1.04} to={1.14} dim={0.2} style={{ zIndex: 10 }} />
        <LowerThird start={164.3} name="SEVEN-TIME KINGS" role="Champions of Africa" line="When the uncrowned number one meets the seven-time kings, someone's curse has to die." accent={MV.gold} />
      </Sprite>
      <Vignette strength={0.42} />
      <Letterbox />
    </div>
  );
}

// ── 7. The duel (169.5–188.5): De Bruyne vs Salah ────────────────────────────
function SceneDuel() {
  const { localTime: lt } = useSprite();
  const slideP = Easing.easeOutQuart(clamp(lt / 1.1, 0, 1));
  const vsP = Easing.easeOutBack(clamp((lt - 0.9) / 0.8, 0, 1));
  const shake = lt > 0.9 && lt < 1.25 ? Math.sin(lt * 160) * 7 * (1.25 - lt) / 0.35 : 0;
  return (
    <div style={{ position: 'absolute', inset: 0, background: '#05060a', transform: `translate(${shake}px, ${-shake}px)` }}>
      <div style={{ position: 'absolute', top: 0, bottom: 0, left: 0, width: '50%', overflow: 'hidden', transform: `translateX(${(1 - slideP) * -100}%)` }}>
        <img src="assets/player-debruyne.png" alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', filter: 'saturate(1.15) brightness(0.92)' }} />
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(90deg, rgba(239,51,64,0.32), transparent 65%)' }} />
        <div style={{ position: 'absolute', bottom: 150, left: 90, fontFamily: '"Inter",sans-serif', fontWeight: 900, fontSize: 58, color: '#fff', textShadow: '0 4px 26px rgba(0,0,0,0.9)' }}>
          THE CONDUCTOR
          <div style={{ fontSize: 27, fontWeight: 700, color: MV.belGold, letterSpacing: '0.2em', marginTop: 8 }}>BELGIUM · DE BRUYNE · VISION</div>
        </div>
      </div>
      <div style={{ position: 'absolute', top: 0, bottom: 0, right: 0, width: '50%', overflow: 'hidden', transform: `translateX(${(1 - slideP) * 100}%)` }}>
        <img src="assets/player-salah.png" alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', filter: 'saturate(1.15) brightness(0.92)' }} />
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(270deg, rgba(200,16,46,0.4), transparent 65%)' }} />
        <div style={{ position: 'absolute', bottom: 150, right: 90, textAlign: 'right', fontFamily: '"Inter",sans-serif', fontWeight: 900, fontSize: 58, color: '#fff', textShadow: '0 4px 26px rgba(0,0,0,0.9)' }}>
          THE KING
          <div style={{ fontSize: 27, fontWeight: 700, color: MV.belGold, letterSpacing: '0.2em', marginTop: 8 }}>EGYPT · SALAH · WILL</div>
        </div>
      </div>
      <div style={{ position: 'absolute', top: 0, bottom: 0, left: 'calc(50% - 3px)', width: 6, background: `linear-gradient(180deg, transparent, ${MV.belGold}, transparent)`, zIndex: 24, opacity: slideP }} />
      <div style={{
        position: 'absolute', top: '50%', left: '50%', zIndex: 26,
        transform: `translate(-50%,-50%) scale(${vsP}) rotate(${(1 - vsP) * 20}deg)`, opacity: clamp(vsP, 0, 1),
        width: 210, height: 210, borderRadius: '50%', background: MV.panel, border: `5px solid ${MV.belGold}`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        boxShadow: `0 0 90px ${MV.belGold}66`,
      }}>
        <span style={{ fontFamily: '"Inter",sans-serif', fontWeight: 900, fontSize: 92, color: MV.belGold }}>VS</span>
      </div>
      <Sprite start={183.5} end={188.5}>
        <div style={{ position: 'absolute', left: 0, right: 0, bottom: 0, top: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 27, background: 'rgba(0,0,0,0.55)' }}>
          <BigTitle size={62} color={MV.text} style={{ maxWidth: 1400 }}>
            Our prediction — built on Belgian experience, one last dance, and one flash of Salah magic. Watch.
          </BigTitle>
        </div>
      </Sprite>
      <Letterbox />
    </div>
  );
}

// ── 8. Match drama (188.5–243.5): OUR PREDICTION 2-1 Belgium ─────────────────
// Lukaku finishes De Bruyne's pass (1-0, ~190.5). Salah curls in the equaliser
// (1-1, ~200). The ghost wakes. Doku squares for the late winner (2-1, ~221).
// Full-time card = OUR PREDICTION.
function SceneDrama() {
  const { localTime: lt } = useSprite();
  const S = 188.5;
  return (
    <div style={{ position: 'absolute', inset: 0, background: '#000' }}>
      <KenBurns src="assets/player-lukaku.png" start={S} dur={11.5} from={1.1} to={1.26} panX={-30} dim={0.18} />
      <Sprite start={197.9} end={216}>
        <KenBurns src="assets/player-salah.png" start={197.9} dur={18.1} from={1.08} to={1.24} panX={20} dim={0.16} />
      </Sprite>
      <Sprite start={216} end={233}>
        <KenBurns src="assets/player-doku.png" start={216} dur={17} from={1.08} to={1.24} panX={-20} dim={0.16} />
      </Sprite>
      {/* OUR PREDICTION watermark — REAL-RESULTS-ONLY rule */}
      <div style={{ position: 'absolute', top: 116, left: 0, right: 0, textAlign: 'center', zIndex: 25 }}>
        <Kicker size={24} color={MV.belGold}>Our Prediction · Our Story</Kicker>
      </div>

      {/* 0-0 at kickoff */}
      <Sprite start={188.5} end={190.5}>
        <ScoreBug start={S + 0.4} bel={0} egy={0} minute="1st half" />
      </Sprite>
      {/* GOAL 1: Lukaku 1-0 (~190.5) */}
      <GoalFlash at={S + 2.0} color={MV.bel} />
      <Confetti start={S + 2.2} dur={12} colors={[MV.bel, '#fff', MV.belGold, '#1a1a1a']} />
      <Sprite start={190.5} end={197.9}>
        <ScoreBug start={S + 2.0} bel={1} egy={0} minute="LUKAKU" />
      </Sprite>
      {/* GOAL 2: Salah 1-1 (~200) */}
      <GoalFlash at={S + 11.5} color={MV.egy} />
      <Confetti start={S + 11.7} dur={11} colors={[MV.egy, '#fff', '#1a1a1a', MV.gold]} />
      <Sprite start={197.9} end={218.5}>
        <ScoreBug start={S + 11.5} bel={1} egy={1} minute="SALAH" />
      </Sprite>
      {/* GOAL 3: Doku sets up the late winner 2-1 (~221) */}
      <GoalFlash at={S + 32.5} color={MV.belGold} />
      <Confetti start={S + 32.7} dur={11} colors={[MV.bel, '#fff', MV.belGold, '#1a1a1a']} />
      <Sprite start={218.5} end={233}>
        <ScoreBug start={S + 32.5} bel={2} egy={1} minute="DOKU →" />
      </Sprite>

      <Sprite start={233} end={243.5}>
        <FullTimeCard start={S + 44.5} />
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
        <Kicker size={26} color={MV.belGold}>Our Prediction · Full Time</Kicker>
        <div style={{ display: 'flex', alignItems: 'center', gap: 56, marginTop: 36 }}>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16 }}>
            <FlagBEL w={150} />
            <span style={{ fontFamily: '"Inter",sans-serif', fontWeight: 800, fontSize: 34, color: MV.text }}>BELGIUM</span>
          </div>
          <BigTitle size={170} color={MV.belGold}>2 — 1</BigTitle>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16 }}>
            <FlagEGY w={150} />
            <span style={{ fontFamily: '"Inter",sans-serif', fontWeight: 800, fontSize: 34, color: MV.text }}>EGYPT</span>
          </div>
        </div>
        <div style={{ fontFamily: '"Inter",sans-serif', fontWeight: 600, fontSize: 30, color: MV.muted, marginTop: 34, maxWidth: 980 }}>
          Lukaku strikes, Salah answers, Doku sets up the late winner — Egypt's century-old curse survives one more night.
        </div>
      </div>
    </div>
  );
}

// ── 9. Verdict (243.5–252.5): do you agree? DEVILS / PHARAOHS ────────────────
function SceneVerdict() {
  const { localTime: lt } = useSprite();
  const S = 243.5;
  const headP = Easing.easeOutCubic(clamp(lt / 0.8, 0, 1));
  const a = Easing.easeOutBack(clamp((lt - 1.2) / 0.7, 0, 1));
  const b = Easing.easeOutBack(clamp((lt - 1.6) / 0.7, 0, 1));
  return (
    <div style={{ position: 'absolute', inset: 0, background: '#0a0f1c' }}>
      <PitchBackdrop tint="#1a1010" dim={0.45} />
      <div style={{ position: 'absolute', top: 150, left: 0, right: 0, textAlign: 'center', zIndex: 25, opacity: headP }}>
        <Kicker size={30} color={MV.text}>But Salah scored — the next chapter is still unwritten</Kicker>
        <div style={{ fontFamily: '"Inter",sans-serif', fontWeight: 900, fontSize: 72, color: MV.belGold, marginTop: 18, letterSpacing: '0.04em' }}>DO YOU AGREE?</div>
      </div>
      <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 70, zIndex: 26, marginTop: 60 }}>
        <div style={{ opacity: clamp(a, 0, 1), transform: `translateY(${(1 - a) * 50}px) scale(${0.85 + 0.15 * a})`, background: 'rgba(239,51,64,0.12)', border: `2px solid ${MV.bel}`, borderRadius: 22, padding: '34px 60px', textAlign: 'center', minWidth: 420 }}>
          <div style={{ fontFamily: '"Inter",sans-serif', fontWeight: 900, fontSize: 56, color: MV.bel, letterSpacing: '0.06em' }}>“DEVILS”</div>
          <div style={{ fontFamily: '"Inter",sans-serif', fontWeight: 600, fontSize: 26, color: MV.muted, marginTop: 12 }}>if Belgium's golden generation finally delivers</div>
        </div>
        <div style={{ opacity: clamp(b, 0, 1), transform: `translateY(${(1 - b) * 50}px) scale(${0.85 + 0.15 * b})`, background: 'rgba(200,16,46,0.18)', border: `2px solid ${MV.egy}`, borderRadius: 22, padding: '34px 60px', textAlign: 'center', minWidth: 420 }}>
          <div style={{ fontFamily: '"Inter",sans-serif', fontWeight: 900, fontSize: 56, color: MV.egy, letterSpacing: '0.06em' }}>“PHARAOHS”</div>
          <div style={{ fontFamily: '"Inter",sans-serif', fontWeight: 600, fontSize: 26, color: MV.muted, marginTop: 12 }}>if Salah breaks the curse and shocks them</div>
        </div>
      </div>
      <Vignette strength={0.5} />
      <Letterbox />
    </div>
  );
}

// ── 10. Mystery Supporter (252.5–272.5): Legend 018 — Keeper of the Two Crowns ─
function SceneMystery() {
  const { localTime: lt } = useSprite();
  const S = 252.5;
  const inP = Easing.easeOutCubic(clamp((lt - 0.6) / 1.4, 0, 1));
  const plateP = Easing.easeOutBack(clamp((lt - 4.2) / 0.9, 0, 1));
  return (
    <div style={{ position: 'absolute', inset: 0, background: '#02030a' }}>
      <KenBurns src="assets/player-courtois.png" start={S} dur={20} from={1.16} to={1.3} panY={-20}
        dim={0.32} style={{ filter: 'brightness(0.4) contrast(1.1) saturate(1.0) grayscale(0.3)' }} />
      <div style={{
        position: 'absolute', inset: 0, zIndex: 21, pointerEvents: 'none', opacity: 0.5,
        background: `radial-gradient(ellipse at ${20 + Math.sin(lt * 0.3) * 14}% 75%, rgba(239,51,64,0.16) 0%, transparent 45%),` +
                    `radial-gradient(ellipse at ${78 - Math.sin(lt * 0.22) * 12}% 30%, rgba(200,16,46,0.14) 0%, transparent 50%)`,
      }} />
      <AmbientParticles start={S} dur={20} count={46} color="249,214,22" maxR={3.5} zIndex={22} />
      <div style={{ position: 'absolute', top: 118, left: 0, right: 0, textAlign: 'center', zIndex: 25, opacity: inP }}>
        <Kicker size={26} color="#f4c98a">The Mystery Supporter · Legend No. 018</Kicker>
      </div>
      {plateP > 0 && (
        <div style={{
          position: 'absolute', left: 110, bottom: 150, zIndex: 25,
          opacity: clamp(plateP, 0, 1), transform: `translateY(${(1 - plateP) * 50}px)`,
        }}>
          <div style={{ background: 'rgba(14,12,8,0.9)', border: '1px solid rgba(255,200,120,0.4)', borderRadius: 18, padding: '28px 44px', backdropFilter: 'blur(6px)' }}>
            <div style={{ fontFamily: '"Inter",sans-serif', fontWeight: 900, fontSize: 50, color: '#fff3e2', letterSpacing: '0.02em' }}>THE KEEPER OF THE TWO CROWNS</div>
            <div style={{ fontFamily: '"Inter",sans-serif', fontWeight: 700, fontSize: 23, color: '#f4c98a', letterSpacing: '0.14em', marginTop: 8, maxWidth: 820 }}>FOR A HUNDRED YEARS HE HELD TWO EMPTY CASES — RANKED FIRST, AND SEVEN TIMES KINGS</div>
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
    { name: 'BELGIUM', coef: 'x2.10', pts: '+2.10', flag: <FlagBEL w={86} />, hot: true },
    { name: 'EGYPT', coef: 'x3.00', pts: 'UNDERDOG', flag: <FlagEGY w={86} />, hot: true },
    { name: 'BRAZIL', coef: 'x1.20', pts: '+0.00', flag: <div style={{ width: 86, height: 57, borderRadius: 6, background: 'linear-gradient(135deg,#159b46 55%,#ffd24a 55%)' }} /> },
  ];
  return (
    <div style={{ position: 'absolute', inset: 0, background: `linear-gradient(160deg, #2a0d12 0%, #07090f 70%)` }}>
      <div style={{ position: 'absolute', inset: 0, background: `radial-gradient(ellipse at 50% 20%, rgba(239,51,64,0.30) 0%, transparent 60%)` }} />
      <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 40, opacity: inP }}>
        <Kicker color="#f0b8bd" size={30}>The Prediction Game</Kicker>
        <BigTitle size={100} color="#fff" glow={MV.bel}>worldcup26.world</BigTitle>
        <div style={{ fontFamily: '"Inter",sans-serif', fontWeight: 700, fontSize: 36, color: '#e9cfd2', letterSpacing: '0.04em' }}>
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
          FREE TO PLAY · LIVE PRIZE POOL · UNDERDOGS PAY TRIPLE
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
      <PitchBackdrop tint="#1a1010" dim={0.55} />
      <AmbientParticles start={S} dur={10} count={28} color="239,51,64" />
      <div style={{ position: 'absolute', inset: 0, zIndex: 23, background: 'radial-gradient(ellipse at 50% 35%, transparent 0%, rgba(7,9,15,0.88) 75%)' }} />
      <div style={{ position: 'absolute', top: 200, left: 0, right: 0, textAlign: 'center', zIndex: 25, opacity: inP }}>
        <Kicker size={30} color={MV.bel}>The legends are only beginning</Kicker>
        <div style={{ marginTop: 24 }}><TitleReveal text="JOIN THE LEGENDS" start={S + 0.5} size={86} color={MV.text} /></div>
      </div>
      <div style={{ position: 'absolute', inset: 0, zIndex: 26 }}>
        <CtaButton start={S} delay={1.2} label="SUBSCRIBE" icon="🔔" accent="#ef3340" x={500} />
        <CtaButton start={S} delay={1.6} label="LIKE" icon="👍" accent="#c8102e" x={960} />
        <CtaButton start={S} delay={2.0} label="SHARE" icon="📣" accent="#c9942e" x={1400} />
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
        <span style={{ fontFamily: '"Inter",sans-serif', fontWeight: 900, fontSize: 30, color: MV.belGold }}>THE LAST DANCE · worldcup26.world</span>
      </div>
    </div>
  );
}
