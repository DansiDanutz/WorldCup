// match-scenes.jsx — the ten scenes of the Match 2 video (300s timeline).
// Scene windows must match the SCENES table in match.html and narration.json.

// ── 1. Cold open (0–16): heartbeat in the dark, flash glimpses, hook line ────
function SceneColdOpen() {
  const { localTime: lt } = useSprite();
  // Heartbeat vignette pulse
  const beat = Math.pow(Math.max(0, Math.sin(lt * Math.PI * 1.15)), 8);
  // Flash glimpses of what's coming (subliminal cuts, growing longer)
  const glimpses = [
    { at: 4.2, dur: 0.34, src: 'assets/player-son.png' },
    { at: 7.0, dur: 0.42, src: 'assets/stadium-akron.png' },
    { at: 9.6, dur: 0.5, src: 'assets/fan-cze-crying.png' },
    { at: 11.8, dur: 0.62, src: 'assets/fan-kor-euphoric.png' },
  ];
  const titleP = Easing.easeOutCubic(clamp((lt - 12.6) / 1.4, 0, 1));
  return (
    <div style={{ position: 'absolute', inset: 0, background: '#000' }}>
      {glimpses.map((g, i) => (lt >= g.at && lt < g.at + g.dur) && (
        <img key={i} src={g.src} alt="" style={{
          position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover',
          filter: 'brightness(0.75) contrast(1.15) saturate(1.2)',
          transform: `scale(${1.06 + 0.05 * ((lt - g.at) / g.dur)})`,
        }} />
      ))}
      {/* heartbeat glow */}
      <div style={{
        position: 'absolute', inset: 0,
        background: `radial-gradient(ellipse at center, rgba(212,49,63,${(0.34 * beat).toFixed(3)}) 0%, transparent 60%)`,
      }} />
      <Vignette strength={0.8} />
      {lt > 12.6 && (
        <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 34, opacity: titleP, zIndex: 22 }}>
          <Kicker size={34}>Every legend gets</Kicker>
          <BigTitle size={150} color={MV.gold} glow={MV.gold}>ONE LAST DANCE</BigTitle>
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
      <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 44 }}>
        <div style={{ opacity: p1, transform: `translateY(${(1 - p1) * -30}px)` }}>
          <Kicker>FIFA World Cup 2026 · Match 2 of 104</Kicker>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 70, opacity: clamp(p2, 0, 1), transform: `scale(${p2})` }}>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 20 }}>
            <FlagKOR w={230} />
            <BigTitle size={66} glow={MV.kor}>SOUTH KOREA</BigTitle>
          </div>
          <BigTitle size={120} color={MV.gold}>VS</BigTitle>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 20 }}>
            <FlagCZE w={230} />
            <BigTitle size={66} glow={MV.czeBlue}>CZECH REPUBLIC</BigTitle>
          </div>
        </div>
        <div style={{ opacity: p3, transform: `translateY(${(1 - p3) * 26}px)`, fontFamily: '"Inter",sans-serif', fontWeight: 600, fontSize: 32, color: MV.muted, letterSpacing: '0.08em' }}>
          GROUP A · ESTADIO AKRON, GUADALAJARA · JUNE 12, 2026
        </div>
      </div>
      <Letterbox />
    </div>
  );
}

