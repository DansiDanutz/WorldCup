// match-scenes.jsx — the eleven scenes of the Match 20 video (300s timeline).
// France vs Senegal · "The Empire and the Lion" · Group I · SoFi Stadium, LA.
// Scene windows must match the SCENES table in match.html and narration.json.
// NOTE: nested <Sprite> windows are GLOBAL seconds (Sprite reads the timeline clock).

// ── 1. Cold open (0–16): heartbeat in the dark, flash glimpses, hook line ────
function SceneColdOpen() {
  const { localTime: lt } = useSprite();
  const beat = Math.pow(Math.max(0, Math.sin(lt * Math.PI * 1.15)), 8);
  const titleP = Easing.easeOutCubic(clamp((lt - 12.6) / 1.4, 0, 1));
  return (
    <div style={{ position: 'absolute', inset: 0, background: '#000' }}>
      {/* moving flash-glimpses of what's coming (video, not stills) */}
      <ClipSprite id="glimpse-mbappe" style={{ filter: 'brightness(0.78) contrast(1.15) saturate(1.2)' }} />
      <ClipSprite id="glimpse-stad" style={{ filter: 'brightness(0.78) contrast(1.15) saturate(1.2)' }} />
      <ClipSprite id="glimpse-sen" style={{ filter: 'brightness(0.78) contrast(1.15) saturate(1.2)' }} />
      <ClipSprite id="glimpse-fra" style={{ filter: 'brightness(0.78) contrast(1.15) saturate(1.2)' }} />
      {/* ember base so the screen never reads as dead air */}
      <div style={{
        position: 'absolute', inset: 0,
        background: `radial-gradient(ellipse at 50% 78%, rgba(22,163,74,0.14) 0%, transparent 55%)`,
      }} />
      {/* heartbeat glow */}
      <div style={{
        position: 'absolute', inset: 0,
        background: `radial-gradient(ellipse at center, rgba(22,163,74,${(0.55 * beat).toFixed(3)}) 0%, transparent 62%)`,
      }} />
      {lt > 1.2 && lt < 12.2 && (
        <div style={{
          position: 'absolute', left: 0, right: 0, bottom: 170, textAlign: 'center', zIndex: 22,
          opacity: Math.min(1, (lt - 1.2) / 1.5) * (lt > 11.0 ? Math.max(0, (12.2 - lt) / 1.2) : 1) * (0.55 + 0.45 * beat),
          fontFamily: '"Inter",sans-serif', fontWeight: 700, fontSize: 30, color: '#8fb89a',
          letterSpacing: '0.5em', textTransform: 'uppercase',
        }}>Seoul · 2002 — one goal that shook the world</div>
      )}
      <Vignette strength={0.8} />
      {lt > 12.6 && (
        <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 34, opacity: titleP, zIndex: 22 }}>
          <Kicker size={34}>The empire and the lion</Kicker>
          <TitleReveal text="MEET AGAIN" start={12.7} size={150} color={MV.gold} />
        </div>
      )}
      <Letterbox />
    </div>
  );
}

// ── 2. Title card (16–28) ────────────────────────────────────────────────────
function SceneTitle() {
  const { localTime: lt } = useSprite();
  const p1 = Easing.easeOutCubic(clamp(lt / 1.0, 0, 1));
  const p2 = Easing.easeOutBack(clamp((lt - 0.8) / 1.0, 0, 1));
  const p3 = Easing.easeOutCubic(clamp((lt - 1.7) / 0.9, 0, 1));
  return (
    <div style={{ position: 'absolute', inset: 0, background: `linear-gradient(180deg, #0a0f1c 0%, #11182b 55%, #0a0f1c 100%)` }}>
      <div style={{ position: 'absolute', inset: 0, background: `radial-gradient(ellipse at 50% 30%, rgba(255,210,74,0.10) 0%, transparent 55%)` }} />
      <AmbientParticles start={16} dur={12} count={34} />
      <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 44 }}>
        <div style={{ opacity: p1, transform: `translateY(${(1 - p1) * -30}px)` }}>
          <Kicker>WorldCup26 Legends · Episode 20</Kicker>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 70, opacity: clamp(p2, 0, 1), transform: `scale(${p2})` }}>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 20 }}>
            <Waving><FlagFRA w={230} /></Waving>
            <BigTitle size={66} glow={MV.fra}>FRANCE</BigTitle>
          </div>
          <BigTitle size={120} color={MV.gold}>VS</BigTitle>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 20 }}>
            <Waving speed={1.9}><FlagSEN w={230} /></Waving>
            <BigTitle size={66} glow={MV.sen}>SENEGAL</BigTitle>
          </div>
        </div>
        <div style={{ opacity: p3, transform: `translateY(${(1 - p3) * 26}px)`, fontFamily: '"Inter",sans-serif', fontWeight: 600, fontSize: 32, color: MV.muted, letterSpacing: '0.08em' }}>
          GROUP I · SOFI STADIUM, LOS ANGELES · JUNE 12, 2026
        </div>
      </div>
      <Letterbox />
    </div>
  );
}

