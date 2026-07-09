// match-scenes.jsx — Ep103 Norway vs England (Play-Offs) — PHOTOREAL + NO-REPEAT/dimmed re-entries.
// "THE COIL THAT NEVER YIELDS / HONOURS EVEN". OUR PREDICTION Norway 1-1 England — the run's FIRST
// DRAW (Rule #30: Ep99 2-1, Ep100 2-1, Ep101 3-1, Ep102 1-0 -> a genuine 1-1 stalemate). England
// strike first through Kane in the first half; Haaland equalises for Norway; and neither side can
// break the other again — level to the final whistle, honours even. Mystic (#21): NORWAY = Jormungandr,
// the World Serpent of Norse myth, who grew so vast he encircled all of Midgard and closed his jaws on
// his own tail — an unbroken circle; at Ragnarok he and Thor slay one another, neither yielding. Fresh
// vs Legend 081/095 (Fenrir the Wolf) -> Legend 103 = Jormungandr, the World Serpent. ENGLAND = the
// Three Lions, already carded as Legend 084 — referenced here as flavour only, NOT re-carded. Norway's
// 5 showcases REUSED 0-credit + frame-verified from match95-norway-vs-brazil (Haaland 9 / Odegaard 10 /
// Sorloth 11 / Nusa 20 / Berge 6). England's showcases + generics generated FRESH this episode
// (nano_banana_pro stills + kling3_0_turbo i2v): Kane 9 / Bellingham 10 / Rice 4 / Saka 7 + the Three
// Lions collective, plus eng-crowd/eng-attack/eng-goal/texture-england. Foden OMITTED for squad-accuracy
// (removed in Ep96, kept out). Story-unique fresh: Norway-vs-England pitch-walkout + captains' handshake
// + Haaland equaliser (nor-goal). #23 name<->image SYNC (measured VO onsets). Norway run 5 named
// showcases; England run 4 named + a non-named 'Three Lions' collective 5th slot.

const NOR_RED = '#C8102E', NOR_BLUE = '#00205B', NOR_WHITE = '#ffffff';
const ENG_WHITE = '#ffffff', ENG_NAVY = '#001489', ENG_RED = '#CE1124';
const ACC = '#5bd6b4';           // aurora-serpent teal accent (Jormungandr)
const GRADE = { filter: 'saturate(1.06) contrast(1.04)' };

function FlagNOR({ w = 120 }) {
  const h = w * 2 / 3;
  // Norway: red field, white Scandinavian cross, blue cross inside, offset to the hoist (left).
  const vX = w * 0.34, vW = w * 0.16, bW = w * 0.08, bX = w * 0.38;
  const hY = h * 0.42, hH = w * 0.16, bhY = h * 0.46, bhH = w * 0.08;
  return (
    <div style={{ width: w, height: h, borderRadius: w * 0.05, position: 'relative', overflow: 'hidden', background: NOR_RED, boxShadow: '0 6px 18px rgba(0,0,0,0.45)' }}>
      <div style={{ position: 'absolute', left: vX, top: 0, bottom: 0, width: vW, background: NOR_WHITE }} />
      <div style={{ position: 'absolute', left: 0, right: 0, top: hY, height: hH, background: NOR_WHITE }} />
      <div style={{ position: 'absolute', left: bX, top: 0, bottom: 0, width: bW, background: NOR_BLUE }} />
      <div style={{ position: 'absolute', left: 0, right: 0, top: bhY, height: bhH, background: NOR_BLUE }} />
    </div>
  );
}
function FlagENG({ w = 120 }) {
  const h = w * 2 / 3;
  // England: St George — white field, red cross centred.
  return (
    <div style={{ width: w, height: h, borderRadius: w * 0.05, position: 'relative', overflow: 'hidden', background: ENG_WHITE, boxShadow: '0 6px 18px rgba(0,0,0,0.45)' }}>
      <div style={{ position: 'absolute', left: '50%', top: 0, bottom: 0, width: w * 0.13, transform: 'translateX(-50%)', background: ENG_RED }} />
      <div style={{ position: 'absolute', left: 0, right: 0, top: '50%', height: w * 0.13, transform: 'translateY(-50%)', background: ENG_RED }} />
    </div>
  );
}

