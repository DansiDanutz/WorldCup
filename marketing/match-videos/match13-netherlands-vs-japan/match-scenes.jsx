// match-scenes.jsx — Episode 13: Netherlands vs Japan (300s). Total Football vs the Samurai.
const NED = '#ff7a1a';   // Dutch orange (visible on dark)
const JPN = '#4a78e8';   // Samurai blue (kept bright for legibility on dark)
const JPN_RED = '#e3294b';

function SceneMystery0() {
  const { localTime: lt } = useSprite();
  const beat = Math.pow(Math.max(0, Math.sin(lt * Math.PI * 1.0)), 8);
  return (
    <div style={{ position: 'absolute', inset: 0, background: '#000' }}>
      <ClipSprite id="mystery-elder" dim={0.25} style={{ filter: 'brightness(0.64) saturate(0.95) contrast(1.12)' }} />
      <div style={{ position: 'absolute', inset: 0, zIndex: 21, pointerEvents: 'none', opacity: 0.6,
        background: `radial-gradient(ellipse at ${24 + Math.sin(lt * 0.25) * 16}% 70%, rgba(74,120,232,0.22) 0%, transparent 48%), radial-gradient(ellipse at ${76 - Math.sin(lt * 0.2) * 14}% 35%, rgba(255,122,26,0.12) 0%, transparent 50%)` }} />
      <div style={{ position: 'absolute', inset: 0, zIndex: 21, background: `radial-gradient(ellipse at center, rgba(74,120,232,${(0.20 * beat).toFixed(3)}) 0%, transparent 60%)` }} />
      <KineticCaption start={1.2} dur={3.4} words={["TOTAL", "FOOTBALL"]} size={92} color="#ffd9b3" />
      <KineticCaption start={5.0} dur={3.2} words={["THE", "SAMURAI"]} size={92} color={JPN} />
      <Sprite start={12.6} end={16}>
        <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 27, background: 'rgba(0,0,0,0.35)' }}>
          <TitleReveal text="AND HE IS WATCHING" start={12.7} size={108} color="#8fb4ff" />
        </div>
      </Sprite>
      <Vignette strength={0.7} /><Letterbox />
    </div>
  );
}

function SceneRecapTitle() {
  const { localTime: lt } = useSprite();
  const showRecap = lt < 10;
  const p1 = Easing.easeOutCubic(clamp((lt - 10) / 1.0, 0, 1));
  const p2 = Easing.easeOutBack(clamp((lt - 10.8) / 1.0, 0, 1));
  const p3 = Easing.easeOutCubic(clamp((lt - 11.7) / 0.9, 0, 1));
  return (
    <div style={{ position: 'absolute', inset: 0, background: `linear-gradient(180deg, #0a0f1c 0%, #131a2e 55%, #0a0f1c 100%)` }}>
      <ClipSprite id="recap-1" dim={0.25} /><ClipSprite id="recap-2" dim={0.25} />
      {showRecap && (
        <div style={{ position: 'absolute', top: 120, left: 0, right: 0, display: 'flex', justifyContent: 'center', zIndex: 25 }}>
          <div style={{ background: MV.panel, border: `1px solid ${MV.line}`, borderRadius: 999, padding: '14px 40px' }}><span style={{ fontFamily: '"Inter",sans-serif', fontWeight: 800, fontSize: 28, color: MV.gold, letterSpacing: '0.34em' }}>PREVIOUSLY ON WORLDCUP26 LEGENDS</span></div>
        </div>
      )}
      {showRecap && lt > 4.5 && (
        <div style={{ position: 'absolute', bottom: 150, left: 0, right: 0, textAlign: 'center', zIndex: 25 }}><span style={{ fontFamily: '"Inter",sans-serif', fontWeight: 900, fontSize: 44, color: MV.text, textShadow: '0 4px 22px #000' }}>EPISODE 12 · OUR PREDICTION: GER 3—0 CUR</span></div>
      )}
      {!showRecap && (<>
        <AmbientParticles start={26} dur={10} count={34} color="255,122,26" />
        <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 44 }}>
          <div style={{ opacity: p1, transform: `translateY(${(1 - p1) * -30}px)` }}><Kicker>WorldCup26 Legends · Episode 13</Kicker></div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 70, opacity: clamp(p2, 0, 1), transform: `scale(${p2})` }}>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 20 }}><Waving><FlagNED w={250} /></Waving><BigTitle size={56} glow={NED}>NETHERLANDS</BigTitle></div>
            <BigTitle size={120} color={MV.gold}>VS</BigTitle>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 20 }}><Waving speed={1.9}><FlagJPN w={230} /></Waving><BigTitle size={64} glow={JPN}>JAPAN</BigTitle></div>
          </div>
          <div style={{ opacity: p3, fontFamily: '"Inter",sans-serif', fontWeight: 600, fontSize: 32, color: MV.muted, letterSpacing: '0.08em' }}>GROUP F · JUNE 14, 2026</div>
        </div>
      </>)}
      <ComingUp start={37.5} clipId="comingup-mitoma" label="STOPPAGE TIME — JAPAN DO THE IMPOSSIBLE" />
      <Letterbox />
    </div>
  );
}