// ── 3. Stadium (28–44): flyover clip + atmosphere ────────────────────────────
function SceneStadium() {
  const { localTime: lt } = useSprite();
  const stripP = Easing.easeOutCubic(clamp((lt - 1.2) / 0.9, 0, 1));
  return (
    <div style={{ position: 'absolute', inset: 0, background: '#000' }}>
      <ClipSprite id="stadium" dim={0.08} />
      <Vignette strength={0.45} />
      <div style={{
        position: 'absolute', left: 0, right: 0, bottom: 130, display: 'flex', justifyContent: 'center', zIndex: 25,
        opacity: stripP, transform: `translateY(${(1 - stripP) * 30}px)`,
      }}>
        <div style={{ display: 'flex', gap: 0, background: MV.panel, border: `1px solid ${MV.line}`, borderRadius: 16, overflow: 'hidden', backdropFilter: 'blur(6px)' }}>
          {[['70,000', 'FANS'], ['2002', 'THE NIGHT IT MATTERED'], ['1', 'WORLD CUP MEETING — SO FAR'], ['24 YRS', 'SINCE THE GREAT UPSET']].map(([v, l], i) => (
            <div key={i} style={{ padding: '24px 46px', borderLeft: i ? `1px solid ${MV.line}` : 'none', textAlign: 'center' }}>
              <div style={{ fontFamily: '"Inter",sans-serif', fontWeight: 900, fontSize: 46, color: MV.gold }}>{v}</div>
              <div style={{ fontFamily: '"Inter",sans-serif', fontWeight: 700, fontSize: 19, color: MV.muted, letterSpacing: '0.18em', marginTop: 6 }}>{l}</div>
            </div>
          ))}
        </div>
      </div>
      <Letterbox />
    </div>
  );
}

// ── 4. History (44–98.5): the real story between the two nations ────────────
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
        boxShadow: '0 30px 110px rgba(0,0,0,0.65)', backdropFilter: 'blur(4px)',
      }}>
        <div style={{ fontFamily: '"Inter",sans-serif', fontWeight: 800, fontSize: 30, color: MV.muted, letterSpacing: '0.34em' }}>{venue}</div>
        <div style={{ fontFamily: '"Inter",sans-serif', fontWeight: 900, fontSize: 130, color: accent, lineHeight: 1.05, margin: '14px 0 6px', textShadow: `0 0 60px ${accent}44` }}>{score}</div>
        <div style={{ fontFamily: '"Inter",sans-serif', fontWeight: 800, fontSize: 44, color: MV.text, letterSpacing: '0.08em' }}>{year}</div>
        {note && <div style={{ fontFamily: '"Inter",sans-serif', fontWeight: 600, fontSize: 27, color: MV.muted, marginTop: 14, maxWidth: 760 }}>{note}</div>}
        {stamp && stampP > 0 && (
          <div style={{
            position: 'absolute', top: -34, right: -60, transform: `rotate(-12deg) scale(${stampP})`,
            border: `5px solid ${MV.sen}`, color: MV.sen, borderRadius: 14, padding: '10px 26px',
            fontFamily: '"Inter",sans-serif', fontWeight: 900, fontSize: 38, letterSpacing: '0.1em',
            background: 'rgba(7,9,15,0.85)',
          }}>{stamp}</div>
        )}
      </div>
    </div>
  );
}

