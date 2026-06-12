// match-scenes.jsx — Episode 3: Canada vs Bosnia & Herzegovina (300s timeline).
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
      <KineticCaption start={1.2} dur={3.6} words={["NOBODY", "KNOWS", "HIS", "NAME"]} size={84} color="#e8eeff" />
      <KineticCaption start={5.4} dur={3.4} words={["EVERY", "MATCH", "SINCE", "1986"]} size={84} color={MV.gold} />
      <Sprite start={12.8} end={16}>
        <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 27, background: 'rgba(0,0,0,0.35)' }}>
          <TitleReveal text="THE LEAF IS HERE" start={12.9} size={130} color="#d52b1e" />
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
      <ClipSprite id="recap-son" dim={0.25} />
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
            KOR 1 — 0 CZE · Sonaldo, 41'
          </span>
        </div>
      )}
      {!showRecap && (<>
        <AmbientParticles start={26} dur={10} count={34} color="213,43,30" />
        <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 44 }}>
          <div style={{ opacity: p1, transform: `translateY(${(1 - p1) * -30}px)` }}>
            <Kicker>WorldCup26 Legends · Episode 3</Kicker>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 70, opacity: clamp(p2, 0, 1), transform: `scale(${p2})` }}>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 20 }}>
              <Waving><FlagCAN w={250} /></Waving>
              <BigTitle size={70} glow="#d52b1e">CANADA</BigTitle>
            </div>
            <BigTitle size={120} color={MV.gold}>VS</BigTitle>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 20 }}>
              <Waving speed={1.9}><FlagBIH w={250} /></Waving>
              <BigTitle size={52} glow="#fecb00">BOSNIA & HERZEGOVINA</BigTitle>
            </div>
          </div>
          <div style={{ opacity: p3, fontFamily: '"Inter",sans-serif', fontWeight: 600, fontSize: 32, color: MV.muted, letterSpacing: '0.08em' }}>
            GROUP B · BMO FIELD, TORONTO · JUNE 12, 2026
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
          {[['50,000', 'CANADIANS'], ['1986', 'ZERO GOALS, GOODBYE'], ['36 YRS', 'THE WAIT THAT FOLLOWED'], ['1st', 'EVER CAN–BIH WC MEETING']].map(([v, l], i) => (
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
      <ClipSprite id="history-davies" style={{ filter: 'brightness(0.55) saturate(0.55) sepia(0.25) contrast(1.1)' }} />
      <ClipSprite id="history-dzeko" style={{ filter: 'brightness(0.5) saturate(0.45) sepia(0.35) contrast(1.12)' }} />
      <ClipSprite id="history-bg" style={{ filter: 'brightness(0.3) saturate(0.5) sepia(0.3)' }} />
      <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse at center, transparent 30%, rgba(5,6,10,0.82) 100%)' }} />
      <AmbientParticles start={46.5} dur={50} count={26} maxR={4} />
      <div style={{ position: 'absolute', top: 112, left: 0, right: 0, textAlign: 'center', zIndex: 26 }}>
        <Kicker size={26}>Chapter One · Two Impossible Lives</Kicker>
      </div>
      <KineticCaption start={S + 1.4} dur={4.4} words={["BORN", "IN", "A", "REFUGEE", "CAMP"]} size={76} color="#e8eeff" y="62%" />
      <KineticCaption start={S + 12.6} dur={4.4} words={["RAISED", "IN", "A", "WAR"]} size={84} color="#fecb00" y="62%" />
      <HistoryPlate start={S + 23.5} end={S + 32} year="MEXICO · 1986" venue="CANADA'S FIRST WORLD CUP" score="0 GOALS" note="Three games. Zero goals. Then a wait of thirty-six years." accent={MV.text} stamp="GOODBYE" />
      <HistoryPlate start={S + 32} end={S + 42.5} year="QATAR · 2022" venue="THE WAIT ENDS" score="HIS HEADER" note="Alphonso Davies — the kid from the refugee camp — scores Canada's FIRST World Cup goal in history." accent="#d52b1e" />
      <HistoryPlate start={S + 42.5} end={S + 50} year="TONIGHT · 2026" venue="BOSNIA'S 2ND WORLD CUP EVER" score="1st MEETING" note="Two nations that defied history. Never met on this stage — until tonight." accent={MV.gold} />
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
            <div style={{ height: 322, overflow: 'hidden' }}>
              <img src={p.img} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', transform: `scale(${1.02 + 0.05 * clamp((t - start) / (end - start), 0, 1)})` }} />
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
      {lt < 8 && <img src="assets/squad/can-1-Alphonso-Davies.png" alt="" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', filter: 'brightness(0.22) saturate(0.7)' }} />}
      <ClipSprite id="davies" dim={0.12} />
      <ClipSprite id="david" dim={0.12} />
      <ClipSprite id="eustaquio" dim={0.12} />
      <ClipSprite id="buchanan" dim={0.12} />
      <div style={{ position: 'absolute', inset: 0, zIndex: 22, pointerEvents: 'none', background: `linear-gradient(90deg, rgba(213,43,30,0.22) 0%, transparent 30%, transparent 70%, rgba(213,43,30,0.18) 100%)` }} />
      <div style={{ position: 'absolute', top: 108, left: 0, right: 0, display: 'flex', justifyContent: 'center', zIndex: 26, opacity: headerP, transform: `translateY(${(1 - headerP) * -24}px)` }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 26, background: MV.panel, border: `1px solid ${MV.line}`, borderRadius: 999, padding: '16px 44px' }}>
          <FlagCAN w={80} />
          <span style={{ fontFamily: '"Inter",sans-serif', fontWeight: 900, fontSize: 40, color: MV.text, letterSpacing: '0.10em' }}>THE NORTHERN STORM</span>
        </div>
      </div>
      <SquadGrid start={97} end={104.5} accent="#d52b1e" players={[
        { img: 'assets/squad/can-1-Alphonso-Davies.png', name: 'ALPHONSO DAVIES', role: 'THE LIGHTNING BOLT' },
        { img: 'assets/squad/can-2-Jonathan-David.png', name: 'JONATHAN DAVID', role: 'THE SILENT ASSASSIN' },
        { img: 'assets/squad/can-3-Stephen-Eustaquio.png', name: 'STEPHEN EUSTAQUIO', role: 'THE METRONOME' },
        { img: 'assets/squad/can-4-Cyle-Larin.png', name: 'CYLE LARIN', role: 'THE FINISHER' },
        { img: 'assets/squad/can-5-Tajon-Buchanan.png', name: 'TAJON BUCHANAN', role: 'THE SPARK' },
      ]} />
      <Sprite start={104.5} end={114.5}>
        <LowerThird start={104.8} name="ALPHONSO DAVIES" role="The Lightning Bolt · Left flank" line="Refugee camp to Champions League winner. The fastest defender alive." accent="#d52b1e" />
      </Sprite>
      <Sprite start={114.5} end={121}>
        <LowerThird start={114.8} name="JONATHAN DAVID" role="The Silent Assassin · Striker" line="Scores goals without ever seeming to try." accent="#d52b1e" />
      </Sprite>
      <Sprite start={121} end={126}>
        <LowerThird start={121.2} name="STEPHEN EUSTAQUIO" role="The Metronome · Midfield" line="Makes 50,000 people breathe in rhythm." accent="#d52b1e" />
      </Sprite>
      <Sprite start={126} end={134}>
        <LowerThird start={126.2} name="TAJON BUCHANAN" role="The Spark · Right wing" line="No fear. Not this time." accent="#d52b1e" />
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
      <ClipSprite id="bih-hopeful" dim={0.5} />
      <ClipSprite id="dzeko" dim={0.12} />
      <ClipSprite id="pjanic" dim={0.12} />
      <ClipSprite id="sesko" dim={0.12} />
      <div style={{ position: 'absolute', inset: 0, zIndex: 22, pointerEvents: 'none', background: `linear-gradient(90deg, rgba(0,35,149,0.26) 0%, transparent 30%, transparent 70%, rgba(254,203,0,0.14) 100%)` }} />
      <div style={{ position: 'absolute', top: 108, left: 0, right: 0, display: 'flex', justifyContent: 'center', zIndex: 26, opacity: headerP, transform: `translateY(${(1 - headerP) * -24}px)` }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 26, background: MV.panel, border: `1px solid ${MV.line}`, borderRadius: 999, padding: '16px 44px' }}>
          <FlagBIH w={80} />
          <span style={{ fontFamily: '"Inter",sans-serif', fontWeight: 900, fontSize: 40, color: MV.text, letterSpacing: '0.10em' }}>THE MIRACLE THAT WALKS</span>
        </div>
      </div>
      <SquadGrid start={134.5} end={144.5} accent="#fecb00" players={[
        { img: 'assets/squad/bih-1-Edin-Dzeko.png', name: 'EDIN DZEKO', role: 'THE DIAMOND · 40' },
        { img: 'assets/squad/bih-2-Miralem-Pjanic.png', name: 'MIRALEM PJANIC', role: 'THE CARTOGRAPHER' },
        { img: 'assets/squad/bih-3-Benjamin-Sesko.png', name: 'BENJAMIN SESKO', role: 'THE HAMMER' },
        { img: 'assets/squad/bih-4-Sead-Kolasinac.png', name: 'SEAD KOLASINAC', role: 'THE WARRIOR' },
        { img: 'assets/squad/bih-5-Nikola-Vasilj.png', name: 'NIKOLA VASILJ', role: 'THE WALL' },
      ]} />
      <Sprite start={144.5} end={154.5}>
        <LowerThird start={144.8} name="EDIN DZEKO" role="The Bosnian Diamond · Striker" line="65 goals for a nation of 3.5 million. His very last dance." accent="#fecb00" />
      </Sprite>
      <Sprite start={154.5} end={160.5}>
        <LowerThird start={154.7} name="MIRALEM PJANIC" role="The Cartographer · Midfield" line="His passes map dimensions others cannot see." accent="#fecb00" />
      </Sprite>
      <Sprite start={160.5} end={166.5}>
        <LowerThird start={160.7} name="BENJAMIN SESKO" role="The Hammer · Forward" line="The young giant who strikes without warning." accent="#fecb00" />
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
        <ClipSprite id="duel-davies" style={{ filter: 'saturate(1.15) brightness(0.95)' }} />
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(90deg, rgba(213,43,30,0.32), transparent 65%)' }} />
        <div style={{ position: 'absolute', bottom: 150, left: 90, zIndex: 5, fontFamily: '"Inter",sans-serif', fontWeight: 900, fontSize: 62, color: '#fff', textShadow: '0 4px 26px rgba(0,0,0,0.9)' }}>
          THE LIGHTNING
          <div style={{ fontSize: 27, fontWeight: 700, color: MV.gold, letterSpacing: '0.2em', marginTop: 8 }}>DAVIES · AGE 24</div>
        </div>
      </div>
      <div style={{ position: 'absolute', top: 0, bottom: 0, right: 0, width: '50%', overflow: 'hidden', transform: `translateX(${(1 - slideP) * 100}%)` }}>
        <ClipSprite id="duel-dzeko" style={{ filter: 'saturate(1.1) brightness(0.92)' }} />
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(270deg, rgba(0,35,149,0.36), transparent 65%)' }} />
        <div style={{ position: 'absolute', bottom: 150, right: 90, zIndex: 5, textAlign: 'right', fontFamily: '"Inter",sans-serif', fontWeight: 900, fontSize: 62, color: '#fff', textShadow: '0 4px 26px rgba(0,0,0,0.9)' }}>
          THE DIAMOND
          <div style={{ fontSize: 27, fontWeight: 700, color: MV.gold, letterSpacing: '0.2em', marginTop: 8 }}>DZEKO · AGE 40</div>
        </div>
      </div>
      <div style={{ position: 'absolute', top: 0, bottom: 0, left: 'calc(50% - 3px)', width: 6, background: `linear-gradient(180deg, transparent, ${MV.gold}, transparent)`, zIndex: 24, opacity: slideP }} />
      <div style={{ position: 'absolute', top: '50%', left: '50%', zIndex: 26, transform: `translate(-50%,-50%) scale(${vsP}) rotate(${(1 - vsP) * 20}deg)`, opacity: clamp(vsP, 0, 1), width: 210, height: 210, borderRadius: '50%', background: MV.panel, border: `5px solid ${MV.gold}`, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: `0 0 90px ${MV.gold}66` }}>
        <span style={{ fontFamily: '"Inter",sans-serif', fontWeight: 900, fontSize: 92, color: MV.gold }}>VS</span>
      </div>
      <Sprite start={179} end={186}>
        <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 27, background: 'rgba(0,0,0,0.55)' }}>
          <BigTitle size={74} color={MV.text} style={{ maxWidth: 1400 }}>
            “What they saw will give you chills…”
          </BigTitle>
        </div>
      </Sprite>
      <Letterbox />
    </div>
  );
}

