// match-scenes.jsx — Ep106 · WORLD CUP 2026 GRAND FINALE & AWARDS special.
// THEME = "THE CROWN AND THE GOLDEN GHOSTS — the World Cup remembers champions, not scorers."
// VERIFIED (tournament over, stated as fact #7): SPAIN 1-0 ARGENTINA (AET); Ferran Torres 106' (39s into
// 2nd half ET) past Emiliano Martinez, Argentina down to 10 after Enzo's stoppage-time red — Spain's 2nd
// title. Awards: Golden Boot MBAPPE (France, 10, first back-to-back), Golden Ball RODRI (Spain, back from
// ACL + a back injury needing surgery), Golden Glove UNAI SIMON (Spain, 7 CS), Young Player CUBARSI
// (Spain, 19). Messi: Silver Boot in his last World Cup. Legend 106 = SANT JORDI (Saint George of
// Catalonia): slays the dragon, a red rose blooms (victory + rebirth; Barcelona/Catalan thread).
// ARCHITECTURE: every scene lays a CONTIGUOUS clip BED (flat <FS> tiles on their clips.json windows) so
// footage sits behind every second (#25); text overlays gated by <Sprite start end>. Photoreal (#22),
// nation-correct #28 (Spain red, France blue, Argentina blue/white), name-synced (#23), no on-screen
// sentences (#10: only ≤4-word labels / name+award / score / CTA), full-frame (#19). Loaded before
// intro-scenes.jsx.

const ESP_RED = '#d1122b', ESP_GOLD = '#ffc400';
const ARG_BLUE = '#6CACE4', ARG_WHITE = '#ffffff';
const FRA_BLUE = '#2b5fd0';
const GOLD = '#e9c65a';
const GRADE = { filter: 'saturate(1.05) contrast(1.04)' };

function FlagESP({ w = 120 }) {
  const h = w * 2 / 3;
  return (
    <div style={{ width: w, height: h, borderRadius: w * 0.05, position: 'relative', overflow: 'hidden', display: 'flex', flexDirection: 'column', boxShadow: '0 6px 18px rgba(0,0,0,0.45)' }}>
      <div style={{ flex: 1, background: ESP_RED }} /><div style={{ flex: 2, background: ESP_GOLD, position: 'relative' }}>
        <div style={{ position: 'absolute', left: '22%', top: '50%', width: h * 0.30, height: h * 0.40, transform: 'translate(-50%,-50%)', background: '#c8102e', borderRadius: '18% 18% 24% 24%', opacity: 0.9 }} />
      </div><div style={{ flex: 1, background: ESP_RED }} />
    </div>
  );
}
function FlagARG({ w = 120 }) {
  const h = w * 2 / 3;
  return (
    <div style={{ width: w, height: h, borderRadius: w * 0.05, position: 'relative', overflow: 'hidden', display: 'flex', flexDirection: 'column', boxShadow: '0 6px 18px rgba(0,0,0,0.45)' }}>
      <div style={{ flex: 1, background: ARG_BLUE }} /><div style={{ flex: 1, background: ARG_WHITE }} /><div style={{ flex: 1, background: ARG_BLUE }} />
      <span style={{ position: 'absolute', left: '50%', top: '50%', transform: 'translate(-50%,-50%)', color: '#f4c430', fontSize: h * 0.34, lineHeight: 1, fontFamily: SANS, fontWeight: 900, textShadow: '0 0 4px rgba(180,120,0,0.5)' }}>☀</span>
    </div>
  );
}
function FlagFR({ w = 120 }) {
  const h = w * 2 / 3;
  return (
    <div style={{ width: w, height: h, borderRadius: w * 0.05, position: 'relative', overflow: 'hidden', display: 'flex', boxShadow: '0 6px 18px rgba(0,0,0,0.45)' }}>
      <div style={{ flex: 1, background: '#0055a4' }} /><div style={{ flex: 1, background: '#fff' }} /><div style={{ flex: 1, background: '#ef4135' }} />
    </div>
  );
}

// br = brightness multiplier for the footage bed (composes with GRADE); >1 lifts a bed under a scrim.
function FS({ id, dim = 0, br = 1, style }) {
  const filter = (br && br !== 1) ? `brightness(${br}) ${GRADE.filter}` : GRADE.filter;
  return <ClipSprite id={id} fit="cover" dim={dim} style={{ ...GRADE, ...(style || {}), filter }} />;
}

function NightField({ o = 0.6, tone = 'gold' }) {
  const t = useTime();
  const pulse = 0.5 + 0.5 * Math.sin(t * 1.1);
  const a = (0.13 + 0.12 * pulse) * Math.max(0.7, o);
  const glow = tone === 'blue' ? `rgba(96,156,224,${a.toFixed(3)})` : tone === 'red' ? `rgba(209,18,43,${a.toFixed(3)})` : `rgba(236,202,96,${a.toFixed(3)})`;
  return (
    <div style={{ position: 'absolute', inset: 0, zIndex: 0 }}>
      <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse at 50% 44%, #1c2648 0%, #131c38 55%, #0c1226 100%)' }} />
      <div style={{ position: 'absolute', inset: 0, background: `radial-gradient(ellipse at 50% 44%, ${glow} 0%, transparent 60%)` }} />
    </div>
  );
}
function Backdrop() { return <div style={{ position: 'absolute', inset: 0, zIndex: 0, background: 'radial-gradient(ellipse at 50% 45%, #131a30 0%, #070a12 100%)' }} />; }

