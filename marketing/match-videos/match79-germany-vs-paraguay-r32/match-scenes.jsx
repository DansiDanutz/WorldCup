// match-scenes.jsx — Ep79 Germany vs Paraguay (R32) — PHOTOREAL + NO-REPEAT/NO-LOOP.
// "The Sleeping Giant Wakes". OUR PREDICTION GER 1-0 PAR (Havertz heads the winner in the
// 88th, rhyming with the real 2002 R16 Germany 1-0 Paraguay, Neuville 88'); Paraguay resist
// heroically and nearly steal it (Enciso shot WIDE). Mystic (#21): GERMANY = Barbarossa the
// sleeping emperor + Black Forest (cold-open motif); PARAGUAY = the Pombero, lord of the night
// -> Legend 076 = The Pombero, Lord of the Night.
// #22 photoreal · #23 name<->image SYNC · #24 footer real mini-cards 071-075 + phone collect
// · #25 NO blank frames.

const GER_WHITE = '#eef1f6', GER_GOLD = '#d8a01e', GER_RED = '#cf1326';
const PAR_RED = '#cf1326', PAR_BLUE = '#234aa0';
const ACC = '#d8a01e';           // gold — Barbarossa's gold / the German gold band
const GRADE = { filter: 'saturate(1.06) contrast(1.04)' };

function FlagGER({ w = 120 }) {
  const h = w * 2 / 3;
  return (
    <div style={{ width: w, height: h, borderRadius: w * 0.05, position: 'relative', overflow: 'hidden', boxShadow: '0 6px 18px rgba(0,0,0,0.45)' }}>
      <div style={{ height: '33.34%', background: '#161616' }} />
      <div style={{ height: '33.33%', background: GER_RED }} />
      <div style={{ height: '33.33%', background: GER_GOLD }} />
    </div>
  );
}
function FlagPAR({ w = 120 }) {
  const h = w * 2 / 3;
  return (
    <div style={{ width: w, height: h, borderRadius: w * 0.05, position: 'relative', overflow: 'hidden', boxShadow: '0 6px 18px rgba(0,0,0,0.45)' }}>
      <div style={{ height: '33.34%', background: PAR_RED }} />
      <div style={{ height: '33.33%', background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ width: h * 0.18, height: h * 0.18, borderRadius: '50%', background: ACC, border: '1px solid #b88a00' }} />
      </div>
      <div style={{ height: '33.33%', background: PAR_BLUE }} />
    </div>
  );
}

function FS({ id, style }) { return <ClipSprite id={id} fit="cover" style={{ ...GRADE, ...(style || {}) }} />; }
function FSDim({ id, dim = 0.55, children }) {
  return (
    <div style={{ position: 'absolute', inset: 0 }}>
      <FS id={id} style={{ filter: `saturate(1.04) contrast(1.02) brightness(${1 - dim * 0.7})` }} />
      <div style={{ position: 'absolute', inset: 0, background: `rgba(3,5,10,${dim})` }} />
      {children}
    </div>
  );
}
function NightField({ o = 0.6 }) {
  const { localTime: lt } = useSprite();
  const pulse = 0.5 + 0.5 * Math.sin(lt * 1.1);
  return (
    <div style={{ position: 'absolute', inset: 0, zIndex: 0 }}>
      <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse at 50% 44%, #1c1a12 0%, #121008 60%, #05060c 100%)' }} />
      <div style={{ position: 'absolute', inset: 0, background: `radial-gradient(ellipse at 50% 42%, rgba(216,160,30,${(0.13 * pulse * o).toFixed(3)}) 0%, transparent 55%)` }} />
    </div>
  );
}
function AuroraBeat({ start, dur, count = 30 }) {
  const { localTime: lt } = useSprite();
  const drift = Math.sin(lt * 0.5) * 6;
  return (
    <div style={{ position: 'absolute', inset: 0, zIndex: 0 }}>
      <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse at 50% 48%, #1f1a10 0%, #14110a 55%, #060a0c 100%)' }} />
      <div style={{ position: 'absolute', inset: 0, background: `radial-gradient(ellipse at ${50 + drift}% 40%, rgba(216,160,30,0.18) 0%, transparent 52%)` }} />
      <div style={{ position: 'absolute', inset: 0, background: `radial-gradient(ellipse at ${50 - drift}% 64%, rgba(207,19,38,0.20) 0%, transparent 55%)` }} />
      <AmbientParticles start={start} dur={dur} count={count} color="216,160,30" />
    </div>
  );
}

