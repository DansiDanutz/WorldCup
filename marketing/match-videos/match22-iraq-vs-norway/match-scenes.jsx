// match-scenes.jsx — the scenes of the Match 22 video (300s timeline).
// Scene windows must match the SCENES table in match.html and narration.json.
// IMAGE-BASED: Ken-Burns motion on still PNGs. SOCCER ONLY — round-neck shirts,
// a pitch with goals, never gridiron. REAL-RESULTS-ONLY: the 1-1 is OUR PREDICTION.
// HOOK = MYSTERY + HISTORY: Iraq's verified 2007 AFC Asian Cup triumph as a
// war-torn nation (Sunni/Shia/Kurd as one team; Younis Mahmoud's header beat
// Saudi Arabia 1-0; coach Jorvan Vieira) — handled respectfully. Norway are back
// at a World Cup for the first time since 1998, led by Haaland & Odegaard.
// FlagCIV = Iraq, FlagECU = Norway (aliased FlagIRQ / FlagNOR). MV.civ = Iraq green,
// MV.ecu = Norway red. NOTE: nested <Sprite> windows are GLOBAL seconds.

// ── 1. Cold open (0–16): the 2007 war-torn triumph — "they made a nation forget" ─
function SceneColdOpen() {
  const { localTime: lt } = useSprite();
  const beat = Math.pow(Math.max(0, Math.sin(lt * Math.PI * 1.1)), 8);
  const line1P = Easing.easeOutCubic(clamp((lt - 1.2) / 1.4, 0, 1)) * (lt > 10.5 ? Math.max(0, (12.0 - lt) / 1.5) : 1);
  const titleP = Easing.easeOutCubic(clamp((lt - 12.3) / 1.4, 0, 1));
  return (
    <div style={{ position: 'absolute', inset: 0, background: '#000' }}>
      <KenBurns src="assets/player-iqbal.png" start={0} dur={16} from={1.18} to={1.32} panY={-30}
        dim={0.5} style={{ filter: 'brightness(0.42) contrast(1.18) saturate(1.05) grayscale(0.35)' }} />
      {/* ember base in Iraq green so the screen never reads as dead air */}
      <div style={{ position: 'absolute', inset: 0, background: `radial-gradient(ellipse at 50% 78%, rgba(0,122,61,0.18) 0%, transparent 55%)` }} />
      <div style={{ position: 'absolute', inset: 0, background: `radial-gradient(ellipse at center, rgba(0,166,79,${(0.5 * beat).toFixed(3)}) 0%, transparent 62%)` }} />
      {line1P > 0.01 && (
        <div style={{
          position: 'absolute', left: 160, right: 160, bottom: 200, textAlign: 'center', zIndex: 22,
          opacity: line1P,
          fontFamily: '"Inter",sans-serif', fontWeight: 800, fontSize: 46, color: '#e7f3ea',
          letterSpacing: '0.04em', lineHeight: 1.25, textShadow: '0 4px 22px rgba(0,0,0,0.9)',
        }}>A country torn apart by war sent eleven men to play football — and made an entire nation forget the fighting.</div>
      )}
      <Vignette strength={0.85} />
      {lt > 12.3 && (
        <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 30, opacity: titleP, zIndex: 22 }}>
          <Kicker size={32} color="#e7f3ea">A true story</Kicker>
          <TitleReveal text="ONE TEAM, ONE FLAG" start={12.4} size={104} color={MV.civ} />
        </div>
      )}
      <Letterbox />
    </div>
  );
}