function SceneStadium() {
  const { localTime: lt } = useSprite();
  const stripP = Easing.easeOutCubic(clamp((lt - 1.0) / 0.9, 0, 1));
  return (
    <div style={{ position: 'absolute', inset: 0, background: '#000' }}>
      <ClipSprite id="stadium" dim={0.08} /><Vignette strength={0.45} />
      <div style={{ position: 'absolute', left: 0, right: 0, bottom: 130, display: 'flex', justifyContent: 'center', zIndex: 25, opacity: stripP, transform: `translateY(${(1 - stripP) * 30}px)` }}>
        <div style={{ display: 'flex', background: MV.panel, border: `1px solid ${MV.line}`, borderRadius: 16, overflow: 'hidden', backdropFilter: 'blur(6px)' }}>
          {[['3', 'DUTCH WORLD CUP FINALS'], ['0', 'TIMES THEY WON IT'], ['2', 'GIANTS JAPAN BEAT IN 2022'], ['∞', 'SAMURAI SPIRIT']].map(([v, l], i) => (
            <div key={i} style={{ padding: '24px 38px', borderLeft: i ? `1px solid ${MV.line}` : 'none', textAlign: 'center' }}>
              <div style={{ fontFamily: '"Inter",sans-serif', fontWeight: 900, fontSize: 42, color: MV.gold }}>{v}</div>
              <div style={{ fontFamily: '"Inter",sans-serif', fontWeight: 700, fontSize: 16, color: MV.muted, letterSpacing: '0.13em', marginTop: 6 }}>{l}</div>
            </div>
          ))}
        </div>
      </div>
      <Letterbox />
    </div>
  );
}

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
        <div style={{ fontFamily: '"Inter",sans-serif', fontWeight: 900, fontSize: 100, color: accent, lineHeight: 1.05, margin: '12px 0 6px', textShadow: `0 0 60px ${accent}44` }}>{score}</div>
        <div style={{ fontFamily: '"Inter",sans-serif', fontWeight: 800, fontSize: 42, color: MV.text, letterSpacing: '0.08em' }}>{year}</div>
        {note && <div style={{ fontFamily: '"Inter",sans-serif', fontWeight: 600, fontSize: 26, color: MV.muted, marginTop: 14, maxWidth: 760 }}>{note}</div>}
        {stamp && stampP > 0 && (<div style={{ position: 'absolute', top: -34, right: -60, transform: `rotate(-12deg) scale(${stampP})`, border: `5px solid ${accent}`, color: accent, borderRadius: 14, padding: '10px 26px', fontFamily: '"Inter",sans-serif', fontWeight: 900, fontSize: 32, letterSpacing: '0.1em', background: 'rgba(7,9,15,0.85)' }}>{stamp}</div>)}
      </div>
    </div>
  );
}

