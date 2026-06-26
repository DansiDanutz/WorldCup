// match-scenes.jsx — Ep70 England vs Panama — ANIMATION-FIRST + NO-REPEAT (318s body).
// "The Ghost of 2018" · Group L. OUR PREDICTION ENG 1–1 PAN (Waterman shock goal,
// Bárcenas 'El Mago' cuts inside on 43' and curls inches WIDE, England equalize
// through Kane; a level scoreline that makes the world stop talking about 2018).
// Rule #11 no-repeat · #15 no banned wording · #16 story-woven mystery (Mola teased
// "WHAT CANNOT BE ERASED?" → paid off "you don't erase the past, you layer it").
// #17 holo collectible reveal · #18 premium prediction card · #19 full-frame (no
// letterbox) · #20 15s mystic intro (intro.html).

const ENG = '#cf102d', ENG_NAVY = '#001489', PAN = '#da121a', PAN_BLUE = '#0049a5';
const HERO = { filter: 'brightness(1.05) saturate(1.14) contrast(1.05)' };

function FlagENG({ w = 120 }) {
  const h = w * 2 / 3;
  return (
    <div style={{ width: w, height: h, borderRadius: w * 0.05, position: 'relative', overflow: 'hidden', background: '#fff', boxShadow: '0 6px 18px rgba(0,0,0,0.45)' }}>
      <div style={{ position: 'absolute', left: '42%', top: 0, bottom: 0, width: '16%', background: '#cf102d' }} />
      <div style={{ position: 'absolute', top: '38%', left: 0, right: 0, height: '24%', background: '#cf102d' }} />
    </div>
  );
}
function FlagPAN({ w = 120 }) {
  const h = w * 2 / 3;
  const star = (l, t, c) => <div style={{ position: 'absolute', left: l, top: t, transform: 'translate(-50%,-50%)', color: c, fontSize: h * 0.22, lineHeight: 1 }}>★</div>;
  return (
    <div style={{ width: w, height: h, borderRadius: w * 0.05, position: 'relative', overflow: 'hidden', boxShadow: '0 6px 18px rgba(0,0,0,0.45)' }}>
      <div style={{ position: 'absolute', left: 0, top: 0, width: '50%', height: '50%', background: '#fff' }} />
      <div style={{ position: 'absolute', left: '50%', top: 0, width: '50%', height: '50%', background: '#da121a' }} />
      <div style={{ position: 'absolute', left: 0, top: '50%', width: '50%', height: '50%', background: '#0049a5' }} />
      <div style={{ position: 'absolute', left: '50%', top: '50%', width: '50%', height: '50%', background: '#fff' }} />
      {star('25%', '25%', '#0049a5')}{star('75%', '75%', '#da121a')}
    </div>
  );
}

