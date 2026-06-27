// match-scenes.jsx — Ep71 Colombia vs Portugal — PHOTOREAL (rule #22) + NO-REPEAT/NO-LOOP.
// "El Dorado — The Gold That Was Never There" · Group K decider. OUR PREDICTION COL 0–0 POR
// (a goalless masterpiece; James Rodríguez curls inches off the bar in the 84th).
// Spine: Bruno Fernandes vs James Rodríguez — two number-ten artists, decided by imagination.
// Mystic (rule #21): Colombia's El Dorado (the gilded king who gave gold to the gods) vs
// Portugal's O Encoberto (the king lost in the fog). Legend 071 = The Gilded King.
// Rule #10 NO on-screen sentences (only short labels/names/score/CTA). #17 holo reveal.
// #18 premium prediction card. #19 full-frame. #20 15s mystic intro (intro.html).

const COL_YEL = '#FCD116', COL_BLUE = '#003893', COL_RED = '#CE1126';
const POR_RED = '#7a0019', POR_RED2 = '#a50021', POR_GREEN = '#0c5c2e';
const AU = '#f3c54a'; // El Dorado gold accent
// photoreal grade — subtle, never the cartoon brighten
const GRADE = { filter: 'saturate(1.06) contrast(1.04)' };

function FlagCOL({ w = 120 }) {
  const h = w * 2 / 3;
  return (
    <div style={{ width: w, height: h, borderRadius: w * 0.05, overflow: 'hidden', boxShadow: '0 6px 18px rgba(0,0,0,0.45)' }}>
      <div style={{ height: '50%', background: COL_YEL }} />
      <div style={{ height: '25%', background: COL_BLUE }} />
      <div style={{ height: '25%', background: COL_RED }} />
    </div>
  );
}
function FlagPOR({ w = 120 }) {
  const h = w * 2 / 3;
  return (
    <div style={{ width: w, height: h, borderRadius: w * 0.05, position: 'relative', overflow: 'hidden', boxShadow: '0 6px 18px rgba(0,0,0,0.45)' }}>
      <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: '40%', background: POR_GREEN }} />
      <div style={{ position: 'absolute', left: '40%', top: 0, bottom: 0, right: 0, background: POR_RED2 }} />
      <div style={{ position: 'absolute', left: '40%', top: '50%', transform: 'translate(-50%,-50%)', width: h * 0.34, height: h * 0.34, borderRadius: '50%', border: `${h * 0.05}px solid ${AU}`, background: 'rgba(255,255,255,0.1)' }} />
    </div>
  );
}

function FS({ id, style }) { return <ClipSprite id={id} fit="cover" style={{ ...GRADE, ...(style || {}) }} />; }

function ScoreBug({ start, col = 0, por = 0, minute, badge = 'OUR PREDICTION', note }) {
  const t = useTime(); const local = t - start; if (local < 0) return null;
  const inP = Easing.easeOutBack(clamp(local / 0.7, 0, 1));
  const cell = { fontFamily: '"Inter",sans-serif', fontWeight: 900, fontSize: 34, color: '#fff', padding: '10px 18px' };
  return (
    <div style={{ position: 'absolute', top: 92, left: '50%', zIndex: 30, transform: `translateX(-50%) scale(${inP})`, opacity: clamp(inP, 0, 1), display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
      <div style={{ display: 'flex', alignItems: 'center', background: MV.panel, border: `1px solid ${MV.line}`, borderRadius: 14, boxShadow: '0 10px 36px rgba(0,0,0,0.6)', overflow: 'hidden' }}>
        <div style={{ ...cell, background: COL_BLUE }}>COL</div>
        <div style={{ ...cell, fontSize: 38, color: AU }}>{col} — {por}</div>
        <div style={{ ...cell, background: POR_RED2 }}>POR</div>
        {minute && <div style={{ ...cell, fontSize: 26, color: MV.muted, borderLeft: `1px solid ${MV.line}` }}>{minute}</div>}
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <div style={{ fontFamily: '"Inter",sans-serif', fontWeight: 800, fontSize: 16, color: AU, letterSpacing: '0.22em', background: 'rgba(243,197,74,0.14)', border: '1px solid rgba(243,197,74,0.5)', borderRadius: 999, padding: '4px 16px' }}>{badge}</div>
        {note && <div style={{ fontFamily: '"Inter",sans-serif', fontWeight: 900, fontSize: 16, color: '#fff', letterSpacing: '0.18em', background: POR_RED2, border: `1px solid ${POR_RED2}`, borderRadius: 999, padding: '4px 16px' }}>{note}</div>}
      </div>
    </div>
  );
}

function ChanceTag({ start, end, text, sub, accent }) {
  const t = useTime(); if (t < start || t > end) return null;
  const p = Easing.easeOutBack(clamp((t - start) / 0.5, 0, 1));
  const fade = t > end - 0.4 ? clamp((end - t) / 0.4, 0, 1) : 1;
  return (
    <div style={{ position: 'absolute', left: 0, right: 0, bottom: 96, textAlign: 'center', zIndex: 26, opacity: fade, transform: `scale(${p})` }}>
      <div style={{ display: 'inline-block', fontFamily: '"Inter",sans-serif', fontWeight: 900, fontSize: 54, color: '#fff', textShadow: '0 4px 26px rgba(0,0,0,0.9)' }}>{text}
        {sub && <div style={{ fontSize: 24, fontWeight: 700, color: accent || AU, letterSpacing: '0.2em', marginTop: 8 }}>{sub}</div>}
      </div>
    </div>
  );
}

function PlayerShowcase({ clipId, name, role, accent, start, end }) {
  const t = useTime(); if (t < start || t > end) return null;
  const inP = Easing.easeOutCubic(clamp((t - start) / 0.5, 0, 1));
  const fade = t > end - 0.4 ? clamp((end - t) / 0.4, 0, 1) : 1;
  const slide = (1 - inP) * 60;
  return (
    <div style={{ position: 'absolute', inset: 0, zIndex: 12, opacity: fade }}>
      <ClipSprite id={clipId} fit="cover" style={GRADE} />
      <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg, rgba(0,0,0,0.20) 0%, transparent 22%, transparent 54%, rgba(2,3,8,0.84) 100%)' }} />
      <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: 12, background: accent, boxShadow: `0 0 30px ${accent}` }} />
      <div style={{ position: 'absolute', left: 80, bottom: 120, transform: `translateX(${-slide}px)`, opacity: inP }}>
        <div style={{ display: 'inline-block', background: accent, color: '#fff', fontFamily: '"Inter",sans-serif', fontWeight: 800, fontSize: 22, letterSpacing: '0.2em', padding: '6px 18px', borderRadius: 6, marginBottom: 14 }}>{role}</div>
        <div style={{ fontFamily: '"Inter",sans-serif', fontWeight: 900, fontSize: 76, color: '#fff', letterSpacing: '0.01em', lineHeight: 1, textShadow: '0 6px 30px rgba(0,0,0,0.85)' }}>{name}</div>
      </div>
    </div>
  );
}