function SceneHistory() {
  const S = 46.5;
  return (
    <div style={{ position: 'absolute', inset: 0, background: '#05060a' }}>
      <ClipSprite id="history-bg" style={{ filter: 'brightness(0.3) saturate(0.5) sepia(0.3)' }} />
      <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse at center, transparent 30%, rgba(5,6,10,0.82) 100%)' }} />
      <AmbientParticles start={46.5} dur={50} count={26} maxR={4} />
      <div style={{ position: 'absolute', top: 112, left: 0, right: 0, textAlign: 'center', zIndex: 26 }}><Kicker size={26}>Chapter One · The Tulip and the Rising Sun</Kicker></div>
      <HistoryPlate start={S + 1} end={S + 11} year="THE NETHERLANDS" venue="TOTAL FOOTBALL" score="3 FINALS" note="They gave the world the most beautiful idea in the sport — and never once lifted the trophy." accent={NED} stamp="THE TULIP" />
      <HistoryPlate start={S + 11} end={S + 22} year="THE DUTCH MOUNTAIN" venue="VIRGIL VAN DIJK" score={"6'4\""} note="A colossus who bends the whole pitch around him. De Jong conducts. Gakpo flies." accent={NED} stamp="THE GIANTS" />
      <HistoryPlate start={S + 22} end={S + 33} year="JAPAN · 2022" venue="THE SAMURAI BLUE" score="BEAT BOTH" note="At one World Cup they beat Germany — and then they beat Spain. Discipline as a weapon." accent={JPN} stamp="GIANT-KILLERS" />
      <HistoryPlate start={S + 33} end={S + 43} year="MITOMA · KUBO · ENDO" venue="MAGICIANS WITHOUT EGO" score="NO FEAR" note="Folklore dribbling, the Japanese Messi, and a man who trains beside Van Dijk every week." accent={JPN} />
      <HistoryPlate start={S + 43} end={S + 51.5} year="TONIGHT · 2026" venue="THE ARTIST MEETS THE WARRIOR" score="WON'T YIELD" note="Two philosophies, one shared belief: football is an art form worth perfecting." accent={MV.gold} />
      <Vignette strength={0.5} /><Letterbox />
    </div>
  );
}

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
            <div style={{ height: 322, overflow: 'hidden', position: 'relative' }}>{p.clip ? <VideoSprite src={p.clip} start={start} dur={end - start} rate={0.5} /> : <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: `linear-gradient(160deg, ${accent}33, #0a0c14)`, fontFamily: '"Inter",sans-serif', fontWeight: 900, fontSize: 96, color: `${accent}` }}>{p.name[0]}</div>}</div>
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

