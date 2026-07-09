// match-scenes.jsx — the scenes of the Ep46 video (308s timeline).
// Jordan vs Algeria · "The Desert Wind" · Group J.
// SPINE: two desert nations, two near-identical journeys from anonymity to the
// world stage — Riyad Mahrez (Sarcelles to the Premier League) mirrors Musa
// Al-Taamari (Amman to Ligue 1). Brothers separated by sand — can there be a loser?
// MATCH NOT YET PLAYED — predicted 1–1 DRAW (Al-Taamari 34' gives Jordan their
// first-ever World Cup lead, Mahrez 61' levels, Mahrez 88' free kick hits the
// crossbar — the bar keeps the secret). The message is brotherhood: no loser.
// Every scoreline/goal is OUR PREDICTION, clearly labelled, never stated as a real result.
// Scene windows must match the SCENES table in match.html and narration.json.
// NOTE: nested <Sprite> windows are GLOBAL seconds (Sprite reads the timeline clock).

// Local team colours (kit must not be modified).
const JOR = '#ce1126';        // Jordan red
const JOR_LIGHT = '#e6394e';
const ALG = '#1a7a3c';        // Algeria green
const ALG_LIGHT = '#2bbd63';

// Jordan flag — black / white / green horizontal bands, red hoist triangle with a
// white seven-pointed star.
function FlagJordan({ w = 120 }) {
  const h = w * 2 / 3;
  return (
    <div style={{ width: w, height: h, borderRadius: w * 0.05, position: 'relative', overflow: 'hidden', display: 'flex', flexDirection: 'column', boxShadow: '0 6px 18px rgba(0,0,0,0.45)' }}>
      <div style={{ flex: 1, background: '#000' }} />
      <div style={{ flex: 1, background: '#fff' }} />
      <div style={{ flex: 1, background: '#007a3d' }} />
      {/* red hoist triangle */}
      <div style={{
        position: 'absolute', left: 0, top: 0, width: 0, height: 0,
        borderTop: `${h / 2}px solid transparent`, borderBottom: `${h / 2}px solid transparent`,
        borderLeft: `${w * 0.46}px solid #ce1126`,
      }} />
      {/* white seven-pointed star (glyph) */}
      <span style={{
        position: 'absolute', left: w * 0.13, top: '50%', transform: 'translateY(-50%)',
        color: '#fff', fontSize: h * 0.34, lineHeight: 1, fontFamily: '"Inter",sans-serif', fontWeight: 900,
      }}>✷</span>
    </div>
  );
}

// Algeria flag — vertical green / white halves, red crescent + red five-pointed star centred.
function FlagALG({ w = 120 }) {
  const h = w * 2 / 3;
  return (
    <div style={{ width: w, height: h, borderRadius: w * 0.05, position: 'relative', overflow: 'hidden', display: 'flex', boxShadow: '0 6px 18px rgba(0,0,0,0.45)' }}>
      <div style={{ flex: 1, background: '#006633' }} />
      <div style={{ flex: 1, background: '#fff' }} />
      {/* red crescent */}
      <div style={{
        position: 'absolute', left: '50%', top: '50%', transform: 'translate(-58%,-50%)',
        width: h * 0.5, height: h * 0.5, borderRadius: '50%',
        boxShadow: `${h * 0.14}px 0 0 0 #d21034`,
        background: 'transparent',
      }} />
      {/* red five-pointed star */}
      <span style={{
        position: 'absolute', left: '52%', top: '50%', transform: 'translate(-50%,-50%)',
        color: '#d21034', fontSize: h * 0.32, lineHeight: 1, fontFamily: '"Inter",sans-serif', fontWeight: 900,
      }}>★</span>
    </div>
  );
}

