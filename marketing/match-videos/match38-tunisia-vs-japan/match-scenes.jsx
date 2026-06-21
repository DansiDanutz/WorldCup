// match-scenes.jsx — the eleven scenes of the Ep38 video (300s timeline).
// Japan vs Tunisia · "Precision vs Passion" · Group F · packed World Cup stadium.
// MATCH NOT YET PLAYED — predicted Japan 2–1 (91' Kubo). Every scoreline/goal is
// OUR PREDICTION, clearly labelled, never stated as a real result.
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
      <ClipSprite id="glimpse-stad" style={{ filter: 'brightness(0.78) contrast(1.15) saturate(1.2)' }} />
      <ClipSprite id="glimpse-mitoma" style={{ filter: 'brightness(0.78) contrast(1.15) saturate(1.2)' }} />
      <ClipSprite id="glimpse-mejbri" style={{ filter: 'brightness(0.78) contrast(1.15) saturate(1.2)' }} />
      <ClipSprite id="glimpse-jpn" style={{ filter: 'brightness(0.78) contrast(1.15) saturate(1.2)' }} />
      {/* ember base so the screen never reads as dead air */}
      <div style={{
        position: 'absolute', inset: 0,
        background: `radial-gradient(ellipse at 50% 78%, rgba(26,42,108,0.16) 0%, transparent 55%)`,
      }} />
      {/* heartbeat glow */}
      <div style={{
        position: 'absolute', inset: 0,
        background: `radial-gradient(ellipse at center, rgba(231,0,19,${(0.45 * beat).toFixed(3)}) 0%, transparent 62%)`,
      }} />
      <Vignette strength={0.8} />
      {lt > 12.6 && (
        <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 34, opacity: titleP, zIndex: 22 }}>
          <Kicker size={34}>Precision vs Passion</Kicker>
          <TitleReveal text="HEART vs HISTORY" start={12.7} size={140} color={MV.gold} />
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
          <Kicker>WorldCup26 Legends · Episode 38</Kicker>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 70, opacity: clamp(p2, 0, 1), transform: `scale(${p2})` }}>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 20 }}>
            <Waving><FlagJPN w={230} /></Waving>
            <BigTitle size={66} glow={MV.jpnLight}>JAPAN</BigTitle>
          </div>
          <BigTitle size={120} color={MV.gold}>VS</BigTitle>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 20 }}>
            <Waving speed={1.9}><FlagTUN w={230} /></Waving>
            <BigTitle size={66} glow={MV.tunLight}>TUNISIA</BigTitle>
          </div>
        </div>
        <div style={{ opacity: p3, transform: `translateY(${(1 - p3) * 26}px)`, fontFamily: '"Inter",sans-serif', fontWeight: 600, fontSize: 32, color: MV.muted, letterSpacing: '0.08em' }}>
          GROUP F · A PACKED WORLD CUP NIGHT · 2026
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
          {[['40 YRS', 'JAPAN\'S RISE FROM NOTHING'], ['8x', 'TUNISIA WORLD CUPS'], ['MADRID·LIVERPOOL·COLOGNE', 'WHERE JAPAN PLAYS'], ['THE EDGE', 'BOTH STUCK AT THE KNOCKOUTS']].map(([v, l], i) => (
            <div key={i} style={{ padding: '24px 42px', borderLeft: i ? `1px solid ${MV.line}` : 'none', textAlign: 'center' }}>
              <div style={{ fontFamily: '"Inter",sans-serif', fontWeight: 900, fontSize: 40, color: MV.gold }}>{v}</div>
              <div style={{ fontFamily: '"Inter",sans-serif', fontWeight: 700, fontSize: 18, color: MV.muted, letterSpacing: '0.16em', marginTop: 6 }}>{l}</div>
            </div>
          ))}
        </div>
      </div>
      <Letterbox />
    </div>
  );
}