// Final score bug (ESP 1–0 ARG, real result stated as fact #7).
function ScoreBug({ start, esp = 1, arg = 0, note = '', badge = 'FULL-TIME' }) {
  const t = useTime(); const local = t - start; if (local < 0) return null;
  const inP = Easing.easeOutBack(clamp(local / 0.7, 0, 1));
  const cell = { fontFamily: SANS, fontWeight: 900, fontSize: 34, color: '#fff', padding: '10px 18px' };
  return (
    <div style={{ position: 'absolute', top: 92, left: '50%', zIndex: 30, transform: `translateX(-50%) scale(${inP})`, opacity: clamp(inP, 0, 1), display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
      <div style={{ display: 'flex', alignItems: 'center', background: 'rgba(11,18,38,0.9)', border: `1px solid ${MV.line}`, borderRadius: 14, boxShadow: '0 10px 36px rgba(0,0,0,0.6)', overflow: 'hidden' }}>
        <div style={{ ...cell, background: ESP_RED }}>ESP</div>
        <div style={{ ...cell, fontSize: 38, color: GOLD }}>{esp} — {arg}</div>
        <div style={{ ...cell, background: ARG_BLUE, color: '#06121a' }}>ARG</div>
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

function SectionLabel({ start, end, text, y = 140, size = 30 }) {
  const t = useTime(); if (t < start || t > end) return null;
  const p = clamp((t - start) / 0.5, 0, 1) * clamp((end - t) / 0.5, 0, 1);
  return (
    <div style={{ position: 'absolute', left: 0, right: 0, bottom: y, textAlign: 'center', zIndex: 24, opacity: p }}>
      <div style={{ display: 'inline-block', fontFamily: SANS, fontWeight: 800, fontSize: size, color: '#f4dca8', letterSpacing: '0.24em', textShadow: '0 2px 18px rgba(0,0,0,0.85)' }}>{text}</div>
    </div>
  );
}

// A gold award medal chip (Golden Boot / Ball / Glove / Young Player).
function AwardChip({ icon, label, sub, accent = GOLD }) {
  return (
    <div style={{ display: 'inline-flex', alignItems: 'center', gap: 16, background: 'linear-gradient(100deg, rgba(20,15,4,0.92), rgba(40,30,8,0.92))', border: `1.5px solid ${accent}`, borderRadius: 14, padding: '12px 24px', boxShadow: `0 12px 34px rgba(0,0,0,0.55), 0 0 26px ${accent}44` }}>
      <div style={{ width: 52, height: 52, borderRadius: '50%', background: `radial-gradient(circle at 38% 32%, #fff7dd, ${accent} 55%, #8a6412)`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 28, boxShadow: `0 0 18px ${accent}aa` }}>{icon}</div>
      <div style={{ textAlign: 'left' }}>
        <div style={{ fontFamily: SANS, fontWeight: 900, fontSize: 30, color: accent, letterSpacing: '0.06em', textShadow: '0 2px 14px rgba(0,0,0,0.8)' }}>{label}</div>
        {sub && <div style={{ fontFamily: SANS, fontWeight: 800, fontSize: 17, color: '#f0e2c2', letterSpacing: '0.14em', marginTop: 2 }}>{sub}</div>}
      </div>
    </div>
  );
}

// Player/award showcase — its own clip bed + name/nation label + optional award chip (Rule #23 name-sync).
function AwardShowcase({ clipId, name, nation, accent, start, end, nameAt, award }) {
  const t = useTime(); if (t < start || t > end) return null;
  const fade = t > end - 0.3 ? clamp((end - t) / 0.3, 0, 1) : 1;
  const lp = Easing.easeOutCubic(clamp((t - (nameAt ?? start)) / 0.5, 0, 1));
  const slide = (1 - lp) * 60;
  const dark = accent === ARG_BLUE || accent === GOLD || accent === ESP_GOLD;
  const ap = Easing.easeOutBack(clamp((t - (nameAt ?? start) - 0.5) / 0.6, 0, 1));
  return (
    <div style={{ position: 'absolute', inset: 0, zIndex: 12, opacity: fade }}>
      <ClipSprite id={clipId} fit="cover" style={GRADE} />
      <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg, rgba(0,0,0,0.22) 0%, transparent 16%, transparent 38%, rgba(5,7,14,0.90) 74%, rgba(5,7,14,0.97) 100%)' }} />
      <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: 12, background: accent, boxShadow: `0 0 30px ${accent}` }} />
      <div style={{ position: 'absolute', left: 80, bottom: 118, transform: `translateX(${-slide}px)`, opacity: lp }}>
        <div style={{ display: 'inline-block', background: accent, color: dark ? '#06121a' : '#fff', fontFamily: SANS, fontWeight: 800, fontSize: 20, letterSpacing: '0.2em', padding: '6px 16px', borderRadius: 6, marginBottom: 14 }}>{nation}</div>
        <div style={{ fontFamily: SANS, fontWeight: 900, fontSize: 70, color: '#fff', letterSpacing: '0.01em', lineHeight: 1, textShadow: '0 6px 30px rgba(0,0,0,0.85)' }}>{name}</div>
        {award && <div style={{ marginTop: 18, opacity: clamp(ap, 0, 1), transform: `translateY(${(1 - ap) * 16}px)` }}><AwardChip {...award} /></div>}
      </div>
    </div>
  );
}

// ── INTRO handled in intro-scenes.jsx (SceneIntro 0–24) ─────────────────────────

// ── TITLE 24–36 ─────────────────────────────────────────────────────────────────
function SceneTitle() {
  const t = useTime();
  const p1 = Easing.easeOutCubic(clamp((t - 24) / 1.0, 0, 1));
  const p2 = Easing.easeOutBack(clamp((t - 24.8) / 1.0, 0, 1));
  const p3 = Easing.easeOutCubic(clamp((t - 25.7) / 0.9, 0, 1));
  return (
    <div style={{ position: 'absolute', inset: 0 }}>
      <NightField o={1} />
      <FS id="gold-dust" dim={0.42} /><FS id="destiny-rays" dim={0.42} /><FS id="gold-dust-t" dim={0.42} />
      <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg, rgba(5,7,14,0.5) 0%, rgba(5,7,14,0.24) 45%, rgba(5,7,14,0.6) 100%)' }} />
      <AmbientParticles start={24} dur={12} count={34} color="233,198,90" />
      <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 30 }}>
        <div style={{ opacity: p1, transform: `translateY(${(1 - p1) * -30}px)` }}><Kicker color={GOLD}>WorldCup26 Legends · Episode 106 · The Grand Finale</Kicker></div>
        <div style={{ opacity: clamp(p2, 0, 1), transform: `scale(${p2})`, textAlign: 'center' }}>
          <BigTitle size={118} color="#fff" glow={GOLD}>WORLD CUP 2026</BigTitle>
          <BigTitle size={64} color={GOLD} style={{ marginTop: 10 }}>CHAMPIONS &amp; GHOSTS</BigTitle>
        </div>
        <div style={{ opacity: p3, fontFamily: SANS, fontWeight: 800, fontSize: 28, color: '#f0d6a4', letterSpacing: '0.18em' }}>THE FINAL · THE AWARDS · THE CROWN</div>
      </div>
      <Vignette strength={0.4} />
    </div>
  );
}