// ── 3. Stadium (28–46): flyover clip + atmosphere ────────────────────────────
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
          {[['48,000', 'FANS'], ['9th', 'STRAIGHT WC FOR KOREA'], ["41'", 'THE MINUTE TO REMEMBER'], ['1', 'LAST DANCE']].map(([v, l], i) => (
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

// ── 4. South Korea team intro (46–106) ───────────────────────────────────────
function SceneKorea() {
  const { localTime: lt } = useSprite();
  const S = 46; // global scene start
  const headerP = Easing.easeOutCubic(clamp(lt / 0.9, 0, 1));
  return (
    <div style={{ position: 'absolute', inset: 0, background: '#0a0c14' }}>
      {/* player clips placed on the global timeline via clips.json */}
      <ClipSprite id="son" dim={0.12} />
      <ClipSprite id="kim" dim={0.12} />
      <ClipSprite id="lee" dim={0.12} />
      {/* red team wash + header band */}
      <div style={{ position: 'absolute', inset: 0, zIndex: 22, pointerEvents: 'none', background: `linear-gradient(90deg, rgba(212,49,63,0.20) 0%, transparent 30%, transparent 70%, rgba(31,79,163,0.16) 100%)` }} />
      <div style={{ position: 'absolute', top: 108, left: 0, right: 0, display: 'flex', justifyContent: 'center', zIndex: 25, opacity: headerP, transform: `translateY(${(1 - headerP) * -24}px)` }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 26, background: MV.panel, border: `1px solid ${MV.line}`, borderRadius: 999, padding: '16px 44px' }}>
          <FlagKOR w={74} />
          <span style={{ fontFamily: '"Inter",sans-serif', fontWeight: 900, fontSize: 40, color: MV.text, letterSpacing: '0.10em' }}>THE TAEGEUK WARRIORS</span>
        </div>
      </div>
      <Sprite start={48.0} end={67.5}>
        <LowerThird start={S + 2.0} name="SON HEUNG-MIN" role="Captain · Forward" line="His 4th World Cup. His last. The Last Waltz of Sonaldo begins." accent={MV.kor} />
      </Sprite>
      <Sprite start={67.5} end={87.5}>
        <LowerThird start={S + 21.5} name="KIM MIN-JAE" role="The Monster · Centre-back" line="Conquered Serie A with Napoli. Strikers see him in their nightmares." accent={MV.kor} />
      </Sprite>
      <Sprite start={87.5} end={106}>
        <LowerThird start={S + 41.5} name="LEE KANG-IN" role="The Magician · Midfield" line="Turns grass into a chessboard, defenders into spectators." accent={MV.kor} />
      </Sprite>
      <Vignette strength={0.4} />
      <Letterbox />
    </div>
  );
}

// ── 5. Czech team intro (106–158) ────────────────────────────────────────────
function SceneCzech() {
  const { localTime: lt } = useSprite();
  const S = 106;
  const headerP = Easing.easeOutCubic(clamp(lt / 0.9, 0, 1));
  return (
    <div style={{ position: 'absolute', inset: 0, background: '#0a0c14' }}>
      <ClipSprite id="schick" dim={0.12} />
      <ClipSprite id="soucek" dim={0.12} />
      <ClipSprite id="hlozek" dim={0.12} />
      <ClipSprite id="cze-hopeful" dim={0.06} />
      <div style={{ position: 'absolute', inset: 0, zIndex: 22, pointerEvents: 'none', background: `linear-gradient(90deg, rgba(17,69,126,0.22) 0%, transparent 30%, transparent 70%, rgba(221,44,62,0.16) 100%)` }} />
      <div style={{ position: 'absolute', top: 108, left: 0, right: 0, display: 'flex', justifyContent: 'center', zIndex: 25, opacity: headerP, transform: `translateY(${(1 - headerP) * -24}px)` }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 26, background: MV.panel, border: `1px solid ${MV.line}`, borderRadius: 999, padding: '16px 44px' }}>
          <FlagCZE w={74} />
          <span style={{ fontFamily: '"Inter",sans-serif', fontWeight: 900, fontSize: 40, color: MV.text, letterSpacing: '0.10em' }}>THE HEART OF EUROPE</span>
        </div>
      </div>
      <Sprite start={108.0} end={127.5}>
        <LowerThird start={S + 2.0} name="PATRIK SCHICK" role="The Marksman · Striker" line="Scored from the halfway line at a Euro. Lives in the margins." accent={MV.cze} />
      </Sprite>
      <Sprite start={127.5} end={137.5}>
        <LowerThird start={S + 21.5} name="TOMAS SOUCEK" role="The Tower of Prague · Midfield" line="Two metres of iron. Attacks every cross like it owes him money." accent={MV.cze} />
      </Sprite>
      <Sprite start={137.5} end={147}>
        <LowerThird start={S + 31.5} name="ADAM HLOZEK" role="The Young Wolf · Forward" line="Fast, fearless, hungry to drag Czech football back into the light." accent={MV.cze} />
      </Sprite>
      <Vignette strength={0.4} />
      <Letterbox />
    </div>
  );
}

// ── 6. The duel (158–186): Kim vs Schick split screen ────────────────────────
function SceneDuel() {
  const { localTime: lt } = useSprite();
  const slideP = Easing.easeOutQuart(clamp(lt / 1.1, 0, 1));
  const vsP = Easing.easeOutBack(clamp((lt - 0.9) / 0.8, 0, 1));
  const shake = lt > 0.9 && lt < 1.25 ? Math.sin(lt * 160) * 7 * (1.25 - lt) / 0.35 : 0;
  return (
    <div style={{ position: 'absolute', inset: 0, background: '#05060a', transform: `translate(${shake}px, ${-shake}px)` }}>
      {/* split halves */}
      <div style={{ position: 'absolute', top: 0, bottom: 0, left: 0, width: '50%', overflow: 'hidden', transform: `translateX(${(1 - slideP) * -100}%)` }}>
        <img src="assets/player-kim.png" alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', filter: 'saturate(1.15) brightness(0.92)' }} />
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(90deg, rgba(212,49,63,0.30), transparent 65%)' }} />
        <div style={{ position: 'absolute', bottom: 150, left: 90, fontFamily: '"Inter",sans-serif', fontWeight: 900, fontSize: 62, color: '#fff', textShadow: '0 4px 26px rgba(0,0,0,0.9)' }}>
          THE MONSTER
          <div style={{ fontSize: 27, fontWeight: 700, color: MV.gold, letterSpacing: '0.2em', marginTop: 8 }}>KIM MIN-JAE</div>
        </div>
      </div>
      <div style={{ position: 'absolute', top: 0, bottom: 0, right: 0, width: '50%', overflow: 'hidden', transform: `translateX(${(1 - slideP) * 100}%)` }}>
        <img src="assets/player-schick.png" alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', filter: 'saturate(1.15) brightness(0.92)' }} />
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(270deg, rgba(17,69,126,0.34), transparent 65%)' }} />
        <div style={{ position: 'absolute', bottom: 150, right: 90, textAlign: 'right', fontFamily: '"Inter",sans-serif', fontWeight: 900, fontSize: 62, color: '#fff', textShadow: '0 4px 26px rgba(0,0,0,0.9)' }}>
          THE MARKSMAN
          <div style={{ fontSize: 27, fontWeight: 700, color: MV.gold, letterSpacing: '0.2em', marginTop: 8 }}>PATRIK SCHICK</div>
        </div>
      </div>
      {/* center seam + VS badge */}
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
      <Sprite start={178.5} end={186}>
        <div style={{ position: 'absolute', left: 0, right: 0, bottom: 0, top: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 27, background: 'rgba(0,0,0,0.55)' }}>
          <BigTitle size={74} color={MV.text} style={{ maxWidth: 1400 }}>
            “Our storytellers have looked into the night of June 12th…”
          </BigTitle>
        </div>
      </Sprite>
      <Letterbox />
    </div>
  );
}

// ── 7. Match drama (186–242): the 41' goal, joy, despair ─────────────────────
function SceneDrama() {
  const { localTime: lt } = useSprite();
  const S = 186;
  return (
    <div style={{ position: 'absolute', inset: 0, background: '#000' }}>
      <ClipSprite id="goal-replay" dim={0.06} />
      <ClipSprite id="kor-euphoric" />
      <ClipSprite id="schick-chance" dim={0.1} />
      <ClipSprite id="kor-anxious" dim={0.05} />
      <ClipSprite id="cze-crying" dim={0.05} />

      {/* slow-mo tension bar before the strike */}
      <Sprite start={186} end={195.5}>
        <ScoreBug start={S + 0.4} kor={0} cze={0} minute="41'" />
      </Sprite>
      <GoalFlash at={S + 9.6} />
      <Confetti start={S + 9.8} dur={14} />
      <Sprite start={195.6} end={212.5}>
        <ScoreBug start={S + 9.6} kor={1} cze={0} minute="41'" />
      </Sprite>
      <Sprite start={212.5} end={231}>
        <ScoreBug start={S + 26.5} kor={1} cze={0} minute="73'" />
      </Sprite>

      {/* full-time card */}
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
  return (
    <div style={{ position: 'absolute', inset: 0, zIndex: 26, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(2,3,6,0.62)', opacity: p }}>
      <div style={{ background: MV.panel, border: `1px solid ${MV.line}`, borderRadius: 26, padding: '60px 110px', textAlign: 'center', transform: `scale(${0.92 + 0.08 * p})`, boxShadow: '0 30px 120px rgba(0,0,0,0.7)' }}>
        <Kicker size={26}>Full Time · Estadio Akron</Kicker>
        <div style={{ display: 'flex', alignItems: 'center', gap: 56, marginTop: 40 }}>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16 }}>
            <FlagKOR w={150} />
            <span style={{ fontFamily: '"Inter",sans-serif', fontWeight: 800, fontSize: 34, color: MV.text }}>SOUTH KOREA</span>
          </div>
          <BigTitle size={170} color={MV.gold}>1 — 0</BigTitle>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16 }}>
            <FlagCZE w={150} />
            <span style={{ fontFamily: '"Inter",sans-serif', fontWeight: 800, fontSize: 34, color: MV.text }}>CZECH REPUBLIC</span>
          </div>
        </div>
        <div style={{ fontFamily: '"Inter",sans-serif', fontWeight: 600, fontSize: 30, color: MV.muted, marginTop: 36 }}>
          Son Heung-min 41' — the farewell begins with victory
        </div>
      </div>
    </div>
  );
}

