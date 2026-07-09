// match-scenes.jsx — Ep100 Switzerland vs Colombia (Play-Offs) — MILESTONE 100TH EPISODE —
// PHOTOREAL + NO-REPEAT/NO-LOOP. "THE MARKSMAN AND THE GOLDEN CITY". OUR PREDICTION Switzerland 2-1
// Colombia (Colombia strike first through Díaz's pace; Embolo levels it 1-1; late, Xhaka — the
// captain who never misses — strikes the winner, a nod to Tell's arrow). Mystic (#21): SWITZERLAND =
// carried by the legend of Wilhelm Tell, the master crossbowman who was forced to shoot an apple off
// his own son's head and never once missed ("Tellenlegende" — a real, centuries-documented Swiss
// founding folk legend, distinct from Legend 029's Alpine Guide, Legend 052's Watchmaker and Legend
// 089's Mountain motifs) -> Legend 100 = Wilhelm Tell, the Marksman. COLOMBIA = El Dorado, the Golden
// City (already carded as Legend 092/050/071/BONUS-1 — referenced here as flavor text only, NOT
// re-carded). Both squads freshly generated + independently likeness-audited this episode (Rule #29):
// Switzerland showcases regenerated from scratch after no recoverable manifest existed for Ep89's
// originals; Colombia showcases reused as-is from Ep92 after audit found them all correct. #23
// name<->image SYNC (measured VO onsets). Both sides run 5 named showcases — no squad-accuracy
// omission needed this episode.

const SUI_RED = '#d52b1e', SUI_WHITE = '#f3f4f7';
const COL_YELLOW = '#fcd116', COL_BLUE = '#003893', COL_RED = '#ce1126';
const ACC = '#e0a226';           // arrow-gold accent (the mark / the golden city)
const GRADE = { filter: 'saturate(1.06) contrast(1.04)' };

function FlagSUI({ w = 120 }) {
  const h = w;
  return (
    <div style={{ width: w, height: h, borderRadius: w * 0.08, overflow: 'hidden', position: 'relative', background: SUI_RED, boxShadow: '0 6px 18px rgba(0,0,0,0.45)' }}>
      <div style={{ position: 'absolute', left: '42%', top: '20%', width: '16%', height: '60%', background: SUI_WHITE }} />
      <div style={{ position: 'absolute', left: '20%', top: '42%', width: '60%', height: '16%', background: SUI_WHITE }} />
    </div>
  );
}
function FlagCOL({ w = 120 }) {
  const h = w * 2 / 3;
  return (
    <div style={{ width: w, height: h, borderRadius: w * 0.05, position: 'relative', overflow: 'hidden', boxShadow: '0 6px 18px rgba(0,0,0,0.45)' }}>
      <div style={{ position: 'absolute', inset: 0, background: COL_YELLOW }} />
      <div style={{ position: 'absolute', top: '50%', left: 0, right: 0, height: '25%', background: COL_BLUE }} />
      <div style={{ position: 'absolute', top: '75%', left: 0, right: 0, height: '25%', background: COL_RED }} />
    </div>
  );
}

function FS({ id, style }) { return <ClipSprite id={id} fit="cover" style={{ ...GRADE, ...(style || {}) }} />; }
// Wilhelm Tell card art (slow Ken-Burns) — Switzerland's cold-open symbol.
function GoldStill({ start = 0, dur = 5 }) {
  const { localTime: lt } = useSprite();
  const p = clamp((lt - start) / dur, 0, 1);
  if (lt < start || lt > start + dur) return null;
  const scale = 1.06 + 0.12 * p;
  const fade = lt < start + 0.4 ? clamp((lt - start) / 0.4, 0, 1) : (lt > start + dur - 0.5 ? clamp((start + dur - lt) / 0.5, 0, 1) : 1);
  return (
    <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', opacity: fade, zIndex: 1 }}>
      <img data-seq src="assets/legend-100-landscape.png" alt="" style={{ position: 'absolute', left: '50%', top: '50%', width: '108%', transform: `translate(-50%,-50%) scale(${scale})`, filter: 'saturate(1.05) contrast(1.03)' }} />
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
      <div style={{ position: 'absolute', inset: 0, background: `radial-gradient(ellipse at 50% 42%, rgba(224,162,38,${(0.13 * pulse * o).toFixed(3)}) 0%, transparent 55%)` }} />
    </div>
  );
}