// ── 8. Match drama (186–244) ─────────────────────────────────────────────────
function SceneDrama() {
  const { localTime: lt } = useSprite();
  const S = 186;
  // zoom-punch pattern interrupt on the save and the header
  const punch = (at, mag) => { const d = lt + S - at; return d > 0 && d < 0.4 ? 1 + mag * (1 - d / 0.4) : 1; };
  const zoom = punch(197.5, 0.06) * punch(225.0, 0.06);
  return (
    <div style={{ position: 'absolute', inset: 0, background: '#000', transform: `scale(${zoom})` }}>
      <ClipSprite id="drama-davies" dim={0.06} />
      <ClipSprite id="drama-larin" dim={0.06} />
      <ClipSprite id="can-anxious" dim={0.05} />
      <ClipSprite id="drama-pjanic" dim={0.08} />
      <ClipSprite id="drama-dzeko" dim={0.05} />
      <ClipSprite id="bih-crying" dim={0.05} />
      <ClipSprite id="can-euphoric" dim={0.1} />

      <Sprite start={186} end={199.5}>
        <ScoreBug start={S + 0.4} kor={0} cze={0} minute="31'" />
      </Sprite>
      <GoalFlash at={197.5} text="SAVED!" color="#e8eeff" />
      <Sprite start={199.5} end={229}>
        <ScoreBug start={S + 13.5} kor={0} cze={0} minute="71'" />
      </Sprite>
      <KineticCaption start={206.5} dur={4} words={["50,000", "HEARTS...", "SLOWING", "DOWN"]} size={66} color="#e8eeff" y="60%" />
      <GoalFlash at={225.0} text="WIDE!" color={MV.gold} />
      <Sprite start={234} end={244}>
        <RespectCard start={234.5} />
      </Sprite>
      <Vignette strength={0.42} />
      <Letterbox />
    </div>
  );
}

