// match-scenes.jsx — Ep59 Japan vs Sweden — ANIMATION-FIRST (318s).
// "The Art of Precision" · Group F. OUR PREDICTION JPN 1–0 SWE.
// Real player animations play FULL-SCREEN and LOOP per segment (image-sequence
// engine). Ueda finishes Mitoma's cutback ~60'; late on the keeper denies Gyökeres.
// Legend 059 = The Origami Master (the folding crane). Never stated as a real result.

const JPN = '#13286e', JPN_LIGHT = '#3358b8', JPN_RED = '#bc002d';
const SWE = '#0a6aa7', SWE_YEL = '#fecb00', SWE_LIGHT = '#2f8fd0';
const HERO = { filter: 'brightness(1.05) saturate(1.14) contrast(1.05)' };

// Japan flag — white field, red sun disc centre.
function FlagJPN({ w = 120 }) {
  const h = w * 2 / 3;
  return (
    <div style={{ width: w, height: h, borderRadius: w * 0.05, position: 'relative', overflow: 'hidden', background: '#fff', boxShadow: '0 6px 18px rgba(0,0,0,0.45)' }}>
      <div style={{ position: 'absolute', left: '50%', top: '50%', transform: 'translate(-50%,-50%)', width: h * 0.6, height: h * 0.6, borderRadius: '50%', background: '#bc002d' }} />
    </div>
  );
}
// Sweden flag — blue field, yellow Nordic cross (offset to hoist).
function FlagSWE({ w = 120 }) {
  const h = w * 2 / 3;
  return (
    <div style={{ width: w, height: h, borderRadius: w * 0.05, position: 'relative', overflow: 'hidden', background: '#006aa7', boxShadow: '0 6px 18px rgba(0,0,0,0.45)' }}>
      <div style={{ position: 'absolute', top: '40%', left: 0, right: 0, height: '20%', background: '#fecb00' }} />
      <div style={{ position: 'absolute', top: 0, bottom: 0, left: '31%', width: '15%', background: '#fecb00' }} />
    </div>
  );
}