// Match scoreboard chip (top center) — JOR vs ALG. Local override of the
// kit's ScoreBug so the labels/props/colours track this episode (kit unchanged).
// Ep46 is UNPLAYED — the 1–1 is OUR PREDICTION, badge defaults to "OUR PREDICTION".
function ScoreBug({ start, jor = 0, alg = 0, minute, badge = "OUR PREDICTION" }) {
  const t = useTime();
  const local = t - start;
  if (local < 0) return null;
  const inP = Easing.easeOutBack(clamp(local / 0.7, 0, 1));
  const cell = { fontFamily: '"Inter",sans-serif', fontWeight: 900, fontSize: 34, color: '#fff', padding: '10px 18px' };
  return (
    <div style={{
      position: 'absolute', top: 118, left: '50%', zIndex: 26,
      transform: `translateX(-50%) scale(${inP})`, opacity: clamp(inP, 0, 1),
      display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8,
    }}>
      <div style={{
        display: 'flex', alignItems: 'center',
        background: MV.panel, border: `1px solid ${MV.line}`, borderRadius: 14,
        boxShadow: '0 10px 36px rgba(0,0,0,0.5)', overflow: 'hidden',
      }}>
        <div style={{ ...cell, background: JOR }}>JOR</div>
        <div style={{ ...cell, fontSize: 38, color: MV.gold }}>{jor} — {alg}</div>
        <div style={{ ...cell, background: ALG, color: '#fff' }}>ALG</div>
        {minute && <div style={{ ...cell, fontSize: 26, color: MV.muted, borderLeft: `1px solid ${MV.line}` }}>{minute}</div>}
      </div>
      <div style={{
        fontFamily: '"Inter",sans-serif', fontWeight: 800, fontSize: 16, color: MV.gold, letterSpacing: '0.22em',
        background: 'rgba(255,210,74,0.12)', border: '1px solid rgba(255,210,74,0.5)', borderRadius: 999, padding: '4px 16px',
      }}>{badge}</div>
    </div>
  );
}

// ── Persistent cinematic B-roll backdrop (0–308): continuous tiled footage so
// the frame is NEVER black behind a scene; scenes render their own clips on top.
function Backdrop() {
  const clips = (window.MV_CLIPS || []).filter((c) => c.id && c.id.indexOf('bd-') === 0);
  return (
    <div style={{ position: 'absolute', inset: 0, zIndex: 0 }}>
      {clips.map((c) => (
        <ClipSprite key={c.id} id={c.id} dim={0.34} style={{ filter: 'brightness(0.66) saturate(1.1) contrast(1.05)' }} />
      ))}
      <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse at 50% 42%, rgba(5,6,12,0.18) 25%, rgba(2,3,8,0.6) 100%)' }} />
    </div>
  );
}

// ── 1. Cold open (0–24): heartbeat in the dark, flash glimpses, hook line ────
function SceneColdOpen() {
  const { localTime: lt } = useSprite();
  const beat = Math.pow(Math.max(0, Math.sin(lt * Math.PI * 1.15)), 8);
  const titleP = Easing.easeOutCubic(clamp((lt - 18.6) / 1.4, 0, 1));
  return (
    <div style={{ position: 'absolute', inset: 0, background: 'rgba(2,3,7,0.46)' }}>
      {/* moving flash-glimpses of what's coming (video, not stills) */}
      <ClipSprite id="glimpse-stad" style={{ filter: 'brightness(0.78) contrast(1.15) saturate(1.2)' }} />
      <ClipSprite id="glimpse-wind" style={{ filter: 'brightness(0.74) contrast(1.12) saturate(1.05)' }} />
      <ClipSprite id="glimpse-taamari" style={{ filter: 'brightness(0.78) contrast(1.15) saturate(1.2)' }} />
      <ClipSprite id="glimpse-mahrez" style={{ filter: 'brightness(0.78) contrast(1.15) saturate(1.2)' }} />
      {/* ember base so the screen never reads as dead air */}
      <div style={{
        position: 'absolute', inset: 0,
        background: `radial-gradient(ellipse at 50% 78%, rgba(212,175,55,0.14) 0%, transparent 55%)`,
      }} />
      {/* heartbeat glow */}
      <div style={{
        position: 'absolute', inset: 0,
        background: `radial-gradient(ellipse at center, rgba(206,17,38,${(0.42 * beat).toFixed(3)}) 0%, transparent 62%)`,
      }} />
      <Vignette strength={0.8} />
      {lt > 18.6 && (
        <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 34, opacity: titleP, zIndex: 22 }}>
          <Kicker size={34}>Two Flags · One Sky</Kicker>
          <TitleReveal text="BROTHERS OF SAND" start={20.4} size={132} color={MV.gold} />
        </div>
      )}
      <Letterbox />
    </div>
  );
}

