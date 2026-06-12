// match-scenes.jsx — Episode 5: Brazil vs Morocco (300s timeline).
// Scene windows must match SCENES in match.html, narration.json and clips.json.
// NOTE: nested <Sprite> windows are GLOBAL seconds.

// ── 1. Mystery cold open (0–16): The Maple Leaf Man (open loop) ──────────────
function SceneMystery0() {
  const { localTime: lt } = useSprite();
  const beat = Math.pow(Math.max(0, Math.sin(lt * Math.PI * 1.0)), 8);
  return (
    <div style={{ position: 'absolute', inset: 0, background: '#000' }}>
      <ClipSprite id="mystery-open" dim={0.25} style={{ filter: 'brightness(0.6) saturate(0.85) contrast(1.12)' }} />
      {/* drifting fog */}
      <div style={{
        position: 'absolute', inset: 0, zIndex: 21, pointerEvents: 'none', opacity: 0.6,
        background: `radial-gradient(ellipse at ${24 + Math.sin(lt * 0.25) * 16}% 70%, rgba(160,170,200,0.18) 0%, transparent 48%),` +
                    `radial-gradient(ellipse at ${76 - Math.sin(lt * 0.2) * 14}% 35%, rgba(213,43,30,0.12) 0%, transparent 50%)`,
      }} />
      {/* heartbeat ember */}
      <div style={{ position: 'absolute', inset: 0, zIndex: 21, background: `radial-gradient(ellipse at center, rgba(213,43,30,${(0.30 * beat).toFixed(3)}) 0%, transparent 60%)` }} />
      <KineticCaption start={1.2} dur={3.6} words={["HE", "SAW", "ALL", "FIVE"]} size={84} color="#ffdf00" />
      <KineticCaption start={5.4} dur={3.4} words={["BEFORE", "THEY", "HAPPENED"]} size={84} color="#e8eeff" />
      <Sprite start={12.8} end={16}>
        <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 27, background: 'rgba(0,0,0,0.35)' }}>
          <TitleReveal text="THE SIXTH VISION" start={12.9} size={126} color="#ffdf00" />
        </div>
      </Sprite>
      <Vignette strength={0.7} />
      <Letterbox />
    </div>
  );
}

// ── 2. Recap + title (16–36) ─────────────────────────────────────────────────
function SceneRecapTitle() {
  const { localTime: lt } = useSprite();
  const showRecap = lt < 10;
  const p1 = Easing.easeOutCubic(clamp((lt - 10) / 1.0, 0, 1));
  const p2 = Easing.easeOutBack(clamp((lt - 10.8) / 1.0, 0, 1));
  const p3 = Easing.easeOutCubic(clamp((lt - 11.7) / 0.9, 0, 1));
  return (
    <div style={{ position: 'absolute', inset: 0, background: `linear-gradient(180deg, #0a0f1c 0%, #131a2e 55%, #0a0f1c 100%)` }}>
      {/* previously-on beat reusing the paid Ep2 animation library */}
      <ClipSprite id="recap-joy" dim={0.25} />
      <ClipSprite id="recap-pulisic" dim={0.25} />
      {showRecap && (
        <div style={{ position: 'absolute', top: 120, left: 0, right: 0, display: 'flex', justifyContent: 'center', zIndex: 25 }}>
          <div style={{ background: MV.panel, border: `1px solid ${MV.line}`, borderRadius: 999, padding: '14px 40px' }}>
            <span style={{ fontFamily: '"Inter",sans-serif', fontWeight: 800, fontSize: 28, color: MV.gold, letterSpacing: '0.34em' }}>PREVIOUSLY ON WORLDCUP26 LEGENDS</span>
          </div>
        </div>
      )}
      {showRecap && lt > 4.5 && (
        <div style={{ position: 'absolute', bottom: 150, left: 0, right: 0, textAlign: 'center', zIndex: 25 }}>
          <span style={{ fontFamily: '"Inter",sans-serif', fontWeight: 900, fontSize: 44, color: MV.text, textShadow: '0 4px 22px #000' }}>
            EPISODE 4 · OUR PREDICTION: USA 1—1 PAR
          </span>
        </div>
      )}
      {!showRecap && (<>
        <AmbientParticles start={26} dur={10} count={34} color="213,43,30" />
        <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 44 }}>
          <div style={{ opacity: p1, transform: `translateY(${(1 - p1) * -30}px)` }}>
            <Kicker>WorldCup26 Legends · Episode 5</Kicker>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 70, opacity: clamp(p2, 0, 1), transform: `scale(${p2})` }}>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 20 }}>
              <Waving><FlagBRA w={250} /></Waving>
              <BigTitle size={70} glow="#ffdf00">BRAZIL</BigTitle>
            </div>
            <BigTitle size={120} color={MV.gold}>VS</BigTitle>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 20 }}>
              <Waving speed={1.9}><FlagMAR w={250} /></Waving>
              <BigTitle size={62} glow="#c1272d">MOROCCO</BigTitle>
            </div>
          </div>
          <div style={{ opacity: p3, fontFamily: '"Inter",sans-serif', fontWeight: 600, fontSize: 32, color: MV.muted, letterSpacing: '0.08em' }}>
            GROUP C · MATCHDAY 1 · JUNE 13, 2026
          </div>
        </div>
      </>)}
      <Letterbox />
    </div>
  );
}

