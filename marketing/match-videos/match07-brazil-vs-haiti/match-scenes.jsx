// match-scenes.jsx — Episode 7: Brazil vs Haiti (300s timeline).
// Scene windows must match SCENES in match.html, narration.json and clips.json.
// NOTE: nested <Sprite> windows are GLOBAL seconds.

// ── 1. Mystery cold open (0–16): the drum of 1974 ────────────────────────────
function SceneMystery0() {
  const { localTime: lt } = useSprite();
  // drum heartbeat pulse (~64 bpm) — the episode's signature rhythm
  const beat = Math.pow(Math.max(0, Math.sin(lt * Math.PI * 1.07)), 8);
  return (
    <div style={{ position: 'absolute', inset: 0, background: '#000' }}>
      <ClipSprite id="mystery-tambouye" dim={0.25} style={{ filter: 'brightness(0.62) saturate(0.85) contrast(1.12)' }} />
      <div style={{
        position: 'absolute', inset: 0, zIndex: 21, pointerEvents: 'none', opacity: 0.6,
        background: `radial-gradient(ellipse at ${24 + Math.sin(lt * 0.25) * 16}% 70%, rgba(0,32,159,0.18) 0%, transparent 48%),` +
                    `radial-gradient(ellipse at ${76 - Math.sin(lt * 0.2) * 14}% 35%, rgba(210,16,52,0.14) 0%, transparent 50%)`,
      }} />
      <div style={{ position: 'absolute', inset: 0, zIndex: 21, background: `radial-gradient(ellipse at center, rgba(246,180,14,${(0.20 * beat).toFixed(3)}) 0%, transparent 60%)` }} />
      <KineticCaption start={1.2} dur={3.4} words={["THE", "DRUM"]} size={96} color="#e8eeff" />
      <KineticCaption start={5.0} dur={3.2} words={["OF", "1974"]} size={96} color={MV.gold} />
      <Sprite start={12.6} end={16}>
        <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 27, background: 'rgba(0,0,0,0.35)' }}>
          <TitleReveal text="IT NEVER STOPPED" start={12.7} size={122} color="#f6b40e" />
        </div>
      </Sprite>
      <Vignette strength={0.7} />
      <Letterbox />
    </div>
  );
}

// ── 2. Recap + title (16–40.5) ───────────────────────────────────────────────
function SceneRecapTitle() {
  const { localTime: lt } = useSprite();
  const showRecap = lt < 10;
  const p1 = Easing.easeOutCubic(clamp((lt - 10) / 1.0, 0, 1));
  const p2 = Easing.easeOutBack(clamp((lt - 10.8) / 1.0, 0, 1));
  const p3 = Easing.easeOutCubic(clamp((lt - 11.7) / 0.9, 0, 1));
  return (
    <div style={{ position: 'absolute', inset: 0, background: `linear-gradient(180deg, #0a0f1c 0%, #131a2e 55%, #0a0f1c 100%)` }}>
      {/* previously-on beat reusing the paid Ep6 animation library */}
      <ClipSprite id="recap-joy" dim={0.25} />
      <ClipSprite id="recap-messi" dim={0.25} />
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
            EPISODE 6 · OUR PREDICTION: ARG 1—0 ALG
          </span>
        </div>
      )}
      {!showRecap && (<>
        <AmbientParticles start={26} dur={10} count={34} color="255,223,0" />
        <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 44 }}>
          <div style={{ opacity: p1, transform: `translateY(${(1 - p1) * -30}px)` }}>
            <Kicker>WorldCup26 Legends · Episode 7</Kicker>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 70, opacity: clamp(p2, 0, 1), transform: `scale(${p2})` }}>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 20 }}>
              <Waving><FlagBRA w={250} /></Waving>
              <BigTitle size={66} glow="#ffdf00">BRAZIL</BigTitle>
            </div>
            <BigTitle size={120} color={MV.gold}>VS</BigTitle>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 20 }}>
              <Waving speed={1.9}><FlagHTI w={250} /></Waving>
              <BigTitle size={66} glow="#00209f">HAITI</BigTitle>
            </div>
          </div>
          <div style={{ opacity: p3, fontFamily: '"Inter",sans-serif', fontWeight: 600, fontSize: 32, color: MV.muted, letterSpacing: '0.08em' }}>
            GROUP C · MATCHDAY 2 · JUNE 16, 2026
          </div>
        </div>
      </>)}
      <ComingUp start={37.5} clipId="comingup-nazon" label="45+2 — THE GOAL THAT MAKES THE WORLD STAND UP" />
      <Letterbox />
    </div>
  );
}

