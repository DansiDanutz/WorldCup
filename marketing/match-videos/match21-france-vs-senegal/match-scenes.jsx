// match-scenes.jsx — the twelve scenes of the Match 21 video (300s timeline).
// Scene windows must match the SCENES table in match.html and narration.json.
// IMAGE-BASED: Ken-Burns motion on still PNGs. SOCCER ONLY — round-neck shirts,
// a pitch with goals, never gridiron. REAL-RESULTS-ONLY: the 2-1 is OUR PREDICTION.
// NOTE: nested <Sprite> windows are GLOBAL seconds (Sprite reads the timeline clock).

// ── 1. Cold open (0–16): the 2002 Seoul shock — Senegal beat the champions ────
function SceneColdOpen() {
  const { localTime: lt } = useSprite();
  const beat = Math.pow(Math.max(0, Math.sin(lt * Math.PI * 1.1)), 8);
  const line1P = Easing.easeOutCubic(clamp((lt - 1.2) / 1.4, 0, 1)) * (lt > 10.5 ? Math.max(0, (12.0 - lt) / 1.5) : 1);
  const titleP = Easing.easeOutCubic(clamp((lt - 12.3) / 1.4, 0, 1));
  return (
    <div style={{ position: 'absolute', inset: 0, background: '#000' }}>
      {/* Mané as the face of the Lions — dark, dramatic */}
      <KenBurns src="assets/player-mane.png" start={0} dur={16} from={1.18} to={1.32} panY={-30}
        dim={0.5} style={{ filter: 'brightness(0.42) contrast(1.18) saturate(1.05) grayscale(0.3)' }} />
      {/* Senegal-green base glow so the screen never reads as dead air */}
      <div style={{ position: 'absolute', inset: 0, background: `radial-gradient(ellipse at 50% 78%, rgba(0,133,63,0.18) 0%, transparent 55%)` }} />
      {/* heartbeat glow */}
      <div style={{ position: 'absolute', inset: 0, background: `radial-gradient(ellipse at center, rgba(253,239,66,${(0.42 * beat).toFixed(3)}) 0%, transparent 62%)` }} />
      {line1P > 0.01 && (
        <div style={{
          position: 'absolute', left: 160, right: 160, bottom: 200, textAlign: 'center', zIndex: 22,
          opacity: line1P,
          fontFamily: '"Inter",sans-serif', fontWeight: 800, fontSize: 46, color: '#eafbe8',
          letterSpacing: '0.04em', lineHeight: 1.25, textShadow: '0 4px 22px rgba(0,0,0,0.9)',
        }}>The smallest team on the pitch knocked the world champions out of their own opening match.</div>
      )}
      <Vignette strength={0.85} />
      {lt > 12.3 && (
        <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 30, opacity: titleP, zIndex: 22 }}>
          <Kicker size={32} color="#eafbe8">A true story</Kicker>
          <TitleReveal text="THEY STUNNED THE WORLD" start={12.4} size={104} color={MV.senYellow} />
        </div>
      )}
      <Letterbox />
    </div>
  );
}

// ── 2. Recap + title card (16–28) ────────────────────────────────────────────
function SceneTitle() {
  const { localTime: lt } = useSprite();
  // first ~10s carries the Ep20 recap line, then the Ep21 title settles
  const recapP = Easing.easeOutCubic(clamp(lt / 0.9, 0, 1)) * Math.max(0, Math.min(1, (10.5 - lt) / 1.0));
  const p1 = Easing.easeOutCubic(clamp((lt - 10.0) / 1.0, 0, 1));
  const p2 = Easing.easeOutBack(clamp((lt - 10.6) / 1.0, 0, 1));
  const p3 = Easing.easeOutCubic(clamp((lt - 11.4) / 0.9, 0, 1));
  return (
    <div style={{ position: 'absolute', inset: 0, background: `linear-gradient(180deg, #0a0f1c 0%, #11182b 55%, #0a0f1c 100%)` }}>
      <div style={{ position: 'absolute', inset: 0, background: `radial-gradient(ellipse at 50% 30%, rgba(29,78,216,0.12) 0%, transparent 55%)` }} />
      <AmbientParticles start={16} dur={12} count={34} color="255,210,74" />
      {/* RECAP — OUR PREDICTION from Ep20 (never stated as a real result) */}
      {recapP > 0.01 && (
        <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 22, opacity: recapP }}>
          <Kicker size={26} color={MV.muted}>Last time · our prediction</Kicker>
          <BigTitle size={62} color={MV.text} glow={MV.gold} style={{ maxWidth: 1500 }}>IRAN 1 — 1 NEW ZEALAND</BigTitle>
          <div style={{ fontFamily: '"Inter",sans-serif', fontWeight: 600, fontSize: 30, color: MV.muted, letterSpacing: '0.06em' }}>Two outsiders, sharing the points</div>
        </div>
      )}
      {/* TITLE CARD */}
      {lt >= 9.5 && (
        <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 40 }}>
          <div style={{ opacity: p1, transform: `translateY(${(1 - p1) * -30}px)` }}>
            <Kicker color={MV.fra}>WorldCup26 Legends · Episode 21</Kicker>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 70, opacity: clamp(p2, 0, 1), transform: `scale(${p2})` }}>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 20 }}>
              <Waving><FlagFRA w={230} /></Waving>
              <BigTitle size={62} glow={MV.fra}>FRANCE</BigTitle>
            </div>
            <BigTitle size={120} color={MV.gold}>VS</BigTitle>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 20 }}>
              <Waving speed={1.9}><FlagSEN w={230} /></Waving>
              <BigTitle size={62} glow={MV.sen}>SENEGAL</BigTitle>
            </div>
          </div>
          <div style={{ opacity: p3, transform: `translateY(${(1 - p3) * 26}px)`, fontFamily: '"Inter",sans-serif', fontWeight: 600, fontSize: 32, color: MV.muted, letterSpacing: '0.08em' }}>
            GROUP I · THE REMATCH OF 2002 · THE EMPIRE AND THE LION
          </div>
        </div>
      )}
      <Letterbox />
    </div>
  );
}

