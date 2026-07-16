// match-scenes.jsx — Ep105 Argentina vs England · THE SEMIFINAL (special episode).
// SPINE = ghosts of the rivalry (1986 Hand of God + Goal of the Century) → REAL RESULT (played
// 2026-07-15): ARGENTINA 2–1 ENGLAND in normal time, NO shootout — Argentina reach the final (vs
// Spain). England lead Gordon 55'; Enzo Fernández equalizes 85'; Lautaro Martínez heads the 90+2'
// winner from a MESSI cross — Messi ASSISTED BOTH goals (did not score) and dedicated it to Diego.
// Legend 105 = EL DIEZ / Diego Maradona — the ghost of '86, the immortal ten, passed to Messi.
// ARCHITECTURE: every scene lays a CONTIGUOUS clip BED (flat <FS> tiles that render on their
// clips.json windows) so footage sits behind every second (Rule #25); text overlays are gated by
// <Sprite start end> (absolute time). PHOTOREAL i2v (#22), nation-correct (#28), name-synced (#23),
// no on-screen sentences (#10, only ≤4-word labels/scores/names), full-frame (#19), REAL RESULT
// stated as fact (#7 — the match was played). Loaded before intro-scenes.jsx.

const ARG_BLUE = '#6CACE4', ARG_WHITE = '#ffffff';
const ENG_RED = '#d21f2a', ENG_WHITE = '#ffffff';
const GOLD = '#e9c65a';
const ACC = GOLD;
const GRADE = { filter: 'saturate(1.05) contrast(1.04)' };

function FlagARG({ w = 120 }) {
  const h = w * 2 / 3;
  return (
    <div style={{ width: w, height: h, borderRadius: w * 0.05, position: 'relative', overflow: 'hidden', display: 'flex', flexDirection: 'column', boxShadow: '0 6px 18px rgba(0,0,0,0.45)' }}>
      <div style={{ flex: 1, background: ARG_BLUE }} /><div style={{ flex: 1, background: ARG_WHITE }} /><div style={{ flex: 1, background: ARG_BLUE }} />
      <span style={{ position: 'absolute', left: '50%', top: '50%', transform: 'translate(-50%,-50%)', color: '#f4c430', fontSize: h * 0.34, lineHeight: 1, fontFamily: SANS, fontWeight: 900, textShadow: '0 0 4px rgba(180,120,0,0.5)' }}>☀</span>
    </div>
  );
}
function FlagENG({ w = 120 }) {
  const h = w * 2 / 3, bar = w * 0.14;
  return (
    <div style={{ width: w, height: h, borderRadius: w * 0.05, position: 'relative', overflow: 'hidden', background: ENG_WHITE, boxShadow: '0 6px 18px rgba(0,0,0,0.45)' }}>
      <div style={{ position: 'absolute', left: '50%', top: 0, bottom: 0, width: bar, transform: 'translateX(-50%)', background: ENG_RED }} />
      <div style={{ position: 'absolute', top: '50%', left: 0, right: 0, height: bar, transform: 'translateY(-50%)', background: ENG_RED }} />
    </div>
  );
}

// br = brightness multiplier for the footage bed (composes with GRADE). br=1 (default) is unchanged;
// >1 lifts a bed that the BeatCard scrim would otherwise crush below the luma floor (Rule #25/#27).
// NOTE: the `dim` prop is inert on FS (GRADE.filter overrides it) — use `br` to control bed brightness.
function FS({ id, dim = 0, br = 1, style }) {
  const filter = (br && br !== 1) ? `brightness(${br}) ${GRADE.filter}` : GRADE.filter;
  return <ClipSprite id={id} fit="cover" dim={dim} style={{ ...GRADE, ...(style || {}), filter }} />;
}

function NightField({ o = 0.6, tone = 'gold' }) {
  const t = useTime();
  const pulse = 0.5 + 0.5 * Math.sin(t * 1.1);
  // luminance floor (never near-black) so any dimmed-backdrop transition still clears blackdetect.
  const a = (0.13 + 0.12 * pulse) * Math.max(0.7, o);
  const glow = tone === 'blue' ? `rgba(96,156,224,${a.toFixed(3)})` : `rgba(236,202,96,${a.toFixed(3)})`;
  return (
    <div style={{ position: 'absolute', inset: 0, zIndex: 0 }}>
      <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse at 50% 44%, #1c2648 0%, #131c38 55%, #0c1226 100%)' }} />
      <div style={{ position: 'absolute', inset: 0, background: `radial-gradient(ellipse at 50% 44%, ${glow} 0%, transparent 60%)` }} />
    </div>
  );
}
function Backdrop() { return <div style={{ position: 'absolute', inset: 0, zIndex: 0, background: 'radial-gradient(ellipse at 50% 45%, #131a30 0%, #070a12 100%)' }} />; }

