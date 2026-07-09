// match-scenes.jsx — Ep65 Cape Verde vs Saudi Arabia — ANIMATION-FIRST + NO-REPEAT (318s).
// "The Believers" · Group H. OUR PREDICTION CPV 1–0 KSA.
// Rule #11: every clip used EXACTLY ONCE. Rule #15: no banned hype wording.
// Rule #16: the Legend (The Morna Singer) is TEASED in the cold open (cg-tease +
// riddle "WHO GIVES THESE ISLANDS THEIR VOICE?"), echoed mid-episode, and the reveal
// STATES the spine↔legend connection — the morna is "the song that taught a scattered
// people never to stop believing." Cape Verde head home a set piece ~40'; Mendes'
// 63' free kick kisses the post; 1-0 holds.

const CPV = '#003893', CPV_RED = '#cf2027', KSA = '#006c35', KSA_LT = '#3fbf77';
const HERO = { filter: 'brightness(1.05) saturate(1.14) contrast(1.05)' };

function FlagCPV({ w = 120 }) {
  const h = w * 2 / 3;
  const stars = [];
  for (let i = 0; i < 10; i++) { const a = (i / 10) * Math.PI * 2 - Math.PI / 2; stars.push(<div key={i} style={{ position: 'absolute', left: `${50 + Math.cos(a) * 20}%`, top: `${52 + Math.sin(a) * 28}%`, transform: 'translate(-50%,-50%)', color: '#f7d116', fontSize: h * 0.11, lineHeight: 1 }}>★</div>); }
  return (
    <div style={{ width: w, height: h, borderRadius: w * 0.05, position: 'relative', overflow: 'hidden', background: '#003893', boxShadow: '0 6px 18px rgba(0,0,0,0.45)' }}>
      <div style={{ position: 'absolute', left: 0, right: 0, top: '50%', height: '8%', background: '#fff' }} />
      <div style={{ position: 'absolute', left: 0, right: 0, top: '58%', height: '8%', background: '#cf2027' }} />
      <div style={{ position: 'absolute', left: 0, right: 0, top: '66%', height: '8%', background: '#fff' }} />
      {stars}
    </div>
  );
}
function FlagKSA({ w = 120 }) {
  const h = w * 2 / 3;
  return (
    <div style={{ width: w, height: h, borderRadius: w * 0.05, position: 'relative', overflow: 'hidden', background: '#006c35', boxShadow: '0 6px 18px rgba(0,0,0,0.45)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ color: '#fff', fontSize: h * 0.18, fontWeight: 700, whiteSpace: 'nowrap', letterSpacing: '0.02em' }}>لا إله إلا الله</div>
      <div style={{ width: '64%', height: h * 0.05, background: '#fff', borderRadius: 2, marginTop: h * 0.06 }} />
    </div>
  );
}

function ScoreBug({ start, cpv = 0, ksa = 0, minute, badge = "OUR PREDICTION", note }) {
  const t = useTime(); const local = t - start; if (local < 0) return null;
  const inP = Easing.easeOutBack(clamp(local / 0.7, 0, 1));
  const cell = { fontFamily: '"Inter",sans-serif', fontWeight: 900, fontSize: 34, color: '#fff', padding: '10px 18px' };
  return (
    <div style={{ position: 'absolute', top: 92, left: '50%', zIndex: 30, transform: `translateX(-50%) scale(${inP})`, opacity: clamp(inP, 0, 1), display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
      <div style={{ display: 'flex', alignItems: 'center', background: MV.panel, border: `1px solid ${MV.line}`, borderRadius: 14, boxShadow: '0 10px 36px rgba(0,0,0,0.6)', overflow: 'hidden' }}>
        <div style={{ ...cell, background: CPV }}>CPV</div>
        <div style={{ ...cell, fontSize: 38, color: MV.gold }}>{cpv} — {ksa}</div>
        <div style={{ ...cell, background: KSA }}>KSA</div>
        {minute && <div style={{ ...cell, fontSize: 26, color: MV.muted, borderLeft: `1px solid ${MV.line}` }}>{minute}</div>}
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <div style={{ fontFamily: '"Inter",sans-serif', fontWeight: 800, fontSize: 16, color: MV.gold, letterSpacing: '0.22em', background: 'rgba(255,210,74,0.14)', border: '1px solid rgba(255,210,74,0.5)', borderRadius: 999, padding: '4px 16px' }}>{badge}</div>
        {note && <div style={{ fontFamily: '"Inter",sans-serif', fontWeight: 900, fontSize: 16, color: '#fff', letterSpacing: '0.18em', background: CPV, border: `1px solid ${CPV}`, borderRadius: 999, padding: '4px 16px' }}>{note}</div>}
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
      <FS id="cg-cpvfan" /><FS id="cg-ksafan" /><FS id="cg-tease" /><FS id="cg-stadaerial" />
      <div style={{ position: 'absolute', inset: 0, background: `radial-gradient(ellipse at center, rgba(255,205,0,${(0.26 * beat).toFixed(3)}) 0%, transparent 60%)` }} />
      <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg, rgba(2,3,8,0.35) 0%, transparent 30%, transparent 60%, rgba(2,3,8,0.7) 100%)' }} />
      <Vignette strength={0.6} />
      {teaseLabelP > 0.01 && (
        <div style={{ position: 'absolute', left: 0, right: 0, bottom: 150, textAlign: 'center', zIndex: 23, opacity: teaseLabelP }}>
          <div style={{ display: 'inline-block', fontFamily: '"Inter",sans-serif', fontWeight: 800, fontSize: 28, color: '#e8c97a', letterSpacing: '0.22em', textShadow: '0 2px 18px rgba(0,0,0,0.85)' }}>WHO GIVES THESE ISLANDS THEIR VOICE?</div>
        </div>
      )}
      {lt > 18.0 && (
        <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 30, opacity: titleP, zIndex: 22 }}>
          <Kicker size={34}>The Match For The Romantics</Kicker>
          <TitleReveal text="THE BELIEVERS" start={19.8} size={104} color={MV.gold} />
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
    <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg, #0a0f1c 0%, #0a1020 55%, #0a0f1c 100%)' }}>
      <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse at 50% 30%, rgba(0,56,147,0.16) 0%, transparent 55%)' }} />
      <AmbientParticles start={23.48} dur={9.5} count={30} />
      <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 40 }}>
        <div style={{ opacity: p1, transform: `translateY(${(1 - p1) * -30}px)` }}><Kicker>WorldCup26 Legends · Episode 65</Kicker></div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 56, opacity: clamp(p2, 0, 1), transform: `scale(${p2})` }}>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 18 }}><Waving><FlagCPV w={220} /></Waving><BigTitle size={66} glow="#5b8dff">CAPE VERDE</BigTitle></div>
          <BigTitle size={116} color={MV.gold}>VS</BigTitle>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 18 }}><Waving speed={1.9}><FlagKSA w={220} /></Waving><BigTitle size={64} glow={KSA_LT}>SAUDI ARABIA</BigTitle></div>
        </div>
        <div style={{ opacity: p3, fontFamily: '"Inter",sans-serif', fontWeight: 600, fontSize: 32, color: MV.muted, letterSpacing: '0.08em' }}>GROUP H · THE BELIEVERS</div>
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
          {[['GROUP H', 'FIRST MEETING'], ['BLUE SHARKS', 'vs FALCONS'], ['BELIEF', 'vs PRECISION'], ['REFUSE', 'TO KNEEL']].map(([v, l], i) => (
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

function SceneCapeVerde() {
  return (
    <div style={{ position: 'absolute', inset: 0 }}>
      <Sprite start={44} end={55.6}><div style={{ position: 'absolute', inset: 0 }}><FS id="cpv-crowd" /><div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg, rgba(2,3,8,0.32) 0%, transparent 40%, rgba(2,3,8,0.55) 100%)' }} /><TeamBanner flag={<FlagCPV w={66} />} label="BLUE SHARKS · CAPE VERDE" accent="#5b8dff" /></div></Sprite>
      <PlayerShowcase clipId="s-mendes" name="RYAN MENDES" role="THE WAND" accent={CPV} start={55.5} end={61.1} />
      <PlayerShowcase clipId="s-rodrigues" name="GARRY RODRIGUES" role="THE WINGER" accent={CPV_RED} start={61.1} end={65.1} />
      <PlayerShowcase clipId="s-monteiro" name="JAMIRO MONTEIRO" role="THE ENGINE" accent={CPV} start={65.1} end={68.1} />
      <PlayerShowcase clipId="s-lopes" name="ROBERTO LOPES" role="THE WALL" accent={CPV} start={68.1} end={73.6} />
      <PlayerShowcase clipId="s-bebe" name="BEBÉ" role="THE STRIKER" accent={CPV_RED} start={73.6} end={79.5} />
      <Vignette strength={0.35} />
      <Letterbox />
    </div>
  );
}

function SceneSaudi() {
  return (
    <div style={{ position: 'absolute', inset: 0 }}>
      <Sprite start={79.5} end={90.7}><div style={{ position: 'absolute', inset: 0 }}><FS id="ksa-crowd" /><div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg, rgba(2,3,8,0.32) 0%, transparent 40%, rgba(2,3,8,0.55) 100%)' }} /><TeamBanner flag={<FlagKSA w={66} />} label="GREEN FALCONS · SAUDI ARABIA" accent={KSA_LT} /></div></Sprite>
      <PlayerShowcase clipId="s-aldawsari" name="SALEM AL-DAWSARI" role="THE FALCONER" accent={KSA} start={90.6} end={95.2} />
      <PlayerShowcase clipId="s-buraikan" name="FIRAS AL-BURAIKAN" role="THE EDGE" accent={KSA_LT} start={95.2} end={98.2} />
      <PlayerShowcase clipId="s-owais" name="MOHAMMED AL-OWAIS" role="THE KEEPER" accent={KSA} start={98.2} end={100.8} />
      <PlayerShowcase clipId="s-faraj" name="SALMAN AL-FARAJ" role="THE CONDUCTOR" accent={KSA_LT} start={100.8} end={103} />
      <Vignette strength={0.35} />
      <Letterbox />
    </div>
  );
}

function SceneDuel() {
  return (
    <div style={{ position: 'absolute', inset: 0 }}>
      <Sprite start={103} end={113}><div style={{ position: 'absolute', inset: 0 }}><FS id="duel-cpv" /><div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(90deg, rgba(0,56,147,0.42), transparent 55%)' }} /><div style={{ position: 'absolute', left: 80, bottom: 130, fontFamily: '"Inter",sans-serif', fontWeight: 900, fontSize: 64, color: '#fff', textShadow: '0 4px 26px rgba(0,0,0,0.9)' }}>THE BELIEF<div style={{ fontSize: 27, fontWeight: 700, color: MV.gold, letterSpacing: '0.2em', marginTop: 8 }}>SOUL OF THE ISLANDS</div></div></div></Sprite>
      <Sprite start={113} end={122.5}><div style={{ position: 'absolute', inset: 0 }}><FS id="duel-mid" /><div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.25)' }} /><div style={{ position: 'absolute', left: 0, right: 0, bottom: 70, textAlign: 'center', fontFamily: '"Inter",sans-serif', fontWeight: 900, fontSize: 58, color: '#fff', textShadow: '0 4px 26px rgba(0,0,0,0.9)' }}>REFUSE TO KNEEL</div></div></Sprite>
      <Sprite start={122.5} end={132}><div style={{ position: 'absolute', inset: 0 }}><FS id="duel-ksa" /><div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(270deg, rgba(0,108,53,0.44), transparent 55%)' }} /><div style={{ position: 'absolute', right: 80, bottom: 130, textAlign: 'right', fontFamily: '"Inter",sans-serif', fontWeight: 900, fontSize: 64, color: '#fff', textShadow: '0 4px 26px rgba(0,0,0,0.9)' }}>THE PRECISION<div style={{ fontSize: 27, fontWeight: 700, color: MV.gold, letterSpacing: '0.2em', marginTop: 8 }}>THE FALCON'S CALM</div></div></div></Sprite>
      <Letterbox />
    </div>
  );
}