// ── 3. Stadium (36–46.5) ─────────────────────────────────────────────────────
function SceneStadium() {
  const { localTime: lt } = useSprite();
  const stripP = Easing.easeOutCubic(clamp((lt - 1.0) / 0.9, 0, 1));
  return (
    <div style={{ position: 'absolute', inset: 0, background: '#000' }}>
      <ClipSprite id="stadium" dim={0.08} />
      <Vignette strength={0.45} />
      <div style={{ position: 'absolute', left: 0, right: 0, bottom: 130, display: 'flex', justifyContent: 'center', zIndex: 25, opacity: stripP, transform: `translateY(${(1 - stripP) * 30}px)` }}>
        <div style={{ display: 'flex', background: MV.panel, border: `1px solid ${MV.line}`, borderRadius: 16, overflow: 'hidden', backdropFilter: 'blur(6px)' }}>
          {[['233M', 'WATCHING TONIGHT'], ['5', 'BRAZIL WORLD TITLES'], ['2022', 'MOROCCO: 1st AFRICAN SEMIFINALIST'], ['2—1', 'LAST MEETING: MOROCCO WON']].map(([v, l], i) => (
            <div key={i} style={{ padding: '24px 42px', borderLeft: i ? `1px solid ${MV.line}` : 'none', textAlign: 'center' }}>
              <div style={{ fontFamily: '"Inter",sans-serif', fontWeight: 900, fontSize: 44, color: MV.gold }}>{v}</div>
              <div style={{ fontFamily: '"Inter",sans-serif', fontWeight: 700, fontSize: 18, color: MV.muted, letterSpacing: '0.16em', marginTop: 6 }}>{l}</div>
            </div>
          ))}
        </div>
      </div>
      <Letterbox />
    </div>
  );
}

// ── 4. History (46.5–96.5): two lives that should have made football impossible
function HistoryPlate({ start, end, year, venue, score, note, accent = MV.gold, stamp }) {
  const t = useTime();
  if (t < start || t > end) return null;
  const p = Easing.easeOutBack(clamp((t - start) / 0.8, 0, 1));
  const fade = t > end - 0.6 ? (end - t) / 0.6 : 1;
  const stampP = stamp ? Easing.easeOutBack(clamp((t - start - 1.4) / 0.5, 0, 1)) : 0;
  return (
    <div style={{ position: 'absolute', inset: 0, zIndex: 25, display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: clamp(p, 0, 1) * clamp(fade, 0, 1) }}>
      <div style={{ transform: `scale(${0.86 + 0.14 * p})`, background: MV.panel, border: `1px solid ${MV.line}`, borderRadius: 24, padding: '48px 92px', textAlign: 'center', position: 'relative', boxShadow: '0 30px 110px rgba(0,0,0,0.65)', backdropFilter: 'blur(4px)' }}>
        <div style={{ fontFamily: '"Inter",sans-serif', fontWeight: 800, fontSize: 28, color: MV.muted, letterSpacing: '0.34em' }}>{venue}</div>
        <div style={{ fontFamily: '"Inter",sans-serif', fontWeight: 900, fontSize: 118, color: accent, lineHeight: 1.05, margin: '12px 0 6px', textShadow: `0 0 60px ${accent}44` }}>{score}</div>
        <div style={{ fontFamily: '"Inter",sans-serif', fontWeight: 800, fontSize: 42, color: MV.text, letterSpacing: '0.08em' }}>{year}</div>
        {note && <div style={{ fontFamily: '"Inter",sans-serif', fontWeight: 600, fontSize: 26, color: MV.muted, marginTop: 14, maxWidth: 760 }}>{note}</div>}
        {stamp && stampP > 0 && (
          <div style={{ position: 'absolute', top: -34, right: -60, transform: `rotate(-12deg) scale(${stampP})`, border: `5px solid #d52b1e`, color: '#d52b1e', borderRadius: 14, padding: '10px 26px', fontFamily: '"Inter",sans-serif', fontWeight: 900, fontSize: 36, letterSpacing: '0.1em', background: 'rgba(7,9,15,0.85)' }}>{stamp}</div>
        )}
      </div>
    </div>
  );
}

