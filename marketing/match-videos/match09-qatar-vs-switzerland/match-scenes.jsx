// match-scenes.jsx — Episode 9: Qatar vs Switzerland (300s timeline).
// Scene windows must match SCENES in match.html, narration.json and clips.json.
// NOTE: nested <Sprite> windows are GLOBAL seconds.
const QAT = '#8a1538';   // Qatar maroon
const SUI = '#d52b1e';   // Swiss red

// ── 1. Mystery cold open (0–16): the falconer of the desert ──────────────────
function SceneMystery0() {
  const { localTime: lt } = useSprite();
  const beat = Math.pow(Math.max(0, Math.sin(lt * Math.PI * 1.0)), 8);
  return (
    <div style={{ position: 'absolute', inset: 0, background: '#000' }}>
      <ClipSprite id="mystery-falconer" dim={0.25} style={{ filter: 'brightness(0.64) saturate(0.9) contrast(1.12)' }} />
      <div style={{ position: 'absolute', inset: 0, zIndex: 21, pointerEvents: 'none', opacity: 0.6,
        background: `radial-gradient(ellipse at ${24 + Math.sin(lt * 0.25) * 16}% 70%, rgba(138,21,56,0.20) 0%, transparent 48%),` +
                    `radial-gradient(ellipse at ${76 - Math.sin(lt * 0.2) * 14}% 35%, rgba(213,43,30,0.12) 0%, transparent 50%)` }} />
      <div style={{ position: 'absolute', inset: 0, zIndex: 21, background: `radial-gradient(ellipse at center, rgba(246,180,14,${(0.20 * beat).toFixed(3)}) 0%, transparent 60%)` }} />
      <KineticCaption start={1.2} dur={3.4} words={["THE", "FALCON"]} size={96} color="#f3e0c0" />
      <KineticCaption start={5.0} dur={3.2} words={["WHO", "WAITED"]} size={96} color={MV.gold} />
      <Sprite start={12.6} end={16}>
        <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 27, background: 'rgba(0,0,0,0.35)' }}>
          <TitleReveal text="TONIGHT IT FLIES" start={12.7} size={120} color="#f6b40e" />
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
    <div style={{ position: 'absolute', inset: 0, background: `linear-gradient(180deg, #0a0f1c 0%, #1c1320 55%, #0a0f1c 100%)` }}>
      <ClipSprite id="recap-haiti" dim={0.25} />
      <ClipSprite id="recap-vini" dim={0.25} />
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
            EPISODE 7 · OUR PREDICTION: BRA 4—1 HAI
          </span>
        </div>
      )}
      {!showRecap && (<>
        <AmbientParticles start={26} dur={10} count={34} color="246,180,14" />
        <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 44 }}>
          <div style={{ opacity: p1, transform: `translateY(${(1 - p1) * -30}px)` }}>
            <Kicker>WorldCup26 Legends · Episode 9</Kicker>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 70, opacity: clamp(p2, 0, 1), transform: `scale(${p2})` }}>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 20 }}>
              <Waving><FlagQAT w={250} /></Waving>
              <BigTitle size={66} glow={QAT}>QATAR</BigTitle>
            </div>
            <BigTitle size={120} color={MV.gold}>VS</BigTitle>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 20 }}>
              <Waving speed={1.9}><FlagSUI w={210} /></Waving>
              <BigTitle size={66} glow={SUI}>SWITZERLAND</BigTitle>
            </div>
          </div>
          <div style={{ opacity: p3, fontFamily: '"Inter",sans-serif', fontWeight: 600, fontSize: 32, color: MV.muted, letterSpacing: '0.08em' }}>
            GROUP B · JUNE 13, 2026
          </div>
        </div>
      </>)}
      <ComingUp start={37.5} clipId="comingup-afif" label="MINUTE 78 — THE FREE KICK THAT FREEZES A NATION" />
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
          {[['2022', 'THE WORST HOST EVER'], ['2×', 'ASIAN CHAMPIONS'], ['EURO', 'SWISS KNOCKED OUT FRANCE'], ['1st', 'EVER MEETING']].map(([v, l], i) => (
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

// ── 4. History (46.5–98): the wound of 2022 and the desert's redemption ──────
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
        <div style={{ fontFamily: '"Inter",sans-serif', fontWeight: 900, fontSize: 104, color: accent, lineHeight: 1.05, margin: '12px 0 6px', textShadow: `0 0 60px ${accent}44` }}>{score}</div>
        <div style={{ fontFamily: '"Inter",sans-serif', fontWeight: 800, fontSize: 42, color: MV.text, letterSpacing: '0.08em' }}>{year}</div>
        {note && <div style={{ fontFamily: '"Inter",sans-serif', fontWeight: 600, fontSize: 26, color: MV.muted, marginTop: 14, maxWidth: 760 }}>{note}</div>}
        {stamp && stampP > 0 && (
          <div style={{ position: 'absolute', top: -34, right: -60, transform: `rotate(-12deg) scale(${stampP})`, border: `5px solid ${QAT}`, color: '#e0728f', borderRadius: 14, padding: '10px 26px', fontFamily: '"Inter",sans-serif', fontWeight: 900, fontSize: 32, letterSpacing: '0.1em', background: 'rgba(7,9,15,0.85)' }}>{stamp}</div>
        )}
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
      <div style={{ position: 'absolute', top: 112, left: 0, right: 0, textAlign: 'center', zIndex: 26 }}>
        <Kicker size={26}>Chapter One · The Wound and the Crown</Kicker>
      </div>
      <HistoryPlate start={S + 1} end={S + 10.5} year="QATAR · 2022" venue="THE HOST THAT LOST EVERYTHING" score="0 PTS" note="Three games, three defeats. The worst host performance in World Cup history." accent={QAT} stamp="THE WOUND" />
      <HistoryPlate start={S + 10.5} end={S + 22} year="ASIA · 2019 & 2023" venue="WHAT THE WORLD FORGOT" score="2× KINGS" note="Back-to-back Asian champions. Akram Afif, the best player on the continent." accent={MV.gold} stamp="REDEMPTION" />
      <HistoryPlate start={S + 22} end={S + 33} year="THE EUROS" venue="DO NOT UNDERESTIMATE THE SWISS" score="FRANCE OUT" note="Switzerland knocked the world champions out on penalties. The quiet machine bites." accent={SUI} stamp="STEEL" />
      <HistoryPlate start={S + 33} end={S + 43} year="GROUP B" venue="ONE NEEDS A POINT · ONE NEEDS NOTHING" score="DESERT vs ALPS" note="Switzerland must not slip. Qatar plays free — with nothing to lose." accent={MV.gold} />
      <HistoryPlate start={S + 43} end={S + 51.5} year="TONIGHT · 2026" venue="THE FIRST EVER MEETING" score="FOX vs EAGLE" note="The wounded host against the silent machine." accent={MV.gold} />
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
                : <img src={p.img} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />}
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

// ── 5. Qatar (98–133.6) ──────────────────────────────────────────────────────
function SceneQatar() {
  const { localTime: lt } = useSprite();
  const headerP = Easing.easeOutCubic(clamp(lt / 0.9, 0, 1));
  return (
    <div style={{ position: 'absolute', inset: 0, background: '#0c0a10' }}>
      {lt < 8 && <VideoSprite src="assets/stadium-qs.mp4" start={98.0} dur={6.5} rate={0.6} style={{ filter: 'brightness(0.25) saturate(0.7)' }} />}
      <ClipSprite id="afif" dim={0.12} />
      <ClipSprite id="almoez" dim={0.12} />
      <ClipSprite id="haydos" dim={0.12} />
      <ClipSprite id="qat-hopeful" dim={0.4} />
      <div style={{ position: 'absolute', inset: 0, zIndex: 22, pointerEvents: 'none', background: `linear-gradient(90deg, rgba(138,21,56,0.26) 0%, transparent 35%, transparent 70%, rgba(138,21,56,0.18) 100%)` }} />
      <div style={{ position: 'absolute', top: 108, left: 0, right: 0, display: 'flex', justifyContent: 'center', zIndex: 26, opacity: headerP, transform: `translateY(${(1 - headerP) * -24}px)` }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 26, background: MV.panel, border: `1px solid ${MV.line}`, borderRadius: 999, padding: '16px 44px' }}>
          <FlagQAT w={80} />
          <span style={{ fontFamily: '"Inter",sans-serif', fontWeight: 900, fontSize: 40, color: MV.text, letterSpacing: '0.10em' }}>THE DESERT FOX</span>
        </div>
      </div>
      <SquadGrid start={98.4} end={104.5} accent={QAT} players={[
        { img: 'assets/squad/qat-1-Akram-Afif.png', clip: 'assets/player-afif.mp4', name: 'AKRAM AFIF', role: 'THE MAGICIAN' },
        { img: 'assets/squad/qat-2-Almoez-Ali.png', clip: 'assets/player-almoez.mp4', name: 'ALMOEZ ALI', role: 'THE FINISHER' },
        { img: 'assets/squad/qat-3-Hassan-Al-Haydos.png', clip: 'assets/player-haydos.mp4', name: 'AL-HAYDOS', role: 'THE LAST DANCE' },
        { img: 'assets/squad/qat-4-Abdelkarim-Hassan.png', name: 'ABDELKARIM', role: 'THE OVERLAP' },
        { img: 'assets/squad/qat-5-Karim-Boudiaf.png', name: 'BOUDIAF', role: 'THE SHIELD' },
      ]} />
      <Sprite start={104.5} end={111}>
        <LowerThird start={104.8} name="AKRAM AFIF" role="The Magician · Asia's Best" line="He finds the space that should not exist." accent={QAT} />
      </Sprite>
      <Sprite start={111} end={119}>
        <LowerThird start={111.2} name="ALMOEZ ALI" role="The Finisher · Record Scorer" line="Qatar's all-time great. Remember minute 34." accent={QAT} />
      </Sprite>
      <Sprite start={119} end={133.6}>
        <LowerThird start={119.2} name="HASSAN AL-HAYDOS" role="The Captain" line="His final World Cup. Patience, precision, no fear." accent={QAT} />
      </Sprite>
      <Vignette strength={0.4} />
      <Letterbox />
    </div>
  );
}

// ── 6. Switzerland (133.6–169.5) ─────────────────────────────────────────────
function SceneSwitzerland() {
  const { localTime: lt } = useSprite();
  const headerP = Easing.easeOutCubic(clamp(lt / 0.9, 0, 1));
  return (
    <div style={{ position: 'absolute', inset: 0, background: '#0c0a10' }}>
      <ClipSprite id="xhaka" dim={0.12} />
      <ClipSprite id="akanji" dim={0.12} />
      <ClipSprite id="ndoye" dim={0.12} />
      <ClipSprite id="embolo-intro" dim={0.12} />
      <div style={{ position: 'absolute', inset: 0, zIndex: 22, pointerEvents: 'none', background: `linear-gradient(90deg, rgba(213,43,30,0.26) 0%, transparent 35%, transparent 70%, rgba(255,255,255,0.10) 100%)` }} />
      <div style={{ position: 'absolute', top: 108, left: 0, right: 0, display: 'flex', justifyContent: 'center', zIndex: 26, opacity: headerP, transform: `translateY(${(1 - headerP) * -24}px)` }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 26, background: MV.panel, border: `1px solid ${MV.line}`, borderRadius: 999, padding: '16px 44px' }}>
          <FlagSUI w={64} />
          <span style={{ fontFamily: '"Inter",sans-serif', fontWeight: 900, fontSize: 40, color: MV.text, letterSpacing: '0.10em' }}>THE ALPINE EAGLE</span>
        </div>
      </div>
      <SquadGrid start={134.2} end={143.5} accent={SUI} players={[
        { img: 'assets/squad/sui-1-Granit-Xhaka.png', clip: 'assets/player-xhaka.mp4', name: 'GRANIT XHAKA', role: 'THE GENERAL' },
        { img: 'assets/squad/sui-2-Manuel-Akanji.png', clip: 'assets/player-akanji.mp4', name: 'MANUEL AKANJI', role: 'THE ELEGANCE' },
        { img: 'assets/squad/sui-3-Dan-Ndoye.png', clip: 'assets/player-ndoye.mp4', name: 'DAN NDOYE', role: 'ELECTRIC FEET' },
        { img: 'assets/squad/sui-4-Breel-Embolo.png', clip: 'assets/player-embolo.mp4', name: 'BREEL EMBOLO', role: 'ONE CHANCE' },
        { img: 'assets/squad/sui-5-Ardon-Jashari.png', name: 'JASHARI', role: 'THE ENGINE' },
      ]} />
      <Sprite start={143.5} end={149}>
        <LowerThird start={143.8} name="GRANIT XHAKA" role="The General · Captain" line="He runs the tempo of the whole team." accent={SUI} />
      </Sprite>
      <Sprite start={149} end={153.5}>
        <LowerThird start={149.2} name="DAN NDOYE" role="Electric Feet · Winger" line="One burst can break the game open." accent={SUI} />
      </Sprite>
      <Sprite start={153.5} end={169.5}>
        <LowerThird start={153.7} name="BREEL EMBOLO" role="The Striker" line="He waits for one chance. He only needs one." accent={SUI} />
      </Sprite>
      <Vignette strength={0.4} />
      <Letterbox />
    </div>
  );
}