function SceneNetherlands() {
  const { localTime: lt } = useSprite();
  const headerP = Easing.easeOutCubic(clamp(lt / 0.9, 0, 1));
  return (
    <div style={{ position: 'absolute', inset: 0, background: '#0a0c14' }}>
      {lt < 8 && <VideoSprite src="assets/stadium-nj.mp4" start={98.0} dur={6.5} rate={0.6} style={{ filter: 'brightness(0.25) saturate(0.7)' }} />}
      <ClipSprite id="vandijk" dim={0.12} /><ClipSprite id="dejong" dim={0.12} /><ClipSprite id="ned-hopeful" dim={0.4} />
      <div style={{ position: 'absolute', inset: 0, zIndex: 22, pointerEvents: 'none', background: `linear-gradient(90deg, rgba(255,122,26,0.18) 0%, transparent 35%, transparent 70%, rgba(33,70,139,0.18) 100%)` }} />
      <div style={{ position: 'absolute', top: 108, left: 0, right: 0, display: 'flex', justifyContent: 'center', zIndex: 26, opacity: headerP, transform: `translateY(${(1 - headerP) * -24}px)` }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 26, background: MV.panel, border: `1px solid ${MV.line}`, borderRadius: 999, padding: '16px 44px' }}><FlagNED w={80} /><span style={{ fontFamily: '"Inter",sans-serif', fontWeight: 900, fontSize: 40, color: MV.text, letterSpacing: '0.10em' }}>TOTAL FOOTBALL</span></div>
      </div>
      <SquadGrid start={98.4} end={104.5} accent={NED} players={[
        { clip: 'assets/player-vandijk.mp4', name: 'VAN DIJK', role: 'THE DUTCH MOUNTAIN' },
        { clip: 'assets/player-dejong.mp4', name: 'DE JONG', role: 'THE CONDUCTOR' },
        { clip: 'assets/player-gakpo.mp4', name: 'GAKPO', role: 'THE FLYING DUTCHMAN' },
        { name: 'DEPAY', role: 'THE SPARK' },
        { name: 'GRAVENBERCH', role: 'THE ENGINE' },
      ]} />
      <Sprite start={104.5} end={113.5}><LowerThird start={104.8} name="VIRGIL VAN DIJK" role={"The Dutch Mountain · 6'4\""} line="A colossus who bends the whole pitch around him." accent={NED} /></Sprite>
      <Sprite start={113.5} end={126.5}><LowerThird start={113.8} name="FRENKIE DE JONG" role="The Conductor" line="The ball glued to his boot as he glides through the lines." accent={NED} /></Sprite>
      <Sprite start={126.5} end={133.6}><LowerThird start={126.7} name="CODY GAKPO" role="The Flying Dutchman" line="Power and grace in a single, terrifying run. Three finals — never crowned." accent={NED} /></Sprite>
      <Vignette strength={0.4} /><Letterbox />
    </div>
  );
}

function SceneJapan() {
  const { localTime: lt } = useSprite();
  const headerP = Easing.easeOutCubic(clamp(lt / 0.9, 0, 1));
  return (
    <div style={{ position: 'absolute', inset: 0, background: '#0a0c14' }}>
      <ClipSprite id="mitoma" dim={0.12} /><ClipSprite id="kubo" dim={0.12} /><ClipSprite id="endo" dim={0.12} />
      <div style={{ position: 'absolute', inset: 0, zIndex: 22, pointerEvents: 'none', background: `linear-gradient(90deg, rgba(74,120,232,0.3) 0%, transparent 35%, transparent 70%, rgba(227,41,75,0.16) 100%)` }} />
      <div style={{ position: 'absolute', top: 108, left: 0, right: 0, display: 'flex', justifyContent: 'center', zIndex: 26, opacity: headerP, transform: `translateY(${(1 - headerP) * -24}px)` }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 26, background: MV.panel, border: `1px solid ${MV.line}`, borderRadius: 999, padding: '16px 44px' }}><FlagJPN w={80} /><span style={{ fontFamily: '"Inter",sans-serif', fontWeight: 900, fontSize: 40, color: MV.text, letterSpacing: '0.10em' }}>THE SAMURAI BLUE</span></div>
      </div>
      <SquadGrid start={134.2} end={143.5} accent={JPN} players={[
        { clip: 'assets/player-mitoma.mp4', name: 'MITOMA', role: 'THE DRIBBLE FOLKLORE' },
        { clip: 'assets/player-kubo.mp4', name: 'KUBO', role: 'THE JAPANESE MESSI' },
        { clip: 'assets/player-endo.mp4', name: 'ENDO', role: 'THE CAPTAIN' },
        { name: 'UEDA', role: 'THE SPEARHEAD' },
        { name: 'MINAMINO', role: 'THE LIVE WIRE' },
      ]} />
      <Sprite start={143.5} end={153.5}><LowerThird start={143.8} name="KAORU MITOMA" role="Brighton · The Dribbler" line="Defenders left grasping at shadows. Folklore in England." accent={JPN} /></Sprite>
      <Sprite start={153.5} end={164}><LowerThird start={153.7} name="KUBO & ENDO" role="The Messi & the Mountain-watcher" line="Endo trains beside Van Dijk — and knows exactly how a mountain falls." accent={JPN} /></Sprite>
      <Sprite start={164} end={169.5}><LowerThird start={164.2} name="WITHOUT EGO" role="They beat Germany AND Spain" line="Organised, fearless, humble. That is what makes them so dangerous." accent={JPN_RED} /></Sprite>
      <Vignette strength={0.4} /><Letterbox />
    </div>
  );
}