function SceneHistory() {
  const { localTime: lt } = useSprite();
  const S = 46.5;
  return (
    <div style={{ position: 'absolute', inset: 0, background: '#05060a' }}>
      {/* archive color treatment (research: contrast grading for history segments) */}
      
      
      <ClipSprite id="history-bg" style={{ filter: 'brightness(0.3) saturate(0.5) sepia(0.3)' }} />
      <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse at center, transparent 30%, rgba(5,6,10,0.82) 100%)' }} />
      <AmbientParticles start={46.5} dur={50} count={26} maxR={4} />
      <div style={{ position: 'absolute', top: 112, left: 0, right: 0, textAlign: 'center', zIndex: 26 }}>
        <Kicker size={26}>Chapter One · Five Stars and One Secret</Kicker>
      </div>
      <StarCounter start={S} />
      <HistoryPlate start={S + 22} end={S + 32.5} year="QATAR · 2022" venue="THE ATLAS LIONS ROARED" score="SEMIFINAL" note="Morocco — the FIRST African and Arab nation ever to reach a World Cup semifinal." accent="#c1272d" stamp="HISTORY" />
      <HistoryPlate start={S + 32.5} end={S + 44} year="TANGIER · MARCH 2023" venue="THE LAST TIME THEY MET" score="MAR 2—1 BRA" note="The first Moroccan victory over Brazil in history. The kings of football... lost." accent="#006233" stamp="THEY WON" />
      <HistoryPlate start={S + 44} end={S + 51.5} year="TONIGHT · 2026" venue="THE REMATCH" score="HEXA vs LIONS" note="And the man who unlocked Brazil that night is on the pitch again." accent={MV.gold} />
      <Vignette strength={0.5} />
      <Letterbox />
    </div>
  );
}