// ── 4. History (44–98.5): the real story between the two nations ────────────
function HistoryPlate({ start, end, year, venue, score, accent = MV.gold, stamp }) {
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
        {stamp && stampP > 0 && (
          <div style={{
            position: 'absolute', top: -34, right: -60, transform: `rotate(-12deg) scale(${stampP})`,
            border: `5px solid ${MV.tun}`, color: MV.tunLight, borderRadius: 14, padding: '10px 26px',
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
      <ClipSprite id="hist-jpn" dim={0.72} style={{ filter: 'brightness(0.28) saturate(0.65) contrast(1.1)' }} />
      <ClipSprite id="hist-tun" dim={0.72} style={{ filter: 'brightness(0.28) saturate(0.65) contrast(1.1)' }} />
      <ClipSprite id="hist-stad" dim={0.72} style={{ filter: 'brightness(0.28) saturate(0.65) contrast(1.1)' }} />
      <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse at center, transparent 30%, rgba(5,6,10,0.82) 100%)' }} />
      <AmbientParticles start={44} dur={54.5} count={30} maxR={4} />
      {/* chapter header */}
      <div style={{ position: 'absolute', top: 116, left: 0, right: 0, textAlign: 'center', zIndex: 26 }}>
        <Kicker size={28}>Chapter One · The Story</Kicker>
      </div>
      {/* flag pair, always present */}
      <div style={{ position: 'absolute', bottom: 132, left: 0, right: 0, display: 'flex', justifyContent: 'center', gap: 40, zIndex: 26, opacity: 0.95 }}>
        <FlagJPN w={108} />
        <div style={{ alignSelf: 'center', fontFamily: '"Inter",sans-serif', fontWeight: 900, fontSize: 34, color: MV.gold }}>×</div>
        <FlagTUN w={108} />
      </div>
      {/* beats synced to the narration */}
      <HistoryPlate start={S + 1.0} end={S + 12} year="THE QUESTION" venue="ONE NIGHT · TWO WORLDS" score="REMADE" accent={MV.gold} />
      <HistoryPlate start={S + 12} end={S + 23} year="THE SAMURAI" venue="FROM NO TRADITION" score="JAPAN" accent={MV.jpnLight} />
      <HistoryPlate start={S + 23} end={S + 33.5} year="THE EAGLES" venue="MOST CONSISTENT IN AFRICA" score="TUNISIA" accent={MV.tun} />
      <HistoryPlate start={S + 33.5} end={S + 44} year="THE SCAR" venue="THE SAME WOUND" score="SO CLOSE" accent={MV.gold} stamp="JUST SHORT" />
      <HistoryPlate start={S + 44} end={S + 54} year="2026" venue="THE DOOR IS RIGHT THERE" score="TONIGHT" accent={MV.gold} />
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
      gap: 26, opacity: clamp(fade, 0, 1), padding: '0 70px',
    }}>
      {players.map((p, i) => {
        const cp = Easing.easeOutBack(clamp((t - start - 0.25 - i * 0.28) / 0.7, 0, 1));
        return (
          <div key={i} style={{
            width: 256, transform: `translateY(${(1 - cp) * 90}px) scale(${0.85 + 0.15 * cp})`, opacity: clamp(cp, 0, 1),
            borderRadius: 22, overflow: 'hidden', background: MV.panel, border: `1px solid ${MV.line}`,
            boxShadow: `0 26px 80px rgba(0,0,0,0.6)`,
          }}>
            <div style={{ height: 280, overflow: 'hidden' }}>
              <img src={p.img} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', transform: `scale(${1.02 + 0.05 * clamp((t - start) / (end - start), 0, 1)})` }} />
            </div>
            <div style={{ padding: '16px 14px 18px', textAlign: 'center', borderTop: `4px solid ${accent}` }}>
              <div style={{ fontFamily: '"Inter",sans-serif', fontWeight: 900, fontSize: 23, color: MV.text }}>{p.name}</div>
              <div style={{ fontFamily: '"Inter",sans-serif', fontWeight: 700, fontSize: 16, color: MV.muted, letterSpacing: '0.14em', marginTop: 5 }}>{p.role}</div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ── 5. Japan (98.5–133.5): squad grid then animated stars ────────────────────
function SceneJapan() {
  const { localTime: lt } = useSprite();
  const S = 98.5;
  const headerP = Easing.easeOutCubic(clamp(lt / 0.9, 0, 1));
  return (
    <div style={{ position: 'absolute', inset: 0, background: '#0a0c14' }}>
      <ClipSprite id="jpn-bg" dim={0.55} />
      <ClipSprite id="mitoma" dim={0.12} />
      <ClipSprite id="kubo" dim={0.12} />
      <ClipSprite id="endo" dim={0.12} />
      <ClipSprite id="ueda" dim={0.12} />
      <ClipSprite id="minamino" dim={0.12} />
      <div style={{ position: 'absolute', inset: 0, zIndex: 22, pointerEvents: 'none', background: `linear-gradient(90deg, rgba(26,42,108,0.22) 0%, transparent 30%, transparent 70%, rgba(231,0,19,0.10) 100%)` }} />
      <div style={{ position: 'absolute', top: 108, left: 0, right: 0, display: 'flex', justifyContent: 'center', zIndex: 26, opacity: headerP, transform: `translateY(${(1 - headerP) * -24}px)` }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 26, background: MV.panel, border: `1px solid ${MV.line}`, borderRadius: 999, padding: '16px 44px' }}>
          <FlagJPN w={74} />
          <span style={{ fontFamily: '"Inter",sans-serif', fontWeight: 900, fontSize: 40, color: MV.text, letterSpacing: '0.10em' }}>THE BLUE SAMURAI</span>
        </div>
      </div>
      <SquadGrid start={S + 0.4} end={S + 7.5} accent={MV.jpn} players={[
        { img: 'assets/squad/jpn-mitoma.png', name: 'KAORU MITOMA', role: 'THE BURST' },
        { img: 'assets/squad/jpn-kubo.png', name: 'TAKEFUSA KUBO', role: 'THE LEFT FOOT' },
        { img: 'assets/squad/jpn-endo.png', name: 'WATARU ENDO', role: 'THE FOUNDATION' },
        { img: 'assets/squad/jpn-ueda.png', name: 'AYASE UEDA', role: 'THE SPEARHEAD' },
        { img: 'assets/squad/jpn-minamino.png', name: 'TAKUMI MINAMINO', role: 'THE CRAFT' },
        { img: 'assets/squad/jpn-tomiyasu.png', name: 'TAKEHIRO TOMIYASU', role: 'THE STEEL' },
      ]} />
      <Sprite start={106.0} end={116.0}>
        <LowerThird start={106.5} name="KAORU MITOMA" role="The Burst · Winger" accent={MV.jpnLight} />
      </Sprite>
      <Sprite start={116.0} end={125.0}>
        <LowerThird start={116.5} name="TAKEFUSA KUBO" role="The Left Foot · Forward" accent={MV.jpnLight} />
      </Sprite>
      <Sprite start={125.0} end={133.5}>
        <LowerThird start={125.3} name="WATARU ENDO" role="The Foundation · Midfield" accent={MV.jpnLight} />
      </Sprite>
      <Vignette strength={0.4} />
      <Letterbox />
    </div>
  );
}

// ── 6. Tunisia (133.5–164.5): the Eagles of Carthage ─────────────────────────
function SceneTunisia() {
  const { localTime: lt } = useSprite();
  const S = 133.5;
  const headerP = Easing.easeOutCubic(clamp(lt / 0.9, 0, 1));
  return (
    <div style={{ position: 'absolute', inset: 0, background: '#0a0c14' }}>
      <ClipSprite id="tun-bg" dim={0.55} />
      <ClipSprite id="mejbri" dim={0.12} />
      <ClipSprite id="achouri" dim={0.12} />
      <ClipSprite id="skhiri" dim={0.12} />
      <ClipSprite id="bronn" dim={0.12} />
      <ClipSprite id="talbi" dim={0.12} />
      <ClipSprite id="tomiyasu" dim={0.12} />
      <div style={{ position: 'absolute', inset: 0, zIndex: 22, pointerEvents: 'none', background: `linear-gradient(90deg, rgba(231,0,19,0.26) 0%, transparent 30%, transparent 70%, rgba(255,255,255,0.10) 100%)` }} />
      <div style={{ position: 'absolute', top: 108, left: 0, right: 0, display: 'flex', justifyContent: 'center', zIndex: 26, opacity: headerP, transform: `translateY(${(1 - headerP) * -24}px)` }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 26, background: MV.panel, border: `1px solid ${MV.line}`, borderRadius: 999, padding: '16px 44px' }}>
          <FlagTUN w={74} />
          <span style={{ fontFamily: '"Inter",sans-serif', fontWeight: 900, fontSize: 40, color: MV.text, letterSpacing: '0.10em' }}>THE CARTHAGE EAGLES</span>
        </div>
      </div>
      <SquadGrid start={S + 0.4} end={S + 11} accent={MV.tun} players={[
        { img: 'assets/squad/tun-mejbri.png', name: 'HANNIBAL MEJBRI', role: 'THE TORNADO' },
        { img: 'assets/squad/tun-achouri.png', name: 'ELIAS ACHOURI', role: 'THE ENGINE' },
        { img: 'assets/squad/tun-skhiri.png', name: 'ELLYES SKHIRI', role: 'THE HEARTBEAT' },
        { img: 'assets/squad/tun-bronn.png', name: 'DYLAN BRONN', role: 'THE WALL' },
        { img: 'assets/squad/tun-talbi.png', name: 'MONTASSAR TALBI', role: 'THE ROCK' },
      ]} />
      <Sprite start={144.5} end={154.5}>
        <LowerThird start={144.8} name="HANNIBAL MEJBRI" role="The Tornado · Midfield" accent={MV.tunLight} />
      </Sprite>
      <Sprite start={154.5} end={159.0}>
        <LowerThird start={154.7} name="ELIAS ACHOURI" role="The Engine · Winger" accent={MV.tunLight} />
      </Sprite>
      <Sprite start={159.0} end={164.5}>
        <LowerThird start={159.2} name="ELLYES SKHIRI" role="The Heartbeat · Midfield" accent={MV.tunLight} />
      </Sprite>
      <Vignette strength={0.4} />
      <Letterbox />
    </div>
  );
}

// ── 7. The duel (164.5–186): Endo vs Mejbri split screen ─────────────────────
function SceneDuel() {
  const { localTime: lt } = useSprite();
  const slideP = Easing.easeOutQuart(clamp(lt / 1.1, 0, 1));
  const vsP = Easing.easeOutBack(clamp((lt - 0.9) / 0.8, 0, 1));
  const shake = lt > 0.9 && lt < 1.25 ? Math.sin(lt * 160) * 7 * (1.25 - lt) / 0.35 : 0;
  return (
    <div style={{ position: 'absolute', inset: 0, background: '#05060a', transform: `translate(${shake}px, ${-shake}px)` }}>
      <div style={{ position: 'absolute', top: 0, bottom: 0, left: 0, width: '50%', overflow: 'hidden', transform: `translateX(${(1 - slideP) * -100}%)` }}>
        <img src="assets/squad/jpn-endo.png" alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', filter: 'saturate(1.15) brightness(0.92)' }} />
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(90deg, rgba(26,42,108,0.34), transparent 65%)' }} />
        <div style={{ position: 'absolute', bottom: 150, left: 90, fontFamily: '"Inter",sans-serif', fontWeight: 900, fontSize: 62, color: '#fff', textShadow: '0 4px 26px rgba(0,0,0,0.9)' }}>
          THE CLOCKWORK
          <div style={{ fontSize: 27, fontWeight: 700, color: MV.gold, letterSpacing: '0.2em', marginTop: 8 }}>WATARU ENDO · PRECISION</div>
        </div>
      </div>
      <div style={{ position: 'absolute', top: 0, bottom: 0, right: 0, width: '50%', overflow: 'hidden', transform: `translateX(${(1 - slideP) * 100}%)` }}>
        <img src="assets/squad/tun-mejbri.png" alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', filter: 'saturate(1.15) brightness(0.92)' }} />
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(270deg, rgba(231,0,19,0.42), transparent 65%)' }} />
        <div style={{ position: 'absolute', bottom: 150, right: 90, textAlign: 'right', fontFamily: '"Inter",sans-serif', fontWeight: 900, fontSize: 62, color: '#fff', textShadow: '0 4px 26px rgba(0,0,0,0.9)' }}>
          THE TORNADO
          <div style={{ fontSize: 27, fontWeight: 700, color: MV.gold, letterSpacing: '0.2em', marginTop: 8 }}>HANNIBAL MEJBRI · PASSION</div>
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
      <Sprite start={180} end={186}>
        <div style={{ position: 'absolute', left: 0, right: 0, bottom: 0, top: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 27, background: 'rgba(0,0,0,0.55)' }}>
          <BigTitle size={84} color={MV.text} style={{ maxWidth: 1400 }}>
            “PRECISION vs PASSION”
          </BigTitle>
        </div>
      </Sprite>
      <Letterbox />
    </div>
  );
}

// ── 8. Match drama (186–242): 1–1, the 91st-minute Kubo winner — OUR PREDICTION
//      This is NOT a real result. The ScoreBug + final card carry the
//      "OUR PREDICTION" badge, never "FULL TIME" or anything stated as fact.
function SceneDrama() {
  const { localTime: lt } = useSprite();
  const S = 186;
  return (
    <div style={{ position: 'absolute', inset: 0, background: '#000' }}>
      <ClipSprite id="drama-tun1" dim={0.06} />
      <ClipSprite id="drama-mejbri" dim={0.1} />
      <ClipSprite id="drama-achouri" dim={0.1} />
      <ClipSprite id="drama-mitoma" dim={0.1} />
      <ClipSprite id="drama-kubo" dim={0.1} />
      <ClipSprite id="drama-jpn-cel" dim={0.05} />
      <ClipSprite id="drama-stad" dim={0.08} />

      {/* Locked at one apiece — both exhausted, neither breaking */}
      <Sprite start={186} end={231}>
        <ScoreBug start={S + 0.4} jpn={1} tun={1} minute="90'" badge="OUR PREDICTION" />
      </Sprite>

      {/* 91st minute — Mitoma's burst, the cut-back, Kubo's left foot */}
      <GoalFlash at={S + 45.5} />
      <Sprite start={231} end={242}>
        <ScoreBug start={S + 46.2} jpn={2} tun={1} minute="91'" badge="OUR PREDICTION" />
      </Sprite>

      {/* The predicted final — clearly stamped OUR PREDICTION, never FULL TIME */}
      <Sprite start={233} end={242}>
        <PredictionCard start={S + 47.5} />
      </Sprite>
      <Vignette strength={0.42} />
      <Letterbox />
    </div>
  );
}

// The predicted final scoreline — stamped OUR PREDICTION (the match isn't played).
function PredictionCard({ start }) {
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
        <Kicker size={26}>Our Prediction · The 91st Minute</Kicker>
        <div style={{ display: 'flex', alignItems: 'center', gap: 56, marginTop: 40 }}>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16 }}>
            <FlagJPN w={150} />
            <span style={{ fontFamily: '"Inter",sans-serif', fontWeight: 800, fontSize: 34, color: MV.text }}>JAPAN</span>
          </div>
          <BigTitle size={170} color={MV.gold}>2 — 1</BigTitle>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16 }}>
            <FlagTUN w={150} />
            <span style={{ fontFamily: '"Inter",sans-serif', fontWeight: 800, fontSize: 34, color: MV.text }}>TUNISIA</span>
          </div>
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
          <Kicker size={26}>Group F · Our Prediction</Kicker>
          <div style={{ marginTop: 26 }}>
            <StatLine start={S + 0.8} delay={0.0} label="JAPAN" value="THROUGH" accent={MV.jpnLight} />
            <StatLine start={S + 0.8} delay={0.25} label="TUNISIA" value="JUST SHORT" accent={MV.tunLight} />
            <StatLine start={S + 0.8} delay={0.5} label="OUR PREDICTION" value="JPN 2 — 1 TUN" accent={MV.text} />
            <StatLine start={S + 0.8} delay={0.75} label="91' KUBO" value="THE WINNER" accent={MV.gold} />
          </div>
        </div>
      </div>
      <Vignette strength={0.5} />
      <Letterbox />
    </div>
  );
}