// ── 3. Tease (28–47): the rematch + "the greatest shock football has seen" ────
function SceneTease() {
  const { localTime: lt } = useSprite();
  const a = Easing.easeOutCubic(clamp((lt - 0.4) / 1.0, 0, 1));
  // second beat (~39 global → lt ~11): "the greatest shock football has ever seen"
  const b = Easing.easeOutBack(clamp((lt - 10.5) / 1.0, 0, 1)) * Math.max(0, Math.min(1, (19.0 - lt) / 1.0));
  return (
    <div style={{ position: 'absolute', inset: 0, background: '#05060a' }}>
      <PitchBackdrop tint="#0a2e1a" dim={0.25} />
      <Vignette strength={0.5} />
      <AmbientParticles start={28} dur={19} count={26} color="253,239,66" />
      {/* the rematch headline */}
      <div style={{ position: 'absolute', top: 200, left: 0, right: 0, textAlign: 'center', zIndex: 25, opacity: a, transform: `translateY(${(1 - a) * 24}px)` }}>
        <Kicker size={28} color={MV.sen}>Met once · changed everything</Kicker>
        <div style={{ fontFamily: '"Inter",sans-serif', fontWeight: 900, fontSize: 76, color: MV.text, letterSpacing: '0.03em', marginTop: 18, textShadow: '0 4px 22px rgba(0,0,0,0.85)' }}>
          THE REMATCH
        </div>
      </div>
      {/* the tease */}
      {b > 0.01 && (
        <div style={{ position: 'absolute', left: 0, right: 0, bottom: 210, display: 'flex', justifyContent: 'center', zIndex: 26, opacity: clamp(b, 0, 1), transform: `scale(${0.9 + 0.1 * clamp(b,0,1)})` }}>
          <div style={{ background: MV.panel, border: `1px solid ${MV.line}`, borderRadius: 999, padding: '20px 52px', display: 'flex', alignItems: 'center', gap: 18 }}>
            <span style={{ fontSize: 30 }}>⚽</span>
            <span style={{ fontFamily: '"Inter",sans-serif', fontWeight: 800, fontSize: 34, color: MV.gold, letterSpacing: '0.04em' }}>One of the greatest shocks football has ever seen</span>
          </div>
        </div>
      )}
      <Letterbox />
    </div>
  );
}

// ── 4. History (47–113): the real 2002 Seoul shock + Bouba Diop tribute ───────
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
        <div style={{ fontFamily: '"Inter",sans-serif', fontWeight: 900, fontSize: 110, color: accent, lineHeight: 1.05, margin: '14px 0 6px', textShadow: `0 0 60px ${accent}44` }}>{score}</div>
        <div style={{ fontFamily: '"Inter",sans-serif', fontWeight: 800, fontSize: 44, color: MV.text, letterSpacing: '0.06em' }}>{year}</div>
        {note && <div style={{ fontFamily: '"Inter",sans-serif', fontWeight: 600, fontSize: 27, color: MV.muted, marginTop: 14, maxWidth: 880 }}>{note}</div>}
        {stamp && stampP > 0 && (
          <div style={{
            position: 'absolute', top: -34, right: -60, transform: `rotate(-12deg) scale(${stampP})`,
            border: `5px solid ${MV.sen}`, color: MV.sen, borderRadius: 14, padding: '10px 26px',
            fontFamily: '"Inter",sans-serif', fontWeight: 900, fontSize: 32, letterSpacing: '0.08em',
            background: 'rgba(7,9,15,0.85)',
          }}>{stamp}</div>
        )}
      </div>
    </div>
  );
}