function ScoreBug({ start, eng = 0, pan = 0, minute, badge = "OUR PREDICTION", note }) {
  const t = useTime(); const local = t - start; if (local < 0) return null;
  const inP = Easing.easeOutBack(clamp(local / 0.7, 0, 1));
  const cell = { fontFamily: '"Inter",sans-serif', fontWeight: 900, fontSize: 34, color: '#fff', padding: '10px 18px' };
  return (
    <div style={{ position: 'absolute', top: 92, left: '50%', zIndex: 30, transform: `translateX(-50%) scale(${inP})`, opacity: clamp(inP, 0, 1), display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
      <div style={{ display: 'flex', alignItems: 'center', background: MV.panel, border: `1px solid ${MV.line}`, borderRadius: 14, boxShadow: '0 10px 36px rgba(0,0,0,0.6)', overflow: 'hidden' }}>
        <div style={{ ...cell, background: ENG_NAVY }}>ENG</div>
        <div style={{ ...cell, fontSize: 38, color: MV.gold }}>{eng} — {pan}</div>
        <div style={{ ...cell, background: PAN }}>PAN</div>
        {minute && <div style={{ ...cell, fontSize: 26, color: MV.muted, borderLeft: `1px solid ${MV.line}` }}>{minute}</div>}
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <div style={{ fontFamily: '"Inter",sans-serif', fontWeight: 800, fontSize: 16, color: MV.gold, letterSpacing: '0.22em', background: 'rgba(255,210,74,0.14)', border: '1px solid rgba(255,210,74,0.5)', borderRadius: 999, padding: '4px 16px' }}>{badge}</div>
        {note && <div style={{ fontFamily: '"Inter",sans-serif', fontWeight: 900, fontSize: 16, color: '#fff', letterSpacing: '0.18em', background: PAN, border: `1px solid ${PAN}`, borderRadius: 999, padding: '4px 16px' }}>{note}</div>}
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
        {sub && <div style={{ fontSize: 24, fontWeight: 700, color: accent || MV.gold, letterSpacing: '0.2em', marginTop: 8 }}>{sub}</div>}
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

function Backdrop() { return <div style={{ position: 'absolute', inset: 0, zIndex: 0, background: 'radial-gradient(ellipse at 50% 45%, #0c0f1c 0%, #05060c 100%)' }} />; }
function FS({ id }) { return <ClipSprite id={id} fit="cover" style={HERO} />; }

function SceneColdOpen() {
  const { localTime: lt } = useSprite();
  const beat = Math.pow(Math.max(0, Math.sin(lt * Math.PI * 1.15)), 8);
  const titleP = Easing.easeOutCubic(clamp((lt - 18.0) / 1.4, 0, 1));
  const teaseLabelP = clamp((lt - 10.4) / 0.8, 0, 1) * clamp((15.0 - lt) / 0.6, 0, 1);
  return (
    <div style={{ position: 'absolute', inset: 0 }}>
      <FS id="cg-engfan" /><FS id="cg-panfan" /><FS id="cg-tease" /><FS id="cg-stadaerial" />
      <div style={{ position: 'absolute', inset: 0, background: `radial-gradient(ellipse at center, rgba(255,205,0,${(0.26 * beat).toFixed(3)}) 0%, transparent 60%)` }} />
      <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg, rgba(2,3,8,0.35) 0%, transparent 30%, transparent 60%, rgba(2,3,8,0.7) 100%)' }} />
      {teaseLabelP > 0.01 && (
        <div style={{ position: 'absolute', left: 0, right: 0, bottom: 150, textAlign: 'center', zIndex: 23, opacity: teaseLabelP }}>
          <div style={{ display: 'inline-block', fontFamily: '"Inter",sans-serif', fontWeight: 800, fontSize: 28, color: '#e8c97a', letterSpacing: '0.22em', textShadow: '0 2px 18px rgba(0,0,0,0.85)' }}>WHAT CANNOT BE ERASED?</div>
        </div>
      )}
      {lt > 18.0 && (
        <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 30, opacity: titleP, zIndex: 22 }}>
          <Kicker size={34}>A Memory To Exorcise</Kicker>
          <TitleReveal text="THE GHOST OF 2018" start={19.8} size={96} color={MV.gold} />
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
    <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg, #0c0f1c 0%, #0e1424 55%, #0c0f1c 100%)' }}>
      <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse at 50% 30%, rgba(207,16,45,0.12) 0%, transparent 55%)' }} />
      <AmbientParticles start={23.48} dur={9.5} count={30} color="207,16,45" />
      <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 40 }}>
        <div style={{ opacity: p1, transform: `translateY(${(1 - p1) * -30}px)` }}><Kicker>WorldCup26 Legends · Episode 70</Kicker></div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 64, opacity: clamp(p2, 0, 1), transform: `scale(${p2})` }}>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 18 }}><Waving><FlagENG w={220} /></Waving><BigTitle size={80} glow={ENG}>ENGLAND</BigTitle></div>
          <BigTitle size={116} color={MV.gold}>VS</BigTitle>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 18 }}><Waving speed={1.9}><FlagPAN w={220} /></Waving><BigTitle size={80} glow={PAN}>PANAMA</BigTitle></div>
        </div>
        <div style={{ opacity: p3, fontFamily: '"Inter",sans-serif', fontWeight: 600, fontSize: 32, color: MV.muted, letterSpacing: '0.08em' }}>GROUP L · THE REMATCH</div>
      </div>
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
      <div style={{ position: 'absolute', left: 0, right: 0, bottom: 120, display: 'flex', justifyContent: 'center', zIndex: 25, opacity: stripP, transform: `translateY(${(1 - stripP) * 30}px)` }}>
        <div style={{ display: 'flex', background: MV.panel, border: `1px solid ${MV.line}`, borderRadius: 16, overflow: 'hidden', backdropFilter: 'blur(6px)' }}>
          {[['GROUP L', 'THE REMATCH'], ['THREE LIONS', 'vs MAREA ROJA'], ['KANE', 'vs EL MAGO'], ['2018', '6 — 1']].map(([v, l], i) => (
            <div key={i} style={{ padding: '22px 38px', borderLeft: i ? `1px solid ${MV.line}` : 'none', textAlign: 'center' }}>
              <div style={{ fontFamily: '"Inter",sans-serif', fontWeight: 900, fontSize: 32, color: MV.gold }}>{v}</div>
              <div style={{ fontFamily: '"Inter",sans-serif', fontWeight: 700, fontSize: 16, color: MV.muted, letterSpacing: '0.14em', marginTop: 5 }}>{l}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function SceneEngland() {
  return (
    <div style={{ position: 'absolute', inset: 0 }}>
      <Sprite start={44} end={55.6}><div style={{ position: 'absolute', inset: 0 }}><FS id="eng-crowd" /><div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg, rgba(2,3,8,0.32) 0%, transparent 40%, rgba(2,3,8,0.55) 100%)' }} /><TeamBanner flag={<FlagENG w={66} />} label="THREE LIONS · ENGLAND" accent={ENG} /></div></Sprite>
      <PlayerShowcase clipId="s-kane" name="HARRY KANE" role="THE CAPTAIN" accent={ENG} start={55.5} end={61.1} />
      <PlayerShowcase clipId="s-bellingham" name="JUDE BELLINGHAM" role="THE GALÁCTICO" accent={ENG_NAVY} start={61.1} end={65.1} />
      <PlayerShowcase clipId="s-foden" name="PHIL FODEN" role="THE IMAGINATION" accent={ENG} start={65.1} end={68.1} />
      <PlayerShowcase clipId="s-rice" name="DECLAN RICE" role="THE ANCHOR" accent={ENG_NAVY} start={68.1} end={73.6} />
      <PlayerShowcase clipId="s-saka" name="BUKAYO SAKA" role="THE FLYER" accent={ENG} start={73.6} end={79.5} />
    </div>
  );
}

function ScenePanama() {
  return (
    <div style={{ position: 'absolute', inset: 0 }}>
      <Sprite start={79.5} end={90.7}><div style={{ position: 'absolute', inset: 0 }}><FS id="pan-crowd" /><div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg, rgba(2,3,8,0.32) 0%, transparent 40%, rgba(2,3,8,0.55) 100%)' }} /><TeamBanner flag={<FlagPAN w={66} />} label="MAREA ROJA · PANAMA" accent={PAN} /></div></Sprite>
      <PlayerShowcase clipId="s-carrasquilla" name="CARRASQUILLA" role="THE CONDUCTOR" accent={PAN} start={90.6} end={95.2} />
      <PlayerShowcase clipId="s-barcenas" name="EDGAR BÁRCENAS" role="EL MAGO" accent={PAN_BLUE} start={95.2} end={98.2} />
      <PlayerShowcase clipId="s-murillo" name="AMIR MURILLO" role="THE FLYER" accent={PAN} start={98.2} end={100.8} />
      <PlayerShowcase clipId="s-waterman" name="CECILIO WATERMAN" role="THE MOMENT" accent={PAN_BLUE} start={100.8} end={103} />
    </div>
  );
}

function SceneDuel() {
  return (
    <div style={{ position: 'absolute', inset: 0 }}>
      <Sprite start={103} end={113}><div style={{ position: 'absolute', inset: 0 }}><FS id="duel-eng" /><div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(90deg, rgba(207,16,45,0.42), transparent 55%)' }} /><div style={{ position: 'absolute', left: 80, bottom: 130, fontFamily: '"Inter",sans-serif', fontWeight: 900, fontSize: 64, color: '#fff', textShadow: '0 4px 26px rgba(0,0,0,0.9)' }}>THE CAPTAIN<div style={{ fontSize: 27, fontWeight: 700, color: MV.gold, letterSpacing: '0.2em', marginTop: 8 }}>KANE'S CLASS</div></div></div></Sprite>
      <Sprite start={113} end={122.5}><div style={{ position: 'absolute', inset: 0 }}><FS id="duel-mid" /><div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.25)' }} /><div style={{ position: 'absolute', left: 0, right: 0, bottom: 70, textAlign: 'center', fontFamily: '"Inter",sans-serif', fontWeight: 900, fontSize: 58, color: '#fff', textShadow: '0 4px 26px rgba(0,0,0,0.9)' }}>EIGHT YEARS LATER</div></div></Sprite>
      <Sprite start={122.5} end={132}><div style={{ position: 'absolute', inset: 0 }}><FS id="duel-pan" /><div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(270deg, rgba(218,18,26,0.44), transparent 55%)' }} /><div style={{ position: 'absolute', right: 80, bottom: 130, textAlign: 'right', fontFamily: '"Inter",sans-serif', fontWeight: 900, fontSize: 64, color: '#fff', textShadow: '0 4px 26px rgba(0,0,0,0.9)' }}>EL MAGO<div style={{ fontSize: 27, fontWeight: 700, color: MV.gold, letterSpacing: '0.2em', marginTop: 8 }}>BÁRCENAS' SPELL</div></div></div></Sprite>
    </div>
  );
}