// ── GOLDEN GHOSTS 36–91 (Mbappé Golden Boot · Messi last dance & Silver) ─────────
function SceneGhosts() {
  return (
    <div style={{ position: 'absolute', inset: 0 }}>
      <NightField o={0.5} />
      <FS id="stadium-wide" /><FS id="stadium-glow" dim={0.28} /><FS id="night-rays-blue" dim={0.2} /><FS id="gold-dust-a" dim={0.3} />
      <FS id="mbappe-run" /><FS id="light-rays-gold-b" br={1.3} /><FS id="embers-b" br={1.3} /><FS id="destiny-rays-b" br={1.35} /><FS id="gold-dust-b" br={1.3} /><FS id="crowd-tense" br={1.2} />
      <FS id="messi-show" /><FS id="arg-crowd" dim={0.2} /><FS id="messi-golden" /><FS id="arg-despair" br={1.15} />
      <SectionLabel start={37} end={43} text="THE GOLDEN GHOSTS" y={150} size={34} />
      <BeatCard start={43.6} end={51.4} text={<>WON EVERYTHING —<br />EXCEPT THE CROWN</>} sub="THE MEN THE CUP FORGETS" accent={GOLD} big={54} />
      <AwardShowcase clipId="mbappe-run" name="KYLIAN MBAPPÉ" nation="FRANCE" accent={FRA_BLUE} start={52} end={62} nameAt={52.2}
        award={{ icon: '👟', label: 'GOLDEN BOOT', sub: '10 GOALS · BACK-TO-BACK', accent: GOLD }} />
      <BeatCard start={63.2} end={72.8} text={<>A RECORD THAT MAY<br />NEVER BREAK</>} sub="BUT NO CUP · A BEAUTIFUL GHOST" accent={GOLD} big={52} />
      <AwardShowcase clipId="messi-show" name="LIONEL MESSI" nation="ARGENTINA" accent={ARG_BLUE} start={74} end={81} nameAt={74.2}
        award={{ icon: '★', label: 'THE LAST DANCE', sub: 'HIS FINAL WORLD CUP', accent: ARG_BLUE }} />
      <AwardShowcase clipId="messi-golden" name="LIONEL MESSI" nation="ARGENTINA" accent={ARG_BLUE} start={81} end={86} nameAt={81.1}
        award={{ icon: '🥈', label: 'SILVER BOOT', sub: '8 GOALS · GENIUS', accent: '#cdd6e6' }} />
      <BeatCard start={86.3} end={91} text={<>THE PERFECT ENDING —<br />RIPPED AWAY</>} accent={GOLD} big={52} />
      <Vignette strength={0.3} />
    </div>
  );
}