function FS({ id, style }) { return <ClipSprite id={id} fit="cover" style={{ ...GRADE, ...(style || {}) }} />; }
// Jormungandr card art (slow Ken-Burns) — Norway's cold-open symbol.
function GoldStill({ start = 0, dur = 5 }) {
  const { localTime: lt } = useSprite();
  const p = clamp((lt - start) / dur, 0, 1);
  if (lt < start || lt > start + dur) return null;
  const scale = 1.06 + 0.12 * p;
  const fade = lt < start + 0.4 ? clamp((lt - start) / 0.4, 0, 1) : (lt > start + dur - 0.5 ? clamp((start + dur - lt) / 0.5, 0, 1) : 1);
  return (
    <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', opacity: fade, zIndex: 1 }}>
      <img data-seq src="assets/legend-103-landscape.png" alt="" style={{ position: 'absolute', left: '50%', top: '50%', width: '108%', transform: `translate(-50%,-50%) scale(${scale})`, filter: 'saturate(1.05) contrast(1.03)' }} />
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
      <div style={{ position: 'absolute', inset: 0, background: `radial-gradient(ellipse at 50% 42%, rgba(91,214,180,${(0.13 * pulse * o).toFixed(3)}) 0%, transparent 55%)` }} />
    </div>
  );
}