function TeamBanner({ flag, label, accent }) {
  const { localTime: lt } = useSprite();
  const p = Easing.easeOutCubic(clamp(lt / 0.9, 0, 1));
  return (
    <div style={{ position: 'absolute', top: 64, left: 0, right: 0, display: 'flex', justifyContent: 'center', zIndex: 26, opacity: p, transform: `translateY(${(1 - p) * -20}px)` }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 24, background: MV.panel, border: `1px solid ${MV.line}`, borderRadius: 999, padding: '14px 40px', boxShadow: '0 10px 30px rgba(0,0,0,0.5)' }}>
        {flag}<span style={{ fontFamily: '"Inter",sans-serif', fontWeight: 900, fontSize: 38, color: '#fff', letterSpacing: '0.10em' }}>{label}</span>
        <div style={{ width: 14, height: 14, borderRadius: '50%', background: accent, boxShadow: `0 0 16px ${accent}` }} />
      </div>
    </div>
  );
}

function Backdrop() { return <div style={{ position: 'absolute', inset: 0, zIndex: 0, background: 'radial-gradient(ellipse at 50% 45%, #0c0f1c 0%, #05060c 100%)' }} />; }
function GoldField({ o = 0.5 }) {
  // animated El Dorado gold haze for graphic scenes (CSS only — no looped video)
  const { localTime: lt } = useSprite();
  const pulse = 0.5 + 0.5 * Math.sin(lt * 1.1);
  return (
    <div style={{ position: 'absolute', inset: 0, zIndex: 0 }}>
      <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse at 50% 42%, #1a1407 0%, #0a0a0f 70%, #05060c 100%)' }} />
      <div style={{ position: 'absolute', inset: 0, background: `radial-gradient(ellipse at 50% 40%, rgba(243,197,74,${(0.16 * pulse * o).toFixed(3)}) 0%, transparent 55%)` }} />
    </div>
  );
}

// ════════════════ SCENES ════════════════
function SceneColdOpen() {
  const { localTime: lt } = useSprite();
  const beat = Math.pow(Math.max(0, Math.sin(lt * Math.PI * 1.1)), 8);
  const teaseP = clamp((lt - 6.5) / 0.8, 0, 1) * clamp((15.0 - lt) / 0.6, 0, 1);
  const titleP = Easing.easeOutCubic(clamp((lt - 19.2) / 1.4, 0, 1));
  return (
    <div style={{ position: 'absolute', inset: 0 }}>
      <FS id="eldorado-lake" /><FS id="eldorado-gold" /><FS id="portugal-fog" /><FS id="gold-dust" />
      {lt >= 20 && <GoldField o={0.8} />}
      <div style={{ position: 'absolute', inset: 0, background: `radial-gradient(ellipse at center, rgba(243,197,74,${(0.22 * beat).toFixed(3)}) 0%, transparent 60%)` }} />
      <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg, rgba(2,3,8,0.34) 0%, transparent 30%, transparent 58%, rgba(2,3,8,0.72) 100%)' }} />
      {teaseP > 0.01 && (
        <div style={{ position: 'absolute', left: 0, right: 0, bottom: 150, textAlign: 'center', zIndex: 23, opacity: teaseP }}>
          <div style={{ display: 'inline-block', fontFamily: '"Inter",sans-serif', fontWeight: 800, fontSize: 30, color: '#e8c97a', letterSpacing: '0.24em', textShadow: '0 2px 18px rgba(0,0,0,0.85)' }}>WHAT IS GOLD?</div>
        </div>
      )}
      {lt > 19.2 && (
        <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 26, opacity: titleP, zIndex: 22 }}>
          <Kicker size={32} color={AU}>A Legend Of Gold</Kicker>
          <TitleReveal text="EL DORADO" start={20.0} size={108} color={AU} />
        </div>
      )}
    </div>
  );
}