// ── 3. Stadium (40.5–46.5) ───────────────────────────────────────────────────
function SceneStadium() {
  const { localTime: lt } = useSprite();
  const stripP = Easing.easeOutCubic(clamp((lt - 1.0) / 0.9, 0, 1));
  return (
    <div style={{ position: 'absolute', inset: 0, background: '#000' }}>
      <ClipSprite id="stadium" dim={0.08} />
      <Vignette strength={0.45} />
      <div style={{ position: 'absolute', left: 0, right: 0, bottom: 130, display: 'flex', justifyContent: 'center', zIndex: 25, opacity: stripP, transform: `translateY(${(1 - stripP) * 30}px)` }}>
        <div style={{ display: 'flex', background: MV.panel, border: `1px solid ${MV.line}`, borderRadius: 16, overflow: 'hidden', backdropFilter: 'blur(6px)' }}>
          {[['1974', "HAITI'S ONLY WORLD CUP"], ['1,142', 'THE MINUTES SANON ENDED'], ['5', 'BRAZIL WORLD TITLES'], ['52', 'YEARS OF WAITING']].map(([v, l], i) => (
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

// ── 4. History (46.5–98): 1974 — Sanon breaks the longest wall in football ───
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
          <div style={{ position: 'absolute', top: -34, right: -60, transform: `rotate(-12deg) scale(${stampP})`, border: `5px solid #d21034`, color: '#d21034', borderRadius: 14, padding: '10px 26px', fontFamily: '"Inter",sans-serif', fontWeight: 900, fontSize: 36, letterSpacing: '0.1em', background: 'rgba(7,9,15,0.85)' }}>{stamp}</div>
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
      <ClipSprite id="history-bg" style={{ filter: 'brightness(0.3) saturate(0.5) sepia(0.3)' }} />
      <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse at center, transparent 30%, rgba(5,6,10,0.82) 100%)' }} />
      <AmbientParticles start={46.5} dur={50} count={26} maxR={4} />
      <div style={{ position: 'absolute', top: 112, left: 0, right: 0, textAlign: 'center', zIndex: 26 }}>
        <Kicker size={26}>Chapter One · The Day The Wall Fell</Kicker>
      </div>
      <HistoryPlate start={S + 1} end={S + 10.5} year="WEST GERMANY · 1974" venue="THE FIRST CARIBBEAN NATION AT A WORLD CUP" score="HAITI" note="A debutant nobody rated — against mighty Italy." accent="#00209f" stamp="HISTORY" />
      <HistoryPlate start={S + 10.5} end={S + 22} year="DINO ZOFF · UNBEATEN SINCE 1972" venue="THE LONGEST WALL IN FOOTBALL HISTORY" score="1,142 MIN" note="Italy's legendary goalkeeper had not conceded an international goal in almost two years." accent={MV.gold} />
      <HistoryPlate start={S + 22} end={S + 30} year="EMMANUEL SANON · 46'" venue="HAITI SCORE FIRST" score="THE WALL FALLS" note="Sanon runs onto the pass, rounds Zoff... and scores." accent="#d21034" stamp="MIRACLE" />
      <HistoryPlate start={S + 30} end={S + 43} year="ITALY WON 3—1 · NOBODY REMEMBERS THAT" venue="THE GOAL THAT BECAME A FLAG" score="1974" note="Proof, forever, that the small can wound the giant." accent="#00209f" />
      <HistoryPlate start={S + 43} end={S + 51.5} year="TONIGHT · 2026" venue="52 YEARS LATER — THROUGH EVERYTHING" score="THE RETURN" note="Haiti is back. And waiting for them... the kings of football." accent={MV.gold} />
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

// ── 5. Brazil (98–133.6) ─────────────────────────────────────────────────────
function SceneBrazil() {
  const { localTime: lt } = useSprite();
  const headerP = Easing.easeOutCubic(clamp(lt / 0.9, 0, 1));
  return (
    <div style={{ position: 'absolute', inset: 0, background: '#0a0c14' }}>
      {lt < 8 && <VideoSprite src="assets/stadium-c2.mp4" start={98.0} dur={6.5} rate={0.6} style={{ filter: 'brightness(0.25) saturate(0.7)' }} />}
      <ClipSprite id="vini" dim={0.12} />
      <ClipSprite id="neymar" dim={0.12} />
      <ClipSprite id="raphinha" dim={0.12} />
      <ClipSprite id="alisson" dim={0.12} />
      <div style={{ position: 'absolute', inset: 0, zIndex: 22, pointerEvents: 'none', background: `linear-gradient(90deg, rgba(255,223,0,0.16) 0%, transparent 30%, transparent 70%, rgba(0,156,59,0.16) 100%)` }} />
      <div style={{ position: 'absolute', top: 108, left: 0, right: 0, display: 'flex', justifyContent: 'center', zIndex: 26, opacity: headerP, transform: `translateY(${(1 - headerP) * -24}px)` }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 26, background: MV.panel, border: `1px solid ${MV.line}`, borderRadius: 999, padding: '16px 44px' }}>
          <FlagBRA w={80} />
          <span style={{ fontFamily: '"Inter",sans-serif', fontWeight: 900, fontSize: 40, color: MV.text, letterSpacing: '0.10em' }}>THE KINGS · FIVE STARS</span>
        </div>
      </div>
      <SquadGrid start={98.4} end={104.5} accent="#ffdf00" players={[
        { img: 'assets/squad/bra-1-Vinicius-Junior.png', clip: 'assets/player-vini.mp4', name: 'VINICIUS JR', role: 'THE DANCER' },
        { img: 'assets/squad/bra-2-Neymar.png', clip: 'assets/player-neymar.mp4', name: 'NEYMAR', role: 'THE LAST DANCE · 34' },
        { img: 'assets/squad/bra-3-Raphinha.png', clip: 'assets/player-raphinha.mp4', name: 'RAPHINHA', role: 'THE TORMENTOR' },
        { img: 'assets/squad/bra-4-Bruno-Guimaraes.png', clip: 'assets/player-bruno.mp4', name: 'BRUNO GUIMARAES', role: 'THE CONDUCTOR' },
        { img: 'assets/squad/bra-5-Alisson.png', clip: 'assets/player-alisson.mp4', name: 'ALISSON', role: 'THE CALM' },
      ]} />
      <Sprite start={104.5} end={114.6}>
        <LowerThird start={104.8} name="VINICIUS JUNIOR" role="The Dancer · Real Madrid" line="His feet move faster than the music." accent="#ffdf00" />
      </Sprite>
      <Sprite start={114.6} end={120.6}>
        <LowerThird start={114.9} name="NEYMAR" role="The Last Dance · 34" line="Nothing left to prove. Plays for pure joy." accent="#ffdf00" />
      </Sprite>
      <Sprite start={120.6} end={124}>
        <LowerThird start={120.8} name="RAPHINHA" role="The Tormentor · Winger" line="Stretches the world." accent="#ffdf00" />
      </Sprite>
      <Sprite start={124} end={133.6}>
        <LowerThird start={124.2} name="ALISSON" role="The Calm · Goalkeeper" line="The calmest man alive — until stoppage time." accent="#ffdf00" />
      </Sprite>
      <Vignette strength={0.4} />
      <Letterbox />
    </div>
  );
}

// ── 6. Haiti (133.6–169.5) ───────────────────────────────────────────────────
function SceneHaiti() {
  const { localTime: lt } = useSprite();
  const headerP = Easing.easeOutCubic(clamp(lt / 0.9, 0, 1));
  return (
    <div style={{ position: 'absolute', inset: 0, background: '#0a0c14' }}>
      <ClipSprite id="hai-hopeful" dim={0.5} />
      <ClipSprite id="nazon" dim={0.12} />
      <ClipSprite id="etienne" dim={0.12} />
      <ClipSprite id="placide" dim={0.12} />
      <ClipSprite id="arcus" dim={0.12} />
      <div style={{ position: 'absolute', inset: 0, zIndex: 22, pointerEvents: 'none', background: `linear-gradient(90deg, rgba(0,32,159,0.26) 0%, transparent 30%, transparent 70%, rgba(210,16,52,0.18) 100%)` }} />
      <div style={{ position: 'absolute', top: 108, left: 0, right: 0, display: 'flex', justifyContent: 'center', zIndex: 26, opacity: headerP, transform: `translateY(${(1 - headerP) * -24}px)` }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 26, background: MV.panel, border: `1px solid ${MV.line}`, borderRadius: 999, padding: '16px 44px' }}>
          <FlagHTI w={80} />
          <span style={{ fontFamily: '"Inter",sans-serif', fontWeight: 900, fontSize: 40, color: MV.text, letterSpacing: '0.10em' }}>THE UNBREAKABLE</span>
        </div>
      </div>
      <SquadGrid start={134.2} end={143.5} accent="#00209f" players={[
        { img: 'assets/squad/hai-1-Duckens-Nazon.png', clip: 'assets/player-nazon.mp4', name: 'DUCKENS NAZON', role: 'THE SUPERMARKET STRIKER' },
        { img: 'assets/squad/hai-2-Derrick-Etienne-Jr.png', clip: 'assets/player-etienne.mp4', name: 'ETIENNE JR', role: 'THE CHOICE' },
        { img: 'assets/squad/hai-3-Johny-Placide.png', clip: 'assets/player-placide.mp4', name: 'JOHNY PLACIDE', role: 'THE WALL' },
        { img: 'assets/squad/hai-4-Carlens-Arcus.png', clip: 'assets/player-arcus.mp4', name: 'CARLENS ARCUS', role: 'THE GUARD' },
        { img: 'assets/squad/hai-5-Bryan-Alceus.png', clip: 'assets/player-alceus.mp4', name: 'BRYAN ALCEUS', role: 'THE ANCHOR' },
      ]} />
      <Sprite start={143.5} end={153.5}>
        <LowerThird start={143.8} name="DUCKENS NAZON" role="The Supermarket Striker" line="A scout found him stacking shelves. He wears that story like armor." accent="#00209f" />
      </Sprite>
      <Sprite start={153.5} end={159}>
        <LowerThird start={153.7} name="DERRICK ETIENNE JR" role="The Choice · Midfield" line="Born in America. Chose Haiti." accent="#00209f" />
      </Sprite>
      <Sprite start={159} end={164}>
        <LowerThird start={159.2} name="JOHNY PLACIDE" role="The Wall of Port-au-Prince" line="Keeps goal for a whole nation." accent="#00209f" />
      </Sprite>
      <Sprite start={164} end={169.5}>
        <LowerThird start={164.2} name="A NATION UNBREAKABLE" role="Survives everything" line="Fears nothing." accent="#d21034" />
      </Sprite>
      <Vignette strength={0.4} />
      <Letterbox />
    </div>
  );
}

// ── 7. The duel (169.5–188.5): Neymar vs Nazon — everything vs nothing ───────
function SceneDuel() {
  const { localTime: lt } = useSprite();
  const slideP = Easing.easeOutQuart(clamp(lt / 1.1, 0, 1));
  const vsP = Easing.easeOutBack(clamp((lt - 0.9) / 0.8, 0, 1));
  const shake = lt > 0.9 && lt < 1.25 ? Math.sin(lt * 160) * 7 * (1.25 - lt) / 0.35 : 0;
  return (
    <div style={{ position: 'absolute', inset: 0, background: '#05060a', transform: `translate(${shake}px, ${-shake}px)` }}>
      <div style={{ position: 'absolute', top: 0, bottom: 0, left: 0, width: '50%', overflow: 'hidden', transform: `translateX(${(1 - slideP) * -100}%)` }}>
        <ClipSprite id="duel-neymar" style={{ filter: 'saturate(1.15) brightness(0.95)' }} />
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(90deg, rgba(255,223,0,0.30), transparent 65%)' }} />
        <div style={{ position: 'absolute', bottom: 150, left: 90, zIndex: 5, fontFamily: '"Inter",sans-serif', fontWeight: 900, fontSize: 62, color: '#fff', textShadow: '0 4px 26px rgba(0,0,0,0.9)' }}>
          EVERYTHING
          <div style={{ fontSize: 27, fontWeight: 700, color: MV.gold, letterSpacing: '0.2em', marginTop: 8 }}>NEYMAR · THE LAST DANCE</div>
        </div>
      </div>
      <div style={{ position: 'absolute', top: 0, bottom: 0, right: 0, width: '50%', overflow: 'hidden', transform: `translateX(${(1 - slideP) * 100}%)` }}>
        <ClipSprite id="duel-nazon" style={{ filter: 'saturate(1.1) brightness(0.92)' }} />
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(270deg, rgba(0,32,159,0.36), transparent 65%)' }} />
        <div style={{ position: 'absolute', bottom: 150, right: 90, zIndex: 5, textAlign: 'right', fontFamily: '"Inter",sans-serif', fontWeight: 900, fontSize: 62, color: '#fff', textShadow: '0 4px 26px rgba(0,0,0,0.9)' }}>
          NOTHING
          <div style={{ fontSize: 27, fontWeight: 700, color: MV.gold, letterSpacing: '0.2em', marginTop: 8 }}>NAZON · FROM THE SHELVES</div>
        </div>
      </div>
      <div style={{ position: 'absolute', top: 0, bottom: 0, left: 'calc(50% - 3px)', width: 6, background: `linear-gradient(180deg, transparent, ${MV.gold}, transparent)`, zIndex: 24, opacity: slideP }} />
      <div style={{ position: 'absolute', top: '50%', left: '50%', zIndex: 26, transform: `translate(-50%,-50%) scale(${vsP}) rotate(${(1 - vsP) * 20}deg)`, opacity: clamp(vsP, 0, 1), width: 210, height: 210, borderRadius: '50%', background: MV.panel, border: `5px solid ${MV.gold}`, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: `0 0 90px ${MV.gold}66` }}>
        <span style={{ fontFamily: '"Inter",sans-serif', fontWeight: 900, fontSize: 92, color: MV.gold }}>VS</span>
      </div>
      <Sprite start={179} end={186}>
        <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 27, background: 'rgba(0,0,0,0.55)' }}>
          <BigTitle size={74} color={MV.text} style={{ maxWidth: 1400 }}>
            “Our prediction — five stars, samba… and one drum that never stops.”
          </BigTitle>
        </div>
      </Sprite>
      <Letterbox />
    </div>
  );
}