function ScoreBug({ start, ger = 0, par = 0, minute, badge = 'OUR PREDICTION', note }) {
  const t = useTime(); const local = t - start; if (local < 0) return null;
  const inP = Easing.easeOutBack(clamp(local / 0.7, 0, 1));
  const cell = { fontFamily: '"Inter",sans-serif', fontWeight: 900, fontSize: 34, color: '#fff', padding: '10px 18px' };
  return (
    <div style={{ position: 'absolute', top: 92, left: '50%', zIndex: 30, transform: `translateX(-50%) scale(${inP})`, opacity: clamp(inP, 0, 1), display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
      <div style={{ display: 'flex', alignItems: 'center', background: MV.panel, border: `1px solid ${MV.line}`, borderRadius: 14, boxShadow: '0 10px 36px rgba(0,0,0,0.6)', overflow: 'hidden' }}>
        <div style={{ ...cell, background: '#1c1c1c' }}>GER</div>
        <div style={{ ...cell, fontSize: 38, color: ACC }}>{ger} — {par}</div>
        <div style={{ ...cell, background: PAR_RED }}>PAR</div>
        {minute && <div style={{ ...cell, fontSize: 26, color: MV.muted, borderLeft: `1px solid ${MV.line}` }}>{minute}</div>}
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <div style={{ fontFamily: '"Inter",sans-serif', fontWeight: 800, fontSize: 16, color: ACC, letterSpacing: '0.22em', background: 'rgba(216,160,30,0.14)', border: '1px solid rgba(216,160,30,0.5)', borderRadius: 999, padding: '4px 16px' }}>{badge}</div>
        {note && <div style={{ fontFamily: '"Inter",sans-serif', fontWeight: 900, fontSize: 16, color: '#1a1206', letterSpacing: '0.18em', background: ACC, border: `1px solid ${ACC}`, borderRadius: 999, padding: '4px 16px' }}>{note}</div>}
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
        {sub && <div style={{ fontSize: 24, fontWeight: 700, color: accent || ACC, letterSpacing: '0.2em', marginTop: 8 }}>{sub}</div>}
      </div>
    </div>
  );
}

function PlayerShowcase({ clipId, name, role, accent, start, end }) {
  const t = useTime(); if (t < start || t > end) return null;
  const inP = Easing.easeOutCubic(clamp((t - start) / 0.4, 0, 1));
  const fade = t > end - 0.3 ? clamp((end - t) / 0.3, 0, 1) : 1;
  const slide = (1 - inP) * 60;
  return (
    <div style={{ position: 'absolute', inset: 0, zIndex: 12, opacity: fade }}>
      <ClipSprite id={clipId} fit="cover" style={GRADE} />
      <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg, rgba(0,0,0,0.24) 0%, transparent 18%, transparent 38%, rgba(2,3,8,0.90) 74%, rgba(2,3,8,0.97) 100%)' }} />
      <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: 12, background: accent, boxShadow: `0 0 30px ${accent}` }} />
      <div style={{ position: 'absolute', left: 80, bottom: 120, transform: `translateX(${-slide}px)`, opacity: inP }}>
        <div style={{ display: 'inline-block', background: accent, color: '#06121a', fontFamily: '"Inter",sans-serif', fontWeight: 800, fontSize: 22, letterSpacing: '0.2em', padding: '6px 18px', borderRadius: 6, marginBottom: 14 }}>{role}</div>
        <div style={{ fontFamily: '"Inter",sans-serif', fontWeight: 900, fontSize: 72, color: '#fff', letterSpacing: '0.01em', lineHeight: 1, textShadow: '0 6px 30px rgba(0,0,0,0.85)' }}>{name}</div>
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
        {flag}<span style={{ fontFamily: '"Inter",sans-serif', fontWeight: 900, fontSize: 36, color: '#fff', letterSpacing: '0.10em' }}>{label}</span>
        <div style={{ width: 14, height: 14, borderRadius: '50%', background: accent, boxShadow: `0 0 16px ${accent}` }} />
      </div>
    </div>
  );
}
function Backdrop() { return <div style={{ position: 'absolute', inset: 0, zIndex: 0, background: 'radial-gradient(ellipse at 50% 45%, #14120c 0%, #05060c 100%)' }} />; }

function SceneColdOpen() {
  const { localTime: lt } = useSprite();
  const beat = Math.pow(Math.max(0, Math.sin(lt * Math.PI * 1.1)), 8);
  const teaseP = clamp((lt - 6.5) / 0.8, 0, 1) * clamp((14.0 - lt) / 0.6, 0, 1);
  const titleP = Easing.easeOutCubic(clamp((lt - 19.2) / 1.4, 0, 1));
  return (
    <div style={{ position: 'absolute', inset: 0 }}>
      {lt >= 19.4 && <NightField o={0.9} />}
      <FS id="ger-barbarossa" /><FS id="par-pombero" /><FS id="ger-blackforest" /><FS id="texture-ravens" />
      <div style={{ position: 'absolute', inset: 0, background: `radial-gradient(ellipse at center, rgba(216,160,30,${(0.20 * beat).toFixed(3)}) 0%, transparent 60%)` }} />
      <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg, rgba(2,3,8,0.34) 0%, transparent 30%, transparent 56%, rgba(2,3,8,0.76) 100%)' }} />
      {teaseP > 0.01 && (
        <div style={{ position: 'absolute', left: 0, right: 0, bottom: 150, textAlign: 'center', zIndex: 23, opacity: teaseP }}>
          <div style={{ display: 'inline-block', fontFamily: '"Inter",sans-serif', fontWeight: 800, fontSize: 30, color: '#f0dca6', letterSpacing: '0.22em', textShadow: '0 2px 18px rgba(0,0,0,0.85)' }}>THE GIANT SLEEPS. THE NIGHT KEEPS WATCH.</div>
        </div>
      )}
      {lt > 19.2 && (
        <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 26, opacity: titleP, zIndex: 22 }}>
          <Kicker size={32} color={ACC}>The Machine vs The Night</Kicker>
          <TitleReveal text="THE MOUNTAIN KING" start={20.0} size={92} color={ACC} />
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
      <NightField o={1} />
      <AmbientParticles start={23.0} dur={10} count={34} color="216,160,30" />
      <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 38 }}>
        <div style={{ opacity: p1, transform: `translateY(${(1 - p1) * -30}px)` }}><Kicker>WorldCup26 Legends · Episode 79 · Last 32</Kicker></div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 56, opacity: clamp(p2, 0, 1), transform: `scale(${p2})` }}>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 18 }}><Waving><FlagGER w={210} /></Waving><BigTitle size={70} glow={GER_GOLD}>GERMANY</BigTitle></div>
          <BigTitle size={108} color={ACC}>VS</BigTitle>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 18 }}><Waving speed={1.9}><FlagPAR w={210} /></Waving><BigTitle size={66} glow={PAR_RED}>PARAGUAY</BigTitle></div>
        </div>
        <div style={{ opacity: p3, fontFamily: '"Inter",sans-serif', fontWeight: 600, fontSize: 30, color: MV.muted, letterSpacing: '0.10em' }}>THE MACHINE vs THE NIGHT</div>
      </div>
    </div>
  );
}