function ScoreBug({ start, arg = 2, eng = 1, note = '', badge = 'FULL-TIME' }) {
  const t = useTime(); const local = t - start; if (local < 0) return null;
  const inP = Easing.easeOutBack(clamp(local / 0.7, 0, 1));
  const cell = { fontFamily: SANS, fontWeight: 900, fontSize: 34, color: '#fff', padding: '10px 18px' };
  return (
    <div style={{ position: 'absolute', top: 92, left: '50%', zIndex: 30, transform: `translateX(-50%) scale(${inP})`, opacity: clamp(inP, 0, 1), display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
      <div style={{ display: 'flex', alignItems: 'center', background: 'rgba(11,18,38,0.9)', border: `1px solid ${MV.line}`, borderRadius: 14, boxShadow: '0 10px 36px rgba(0,0,0,0.6)', overflow: 'hidden' }}>
        <div style={{ ...cell, background: ARG_BLUE, color: '#06121a' }}>ARG</div>
        <div style={{ ...cell, fontSize: 38, color: GOLD }}>{arg} — {eng}</div>
        <div style={{ ...cell, background: ENG_RED }}>ENG</div>
        {note && <div style={{ ...cell, fontSize: 24, color: GOLD, borderLeft: `1px solid ${MV.line}` }}>{note}</div>}
      </div>
      <div style={{ fontFamily: SANS, fontWeight: 800, fontSize: 16, color: GOLD, letterSpacing: '0.22em', background: 'rgba(233,198,90,0.14)', border: '1px solid rgba(233,198,90,0.5)', borderRadius: 999, padding: '4px 16px' }}>{badge}</div>
    </div>
  );
}

function ChanceTag({ start, end, text, sub, accent = GOLD }) {
  const t = useTime(); if (t < start || t > end) return null;
  const p = Easing.easeOutBack(clamp((t - start) / 0.5, 0, 1));
  const fade = t > end - 0.4 ? clamp((end - t) / 0.4, 0, 1) : 1;
  return (
    <div style={{ position: 'absolute', left: 0, right: 0, bottom: 96, textAlign: 'center', zIndex: 26, opacity: fade, transform: `scale(${p})` }}>
      <div style={{ display: 'inline-block', fontFamily: SANS, fontWeight: 900, fontSize: 56, color: '#fff', textShadow: '0 4px 26px rgba(0,0,0,0.9)' }}>{text}
        {sub && <div style={{ fontSize: 26, fontWeight: 800, color: accent, letterSpacing: '0.2em', marginTop: 8 }}>{sub}</div>}
      </div>
    </div>
  );
}

// Text-only beat card (footage supplied by the scene's dimmed bed underneath — Rule #27).
function BeatCard({ start, end, text, sub, accent = GOLD, big = 60 }) {
  const t = useTime(); if (t < start || t > end) return null;
  const inP = Easing.easeOutCubic(clamp((t - start) / 0.5, 0, 1));
  const fade = t > end - 0.4 ? clamp((end - t) / 0.4, 0, 1) : 1;
  return (
    <div style={{ position: 'absolute', inset: 0, opacity: fade, zIndex: 22 }}>
      <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg, rgba(5,7,14,0.52) 0%, rgba(5,7,14,0.14) 42%, rgba(5,7,14,0.72) 100%)' }} />
      <div style={{ position: 'absolute', left: 0, right: 0, top: 0, height: 6, background: `linear-gradient(90deg, transparent, ${accent}, transparent)`, opacity: 0.7 }} />
      <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', transform: `translateY(${(1 - inP) * 22}px)`, opacity: inP }}>
        <div style={{ textAlign: 'center', padding: '0 8%' }}>
          <div style={{ fontFamily: SANS, fontWeight: 900, fontSize: big, lineHeight: 1.04, color: '#fff', textShadow: '0 4px 30px rgba(0,0,0,0.95)' }}>{text}</div>
          {sub && <div style={{ marginTop: 14, fontFamily: SANS, fontWeight: 800, fontSize: 28, letterSpacing: '0.16em', color: accent, textShadow: '0 2px 20px rgba(0,0,0,0.9)' }}>{sub}</div>}
        </div>
      </div>
    </div>
  );
}

// Player showcase — its own clip (bed) + name/number label revealed at name onset (Rule #23).
function PlayerShowcase({ clipId, name, role, accent, start, end, nameAt }) {
  const t = useTime(); if (t < start || t > end) return null;
  const fade = t > end - 0.3 ? clamp((end - t) / 0.3, 0, 1) : 1;
  const lp = Easing.easeOutCubic(clamp((t - (nameAt ?? start)) / 0.5, 0, 1));
  const slide = (1 - lp) * 60;
  const dark = accent === ARG_BLUE || accent === ENG_WHITE || accent === GOLD;
  return (
    <div style={{ position: 'absolute', inset: 0, zIndex: 12, opacity: fade }}>
      <ClipSprite id={clipId} fit="cover" style={GRADE} />
      <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg, rgba(0,0,0,0.22) 0%, transparent 18%, transparent 40%, rgba(5,7,14,0.90) 76%, rgba(5,7,14,0.97) 100%)' }} />
      <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: 12, background: accent, boxShadow: `0 0 30px ${accent}` }} />
      <div style={{ position: 'absolute', left: 80, bottom: 120, transform: `translateX(${-slide}px)`, opacity: lp }}>
        <div style={{ display: 'inline-block', background: accent, color: dark ? '#06121a' : '#fff', fontFamily: SANS, fontWeight: 800, fontSize: 22, letterSpacing: '0.2em', padding: '6px 18px', borderRadius: 6, marginBottom: 14 }}>{role}</div>
        <div style={{ fontFamily: SANS, fontWeight: 900, fontSize: 74, color: '#fff', letterSpacing: '0.01em', lineHeight: 1, textShadow: '0 6px 30px rgba(0,0,0,0.85)' }}>{name}</div>
      </div>
    </div>
  );
}

function TeamBanner({ flag, label, accent }) {
  const { localTime: lt } = useSprite();
  const p = Easing.easeOutCubic(clamp(lt / 0.9, 0, 1));
  return (
    <div style={{ position: 'absolute', top: 64, left: 0, right: 0, display: 'flex', justifyContent: 'center', zIndex: 26, opacity: p, transform: `translateY(${(1 - p) * -20}px)` }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 24, background: 'rgba(11,18,38,0.86)', border: `1px solid ${MV.line}`, borderRadius: 999, padding: '14px 40px', boxShadow: '0 10px 30px rgba(0,0,0,0.5)' }}>
        {flag}<span style={{ fontFamily: SANS, fontWeight: 900, fontSize: 34, color: '#fff', letterSpacing: '0.10em' }}>{label}</span>
        <div style={{ width: 14, height: 14, borderRadius: '50%', background: accent, boxShadow: `0 0 16px ${accent}` }} />
      </div>
    </div>
  );
}