// ── THE FINAL 91–145 (red card → Ferran 106' → Spain 1-0) ────────────────────────
function SceneFinal() {
  return (
    <div style={{ position: 'absolute', inset: 0 }}>
      <Backdrop />
      <FS id="stadium-wide-b" br={1.2} /><FS id="arg-crowd2" dim={0.16} /><FS id="crowd-tense-b" br={1.25} /><FS id="night-rays-blue-b" br={1.3} /><FS id="embers-c" br={1.3} /><FS id="gold-dust-c" br={1.3} />
      <FS id="spain-crowd" dim={0.14} /><FS id="crowd-tense-c" br={1.25} /><FS id="stadium-glow-b" br={1.3} />
      <FS id="ferran-strike" /><FS id="goal-net" /><FS id="ferran-celeb" /><FS id="gold-dust-d" br={1.3} />
      <SectionLabel start={91.4} end={97} text="THE FINAL · SPAIN vs ARGENTINA" y={150} size={30} />
      <BeatCard start={97.2} end={98.4} text={<>A CRUEL TWIST</>} accent={GOLD} big={58} />
      <ChanceTag start={98.7} end={103.4} text="RED CARD" sub="ARGENTINA DOWN TO TEN" accent={ESP_RED} />
      <BeatCard start={103.6} end={108.4} text={<>SURVIVE EXTRA TIME —<br />A MAN SHORT</>} sub="90 MINUTES OF NERVE" accent={GOLD} big={50} />
      <BeatCard start={109.6} end={114.4} text={<>DESTINY'S<br />UNLIKELY NAME</>} accent={GOLD} big={56} />
      <div style={{ position: 'absolute', left: 0, right: 0, bottom: 150, textAlign: 'center', zIndex: 24 }}>
        <ChanceTag start={114.6} end={119.4} text="FERRAN TORRES" sub="SPAIN · THE DOUBTED SUBSTITUTE" accent={ESP_RED} />
      </div>
      <BeatCard start={122.2} end={126.9} text={<>39 SECONDS INTO<br />EXTRA TIME</>} sub="ONE SWING OF HIS BOOT" accent={GOLD} big={52} />
      <GoalFlash at={128.0} />
      <ChanceTag start={128.1} end={132.2} text="FERRAN TORRES!" sub="106' · SPAIN 1 – 0" accent={ESP_GOLD} />
      <ChanceTag start={132.5} end={137} text="UNDER THE BAR" sub="PAST EMILIANO MARTÍNEZ" accent={ESP_GOLD} />
      <Confetti start={137} dur={8} count={70} />
      <ChanceTag start={137.2} end={142} text="HIS FIRST GOAL — IN THE FINAL" sub="DESTINY, WRITTEN" accent={ESP_GOLD} />
      <ScoreBug start={137.4} esp={1} arg={0} note="106'" badge="AET · CHAMPIONS" />
      <Vignette strength={0.2} />
    </div>
  );
}

// ── THE CHAMPIONS SWEEP 145–206 (Simón GG · Cubarsí YP · Rodri GB + comeback) ─────
function SceneAwards() {
  return (
    <div style={{ position: 'absolute', inset: 0 }}>
      <NightField o={0.5} tone="red" />
      <FS id="spain-crowd-b" dim={0.14} /><FS id="crowd-tense-d" br={1.25} />
      <FS id="simon-save" /><FS id="stadium-glow-f" br={1.3} /><FS id="stadium-glow-c" br={1.3} />
      <FS id="cubarsi-show" /><FS id="destiny-rays-c" br={1.3} /><FS id="crowd-tense-e" br={1.25} /><FS id="light-rays-gold-c" br={1.3} />
      <FS id="rodri-trophy" /><FS id="trophy-hands" /><FS id="destiny-rays-d" br={1.35} /><FS id="embers-d" br={1.3} /><FS id="gold-dust-e" br={1.3} /><FS id="light-rays-gold-d" br={1.3} /><FS id="gold-dust-f" br={1.3} />
      <SectionLabel start={145.4} end={152.8} text="THE CHAMPIONS SWEEP THE GOLD" y={150} size={30} />
      <AwardShowcase clipId="simon-save" name="UNAI SIMÓN" nation="SPAIN" accent={ESP_RED} start={153.5} end={158.5} nameAt={153.6}
        award={{ icon: '🧤', label: 'GOLDEN GLOVE', sub: '7 CLEAN SHEETS IN 8', accent: GOLD }} />
      <AwardShowcase clipId="cubarsi-show" name="PAU CUBARSÍ" nation="SPAIN · AGE 19" accent={ESP_RED} start={162} end={167} nameAt={162.1}
        award={{ icon: '⭐', label: 'YOUNG PLAYER', sub: 'THE FUTURE', accent: GOLD }} />
      <BeatCard start={171.2} end={176} text={<>THE BEST ON EARTH?<br />NOT MESSI. NOT MBAPPÉ.</>} accent={GOLD} big={48} />
      <AwardShowcase clipId="rodri-trophy" name="RODRI" nation="SPAIN" accent={ESP_RED} start={177.5} end={182.5} nameAt={177.6}
        award={{ icon: '🏆', label: 'GOLDEN BALL', sub: 'BEST PLAYER OF THE WORLD CUP', accent: GOLD }} />
      <SectionLabel start={182.8} end={187.4} text="THE QUIET METRONOME" y={150} size={32} />
      <BeatCard start={187.7} end={197.6} text={<>BACK FROM<br />THE BRINK</>} sub="ACL · A BACK THAT NEEDS SURGERY" accent={GOLD} big={54} />
      <BeatCard start={198.2} end={205.6} text={<>THE MAN WHO<br />MAKES THE TEAM</>} sub="THROUGH THE PAIN" accent={ESP_RED} big={52} />
      <Vignette strength={0.3} />
    </div>
  );
}

// ── THE CROWN 206–219 (Spain lift · glory shared) ────────────────────────────────
function SceneCrown() {
  return (
    <div style={{ position: 'absolute', inset: 0 }}>
      <Backdrop />
      <FS id="spain-lift" /><FS id="destiny-rays-e" br={1.35} /><FS id="champions-handshake" />
      <Confetti start={206} dur={13} count={90} />
      <BeatCard start={206.4} end={214} text={<>CHAMPIONS<br />OF THE WORLD</>} sub="SPAIN · THE SECOND STAR" accent={ESP_GOLD} big={70} />
      <BeatCard start={214.8} end={219} text={<>GLORY IS NOT SCORED —<br />IT IS SHARED</>} accent={GOLD} big={48} />
      <Vignette strength={0.3} />
    </div>
  );
}

// ── MESSI CODA 219–245 (the greatest, denied — a golden ghost) ───────────────────
function SceneMessiCoda() {
  return (
    <div style={{ position: 'absolute', inset: 0 }}>
      <NightField o={0.6} tone="blue" />
      <FS id="night-rays-blue-c" dim={0.3} /><FS id="messi-final" /><FS id="arg-crowd-b" dim={0.24} /><FS id="messi-coda2" /><FS id="ghost-mist-b" br={1.15} /><FS id="messi-goal2" /><FS id="embers-e" br={1.2} />
      <SectionLabel start={219.8} end={224.4} text="THE GREATEST, STILL" y={150} size={32} />
      <BeatCard start={227.8} end={232.4} text={<>THE ONE CROWN,<br />OUT OF REACH</>} sub="SILVER BOOT · 8 GOALS" accent="#cdd6e6" big={50} />
      <BeatCard start={237.2} end={244.4} text={<>A GOLDEN GHOST,<br />INTO THE NIGHT</>} accent={GOLD} big={52} />
      <Vignette strength={0.42} />
    </div>
  );
}

// ── Premium result + awards card (ESP 1–0 ARG AET, real result). Rule #18. ───────
function ResultCard({ start }) {
  const t = useTime(); const local = t - start; if (local < 0) return null;
  const p = Easing.easeOutCubic(clamp(local / 1.0, 0, 1));
  const stampP = Easing.easeOutBack(clamp((local - 1.0) / 0.6, 0, 1));
  const sheenX = ((local * 26) % 160) - 30;
  const Badge = ({ flag, name, accent }) => (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 14 }}>
      <div style={{ padding: 9, borderRadius: '50%', background: `conic-gradient(${accent}, #ffffffaa, ${accent}, #ffffff55, ${accent})`, boxShadow: `0 10px 34px rgba(0,0,0,0.55), 0 0 26px ${accent}66` }}>
        <div style={{ width: 116, height: 116, borderRadius: '50%', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#0b1330', border: '3px solid rgba(255,255,255,0.9)' }}>{flag}</div>
      </div>
      <span style={{ fontFamily: SANS, fontWeight: 900, fontSize: 24, color: '#fff', letterSpacing: '0.03em' }}>{name}</span>
    </div>
  );
  const awards = [['👟', 'GOLDEN BOOT', 'MBAPPÉ'], ['🏆', 'GOLDEN BALL', 'RODRI'], ['🧤', 'GOLDEN GLOVE', 'SIMÓN'], ['⭐', 'YOUNG PLAYER', 'CUBARSÍ']];
  return (
    <div style={{ position: 'absolute', inset: 0, zIndex: 28, display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: p }}>
      <div style={{ width: 1080, borderRadius: 28, overflow: 'hidden', transform: `scale(${0.92 + 0.08 * p})`, boxShadow: '0 36px 130px rgba(0,0,0,0.8)', position: 'relative', border: '2px solid rgba(233,198,90,0.55)' }}>
        <div style={{ position: 'absolute', inset: 0, background: `linear-gradient(105deg, ${ESP_RED}44 0%, #0b1330 38%, #0b1330 62%, ${ARG_BLUE}33 100%)` }} />
        <div style={{ position: 'absolute', top: 0, bottom: 0, left: `${sheenX}%`, width: '22%', background: 'linear-gradient(105deg, transparent, rgba(255,255,255,0.10), transparent)', transform: 'skewX(-18deg)', pointerEvents: 'none', zIndex: 5 }} />
        <div style={{ position: 'relative', zIndex: 2, background: `linear-gradient(100deg, ${ESP_RED} 0%, ${GOLD} 50%, ${ARG_BLUE} 100%)`, padding: '13px 0', textAlign: 'center' }}>
          <span style={{ fontFamily: SANS, fontWeight: 900, fontSize: 17, letterSpacing: '0.20em', color: '#0b1330' }}>WORLDCUP26 LEGENDS · THE FINAL · FULL-TIME (AET)</span>
        </div>
        <div style={{ position: 'relative', zIndex: 2, padding: '30px 66px 24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 44 }}>
            <Badge flag={<FlagESP w={100} />} name="SPAIN" accent={ESP_RED} />
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, fontFamily: SANS, fontWeight: 900, fontSize: 104, color: '#fff', lineHeight: 1 }}>
                <span style={{ textShadow: `0 0 36px ${ESP_RED}cc` }}>1</span>
                <span style={{ color: GOLD, fontSize: 52, transform: 'translateY(-6px)' }}>—</span>
                <span style={{ textShadow: `0 0 36px ${ARG_BLUE}cc` }}>0</span>
              </div>
              <div style={{ fontFamily: SANS, fontWeight: 900, fontSize: 22, color: GOLD, letterSpacing: '0.10em', marginTop: 2 }}>SPAIN — WORLD CHAMPIONS</div>
              <div style={{ fontFamily: SANS, fontWeight: 800, fontSize: 15, color: MV.muted, letterSpacing: '0.22em', marginTop: 4 }}>FERRAN TORRES · 106' · AFTER EXTRA TIME</div>
            </div>
            <Badge flag={<FlagARG w={100} />} name="ARGENTINA" accent={ARG_BLUE} />
          </div>
          <div style={{ display: 'flex', justifyContent: 'center', gap: 10, marginTop: 20, paddingTop: 16, borderTop: '1px solid rgba(255,255,255,0.12)' }}>
            {awards.map(([ic, a, w], i) => (
              <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, background: 'rgba(233,198,90,0.10)', border: '1px solid rgba(233,198,90,0.4)', borderRadius: 12, padding: '10px 16px', minWidth: 158 }}>
                <span style={{ fontSize: 22 }}>{ic}</span>
                <span style={{ fontFamily: SANS, fontWeight: 900, fontSize: 15, color: GOLD, letterSpacing: '0.08em' }}>{a}</span>
                <span style={{ fontFamily: SANS, fontWeight: 800, fontSize: 17, color: '#fff' }}>{w}</span>
              </div>
            ))}
          </div>
          <div style={{ textAlign: 'center', marginTop: 12, fontFamily: SANS, fontWeight: 700, fontSize: 15, color: MV.muted, letterSpacing: '0.2em' }}>worldcup26.world</div>
        </div>
        {stampP > 0 && <div style={{ position: 'absolute', top: 60, right: -6, zIndex: 6, transform: `rotate(-12deg) scale(${stampP})`, border: `4px solid ${GOLD}`, color: GOLD, borderRadius: 12, padding: '8px 20px', fontFamily: SANS, fontWeight: 900, fontSize: 22, letterSpacing: '0.12em', background: 'rgba(11,19,48,0.92)' }}>CHAMPIONS</div>}
      </div>
    </div>
  );
}