function SceneStadium() {
  const { localTime: lt } = useSprite();
  const stripP = Easing.easeOutCubic(clamp((lt - 1.2) / 0.9, 0, 1));
  return (
    <div style={{ position: 'absolute', inset: 0 }}>
      <NightField o={0.5} />
      <FS id="pitch-walkout" /><FS id="stadium-wide" />
      <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg, transparent 50%, rgba(2,3,8,0.8) 100%)' }} />
      <div style={{ position: 'absolute', left: 0, right: 0, bottom: 120, display: 'flex', justifyContent: 'center', zIndex: 25, opacity: stripP, transform: `translateY(${(1 - stripP) * 30}px)` }}>
        <div style={{ display: 'flex', background: MV.panel, border: `1px solid ${MV.line}`, borderRadius: 16, overflow: 'hidden', backdropFilter: 'blur(6px)' }}>
          {[['4 STARS', 'GERMANY'], ['16 YEARS', 'PARAGUAY WAITED'], ['MACHINE', 'vs THE WALL'], ['LAST 32', 'WIN OR GO HOME']].map(([v, l], i) => (
            <div key={i} style={{ padding: '22px 34px', borderLeft: i ? `1px solid ${MV.line}` : 'none', textAlign: 'center' }}>
              <div style={{ fontFamily: '"Inter",sans-serif', fontWeight: 900, fontSize: 26, color: ACC }}>{v}</div>
              <div style={{ fontFamily: '"Inter",sans-serif', fontWeight: 700, fontSize: 14, color: MV.muted, letterSpacing: '0.10em', marginTop: 5 }}>{l}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function SceneGermany() {
  return (
    <div style={{ position: 'absolute', inset: 0 }}>
      <NightField o={0.5} />
      <Sprite start={44} end={49}><div style={{ position: 'absolute', inset: 0 }}><FS id="ger-crowd" /><div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg, rgba(2,3,8,0.30) 0%, transparent 40%, rgba(2,3,8,0.55) 100%)' }} /><TeamBanner flag={<FlagGER w={64} />} label="DIE MANNSCHAFT · GERMANY" accent={GER_GOLD} /></div></Sprite>
      <Sprite start={49} end={54}><div style={{ position: 'absolute', inset: 0 }}><FS id="ger-tifo" /><div style={{ position: 'absolute', inset: 0, background: 'rgba(2,3,8,0.32)' }} /></div></Sprite>
      <Sprite start={54} end={55.5}><div style={{ position: 'absolute', inset: 0 }}><FS id="ger-attack" /><div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(90deg, rgba(216,160,30,0.26), transparent 55%)' }} /></div></Sprite>
      <PlayerShowcase clipId="ger-wirtz" name="FLORIAN WIRTZ" role="THE HEARTBEAT · 10" accent={GER_GOLD} start={55.5} end={59.5} />
      <PlayerShowcase clipId="ger-musiala" name="JAMAL MUSIALA" role="THE MAGICIAN · 14" accent={GER_WHITE} start={59.5} end={63.9} />
      <PlayerShowcase clipId="ger-havertz" name="KAI HAVERTZ" role="THE SPEARHEAD · 7" accent={GER_GOLD} start={63.9} end={68.0} />
      <PlayerShowcase clipId="ger-kimmich" name="JOSHUA KIMMICH" role="THE CAPTAIN · 6" accent={GER_WHITE} start={68.0} end={70.8} />
      <PlayerShowcase clipId="ger-rudiger" name="ANTONIO RÜDIGER" role="THE WALL · 2" accent={GER_GOLD} start={70.8} end={75.8} />
    </div>
  );
}

function SceneParaguay() {
  return (
    <div style={{ position: 'absolute', inset: 0 }}>
      <NightField o={0.5} />
      <Sprite start={79.5} end={84.5}><div style={{ position: 'absolute', inset: 0 }}><FS id="par-crowd" /><div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg, rgba(2,3,8,0.30) 0%, transparent 40%, rgba(2,3,8,0.55) 100%)' }} /><TeamBanner flag={<FlagPAR w={64} />} label="LOS GUARANÍES · PARAGUAY" accent={PAR_RED} /></div></Sprite>
      <Sprite start={84.5} end={90.6}><div style={{ position: 'absolute', inset: 0 }}><FS id="par-tifo" /><div style={{ position: 'absolute', inset: 0, background: 'rgba(2,3,8,0.32)' }} /></div></Sprite>
      <PlayerShowcase clipId="par-gomez" name="GUSTAVO GÓMEZ" role="CAPTAIN · THE WALL · 15" accent={PAR_RED} start={90.6} end={94.9} />
      <PlayerShowcase clipId="par-almiron" name="MIGUEL ALMIRÓN" role="THE SPARK · 10" accent={ACC} start={94.9} end={97.4} />
      <PlayerShowcase clipId="par-enciso" name="JULIO ENCISO" role="THE FLAME · 11" accent={PAR_RED} start={97.4} end={102.4} />
      <PlayerShowcase clipId="par-diego" name="DIEGO GÓMEZ" role="THE ENGINE · 8" accent={ACC} start={103.0} end={105.9} />
      <PlayerShowcase clipId="par-sanabria" name="ANTONIO SANABRIA" role="THE SPEARHEAD · 9" accent={PAR_RED} start={105.9} end={110.9} />
    </div>
  );
}

function SceneRiddle() {
  return (
    <div style={{ position: 'absolute', inset: 0 }}>
      <NightField o={0.5} />
      <Sprite start={113} end={118}><div style={{ position: 'absolute', inset: 0 }}><FS id="duel-mid" /><div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.24)' }} /><div style={{ position: 'absolute', left: 0, right: 0, bottom: 70, textAlign: 'center', fontFamily: '"Inter",sans-serif', fontWeight: 900, fontSize: 54, color: '#fff', textShadow: '0 4px 26px rgba(0,0,0,0.9)' }}>THE MACHINE vs THE WALL</div></div></Sprite>
      <Sprite start={118} end={123}><div style={{ position: 'absolute', inset: 0 }}><FS id="stadium-aerial" /><div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse at 50% 50%, transparent 35%, rgba(2,3,8,0.6) 100%)' }} /></div></Sprite>
      <Sprite start={123} end={132}><div style={{ position: 'absolute', inset: 0 }}><AuroraBeat start={123} dur={9} count={24} /><div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><div style={{ fontFamily: '"Inter",sans-serif', fontWeight: 900, fontSize: 58, color: ACC, letterSpacing: '0.06em', textAlign: 'center', textShadow: '0 4px 26px rgba(0,0,0,0.9)' }}>CAN THE WALL<br />REFUSE TO FALL?</div></div></div></Sprite>
    </div>
  );
}

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
      <span style={{ fontFamily: '"Inter",sans-serif', fontWeight: 900, fontSize: 25, color: '#fff', letterSpacing: '0.03em' }}>{name}</span>
    </div>
  );
  return (
    <div style={{ position: 'absolute', inset: 0, zIndex: 28, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(2,3,6,0.62)', opacity: p }}>
      <div style={{ width: 1010, borderRadius: 28, overflow: 'hidden', transform: `scale(${0.92 + 0.08 * p})`, boxShadow: '0 36px 130px rgba(0,0,0,0.8)', position: 'relative', border: '2px solid rgba(216,160,30,0.55)' }}>
        <div style={{ position: 'absolute', inset: 0, background: `linear-gradient(105deg, #16161688 0%, #070b14 38%, #070b14 62%, ${PAR_RED}33 100%)` }} />
        <div style={{ position: 'absolute', top: 0, bottom: 0, left: `${sheenX}%`, width: '22%', background: 'linear-gradient(105deg, transparent, rgba(255,255,255,0.10), transparent)', transform: 'skewX(-18deg)', pointerEvents: 'none', zIndex: 5 }} />
        <div style={{ position: 'relative', zIndex: 2, background: `linear-gradient(100deg, #1c1c1c 0%, ${ACC} 50%, ${PAR_RED} 100%)`, padding: '13px 0', textAlign: 'center' }}>
          <span style={{ fontFamily: '"Inter",sans-serif', fontWeight: 900, fontSize: 17, letterSpacing: '0.30em', color: '#fff' }}>WORLDCUP26 LEGENDS · OUR PREDICTION · NOT PLAYED</span>
        </div>
        <div style={{ position: 'relative', zIndex: 2, padding: '40px 70px 30px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 50 }}>
            <Badge flag={<FlagGER w={104} />} name="GERMANY" accent={GER_GOLD} />
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, fontFamily: '"Inter",sans-serif', fontWeight: 900, fontSize: 132, color: '#fff', lineHeight: 1 }}>
                <span style={{ textShadow: `0 0 36px ${GER_GOLD}cc` }}>2</span>
                <span style={{ color: ACC, fontSize: 64, transform: 'translateY(-6px)' }}>—</span>
                <span style={{ textShadow: `0 0 36px ${PAR_RED}cc` }}>0</span>
              </div>
              <div style={{ fontFamily: '"Inter",sans-serif', fontWeight: 800, fontSize: 17, color: MV.muted, letterSpacing: '0.34em', marginTop: 4 }}>FULL-TIME</div>
            </div>
            <Badge flag={<FlagPAR w={104} />} name="PARAGUAY" accent={PAR_RED} />
          </div>
          <div style={{ display: 'flex', justifyContent: 'center', gap: 12, marginTop: 26, paddingTop: 22, borderTop: '1px solid rgba(255,255,255,0.12)' }}>
            <span style={{ fontFamily: '"Inter",sans-serif', fontWeight: 800, fontSize: 21, color: '#f3e6c4', background: 'rgba(216,160,30,0.16)', border: '1px solid rgba(216,160,30,0.45)', borderRadius: 999, padding: '7px 18px' }}>⚽ WIRTZ 78' · HAVERTZ 88'</span>
          </div>
          <div style={{ textAlign: 'center', marginTop: 22, fontFamily: '"Inter",sans-serif', fontWeight: 900, fontSize: 22, color: ACC, letterSpacing: '0.14em' }}>★ TWO LATE GOALS ★</div>
          <div style={{ textAlign: 'center', marginTop: 6, fontFamily: '"Inter",sans-serif', fontWeight: 700, fontSize: 16, color: MV.muted, letterSpacing: '0.2em' }}>worldcup26.world</div>
        </div>
        {stampP > 0 && <div style={{ position: 'absolute', top: 70, right: -6, zIndex: 6, transform: `rotate(-12deg) scale(${stampP})`, border: `4px solid ${ACC}`, color: ACC, borderRadius: 12, padding: '8px 22px', fontFamily: '"Inter",sans-serif', fontWeight: 900, fontSize: 24, letterSpacing: '0.14em', background: 'rgba(7,9,15,0.92)' }}>OUR STORY</div>}
      </div>
    </div>
  );
}

function SceneDrama() {
  return (
    <div style={{ position: 'absolute', inset: 0 }}>
      <Backdrop />
      <Sprite start={132} end={137}><div style={{ position: 'absolute', inset: 0 }}><FS id="keeper-save" /><ChanceTag start={132.5} end={137} text="PARAGUAY DEFEND" sub="BODIES ON THE LINE" accent={PAR_RED} /></div></Sprite>
      <Sprite start={137} end={144}><div style={{ position: 'absolute', inset: 0 }}><AuroraBeat start={137} dur={7} count={22} /><div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><div style={{ fontFamily: '"Inter",sans-serif', fontWeight: 900, fontSize: 60, color: '#fff', textAlign: 'center', textShadow: '0 4px 30px rgba(0,0,0,0.9)' }}>THE MACHINE<br />IS PATIENT</div></div></div></Sprite>
      <Sprite start={144} end={152.21}><div style={{ position: 'absolute', inset: 0 }}><AuroraBeat start={144} dur={8.2} count={26} /><div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><div style={{ fontFamily: '"Inter",sans-serif', fontWeight: 900, fontSize: 78, color: '#fff', letterSpacing: '0.02em', textAlign: 'center', textShadow: '0 4px 30px rgba(0,0,0,0.9)' }}>BUT THE WALL<br />DOES NOT CRACK</div></div></div></Sprite>
      <Sprite start={152.21} end={159}><div style={{ position: 'absolute', inset: 0 }}><FS id="enciso-shot" /><ChanceTag start={152.7} end={159} text="ENCISO — SO CLOSE!" sub="JUST WIDE · THE STADIUM GASPS" accent="#ffd0d0" /></div></Sprite>
      <Sprite start={159} end={172}><div style={{ position: 'absolute', inset: 0 }}><AuroraBeat start={159} dur={13} count={24} /><div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><div style={{ fontFamily: '"Inter",sans-serif', fontWeight: 900, fontSize: 70, color: '#fff', textAlign: 'center', textShadow: '0 4px 30px rgba(0,0,0,0.9)' }}>INCHES FROM THE UPSET<div style={{ fontSize: 28, fontWeight: 800, color: ACC, letterSpacing: '0.16em', marginTop: 14 }}>THE RAVENS SCATTER</div></div></div></div></Sprite>
      <Sprite start={172} end={178.46}><div style={{ position: 'absolute', inset: 0 }}><FS id="gomez-block" /><ChanceTag start={172.5} end={178.46} text="GÓMEZ — A WALL OF ONE" sub="ONE LAST HEROIC BLOCK" accent={PAR_RED} /></div></Sprite>
      <Sprite start={178.46} end={189.58}><div style={{ position: 'absolute', inset: 0 }}><FS id="wirtz-magic" /><GoalFlash at={179.9} /><ChanceTag start={180.3} end={189.58} text="GOAL! WIRTZ · 78'" sub="THE MOUNTAIN WAKES" accent={ACC} /></div></Sprite>
      <Sprite start={189.58} end={194}><div style={{ position: 'absolute', inset: 0 }}><FS id="havertz-goal" /><GoalFlash at={191.0} /><ChanceTag start={191.4} end={194} text="GOAL! HAVERTZ · 88'" sub="TWO — NIL" accent={ACC} /></div></Sprite>
      <Sprite start={194} end={203.32}><div style={{ position: 'absolute', inset: 0 }}><ScoreBug start={194.2} ger={2} par={0} minute="88'" badge="OUR PREDICTION" note="HAVERTZ" /><PredictionCard start={195.0} /></div></Sprite>
      <Vignette strength={0.32} />
    </div>
  );
}

function SceneVerdict() {
  const t = useTime();
  const panelP = Easing.easeOutCubic(clamp((t - 219.0) / 1.0, 0, 1));
  return (
    <div style={{ position: 'absolute', inset: 0 }}>
      <Sprite start={203.32} end={208.32}><div style={{ position: 'absolute', inset: 0 }}><FS id="vd-handshake" /><div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg, rgba(2,3,8,0.25) 0%, transparent 45%, rgba(2,3,8,0.55) 100%)' }} /><div style={{ position: 'absolute', left: 0, right: 0, top: 120, textAlign: 'center', zIndex: 24 }}><Kicker size={28} color={ACC}>They Made A Giant Sweat</Kicker></div></div></Sprite>
      <Sprite start={208.32} end={213.32}><FS id="vd-applaud" /></Sprite>
      <Sprite start={213.32} end={218.32}><FS id="vd-stadium-night" /></Sprite>
      <Sprite start={218.32} end={244}>
        <div style={{ position: 'absolute', inset: 0 }}>
          <NightField o={0.7} />
          <AmbientParticles start={218.32} dur={25.7} count={26} color="216,160,30" />
          <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 25 }}>
            <div style={{ background: MV.panel, border: `1px solid ${MV.line}`, borderRadius: 24, padding: '48px 80px', minWidth: 900, backdropFilter: 'blur(6px)', opacity: panelP, transform: `translateY(${(1 - panelP) * 24}px)` }}>
              <Kicker size={26}>Our Prediction</Kicker>
              <div style={{ marginTop: 24 }}>
                <StatLine start={219.5} delay={0.0} label="GERMANY" value="DIE MANNSCHAFT" accent={GER_GOLD} />
                <StatLine start={219.5} delay={0.25} label="PARAGUAY" value="LOS GUARANÍES" accent={PAR_RED} />
                <StatLine start={219.5} delay={0.5} label="OUR PREDICTION" value="GER 2 — 0 PAR" accent="#fff" />
                <StatLine start={219.5} delay={0.75} label="78' WIRTZ · 88' HAVERTZ" value="TWO LATE BLOWS" accent={ACC} />
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
    { label: 'COMMENT GERMANY', sub: 'DIE MANNSCHAFT', flag: <FlagGER w={76} />, accent: GER_GOLD },
    { label: 'COMMENT PARAGUAY', sub: 'LOS GUARANÍES', flag: <FlagPAR w={76} />, accent: PAR_RED },
  ];
  return (
    <div style={{ position: 'absolute', inset: 0 }}>
      <Sprite start={244} end={249}><FS id="crowd-tense" /></Sprite>
      {lt >= 5 && <NightField o={0.5} />}
      <div style={{ position: 'absolute', inset: 0, background: 'rgba(6,10,18,0.58)' }} />
      <div style={{ position: 'absolute', top: 140, left: 0, right: 0, textAlign: 'center', zIndex: 25, opacity: headP }}><Kicker size={30}>The Machine, Or The Night?</Kicker></div>
      <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 56, zIndex: 25 }}>
        {cards.map((c, i) => {
          const cp = Easing.easeOutBack(clamp((lt - 0.8 - i * 0.4) / 0.7, 0, 1));
          return (
            <div key={i} style={{ transform: `translateY(${(1 - cp) * 60}px) scale(${0.85 + 0.15 * cp})`, opacity: clamp(cp, 0, 1), background: MV.panel, border: `1px solid ${MV.line}`, borderRadius: 22, padding: '38px 50px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 18, minWidth: 360, boxShadow: '0 24px 70px rgba(0,0,0,0.5)', borderTop: `5px solid ${c.accent}` }}>
              {c.flag}
              <div style={{ fontFamily: '"Inter",sans-serif', fontWeight: 900, fontSize: 26, color: '#fff' }}>{c.label}</div>
              <div style={{ fontFamily: '"Inter",sans-serif', fontWeight: 700, fontSize: 20, color: MV.muted, letterSpacing: '0.16em' }}>{c.sub}</div>
            </div>
          );
        })}
      </div>
      <Vignette strength={0.4} />
    </div>
  );
}