// ── 7. The duel (169.5–188.5): Afif vs Xhaka — artist vs architect ──────────
function SceneDuel() {
  const { localTime: lt } = useSprite();
  const slideP = Easing.easeOutQuart(clamp(lt / 1.1, 0, 1));
  const vsP = Easing.easeOutBack(clamp((lt - 0.9) / 0.8, 0, 1));
  const shake = lt > 0.9 && lt < 1.25 ? Math.sin(lt * 160) * 7 * (1.25 - lt) / 0.35 : 0;
  return (
    <div style={{ position: 'absolute', inset: 0, background: '#05060a', transform: `translate(${shake}px, ${-shake}px)` }}>
      <div style={{ position: 'absolute', top: 0, bottom: 0, left: 0, width: '50%', overflow: 'hidden', transform: `translateX(${(1 - slideP) * -100}%)` }}>
        <ClipSprite id="duel-afif" style={{ filter: 'saturate(1.15) brightness(0.95)' }} />
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(90deg, rgba(138,21,56,0.42), transparent 65%)' }} />
        <div style={{ position: 'absolute', bottom: 150, left: 90, zIndex: 5, fontFamily: '"Inter",sans-serif', fontWeight: 900, fontSize: 60, color: '#fff', textShadow: '0 4px 26px rgba(0,0,0,0.9)' }}>
          THE ARTIST
          <div style={{ fontSize: 27, fontWeight: 700, color: MV.gold, letterSpacing: '0.2em', marginTop: 8 }}>AFIF · IMAGINATION</div>
        </div>
      </div>
      <div style={{ position: 'absolute', top: 0, bottom: 0, right: 0, width: '50%', overflow: 'hidden', transform: `translateX(${(1 - slideP) * 100}%)` }}>
        <ClipSprite id="duel-xhaka" style={{ filter: 'saturate(1.1) brightness(0.92)' }} />
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(270deg, rgba(213,43,30,0.4), transparent 65%)' }} />
        <div style={{ position: 'absolute', bottom: 150, right: 90, zIndex: 5, textAlign: 'right', fontFamily: '"Inter",sans-serif', fontWeight: 900, fontSize: 60, color: '#fff', textShadow: '0 4px 26px rgba(0,0,0,0.9)' }}>
          THE ARCHITECT
          <div style={{ fontSize: 27, fontWeight: 700, color: MV.gold, letterSpacing: '0.2em', marginTop: 8 }}>XHAKA · ORDER</div>
        </div>
      </div>
      <div style={{ position: 'absolute', top: 0, bottom: 0, left: 'calc(50% - 3px)', width: 6, background: `linear-gradient(180deg, transparent, ${MV.gold}, transparent)`, zIndex: 24, opacity: slideP }} />
      <div style={{ position: 'absolute', top: '50%', left: '50%', zIndex: 26, transform: `translate(-50%,-50%) scale(${vsP}) rotate(${(1 - vsP) * 20}deg)`, opacity: clamp(vsP, 0, 1), width: 210, height: 210, borderRadius: '50%', background: MV.panel, border: `5px solid ${MV.gold}`, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: `0 0 90px ${MV.gold}66` }}>
        <span style={{ fontFamily: '"Inter",sans-serif', fontWeight: 900, fontSize: 92, color: MV.gold }}>VS</span>
      </div>
      <Sprite start={179} end={186}>
        <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 27, background: 'rgba(0,0,0,0.55)' }}>
          <BigTitle size={74} color={MV.text} style={{ maxWidth: 1400 }}>
            “Our prediction — the wound of 2022… against Swiss steel.”
          </BigTitle>
        </div>
      </Sprite>
      <Letterbox />
    </div>
  );
}