// ── VERDICT 245–266 ──────────────────────────────────────────────────────────────
function SceneVerdict() {
  return (
    <div style={{ position: 'absolute', inset: 0 }}>
      <NightField o={0.8} tone="gold" />
      <FS id="destiny-rays-f" dim={0.32} /><FS id="light-rays-gold-e" dim={0.32} /><FS id="gold-dust-h" dim={0.32} /><FS id="embers-f" dim={0.32} /><FS id="destiny-rays-g" dim={0.32} />
      <SectionLabel start={245.4} end={249.4} text="THE FINAL, IN FULL" y={150} size={32} />
      <Sprite start={249.6} end={266}>
        <div style={{ position: 'absolute', inset: 0 }}>
          <div style={{ position: 'absolute', inset: 0, background: 'rgba(6,10,22,0.24)' }} />
          <AmbientParticles start={249.6} dur={17} count={26} color="233,198,90" />
          <ResultCard start={249.9} />
        </div>
      </Sprite>
      <Vignette strength={0.4} />
    </div>
  );
}

// ── ENGAGE 266–277 ────────────────────────────────────────────────────────────────
function SceneEngage() {
  const t = useTime();
  const headP = Easing.easeOutCubic(clamp((t - 266) / 0.9, 0, 1));
  const cards = [
    { label: 'COMMENT GHOST', sub: 'THE SCORER', icon: '👻', accent: '#cdd6e6' },
    { label: 'COMMENT CROWN', sub: 'THE CHAMPION', icon: '👑', accent: ESP_GOLD },
  ];
  return (
    <div style={{ position: 'absolute', inset: 0 }}>
      <NightField o={0.5} />
      <FS id="night-rays-blue-d" dim={0.5} /><FS id="crowd-tense-f" dim={0.5} /><FS id="stadium-glow-e" dim={0.5} />
      <div style={{ position: 'absolute', inset: 0, background: 'rgba(8,10,20,0.5)' }} />
      <AmbientParticles start={266} dur={11} count={28} color="233,198,90" />
      <div style={{ position: 'absolute', top: 132, left: 0, right: 0, textAlign: 'center', zIndex: 25, opacity: headP }}><Kicker size={30} color={GOLD}>Who Does The Game Remember?</Kicker></div>
      <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 56, zIndex: 25 }}>
        {cards.map((c, i) => {
          const cp = Easing.easeOutBack(clamp((t - 266.8 - i * 0.4) / 0.7, 0, 1));
          return (
            <div key={i} style={{ transform: `translateY(${(1 - cp) * 60}px) scale(${0.85 + 0.15 * cp})`, opacity: clamp(cp, 0, 1), background: 'rgba(11,18,38,0.9)', border: `1px solid ${MV.line}`, borderRadius: 22, padding: '34px 50px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 14, minWidth: 380, boxShadow: '0 24px 70px rgba(0,0,0,0.5)', borderTop: `5px solid ${c.accent}` }}>
              <div style={{ fontSize: 60 }}>{c.icon}</div>
              <div style={{ fontFamily: SANS, fontWeight: 900, fontSize: 26, color: '#fff' }}>{c.label}</div>
              <div style={{ fontFamily: SANS, fontWeight: 700, fontSize: 20, color: MV.muted, letterSpacing: '0.16em' }}>{c.sub}</div>
            </div>
          );
        })}
      </div>
      <Vignette strength={0.4} />
    </div>
  );
}