// ── 2. Recap + title card (16–30) ────────────────────────────────────────────
function SceneTitle() {
  const { localTime: lt } = useSprite();
  // first ~8s carries the Ep21 recap line, then the Ep22 title settles
  const recapP = Easing.easeOutCubic(clamp(lt / 0.9, 0, 1)) * Math.max(0, Math.min(1, (8.5 - lt) / 1.0));
  const p1 = Easing.easeOutCubic(clamp((lt - 8.0) / 1.0, 0, 1));
  const p2 = Easing.easeOutBack(clamp((lt - 8.6) / 1.0, 0, 1));
  const p3 = Easing.easeOutCubic(clamp((lt - 9.4) / 0.9, 0, 1));
  return (
    <div style={{ position: 'absolute', inset: 0, background: `linear-gradient(180deg, #0a0f1c 0%, #11182b 55%, #0a0f1c 100%)` }}>
      <div style={{ position: 'absolute', inset: 0, background: `radial-gradient(ellipse at 50% 30%, rgba(0,122,61,0.10) 0%, transparent 55%)` }} />
      <AmbientParticles start={16} dur={14} count={34} color="0,166,79" />
      {/* RECAP — OUR PREDICTION from Ep21 (never stated as a real result) */}
      {recapP > 0.01 && (
        <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 22, opacity: recapP }}>
          <Kicker size={26} color={MV.muted}>Last time · our prediction</Kicker>
          <BigTitle size={62} color={MV.text} glow={MV.gold} style={{ maxWidth: 1500 }}>FRANCE 2 — 1 SENEGAL</BigTitle>
          <div style={{ fontFamily: '"Inter",sans-serif', fontWeight: 600, fontSize: 30, color: MV.muted, letterSpacing: '0.06em' }}>We predicted France would edge the Lions of Teranga</div>
        </div>
      )}
      {/* TITLE CARD */}
      {lt >= 7.5 && (
        <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 40 }}>
          <div style={{ opacity: p1, transform: `translateY(${(1 - p1) * -30}px)` }}>
            <Kicker color={MV.civ}>WorldCup26 Legends · Episode 22</Kicker>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 70, opacity: clamp(p2, 0, 1), transform: `scale(${p2})` }}>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 20 }}>
              <Waving><FlagCIV w={230} /></Waving>
              <BigTitle size={62} glow={MV.civ}>IRAQ</BigTitle>
            </div>
            <BigTitle size={120} color={MV.gold}>VS</BigTitle>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 20 }}>
              <Waving speed={1.9}><FlagECU w={230} /></Waving>
              <BigTitle size={62} glow={MV.ecu}>NORWAY</BigTitle>
            </div>
          </div>
          <div style={{ opacity: p3, transform: `translateY(${(1 - p3) * 26}px)`, fontFamily: '"Inter",sans-serif', fontWeight: 600, fontSize: 32, color: MV.muted, letterSpacing: '0.08em' }}>
            GROUP I · THE LIONS OF MESOPOTAMIA AGAINST THE VIKINGS
          </div>
        </div>
      )}
      <Letterbox />
    </div>
  );
}

// ── 3. Tease (30–50): "the most powerful story in football" ──────────────────
function SceneTease() {
  const { localTime: lt } = useSprite();
  const a = Easing.easeOutCubic(clamp((lt - 0.4) / 1.0, 0, 1));
  // second beat (~lt 11): "the story of this shirt is coming"
  const b = Easing.easeOutBack(clamp((lt - 10.5) / 1.0, 0, 1)) * Math.max(0, Math.min(1, (20.0 - lt) / 1.0));
  return (
    <div style={{ position: 'absolute', inset: 0, background: '#05060a' }}>
      <PitchBackdrop tint="#0a3a1e" dim={0.25} />
      <Vignette strength={0.5} />
      <AmbientParticles start={30} dur={20} count={26} color="255,255,255" />
      <div style={{ position: 'absolute', top: 200, left: 0, right: 0, textAlign: 'center', zIndex: 25, opacity: a, transform: `translateY(${(1 - a) * 24}px)` }}>
        <Kicker size={28} color={MV.civ}>Survivors of war · sons of the north</Kicker>
        <div style={{ fontFamily: '"Inter",sans-serif', fontWeight: 900, fontSize: 72, color: MV.text, letterSpacing: '0.03em', marginTop: 18, textShadow: '0 4px 22px rgba(0,0,0,0.85)' }}>
          THE MOST POWERFUL STORY IN FOOTBALL
        </div>
      </div>
      {b > 0.01 && (
        <div style={{ position: 'absolute', left: 0, right: 0, bottom: 210, display: 'flex', justifyContent: 'center', zIndex: 26, opacity: clamp(b, 0, 1), transform: `scale(${0.9 + 0.1 * clamp(b,0,1)})` }}>
          <div style={{ background: MV.panel, border: `1px solid ${MV.line}`, borderRadius: 999, padding: '20px 52px', display: 'flex', alignItems: 'center', gap: 18 }}>
            <span style={{ fontSize: 30 }}>⚽</span>
            <span style={{ fontFamily: '"Inter",sans-serif', fontWeight: 800, fontSize: 34, color: MV.gold, letterSpacing: '0.04em' }}>It's true — and it's coming</span>
          </div>
        </div>
      )}
      <Letterbox />
    </div>
  );
}