function SceneHistory() {
  const S = 47.0;
  return (
    <div style={{ position: 'absolute', inset: 0, background: '#05060a' }}>
      <KenBurns src="assets/player-mane.png" start={S} dur={66} from={1.1} to={1.24} panX={-20}
        dim={0.72} style={{ filter: 'brightness(0.26) saturate(0.75) contrast(1.1) grayscale(0.18)' }} />
      <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse at center, transparent 30%, rgba(5,6,10,0.82) 100%)' }} />
      <AmbientParticles start={S} dur={66} count={28} color="253,239,66" maxR={4} />
      {/* chapter header */}
      <div style={{ position: 'absolute', top: 116, left: 0, right: 0, textAlign: 'center', zIndex: 26 }}>
        <Kicker size={28} color={MV.sen}>Chapter One · The True History</Kicker>
        <div style={{ fontFamily: '"Inter",sans-serif', fontWeight: 900, fontSize: 52, color: MV.text, letterSpacing: '0.04em', marginTop: 16, textShadow: '0 4px 22px rgba(0,0,0,0.8)' }}>
          THE NIGHT THE LIONS ROARED
        </div>
      </div>
      {/* flag, always present */}
      <div style={{ position: 'absolute', bottom: 124, left: 0, right: 0, display: 'flex', justifyContent: 'center', zIndex: 26, opacity: 0.95 }}>
        <FlagSEN w={120} />
      </div>
      {/* beats synced to narration (47, 58, 68, 78, 90, 102) */}
      <HistoryPlate start={S + 0.5}  end={S + 11.0} year="31 MAY 2002 · SEOUL" venue="THE OPENING MATCH OF THE WORLD CUP" score="THE CHAMPIONS" note="France: reigning world champions — Zidane, Henry, Vieira. Senegal: a debutant, never having played a World Cup game." accent={MV.fra} />
      <HistoryPlate start={S + 11.0} end={S + 21.0} year="HALF AN HOUR IN" venue="A CROSS · A SCRAMBLE · A FINISH" score="1 — 0" note="A giant midfielder poked it home as the French defence panicked. The debutants led the champions of the world." accent={MV.senYellow} />
      <HistoryPlate start={S + 21.0} end={S + 31.5} year="PAPA BOUBA DIOP" venue="THE GOAL · THE DANCE" score="THE DANCING LION" note="He laid his shirt on the corner flag, and the whole team danced around it — one of football's iconic celebrations." accent={MV.sen} stamp="1 — 0" />
      <HistoryPlate start={S + 31.5} end={S + 43.0} year="IT DID NOT STOP THERE" venue="SENEGAL'S RUN · 2002" score="QUARTER-FINALS" note="The debutants ran all the way to the last eight — while France went home without scoring a single goal." accent={MV.gold} />
      <HistoryPlate start={S + 43.0} end={S + 55.0} year="THE ONLY ONES TO FAIL LIKE THAT" venue="DEFENDING CHAMPIONS · 2002" score="0 GOALS" note="No defending champion before or since has been knocked out without scoring. That is the weight of this fixture." accent={MV.text} />
      <HistoryPlate start={S + 55.0} end={S + 66.0} year="IN MEMORY · 1978–2020" venue="PAPA BOUBA DIOP" score="THE DANCE NEVER DIED" note="He left us in 2020, far too young. Tonight, his shirt — and his dance — walk out again." accent={MV.sen} />
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

// ── 5. France (113–156): Les Bleus ───────────────────────────────────────────
function SceneFrance() {
  const { localTime: lt } = useSprite();
  const S = 113.0;
  const headerP = Easing.easeOutCubic(clamp(lt / 0.9, 0, 1));
  return (
    <div style={{ position: 'absolute', inset: 0, background: '#0a0c14' }}>
      <PitchBackdrop tint="#0a1f3a" dim={0.4} />
      <div style={{ position: 'absolute', inset: 0, zIndex: 22, pointerEvents: 'none', background: `linear-gradient(90deg, rgba(29,78,216,0.22) 0%, transparent 30%, transparent 70%, rgba(206,17,38,0.16) 100%)` }} />
      <div style={{ position: 'absolute', top: 108, left: 0, right: 0, display: 'flex', justifyContent: 'center', zIndex: 26, opacity: headerP, transform: `translateY(${(1 - headerP) * -24}px)` }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 26, background: MV.panel, border: `1px solid ${MV.line}`, borderRadius: 999, padding: '16px 44px' }}>
          <FlagFRA w={74} />
          <span style={{ fontFamily: '"Inter",sans-serif', fontWeight: 900, fontSize: 40, color: MV.text, letterSpacing: '0.10em' }}>LES BLEUS · WORLD CHAMPIONS</span>
        </div>
      </div>
      <SquadGrid start={S + 0.4} end={S + 9.0} accent={MV.fra} players={[
        { img: 'assets/squad/fra-1-Mbappe.png',     name: 'KYLIAN MBAPPÉ',     role: 'CAPTAIN · STRIKER' },
        { img: 'assets/squad/fra-2-Dembele.png',    name: 'OUSMANE DEMBÉLÉ',   role: 'THE WINGER' },
        { img: 'assets/squad/fra-3-Olise.png',      name: 'MICHAEL OLISE',     role: 'THE CREATOR' },
        { img: 'assets/squad/fra-4-Tchouameni.png', name: 'A. TCHOUAMÉNI',     role: 'THE SHIELD' },
        { img: 'assets/squad/fra-5-Saliba.png',     name: 'WILLIAM SALIBA',    role: 'THE WALL' },
      ]} />
      {/* line beats: 123 Mbappe, 133 Dembele/Olise, 143 Tchouameni/Saliba */}
      <Sprite start={123.0} end={133.0}>
        <KenBurns src="assets/player-mbappe.png" start={123} dur={10} from={1.04} to={1.14} dim={0.18} style={{ zIndex: 10 }} />
        <LowerThird start={123.4} name="KYLIAN MBAPPÉ" role="Captain · Striker" line="The fastest forward in the game — 38 km/h, and a finish as cold as ice." accent={MV.fra} />
      </Sprite>
      <Sprite start={133.0} end={143.0}>
        <KenBurns src="assets/player-dembele.png" start={133} dur={10} from={1.04} to={1.16} panX={20} dim={0.18} style={{ zIndex: 10 }} />
        <LowerThird start={133.4} name="DEMBÉLÉ · OLISE" role="The Attack" line="Two of the most dangerous wingers in Europe — in red, white and blue." accent={MV.fra} />
      </Sprite>
      <Sprite start={143.0} end={156.0}>
        <KenBurns src="assets/player-saliba.png" start={143} dur={13} from={1.04} to={1.14} dim={0.18} style={{ zIndex: 10 }} />
        <LowerThird start={143.3} name="TCHOUAMÉNI · SALIBA" role="The Spine" line="Tchouaméni shields the back; Saliba — a wall barely old enough to be its captain." accent={MV.fraRed} />
      </Sprite>
      <Vignette strength={0.42} />
      <Letterbox />
    </div>
  );
}

