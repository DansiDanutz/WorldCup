// match-scenes.jsx — Episode 4: USA vs Paraguay (300s timeline).
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
      <KineticCaption start={1.2} dur={3.6} words={["HER", "TORCH", "NEVER", "DIES"]} size={84} color="#e8eeff" />
      <KineticCaption start={5.4} dur={3.4} words={["EVERY", "MATCH", "SINCE", "1990"]} size={84} color={MV.gold} />
      <Sprite start={12.8} end={16}>
        <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 27, background: 'rgba(0,0,0,0.35)' }}>
          <TitleReveal text="LIBERTY COMES HOME" start={12.9} size={118} color="#e8eeff" />
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
      <ClipSprite id="recap-davies" dim={0.25} />
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
            EPISODE 3 · OUR PREDICTION: CAN 0—0 BIH
          </span>
        </div>
      )}
      {!showRecap && (<>
        <AmbientParticles start={26} dur={10} count={34} color="213,43,30" />
        <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 44 }}>
          <div style={{ opacity: p1, transform: `translateY(${(1 - p1) * -30}px)` }}>
            <Kicker>WorldCup26 Legends · Episode 4</Kicker>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 70, opacity: clamp(p2, 0, 1), transform: `scale(${p2})` }}>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 20 }}>
              <Waving><FlagUSA w={250} /></Waving>
              <BigTitle size={70} glow="#3c3b6e">UNITED STATES</BigTitle>
            </div>
            <BigTitle size={120} color={MV.gold}>VS</BigTitle>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 20 }}>
              <Waving speed={1.9}><FlagPAR w={250} /></Waving>
              <BigTitle size={60} glow="#d52b1e">PARAGUAY</BigTitle>
            </div>
          </div>
          <div style={{ opacity: p3, fontFamily: '"Inter",sans-serif', fontWeight: 600, fontSize: 32, color: MV.muted, letterSpacing: '0.08em' }}>
            GROUP D · AT&T STADIUM, TEXAS · JUNE 12, 2026
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
          {[['80,000', 'TEXANS'], ['1930', 'THEY MET AT THE FIRST WC'], ['3—0', 'USA WON IT'], ['96 YRS', 'UNTIL THE REMATCH... TONIGHT']].map(([v, l], i) => (
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
        <Kicker size={26}>Chapter One · The Oldest Secret in World Cup History</Kicker>
      </div>
      <KineticCaption start={S + 1.4} dur={4.0} words={["THE", "OLDEST", "SECRET"]} size={84} color="#e8eeff" y="62%" />
      <HistoryPlate start={S + 8} end={S + 19} year="MONTEVIDEO · 1930" venue="THE VERY FIRST WORLD CUP" score="USA 3—0" note="The United States beat Paraguay at the first World Cup ever played." accent={MV.gold} />
      <HistoryPlate start={S + 19} end={S + 29} year="BERT PATENAUDE · AGE 20" venue="ALL THREE GOALS" score="1st HAT-TRICK" note="The first hat-trick in World Cup history — scored by an American, against Paraguay." accent="#3c3b6e" stamp="HISTORY" />
      <HistoryPlate start={S + 29} end={S + 39.5} year="THE RECORD BOOKS LIED" venue="CREDITED TO AN ARGENTINE" score="76 YEARS" note="FIFA only corrected it in 2006. The honor came home... seven decades late." accent="#d52b1e" stamp="FIXED IN 2006" />
      <HistoryPlate start={S + 39.5} end={S + 50} year="TONIGHT · 2026" venue="96 YEARS LATER" score="REMATCH" note="Same two nations. The biggest stage on Earth." accent={MV.gold} />
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
      {lt < 8 && <VideoSprite src="assets/stadium-att.mp4" start={96.8} dur={7.7} rate={0.6} style={{ filter: 'brightness(0.25) saturate(0.7)' }} />}
      <ClipSprite id="pulisic" dim={0.12} />
      <ClipSprite id="balogun" dim={0.12} />
      <ClipSprite id="mckennie" dim={0.12} />
      <ClipSprite id="adams" dim={0.12} />
      <div style={{ position: 'absolute', inset: 0, zIndex: 22, pointerEvents: 'none', background: `linear-gradient(90deg, rgba(213,43,30,0.22) 0%, transparent 30%, transparent 70%, rgba(213,43,30,0.18) 100%)` }} />
      <div style={{ position: 'absolute', top: 108, left: 0, right: 0, display: 'flex', justifyContent: 'center', zIndex: 26, opacity: headerP, transform: `translateY(${(1 - headerP) * -24}px)` }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 26, background: MV.panel, border: `1px solid ${MV.line}`, borderRadius: 999, padding: '16px 44px' }}>
          <FlagUSA w={80} />
          <span style={{ fontFamily: '"Inter",sans-serif', fontWeight: 900, fontSize: 40, color: MV.text, letterSpacing: '0.10em' }}>THE GOLDEN GENERATION</span>
        </div>
      </div>
      <SquadGrid start={97.2} end={104.5} accent="#3c3b6e" players={[
        { img: 'assets/squad/usa-1-Christian-Pulisic.png', clip: 'assets/player-pulisic.mp4', name: 'CHRISTIAN PULISIC', role: 'THE CAPTAIN' },
        { img: 'assets/squad/usa-2-Folarin-Balogun.png', clip: 'assets/player-balogun.mp4', name: 'FOLARIN BALOGUN', role: 'THE COLD-BLOODED 9' },
        { img: 'assets/squad/usa-3-Weston-McKennie.png', clip: 'assets/player-mckennie.mp4', name: 'WESTON McKENNIE', role: 'THE ENGINE' },
        { img: 'assets/squad/usa-4-Tyler-Adams.png', clip: 'assets/player-adams.mp4', name: 'TYLER ADAMS', role: 'THE HEARTBEAT' },
        { img: 'assets/squad/usa-5-Giovanni-Reyna.png', clip: 'assets/player-reyna.mp4', name: 'GIO REYNA', role: 'THE X-FACTOR' },
      ]} />
      <Sprite start={104.5} end={114.5}>
        <LowerThird start={104.8} name="CHRISTIAN PULISIC" role="The Captain · AC Milan" line="Carried American soccer from its darkest hours to this night." accent="#3c3b6e" />
      </Sprite>
      <Sprite start={114.5} end={121}>
        <LowerThird start={114.8} name="FOLARIN BALOGUN" role="The Cold-Blooded 9 · Striker" line="Ice in his veins, goals in his boots." accent="#3c3b6e" />
      </Sprite>
      <Sprite start={121} end={126}>
        <LowerThird start={121.2} name="WESTON McKENNIE" role="The Engine · Midfield" line="The Texan who never stops running — tonight, at home." accent="#3c3b6e" />
      </Sprite>
      <Sprite start={126} end={134}>
        <LowerThird start={126.2} name="TYLER ADAMS" role="The Heartbeat · Midfield" line="80,000 believers. No more promises." accent="#3c3b6e" />
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
      <ClipSprite id="par-hopeful" dim={0.5} />
      <ClipSprite id="almiron" dim={0.12} />
      <ClipSprite id="enciso" dim={0.12} />
      <ClipSprite id="ggomez" dim={0.12} />
      <div style={{ position: 'absolute', inset: 0, zIndex: 22, pointerEvents: 'none', background: `linear-gradient(90deg, rgba(0,35,149,0.26) 0%, transparent 30%, transparent 70%, rgba(254,203,0,0.14) 100%)` }} />
      <div style={{ position: 'absolute', top: 108, left: 0, right: 0, display: 'flex', justifyContent: 'center', zIndex: 26, opacity: headerP, transform: `translateY(${(1 - headerP) * -24}px)` }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 26, background: MV.panel, border: `1px solid ${MV.line}`, borderRadius: 999, padding: '16px 44px' }}>
          <FlagPAR w={80} />
          <span style={{ fontFamily: '"Inter",sans-serif', fontWeight: 900, fontSize: 40, color: MV.text, letterSpacing: '0.10em' }}>THE QUIET STEEL</span>
        </div>
      </div>
      <SquadGrid start={134.5} end={144.5} accent="#d52b1e" players={[
        { img: 'assets/squad/par-1-MiguelAlmiron.png', clip: 'assets/player-almiron.mp4', name: 'MIGUEL ALMIRON', role: 'THE AMERICAN EXPERT' },
        { img: 'assets/squad/par-2-JulioEnciso.png', clip: 'assets/player-enciso.mp4', name: 'JULIO ENCISO', role: 'THE WONDERKID' },
        { img: 'assets/squad/par-3-GustavoGomez.png', clip: 'assets/player-ggomez.mp4', name: 'GUSTAVO GOMEZ', role: 'THE WALL' },
        { img: 'assets/squad/par-4-OmarAlderete.png', clip: 'assets/player-alderete.mp4', name: 'OMAR ALDERETE', role: 'THE GUARDIAN' },
        { img: 'assets/squad/par-5-DiegoGomez.png', clip: 'assets/player-dgomez.mp4', name: 'DIEGO GOMEZ', role: 'THE FUTURE' },
      ]} />
      <Sprite start={144.5} end={152.5}>
        <LowerThird start={144.8} name="MIGUEL ALMIRON" role="The American Expert · Winger" line="Six Premier League years. He knows these stadiums intimately." accent="#d52b1e" />
      </Sprite>
      <Sprite start={152.5} end={162}>
        <LowerThird start={152.7} name="JULIO ENCISO" role="The Wonderkid · Brighton" line="Dances with the recklessness of youth." accent="#d52b1e" />
      </Sprite>
      <Sprite start={162} end={169.5}>
        <LowerThird start={162.2} name="GUSTAVO GOMEZ" role="The Wall · Captain" line="A wall of Paraguayan defiance." accent="#d52b1e" />
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
        <ClipSprite id="duel-pulisic" style={{ filter: 'saturate(1.15) brightness(0.95)' }} />
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(90deg, rgba(60,59,110,0.36), transparent 65%)' }} />
        <div style={{ position: 'absolute', bottom: 150, left: 90, zIndex: 5, fontFamily: '"Inter",sans-serif', fontWeight: 900, fontSize: 62, color: '#fff', textShadow: '0 4px 26px rgba(0,0,0,0.9)' }}>
          THE CAPTAIN
          <div style={{ fontSize: 27, fontWeight: 700, color: MV.gold, letterSpacing: '0.2em', marginTop: 8 }}>PULISIC · THE BURDEN</div>
        </div>
      </div>
      <div style={{ position: 'absolute', top: 0, bottom: 0, right: 0, width: '50%', overflow: 'hidden', transform: `translateX(${(1 - slideP) * 100}%)` }}>
        <ClipSprite id="duel-enciso" style={{ filter: 'saturate(1.1) brightness(0.92)' }} />
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(270deg, rgba(213,43,30,0.34), transparent 65%)' }} />
        <div style={{ position: 'absolute', bottom: 150, right: 90, zIndex: 5, textAlign: 'right', fontFamily: '"Inter",sans-serif', fontWeight: 900, fontSize: 62, color: '#fff', textShadow: '0 4px 26px rgba(0,0,0,0.9)' }}>
          THE WONDERKID
          <div style={{ fontSize: 27, fontWeight: 700, color: MV.gold, letterSpacing: '0.2em', marginTop: 8 }}>ENCISO · THE FREEDOM</div>
        </div>
      </div>
      <div style={{ position: 'absolute', top: 0, bottom: 0, left: 'calc(50% - 3px)', width: 6, background: `linear-gradient(180deg, transparent, ${MV.gold}, transparent)`, zIndex: 24, opacity: slideP }} />
      <div style={{ position: 'absolute', top: '50%', left: '50%', zIndex: 26, transform: `translate(-50%,-50%) scale(${vsP}) rotate(${(1 - vsP) * 20}deg)`, opacity: clamp(vsP, 0, 1), width: 210, height: 210, borderRadius: '50%', background: MV.panel, border: `5px solid ${MV.gold}`, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: `0 0 90px ${MV.gold}66` }}>
        <span style={{ fontFamily: '"Inter",sans-serif', fontWeight: 900, fontSize: 92, color: MV.gold }}>VS</span>
      </div>
      <Sprite start={179} end={186}>
        <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 27, background: 'rgba(0,0,0,0.55)' }}>
          <BigTitle size={74} color={MV.text} style={{ maxWidth: 1400 }}>
            “Our prediction — built on 1930, home pressure, and Paraguayan steel…”
          </BigTitle>
        </div>
      </Sprite>
      <Letterbox />
    </div>
  );
}