// ── 4. History (50–122): Iraq's true 2007 AFC Asian Cup triumph ──────────────
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
        boxShadow: '0 30px 110px rgba(0,0,0,0.65)', backdropFilter: 'blur(4px)', maxWidth: 1200,
      }}>
        <div style={{ fontFamily: '"Inter",sans-serif', fontWeight: 800, fontSize: 30, color: MV.muted, letterSpacing: '0.30em' }}>{venue}</div>
        <div style={{ fontFamily: '"Inter",sans-serif', fontWeight: 900, fontSize: 104, color: accent, lineHeight: 1.05, margin: '14px 0 6px', textShadow: `0 0 60px ${accent}44` }}>{score}</div>
        <div style={{ fontFamily: '"Inter",sans-serif', fontWeight: 800, fontSize: 44, color: MV.text, letterSpacing: '0.06em' }}>{year}</div>
        {note && <div style={{ fontFamily: '"Inter",sans-serif', fontWeight: 600, fontSize: 27, color: MV.muted, marginTop: 14, maxWidth: 900 }}>{note}</div>}
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
  const S = 50.0;
  const DUR = 72.0;
  return (
    <div style={{ position: 'absolute', inset: 0, background: '#05060a' }}>
      <KenBurns src="assets/player-hussein.png" start={S} dur={DUR} from={1.1} to={1.24} panX={-20}
        dim={0.72} style={{ filter: 'brightness(0.26) saturate(0.7) contrast(1.1) grayscale(0.2)' }} />
      <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse at center, transparent 30%, rgba(5,6,10,0.82) 100%)' }} />
      <AmbientParticles start={S} dur={DUR} count={28} color="0,166,79" maxR={4} />
      {/* chapter header */}
      <div style={{ position: 'absolute', top: 116, left: 0, right: 0, textAlign: 'center', zIndex: 26 }}>
        <Kicker size={28} color={MV.civ}>Chapter One · The True History</Kicker>
        <div style={{ fontFamily: '"Inter",sans-serif', fontWeight: 900, fontSize: 52, color: MV.text, letterSpacing: '0.04em', marginTop: 16, textShadow: '0 4px 22px rgba(0,0,0,0.8)' }}>
          WHAT THIS SHIRT CARRIES
        </div>
      </div>
      {/* flag, always present */}
      <div style={{ position: 'absolute', bottom: 124, left: 0, right: 0, display: 'flex', justifyContent: 'center', zIndex: 26, opacity: 0.95 }}>
        <FlagCIV w={120} />
      </div>
      {/* beats synced to narration (50, 59, 68, 86, 94, 103, 112) */}
      <HistoryPlate start={S + 0.4}  end={S + 8.6}  year="29 JULY 2007 · JAKARTA" venue="THE AFC ASIAN CUP FINAL" score="THE FINAL" note="A nation at war sent a team to Asia's biggest stage. Nobody gave them a chance." accent={MV.gold} />
      <HistoryPlate start={S + 8.6}  end={S + 26.6} year="ONE DRESSING ROOM" venue="BACK HOME · WAR, BOMBS, CHECKPOINTS" score="SUNNI · SHIA · KURD" note="A country split three ways. But the team was all three — together, playing for one flag." accent={MV.civ} />
      <HistoryPlate start={S + 26.6} end={S + 35.6} year="ONLY TWO MONTHS IN CHARGE" venue="COACH · JORVAN VIEIRA (BRAZIL)" score="THE OUTSIDERS" note="A Brazilian coach, barely settled. A squad nobody expected to last a week." accent={MV.text} />
      <HistoryPlate start={S + 35.6} end={S + 52.6} year="THE 72ND MINUTE" venue="FINAL · IRAQ vs SAUDI ARABIA" score="1 — 0" note="A corner swings in. Captain Younis Mahmoud rises above everyone — and heads it home." accent={MV.civGreen} stamp="CHAMPIONS" />
      <HistoryPlate start={S + 52.6} end={S + 62.6} year="CHAMPIONS OF ASIA" venue="THE GREATEST DAY IN IRAQI FOOTBALL" score="A NATION, NO.1" note="The best team on the continent — from a country the world had written off." accent={MV.gold} />
      <HistoryPlate start={S + 62.6} end={S + 72.0} year="THEY DANCED ANYWAY" venue="AND THEY HAD TO" score="JOY WITH A WOUND" note="Bombs struck the celebrating crowds. The people poured into the streets — and danced anyway. That is what this shirt carries." accent={MV.civ} />
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