function SceneDrama() {
  return (
    <div style={{ position: 'absolute', inset: 0 }}>
      <FS id="dr-pan-shock" /><FS id="dr-barcenas-wide" /><FS id="dr-eng-press" /><FS id="dr-eng-equalize" /><FS id="dr-pan-defend" /><FS id="dr-eng-chance" /><FS id="dr-end-level" />
      <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg, rgba(2,3,8,0.28) 0%, transparent 24%, transparent 70%, rgba(2,3,8,0.6) 100%)' }} />
      {/* Panama shock lead (Waterman), Bárcenas 43' WIDE, England equalize (Kane); a level scoreline */}
      <GoalFlash at={138.5} />
      <Sprite start={139.0} end={162.0}><ScoreBug start={139.5} eng={0} pan={1} minute="25'" badge="OUR PREDICTION" note="WATERMAN" /></Sprite>
      <ChanceTag start={143.0} end={152.0} text="43' — EL MAGO... WIDE!" sub="INCHES FROM TWO" accent="#ff6a6a" />
      <GoalFlash at={168.5} />
      <Sprite start={169.0} end={203.32}><ScoreBug start={169.5} eng={1} pan={1} minute="65'" badge="OUR PREDICTION" note="KANE" /></Sprite>
      <Sprite start={198.5} end={203.32}><PredictionCard start={199.0} /></Sprite>
      <Vignette strength={0.34} />
    </div>
  );
}