// ── 6. Senegal (156–200): the Lions of Teranga ───────────────────────────────
function SceneSenegal() {
  const { localTime: lt } = useSprite();
  const S = 156.0;
  const headerP = Easing.easeOutCubic(clamp(lt / 0.9, 0, 1));
  return (
    <div style={{ position: 'absolute', inset: 0, background: '#0a0c14' }}>
      <PitchBackdrop tint="#0a2e1a" dim={0.4} />
      <div style={{ position: 'absolute', inset: 0, zIndex: 22, pointerEvents: 'none', background: `linear-gradient(90deg, rgba(0,133,63,0.24) 0%, transparent 30%, transparent 70%, rgba(253,239,66,0.14) 100%)` }} />
      <div style={{ position: 'absolute', top: 108, left: 0, right: 0, display: 'flex', justifyContent: 'center', zIndex: 26, opacity: headerP, transform: `translateY(${(1 - headerP) * -24}px)` }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 26, background: MV.panel, border: `1px solid ${MV.line}`, borderRadius: 999, padding: '16px 44px' }}>
          <FlagSEN w={74} />
          <span style={{ fontFamily: '"Inter",sans-serif', fontWeight: 900, fontSize: 40, color: MV.text, letterSpacing: '0.10em' }}>LIONS OF TERANGA · CHAMPIONS OF AFRICA</span>
        </div>
      </div>
      <SquadGrid start={S + 0.4} end={S + 10.0} accent={MV.sen} players={[
        { img: 'assets/squad/sen-1-Mane.png',      name: 'SADIO MANÉ',       role: 'THE KING' },
        { img: 'assets/squad/sen-2-Koulibaly.png', name: 'K. KOULIBALY',     role: 'THE GENERAL' },
        { img: 'assets/squad/sen-3-Jackson.png',   name: 'NICOLAS JACKSON',  role: 'THE FINISHER' },
        { img: 'assets/squad/sen-4-Camara.png',    name: 'LAMINE CAMARA',    role: 'THE ENGINE' },
        { img: 'assets/squad/sen-5-Mendy.png',     name: 'EDOUARD MENDY',    role: 'THE KEEPER' },
      ]} />
      {/* line beats: 162 AFCON, 173 Mane, 183 Koulibaly/Camara/Mendy, 193 Jackson */}
      <Sprite start={162.0} end={173.0}>
        <KenBurns src="assets/player-mane.png" start={162} dur={11} from={1.04} to={1.14} dim={0.2} style={{ zIndex: 10 }} />
        <LowerThird start={162.3} name="AFCON CHAMPIONS · 2022" role="Their first-ever title" line="Won on penalties against Egypt — and Mané scored the winning kick." accent={MV.sen} />
      </Sprite>
      <Sprite start={173.0} end={183.0}>
        <KenBurns src="assets/player-mane.png" start={173} dur={10} from={1.06} to={1.18} panX={-20} dim={0.2} style={{ zIndex: 10 }} />
        <LowerThird start={173.3} name="SADIO MANÉ" role="The King of Teranga" line="From a tiny village in Casamance to the top of the world — Senegal's greatest-ever forward." accent={MV.senYellow} />
      </Sprite>
      <Sprite start={183.0} end={193.0}>
        <KenBurns src="assets/player-koulibaly.png" start={183} dur={10} from={1.04} to={1.16} dim={0.2} style={{ zIndex: 10 }} />
        <LowerThird start={183.3} name="KOULIBALY · CAMARA · MENDY" role="The Spine" line="A general at the back, an engine in midfield, and a giant in goal." accent={MV.sen} />
      </Sprite>
      <Sprite start={193.0} end={200.0}>
        <KenBurns src="assets/player-jackson.png" start={193} dur={7} from={1.04} to={1.14} dim={0.2} style={{ zIndex: 10 }} />
        <LowerThird start={193.3} name="NICOLAS JACKSON" role="The Finisher · Striker" line="Up top for the Lions — these are no underdogs anymore. They believe." accent={MV.senRed} />
      </Sprite>
      <Vignette strength={0.42} />
      <Letterbox />
    </div>
  );
}