// ── 5. Iraq (122–165): Lions of Mesopotamia ──────────────────────────────────
function SceneIraq() {
  const { localTime: lt } = useSprite();
  const S = 122.0;
  const headerP = Easing.easeOutCubic(clamp(lt / 0.9, 0, 1));
  return (
    <div style={{ position: 'absolute', inset: 0, background: '#0a0c14' }}>
      <PitchBackdrop tint="#0a3a1e" dim={0.4} />
      <div style={{ position: 'absolute', inset: 0, zIndex: 22, pointerEvents: 'none', background: `linear-gradient(90deg, rgba(0,122,61,0.22) 0%, transparent 30%, transparent 70%, rgba(0,166,79,0.16) 100%)` }} />
      <div style={{ position: 'absolute', top: 108, left: 0, right: 0, display: 'flex', justifyContent: 'center', zIndex: 26, opacity: headerP, transform: `translateY(${(1 - headerP) * -24}px)` }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 26, background: MV.panel, border: `1px solid ${MV.line}`, borderRadius: 999, padding: '16px 44px' }}>
          <FlagCIV w={74} />
          <span style={{ fontFamily: '"Inter",sans-serif', fontWeight: 900, fontSize: 40, color: MV.text, letterSpacing: '0.10em' }}>THE LIONS OF MESOPOTAMIA</span>
        </div>
      </div>
      <SquadGrid start={S + 0.4} end={S + 9.0} accent={MV.civ} players={[
        { img: 'assets/squad/irq-1-Iqbal.png',   name: 'ZIDANE IQBAL',   role: 'THE BRAIN' },
        { img: 'assets/squad/irq-2-Hussein.png', name: 'AYMEN HUSSEIN',  role: 'THE STRIKER' },
        { img: 'assets/squad/irq-3-Hamadi.png',  name: 'ALI AL-HAMADI',  role: 'THE FINISHER' },
        { img: 'assets/squad/irq-4-Ammari.png',  name: 'AMIR AL-AMMARI', role: 'THE ENGINE' },
        { img: 'assets/squad/irq-5-Sulaka.png',  name: 'REBIN SULAKA',   role: 'THE WALL' },
      ]} />
      {/* line beats: 138 Iqbal, 147 Hussein/Hamadi, 156 Ammari/Sulaka */}
      <Sprite start={138.0} end={147.0}>
        <KenBurns src="assets/player-iqbal.png" start={138} dur={9} from={1.04} to={1.14} dim={0.18} style={{ zIndex: 10 }} />
        <LowerThird start={138.4} name="ZIDANE IQBAL" role="Midfield · The Brain" line="Named after Zinedine Zidane. Once at Manchester United — now the heartbeat of Iraq." accent={MV.civ} />
      </Sprite>
      <Sprite start={147.0} end={156.0}>
        <KenBurns src="assets/player-hussein.png" start={147} dur={9} from={1.04} to={1.16} panX={20} dim={0.18} style={{ zIndex: 10 }} />
        <LowerThird start={147.4} name="HUSSEIN · AL-HAMADI" role="The Attack" line="Strikers who fight for every ball — exactly as the shirt demands." accent={MV.civ} />
      </Sprite>
      <Sprite start={156.0} end={165.0}>
        <KenBurns src="assets/player-sulaka.png" start={156} dur={9} from={1.04} to={1.14} dim={0.18} style={{ zIndex: 10 }} />
        <LowerThird start={156.3} name="AL-AMMARI · SULAKA" role="Spine · Underdogs" line="Driving from deep, holding the wall. Underdogs — and proud of it." accent={MV.civGreen} />
      </Sprite>
      <Vignette strength={0.42} />
      <Letterbox />
    </div>
  );
}