// ── 10b. Mystery Supporter (256–270): the series' signature collectible card ──
function SceneMystery() {
  const { localTime: lt } = useSprite();
  const S = 256;
  const inP = Easing.easeOutCubic(clamp((lt - 0.6) / 1.4, 0, 1));
  const cardP = Easing.easeOutBack(clamp((lt - 4.2) / 0.9, 0, 1));
  const shine = -40 + clamp((lt - 6.0) / 2.0, 0, 1) * 180;
  return (
    <div style={{ position: 'absolute', inset: 0, background: '#02030a' }}>
      <ClipSprite id="mystery" dim={0.12} />
      {/* drifting fog layers */}
      <div style={{
        position: 'absolute', inset: 0, zIndex: 21, pointerEvents: 'none', opacity: 0.5,
        background: `radial-gradient(ellipse at ${20 + Math.sin(lt * 0.3) * 14}% 75%, rgba(231,0,19,0.18) 0%, transparent 45%),` +
                    `radial-gradient(ellipse at ${78 - Math.sin(lt * 0.22) * 12}% 30%, rgba(212,160,46,0.16) 0%, transparent 50%)`,
      }} />
      <AmbientParticles start={S} dur={14} count={46} color="252,228,150" maxR={3.5} zIndex={22} />
      <div style={{ position: 'absolute', top: 118, left: 0, right: 0, textAlign: 'center', zIndex: 25, opacity: inP }}>
        <Kicker size={26} color="#e8c97a">The Mystery Supporter · Legend No. 038</Kicker>
      </div>
      {/* Premium COLLECTIBLE CARD */}
      {cardP > 0 && (
        <div style={{
          position: 'absolute', left: '50%', top: '52%', zIndex: 25,
          opacity: clamp(cardP, 0, 1),
          transform: `translate(-50%,-50%) translateY(${(1 - cardP) * 50}px) scale(${0.9 + 0.1 * cardP})`,
        }}>
          <div style={{
            position: 'relative', width: 760, borderRadius: 26, overflow: 'hidden',
            padding: '5px',
            background: 'linear-gradient(150deg, #f4d784 0%, #b9842c 30%, #f8e9a8 55%, #9c6a1d 80%, #f4d784 100%)',
            boxShadow: '0 30px 120px rgba(0,0,0,0.75)',
          }}>
            <div style={{
              borderRadius: 22, background: 'linear-gradient(160deg, #0a1430 0%, #0c244e 55%, #08101f 100%)',
              padding: '34px 46px', position: 'relative', overflow: 'hidden',
            }}>
              {/* card number badge */}
              <div style={{
                position: 'absolute', top: 26, right: 30,
                width: 96, height: 96, borderRadius: '50%',
                background: 'radial-gradient(circle at 35% 30%, #fbe9a8, #c9942e 70%)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                boxShadow: '0 8px 30px rgba(0,0,0,0.5), inset 0 0 0 3px rgba(255,255,255,0.35)',
              }}>
                <span style={{ fontFamily: '"Inter",sans-serif', fontWeight: 900, fontSize: 40, color: '#3a2706' }}>038</span>
              </div>
              <div style={{ fontFamily: '"Inter",sans-serif', fontWeight: 800, fontSize: 22, color: '#e8c97a', letterSpacing: '0.28em' }}>LEGEND 038</div>
              <div style={{ fontFamily: '"Inter",sans-serif', fontWeight: 900, fontSize: 64, color: '#f6f9ff', letterSpacing: '0.01em', marginTop: 8, lineHeight: 1.05, maxWidth: 540 }}>THE EAGLE-KEEPER</div>
              <div style={{ fontFamily: '"Inter",sans-serif', fontWeight: 700, fontSize: 22, color: '#9fb6e0', letterSpacing: '0.16em', marginTop: 14, textTransform: 'uppercase' }}>The Old Desert Spirit · Tunisia</div>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: 12, marginTop: 24, background: 'rgba(255,210,74,0.14)', border: '1px solid rgba(255,210,74,0.55)', borderRadius: 999, padding: '12px 28px' }}>
                <span style={{ fontSize: 26 }}>✦</span>
                <span style={{ fontFamily: '"Inter",sans-serif', fontWeight: 800, fontSize: 24, color: MV.gold, letterSpacing: '0.08em' }}>COLLECT IT · worldcup26.world</span>
              </div>
              {/* holo shine sweep */}
              <div style={{
                position: 'absolute', inset: 0, pointerEvents: 'none',
                background: `linear-gradient(115deg, transparent ${shine - 14}%, rgba(255,255,255,0.28) ${shine}%, transparent ${shine + 14}%)`,
                mixBlendMode: 'overlay',
              }} />
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
    { name: 'TUNISIA', mult: '3× PER GOAL', flag: <FlagTUN w={86} /> },
    { name: 'JAPAN', mult: '2× PER GOAL', flag: <FlagJPN w={86} /> },
    { name: 'BRAZIL', mult: '1× PER GOAL', flag: <div style={{ width: 86, height: 57, borderRadius: 6, background: 'linear-gradient(135deg,#159b46 55%,#ffd24a 55%)' }} /> },
  ];
  return (
    <div style={{ position: 'absolute', inset: 0, background: `linear-gradient(160deg, #0d2a20 0%, #07090f 70%)` }}>
      <div style={{ position: 'absolute', inset: 0, background: `radial-gradient(ellipse at 50% 20%, rgba(16,107,79,0.35) 0%, transparent 60%)` }} />
      <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 46, opacity: inP }}>
        <Kicker color="#7fd6b5" size={30}>The Prediction Game</Kicker>
        <BigTitle size={104} color="#fff" glow={MV.green}>worldcup26.world</BigTitle>
        <Kicker color="#cfe9de" size={30}>Pick 3 Teams</Kicker>
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
                <div style={{ fontFamily: '"Inter",sans-serif', fontWeight: 800, fontSize: 26, color: MV.gold }}>{c.mult}</div>
              </div>
            );
          })}
        </div>
        <div style={{ fontFamily: '"Inter",sans-serif', fontWeight: 800, fontSize: 34, color: MV.gold, letterSpacing: '0.06em', marginTop: 8 }}>
          free · just for fun · no prizes
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
        <Kicker size={30}>WorldCup26 Legends</Kicker>
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
        <span style={{ fontFamily: '"Inter",sans-serif', fontWeight: 900, fontSize: 30, color: MV.gold }}>⚡ EP39 · COLLECT LEGEND 038 · worldcup26.world</span>
      </div>
    </div>
  );
}
