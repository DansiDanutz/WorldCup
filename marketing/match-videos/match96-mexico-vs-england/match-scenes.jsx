// match-scenes.jsx — Ep96 Mexico vs England (Play-Offs) — PHOTOREAL + NO-REPEAT/NO-LOOP.
// "THE FEATHERED SERPENT AND THE THREE LIONS". OUR PREDICTION England 2-1 Mexico (Mexico strike
// first in a raucous home-crowd moment; Kane equalise; Bellingham late winner). Mystic (#21):
// MEXICO = El Tri, heirs of Quetzalcoatl, the feathered serpent god -> Legend 096 = Quetzalcoatl,
// the Feathered Serpent; ENGLAND = the Three Lions of the crown. Both squads REUSED from prior
// episodes (Mexico Ep83, England Ep84, Rule #26) with a likeness-audit correction: Giménez
// re-animated FRESH from a corrected still (green kit, clean #9, no broadcast-graphic overlay);
// Lozano/Álvarez/Vega/Montes/Saka re-generated with explicit number prompts; Kane/
// Bellingham/Rice reused as-is (audited correct). #23 name<->image SYNC (measured VO onsets).
// SQUAD-ACCURACY CORRECTION: Phil Foden was REMOVED entirely (no longer in the England squad —
// same class of fix as Ep94's Griezmann removal). England now has only 4 named showcases
// (Kane/Bellingham/Saka/Rice); Rice's showcase moved up into Foden's old slot and a generic
// unnamed "THE THREE LIONS STAND FIRM" beat (no clip, no name) fills the remaining time instead
// of inventing a 5th player.

const MX_GREEN = '#1f7a4d', MX_WHITE = '#f3f4f7', MX_RED = '#ce1126';
const ENG_WHITE = '#f3f4f7', ENG_NAVY = '#27348b', ENG_RED = '#ce1124';
const ACC = '#e0a226';           // serpent-gold accent
const GRADE = { filter: 'saturate(1.06) contrast(1.04)' };