// ── 6. Norway (165–206): the Vikings, back after 28 years ────────────────────
function SceneNorway() {
  const { localTime: lt } = useSprite();
  const S = 165.0;
  const headerP = Easing.easeOutCubic(clamp(lt / 0.9, 0, 1));
  return (
    <div style={{ position: 'absolute', inset: 0, background: '#0a0c14' }}>
      <PitchBackdrop tint="#0a1838" dim={0.4} />
      <div style={{ position: 'absolute', inset: 0, zIndex: 22, pointerEvents: 'none', background: `linear-gradient(90deg, rgba(186,12,47,0.24) 0%, transparent 30%, transparent 70%, rgba(0,32,91,0.20) 100%)` }} />
      <div style={{ position: 'absolute', top: 108, left: 0, right: 0, display: 'flex', justifyContent: 'center', zIndex: 26, opacity: headerP, transform: `translateY(${(1 - headerP) * -24}px)` }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 26, background: MV.panel, border: `1px solid ${MV.line}`, borderRadius: 999, padding: '16px 44px' }}>
          <FlagECU w={74} />
          <span style={{ fontFamily: '"Inter",sans-serif', fontWeight: 900, fontSize: 40, color: MV.text, letterSpacing: '0.10em' }}>THE VIKINGS · BACK AFTER 28 YEARS</span>
        </div>
      </div>
      <SquadGrid start={S + 0.4} end={S + 11.0} accent={MV.ecu} players={[
        { img: 'assets/squad/nor-1-Haaland.png',  name: 'ERLING HAALAND',  role: 'THE MACHINE' },
        { img: 'assets/squad/nor-2-Odegaard.png', name: 'MARTIN ØDEGAARD', role: 'THE CAPTAIN' },
        { img: 'assets/squad/nor-3-Sorloth.png',  name: 'A. SØRLOTH',      role: 'THE TARGET' },
        { img: 'assets/squad/nor-4-Nusa.png',     name: 'ANTONIO NUSA',    role: 'THE SPARK' },
        { img: 'assets/squad/nor-5-Berge.png',    name: 'SANDER BERGE',    role: 'THE METRONOME' },
      ]} />
      {/* line beats: 179 Haaland, 188 Odegaard, 197 golden generation */}
      <Sprite start={179.0} end={188.0}>
        <KenBurns src="assets/player-haaland.png" start={179} dur={9} from={1.04} to={1.14} dim={0.2} style={{ zIndex: 10 }} />
        <LowerThird start={179.3} name="ERLING HAALAND" role="Striker · The Machine" line="Norway's all-time top scorer at 25. Sixteen goals in qualifying alone." accent={MV.ecu} />
      </Sprite>
      <Sprite start={188.0} end={197.0}>
        <KenBurns src="assets/player-odegaard.png" start={188} dur={9} from={1.04} to={1.16} panX={-20} dim={0.2} style={{ zIndex: 10 }} />
        <LowerThird start={188.3} name="MARTIN ØDEGAARD" role="Captain · Playmaker" line="All silk and vision — the one who sets the machine running." accent={MV.ecu} />
      </Sprite>
      <Sprite start={197.0} end={206.0}>
        <KenBurns src="assets/player-sorloth.png" start={197} dur={9} from={1.04} to={1.14} dim={0.2} style={{ zIndex: 10 }} />
        <LowerThird start={197.3} name="SØRLOTH · NUSA · BERGE" role="A Golden Generation" line="They beat Italy home and away to get here. This is Norway's best team in a generation." accent={MV.norNavy} />
      </Sprite>
      <Vignette strength={0.42} />
      <Letterbox />
    </div>
  );
}