function ScoreBug({ start, nor = 1, eng = 1, note = "90'", badge = 'OUR PREDICTION' }) {
  const t = useTime(); const local = t - start; if (local < 0) return null;
  const inP = Easing.easeOutBack(clamp(local / 0.7, 0, 1));
  const cell = { fontFamily: '"Inter",sans-serif', fontWeight: 900, fontSize: 34, color: '#fff', padding: '10px 18px' };
  return (
    <div style={{ position: 'absolute', top: 92, left: '50%', zIndex: 30, transform: `translateX(-50%) scale(${inP})`, opacity: clamp(inP, 0, 1), display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
      <div style={{ display: 'flex', alignItems: 'center', background: MV.panel, border: `1px solid ${MV.line}`, borderRadius: 14, boxShadow: '0 10px 36px rgba(0,0,0,0.6)', overflow: 'hidden' }}>
        <div style={{ ...cell, background: NOR_RED }}>NOR</div>
        <div style={{ ...cell, fontSize: 38, color: ACC }}>{nor} — {eng}</div>
        <div style={{ ...cell, background: ENG_NAVY }}>ENG</div>
        {note && <div style={{ ...cell, fontSize: 24, color: ACC, borderLeft: `1px solid ${MV.line}` }}>{note}</div>}
      </div>
      <div style={{ fontFamily: '"Inter",sans-serif', fontWeight: 800, fontSize: 16, color: ACC, letterSpacing: '0.22em', background: 'rgba(91,214,180,0.14)', border: '1px solid rgba(91,214,180,0.5)', borderRadius: 999, padding: '4px 16px' }}>{badge}</div>
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
      <FS id="texture-norway" /><FS id="texture-england" />
      <div style={{ position: 'absolute', inset: 0, background: `radial-gradient(ellipse at center, rgba(91,214,180,${(0.20 * beat).toFixed(3)}) 0%, transparent 60%)` }} />
      <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg, rgba(2,3,8,0.34) 0%, transparent 30%, transparent 56%, rgba(2,3,8,0.76) 100%)' }} />
      {teaseP > 0.01 && (
        <div style={{ position: 'absolute', left: 0, right: 0, bottom: 150, textAlign: 'center', zIndex: 23, opacity: teaseP }}>
          <div style={{ display: 'inline-block', fontFamily: '"Inter",sans-serif', fontWeight: 800, fontSize: 30, color: '#bff0e4', letterSpacing: '0.22em', textShadow: '0 2px 18px rgba(0,0,0,0.85)' }}>THE WORLD SERPENT MEETS THE THREE LIONS.</div>
        </div>
      )}
      {lt > 15.3 && (
        <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 26, opacity: titleP, zIndex: 22 }}>
          <Kicker size={32} color={ACC}>The Coil That Never Yields</Kicker>
          <TitleReveal text="JÖRMUNGANDR" start={16.2} size={58} color={ACC} />
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
      <AmbientParticles start={23.0} dur={10} count={34} color="91,214,180" />
      <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 38 }}>
        <div style={{ opacity: p1, transform: `translateY(${(1 - p1) * -30}px)` }}><Kicker>WorldCup26 Legends · Episode 103 · Play-Offs</Kicker></div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 52, opacity: clamp(p2, 0, 1), transform: `scale(${p2})` }}>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 18 }}><Waving><FlagNOR w={190} /></Waving><BigTitle size={66} glow={NOR_RED}>NORWAY</BigTitle></div>
          <BigTitle size={104} color={ACC}>VS</BigTitle>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 18 }}><Waving speed={1.9}><FlagENG w={190} /></Waving><BigTitle size={66} glow={ENG_NAVY}>ENGLAND</BigTitle></div>
        </div>
        <div style={{ opacity: p3, fontFamily: '"Inter",sans-serif', fontWeight: 600, fontSize: 30, color: MV.muted, letterSpacing: '0.10em' }}>TWO FORCES LOCKED TOGETHER — NEITHER WILL YIELD</div>
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
          {[['SONS OF THE', 'FJORDS'], ['THREE LIONS', 'ENGLAND'], ['EPISODE 103', 'PLAY-OFFS'], ['WIN OR', 'GO HOME']].map(([v, l], i) => (
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

function SceneNorway() {
  return (
    <div style={{ position: 'absolute', inset: 0 }}>
      <NightField o={0.5} />
      <Sprite start={44} end={49}><div style={{ position: 'absolute', inset: 0 }}><FS id="no-crowd" /><div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg, rgba(2,3,8,0.30) 0%, transparent 40%, rgba(2,3,8,0.55) 100%)' }} /><TeamBanner flag={<FlagNOR w={58} />} label="SONS OF THE FJORDS · NORWAY" accent={NOR_RED} /></div></Sprite>
      <Sprite start={49} end={54}><div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse at 50% 45%, #0d1018 0%, #05060c 70%)' }} /></Sprite>
      <Sprite start={54} end={55.5}><div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(90deg, rgba(200,16,46,0.18), #05060c 65%)' }} /></Sprite>
      <PlayerShowcase clipId="no-haaland" name="ERLING HAALAND" role="THE FORCE · 9" accent={NOR_RED} start={55.5} end={60.3} />
      <PlayerShowcase clipId="no-odegaard" name="MARTIN ØDEGAARD" role="CAPTAIN · THE MIND · 10" accent={NOR_BLUE} start={60.3} end={65.1} />
      <PlayerShowcase clipId="no-sorloth" name="ALEXANDER SØRLOTH" role="THE TOWER · 11" accent={NOR_RED} start={65.1} end={69.9} />
      <PlayerShowcase clipId="no-nusa" name="ANTONIO NUSA" role="THE SPARK · 20" accent={NOR_BLUE} start={69.9} end={74.7} />
      <PlayerShowcase clipId="no-berge" name="SANDER BERGE" role="THE ANCHOR · 6" accent={NOR_RED} start={74.7} end={79.5} />
    </div>
  );
}

function SceneEngland() {
  return (
    <div style={{ position: 'absolute', inset: 0 }}>
      <NightField o={0.5} />
      <Sprite start={79.5} end={84.5}><div style={{ position: 'absolute', inset: 0 }}><FS id="eng-crowd" /><div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg, rgba(2,3,8,0.30) 0%, transparent 40%, rgba(2,3,8,0.55) 100%)' }} /><TeamBanner flag={<FlagENG w={64} />} label="THREE LIONS · ENGLAND" accent={ENG_NAVY} /></div></Sprite>
      <Sprite start={84.5} end={90.6}><div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(120deg, rgba(0,20,137,0.16), #05060c 65%)' }} /></Sprite>
      <PlayerShowcase clipId="eng-kane" name="HARRY KANE" role="CAPTAIN · THE COMPLETE · 9" accent={ENG_NAVY} start={90.6} end={95.08} />
      <PlayerShowcase clipId="eng-bellingham" name="JUDE BELLINGHAM" role="THE DRIVE · 10" accent={ENG_RED} start={95.08} end={99.56} />
      <PlayerShowcase clipId="eng-rice" name="DECLAN RICE" role="THE ENGINE · 4" accent={ENG_NAVY} start={99.56} end={104.04} />
      <PlayerShowcase clipId="eng-saka" name="BUKAYO SAKA" role="THE WINGER · 7" accent={ENG_RED} start={104.04} end={108.52} />
      <PlayerShowcase clipId="eng-collective" name="THE THREE LIONS" role="PACE · POWER · DEPTH" accent={ENG_NAVY} start={108.52} end={113.0} />
    </div>
  );
}

function SceneRiddle() {
  return (
    <div style={{ position: 'absolute', inset: 0 }}>
      <NightField o={0.5} />
      <Sprite start={113} end={118}><div style={{ position: 'absolute', inset: 0 }}><FS id="stadium-aerial" /><div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.24)' }} /><div style={{ position: 'absolute', left: 0, right: 0, bottom: 70, textAlign: 'center', fontFamily: '"Inter",sans-serif', fontWeight: 900, fontSize: 54, color: '#fff', textShadow: '0 4px 26px rgba(0,0,0,0.9)' }}>THE FJORDS vs THE THREE LIONS</div></div></Sprite>
      <Sprite start={118} end={123}><NightField o={0.75} /></Sprite>
      <Sprite start={123} end={132}><BeatCard start={123} end={132} text={<>WHEN TWO FORCES ARE THIS EQUAL,<br />WHAT HAPPENS WHEN NEITHER BREAKS?</>} accent={ACC} big={44} /></Sprite>
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
      <div style={{ width: 1010, borderRadius: 28, overflow: 'hidden', transform: `scale(${0.92 + 0.08 * p})`, boxShadow: '0 36px 130px rgba(0,0,0,0.8)', position: 'relative', border: '2px solid rgba(91,214,180,0.55)' }}>
        <div style={{ position: 'absolute', inset: 0, background: `linear-gradient(105deg, ${NOR_RED}33 0%, #070b14 38%, #070b14 62%, ${ENG_NAVY}44 100%)` }} />
        <div style={{ position: 'absolute', top: 0, bottom: 0, left: `${sheenX}%`, width: '22%', background: 'linear-gradient(105deg, transparent, rgba(255,255,255,0.10), transparent)', transform: 'skewX(-18deg)', pointerEvents: 'none', zIndex: 5 }} />
        <div style={{ position: 'relative', zIndex: 2, background: `linear-gradient(100deg, ${NOR_RED} 0%, ${ACC} 50%, ${ENG_NAVY} 100%)`, padding: '13px 0', textAlign: 'center' }}>
          <span style={{ fontFamily: '"Inter",sans-serif', fontWeight: 900, fontSize: 17, letterSpacing: '0.26em', color: '#06121a' }}>WORLDCUP26 LEGENDS · EPISODE 103 · OUR PREDICTION · NOT PLAYED</span>
        </div>
        <div style={{ position: 'relative', zIndex: 2, padding: '36px 70px 28px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 46 }}>
            <Badge flag={<FlagNOR w={104} />} name="NORWAY" accent={NOR_RED} />
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, fontFamily: '"Inter",sans-serif', fontWeight: 900, fontSize: 116, color: '#fff', lineHeight: 1 }}>
                <span style={{ textShadow: `0 0 36px ${NOR_RED}cc` }}>1</span>
                <span style={{ color: ACC, fontSize: 58, transform: 'translateY(-6px)' }}>—</span>
                <span style={{ textShadow: `0 0 36px ${ENG_NAVY}cc` }}>1</span>
              </div>
              <div style={{ fontFamily: '"Inter",sans-serif', fontWeight: 800, fontSize: 16, color: MV.muted, letterSpacing: '0.30em', marginTop: 4 }}>FULL-TIME</div>
            </div>
            <Badge flag={<FlagENG w={104} />} name="ENGLAND" accent={ENG_NAVY} />
          </div>
          <div style={{ textAlign: 'center', marginTop: 16, fontFamily: '"Inter",sans-serif', fontWeight: 900, fontSize: 30, color: ACC, letterSpacing: '0.05em', textShadow: `0 0 26px ${ACC}66` }}>KANE · THEN HAALAND · 1–1</div>
          <div style={{ display: 'flex', justifyContent: 'center', gap: 12, marginTop: 16, paddingTop: 18, borderTop: '1px solid rgba(255,255,255,0.12)' }}>
            <span style={{ fontFamily: '"Inter",sans-serif', fontWeight: 800, fontSize: 21, color: '#dcf5ee', background: 'rgba(91,214,180,0.16)', border: '1px solid rgba(91,214,180,0.45)', borderRadius: 999, padding: '7px 18px' }}>∞ HONOURS EVEN — THE COIL WOULD NOT BREAK</span>
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
      <Sprite start={132} end={138}><BeatCard clipId="texture-england-b" start={132} end={138} text={<>ENGLAND START<br />ON TOP</>} accent={ENG_RED} big={62} /></Sprite>
      <Sprite start={138} end={148.21}><div style={{ position: 'absolute', inset: 0 }}><FS id="eng-attack" /><ChanceTag start={143} end={148.21} text="ENGLAND HUNT THE FIRST BLOW" sub="PRESSING HIGH · SHARP AND CONFIDENT" accent={ENG_RED} /></div></Sprite>
      <Sprite start={148.21} end={159}><div style={{ position: 'absolute', inset: 0 }}><FS id="eng-goal" /><GoalFlash at={148.7} /><ChanceTag start={149.2} end={155} text="KANE STRIKES!" sub="ENGLAND LEAD · 1–0" accent={ENG_NAVY} /></div></Sprite>
      <Sprite start={159} end={169}><BeatCard clipId="no-crowd-b" start={159} end={169} text={<>THE COIL<br />TIGHTENS</>} sub="NORWAY MUST ANSWER" accent={NOR_RED} big={56} /></Sprite>
      <Sprite start={169} end={180}><div style={{ position: 'absolute', inset: 0 }}><FS id="no-goal-2" /><ChanceTag start={173} end={180} text="WAVE AFTER WAVE FROM THE FJORDS" sub="HAALAND SMELLS BLOOD" accent={NOR_RED} /></div></Sprite>
      <Sprite start={180} end={190}><div style={{ position: 'absolute', inset: 0 }}><FS id="nor-goal" /><GoalFlash at={180.4} /><ChanceTag start={181} end={188} text="HAALAND ANSWERS!" sub="NORWAY LEVEL · 1–1" accent={NOR_RED} /></div></Sprite>
      <Sprite start={190} end={199}><BeatCard clipId="eng-crowd-b" start={190} end={199} text={<>ENGLAND<br />SURGE BACK</>} sub="HUNTING THE WINNER" accent={ENG_NAVY} big={56} /></Sprite>
      <Sprite start={199} end={210}><BeatCard clipId="bg-rise" start={199} end={210} text={<>NORWAY HIT<br />STRAIGHT BACK</>} sub="HAALAND AND SØRLOTH RISING" accent={NOR_RED} big={54} /></Sprite>
      <Sprite start={210} end={221}><BeatCard clipId="bg-roar" start={210} end={221} text={<>BLOW FOR BLOW —<br />NEITHER WILL FALL</>} sub="THE SERPENT'S COIL WILL NOT BREAK" accent={ACC} big={50} /></Sprite>
      <Sprite start={221} end={230}><BeatCard clipId="crowd-tense" start={221} end={230} text={<>STILL LEVEL<br />STILL UNBROKEN</>} sub="NOT AN INCH GIVEN BY EITHER" accent="#fff" big={52} /></Sprite>
      <Sprite start={230} end={241}><div style={{ position: 'absolute', inset: 0 }}><FS id="stadium-wide-b" /><div style={{ position: 'absolute', inset: 0, background: 'rgba(2,3,8,0.35)' }} /><ChanceTag start={231} end={237} text="THE FINAL WHISTLE!" sub="HONOURS EVEN · 1–1" accent={ACC} /><ScoreBug start={237.2} nor={1} eng={1} note="FULL-TIME" badge="OUR PREDICTION" /><PredictionCard start={237.8} /></div></Sprite>
      <Vignette strength={0.32} />
    </div>
  );
}

function SceneVerdict() {
  const t = useTime();
  const panelP = Easing.easeOutCubic(clamp((t - 262.68) / 1.0, 0, 1));
  return (
    <div style={{ position: 'absolute', inset: 0 }}>
      <Sprite start={241} end={251.08}><div style={{ position: 'absolute', inset: 0 }}><FS id="vd-handshake" /><div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg, rgba(2,3,8,0.25) 0%, transparent 45%, rgba(2,3,8,0.55) 100%)' }} /><div style={{ position: 'absolute', left: 0, right: 0, top: 120, textAlign: 'center', zIndex: 24 }}><Kicker size={28} color={ACC}>Honours Even — The Circle Held</Kicker></div></div></Sprite>
      <Sprite start={251.08} end={256.68}><BeatCard start={251.08} end={256.68} text={<>NORWAY STARED DOWN<br />THE HEAVYWEIGHTS</>} sub="AND NEVER BLINKED" accent={NOR_RED} big={52} /></Sprite>
      <Sprite start={256.68} end={262.68}><BeatCard start={256.68} end={262.68} text={<>LEVEL AND<br />UNBROKEN</>} sub="SOME NIGHTS NOBODY MANAGES TO WIN" accent={ACC} big={56} /></Sprite>
      <Sprite start={262.68} end={281.68}>
        <div style={{ position: 'absolute', inset: 0 }}>
          <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse at 50% 45%, #0d1018 0%, #05060c 70%)' }} />
          <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg, rgba(2,3,8,0.66) 0%, rgba(2,3,8,0.52) 50%, rgba(2,3,8,0.78) 100%)' }} />
          <AmbientParticles start={262.68} dur={19} count={26} color="91,214,180" />
          <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 25 }}>
            <div style={{ background: MV.panel, border: `1px solid ${MV.line}`, borderRadius: 24, padding: '48px 80px', minWidth: 900, backdropFilter: 'blur(6px)', opacity: panelP, transform: `translateY(${(1 - panelP) * 24}px)` }}>
              <Kicker size={26}>Our Prediction</Kicker>
              <div style={{ marginTop: 24 }}>
                <StatLine start={263.18} delay={0.0} label="NORWAY" value="SONS OF THE FJORDS" accent={NOR_RED} />
                <StatLine start={263.18} delay={0.25} label="ENGLAND" value="THE THREE LIONS" accent={ENG_NAVY} />
                <StatLine start={263.18} delay={0.5} label="OUR PREDICTION" value="NOR 1 — 1 ENG" accent="#fff" />
                <StatLine start={263.18} delay={0.75} label="KANE · THEN HAALAND" value="HONOURS EVEN" accent={ACC} />
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
    { label: 'COMMENT NORWAY', sub: 'THE FJORDS', flag: <FlagNOR w={68} />, accent: NOR_RED },
    { label: 'COMMENT ENGLAND', sub: 'THREE LIONS', flag: <FlagENG w={68} />, accent: ENG_NAVY },
  ];
  return (
    <div style={{ position: 'absolute', inset: 0 }}>
      <NightField o={0.5} />
      <AmbientParticles start={281.68} dur={11} count={30} color="91,214,180" />
      <div style={{ position: 'absolute', inset: 0, background: 'rgba(6,10,18,0.58)' }} />
      <div style={{ position: 'absolute', top: 140, left: 0, right: 0, textAlign: 'center', zIndex: 25, opacity: headP }}><Kicker size={30}>Did Norway Earn The Point Of Their Lives, Or Did England Let It Slip?</Kicker></div>
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
  const prev = ['legend-099-portrait', 'legend-100-portrait', 'legend-101-portrait', 'legend-102-portrait'];
  return (
    <div style={{ display: 'flex', alignItems: 'flex-end', gap: 12 }}>
      {prev.map((id) => (
        <div key={id} style={{ width: 64, height: 86, borderRadius: 8, overflow: 'hidden', border: '1px solid rgba(255,255,255,0.22)', boxShadow: '0 8px 20px rgba(0,0,0,0.5)', opacity: 0.82 }}>
          <img data-seq alt="" src={`assets/${id}.png`} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
        </div>
      ))}
      <div style={{ width: 78, height: 104, borderRadius: 9, overflow: 'hidden', border: `2px solid ${ACC}`, boxShadow: `0 10px 28px rgba(0,0,0,0.6), 0 0 26px ${ACC}66` }}>
        <img data-seq alt="" src="assets/legend-103-portrait.png" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
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
      <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse at 50% 46%, #0d2a26 0%, #0a1a18 50%, #060b0a 100%)' }} />
      <div style={{ position: 'absolute', inset: 0, background: `radial-gradient(ellipse at 50% 44%, rgba(91,214,180,${(0.32 * glow).toFixed(3)}) 0%, transparent 55%)` }} />
      <AmbientParticles start={292.68} dur={26} count={56} color="120,230,200" maxR={4.2} />
      {teaseP > 0.01 && (
        <div style={{ position: 'absolute', left: 0, right: 0, top: 90, textAlign: 'center', opacity: teaseP, zIndex: 20 }}>
          <div style={{ display: 'inline-block', fontFamily: '"Inter",sans-serif', fontWeight: 800, fontSize: 30, color: '#bff0e4', letterSpacing: '0.24em', textShadow: '0 2px 18px rgba(0,0,0,0.7)' }}>NEITHER YIELDS</div>
        </div>
      )}
      {lt > 1.6 && (
        <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 22, opacity: clamp(cardP, 0, 1) }}>
          <div style={{ position: 'relative', transform: `perspective(1500px) rotateY(${tilt}deg) scale(${0.92 + 0.08 * Math.min(cardP, 1)})`, marginTop: -34 }}>
            <img data-seq src="assets/legend-103-portrait.png" alt="" style={{ height: 640, display: 'block', borderRadius: 16, boxShadow: '0 50px 130px rgba(0,0,0,0.85), 0 0 80px rgba(91,214,180,0.5)' }} />
            <div style={{ position: 'absolute', top: 0, bottom: 0, left: `${sheenX}%`, width: '22%', background: 'linear-gradient(105deg, transparent, rgba(190,255,235,0.30), transparent)', transform: 'skewX(-18deg)', borderRadius: 16, pointerEvents: 'none', zIndex: 6 }} />
            <div style={{ position: 'absolute', top: 18, left: '50%', transform: 'translateX(-50%)', background: 'rgba(91,214,180,0.95)', color: '#06201a', fontFamily: '"Inter",sans-serif', fontWeight: 900, fontSize: 17, letterSpacing: '0.14em', padding: '5px 16px', borderRadius: 8, boxShadow: '0 6px 20px rgba(0,0,0,0.5)' }}>Nº 103 · ✦✦✦ ULTRA RARE</div>
          </div>
        </div>
      )}
      <div style={{ position: 'absolute', left: 0, right: 0, bottom: 56, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16, zIndex: 24 }}>
        <div style={{ textAlign: 'center', opacity: txtP, transform: `translateY(${(1 - txtP) * 16}px)` }}>
          <div style={{ fontFamily: '"Inter",sans-serif', fontWeight: 900, fontSize: 38, color: ACC, letterSpacing: '0.03em', textShadow: '0 2px 24px rgba(91,214,180,0.5)' }}>JÖRMUNGANDR · THE WORLD SERPENT</div>
          <div style={{ fontFamily: '"Inter",sans-serif', fontWeight: 700, fontSize: 19, color: '#c9efe4', letterSpacing: '0.18em', marginTop: 6 }}>NORWAY · LEGEND 103</div>
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
  const filled = ['legend-100-portrait', 'legend-101-portrait', 'legend-102-portrait'];
  const cardX = -360 + fly * 360, cardY = -40 + fly * 150, cardS = 1 - fly * 0.62;
  return (
    <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 26, opacity: inP }}>
      <div style={{ position: 'relative', width: 300, height: 600, borderRadius: 40, background: 'linear-gradient(160deg,#23262e,#0c0e13)', border: '3px solid #2b2f38', boxShadow: '0 40px 110px rgba(0,0,0,0.8), 0 0 50px rgba(91,214,180,0.25)', padding: 12 }}>
        <div style={{ position: 'absolute', top: 16, left: '50%', transform: 'translateX(-50%)', width: 90, height: 8, borderRadius: 6, background: '#05070b' }} />
        <div style={{ width: '100%', height: '100%', borderRadius: 30, background: 'radial-gradient(ellipse at 50% 20%, #10201c 0%, #06080c 70%)', overflow: 'hidden', position: 'relative', padding: '34px 18px 18px' }}>
          <div style={{ textAlign: 'center', fontFamily: '"Inter",sans-serif', fontWeight: 900, fontSize: 15, color: ACC, letterSpacing: '0.18em' }}>MY LEGENDS</div>
          <div style={{ textAlign: 'center', fontFamily: '"Inter",sans-serif', fontWeight: 700, fontSize: 10, color: '#8fcebf', letterSpacing: '0.1em', marginTop: 2, marginBottom: 14 }}>worldcup26.world</div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 10 }}>
            {filled.map((id) => (
              <div key={id} style={{ height: 104, borderRadius: 6, overflow: 'hidden', border: '1px solid rgba(255,255,255,0.16)' }}>
                <img data-seq alt="" src={`assets/${id}.png`} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
              </div>
            ))}
            <div style={{ height: 104, borderRadius: 6, overflow: 'hidden', border: snapped ? `2px solid ${ACC}` : '1px dashed rgba(91,214,180,0.6)', position: 'relative', boxShadow: flash > 0 ? `0 0 ${20 * flash}px ${ACC}` : 'none' }}>
              {snapped && <img data-seq alt="" src="assets/legend-103-portrait.png" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />}
              {flash > 0 && <div style={{ position: 'absolute', inset: 0, background: ACC, opacity: flash * 0.6 }} />}
            </div>
            <div style={{ height: 104, borderRadius: 6, border: '1px dashed rgba(255,255,255,0.14)' }} />
          </div>
          {snapped && local < 4.4 && <div style={{ position: 'absolute', left: 0, right: 0, bottom: 30, textAlign: 'center', fontFamily: '"Inter",sans-serif', fontWeight: 900, fontSize: 16, color: ACC, letterSpacing: '0.16em', opacity: clamp(1 - (local - 3.6), 0, 1) }}>COLLECTED!</div>}
        </div>
      </div>
      {!snapped && local > 0.4 && (
        <div style={{ position: 'absolute', left: '50%', top: '50%', transform: `translate(-50%,-50%) translate(${cardX}px, ${cardY}px) scale(${cardS})`, width: 200, height: 267, borderRadius: 12, overflow: 'hidden', border: `2px solid ${ACC}`, boxShadow: `0 30px 80px rgba(0,0,0,0.7), 0 0 40px ${ACC}88`, zIndex: 30 }}>
          <img data-seq alt="" src="assets/legend-103-portrait.png" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
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
      <AmbientParticles start={319.06} dur={21} count={24} color="91,214,180" />
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
      <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg, rgba(2,3,8,0.45) 0%, rgba(2,3,8,0.30) 45%, rgba(2,3,8,0.72) 100%)' }} />
      <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 26, zIndex: 25, opacity: p }}>
        <Kicker size={30} color={ACC}>WorldCup26 Legends · Episode 103</Kicker>
        <div style={{ fontFamily: '"Inter",sans-serif', fontWeight: 900, fontSize: 64, color: '#fff', letterSpacing: '0.03em', textAlign: 'center', textShadow: '0 6px 30px rgba(0,0,0,0.85)' }}>LIKE · SUBSCRIBE</div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
          <FlagNOR w={58} />
          <div style={{ fontFamily: '"Inter",sans-serif', fontWeight: 900, fontSize: 34, color: ACC, letterSpacing: '0.2em' }}>worldcup26.world</div>
          <FlagENG w={58} />
        </div>
      </div>
      <Vignette strength={0.4} />
    </div>
  );
}