function ScoreBug({ start, jpn = 0, swe = 0, minute, badge = "OUR PREDICTION", note }) {
  const t = useTime(); const local = t - start; if (local < 0) return null;
  const inP = Easing.easeOutBack(clamp(local / 0.7, 0, 1));
  const cell = { fontFamily: '"Inter",sans-serif', fontWeight: 900, fontSize: 34, color: '#fff', padding: '10px 18px' };
  return (
    <div style={{ position: 'absolute', top: 92, left: '50%', zIndex: 30, transform: `translateX(-50%) scale(${inP})`, opacity: clamp(inP, 0, 1), display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
      <div style={{ display: 'flex', alignItems: 'center', background: MV.panel, border: `1px solid ${MV.line}`, borderRadius: 14, boxShadow: '0 10px 36px rgba(0,0,0,0.6)', overflow: 'hidden' }}>
        <div style={{ ...cell, background: JPN }}>JPN</div>
        <div style={{ ...cell, fontSize: 38, color: MV.gold }}>{jpn} — {swe}</div>
        <div style={{ ...cell, background: SWE_YEL, color: '#10243f' }}>SWE</div>
        {minute && <div style={{ ...cell, fontSize: 26, color: MV.muted, borderLeft: `1px solid ${MV.line}` }}>{minute}</div>}
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <div style={{ fontFamily: '"Inter",sans-serif', fontWeight: 800, fontSize: 16, color: MV.gold, letterSpacing: '0.22em', background: 'rgba(255,210,74,0.14)', border: '1px solid rgba(255,210,74,0.5)', borderRadius: 999, padding: '4px 16px' }}>{badge}</div>
        {note && <div style={{ fontFamily: '"Inter",sans-serif', fontWeight: 900, fontSize: 16, color: '#fff', letterSpacing: '0.18em', background: 'rgba(19,40,110,0.5)', border: `1px solid ${JPN_LIGHT}`, borderRadius: 999, padding: '4px 16px' }}>{note}</div>}
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
        <div style={{ fontFamily: '"Inter",sans-serif', fontWeight: 900, fontSize: 80, color: '#fff', letterSpacing: '0.01em', lineHeight: 1, textShadow: '0 6px 30px rgba(0,0,0,0.85)' }}>{name}</div>
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
        {flag}
        <span style={{ fontFamily: '"Inter",sans-serif', fontWeight: 900, fontSize: 38, color: '#fff', letterSpacing: '0.10em' }}>{label}</span>
        <div style={{ width: 14, height: 14, borderRadius: '50%', background: accent, boxShadow: `0 0 16px ${accent}` }} />
      </div>
    </div>
  );
}

function Backdrop() {
  const clips = (window.MV_CLIPS || []).filter((c) => c.id && c.id.indexOf('bd-') === 0);
  return (
    <div style={{ position: 'absolute', inset: 0, zIndex: 0 }}>
      {clips.map((c) => <ClipSprite key={c.id} id={c.id} dim={0.5} style={{ filter: 'brightness(0.6) saturate(1.05)' }} />)}
      <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse at 50% 45%, rgba(5,6,12,0.10) 30%, rgba(2,3,8,0.5) 100%)' }} />
    </div>
  );
}

function SceneColdOpen() {
  const { localTime: lt } = useSprite();
  const beat = Math.pow(Math.max(0, Math.sin(lt * Math.PI * 1.15)), 8);
  const titleP = Easing.easeOutCubic(clamp((lt - 18.0) / 1.4, 0, 1));
  return (
    <div style={{ position: 'absolute', inset: 0 }}>
      <ClipSprite id="cg-stad" fit="cover" style={HERO} />
      <ClipSprite id="cg-gyokeres" fit="cover" style={HERO} />
      <ClipSprite id="cg-mitoma" fit="cover" style={HERO} />
      <ClipSprite id="cg-crowd" fit="cover" style={HERO} />
      <div style={{ position: 'absolute', inset: 0, background: `radial-gradient(ellipse at center, rgba(255,209,0,${(0.28 * beat).toFixed(3)}) 0%, transparent 60%)` }} />
      <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg, rgba(2,3,8,0.35) 0%, transparent 30%, transparent 60%, rgba(2,3,8,0.7) 100%)' }} />
      <Vignette strength={0.6} />
      {lt > 18.0 && (
        <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 30, opacity: titleP, zIndex: 22 }}>
          <Kicker size={34}>The Crane vs The Longship</Kicker>
          <TitleReveal text="PRECISION vs FORCE" start={19.8} size={92} color={MV.gold} />
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
    <div style={{ position: 'absolute', inset: 0 }}>
      <ClipSprite id="title-bg" fit="cover" style={{ filter: 'brightness(0.5) saturate(1.1)' }} />
      <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg, rgba(8,12,22,0.78), rgba(8,12,22,0.62))' }} />
      <AmbientParticles start={23.48} dur={9.5} count={30} />
      <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 40 }}>
        <div style={{ opacity: p1, transform: `translateY(${(1 - p1) * -30}px)` }}><Kicker>WorldCup26 Legends · Episode 59</Kicker></div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 64, opacity: clamp(p2, 0, 1), transform: `scale(${p2})` }}>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 18 }}><Waving><FlagJPN w={220} /></Waving><BigTitle size={78} glow={JPN_LIGHT}>JAPAN</BigTitle></div>
          <BigTitle size={116} color={MV.gold}>VS</BigTitle>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 18 }}><Waving speed={1.9}><FlagSWE w={220} /></Waving><BigTitle size={78} glow={SWE_YEL}>SWEDEN</BigTitle></div>
        </div>
        <div style={{ opacity: p3, fontFamily: '"Inter",sans-serif', fontWeight: 600, fontSize: 32, color: MV.muted, letterSpacing: '0.08em' }}>GROUP F · THE ART OF PRECISION</div>
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
      <ClipSprite id="stad-a" fit="cover" style={HERO} />
      <ClipSprite id="stad-b" fit="cover" style={HERO} />
      <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg, transparent 50%, rgba(2,3,8,0.8) 100%)' }} />
      <Vignette strength={0.4} />
      <div style={{ position: 'absolute', left: 0, right: 0, bottom: 120, display: 'flex', justifyContent: 'center', zIndex: 25, opacity: stripP, transform: `translateY(${(1 - stripP) * 30}px)` }}>
        <div style={{ display: 'flex', background: MV.panel, border: `1px solid ${MV.line}`, borderRadius: 16, overflow: 'hidden', backdropFilter: 'blur(6px)' }}>
          {[['GROUP F', 'THE BIG STAGE'], ['BLUE SAMURAI', 'vs BLÅGULT'], ['PRECISION', 'vs FORCE'], ['THE MARGIN', 'DECIDES']].map(([v, l], i) => (
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

function SceneJapan() {
  return (
    <div style={{ position: 'absolute', inset: 0 }}>
      <Sprite start={44} end={55.6}><div style={{ position: 'absolute', inset: 0 }}><ClipSprite id="jpn-crowd-bg" fit="cover" style={HERO} /><div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg, rgba(2,3,8,0.32) 0%, transparent 40%, rgba(2,3,8,0.55) 100%)' }} /><TeamBanner flag={<FlagJPN w={66} />} label="BLUE SAMURAI · JAPAN" accent={JPN_RED} /></div></Sprite>
      <PlayerShowcase clipId="s-mitoma" name="KAORU MITOMA" role="THE MATHEMATICIAN" accent={JPN} start={55.5} end={61.1} />
      <PlayerShowcase clipId="s-kubo" name="TAKEFUSA KUBO" role="THE JAPANESE MESSI" accent={JPN_LIGHT} start={61} end={65.1} />
      <PlayerShowcase clipId="s-minamino" name="TAKUMI MINAMINO" role="CLEVER MOVEMENT" accent={JPN_RED} start={65} end={68.1} />
      <PlayerShowcase clipId="s-ueda" name="AYASE UEDA" role="THE FINISHER" accent={JPN_LIGHT} start={68} end={73.6} />
      <PlayerShowcase clipId="s-endo" name="WATARU ENDO" role="THE UNSUNG ENGINE" accent={JPN} start={73.5} end={79.5} />
      <Vignette strength={0.35} />
      <Letterbox />
    </div>
  );
}

function SceneSweden() {
  return (
    <div style={{ position: 'absolute', inset: 0 }}>
      <Sprite start={79.5} end={90.7}><div style={{ position: 'absolute', inset: 0 }}><ClipSprite id="swe-crowd-bg" fit="cover" style={HERO} /><div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg, rgba(2,3,8,0.32) 0%, transparent 40%, rgba(2,3,8,0.55) 100%)' }} /><TeamBanner flag={<FlagSWE w={66} />} label="BLÅGULT · SWEDEN" accent={SWE_YEL} /></div></Sprite>
      <PlayerShowcase clipId="s-gyokeres" name="VIKTOR GYÖKERES" role="VIKING VIKTOR · THE HAMMER" accent={SWE} start={90.6} end={95.2} />
      <PlayerShowcase clipId="s-isak" name="ALEXANDER ISAK" role="PURE ELEGANCE" accent={SWE_YEL} start={95.1} end={98.2} />
      <PlayerShowcase clipId="s-elanga" name="ANTHONY ELANGA" role="BLISTERING PACE" accent={SWE_LIGHT} start={98.1} end={100.8} />
      <PlayerShowcase clipId="s-lindelof" name="VICTOR LINDELÖF" role="CALM AT THE BACK" accent={SWE} start={100.7} end={103} />
      <Vignette strength={0.35} />
      <Letterbox />
    </div>
  );
}

function SceneDuel() {
  const t = useTime();
  const vsP = Easing.easeOutBack(clamp((t - 116.6) / 0.8, 0, 1)) * clamp((118.6 - t) / 0.6 + 1, 0, 1);
  return (
    <div style={{ position: 'absolute', inset: 0 }}>
      <Sprite start={103} end={117.7}>
        <div style={{ position: 'absolute', inset: 0 }}>
          <ClipSprite id="duel-mitoma" fit="cover" style={HERO} />
          <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(90deg, rgba(19,40,110,0.4), transparent 55%)' }} />
          <div style={{ position: 'absolute', left: 80, bottom: 130, fontFamily: '"Inter",sans-serif', fontWeight: 900, fontSize: 66, color: '#fff', textShadow: '0 4px 26px rgba(0,0,0,0.9)' }}>THE SCALPEL<div style={{ fontSize: 28, fontWeight: 700, color: MV.gold, letterSpacing: '0.2em', marginTop: 8 }}>KAORU MITOMA</div></div>
        </div>
      </Sprite>
      <Sprite start={117.6} end={132}>
        <div style={{ position: 'absolute', inset: 0 }}>
          <ClipSprite id="duel-gyokeres" fit="cover" style={HERO} />
          <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(270deg, rgba(254,203,0,0.36), transparent 55%)' }} />
          <div style={{ position: 'absolute', right: 80, bottom: 130, textAlign: 'right', fontFamily: '"Inter",sans-serif', fontWeight: 900, fontSize: 66, color: '#fff', textShadow: '0 4px 26px rgba(0,0,0,0.9)' }}>THE HAMMER<div style={{ fontSize: 28, fontWeight: 700, color: MV.gold, letterSpacing: '0.2em', marginTop: 8 }}>VIKTOR GYÖKERES</div></div>
        </div>
      </Sprite>
      {vsP > 0.01 && (
        <div style={{ position: 'absolute', top: '50%', left: '50%', zIndex: 26, transform: `translate(-50%,-50%) scale(${vsP})`, opacity: clamp(vsP, 0, 1), width: 200, height: 200, borderRadius: '50%', background: MV.panel, border: `5px solid ${MV.gold}`, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: `0 0 90px ${MV.gold}66` }}>
          <span style={{ fontFamily: '"Inter",sans-serif', fontWeight: 900, fontSize: 88, color: MV.gold }}>VS</span>
        </div>
      )}
      <Sprite start={124} end={132}>
        <div style={{ position: 'absolute', left: 0, right: 0, bottom: 60, textAlign: 'center', zIndex: 27 }}><Kicker size={38}>Finesse vs Fury</Kicker></div>
      </Sprite>
      <Letterbox />
    </div>
  );
}

function SceneDrama() {
  const S = 132.00;
  return (
    <div style={{ position: 'absolute', inset: 0 }}>
      <ClipSprite id="dr-stad" fit="cover" style={HERO} />
      <ClipSprite id="dr-mitoma" fit="cover" style={HERO} />
      <ClipSprite id="dr-goal" fit="cover" style={HERO} />
      <ClipSprite id="dr-blue" fit="cover" style={HERO} />
      <ClipSprite id="dr-gyokeres" fit="cover" style={HERO} />
      <ClipSprite id="dr-save" fit="cover" style={HERO} />
      <ClipSprite id="dr-celeb" fit="cover" style={HERO} />
      <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg, rgba(2,3,8,0.28) 0%, transparent 24%, transparent 70%, rgba(2,3,8,0.6) 100%)' }} />
      {/* Ueda finishes Mitoma's cutback — JPN 1–0, 60' */}
      <GoalFlash at={S + 28.0} />
      <Sprite start={162.0} end={190.0}><ScoreBug start={S + 30.0} jpn={1} swe={0} minute="60'" badge="OUR PREDICTION" /></Sprite>
      {/* keeper denies Gyökeres 85' — no goal, 1–0 holds */}
      <Sprite start={190.0} end={203.32}><ScoreBug start={S + 58.0} jpn={1} swe={0} minute="85'" badge="OUR PREDICTION" note="KEEPER SAVES" /></Sprite>
      <Sprite start={198.5} end={203.32}><PredictionCard start={S + 67.0} /></Sprite>
      <Vignette strength={0.34} />
      <Letterbox />
    </div>
  );
}