// ── 2. Title card (24–34) ────────────────────────────────────────────────────
function SceneTitle() {
  const { localTime: lt } = useSprite();
  const p1 = Easing.easeOutCubic(clamp(lt / 1.0, 0, 1));
  const p2 = Easing.easeOutBack(clamp((lt - 0.8) / 1.0, 0, 1));
  const p3 = Easing.easeOutCubic(clamp((lt - 1.7) / 0.9, 0, 1));
  return (
    <div style={{ position: 'absolute', inset: 0, background: `linear-gradient(180deg, #0a0f1c 0%, #11182b 55%, #0a0f1c 100%)` }}>
      <div style={{ position: 'absolute', inset: 0, background: `radial-gradient(ellipse at 50% 30%, rgba(255,210,74,0.10) 0%, transparent 55%)` }} />
      <AmbientParticles start={24.65} dur={10} count={34} />
      <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 44 }}>
        <div style={{ opacity: p1, transform: `translateY(${(1 - p1) * -30}px)` }}>
          <Kicker>WorldCup26 Legends · Episode 46</Kicker>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 70, opacity: clamp(p2, 0, 1), transform: `scale(${p2})` }}>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 20 }}>
            <Waving><FlagJordan w={230} /></Waving>
            <BigTitle size={66} glow={JOR_LIGHT}>JORDAN</BigTitle>
          </div>
          <BigTitle size={120} color={MV.gold}>VS</BigTitle>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 20 }}>
            <Waving speed={1.9}><FlagALG w={230} /></Waving>
            <BigTitle size={66} glow={ALG_LIGHT}>ALGERIA</BigTitle>
          </div>
        </div>
        <div style={{ opacity: p3, transform: `translateY(${(1 - p3) * 26}px)`, fontFamily: '"Inter",sans-serif', fontWeight: 600, fontSize: 32, color: MV.muted, letterSpacing: '0.08em' }}>
          GROUP J · TWO DESERTS · ONE WORLD CUP NIGHT
        </div>
      </div>
      <Letterbox />
    </div>
  );
}