function SectionLabel({ start, end, text, y = 140, size = 30 }) {
  const t = useTime(); if (t < start || t > end) return null;
  const p = clamp((t - start) / 0.5, 0, 1) * clamp((end - t) / 0.5, 0, 1);
  return (
    <div style={{ position: 'absolute', left: 0, right: 0, bottom: y, textAlign: 'center', zIndex: 24, opacity: p }}>
      <div style={{ display: 'inline-block', fontFamily: SANS, fontWeight: 800, fontSize: size, color: '#f4dca8', letterSpacing: '0.24em', textShadow: '0 2px 18px rgba(0,0,0,0.85)' }}>{text}</div>
    </div>
  );
}

// ── TITLE 24–36 ────────────────────────────────────────────────────────────────
function SceneTitle() {
  const t = useTime();
  const p1 = Easing.easeOutCubic(clamp((t - 24) / 1.0, 0, 1));
  const p2 = Easing.easeOutBack(clamp((t - 24.8) / 1.0, 0, 1));
  const p3 = Easing.easeOutCubic(clamp((t - 25.7) / 0.9, 0, 1));
  return (
    <div style={{ position: 'absolute', inset: 0 }}>
      <NightField o={1} />
      <FS id="gold-dust" dim={0.42} /><FS id="light-rays-gold" dim={0.42} /><FS id="gold-dust-t" dim={0.42} />
      <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg, rgba(5,7,14,0.5) 0%, rgba(5,7,14,0.24) 45%, rgba(5,7,14,0.6) 100%)' }} />
      <AmbientParticles start={24} dur={12} count={34} color="233,198,90" />
      <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 34 }}>
        <div style={{ opacity: p1, transform: `translateY(${(1 - p1) * -30}px)` }}><Kicker color={GOLD}>WorldCup26 Legends · Episode 105 · The Semifinal</Kicker></div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 52, opacity: clamp(p2, 0, 1), transform: `scale(${p2})` }}>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 18 }}><Waving><FlagARG w={190} /></Waving><BigTitle size={62} glow={ARG_BLUE}>ARGENTINA</BigTitle></div>
          <BigTitle size={104} color={GOLD}>VS</BigTitle>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 18 }}><Waving speed={1.9}><FlagENG w={190} /></Waving><BigTitle size={62} glow={ENG_RED}>ENGLAND</BigTitle></div>
        </div>
        <div style={{ opacity: p3, fontFamily: SANS, fontWeight: 800, fontSize: 30, color: '#f0d6a4', letterSpacing: '0.16em' }}>FORTY YEARS OF GHOSTS</div>
      </div>
      <Vignette strength={0.4} />
    </div>
  );
}