function SceneTitle() {
  const { localTime: lt } = useSprite();
  const p1 = Easing.easeOutCubic(clamp(lt / 1.0, 0, 1));
  const p2 = Easing.easeOutBack(clamp((lt - 0.8) / 1.0, 0, 1));
  const p3 = Easing.easeOutCubic(clamp((lt - 1.7) / 0.9, 0, 1));
  return (
    <div style={{ position: 'absolute', inset: 0 }}>
      <GoldField o={1} />
      <AmbientParticles start={23.0} dur={10} count={34} color="243,197,74" />
      <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 40 }}>
        <div style={{ opacity: p1, transform: `translateY(${(1 - p1) * -30}px)` }}><Kicker>WorldCup26 Legends · Episode 71</Kicker></div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 64, opacity: clamp(p2, 0, 1), transform: `scale(${p2})` }}>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 18 }}><Waving><FlagCOL w={220} /></Waving><BigTitle size={74} glow={COL_YEL}>COLOMBIA</BigTitle></div>
          <BigTitle size={116} color={AU}>VS</BigTitle>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 18 }}><Waving speed={1.9}><FlagPOR w={220} /></Waving><BigTitle size={74} glow={POR_RED2}>PORTUGAL</BigTitle></div>
        </div>
        <div style={{ opacity: p3, fontFamily: '"Inter",sans-serif', fontWeight: 600, fontSize: 32, color: MV.muted, letterSpacing: '0.10em' }}>GROUP K · THE DECIDER</div>
      </div>
    </div>
  );
}