function RespectCard({ start }) {
  const t = useTime();
  const local = t - start;
  const p = Easing.easeOutCubic(clamp(local / 1.0, 0, 1));
  return (
    <div style={{ position: 'absolute', inset: 0, zIndex: 26, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(2,3,6,0.62)', opacity: p }}>
      <div style={{ background: MV.panel, border: `1px solid ${MV.line}`, borderRadius: 26, padding: '56px 100px', textAlign: 'center', transform: `scale(${0.92 + 0.08 * p})`, boxShadow: '0 30px 120px rgba(0,0,0,0.7)' }}>
        <Kicker size={26}>Full Time · BMO Field</Kicker>
        <div style={{ display: 'flex', alignItems: 'center', gap: 56, marginTop: 36 }}>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16 }}>
            <FlagCAN w={150} />
            <span style={{ fontFamily: '"Inter",sans-serif', fontWeight: 800, fontSize: 34, color: MV.text }}>CANADA</span>
          </div>
          <BigTitle size={160} color={MV.gold}>0 — 0</BigTitle>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16 }}>
            <FlagBIH w={150} />
            <span style={{ fontFamily: '"Inter",sans-serif', fontWeight: 800, fontSize: 30, color: MV.text }}>BOSNIA & HERZ.</span>
          </div>
        </div>
        <div style={{ fontFamily: '"Inter",sans-serif', fontWeight: 900, fontSize: 46, color: '#d52b1e', marginTop: 32, letterSpacing: '0.3em' }}>R E S P E C T</div>
        <div style={{ fontFamily: '"Inter",sans-serif', fontWeight: 600, fontSize: 26, color: MV.muted, marginTop: 14 }}>
          Davies & Dzeko swap shirts — the speed of youth, the wisdom of age
        </div>
      </div>
    </div>
  );
}