// ── STADIUM 36–47 ──────────────────────────────────────────────────────────────
function SceneStadium() {
  const t = useTime();
  const stripP = Easing.easeOutCubic(clamp((t - 37.2) / 0.9, 0, 1));
  return (
    <div style={{ position: 'absolute', inset: 0 }}>
      <NightField o={0.5} />
      <FS id="pitch-walkout" /><FS id="stadium-wide" /><FS id="pitch-walkout-b" dim={0.3} />
      <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg, transparent 50%, rgba(5,7,14,0.8) 100%)' }} />
      <div style={{ position: 'absolute', left: 0, right: 0, bottom: 120, display: 'flex', justifyContent: 'center', zIndex: 25, opacity: stripP, transform: `translateY(${(1 - stripP) * 30}px)` }}>
        <div style={{ display: 'flex', background: 'rgba(11,18,38,0.86)', border: `1px solid ${MV.line}`, borderRadius: 16, overflow: 'hidden', backdropFilter: 'blur(6px)' }}>
          {[['THE', 'ALBICELESTE'], ['THREE', 'LIONS'], ['EPISODE 105', 'SEMIFINAL'], ['ONE PLACE', 'IN THE FINAL']].map(([v, l], i) => (
            <div key={i} style={{ padding: '22px 34px', borderLeft: i ? `1px solid ${MV.line}` : 'none', textAlign: 'center' }}>
              <div style={{ fontFamily: SANS, fontWeight: 900, fontSize: 24, color: GOLD }}>{v}</div>
              <div style={{ fontFamily: SANS, fontWeight: 700, fontSize: 14, color: MV.muted, letterSpacing: '0.10em', marginTop: 5 }}>{l}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ── ARGENTINA 47–72 (Messi + Álvarez) ──────────────────────────────────────────
function SceneArgentina() {
  return (
    <div style={{ position: 'absolute', inset: 0 }}>
      <NightField o={0.5} tone="blue" />
      <FS id="arg-crowd" /><FS id="stadium-glow" dim={0.32} /><FS id="night-rays-blue" dim={0.2} />
      <Sprite start={47} end={52}><TeamBanner flag={<FlagARG w={58} />} label="THE ALBICELESTE · ARGENTINA" accent={ARG_BLUE} /></Sprite>
      <SectionLabel start={52.4} end={56.8} text="WORLD CHAMPIONS" y={130} />
      <PlayerShowcase clipId="messi-show" name="LIONEL MESSI" role="CAPTAIN · No. 10" accent={ARG_BLUE} start={57} end={62} nameAt={57.2} />
      <SectionLabel start={62.4} end={66.8} text="THE HEIR TO MARADONA" y={130} />
      <PlayerShowcase clipId="lautaro-show" name="LAUTARO MARTÍNEZ" role="THE BULL · No. 22" accent={ARG_BLUE} start={67} end={72} nameAt={67.2} />
    </div>
  );
}

// ── ENGLAND 72–98 (Kane + Bellingham) ──────────────────────────────────────────
function SceneEngland() {
  return (
    <div style={{ position: 'absolute', inset: 0 }}>
      <NightField o={0.5} />
      <FS id="eng-crowd" /><FS id="eng-march" dim={0.12} /><FS id="eng-captain-regal" dim={0.28} /><FS id="eng-walkout4" dim={0.3} />
      <Sprite start={72} end={77}><TeamBanner flag={<FlagENG w={64} />} label="THREE LIONS · ENGLAND" accent={ENG_RED} /></Sprite>
      <SectionLabel start={77.4} end={81.8} text="FINALLY WITHOUT FEAR" y={130} />
      <PlayerShowcase clipId="kane-show" name="HARRY KANE" role="CAPTAIN · No. 9" accent={ENG_RED} start={82} end={87} nameAt={82.5} />
      <PlayerShowcase clipId="bell-show" name="JUDE BELLINGHAM" role="THE YOUNG KING · No. 10" accent={ENG_RED} start={90.5} end={95.5} nameAt={90.6} />
    </div>
  );
}

// ── RIDDLE / THE GHOST OF '86 98–116 ────────────────────────────────────────────
function SceneRiddle() {
  return (
    <div style={{ position: 'absolute', inset: 0 }}>
      <NightField o={0.6} tone="blue" />
      <FS id="riddle-a" br={1.4} /><FS id="riddle-b" br={1.3} /><FS id="riddle-c" br={1.2} /><FS id="riddle-d" br={1.4} />
      <BeatCard start={98} end={102.9} text={<>THE GHOST OF<br />EIGHTY-SIX</>} sub="MARADONA · ALMOST ALONE" accent={GOLD} big={56} />
      <SectionLabel start={103.4} end={107.8} text="FORTY YEARS ON" y={140} size={34} />
      <BeatCard start={108} end={116} text={<>ANOTHER<br />NUMBER TEN</>} sub="THE SAME DREAM · THE SAME GHOST" accent={GOLD} big={62} />
      <Vignette strength={0} />
    </div>
  );
}

// ── Premium result card (Argentina 2–1, real semifinal result). Rule #18. ──────
function ResultCard({ start }) {
  const t = useTime(); const local = t - start; if (local < 0) return null;
  const p = Easing.easeOutCubic(clamp(local / 1.0, 0, 1));
  const stampP = Easing.easeOutBack(clamp((local - 1.0) / 0.6, 0, 1));
  const sheenX = ((local * 26) % 160) - 30;
  const Badge = ({ flag, name, accent }) => (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 14 }}>
      <div style={{ padding: 9, borderRadius: '50%', background: `conic-gradient(${accent}, #ffffffaa, ${accent}, #ffffff55, ${accent})`, boxShadow: `0 10px 34px rgba(0,0,0,0.55), 0 0 26px ${accent}66` }}>
        <div style={{ width: 120, height: 120, borderRadius: '50%', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#0b1330', border: '3px solid rgba(255,255,255,0.9)' }}>{flag}</div>
      </div>
      <span style={{ fontFamily: SANS, fontWeight: 900, fontSize: 24, color: '#fff', letterSpacing: '0.03em' }}>{name}</span>
    </div>
  );
  return (
    <div style={{ position: 'absolute', inset: 0, zIndex: 28, display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: p }}>
      <div style={{ width: 1040, borderRadius: 28, overflow: 'hidden', transform: `scale(${0.92 + 0.08 * p})`, boxShadow: '0 36px 130px rgba(0,0,0,0.8)', position: 'relative', border: '2px solid rgba(233,198,90,0.55)' }}>
        <div style={{ position: 'absolute', inset: 0, background: `linear-gradient(105deg, ${ARG_BLUE}33 0%, #0b1330 38%, #0b1330 62%, ${ENG_RED}44 100%)` }} />
        <div style={{ position: 'absolute', top: 0, bottom: 0, left: `${sheenX}%`, width: '22%', background: 'linear-gradient(105deg, transparent, rgba(255,255,255,0.10), transparent)', transform: 'skewX(-18deg)', pointerEvents: 'none', zIndex: 5 }} />
        <div style={{ position: 'relative', zIndex: 2, background: `linear-gradient(100deg, ${ARG_BLUE} 0%, ${GOLD} 50%, ${ENG_RED} 100%)`, padding: '13px 0', textAlign: 'center' }}>
          <span style={{ fontFamily: SANS, fontWeight: 900, fontSize: 17, letterSpacing: '0.22em', color: '#0b1330' }}>WORLDCUP26 LEGENDS · EP.105 · SEMIFINAL · FULL-TIME</span>
        </div>
        <div style={{ position: 'relative', zIndex: 2, padding: '34px 70px 26px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 46 }}>
            <Badge flag={<FlagARG w={102} />} name="ARGENTINA" accent={ARG_BLUE} />
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, fontFamily: SANS, fontWeight: 900, fontSize: 108, color: '#fff', lineHeight: 1 }}>
                <span style={{ textShadow: `0 0 36px ${ARG_BLUE}cc` }}>2</span>
                <span style={{ color: GOLD, fontSize: 54, transform: 'translateY(-6px)' }}>—</span>
                <span style={{ textShadow: `0 0 36px ${ENG_RED}cc` }}>1</span>
              </div>
              <div style={{ fontFamily: SANS, fontWeight: 900, fontSize: 22, color: GOLD, letterSpacing: '0.12em', marginTop: 2 }}>ARGENTINA REACH THE FINAL</div>
              <div style={{ fontFamily: SANS, fontWeight: 800, fontSize: 15, color: MV.muted, letterSpacing: '0.26em', marginTop: 4 }}>STOPPAGE-TIME WINNER · vs SPAIN</div>
            </div>
            <Badge flag={<FlagENG w={102} />} name="ENGLAND" accent={ENG_RED} />
          </div>
          <div style={{ textAlign: 'center', marginTop: 14, fontFamily: SANS, fontWeight: 900, fontSize: 24, color: GOLD, letterSpacing: '0.02em', textShadow: `0 0 26px ${GOLD}66` }}>GORDON 55' · ENZO 85' · LAUTARO 90+2'</div>
          <div style={{ display: 'flex', justifyContent: 'center', gap: 12, marginTop: 14, paddingTop: 16, borderTop: '1px solid rgba(255,255,255,0.12)' }}>
            <span style={{ fontFamily: SANS, fontWeight: 800, fontSize: 20, color: '#f6e6c4', background: 'rgba(233,198,90,0.16)', border: '1px solid rgba(233,198,90,0.45)', borderRadius: 999, padding: '7px 18px' }}>✦ MESSI · TWO ASSISTS · FOR DIEGO</span>
          </div>
          <div style={{ textAlign: 'center', marginTop: 10, fontFamily: SANS, fontWeight: 700, fontSize: 16, color: MV.muted, letterSpacing: '0.2em' }}>worldcup26.world</div>
        </div>
        {stampP > 0 && <div style={{ position: 'absolute', top: 62, right: -6, zIndex: 6, transform: `rotate(-12deg) scale(${stampP})`, border: `4px solid ${GOLD}`, color: GOLD, borderRadius: 12, padding: '8px 22px', fontFamily: SANS, fontWeight: 900, fontSize: 24, letterSpacing: '0.14em', background: 'rgba(11,19,48,0.92)' }}>FULL-TIME</div>}
      </div>
    </div>
  );
}

// ── DRAMA 116–200 (real match: Gordon 1-0 → Enzo 1-1 → Lautaro 2-1) ──────────────
function SceneDrama() {
  return (
    <div style={{ position: 'absolute', inset: 0 }}>
      <Backdrop />
      {/* action / goal beds (full brightness, photoreal) */}
      <FS id="dr-eng-attack" /><FS id="dr-kane-goal" /><FS id="dr-eng-pileon" /><FS id="dr-arg-attack" /><FS id="dr-messi-assist1" /><FS id="dr-enzo-strike" /><FS id="dr-messi-assist2" /><FS id="dr-lautaro-header" /><FS id="dr-lautaro-celeb" />
      {/* bright beat / transition backdrops */}
      <FS id="dr-open" br={1.3} /><FS id="dr-arg-despair" br={1.3} /><FS id="dr-tense1" br={1.3} /><FS id="dr-goalnet" br={1.5} /><FS id="dr-embers" br={1.3} /><FS id="dr-oldriv" br={1.4} /><FS id="dr-stadwide" br={1.3} /><FS id="dr-arg-crowd2" br={1.2} />
      {/* beats + goals */}
      <BeatCard start={116} end={121} text={<>TWO GIANTS,<br />ONE FINAL</>} sub="BLOW FOR BLOW" accent={GOLD} big={58} />
      <ChanceTag start={122.5} end={126} text="ENGLAND ON THE FRONT FOOT" sub="THREE LIONS PRESS" accent={ENG_RED} />
      <GoalFlash at={130.5} /><ChanceTag start={130.6} end={135.5} text="ENGLAND LEAD" sub="GORDON · 55'" accent={ENG_RED} />
      <ChanceTag start={136.5} end={140.5} text="ARGENTINA RESPOND" sub="WAVE AFTER WAVE" accent={ARG_BLUE} />
      <BeatCard start={141.5} end={146} text={<>THE CLOCK,<br />THE ENEMY</>} sub="EIGHTY MINUTES GONE" accent={GOLD} big={54} />
      <ChanceTag start={151.5} end={155.5} text="MESSI · THE MAKER" sub="HE ROLLS IT SQUARE" accent={ARG_BLUE} />
      <GoalFlash at={159.6} /><ChanceTag start={159.7} end={165.5} text="ENZO FERNÁNDEZ!" sub="ARGENTINA · 1–1 · 85'" accent={ARG_BLUE} />
      <BeatCard start={166.2} end={171} text={<>A THUNDERBOLT</>} sub="LEVEL — ONE, ALL" accent={GOLD} big={58} />
      <BeatCard start={171.2} end={176} text={<>STOPPAGE TIME</>} sub="NINETY PLUS TWO" accent={GOLD} big={58} />
      <BeatCard start={176.2} end={180.8} text={<>IT FALLS TO<br />THE CAPTAIN</>} accent={ARG_BLUE} big={54} />
      <ChanceTag start={181.5} end={185.6} text="MESSI TO THE BYLINE" sub="HE FLOATS IT IN" accent={ARG_BLUE} />
      <GoalFlash at={187} /><ChanceTag start={187.1} end={192} text="LAUTARO!" sub="ARGENTINA · 2–1 · 90+2'" accent={ARG_BLUE} />
      <Confetti start={187} dur={13} count={70} />
      <ChanceTag start={192.6} end={198.5} text="TO THE FINAL" sub="A NATION ERUPTS" accent={GOLD} />
      <ScoreBug start={192.6} arg={2} eng={1} note="90+2'" badge="THE WINNER" />
      <Vignette strength={0} />
    </div>
  );
}

// ── AFTERMATH 200–246 (no shootout — the maestro & the tribute to Diego) ─────────
function ScenePens() {
  return (
    <div style={{ position: 'absolute', inset: 0 }}>
      <Backdrop />
      <FS id="af-messi-golden" />
      <FS id="af-a" br={1.3} /><FS id="af-b" br={1.2} /><FS id="af-c" br={1.4} /><FS id="af-d" br={1.3} /><FS id="af-e" br={1.3} /><FS id="af-f" br={1.3} /><FS id="af-g" br={1.2} /><FS id="af-h" br={1.3} /><FS id="af-i" br={1.4} />
      <ChanceTag start={201} end={205} text="NO SHOOTOUT TONIGHT" sub="ONLY ARGENTINA, MARCHING ON" accent={GOLD} />
      <BeatCard start={205.5} end={210} text={<>TWO ASSISTS</>} sub="BOTH HIS" accent={ARG_BLUE} big={62} />
      <BeatCard start={210.5} end={215} text={<>HE DID NOT SCORE —<br />HE DECIDED IT</>} accent={GOLD} big={50} />
      <ChanceTag start={220.5} end={225.5} text="EYES TO THE SKY" sub="FOR DIEGO" accent={GOLD} />
      <BeatCard start={226} end={230.5} text={<>MARADONA BEAT<br />ENGLAND ALONE</>} sub="EIGHTY-SIX" accent={GOLD} big={50} />
      <BeatCard start={230.7} end={235.8} text={<>TONIGHT, HIS HEIR<br />DID IT AS A MAESTRO</>} accent={ARG_BLUE} big={48} />
      <ChanceTag start={240.3} end={245.3} text="ON TO THE FINAL" sub="ARGENTINA · TO FACE SPAIN" accent={GOLD} />
      <ScoreBug start={240.6} arg={2} eng={1} note="90+2'" badge="FULL-TIME" />
      <Vignette strength={0} />
    </div>
  );
}

// ── THE TRIBUTE 246–262 (Messi & Diego — the old king and the new) ───────────────
function SceneGoldenBoot() {
  return (
    <div style={{ position: 'absolute', inset: 0 }}>
      <NightField o={0.5} tone="blue" />
      <FS id="tr-a" br={1.3} /><FS id="tr-b" br={1.3} /><FS id="tr-c" br={1.3} /><FS id="tr-d" br={1.3} />
      <ChanceTag start={248.8} end={253} text="CARRIED, ONE MORE TIME" sub="BY ITS NUMBER TEN" accent={GOLD} />
      <BeatCard start={257} end={262} text={<>THE OLD KING<br />AND THE NEW</>} sub="TOGETHER AT LAST · INTO THE FINAL" accent={GOLD} big={52} />
      <Vignette strength={0} />
    </div>
  );
}

// ── VERDICT 262–283 (real full-time result card) ─────────────────────────────────
function SceneVerdict() {
  return (
    <div style={{ position: 'absolute', inset: 0 }}>
      <NightField o={0.8} tone="blue" />
      <FS id="vd-a" dim={0.3} /><FS id="vd-b" dim={0.3} /><FS id="vd-c" dim={0.32} /><FS id="vd-d" dim={0.32} /><FS id="vd-e" dim={0.32} />
      <SectionLabel start={262.4} end={266.6} text="ARGENTINA MARCH ON" y={150} size={32} />
      <Sprite start={267} end={283}>
        <div style={{ position: 'absolute', inset: 0 }}>
          <div style={{ position: 'absolute', inset: 0, background: 'rgba(6,10,22,0.24)' }} />
          <AmbientParticles start={267} dur={16} count={26} color="233,198,90" />
          <ResultCard start={267.3} />
        </div>
      </Sprite>
      <Vignette strength={0.4} />
    </div>
  );
}

// ── ENGAGE 283–295 ──────────────────────────────────────────────────────────────
function SceneEngage() {
  const t = useTime();
  const headP = Easing.easeOutCubic(clamp((t - 283) / 0.9, 0, 1));
  const cards = [
    { label: 'COMMENT ARGENTINA', sub: 'ALBICELESTE', flag: <FlagARG w={68} />, accent: ARG_BLUE },
    { label: 'COMMENT ENGLAND', sub: 'THREE LIONS', flag: <FlagENG w={68} />, accent: ENG_RED },
  ];
  return (
    <div style={{ position: 'absolute', inset: 0 }}>
      <NightField o={0.5} />
      <FS id="en-a" dim={0.5} /><FS id="en-b" dim={0.55} /><FS id="en-c" dim={0.5} />
      <div style={{ position: 'absolute', inset: 0, background: 'rgba(8,10,20,0.5)' }} />
      <AmbientParticles start={283} dur={12} count={28} color="233,198,90" />
      <div style={{ position: 'absolute', top: 132, left: 0, right: 0, textAlign: 'center', zIndex: 25, opacity: headP }}><Kicker size={30} color={GOLD}>Messi's Masterpiece, Or England's Heartbreak?</Kicker></div>
      <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 56, zIndex: 25 }}>
        {cards.map((c, i) => {
          const cp = Easing.easeOutBack(clamp((t - 283.8 - i * 0.4) / 0.7, 0, 1));
          return (
            <div key={i} style={{ transform: `translateY(${(1 - cp) * 60}px) scale(${0.85 + 0.15 * cp})`, opacity: clamp(cp, 0, 1), background: 'rgba(11,18,38,0.9)', border: `1px solid ${MV.line}`, borderRadius: 22, padding: '38px 46px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 18, minWidth: 400, boxShadow: '0 24px 70px rgba(0,0,0,0.5)', borderTop: `5px solid ${c.accent}` }}>
              {c.flag}
              <div style={{ fontFamily: SANS, fontWeight: 900, fontSize: 23, color: '#fff' }}>{c.label}</div>
              <div style={{ fontFamily: SANS, fontWeight: 700, fontSize: 20, color: MV.muted, letterSpacing: '0.16em' }}>{c.sub}</div>
            </div>
          );
        })}
      </div>
      <Vignette strength={0.4} />
    </div>
  );
}

// Collection strip — real prior Legend mini-cards (096–100) + new 105 highlighted (Rule #24).
function MiniStrip() {
  const prev = ['legend-096-portrait', 'legend-097-portrait', 'legend-098-portrait', 'legend-099-portrait', 'legend-100-portrait'];
  return (
    <div style={{ display: 'flex', alignItems: 'flex-end', gap: 12 }}>
      {prev.map((id) => (
        <div key={id} style={{ width: 62, height: 84, borderRadius: 8, overflow: 'hidden', border: '1px solid rgba(255,255,255,0.22)', boxShadow: '0 8px 20px rgba(0,0,0,0.5)', opacity: 0.82 }}>
          <img data-seq alt="" src={`assets/${id}.png`} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
        </div>
      ))}
      <div style={{ width: 78, height: 104, borderRadius: 9, overflow: 'hidden', border: `2px solid ${GOLD}`, boxShadow: `0 10px 28px rgba(0,0,0,0.6), 0 0 26px ${GOLD}88` }}>
        <img data-seq alt="" src="assets/legend-105-portrait.png" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
      </div>
    </div>
  );
}

// ── MYSTERY / EL DIEZ reveal 295–324 (Rules #16/#17) ─────────────────────────────
function SceneMystery() {
  const t = useTime(); const lt = t - 295;
  const teaseP = clamp((lt - 0.3) / 0.5, 0, 1) * clamp((2.6 - lt) / 0.5, 0, 1);
  const cardP = Easing.easeOutBack(clamp((lt - 2.2) / 1.1, 0, 1));
  const tilt = Math.sin(lt * 0.7) * 4;
  const sheenX = ((lt * 24) % 200) - 50;
  const glow = 0.5 + 0.5 * Math.sin(lt * 1.3);
  const unlockP = Easing.easeOutBack(clamp((t - 308.5) / 0.8, 0, 1));
  const txtP = Easing.easeOutCubic(clamp((lt - 3.4) / 1.0, 0, 1));
  const stripP = Easing.easeOutCubic(clamp((lt - 5.2) / 1.0, 0, 1));
  return (
    <div style={{ position: 'absolute', inset: 0 }}>
      <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse at 50% 46%, #14264f 0%, #0c1734 50%, #060a16 100%)' }} />
      <FS id="destiny-rays-d" dim={0.55} /><FS id="light-rays-gold-c" dim={0.6} /><FS id="gold-dust-g" dim={0.6} /><FS id="embers-d" dim={0.6} /><FS id="destiny-rays-e" dim={0.6} /><FS id="light-rays-gold-d" dim={0.6} />
      <div style={{ position: 'absolute', inset: 0, background: `radial-gradient(ellipse at 50% 44%, rgba(233,198,90,${(0.28 * glow).toFixed(3)}) 0%, transparent 55%)` }} />
      <div style={{ position: 'absolute', inset: 0, background: 'rgba(6,10,22,0.3)' }} />
      <AmbientParticles start={295} dur={29} count={54} color="245,210,120" maxR={4.2} />
      {teaseP > 0.01 && (
        <div style={{ position: 'absolute', left: 0, right: 0, top: 84, textAlign: 'center', opacity: teaseP, zIndex: 20 }}>
          <div style={{ display: 'inline-block', fontFamily: SANS, fontWeight: 800, fontSize: 30, color: '#f4dca8', letterSpacing: '0.24em', textShadow: '0 2px 18px rgba(0,0,0,0.7)' }}>THE GHOST OF EIGHTY-SIX</div>
        </div>
      )}
      {lt > 1.8 && (
        <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 22, opacity: clamp(cardP, 0, 1) }}>
          <div style={{ position: 'relative', transform: `perspective(1500px) rotateY(${tilt}deg) scale(${0.92 + 0.08 * Math.min(cardP, 1)})`, marginTop: -30 }}>
            <img data-seq src="assets/legend-105-portrait.png" alt="" style={{ height: 630, display: 'block', borderRadius: 16, boxShadow: '0 50px 130px rgba(0,0,0,0.85), 0 0 80px rgba(233,198,90,0.55)' }} />
            <div style={{ position: 'absolute', top: 0, bottom: 0, left: `${sheenX}%`, width: '22%', background: 'linear-gradient(105deg, transparent, rgba(255,240,200,0.34), transparent)', transform: 'skewX(-18deg)', borderRadius: 16, pointerEvents: 'none', zIndex: 6 }} />
            <div style={{ position: 'absolute', top: 16, left: '50%', transform: 'translateX(-50%)', background: 'rgba(233,198,90,0.95)', color: '#2a1608', fontFamily: SANS, fontWeight: 900, fontSize: 17, letterSpacing: '0.14em', padding: '5px 16px', borderRadius: 8, boxShadow: '0 6px 20px rgba(0,0,0,0.5)' }}>Nº 105 · ✦✦✦ ULTRA RARE</div>
            {unlockP > 0 && <div style={{ position: 'absolute', bottom: 20, left: '50%', transform: `translateX(-50%) scale(${unlockP})`, background: 'linear-gradient(90deg,#b8892b,#e9c65a,#b8892b)', color: '#1a1206', fontFamily: SANS, fontWeight: 900, fontSize: 22, letterSpacing: '0.2em', padding: '8px 26px', borderRadius: 8, boxShadow: '0 8px 26px rgba(0,0,0,0.6)' }}>LEGEND UNLOCKED</div>}
          </div>
        </div>
      )}
      <div style={{ position: 'absolute', left: 0, right: 0, bottom: 46, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 14, zIndex: 24 }}>
        <div style={{ textAlign: 'center', opacity: txtP, transform: `translateY(${(1 - txtP) * 16}px)` }}>
          <div style={{ fontFamily: SANS, fontWeight: 900, fontSize: 40, color: GOLD, letterSpacing: '0.04em', textShadow: '0 2px 24px rgba(233,198,90,0.5)' }}>EL DIEZ · THE IMMORTAL TEN</div>
          <div style={{ fontFamily: SANS, fontWeight: 700, fontSize: 19, color: '#f0dcb8', letterSpacing: '0.18em', marginTop: 6 }}>ARGENTINA · LEGEND 105</div>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10, opacity: stripP }}>
          <MiniStrip />
          <div style={{ fontFamily: SANS, fontWeight: 900, fontSize: 20, color: '#fff', letterSpacing: '0.2em' }}>COLLECT THEM ALL</div>
        </div>
      </div>
    </div>
  );
}