// ── 8. Match drama (188.5–243.5): the miss, the goal, the 78' free kick ─────
function SceneDrama() {
  const { localTime: lt } = useSprite();
  const S = 188.5;
  const punch = (at, mag) => { const d = lt + S - at; return d > 0 && d < 0.4 ? 1 + mag * (1 - d / 0.4) : 1; };
  const zoom = punch(207.2, 0.07) * punch(225.0, 0.08);
  return (
    <div style={{ position: 'absolute', inset: 0, background: '#000', transform: `scale(${zoom})` }}>
      <ClipSprite id="drama-afif" dim={0.06} />
      <ClipSprite id="drama-almoez" dim={0.05} />
      <ClipSprite id="drama-ndoye" dim={0.06} />
      <ClipSprite id="drama-embolo" dim={0} />
      <ClipSprite id="sui-joy" />
      <ClipSprite id="afif-slow" dim={0.05} style={{ filter: 'saturate(1.15) contrast(1.1)' }} />
      <ClipSprite id="qat-anxious" dim={0.35} style={{ opacity: 0.45 }} />
      <ClipSprite id="sommer-snap" dim={0} />
      <ClipSprite id="ft-ovation" dim={0.15} />
      <FilmGrain start={188.5} dur={55} opacity={0.08} />

      <Sprite start={188.5} end={193.0}>
        <ScoreBug start={S + 0.3} kor={0} cze={0} minute="34'" homeLabel="QAT" awayLabel="SUI" homeColor="#8a1538" awayColor="#d52b1e" />
      </Sprite>
      <KineticCaption start={189.2} dur={3.2} words={["WIDE!"]} size={120} color={QAT} y="58%" />
      <Sprite start={193.0} end={207}>
        <ScoreBug start={193.0} kor={0} cze={0} minute="52'" homeLabel="QAT" awayLabel="SUI" homeColor="#8a1538" awayColor="#d52b1e" />
      </Sprite>
      <GoalFlash at={207.2} text="EMBOLO!" color={SUI} />
      <Confetti start={207.4} dur={6} />
      <Sprite start={207} end={225}>
        <ScoreBug start={207} kor={0} cze={1} minute="78'" homeLabel="QAT" awayLabel="SUI" homeColor="#8a1538" awayColor="#d52b1e" />
      </Sprite>
      <KineticCaption start={218.6} dur={4} words={["MINUTE", "78"]} size={110} color={MV.gold} y="56%" />
      <GoalFlash at={225.0} text="SOMMER!!" color="#e8eeff" />
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
            <FlagQAT w={134} />
            <span style={{ fontFamily: '"Inter",sans-serif', fontWeight: 800, fontSize: 30, color: MV.text }}>QATAR</span>
          </div>
          <BigTitle size={140} color={MV.gold}>0 — 1</BigTitle>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 14 }}>
            <FlagSUI w={120} />
            <span style={{ fontFamily: '"Inter",sans-serif', fontWeight: 800, fontSize: 30, color: MV.text }}>SWITZERLAND</span>
          </div>
        </div>
        <div style={{ fontFamily: '"Inter",sans-serif', fontWeight: 600, fontSize: 25, color: MV.muted, marginTop: 22 }}>
          Embolo 52' · Afif's 78' free kick tipped onto the bar by Sommer
        </div>
        <div style={{ fontFamily: '"Inter",sans-serif', fontWeight: 900, fontSize: 38, color: '#f6b40e', marginTop: 22, letterSpacing: '0.22em' }}>A&nbsp;&nbsp;B E G I N N I N G,&nbsp;&nbsp;N O T&nbsp;&nbsp;A N&nbsp;&nbsp;E N D</div>
      </div>
    </div>
  );
}