// ── 9. Verdict (244–254.5) ───────────────────────────────────────────────────
function SceneVerdict() {
  const S = 244;
  return (
    <div style={{ position: 'absolute', inset: 0, background: '#0a0f1c' }}>
      <ClipSprite id="verdict-bg" dim={0.6} />
      <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 25 }}>
        <div style={{ background: MV.panel, border: `1px solid ${MV.line}`, borderRadius: 24, padding: '46px 80px', minWidth: 900, backdropFilter: 'blur(6px)' }}>
          <Kicker size={26}>Group B · After this match</Kicker>
          <div style={{ marginTop: 22 }}>
            <StatLine start={S + 0.7} delay={0.0} label="· Canada" value="1 pt · the wait continues" accent={MV.gold} />
            <StatLine start={S + 0.7} delay={0.22} label="· Bosnia & Herzegovina" value="1 pt · the Diamond still sparkles" accent={MV.text} />
            <StatLine start={S + 0.7} delay={0.44} label="· Switzerland — Qatar" value="still to move" accent={MV.muted} />
          </div>
          <div style={{ fontFamily: '"Inter",sans-serif', fontWeight: 700, fontSize: 30, color: MV.gold, marginTop: 32, textAlign: 'center' }}>
            Group B is a chess game now.
          </div>
        </div>
      </div>
      <Vignette strength={0.5} />
      <Letterbox />
    </div>
  );
}