// Collection strip — real prior Legend mini-cards + new 106 highlighted (Rule #24).
function MiniStrip() {
  const prev = ['legend-097-portrait', 'legend-098-portrait', 'legend-099-portrait', 'legend-100-portrait', 'legend-105-portrait'];
  return (
    <div style={{ display: 'flex', alignItems: 'flex-end', gap: 12 }}>
      {prev.map((id) => (
        <div key={id} style={{ width: 62, height: 84, borderRadius: 8, overflow: 'hidden', border: '1px solid rgba(255,255,255,0.22)', boxShadow: '0 8px 20px rgba(0,0,0,0.5)', opacity: 0.82 }}>
          <img data-seq alt="" src={`assets/${id}.png`} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
        </div>
      ))}
      <div style={{ width: 78, height: 104, borderRadius: 9, overflow: 'hidden', border: `2px solid ${GOLD}`, boxShadow: `0 10px 28px rgba(0,0,0,0.6), 0 0 26px ${GOLD}88` }}>
        <img data-seq alt="" src="assets/legend-106-portrait.png" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
      </div>
    </div>
  );
}

// ── MYSTERY / SANT JORDI reveal 277–303 (Rules #16/#17) ──────────────────────────
function SceneMystery() {
  const t = useTime(); const lt = t - 277;
  const teaseP = clamp((lt - 0.3) / 0.5, 0, 1) * clamp((2.6 - lt) / 0.5, 0, 1);
  const cardP = Easing.easeOutBack(clamp((lt - 2.2) / 1.1, 0, 1));
  const tilt = Math.sin(lt * 0.7) * 4;
  const sheenX = ((lt * 24) % 200) - 50;
  const glow = 0.5 + 0.5 * Math.sin(lt * 1.3);
  const unlockP = Easing.easeOutBack(clamp((t - 295.0) / 0.8, 0, 1));
  const txtP = Easing.easeOutCubic(clamp((lt - 3.4) / 1.0, 0, 1));
  const stripP = Easing.easeOutCubic(clamp((lt - 5.2) / 1.0, 0, 1));
  return (
    <div style={{ position: 'absolute', inset: 0 }}>
      <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse at 50% 46%, #14264f 0%, #0c1734 50%, #060a16 100%)' }} />
      <FS id="destiny-rays-h" dim={0.55} /><FS id="light-rays-gold-f" dim={0.6} /><FS id="gold-dust-i" dim={0.6} /><FS id="embers-g" dim={0.6} /><FS id="destiny-rays-i" dim={0.6} /><FS id="light-rays-gold-g" dim={0.6} />
      <div style={{ position: 'absolute', inset: 0, background: `radial-gradient(ellipse at 50% 44%, rgba(233,198,90,${(0.28 * glow).toFixed(3)}) 0%, transparent 55%)` }} />
      <div style={{ position: 'absolute', inset: 0, background: 'rgba(6,10,22,0.3)' }} />
      <AmbientParticles start={277} dur={26} count={54} color="245,210,120" maxR={4.2} />
      {teaseP > 0.01 && (
        <div style={{ position: 'absolute', left: 0, right: 0, top: 84, textAlign: 'center', opacity: teaseP, zIndex: 20 }}>
          <div style={{ display: 'inline-block', fontFamily: SANS, fontWeight: 800, fontSize: 30, color: '#f4dca8', letterSpacing: '0.24em', textShadow: '0 2px 18px rgba(0,0,0,0.7)' }}>THE CHAMPIONS' KNIGHT</div>
        </div>
      )}
      {lt > 1.8 && (
        <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 22, opacity: clamp(cardP, 0, 1) }}>
          <div style={{ position: 'relative', transform: `perspective(1500px) rotateY(${tilt}deg) scale(${0.92 + 0.08 * Math.min(cardP, 1)})`, marginTop: -30 }}>
            <img data-seq src="assets/legend-106-portrait.png" alt="" style={{ height: 630, display: 'block', borderRadius: 16, boxShadow: '0 50px 130px rgba(0,0,0,0.85), 0 0 80px rgba(233,198,90,0.55)' }} />
            <div style={{ position: 'absolute', top: 0, bottom: 0, left: `${sheenX}%`, width: '22%', background: 'linear-gradient(105deg, transparent, rgba(255,240,200,0.34), transparent)', transform: 'skewX(-18deg)', borderRadius: 16, pointerEvents: 'none', zIndex: 6 }} />
            <div style={{ position: 'absolute', top: 16, left: '50%', transform: 'translateX(-50%)', background: 'rgba(233,198,90,0.95)', color: '#2a1608', fontFamily: SANS, fontWeight: 900, fontSize: 17, letterSpacing: '0.14em', padding: '5px 16px', borderRadius: 8, boxShadow: '0 6px 20px rgba(0,0,0,0.5)' }}>Nº 106 · ✦✦✦ ULTRA RARE</div>
            {unlockP > 0 && <div style={{ position: 'absolute', bottom: 20, left: '50%', transform: `translateX(-50%) scale(${unlockP})`, background: 'linear-gradient(90deg,#b8892b,#e9c65a,#b8892b)', color: '#1a1206', fontFamily: SANS, fontWeight: 900, fontSize: 22, letterSpacing: '0.2em', padding: '8px 26px', borderRadius: 8, boxShadow: '0 8px 26px rgba(0,0,0,0.6)' }}>LEGEND UNLOCKED</div>}
          </div>
        </div>
      )}
      <div style={{ position: 'absolute', left: 0, right: 0, bottom: 46, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 14, zIndex: 24 }}>
        <div style={{ textAlign: 'center', opacity: txtP, transform: `translateY(${(1 - txtP) * 16}px)` }}>
          <div style={{ fontFamily: SANS, fontWeight: 900, fontSize: 40, color: GOLD, letterSpacing: '0.04em', textShadow: '0 2px 24px rgba(233,198,90,0.5)' }}>SANT JORDI · THE DRAGON-SLAYER</div>
          <div style={{ fontFamily: SANS, fontWeight: 700, fontSize: 19, color: '#f0dcb8', letterSpacing: '0.18em', marginTop: 6 }}>SPAIN · LEGEND 106</div>
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
  const filled = ['legend-098-portrait', 'legend-099-portrait', 'legend-100-portrait', 'legend-105-portrait'];
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
              {snapped && <img data-seq alt="" src="assets/legend-106-portrait.png" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />}
              {flash > 0 && <div style={{ position: 'absolute', inset: 0, background: GOLD, opacity: flash * 0.6 }} />}
            </div>
            <div style={{ height: 104, borderRadius: 6, border: '1px dashed rgba(255,255,255,0.14)' }} />
          </div>
          {snapped && local < 4.6 && <div style={{ position: 'absolute', left: 0, right: 0, bottom: 30, textAlign: 'center', fontFamily: SANS, fontWeight: 900, fontSize: 16, color: GOLD, letterSpacing: '0.16em', opacity: clamp(1 - (local - 3.6), 0, 1) }}>COLLECTED!</div>}
        </div>
      </div>
      {!snapped && local > 0.4 && (
        <div style={{ position: 'absolute', left: '50%', top: '50%', transform: `translate(-50%,-50%) translate(${cardX}px, ${cardY}px) scale(${cardS})`, width: 200, height: 356, borderRadius: 12, overflow: 'hidden', border: `2px solid ${GOLD}`, boxShadow: `0 30px 80px rgba(0,0,0,0.7), 0 0 40px ${GOLD}88`, zIndex: 30 }}>
          <img data-seq alt="" src="assets/legend-106-portrait.png" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
        </div>
      )}
    </div>
  );
}