// ════════════════ RULE #18 — PREMIUM PREDICTION CARD ════════════════
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
      <span style={{ fontFamily: '"Inter",sans-serif', fontWeight: 900, fontSize: 28, color: '#fff', letterSpacing: '0.03em' }}>{name}</span>
    </div>
  );
  return (
    <div style={{ position: 'absolute', inset: 0, zIndex: 28, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(2,3,6,0.6)', opacity: p }}>
      <div style={{ width: 1010, borderRadius: 28, overflow: 'hidden', transform: `scale(${0.92 + 0.08 * p})`, boxShadow: '0 36px 130px rgba(0,0,0,0.8)', position: 'relative', border: '2px solid rgba(255,210,74,0.55)' }}>
        <div style={{ position: 'absolute', inset: 0, background: `linear-gradient(105deg, ${ENG_NAVY}33 0%, #070b14 38%, #070b14 62%, ${PAN}30 100%)` }} />
        <div style={{ position: 'absolute', top: 0, bottom: 0, left: `${sheenX}%`, width: '22%', background: 'linear-gradient(105deg, transparent, rgba(255,255,255,0.10), transparent)', transform: 'skewX(-18deg)', pointerEvents: 'none', zIndex: 5 }} />
        <div style={{ position: 'relative', zIndex: 2, background: `linear-gradient(100deg, ${ENG_NAVY} 0%, #11151f 50%, ${PAN} 100%)`, padding: '13px 0', textAlign: 'center' }}>
          <span style={{ fontFamily: '"Inter",sans-serif', fontWeight: 900, fontSize: 17, letterSpacing: '0.34em', color: '#fff' }}>WORLDCUP26 LEGENDS · OUR PREDICTION · NOT PLAYED</span>
        </div>
        <div style={{ position: 'relative', zIndex: 2, padding: '40px 70px 30px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 50 }}>
            <Badge flag={<FlagENG w={104} />} name="ENGLAND" accent={ENG} />
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, fontFamily: '"Inter",sans-serif', fontWeight: 900, fontSize: 132, color: '#fff', lineHeight: 1 }}>
                <span style={{ textShadow: `0 0 36px ${ENG}99` }}>1</span>
                <span style={{ color: MV.gold, fontSize: 64, transform: 'translateY(-6px)' }}>—</span>
                <span style={{ textShadow: `0 0 36px ${PAN}cc` }}>1</span>
              </div>
              <div style={{ fontFamily: '"Inter",sans-serif', fontWeight: 800, fontSize: 17, color: MV.muted, letterSpacing: '0.34em', marginTop: 4 }}>FULL-TIME</div>
            </div>
            <Badge flag={<FlagPAN w={104} />} name="PANAMA" accent={PAN_BLUE} />
          </div>
          <div style={{ display: 'flex', justifyContent: 'center', gap: 12, marginTop: 26, paddingTop: 22, borderTop: '1px solid rgba(255,255,255,0.12)' }}>
            <span style={{ fontFamily: '"Inter",sans-serif', fontWeight: 800, fontSize: 21, color: '#ffd4d8', background: 'rgba(218,18,26,0.16)', border: '1px solid rgba(218,18,26,0.45)', borderRadius: 999, padding: '7px 18px' }}>⚽ 25' WATERMAN · 43' BÁRCENAS WIDE</span>
            <span style={{ fontFamily: '"Inter",sans-serif', fontWeight: 800, fontSize: 21, color: '#cfe0ff', background: 'rgba(0,73,165,0.22)', border: '1px solid rgba(120,150,220,0.5)', borderRadius: 999, padding: '7px 18px' }}>⚽ 65' KANE</span>
          </div>
          <div style={{ textAlign: 'center', marginTop: 22, fontFamily: '"Inter",sans-serif', fontWeight: 900, fontSize: 23, color: MV.gold, letterSpacing: '0.16em' }}>★ PANAMA MADE THE WORLD STOP TALKING ★</div>
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
      <div style={{ position: 'absolute', inset: 0, zIndex: 24, background: `linear-gradient(160deg, #0c0f1c 0%, #05060c 100%)`, opacity: clamp((lt - 10.5) / 1.0, 0, 1) }} />
      <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 25 }}>
        <div style={{ background: MV.panel, border: `1px solid ${MV.line}`, borderRadius: 24, padding: '48px 80px', minWidth: 880, backdropFilter: 'blur(6px)', opacity: clamp((lt - 11) / 1.0, 0, 1) }}>
          <Kicker size={26}>Group L · Our Prediction</Kicker>
          <div style={{ marginTop: 24 }}>
            <StatLine start={S + 11.5} delay={0.0} label="ENGLAND" value="THREE LIONS" accent={ENG} />
            <StatLine start={S + 11.5} delay={0.25} label="PANAMA" value="LA MAREA ROJA" accent={PAN} />
            <StatLine start={S + 11.5} delay={0.5} label="OUR PREDICTION" value="ENG 1 — 1 PAN" accent="#fff" />
            <StatLine start={S + 11.5} delay={0.75} label="WATERMAN · 43' BÁRCENAS WIDE · KANE" value="THE GHOST OF 2018, LAID TO REST" accent={MV.gold} />
          </div>
        </div>
      </div>
      <Vignette strength={0.45} />
    </div>
  );
}

