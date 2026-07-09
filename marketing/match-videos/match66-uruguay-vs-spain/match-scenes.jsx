// match-scenes.jsx — Ep66 Uruguay vs Spain — ANIMATION-FIRST + NO-REPEAT (318s).
// "The Ballon d'Or Derby" · Group H. OUR PREDICTION URU 2–1 ESP (garra over art).
// Rule #11 no-repeat · #15 no banned wording · #16 story-woven mystery (Candombe
// teased "WHAT GIVES THIS NATION ITS WILL?" → paid off "the will made sound").
// NEW: rule #17 — animated HOLO COLLECTIBLE reveal (shine-sweep + 3D tilt + UNLOCK
// beat + growing-collection strip + "COLLECT THEM ALL"). NEW: rule #18 — redesigned
// PREMIUM prediction card (branded layered frame, sheen, crest badges, gold seal).

const URU = '#5cbfeb', URU_DK = '#001489', ESP = '#c60b1e', ESP_GOLD = '#ffc400';
const HERO = { filter: 'brightness(1.05) saturate(1.14) contrast(1.05)' };

function FlagURU({ w = 120 }) {
  const h = w * 2 / 3;
  const stripes = [];
  for (let i = 0; i < 9; i++) stripes.push(<div key={i} style={{ position: 'absolute', left: 0, right: 0, top: `${i * (100 / 9)}%`, height: `${100 / 9}%`, background: i % 2 === 0 ? '#fff' : '#5cbfeb' }} />);
  return (
    <div style={{ width: w, height: h, borderRadius: w * 0.05, position: 'relative', overflow: 'hidden', background: '#fff', boxShadow: '0 6px 18px rgba(0,0,0,0.45)' }}>
      {stripes}
      <div style={{ position: 'absolute', left: 0, top: 0, width: '38%', height: `${100 / 9 * 4}%`, background: '#fff' }}><div style={{ position: 'absolute', left: '50%', top: '50%', transform: 'translate(-50%,-50%)', color: '#f5c518', fontSize: h * 0.26, lineHeight: 1, textShadow: '0 0 2px #d59e00' }}>☀</div></div>
    </div>
  );
}
function FlagESP({ w = 120 }) {
  const h = w * 2 / 3;
  return (
    <div style={{ width: w, height: h, borderRadius: w * 0.05, position: 'relative', overflow: 'hidden', boxShadow: '0 6px 18px rgba(0,0,0,0.45)' }}>
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '25%', background: '#c60b1e' }} />
      <div style={{ position: 'absolute', top: '25%', left: 0, right: 0, height: '50%', background: '#ffc400' }} />
      <div style={{ position: 'absolute', top: '75%', left: 0, right: 0, height: '25%', background: '#c60b1e' }} />
      <div style={{ position: 'absolute', left: '26%', top: '50%', transform: 'translate(-50%,-50%)', width: h * 0.16, height: h * 0.22, background: '#c60b1e', borderRadius: 2 }} />
    </div>
  );
}