function SceneHistory() {
  const { localTime: lt } = useSprite();
  const S = 44;
  return (
    <div style={{ position: 'absolute', inset: 0, background: '#05060a' }}>
      <ClipSprite id="history-bg" dim={0.72} style={{ filter: 'brightness(0.28) saturate(0.65) contrast(1.1)' }} />
      <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse at center, transparent 30%, rgba(5,6,10,0.82) 100%)' }} />
      <AmbientParticles start={44} dur={54.5} count={30} maxR={4} />
      {/* chapter header */}
      <div style={{ position: 'absolute', top: 116, left: 0, right: 0, textAlign: 'center', zIndex: 26 }}>
        <Kicker size={28}>Chapter One · The History</Kicker>
        <div style={{ fontFamily: '"Inter",sans-serif', fontWeight: 900, fontSize: 54, color: MV.text, letterSpacing: '0.05em', marginTop: 16, textShadow: '0 4px 22px rgba(0,0,0,0.8)' }}>
          THE COLONY THAT HUMBLED THE EMPIRE
        </div>
      </div>
      {/* flag pair, always present */}
      <div style={{ position: 'absolute', bottom: 132, left: 0, right: 0, display: 'flex', justifyContent: 'center', gap: 40, zIndex: 26, opacity: 0.95 }}>
        <FlagFRA w={108} />
        <div style={{ alignSelf: 'center', fontFamily: '"Inter",sans-serif', fontWeight: 900, fontSize: 34, color: MV.gold }}>×</div>
        <FlagSEN w={108} />
      </div>
      {/* beats synced to the narration */}
      <HistoryPlate start={S + 1.0} end={S + 12} year="WORLD CUP 2002" venue="THE OPENING MATCH" score="FRANCE" note="Reigning world champions. Reigning European champions. Zidane, Henry, Trezeguet. Untouchable." accent={MV.fra} />
      <HistoryPlate start={S + 12} end={S + 23} year="SEOUL · 2002" venue="THEIR FIRST EVER WORLD CUP" score="SENEGAL" note="A former French colony, a squad raised in the French leagues. Nobody gave them a prayer." accent={MV.sen} />
      <HistoryPlate start={S + 23} end={S + 33.5} year="30' · PAPA BOUBA DIOP" venue="THE UNTHINKABLE" score="1 — 0" note="He bundles it over the line — and the colony has humbled the empire. Senegal one, France nil." accent={MV.sen} stamp="THE UPSET" />
      <HistoryPlate start={S + 33.5} end={S + 44} year="GROUP STAGE OUT" venue="NOT A SINGLE GOAL" score="FRANCE 0" note="The champions go home without scoring. Senegal march to the quarter-finals — a symbol of African defiance." accent={MV.fra} />
      <HistoryPlate start={S + 44} end={S + 54} year="24 YEARS LATER" venue="THE REMATCH" score="2026" note="France are world champions again. Senegal are kings of Africa. The rematch a generation has waited for — is finally here." accent={MV.gold} />
      <Vignette strength={0.5} />
      <Letterbox />
    </div>
  );
}

// ── Squad montage grid (uses the full generated image library) ───────────────
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
            width: 308, transform: `translateY(${(1 - cp) * 90}px) scale(${0.85 + 0.15 * cp})`, opacity: clamp(cp, 0, 1),
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

