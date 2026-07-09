// match-scenes.jsx — Ep104 Argentina vs Switzerland (Play-Offs) — PHOTOREAL + NO-REPEAT/dimmed re-entries.
// "THE LAST-BREATH MIRACLE / GLORY DECIDED LATE". OUR PREDICTION Argentina 3-2 Switzerland — a FIVE-GOAL
// end-to-end thriller decided late (Rule #30 variety vs Ep101 3-1 / Ep102 1-0 / Ep103 1-1 draw): Alvarez
// 1-0, Embolo 1-1, Lautaro 2-1, Vargas 2-2, Messi 3-2 last-breath winner. Switzerland twice stay in it;
// Argentina win it at the very end. Mystic (#21): ARGENTINA = Gauchito Gil, the Gaucho Saint — a genuine
// 19th-century Argentine gaucho folk-hero/folk-saint (Antonio Mamerto Gil Nunez), venerated at red
// roadside shrines, prayed to for protection and last-moment miracles -> Legend 104 = Gauchito Gil, the
// Gaucho Saint. Novel vs Argentina's Legend 091 (the Sun of May). Argentina's 5 showcases + 3 goal clips
// REUSED 0-credit + frame-verified from match99-argentina-vs-egypt (Messi 10 / Alvarez 9 / Lautaro 22 /
// Enzo 24 / Mac Allister 20). Switzerland's showcases + generics + 2 goal clips generated FRESH this
// episode (nano_banana_pro stills + kling3_0_turbo i2v/t2v): Xhaka 10 / Embolo 7 / Akanji 5 / Vargas 17 /
// Sommer 1 GK, plus sui-crowd/sui-attack/texture-switzerland. Story-unique fresh: Argentina-vs-Switzerland
// pitch-walkout + captains' handshake. #23 name<->image SYNC (measured VO onsets).

const ARG_BLUE = '#6CACE4', ARG_BLUEDK = '#3f7fbf', ARG_WHITE = '#ffffff', ARG_GOLD = '#f6c945';
const SUI_RED = '#D52B1E', SUI_WHITE = '#ffffff', SUI_DK = '#8f1712';
const ACC = '#f0b743';           // Gauchito Gil crimson-gold accent (Sun of May)
const GRADE = { filter: 'saturate(1.06) contrast(1.04)' };

function FlagARG({ w = 120 }) {
  const h = w * 2 / 3;
  // Argentina: three horizontal bands light-blue / white / light-blue, golden Sun of May centred.
  return (
    <div style={{ width: w, height: h, borderRadius: w * 0.05, position: 'relative', overflow: 'hidden', display: 'flex', flexDirection: 'column', boxShadow: '0 6px 18px rgba(0,0,0,0.45)' }}>
      <div style={{ flex: 1, background: ARG_BLUE }} />
      <div style={{ flex: 1, background: ARG_WHITE }} />
      <div style={{ flex: 1, background: ARG_BLUE }} />
      <span style={{ position: 'absolute', left: '50%', top: '50%', transform: 'translate(-50%,-50%)', color: '#f4c430', fontSize: h * 0.34, lineHeight: 1, fontFamily: SANS, fontWeight: 900, textShadow: '0 0 4px rgba(180,120,0,0.5)' }}>☀</span>
    </div>
  );
}
function FlagSUI({ w = 120 }) {
  const h = w * 2 / 3;
  // Switzerland: red field, bold white cross centred.
  const arm = w * 0.12, len = w * 0.34;
  return (
    <div style={{ width: w, height: h, borderRadius: w * 0.05, position: 'relative', overflow: 'hidden', background: SUI_RED, boxShadow: '0 6px 18px rgba(0,0,0,0.45)' }}>
      <div style={{ position: 'absolute', left: '50%', top: '50%', width: arm, height: len, transform: 'translate(-50%,-50%)', background: SUI_WHITE }} />
      <div style={{ position: 'absolute', left: '50%', top: '50%', width: len, height: arm, transform: 'translate(-50%,-50%)', background: SUI_WHITE }} />
    </div>
  );
}