function ScoreBug({ start, uru = 0, esp = 0, minute, badge = "OUR PREDICTION", note }) {
  const t = useTime(); const local = t - start; if (local < 0) return null;
  const inP = Easing.easeOutBack(clamp(local / 0.7, 0, 1));
  const cell = { fontFamily: '"Inter",sans-serif', fontWeight: 900, fontSize: 34, color: '#fff', padding: '10px 18px' };
  return (
    <div style={{ position: 'absolute', top: 92, left: '50%', zIndex: 30, transform: `translateX(-50%) scale(${inP})`, opacity: clamp(inP, 0, 1), display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
      <div style={{ display: 'flex', alignItems: 'center', background: MV.panel, border: `1px solid ${MV.line}`, borderRadius: 14, boxShadow: '0 10px 36px rgba(0,0,0,0.6)', overflow: 'hidden' }}>
        <div style={{ ...cell, background: URU, color: '#06243f' }}>URU</div>
        <div style={{ ...cell, fontSize: 38, color: MV.gold }}>{uru} — {esp}</div>
        <div style={{ ...cell, background: ESP }}>ESP</div>
        {minute && <div style={{ ...cell, fontSize: 26, color: MV.muted, borderLeft: `1px solid ${MV.line}` }}>{minute}</div>}
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <div style={{ fontFamily: '"Inter",sans-serif', fontWeight: 800, fontSize: 16, color: MV.gold, letterSpacing: '0.22em', background: 'rgba(255,210,74,0.14)', border: '1px solid rgba(255,210,74,0.5)', borderRadius: 999, padding: '4px 16px' }}>{badge}</div>
        {note && <div style={{ fontFamily: '"Inter",sans-serif', fontWeight: 900, fontSize: 16, color: '#06243f', letterSpacing: '0.18em', background: URU, border: `1px solid ${URU}`, borderRadius: 999, padding: '4px 16px' }}>{note}</div>}
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
      <ClipSprite id={clipId} fit="cover" style={HERO} />
      <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg, rgba(0,0,0,0.22) 0%, transparent 20%, transparent 54%, rgba(2,3,8,0.84) 100%)' }} />
      <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: 12, background: accent, boxShadow: `0 0 30px ${accent}` }} />
      <div style={{ position: 'absolute', left: 80, bottom: 120, transform: `translateX(${-slide}px)`, opacity: inP }}>
        <div style={{ display: 'inline-block', background: accent, color: '#fff', fontFamily: '"Inter",sans-serif', fontWeight: 800, fontSize: 22, letterSpacing: '0.2em', padding: '6px 18px', borderRadius: 6, marginBottom: 14 }}>{role}</div>
        <div style={{ fontFamily: '"Inter",sans-serif', fontWeight: 900, fontSize: 78, color: '#fff', letterSpacing: '0.01em', lineHeight: 1, textShadow: '0 6px 30px rgba(0,0,0,0.85)' }}>{name}</div>
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

function Backdrop() { return <div style={{ position: 'absolute', inset: 0, zIndex: 0, background: 'radial-gradient(ellipse at 50% 45%, #0a0f1c 0%, #05060c 100%)' }} />; }
function FS({ id }) { return <ClipSprite id={id} fit="cover" style={HERO} />; }

function SceneColdOpen() {
  const { localTime: lt } = useSprite();
  const beat = Math.pow(Math.max(0, Math.sin(lt * Math.PI * 1.15)), 8);
  const titleP = Easing.easeOutCubic(clamp((lt - 18.0) / 1.4, 0, 1));
  const teaseLabelP = clamp((lt - 10.4) / 0.8, 0, 1) * clamp((15.0 - lt) / 0.6, 0, 1);
  return (
    <div style={{ position: 'absolute', inset: 0 }}>
      <FS id="cg-urufan" /><FS id="cg-espfan" /><FS id="cg-tease" /><FS id="cg-stadaerial" />
      <div style={{ position: 'absolute', inset: 0, background: `radial-gradient(ellipse at center, rgba(255,205,0,${(0.26 * beat).toFixed(3)}) 0%, transparent 60%)` }} />
      <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg, rgba(2,3,8,0.35) 0%, transparent 30%, transparent 60%, rgba(2,3,8,0.7) 100%)' }} />
      <Vignette strength={0.6} />
      {teaseLabelP > 0.01 && (
        <div style={{ position: 'absolute', left: 0, right: 0, bottom: 150, textAlign: 'center', zIndex: 23, opacity: teaseLabelP }}>
          <div style={{ display: 'inline-block', fontFamily: '"Inter",sans-serif', fontWeight: 800, fontSize: 28, color: '#e8c97a', letterSpacing: '0.22em', textShadow: '0 2px 18px rgba(0,0,0,0.85)' }}>WHAT GIVES THIS NATION ITS WILL?</div>
        </div>
      )}
      {lt > 18.0 && (
        <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 30, opacity: titleP, zIndex: 22 }}>
          <Kicker size={34}>Art Against Will</Kicker>
          <TitleReveal text="THE DERBY" start={19.8} size={112} color={MV.gold} />
        </div>
      )}
      <Letterbox />
    </div>
  );
}

function SceneTitle() {
  const { localTime: lt } = useSprite();
  const p1 = Easing.easeOutCubic(clamp(lt / 1.0, 0, 1));
  const p2 = Easing.easeOutBack(clamp((lt - 0.8) / 1.0, 0, 1));
  const p3 = Easing.easeOutCubic(clamp((lt - 1.7) / 0.9, 0, 1));
  return (
    <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg, #0a0f1c 0%, #0a1422 55%, #0a0f1c 100%)' }}>
      <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse at 50% 30%, rgba(92,191,235,0.14) 0%, transparent 55%)' }} />
      <AmbientParticles start={23.48} dur={9.5} count={30} />
      <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 40 }}>
        <div style={{ opacity: p1, transform: `translateY(${(1 - p1) * -30}px)` }}><Kicker>WorldCup26 Legends · Episode 66</Kicker></div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 64, opacity: clamp(p2, 0, 1), transform: `scale(${p2})` }}>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 18 }}><Waving><FlagURU w={220} /></Waving><BigTitle size={80} glow={URU}>URUGUAY</BigTitle></div>
          <BigTitle size={116} color={MV.gold}>VS</BigTitle>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 18 }}><Waving speed={1.9}><FlagESP w={220} /></Waving><BigTitle size={84} glow={ESP_GOLD}>SPAIN</BigTitle></div>
        </div>
        <div style={{ opacity: p3, fontFamily: '"Inter",sans-serif', fontWeight: 600, fontSize: 32, color: MV.muted, letterSpacing: '0.08em' }}>GROUP H · THE BALLON D'OR DERBY</div>
      </div>
      <Letterbox />
    </div>
  );
}

function SceneStadium() {
  const { localTime: lt } = useSprite();
  const stripP = Easing.easeOutCubic(clamp((lt - 1.2) / 0.9, 0, 1));
  return (
    <div style={{ position: 'absolute', inset: 0 }}>
      <FS id="stad-wide" />
      <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg, transparent 50%, rgba(2,3,8,0.8) 100%)' }} />
      <Vignette strength={0.4} />
      <div style={{ position: 'absolute', left: 0, right: 0, bottom: 120, display: 'flex', justifyContent: 'center', zIndex: 25, opacity: stripP, transform: `translateY(${(1 - stripP) * 30}px)` }}>
        <div style={{ display: 'flex', background: MV.panel, border: `1px solid ${MV.line}`, borderRadius: 16, overflow: 'hidden', backdropFilter: 'blur(6px)' }}>
          {[['GROUP H', 'THE DECIDER'], ['LA CELESTE', 'vs LA ROJA'], ['WILL', 'vs ART'], ['GARRA', 'vs TIKI-TAKA']].map(([v, l], i) => (
            <div key={i} style={{ padding: '22px 38px', borderLeft: i ? `1px solid ${MV.line}` : 'none', textAlign: 'center' }}>
              <div style={{ fontFamily: '"Inter",sans-serif', fontWeight: 900, fontSize: 32, color: MV.gold }}>{v}</div>
              <div style={{ fontFamily: '"Inter",sans-serif', fontWeight: 700, fontSize: 16, color: MV.muted, letterSpacing: '0.14em', marginTop: 5 }}>{l}</div>
            </div>
          ))}
        </div>
      </div>
      <Letterbox />
    </div>
  );
}