function PredictionCard({ start }) {
  const t = useTime(); const local = t - start;
  const p = Easing.easeOutCubic(clamp(local / 1.0, 0, 1));
  const stampP = Easing.easeOutBack(clamp((local - 1.0) / 0.6, 0, 1));
  return (
    <div style={{ position: 'absolute', inset: 0, zIndex: 28, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(2,3,6,0.5)', opacity: p }}>
      <div style={{ background: MV.panel, border: `1px solid ${MV.line}`, borderRadius: 26, padding: '54px 100px', textAlign: 'center', transform: `scale(${0.92 + 0.08 * p})`, boxShadow: '0 30px 120px rgba(0,0,0,0.7)', position: 'relative' }}>
        {stampP > 0 && <div style={{ position: 'absolute', top: -30, right: -54, transform: `rotate(-12deg) scale(${stampP})`, border: `4px solid ${MV.gold}`, color: MV.gold, borderRadius: 12, padding: '8px 22px', fontFamily: '"Inter",sans-serif', fontWeight: 900, fontSize: 26, letterSpacing: '0.14em', background: 'rgba(7,9,15,0.9)', zIndex: 2 }}>OUR PREDICTION</div>}
        <Kicker size={26}>The Art of Precision</Kicker>
        <div style={{ display: 'flex', alignItems: 'center', gap: 52, marginTop: 36 }}>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 14 }}><FlagJPN w={140} /><span style={{ fontFamily: '"Inter",sans-serif', fontWeight: 800, fontSize: 30, color: '#fff' }}>JAPAN</span></div>
          <BigTitle size={160} color={MV.gold}>1 — 0</BigTitle>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 14 }}><FlagSWE w={140} /><span style={{ fontFamily: '"Inter",sans-serif', fontWeight: 800, fontSize: 30, color: '#fff' }}>SWEDEN</span></div>
        </div>
        <div style={{ fontFamily: '"Inter",sans-serif', fontWeight: 800, fontSize: 25, color: MV.muted, letterSpacing: '0.18em', marginTop: 24 }}>THE MARGINS DID THE TALKING</div>
      </div>
    </div>
  );
}