// ── 8. Match drama (188.5–243.5): the cascade, then the MIRACLE at 45+2 ──────
function SceneDrama() {
  const { localTime: lt } = useSprite();
  const S = 188.5;
  const punch = (at, mag) => { const d = lt + S - at; return d > 0 && d < 0.4 ? 1 + mag * (1 - d / 0.4) : 1; };
  const zoom = punch(190.6, 0.05) * punch(193.6, 0.05) * punch(196.6, 0.06) * punch(225.0, 0.09);
  return (
    <div style={{ position: 'absolute', inset: 0, background: '#000', transform: `scale(${zoom})` }}>
      <ClipSprite id="drama-vini" dim={0.06} />
      <ClipSprite id="drama-neymar" dim={0.06} />
      <ClipSprite id="drama-raphinha" dim={0.06} />
      <ClipSprite id="bra-cruise" />
      <ClipSprite id="hai-waiting" dim={0.1} />
      <ClipSprite id="nazon-slow" dim={0.05} style={{ filter: 'saturate(1.15) contrast(1.1)' }} />
      <ClipSprite id="nazon-snap" dim={0} />
      <ClipSprite id="hai-eruption" dim={0} />
      <ClipSprite id="ft-ovation" dim={0.15} />
      <FilmGrain start={188.5} dur={55} opacity={0.08} />

      {/* the goal cascade — first multi-goal ScoreBug ladder of the series */}
      <Sprite start={188.5} end={191.6}>
        <ScoreBug start={S + 0.3} kor={0} cze={0} minute="23'" homeLabel="BRA" awayLabel="HAI" homeColor="#ffdf00" awayColor="#00209f" />
      </Sprite>
      <GoalFlash at={190.6} text="VINI!" color="#ffdf00" />
      <Sprite start={191.6} end={194.8}>
        <ScoreBug start={191.6} kor={1} cze={0} minute="34'" homeLabel="BRA" awayLabel="HAI" homeColor="#ffdf00" awayColor="#00209f" />
      </Sprite>
      <GoalFlash at={193.6} text="NEYMAR!" color="#ffdf00" />
      <Sprite start={194.8} end={197.9}>
        <ScoreBug start={194.8} kor={2} cze={0} minute="41'" homeLabel="BRA" awayLabel="HAI" homeColor="#ffdf00" awayColor="#00209f" />
      </Sprite>
      <GoalFlash at={196.6} text="RAPHINHA!" color="#ffdf00" />
      <ReactionPiP start={188.7} dur={9.0} clipId="pip-bra" label="BRAZIL ERUPTS" accent="#ffdf00" />
      <Sprite start={197.9} end={207}>
        <ScoreBug start={197.9} kor={3} cze={0} minute="45'" homeLabel="BRA" awayLabel="HAI" homeColor="#ffdf00" awayColor="#00209f" />
      </Sprite>
      {/* THE PROMISED MOMENT: 45+2 in extreme slow motion */}
      <Sprite start={207} end={225}>
        <ScoreBug start={207} kor={3} cze={0} minute="45+2" homeLabel="BRA" awayLabel="HAI" homeColor="#ffdf00" awayColor="#00209f" />
      </Sprite>
      <KineticCaption start={207.5} dur={3.6} words={["STOPPAGE", "TIME"]} size={110} color={MV.gold} y="56%" />
      <KineticCaption start={219.0} dur={3.4} words={["HE", "SHOOTS"]} size={78} color="#e8eeff" y="60%" />
      <GoalFlash at={225.0} text="NAZON!!!" color="#00209f" />
      <Confetti start={225.2} dur={8} />
      <Sprite start={225} end={233}>
        <ScoreBug start={225} kor={3} cze={1} minute="45+2" homeLabel="BRA" awayLabel="HAI" homeColor="#ffdf00" awayColor="#00209f" />
      </Sprite>
      <Sprite start={233} end={243.5}>
        <RespectCard start={233.5} />
      </Sprite>
      <Vignette strength={0.42} />
      <Letterbox />
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
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 14 }}>
            <FlagBRA w={134} />
            <span style={{ fontFamily: '"Inter",sans-serif', fontWeight: 800, fontSize: 30, color: MV.text }}>BRAZIL</span>
          </div>
          <BigTitle size={140} color={MV.gold}>4 — 1</BigTitle>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 14 }}>
            <FlagHTI w={134} />
            <span style={{ fontFamily: '"Inter",sans-serif', fontWeight: 800, fontSize: 30, color: MV.text }}>HAITI</span>
          </div>
        </div>
        <div style={{ fontFamily: '"Inter",sans-serif', fontWeight: 600, fontSize: 25, color: MV.muted, marginTop: 22 }}>
          Vini 23' · Neymar 34' & 72' · Raphinha 41' — and NAZON 45+2, the goal of the night
        </div>
        <div style={{ fontFamily: '"Inter",sans-serif', fontWeight: 900, fontSize: 40, color: '#f6b40e', marginTop: 22, letterSpacing: '0.26em' }}>T H E&nbsp;&nbsp;W O R L D&nbsp;&nbsp;S T A N D S&nbsp;&nbsp;U P</div>
      </div>
    </div>
  );
}