// Phone-collect footer — the card flies into the phone grid (Rule #24).
function PhoneCollect({ start }) {
  const t = useTime(); const local = t - start;
  const inP = Easing.easeOutCubic(clamp(local / 0.8, 0, 1));
  const fly = Easing.easeInOutCubic(clamp((local - 1.2) / 1.6, 0, 1));
  const snapped = local > 2.8;
  const flash = snapped ? Math.max(0, 1 - (local - 2.8) * 1.6) : 0;
  const filled = ['legend-097-portrait', 'legend-098-portrait', 'legend-099-portrait', 'legend-100-portrait'];
  const cardX = -360 + fly * 360, cardY = -40 + fly * 150, cardS = 1 - fly * 0.62;
  if (local < 0) return null;
  return (
    <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 26, opacity: inP }}>
      <div style={{ position: 'relative', width: 300, height: 600, borderRadius: 40, background: 'linear-gradient(160deg,#1a2440,#0a1020)', border: '3px solid #26314f', boxShadow: '0 40px 110px rgba(0,0,0,0.8), 0 0 50px rgba(233,198,90,0.25)', padding: 12 }}>
        <div style={{ position: 'absolute', top: 16, left: '50%', transform: 'translateX(-50%)', width: 90, height: 8, borderRadius: 6, background: '#060a14' }} />
        <div style={{ width: '100%', height: '100%', borderRadius: 30, background: 'radial-gradient(ellipse at 50% 20%, #14203c 0%, #070c16 70%)', overflow: 'hidden', position: 'relative', padding: '34px 18px 18px' }}>
          <div style={{ textAlign: 'center', fontFamily: SANS, fontWeight: 900, fontSize: 15, color: GOLD, letterSpacing: '0.18em' }}>MY LEGENDS</div>
          <div style={{ textAlign: 'center', fontFamily: SANS, fontWeight: 700, fontSize: 10, color: '#cdd8f0', letterSpacing: '0.1em', marginTop: 2, marginBottom: 14 }}>worldcup26.world</div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 10 }}>
            {filled.map((id) => (
              <div key={id} style={{ height: 104, borderRadius: 6, overflow: 'hidden', border: '1px solid rgba(255,255,255,0.16)' }}>
                <img data-seq alt="" src={`assets/${id}.png`} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
              </div>
            ))}
            <div style={{ height: 104, borderRadius: 6, overflow: 'hidden', border: snapped ? `2px solid ${GOLD}` : '1px dashed rgba(233,198,90,0.6)', position: 'relative', boxShadow: flash > 0 ? `0 0 ${20 * flash}px ${GOLD}` : 'none' }}>
              {snapped && <img data-seq alt="" src="assets/legend-105-portrait.png" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />}
              {flash > 0 && <div style={{ position: 'absolute', inset: 0, background: GOLD, opacity: flash * 0.6 }} />}
            </div>
            <div style={{ height: 104, borderRadius: 6, border: '1px dashed rgba(255,255,255,0.14)' }} />
          </div>
          {snapped && local < 4.6 && <div style={{ position: 'absolute', left: 0, right: 0, bottom: 30, textAlign: 'center', fontFamily: SANS, fontWeight: 900, fontSize: 16, color: GOLD, letterSpacing: '0.16em', opacity: clamp(1 - (local - 3.6), 0, 1) }}>COLLECTED!</div>}
        </div>
      </div>
      {!snapped && local > 0.4 && (
        <div style={{ position: 'absolute', left: '50%', top: '50%', transform: `translate(-50%,-50%) translate(${cardX}px, ${cardY}px) scale(${cardS})`, width: 200, height: 356, borderRadius: 12, overflow: 'hidden', border: `2px solid ${GOLD}`, boxShadow: `0 30px 80px rgba(0,0,0,0.7), 0 0 40px ${GOLD}88`, zIndex: 30 }}>
          <img data-seq alt="" src="assets/legend-105-portrait.png" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
        </div>
      )}
    </div>
  );
}