// ── 7. The duel (206–222): heart vs power ────────────────────────────────────
function SceneDuel() {
  const { localTime: lt } = useSprite();
  const slideP = Easing.easeOutQuart(clamp(lt / 1.1, 0, 1));
  const vsP = Easing.easeOutBack(clamp((lt - 0.9) / 0.8, 0, 1));
  const shake = lt > 0.9 && lt < 1.25 ? Math.sin(lt * 160) * 7 * (1.25 - lt) / 0.35 : 0;
  return (
    <div style={{ position: 'absolute', inset: 0, background: '#05060a', transform: `translate(${shake}px, ${-shake}px)` }}>
      <div style={{ position: 'absolute', top: 0, bottom: 0, left: 0, width: '50%', overflow: 'hidden', transform: `translateX(${(1 - slideP) * -100}%)` }}>
        <img src="assets/player-hussein.png" alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', filter: 'saturate(1.15) brightness(0.92)' }} />
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(90deg, rgba(0,122,61,0.34), transparent 65%)' }} />
        <div style={{ position: 'absolute', bottom: 150, left: 90, fontFamily: '"Inter",sans-serif', fontWeight: 900, fontSize: 58, color: '#fff', textShadow: '0 4px 26px rgba(0,0,0,0.9)' }}>
          THE HEART
          <div style={{ fontSize: 27, fontWeight: 700, color: MV.gold, letterSpacing: '0.2em', marginTop: 8 }}>IRAQ · THE SURVIVORS</div>
        </div>
      </div>
      <div style={{ position: 'absolute', top: 0, bottom: 0, right: 0, width: '50%', overflow: 'hidden', transform: `translateX(${(1 - slideP) * 100}%)` }}>
        <img src="assets/player-haaland.png" alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', filter: 'saturate(1.15) brightness(0.92)' }} />
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(270deg, rgba(186,12,47,0.42), transparent 65%)' }} />
        <div style={{ position: 'absolute', bottom: 150, right: 90, textAlign: 'right', fontFamily: '"Inter",sans-serif', fontWeight: 900, fontSize: 58, color: '#fff', textShadow: '0 4px 26px rgba(0,0,0,0.9)' }}>
          THE POWER
          <div style={{ fontSize: 27, fontWeight: 700, color: MV.gold, letterSpacing: '0.2em', marginTop: 8 }}>NORWAY · THE STORM</div>
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
      <Sprite start={216.5} end={222.0}>
        <div style={{ position: 'absolute', left: 0, right: 0, bottom: 0, top: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 27, background: 'rgba(0,0,0,0.55)' }}>
          <BigTitle size={70} color={MV.text} style={{ maxWidth: 1400 }}>
            Our prediction — built on a nation that knows how to fight, and a striker who never stops. Watch.
          </BigTitle>
        </div>
      </Sprite>
      <Letterbox />
    </div>
  );
}