function ScoreBug({ start, sui = 1, col = 1, note = "88'", badge = 'OUR PREDICTION' }) {
  const t = useTime(); const local = t - start; if (local < 0) return null;
  const inP = Easing.easeOutBack(clamp(local / 0.7, 0, 1));
  const cell = { fontFamily: '"Inter",sans-serif', fontWeight: 900, fontSize: 34, color: '#fff', padding: '10px 18px' };
  return (
    <div style={{ position: 'absolute', top: 92, left: '50%', zIndex: 30, transform: `translateX(-50%) scale(${inP})`, opacity: clamp(inP, 0, 1), display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
      <div style={{ display: 'flex', alignItems: 'center', background: MV.panel, border: `1px solid ${MV.line}`, borderRadius: 14, boxShadow: '0 10px 36px rgba(0,0,0,0.6)', overflow: 'hidden' }}>
        <div style={{ ...cell, background: SUI_RED }}>SUI</div>
        <div style={{ ...cell, fontSize: 38, color: ACC }}>{sui} — {col}</div>
        <div style={{ ...cell, background: COL_BLUE }}>COL</div>
        {note && <div style={{ ...cell, fontSize: 24, color: ACC, borderLeft: `1px solid ${MV.line}` }}>{note}</div>}
      </div>
      <div style={{ fontFamily: '"Inter",sans-serif', fontWeight: 800, fontSize: 16, color: ACC, letterSpacing: '0.22em', background: 'rgba(224,162,38,0.14)', border: '1px solid rgba(224,162,38,0.5)', borderRadius: 999, padding: '4px 16px' }}>{badge}</div>
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
  const titleP = Easing.easeOutCubic(clamp((lt - 15.4) / 1.4, 0, 1));
  return (
    <div style={{ position: 'absolute', inset: 0 }}>
      {lt >= 15.2 && <NightField o={0.9} />}
      <GoldStill start={0} dur={5} />
      <FS id="texture-switzerland" /><FS id="texture-colombia" />
      <div style={{ position: 'absolute', inset: 0, background: `radial-gradient(ellipse at center, rgba(224,162,38,${(0.20 * beat).toFixed(3)}) 0%, transparent 60%)` }} />
      <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg, rgba(2,3,8,0.34) 0%, transparent 30%, transparent 56%, rgba(2,3,8,0.76) 100%)' }} />
      {teaseP > 0.01 && (
        <div style={{ position: 'absolute', left: 0, right: 0, bottom: 150, textAlign: 'center', zIndex: 23, opacity: teaseP }}>
          <div style={{ display: 'inline-block', fontFamily: '"Inter",sans-serif', fontWeight: 800, fontSize: 30, color: '#f0dca6', letterSpacing: '0.22em', textShadow: '0 2px 18px rgba(0,0,0,0.85)' }}>THE MARKSMAN MEETS THE GOLDEN CITY.</div>
        </div>
      )}
      {lt > 15.3 && (
        <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 26, opacity: titleP, zIndex: 22 }}>
          <Kicker size={32} color={ACC}>The Marksman and The Golden City</Kicker>
          <TitleReveal text="WILHELM TELL" start={16.2} size={64} color={ACC} />
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
      <AmbientParticles start={23.0} dur={10} count={34} color="224,162,38" />
      <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 38 }}>
        <div style={{ opacity: p1, transform: `translateY(${(1 - p1) * -30}px)` }}><Kicker>WorldCup26 Legends · Episode 100 · Play-Offs</Kicker></div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 52, opacity: clamp(p2, 0, 1), transform: `scale(${p2})` }}>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 18 }}><Waving><FlagSUI w={168} /></Waving><BigTitle size={62} glow={SUI_RED}>SWITZERLAND</BigTitle></div>
          <BigTitle size={104} color={ACC}>VS</BigTitle>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 18 }}><Waving speed={1.9}><FlagCOL w={210} /></Waving><BigTitle size={72} glow={COL_YELLOW}>COLOMBIA</BigTitle></div>
        </div>
        <div style={{ opacity: p3, fontFamily: '"Inter",sans-serif', fontWeight: 600, fontSize: 30, color: MV.muted, letterSpacing: '0.10em' }}>ONE SHOT, NO SECOND ARROW</div>
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
          {[['THE MARKSMAN', 'SWITZERLAND'], ['EL DORADO', 'COLOMBIA'], ['ONE HUNDRED', 'EPISODES STRONG'], ['PLAY-OFFS', 'WIN OR GO HOME']].map(([v, l], i) => (
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

function SceneSwitzerland() {
  return (
    <div style={{ position: 'absolute', inset: 0 }}>
      <NightField o={0.5} />
      <Sprite start={44} end={49}><div style={{ position: 'absolute', inset: 0 }}><FS id="sui-crowd" /><div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg, rgba(2,3,8,0.30) 0%, transparent 40%, rgba(2,3,8,0.55) 100%)' }} /><TeamBanner flag={<FlagSUI w={52} />} label="THE MARKSMAN · SWITZERLAND" accent={SUI_RED} /></div></Sprite>
      <Sprite start={49} end={54}><div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse at 50% 45%, #0d1018 0%, #05060c 70%)' }} /></Sprite>
      <Sprite start={54} end={55.5}><div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(90deg, rgba(213,43,30,0.18), #05060c 65%)' }} /></Sprite>
      <PlayerShowcase clipId="sui-xhaka" name="GRANIT XHAKA" role="CAPTAIN · THE GENERAL · 10" accent={SUI_RED} start={55.5} end={60.3} />
      <PlayerShowcase clipId="sui-embolo" name="BREEL EMBOLO" role="THE BATTERING RAM · 7" accent={SUI_WHITE} start={60.3} end={65.1} />
      <PlayerShowcase clipId="sui-akanji" name="MANUEL AKANJI" role="THE KING OF CALM · 5" accent={SUI_RED} start={65.1} end={69.9} />
      <PlayerShowcase clipId="sui-vargas" name="RUBEN VARGAS" role="THE FLYER · 17" accent={SUI_WHITE} start={69.9} end={74.7} />
      <PlayerShowcase clipId="sui-sommer" name="YANN SOMMER" role="THE WALL · 1" accent={SUI_RED} start={74.7} end={79.5} />
    </div>
  );
}

function SceneColombia() {
  return (
    <div style={{ position: 'absolute', inset: 0 }}>
      <NightField o={0.5} />
      <Sprite start={79.5} end={84.5}><div style={{ position: 'absolute', inset: 0 }}><FS id="co-crowd" /><div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg, rgba(2,3,8,0.30) 0%, transparent 40%, rgba(2,3,8,0.55) 100%)' }} /><TeamBanner flag={<FlagCOL w={64} />} label="EL DORADO · COLOMBIA" accent={COL_YELLOW} /></div></Sprite>
      <Sprite start={84.5} end={90.6}><div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(120deg, rgba(252,209,22,0.16), #05060c 65%)' }} /></Sprite>
      <PlayerShowcase clipId="co-james" name="JAMES RODRÍGUEZ" role="CAPTAIN · THE ARTIST · 10" accent={COL_YELLOW} start={90.6} end={95.08} />
      <PlayerShowcase clipId="co-diaz" name="LUIS DÍAZ" role="THE LIGHTNING · 7" accent={COL_BLUE} start={95.08} end={99.56} />
      <PlayerShowcase clipId="co-duran" name="JHON DURÁN" role="THE CANNON · 9" accent={COL_YELLOW} start={99.56} end={104.04} />
      <PlayerShowcase clipId="co-rios" name="RICHARD RÍOS" role="THE ENGINE · 8" accent={COL_BLUE} start={104.04} end={108.52} />
      <PlayerShowcase clipId="co-davinson" name="DÁVINSON SÁNCHEZ" role="THE TOWER · 23" accent={COL_YELLOW} start={108.52} end={113.0} />
    </div>
  );
}

function SceneRiddle() {
  return (
    <div style={{ position: 'absolute', inset: 0 }}>
      <NightField o={0.5} />
      <Sprite start={113} end={118}><div style={{ position: 'absolute', inset: 0 }}><FS id="stadium-aerial" /><div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.24)' }} /><div style={{ position: 'absolute', left: 0, right: 0, bottom: 70, textAlign: 'center', fontFamily: '"Inter",sans-serif', fontWeight: 900, fontSize: 54, color: '#fff', textShadow: '0 4px 26px rgba(0,0,0,0.9)' }}>THE MARKSMAN vs THE GOLDEN CITY</div></div></Sprite>
      <Sprite start={118} end={123}><NightField o={0.75} /></Sprite>
      <Sprite start={123} end={132}><BeatCard start={123} end={132} text={<>DOES THE MARKSMAN'S AIM HOLD TRUE,<br />OR DOES THE GOLDEN CITY SHINE BRIGHTER?</>} accent={ACC} big={46} /></Sprite>
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
      <div style={{ width: 1010, borderRadius: 28, overflow: 'hidden', transform: `scale(${0.92 + 0.08 * p})`, boxShadow: '0 36px 130px rgba(0,0,0,0.8)', position: 'relative', border: '2px solid rgba(224,162,38,0.55)' }}>
        <div style={{ position: 'absolute', inset: 0, background: `linear-gradient(105deg, ${SUI_RED}33 0%, #070b14 38%, #070b14 62%, ${COL_BLUE}44 100%)` }} />
        <div style={{ position: 'absolute', top: 0, bottom: 0, left: `${sheenX}%`, width: '22%', background: 'linear-gradient(105deg, transparent, rgba(255,255,255,0.10), transparent)', transform: 'skewX(-18deg)', pointerEvents: 'none', zIndex: 5 }} />
        <div style={{ position: 'relative', zIndex: 2, background: `linear-gradient(100deg, ${SUI_RED} 0%, ${ACC} 50%, ${COL_BLUE} 100%)`, padding: '13px 0', textAlign: 'center' }}>
          <span style={{ fontFamily: '"Inter",sans-serif', fontWeight: 900, fontSize: 17, letterSpacing: '0.26em', color: '#06121a' }}>WORLDCUP26 LEGENDS · EPISODE 100 · OUR PREDICTION · NOT PLAYED</span>
        </div>
        <div style={{ position: 'relative', zIndex: 2, padding: '36px 70px 28px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 46 }}>
            <Badge flag={<FlagSUI w={104} />} name="SWITZERLAND" accent={SUI_RED} />
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, fontFamily: '"Inter",sans-serif', fontWeight: 900, fontSize: 116, color: '#fff', lineHeight: 1 }}>
                <span style={{ textShadow: `0 0 36px ${SUI_RED}cc` }}>2</span>
                <span style={{ color: ACC, fontSize: 58, transform: 'translateY(-6px)' }}>—</span>
                <span style={{ textShadow: `0 0 36px ${COL_BLUE}cc` }}>1</span>
              </div>
              <div style={{ fontFamily: '"Inter",sans-serif', fontWeight: 800, fontSize: 16, color: MV.muted, letterSpacing: '0.30em', marginTop: 4 }}>FULL-TIME</div>
            </div>
            <Badge flag={<FlagCOL w={104} />} name="COLOMBIA" accent={COL_YELLOW} />
          </div>
          <div style={{ textAlign: 'center', marginTop: 16, fontFamily: '"Inter",sans-serif', fontWeight: 900, fontSize: 32, color: ACC, letterSpacing: '0.05em', textShadow: `0 0 26px ${ACC}66` }}>THE MARKSMAN NEVER MISSES · 2–1</div>
          <div style={{ display: 'flex', justifyContent: 'center', gap: 12, marginTop: 16, paddingTop: 18, borderTop: '1px solid rgba(255,255,255,0.12)' }}>
            <span style={{ fontFamily: '"Inter",sans-serif', fontWeight: 800, fontSize: 21, color: '#f3e6c4', background: 'rgba(224,162,38,0.16)', border: '1px solid rgba(224,162,38,0.45)', borderRadius: 999, padding: '7px 18px' }}>🎯 XHAKA — THE LATE WINNER</span>
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
      <Sprite start={132} end={138}><BeatCard start={132} end={138} text={<>COLOMBIA COME<br />OUT FLYING</>} accent={COL_YELLOW} big={62} /></Sprite>
      <Sprite start={138} end={148.21}><div style={{ position: 'absolute', inset: 0 }}><FS id="co-attack" /><ChanceTag start={143} end={148.21} text="EL DORADO SURGE!" sub="THE WALL IS STRETCHED THIN" accent={COL_YELLOW} /></div></Sprite>
      <Sprite start={148.21} end={160}><div style={{ position: 'absolute', inset: 0 }}><FS id="co-goal-1" /><GoalFlash at={148.7} /><ChanceTag start={149.2} end={155} text="COLOMBIA LEAD!" sub="THE GOLDEN CITY GLITTERS" accent={COL_YELLOW} /></div></Sprite>
      <Sprite start={160} end={170}><BeatCard clipId="sui-attack" start={160} end={170} text={<>EMBOLO GOES<br />HUNTING</>} sub="SWITZERLAND NEED AN ANSWER" accent={ACC} big={60} /></Sprite>
      <Sprite start={170} end={182}><div style={{ position: 'absolute', inset: 0 }}><FS id="sui-goal-1" /><GoalFlash at={170.5} /><ChanceTag start={171} end={177} text="EMBOLO — ONE-ONE!" sub="POWER AND PRECISION" accent={SUI_RED} /></div></Sprite>
      <Sprite start={182} end={192}><BeatCard clipId="sui-surge" start={182} end={192} text={<>THE CAPTAIN<br />DRIFTS INTO SPACE</>} accent="#fff" big={58} /></Sprite>
      <Sprite start={192} end={203.32}><div style={{ position: 'absolute', inset: 0 }}><FS id="sui-goal-2" /><GoalFlash at={192.4} /><ChanceTag start={192.9} end={197.5} text="XHAKA — 2-1 SWITZERLAND!" sub="THE ARROW FINDS ITS MARK" accent={ACC} /><ScoreBug start={197.6} sui={2} col={1} note="XHAKA 88'" badge="OUR PREDICTION" /><PredictionCard start={198.1} /></div></Sprite>
      <Vignette strength={0.32} />
    </div>
  );
}

function SceneVerdict() {
  const t = useTime();
  const panelP = Easing.easeOutCubic(clamp((t - 225.0) / 1.0, 0, 1));
  return (
    <div style={{ position: 'absolute', inset: 0 }}>
      <Sprite start={203.32} end={213.4}><div style={{ position: 'absolute', inset: 0 }}><FS id="vd-handshake" /><div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg, rgba(2,3,8,0.25) 0%, transparent 45%, rgba(2,3,8,0.55) 100%)' }} /><div style={{ position: 'absolute', left: 0, right: 0, top: 120, textAlign: 'center', zIndex: 24 }}><Kicker size={28} color={ACC}>The Marksman Never Misses</Kicker></div></div></Sprite>
      <Sprite start={213.4} end={219}><BeatCard start={213.4} end={219} text={<>COLOMBIA LEAVE WITH<br />THEIR HEADS HIGH</>} sub="EL DORADO MADE THEM WORK" accent="#fff" big={54} /></Sprite>
      <Sprite start={219} end={225}><BeatCard start={219} end={225} text={<>SWITZERLAND<br />MARCH ON</>} sub="THE MARKSMAN STILL AIMING" accent={ACC} big={58} /></Sprite>
      <Sprite start={225} end={244}>
        <div style={{ position: 'absolute', inset: 0 }}>
          <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse at 50% 45%, #0d1018 0%, #05060c 70%)' }} />
          <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg, rgba(2,3,8,0.66) 0%, rgba(2,3,8,0.52) 50%, rgba(2,3,8,0.78) 100%)' }} />
          <AmbientParticles start={225} dur={19} count={26} color="224,162,38" />
          <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 25 }}>
            <div style={{ background: MV.panel, border: `1px solid ${MV.line}`, borderRadius: 24, padding: '48px 80px', minWidth: 900, backdropFilter: 'blur(6px)', opacity: panelP, transform: `translateY(${(1 - panelP) * 24}px)` }}>
              <Kicker size={26}>Our Prediction</Kicker>
              <div style={{ marginTop: 24 }}>
                <StatLine start={225.5} delay={0.0} label="SWITZERLAND" value="THE MARKSMAN" accent={SUI_RED} />
                <StatLine start={225.5} delay={0.25} label="COLOMBIA" value="EL DORADO" accent={COL_YELLOW} />
                <StatLine start={225.5} delay={0.5} label="OUR PREDICTION" value="SUI 2 — 1 COL" accent="#fff" />
                <StatLine start={225.5} delay={0.75} label="88' XHAKA" value="THE LATE WINNER" accent={ACC} />
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
    { label: 'COMMENT SWITZERLAND', sub: 'THE MARKSMAN', flag: <FlagSUI w={62} />, accent: SUI_RED },
    { label: 'COMMENT COLOMBIA', sub: 'EL DORADO', flag: <FlagCOL w={76} />, accent: COL_YELLOW },
  ];
  return (
    <div style={{ position: 'absolute', inset: 0 }}>
      <NightField o={0.5} />
      <AmbientParticles start={244} dur={11} count={30} color="224,162,38" />
      <div style={{ position: 'absolute', inset: 0, background: 'rgba(6,10,18,0.58)' }} />
      <div style={{ position: 'absolute', top: 140, left: 0, right: 0, textAlign: 'center', zIndex: 25, opacity: headP }}><Kicker size={30}>The Marksman, Or The Golden City?</Kicker></div>
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
  const prev = ['legend-096-portrait', 'legend-097-portrait', 'legend-098-portrait', 'legend-099-portrait'];
  return (
    <div style={{ display: 'flex', alignItems: 'flex-end', gap: 12 }}>
      {prev.map((id) => (
        <div key={id} style={{ width: 64, height: 86, borderRadius: 8, overflow: 'hidden', border: '1px solid rgba(255,255,255,0.22)', boxShadow: '0 8px 20px rgba(0,0,0,0.5)', opacity: 0.82 }}>
          <img data-seq alt="" src={`assets/${id}.png`} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
        </div>
      ))}
      <div style={{ width: 78, height: 104, borderRadius: 9, overflow: 'hidden', border: `2px solid ${ACC}`, boxShadow: `0 10px 28px rgba(0,0,0,0.6), 0 0 26px ${ACC}66` }}>
        <img data-seq alt="" src="assets/legend-100-portrait.png" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
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
      <div style={{ position: 'absolute', inset: 0, background: `radial-gradient(ellipse at 50% 44%, rgba(224,162,38,${(0.32 * glow).toFixed(3)}) 0%, transparent 55%)` }} />
      <AmbientParticles start={255} dur={26} count={56} color="224,182,90" maxR={4.2} />
      {teaseP > 0.01 && (
        <div style={{ position: 'absolute', left: 0, right: 0, top: 90, textAlign: 'center', opacity: teaseP, zIndex: 20 }}>
          <div style={{ display: 'inline-block', fontFamily: '"Inter",sans-serif', fontWeight: 800, fontSize: 30, color: '#f3e0b8', letterSpacing: '0.24em', textShadow: '0 2px 18px rgba(0,0,0,0.7)' }}>THE MARKSMAN</div>
        </div>
      )}
      {lt > 1.6 && (
        <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 22, opacity: clamp(cardP, 0, 1) }}>
          <div style={{ position: 'relative', transform: `perspective(1500px) rotateY(${tilt}deg) scale(${0.92 + 0.08 * Math.min(cardP, 1)})`, marginTop: -34 }}>
            <img data-seq src="assets/legend-100-portrait.png" alt="" style={{ height: 640, display: 'block', borderRadius: 16, boxShadow: '0 50px 130px rgba(0,0,0,0.85), 0 0 80px rgba(224,162,38,0.5)' }} />
            <div style={{ position: 'absolute', top: 0, bottom: 0, left: `${sheenX}%`, width: '22%', background: 'linear-gradient(105deg, transparent, rgba(255,235,190,0.30), transparent)', transform: 'skewX(-18deg)', borderRadius: 16, pointerEvents: 'none', zIndex: 6 }} />
            <div style={{ position: 'absolute', top: 18, left: '50%', transform: 'translateX(-50%)', background: 'rgba(224,162,38,0.95)', color: '#1a1306', fontFamily: '"Inter",sans-serif', fontWeight: 900, fontSize: 17, letterSpacing: '0.14em', padding: '5px 16px', borderRadius: 8, boxShadow: '0 6px 20px rgba(0,0,0,0.5)' }}>Nº 100 · ✦✦✦✦ MILESTONE ULTRA RARE</div>
          </div>
        </div>
      )}
      <div style={{ position: 'absolute', left: 0, right: 0, bottom: 56, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16, zIndex: 24 }}>
        <div style={{ textAlign: 'center', opacity: txtP, transform: `translateY(${(1 - txtP) * 16}px)` }}>
          <div style={{ fontFamily: '"Inter",sans-serif', fontWeight: 900, fontSize: 40, color: ACC, letterSpacing: '0.03em', textShadow: '0 2px 24px rgba(224,162,38,0.5)' }}>WILHELM TELL · THE MARKSMAN</div>
          <div style={{ fontFamily: '"Inter",sans-serif', fontWeight: 700, fontSize: 19, color: '#ecd9b0', letterSpacing: '0.18em', marginTop: 6 }}>SWITZERLAND · LEGEND 100</div>
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
  const filled = ['legend-097-portrait', 'legend-098-portrait', 'legend-099-portrait'];
  const cardX = -360 + fly * 360, cardY = -40 + fly * 150, cardS = 1 - fly * 0.62;
  return (
    <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 26, opacity: inP }}>
      <div style={{ position: 'relative', width: 300, height: 600, borderRadius: 40, background: 'linear-gradient(160deg,#23262e,#0c0e13)', border: '3px solid #2b2f38', boxShadow: '0 40px 110px rgba(0,0,0,0.8), 0 0 50px rgba(224,162,38,0.25)', padding: 12 }}>
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
            <div style={{ height: 104, borderRadius: 6, overflow: 'hidden', border: snapped ? `2px solid ${ACC}` : '1px dashed rgba(224,162,38,0.6)', position: 'relative', boxShadow: flash > 0 ? `0 0 ${20 * flash}px ${ACC}` : 'none' }}>
              {snapped && <img data-seq alt="" src="assets/legend-100-portrait.png" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />}
              {flash > 0 && <div style={{ position: 'absolute', inset: 0, background: ACC, opacity: flash * 0.6 }} />}
            </div>
            <div style={{ height: 104, borderRadius: 6, border: '1px dashed rgba(255,255,255,0.14)' }} />
          </div>
          {snapped && local < 4.4 && <div style={{ position: 'absolute', left: 0, right: 0, bottom: 30, textAlign: 'center', fontFamily: '"Inter",sans-serif', fontWeight: 900, fontSize: 16, color: ACC, letterSpacing: '0.16em', opacity: clamp(1 - (local - 3.6), 0, 1) }}>COLLECTED!</div>}
        </div>
      </div>
      {!snapped && local > 0.4 && (
        <div style={{ position: 'absolute', left: '50%', top: '50%', transform: `translate(-50%,-50%) translate(${cardX}px, ${cardY}px) scale(${cardS})`, width: 200, height: 267, borderRadius: 12, overflow: 'hidden', border: `2px solid ${ACC}`, boxShadow: `0 30px 80px rgba(0,0,0,0.7), 0 0 40px ${ACC}88`, zIndex: 30 }}>
          <img data-seq alt="" src="assets/legend-100-portrait.png" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
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
      <AmbientParticles start={282.5} dur={21} count={24} color="224,162,38" />
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
      <Confetti start={303.05} dur={15} count={90} />
      <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg, rgba(2,3,8,0.45) 0%, rgba(2,3,8,0.30) 45%, rgba(2,3,8,0.72) 100%)' }} />
      <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 26, zIndex: 25, opacity: p }}>
        <Kicker size={30} color={ACC}>WorldCup26 Legends · Episode 100</Kicker>
        <div style={{ fontFamily: '"Inter",sans-serif', fontWeight: 900, fontSize: 64, color: '#fff', letterSpacing: '0.03em', textAlign: 'center', textShadow: '0 6px 30px rgba(0,0,0,0.85)' }}>LIKE · SUBSCRIBE</div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
          <FlagSUI w={52} />
          <div style={{ fontFamily: '"Inter",sans-serif', fontWeight: 900, fontSize: 34, color: ACC, letterSpacing: '0.2em' }}>worldcup26.world</div>
          <FlagCOL w={62} />
        </div>
      </div>
      <Vignette strength={0.4} />
    </div>
  );
}