// ── 9. Verdict (243.5–252.5) ─────────────────────────────────────────────────
function SceneVerdict() {
  const S = 244;
  return (
    <div style={{ position: 'absolute', inset: 0, background: '#0a0f1c' }}>
      <ClipSprite id="verdict-bg" dim={0.6} />
      <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 25 }}>
        <div style={{ background: MV.panel, border: `1px solid ${MV.line}`, borderRadius: 24, padding: '46px 80px', minWidth: 940, backdropFilter: 'blur(6px)' }}>
          <Kicker size={26}>Our Prediction — and why</Kicker>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 50, marginTop: 26 }}>
            <FlagQAT w={120} />
            <BigTitle size={120} color={MV.gold}>0 — 1</BigTitle>
            <FlagSUI w={104} />
          </div>
          <div style={{ marginTop: 24 }}>
            <StatLine start={S + 1.2} delay={0.0} label="EAGLE or FALCON?" value="Comment EAGLE — Switzerland go far this summer" accent={SUI} />
            <StatLine start={S + 1.2} delay={0.25} label="" value="Comment FALCON — Qatar shocks Group B" accent={QAT} />
            <StatLine start={S + 1.2} delay={0.5} label="The reason" value="Swiss steel holds · the host plays free · respect over points" accent={MV.text} />
          </div>
        </div>
      </div>
      <Vignette strength={0.5} />
      <Letterbox />
    </div>
  );
}