// ── 8. Match drama + verdict (222–262): OUR PREDICTION 1-1 ───────────────────
// Odegaard → Haaland (1-0, ~222.5). Iraq answer: Iqbal → Hussein (1-1, ~241.5).
// Full-time card = OUR PREDICTION. Closes with the do-you-agree LIONS / VIKINGS.
function SceneDrama() {
  const { localTime: lt } = useSprite();
  const S = 222.0;
  return (
    <div style={{ position: 'absolute', inset: 0, background: '#000' }}>
      <KenBurns src="assets/player-haaland.png" start={S} dur={20} from={1.1} to={1.28} panX={-30} dim={0.18} />
      <Sprite start={241} end={252}>
        <KenBurns src="assets/player-hussein.png" start={241} dur={11} from={1.08} to={1.24} panX={20} dim={0.16} />
      </Sprite>
      {/* OUR PREDICTION watermark — REAL-RESULTS-ONLY rule */}
      <div style={{ position: 'absolute', top: 116, left: 0, right: 0, textAlign: 'center', zIndex: 25 }}>
        <Kicker size={24} color={MV.gold}>Our Prediction · Our Story</Kicker>
      </div>

      <Sprite start={222.0} end={223.0}>
        <ScoreBug start={S + 0.2} civ={0} ecu={0} minute="1st half" />
      </Sprite>
      <GoalFlash at={S + 0.6} color={MV.ecu} />
      <Confetti start={S + 0.8} dur={11} colors={[MV.ecu, '#fff', MV.norNavy, MV.gold]} />
      <Sprite start={223.0} end={241.0}>
        <ScoreBug start={S + 1.0} civ={0} ecu={1} minute="HAALAND" />
      </Sprite>
      <GoalFlash at={S + 19.5} color={MV.civ} />
      <Confetti start={S + 19.7} dur={11} colors={[MV.civ, '#fff', MV.civGreen, MV.gold]} />
      <Sprite start={241.0} end={250.0}>
        <ScoreBug start={S + 19.5} civ={1} ecu={1} minute="HUSSEIN" />
      </Sprite>

      <Sprite start={250.0} end={262.0}>
        <FullTimeCard start={S + 28.0} />
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
  const tagP = Easing.easeOutBack(clamp((local - 3.0) / 0.8, 0, 1));
  return (
    <div style={{ position: 'absolute', inset: 0, zIndex: 26, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 30, background: 'rgba(2,3,6,0.62)', opacity: p }}>
      <div style={{ background: MV.panel, border: `1px solid ${MV.line}`, borderRadius: 26, padding: '46px 100px', textAlign: 'center', transform: `scale(${0.92 + 0.08 * p})`, boxShadow: '0 30px 120px rgba(0,0,0,0.7)' }}>
        <Kicker size={26} color={MV.gold}>Our Prediction · Full Time</Kicker>
        <div style={{ display: 'flex', alignItems: 'center', gap: 56, marginTop: 30 }}>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16 }}>
            <FlagCIV w={150} />
            <span style={{ fontFamily: '"Inter",sans-serif', fontWeight: 800, fontSize: 34, color: MV.text }}>IRAQ</span>
          </div>
          <BigTitle size={150} color={MV.gold}>1 — 1</BigTitle>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16 }}>
            <FlagECU w={150} />
            <span style={{ fontFamily: '"Inter",sans-serif', fontWeight: 800, fontSize: 34, color: MV.text }}>NORWAY</span>
          </div>
        </div>
        <div style={{ fontFamily: '"Inter",sans-serif', fontWeight: 600, fontSize: 30, color: MV.muted, marginTop: 28, maxWidth: 980 }}>
          Haaland strikes, Hussein answers — the storm could not break the heart.
        </div>
      </div>
      {/* do-you-agree verdict folded in (narration line ~250) */}
      {tagP > 0 && (
        <div style={{ display: 'flex', gap: 36, opacity: clamp(tagP, 0, 1), transform: `translateY(${(1 - tagP) * 30}px)` }}>
          <div style={{ background: 'rgba(0,122,61,0.16)', border: `2px solid ${MV.civ}`, borderRadius: 18, padding: '20px 44px', textAlign: 'center' }}>
            <div style={{ fontFamily: '"Inter",sans-serif', fontWeight: 900, fontSize: 44, color: MV.civ, letterSpacing: '0.06em' }}>“LIONS”</div>
            <div style={{ fontFamily: '"Inter",sans-serif', fontWeight: 600, fontSize: 22, color: MV.muted, marginTop: 8 }}>if Iraq's heart wins it</div>
          </div>
          <div style={{ background: 'rgba(186,12,47,0.18)', border: `2px solid ${MV.ecu}`, borderRadius: 18, padding: '20px 44px', textAlign: 'center' }}>
            <div style={{ fontFamily: '"Inter",sans-serif', fontWeight: 900, fontSize: 44, color: MV.ecu, letterSpacing: '0.06em' }}>“VIKINGS”</div>
            <div style={{ fontFamily: '"Inter",sans-serif', fontWeight: 600, fontSize: 22, color: MV.muted, marginTop: 8 }}>if Norway's power is too much</div>
          </div>
        </div>
      )}
    </div>
  );
}