// ── 8. Verdict (242–262): standings + what it means ─────────────────────────
function SceneVerdict() {
  const { localTime: lt } = useSprite();
  const S = 242;
  return (
    <div style={{ position: 'absolute', inset: 0, background: '#0a0f1c' }}>
      <KenBurns src="assets/stadium-akron.png" start={S} dur={20} from={1.05} to={1.18} dim={0.55} />
      <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 25 }}>
        <div style={{ background: MV.panel, border: `1px solid ${MV.line}`, borderRadius: 24, padding: '52px 84px', minWidth: 900, backdropFilter: 'blur(6px)' }}>
          <Kicker size={26}>Group A · After Matchday 1</Kicker>
          <div style={{ marginTop: 26 }}>
            <StatLine start={S + 0.8} delay={0.0} label="1 · South Korea" value="3 pts · +1" accent={MV.gold} />
            <StatLine start={S + 0.8} delay={0.25} label="2 · Mexico" value="1 pt · goalless thriller" accent={MV.text} />
            <StatLine start={S + 0.8} delay={0.5} label="3 · South Africa" value="1 pt · ghosts not yet gone" accent={MV.text} />
            <StatLine start={S + 0.8} delay={0.75} label="4 · Czech Republic" value="0 pts · two games left" accent={MV.muted} />
          </div>
          <div style={{ fontFamily: '"Inter",sans-serif', fontWeight: 700, fontSize: 30, color: MV.gold, marginTop: 38, textAlign: 'center' }}>
            Nothing is decided. Everything is possible.
          </div>
        </div>
      </div>
      <Vignette strength={0.5} />
      <Letterbox />
    </div>
  );
}