function FS({ id, style }) { return <ClipSprite id={id} fit="cover" style={{ ...GRADE, ...(style || {}) }} />; }
// Gauchito Gil card art (slow Ken-Burns) — Argentina's cold-open symbol.
function GoldStill({ start = 0, dur = 5 }) {
  const { localTime: lt } = useSprite();
  const p = clamp((lt - start) / dur, 0, 1);
  if (lt < start || lt > start + dur) return null;
  const scale = 1.06 + 0.12 * p;
  const fade = lt < start + 0.4 ? clamp((lt - start) / 0.4, 0, 1) : (lt > start + dur - 0.5 ? clamp((start + dur - lt) / 0.5, 0, 1) : 1);
  return (
    <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', opacity: fade, zIndex: 1 }}>
      <img data-seq src="assets/legend-104-landscape.png" alt="" style={{ position: 'absolute', left: '50%', top: '50%', width: '108%', transform: `translate(-50%,-50%) scale(${scale})`, filter: 'saturate(1.05) contrast(1.03)' }} />
      <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse at 50% 45%, transparent 40%, rgba(8,3,3,0.55) 100%)' }} />
    </div>
  );
}
function NightField({ o = 0.6 }) {
  const { localTime: lt } = useSprite();
  const pulse = 0.5 + 0.5 * Math.sin(lt * 1.1);
  return (
    <div style={{ position: 'absolute', inset: 0, zIndex: 0 }}>
      <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse at 50% 44%, #12100d 0%, #0b0a08 60%, #060505 100%)' }} />
      <div style={{ position: 'absolute', inset: 0, background: `radial-gradient(ellipse at 50% 42%, rgba(240,183,67,${(0.13 * pulse * o).toFixed(3)}) 0%, transparent 55%)` }} />
    </div>
  );
}