// ── 3. Stadium (34–45): flyover clip + stakes ────────────────────────────────
function SceneStadium() {
  const { localTime: lt } = useSprite();
  const stripP = Easing.easeOutCubic(clamp((lt - 1.2) / 0.9, 0, 1));
  return (
    <div style={{ position: 'absolute', inset: 0, background: 'rgba(2,3,7,0.46)' }}>
      <ClipSprite id="stadium-ext" dim={0.08} />
      <ClipSprite id="stadium-aerial" dim={0.08} />
      <Vignette strength={0.45} />
      <div style={{
        position: 'absolute', left: 0, right: 0, bottom: 130, display: 'flex', justifyContent: 'center', zIndex: 25,
        opacity: stripP, transform: `translateY(${(1 - stripP) * 30}px)`,
      }}>
        <div style={{ display: 'flex', gap: 0, background: MV.panel, border: `1px solid ${MV.line}`, borderRadius: 16, overflow: 'hidden', backdropFilter: 'blur(6px)' }}>
          {[['GROUP J', 'THE STAGE'], ['THE BRAVE', 'vs THE FOXES'], ['MIRROR', 'JOURNEYS'], ['ONE SKY', 'NO LOSER']].map(([v, l], i) => (
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
            <div style={{ height: 280, overflow: 'hidden', position: 'relative' }}>
              <img src={p.img} alt="" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', transform: `scale(${1.02 + 0.05 * clamp((t - start) / (end - start), 0, 1)})` }} />
              {p.vid && <div style={{ position: 'absolute', inset: 0, zIndex: 1 }}><ClipSprite id={p.vid} style={{ objectFit: 'cover' }} /></div>}
              <div style={{ position: 'absolute', inset: 0, zIndex: 2, pointerEvents: 'none', boxShadow: `inset 0 -60px 60px -30px rgba(0,0,0,0.55)` }} />
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

// ── 4. Jordan (45–75): Al-Nashama, the Brave Ones ────────────────────────────
function SceneJordan() {
  const { localTime: lt } = useSprite();
  const S = 45;
  const headerP = Easing.easeOutCubic(clamp(lt / 0.9, 0, 1));
  return (
    <div style={{ position: 'absolute', inset: 0, background: 'rgba(10,12,20,0.46)' }}>
      <ClipSprite id="hist-jor" dim={0.5} style={{ filter: 'brightness(0.34) saturate(0.8) contrast(1.1)' }} />
      <ClipSprite id="jor-bg" dim={0.55} />
      <ClipSprite id="taamari" dim={0.12} />
      <ClipSprite id="naimat" dim={0.12} />
      <ClipSprite id="rawabdeh" dim={0.12} />
      <ClipSprite id="arab" dim={0.12} />
      <ClipSprite id="dardour" dim={0.12} />
      <div style={{ position: 'absolute', inset: 0, zIndex: 22, pointerEvents: 'none', background: `linear-gradient(90deg, rgba(206,17,38,0.28) 0%, transparent 30%, transparent 70%, rgba(255,210,74,0.14) 100%)` }} />
      <div style={{ position: 'absolute', top: 108, left: 0, right: 0, display: 'flex', justifyContent: 'center', zIndex: 26, opacity: headerP, transform: `translateY(${(1 - headerP) * -24}px)` }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 26, background: MV.panel, border: `1px solid ${MV.line}`, borderRadius: 999, padding: '16px 44px' }}>
          <FlagJordan w={74} />
          <span style={{ fontFamily: '"Inter",sans-serif', fontWeight: 900, fontSize: 36, color: MV.text, letterSpacing: '0.10em' }}>JORDAN · THE BRAVE</span>
        </div>
      </div>
      <SquadGrid start={S + 19.5} end={S + 29.5} accent={JOR} players={[
        { img: 'assets/squad/jor-taamari.png', vid: 'sq-jor-taamari', name: 'AL-TAAMARI', role: 'THE DREAMER' },
        { img: 'assets/squad/jor-naimat.png', vid: 'sq-jor-naimat', name: 'AL-NAIMAT', role: 'THE SPEAR' },
        { img: 'assets/squad/jor-rawabdeh.png', vid: 'sq-jor-rawabdeh', name: 'AL-RAWABDEH', role: 'THE ENGINE' },
        { img: 'assets/squad/jor-arab.png', vid: 'sq-jor-arab', name: 'AL-ARAB', role: 'THE CALM' },
        { img: 'assets/squad/jor-dardour.png', vid: 'sq-jor-dardour', name: 'AL-DARDOUR', role: 'THE VETERAN' },
      ]} />
      <Sprite start={55.50} end={64.50}>
        <LowerThird start={55.80} name="MUSA AL-TAAMARI" role="The Dreamer · Winger" accent={JOR_LIGHT} />
      </Sprite>
      <Sprite start={64.50} end={72.00}>
        <LowerThird start={64.80} name="YAZAN AL-NAIMAT" role="The Spear · Forward" accent={JOR_LIGHT} />
      </Sprite>
      <Sprite start={72.00} end={75.00}>
        <LowerThird start={72.20} name="NOOR AL-RAWABDEH" role="The Engine · Midfield" accent={JOR_LIGHT} />
      </Sprite>
      <Vignette strength={0.4} />
      <Letterbox />
    </div>
  );
}

// ── 5. Algeria (75–109): the Desert Foxes ────────────────────────────────────
function SceneAlgeria() {
  const { localTime: lt } = useSprite();
  const S = 75;
  const headerP = Easing.easeOutCubic(clamp(lt / 0.9, 0, 1));
  return (
    <div style={{ position: 'absolute', inset: 0, background: 'rgba(10,12,20,0.46)' }}>
      <ClipSprite id="hist-alg" dim={0.5} style={{ filter: 'brightness(0.34) saturate(0.8) contrast(1.1)' }} />
      <ClipSprite id="alg-bg" dim={0.55} />
      <ClipSprite id="mahrez" dim={0.12} />
      <ClipSprite id="gouiri" dim={0.12} />
      <ClipSprite id="bennacer" dim={0.12} />
      <ClipSprite id="boudaoui" dim={0.12} />
      <ClipSprite id="mandi" dim={0.12} />
      <div style={{ position: 'absolute', inset: 0, zIndex: 22, pointerEvents: 'none', background: `linear-gradient(90deg, rgba(26,122,60,0.28) 0%, transparent 30%, transparent 70%, rgba(210,16,52,0.14) 100%)` }} />
      <div style={{ position: 'absolute', top: 108, left: 0, right: 0, display: 'flex', justifyContent: 'center', zIndex: 26, opacity: headerP, transform: `translateY(${(1 - headerP) * -24}px)` }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 26, background: MV.panel, border: `1px solid ${MV.line}`, borderRadius: 999, padding: '16px 44px' }}>
          <FlagALG w={74} />
          <span style={{ fontFamily: '"Inter",sans-serif', fontWeight: 900, fontSize: 36, color: MV.text, letterSpacing: '0.10em' }}>THE DESERT FOXES</span>
        </div>
      </div>
      <SquadGrid start={S + 11.5} end={S + 22} accent={ALG} players={[
        { img: 'assets/squad/alg-mahrez.png', vid: 'sq-alg-mahrez', name: 'MAHREZ', role: 'THE GRANDMASTER' },
        { img: 'assets/squad/alg-gouiri.png', vid: 'sq-alg-gouiri', name: 'GOUIRI', role: 'THE FINISHER' },
        { img: 'assets/squad/alg-bennacer.png', vid: 'sq-alg-bennacer', name: 'BENNACER', role: 'THE ARCHITECT' },
        { img: 'assets/squad/alg-boudaoui.png', vid: 'sq-alg-boudaoui', name: 'BOUDAOUI', role: 'THE CRAFT' },
        { img: 'assets/squad/alg-mandi.png', vid: 'sq-alg-mandi', name: 'MANDI', role: 'THE STEEL' },
      ]} />
      <Sprite start={86.00} end={97.50}>
        <LowerThird start={86.30} name="RIYAD MAHREZ" role="The Grandmaster · Winger" accent={ALG_LIGHT} />
      </Sprite>
      <Sprite start={97.50} end={104.00}>
        <LowerThird start={97.80} name="ISMAËL BENNACER" role="The Architect · Midfield" accent={ALG_LIGHT} />
      </Sprite>
      <Sprite start={104.00} end={109.00}>
        <LowerThird start={104.30} name="AMINE GOUIRI" role="The Finisher · Forward" accent={ALG_LIGHT} />
      </Sprite>
      <Vignette strength={0.4} />
      <Letterbox />
    </div>
  );
}

// ── 6. The duel (109–136): Mahrez vs Al-Taamari split screen ──────────────────
function SceneDuel() {
  const { localTime: lt } = useSprite();
  const slideP = Easing.easeOutQuart(clamp(lt / 1.1, 0, 1));
  const vsP = Easing.easeOutBack(clamp((lt - 0.9) / 0.8, 0, 1));
  const shake = lt > 0.9 && lt < 1.25 ? Math.sin(lt * 160) * 7 * (1.25 - lt) / 0.35 : 0;
  return (
    <div style={{ position: 'absolute', inset: 0, background: 'rgba(5,6,10,0.46)', transform: `translate(${shake}px, ${-shake}px)` }}>
      <div style={{ position: 'absolute', top: 0, bottom: 0, left: 0, width: '50%', overflow: 'hidden', transform: `translateX(${(1 - slideP) * -100}%)` }}>
        <img src="assets/squad/alg-mahrez.png" alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', filter: 'saturate(1.15) brightness(0.92)' }} />
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(90deg, rgba(26,122,60,0.40), transparent 65%)' }} />
        <div style={{ position: 'absolute', bottom: 150, left: 90, fontFamily: '"Inter",sans-serif', fontWeight: 900, fontSize: 62, color: '#fff', textShadow: '0 4px 26px rgba(0,0,0,0.9)' }}>
          THE GRANDMASTER
          <div style={{ fontSize: 27, fontWeight: 700, color: MV.gold, letterSpacing: '0.2em', marginTop: 8 }}>RIYAD MAHREZ</div>
        </div>
      </div>
      <div style={{ position: 'absolute', top: 0, bottom: 0, right: 0, width: '50%', overflow: 'hidden', transform: `translateX(${(1 - slideP) * 100}%)` }}>
        <img src="assets/squad/jor-taamari.png" alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', filter: 'saturate(1.15) brightness(0.92)' }} />
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(270deg, rgba(206,17,38,0.42), transparent 65%)' }} />
        <div style={{ position: 'absolute', bottom: 150, right: 90, textAlign: 'right', fontFamily: '"Inter",sans-serif', fontWeight: 900, fontSize: 62, color: '#fff', textShadow: '0 4px 26px rgba(0,0,0,0.9)' }}>
          THE DREAMER
          <div style={{ fontSize: 27, fontWeight: 700, color: MV.gold, letterSpacing: '0.2em', marginTop: 8 }}>MUSA AL-TAAMARI</div>
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
      <Sprite start={128.00} end={136.00}>
        <div style={{ position: 'absolute', left: 0, right: 0, bottom: 0, top: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 27, background: 'rgba(0,0,0,0.55)' }}>
          <Kicker size={40}>Brothers Of Sand</Kicker>
        </div>
      </Sprite>
      <Letterbox />
    </div>
  );
}

// ── 7. Match drama (136–216): Al-Taamari 1–0, Mahrez 1–1, Mahrez 88' the bar — OUR PREDICTION
//      This is NOT a real result. The ScoreBug + final card carry the
//      "OUR PREDICTION" badge, never "FULL TIME" or anything stated as fact.
function SceneDrama() {
  const { localTime: lt } = useSprite();
  const S = 136;
  return (
    <div style={{ position: 'absolute', inset: 0, background: 'rgba(2,3,7,0.46)' }}>
      <ClipSprite id="drama-jor1" dim={0.06} />
      <ClipSprite id="drama-taamari" dim={0.1} />
      <ClipSprite id="drama-arab" dim={0.1} />
      <ClipSprite id="drama-mahrez" dim={0.1} />
      <ClipSprite id="drama-cel" dim={0.05} />
      <ClipSprite id="drama-alg-cel" dim={0.05} />
      <ClipSprite id="drama-stad" dim={0.08} />

      {/* 34th minute — predicted: Jordan's first-ever World Cup lead, Al-Taamari curls it home */}
      <GoalFlash at={S + 18.5} />
      <Sprite start={154.50} end={185.00}>
        <ScoreBug start={S + 18.6} jor={1} alg={0} minute="34'" badge="OUR PREDICTION" />
      </Sprite>

      {/* Algeria reply — Mahrez levels, the master finds the angle */}
      <GoalFlash at={S + 49.5} />
      <Sprite start={185.00} end={207.50}>
        <ScoreBug start={S + 49.6} jor={1} alg={1} minute="61'" badge="OUR PREDICTION" />
      </Sprite>

      {/* 88' — Mahrez free kick, thirty yards out, rises, dips... and the crossbar.
          NO goal, the score stays 1–1. The bar keeps the secret. */}
      <Sprite start={207.50} end={216.00}>
        <BarBeat start={S + 71.0} />
      </Sprite>
      <Vignette strength={0.42} />
      <Letterbox />
    </div>
  );
}

// The 88' free-kick beat — it hits the bar, NO goal. Reveals the predicted 1–1 final,
// stamped OUR PREDICTION (the match isn't played).
function BarBeat({ start }) {
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
        <Kicker size={26}>88' · Off The Crossbar</Kicker>
        <div style={{ fontFamily: '"Inter",sans-serif', fontWeight: 900, fontSize: 72, color: MV.text, letterSpacing: '0.02em', margin: '24px 0 10px' }}>THE BAR KEPT THE SECRET</div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 56, marginTop: 26 }}>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16 }}>
            <FlagJordan w={130} />
            <span style={{ fontFamily: '"Inter",sans-serif', fontWeight: 800, fontSize: 32, color: MV.text }}>JORDAN</span>
          </div>
          <BigTitle size={150} color={MV.gold}>1 — 1</BigTitle>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16 }}>
            <FlagALG w={130} />
            <span style={{ fontFamily: '"Inter",sans-serif', fontWeight: 800, fontSize: 32, color: MV.text }}>ALGERIA</span>
          </div>
        </div>
        <div style={{ fontFamily: '"Inter",sans-serif', fontWeight: 800, fontSize: 24, color: MV.muted, letterSpacing: '0.18em', marginTop: 24 }}>TWO BROTHERS · NO LOSER</div>
      </div>
    </div>
  );
}