function SceneStadium() {
  const { localTime: lt } = useSprite();
  const stripP = Easing.easeOutCubic(clamp((lt - 1.2) / 0.9, 0, 1));
  return (
    <div style={{ position: 'absolute', inset: 0 }}>
      <FS id="pitch-walkout" /><FS id="stadium-wide" />
      <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg, transparent 50%, rgba(2,3,8,0.8) 100%)' }} />
      <div style={{ position: 'absolute', left: 0, right: 0, bottom: 120, display: 'flex', justifyContent: 'center', zIndex: 25, opacity: stripP, transform: `translateY(${(1 - stripP) * 30}px)` }}>
        <div style={{ display: 'flex', background: MV.panel, border: `1px solid ${MV.line}`, borderRadius: 16, overflow: 'hidden', backdropFilter: 'blur(6px)' }}>
          {[['GROUP K', 'THE DECIDER'], ['LOS CAFETEROS', 'vs A SELEÇÃO'], ['JAMES', 'vs BRUNO'], ['THE TENS', 'DUEL']].map(([v, l], i) => (
            <div key={i} style={{ padding: '22px 38px', borderLeft: i ? `1px solid ${MV.line}` : 'none', textAlign: 'center' }}>
              <div style={{ fontFamily: '"Inter",sans-serif', fontWeight: 900, fontSize: 30, color: AU }}>{v}</div>
              <div style={{ fontFamily: '"Inter",sans-serif', fontWeight: 700, fontSize: 16, color: MV.muted, letterSpacing: '0.14em', marginTop: 5 }}>{l}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function SceneColombia() {
  return (
    <div style={{ position: 'absolute', inset: 0 }}>
      <Sprite start={44} end={54}><div style={{ position: 'absolute', inset: 0 }}><FS id="col-crowd" /><Sprite start={49} end={54} keepMounted><FS id="col-tifo" /></Sprite><div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg, rgba(2,3,8,0.30) 0%, transparent 40%, rgba(2,3,8,0.55) 100%)' }} /><TeamBanner flag={<FlagCOL w={66} />} label="LOS CAFETEROS · COLOMBIA" accent={COL_YEL} /></div></Sprite>
      <PlayerShowcase clipId="s-james" name="JAMES RODRÍGUEZ" role="EL BAMBINO · 10" accent={COL_RED} start={54} end={59} />
      <PlayerShowcase clipId="s-diaz" name="LUIS DÍAZ" role="EL TREN" accent={COL_BLUE} start={59} end={64} />
      <PlayerShowcase clipId="s-duran" name="JHON DURÁN" role="EL TANQUE" accent={COL_RED} start={64} end={69} />
      <PlayerShowcase clipId="s-munoz" name="DANIEL MUÑOZ" role="THE ENGINE" accent={COL_BLUE} start={69} end={74} />
      <PlayerShowcase clipId="s-sanchez" name="DAVINSON SÁNCHEZ" role="EL MURO" accent={COL_RED} start={74} end={79.5} />
    </div>
  );
}

function ScenePortugal() {
  return (
    <div style={{ position: 'absolute', inset: 0 }}>
      <Sprite start={79.5} end={84.5}><div style={{ position: 'absolute', inset: 0 }}><FS id="por-crowd" /><div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg, rgba(2,3,8,0.30) 0%, transparent 40%, rgba(2,3,8,0.55) 100%)' }} /><TeamBanner flag={<FlagPOR w={66} />} label="A SELEÇÃO · PORTUGAL" accent={POR_RED2} /></div></Sprite>
      <PlayerShowcase clipId="s-bruno" name="BRUNO FERNANDES" role="THE CONDUCTOR · 8" accent={POR_RED2} start={84.5} end={89.5} />
      <PlayerShowcase clipId="s-bernardo" name="BERNARDO SILVA" role="THE MAGICIAN" accent={POR_GREEN} start={89.5} end={94.5} />
      <PlayerShowcase clipId="s-leao" name="RAFAEL LEÃO" role="THE CHEETAH" accent={POR_RED2} start={94.5} end={99.5} />
      <PlayerShowcase clipId="s-ronaldo" name="CRISTIANO RONALDO" role="THE GRAVITY" accent={AU} start={99.5} end={103} />
    </div>
  );
}

function SceneDuel() {
  return (
    <div style={{ position: 'absolute', inset: 0 }}>
      <Sprite start={103} end={108}><div style={{ position: 'absolute', inset: 0 }}><FS id="duel-bruno-rios" /><div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(90deg, rgba(122,0,25,0.40), transparent 55%)' }} /><div style={{ position: 'absolute', left: 80, bottom: 130, fontFamily: '"Inter",sans-serif', fontWeight: 900, fontSize: 60, color: '#fff', textShadow: '0 4px 26px rgba(0,0,0,0.9)' }}>EL MAESTRO<div style={{ fontSize: 26, fontWeight: 700, color: AU, letterSpacing: '0.2em', marginTop: 8 }}>BRUNO vs RÍOS</div></div></div></Sprite>
      <Sprite start={108} end={113}><div style={{ position: 'absolute', inset: 0 }}><FS id="duel-mid" /><div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.22)' }} /><div style={{ position: 'absolute', left: 0, right: 0, bottom: 70, textAlign: 'center', fontFamily: '"Inter",sans-serif', fontWeight: 900, fontSize: 56, color: '#fff', textShadow: '0 4px 26px rgba(0,0,0,0.9)' }}>TWO NUMBER TENS</div></div></Sprite>
      <Sprite start={113} end={118}><div style={{ position: 'absolute', inset: 0 }}><FS id="duel-leao-wing" /><div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(270deg, rgba(252,209,22,0.30), transparent 55%)' }} /><div style={{ position: 'absolute', right: 80, bottom: 130, textAlign: 'right', fontFamily: '"Inter",sans-serif', fontWeight: 900, fontSize: 60, color: '#fff', textShadow: '0 4px 26px rgba(0,0,0,0.9)' }}>PACE vs POISE</div></div></Sprite>
      <Sprite start={118} end={123}><div style={{ position: 'absolute', inset: 0 }}><FS id="duel-rios-tackle" /><div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.22)' }} /></div></Sprite>
      <Sprite start={123} end={132}><div style={{ position: 'absolute', inset: 0 }}><FS id="stadium-aerial" /><div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse at 50% 50%, transparent 35%, rgba(2,3,8,0.6) 100%)' }} /><div style={{ position: 'absolute', left: 0, right: 0, bottom: 90, textAlign: 'center', fontFamily: '"Inter",sans-serif', fontWeight: 900, fontSize: 50, color: AU, letterSpacing: '0.16em', textShadow: '0 4px 26px rgba(0,0,0,0.9)' }}>WON BY IMAGINATION</div></div></Sprite>
    </div>
  );
}