function SceneVerdict() {
  const { localTime: lt } = useSprite(); const S = 203.32;
  const discP = Easing.easeOutCubic(clamp(lt / 1.0, 0, 1));
  const discFade = lt > 14 ? clamp((16 - lt) / 1.0, 0, 1) : 1;
  return (
    <div style={{ position: 'absolute', inset: 0 }}>
      <ClipSprite id="vd-celeb" fit="cover" style={HERO} />
      <ClipSprite id="vd-crowd" fit="cover" style={{ filter: 'brightness(0.7) saturate(1.1)' }} />
      <div style={{ position: 'absolute', inset: 0, background: 'rgba(6,10,18,0.5)' }} />
      <Sprite start={203.32} end={217.52}>
        <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 26, opacity: discP * discFade }}>
          <div style={{ background: MV.panel, border: `1px solid ${MV.line}`, borderRadius: 22, padding: '42px 76px', textAlign: 'center', backdropFilter: 'blur(6px)' }}>
            <Kicker size={26} color={MV.gold}>Our Prediction</Kicker>
            <div style={{ fontFamily: '"Inter",sans-serif', fontWeight: 900, fontSize: 52, color: '#fff', letterSpacing: '0.04em', marginTop: 18 }}>THE REAL MATCH IS YOURS</div>
          </div>
        </div>
      </Sprite>
      <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 25 }}>
        <div style={{ background: MV.panel, border: `1px solid ${MV.line}`, borderRadius: 24, padding: '48px 80px', minWidth: 880, backdropFilter: 'blur(6px)', opacity: clamp((lt - 16.5) / 1.0, 0, 1) }}>
          <Kicker size={26}>Group F · Our Prediction</Kicker>
          <div style={{ marginTop: 24 }}>
            <StatLine start={S + 17} delay={0.0} label="JAPAN" value="THE BLUE SAMURAI" accent={JPN_LIGHT} />
            <StatLine start={S + 17} delay={0.25} label="SWEDEN" value="BLÅGULT" accent={SWE_YEL} />
            <StatLine start={S + 17} delay={0.5} label="OUR PREDICTION" value="JPN 1 — 0 SWE" accent="#fff" />
            <StatLine start={S + 17} delay={0.75} label="60' UEDA · 85' KEEPER SAVES" value="THE MARGINS DECIDE" accent={MV.gold} />
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
    { label: 'COMMENT NIPPON', sub: "JAPAN'S PRECISION", flag: <FlagJPN w={78} />, accent: JPN_LIGHT },
    { label: 'COMMENT SVERIGE', sub: "THE VIKING HAMMER", flag: <FlagSWE w={78} />, accent: SWE_YEL },
  ];
  return (
    <div style={{ position: 'absolute', inset: 0 }}>
      <ClipSprite id="en-crowd" fit="cover" style={{ filter: 'brightness(0.62) saturate(1.1)' }} />
      <div style={{ position: 'absolute', inset: 0, background: 'rgba(6,10,18,0.62)' }} />
      <div style={{ position: 'absolute', top: 140, left: 0, right: 0, textAlign: 'center', zIndex: 25, opacity: headP }}><Kicker size={30}>Do You Agree?</Kicker></div>
      <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 56, zIndex: 25 }}>
        {cards.map((c, i) => {
          const cp = Easing.easeOutBack(clamp((lt - 0.8 - i * 0.4) / 0.7, 0, 1));
          return (
            <div key={i} style={{ transform: `translateY(${(1 - cp) * 60}px) scale(${0.85 + 0.15 * cp})`, opacity: clamp(cp, 0, 1), background: MV.panel, border: `1px solid ${MV.line}`, borderRadius: 22, padding: '38px 54px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 18, minWidth: 350, boxShadow: '0 24px 70px rgba(0,0,0,0.5)', borderTop: `5px solid ${c.accent}` }}>
              {c.flag}
              <div style={{ fontFamily: '"Inter",sans-serif', fontWeight: 900, fontSize: 30, color: '#fff' }}>{c.label}</div>
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

function SceneMystery() {
  const { localTime: lt } = useSprite(); const S = 255.00;
  const inP = Easing.easeOutCubic(clamp((lt - 0.6) / 1.4, 0, 1));
  const teaseP = clamp((lt - 1.0) / 0.8, 0, 1) * clamp((4.0 - lt) / 0.6, 0, 1);
  const teasePulse = 0.5 + 0.5 * Math.sin(lt * 4.2);
  const cardP = Easing.easeOutCubic(clamp((lt - 4.2) / 1.0, 0, 1));
  const flipDeg = (1 - cardP) * 88;
  const settle = clamp((lt - 5.4) / 1.0, 0, 1);
  const shine = lt > 5.4 ? -40 + (((lt - 5.4) * 24) % 240) : -60;
  const holoHue = (lt * 26) % 360;
  const burst = clamp((lt - 5.2) / 0.6, 0, 1);
  const floatY = Math.sin(lt * 1.05) * 5 * settle, floatR = Math.sin(lt * 0.6) * 0.6 * settle;
  const pulse = 0.5 + 0.5 * Math.sin(lt * 3.4);
  const ring = clamp((lt - 5.2) / 1.2, 0, 1);
  return (
    <div style={{ position: 'absolute', inset: 0 }}>
      <ClipSprite id="my-origami" fit="cover" style={{ filter: 'brightness(0.74) saturate(1.15)' }} />
      <div style={{ position: 'absolute', inset: 0, background: 'rgba(4,6,12,0.5)' }} />
      <AmbientParticles start={S} dur={26} count={46} color="252,228,150" maxR={3.5} zIndex={22} />
      <div style={{ position: 'absolute', top: 100, left: 0, right: 0, textAlign: 'center', zIndex: 25, opacity: inP }}><Kicker size={26} color="#e8c97a">The Mystery Supporter · Legend No. 059</Kicker></div>
      {teaseP > 0.01 && (
        <div style={{ position: 'absolute', left: '50%', top: '52%', zIndex: 24, pointerEvents: 'none', transform: `translate(-50%,-50%) scale(${0.8 + teasePulse * 0.12})`, opacity: teaseP, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 18 }}>
          <div style={{ width: 200, height: 200, borderRadius: '50%', background: 'radial-gradient(circle at 38% 32%, rgba(255,233,160,0.95), rgba(201,148,46,0.5) 70%)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: `0 0 ${50 + teasePulse * 40}px rgba(245,208,22,0.7)` }}><span style={{ fontFamily: '"Inter",sans-serif', fontWeight: 900, fontSize: 130, color: '#2a1c04' }}>?</span></div>
          <div style={{ fontFamily: '"Inter",sans-serif', fontWeight: 900, fontSize: 30, color: '#ffe9a0', letterSpacing: '0.2em', textShadow: '0 2px 18px rgba(0,0,0,0.8)' }}>WHO IS LEGEND 059?</div>
        </div>
      )}
      {ring > 0 && ring < 1 && <div style={{ position: 'absolute', left: '50%', top: '52%', zIndex: 23, pointerEvents: 'none', width: 700, height: 700, transform: `translate(-50%,-50%) scale(${0.3 + ring * 1.5})`, opacity: (1 - ring) * 0.8, borderRadius: '50%', border: '3px solid rgba(255,225,150,0.7)', boxShadow: '0 0 60px rgba(245,208,22,0.5)' }} />}
      {burst > 0 && burst < 1 && <div style={{ position: 'absolute', left: '50%', top: '52%', zIndex: 24, pointerEvents: 'none', width: 900, height: 900, transform: `translate(-50%,-50%) scale(${0.4 + burst * 1.3})`, opacity: (1 - burst) * 0.9, background: 'radial-gradient(circle, rgba(255,233,160,0.55) 0%, rgba(245,208,22,0.18) 30%, transparent 62%)', borderRadius: '50%' }} />}
      {cardP > 0 && (
        <div style={{ position: 'absolute', left: '50%', top: '52%', zIndex: 25, opacity: clamp(cardP, 0, 1), perspective: 1500, transform: `translate(-50%,-50%) translateY(${(1 - cardP) * 40 + floatY}px) scale(${0.9 + 0.1 * cardP})` }}>
          <div style={{ position: 'relative', width: 760, borderRadius: 26, overflow: 'hidden', padding: '5px', transformStyle: 'preserve-3d', transform: `rotateY(${flipDeg}deg) rotate(${floatR}deg)`, background: 'linear-gradient(150deg, #f4d784 0%, #b9842c 30%, #f8e9a8 55%, #9c6a1d 80%, #f4d784 100%)', boxShadow: `0 30px 120px rgba(0,0,0,0.75), 0 0 ${40 + settle * 30}px rgba(245,208,22,${0.15 + settle * 0.25})` }}>
            <div style={{ borderRadius: 22, background: 'linear-gradient(160deg, #16234a 0%, #1d2f5e 55%, #0a1020 100%)', padding: '34px 46px', position: 'relative', overflow: 'hidden' }}>
              <div style={{ position: 'absolute', top: 26, right: 30, width: 96, height: 96, borderRadius: '50%', background: 'radial-gradient(circle at 35% 30%, #fbe9a8, #c9942e 70%)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 8px 30px rgba(0,0,0,0.5), inset 0 0 0 3px rgba(255,255,255,0.35)' }}><span style={{ fontFamily: '"Inter",sans-serif', fontWeight: 900, fontSize: 40, color: '#3a2706' }}>059</span></div>
              <div style={{ fontFamily: '"Inter",sans-serif', fontWeight: 800, fontSize: 22, color: '#e8c97a', letterSpacing: '0.28em' }}>LEGEND 059</div>
              <div style={{ fontFamily: '"Inter",sans-serif', fontWeight: 900, fontSize: 60, color: '#f6f9ff', marginTop: 8, lineHeight: 1.05, maxWidth: 540 }}>THE ORIGAMI MASTER</div>
              <div style={{ fontFamily: '"Inter",sans-serif', fontWeight: 700, fontSize: 22, color: '#c9d9ff', letterSpacing: '0.16em', marginTop: 14, textTransform: 'uppercase' }}>Origami · Japan</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginTop: 22 }}>
                <div style={{ display: 'inline-flex', alignSelf: 'flex-start', alignItems: 'center', gap: 12, background: 'rgba(255,210,74,0.14)', border: '1px solid rgba(255,210,74,0.55)', borderRadius: 999, padding: '10px 24px' }}><span style={{ fontSize: 24 }}>✦</span><span style={{ fontFamily: '"Inter",sans-serif', fontWeight: 800, fontSize: 22, color: MV.gold, letterSpacing: '0.08em' }}>worldcup26.world</span></div>
                <div style={{ display: 'inline-flex', alignSelf: 'flex-start', alignItems: 'center', gap: 12, background: 'linear-gradient(100deg, #16a34a, #0e8a3c)', borderRadius: 999, padding: '13px 30px', transform: `scale(${1 + pulse * 0.04})`, boxShadow: `0 8px 30px rgba(22,163,74,${0.35 + pulse * 0.4})` }}><span style={{ fontSize: 22 }}>⚡</span><span style={{ fontFamily: '"Inter",sans-serif', fontWeight: 900, fontSize: 23, color: '#fff', letterSpacing: '0.03em' }}>SIGN UP FREE — UNLOCK LEGEND 059</span></div>
              </div>
              <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', opacity: 0.5, background: `linear-gradient(${60 + holoHue}deg, hsla(${holoHue},90%,60%,0) 20%, hsla(${(holoHue + 60) % 360},90%,65%,0.22) 38%, hsla(${(holoHue + 140) % 360},90%,60%,0) 56%)`, mixBlendMode: 'color-dodge' }} />
              <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', background: `linear-gradient(115deg, transparent ${shine - 12}%, rgba(255,255,255,0.34) ${shine}%, transparent ${shine + 12}%)`, mixBlendMode: 'overlay' }} />
            </div>
          </div>
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
    { name: 'JAPAN', flag: <FlagJPN w={84} /> },
    { name: 'SWEDEN', flag: <FlagSWE w={84} /> },
    { name: 'BRAZIL', flag: <div style={{ width: 84, height: 56, borderRadius: 6, background: '#009b3a', position: 'relative', overflow: 'hidden' }}><div style={{ position: 'absolute', left: '50%', top: '50%', width: 44, height: 30, background: '#ffdf00', transform: 'translate(-50%,-50%) rotate(45deg)' }} /><div style={{ position: 'absolute', left: '50%', top: '50%', width: 19, height: 19, borderRadius: '50%', background: '#002776', transform: 'translate(-50%,-50%)' }} /></div> },
  ];
  return (
    <div style={{ position: 'absolute', inset: 0, background: `linear-gradient(160deg, #111d3c 0%, #07090f 70%)` }}>
      <ClipSprite id="app-crowd" fit="cover" style={{ filter: 'brightness(0.4) saturate(1.1)' }} />
      <div style={{ position: 'absolute', inset: 0, background: `radial-gradient(ellipse at 50% 20%, rgba(40,70,130,0.42) 0%, rgba(7,9,15,0.86) 62%)` }} />
      <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 42, opacity: inP }}>
        <Kicker color="#9ec0f0" size={30}>The Prediction Game</Kicker>
        <BigTitle size={100} color="#fff" glow={JPN_LIGHT}>worldcup26.world</BigTitle>
        <Kicker color="#d7e2f6" size={30}>Sign Up · Pick 3 Of 48</Kicker>
        <div style={{ display: 'flex', gap: 34, marginTop: 10 }}>
          {cards.map((c, i) => {
            const cp = Easing.easeOutBack(clamp((lt - 1.2 - i * 0.35) / 0.7, 0, 1));
            return (
              <div key={i} style={{ transform: `translateY(${(1 - cp) * 60}px) scale(${0.8 + 0.2 * cp})`, opacity: clamp(cp, 0, 1), background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.18)', borderRadius: 22, padding: '30px 44px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16, minWidth: 280, boxShadow: '0 24px 70px rgba(0,0,0,0.45)' }}>
                {c.flag}
                <div style={{ fontFamily: '"Inter",sans-serif', fontWeight: 900, fontSize: 25, color: '#fff' }}>{c.name}</div>
                <div style={{ fontFamily: '"Inter",sans-serif', fontWeight: 800, fontSize: 21, color: MV.gold }}>EVERY GOAL SCORES</div>
              </div>
            );
          })}
        </div>
        <div style={{ transform: `translateY(${(1 - btnP) * 40}px) scale(${(0.8 + 0.2 * btnP) * (1 + pulse * 0.03)})`, opacity: clamp(btnP, 0, 1), marginTop: 4, display: 'flex', alignItems: 'center', gap: 16, background: 'linear-gradient(100deg, #16a34a, #0c8f3a)', borderRadius: 999, padding: '18px 50px', boxShadow: `0 14px 50px rgba(22,163,74,${0.4 + pulse * 0.45})` }}><span style={{ fontSize: 34 }}>⚡</span><span style={{ fontFamily: '"Inter",sans-serif', fontWeight: 900, fontSize: 38, color: '#fff' }}>CREATE YOUR FREE ACCOUNT</span></div>
        <div style={{ fontFamily: '"Inter",sans-serif', fontWeight: 800, fontSize: 27, color: MV.gold, opacity: clamp(btnP, 0, 1) }}>Unlock Legend 059 the moment you sign up · free · no prizes</div>
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
      <ClipSprite id="cta-celeb" fit="cover" style={{ filter: 'brightness(0.66) saturate(1.12)' }} />
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
        <span style={{ fontFamily: '"Inter",sans-serif', fontWeight: 900, fontSize: 29, color: MV.gold }}>⚡ EP60 · COLLECT LEGEND 059 · worldcup26.world</span>
      </div>
    </div>
  );
}