// ── 8. Disclaimer + group recap (216–248): our prediction & what it means ────
function SceneVerdict() {
  const { localTime: lt } = useSprite();
  const S = 216;
  const discP = Easing.easeOutCubic(clamp(lt / 1.0, 0, 1));
  const discFade = lt > 20 ? clamp((22 - lt) / 1.0, 0, 1) : 1;
  return (
    <div style={{ position: 'absolute', inset: 0, background: 'rgba(10,15,28,0.46)' }}>
      <ClipSprite id="verdict-bg" dim={0.6} />
      {/* disclaimer beat — our prediction, real one yours to watch */}
      <Sprite start={216.00} end={238.00}>
        <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 26, opacity: discP * discFade }}>
          <div style={{ background: MV.panel, border: `1px solid ${MV.line}`, borderRadius: 22, padding: '44px 80px', textAlign: 'center', backdropFilter: 'blur(6px)' }}>
            <Kicker size={26} color={MV.gold}>Our Prediction</Kicker>
            <div style={{ fontFamily: '"Inter",sans-serif', fontWeight: 900, fontSize: 54, color: MV.text, letterSpacing: '0.04em', marginTop: 20 }}>THE REAL MATCH IS YOURS</div>
          </div>
        </div>
      </Sprite>
      {/* group recap */}
      <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 25 }}>
        <div style={{ background: MV.panel, border: `1px solid ${MV.line}`, borderRadius: 24, padding: '52px 84px', minWidth: 900, backdropFilter: 'blur(6px)', opacity: clamp((lt - 22.5) / 1.0, 0, 1) }}>
          <Kicker size={26}>Group J · Our Prediction</Kicker>
          <div style={{ marginTop: 26 }}>
            <StatLine start={S + 23} delay={0.0} label="JORDAN" value="UNFORGOTTEN" accent={JOR_LIGHT} />
            <StatLine start={S + 23} delay={0.25} label="ALGERIA" value="UNFORGOTTEN" accent={ALG_LIGHT} />
            <StatLine start={S + 23} delay={0.5} label="OUR PREDICTION" value="JOR 1 — 1 ALG" accent={MV.text} />
            <StatLine start={S + 23} delay={0.75} label="88' THE BAR" value="KEPT THE SECRET" accent={MV.gold} />
          </div>
        </div>
      </div>
      <Vignette strength={0.5} />
      <Letterbox />
    </div>
  );
}