// ── 8. Match drama (186–244): goal, equalizer, the freeze-frame cliffhanger ──
function SceneDrama() {
  const { localTime: lt } = useSprite();
  const S = 186;
  const punch = (at, mag) => { const d = lt + S - at; return d > 0 && d < 0.4 ? 1 + mag * (1 - d / 0.4) : 1; };
  const zoom = punch(195.0, 0.06) * punch(203.5, 0.05);
  const frozen = lt + S >= 229.5;
  return (
    <div style={{ position: 'absolute', inset: 0, background: '#000', transform: `scale(${zoom})` }}>
      <ClipSprite id="drama-pulisic" dim={0.06} />
      <ClipSprite id="drama-goal" dim={0.05} />
      <ClipSprite id="usa-euphoric" />
      <ClipSprite id="drama-almiron" dim={0.08} />
      <ClipSprite id="par-euphoric" />
      <ClipSprite id="usa-anxious" dim={0.05} />
      <ClipSprite id="drama-enciso" dim={0.05} />
      <ClipSprite id="freeze-enciso" dim={0} style={{ filter: frozen ? 'saturate(0.45) contrast(1.25) brightness(0.8)' : 'none' }} />

      <Sprite start={186} end={195}>
        <ScoreBug start={S + 0.4} kor={0} cze={0} minute="34'" homeLabel="USA" awayLabel="PAR" homeColor="#3c3b6e" awayColor="#d52b1e" />
      </Sprite>
      <GoalFlash at={195.0} text="GOAL!" />
      <Confetti start={195.2} dur={8} />
      <Sprite start={195} end={203.5}>
        <ScoreBug start={195} kor={1} cze={0} minute="34'" homeLabel="USA" awayLabel="PAR" homeColor="#3c3b6e" awayColor="#d52b1e" />
      </Sprite>
      <GoalFlash at={203.5} text="1 — 1" color="#d52b1e" />
      <Sprite start={203.5} end={229.5}>
        <ScoreBug start={203.5} kor={1} cze={1} minute="61'" homeLabel="USA" awayLabel="PAR" homeColor="#3c3b6e" awayColor="#d52b1e" />
      </Sprite>
      <KineticCaption start={211} dur={4} words={["THE", "HEAT", "PRESSES", "DOWN"]} size={66} color="#e8eeff" y="60%" />

      {/* THE FREEZE: time stops with Enciso 40 yards out */}
      <Sprite start={229.5} end={244}>
        <FreezeCard start={229.5} />
      </Sprite>
      <Vignette strength={0.42} />
      <Letterbox />
    </div>
  );
}