function SceneUruguay() {
  return (
    <div style={{ position: 'absolute', inset: 0 }}>
      <Sprite start={44} end={55.6}><div style={{ position: 'absolute', inset: 0 }}><FS id="uru-crowd" /><div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg, rgba(2,3,8,0.32) 0%, transparent 40%, rgba(2,3,8,0.55) 100%)' }} /><TeamBanner flag={<FlagURU w={66} />} label="LA CELESTE · URUGUAY" accent={URU} /></div></Sprite>
      <PlayerShowcase clipId="s-valverde" name="FEDERICO VALVERDE" role="EL HALCONCITO" accent={URU_DK} start={55.5} end={61.1} />
      <PlayerShowcase clipId="s-nunez" name="DARWIN NÚÑEZ" role="EL PANTERA" accent={URU} start={61.1} end={65.1} />
      <PlayerShowcase clipId="s-araujo" name="RONALD ARAÚJO" role="THE WALL" accent={URU_DK} start={65.1} end={68.1} />
      <PlayerShowcase clipId="s-arrascaeta" name="DE ARRASCAETA" role="THE ARTIST" accent={URU} start={68.1} end={73.6} />
      <PlayerShowcase clipId="s-bentancur" name="RODRIGO BENTANCUR" role="THE METRONOME" accent={URU_DK} start={73.6} end={79.5} />
      <Vignette strength={0.35} />
      <Letterbox />
    </div>
  );
}

function SceneSpain() {
  return (
    <div style={{ position: 'absolute', inset: 0 }}>
      <Sprite start={79.5} end={90.7}><div style={{ position: 'absolute', inset: 0 }}><FS id="esp-crowd" /><div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg, rgba(2,3,8,0.32) 0%, transparent 40%, rgba(2,3,8,0.55) 100%)' }} /><TeamBanner flag={<FlagESP w={66} />} label="LA ROJA · SPAIN" accent={ESP_GOLD} /></div></Sprite>
      <PlayerShowcase clipId="s-yamal" name="LAMINE YAMAL" role="THE TEENAGER" accent={ESP} start={90.6} end={95.2} />
      <PlayerShowcase clipId="s-rodri" name="RODRI" role="THE LIGHTHOUSE" accent={ESP_GOLD} start={95.2} end={98.2} />
      <PlayerShowcase clipId="s-pedri" name="PEDRI" role="THE ARTIST" accent={ESP} start={98.2} end={100.8} />
      <PlayerShowcase clipId="s-williams" name="NICO WILLIAMS" role="THE FLYER" accent={ESP_GOLD} start={100.8} end={103} />
      <Vignette strength={0.35} />
      <Letterbox />
    </div>
  );
}

function SceneDuel() {
  return (
    <div style={{ position: 'absolute', inset: 0 }}>
      <Sprite start={103} end={113}><div style={{ position: 'absolute', inset: 0 }}><FS id="duel-uru" /><div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(90deg, rgba(0,20,137,0.42), transparent 55%)' }} /><div style={{ position: 'absolute', left: 80, bottom: 130, fontFamily: '"Inter",sans-serif', fontWeight: 900, fontSize: 64, color: '#fff', textShadow: '0 4px 26px rgba(0,0,0,0.9)' }}>THE WILL<div style={{ fontSize: 27, fontWeight: 700, color: MV.gold, letterSpacing: '0.2em', marginTop: 8 }}>GARRA CHARRÚA</div></div></div></Sprite>
      <Sprite start={113} end={122.5}><div style={{ position: 'absolute', inset: 0 }}><FS id="duel-mid" /><div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.25)' }} /><div style={{ position: 'absolute', left: 0, right: 0, bottom: 70, textAlign: 'center', fontFamily: '"Inter",sans-serif', fontWeight: 900, fontSize: 58, color: '#fff', textShadow: '0 4px 26px rgba(0,0,0,0.9)' }}>A CENTURY-OLD ARGUMENT</div></div></Sprite>
      <Sprite start={122.5} end={132}><div style={{ position: 'absolute', inset: 0 }}><FS id="duel-esp" /><div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(270deg, rgba(198,11,30,0.42), transparent 55%)' }} /><div style={{ position: 'absolute', right: 80, bottom: 130, textAlign: 'right', fontFamily: '"Inter",sans-serif', fontWeight: 900, fontSize: 64, color: '#fff', textShadow: '0 4px 26px rgba(0,0,0,0.9)' }}>THE ART<div style={{ fontSize: 27, fontWeight: 700, color: MV.gold, letterSpacing: '0.2em', marginTop: 8 }}>TIKI-TAKA BEAUTY</div></div></div></Sprite>
      <Letterbox />
    </div>
  );
}