function SceneDuel() {
  const { localTime: lt } = useSprite();
  const slideP = Easing.easeOutQuart(clamp(lt / 1.1, 0, 1));
  const vsP = Easing.easeOutBack(clamp((lt - 0.9) / 0.8, 0, 1));
  const shake = lt > 0.9 && lt < 1.25 ? Math.sin(lt * 160) * 7 * (1.25 - lt) / 0.35 : 0;
  return (
    <div style={{ position: 'absolute', inset: 0, background: '#05060a', transform: `translate(${shake}px, ${-shake}px)` }}>
      <div style={{ position: 'absolute', top: 0, bottom: 0, left: 0, width: '50%', overflow: 'hidden', transform: `translateX(${(1 - slideP) * -100}%)` }}>
        <ClipSprite id="duel-mitoma" style={{ filter: 'saturate(1.15) brightness(0.95)' }} />
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(90deg, rgba(74,120,232,0.34), transparent 65%)' }} />
        <div style={{ position: 'absolute', bottom: 150, left: 90, zIndex: 5, fontFamily: '"Inter",sans-serif', fontWeight: 900, fontSize: 58, color: '#fff', textShadow: '0 4px 26px rgba(0,0,0,0.9)' }}>THE MAGIC<div style={{ fontSize: 27, fontWeight: 700, color: JPN, letterSpacing: '0.2em', marginTop: 8 }}>MITOMA · THE DRIBBLE</div></div>
      </div>
      <div style={{ position: 'absolute', top: 0, bottom: 0, right: 0, width: '50%', overflow: 'hidden', transform: `translateX(${(1 - slideP) * 100}%)` }}>
        <ClipSprite id="duel-vandijk" style={{ filter: 'saturate(1.1) brightness(0.92)' }} />
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(270deg, rgba(255,122,26,0.42), transparent 65%)' }} />
        <div style={{ position: 'absolute', bottom: 150, right: 90, zIndex: 5, textAlign: 'right', fontFamily: '"Inter",sans-serif', fontWeight: 900, fontSize: 58, color: '#fff', textShadow: '0 4px 26px rgba(0,0,0,0.9)' }}>THE WALL<div style={{ fontSize: 27, fontWeight: 700, color: NED, letterSpacing: '0.2em', marginTop: 8 }}>VAN DIJK · THE MOUNTAIN</div></div>
      </div>
      <div style={{ position: 'absolute', top: 0, bottom: 0, left: 'calc(50% - 3px)', width: 6, background: `linear-gradient(180deg, transparent, ${MV.gold}, transparent)`, zIndex: 24, opacity: slideP }} />
      <div style={{ position: 'absolute', top: '50%', left: '50%', zIndex: 26, transform: `translate(-50%,-50%) scale(${vsP}) rotate(${(1 - vsP) * 20}deg)`, opacity: clamp(vsP, 0, 1), width: 210, height: 210, borderRadius: '50%', background: MV.panel, border: `5px solid ${MV.gold}`, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: `0 0 90px ${MV.gold}66` }}><span style={{ fontFamily: '"Inter",sans-serif', fontWeight: 900, fontSize: 92, color: MV.gold }}>VS</span></div>
      <Sprite start={179} end={186}>
        <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 27, background: 'rgba(0,0,0,0.55)' }}><BigTitle size={70} color={MV.text} style={{ maxWidth: 1400 }}>“Dutch class, Samurai courage… and one refusal to die.”</BigTitle></div>
      </Sprite>
      <Letterbox />
    </div>
  );
}