// ── 5. France (98.5–133.5): squad grid then animated stars ───────────────────
function SceneFrance() {
  const { localTime: lt } = useSprite();
  const S = 98.5;
  const headerP = Easing.easeOutCubic(clamp(lt / 0.9, 0, 1));
  return (
    <div style={{ position: 'absolute', inset: 0, background: '#0a0c14' }}>
      <ClipSprite id="mbappe" dim={0.12} />
      <ClipSprite id="dembele" dim={0.12} />
      <ClipSprite id="tchouameni" dim={0.12} />
      <div style={{ position: 'absolute', inset: 0, zIndex: 22, pointerEvents: 'none', background: `linear-gradient(90deg, rgba(30,58,138,0.22) 0%, transparent 30%, transparent 70%, rgba(239,65,53,0.16) 100%)` }} />
      <div style={{ position: 'absolute', top: 108, left: 0, right: 0, display: 'flex', justifyContent: 'center', zIndex: 26, opacity: headerP, transform: `translateY(${(1 - headerP) * -24}px)` }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 26, background: MV.panel, border: `1px solid ${MV.line}`, borderRadius: 999, padding: '16px 44px' }}>
          <FlagFRA w={74} />
          <span style={{ fontFamily: '"Inter",sans-serif', fontWeight: 900, fontSize: 40, color: MV.text, letterSpacing: '0.10em' }}>LES BLEUS</span>
        </div>
      </div>
      <SquadGrid start={S + 0.4} end={S + 7.5} accent={MV.fra} players={[
        { img: 'assets/squad/fra-1-Mbappe.png', name: 'KYLIAN MBAPPÉ', role: 'THE PRINCE' },
        { img: 'assets/squad/fra-2-Dembele.png', name: 'OUSMANE DEMBÉLÉ', role: 'BALLON D\'OR' },
        { img: 'assets/squad/fra-3-Tchouameni.png', name: 'AURÉLIEN TCHOUAMÉNI', role: 'THE METRONOME' },
        { img: 'assets/squad/fra-4-Olise.png', name: 'MICHAEL OLISE', role: 'THE CREATOR' },
        { img: 'assets/squad/fra-5-Saliba.png', name: 'WILLIAM SALIBA', role: 'THE ROCK' },
      ]} />
      <Sprite start={106.0} end={116.0}>
        <LowerThird start={106.5} name="KYLIAN MBAPPÉ" role="The Prince of Bondy · No. 10" line="38 km/h of pure intent. Scored a hat-trick in a World Cup final… and still lost." accent={MV.fra} />
      </Sprite>
      <Sprite start={116.0} end={125.0}>
        <LowerThird start={116.5} name="OUSMANE DEMBÉLÉ" role="Ballon d'Or · Winger" line="Two feet, no weakness. A dribble that ties defenders in knots." accent={MV.fra} />
      </Sprite>
      <Sprite start={125.0} end={133.5}>
        <LowerThird start={125.3} name="AURÉLIEN TCHOUAMÉNI" role="The Metronome · Midfield" line="Decides the tempo of the game before the game even begins." accent={MV.fra} />
      </Sprite>
      <Vignette strength={0.4} />
      <Letterbox />
    </div>
  );
}

// ── 6. Senegal (133.5–164.5): champions of Africa grid then the lions ────────
function SceneSenegal() {
  const { localTime: lt } = useSprite();
  const S = 133.5;
  const headerP = Easing.easeOutCubic(clamp(lt / 0.9, 0, 1));
  return (
    <div style={{ position: 'absolute', inset: 0, background: '#0a0c14' }}>
      <ClipSprite id="sen-hopeful" dim={0.55} />
      <ClipSprite id="mane" dim={0.12} />
      <ClipSprite id="jackson" dim={0.12} />
      <ClipSprite id="koulibaly" dim={0.12} />
      <div style={{ position: 'absolute', inset: 0, zIndex: 22, pointerEvents: 'none', background: `linear-gradient(90deg, rgba(22,163,74,0.22) 0%, transparent 30%, transparent 70%, rgba(252,209,22,0.16) 100%)` }} />
      <div style={{ position: 'absolute', top: 108, left: 0, right: 0, display: 'flex', justifyContent: 'center', zIndex: 26, opacity: headerP, transform: `translateY(${(1 - headerP) * -24}px)` }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 26, background: MV.panel, border: `1px solid ${MV.line}`, borderRadius: 999, padding: '16px 44px' }}>
          <FlagSEN w={74} />
          <span style={{ fontFamily: '"Inter",sans-serif', fontWeight: 900, fontSize: 40, color: MV.text, letterSpacing: '0.10em' }}>THE LIONS OF TERANGA</span>
        </div>
      </div>
      <SquadGrid start={S + 0.4} end={S + 11} accent={MV.sen} players={[
        { img: 'assets/squad/sen-1-Mane.png', name: 'SADIO MANÉ', role: 'THE KING' },
        { img: 'assets/squad/sen-2-Jackson.png', name: 'NICOLAS JACKSON', role: 'THE BLADE' },
        { img: 'assets/squad/sen-3-Koulibaly.png', name: 'KALIDOU KOULIBALY', role: 'THE WALL · CAPTAIN' },
        { img: 'assets/squad/sen-4-Mendy.png', name: 'ÉDOUARD MENDY', role: 'THE GLOVES' },
        { img: 'assets/squad/sen-5-Camara.png', name: 'LAMINE CAMARA', role: 'THE JEWEL' },
      ]} />
      <Sprite start={144.5} end={154.5}>
        <LowerThird start={144.8} name="SADIO MANÉ" role="The King of Teranga · Forward" line="Walked 400 km for a dream, then built his village a hospital, a school and a mosque." accent={MV.sen} />
      </Sprite>
      <Sprite start={154.5} end={159.0}>
        <LowerThird start={154.7} name="NICOLAS JACKSON" role="The Blade · Striker" line="All sprint and ice on the counter — waiting for one Mbappé mistake." accent={MV.sen} />
      </Sprite>
      <Sprite start={159.0} end={164.5}>
        <LowerThird start={159.2} name="KALIDOU KOULIBALY" role="The Captain · The Wall" line="The calm that turns panic into order. 102 caps of defensive mastery." accent={MV.sen} />
      </Sprite>
      <Vignette strength={0.4} />
      <Letterbox />
    </div>
  );
}