// ════════════════ RULE #18 — PREMIUM PREDICTION CARD (0–0) ════════════════
function PredictionCard({ start }) {
  const t = useTime(); const local = t - start;
  const p = Easing.easeOutCubic(clamp(local / 1.0, 0, 1));
  const stampP = Easing.easeOutBack(clamp((local - 1.0) / 0.6, 0, 1));
  const sheenX = ((local * 26) % 160) - 30;
  const Badge = ({ flag, name, accent }) => (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 14 }}>
      <div style={{ padding: 9, borderRadius: '50%', background: `conic-gradient(${accent}, #ffffffaa, ${accent}, #ffffff55, ${accent})`, boxShadow: `0 10px 34px rgba(0,0,0,0.55), 0 0 26px ${accent}66` }}>
        <div style={{ width: 124, height: 124, borderRadius: '50%', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#070b14', border: '3px solid rgba(255,255,255,0.9)' }}>{flag}</div>
      </div>
      <span style={{ fontFamily: '"Inter",sans-serif', fontWeight: 900, fontSize: 26, color: '#fff', letterSpacing: '0.03em' }}>{name}</span>
    </div>
  );
  return (
    <div style={{ position: 'absolute', inset: 0, zIndex: 28, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(2,3,6,0.62)', opacity: p }}>
      <div style={{ width: 1010, borderRadius: 28, overflow: 'hidden', transform: `scale(${0.92 + 0.08 * p})`, boxShadow: '0 36px 130px rgba(0,0,0,0.8)', position: 'relative', border: '2px solid rgba(243,197,74,0.55)' }}>
        <div style={{ position: 'absolute', inset: 0, background: `linear-gradient(105deg, ${COL_BLUE}33 0%, #070b14 38%, #070b14 62%, ${POR_RED}40 100%)` }} />
        <div style={{ position: 'absolute', top: 0, bottom: 0, left: `${sheenX}%`, width: '22%', background: 'linear-gradient(105deg, transparent, rgba(255,255,255,0.10), transparent)', transform: 'skewX(-18deg)', pointerEvents: 'none', zIndex: 5 }} />
        <div style={{ position: 'relative', zIndex: 2, background: `linear-gradient(100deg, ${COL_BLUE} 0%, #11151f 50%, ${POR_RED} 100%)`, padding: '13px 0', textAlign: 'center' }}>
          <span style={{ fontFamily: '"Inter",sans-serif', fontWeight: 900, fontSize: 17, letterSpacing: '0.30em', color: '#fff' }}>WORLDCUP26 LEGENDS · OUR PREDICTION · NOT PLAYED</span>
        </div>
        <div style={{ position: 'relative', zIndex: 2, padding: '40px 70px 30px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 50 }}>
            <Badge flag={<FlagCOL w={104} />} name="COLOMBIA" accent={COL_YEL} />
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, fontFamily: '"Inter",sans-serif', fontWeight: 900, fontSize: 132, color: '#fff', lineHeight: 1 }}>
                <span style={{ textShadow: `0 0 36px ${COL_YEL}99` }}>0</span>
                <span style={{ color: AU, fontSize: 64, transform: 'translateY(-6px)' }}>—</span>
                <span style={{ textShadow: `0 0 36px ${POR_RED2}cc` }}>0</span>
              </div>
              <div style={{ fontFamily: '"Inter",sans-serif', fontWeight: 800, fontSize: 17, color: MV.muted, letterSpacing: '0.34em', marginTop: 4 }}>FULL-TIME</div>
            </div>
            <Badge flag={<FlagPOR w={104} />} name="PORTUGAL" accent={POR_RED2} />
          </div>
          <div style={{ display: 'flex', justifyContent: 'center', gap: 12, marginTop: 26, paddingTop: 22, borderTop: '1px solid rgba(255,255,255,0.12)' }}>
            <span style={{ fontFamily: '"Inter",sans-serif', fontWeight: 800, fontSize: 21, color: '#ffe9a8', background: 'rgba(243,197,74,0.14)', border: '1px solid rgba(243,197,74,0.45)', borderRadius: 999, padding: '7px 18px' }}>84' JAMES — OFF THE BAR</span>
          </div>
          <div style={{ textAlign: 'center', marginTop: 22, fontFamily: '"Inter",sans-serif', fontWeight: 900, fontSize: 23, color: AU, letterSpacing: '0.16em' }}>★ A GOALLESS MASTERPIECE ★</div>
          <div style={{ textAlign: 'center', marginTop: 6, fontFamily: '"Inter",sans-serif', fontWeight: 700, fontSize: 16, color: MV.muted, letterSpacing: '0.2em' }}>worldcup26.world</div>
        </div>
        {stampP > 0 && <div style={{ position: 'absolute', top: 70, right: -6, zIndex: 6, transform: `rotate(-12deg) scale(${stampP})`, border: `4px solid ${AU}`, color: AU, borderRadius: 12, padding: '8px 22px', fontFamily: '"Inter",sans-serif', fontWeight: 900, fontSize: 24, letterSpacing: '0.14em', background: 'rgba(7,9,15,0.92)' }}>OUR STORY</div>}
      </div>
    </div>
  );
}

function SceneDrama() {
  return (
    <div style={{ position: 'absolute', inset: 0 }}>
      <Backdrop />
      {/* match build */}
      <Sprite start={132} end={137}><FS id="col-attack1" /></Sprite>
      <Sprite start={137} end={142}><FS id="por-attack1" /></Sprite>
      <Sprite start={142} end={147}><FS id="s-dias" /></Sprite>
      <Sprite start={147} end={152}><FS id="costa-save2" /></Sprite>
      <Sprite start={152} end={157}><FS id="james-control" /></Sprite>
      {/* 157–164 GRAPHIC build to the 84th (no clip → no loop) */}
      <Sprite start={157} end={164}><div style={{ position: 'absolute', inset: 0 }}><GoldField o={0.7} /><AmbientParticles start={157} dur={7} count={26} color="243,197,74" /><div style={{ position: 'absolute', left: 0, right: 0, top: '40%', textAlign: 'center', fontFamily: '"Inter",sans-serif', fontWeight: 900, fontSize: 84, color: '#fff', letterSpacing: '0.04em', textShadow: '0 4px 30px rgba(0,0,0,0.9)' }}>THE 84TH MINUTE<div style={{ fontSize: 28, fontWeight: 700, color: AU, letterSpacing: '0.24em', marginTop: 14 }}>ONE TOUCH · ONE CHANCE</div></div></div></Sprite>
      {/* the curl → the bar → the smile */}
      <Sprite start={164} end={169}><FS id="goal-james-strike" /></Sprite>
      <Sprite start={169} end={174}><div style={{ position: 'absolute', inset: 0 }}><FS id="goal-bar-save" /><ChanceTag start={169.4} end={174} text="OFF THE BAR!" sub="INCHES FROM GOLD" accent="#ffd76a" /></div></Sprite>
      <Sprite start={174} end={178.46}><FS id="james-sky" /></Sprite>
      {/* 178.46–189 GRAPHIC: the gold that wasn't there */}
      <Sprite start={178.46} end={189}><div style={{ position: 'absolute', inset: 0 }}><GoldField o={0.6} /><AmbientParticles start={178.46} dur={10.5} count={30} color="243,197,74" /><div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><div style={{ fontFamily: '"Inter",sans-serif', fontWeight: 900, fontSize: 66, color: AU, letterSpacing: '0.06em', textAlign: 'center', textShadow: '0 4px 30px rgba(0,0,0,0.9)' }}>THE GOLD THAT<br />WASN'T THERE</div></div></div></Sprite>
      {/* late chance */}
      <Sprite start={189} end={194}><div style={{ position: 'absolute', inset: 0 }}><FS id="chance-col-header" /><ChanceTag start={189.4} end={194} text="INCHES WIDE" sub="TWO ARTISTS, ONE CANVAS" accent="#cfe0ff" /></div></Sprite>
      {/* ScoreBug across the climax */}
      <Sprite start={164} end={194}><ScoreBug start={164.4} col={0} por={0} minute="84'" badge="OUR PREDICTION" /></Sprite>
      {/* 194–203.32 PREMIUM PREDICTION CARD #18 */}
      <Sprite start={194} end={203.32}><PredictionCard start={194.6} /></Sprite>
      <Vignette strength={0.32} />
    </div>
  );
}

// ════════════════ VERDICT — multiple distinct clips, then graphic panel (NO LOOP) ════════════════
function SceneVerdict() {
  const t = useTime(); const S = 203.32;
  const panelP = Easing.easeOutCubic(clamp((t - 219.0) / 1.0, 0, 1));
  return (
    <div style={{ position: 'absolute', inset: 0 }}>
      {/* three DISTINCT photoreal clips, each <=5s — never one looped clip */}
      <Sprite start={203.32} end={208.32}><div style={{ position: 'absolute', inset: 0 }}><FS id="vd-handshake" /><div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg, rgba(2,3,8,0.25) 0%, transparent 45%, rgba(2,3,8,0.55) 100%)' }} /><div style={{ position: 'absolute', left: 0, right: 0, top: 120, textAlign: 'center', zIndex: 24 }}><Kicker size={28} color={AU}>Full Time · Our Prediction</Kicker></div></div></Sprite>
      <Sprite start={208.32} end={213.32}><FS id="vd-applaud" /></Sprite>
      <Sprite start={213.32} end={218.32}><FS id="vd-stadium-night" /></Sprite>
      {/* 218.32–244 GRAPHIC stat panel on gold gradient — NO video, cannot loop */}
      <Sprite start={218.32} end={244}>
        <div style={{ position: 'absolute', inset: 0 }}>
          <GoldField o={0.7} />
          <AmbientParticles start={218.32} dur={25.7} count={28} color="243,197,74" />
          <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 25 }}>
            <div style={{ background: MV.panel, border: `1px solid ${MV.line}`, borderRadius: 24, padding: '48px 80px', minWidth: 900, backdropFilter: 'blur(6px)', opacity: panelP, transform: `translateY(${(1 - panelP) * 24}px)` }}>
              <Kicker size={26}>Group K · Our Prediction</Kicker>
              <div style={{ marginTop: 24 }}>
                <StatLine start={219.5} delay={0.0} label="COLOMBIA" value="LOS CAFETEROS" accent={COL_YEL} />
                <StatLine start={219.5} delay={0.25} label="PORTUGAL" value="A SELEÇÃO" accent={POR_RED2} />
                <StatLine start={219.5} delay={0.5} label="OUR PREDICTION" value="COL 0 — 0 POR" accent="#fff" />
                <StatLine start={219.5} delay={0.75} label="84' JAMES — OFF THE BAR" value="THE GOLD THAT WASN'T THERE" accent={AU} />
              </div>
            </div>
          </div>
        </div>
      </Sprite>
      <Vignette strength={0.42} />
    </div>
  );
}