function SceneDrama() {
  const { localTime: lt } = useSprite();
  const S = 188.5;
  const punch = (at, mag) => { const d = lt + S - at; return d > 0 && d < 0.4 ? 1 + mag * (1 - d / 0.4) : 1; };
  const zoom = punch(189.0, 0.05) * punch(197.9, 0.06) * punch(218.8, 0.07);
  return (
    <div style={{ position: 'absolute', inset: 0, background: '#000', transform: `scale(${zoom})` }}>
      <ClipSprite id="drama-gakpo" dim={0.06} /><ClipSprite id="drama-depay" dim={0.06} />
      <ClipSprite id="kubo-slow" dim={0.05} style={{ filter: 'saturate(1.15) contrast(1.1)' }} /><ClipSprite id="kubo-snap" dim={0} />
      <ClipSprite id="jpn-believe" /><ClipSprite id="vandijk-hold" dim={0.08} />
      <ClipSprite id="mitoma-eq" dim={0} /><ClipSprite id="jpn-eruption" /><ClipSprite id="ft-vandijk" dim={0.1} /><ClipSprite id="ft-jpn" dim={0.15} />
      <FilmGrain start={188.5} dur={55} opacity={0.08} />
      <Sprite start={188.5} end={193.5}><ScoreBug start={S + 0.3} kor={1} cze={0} minute="28'" homeLabel="NED" awayLabel="JPN" homeColor={NED} awayColor={JPN} /></Sprite>
      <GoalFlash at={189.0} text="GAKPO! 1—0" color={NED} />
      <Sprite start={193.5} end={197.9}><ScoreBug start={193.5} kor={2} cze={0} minute="51'" homeLabel="NED" awayLabel="JPN" homeColor={NED} awayColor={JPN} /></Sprite>
      <GoalFlash at={193.7} text="DEPAY! 2—0" color={NED} />
      <KineticCaption start={196.0} dur={2.0} words={["BUT", "THE", "SAMURAI…"]} size={86} color={JPN} y="56%" />
      <Sprite start={197.9} end={218.8}><ScoreBug start={197.9} kor={2} cze={1} minute="74'" homeLabel="NED" awayLabel="JPN" homeColor={NED} awayColor={JPN} /></Sprite>
      <GoalFlash at={197.9} text="KUBO! 2—1" color={JPN} />
      <Confetti start={198.1} dur={4} />
      <KineticCaption start={210.0} dur={3.2} words={["90", "+", "3"]} size={120} color={JPN_RED} y="54%" />
      <Sprite start={218.8} end={233}><ScoreBug start={218.8} kor={2} cze={2} minute="90+3'" homeLabel="NED" awayLabel="JPN" homeColor={NED} awayColor={JPN} /></Sprite>
      <GoalFlash at={218.8} text="MITOMA! 2—2" color={JPN} />
      <Confetti start={219.0} dur={6} />
      <Sprite start={233} end={243.5}><RespectCard start={233.5} /></Sprite>
      <Vignette strength={0.42} /><Letterbox />
    </div>
  );
}

function RespectCard({ start }) {
  const t = useTime();
  const p = Easing.easeOutCubic(clamp((t - start) / 1.0, 0, 1));
  return (
    <div style={{ position: 'absolute', inset: 0, zIndex: 26, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(2,3,6,0.62)', opacity: p }}>
      <div style={{ background: MV.panel, border: `1px solid ${MV.line}`, borderRadius: 26, padding: '44px 92px', textAlign: 'center', boxShadow: '0 30px 120px rgba(0,0,0,0.7)' }}>
        <Kicker size={26}>Our Prediction · Full Time</Kicker>
        <div style={{ display: 'flex', alignItems: 'center', gap: 50, marginTop: 28 }}>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 14 }}><FlagNED w={134} /><span style={{ fontFamily: '"Inter",sans-serif', fontWeight: 800, fontSize: 28, color: MV.text }}>NETHERLANDS</span></div>
          <BigTitle size={140} color={MV.gold}>2 — 2</BigTitle>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 14 }}><FlagJPN w={120} /><span style={{ fontFamily: '"Inter",sans-serif', fontWeight: 800, fontSize: 30, color: MV.text }}>JAPAN</span></div>
        </div>
        <div style={{ fontFamily: '"Inter",sans-serif', fontWeight: 600, fontSize: 25, color: MV.muted, marginTop: 22 }}>Gakpo & Depay struck — but Kubo and Mitoma refused to die</div>
        <div style={{ fontFamily: '"Inter",sans-serif', fontWeight: 900, fontSize: 34, color: '#f6b40e', marginTop: 22, letterSpacing: '0.18em' }}>SOME&nbsp;&nbsp;DRAWS&nbsp;&nbsp;FEEL&nbsp;&nbsp;LIKE&nbsp;&nbsp;A&nbsp;&nbsp;WIN</div>
      </div>
    </div>
  );
}