function MiniStrip() {
  const prev = ['legend-074-portrait', 'legend-075-portrait', 'legend-076-portrait', 'legend-077-portrait', 'legend-078-portrait'];
  return (
    <div style={{ display: 'flex', alignItems: 'flex-end', gap: 12 }}>
      {prev.map((id) => (
        <div key={id} style={{ width: 64, height: 86, borderRadius: 8, overflow: 'hidden', border: '1px solid rgba(255,255,255,0.22)', boxShadow: '0 8px 20px rgba(0,0,0,0.5)', opacity: 0.82 }}>
          <img data-seq alt="" src={`assets/${id}.png`} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
        </div>
      ))}
      <div style={{ width: 78, height: 104, borderRadius: 9, overflow: 'hidden', border: `2px solid ${ACC}`, boxShadow: `0 10px 28px rgba(0,0,0,0.6), 0 0 26px ${ACC}66` }}>
        <img data-seq alt="" src="assets/legend-079-portrait.png" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
      </div>
    </div>
  );
}

function SceneMystery() {
  const { localTime: lt } = useSprite();
  const teaseP = clamp((lt - 0.3) / 0.5, 0, 1) * clamp((2.4 - lt) / 0.5, 0, 1);
  const cardP = Easing.easeOutBack(clamp((lt - 2.0) / 1.1, 0, 1));
  const tilt = Math.sin(lt * 0.7) * 4;
  const sheenX = ((lt * 26) % 200) - 50;
  const glow = 0.5 + 0.5 * Math.sin(lt * 1.3);
  const txtP = Easing.easeOutCubic(clamp((lt - 3.2) / 1.0, 0, 1));
  const stripP = Easing.easeOutCubic(clamp((lt - 4.6) / 1.0, 0, 1));
  return (
    <div style={{ position: 'absolute', inset: 0 }}>
      <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse at 50% 46%, #2a1810 0%, #18100a 50%, #0a0806 100%)' }} />
      <div style={{ position: 'absolute', inset: 0, background: `radial-gradient(ellipse at 50% 44%, rgba(216,160,30,${(0.32 * glow).toFixed(3)}) 0%, transparent 55%)` }} />
      <AmbientParticles start={255} dur={26} count={56} color="230,200,120" maxR={4.2} />
      {teaseP > 0.01 && (
        <div style={{ position: 'absolute', left: 0, right: 0, top: 90, textAlign: 'center', opacity: teaseP, zIndex: 20 }}>
          <div style={{ display: 'inline-block', fontFamily: '"Inter",sans-serif', fontWeight: 800, fontSize: 30, color: '#f3e0b8', letterSpacing: '0.24em', textShadow: '0 2px 18px rgba(0,0,0,0.7)' }}>THE LORD OF THE MOUNTAINS</div>
        </div>
      )}
      {lt > 1.6 && (
        <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 22, opacity: clamp(cardP, 0, 1) }}>
          <div style={{ position: 'relative', transform: `perspective(1500px) rotateY(${tilt}deg) scale(${0.92 + 0.08 * Math.min(cardP, 1)})`, marginTop: -34 }}>
            <img data-seq src="assets/legend-079-portrait.png" alt="" style={{ height: 640, display: 'block', borderRadius: 16, boxShadow: '0 50px 130px rgba(0,0,0,0.85), 0 0 80px rgba(216,160,30,0.5)' }} />
            <div style={{ position: 'absolute', top: 0, bottom: 0, left: `${sheenX}%`, width: '22%', background: 'linear-gradient(105deg, transparent, rgba(255,235,190,0.30), transparent)', transform: 'skewX(-18deg)', borderRadius: 16, pointerEvents: 'none', zIndex: 6 }} />
            <div style={{ position: 'absolute', top: 18, left: '50%', transform: 'translateX(-50%)', background: 'rgba(216,160,30,0.95)', color: '#1a1306', fontFamily: '"Inter",sans-serif', fontWeight: 900, fontSize: 17, letterSpacing: '0.14em', padding: '5px 16px', borderRadius: 8, boxShadow: '0 6px 20px rgba(0,0,0,0.5)' }}>Nº 079 · ✦✦✦ ULTRA RARE</div>
          </div>
        </div>
      )}
      <div style={{ position: 'absolute', left: 0, right: 0, bottom: 56, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16, zIndex: 24 }}>
        <div style={{ textAlign: 'center', opacity: txtP, transform: `translateY(${(1 - txtP) * 16}px)` }}>
          <div style={{ fontFamily: '"Inter",sans-serif', fontWeight: 900, fontSize: 46, color: ACC, letterSpacing: '0.04em', textShadow: '0 2px 24px rgba(216,160,30,0.5)' }}>RÜBEZAHL · LORD OF THE MOUNTAINS</div>
          <div style={{ fontFamily: '"Inter",sans-serif', fontWeight: 700, fontSize: 19, color: '#ecd9b0', letterSpacing: '0.18em', marginTop: 6 }}>GERMANY · LEGEND 079</div>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12, opacity: stripP }}>
          <MiniStrip />
          <div style={{ fontFamily: '"Inter",sans-serif', fontWeight: 900, fontSize: 20, color: '#fff', letterSpacing: '0.2em' }}>COLLECT THEM ALL</div>
        </div>
      </div>
    </div>
  );
}