// ── APP 303–324.5 ─────────────────────────────────────────────────────────────────
function SceneApp() {
  const t = useTime();
  const p = Easing.easeOutCubic(clamp((t - 303) / 1.0, 0, 1));
  return (
    <div style={{ position: 'absolute', inset: 0 }}>
      <NightField o={0.9} />
      <FS id="gold-dust-j" dim={0.32} /><FS id="destiny-rays-j" dim={0.4} /><FS id="light-rays-gold-h" dim={0.4} /><FS id="embers-h" dim={0.4} /><FS id="gold-dust-k" dim={0.4} />
      <div style={{ position: 'absolute', inset: 0, background: 'rgba(7,11,24,0.26)' }} />
      <AmbientParticles start={303} dur={21} count={24} color="233,198,90" />
      <div style={{ position: 'absolute', top: 84, left: 0, right: 0, textAlign: 'center', zIndex: 25, opacity: Easing.easeOutCubic(clamp((t - 303) / 0.6, 0, 1)) }}>
        <Kicker size={30} color={GOLD}>Claim Your Legend</Kicker>
        <div style={{ marginTop: 10, fontFamily: SANS, fontWeight: 900, fontSize: 56, color: '#fff', letterSpacing: '0.04em' }}>worldcup26.world</div>
      </div>
      <PhoneCollect start={303.8} />
      <div style={{ position: 'absolute', bottom: 62, left: 0, right: 0, textAlign: 'center', zIndex: 25, opacity: p, fontFamily: SANS, fontWeight: 700, fontSize: 22, color: MV.muted, letterSpacing: '0.14em' }}>FREE · PICK 3 NATIONS · EVERY GOAL SCORES · NO PRIZES</div>
    </div>
  );
}