function SceneVerdict() {
  const S = 244;
  return (
    <div style={{ position: 'absolute', inset: 0, background: '#0a0f1c' }}>
      <ClipSprite id="verdict-bg" dim={0.6} />
      <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 25 }}>
        <div style={{ background: MV.panel, border: `1px solid ${MV.line}`, borderRadius: 24, padding: '46px 80px', minWidth: 940, backdropFilter: 'blur(6px)' }}>
          <Kicker size={26}>Our Prediction — and why</Kicker>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 50, marginTop: 26 }}><FlagNED w={130} /><BigTitle size={120} color={MV.gold}>2 — 2</BigTitle><FlagJPN w={104} /></div>
          <div style={{ marginTop: 24 }}>
            <StatLine start={S + 1.2} delay={0.0} label="TULIP or SAMURAI?" value="Comment TULIP if the Dutch finally lift the trophy" accent={NED} />
            <StatLine start={S + 1.2} delay={0.25} label="" value="Comment SAMURAI if Japan are the team nobody wants" accent={JPN} />
            <StatLine start={S + 1.2} delay={0.5} label="The reason" value="The artists score the goals · but the warriors steal the soul of the night" accent={MV.text} />
          </div>
        </div>
      </div>
      <Vignette strength={0.5} /><Letterbox />
    </div>
  );
}

function SceneMysteryPayoff() {
  const { localTime: lt } = useSprite();
  const S = 252.5;
  const inP = Easing.easeOutCubic(clamp((lt - 0.6) / 1.4, 0, 1));
  const plateP = Easing.easeOutBack(clamp((lt - 4.6) / 0.9, 0, 1));
  return (
    <div style={{ position: 'absolute', inset: 0, background: '#06101a' }}>
      <ClipSprite id="payoff-elder" dim={0.12} />
      <div style={{ position: 'absolute', inset: 0, zIndex: 21, pointerEvents: 'none', opacity: 0.5, background: `radial-gradient(ellipse at ${22 + Math.sin(lt * 0.3) * 14}% 75%, rgba(74,120,232,0.18) 0%, transparent 45%)` }} />
      <AmbientParticles start={S} dur={18} count={46} color="143,180,255" maxR={3.5} zIndex={22} />
      <div style={{ position: 'absolute', top: 118, left: 0, right: 0, textAlign: 'center', zIndex: 25, opacity: inP }}><Kicker size={26} color="#9fc0f0">The Mystery Supporter · Legend No. 013</Kicker></div>
      {plateP > 0 && (
        <div style={{ position: 'absolute', left: 110, bottom: 150, zIndex: 25, opacity: clamp(plateP, 0, 1), transform: `translateY(${(1 - plateP) * 50}px)` }}>
          <div style={{ background: 'rgba(10,18,28,0.9)', border: '1px solid rgba(140,180,232,0.35)', borderRadius: 18, padding: '28px 44px', backdropFilter: 'blur(6px)' }}>
            <div style={{ fontFamily: '"Inter",sans-serif', fontWeight: 900, fontSize: 50, color: '#eaf2ff' }}>THE BLUE SAMURAI ELDER</div>
            <div style={{ fontFamily: '"Inter",sans-serif', fontWeight: 700, fontSize: 25, color: '#9fc0f0', letterSpacing: '0.16em', marginTop: 8 }}>HE TAUGHT A NATION THAT SPIRIT CAN BE BUILT</div>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 12, marginTop: 18, background: 'rgba(143,180,255,0.12)', border: '1px solid rgba(143,180,255,0.5)', borderRadius: 999, padding: '10px 24px' }}><span style={{ fontSize: 26 }}>✦</span><span style={{ fontFamily: '"Inter",sans-serif', fontWeight: 800, fontSize: 24, color: '#9fc0f0', letterSpacing: '0.08em' }}>COLLECTIBLE · worldcup26.world</span></div>
          </div>
        </div>
      )}
      <Vignette strength={0.55} /><Letterbox />
    </div>
  );
}