function PhoneCollect({ start }) {
  const { localTime: lt } = useSprite();
  const local = lt - start;
  const inP = Easing.easeOutCubic(clamp(local / 0.8, 0, 1));
  const fly = Easing.easeInOutCubic(clamp((local - 1.2) / 1.6, 0, 1));
  const snapped = local > 2.8;
  const flash = snapped ? Math.max(0, 1 - (local - 2.8) * 1.6) : 0;
  const filled = ['legend-075-portrait', 'legend-076-portrait', 'legend-077-portrait', 'legend-078-portrait'];
  const cardX = -360 + fly * 360, cardY = -40 + fly * 150, cardS = 1 - fly * 0.62;
  return (
    <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 26, opacity: inP }}>
      <div style={{ position: 'relative', width: 300, height: 600, borderRadius: 40, background: 'linear-gradient(160deg,#23262e,#0c0e13)', border: '3px solid #2b2f38', boxShadow: '0 40px 110px rgba(0,0,0,0.8), 0 0 50px rgba(216,160,30,0.25)', padding: 12 }}>
        <div style={{ position: 'absolute', top: 16, left: '50%', transform: 'translateX(-50%)', width: 90, height: 8, borderRadius: 6, background: '#05070b' }} />
        <div style={{ width: '100%', height: '100%', borderRadius: 30, background: 'radial-gradient(ellipse at 50% 20%, #2a2010 0%, #0c0a06 70%)', overflow: 'hidden', position: 'relative', padding: '34px 18px 18px' }}>
          <div style={{ textAlign: 'center', fontFamily: '"Inter",sans-serif', fontWeight: 900, fontSize: 15, color: ACC, letterSpacing: '0.18em' }}>MY LEGENDS</div>
          <div style={{ textAlign: 'center', fontFamily: '"Inter",sans-serif', fontWeight: 700, fontSize: 10, color: '#b49a6a', letterSpacing: '0.1em', marginTop: 2, marginBottom: 14 }}>worldcup26.world</div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 10 }}>
            {filled.map((id) => (
              <div key={id} style={{ height: 104, borderRadius: 6, overflow: 'hidden', border: '1px solid rgba(255,255,255,0.16)' }}>
                <img data-seq alt="" src={`assets/${id}.png`} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
              </div>
            ))}
            <div style={{ height: 104, borderRadius: 6, overflow: 'hidden', border: snapped ? `2px solid ${ACC}` : '1px dashed rgba(216,160,30,0.6)', position: 'relative', boxShadow: flash > 0 ? `0 0 ${20 * flash}px ${ACC}` : 'none' }}>
              {snapped && <img data-seq alt="" src="assets/legend-079-portrait.png" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />}
              {flash > 0 && <div style={{ position: 'absolute', inset: 0, background: ACC, opacity: flash * 0.6 }} />}
            </div>
            <div style={{ height: 104, borderRadius: 6, border: '1px dashed rgba(255,255,255,0.14)' }} />
          </div>
          {snapped && local < 4.4 && <div style={{ position: 'absolute', left: 0, right: 0, bottom: 30, textAlign: 'center', fontFamily: '"Inter",sans-serif', fontWeight: 900, fontSize: 16, color: ACC, letterSpacing: '0.16em', opacity: clamp(1 - (local - 3.6), 0, 1) }}>COLLECTED!</div>}
        </div>
      </div>
      {!snapped && local > 0.4 && (
        <div style={{ position: 'absolute', left: '50%', top: '50%', transform: `translate(-50%,-50%) translate(${cardX}px, ${cardY}px) scale(${cardS})`, width: 200, height: 267, borderRadius: 12, overflow: 'hidden', border: `2px solid ${ACC}`, boxShadow: `0 30px 80px rgba(0,0,0,0.7), 0 0 40px ${ACC}88`, zIndex: 30 }}>
          <img data-seq alt="" src="assets/legend-079-portrait.png" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
        </div>
      )}
    </div>
  );
}