function SceneDrama() {
  const S = 132.00;
  return (
    <div style={{ position: 'absolute', inset: 0 }}>
      <FS id="dr-esp-attack" /><FS id="dr-esp-goal" /><FS id="dr-uru-equalize" /><FS id="dr-yamal-araujo" /><FS id="dr-rochet-save" /><FS id="dr-uru-winner" /><FS id="dr-celeb" />
      <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg, rgba(2,3,8,0.28) 0%, transparent 24%, transparent 70%, rgba(2,3,8,0.6) 100%)' }} />
      {/* Spain strike (art), Uruguay equalize (1-1), Rochet saves Yamal's 78', then Uruguay's late winner (2-1) */}
      <GoalFlash at={S + 16.5} />
      <GoalFlash at={S + 27.5} />
      <Sprite start={162.0} end={189.0}><ScoreBug start={S + 30.5} uru={1} esp={1} minute="60'" badge="OUR PREDICTION" /></Sprite>
      <GoalFlash at={S + 59.3} />
      <Sprite start={191.0} end={203.32}><ScoreBug start={S + 59.8} uru={2} esp={1} minute="88'" badge="OUR PREDICTION" note="VALVERDE" /></Sprite>
      <Sprite start={198.5} end={203.32}><PredictionCard start={S + 67.0} /></Sprite>
      <Vignette strength={0.34} />
      <Letterbox />
    </div>
  );
}

// ════════════════ RULE #18 — PREMIUM PREDICTION CARD (redesigned) ════════════════
function PredictionCard({ start }) {
  const t = useTime(); const local = t - start;
  const p = Easing.easeOutCubic(clamp(local / 1.0, 0, 1));
  const stampP = Easing.easeOutBack(clamp((local - 1.0) / 0.6, 0, 1));
  const sheenX = ((local * 26) % 160) - 30;                 // sweeping gloss highlight
  const Badge = ({ flag, name, accent }) => (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 14 }}>
      <div style={{ padding: 9, borderRadius: '50%', background: `conic-gradient(${accent}, #ffffffaa, ${accent}, #ffffff55, ${accent})`, boxShadow: `0 10px 34px rgba(0,0,0,0.55), 0 0 26px ${accent}66` }}>
        <div style={{ width: 124, height: 124, borderRadius: '50%', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#070b14', border: '3px solid rgba(255,255,255,0.9)' }}>{flag}</div>
      </div>
      <span style={{ fontFamily: '"Inter",sans-serif', fontWeight: 900, fontSize: 28, color: '#fff', letterSpacing: '0.03em' }}>{name}</span>
    </div>
  );
  return (
    <div style={{ position: 'absolute', inset: 0, zIndex: 28, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(2,3,6,0.6)', opacity: p }}>
      <div style={{ width: 1010, borderRadius: 28, overflow: 'hidden', transform: `scale(${0.92 + 0.08 * p})`, boxShadow: '0 36px 130px rgba(0,0,0,0.8)', position: 'relative', border: '2px solid rgba(255,210,74,0.55)' }}>
        {/* split team-colour side panels behind everything */}
        <div style={{ position: 'absolute', inset: 0, background: `linear-gradient(105deg, ${URU}28 0%, #070b14 38%, #070b14 62%, ${ESP}28 100%)` }} />
        {/* sweeping gloss sheen */}
        <div style={{ position: 'absolute', top: 0, bottom: 0, left: `${sheenX}%`, width: '22%', background: 'linear-gradient(105deg, transparent, rgba(255,255,255,0.10), transparent)', transform: 'skewX(-18deg)', pointerEvents: 'none', zIndex: 5 }} />
        {/* brand ribbon */}
        <div style={{ position: 'relative', zIndex: 2, background: `linear-gradient(100deg, ${URU} 0%, #11151f 50%, ${ESP} 100%)`, padding: '13px 0', textAlign: 'center' }}>
          <span style={{ fontFamily: '"Inter",sans-serif', fontWeight: 900, fontSize: 17, letterSpacing: '0.34em', color: '#fff' }}>WORLDCUP26 LEGENDS · OUR PREDICTION · NOT PLAYED</span>
        </div>
        <div style={{ position: 'relative', zIndex: 2, padding: '40px 70px 30px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 50 }}>
            <Badge flag={<FlagURU w={104} />} name="URUGUAY" accent={URU} />
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, fontFamily: '"Inter",sans-serif', fontWeight: 900, fontSize: 132, color: '#fff', lineHeight: 1 }}>
                <span style={{ textShadow: `0 0 36px ${URU}99` }}>2</span>
                <span style={{ color: MV.gold, fontSize: 64, transform: 'translateY(-6px)' }}>—</span>
                <span style={{ textShadow: `0 0 36px ${ESP}99` }}>1</span>
              </div>
              <div style={{ fontFamily: '"Inter",sans-serif', fontWeight: 800, fontSize: 17, color: MV.muted, letterSpacing: '0.34em', marginTop: 4 }}>FULL-TIME</div>
            </div>
            <Badge flag={<FlagESP w={104} />} name="SPAIN" accent={ESP_GOLD} />
          </div>
          <div style={{ display: 'flex', justifyContent: 'center', gap: 12, marginTop: 26, paddingTop: 22, borderTop: '1px solid rgba(255,255,255,0.12)' }}>
            <span style={{ fontFamily: '"Inter",sans-serif', fontWeight: 800, fontSize: 21, color: '#bfe6fb', background: 'rgba(92,191,235,0.14)', border: '1px solid rgba(92,191,235,0.4)', borderRadius: 999, padding: '7px 18px' }}>⚽ 50' NÚÑEZ</span>
            <span style={{ fontFamily: '"Inter",sans-serif', fontWeight: 800, fontSize: 21, color: '#bfe6fb', background: 'rgba(92,191,235,0.14)', border: '1px solid rgba(92,191,235,0.4)', borderRadius: 999, padding: '7px 18px' }}>⚽ 88' VALVERDE</span>
            <span style={{ fontFamily: '"Inter",sans-serif', fontWeight: 800, fontSize: 21, color: '#ffd4d8', background: 'rgba(198,11,30,0.16)', border: '1px solid rgba(198,11,30,0.45)', borderRadius: 999, padding: '7px 18px' }}>⚽ 30' SPAIN · 🧤 78' ROCHET</span>
          </div>
          <div style={{ textAlign: 'center', marginTop: 22, fontFamily: '"Inter",sans-serif', fontWeight: 900, fontSize: 23, color: MV.gold, letterSpacing: '0.16em' }}>★ THE WILL OUTLASTED THE ART ★</div>
          <div style={{ textAlign: 'center', marginTop: 6, fontFamily: '"Inter",sans-serif', fontWeight: 700, fontSize: 16, color: MV.muted, letterSpacing: '0.2em' }}>worldcup26.world</div>
        </div>
        {stampP > 0 && <div style={{ position: 'absolute', top: 70, right: -6, zIndex: 6, transform: `rotate(-12deg) scale(${stampP})`, border: `4px solid ${MV.gold}`, color: MV.gold, borderRadius: 12, padding: '8px 22px', fontFamily: '"Inter",sans-serif', fontWeight: 900, fontSize: 24, letterSpacing: '0.14em', background: 'rgba(7,9,15,0.92)' }}>OUR STORY</div>}
      </div>
    </div>
  );
}

function SceneVerdict() {
  const { localTime: lt } = useSprite(); const S = 203.32;
  const discP = Easing.easeOutCubic(clamp(lt / 1.0, 0, 1));
  const discFade = lt > 9 ? clamp((11 - lt) / 1.0, 0, 1) : 1;
  return (
    <div style={{ position: 'absolute', inset: 0 }}>
      <FS id="vd-respect" />
      <div style={{ position: 'absolute', inset: 0, background: 'rgba(6,10,18,0.5)' }} />
      <Sprite start={203.32} end={214.32}>
        <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 26, opacity: discP * discFade }}>
          <div style={{ background: MV.panel, border: `1px solid ${MV.line}`, borderRadius: 22, padding: '42px 76px', textAlign: 'center', backdropFilter: 'blur(6px)' }}>
            <Kicker size={26} color={MV.gold}>Our Prediction</Kicker>
            <div style={{ fontFamily: '"Inter",sans-serif', fontWeight: 900, fontSize: 52, color: '#fff', letterSpacing: '0.04em', marginTop: 18 }}>THE REAL MATCH IS YOURS</div>
          </div>
        </div>
      </Sprite>
      <div style={{ position: 'absolute', inset: 0, zIndex: 24, background: `linear-gradient(160deg, #0a0f1c 0%, #05060c 100%)`, opacity: clamp((lt - 10.5) / 1.0, 0, 1) }} />
      <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 25 }}>
        <div style={{ background: MV.panel, border: `1px solid ${MV.line}`, borderRadius: 24, padding: '48px 80px', minWidth: 880, backdropFilter: 'blur(6px)', opacity: clamp((lt - 11) / 1.0, 0, 1) }}>
          <Kicker size={26}>Group H · Our Prediction</Kicker>
          <div style={{ marginTop: 24 }}>
            <StatLine start={S + 11.5} delay={0.0} label="URUGUAY" value="LA CELESTE" accent={URU} />
            <StatLine start={S + 11.5} delay={0.25} label="SPAIN" value="LA ROJA" accent={ESP_GOLD} />
            <StatLine start={S + 11.5} delay={0.5} label="OUR PREDICTION" value="URU 2 — 1 ESP" accent="#fff" />
            <StatLine start={S + 11.5} delay={0.75} label="78' ROCHET SAVE · 88' VALVERDE" value="THE WILL OUTLASTED THE ART" accent={MV.gold} />
          </div>
        </div>
      </div>
      <Vignette strength={0.45} />
      <Letterbox />
    </div>
  );
}