// ── 7. The duel (200–220): the empire vs the lion ────────────────────────────
function SceneDuel() {
  const { localTime: lt } = useSprite();
  const slideP = Easing.easeOutQuart(clamp(lt / 1.1, 0, 1));
  const vsP = Easing.easeOutBack(clamp((lt - 0.9) / 0.8, 0, 1));
  const shake = lt > 0.9 && lt < 1.25 ? Math.sin(lt * 160) * 7 * (1.25 - lt) / 0.35 : 0;
  return (
    <div style={{ position: 'absolute', inset: 0, background: '#05060a', transform: `translate(${shake}px, ${-shake}px)` }}>
      <div style={{ position: 'absolute', top: 0, bottom: 0, left: 0, width: '50%', overflow: 'hidden', transform: `translateX(${(1 - slideP) * -100}%)` }}>
        <img src="assets/player-mbappe.png" alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', filter: 'saturate(1.15) brightness(0.92)' }} />
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(90deg, rgba(29,78,216,0.34), transparent 65%)' }} />
        <div style={{ position: 'absolute', bottom: 150, left: 90, fontFamily: '"Inter",sans-serif', fontWeight: 900, fontSize: 58, color: '#fff', textShadow: '0 4px 26px rgba(0,0,0,0.9)' }}>
          THE EMPIRE
          <div style={{ fontSize: 27, fontWeight: 700, color: MV.gold, letterSpacing: '0.2em', marginTop: 8 }}>FRANCE · THE GOLDEN MACHINE</div>
        </div>
      </div>
      <div style={{ position: 'absolute', top: 0, bottom: 0, right: 0, width: '50%', overflow: 'hidden', transform: `translateX(${(1 - slideP) * 100}%)` }}>
        <img src="assets/player-mane.png" alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', filter: 'saturate(1.15) brightness(0.92)' }} />
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(270deg, rgba(0,133,63,0.42), transparent 65%)' }} />
        <div style={{ position: 'absolute', bottom: 150, right: 90, textAlign: 'right', fontFamily: '"Inter",sans-serif', fontWeight: 900, fontSize: 58, color: '#fff', textShadow: '0 4px 26px rgba(0,0,0,0.9)' }}>
          THE LION
          <div style={{ fontSize: 27, fontWeight: 700, color: MV.gold, letterSpacing: '0.2em', marginTop: 8 }}>SENEGAL · HEIRS OF 2002</div>
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
      <Sprite start={210.0} end={220.0}>
        <div style={{ position: 'absolute', left: 0, right: 0, bottom: 0, top: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 27, background: 'rgba(0,0,0,0.55)' }}>
          <BigTitle size={68} color={MV.text} style={{ maxWidth: 1400 }}>
            Our prediction — built on French firepower, on Senegalese pride, and on a fixture that stunned the world once already. Watch.
          </BigTitle>
        </div>
      </Sprite>
      <Letterbox />
    </div>
  );
}