function FlagMX({ w = 120 }) {
  const h = w * 2 / 3;
  return (
    <div style={{ width: w, height: h, borderRadius: w * 0.05, overflow: 'hidden', display: 'flex', boxShadow: '0 6px 18px rgba(0,0,0,0.45)' }}>
      <div style={{ flex: 1, background: '#006847' }} />
      <div style={{ flex: 1, background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><div style={{ width: h * 0.34, height: h * 0.34, borderRadius: '50%', background: '#7a5230', opacity: 0.85 }} /></div>
      <div style={{ flex: 1, background: '#ce1126' }} />
    </div>
  );
}
function FlagENG({ w = 120 }) {
  const h = w * 2 / 3;
  return (
    <div style={{ width: w, height: h, borderRadius: w * 0.05, position: 'relative', overflow: 'hidden', background: '#fff', boxShadow: '0 6px 18px rgba(0,0,0,0.45)' }}>
      <div style={{ position: 'absolute', top: '40%', left: 0, right: 0, height: '20%', background: '#ce1124' }} />
      <div style={{ position: 'absolute', left: '40%', top: 0, bottom: 0, width: '20%', background: '#ce1124' }} />
    </div>
  );
}

function FS({ id, style }) { return <ClipSprite id={id} fit="cover" style={{ ...GRADE, ...(style || {}) }} />; }
// Quetzalcoatl card art (slow Ken-Burns) — Mexico's cold-open symbol.
function GoldStill({ start = 0, dur = 5 }) {
  const { localTime: lt } = useSprite();
  const p = clamp((lt - start) / dur, 0, 1);
  if (lt < start || lt > start + dur) return null;
  const scale = 1.06 + 0.12 * p;
  const fade = lt < start + 0.4 ? clamp((lt - start) / 0.4, 0, 1) : (lt > start + dur - 0.5 ? clamp((start + dur - lt) / 0.5, 0, 1) : 1);
  return (
    <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', opacity: fade, zIndex: 1 }}>
      <img data-seq src="assets/legend-096-landscape.png" alt="" style={{ position: 'absolute', left: '50%', top: '50%', width: '108%', transform: `translate(-50%,-50%) scale(${scale})`, filter: 'saturate(1.05) contrast(1.03)' }} />
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

function ScoreBug({ start, mex = 1, eng = 1, note = "88'", badge = 'OUR PREDICTION' }) {
  const t = useTime(); const local = t - start; if (local < 0) return null;
  const inP = Easing.easeOutBack(clamp(local / 0.7, 0, 1));
  const cell = { fontFamily: '"Inter",sans-serif', fontWeight: 900, fontSize: 34, color: '#fff', padding: '10px 18px' };
  return (
    <div style={{ position: 'absolute', top: 92, left: '50%', zIndex: 30, transform: `translateX(-50%) scale(${inP})`, opacity: clamp(inP, 0, 1), display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
      <div style={{ display: 'flex', alignItems: 'center', background: MV.panel, border: `1px solid ${MV.line}`, borderRadius: 14, boxShadow: '0 10px 36px rgba(0,0,0,0.6)', overflow: 'hidden' }}>
        <div style={{ ...cell, background: MX_GREEN }}>MEX</div>
        <div style={{ ...cell, fontSize: 38, color: ACC }}>{mex} — {eng}</div>
        <div style={{ ...cell, background: ENG_NAVY }}>ENG</div>
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
  const titleP = Easing.easeOutCubic(clamp((lt - 19.2) / 1.4, 0, 1));
  return (
    <div style={{ position: 'absolute', inset: 0 }}>
      {lt >= 19.4 && <NightField o={0.9} />}
      <GoldStill start={0} dur={5} />
      <FS id="mx-quetzal" /><FS id="eng-lions" /><FS id="texture-mexico" />
      <div style={{ position: 'absolute', inset: 0, background: `radial-gradient(ellipse at center, rgba(224,162,38,${(0.20 * beat).toFixed(3)}) 0%, transparent 60%)` }} />
      <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg, rgba(2,3,8,0.34) 0%, transparent 30%, transparent 56%, rgba(2,3,8,0.76) 100%)' }} />
      {teaseP > 0.01 && (
        <div style={{ position: 'absolute', left: 0, right: 0, bottom: 150, textAlign: 'center', zIndex: 23, opacity: teaseP }}>
          <div style={{ display: 'inline-block', fontFamily: '"Inter",sans-serif', fontWeight: 800, fontSize: 30, color: '#f0dca6', letterSpacing: '0.22em', textShadow: '0 2px 18px rgba(0,0,0,0.85)' }}>THE FEATHERED SERPENT MEETS THE THREE LIONS.</div>
        </div>
      )}
      {lt > 19.2 && (
        <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 26, opacity: titleP, zIndex: 22 }}>
          <Kicker size={32} color={ACC}>The Feathered Serpent and The Three Lions</Kicker>
          <TitleReveal text="QUETZALCOATL" start={20.0} size={72} color={ACC} />
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
        <div style={{ opacity: p1, transform: `translateY(${(1 - p1) * -30}px)` }}><Kicker>WorldCup26 Legends · Episode 96 · Play-Offs</Kicker></div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 52, opacity: clamp(p2, 0, 1), transform: `scale(${p2})` }}>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 18 }}><Waving><FlagMX w={210} /></Waving><BigTitle size={70} glow={MX_GREEN}>MEXICO</BigTitle></div>
          <BigTitle size={104} color={ACC}>VS</BigTitle>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 18 }}><Waving speed={1.9}><FlagENG w={210} /></Waving><BigTitle size={64} glow={ENG_RED}>ENGLAND</BigTitle></div>
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
          {[['EL TRI', 'MEXICO'], ['THE THREE LIONS', 'ENGLAND'], ['THE SERPENT', 'vs THE LIONS'], ['PLAY-OFFS', 'WIN OR GO HOME']].map(([v, l], i) => (
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

function SceneMexico() {
  return (
    <div style={{ position: 'absolute', inset: 0 }}>
      <NightField o={0.5} />
      <Sprite start={44} end={49}><div style={{ position: 'absolute', inset: 0 }}><FS id="mx-crowd" /><div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg, rgba(2,3,8,0.30) 0%, transparent 40%, rgba(2,3,8,0.55) 100%)' }} /><TeamBanner flag={<FlagMX w={64} />} label="EL TRI · MEXICO" accent={MX_GREEN} /></div></Sprite>
      <Sprite start={49} end={54}><div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse at 50% 45%, #0d1018 0%, #05060c 70%)' }} /></Sprite>
      <Sprite start={54} end={55.5}><div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(90deg, rgba(31,122,77,0.18), #05060c 65%)' }} /></Sprite>
      <PlayerShowcase clipId="mx-gimenez" name="SANTIAGO GIMÉNEZ" role="THE FINISHER · 9" accent={MX_GREEN} start={55.5} end={60.3} />
      <PlayerShowcase clipId="mx-lozano" name="HIRVING LOZANO" role="CHUCKY · THE SPARK · 22" accent={MX_RED} start={60.3} end={65.1} />
      <PlayerShowcase clipId="mx-alvarez" name="EDSON ÁLVAREZ" role="CAPTAIN · THE ENGINE · 4" accent={MX_WHITE} start={65.1} end={69.9} />
      <PlayerShowcase clipId="mx-vega" name="ALEXIS VEGA" role="THE KEY · 10" accent={MX_GREEN} start={69.9} end={74.7} />
      <PlayerShowcase clipId="mx-montes" name="CÉSAR MONTES" role="THE TOWER · 3" accent={MX_RED} start={74.7} end={79.5} />
    </div>
  );
}

function SceneEngland() {
  return (
    <div style={{ position: 'absolute', inset: 0 }}>
      <NightField o={0.5} />
      <Sprite start={79.5} end={84.5}><div style={{ position: 'absolute', inset: 0 }}><FS id="eng-crowd" /><div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg, rgba(2,3,8,0.30) 0%, transparent 40%, rgba(2,3,8,0.55) 100%)' }} /><TeamBanner flag={<FlagENG w={64} />} label="THE THREE LIONS · ENGLAND" accent={ENG_RED} /></div></Sprite>
      <Sprite start={84.5} end={90.6}><div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(120deg, rgba(206,17,36,0.16), #05060c 65%)' }} /></Sprite>
      <PlayerShowcase clipId="eng-kane" name="HARRY KANE" role="CAPTAIN · THE FINISHER · 9" accent={ENG_NAVY} start={90.6} end={95.08} />
      <PlayerShowcase clipId="eng-bellingham" name="JUDE BELLINGHAM" role="THE BIG-GAME KING · 10" accent={ENG_RED} start={95.08} end={99.56} />
      <PlayerShowcase clipId="eng-saka" name="BUKAYO SAKA" role="THE STAR BOY · 7" accent={ENG_NAVY} start={99.56} end={104.04} />
      <PlayerShowcase clipId="eng-rice" name="DECLAN RICE" role="THE ENGINE · 4" accent={ENG_NAVY} start={104.04} end={108.52} />
      {/* DO NOT RE-ADD Foden — squad-accuracy correction, he is no longer in the England squad */}
      <Sprite start={108.52} end={113.0}><div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(120deg, rgba(206,17,36,0.14), #05060c 70%)' }} /><TeamBanner flag={<FlagENG w={56} />} label="THE THREE LIONS STAND FIRM" accent={ENG_NAVY} /></Sprite>
    </div>
  );
}

function SceneRiddle() {
  return (
    <div style={{ position: 'absolute', inset: 0 }}>
      <NightField o={0.5} />
      <Sprite start={113} end={118}><div style={{ position: 'absolute', inset: 0 }}><FS id="stadium-aerial" /><div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.24)' }} /><div style={{ position: 'absolute', left: 0, right: 0, bottom: 70, textAlign: 'center', fontFamily: '"Inter",sans-serif', fontWeight: 900, fontSize: 54, color: '#fff', textShadow: '0 4px 26px rgba(0,0,0,0.9)' }}>THE SERPENT vs THE THREE LIONS</div></div></Sprite>
      <Sprite start={118} end={123}><div style={{ position: 'absolute', inset: 0 }}><FS id="texture-england" /><div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse at 50% 50%, transparent 35%, rgba(2,3,8,0.6) 100%)' }} /></div></Sprite>
      <Sprite start={123} end={132}><BeatCard start={123} end={132} text={<>DOES THE SERPENT STRIKE DOWN THE LIONS,<br />OR DO THEY ROAR LOUDER THAN THE CROWD?</>} accent={ACC} big={50} /></Sprite>
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
        <div style={{ position: 'absolute', inset: 0, background: `linear-gradient(105deg, ${MX_GREEN}33 0%, #070b14 38%, #070b14 62%, ${ENG_NAVY}55 100%)` }} />
        <div style={{ position: 'absolute', top: 0, bottom: 0, left: `${sheenX}%`, width: '22%', background: 'linear-gradient(105deg, transparent, rgba(255,255,255,0.10), transparent)', transform: 'skewX(-18deg)', pointerEvents: 'none', zIndex: 5 }} />
        <div style={{ position: 'relative', zIndex: 2, background: `linear-gradient(100deg, ${MX_GREEN} 0%, ${ACC} 50%, ${ENG_NAVY} 100%)`, padding: '13px 0', textAlign: 'center' }}>
          <span style={{ fontFamily: '"Inter",sans-serif', fontWeight: 900, fontSize: 17, letterSpacing: '0.26em', color: '#06121a' }}>WORLDCUP26 LEGENDS · OUR PREDICTION · NOT PLAYED</span>
        </div>
        <div style={{ position: 'relative', zIndex: 2, padding: '36px 70px 28px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 46 }}>
            <Badge flag={<FlagMX w={104} />} name="MEXICO" accent={MX_GREEN} />
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, fontFamily: '"Inter",sans-serif', fontWeight: 900, fontSize: 116, color: '#fff', lineHeight: 1 }}>
                <span style={{ textShadow: `0 0 36px ${MX_GREEN}cc` }}>1</span>
                <span style={{ color: ACC, fontSize: 58, transform: 'translateY(-6px)' }}>—</span>
                <span style={{ textShadow: `0 0 36px ${ENG_NAVY}cc` }}>2</span>
              </div>
              <div style={{ fontFamily: '"Inter",sans-serif', fontWeight: 800, fontSize: 16, color: MV.muted, letterSpacing: '0.30em', marginTop: 4 }}>FULL-TIME</div>
            </div>
            <Badge flag={<FlagENG w={104} />} name="ENGLAND" accent={ENG_NAVY} />
          </div>
          <div style={{ textAlign: 'center', marginTop: 16, fontFamily: '"Inter",sans-serif', fontWeight: 900, fontSize: 32, color: ACC, letterSpacing: '0.05em', textShadow: `0 0 26px ${ACC}66` }}>THE THREE LIONS SURVIVE · 2–1</div>
          <div style={{ display: 'flex', justifyContent: 'center', gap: 12, marginTop: 16, paddingTop: 18, borderTop: '1px solid rgba(255,255,255,0.12)' }}>
            <span style={{ fontFamily: '"Inter",sans-serif', fontWeight: 800, fontSize: 21, color: '#f3e6c4', background: 'rgba(224,162,38,0.16)', border: '1px solid rgba(224,162,38,0.45)', borderRadius: 999, padding: '7px 18px' }}>🦁 BELLINGHAM — THE LATE WINNER</span>
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
      <Sprite start={132} end={138}><BeatCard start={132} end={138} text={<>MEXICO COME<br />OUT FLYING</>} accent={MX_GREEN} big={62} /></Sprite>
      <Sprite start={138} end={148.21}><div style={{ position: 'absolute', inset: 0 }}><FS id="mx-attack" /><ChanceTag start={143} end={148.21} text="EL TRI SURGE!" sub="THE STADIUM RISES" accent={MX_GREEN} /></div></Sprite>
      <Sprite start={148.21} end={160}><div style={{ position: 'absolute', inset: 0 }}><FS id="mx-goal" /><GoalFlash at={148.7} /><ChanceTag start={149.2} end={155} text="MEXICO LEAD!" sub="THE SERPENT BITES FIRST" accent={MX_GREEN} /></div></Sprite>
      <Sprite start={160} end={170}><BeatCard clipId="eng-attack" start={160} end={170} text={<>KANE GOES<br />HUNTING</>} sub="ENGLAND NEED AN ANSWER" accent={ACC} big={60} /></Sprite>
      <Sprite start={170} end={182}><div style={{ position: 'absolute', inset: 0 }}><FS id="eng-goal-1" /><GoalFlash at={170.5} /><ChanceTag start={171} end={177} text="KANE — ONE-ONE!" sub="ICE IN HIS VEINS" accent={ENG_NAVY} /></div></Sprite>
      <Sprite start={182} end={192}><BeatCard clipId="eng-surge" start={182} end={192} text={<>THE BIG-GAME KING<br />DRIVES IN</>} accent="#fff" big={58} /></Sprite>
      <Sprite start={192} end={203.32}><div style={{ position: 'absolute', inset: 0 }}><FS id="eng-goal-2" /><GoalFlash at={192.4} /><ChanceTag start={192.9} end={197.5} text="BELLINGHAM — 2-1 ENGLAND!" sub="THE THREE LIONS STAND" accent={ACC} /><ScoreBug start={197.6} mex={1} eng={2} note="BELLINGHAM 88'" badge="OUR PREDICTION" /><PredictionCard start={198.1} /></div></Sprite>
      <Vignette strength={0.32} />
    </div>
  );
}

function SceneVerdict() {
  const t = useTime();
  const panelP = Easing.easeOutCubic(clamp((t - 225.0) / 1.0, 0, 1));
  return (
    <div style={{ position: 'absolute', inset: 0 }}>
      <Sprite start={203.32} end={213.4}><div style={{ position: 'absolute', inset: 0 }}><FS id="vd-handshake" /><div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg, rgba(2,3,8,0.25) 0%, transparent 45%, rgba(2,3,8,0.55) 100%)' }} /><div style={{ position: 'absolute', left: 0, right: 0, top: 120, textAlign: 'center', zIndex: 24 }}><Kicker size={28} color={ACC}>The Three Lions Survive</Kicker></div></div></Sprite>
      <Sprite start={213.4} end={219}><BeatCard start={213.4} end={219} text={<>MEXICO LEAVE WITH<br />THEIR HEADS HIGH</>} sub="EL TRI MADE THEM SWEAT" accent="#fff" big={54} /></Sprite>
      <Sprite start={219} end={225}><BeatCard start={219} end={225} text={<>ENGLAND<br />MARCH ON</>} sub="THE THREE LIONS ROAR ON" accent={ACC} big={58} /></Sprite>
      <Sprite start={225} end={244}>
        <div style={{ position: 'absolute', inset: 0 }}>
          <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse at 50% 45%, #0d1018 0%, #05060c 70%)' }} />
          <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg, rgba(2,3,8,0.66) 0%, rgba(2,3,8,0.52) 50%, rgba(2,3,8,0.78) 100%)' }} />
          <AmbientParticles start={225} dur={19} count={26} color="224,162,38" />
          <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 25 }}>
            <div style={{ background: MV.panel, border: `1px solid ${MV.line}`, borderRadius: 24, padding: '48px 80px', minWidth: 900, backdropFilter: 'blur(6px)', opacity: panelP, transform: `translateY(${(1 - panelP) * 24}px)` }}>
              <Kicker size={26}>Our Prediction</Kicker>
              <div style={{ marginTop: 24 }}>
                <StatLine start={225.5} delay={0.0} label="MEXICO" value="EL TRI" accent={MX_GREEN} />
                <StatLine start={225.5} delay={0.25} label="ENGLAND" value="THE THREE LIONS" accent={ENG_NAVY} />
                <StatLine start={225.5} delay={0.5} label="OUR PREDICTION" value="MEX 1 — 2 ENG" accent="#fff" />
                <StatLine start={225.5} delay={0.75} label="88' BELLINGHAM" value="THE LATE WINNER" accent={ACC} />
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
    { label: 'COMMENT MEXICO', sub: 'EL TRI', flag: <FlagMX w={76} />, accent: MX_GREEN },
    { label: 'COMMENT ENGLAND', sub: 'THE THREE LIONS', flag: <FlagENG w={76} />, accent: ENG_RED },
  ];
  return (
    <div style={{ position: 'absolute', inset: 0 }}>
      <NightField o={0.5} />
      <AmbientParticles start={244} dur={11} count={30} color="224,162,38" />
      <div style={{ position: 'absolute', inset: 0, background: 'rgba(6,10,18,0.58)' }} />
      <div style={{ position: 'absolute', top: 140, left: 0, right: 0, textAlign: 'center', zIndex: 25, opacity: headP }}><Kicker size={30}>The Feathered Serpent, Or The Three Lions?</Kicker></div>
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
  const prev = ['legend-091-portrait', 'legend-092-portrait', 'legend-093-portrait', 'legend-094-portrait', 'legend-095-portrait'];
  return (
    <div style={{ display: 'flex', alignItems: 'flex-end', gap: 12 }}>
      {prev.map((id) => (
        <div key={id} style={{ width: 64, height: 86, borderRadius: 8, overflow: 'hidden', border: '1px solid rgba(255,255,255,0.22)', boxShadow: '0 8px 20px rgba(0,0,0,0.5)', opacity: 0.82 }}>
          <img data-seq alt="" src={`assets/${id}.png`} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
        </div>
      ))}
      <div style={{ width: 78, height: 104, borderRadius: 9, overflow: 'hidden', border: `2px solid ${ACC}`, boxShadow: `0 10px 28px rgba(0,0,0,0.6), 0 0 26px ${ACC}66` }}>
        <img data-seq alt="" src="assets/legend-096-portrait.png" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
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
          <div style={{ display: 'inline-block', fontFamily: '"Inter",sans-serif', fontWeight: 800, fontSize: 30, color: '#f3e0b8', letterSpacing: '0.24em', textShadow: '0 2px 18px rgba(0,0,0,0.7)' }}>THE FEATHERED SERPENT</div>
        </div>
      )}
      {lt > 1.6 && (
        <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 22, opacity: clamp(cardP, 0, 1) }}>
          <div style={{ position: 'relative', transform: `perspective(1500px) rotateY(${tilt}deg) scale(${0.92 + 0.08 * Math.min(cardP, 1)})`, marginTop: -34 }}>
            <img data-seq src="assets/legend-096-portrait.png" alt="" style={{ height: 640, display: 'block', borderRadius: 16, boxShadow: '0 50px 130px rgba(0,0,0,0.85), 0 0 80px rgba(224,162,38,0.5)' }} />
            <div style={{ position: 'absolute', top: 0, bottom: 0, left: `${sheenX}%`, width: '22%', background: 'linear-gradient(105deg, transparent, rgba(255,235,190,0.30), transparent)', transform: 'skewX(-18deg)', borderRadius: 16, pointerEvents: 'none', zIndex: 6 }} />
            <div style={{ position: 'absolute', top: 18, left: '50%', transform: 'translateX(-50%)', background: 'rgba(224,162,38,0.95)', color: '#1a1306', fontFamily: '"Inter",sans-serif', fontWeight: 900, fontSize: 17, letterSpacing: '0.14em', padding: '5px 16px', borderRadius: 8, boxShadow: '0 6px 20px rgba(0,0,0,0.5)' }}>Nº 096 · ✦✦✦ ULTRA RARE</div>
          </div>
        </div>
      )}
      <div style={{ position: 'absolute', left: 0, right: 0, bottom: 56, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16, zIndex: 24 }}>
        <div style={{ textAlign: 'center', opacity: txtP, transform: `translateY(${(1 - txtP) * 16}px)` }}>
          <div style={{ fontFamily: '"Inter",sans-serif', fontWeight: 900, fontSize: 44, color: ACC, letterSpacing: '0.03em', textShadow: '0 2px 24px rgba(224,162,38,0.5)' }}>QUETZALCOATL · THE FEATHERED SERPENT</div>
          <div style={{ fontFamily: '"Inter",sans-serif', fontWeight: 700, fontSize: 19, color: '#ecd9b0', letterSpacing: '0.18em', marginTop: 6 }}>MEXICO · LEGEND 096</div>
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
  const filled = ['legend-092-portrait', 'legend-093-portrait', 'legend-094-portrait', 'legend-095-portrait'];
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
              {snapped && <img data-seq alt="" src="assets/legend-096-portrait.png" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />}
              {flash > 0 && <div style={{ position: 'absolute', inset: 0, background: ACC, opacity: flash * 0.6 }} />}
            </div>
            <div style={{ height: 104, borderRadius: 6, border: '1px dashed rgba(255,255,255,0.14)' }} />
          </div>
          {snapped && local < 4.4 && <div style={{ position: 'absolute', left: 0, right: 0, bottom: 30, textAlign: 'center', fontFamily: '"Inter",sans-serif', fontWeight: 900, fontSize: 16, color: ACC, letterSpacing: '0.16em', opacity: clamp(1 - (local - 3.6), 0, 1) }}>COLLECTED!</div>}
        </div>
      </div>
      {!snapped && local > 0.4 && (
        <div style={{ position: 'absolute', left: '50%', top: '50%', transform: `translate(-50%,-50%) translate(${cardX}px, ${cardY}px) scale(${cardS})`, width: 200, height: 267, borderRadius: 12, overflow: 'hidden', border: `2px solid ${ACC}`, boxShadow: `0 30px 80px rgba(0,0,0,0.7), 0 0 40px ${ACC}88`, zIndex: 30 }}>
          <img data-seq alt="" src="assets/legend-096-portrait.png" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
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
        <Kicker size={30} color={ACC}>WorldCup26 Legends</Kicker>
        <div style={{ fontFamily: '"Inter",sans-serif', fontWeight: 900, fontSize: 64, color: '#fff', letterSpacing: '0.03em', textAlign: 'center', textShadow: '0 6px 30px rgba(0,0,0,0.85)' }}>LIKE · SUBSCRIBE</div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
          <FlagMX w={62} />
          <div style={{ fontFamily: '"Inter",sans-serif', fontWeight: 900, fontSize: 34, color: ACC, letterSpacing: '0.2em' }}>worldcup26.world</div>
          <FlagENG w={62} />
        </div>
      </div>
      <Vignette strength={0.4} />
    </div>
  );
}