function SceneEngage() {
  const { localTime: lt } = useSprite();
  const headP = Easing.easeOutCubic(clamp(lt / 0.9, 0, 1));
  const cards = [
    { label: 'COMMENT URUGUAY', sub: "THE WILL", flag: <FlagURU w={78} />, accent: URU },
    { label: 'COMMENT ESPAÑA', sub: "THE ART", flag: <FlagESP w={78} />, accent: ESP_GOLD },
  ];
  return (
    <div style={{ position: 'absolute', inset: 0 }}>
      <FS id="en-crowd" />
      <div style={{ position: 'absolute', inset: 0, background: 'rgba(6,10,18,0.62)' }} />
      <div style={{ position: 'absolute', top: 140, left: 0, right: 0, textAlign: 'center', zIndex: 25, opacity: headP }}><Kicker size={30}>Do You Agree?</Kicker></div>
      <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 56, zIndex: 25 }}>
        {cards.map((c, i) => {
          const cp = Easing.easeOutBack(clamp((lt - 0.8 - i * 0.4) / 0.7, 0, 1));
          return (
            <div key={i} style={{ transform: `translateY(${(1 - cp) * 60}px) scale(${0.85 + 0.15 * cp})`, opacity: clamp(cp, 0, 1), background: MV.panel, border: `1px solid ${MV.line}`, borderRadius: 22, padding: '38px 54px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 18, minWidth: 360, boxShadow: '0 24px 70px rgba(0,0,0,0.5)', borderTop: `5px solid ${c.accent}` }}>
              {c.flag}
              <div style={{ fontFamily: '"Inter",sans-serif', fontWeight: 900, fontSize: 28, color: '#fff' }}>{c.label}</div>
              <div style={{ fontFamily: '"Inter",sans-serif', fontWeight: 700, fontSize: 21, color: MV.muted, letterSpacing: '0.16em' }}>{c.sub}</div>
            </div>
          );
        })}
      </div>
      <Vignette strength={0.4} />
      <Letterbox />
    </div>
  );
}

