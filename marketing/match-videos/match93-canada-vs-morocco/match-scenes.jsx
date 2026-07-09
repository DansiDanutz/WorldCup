// match-scenes.jsx — Ep93 Canada vs Morocco (Play-Offs) — PHOTOREAL + NO-REPEAT/NO-LOOP.
// "EL DORADO AND THE BLACK STAR". OUR PREDICTION Colombia 2-1 Ghana (Ghana lead early; James
// equalise; Diaz late winner). Mystic (#21): COLOMBIA = Los Cafeteros, heirs of the golden king
// El Dorado -> Legend 092 = El Dorado, the Golden King; GHANA = the Black Stars of Africa. Both
// squads generated FRESH with LIKENESS prompts + real numbers (#29). Beat captions over dimmed
// footage (#27). Nation-correct only (#28). #23 name<->image SYNC (measured VO onsets).

const CAN_RED = '#d52b1e', CAN_WHITE = '#f3f4f7';
const MA_RED = '#c1272d', MA_GREEN = '#0a8a43', MA_LIGHT = '#f0a3a6';
const ACC = '#f4c430';
const GRADE = { filter: 'saturate(1.06) contrast(1.04)' };

function FlagCAN({ w = 120 }) {
  const h = w * 2 / 3;
  return (
    <div style={{ width: w, height: h, borderRadius: w * 0.05, position: 'relative', overflow: 'hidden', boxShadow: '0 6px 18px rgba(0,0,0,0.45)', display: 'flex' }}>
      <div style={{ width: '25%', background: CAN_RED }} />
      <div style={{ width: '50%', background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', color: CAN_RED, fontSize: h * 0.62, lineHeight: 1 }}>🍁</div>
      <div style={{ width: '25%', background: CAN_RED }} />
    </div>
  );
}
function FlagMA({ w = 120 }) {
  const h = w * 2 / 3;
  return (
    <div style={{ width: w, height: h, borderRadius: w * 0.05, position: 'relative', overflow: 'hidden', background: MA_RED, boxShadow: '0 6px 18px rgba(0,0,0,0.45)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ color: MA_GREEN, fontSize: h * 0.5, lineHeight: 1, transform: 'translateY(-2px)' }}>★</div>
    </div>
  );
}

function FS({ id, style }) { return <ClipSprite id={id} fit="cover" style={{ ...GRADE, ...(style || {}) }} />; }
// El Dorado card art (slow Ken-Burns) — Colombia's cold-open symbol.
function GoldStill({ start = 0, dur = 5 }) {
  const { localTime: lt } = useSprite();
  const p = clamp((lt - start) / dur, 0, 1);
  if (lt < start || lt > start + dur) return null;
  const scale = 1.06 + 0.12 * p;
  const fade = lt < start + 0.4 ? clamp((lt - start) / 0.4, 0, 1) : (lt > start + dur - 0.5 ? clamp((start + dur - lt) / 0.5, 0, 1) : 1);
  return (
    <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', opacity: fade, zIndex: 1 }}>
      <img data-seq src="assets/legend-093-landscape.png" alt="" style={{ position: 'absolute', left: '50%', top: '50%', width: '108%', transform: `translate(-50%,-50%) scale(${scale})`, filter: 'saturate(1.05) contrast(1.03)' }} />
      <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse at 50% 45%, transparent 40%, rgba(2,3,8,0.55) 100%)' }} />
    </div>
  );
}
function NightField({ o = 0.6 }) {
  const { localTime: lt } = useSprite();
  const pulse = 0.5 + 0.5 * Math.sin(lt * 1.1);
  return (
    <div style={{ position: 'absolute', inset: 0, zIndex: 0 }}>
      <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse at 50% 44%, #0d1018 0%, #0a0e14 60%, #05060c 100%)' }} />
      <div style={{ position: 'absolute', inset: 0, background: `radial-gradient(ellipse at 50% 42%, rgba(244,196,48,${(0.13 * pulse * o).toFixed(3)}) 0%, transparent 55%)` }} />
    </div>
  );
}

function ScoreBug({ start, co = 2, gh = 1, note = "88'", badge = 'OUR PREDICTION' }) {
  const t = useTime(); const local = t - start; if (local < 0) return null;
  const inP = Easing.easeOutBack(clamp(local / 0.7, 0, 1));
  const cell = { fontFamily: '"Inter",sans-serif', fontWeight: 900, fontSize: 34, color: '#fff', padding: '10px 18px' };
  return (
    <div style={{ position: 'absolute', top: 92, left: '50%', zIndex: 30, transform: `translateX(-50%) scale(${inP})`, opacity: clamp(inP, 0, 1), display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
      <div style={{ display: 'flex', alignItems: 'center', background: MV.panel, border: `1px solid ${MV.line}`, borderRadius: 14, boxShadow: '0 10px 36px rgba(0,0,0,0.6)', overflow: 'hidden' }}>
        <div style={{ ...cell, background: CAN_RED }}>CAN</div>
        <div style={{ ...cell, fontSize: 38, color: ACC }}>{co} — {gh}</div>
        <div style={{ ...cell, background: MA_GREEN }}>MAR</div>
        {note && <div style={{ ...cell, fontSize: 24, color: ACC, borderLeft: `1px solid ${MV.line}` }}>{note}</div>}
      </div>
      <div style={{ fontFamily: '"Inter",sans-serif', fontWeight: 800, fontSize: 16, color: ACC, letterSpacing: '0.22em', background: 'rgba(244,196,48,0.14)', border: '1px solid rgba(244,196,48,0.5)', borderRadius: 999, padding: '4px 16px' }}>{badge}</div>
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

function BeatCard({ clipId, start, end, text, sub, accent = ACC, big = 62 }) {
  const t = useTime(); if (t < start || t > end) return null;
  const inP = Easing.easeOutCubic(clamp((t - start) / 0.5, 0, 1));
  const fade = t > end - 0.4 ? clamp((end - t) / 0.4, 0, 1) : 1;
  return (
    <div style={{ position: 'absolute', inset: 0, opacity: fade }}>
      <ClipSprite id={clipId} fit="cover" style={{ filter: 'saturate(1.02) contrast(1.03) brightness(0.46)' }} />
      <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg, rgba(2,3,8,0.60) 0%, rgba(2,3,8,0.28) 42%, rgba(2,3,8,0.78) 100%)' }} />
      <div style={{ position: 'absolute', left: 0, right: 0, top: 0, height: 6, background: `linear-gradient(90deg, transparent, ${accent}, transparent)`, opacity: 0.7 }} />
      <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', transform: `translateY(${(1 - inP) * 22}px)`, opacity: inP }}>
        <div style={{ textAlign: 'center', padding: '0 8%' }}>
          <div style={{ fontFamily: '"Inter",sans-serif', fontWeight: 900, fontSize: big, lineHeight: 1.04, color: '#fff', textShadow: '0 4px 30px rgba(0,0,0,0.95)' }}>{text}</div>
          {sub && <div style={{ marginTop: 16, fontFamily: '"Inter",sans-serif', fontWeight: 800, fontSize: 28, letterSpacing: '0.16em', color: accent, textShadow: '0 2px 20px rgba(0,0,0,0.9)' }}>{sub}</div>}
        </div>
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
function Backdrop() { return <div style={{ position: 'absolute', inset: 0, zIndex: 0, background: 'radial-gradient(ellipse at 50% 45%, #0c1119 0%, #05060c 100%)' }} />; }

function SceneColdOpen() {
  const { localTime: lt } = useSprite();
  const beat = Math.pow(Math.max(0, Math.sin(lt * Math.PI * 1.1)), 8);
  const teaseP = clamp((lt - 6.5) / 0.8, 0, 1) * clamp((14.0 - lt) / 0.6, 0, 1);
  const titleP = Easing.easeOutCubic(clamp((lt - 19.2) / 1.4, 0, 1));
  return (
    <div style={{ position: 'absolute', inset: 0 }}>
      {lt >= 19.4 && <NightField o={0.9} />}
      <GoldStill start={0} dur={5} />
      <FS id="can-thunderbird" /><FS id="ma-atlaslion" /><FS id="texture-atlas" />
      <div style={{ position: 'absolute', inset: 0, background: `radial-gradient(ellipse at center, rgba(244,196,48,${(0.20 * beat).toFixed(3)}) 0%, transparent 60%)` }} />
      <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg, rgba(2,3,8,0.34) 0%, transparent 30%, transparent 56%, rgba(2,3,8,0.76) 100%)' }} />
      {teaseP > 0.01 && (
        <div style={{ position: 'absolute', left: 0, right: 0, bottom: 150, textAlign: 'center', zIndex: 23, opacity: teaseP }}>
          <div style={{ display: 'inline-block', fontFamily: '"Inter",sans-serif', fontWeight: 800, fontSize: 30, color: '#f0dca6', letterSpacing: '0.22em', textShadow: '0 2px 18px rgba(0,0,0,0.85)' }}>THE THUNDERBIRD MEETS THE ATLAS LION.</div>
        </div>
      )}
      {lt > 19.2 && (
        <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 26, opacity: titleP, zIndex: 22 }}>
          <Kicker size={32} color={ACC}>The Thunderbird and The Atlas Lion</Kicker>
          <TitleReveal text="ATLAS LIONS" start={20.0} size={72} color={ACC} />
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
      <AmbientParticles start={23.0} dur={10} count={34} color="240,200,140" />
      <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 38 }}>
        <div style={{ opacity: p1, transform: `translateY(${(1 - p1) * -30}px)` }}><Kicker>WorldCup26 Legends · Episode 93 · Play-Offs</Kicker></div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 52, opacity: clamp(p2, 0, 1), transform: `scale(${p2})` }}>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 18 }}><Waving><FlagCAN w={210} /></Waving><BigTitle size={64} glow={CAN_RED}>CANADA</BigTitle></div>
          <BigTitle size={104} color={ACC}>VS</BigTitle>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 18 }}><Waving speed={1.9}><FlagMA w={210} /></Waving><BigTitle size={62} glow={MA_GREEN}>MOROCCO</BigTitle></div>
        </div>
        <div style={{ opacity: p3, fontFamily: '"Inter",sans-serif', fontWeight: 600, fontSize: 30, color: MV.muted, letterSpacing: '0.10em' }}>WIN, OR THE DREAM DIES</div>
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
          {[['THE MAPLE LEAFS', 'CANADA'], ['THE ATLAS LIONS', 'MOROCCO'], ['THE THUNDERBIRD', 'vs THE LION'], ['PLAY-OFFS', 'WIN OR GO HOME']].map(([v, l], i) => (
            <div key={i} style={{ padding: '22px 34px', borderLeft: i ? `1px solid ${MV.line}` : 'none', textAlign: 'center' }}>
              <div style={{ fontFamily: '"Inter",sans-serif', fontWeight: 900, fontSize: 24, color: ACC }}>{v}</div>
              <div style={{ fontFamily: '"Inter",sans-serif', fontWeight: 700, fontSize: 14, color: MV.muted, letterSpacing: '0.10em', marginTop: 5 }}>{l}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function SceneCanada() {
  return (
    <div style={{ position: 'absolute', inset: 0 }}>
      <NightField o={0.5} />
      <Sprite start={44} end={49}><div style={{ position: 'absolute', inset: 0 }}><FS id="can-crowd" /><div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg, rgba(2,3,8,0.30) 0%, transparent 40%, rgba(2,3,8,0.55) 100%)' }} /><TeamBanner flag={<FlagCAN w={64} />} label="THE MAPLE LEAFS · CANADA" accent={CAN_RED} /></div></Sprite>
      <Sprite start={49} end={54}><div style={{ position: 'absolute', inset: 0 }}><FS id="can-tifo" /><div style={{ position: 'absolute', inset: 0, background: 'rgba(2,3,8,0.32)' }} /></div></Sprite>
      <Sprite start={54} end={55.5}><div style={{ position: 'absolute', inset: 0 }}><FS id="can-wave" /><div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(90deg, rgba(213,43,30,0.30), transparent 55%)' }} /></div></Sprite>
      <PlayerShowcase clipId="can-davies" name="ALPHONSO DAVIES" role="CAPTAIN · THE ROCKET · 19" accent={CAN_RED} start={55.5} end={60.5} />
      <PlayerShowcase clipId="can-david" name="JONATHAN DAVID" role="THE FINISHER · 20" accent={ACC} start={60.5} end={63.74} />
      <PlayerShowcase clipId="can-larin" name="CYLE LARIN" role="THE POACHER · 17" accent={CAN_RED} start={63.74} end={68.0} />
      <PlayerShowcase clipId="can-eustaquio" name="STEPHEN EUSTÁQUIO" role="THE CONDUCTOR · 7" accent={ACC} start={68.0} end={70.99} />
      <PlayerShowcase clipId="can-buchanan" name="TAJON BUCHANAN" role="THE CHAOS · 11" accent={CAN_RED} start={70.99} end={79.5} />
    </div>
  );
}

function SceneMorocco() {
  return (
    <div style={{ position: 'absolute', inset: 0 }}>
      <NightField o={0.5} />
      <Sprite start={79.5} end={84.5}><div style={{ position: 'absolute', inset: 0 }}><FS id="ma-crowd" /><div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg, rgba(2,3,8,0.30) 0%, transparent 40%, rgba(2,3,8,0.55) 100%)' }} /><TeamBanner flag={<FlagMA w={64} />} label="THE ATLAS LIONS · MOROCCO" accent={MA_RED} /></div></Sprite>
      <Sprite start={84.5} end={90.6}><div style={{ position: 'absolute', inset: 0 }}><FS id="ma-tifo" /><div style={{ position: 'absolute', inset: 0, background: 'rgba(2,3,8,0.32)' }} /></div></Sprite>
      <PlayerShowcase clipId="ma-hakimi" name="ACHRAF HAKIMI" role="CAPTAIN · THE ROCKET · 2" accent={MA_RED} start={90.6} end={96.8} />
      <PlayerShowcase clipId="ma-ziyech" name="HAKIM ZIYECH" role="THE WIZARD · 7" accent={MA_LIGHT} start={96.8} end={99.95} />
      <PlayerShowcase clipId="ma-ennesyri" name="YOUSSEF EN-NESYRI" role="THE TOWER · 19" accent={MA_GREEN} start={99.95} end={103.0} />
      <PlayerShowcase clipId="ma-amrabat" name="SOFYAN AMRABAT" role="THE SHIELD · 4" accent={MA_RED} start={103.0} end={105.71} />
      <PlayerShowcase clipId="ma-brahim" name="BRAHIM DÍAZ" role="THE JEWEL · 10" accent={MA_GREEN} start={105.71} end={113.0} />
    </div>
  );
}

function SceneRiddle() {
  return (
    <div style={{ position: 'absolute', inset: 0 }}>
      <NightField o={0.5} />
      <Sprite start={113} end={118}><div style={{ position: 'absolute', inset: 0 }}><FS id="vd-stadium-night" /><div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.24)' }} /><div style={{ position: 'absolute', left: 0, right: 0, bottom: 70, textAlign: 'center', fontFamily: '"Inter",sans-serif', fontWeight: 900, fontSize: 54, color: '#fff', textShadow: '0 4px 26px rgba(0,0,0,0.9)' }}>THE THUNDERBIRD vs THE ATLAS LION</div></div></Sprite>
      <Sprite start={118} end={123}><div style={{ position: 'absolute', inset: 0 }}><FS id="stadium-aerial" /><div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse at 50% 50%, transparent 35%, rgba(2,3,8,0.6) 100%)' }} /></div></Sprite>
      <Sprite start={123} end={132}><BeatCard clipId="bg-riddle" start={123} end={132} text={<>DO THE YOUNG LEAFS FLY TOO HIGH,<br />OR DO THE LIONS RUN THEM DOWN?</>} accent={ACC} big={50} /></Sprite>
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
      <span style={{ fontFamily: '"Inter",sans-serif', fontWeight: 900, fontSize: 24, color: '#fff', letterSpacing: '0.03em' }}>{name}</span>
    </div>
  );
  return (
    <div style={{ position: 'absolute', inset: 0, zIndex: 28, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(2,3,6,0.62)', opacity: p }}>
      <div style={{ width: 1010, borderRadius: 28, overflow: 'hidden', transform: `scale(${0.92 + 0.08 * p})`, boxShadow: '0 36px 130px rgba(0,0,0,0.8)', position: 'relative', border: '2px solid rgba(244,196,48,0.55)' }}>
        <div style={{ position: 'absolute', inset: 0, background: `linear-gradient(105deg, ${CAN_RED}33 0%, #070b14 38%, #070b14 62%, ${MA_GREEN}55 100%)` }} />
        <div style={{ position: 'absolute', top: 0, bottom: 0, left: `${sheenX}%`, width: '22%', background: 'linear-gradient(105deg, transparent, rgba(255,255,255,0.10), transparent)', transform: 'skewX(-18deg)', pointerEvents: 'none', zIndex: 5 }} />
        <div style={{ position: 'relative', zIndex: 2, background: `linear-gradient(100deg, ${CAN_RED} 0%, ${ACC} 50%, ${MA_GREEN} 100%)`, padding: '13px 0', textAlign: 'center' }}>
          <span style={{ fontFamily: '"Inter",sans-serif', fontWeight: 900, fontSize: 17, letterSpacing: '0.26em', color: '#06121a' }}>WORLDCUP26 LEGENDS · OUR PREDICTION · NOT PLAYED</span>
        </div>
        <div style={{ position: 'relative', zIndex: 2, padding: '36px 70px 28px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 46 }}>
            <Badge flag={<FlagCAN w={104} />} name="CANADA" accent={CAN_RED} />
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, fontFamily: '"Inter",sans-serif', fontWeight: 900, fontSize: 116, color: '#fff', lineHeight: 1 }}>
                <span style={{ textShadow: `0 0 36px ${CAN_RED}cc` }}>1</span>
                <span style={{ color: ACC, fontSize: 58, transform: 'translateY(-6px)' }}>—</span>
                <span style={{ textShadow: `0 0 36px ${MA_GREEN}cc` }}>2</span>
              </div>
              <div style={{ fontFamily: '"Inter",sans-serif', fontWeight: 800, fontSize: 16, color: MV.muted, letterSpacing: '0.30em', marginTop: 4 }}>FULL-TIME</div>
            </div>
            <Badge flag={<FlagMA w={104} />} name="MOROCCO" accent={MA_GREEN} />
          </div>
          <div style={{ textAlign: 'center', marginTop: 16, fontFamily: '"Inter",sans-serif', fontWeight: 900, fontSize: 32, color: ACC, letterSpacing: '0.05em', textShadow: `0 0 26px ${ACC}66` }}>THE ATLAS LION ROARS · 2–1</div>
          <div style={{ display: 'flex', justifyContent: 'center', gap: 12, marginTop: 16, paddingTop: 18, borderTop: '1px solid rgba(255,255,255,0.12)' }}>
            <span style={{ fontFamily: '"Inter",sans-serif', fontWeight: 800, fontSize: 21, color: '#f3e6c4', background: 'rgba(244,196,48,0.16)', border: '1px solid rgba(244,196,48,0.45)', borderRadius: 999, padding: '7px 18px' }}>🦁 EN-NESYRI — THE LATE WINNER</span>
          </div>
          <div style={{ textAlign: 'center', marginTop: 12, fontFamily: '"Inter",sans-serif', fontWeight: 700, fontSize: 16, color: MV.muted, letterSpacing: '0.2em' }}>worldcup26.world</div>
        </div>
        {stampP > 0 && <div style={{ position: 'absolute', top: 64, right: -6, zIndex: 6, transform: `rotate(-12deg) scale(${stampP})`, border: `4px solid ${ACC}`, color: ACC, borderRadius: 12, padding: '8px 22px', fontFamily: '"Inter",sans-serif', fontWeight: 900, fontSize: 24, letterSpacing: '0.14em', background: 'rgba(7,9,15,0.92)' }}>OUR STORY</div>}
      </div>
    </div>
  );
}

function SceneDrama() {
  return (
    <div style={{ position: 'absolute', inset: 0 }}>
      <Backdrop />
      <Sprite start={132} end={137}><BeatCard clipId="bg-firing" start={132} end={137} text={<>CANADA COME<br />OUT FLYING</>} accent={CAN_RED} big={62} /></Sprite>
      <Sprite start={137} end={142}><div style={{ position: 'absolute', inset: 0 }}><FS id="can-attack" /><ChanceTag start={137.5} end={142} text="THE MAPLE LEAFS PRESS" sub="FEARLESS AT HOME" accent={CAN_RED} /></div></Sprite>
      <Sprite start={142} end={152.21}><div style={{ position: 'absolute', inset: 0 }}><FS id="bono-save" /><ChanceTag start={143} end={152} text="BONO KEEPS THEM IN IT" sub="MOROCCO HOLD FIRM" accent={MA_GREEN} /></div></Sprite>
      <Sprite start={152.21} end={159}><div style={{ position: 'absolute', inset: 0 }}><FS id="david-goal" /><GoalFlash at={153.6} /><ChanceTag start={154} end={159} text="CANADA LEAD!" sub="DAVID STRIKES FIRST" accent={CAN_RED} /></div></Sprite>
      <Sprite start={159} end={172}><BeatCard clipId="bg-rise" start={159} end={172} text={<>BUT THE LIONS ROAR BACK</>} sub="THE BALL FINDS HAKIMI" accent={ACC} big={54} /></Sprite>
      <Sprite start={172} end={178.46}><div style={{ position: 'absolute', inset: 0 }}><FS id="ma-surge" /><ChanceTag start={172.5} end={178.46} text="MOROCCO SURGE" sub="THE ATLAS LIONS COME" accent={MA_GREEN} /></div></Sprite>
      <Sprite start={178.46} end={185}><div style={{ position: 'absolute', inset: 0 }}><FS id="ma-goal-1" /><GoalFlash at={179.9} /><ChanceTag start={180.3} end={185} text="ZIYECH — ONE-ONE!" sub="THE WIZARD LEVELS IT" accent={MA_LIGHT} /></div></Sprite>
      <Sprite start={185} end={189.58}><BeatCard clipId="bg-roar" start={185} end={189.58} text={<>AND THEN —<br />THE LATE ROAR</>} accent={ACC} big={68} /></Sprite>
      <Sprite start={189.58} end={203.32}><div style={{ position: 'absolute', inset: 0 }}><FS id="ma-goal-2" /><GoalFlash at={191.0} /><ChanceTag start={191.4} end={196} text="EN-NESYRI — 2-1 MOROCCO!" sub="THE ATLAS LION ROARS" accent={MA_GREEN} /><ScoreBug start={196.3} co={1} gh={2} note="89'" badge="OUR PREDICTION" /><PredictionCard start={196.9} /></div></Sprite>
      <Vignette strength={0.32} />
    </div>
  );
}

function SceneVerdict() {
  const t = useTime();
  const panelP = Easing.easeOutCubic(clamp((t - 219.0) / 1.0, 0, 1));
  return (
    <div style={{ position: 'absolute', inset: 0 }}>
      <Sprite start={203.32} end={208.32}><div style={{ position: 'absolute', inset: 0 }}><FS id="vd-handshake" /><div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg, rgba(2,3,8,0.25) 0%, transparent 45%, rgba(2,3,8,0.55) 100%)' }} /><div style={{ position: 'absolute', left: 0, right: 0, top: 120, textAlign: 'center', zIndex: 24 }}><Kicker size={28} color={ACC}>The Atlas Lion Roars</Kicker></div></div></Sprite>
      <Sprite start={208.32} end={213.32}><BeatCard clipId="bg-verdict" start={208.32} end={213.32} text={<>CANADA FLEW AT THEM EARLY —<br />BUT THE LIONS ROARED BACK</>} accent="#fff" big={46} /></Sprite>
      <Sprite start={213.32} end={218.32}><BeatCard clipId="bg-winner" start={213.32} end={218.32} text={<>EN-NESYRI</>} sub="THE LATE WINNER" accent={ACC} big={56} /></Sprite>
      <Sprite start={218.32} end={244}>
        <div style={{ position: 'absolute', inset: 0 }}>
          <ClipSprite id="bg-stats" fit="cover" style={{ filter: 'saturate(1.0) contrast(1.02) brightness(0.4)' }} />
          <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg, rgba(2,3,8,0.66) 0%, rgba(2,3,8,0.52) 50%, rgba(2,3,8,0.78) 100%)' }} />
          <AmbientParticles start={218.32} dur={25.7} count={26} color="240,200,140" />
          <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 25 }}>
            <div style={{ background: MV.panel, border: `1px solid ${MV.line}`, borderRadius: 24, padding: '48px 80px', minWidth: 900, backdropFilter: 'blur(6px)', opacity: panelP, transform: `translateY(${(1 - panelP) * 24}px)` }}>
              <Kicker size={26}>Our Prediction</Kicker>
              <div style={{ marginTop: 24 }}>
                <StatLine start={219.5} delay={0.0} label="CANADA" value="THE MAPLE LEAFS" accent={CAN_RED} />
                <StatLine start={219.5} delay={0.25} label="MOROCCO" value="THE ATLAS LIONS" accent={MA_GREEN} />
                <StatLine start={219.5} delay={0.5} label="OUR PREDICTION" value="CAN 1 — 2 MAR" accent="#fff" />
                <StatLine start={219.5} delay={0.75} label="89' EN-NESYRI" value="THE LATE WINNER" accent={ACC} />
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
    { label: 'COMMENT CANADA', sub: 'THE MAPLE LEAFS', flag: <FlagCAN w={76} />, accent: CAN_RED },
    { label: 'COMMENT MOROCCO', sub: 'THE ATLAS LIONS', flag: <FlagMA w={76} />, accent: MA_GREEN },
  ];
  return (
    <div style={{ position: 'absolute', inset: 0 }}>
      <Sprite start={244} end={249}><FS id="crowd-tense" /></Sprite>
      {lt >= 5 && <NightField o={0.5} />}
      <div style={{ position: 'absolute', inset: 0, background: 'rgba(6,10,18,0.58)' }} />
      <div style={{ position: 'absolute', top: 140, left: 0, right: 0, textAlign: 'center', zIndex: 25, opacity: headP }}><Kicker size={30}>The Thunderbird, Or The Atlas Lion?</Kicker></div>
      <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 56, zIndex: 25 }}>
        {cards.map((c, i) => {
          const cp = Easing.easeOutBack(clamp((lt - 0.8 - i * 0.4) / 0.7, 0, 1));
          return (
            <div key={i} style={{ transform: `translateY(${(1 - cp) * 60}px) scale(${0.85 + 0.15 * cp})`, opacity: clamp(cp, 0, 1), background: MV.panel, border: `1px solid ${MV.line}`, borderRadius: 22, padding: '38px 46px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 18, minWidth: 400, boxShadow: '0 24px 70px rgba(0,0,0,0.5)', borderTop: `5px solid ${c.accent}` }}>
              {c.flag}
              <div style={{ fontFamily: '"Inter",sans-serif', fontWeight: 900, fontSize: 23, color: '#fff' }}>{c.label}</div>
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
  const prev = ['legend-088-portrait', 'legend-089-portrait', 'legend-090-portrait', 'legend-091-portrait', 'legend-092-portrait'];
  return (
    <div style={{ display: 'flex', alignItems: 'flex-end', gap: 12 }}>
      {prev.map((id) => (
        <div key={id} style={{ width: 64, height: 86, borderRadius: 8, overflow: 'hidden', border: '1px solid rgba(255,255,255,0.22)', boxShadow: '0 8px 20px rgba(0,0,0,0.5)', opacity: 0.82 }}>
          <img data-seq alt="" src={`assets/${id}.png`} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
        </div>
      ))}
      <div style={{ width: 78, height: 104, borderRadius: 9, overflow: 'hidden', border: `2px solid ${ACC}`, boxShadow: `0 10px 28px rgba(0,0,0,0.6), 0 0 26px ${ACC}66` }}>
        <img data-seq alt="" src="assets/legend-093-portrait.png" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
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
      <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse at 50% 46%, #241a10 0%, #170f0a 50%, #0a0706 100%)' }} />
      <div style={{ position: 'absolute', inset: 0, background: `radial-gradient(ellipse at 50% 44%, rgba(244,196,48,${(0.32 * glow).toFixed(3)}) 0%, transparent 55%)` }} />
      <AmbientParticles start={255} dur={26} count={56} color="240,200,140" maxR={4.2} />
      {teaseP > 0.01 && (
        <div style={{ position: 'absolute', left: 0, right: 0, top: 90, textAlign: 'center', opacity: teaseP, zIndex: 20 }}>
          <div style={{ display: 'inline-block', fontFamily: '"Inter",sans-serif', fontWeight: 800, fontSize: 30, color: '#f3e0b8', letterSpacing: '0.24em', textShadow: '0 2px 18px rgba(0,0,0,0.7)' }}>THE ATLAS LION</div>
        </div>
      )}
      {lt > 1.6 && (
        <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 22, opacity: clamp(cardP, 0, 1) }}>
          <div style={{ position: 'relative', transform: `perspective(1500px) rotateY(${tilt}deg) scale(${0.92 + 0.08 * Math.min(cardP, 1)})`, marginTop: -34 }}>
            <img data-seq src="assets/legend-093-portrait.png" alt="" style={{ height: 640, display: 'block', borderRadius: 16, boxShadow: '0 50px 130px rgba(0,0,0,0.85), 0 0 80px rgba(244,196,48,0.5)' }} />
            <div style={{ position: 'absolute', top: 0, bottom: 0, left: `${sheenX}%`, width: '22%', background: 'linear-gradient(105deg, transparent, rgba(255,235,190,0.30), transparent)', transform: 'skewX(-18deg)', borderRadius: 16, pointerEvents: 'none', zIndex: 6 }} />
            <div style={{ position: 'absolute', top: 18, left: '50%', transform: 'translateX(-50%)', background: 'rgba(244,196,48,0.95)', color: '#1a1306', fontFamily: '"Inter",sans-serif', fontWeight: 900, fontSize: 17, letterSpacing: '0.14em', padding: '5px 16px', borderRadius: 8, boxShadow: '0 6px 20px rgba(0,0,0,0.5)' }}>Nº 093 · ✦✦✦ ULTRA RARE</div>
          </div>
        </div>
      )}
      <div style={{ position: 'absolute', left: 0, right: 0, bottom: 56, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16, zIndex: 24 }}>
        <div style={{ textAlign: 'center', opacity: txtP, transform: `translateY(${(1 - txtP) * 16}px)` }}>
          <div style={{ fontFamily: '"Inter",sans-serif', fontWeight: 900, fontSize: 44, color: ACC, letterSpacing: '0.03em', textShadow: '0 2px 24px rgba(244,196,48,0.5)' }}>THE ATLAS LION · THE KINGDOM'S ROAR</div>
          <div style={{ fontFamily: '"Inter",sans-serif', fontWeight: 700, fontSize: 19, color: '#ecd9b0', letterSpacing: '0.18em', marginTop: 6 }}>MOROCCO · LEGEND 093</div>
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
  const filled = ['legend-089-portrait', 'legend-090-portrait', 'legend-091-portrait', 'legend-092-portrait'];
  const cardX = -360 + fly * 360, cardY = -40 + fly * 150, cardS = 1 - fly * 0.62;
  return (
    <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 26, opacity: inP }}>
      <div style={{ position: 'relative', width: 300, height: 600, borderRadius: 40, background: 'linear-gradient(160deg,#23262e,#0c0e13)', border: '3px solid #2b2f38', boxShadow: '0 40px 110px rgba(0,0,0,0.8), 0 0 50px rgba(244,196,48,0.25)', padding: 12 }}>
        <div style={{ position: 'absolute', top: 16, left: '50%', transform: 'translateX(-50%)', width: 90, height: 8, borderRadius: 6, background: '#05070b' }} />
        <div style={{ width: '100%', height: '100%', borderRadius: 30, background: 'radial-gradient(ellipse at 50% 20%, #1a2030 0%, #06080c 70%)', overflow: 'hidden', position: 'relative', padding: '34px 18px 18px' }}>
          <div style={{ textAlign: 'center', fontFamily: '"Inter",sans-serif', fontWeight: 900, fontSize: 15, color: ACC, letterSpacing: '0.18em' }}>MY LEGENDS</div>
          <div style={{ textAlign: 'center', fontFamily: '"Inter",sans-serif', fontWeight: 700, fontSize: 10, color: '#b49a6a', letterSpacing: '0.1em', marginTop: 2, marginBottom: 14 }}>worldcup26.world</div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 10 }}>
            {filled.map((id) => (
              <div key={id} style={{ height: 104, borderRadius: 6, overflow: 'hidden', border: '1px solid rgba(255,255,255,0.16)' }}>
                <img data-seq alt="" src={`assets/${id}.png`} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
              </div>
            ))}
            <div style={{ height: 104, borderRadius: 6, overflow: 'hidden', border: snapped ? `2px solid ${ACC}` : '1px dashed rgba(244,196,48,0.6)', position: 'relative', boxShadow: flash > 0 ? `0 0 ${20 * flash}px ${ACC}` : 'none' }}>
              {snapped && <img data-seq alt="" src="assets/legend-093-portrait.png" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />}
              {flash > 0 && <div style={{ position: 'absolute', inset: 0, background: ACC, opacity: flash * 0.6 }} />}
            </div>
            <div style={{ height: 104, borderRadius: 6, border: '1px dashed rgba(255,255,255,0.14)' }} />
          </div>
          {snapped && local < 4.4 && <div style={{ position: 'absolute', left: 0, right: 0, bottom: 30, textAlign: 'center', fontFamily: '"Inter",sans-serif', fontWeight: 900, fontSize: 16, color: ACC, letterSpacing: '0.16em', opacity: clamp(1 - (local - 3.6), 0, 1) }}>COLLECTED!</div>}
        </div>
      </div>
      {!snapped && local > 0.4 && (
        <div style={{ position: 'absolute', left: '50%', top: '50%', transform: `translate(-50%,-50%) translate(${cardX}px, ${cardY}px) scale(${cardS})`, width: 200, height: 267, borderRadius: 12, overflow: 'hidden', border: `2px solid ${ACC}`, boxShadow: `0 30px 80px rgba(0,0,0,0.7), 0 0 40px ${ACC}88`, zIndex: 30 }}>
          <img data-seq alt="" src="assets/legend-093-portrait.png" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
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
      <AmbientParticles start={282.5} dur={21} count={24} color="240,200,140" />
      <div style={{ position: 'absolute', top: 92, left: 0, right: 0, textAlign: 'center', zIndex: 25, opacity: p }}>
        <Kicker size={30} color={ACC}>Claim Your Legend</Kicker>
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
          <FlagCAN w={62} />
          <div style={{ fontFamily: '"Inter",sans-serif', fontWeight: 900, fontSize: 34, color: ACC, letterSpacing: '0.2em' }}>worldcup26.world</div>
          <FlagMA w={62} />
        </div>
      </div>
      <Vignette strength={0.4} />
    </div>
  );
}