// ── 7. The duel (164.5–186): Mbappé vs Mané split screen ─────────────────────
function SceneDuel() {
  const { localTime: lt } = useSprite();
  const slideP = Easing.easeOutQuart(clamp(lt / 1.1, 0, 1));
  const vsP = Easing.easeOutBack(clamp((lt - 0.9) / 0.8, 0, 1));
  const shake = lt > 0.9 && lt < 1.25 ? Math.sin(lt * 160) * 7 * (1.25 - lt) / 0.35 : 0;
  return (
    <div style={{ position: 'absolute', inset: 0, background: '#05060a', transform: `translate(${shake}px, ${-shake}px)` }}>
      <div style={{ position: 'absolute', top: 0, bottom: 0, left: 0, width: '50%', overflow: 'hidden', transform: `translateX(${(1 - slideP) * -100}%)` }}>
        <img src="assets/squad/fra-1-Mbappe.png" alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', filter: 'saturate(1.15) brightness(0.92)' }} />
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(90deg, rgba(30,58,138,0.34), transparent 65%)' }} />
        <div style={{ position: 'absolute', bottom: 150, left: 90, fontFamily: '"Inter",sans-serif', fontWeight: 900, fontSize: 62, color: '#fff', textShadow: '0 4px 26px rgba(0,0,0,0.9)' }}>
          THE PRINCE
          <div style={{ fontSize: 27, fontWeight: 700, color: MV.gold, letterSpacing: '0.2em', marginTop: 8 }}>KYLIAN MBAPPÉ</div>
        </div>
      </div>
      <div style={{ position: 'absolute', top: 0, bottom: 0, right: 0, width: '50%', overflow: 'hidden', transform: `translateX(${(1 - slideP) * 100}%)` }}>
        <img src="assets/squad/sen-1-Mane.png" alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', filter: 'saturate(1.15) brightness(0.92)' }} />
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(270deg, rgba(22,163,74,0.36), transparent 65%)' }} />
        <div style={{ position: 'absolute', bottom: 150, right: 90, textAlign: 'right', fontFamily: '"Inter",sans-serif', fontWeight: 900, fontSize: 62, color: '#fff', textShadow: '0 4px 26px rgba(0,0,0,0.9)' }}>
          THE KING
          <div style={{ fontSize: 27, fontWeight: 700, color: MV.gold, letterSpacing: '0.2em', marginTop: 8 }}>SADIO MANÉ</div>
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
      <Sprite start={182} end={186}>
        <div style={{ position: 'absolute', left: 0, right: 0, bottom: 0, top: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 27, background: 'rgba(0,0,0,0.55)' }}>
          <BigTitle size={74} color={MV.text} style={{ maxWidth: 1400 }}>
            “Our storytellers have looked into tonight…”
          </BigTitle>
        </div>
      </Sprite>
      <Letterbox />
    </div>
  );
}