function ScoreBug({ start, arg = 3, sui = 2, note = "90'", badge = 'OUR PREDICTION' }) {
  const t = useTime(); const local = t - start; if (local < 0) return null;
  const inP = Easing.easeOutBack(clamp(local / 0.7, 0, 1));
  const cell = { fontFamily: '"Inter",sans-serif', fontWeight: 900, fontSize: 34, color: '#fff', padding: '10px 18px' };
  return (
    <div style={{ position: 'absolute', top: 92, left: '50%', zIndex: 30, transform: `translateX(-50%) scale(${inP})`, opacity: clamp(inP, 0, 1), display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
      <div style={{ display: 'flex', alignItems: 'center', background: MV.panel, border: `1px solid ${MV.line}`, borderRadius: 14, boxShadow: '0 10px 36px rgba(0,0,0,0.6)', overflow: 'hidden' }}>
        <div style={{ ...cell, background: ARG_BLUE, color: '#06121a' }}>ARG</div>
        <div style={{ ...cell, fontSize: 38, color: ACC }}>{arg} — {sui}</div>
        <div style={{ ...cell, background: SUI_RED }}>SUI</div>
        {note && <div style={{ ...cell, fontSize: 24, color: ACC, borderLeft: `1px solid ${MV.line}` }}>{note}</div>}
      </div>
      <div style={{ fontFamily: '"Inter",sans-serif', fontWeight: 800, fontSize: 16, color: ACC, letterSpacing: '0.22em', background: 'rgba(240,183,67,0.14)', border: '1px solid rgba(240,183,67,0.5)', borderRadius: 999, padding: '4px 16px' }}>{badge}</div>
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
      {clipId && <ClipSprite id={clipId} fit="cover" style={{ filter: 'saturate(1.02) contrast(1.03) brightness(0.46)' }} />}
      <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg, rgba(6,3,3,0.60) 0%, rgba(6,3,3,0.28) 42%, rgba(6,3,3,0.78) 100%)' }} />
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
  const dark = accent === ARG_BLUE || accent === SUI_WHITE || accent === ARG_GOLD;
  return (
    <div style={{ position: 'absolute', inset: 0, zIndex: 12, opacity: fade }}>
      <ClipSprite id={clipId} fit="cover" style={GRADE} />
      <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg, rgba(0,0,0,0.24) 0%, transparent 18%, transparent 38%, rgba(6,3,3,0.90) 74%, rgba(6,3,3,0.97) 100%)' }} />
      <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: 12, background: accent, boxShadow: `0 0 30px ${accent}` }} />
      <div style={{ position: 'absolute', left: 80, bottom: 120, transform: `translateX(${-slide}px)`, opacity: inP }}>
        <div style={{ display: 'inline-block', background: accent, color: dark ? '#06121a' : '#fff', fontFamily: '"Inter",sans-serif', fontWeight: 800, fontSize: 22, letterSpacing: '0.2em', padding: '6px 18px', borderRadius: 6, marginBottom: 14 }}>{role}</div>
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
function Backdrop() { return <div style={{ position: 'absolute', inset: 0, zIndex: 0, background: 'radial-gradient(ellipse at 50% 45%, #14110c 0%, #060505 100%)' }} />; }

function SceneColdOpen() {
  const { localTime: lt } = useSprite();
  const beat = Math.pow(Math.max(0, Math.sin(lt * Math.PI * 1.1)), 8);
  const teaseP = clamp((lt - 6.5) / 0.8, 0, 1) * clamp((14.0 - lt) / 0.6, 0, 1);
  const titleP = Easing.easeOutCubic(clamp((lt - 15.4) / 1.4, 0, 1));
  return (
    <div style={{ position: 'absolute', inset: 0 }}>
      {lt >= 15.2 && <NightField o={0.9} />}
      <GoldStill start={0} dur={5} />
      <FS id="texture-argentina" /><FS id="texture-switzerland" />
      <div style={{ position: 'absolute', inset: 0, background: `radial-gradient(ellipse at center, rgba(240,183,67,${(0.20 * beat).toFixed(3)}) 0%, transparent 60%)` }} />
      <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg, rgba(6,3,3,0.34) 0%, transparent 30%, transparent 56%, rgba(6,3,3,0.76) 100%)' }} />
      {teaseP > 0.01 && (
        <div style={{ position: 'absolute', left: 0, right: 0, bottom: 150, textAlign: 'center', zIndex: 23, opacity: teaseP }}>
          <div style={{ display: 'inline-block', fontFamily: '"Inter",sans-serif', fontWeight: 800, fontSize: 30, color: '#f4dca8', letterSpacing: '0.22em', textShadow: '0 2px 18px rgba(0,0,0,0.85)' }}>THE GAUCHO SAINT MEETS THE RED WALL.</div>
        </div>
      )}
      {lt > 15.3 && (
        <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 26, opacity: titleP, zIndex: 22 }}>
          <Kicker size={32} color={ACC}>The Last-Breath Miracle</Kicker>
          <TitleReveal text="GAUCHITO GIL" start={16.2} size={58} color={ACC} />
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
      <AmbientParticles start={23.0} dur={10} count={34} color="240,183,67" />
      <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 38 }}>
        <div style={{ opacity: p1, transform: `translateY(${(1 - p1) * -30}px)` }}><Kicker>WorldCup26 Legends · Episode 104 · Play-Offs</Kicker></div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 52, opacity: clamp(p2, 0, 1), transform: `scale(${p2})` }}>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 18 }}><Waving><FlagARG w={190} /></Waving><BigTitle size={64} glow={ARG_BLUE}>ARGENTINA</BigTitle></div>
          <BigTitle size={104} color={ACC}>VS</BigTitle>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 18 }}><Waving speed={1.9}><FlagSUI w={190} /></Waving><BigTitle size={64} glow={SUI_RED}>SWITZERLAND</BigTitle></div>
        </div>
        <div style={{ opacity: p3, fontFamily: '"Inter",sans-serif', fontWeight: 600, fontSize: 30, color: MV.muted, letterSpacing: '0.10em' }}>FLAIR AGAINST IRON — DECIDED IN THE LAST BREATH</div>
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
      <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg, transparent 50%, rgba(6,3,3,0.8) 100%)' }} />
      <div style={{ position: 'absolute', left: 0, right: 0, bottom: 120, display: 'flex', justifyContent: 'center', zIndex: 25, opacity: stripP, transform: `translateY(${(1 - stripP) * 30}px)` }}>
        <div style={{ display: 'flex', background: MV.panel, border: `1px solid ${MV.line}`, borderRadius: 16, overflow: 'hidden', backdropFilter: 'blur(6px)' }}>
          {[['THE', 'ALBICELESTE'], ['THE RED WALL', 'SWITZERLAND'], ['EPISODE 104', 'PLAY-OFFS'], ['WIN OR', 'GO HOME']].map(([v, l], i) => (
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

function SceneArgentina() {
  return (
    <div style={{ position: 'absolute', inset: 0 }}>
      <NightField o={0.5} />
      <Sprite start={44} end={49}><div style={{ position: 'absolute', inset: 0 }}><FS id="arg-crowd" /><div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg, rgba(6,3,3,0.30) 0%, transparent 40%, rgba(6,3,3,0.55) 100%)' }} /><TeamBanner flag={<FlagARG w={58} />} label="THE ALBICELESTE · ARGENTINA" accent={ARG_BLUE} /></div></Sprite>
      <Sprite start={49} end={54}><div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse at 50% 45%, #12100d 0%, #060505 70%)' }} /></Sprite>
      <Sprite start={54} end={55.5}><div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(90deg, rgba(108,172,228,0.18), #060505 65%)' }} /></Sprite>
      <PlayerShowcase clipId="arg-messi" name="LIONEL MESSI" role="CAPTAIN · THE GREATEST · 10" accent={ARG_BLUE} start={55.5} end={60.3} />
      <PlayerShowcase clipId="arg-alvarez" name="JULIÁN ÁLVAREZ" role="THE HUNTER · 9" accent={ARG_GOLD} start={60.3} end={65.1} />
      <PlayerShowcase clipId="arg-lautaro" name="LAUTARO MARTÍNEZ" role="PURE INSTINCT · 22" accent={ARG_BLUE} start={65.1} end={69.9} />
      <PlayerShowcase clipId="arg-enzo" name="ENZO FERNÁNDEZ" role="THE HEARTBEAT · 24" accent={ARG_GOLD} start={69.9} end={74.7} />
      <PlayerShowcase clipId="arg-macallister" name="ALEXIS MAC ALLISTER" role="THE CONTROL · 20" accent={ARG_BLUE} start={74.7} end={79.5} />
    </div>
  );
}

function SceneSwitzerland() {
  return (
    <div style={{ position: 'absolute', inset: 0 }}>
      <NightField o={0.5} />
      <Sprite start={79.5} end={84.5}><div style={{ position: 'absolute', inset: 0 }}><FS id="sui-crowd" /><div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg, rgba(6,3,3,0.30) 0%, transparent 40%, rgba(6,3,3,0.55) 100%)' }} /><TeamBanner flag={<FlagSUI w={64} />} label="THE RED WALL · SWITZERLAND" accent={SUI_RED} /></div></Sprite>
      <Sprite start={84.5} end={90.6}><div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(120deg, rgba(213,43,30,0.16), #060505 65%)' }} /></Sprite>
      <PlayerShowcase clipId="sui-xhaka" name="GRANIT XHAKA" role="CAPTAIN · THE DRIVER · 10" accent={SUI_RED} start={90.6} end={95.08} />
      <PlayerShowcase clipId="sui-embolo" name="BREEL EMBOLO" role="POWER & DANGER · 7" accent={SUI_RED} start={95.08} end={99.56} />
      <PlayerShowcase clipId="sui-akanji" name="MANUEL AKANJI" role="COMPOSURE & STEEL · 5" accent={SUI_RED} start={99.56} end={104.04} />
      <PlayerShowcase clipId="sui-vargas" name="RUBÉN VARGAS" role="QUICK & DIRECT · 17" accent={SUI_RED} start={104.04} end={108.52} />
      <PlayerShowcase clipId="sui-sommer" name="YANN SOMMER" role="THE LAST LINE · 1" accent={SUI_WHITE} start={108.52} end={113.0} />
    </div>
  );
}

function SceneRiddle() {
  return (
    <div style={{ position: 'absolute', inset: 0 }}>
      <NightField o={0.5} />
      <Sprite start={113} end={118}><div style={{ position: 'absolute', inset: 0 }}><FS id="stadium-aerial" /><div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.24)' }} /><div style={{ position: 'absolute', left: 0, right: 0, bottom: 70, textAlign: 'center', fontFamily: '"Inter",sans-serif', fontWeight: 900, fontSize: 54, color: '#fff', textShadow: '0 4px 26px rgba(0,0,0,0.9)' }}>THE ALBICELESTE vs THE RED WALL</div></div></Sprite>
      <Sprite start={118} end={123}><NightField o={0.75} /></Sprite>
      <Sprite start={123} end={132}><BeatCard start={123} end={132} text={<>WHEN FLAIR MEETS IRON,<br />WHO FINDS THE ANSWER LATE?</>} accent={ACC} big={44} /></Sprite>
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
        <div style={{ width: 124, height: 124, borderRadius: '50%', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#0b0906', border: '3px solid rgba(255,255,255,0.9)' }}>{flag}</div>
      </div>
      <span style={{ fontFamily: '"Inter",sans-serif', fontWeight: 900, fontSize: 24, color: '#fff', letterSpacing: '0.03em' }}>{name}</span>
    </div>
  );
  return (
    <div style={{ position: 'absolute', inset: 0, zIndex: 28, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(4,2,2,0.62)', opacity: p }}>
      <div style={{ width: 1010, borderRadius: 28, overflow: 'hidden', transform: `scale(${0.92 + 0.08 * p})`, boxShadow: '0 36px 130px rgba(0,0,0,0.8)', position: 'relative', border: '2px solid rgba(240,183,67,0.55)' }}>
        <div style={{ position: 'absolute', inset: 0, background: `linear-gradient(105deg, ${ARG_BLUE}33 0%, #0b0906 38%, #0b0906 62%, ${SUI_RED}44 100%)` }} />
        <div style={{ position: 'absolute', top: 0, bottom: 0, left: `${sheenX}%`, width: '22%', background: 'linear-gradient(105deg, transparent, rgba(255,255,255,0.10), transparent)', transform: 'skewX(-18deg)', pointerEvents: 'none', zIndex: 5 }} />
        <div style={{ position: 'relative', zIndex: 2, background: `linear-gradient(100deg, ${ARG_BLUE} 0%, ${ACC} 50%, ${SUI_RED} 100%)`, padding: '13px 0', textAlign: 'center' }}>
          <span style={{ fontFamily: '"Inter",sans-serif', fontWeight: 900, fontSize: 17, letterSpacing: '0.26em', color: '#06121a' }}>WORLDCUP26 LEGENDS · EPISODE 104 · OUR PREDICTION · NOT PLAYED</span>
        </div>
        <div style={{ position: 'relative', zIndex: 2, padding: '36px 70px 28px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 46 }}>
            <Badge flag={<FlagARG w={104} />} name="ARGENTINA" accent={ARG_BLUE} />
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, fontFamily: '"Inter",sans-serif', fontWeight: 900, fontSize: 116, color: '#fff', lineHeight: 1 }}>
                <span style={{ textShadow: `0 0 36px ${ARG_BLUE}cc` }}>3</span>
                <span style={{ color: ACC, fontSize: 58, transform: 'translateY(-6px)' }}>—</span>
                <span style={{ textShadow: `0 0 36px ${SUI_RED}cc` }}>2</span>
              </div>
              <div style={{ fontFamily: '"Inter",sans-serif', fontWeight: 800, fontSize: 16, color: MV.muted, letterSpacing: '0.30em', marginTop: 4 }}>FULL-TIME</div>
            </div>
            <Badge flag={<FlagSUI w={104} />} name="SWITZERLAND" accent={SUI_RED} />
          </div>
          <div style={{ textAlign: 'center', marginTop: 16, fontFamily: '"Inter",sans-serif', fontWeight: 900, fontSize: 28, color: ACC, letterSpacing: '0.04em', textShadow: `0 0 26px ${ACC}66` }}>ÁLVAREZ · LAUTARO · MESSI (LAST BREATH)</div>
          <div style={{ display: 'flex', justifyContent: 'center', gap: 12, marginTop: 16, paddingTop: 18, borderTop: '1px solid rgba(255,255,255,0.12)' }}>
            <span style={{ fontFamily: '"Inter",sans-serif', fontWeight: 800, fontSize: 21, color: '#f6e6c4', background: 'rgba(240,183,67,0.16)', border: '1px solid rgba(240,183,67,0.45)', borderRadius: 999, padding: '7px 18px' }}>✦ A FIVE-GOAL CLASSIC, DECIDED AT THE DEATH</span>
          </div>
          <div style={{ textAlign: 'center', marginTop: 12, fontFamily: '"Inter",sans-serif', fontWeight: 700, fontSize: 16, color: MV.muted, letterSpacing: '0.2em' }}>worldcup26.world</div>
        </div>
        {stampP > 0 && <div style={{ position: 'absolute', top: 64, right: -6, zIndex: 6, transform: `rotate(-12deg) scale(${stampP})`, border: `4px solid ${ACC}`, color: ACC, borderRadius: 12, padding: '8px 22px', fontFamily: '"Inter",sans-serif', fontWeight: 900, fontSize: 24, letterSpacing: '0.14em', background: 'rgba(11,9,6,0.92)' }}>OUR STORY</div>}
      </div>
    </div>
  );
}

function SceneDrama() {
  return (
    <div style={{ position: 'absolute', inset: 0 }}>
      <Backdrop />
      <Sprite start={132} end={138}><BeatCard clipId="texture-argentina-b" start={132} end={138} text={<>A NIGHT WITH<br />EVERYTHING</>} sub="NEITHER SIDE WILL SIT BACK" accent={ACC} big={58} /></Sprite>
      <Sprite start={138} end={146.5}><div style={{ position: 'absolute', inset: 0 }}><FS id="arg-attack" /><ChanceTag start={142} end={146.5} text="ARGENTINA COME FLYING OUT" sub="HUNTING THE FIRST BLOW" accent={ARG_BLUE} /></div></Sprite>
      <Sprite start={146.5} end={155}><div style={{ position: 'absolute', inset: 0 }}><FS id="arg-goal-1" /><GoalFlash at={147} /><ChanceTag start={147.5} end={153} text="ÁLVAREZ POUNCES!" sub="ARGENTINA · 1–0" accent={ARG_BLUE} /></div></Sprite>
      <Sprite start={155} end={162.5}><div style={{ position: 'absolute', inset: 0 }}><FS id="sui-attack" /><ChanceTag start={158} end={162.5} text="SWITZERLAND HIT STRAIGHT BACK" sub="COLD AND CERTAIN" accent={SUI_RED} /></div></Sprite>
      <Sprite start={162.5} end={171}><div style={{ position: 'absolute', inset: 0 }}><FS id="sui-goal-1" /><GoalFlash at={163} /><ChanceTag start={163.5} end={169} text="EMBOLO LEVELS IT!" sub="SWITZERLAND · 1–1" accent={SUI_RED} /></div></Sprite>
      <Sprite start={171} end={178.5}><BeatCard clipId="arg-crowd-b" start={171} end={178.5} text={<>ARGENTINA<br />SURGE AGAIN</>} sub="MESSI PULLING THE STRINGS" accent={ARG_BLUE} big={56} /></Sprite>
      <Sprite start={178.5} end={187}><div style={{ position: 'absolute', inset: 0 }}><FS id="arg-goal-2" /><GoalFlash at={179} /><ChanceTag start={179.5} end={185} text="LAUTARO STRIKES!" sub="ARGENTINA · 2–1" accent={ARG_BLUE} /></div></Sprite>
      <Sprite start={187} end={195.5}><BeatCard clipId="sui-crowd-b" start={187} end={195.5} text={<>SWITZERLAND<br />WON'T BREAK</>} sub="XHAKA DRIVES THEM ON" accent={SUI_RED} big={56} /></Sprite>
      <Sprite start={195.5} end={204}><div style={{ position: 'absolute', inset: 0 }}><FS id="sui-goal-2" /><GoalFlash at={196} /><ChanceTag start={196.5} end={202} text="VARGAS ANSWERS AGAIN!" sub="SWITZERLAND · 2–2" accent={SUI_RED} /></div></Sprite>
      <Sprite start={204} end={213}><BeatCard clipId="bg-roar" start={204} end={213} text={<>BLOW FOR BLOW —<br />END TO END</>} sub="SCREAMING FOR A HERO" accent={ACC} big={52} /></Sprite>
      <Sprite start={213} end={221.5}><BeatCard clipId="crowd-tense" start={213} end={221.5} text={<>ARGENTINA<br />PRESS FOR THE WINNER</>} sub="EVERY PRAYER TO THE CAPTAIN" accent={ARG_GOLD} big={50} /></Sprite>
      <Sprite start={221.5} end={231}><div style={{ position: 'absolute', inset: 0 }}><FS id="arg-goal-3" /><GoalFlash at={222} /><ChanceTag start={222.5} end={229} text="MESSI! THE LAST BREATH!" sub="ARGENTINA LEAD · 3–2" accent={ARG_GOLD} /></div></Sprite>
      <Sprite start={231} end={241}><div style={{ position: 'absolute', inset: 0 }}><FS id="stadium-wide-b" /><div style={{ position: 'absolute', inset: 0, background: 'rgba(6,3,3,0.35)' }} /><ChanceTag start={232} end={238} text="THE FINAL WHISTLE!" sub="ARGENTINA WIN · 3–2" accent={ACC} /><ScoreBug start={237.2} arg={3} sui={2} note="FULL-TIME" badge="OUR PREDICTION" /><PredictionCard start={237.8} /></div></Sprite>
      <Vignette strength={0.32} />
    </div>
  );
}

function SceneVerdict() {
  const t = useTime();
  const panelP = Easing.easeOutCubic(clamp((t - 262.68) / 1.0, 0, 1));
  return (
    <div style={{ position: 'absolute', inset: 0 }}>
      <Sprite start={241} end={251.08}><div style={{ position: 'absolute', inset: 0 }}><FS id="vd-handshake" /><div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg, rgba(6,3,3,0.25) 0%, transparent 45%, rgba(6,3,3,0.55) 100%)' }} /><div style={{ position: 'absolute', left: 0, right: 0, top: 120, textAlign: 'center', zIndex: 24 }}><Kicker size={28} color={ACC}>Decided In The Last Breath</Kicker></div></div></Sprite>
      <Sprite start={251.08} end={256.68}><BeatCard start={251.08} end={256.68} text={<>SWITZERLAND WALK OFF<br />HEADS HELD HIGH</>} sub="THEY NEVER STOPPED COMING" accent={SUI_RED} big={52} /></Sprite>
      <Sprite start={256.68} end={262.68}><BeatCard start={256.68} end={262.68} text={<>ARGENTINA HAD<br />A HERO AT THE DEATH</>} sub="A NIGHT THAT DEMANDED ONE" accent={ACC} big={52} /></Sprite>
      <Sprite start={262.68} end={281.68}>
        <div style={{ position: 'absolute', inset: 0 }}>
          <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse at 50% 45%, #12100d 0%, #060505 70%)' }} />
          <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg, rgba(6,3,3,0.66) 0%, rgba(6,3,3,0.52) 50%, rgba(6,3,3,0.78) 100%)' }} />
          <AmbientParticles start={262.68} dur={19} count={26} color="240,183,67" />
          <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 25 }}>
            <div style={{ background: MV.panel, border: `1px solid ${MV.line}`, borderRadius: 24, padding: '48px 80px', minWidth: 900, backdropFilter: 'blur(6px)', opacity: panelP, transform: `translateY(${(1 - panelP) * 24}px)` }}>
              <Kicker size={26}>Our Prediction</Kicker>
              <div style={{ marginTop: 24 }}>
                <StatLine start={263.18} delay={0.0} label="ARGENTINA" value="THE ALBICELESTE" accent={ARG_BLUE} />
                <StatLine start={263.18} delay={0.25} label="SWITZERLAND" value="THE RED WALL" accent={SUI_RED} />
                <StatLine start={263.18} delay={0.5} label="OUR PREDICTION" value="ARG 3 — 2 SUI" accent="#fff" />
                <StatLine start={263.18} delay={0.75} label="MESSI · LAST BREATH" value="DECIDED AT THE DEATH" accent={ACC} />
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
    { label: 'COMMENT ARGENTINA', sub: 'ALBICELESTE', flag: <FlagARG w={68} />, accent: ARG_BLUE },
    { label: 'COMMENT SWITZERLAND', sub: 'THE RED WALL', flag: <FlagSUI w={68} />, accent: SUI_RED },
  ];
  return (
    <div style={{ position: 'absolute', inset: 0 }}>
      <NightField o={0.5} />
      <AmbientParticles start={281.68} dur={11} count={30} color="240,183,67" />
      <div style={{ position: 'absolute', inset: 0, background: 'rgba(10,7,4,0.58)' }} />
      <div style={{ position: 'absolute', top: 140, left: 0, right: 0, textAlign: 'center', zIndex: 25, opacity: headP }}><Kicker size={30}>Did Argentina Earn That Late Magic, Or Did Switzerland Deserve To Take It Home?</Kicker></div>
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
  const prev = ['legend-100-portrait', 'legend-101-portrait', 'legend-102-portrait', 'legend-103-portrait'];
  return (
    <div style={{ display: 'flex', alignItems: 'flex-end', gap: 12 }}>
      {prev.map((id) => (
        <div key={id} style={{ width: 64, height: 86, borderRadius: 8, overflow: 'hidden', border: '1px solid rgba(255,255,255,0.22)', boxShadow: '0 8px 20px rgba(0,0,0,0.5)', opacity: 0.82 }}>
          <img data-seq alt="" src={`assets/${id}.png`} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
        </div>
      ))}
      <div style={{ width: 78, height: 104, borderRadius: 9, overflow: 'hidden', border: `2px solid ${ACC}`, boxShadow: `0 10px 28px rgba(0,0,0,0.6), 0 0 26px ${ACC}66` }}>
        <img data-seq alt="" src="assets/legend-104-portrait.png" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
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
      <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse at 50% 46%, #2a1410 0%, #1a0d0a 50%, #0b0605 100%)' }} />
      <div style={{ position: 'absolute', inset: 0, background: `radial-gradient(ellipse at 50% 44%, rgba(240,183,67,${(0.32 * glow).toFixed(3)}) 0%, transparent 55%)` }} />
      <AmbientParticles start={292.68} dur={26} count={56} color="245,200,110" maxR={4.2} />
      {teaseP > 0.01 && (
        <div style={{ position: 'absolute', left: 0, right: 0, top: 90, textAlign: 'center', opacity: teaseP, zIndex: 20 }}>
          <div style={{ display: 'inline-block', fontFamily: '"Inter",sans-serif', fontWeight: 800, fontSize: 30, color: '#f4dca8', letterSpacing: '0.24em', textShadow: '0 2px 18px rgba(0,0,0,0.7)' }}>THE FINAL MOMENT</div>
        </div>
      )}
      {lt > 1.6 && (
        <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 22, opacity: clamp(cardP, 0, 1) }}>
          <div style={{ position: 'relative', transform: `perspective(1500px) rotateY(${tilt}deg) scale(${0.92 + 0.08 * Math.min(cardP, 1)})`, marginTop: -34 }}>
            <img data-seq src="assets/legend-104-portrait.png" alt="" style={{ height: 640, display: 'block', borderRadius: 16, boxShadow: '0 50px 130px rgba(0,0,0,0.85), 0 0 80px rgba(240,183,67,0.5)' }} />
            <div style={{ position: 'absolute', top: 0, bottom: 0, left: `${sheenX}%`, width: '22%', background: 'linear-gradient(105deg, transparent, rgba(255,235,190,0.30), transparent)', transform: 'skewX(-18deg)', borderRadius: 16, pointerEvents: 'none', zIndex: 6 }} />
            <div style={{ position: 'absolute', top: 18, left: '50%', transform: 'translateX(-50%)', background: 'rgba(240,183,67,0.95)', color: '#2a1608', fontFamily: '"Inter",sans-serif', fontWeight: 900, fontSize: 17, letterSpacing: '0.14em', padding: '5px 16px', borderRadius: 8, boxShadow: '0 6px 20px rgba(0,0,0,0.5)' }}>Nº 104 · ✦✦✦ ULTRA RARE</div>
          </div>
        </div>
      )}
      <div style={{ position: 'absolute', left: 0, right: 0, bottom: 56, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16, zIndex: 24 }}>
        <div style={{ textAlign: 'center', opacity: txtP, transform: `translateY(${(1 - txtP) * 16}px)` }}>
          <div style={{ fontFamily: '"Inter",sans-serif', fontWeight: 900, fontSize: 38, color: ACC, letterSpacing: '0.03em', textShadow: '0 2px 24px rgba(240,183,67,0.5)' }}>GAUCHITO GIL · THE GAUCHO SAINT</div>
          <div style={{ fontFamily: '"Inter",sans-serif', fontWeight: 700, fontSize: 19, color: '#f0dcb8', letterSpacing: '0.18em', marginTop: 6 }}>ARGENTINA · LEGEND 104</div>
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
  const filled = ['legend-101-portrait', 'legend-102-portrait', 'legend-103-portrait'];
  const cardX = -360 + fly * 360, cardY = -40 + fly * 150, cardS = 1 - fly * 0.62;
  return (
    <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 26, opacity: inP }}>
      <div style={{ position: 'relative', width: 300, height: 600, borderRadius: 40, background: 'linear-gradient(160deg,#2b2620,#130e0a)', border: '3px solid #382f28', boxShadow: '0 40px 110px rgba(0,0,0,0.8), 0 0 50px rgba(240,183,67,0.25)', padding: 12 }}>
        <div style={{ position: 'absolute', top: 16, left: '50%', transform: 'translateX(-50%)', width: 90, height: 8, borderRadius: 6, background: '#0b0705' }} />
        <div style={{ width: '100%', height: '100%', borderRadius: 30, background: 'radial-gradient(ellipse at 50% 20%, #201810 0%, #0c0806 70%)', overflow: 'hidden', position: 'relative', padding: '34px 18px 18px' }}>
          <div style={{ textAlign: 'center', fontFamily: '"Inter",sans-serif', fontWeight: 900, fontSize: 15, color: ACC, letterSpacing: '0.18em' }}>MY LEGENDS</div>
          <div style={{ textAlign: 'center', fontFamily: '"Inter",sans-serif', fontWeight: 700, fontSize: 10, color: '#d8bd8f', letterSpacing: '0.1em', marginTop: 2, marginBottom: 14 }}>worldcup26.world</div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 10 }}>
            {filled.map((id) => (
              <div key={id} style={{ height: 104, borderRadius: 6, overflow: 'hidden', border: '1px solid rgba(255,255,255,0.16)' }}>
                <img data-seq alt="" src={`assets/${id}.png`} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
              </div>
            ))}
            <div style={{ height: 104, borderRadius: 6, overflow: 'hidden', border: snapped ? `2px solid ${ACC}` : '1px dashed rgba(240,183,67,0.6)', position: 'relative', boxShadow: flash > 0 ? `0 0 ${20 * flash}px ${ACC}` : 'none' }}>
              {snapped && <img data-seq alt="" src="assets/legend-104-portrait.png" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />}
              {flash > 0 && <div style={{ position: 'absolute', inset: 0, background: ACC, opacity: flash * 0.6 }} />}
            </div>
            <div style={{ height: 104, borderRadius: 6, border: '1px dashed rgba(255,255,255,0.14)' }} />
          </div>
          {snapped && local < 4.4 && <div style={{ position: 'absolute', left: 0, right: 0, bottom: 30, textAlign: 'center', fontFamily: '"Inter",sans-serif', fontWeight: 900, fontSize: 16, color: ACC, letterSpacing: '0.16em', opacity: clamp(1 - (local - 3.6), 0, 1) }}>COLLECTED!</div>}
        </div>
      </div>
      {!snapped && local > 0.4 && (
        <div style={{ position: 'absolute', left: '50%', top: '50%', transform: `translate(-50%,-50%) translate(${cardX}px, ${cardY}px) scale(${cardS})`, width: 200, height: 267, borderRadius: 12, overflow: 'hidden', border: `2px solid ${ACC}`, boxShadow: `0 30px 80px rgba(0,0,0,0.7), 0 0 40px ${ACC}88`, zIndex: 30 }}>
          <img data-seq alt="" src="assets/legend-104-portrait.png" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
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
      <AmbientParticles start={319.06} dur={21} count={24} color="240,183,67" />
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
      <NightField o={0.7} />
      <Confetti start={340.73} dur={15} count={90} />
      <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg, rgba(6,3,3,0.45) 0%, rgba(6,3,3,0.30) 45%, rgba(6,3,3,0.72) 100%)' }} />
      <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 26, zIndex: 25, opacity: p }}>
        <Kicker size={30} color={ACC}>WorldCup26 Legends · Episode 104</Kicker>
        <div style={{ fontFamily: '"Inter",sans-serif', fontWeight: 900, fontSize: 64, color: '#fff', letterSpacing: '0.03em', textAlign: 'center', textShadow: '0 6px 30px rgba(0,0,0,0.85)' }}>LIKE · SUBSCRIBE</div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
          <FlagARG w={58} />
          <div style={{ fontFamily: '"Inter",sans-serif', fontWeight: 900, fontSize: 34, color: ACC, letterSpacing: '0.2em' }}>worldcup26.world</div>
          <FlagSUI w={58} />
        </div>
      </div>
      <Vignette strength={0.4} />
    </div>
  );
}