// ── 10. Mystery payoff (252.5–272): Legend No. 009 ───────────────────────────
function SceneMysteryPayoff() {
  const { localTime: lt } = useSprite();
  const S = 252.5;
  const inP = Easing.easeOutCubic(clamp((lt - 0.6) / 1.4, 0, 1));
  const plateP = Easing.easeOutBack(clamp((lt - 4.6) / 0.9, 0, 1));
  return (
    <div style={{ position: 'absolute', inset: 0, background: '#0a0608' }}>
      <ClipSprite id="payoff-falconer" dim={0.12} />
      <div style={{ position: 'absolute', inset: 0, zIndex: 21, pointerEvents: 'none', opacity: 0.5, background: `radial-gradient(ellipse at ${22 + Math.sin(lt * 0.3) * 14}% 75%, rgba(138,21,56,0.16) 0%, transparent 45%)` }} />
      <AmbientParticles start={S} dur={18} count={46} color="255,210,74" maxR={3.5} zIndex={22} />
      <div style={{ position: 'absolute', top: 118, left: 0, right: 0, textAlign: 'center', zIndex: 25, opacity: inP }}>
        <Kicker size={26} color="#e7c08a">The Mystery Supporter · Legend No. 009</Kicker>
      </div>
      {plateP > 0 && (
        <div style={{ position: 'absolute', left: 110, bottom: 150, zIndex: 25, opacity: clamp(plateP, 0, 1), transform: `translateY(${(1 - plateP) * 50}px)` }}>
          <div style={{ background: 'rgba(20,12,16,0.9)', border: '1px solid rgba(232,180,140,0.35)', borderRadius: 18, padding: '28px 44px', backdropFilter: 'blur(6px)' }}>
            <div style={{ fontFamily: '"Inter",sans-serif', fontWeight: 900, fontSize: 54, color: '#f7ecd9' }}>THE FALCONER OF THE DESERT</div>
            <div style={{ fontFamily: '"Inter",sans-serif', fontWeight: 700, fontSize: 25, color: '#e7c08a', letterSpacing: '0.18em', marginTop: 8 }}>HE BELIEVED IN QATAR BEFORE THEY HAD A STADIUM</div>
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

// ── 11. App promo (272–290) ──────────────────────────────────────────────────
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
          <VideoCard clipId="app-afif" name="QATAR" coef="x3.20" start={S} delay={1.2} accent="#c66a86" />
          <VideoCard clipId="app-vini" name="BRAZIL" coef="x1.10" start={S} delay={1.55} accent="#ffdf00" />
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
        <Kicker size={30}>Send this to the friend who wrote Qatar off</Kicker>
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