// ── 8. Match drama (186–242): the 56' goal, joy, the equaliser ───────────────
//      EVERY scoreline here is OUR PREDICTION (the ScoreBug carries the badge).
function SceneDrama() {
  const { localTime: lt } = useSprite();
  const S = 186;
  return (
    <div style={{ position: 'absolute', inset: 0, background: '#000' }}>
      <ClipSprite id="goal-replay" dim={0.06} />
      <ClipSprite id="fra-euphoric" />
      <ClipSprite id="mane-tackle" dim={0.1} />
      <ClipSprite id="fra-anxious" dim={0.05} />
      <ClipSprite id="sen-euphoric" dim={0.05} />

      <Sprite start={186} end={195.5}>
        <ScoreBug start={S + 0.4} fra={0} sen={0} minute="56'" />
      </Sprite>
      <GoalFlash at={S + 9.6} />
      <Confetti start={S + 9.8} dur={14} />
      <Sprite start={195.6} end={222.5}>
        <ScoreBug start={S + 9.6} fra={1} sen={0} minute="56'" />
      </Sprite>
      <GoalFlash at={S + 37.6} />
      <Sprite start={222.5} end={231}>
        <ScoreBug start={S + 37.6} fra={1} sen={1} minute="71'" />
      </Sprite>

      <Sprite start={231} end={242}>
        <FullTimeCard start={S + 45} />
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
  const stampP = Easing.easeOutBack(clamp((local - 1.0) / 0.6, 0, 1));
  return (
    <div style={{ position: 'absolute', inset: 0, zIndex: 26, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(2,3,6,0.62)', opacity: p }}>
      <div style={{ background: MV.panel, border: `1px solid ${MV.line}`, borderRadius: 26, padding: '60px 110px', textAlign: 'center', transform: `scale(${0.92 + 0.08 * p})`, boxShadow: '0 30px 120px rgba(0,0,0,0.7)', position: 'relative' }}>
        {stampP > 0 && (
          <div style={{
            position: 'absolute', top: -30, right: -54, transform: `rotate(-12deg) scale(${stampP})`,
            border: `4px solid ${MV.gold}`, color: MV.gold, borderRadius: 12, padding: '8px 22px',
            fontFamily: '"Inter",sans-serif', fontWeight: 900, fontSize: 26, letterSpacing: '0.14em',
            background: 'rgba(7,9,15,0.9)', zIndex: 2,
          }}>OUR PREDICTION</div>
        )}
        <Kicker size={26}>Full Time · SoFi Stadium</Kicker>
        <div style={{ display: 'flex', alignItems: 'center', gap: 56, marginTop: 40 }}>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16 }}>
            <FlagFRA w={150} />
            <span style={{ fontFamily: '"Inter",sans-serif', fontWeight: 800, fontSize: 34, color: MV.text }}>FRANCE</span>
          </div>
          <BigTitle size={170} color={MV.gold}>1 — 1</BigTitle>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16 }}>
            <FlagSEN w={150} />
            <span style={{ fontFamily: '"Inter",sans-serif', fontWeight: 800, fontSize: 34, color: MV.text }}>SENEGAL</span>
          </div>
        </div>
        <div style={{ fontFamily: '"Inter",sans-serif', fontWeight: 600, fontSize: 30, color: MV.muted, marginTop: 36 }}>
          Mbappé for the Prince, Jackson for the King — not the upset of 2002, but proof the lion still hunts the empire as equals
        </div>
      </div>
    </div>
  );
}

// ── 9. Verdict (242–256): standings + what it means ──────────────────────────
function SceneVerdict() {
  const { localTime: lt } = useSprite();
  const S = 242;
  return (
    <div style={{ position: 'absolute', inset: 0, background: '#0a0f1c' }}>
      <ClipSprite id="verdict-bg" dim={0.6} />
      <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 25 }}>
        <div style={{ background: MV.panel, border: `1px solid ${MV.line}`, borderRadius: 24, padding: '52px 84px', minWidth: 900, backdropFilter: 'blur(6px)' }}>
          <Kicker size={26}>Group I · After Matchday 1</Kicker>
          <div style={{ marginTop: 26 }}>
            <StatLine start={S + 0.8} delay={0.0} label="1 · France" value="1 pt · the Prince scored" accent={MV.gold} />
            <StatLine start={S + 0.8} delay={0.25} label="2 · Senegal" value="1 pt · the King answered" accent={MV.gold} />
            <StatLine start={S + 0.8} delay={0.5} label="—" value="two games still to play" accent={MV.text} />
            <StatLine start={S + 0.8} delay={0.75} label="OUR PREDICTION" value="a point each · 1 — 1" accent={MV.muted} />
          </div>
          <div style={{ fontFamily: '"Inter",sans-serif', fontWeight: 700, fontSize: 30, color: MV.gold, marginTop: 38, textAlign: 'center' }}>
            Nothing decided. Everything still to play for.
          </div>
        </div>
      </div>
      <Vignette strength={0.5} />
      <Letterbox />
    </div>
  );
}