function SceneEngage() {
  const { localTime: lt } = useSprite();
  const headP = Easing.easeOutCubic(clamp(lt / 0.9, 0, 1));
  const cards = [
    { label: 'COMMENT COLOMBIA', sub: 'LOS CAFETEROS', flag: <FlagCOL w={78} />, accent: COL_YEL },
    { label: 'COMMENT PORTUGAL', sub: 'A SELEÇÃO', flag: <FlagPOR w={78} />, accent: POR_RED2 },
  ];
  return (
    <div style={{ position: 'absolute', inset: 0 }}>
      <Sprite start={244} end={249}><FS id="crowd-tense" /></Sprite>
      {lt >= 5 && <GoldField o={0.5} />}
      <div style={{ position: 'absolute', inset: 0, background: 'rgba(6,10,18,0.58)' }} />
      <div style={{ position: 'absolute', top: 140, left: 0, right: 0, textAlign: 'center', zIndex: 25, opacity: headP }}><Kicker size={30}>Whose Imagination Was Deeper?</Kicker></div>
      <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 56, zIndex: 25 }}>
        {cards.map((c, i) => {
          const cp = Easing.easeOutBack(clamp((lt - 0.8 - i * 0.4) / 0.7, 0, 1));
          return (
            <div key={i} style={{ transform: `translateY(${(1 - cp) * 60}px) scale(${0.85 + 0.15 * cp})`, opacity: clamp(cp, 0, 1), background: MV.panel, border: `1px solid ${MV.line}`, borderRadius: 22, padding: '38px 54px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 18, minWidth: 360, boxShadow: '0 24px 70px rgba(0,0,0,0.5)', borderTop: `5px solid ${c.accent}` }}>
              {c.flag}
              <div style={{ fontFamily: '"Inter",sans-serif', fontWeight: 900, fontSize: 27, color: '#fff' }}>{c.label}</div>
              <div style={{ fontFamily: '"Inter",sans-serif', fontWeight: 700, fontSize: 21, color: MV.muted, letterSpacing: '0.16em' }}>{c.sub}</div>
            </div>
          );
        })}
      </div>
      <Vignette strength={0.4} />
    </div>
  );
}