// ════════ RULE #16 + #17 — STORY-WOVEN, ANIMATED HOLO COLLECTIBLE REVEAL ════════
function SceneMystery() {
  const { localTime: lt } = useSprite(); const S = 255.00;
  const inP = Easing.easeOutCubic(clamp((lt - 0.6) / 1.4, 0, 1));
  const teaseP = clamp((lt - 1.0) / 0.8, 0, 1) * clamp((4.0 - lt) / 0.6, 0, 1);
  const teasePulse = 0.5 + 0.5 * Math.sin(lt * 4.2);
  const cardP = Easing.easeOutCubic(clamp((lt - 4.2) / 1.0, 0, 1));
  const flipDeg = (1 - cardP) * 88;
  const settle = clamp((lt - 5.4) / 1.0, 0, 1);
  const burst = clamp((lt - 5.2) / 0.6, 0, 1);
  const tiltX = Math.sin(lt * 0.9) * 7 * settle;             // continuous 3D tilt
  const floatY = Math.sin(lt * 1.05) * 5 * settle;
  const pulse = 0.5 + 0.5 * Math.sin(lt * 3.4);
  const ring = clamp((lt - 5.2) / 1.2, 0, 1);
  const sheenY = ((lt * 34) % 150) - 25;                     // holo shine-sweep across foil
  const unlockP = Easing.easeOutBack(clamp((lt - 6.2) / 0.7, 0, 1));
  const stripP = Easing.easeOutCubic(clamp((lt - 12.5) / 1.2, 0, 1));   // collection strip slides up
  const recent = ['legend-061', 'legend-062', 'legend-063', 'legend-064', 'legend-065'];
  return (
    <div style={{ position: 'absolute', inset: 0 }}>
      <ClipSprite id="my-candombe" fit="cover" style={{ filter: 'brightness(0.62) saturate(1.12)' }} />
      <div style={{ position: 'absolute', inset: 0, background: 'rgba(4,6,12,0.62)' }} />
      <AmbientParticles start={S} dur={26} count={50} color="252,228,150" maxR={3.5} zIndex={22} />
      <div style={{ position: 'absolute', top: 56, left: 0, right: 0, textAlign: 'center', zIndex: 25, opacity: inP }}><Kicker size={26} color="#e8c97a">The Will Made Sound · Legend No. 066</Kicker></div>
      {teaseP > 0.01 && (
        <div style={{ position: 'absolute', left: '50%', top: '46%', zIndex: 24, pointerEvents: 'none', transform: `translate(-50%,-50%) scale(${0.8 + teasePulse * 0.12})`, opacity: teaseP, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 18 }}>
          <div style={{ width: 200, height: 200, borderRadius: '50%', background: 'radial-gradient(circle at 38% 32%, rgba(255,233,160,0.95), rgba(201,148,46,0.5) 70%)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: `0 0 ${50 + teasePulse * 40}px rgba(245,208,22,0.7)` }}><span style={{ fontFamily: '"Inter",sans-serif', fontWeight: 900, fontSize: 130, color: '#2a1c04' }}>?</span></div>
          <div style={{ fontFamily: '"Inter",sans-serif', fontWeight: 900, fontSize: 30, color: '#ffe9a0', letterSpacing: '0.2em', textShadow: '0 2px 18px rgba(0,0,0,0.8)' }}>THE HEARTBEAT OF A NATION</div>
        </div>
      )}
      {ring > 0 && ring < 1 && <div style={{ position: 'absolute', left: '50%', top: '46%', zIndex: 23, pointerEvents: 'none', width: 740, height: 740, transform: `translate(-50%,-50%) scale(${0.3 + ring * 1.5})`, opacity: (1 - ring) * 0.8, borderRadius: '50%', border: '3px solid rgba(255,225,150,0.7)', boxShadow: '0 0 60px rgba(245,208,22,0.5)' }} />}
      {burst > 0 && burst < 1 && <div style={{ position: 'absolute', left: '50%', top: '46%', zIndex: 24, pointerEvents: 'none', width: 980, height: 980, transform: `translate(-50%,-50%) scale(${0.4 + burst * 1.3})`, opacity: (1 - burst) * 0.9, background: 'radial-gradient(circle, rgba(255,233,160,0.55) 0%, rgba(245,208,22,0.18) 30%, transparent 62%)', borderRadius: '50%' }} />}
      {/* the living holo card */}
      {cardP > 0 && (
        <div style={{ position: 'absolute', left: '50%', top: '44%', zIndex: 25, opacity: clamp(cardP, 0, 1), perspective: 1700, transform: `translate(-50%,-50%) translateY(${(1 - cardP) * 40 + floatY}px) scale(${0.86 + 0.1 * cardP})` }}>
          {/* UNLOCK + rarity */}
          {unlockP > 0 && (
            <div style={{ position: 'absolute', top: -64, left: '50%', transform: `translateX(-50%) scale(${unlockP})`, zIndex: 28, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 5, whiteSpace: 'nowrap' }}>
              <div style={{ fontFamily: '"Inter",sans-serif', fontWeight: 900, fontSize: 30, letterSpacing: '0.26em', color: '#ffe9a0', textShadow: '0 2px 16px rgba(0,0,0,0.9)' }}>★ LEGEND UNLOCKED ★</div>
              <div style={{ fontFamily: '"Inter",sans-serif', fontWeight: 800, fontSize: 17, letterSpacing: '0.3em', color: '#f5d016' }}>Nº 066 · ✦✦✦ ULTRA RARE</div>
            </div>
          )}
          <div style={{ position: 'relative', transformStyle: 'preserve-3d', transform: `rotateY(${flipDeg + tiltX}deg)`, borderRadius: 20, overflow: 'hidden', boxShadow: `0 30px 120px rgba(0,0,0,0.8), 0 0 ${50 + settle * 50}px rgba(245,208,22,${0.22 + settle * 0.33})` }}>
            <img data-seq="" src="assets/legend-066-portrait.png" alt="" style={{ height: 760, width: 'auto', display: 'block' }} />
            {/* holographic shine-sweep bar */}
            <div style={{ position: 'absolute', left: 0, right: 0, top: `${sheenY}%`, height: '26%', background: 'linear-gradient(180deg, transparent, rgba(255,255,255,0.16), rgba(180,235,255,0.10), transparent)', pointerEvents: 'none', mixBlendMode: 'screen' }} />
          </div>
        </div>
      )}
      {/* COLLECTION STRIP (rule #17 addiction driver) */}
      {stripP > 0.02 && (
        <div style={{ position: 'absolute', left: '50%', bottom: 120, zIndex: 26, transform: `translateX(-50%) translateY(${(1 - stripP) * 30}px)`, opacity: stripP, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}>
          <div style={{ display: 'flex', alignItems: 'flex-end', gap: 12 }}>
            {recent.map((c, i) => (
              <div key={i} style={{ width: 78, height: 110, borderRadius: 8, overflow: 'hidden', border: '1px solid rgba(255,255,255,0.25)', boxShadow: '0 6px 18px rgba(0,0,0,0.5)', opacity: 0.62, filter: 'saturate(0.9)' }}>
                <img data-seq="" src={`assets/${c}-portrait.png`} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              </div>
            ))}
            {/* the NEW one, highlighted */}
            <div style={{ width: 96, height: 134, borderRadius: 9, overflow: 'hidden', border: `2px solid ${MV.gold}`, boxShadow: `0 8px 26px rgba(0,0,0,0.6), 0 0 ${16 + pulse * 14}px rgba(245,208,22,0.7)`, transform: `scale(${1 + pulse * 0.03})` }}>
              <img data-seq="" src="assets/legend-066-portrait.png" alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            </div>
          </div>
          <div style={{ fontFamily: '"Inter",sans-serif', fontWeight: 900, fontSize: 22, color: '#fff', letterSpacing: '0.14em' }}>LEGEND <span style={{ color: MV.gold }}>066</span> OF 66 · <span style={{ color: MV.gold }}>COLLECT THEM ALL</span></div>
        </div>
      )}
      {/* sign-up CTA */}
      {settle > 0.2 && (
        <div style={{ position: 'absolute', left: '50%', bottom: 46, zIndex: 26, transform: 'translateX(-50%)', display: 'flex', alignItems: 'center', gap: 16, opacity: settle }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 10, background: 'rgba(255,210,74,0.16)', border: '1px solid rgba(255,210,74,0.6)', borderRadius: 999, padding: '11px 24px' }}><span style={{ fontSize: 20 }}>✦</span><span style={{ fontFamily: '"Inter",sans-serif', fontWeight: 800, fontSize: 21, color: MV.gold, letterSpacing: '0.05em' }}>worldcup26.world</span></div>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 12, background: 'linear-gradient(100deg, #16a34a, #0e8a3c)', borderRadius: 999, padding: '13px 30px', transform: `scale(${1 + pulse * 0.04})`, boxShadow: `0 8px 30px rgba(22,163,74,${0.35 + pulse * 0.4})` }}><span style={{ fontSize: 20 }}>⚡</span><span style={{ fontFamily: '"Inter",sans-serif', fontWeight: 900, fontSize: 22, color: '#fff', letterSpacing: '0.03em' }}>SIGN UP FREE — CLAIM LEGEND 066</span></div>
        </div>
      )}
      <Vignette strength={0.5} />
      <Letterbox />
    </div>
  );
}