// ── 10b. Mystery Supporter (256–270): the series' signature segment ──────────
function SceneMystery() {
  const { localTime: lt } = useSprite();
  const S = 256;
  const inP = Easing.easeOutCubic(clamp((lt - 0.6) / 1.4, 0, 1));
  const plateP = Easing.easeOutBack(clamp((lt - 4.2) / 0.9, 0, 1));
  return (
    <div style={{ position: 'absolute', inset: 0, background: '#02030a' }}>
      <ClipSprite id="mystery" dim={0.12} />
      {/* drifting fog layers */}
      <div style={{
        position: 'absolute', inset: 0, zIndex: 21, pointerEvents: 'none', opacity: 0.5,
        background: `radial-gradient(ellipse at ${20 + Math.sin(lt * 0.3) * 14}% 75%, rgba(252,209,22,0.16) 0%, transparent 45%),` +
                    `radial-gradient(ellipse at ${78 - Math.sin(lt * 0.22) * 12}% 30%, rgba(22,163,74,0.12) 0%, transparent 50%)`,
      }} />
      <AmbientParticles start={S} dur={14} count={46} color="252,228,150" maxR={3.5} zIndex={22} />
      <div style={{ position: 'absolute', top: 118, left: 0, right: 0, textAlign: 'center', zIndex: 25, opacity: inP }}>
        <Kicker size={26} color="#e8c97a">The Mystery Supporter · Legend No. 020</Kicker>
      </div>
      {plateP > 0 && (
        <div style={{
          position: 'absolute', left: 110, bottom: 150, zIndex: 25,
          opacity: clamp(plateP, 0, 1), transform: `translateY(${(1 - plateP) * 50}px)`,
        }}>
          <div style={{ background: 'rgba(8,16,12,0.88)', border: '1px solid rgba(252,209,22,0.35)', borderRadius: 18, padding: '28px 44px', backdropFilter: 'blur(6px)' }}>
            <div style={{ fontFamily: '"Inter",sans-serif', fontWeight: 900, fontSize: 54, color: '#f1f8ee', letterSpacing: '0.02em' }}>THE LION OF GORÉE</div>
            <div style={{ fontFamily: '"Inter",sans-serif', fontWeight: 700, fontSize: 25, color: '#e8c97a', letterSpacing: '0.2em', marginTop: 8 }}>AN OLD GRIOT · HAS DRUMMED AT EVERY MATCH SINCE 2002</div>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 12, marginTop: 18, background: 'rgba(255,210,74,0.12)', border: '1px solid rgba(255,210,74,0.5)', borderRadius: 999, padding: '10px 24px' }}>
              <span style={{ fontSize: 26 }}>✦</span>
              <span style={{ fontFamily: '"Inter",sans-serif', fontWeight: 800, fontSize: 24, color: MV.gold, letterSpacing: '0.08em' }}>COLLECTIBLE · worldcup26.world</span>
            </div>
          </div>
        </div>
      )}
      <Vignette strength={0.55} />
      <Letterbox />
    </div>
  );
}