// ── 8. Match drama (220–263): OUR PREDICTION France 2-1 Senegal ──────────────
// Mbappe strikes (1-0, ~224.5). Jackson heads in (1-1, ~235.5). Late, Mbappe
// again (2-1, ~246.5). Full-time card = OUR PREDICTION.
function SceneDrama() {
  const { localTime: lt } = useSprite();
  const S = 220.0;
  return (
    <div style={{ position: 'absolute', inset: 0, background: '#000' }}>
      <KenBurns src="assets/player-mbappe.png" start={S} dur={15} from={1.1} to={1.26} panX={-30} dim={0.18} />
      <Sprite start={235} end={246}>
        <KenBurns src="assets/player-jackson.png" start={235} dur={11} from={1.08} to={1.2} panX={20} dim={0.16} />
      </Sprite>
      <Sprite start={246} end={258}>
        <KenBurns src="assets/player-mbappe.png" start={246} dur={12} from={1.08} to={1.22} panX={-18} dim={0.16} />
      </Sprite>
      {/* OUR PREDICTION watermark — REAL-RESULTS-ONLY rule */}
      <div style={{ position: 'absolute', top: 116, left: 0, right: 0, textAlign: 'center', zIndex: 25 }}>
        <Kicker size={24} color={MV.gold}>Our Prediction · Our Story</Kicker>
      </div>

      <Sprite start={220.0} end={224.5}>
        <ScoreBug start={S + 0.4} fra={0} sen={0} minute="1st half" />
      </Sprite>
      {/* GOAL 1 — Mbappe 1-0 */}
      <GoalFlash at={S + 4.5} color={MV.fra} />
      <Confetti start={S + 4.7} dur={11} colors={[MV.fra, '#fff', MV.fraRed, MV.gold]} />
      <Sprite start={224.5} end={235}>
        <ScoreBug start={S + 4.5} fra={1} sen={0} minute="MBAPPÉ" />
      </Sprite>
      {/* GOAL 2 — Jackson 1-1 */}
      <GoalFlash at={S + 15.5} color={MV.sen} />
      <Confetti start={S + 15.7} dur={10} colors={[MV.sen, MV.senYellow, '#fff', MV.senRed]} />
      <Sprite start={235} end={246}>
        <ScoreBug start={S + 15.5} fra={1} sen={1} minute="JACKSON" />
      </Sprite>
      {/* GOAL 3 — Mbappe 2-1 (late) */}
      <GoalFlash at={S + 26.5} color={MV.fra} />
      <Confetti start={S + 26.7} dur={12} colors={[MV.fra, '#fff', MV.fraRed, MV.gold]} />
      <Sprite start={246} end={258}>
        <ScoreBug start={S + 26.5} fra={2} sen={1} minute="MBAPPÉ" />
      </Sprite>

      <Sprite start={258} end={263.0}>
        <FullTimeCard start={S + 38.0} />
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
            <FlagFRA w={150} />
            <span style={{ fontFamily: '"Inter",sans-serif', fontWeight: 800, fontSize: 34, color: MV.text }}>FRANCE</span>
          </div>
          <BigTitle size={170} color={MV.gold}>2 — 1</BigTitle>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16 }}>
            <FlagSEN w={150} />
            <span style={{ fontFamily: '"Inter",sans-serif', fontWeight: 800, fontSize: 34, color: MV.text }}>SENEGAL</span>
          </div>
        </div>
        <div style={{ fontFamily: '"Inter",sans-serif', fontWeight: 600, fontSize: 30, color: MV.muted, marginTop: 34, maxWidth: 1000 }}>
          Mbappé twice, Jackson answers — the empire holds on, the lion roars to the very end.
        </div>
      </div>
    </div>
  );
}