function SceneApp() {
  const { localTime: lt } = useSprite();
  const p = Easing.easeOutCubic(clamp(lt / 1.0, 0, 1));
  return (
    <div style={{ position: 'absolute', inset: 0 }}>
      <NightField o={0.8} />
      <AmbientParticles start={282.5} dur={21} count={24} color="216,160,30" />
      <div style={{ position: 'absolute', top: 92, left: 0, right: 0, textAlign: 'center', zIndex: 25, opacity: p }}>
        <Kicker size={30} color={ACC}>Claim Rübezahl</Kicker>
        <div style={{ marginTop: 10, fontFamily: '"Inter",sans-serif', fontWeight: 900, fontSize: 56, color: '#fff', letterSpacing: '0.04em' }}>worldcup26.world</div>
      </div>
      <PhoneCollect start={1.4} />
      <div style={{ position: 'absolute', bottom: 70, left: 0, right: 0, textAlign: 'center', zIndex: 25, opacity: p, fontFamily: '"Inter",sans-serif', fontWeight: 700, fontSize: 22, color: MV.muted, letterSpacing: '0.14em' }}>FREE · PICK 3 NATIONS · EVERY GOAL SCORES · NO PRIZES</div>
    </div>
  );
}

function SceneCTA() {
  const { localTime: lt } = useSprite();
  const p = Easing.easeOutCubic(clamp(lt / 1.0, 0, 1));
  return (
    <div style={{ position: 'absolute', inset: 0 }}>
      <Sprite start={303.05} end={308.05}><FS id="cta-celebrate" /></Sprite>
      {lt >= 5 && <NightField o={0.7} />}
      <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg, rgba(2,3,8,0.45) 0%, rgba(2,3,8,0.30) 45%, rgba(2,3,8,0.72) 100%)' }} />
      <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 26, zIndex: 25, opacity: p }}>
        <Kicker size={30} color={ACC}>WorldCup26 Legends</Kicker>
        <div style={{ fontFamily: '"Inter",sans-serif', fontWeight: 900, fontSize: 64, color: '#fff', letterSpacing: '0.03em', textAlign: 'center', textShadow: '0 6px 30px rgba(0,0,0,0.85)' }}>LIKE · SUBSCRIBE</div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
          <FlagGER w={62} />
          <div style={{ fontFamily: '"Inter",sans-serif', fontWeight: 900, fontSize: 34, color: ACC, letterSpacing: '0.2em' }}>worldcup26.world</div>
          <FlagPAR w={62} />
        </div>
      </div>
      <Vignette strength={0.4} />
    </div>
  );
}