function SceneApp() {
  const { localTime: lt } = useSprite();
  const inP = Easing.easeOutCubic(clamp(lt / 1.0, 0, 1));
  const btnP = Easing.easeOutBack(clamp((lt - 2.4) / 0.7, 0, 1));
  const pulse = 0.5 + 0.5 * Math.sin(lt * 3.4);
  const cards = [
    { name: 'URUGUAY', flag: <FlagURU w={84} /> },
    { name: 'SPAIN', flag: <FlagESP w={84} /> },
    { name: 'BRAZIL', flag: <div style={{ width: 84, height: 56, borderRadius: 6, background: '#009b3a', position: 'relative', overflow: 'hidden' }}><div style={{ position: 'absolute', left: '50%', top: '50%', width: 44, height: 30, background: '#ffdf00', transform: 'translate(-50%,-50%) rotate(45deg)' }} /><div style={{ position: 'absolute', left: '50%', top: '50%', width: 19, height: 19, borderRadius: '50%', background: '#002776', transform: 'translate(-50%,-50%)' }} /></div> },
  ];
  return (
    <div style={{ position: 'absolute', inset: 0, background: `linear-gradient(160deg, #0a1422 0%, #07090f 70%)` }}>
      <div style={{ position: 'absolute', inset: 0, background: `radial-gradient(ellipse at 50% 20%, rgba(40,110,170,0.4) 0%, rgba(7,9,15,0.92) 62%)` }} />
      <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 42, opacity: inP }}>
        <Kicker color="#9ecbf0" size={30}>The Prediction Game</Kicker>
        <BigTitle size={100} color="#fff" glow={URU}>worldcup26.world</BigTitle>
        <Kicker color="#cfe6f6" size={30}>Sign Up · Pick 3 Of 48</Kicker>
        <div style={{ display: 'flex', gap: 34, marginTop: 10 }}>
          {cards.map((c, i) => {
            const cp = Easing.easeOutBack(clamp((lt - 1.2 - i * 0.35) / 0.7, 0, 1));
            return (
              <div key={i} style={{ transform: `translateY(${(1 - cp) * 60}px) scale(${0.8 + 0.2 * cp})`, opacity: clamp(cp, 0, 1), background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.18)', borderRadius: 22, padding: '30px 44px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16, minWidth: 280, boxShadow: '0 24px 70px rgba(0,0,0,0.45)' }}>
                {c.flag}<div style={{ fontFamily: '"Inter",sans-serif', fontWeight: 900, fontSize: 25, color: '#fff' }}>{c.name}</div>
                <div style={{ fontFamily: '"Inter",sans-serif', fontWeight: 800, fontSize: 21, color: MV.gold }}>EVERY GOAL SCORES</div>
              </div>
            );
          })}
        </div>
        <div style={{ transform: `translateY(${(1 - btnP) * 40}px) scale(${(0.8 + 0.2 * btnP) * (1 + pulse * 0.03)})`, opacity: clamp(btnP, 0, 1), marginTop: 4, display: 'flex', alignItems: 'center', gap: 16, background: 'linear-gradient(100deg, #16a34a, #0c8f3a)', borderRadius: 999, padding: '18px 50px', boxShadow: `0 14px 50px rgba(22,163,74,${0.4 + pulse * 0.45})` }}><span style={{ fontSize: 34 }}>⚡</span><span style={{ fontFamily: '"Inter",sans-serif', fontWeight: 900, fontSize: 38, color: '#fff' }}>CREATE YOUR FREE ACCOUNT</span></div>
        <div style={{ fontFamily: '"Inter",sans-serif', fontWeight: 800, fontSize: 27, color: MV.gold, opacity: clamp(btnP, 0, 1) }}>Unlock Legend 066 the moment you sign up · free · no prizes</div>
      </div>
      <Letterbox />
    </div>
  );
}