function SceneDrama() {
  const S = 132.00;
  return (
    <div style={{ position: 'absolute', inset: 0 }}>
      <FS id="dr-cpv-attack" /><FS id="dr-goal" /><FS id="dr-cpv-celeb" /><FS id="dr-ksa-attack" /><FS id="dr-freekick" /><FS id="dr-post" /><FS id="dr-defiance" />
      <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg, rgba(2,3,8,0.28) 0%, transparent 24%, transparent 70%, rgba(2,3,8,0.6) 100%)' }} />
      {/* Cape Verde head home — CPV 1-0, 40' */}
      <GoalFlash at={S + 19.0} />
      <Sprite start={152.0} end={189.0}><ScoreBug start={S + 20.5} cpv={1} ksa={0} minute="40'" badge="OUR PREDICTION" /></Sprite>
      {/* Mendes free kick kisses the post 63' — no goal, 1-0 holds */}
      <Sprite start={189.0} end={203.32}><ScoreBug start={S + 58.0} cpv={1} ksa={0} minute="63'" badge="OUR PREDICTION" note="OFF THE POST" /></Sprite>
      <Sprite start={198.5} end={203.32}><PredictionCard start={S + 67.0} /></Sprite>
      <Vignette strength={0.34} />
      <Letterbox />
    </div>
  );
}