// ── 9. Engagement (248–258): comment prompts ─────────────────────────────────
function SceneEngage() {
  const { localTime: lt } = useSprite();
  const headP = Easing.easeOutCubic(clamp(lt / 0.9, 0, 1));
  const cards = [
    { label: 'COMMENT BRAVE', sub: 'JORDAN · THE BRAVE', flag: <FlagJordan w={80} />, accent: JOR_LIGHT },
    { label: 'COMMENT FENNECS', sub: 'THE DESERT FOXES', flag: <FlagALG w={80} />, accent: ALG_LIGHT },
  ];
  return (
    <div style={{ position: 'absolute', inset: 0, background: 'rgba(10,15,28,0.46)' }}>
      <div style={{ position: 'absolute', inset: 0, background: `radial-gradient(ellipse at 50% 30%, rgba(255,210,74,0.10) 0%, transparent 55%)` }} />
      <div style={{ position: 'absolute', top: 150, left: 0, right: 0, textAlign: 'center', zIndex: 25, opacity: headP }}>
        <Kicker size={30}>Do You Agree?</Kicker>
      </div>
      <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 60, zIndex: 25 }}>
        {cards.map((c, i) => {
          const cp = Easing.easeOutBack(clamp((lt - 0.8 - i * 0.4) / 0.7, 0, 1));
          return (
            <div key={i} style={{
              transform: `translateY(${(1 - cp) * 60}px) scale(${0.85 + 0.15 * cp})`, opacity: clamp(cp, 0, 1),
              background: MV.panel, border: `1px solid ${MV.line}`, borderRadius: 22,
              padding: '40px 56px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 20, minWidth: 360,
              boxShadow: '0 24px 70px rgba(0,0,0,0.5)', borderTop: `5px solid ${c.accent}`,
            }}>
              {c.flag}
              <div style={{ fontFamily: '"Inter",sans-serif', fontWeight: 900, fontSize: 38, color: MV.text }}>{c.label}</div>
              <div style={{ fontFamily: '"Inter",sans-serif', fontWeight: 700, fontSize: 22, color: MV.muted, letterSpacing: '0.16em' }}>{c.sub}</div>
            </div>
          );
        })}
      </div>
      <Vignette strength={0.45} />
      <Letterbox />
    </div>
  );
}