// ── 9. Mystery Supporter (262–280): Legend 022 — the Standard-Bearer ─────────
function SceneMystery() {
  const { localTime: lt } = useSprite();
  const S = 262.0;
  const DUR = 18.0;
  const inP = Easing.easeOutCubic(clamp((lt - 0.6) / 1.4, 0, 1));
  const plateP = Easing.easeOutBack(clamp((lt - 4.2) / 0.9, 0, 1));
  return (
    <div style={{ position: 'absolute', inset: 0, background: '#02030a' }}>
      <KenBurns src="assets/player-iqbal.png" start={S} dur={DUR} from={1.16} to={1.3} panY={-20}
        dim={0.32} style={{ filter: 'brightness(0.4) contrast(1.1) saturate(1.0) grayscale(0.3)' }} />
      <div style={{
        position: 'absolute', inset: 0, zIndex: 21, pointerEvents: 'none', opacity: 0.5,
        background: `radial-gradient(ellipse at ${20 + Math.sin(lt * 0.3) * 14}% 75%, rgba(0,166,79,0.16) 0%, transparent 45%),` +
                    `radial-gradient(ellipse at ${78 - Math.sin(lt * 0.22) * 12}% 30%, rgba(255,255,255,0.10) 0%, transparent 50%)`,
      }} />
      <AmbientParticles start={S} dur={DUR} count={46} color="220,235,225" maxR={3.5} zIndex={22} />
      <div style={{ position: 'absolute', top: 118, left: 0, right: 0, textAlign: 'center', zIndex: 25, opacity: inP }}>
        <Kicker size={26} color="#bfe6cf">The Mystery Supporter · Legend No. 022</Kicker>
      </div>
      {plateP > 0 && (
        <div style={{
          position: 'absolute', left: 110, bottom: 150, zIndex: 25,
          opacity: clamp(plateP, 0, 1), transform: `translateY(${(1 - plateP) * 50}px)`,
        }}>
          <div style={{ background: 'rgba(8,14,11,0.9)', border: '1px solid rgba(0,166,79,0.4)', borderRadius: 18, padding: '28px 44px', backdropFilter: 'blur(6px)' }}>
            <div style={{ fontFamily: '"Inter",sans-serif', fontWeight: 900, fontSize: 54, color: '#eafff1', letterSpacing: '0.02em' }}>THE STANDARD-BEARER</div>
            <div style={{ fontFamily: '"Inter",sans-serif', fontWeight: 700, fontSize: 24, color: '#bfe6cf', letterSpacing: '0.14em', marginTop: 8, maxWidth: 780 }}>HE CARRIES THE FLAG THOSE PLAYERS RAISED IN 2007 — THE ONE BOMBS COULD NOT LOWER</div>
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

// ── 10. App promo (280–294): worldcup26.world ────────────────────────────────
function SceneApp() {
  const { localTime: lt } = useSprite();
  const S = 280.0;
  const inP = Easing.easeOutCubic(clamp(lt / 1.0, 0, 1));
  const cards = [
    { name: 'IRAQ', coef: 'x3.00', pts: 'UNDERDOG', flag: <FlagCIV w={86} />, hot: true },
    { name: 'NORWAY', coef: 'x1.95', pts: '+1.95', flag: <FlagECU w={86} />, hot: true },
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

// ── 11. CTA outro (294–300) ──────────────────────────────────────────────────
function SceneCTA() {
  const { localTime: lt } = useSprite();
  const S = 294.0;
  const inP = Easing.easeOutCubic(clamp(lt / 0.8, 0, 1));
  return (
    <div style={{ position: 'absolute', inset: 0, background: '#07090f' }}>
      <PitchBackdrop tint="#0a3a1e" dim={0.55} />
      <AmbientParticles start={S} dur={6} count={28} color="0,166,79" />
      <div style={{ position: 'absolute', inset: 0, zIndex: 23, background: 'radial-gradient(ellipse at 50% 35%, transparent 0%, rgba(7,9,15,0.88) 75%)' }} />
      <div style={{ position: 'absolute', top: 200, left: 0, right: 0, textAlign: 'center', zIndex: 25, opacity: inP }}>
        <Kicker size={30} color={MV.civ}>The legends are only beginning</Kicker>
        <div style={{ marginTop: 24 }}><TitleReveal text="JOIN THE LEGENDS" start={S + 0.5} size={86} color={MV.text} /></div>
      </div>
      <div style={{ position: 'absolute', inset: 0, zIndex: 26 }}>
        <CtaButton start={S} delay={1.2} label="SUBSCRIBE" icon="🔔" accent="#007a3d" x={500} />
        <CtaButton start={S} delay={1.6} label="LIKE" icon="👍" accent="#00205b" x={960} />
        <CtaButton start={S} delay={2.0} label="SHARE" icon="📣" accent="#ba0c2f" x={1400} />
      </div>
      <Sprite start={298.6} end={300}>
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
        <span style={{ fontFamily: '"Inter",sans-serif', fontWeight: 900, fontSize: 30, color: MV.gold }}>🦁 THE LIONS ROAR ON · worldcup26.world</span>
      </div>
    </div>
  );
}