// ── APP 324–347 ──────────────────────────────────────────────────────────────────
function SceneApp() {
  const t = useTime();
  const p = Easing.easeOutCubic(clamp((t - 324) / 1.0, 0, 1));
  return (
    <div style={{ position: 'absolute', inset: 0 }}>
      <NightField o={0.9} />
      <FS id="gold-dust-h" dim={0.32} /><FS id="destiny-rays-f" dim={0.4} /><FS id="light-rays-gold-e" dim={0.4} /><FS id="embers-e" dim={0.4} /><FS id="gold-dust-i" dim={0.4} />
      <div style={{ position: 'absolute', inset: 0, background: 'rgba(7,11,24,0.26)' }} />
      <AmbientParticles start={324} dur={23} count={24} color="233,198,90" />
      <div style={{ position: 'absolute', top: 88, left: 0, right: 0, textAlign: 'center', zIndex: 25, opacity: Easing.easeOutCubic(clamp((t - 324) / 0.6, 0, 1)) }}>
        <Kicker size={30} color={GOLD}>Claim Your Legend</Kicker>
        <div style={{ marginTop: 10, fontFamily: SANS, fontWeight: 900, fontSize: 56, color: '#fff', letterSpacing: '0.04em' }}>worldcup26.world</div>
      </div>
      <PhoneCollect start={324.8} />
      <div style={{ position: 'absolute', bottom: 66, left: 0, right: 0, textAlign: 'center', zIndex: 25, opacity: p, fontFamily: SANS, fontWeight: 700, fontSize: 22, color: MV.muted, letterSpacing: '0.14em' }}>FREE · PICK 3 NATIONS · EVERY GOAL SCORES · NO PRIZES</div>
    </div>
  );
}