// Freeze-frame cliffhanger + comment-bait card (Ep4 innovation).
function FreezeCard({ start }) {
  const t = useTime();
  const local = t - start;
  const p = Easing.easeOutCubic(clamp(local / 0.8, 0, 1));
  const cardP = Easing.easeOutBack(clamp((local - 6.6) / 0.9, 0, 1));
  return (
    <div style={{ position: 'absolute', inset: 0, zIndex: 26 }}>
      <div style={{ position: 'absolute', inset: 0, background: `radial-gradient(ellipse at center, transparent 30%, rgba(0,0,0,${0.55 * p}) 100%)` }} />
      <div style={{ position: 'absolute', top: 130, left: 0, right: 0, textAlign: 'center', opacity: p }}>
        <Kicker size={28} color="#e8eeff">78' · The story stops here</Kicker>
      </div>
      <KineticCaption start={start + 1.2} dur={4.8} words={["WHAT", "HAPPENS", "NEXT?"]} size={110} color={MV.gold} y="40%" />
      {cardP > 0 && (
        <div style={{ position: 'absolute', left: 0, right: 0, bottom: 140, display: 'flex', justifyContent: 'center', gap: 40, opacity: clamp(cardP, 0, 1), transform: `translateY(${(1 - cardP) * 50}px)` }}>
          <div style={{ background: 'rgba(60,59,110,0.92)', border: '2px solid #8a8ad6', borderRadius: 20, padding: '26px 48px', textAlign: 'center' }}>
            <div style={{ fontFamily: '"Inter",sans-serif', fontWeight: 900, fontSize: 64, color: '#fff' }}>1</div>
            <div style={{ fontFamily: '"Inter",sans-serif', fontWeight: 800, fontSize: 26, color: '#cdd2ff', marginTop: 6 }}>COMMENT "1" — IT STAYS 1–1</div>
          </div>
          <div style={{ background: 'rgba(213,43,30,0.92)', border: '2px solid #ff9d94', borderRadius: 20, padding: '26px 48px', textAlign: 'center' }}>
            <div style={{ fontFamily: '"Inter",sans-serif', fontWeight: 900, fontSize: 64, color: '#fff' }}>2</div>
            <div style={{ fontFamily: '"Inter",sans-serif', fontWeight: 800, fontSize: 26, color: '#ffe2de', marginTop: 6 }}>COMMENT "2" — ENCISO SCORES</div>
          </div>
        </div>
      )}
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
            <FlagUSA w={120} />
            <BigTitle size={120} color={MV.gold}>1 — 1</BigTitle>
            <FlagPAR w={120} />
          </div>
          <div style={{ marginTop: 24 }}>
            <StatLine start={S + 1.2} delay={0.0} label="History" value="1930 says USA — but that was 96 years ago" accent={MV.text} />
            <StatLine start={S + 1.2} delay={0.25} label="Home pressure" value="80,000 expectations weigh heavy" accent={MV.text} />
            <StatLine start={S + 1.2} delay={0.5} label="Paraguay's wall" value="Gomez bends… but does not break" accent={MV.gold} />
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
        <Kicker size={26} color="#a0c0e8">The Mystery Supporter · Legend No. 004</Kicker>
      </div>
      {plateP > 0 && (
        <div style={{ position: 'absolute', left: 110, bottom: 150, zIndex: 25, opacity: clamp(plateP, 0, 1), transform: `translateY(${(1 - plateP) * 50}px)` }}>
          <div style={{ background: 'rgba(8,14,26,0.88)', border: '1px solid rgba(232,160,160,0.35)', borderRadius: 18, padding: '28px 44px', backdropFilter: 'blur(6px)' }}>
            <div style={{ fontFamily: '"Inter",sans-serif', fontWeight: 900, fontSize: 54, color: '#e9f2ff' }}>THE LIBERTY FAN</div>
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
          <VideoCard clipId="app-pulisic" name="USA" coef="x1.90" start={S} delay={1.55} accent="#3c3b6e" />
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
        <span style={{ fontFamily: '"Inter",sans-serif', fontWeight: 900, fontSize: 30, color: MV.gold }}>🇺🇸 THE USA OPENS ITS WORLD CUP · worldcup26.world</span>
      </div>
    </div>
  );
}