// ── 10. Mystery payoff (254.5–272): Legend No. 003 ───────────────────────────
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
        <Kicker size={26} color="#e8a0a0">The Mystery Supporter · Legend No. 003</Kicker>
      </div>
      {plateP > 0 && (
        <div style={{ position: 'absolute', left: 110, bottom: 150, zIndex: 25, opacity: clamp(plateP, 0, 1), transform: `translateY(${(1 - plateP) * 50}px)` }}>
          <div style={{ background: 'rgba(26,8,10,0.88)', border: '1px solid rgba(232,160,160,0.35)', borderRadius: 18, padding: '28px 44px', backdropFilter: 'blur(6px)' }}>
            <div style={{ fontFamily: '"Inter",sans-serif', fontWeight: 900, fontSize: 54, color: '#ffe9e9' }}>THE MAPLE LEAF MAN</div>
            <div style={{ fontFamily: '"Inter",sans-serif', fontWeight: 700, fontSize: 25, color: '#e8a0a0', letterSpacing: '0.2em', marginTop: 8 }}>EVERY CANADA MATCH SINCE 1986 · IDENTITY UNKNOWN</div>
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
          <VideoCard clipId="app-son" name="SOUTH KOREA" coef="x2.40" start={S} delay={1.55} accent="#d4313f" />
          <VideoCard clipId="app-davies" name="CANADA" coef="x2.10" start={S} delay={1.9} accent="#d52b1e" />
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
        <Kicker size={30}>Enjoyed the story?</Kicker>
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
        <span style={{ fontFamily: '"Inter",sans-serif', fontWeight: 900, fontSize: 30, color: MV.gold }}>🇺🇸 THE USA OPENS ITS WORLD CUP · worldcup26.world</span>
      </div>
    </div>
  );
}