// ── 9. Verdict (263–271): do you agree? LES BLEUS / LIONS ────────────────────
function SceneVerdict() {
  const { localTime: lt } = useSprite();
  const S = 263.0;
  const headP = Easing.easeOutCubic(clamp(lt / 0.8, 0, 1));
  const a = Easing.easeOutBack(clamp((lt - 1.0) / 0.7, 0, 1));
  const b = Easing.easeOutBack(clamp((lt - 1.4) / 0.7, 0, 1));
  return (
    <div style={{ position: 'absolute', inset: 0, background: '#0a0f1c' }}>
      <PitchBackdrop tint="#0a1f24" dim={0.45} />
      <div style={{ position: 'absolute', top: 150, left: 0, right: 0, textAlign: 'center', zIndex: 25, opacity: headP }}>
        <Kicker size={30} color={MV.text}>The empire held — or did the lion roar?</Kicker>
        <div style={{ fontFamily: '"Inter",sans-serif', fontWeight: 900, fontSize: 72, color: MV.gold, marginTop: 18, letterSpacing: '0.04em' }}>DO YOU AGREE?</div>
      </div>
      <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 70, zIndex: 26, marginTop: 60 }}>
        <div style={{ opacity: clamp(a, 0, 1), transform: `translateY(${(1 - a) * 50}px) scale(${0.85 + 0.15 * a})`, background: 'rgba(29,78,216,0.14)', border: `2px solid ${MV.fra}`, borderRadius: 22, padding: '34px 60px', textAlign: 'center', minWidth: 420 }}>
          <div style={{ fontFamily: '"Inter",sans-serif', fontWeight: 900, fontSize: 52, color: '#7da2ff', letterSpacing: '0.06em' }}>“LES BLEUS”</div>
          <div style={{ fontFamily: '"Inter",sans-serif', fontWeight: 600, fontSize: 26, color: MV.muted, marginTop: 12 }}>if France are simply too strong</div>
        </div>
        <div style={{ opacity: clamp(b, 0, 1), transform: `translateY(${(1 - b) * 50}px) scale(${0.85 + 0.15 * b})`, background: 'rgba(0,133,63,0.18)', border: `2px solid ${MV.sen}`, borderRadius: 22, padding: '34px 60px', textAlign: 'center', minWidth: 420 }}>
          <div style={{ fontFamily: '"Inter",sans-serif', fontWeight: 900, fontSize: 52, color: '#5fd99a', letterSpacing: '0.06em' }}>“LIONS”</div>
          <div style={{ fontFamily: '"Inter",sans-serif', fontWeight: 600, fontSize: 26, color: MV.muted, marginTop: 12 }}>if Senegal shock the world all over again</div>
        </div>
      </div>
      <Vignette strength={0.5} />
      <Letterbox />
    </div>
  );
}

// ── 10. Mystery Supporter (271–288.5): Legend 021 — the Dancing Lion ─────────
function SceneMystery() {
  const { localTime: lt } = useSprite();
  const S = 271.0;
  const inP = Easing.easeOutCubic(clamp((lt - 0.6) / 1.4, 0, 1));
  const plateP = Easing.easeOutBack(clamp((lt - 4.2) / 0.9, 0, 1));
  return (
    <div style={{ position: 'absolute', inset: 0, background: '#02030a' }}>
      <KenBurns src="assets/player-mane.png" start={S} dur={17.5} from={1.16} to={1.3} panY={-20}
        dim={0.32} style={{ filter: 'brightness(0.4) contrast(1.1) saturate(1.0) grayscale(0.28)' }} />
      <div style={{
        position: 'absolute', inset: 0, zIndex: 21, pointerEvents: 'none', opacity: 0.5,
        background: `radial-gradient(ellipse at ${20 + Math.sin(lt * 0.3) * 14}% 75%, rgba(0,133,63,0.16) 0%, transparent 45%),` +
                    `radial-gradient(ellipse at ${78 - Math.sin(lt * 0.22) * 12}% 30%, rgba(253,239,66,0.12) 0%, transparent 50%)`,
      }} />
      <AmbientParticles start={S} dur={17.5} count={46} color="255,235,150" maxR={3.5} zIndex={22} />
      <div style={{ position: 'absolute', top: 118, left: 0, right: 0, textAlign: 'center', zIndex: 25, opacity: inP }}>
        <Kicker size={26} color="#f4e08a">The Mystery Supporter · Legend No. 021</Kicker>
      </div>
      {plateP > 0 && (
        <div style={{
          position: 'absolute', left: 110, bottom: 150, zIndex: 25,
          opacity: clamp(plateP, 0, 1), transform: `translateY(${(1 - plateP) * 50}px)`,
        }}>
          <div style={{ background: 'rgba(8,14,8,0.9)', border: '1px solid rgba(160,220,150,0.4)', borderRadius: 18, padding: '28px 44px', backdropFilter: 'blur(6px)' }}>
            <div style={{ fontFamily: '"Inter",sans-serif', fontWeight: 900, fontSize: 54, color: '#eafbe8', letterSpacing: '0.02em' }}>THE DANCING LION</div>
            <div style={{ fontFamily: '"Inter",sans-serif', fontWeight: 700, fontSize: 24, color: '#f4e08a', letterSpacing: '0.14em', marginTop: 8, maxWidth: 780 }}>HE KEEPS A FOLDED SHIRT AND A CORNER FLAG CLOSE TO HIS HEART — HE DANCES FOR PAPA BOUBA DIOP</div>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 12, marginTop: 18, background: 'rgba(255,210,74,0.12)', border: '1px solid rgba(255,210,74,0.5)', borderRadius: 999, padding: '10px 24px' }}>
              <span style={{ fontSize: 26 }}>✦</span>
              <span style={{ fontFamily: '"Inter",sans-serif', fontWeight: 800, fontSize: 24, color: MV.gold, letterSpacing: '0.08em' }}>FIND HIM INSIDE THE GAME · worldcup26.world</span>
            </div>
          </div>
        </div>
      )}
      <Vignette strength={0.55} />
      <Letterbox />
    </div>
  );
}