// ── 10. App promo (270–288): worldcup26.world ────────────────────────────────
function SceneApp() {
  const { localTime: lt } = useSprite();
  const S = 270;
  const inP = Easing.easeOutCubic(clamp(lt / 1.0, 0, 1));
  const cards = [
    { name: 'SENEGAL', coef: 'x3.00', pts: '+3.00', flag: <FlagSEN w={86} /> },
    { name: 'FRANCE', coef: 'x1.30', pts: '+0.00', flag: <FlagFRA w={86} /> },
    { name: 'BRAZIL', coef: 'x1.20', pts: '+0.00', flag: <div style={{ width: 86, height: 57, borderRadius: 6, background: 'linear-gradient(135deg,#159b46 55%,#ffd24a 55%)' }} /> },
  ];
  return (
    <div style={{ position: 'absolute', inset: 0, background: `linear-gradient(160deg, #0d2a20 0%, #07090f 70%)` }}>
      <div style={{ position: 'absolute', inset: 0, background: `radial-gradient(ellipse at 50% 20%, rgba(16,107,79,0.35) 0%, transparent 60%)` }} />
      <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 46, opacity: inP }}>
        <Kicker color="#7fd6b5" size={30}>The Prediction Game</Kicker>
        <BigTitle size={104} color="#fff" glow={MV.green}>worldcup26.world</BigTitle>
        <div style={{ fontFamily: '"Inter",sans-serif', fontWeight: 700, fontSize: 38, color: '#cfe9de', letterSpacing: '0.04em' }}>
          Pick 3 teams. Every goal they score… scores for YOU.
        </div>
        <div style={{ display: 'flex', gap: 36, marginTop: 12 }}>
          {cards.map((c, i) => {
            const cp = Easing.easeOutBack(clamp((lt - 1.2 - i * 0.35) / 0.7, 0, 1));
            return (
              <div key={i} style={{
                transform: `translateY(${(1 - cp) * 60}px) scale(${0.8 + 0.2 * cp})`, opacity: clamp(cp, 0, 1),
                background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.18)', borderRadius: 22,
                padding: '34px 46px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 18, minWidth: 290,
                boxShadow: '0 24px 70px rgba(0,0,0,0.45)',
              }}>
                {c.flag}
                <div style={{ fontFamily: '"Inter",sans-serif', fontWeight: 900, fontSize: 32, color: '#fff' }}>{c.name}</div>
                <div style={{ fontFamily: '"Inter",sans-serif', fontWeight: 800, fontSize: 26, color: MV.gold }}>{c.coef}</div>
                <div style={{ fontFamily: '"Inter",sans-serif', fontWeight: 800, fontSize: 30, color: i === 0 ? '#6ee7a8' : '#9fb2a9' }}>{c.pts}</div>
              </div>
            );
          })}
        </div>
        <div style={{ fontFamily: '"Inter",sans-serif', fontWeight: 800, fontSize: 34, color: MV.gold, letterSpacing: '0.06em', marginTop: 8 }}>
          FREE TO PLAY · UNDERDOGS PAY TRIPLE · LIVE PRIZE POOL
        </div>
      </div>
      <Letterbox />
    </div>
  );
}

// ── 11. CTA outro (288–300) ──────────────────────────────────────────────────
function SceneCTA() {
  const { localTime: lt } = useSprite();
  const S = 288;
  const inP = Easing.easeOutCubic(clamp(lt / 0.8, 0, 1));
  return (
    <div style={{ position: 'absolute', inset: 0, background: '#07090f' }}>
      <ClipSprite id="cta-bg" dim={0.68} />
      <AmbientParticles start={288} dur={12} count={28} />
      <div style={{ position: 'absolute', inset: 0, zIndex: 23, background: 'radial-gradient(ellipse at 50% 35%, transparent 0%, rgba(7,9,15,0.88) 75%)' }} />
      <div style={{ position: 'absolute', top: 200, left: 0, right: 0, textAlign: 'center', zIndex: 25, opacity: inP }}>
        <Kicker size={30}>Enjoyed the story?</Kicker>
        <div style={{ marginTop: 24 }}><TitleReveal text="JOIN THE LEGENDS" start={S + 0.5} size={92} color={MV.text} /></div>
      </div>
      <div style={{ position: 'absolute', inset: 0, zIndex: 26 }}>
        <CtaButton start={S} delay={1.2} label="SUBSCRIBE" icon="🔔" accent="#16a34a" x={500} />
        <CtaButton start={S} delay={1.6} label="LIKE" icon="👍" accent="#1e3a8a" x={960} />
        <CtaButton start={S} delay={2.0} label="SHARE" icon="📣" accent="#106b4f" x={1400} />
      </div>
      <Sprite start={292.6} end={300}>
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
        <span style={{ fontFamily: '"Inter",sans-serif', fontWeight: 700, fontSize: 26, color: MV.muted, letterSpacing: '0.14em' }}>NEXT EPISODE</span>
        <span style={{ fontFamily: '"Inter",sans-serif', fontWeight: 900, fontSize: 30, color: MV.gold }}>⚡ EP21 · THE NEXT LEGEND AWAITS · worldcup26.world</span>
      </div>
    </div>
  );
}