// ════════ RULE #16 + #17 — STORY-WOVEN HOLO COLLECTIBLE: LEGEND 071 THE GILDED KING ════════
function SceneMystery() {
  const { localTime: lt } = useSprite();
  const inP = Easing.easeOutCubic(clamp((lt - 0.6) / 1.4, 0, 1));
  const teaseP = clamp((lt - 1.0) / 0.8, 0, 1) * clamp((4.0 - lt) / 0.6, 0, 1);
  const cardP = Easing.easeOutCubic(clamp((lt - 4.2) / 1.0, 0, 1));
  const tilt = Math.sin(lt * 0.8) * 6;
  const sheenX = ((lt * 22) % 170) - 35;
  const stripP = Easing.easeOutCubic(clamp((lt - 18.0) / 1.2, 0, 1));
  return (
    <div style={{ position: 'absolute', inset: 0 }}>
      <GoldField o={1} />
      <AmbientParticles start={255} dur={26} count={40} color="243,197,74" />
      {teaseP > 0.01 && (
        <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: teaseP, zIndex: 20 }}>
          <div style={{ fontFamily: '"Inter",sans-serif', fontWeight: 800, fontSize: 34, color: '#e8c97a', letterSpacing: '0.24em' }}>THE GOLD WAS A PRAYER</div>
        </div>
      )}
      {lt > 4.2 && (
        <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 22, opacity: cardP }}>
          <div style={{ width: 560, borderRadius: 26, overflow: 'hidden', position: 'relative', transform: `perspective(1400px) rotateY(${tilt}deg) scale(${0.9 + 0.1 * cardP})`, boxShadow: '0 40px 120px rgba(0,0,0,0.8), 0 0 60px rgba(243,197,74,0.35)', border: '2px solid rgba(243,197,74,0.7)' }}>
            <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(150deg, #2a2008 0%, #0a0a0f 45%, #1a1407 100%)' }} />
            <div style={{ position: 'absolute', top: 0, bottom: 0, left: `${sheenX}%`, width: '26%', background: 'linear-gradient(105deg, transparent, rgba(255,225,150,0.18), transparent)', transform: 'skewX(-18deg)', zIndex: 6 }} />
            <div style={{ position: 'relative', zIndex: 3 }}>
              <ClipSprite id="eldorado-lake" fit="cover" style={{ height: 360, ...GRADE }} />
              <div style={{ position: 'absolute', left: 0, right: 0, top: 0, height: 360, background: 'linear-gradient(180deg, transparent 55%, rgba(10,8,4,0.96) 100%)' }} />
              <div style={{ position: 'absolute', top: 16, left: 16, background: 'rgba(243,197,74,0.92)', color: '#1a1407', fontFamily: '"Inter",sans-serif', fontWeight: 900, fontSize: 18, letterSpacing: '0.12em', padding: '5px 14px', borderRadius: 8 }}>Nº 071 · ✦✦✦ ULTRA RARE</div>
            </div>
            <div style={{ position: 'relative', zIndex: 3, padding: '6px 28px 26px', background: 'linear-gradient(180deg, #0a0a0f 0%, #15110a 100%)' }}>
              <div style={{ fontFamily: '"Inter",sans-serif', fontWeight: 900, fontSize: 44, color: AU, letterSpacing: '0.02em', textShadow: '0 2px 20px rgba(243,197,74,0.4)' }}>THE GILDED KING</div>
              <div style={{ fontFamily: '"Inter",sans-serif', fontWeight: 700, fontSize: 19, color: '#cbb78a', letterSpacing: '0.16em', marginTop: 6 }}>EL DORADO · COLOMBIA · LEGEND 071</div>
            </div>
          </div>
        </div>
      )}
      {/* collection strip */}
      <div style={{ position: 'absolute', left: 0, right: 0, bottom: 56, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 14, zIndex: 24, opacity: stripP }}>
        <div style={{ display: 'flex', gap: 10 }}>
          {[0, 1, 2, 3, 4, 5].map((i) => (
            <div key={i} style={{ width: 44, height: 60, borderRadius: 7, border: `1px solid ${i === 5 ? AU : 'rgba(255,255,255,0.18)'}`, background: i === 5 ? 'rgba(243,197,74,0.22)' : 'rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: '"Inter",sans-serif', fontWeight: 900, fontSize: 14, color: i === 5 ? AU : 'rgba(255,255,255,0.4)' }}>{i === 5 ? '071' : ''}</div>
          ))}
        </div>
        <div style={{ fontFamily: '"Inter",sans-serif', fontWeight: 900, fontSize: 22, color: '#fff', letterSpacing: '0.2em' }}>LEGEND 071 OF 66 · COLLECT THEM ALL</div>
      </div>
    </div>
  );
}