// ── CTA 347–361 ──────────────────────────────────────────────────────────────────
function SceneCTA() {
  const t = useTime();
  const p = Easing.easeOutCubic(clamp((t - 347) / 1.0, 0, 1));
  return (
    <div style={{ position: 'absolute', inset: 0 }}>
      <NightField o={0.7} />
      <FS id="light-rays-gold-f" dim={0.5} /><FS id="destiny-rays-g" dim={0.55} /><FS id="gold-dust-j" dim={0.55} />
      <Confetti start={347} dur={14} count={90} />
      <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg, rgba(5,7,14,0.45) 0%, rgba(5,7,14,0.30) 45%, rgba(5,7,14,0.72) 100%)' }} />
      <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 26, zIndex: 25, opacity: p }}>
        <Kicker size={30} color={GOLD}>WorldCup26 Legends · Episode 105</Kicker>
        <div style={{ fontFamily: SANS, fontWeight: 900, fontSize: 64, color: '#fff', letterSpacing: '0.03em', textAlign: 'center', textShadow: '0 6px 30px rgba(0,0,0,0.85)' }}>LIKE · SUBSCRIBE</div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
          <FlagARG w={58} />
          <div style={{ fontFamily: SANS, fontWeight: 900, fontSize: 34, color: GOLD, letterSpacing: '0.2em' }}>worldcup26.world</div>
          <FlagENG w={58} />
        </div>
      </div>
      <Vignette strength={0.4} />
    </div>
  );
}