// ── BROADCAST-STYLE full-time prediction card.
function PredictionCard({ start }) {
  const t = useTime(); const local = t - start;
  const p = Easing.easeOutCubic(clamp(local / 1.0, 0, 1));
  const stampP = Easing.easeOutBack(clamp((local - 1.0) / 0.6, 0, 1));
  const Badge = ({ flag, name, accent }) => (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16 }}>
      <div style={{ padding: 8, borderRadius: '50%', background: `conic-gradient(${accent}, #fff6, ${accent})`, boxShadow: `0 10px 30px rgba(0,0,0,0.5)` }}>
        <div style={{ width: 120, height: 120, borderRadius: '50%', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#0a0f1c', border: '3px solid rgba(255,255,255,0.85)' }}>{flag}</div>
      </div>
      <span style={{ fontFamily: '"Inter",sans-serif', fontWeight: 900, fontSize: 28, color: '#fff', letterSpacing: '0.02em' }}>{name}</span>
    </div>
  );
  return (
    <div style={{ position: 'absolute', inset: 0, zIndex: 28, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(2,3,6,0.55)', opacity: p }}>
      <div style={{ width: 980, borderRadius: 26, overflow: 'hidden', transform: `scale(${0.92 + 0.08 * p})`, boxShadow: '0 30px 120px rgba(0,0,0,0.75)', position: 'relative', border: `1px solid ${MV.line}` }}>
        <div style={{ background: `linear-gradient(100deg, ${CPV} 0%, #1a1f2e 50%, ${KSA} 100%)`, padding: '14px 0', textAlign: 'center', fontFamily: '"Inter",sans-serif', fontWeight: 900, fontSize: 24, letterSpacing: '0.3em', color: '#fff' }}>FULL-TIME · OUR PREDICTION</div>
        <div style={{ background: 'linear-gradient(160deg, #0d1424 0%, #070b14 100%)', padding: '44px 70px 38px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 44 }}>
            <Badge flag={<FlagCPV w={104} />} name="CAPE VERDE" accent="#5b8dff" />
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <div style={{ fontFamily: '"Inter",sans-serif', fontWeight: 900, fontSize: 130, color: '#fff', lineHeight: 1, textShadow: '0 0 40px rgba(255,210,74,0.3)' }}>1<span style={{ color: MV.gold, margin: '0 18px' }}>–</span>0</div>
            </div>
            <Badge flag={<FlagKSA w={104} />} name="SAUDI ARABIA" accent={KSA_LT} />
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 30, paddingTop: 22, borderTop: `1px solid ${MV.line}` }}>
            <div style={{ fontFamily: '"Inter",sans-serif', fontWeight: 800, fontSize: 24, color: '#7aa6ff' }}>⚽ 40' &nbsp;THE HEADER</div>
            <div style={{ fontFamily: '"Inter",sans-serif', fontWeight: 800, fontSize: 24, color: KSA_LT }}>63' &nbsp;OFF THE POST 🪵</div>
          </div>
          <div style={{ textAlign: 'center', marginTop: 24, fontFamily: '"Inter",sans-serif', fontWeight: 800, fontSize: 22, color: MV.muted, letterSpacing: '0.16em' }}>BELIEF, BY AN INCH</div>
        </div>
        {stampP > 0 && <div style={{ position: 'absolute', top: 64, right: -8, transform: `rotate(-12deg) scale(${stampP})`, border: `4px solid ${MV.gold}`, color: MV.gold, borderRadius: 12, padding: '8px 22px', fontFamily: '"Inter",sans-serif', fontWeight: 900, fontSize: 24, letterSpacing: '0.14em', background: 'rgba(7,9,15,0.92)' }}>OUR STORY</div>}
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
            <StatLine start={S + 11.5} delay={0.0} label="CAPE VERDE" value="THE BLUE SHARKS" accent="#5b8dff" />
            <StatLine start={S + 11.5} delay={0.25} label="SAUDI ARABIA" value="THE GREEN FALCONS" accent={KSA_LT} />
            <StatLine start={S + 11.5} delay={0.5} label="OUR PREDICTION" value="CPV 1 — 0 KSA" accent="#fff" />
            <StatLine start={S + 11.5} delay={0.75} label="40' THE HEADER · 63' OFF THE POST" value="BELIEF, BY AN INCH" accent={MV.gold} />
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
    { label: 'COMMENT CABO VERDE', sub: "THE BLUE SHARKS", flag: <FlagCPV w={78} />, accent: '#5b8dff' },
    { label: 'COMMENT AL-AKHDAR', sub: "THE GREEN FALCONS", flag: <FlagKSA w={78} />, accent: KSA_LT },
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
            <div key={i} style={{ transform: `translateY(${(1 - cp) * 60}px) scale(${0.85 + 0.15 * cp})`, opacity: clamp(cp, 0, 1), background: MV.panel, border: `1px solid ${MV.line}`, borderRadius: 22, padding: '38px 54px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 18, minWidth: 380, boxShadow: '0 24px 70px rgba(0,0,0,0.5)', borderTop: `5px solid ${c.accent}` }}>
              {c.flag}
              <div style={{ fontFamily: '"Inter",sans-serif', fontWeight: 900, fontSize: 26, color: '#fff' }}>{c.label}</div>
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

// ── Mystery: reveal the REAL collectible card artwork. Rule #16: pays off the
// cold-open "WHO GIVES THESE ISLANDS THEIR VOICE?" tease — The Morna Singer.
function SceneMystery() {
  const { localTime: lt } = useSprite(); const S = 255.00;
  const inP = Easing.easeOutCubic(clamp((lt - 0.6) / 1.4, 0, 1));
  const teaseP = clamp((lt - 1.0) / 0.8, 0, 1) * clamp((4.0 - lt) / 0.6, 0, 1);
  const teasePulse = 0.5 + 0.5 * Math.sin(lt * 4.2);
  const cardP = Easing.easeOutCubic(clamp((lt - 4.2) / 1.0, 0, 1));
  const flipDeg = (1 - cardP) * 88;
  const settle = clamp((lt - 5.4) / 1.0, 0, 1);
  const burst = clamp((lt - 5.2) / 0.6, 0, 1);
  const floatY = Math.sin(lt * 1.05) * 5 * settle, floatR = Math.sin(lt * 0.6) * 0.6 * settle;
  const pulse = 0.5 + 0.5 * Math.sin(lt * 3.4);
  const ring = clamp((lt - 5.2) / 1.2, 0, 1);
  return (
    <div style={{ position: 'absolute', inset: 0 }}>
      <ClipSprite id="my-morna" fit="cover" style={{ filter: 'brightness(0.7) saturate(1.12)' }} />
      <div style={{ position: 'absolute', inset: 0, background: 'rgba(4,6,12,0.58)' }} />
      <AmbientParticles start={S} dur={26} count={46} color="252,228,150" maxR={3.5} zIndex={22} />
      <div style={{ position: 'absolute', top: 70, left: 0, right: 0, textAlign: 'center', zIndex: 25, opacity: inP }}><Kicker size={26} color="#e8c97a">The Islands' Voice · Legend No. 065</Kicker></div>
      {teaseP > 0.01 && (
        <div style={{ position: 'absolute', left: '50%', top: '50%', zIndex: 24, pointerEvents: 'none', transform: `translate(-50%,-50%) scale(${0.8 + teasePulse * 0.12})`, opacity: teaseP, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 18 }}>
          <div style={{ width: 200, height: 200, borderRadius: '50%', background: 'radial-gradient(circle at 38% 32%, rgba(255,233,160,0.95), rgba(201,148,46,0.5) 70%)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: `0 0 ${50 + teasePulse * 40}px rgba(245,208,22,0.7)` }}><span style={{ fontFamily: '"Inter",sans-serif', fontWeight: 900, fontSize: 130, color: '#2a1c04' }}>?</span></div>
          <div style={{ fontFamily: '"Inter",sans-serif', fontWeight: 900, fontSize: 30, color: '#ffe9a0', letterSpacing: '0.2em', textShadow: '0 2px 18px rgba(0,0,0,0.8)' }}>THE VOICE OF THE ISLANDS</div>
        </div>
      )}
      {ring > 0 && ring < 1 && <div style={{ position: 'absolute', left: '50%', top: '50%', zIndex: 23, pointerEvents: 'none', width: 760, height: 760, transform: `translate(-50%,-50%) scale(${0.3 + ring * 1.5})`, opacity: (1 - ring) * 0.8, borderRadius: '50%', border: '3px solid rgba(255,225,150,0.7)', boxShadow: '0 0 60px rgba(245,208,22,0.5)' }} />}
      {burst > 0 && burst < 1 && <div style={{ position: 'absolute', left: '50%', top: '50%', zIndex: 24, pointerEvents: 'none', width: 1000, height: 1000, transform: `translate(-50%,-50%) scale(${0.4 + burst * 1.3})`, opacity: (1 - burst) * 0.9, background: 'radial-gradient(circle, rgba(255,233,160,0.55) 0%, rgba(245,208,22,0.18) 30%, transparent 62%)', borderRadius: '50%' }} />}
      {cardP > 0 && (
        <div style={{ position: 'absolute', left: '50%', top: '49%', zIndex: 25, opacity: clamp(cardP, 0, 1), perspective: 1600, transform: `translate(-50%,-50%) translateY(${(1 - cardP) * 40 + floatY}px) scale(${0.9 + 0.1 * cardP})` }}>
          <div style={{ transformStyle: 'preserve-3d', transform: `rotateY(${flipDeg}deg) rotate(${floatR}deg)`, borderRadius: 22, boxShadow: `0 30px 120px rgba(0,0,0,0.8), 0 0 ${50 + settle * 40}px rgba(245,208,22,${0.2 + settle * 0.3})` }}>
            <img data-seq="" src="assets/legend-065-portrait.png" alt="" style={{ height: 820, width: 'auto', display: 'block', borderRadius: 18 }} />
          </div>
        </div>
      )}
      {settle > 0.2 && (
        <div style={{ position: 'absolute', left: '50%', bottom: 46, zIndex: 26, transform: 'translateX(-50%)', display: 'flex', alignItems: 'center', gap: 16, opacity: settle }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 10, background: 'rgba(255,210,74,0.16)', border: '1px solid rgba(255,210,74,0.6)', borderRadius: 999, padding: '12px 26px' }}><span style={{ fontSize: 22 }}>✦</span><span style={{ fontFamily: '"Inter",sans-serif', fontWeight: 800, fontSize: 22, color: MV.gold, letterSpacing: '0.06em' }}>worldcup26.world</span></div>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 12, background: 'linear-gradient(100deg, #16a34a, #0e8a3c)', borderRadius: 999, padding: '14px 32px', transform: `scale(${1 + pulse * 0.04})`, boxShadow: `0 8px 30px rgba(22,163,74,${0.35 + pulse * 0.4})` }}><span style={{ fontSize: 22 }}>⚡</span><span style={{ fontFamily: '"Inter",sans-serif', fontWeight: 900, fontSize: 24, color: '#fff', letterSpacing: '0.03em' }}>SIGN UP FREE — UNLOCK LEGEND 065</span></div>
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
    { name: 'CAPE VERDE', flag: <FlagCPV w={84} /> },
    { name: 'SAUDI ARABIA', flag: <FlagKSA w={84} /> },
    { name: 'BRAZIL', flag: <div style={{ width: 84, height: 56, borderRadius: 6, background: '#009b3a', position: 'relative', overflow: 'hidden' }}><div style={{ position: 'absolute', left: '50%', top: '50%', width: 44, height: 30, background: '#ffdf00', transform: 'translate(-50%,-50%) rotate(45deg)' }} /><div style={{ position: 'absolute', left: '50%', top: '50%', width: 19, height: 19, borderRadius: '50%', background: '#002776', transform: 'translate(-50%,-50%)' }} /></div> },
  ];
  return (
    <div style={{ position: 'absolute', inset: 0, background: `linear-gradient(160deg, #0a1020 0%, #07090f 70%)` }}>
      <div style={{ position: 'absolute', inset: 0, background: `radial-gradient(ellipse at 50% 20%, rgba(0,56,147,0.4) 0%, rgba(7,9,15,0.92) 62%)` }} />
      <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 42, opacity: inP }}>
        <Kicker color="#9ec1ff" size={30}>The Prediction Game</Kicker>
        <BigTitle size={100} color="#fff" glow={CPV}>worldcup26.world</BigTitle>
        <Kicker color="#cfe0ff" size={30}>Sign Up · Pick 3 Of 48</Kicker>
        <div style={{ display: 'flex', gap: 34, marginTop: 10 }}>
          {cards.map((c, i) => {
            const cp = Easing.easeOutBack(clamp((lt - 1.2 - i * 0.35) / 0.7, 0, 1));
            return (
              <div key={i} style={{ transform: `translateY(${(1 - cp) * 60}px) scale(${0.8 + 0.2 * cp})`, opacity: clamp(cp, 0, 1), background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.18)', borderRadius: 22, padding: '30px 40px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16, minWidth: 280, boxShadow: '0 24px 70px rgba(0,0,0,0.45)' }}>
                {c.flag}<div style={{ fontFamily: '"Inter",sans-serif', fontWeight: 900, fontSize: 23, color: '#fff' }}>{c.name}</div>
                <div style={{ fontFamily: '"Inter",sans-serif', fontWeight: 800, fontSize: 21, color: MV.gold }}>EVERY GOAL SCORES</div>
              </div>
            );
          })}
        </div>
        <div style={{ transform: `translateY(${(1 - btnP) * 40}px) scale(${(0.8 + 0.2 * btnP) * (1 + pulse * 0.03)})`, opacity: clamp(btnP, 0, 1), marginTop: 4, display: 'flex', alignItems: 'center', gap: 16, background: 'linear-gradient(100deg, #16a34a, #0c8f3a)', borderRadius: 999, padding: '18px 50px', boxShadow: `0 14px 50px rgba(22,163,74,${0.4 + pulse * 0.45})` }}><span style={{ fontSize: 34 }}>⚡</span><span style={{ fontFamily: '"Inter",sans-serif', fontWeight: 900, fontSize: 38, color: '#fff' }}>CREATE YOUR FREE ACCOUNT</span></div>
        <div style={{ fontFamily: '"Inter",sans-serif', fontWeight: 800, fontSize: 27, color: MV.gold, opacity: clamp(btnP, 0, 1) }}>Unlock Legend 065 the moment you sign up · free · no prizes</div>
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
        <span style={{ fontFamily: '"Inter",sans-serif', fontWeight: 900, fontSize: 29, color: MV.gold }}>⚡ EP66 · COLLECT LEGEND 065 · worldcup26.world</span>
      </div>
    </div>
  );
}