// ── 9. App promo (262–286): worldcup26.world ─────────────────────────────────
function SceneApp() {
  const { localTime: lt } = useSprite();
  const S = 262;
  const inP = Easing.easeOutCubic(clamp(lt / 1.0, 0, 1));
  const cards = [
    { name: 'SOUTH KOREA', coef: 'x2.40', pts: '+2.40', flag: <FlagKOR w={86} /> },
    { name: 'BRAZIL', coef: 'x1.20', pts: '+0.00', flag: <div style={{ width: 86, height: 57, borderRadius: 6, background: 'linear-gradient(135deg,#159b46 55%,#ffd24a 55%)' }} /> },
    { name: 'JAPAN', coef: 'x1.80', pts: '+0.00', flag: <div style={{ width: 86, height: 57, borderRadius: 6, background: '#fff', position: 'relative' }}><div style={{ position: 'absolute', left: '50%', top: '50%', width: 30, height: 30, borderRadius: '50%', background: '#bc002d', transform: 'translate(-50%,-50%)' }} /></div> },
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
          FREE TO PLAY · LIVE LEADERBOARD · 48 NATIONS
        </div>
      </div>
      <Letterbox />
    </div>
  );
}

// ── 10. CTA outro (286–300) ──────────────────────────────────────────────────
function SceneCTA() {
  const { localTime: lt } = useSprite();
  const S = 286;
  const inP = Easing.easeOutCubic(clamp(lt / 0.8, 0, 1));
  return (
    <div style={{ position: 'absolute', inset: 0, background: '#07090f' }}>
      <KenBurns src="assets/fan-kor-euphoric.png" start={S} dur={14} from={1.0} to={1.15} dim={0.72} />
      <div style={{ position: 'absolute', inset: 0, zIndex: 23, background: 'radial-gradient(ellipse at 50% 35%, transparent 0%, rgba(7,9,15,0.88) 75%)' }} />
      <div style={{ position: 'absolute', top: 200, left: 0, right: 0, textAlign: 'center', zIndex: 25, opacity: inP }}>
        <Kicker size={30}>Enjoyed the story?</Kicker>
        <BigTitle size={92} style={{ marginTop: 24 }}>JOIN THE LEGENDS</BigTitle>
      </div>
      <div style={{ position: 'absolute', inset: 0, zIndex: 26 }}>
        <CtaButton start={S} delay={1.2} label="SUBSCRIBE" icon="🔔" accent="#d4313f" x={500} />
        <CtaButton start={S} delay={1.6} label="LIKE" icon="👍" accent="#1f4fa3" x={960} />
        <CtaButton start={S} delay={2.0} label="SHARE" icon="📣" accent="#106b4f" x={1400} />
      </div>
      <Sprite start={290.6} end={300}>
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
        <span style={{ fontFamily: '"Inter",sans-serif', fontWeight: 900, fontSize: 30, color: MV.gold }}>🍁 CANADA OPENS ITS WORLD CUP · worldcup26.world</span>
      </div>
    </div>
  );
}