function SceneCTA() {
  const { localTime: lt } = useSprite(); const S = 303.05;
  const inP = Easing.easeOutCubic(clamp(lt / 0.8, 0, 1));
  return (
    <div style={{ position: 'absolute', inset: 0 }}>
      <FS id="cta-celeb" />
      <AmbientParticles start={305.29} dur={6} count={28} />
      <div style={{ position: 'absolute', inset: 0, zIndex: 23, background: 'radial-gradient(ellipse at 50% 35%, rgba(7,9,15,0.35) 0%, rgba(7,9,15,0.9) 75%)' }} />
      <div style={{ position: 'absolute', top: 190, left: 0, right: 0, textAlign: 'center', zIndex: 25, opacity: inP }}>
        <Kicker size={30}>WorldCup26 Legends</Kicker>
        <div style={{ marginTop: 22 }}><TitleReveal text="JOIN THE LEGENDS" start={S + 0.5} size={88} color="#fff" /></div>
      </div>
      <div style={{ position: 'absolute', inset: 0, zIndex: 26 }}>
        <CtaButton start={S} delay={1.2} label="SUBSCRIBE" icon="🔔" accent="#16a34a" x={500} />
        <CtaButton start={S} delay={1.6} label="LIKE" icon="👍" accent="#1e3a8a" x={960} />
        <CtaButton start={S} delay={2.0} label="SHARE" icon="📣" accent="#106b4f" x={1400} />
      </div>
      <Sprite start={307.65} end={318.05}><NextMatchTease start={S + 4.6} /></Sprite>
      <Letterbox />
    </div>
  );
}
function NextMatchTease({ start }) {
  const t = useTime(); const p = Easing.easeOutCubic(clamp((t - start) / 0.8, 0, 1));
  return (
    <div style={{ position: 'absolute', left: 0, right: 0, bottom: 140, display: 'flex', justifyContent: 'center', zIndex: 26, opacity: p, transform: `translateY(${(1 - p) * 24}px)` }}>
      <div style={{ background: MV.panel, border: `1px solid ${MV.line}`, borderRadius: 999, padding: '18px 50px', display: 'flex', alignItems: 'center', gap: 20 }}>
        <span style={{ fontFamily: '"Inter",sans-serif', fontWeight: 700, fontSize: 25, color: MV.muted, letterSpacing: '0.14em' }}>NEXT EPISODE</span>
        <span style={{ fontFamily: '"Inter",sans-serif', fontWeight: 900, fontSize: 29, color: MV.gold }}>⚡ EP67 · COLLECT LEGEND 066 · worldcup26.world</span>
      </div>
    </div>
  );
}