// ── CTA 324.5–336 ─────────────────────────────────────────────────────────────────
function SceneCTA() {
  const t = useTime();
  const p = Easing.easeOutCubic(clamp((t - 324.5) / 1.0, 0, 1));
  return (
    <div style={{ position: 'absolute', inset: 0 }}>
      <NightField o={0.7} />
      <FS id="light-rays-gold-i" dim={0.5} /><FS id="destiny-rays-k" dim={0.55} /><FS id="gold-dust-l" dim={0.55} />
      <Confetti start={324.5} dur={12} count={90} />
      <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg, rgba(5,7,14,0.45) 0%, rgba(5,7,14,0.30) 45%, rgba(5,7,14,0.72) 100%)' }} />
      <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 26, zIndex: 25, opacity: p }}>
        <Kicker size={30} color={GOLD}>WorldCup26 Legends · The Grand Finale</Kicker>
        <div style={{ fontFamily: SANS, fontWeight: 900, fontSize: 64, color: '#fff', letterSpacing: '0.03em', textAlign: 'center', textShadow: '0 6px 30px rgba(0,0,0,0.85)' }}>LIKE · SUBSCRIBE</div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
          <FlagESP w={58} />
          <div style={{ fontFamily: SANS, fontWeight: 900, fontSize: 34, color: GOLD, letterSpacing: '0.2em' }}>worldcup26.world</div>
          <FlagARG w={58} />
        </div>
      </div>
      <Vignette strength={0.4} />
    </div>
  );
}