function SceneEngage() {
  const { localTime: lt } = useSprite();
  const headP = Easing.easeOutCubic(clamp(lt / 0.9, 0, 1));
  const cards = [
    { label: 'COMMENT ENGLAND', sub: "THREE LIONS", flag: <FlagENG w={78} />, accent: ENG },
    { label: 'COMMENT PANAMÁ', sub: "LA MAREA ROJA", flag: <FlagPAN w={78} />, accent: PAN },
  ];
  return (
    <div style={{ position: 'absolute', inset: 0 }}>
      <FS id="en-crowd" />
      <div style={{ position: 'absolute', inset: 0, background: 'rgba(6,10,18,0.62)' }} />
      <div style={{ position: 'absolute', top: 140, left: 0, right: 0, textAlign: 'center', zIndex: 25, opacity: headP }}><Kicker size={30}>Did Panama Lay The Ghost?</Kicker></div>
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
  const tiltX = Math.sin(lt * 0.9) * 7 * settle;
  const floatY = Math.sin(lt * 1.05) * 5 * settle;
  const pulse = 0.5 + 0.5 * Math.sin(lt * 3.4);
  const ring = clamp((lt - 5.2) / 1.2, 0, 1);
  const sheenY = ((lt * 34) % 150) - 25;
  const unlockP = Easing.easeOutBack(clamp((lt - 6.2) / 0.7, 0, 1));
  const stripP = Easing.easeOutCubic(clamp((lt - 12.5) / 1.2, 0, 1));
  const recent = ['legend-065', 'legend-066', 'legend-067', 'legend-068', 'legend-069'];
  return (
    <div style={{ position: 'absolute', inset: 0 }}>
      <ClipSprite id="my-mola" fit="cover" style={{ filter: 'brightness(0.62) saturate(1.12)' }} />
      <div style={{ position: 'absolute', inset: 0, background: 'rgba(4,6,12,0.62)' }} />
      <AmbientParticles start={S} dur={26} count={50} color="252,228,150" maxR={3.5} zIndex={22} />
      <div style={{ position: 'absolute', top: 56, left: 0, right: 0, textAlign: 'center', zIndex: 25, opacity: inP }}><Kicker size={26} color="#e8c97a">The Past, Stitched In Layers · Legend No. 070</Kicker></div>
      {teaseP > 0.01 && (
        <div style={{ position: 'absolute', left: '50%', top: '46%', zIndex: 24, pointerEvents: 'none', transform: `translate(-50%,-50%) scale(${0.8 + teasePulse * 0.12})`, opacity: teaseP, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 18 }}>
          <div style={{ width: 200, height: 200, borderRadius: '50%', background: 'radial-gradient(circle at 38% 32%, rgba(255,233,160,0.95), rgba(201,148,46,0.5) 70%)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: `0 0 ${50 + teasePulse * 40}px rgba(245,208,22,0.7)` }}><span style={{ fontFamily: '"Inter",sans-serif', fontWeight: 900, fontSize: 130, color: '#2a1c04' }}>?</span></div>
          <div style={{ fontFamily: '"Inter",sans-serif', fontWeight: 900, fontSize: 30, color: '#ffe9a0', letterSpacing: '0.2em', textShadow: '0 2px 18px rgba(0,0,0,0.8)' }}>A STORY YOU CANNOT UNPICK</div>
        </div>
      )}
      {ring > 0 && ring < 1 && <div style={{ position: 'absolute', left: '50%', top: '46%', zIndex: 23, pointerEvents: 'none', width: 740, height: 740, transform: `translate(-50%,-50%) scale(${0.3 + ring * 1.5})`, opacity: (1 - ring) * 0.8, borderRadius: '50%', border: '3px solid rgba(255,225,150,0.7)', boxShadow: '0 0 60px rgba(245,208,22,0.5)' }} />}
      {burst > 0 && burst < 1 && <div style={{ position: 'absolute', left: '50%', top: '46%', zIndex: 24, pointerEvents: 'none', width: 980, height: 980, transform: `translate(-50%,-50%) scale(${0.4 + burst * 1.3})`, opacity: (1 - burst) * 0.9, background: 'radial-gradient(circle, rgba(255,233,160,0.55) 0%, rgba(245,208,22,0.18) 30%, transparent 62%)', borderRadius: '50%' }} />}
      {cardP > 0 && (
        <div style={{ position: 'absolute', left: '50%', top: '44%', zIndex: 25, opacity: clamp(cardP, 0, 1), perspective: 1700, transform: `translate(-50%,-50%) translateY(${(1 - cardP) * 40 + floatY}px) scale(${0.86 + 0.1 * cardP})` }}>
          {unlockP > 0 && (
            <div style={{ position: 'absolute', top: -64, left: '50%', transform: `translateX(-50%) scale(${unlockP})`, zIndex: 28, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 5, whiteSpace: 'nowrap' }}>
              <div style={{ fontFamily: '"Inter",sans-serif', fontWeight: 900, fontSize: 30, letterSpacing: '0.26em', color: '#ffe9a0', textShadow: '0 2px 16px rgba(0,0,0,0.9)' }}>★ LEGEND UNLOCKED ★</div>
              <div style={{ fontFamily: '"Inter",sans-serif', fontWeight: 800, fontSize: 17, letterSpacing: '0.3em', color: '#f5d016' }}>Nº 070 · ✦✦✦ ULTRA RARE</div>
            </div>
          )}
          <div style={{ position: 'relative', transformStyle: 'preserve-3d', transform: `rotateY(${flipDeg + tiltX}deg)`, borderRadius: 20, overflow: 'hidden', boxShadow: `0 30px 120px rgba(0,0,0,0.8), 0 0 ${50 + settle * 50}px rgba(245,208,22,${0.22 + settle * 0.33})` }}>
            <img data-seq="" src="assets/legend-070-portrait.png" alt="" style={{ height: 760, width: 'auto', display: 'block' }} />
            <div style={{ position: 'absolute', left: 0, right: 0, top: `${sheenY}%`, height: '26%', background: 'linear-gradient(180deg, transparent, rgba(255,255,255,0.16), rgba(180,235,255,0.10), transparent)', pointerEvents: 'none', mixBlendMode: 'screen' }} />
          </div>
        </div>
      )}
      {stripP > 0.02 && (
        <div style={{ position: 'absolute', left: '50%', bottom: 120, zIndex: 26, transform: `translateX(-50%) translateY(${(1 - stripP) * 30}px)`, opacity: stripP, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}>
          <div style={{ display: 'flex', alignItems: 'flex-end', gap: 12 }}>
            {recent.map((c, i) => (
              <div key={i} style={{ width: 78, height: 110, borderRadius: 8, overflow: 'hidden', border: '1px solid rgba(255,255,255,0.25)', boxShadow: '0 6px 18px rgba(0,0,0,0.5)', opacity: 0.62, filter: 'saturate(0.9)' }}>
                <img data-seq="" src={`assets/${c}-portrait.png`} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              </div>
            ))}
            <div style={{ width: 96, height: 134, borderRadius: 9, overflow: 'hidden', border: `2px solid ${MV.gold}`, boxShadow: `0 8px 26px rgba(0,0,0,0.6), 0 0 ${16 + pulse * 14}px rgba(245,208,22,0.7)`, transform: `scale(${1 + pulse * 0.03})` }}>
              <img data-seq="" src="assets/legend-070-portrait.png" alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            </div>
          </div>
          <div style={{ fontFamily: '"Inter",sans-serif', fontWeight: 900, fontSize: 22, color: '#fff', letterSpacing: '0.14em' }}>LEGEND <span style={{ color: MV.gold }}>070</span> OF 66 · <span style={{ color: MV.gold }}>COLLECT THEM ALL</span></div>
        </div>
      )}
      {settle > 0.2 && (
        <div style={{ position: 'absolute', left: '50%', bottom: 46, zIndex: 26, transform: 'translateX(-50%)', display: 'flex', alignItems: 'center', gap: 16, opacity: settle }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 10, background: 'rgba(255,210,74,0.16)', border: '1px solid rgba(255,210,74,0.6)', borderRadius: 999, padding: '11px 24px' }}><span style={{ fontSize: 20 }}>✦</span><span style={{ fontFamily: '"Inter",sans-serif', fontWeight: 800, fontSize: 21, color: MV.gold, letterSpacing: '0.05em' }}>worldcup26.world</span></div>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 12, background: 'linear-gradient(100deg, #16a34a, #0e8a3c)', borderRadius: 999, padding: '13px 30px', transform: `scale(${1 + pulse * 0.04})`, boxShadow: `0 8px 30px rgba(22,163,74,${0.35 + pulse * 0.4})` }}><span style={{ fontSize: 20 }}>⚡</span><span style={{ fontFamily: '"Inter",sans-serif', fontWeight: 900, fontSize: 22, color: '#fff', letterSpacing: '0.03em' }}>SIGN UP FREE — CLAIM LEGEND 070</span></div>
        </div>
      )}
      <Vignette strength={0.5} />
    </div>
  );
}

function SceneApp() {
  const { localTime: lt } = useSprite();
  const inP = Easing.easeOutCubic(clamp(lt / 1.0, 0, 1));
  const btnP = Easing.easeOutBack(clamp((lt - 2.4) / 0.7, 0, 1));
  const pulse = 0.5 + 0.5 * Math.sin(lt * 3.4);
  const cards = [
    { name: 'ENGLAND', flag: <FlagENG w={84} /> },
    { name: 'PANAMA', flag: <FlagPAN w={84} /> },
    { name: 'BRAZIL', flag: <div style={{ width: 84, height: 56, borderRadius: 6, background: '#009b3a', position: 'relative', overflow: 'hidden' }}><div style={{ position: 'absolute', left: '50%', top: '50%', width: 44, height: 30, background: '#ffdf00', transform: 'translate(-50%,-50%) rotate(45deg)' }} /><div style={{ position: 'absolute', left: '50%', top: '50%', width: 19, height: 19, borderRadius: '50%', background: '#002776', transform: 'translate(-50%,-50%)' }} /></div> },
  ];
  return (
    <div style={{ position: 'absolute', inset: 0, background: `linear-gradient(160deg, #0e1424 0%, #07090f 70%)` }}>
      <div style={{ position: 'absolute', inset: 0, background: `radial-gradient(ellipse at 50% 20%, rgba(40,80,170,0.4) 0%, rgba(7,9,15,0.92) 62%)` }} />
      <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 42, opacity: inP }}>
        <Kicker color="#9ebbf0" size={30}>The Prediction Game</Kicker>
        <BigTitle size={100} color="#fff" glow={ENG_NAVY}>worldcup26.world</BigTitle>
        <Kicker color="#cfddf6" size={30}>Sign Up · Pick 3 Of 48</Kicker>
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
        <div style={{ fontFamily: '"Inter",sans-serif', fontWeight: 800, fontSize: 27, color: MV.gold, opacity: clamp(btnP, 0, 1) }}>Unlock Legend 070 the moment you sign up · free · no prizes</div>
      </div>
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
        <CtaButton start={S} delay={1.6} label="LIKE" icon="👍" accent="#b3000f" x={960} />
        <CtaButton start={S} delay={2.0} label="SHARE" icon="📣" accent="#106b4f" x={1400} />
      </div>
      <Sprite start={307.65} end={318.05}><NextMatchTease start={S + 4.6} /></Sprite>
    </div>
  );
}
function NextMatchTease({ start }) {
  const t = useTime(); const p = Easing.easeOutCubic(clamp((t - start) / 0.8, 0, 1));
  return (
    <div style={{ position: 'absolute', left: 0, right: 0, bottom: 140, display: 'flex', justifyContent: 'center', zIndex: 26, opacity: p, transform: `translateY(${(1 - p) * 24}px)` }}>
      <div style={{ background: MV.panel, border: `1px solid ${MV.line}`, borderRadius: 999, padding: '18px 50px', display: 'flex', alignItems: 'center', gap: 20 }}>
        <span style={{ fontFamily: '"Inter",sans-serif', fontWeight: 700, fontSize: 25, color: MV.muted, letterSpacing: '0.14em' }}>NEXT EPISODE</span>
        <span style={{ fontFamily: '"Inter",sans-serif', fontWeight: 900, fontSize: 29, color: MV.gold }}>⚡ EP71 · NEW LEGEND EVERY MATCH · worldcup26.world</span>
      </div>
    </div>
  );
}