function SceneApp() {
  const { localTime: lt } = useSprite();
  const p = Easing.easeOutCubic(clamp(lt / 1.0, 0, 1));
  const steps = [['1', 'SIGN UP FREE', 'worldcup26.world'], ['2', 'PICK 3 NATIONS', 'of the 48'], ['3', 'EVERY GOAL SCORES', 'for you']];
  return (
    <div style={{ position: 'absolute', inset: 0 }}>
      <GoldField o={0.8} />
      <AmbientParticles start={281.38} dur={22} count={26} color="243,197,74" />
      <div style={{ position: 'absolute', top: 110, left: 0, right: 0, textAlign: 'center', zIndex: 25, opacity: p }}>
        <Kicker size={32} color={AU}>Claim The Gilded King</Kicker>
        <div style={{ marginTop: 12, fontFamily: '"Inter",sans-serif', fontWeight: 900, fontSize: 60, color: '#fff', letterSpacing: '0.04em' }}>worldcup26.world</div>
      </div>
      <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 40, zIndex: 25 }}>
        {steps.map((s, i) => {
          const cp = Easing.easeOutBack(clamp((lt - 0.8 - i * 0.4) / 0.7, 0, 1));
          return (
            <div key={i} style={{ transform: `translateY(${(1 - cp) * 50}px) scale(${0.85 + 0.15 * cp})`, opacity: clamp(cp, 0, 1), background: MV.panel, border: `1px solid ${MV.line}`, borderRadius: 22, padding: '34px 40px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12, minWidth: 300, boxShadow: '0 24px 70px rgba(0,0,0,0.5)', borderTop: `5px solid ${AU}` }}>
              <div style={{ width: 56, height: 56, borderRadius: '50%', background: AU, color: '#1a1407', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: '"Inter",sans-serif', fontWeight: 900, fontSize: 30 }}>{s[0]}</div>
              <div style={{ fontFamily: '"Inter",sans-serif', fontWeight: 900, fontSize: 24, color: '#fff', textAlign: 'center' }}>{s[1]}</div>
              <div style={{ fontFamily: '"Inter",sans-serif', fontWeight: 700, fontSize: 18, color: MV.muted, letterSpacing: '0.12em' }}>{s[2]}</div>
            </div>
          );
        })}
      </div>
      <div style={{ position: 'absolute', bottom: 90, left: 0, right: 0, textAlign: 'center', zIndex: 25, opacity: p, fontFamily: '"Inter",sans-serif', fontWeight: 700, fontSize: 22, color: MV.muted, letterSpacing: '0.14em' }}>FREE TO PLAY · JUST FOR FUN · NO PRIZES</div>
    </div>
  );
}

function SceneCTA() {
  const { localTime: lt } = useSprite();
  const p = Easing.easeOutCubic(clamp(lt / 1.0, 0, 1));
  return (
    <div style={{ position: 'absolute', inset: 0 }}>
      <Sprite start={303.05} end={308.05}><FS id="cta-celebrate" /></Sprite>
      {lt >= 5 && <GoldField o={0.7} />}
      <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg, rgba(2,3,8,0.45) 0%, rgba(2,3,8,0.30) 45%, rgba(2,3,8,0.72) 100%)' }} />
      <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 26, zIndex: 25, opacity: p }}>
        <Kicker size={30} color={AU}>WorldCup26 Legends</Kicker>
        <div style={{ fontFamily: '"Inter",sans-serif', fontWeight: 900, fontSize: 64, color: '#fff', letterSpacing: '0.03em', textAlign: 'center', textShadow: '0 6px 30px rgba(0,0,0,0.85)' }}>LIKE · SUBSCRIBE</div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
          <FlagCOL w={64} />
          <div style={{ fontFamily: '"Inter",sans-serif', fontWeight: 900, fontSize: 34, color: AU, letterSpacing: '0.2em' }}>worldcup26.world</div>
          <FlagPOR w={64} />
        </div>
      </div>
      <Vignette strength={0.4} />
    </div>
  );
}