// ── 9. Verdict (243.5–252.5): the motivated prediction ───────────────────────
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
            <BigTitle size={120} color={MV.gold}>4 — 1</BigTitle>
            <FlagHTI w={120} />
          </div>
          <div style={{ marginTop: 24 }}>
            <StatLine start={S + 1.2} delay={0.0} label="SAMBA or SPIRIT?" value="Comment SAMBA — Brazil win the Hexa" accent={MV.gold} />
            <StatLine start={S + 1.2} delay={0.25} label="" value="Comment SPIRIT — Nazon's goal is the moment of the tournament" accent="#00209f" />
            <StatLine start={S + 1.2} delay={0.5} label="The reason" value="Five stars vs one unbreakable heart · class wins, a legend is born" accent={MV.text} />
          </div>
        </div>
      </div>
      <Vignette strength={0.5} />
      <Letterbox />
    </div>
  );
}

// ── 10. Mystery payoff (252.5–272): Legend No. 008 ───────────────────────────
function SceneMysteryPayoff() {
  const { localTime: lt } = useSprite();
  const S = 252.5;
  const inP = Easing.easeOutCubic(clamp((lt - 0.6) / 1.4, 0, 1));
  const plateP = Easing.easeOutBack(clamp((lt - 4.6) / 0.9, 0, 1));
  return (
    <div style={{ position: 'absolute', inset: 0, background: '#02030a' }}>
      <ClipSprite id="payoff-tambouye" dim={0.12} />
      <div style={{ position: 'absolute', inset: 0, zIndex: 21, pointerEvents: 'none', opacity: 0.5, background: `radial-gradient(ellipse at ${22 + Math.sin(lt * 0.3) * 14}% 75%, rgba(210,16,52,0.14) 0%, transparent 45%), radial-gradient(ellipse at ${78 - Math.sin(lt * 0.22) * 12}% 30%, rgba(0,32,159,0.14) 0%, transparent 50%)` }} />
      <AmbientParticles start={S} dur={18} count={46} color="255,210,74" maxR={3.5} zIndex={22} />
      <div style={{ position: 'absolute', top: 118, left: 0, right: 0, textAlign: 'center', zIndex: 25, opacity: inP }}>
        <Kicker size={26} color="#a0c0e8">The Mystery Supporter · Legend No. 008</Kicker>
      </div>
      {plateP > 0 && (
        <div style={{ position: 'absolute', left: 110, bottom: 150, zIndex: 25, opacity: clamp(plateP, 0, 1), transform: `translateY(${(1 - plateP) * 50}px)` }}>
          <div style={{ background: 'rgba(8,14,26,0.88)', border: '1px solid rgba(232,160,160,0.35)', borderRadius: 18, padding: '28px 44px', backdropFilter: 'blur(6px)' }}>
            <div style={{ fontFamily: '"Inter",sans-serif', fontWeight: 900, fontSize: 54, color: '#e9f2ff' }}>LE TAMBOUYÉ DE 74</div>
            <div style={{ fontFamily: '"Inter",sans-serif', fontWeight: 700, fontSize: 25, color: '#a0c0e8', letterSpacing: '0.2em', marginTop: 8 }}>HE BEAT THE DRUM IN 1974 · HE HAS NEVER STOPPED</div>
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
          <VideoCard clipId="app-vini" name="BRAZIL" coef="x1.10" start={S} delay={1.2} accent="#ffdf00" />
          <VideoCard clipId="app-nazon" name="HAITI" coef="x3.00" start={S} delay={1.55} accent="#6e9bff" />
          <VideoCard clipId="app-messi" name="ARGENTINA" coef="x1.15" start={S} delay={1.9} accent="#74acdf" />
        </div>
        <div style={{ fontFamily: '"Inter",sans-serif', fontWeight: 800, fontSize: 32, color: MV.gold, letterSpacing: '0.06em' }}>
          FREE TO PLAY · LIVE LEADERBOARD · UNDERDOGS PAY TRIPLE
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
        <Kicker size={30}>Send this to the friend who stopped believing in miracles</Kicker>
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