// ── Squad montage grid ────────────────────────────────────────────────────────
function SquadGrid({ start, end, players, accent }) {
  const t = useTime();
  if (t < start || t > end) return null;
  const fade = t > end - 0.5 ? (end - t) / 0.5 : 1;
  return (
    <div style={{ position: 'absolute', inset: 0, zIndex: 25, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 34, opacity: clamp(fade, 0, 1), padding: '0 90px' }}>
      {players.map((p, i) => {
        const cp = Easing.easeOutBack(clamp((t - start - 0.25 - i * 0.28) / 0.7, 0, 1));
        return (
          <div key={i} style={{ width: 308, transform: `translateY(${(1 - cp) * 90}px) scale(${0.85 + 0.15 * cp})`, opacity: clamp(cp, 0, 1), borderRadius: 22, overflow: 'hidden', background: MV.panel, border: `1px solid ${MV.line}`, boxShadow: `0 26px 80px rgba(0,0,0,0.6)` }}>
            <div style={{ height: 322, overflow: 'hidden', position: 'relative' }}>
              {p.clip
                ? <VideoSprite src={p.clip} start={start} dur={end - start} rate={0.5} />
                : <img src={p.img} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', transform: `scale(${1.02 + 0.05 * clamp((t - start) / (end - start), 0, 1)})` }} />}
            </div>
            <div style={{ padding: '18px 14px 20px', textAlign: 'center', borderTop: `4px solid ${accent}` }}>
              <div style={{ fontFamily: '"Inter",sans-serif', fontWeight: 900, fontSize: 24, color: MV.text }}>{p.name}</div>
              <div style={{ fontFamily: '"Inter",sans-serif', fontWeight: 700, fontSize: 16, color: MV.muted, letterSpacing: '0.15em', marginTop: 5 }}>{p.role}</div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ── 5. Canada (96.5–134) ─────────────────────────────────────────────────────
function SceneCanada() {
  const { localTime: lt } = useSprite();
  const headerP = Easing.easeOutCubic(clamp(lt / 0.9, 0, 1));
  return (
    <div style={{ position: 'absolute', inset: 0, background: '#0a0c14' }}>
      {lt < 8 && <VideoSprite src="assets/stadium-wc.mp4" start={98.0} dur={6.5} rate={0.6} style={{ filter: 'brightness(0.25) saturate(0.7)' }} />}
      <ClipSprite id="vini" dim={0.12} />
      <ClipSprite id="neymar" dim={0.12} />
      <ClipSprite id="raphinha" dim={0.12} />
      <ClipSprite id="alisson" dim={0.12} />
      <div style={{ position: 'absolute', inset: 0, zIndex: 22, pointerEvents: 'none', background: `linear-gradient(90deg, rgba(213,43,30,0.22) 0%, transparent 30%, transparent 70%, rgba(213,43,30,0.18) 100%)` }} />
      <div style={{ position: 'absolute', top: 108, left: 0, right: 0, display: 'flex', justifyContent: 'center', zIndex: 26, opacity: headerP, transform: `translateY(${(1 - headerP) * -24}px)` }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 26, background: MV.panel, border: `1px solid ${MV.line}`, borderRadius: 999, padding: '16px 44px' }}>
          <FlagBRA w={80} />
          <span style={{ fontFamily: '"Inter",sans-serif', fontWeight: 900, fontSize: 40, color: MV.text, letterSpacing: '0.10em' }}>THE HEXA CHASE</span>
        </div>
      </div>
      <SquadGrid start={98.4} end={104.5} accent="#ffdf00" players={[
        { img: 'assets/squad/bra-1-Neymar.png', clip: 'assets/player-neymar.mp4', name: 'NEYMAR', role: 'THE VISIONARY · 34' },
        { img: 'assets/squad/bra-2-Vinicius-Junior.png', clip: 'assets/player-vini.mp4', name: 'VINICIUS JR', role: 'THE JOY' },
        { img: 'assets/squad/bra-3-Raphinha.png', clip: 'assets/player-raphinha.mp4', name: 'RAPHINHA', role: 'THE WIDE THREAT' },
        { img: 'assets/squad/bra-4-Bruno-Guimaraes.png', clip: 'assets/player-bruno.mp4', name: 'BRUNO GUIMARAES', role: 'THE CONDUCTOR' },
        { img: 'assets/squad/bra-5-Alisson.png', clip: 'assets/player-alisson.mp4', name: 'ALISSON', role: 'THE CALM' },
      ]} />
      <Sprite start={104.5} end={114.5}>
        <LowerThird start={104.8} name="VINICIUS JUNIOR" role="The Joy · Real Madrid" line="Two Champions League titles at 25. Dribbling that defies physics." accent="#ffdf00" />
      </Sprite>
      <Sprite start={114.5} end={120.5}>
        <LowerThird start={114.8} name="NEYMAR" role="The Visionary · 34" line="Drops deep now. Sees passes nobody else can imagine." accent="#ffdf00" />
      </Sprite>
      <Sprite start={120.5} end={124}>
        <LowerThird start={120.7} name="RAPHINHA" role="The Wide Threat" line="Stretches the world." accent="#ffdf00" />
      </Sprite>
      <Sprite start={124} end={134}>
        <LowerThird start={124.2} name="ALISSON" role="The Calm · Goalkeeper" line="The calmest man in football." accent="#ffdf00" />
      </Sprite>
      <Vignette strength={0.4} />
      <Letterbox />
    </div>
  );
}

// ── 6. Bosnia (134–166.5) ────────────────────────────────────────────────────
function SceneBosnia() {
  const { localTime: lt } = useSprite();
  const headerP = Easing.easeOutCubic(clamp(lt / 0.9, 0, 1));
  return (
    <div style={{ position: 'absolute', inset: 0, background: '#0a0c14' }}>
      <ClipSprite id="mar-hopeful" dim={0.5} />
      <ClipSprite id="hakimi" dim={0.12} />
      <ClipSprite id="ziyech" dim={0.12} />
      <ClipSprite id="amrabat" dim={0.12} />
      <ClipSprite id="khannouss" dim={0.12} />
      <div style={{ position: 'absolute', inset: 0, zIndex: 22, pointerEvents: 'none', background: `linear-gradient(90deg, rgba(0,35,149,0.26) 0%, transparent 30%, transparent 70%, rgba(254,203,0,0.14) 100%)` }} />
      <div style={{ position: 'absolute', top: 108, left: 0, right: 0, display: 'flex', justifyContent: 'center', zIndex: 26, opacity: headerP, transform: `translateY(${(1 - headerP) * -24}px)` }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 26, background: MV.panel, border: `1px solid ${MV.line}`, borderRadius: 999, padding: '16px 44px' }}>
          <FlagMAR w={80} />
          <span style={{ fontFamily: '"Inter",sans-serif', fontWeight: 900, fontSize: 40, color: MV.text, letterSpacing: '0.10em' }}>THE ATLAS LIONS</span>
        </div>
      </div>
      <SquadGrid start={134.5} end={143.5} accent="#c1272d" players={[
        { img: 'assets/squad/mar-1-Achraf-Hakimi.png', clip: 'assets/player-hakimi.mp4', name: 'ACHRAF HAKIMI', role: 'THE LIGHTNING BACK' },
        { img: 'assets/squad/mar-2-Hakim-Ziyech.png', clip: 'assets/player-ziyech.mp4', name: 'HAKIM ZIYECH', role: 'THE WAND' },
        { img: 'assets/squad/mar-3-Youssef-En-Nesyri.png', clip: 'assets/player-ennesyri.mp4', name: 'EN-NESYRI', role: 'THE SKYSCRAPER' },
        { img: 'assets/squad/mar-4-Sofyan-Amrabat.png', clip: 'assets/player-amrabat.mp4', name: 'SOFYAN AMRABAT', role: 'THE ENGINE' },
        { img: 'assets/squad/mar-5-Bilal-El-Khannouss.png', clip: 'assets/player-khannouss.mp4', name: 'EL KHANNOUSS', role: 'THE TANGIER KEY' },
      ]} />
      <Sprite start={143.5} end={153}>
        <LowerThird start={143.8} name="ACHRAF HAKIMI" role="The Lightning Back · PSG" line="Born in Madrid, heart in Rabat. His penalty eliminated Spain." accent="#c1272d" />
      </Sprite>
      <Sprite start={153} end={158}>
        <LowerThird start={153.2} name="HAKIM ZIYECH" role="The Wand · Left foot" line="Bends the night air." accent="#c1272d" />
      </Sprite>
      <Sprite start={158} end={161.5}>
        <LowerThird start={158.2} name="SOFYAN AMRABAT" role="The Engine · Midfield" line="The motor of the 2022 semifinal run." accent="#c1272d" />
      </Sprite>
      <Sprite start={161.5} end={169.5}>
        <LowerThird start={161.7} name="BILAL EL KHANNOUSS" role="The Tangier Key · Playmaker" line="The kid who unlocked Brazil in 2023." accent="#c1272d" />
      </Sprite>
      <Vignette strength={0.4} />
      <Letterbox />
    </div>
  );
}

// ── 7. The duel (166.5–186): ANIMATED split — Davies vs Dzeko ────────────────
function SceneDuel() {
  const { localTime: lt } = useSprite();
  const slideP = Easing.easeOutQuart(clamp(lt / 1.1, 0, 1));
  const vsP = Easing.easeOutBack(clamp((lt - 0.9) / 0.8, 0, 1));
  const shake = lt > 0.9 && lt < 1.25 ? Math.sin(lt * 160) * 7 * (1.25 - lt) / 0.35 : 0;
  return (
    <div style={{ position: 'absolute', inset: 0, background: '#05060a', transform: `translate(${shake}px, ${-shake}px)` }}>
      <div style={{ position: 'absolute', top: 0, bottom: 0, left: 0, width: '50%', overflow: 'hidden', transform: `translateX(${(1 - slideP) * -100}%)` }}>
        <ClipSprite id="duel-vini" style={{ filter: 'saturate(1.15) brightness(0.95)' }} />
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(90deg, rgba(0,156,59,0.34), transparent 65%)' }} />
        <div style={{ position: 'absolute', bottom: 150, left: 90, zIndex: 5, fontFamily: '"Inter",sans-serif', fontWeight: 900, fontSize: 62, color: '#fff', textShadow: '0 4px 26px rgba(0,0,0,0.9)' }}>
          THE JOY
          <div style={{ fontSize: 27, fontWeight: 700, color: MV.gold, letterSpacing: '0.2em', marginTop: 8 }}>VINICIUS · LIGHTNING</div>
        </div>
      </div>
      <div style={{ position: 'absolute', top: 0, bottom: 0, right: 0, width: '50%', overflow: 'hidden', transform: `translateX(${(1 - slideP) * 100}%)` }}>
        <ClipSprite id="duel-hakimi" style={{ filter: 'saturate(1.1) brightness(0.92)' }} />
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(270deg, rgba(193,39,45,0.36), transparent 65%)' }} />
        <div style={{ position: 'absolute', bottom: 150, right: 90, zIndex: 5, textAlign: 'right', fontFamily: '"Inter",sans-serif', fontWeight: 900, fontSize: 62, color: '#fff', textShadow: '0 4px 26px rgba(0,0,0,0.9)' }}>
          THE WALL OF SPEED
          <div style={{ fontSize: 27, fontWeight: 700, color: MV.gold, letterSpacing: '0.2em', marginTop: 8 }}>HAKIMI · LIGHTNING</div>
        </div>
      </div>
      <div style={{ position: 'absolute', top: 0, bottom: 0, left: 'calc(50% - 3px)', width: 6, background: `linear-gradient(180deg, transparent, ${MV.gold}, transparent)`, zIndex: 24, opacity: slideP }} />
      <div style={{ position: 'absolute', top: '50%', left: '50%', zIndex: 26, transform: `translate(-50%,-50%) scale(${vsP}) rotate(${(1 - vsP) * 20}deg)`, opacity: clamp(vsP, 0, 1), width: 210, height: 210, borderRadius: '50%', background: MV.panel, border: `5px solid ${MV.gold}`, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: `0 0 90px ${MV.gold}66` }}>
        <span style={{ fontFamily: '"Inter",sans-serif', fontWeight: 900, fontSize: 92, color: MV.gold }}>VS</span>
      </div>
      <Sprite start={179} end={186}>
        <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 27, background: 'rgba(0,0,0,0.55)' }}>
          <BigTitle size={74} color={MV.text} style={{ maxWidth: 1400 }}>
            “The Prophet\u2019s vision — five stars, one drought, one night in Tangier…”
          </BigTitle>
        </div>
      </Sprite>
      <Letterbox />
    </div>
  );
}

// ── 8. Match drama (186–244): the 67' double save, the 78' no-look goal ─────
function SceneDrama() {
  const { localTime: lt } = useSprite();
  const S = 186;
  const punch = (at, mag) => { const d = lt + S - at; return d > 0 && d < 0.4 ? 1 + mag * (1 - d / 0.4) : 1; };
  const zoom = punch(194.0, 0.06) * punch(223.5, 0.07);
  return (
    <div style={{ position: 'absolute', inset: 0, background: '#000', transform: `scale(${zoom})` }}>
      <ClipSprite id="drama-hakimi" dim={0.06} />
      <ClipSprite id="drama-alisson" dim={0.05} />
      <ClipSprite id="drama-nesyri" dim={0.06} />
      <ClipSprite id="bra-anxious" dim={0.05} />
      <ClipSprite id="drama-neymar" dim={0.06} />
      <ClipSprite id="drama-vini" dim={0.05} />
      <ClipSprite id="bra-euphoric" />
      <ClipSprite id="mar-crying" dim={0.05} />

      <Sprite start={186} end={194}>
        <ScoreBug start={S + 0.4} kor={0} cze={0} minute="67'" homeLabel="BRA" awayLabel="MAR" homeColor="#009c3b" awayColor="#c1272d" />
      </Sprite>
      <GoalFlash at={194.0} text="SAVED!" color="#e8eeff" />
      <GoalFlash at={199.2} text="OFF THE LINE!" color={MV.gold} />
      <Sprite start={194} end={223.5}>
        <ScoreBug start={194} kor={0} cze={0} minute="67'" homeLabel="BRA" awayLabel="MAR" homeColor="#009c3b" awayColor="#c1272d" />
      </Sprite>
      <KineticCaption start={203} dur={4} words={["THE", "KINGS", "ARE", "SHAKING"]} size={66} color="#e8eeff" y="60%" />
      <GoalFlash at={223.5} text="GOAL!" />
      <Confetti start={223.7} dur={10} />
      <Sprite start={223.5} end={230}>
        <ScoreBug start={223.5} kor={1} cze={0} minute="78'" homeLabel="BRA" awayLabel="MAR" homeColor="#009c3b" awayColor="#c1272d" />
      </Sprite>
      <Sprite start={230} end={244}>
        <VisionCard start={230.5} />
      </Sprite>
      <Vignette strength={0.42} />
      <Letterbox />
    </div>
  );
}

function VisionCard({ start }) {
  const t = useTime();
  const p = Easing.easeOutCubic(clamp((t - start) / 1.0, 0, 1));
  const c1 = Easing.easeOutBack(clamp((t - start - 1.6) / 0.6, 0, 1));
  const c2 = Easing.easeOutBack(clamp((t - start - 2.0) / 0.6, 0, 1));
  return (
    <div style={{ position: 'absolute', inset: 0, zIndex: 26, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 30, background: 'rgba(2,3,6,0.62)', opacity: p }}>
      <div style={{ background: MV.panel, border: `1px solid ${MV.line}`, borderRadius: 26, padding: '40px 86px', textAlign: 'center', boxShadow: '0 30px 120px rgba(0,0,0,0.7)' }}>
        <Kicker size={26}>The Prophet's Vision · Full Time</Kicker>
        <div style={{ display: 'flex', alignItems: 'center', gap: 50, marginTop: 26 }}>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 14 }}>
            <FlagBRA w={130} />
            <span style={{ fontFamily: '"Inter",sans-serif', fontWeight: 800, fontSize: 30, color: MV.text }}>BRAZIL</span>
          </div>
          <BigTitle size={140} color={MV.gold}>1 — 0</BigTitle>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 14 }}>
            <FlagMAR w={130} />
            <span style={{ fontFamily: '"Inter",sans-serif', fontWeight: 800, fontSize: 30, color: MV.text }}>MOROCCO</span>
          </div>
        </div>
        <div style={{ fontFamily: '"Inter",sans-serif', fontWeight: 600, fontSize: 25, color: MV.muted, marginTop: 22 }}>
          Vini Jr 78' · Neymar's no-look — but the Lions' roar echoes louder than the scoreline
        </div>
      </div>
      <div style={{ display: 'flex', gap: 40 }}>
        <div style={{ transform: `scale(${c1})`, opacity: clamp(c1, 0, 1), background: '#009c3b', borderRadius: 18, padding: '20px 44px', textAlign: 'center', boxShadow: '0 16px 50px rgba(0,156,59,0.4)' }}>
          <div style={{ fontFamily: '"Inter",sans-serif', fontWeight: 900, fontSize: 42, color: '#ffdf00' }}>HEXA</div>
          <div style={{ fontFamily: '"Inter",sans-serif', fontWeight: 800, fontSize: 22, color: '#eafff2', marginTop: 6 }}>COMMENT "HEXA" — BRAZIL WINS IT ALL</div>
        </div>
        <div style={{ transform: `scale(${c2})`, opacity: clamp(c2, 0, 1), background: '#c1272d', borderRadius: 18, padding: '20px 44px', textAlign: 'center', boxShadow: '0 16px 50px rgba(193,39,45,0.4)' }}>
          <div style={{ fontFamily: '"Inter",sans-serif', fontWeight: 900, fontSize: 42, color: '#fff' }}>LIONS</div>
          <div style={{ fontFamily: '"Inter",sans-serif', fontWeight: 800, fontSize: 22, color: '#ffe2de', marginTop: 6 }}>COMMENT "LIONS" — MOROCCO TOPS GROUP C</div>
        </div>
      </div>
    </div>
  );
}