// ── 11. App promo (288.5–296): worldcup26.world ──────────────────────────────
function SceneApp() {
  const { localTime: lt } = useSprite();
  const S = 288.5;
  const inP = Easing.easeOutCubic(clamp(lt / 1.0, 0, 1));
  const cards = [
    { name: 'FRANCE', coef: 'x1.45', pts: '+1.45', flag: <FlagFRA w={86} /> },
    { name: 'SENEGAL', coef: 'x3.00', pts: 'UNDERDOG', flag: <FlagSEN w={86} />, hot: true },
    { name: 'BRAZIL', coef: 'x1.20', pts: '+0.00', flag: <div style={{ width: 86, height: 57, borderRadius: 6, background: 'linear-gradient(135deg,#159b46 55%,#ffd24a 55%)' }} /> },
  ];
  return (
    <div style={{ position: 'absolute', inset: 0, background: `linear-gradient(160deg, #0d2a20 0%, #07090f 70%)` }}>
      <div style={{ position: 'absolute', inset: 0, background: `radial-gradient(ellipse at 50% 20%, rgba(16,107,79,0.35) 0%, transparent 60%)` }} />
      <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 36, opacity: inP }}>
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
          FREE TO PLAY · LIVE PRIZE POOL · UNDERDOGS PAY TRIPLE
        </div>
      </div>
      <Letterbox />
    </div>
  );
}

// ── 12. CTA outro (296–300) ──────────────────────────────────────────────────
function SceneCTA() {
  const { localTime: lt } = useSprite();
  const S = 296;
  const inP = Easing.easeOutCubic(clamp(lt / 0.8, 0, 1));
  return (
    <div style={{ position: 'absolute', inset: 0, background: '#07090f' }}>
      <PitchBackdrop tint="#0a2e1a" dim={0.55} />
      <AmbientParticles start={S} dur={4} count={28} color="253,239,66" />
      <div style={{ position: 'absolute', inset: 0, zIndex: 23, background: 'radial-gradient(ellipse at 50% 35%, transparent 0%, rgba(7,9,15,0.88) 75%)' }} />
      <div style={{ position: 'absolute', top: 200, left: 0, right: 0, textAlign: 'center', zIndex: 25, opacity: inP }}>
        <Kicker size={30} color={MV.sen}>The legends are only beginning</Kicker>
        <div style={{ marginTop: 24 }}><TitleReveal text="JOIN THE LEGENDS" start={S + 0.4} size={86} color={MV.text} /></div>
      </div>
      <div style={{ position: 'absolute', inset: 0, zIndex: 26 }}>
        <CtaButton start={S} delay={1.0} label="SUBSCRIBE" icon="🔔" accent="#1d4ed8" x={500} />
        <CtaButton start={S} delay={1.4} label="LIKE" icon="👍" accent="#00853f" x={960} />
        <CtaButton start={S} delay={1.8} label="SHARE" icon="📣" accent="#ce1126" x={1400} />
      </div>
      <Sprite start={298.4} end={300}>
        <NextMatchTease start={S + 2.4} />
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
        <span style={{ fontFamily: '"Inter",sans-serif', fontWeight: 900, fontSize: 30, color: MV.gold }}>🦁 THE DANCE LIVES ON · worldcup26.world</span>
      </div>
    </div>
  );
}