// ── 10. Mystery Supporter (258–279): the series' signature collectible card ──
function SceneMystery() {
  const { localTime: lt } = useSprite();
  const S = 258;
  const inP = Easing.easeOutCubic(clamp((lt - 0.6) / 1.4, 0, 1));
  const cardP = Easing.easeOutBack(clamp((lt - 4.2) / 0.9, 0, 1));
  // repeating holo sweep across the card so it never sits dead
  const shine = lt > 5 ? -40 + (((lt - 5) * 26) % 240) : -60;
  const floatY = Math.sin(lt * 1.05) * 5; // continuous gentle float once card is in
  const floatR = Math.sin(lt * 0.6) * 0.6;
  return (
    <div style={{ position: 'absolute', inset: 0, background: 'rgba(2,3,10,0.46)' }}>
      <ClipSprite id="mystery" dim={0.12} />
      <ClipSprite id="mystery-close" dim={0.18} />
      {/* drifting fog layers */}
      <div style={{
        position: 'absolute', inset: 0, zIndex: 21, pointerEvents: 'none', opacity: 0.5,
        background: `radial-gradient(ellipse at ${20 + Math.sin(lt * 0.3) * 14}% 75%, rgba(212,175,55,0.20) 0%, transparent 45%),` +
                    `radial-gradient(ellipse at ${78 - Math.sin(lt * 0.22) * 12}% 30%, rgba(206,17,38,0.14) 0%, transparent 50%)`,
      }} />
      <AmbientParticles start={S} dur={20} count={46} color="252,228,150" maxR={3.5} zIndex={22} />
      <div style={{ position: 'absolute', top: 118, left: 0, right: 0, textAlign: 'center', zIndex: 25, opacity: inP }}>
        <Kicker size={26} color="#e8c97a">The Mystery Supporter · Legend No. 046</Kicker>
      </div>
      {/* Premium COLLECTIBLE CARD */}
      {cardP > 0 && (
        <div style={{
          position: 'absolute', left: '50%', top: '52%', zIndex: 25,
          opacity: clamp(cardP, 0, 1),
          transform: `translate(-50%,-50%) translateY(${(1 - cardP) * 50 + cardP * floatY}px) rotate(${cardP * floatR}deg) scale(${0.9 + 0.1 * cardP})`,
        }}>
          <div style={{
            position: 'relative', width: 760, borderRadius: 26, overflow: 'hidden',
            padding: '5px',
            background: 'linear-gradient(150deg, #f4d784 0%, #b9842c 30%, #f8e9a8 55%, #9c6a1d 80%, #f4d784 100%)',
            boxShadow: '0 30px 120px rgba(0,0,0,0.75)',
          }}>
            <div style={{
              borderRadius: 22, background: 'linear-gradient(160deg, #1a1206 0%, #2e2410 55%, #0f0a04 100%)',
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
                <span style={{ fontFamily: '"Inter",sans-serif', fontWeight: 900, fontSize: 40, color: '#3a2706' }}>046</span>
              </div>
              <div style={{ fontFamily: '"Inter",sans-serif', fontWeight: 800, fontSize: 22, color: '#e8c97a', letterSpacing: '0.28em' }}>LEGEND 046</div>
              <div style={{ fontFamily: '"Inter",sans-serif', fontWeight: 900, fontSize: 64, color: '#f6f9ff', letterSpacing: '0.01em', marginTop: 8, lineHeight: 1.05, maxWidth: 540 }}>THE DESERT WIND</div>
              <div style={{ fontFamily: '"Inter",sans-serif', fontWeight: 700, fontSize: 22, color: '#e3cfa0', letterSpacing: '0.16em', marginTop: 14, textTransform: 'uppercase' }}>The Shared Sky · The Sand Remembers</div>
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

// ── 11. App promo (279–293): worldcup26.world ────────────────────────────────
function SceneApp() {
  const { localTime: lt } = useSprite();
  const inP = Easing.easeOutCubic(clamp(lt / 1.0, 0, 1));
  const cards = [
    { name: 'JORDAN', mult: 'EVERY GOAL SCORES', flag: <FlagJordan w={86} /> },
    { name: 'ALGERIA', mult: 'EVERY GOAL SCORES', flag: <FlagALG w={86} /> },
    { name: 'BRAZIL', mult: 'EVERY GOAL SCORES', flag: <div style={{ width: 86, height: 57, borderRadius: 6, background: 'linear-gradient(135deg,#159b46 55%,#ffd24a 55%)' }} /> },
  ];
  return (
    <div style={{ position: 'absolute', inset: 0, background: `linear-gradient(160deg, #0d2a20 0%, #07090f 70%)` }}>
      <div style={{ position: 'absolute', inset: 0, background: `radial-gradient(ellipse at 50% 20%, rgba(16,107,79,0.35) 0%, transparent 60%)` }} />
      <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 46, opacity: inP }}>
        <Kicker color="#7fd6b5" size={30}>The Prediction Game</Kicker>
        <BigTitle size={104} color="#fff" glow={MV.green}>worldcup26.world</BigTitle>
        <Kicker color="#cfe9de" size={30}>Pick 3 Of 48</Kicker>
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
                <div style={{ fontFamily: '"Inter",sans-serif', fontWeight: 800, fontSize: 22, color: MV.gold }}>{c.mult}</div>
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

// ── 12. CTA outro (293–308) ──────────────────────────────────────────────────
function SceneCTA() {
  const { localTime: lt } = useSprite();
  const S = 293;
  const inP = Easing.easeOutCubic(clamp(lt / 0.8, 0, 1));
  return (
    <div style={{ position: 'absolute', inset: 0, background: 'rgba(7,9,15,0.46)' }}>
      <ClipSprite id="cta-bg" dim={0.68} />
      <AmbientParticles start={295.24} dur={6} count={28} />
      <div style={{ position: 'absolute', inset: 0, zIndex: 23, background: 'radial-gradient(ellipse at 50% 35%, transparent 0%, rgba(7,9,15,0.88) 75%)' }} />
      <div style={{ position: 'absolute', top: 200, left: 0, right: 0, textAlign: 'center', zIndex: 25, opacity: inP }}>
        <Kicker size={30}>WorldCup26 Legends</Kicker>
        <div style={{ marginTop: 24 }}><TitleReveal text="JOIN THE LEGENDS" start={S + 0.5} size={92} color={MV.text} /></div>
      </div>
      <div style={{ position: 'absolute', inset: 0, zIndex: 26 }}>
        <CtaButton start={S} delay={1.2} label="SUBSCRIBE" icon="🔔" accent="#16a34a" x={500} />
        <CtaButton start={S} delay={1.6} label="LIKE" icon="👍" accent="#ce1126" x={960} />
        <CtaButton start={S} delay={2.0} label="SHARE" icon="📣" accent="#106b4f" x={1400} />
      </div>
      <Sprite start={297.50} end={308.00}>
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
        <span style={{ fontFamily: '"Inter",sans-serif', fontWeight: 900, fontSize: 30, color: MV.gold }}>⚡ EP47 · COLLECT LEGEND 046 · worldcup26.world</span>
      </div>
    </div>
  );
}