// ── 9. Verdict (244–254.5): the motivated prediction ────────────────────────
function SceneVerdict() {
  const S = 244;
  return (
    <div style={{ position: 'absolute', inset: 0, background: '#0a0f1c' }}>
      <ClipSprite id="verdict-bg" dim={0.6} />
      <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 25 }}>
        <div style={{ background: MV.panel, border: `1px solid ${MV.line}`, borderRadius: 24, padding: '46px 80px', minWidth: 940, backdropFilter: 'blur(6px)' }}>
          <Kicker size={26}>Our Prediction — and why</Kicker>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 50, marginTop: 26 }}>
            <FlagBRA w={120} />
            <BigTitle size={120} color={MV.gold}>1 — 1</BigTitle>
            <FlagMAR w={120} />
          </div>
          <div style={{ marginTop: 24 }}>
            <StatLine start={S + 1.2} delay={0.0} label="Five stars" value="No nation has won more — but none since 2002" accent={MV.text} />
            <StatLine start={S + 1.2} delay={0.25} label="Tangier 2023" value="The last meeting belongs to Morocco — 2–1" accent={MV.text} />
            <StatLine start={S + 1.2} delay={0.5} label="The difference" value="One no-look pass nobody on Earth can defend" accent={MV.gold} />
          </div>
        </div>
      </div>
      <Vignette strength={0.5} />
      <Letterbox />
    </div>
  );
}