function SceneApp() {
  const { localTime: lt } = useSprite();
  const S = 272.5;
  const inP = Easing.easeOutCubic(clamp(lt / 1.0, 0, 1));
  return (
    <div style={{ position: 'absolute', inset: 0, background: `linear-gradient(160deg, #0d2a20 0%, #07090f 70%)` }}>
      <div style={{ position: 'absolute', inset: 0, background: `radial-gradient(ellipse at 50% 20%, rgba(16,107,79,0.35) 0%, transparent 60%)` }} />
      <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 38, opacity: inP }}>
        <Kicker color="#7fd6b5" size={30}>The Prediction Game</Kicker>
        <BigTitle size={96} color="#fff" glow={MV.green}>worldcup26.world</BigTitle>
        <div style={{ fontFamily: '"Inter",sans-serif', fontWeight: 700, fontSize: 36, color: '#cfe9de' }}>Pick 3 teams. Every goal they score… scores for YOU.</div>
        <div style={{ display: 'flex', gap: 36, marginTop: 8 }}>
          <VideoCard clipId="app-ned" name="NETHERLANDS" coef="x1.30" start={S} delay={1.2} accent={NED} />
          <VideoCard clipId="app-jpn" name="JAPAN" coef="x4.50" start={S} delay={1.55} accent={JPN} />
          <VideoCard clipId="app-arg" name="ARGENTINA" coef="x1.15" start={S} delay={1.9} accent="#74acdf" />
        </div>
        <div style={{ fontFamily: '"Inter",sans-serif', fontWeight: 800, fontSize: 32, color: MV.gold, letterSpacing: '0.06em' }}>FREE TO PLAY · LIVE LEADERBOARD · UNDERDOGS PAY TRIPLE</div>
      </div>
      <Letterbox />
    </div>
  );
}

function SceneCTA() {
  const { localTime: lt } = useSprite();
  const S = 290;
  const inP = Easing.easeOutCubic(clamp(lt / 0.8, 0, 1));
  return (
    <div style={{ position: 'absolute', inset: 0, background: '#07090f' }}>
      <ClipSprite id="cta-bg" dim={0.68} /><AmbientParticles start={290} dur={10} count={28} />
      <div style={{ position: 'absolute', top: 190, left: 0, right: 0, textAlign: 'center', zIndex: 25, opacity: inP }}>
        <Kicker size={30}>Send this to the friend who never stops believing</Kicker>
        <div style={{ marginTop: 22 }}><TitleReveal text="JOIN THE LEGENDS" start={S + 0.4} size={88} color={MV.text} /></div>
      </div>
      <div style={{ position: 'absolute', inset: 0, zIndex: 26 }}>
        <CtaButton start={S} delay={1.2} label="SUBSCRIBE" icon="🔔" accent="#d4313f" x={500} />
        <CtaButton start={S} delay={1.6} label="LIKE" icon="👍" accent="#1f4fa3" x={960} />
        <CtaButton start={S} delay={2.0} label="SHARE" icon="📣" accent="#106b4f" x={1400} />
      </div>
      <Sprite start={294.5} end={300}><NextMatchTease start={S + 4.5} /></Sprite>
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