// ── 10. Mystery payoff (254.5–272): Legend No. 005 ───────────────────────────
function SceneMysteryPayoff() {
  const { localTime: lt } = useSprite();
  const S = 254.5;
  const inP = Easing.easeOutCubic(clamp((lt - 0.6) / 1.4, 0, 1));
  const plateP = Easing.easeOutBack(clamp((lt - 4.6) / 0.9, 0, 1));
  return (
    <div style={{ position: 'absolute', inset: 0, background: '#02030a' }}>
      <ClipSprite id="mystery-payoff" dim={0.12} />
      <div style={{ position: 'absolute', inset: 0, zIndex: 21, pointerEvents: 'none', opacity: 0.5, background: `radial-gradient(ellipse at ${22 + Math.sin(lt * 0.3) * 14}% 75%, rgba(213,43,30,0.14) 0%, transparent 45%), radial-gradient(ellipse at ${78 - Math.sin(lt * 0.22) * 12}% 30%, rgba(160,170,200,0.12) 0%, transparent 50%)` }} />
      <AmbientParticles start={S} dur={18} count={46} color="255,210,74" maxR={3.5} zIndex={22} />
      <div style={{ position: 'absolute', top: 118, left: 0, right: 0, textAlign: 'center', zIndex: 25, opacity: inP }}>
        <Kicker size={26} color="#a0c0e8">The Mystery Supporter · Legend No. 005</Kicker>
      </div>
      {plateP > 0 && (
        <div style={{ position: 'absolute', left: 110, bottom: 150, zIndex: 25, opacity: clamp(plateP, 0, 1), transform: `translateY(${(1 - plateP) * 50}px)` }}>
          <div style={{ background: 'rgba(8,14,26,0.88)', border: '1px solid rgba(232,160,160,0.35)', borderRadius: 18, padding: '28px 44px', backdropFilter: 'blur(6px)' }}>
            <div style={{ fontFamily: '"Inter",sans-serif', fontWeight: 900, fontSize: 54, color: '#e9f2ff' }}>THE FEATHERED PROPHET</div>
            <div style={{ fontFamily: '"Inter",sans-serif', fontWeight: 700, fontSize: 25, color: '#a0c0e8', letterSpacing: '0.2em', marginTop: 8 }}>EVERY USA WC MATCH SINCE 1990 · THE TORCH NEVER DIES</div>
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

// ── 11. App promo (272–290): pick-3 with the PAID animation library ──────────
function SceneApp() {
  const { localTime: lt } = useSprite();
  const S = 272;
  const inP = Easing.easeOutCubic(clamp(lt / 1.0, 0, 1));
  return (
    <div style={{ position: 'absolute', inset: 0, background: `linear-gradient(160deg, #0d2a20 0%, #07090f 70%)` }}>
      <div style={{ position: 'absolute', inset: 0, background: `radial-gradient(ellipse at 50% 20%, rgba(16,107,79,0.35) 0%, transparent 60%)` }} />
      <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 38, opacity: inP }}>
        <Kicker color="#7fd6b5" size={30}>The Prediction Game</Kicker>
        <BigTitle size={96} color="#fff" glow={MV.green}>worldcup26.world</BigTitle>
        <div style={{ fontFamily: '"Inter",sans-serif', fontWeight: 700, fontSize: 36, color: '#cfe9de' }}>
          Pick 3 teams. Every goal they score… scores for YOU.
        </div>
        <div style={{ display: 'flex', gap: 36, marginTop: 8 }}>
          <VideoCard clipId="app-messi" name="ARGENTINA" coef="x1.15" start={S} delay={1.2} accent="#75aadb" />
          <VideoCard clipId="app-vini" name="BRAZIL" coef="x1.10" start={S} delay={1.55} accent="#ffdf00" />
          <VideoCard clipId="app-son" name="SOUTH KOREA" coef="x2.40" start={S} delay={1.9} accent="#d4313f" />
        </div>
        <div style={{ fontFamily: '"Inter",sans-serif', fontWeight: 800, fontSize: 32, color: MV.gold, letterSpacing: '0.06em' }}>
          FREE TO PLAY · LIVE LEADERBOARD · 48 NATIONS
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
      <ClipSprite id="cta-bg" dim={0.68} />
      <AmbientParticles start={290} dur={10} count={28} />
      <div style={{ position: 'absolute', top: 190, left: 0, right: 0, textAlign: 'center', zIndex: 25, opacity: inP }}>
        <Kicker size={30}>Send this to the friend who doubts American soccer</Kicker>
        <div style={{ marginTop: 22 }}><TitleReveal text="JOIN THE LEGENDS" start={S + 0.4} size={88} color={MV.text} /></div>
      </div>
      <div style={{ position: 'absolute', inset: 0, zIndex: 26 }}>
        <CtaButton start={S} delay={1.2} label="SUBSCRIBE" icon="🔔" accent="#d4313f" x={500} />
        <CtaButton start={S} delay={1.6} label="LIKE" icon="👍" accent="#1f4fa3" x={960} />
        <CtaButton start={S} delay={2.0} label="SHARE" icon="📣" accent="#106b4f" x={1400} />
      </div>
      <Sprite start={294.5} end={300}>
        <NextMatchTease start={S + 4.5} />
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
        <span style={{ fontFamily: '"Inter",sans-serif', fontWeight: 900, fontSize: 30, color: MV.gold }}>⚽ THE LEGENDS CONTINUE · worldcup26.world</span>
      </div>
    </div>
  );
}
