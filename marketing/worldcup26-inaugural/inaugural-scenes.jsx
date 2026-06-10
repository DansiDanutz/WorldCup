// inaugural-scenes.jsx — WorldCup26 "The Inaugural Match" 3-minute story film.
// Mexico vs South Africa · Estadio Azteca · June 11, 2026.
// Dark, cinematic, mystery-documentary look. Loads after wc-kit.jsx.

const T = window.WC_TEAMS_BY_ID;
const ease = Easing;

// ── Dark theme tokens ────────────────────────────────────────────────────────
const DK = {
  bg: '#031b13',
  panel: 'rgba(6, 34, 25, 0.78)',
  panelBorder: 'rgba(255, 226, 154, 0.16)',
  text: '#f5f2e8',
  muted: 'rgba(245, 242, 232, 0.62)',
  gold: '#ffcf66',
  goldDeep: '#c9942e',
  green: '#35c391',
  greenDeep: '#106b4f',
  red: '#e2654f',
  shadow: '0 24px 70px rgba(0, 0, 0, 0.55)',
};

// ── Cinematic backdrop: night-stadium glow, drifting floodlights, vignette ──
function NightBackdrop() {
  const time = useTime();
  const gx = 28 + Math.sin(time * 0.16) * 16;
  const gy = 74 + Math.cos(time * 0.12) * 8;
  const beam = 50 + Math.sin(time * 0.07) * 26;
  return (
    <div style={{ position: 'absolute', inset: 0, background: DK.bg, overflow: 'hidden' }}>
      <div style={{
        position: 'absolute', inset: 0,
        background: `
          radial-gradient(1100px 700px at ${gx}% ${gy}%, rgba(43, 151, 108, 0.20), transparent 62%),
          radial-gradient(900px 560px at ${100 - gx}% 18%, rgba(255, 207, 102, 0.10), transparent 58%),
          linear-gradient(180deg, #02130d 0%, #04241a 52%, #02130d 100%)`,
      }} />
      {/* floodlight beam sweeping slowly */}
      <div style={{
        position: 'absolute', inset: 0, opacity: 0.16,
        background: `conic-gradient(from 200deg at ${beam}% -12%, transparent 0deg, rgba(255,236,190,0.55) 7deg, transparent 16deg)`,
      }} />
      {/* pitch line glow at the bottom */}
      <div style={{
        position: 'absolute', left: 0, right: 0, bottom: 0, height: 220,
        background: 'linear-gradient(180deg, transparent, rgba(16,107,79,0.30))',
      }} />
      {/* vignette */}
      <div style={{
        position: 'absolute', inset: 0,
        background: 'radial-gradient(1500px 900px at 50% 46%, transparent 55%, rgba(0,0,0,0.42) 100%)',
      }} />
    </div>
  );
}

// ── Scene wrapper (fade/slide on local time) ─────────────────────────────────
function SceneWrap({ children, entry = 0.6, exit = 0.55 }) {
  const { localTime, duration } = useSprite();
  let op = 1, ty = 0;
  if (localTime < entry) {
    const t = ease.easeOutCubic(clamp(localTime / entry, 0, 1));
    op = t; ty = (1 - t) * 26;
  } else if (localTime > duration - exit) {
    const t = ease.easeInCubic(clamp((localTime - (duration - exit)) / exit, 0, 1));
    op = 1 - t; ty = -t * 16;
  }
  return (
    <div style={{ position: 'absolute', inset: 0, opacity: op, transform: `translateY(${ty}px)` }}>
      {children}
    </div>
  );
}

function rev(localTime, at, dur = 0.55, dist = 20) {
  const t = ease.easeOutCubic(clamp((localTime - at) / dur, 0, 1));
  return { opacity: t, transform: `translateY(${(1 - t) * dist}px)` };
}

function LCount({ from, to, start, end, fmt = (v) => v.toFixed(0), easeFn = ease.easeOutCubic }) {
  const { localTime } = useSprite();
  const v = animate({ from, to, start, end, ease: easeFn })(localTime);
  return <React.Fragment>{fmt(v)}</React.Fragment>;
}

// Gold uppercase kicker on dark
function DkEyebrow({ children, color = DK.gold, size = 17 }) {
  return (
    <div style={{
      fontFamily: SANS, fontWeight: 850, fontSize: size,
      letterSpacing: '0.22em', textTransform: 'uppercase', color,
    }}>{children}</div>
  );
}

// Dark glass panel
function DkPanel({ children, style, pad = 26 }) {
  return (
    <div style={{
      background: DK.panel,
      border: `1px solid ${DK.panelBorder}`,
      borderRadius: 12,
      boxShadow: DK.shadow,
      backdropFilter: 'blur(2px)',
      padding: pad,
      ...style,
    }}>{children}</div>
  );
}

// Player portrait card (Pixar-style character PNGs from /assets)
function PlayerCard({ src, name, sub, w = 268, h = 332, accent = DK.green }) {
  return (
    <div style={{
      width: w, borderRadius: 12, overflow: 'hidden',
      border: `1px solid ${DK.panelBorder}`,
      background: 'rgba(4,22,16,0.9)', boxShadow: DK.shadow,
    }}>
      <div style={{ width: '100%', height: h - 86, overflow: 'hidden', position: 'relative' }}>
        <img src={src} alt="" draggable="false"
          style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'top', display: 'block' }} />
        <div style={{
          position: 'absolute', inset: 0,
          background: 'linear-gradient(180deg, transparent 64%, rgba(3,20,14,0.92) 100%)',
        }} />
      </div>
      <div style={{ padding: '12px 16px 14px', borderTop: `2px solid ${accent}` }}>
        <div style={{ fontFamily: SANS, fontWeight: 820, fontSize: 21, color: DK.text, letterSpacing: '-0.01em', whiteSpace: 'nowrap' }}>{name}</div>
        <div style={{ fontFamily: SANS, fontWeight: 650, fontSize: 14, color: DK.muted, marginTop: 2, whiteSpace: 'nowrap' }}>{sub}</div>
      </div>
    </div>
  );
}

// Drifting mist band (for the mystery scenes)
function Mist({ y, height = 240, speed = 18, opacity = 0.2 }) {
  const time = useTime();
  const off = (time * speed) % 1920;
  const blob = 'radial-gradient(420px 130px at 50% 50%, rgba(220,236,228,0.55), transparent 70%)';
  return (
    <div style={{ position: 'absolute', left: 0, top: y, width: '100%', height, opacity, pointerEvents: 'none' }}>
      {[0, 1, 2, 3].map((i) => (
        <div key={i} style={{
          position: 'absolute', width: 840, height,
          left: ((i * 700 - off) % 2760) - 840,
          background: blob, filter: 'blur(6px)',
        }} />
      ))}
    </div>
  );
}

// =============================================================================
// SCENE 1 — THE STADIUM OF GHOSTS (0 – 17.5)
// =============================================================================
function SceneGhosts() {
  const { localTime } = useSprite();
  return (
    <SceneWrap exit={0.6}>
      <div style={{
        position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center', gap: 30,
      }}>
        <div style={rev(localTime, 0.3, 0.6)}>
          <DkEyebrow>Estadio Azteca · Mexico City · 7,200 ft</DkEyebrow>
        </div>
        <div style={{ textAlign: 'center', lineHeight: 0.98 }}>
          <div style={{ ...rev(localTime, 0.9, 0.7, 30), fontFamily: SANS, fontWeight: 850, fontSize: 126, color: DK.text, letterSpacing: '-0.03em' }}>
            Some stadiums
          </div>
          <div style={{ ...rev(localTime, 1.5, 0.7, 30), fontFamily: SANS, fontWeight: 850, fontSize: 126, color: DK.gold, letterSpacing: '-0.03em', marginTop: 6 }}>
            hold ghosts.
          </div>
        </div>
        {/* the two final years engraved */}
        <div style={{ display: 'flex', gap: 26, marginTop: 26 }}>
          {[['1970', 'Pelé lifts the Cup'], ['1986', 'Maradona lifts the Cup'], ['2026', 'A third opening — a first in history']].map(([yr, label], i) => (
            <div key={yr} style={{
              ...rev(localTime, 6.2 + i * 2.2, 0.7, 24),
              width: 360, textAlign: 'center',
              background: DK.panel, border: `1px solid ${i === 2 ? 'rgba(255,207,102,0.5)' : DK.panelBorder}`,
              borderRadius: 12, padding: '24px 20px',
              boxShadow: i === 2 ? '0 0 50px rgba(255,207,102,0.14)' : DK.shadow,
            }}>
              <div style={{ fontFamily: SANS, fontWeight: 850, fontSize: 58, color: i === 2 ? DK.gold : DK.text, letterSpacing: '-0.02em', lineHeight: 1 }}>{yr}</div>
              <div style={{ fontFamily: SANS, fontWeight: 650, fontSize: 18, color: DK.muted, marginTop: 8 }}>{label}</div>
            </div>
          ))}
        </div>
      </div>
      <Mist y={760} height={260} speed={14} opacity={0.16} />
    </SceneWrap>
  );
}

// =============================================================================
// SCENE 2 — UNFINISHED BUSINESS / GHOST OF 2010 (17.5 – 31.5)
// =============================================================================
function SceneRivalry() {
  const { localTime } = useSprite();
  return (
    <SceneWrap>
      <div style={{ position: 'absolute', left: 0, right: 0, top: 96, textAlign: 'center' }}>
        <div style={rev(localTime, 0.2, 0.55)}>
          <DkEyebrow>The Opening Match · June 11, 2026</DkEyebrow>
        </div>
      </div>

      {/* big VS card */}
      <div style={{ ...rev(localTime, 0.6, 0.65, 28), position: 'absolute', left: 0, right: 0, top: 190, display: 'flex', justifyContent: 'center' }}>
        <DkPanel pad={44} style={{ width: 1480 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            {[['mexico', 'Mexico', 'El Tri · Host nation'], null, ['south_africa', 'South Africa', 'Bafana Bafana · The visitors']].map((side, i) =>
              side ? (
                <div key={side[0]} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 18, width: 520 }}>
                  <FlagTile id={side[0]} w={300} radius={12} />
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ fontFamily: SANS, fontWeight: 850, fontSize: 54, color: DK.text, letterSpacing: '-0.02em' }}>{side[1]}</div>
                    <div style={{ fontFamily: SANS, fontWeight: 650, fontSize: 20, color: DK.muted, marginTop: 4 }}>{side[2]}</div>
                  </div>
                </div>
              ) : (
                <div key="vs" style={{ textAlign: 'center' }}>
                  <div style={{ fontFamily: SANS, fontWeight: 850, fontSize: 96, color: DK.gold, letterSpacing: '-0.02em' }}>VS</div>
                  <div style={{ fontFamily: SANS, fontWeight: 700, fontSize: 19, color: DK.muted, marginTop: 6, whiteSpace: 'nowrap' }}>Group A · 19:00 UTC</div>
                </div>
              )
            )}
          </div>
        </DkPanel>
      </div>

      {/* the 2010 flashback strip */}
      <div style={{ ...rev(localTime, 6.6, 0.7, 26), position: 'absolute', left: 0, right: 0, top: 760, display: 'flex', justifyContent: 'center' }}>
        <div style={{
          display: 'flex', alignItems: 'center', gap: 26,
          background: 'rgba(4,22,16,0.86)', border: `1px solid ${DK.panelBorder}`,
          borderRadius: 12, padding: '22px 38px', boxShadow: DK.shadow,
        }}>
          <div style={{ fontFamily: SANS, fontWeight: 850, fontSize: 30, color: DK.muted, letterSpacing: '0.08em' }}>2010</div>
          <div style={{ width: 1, height: 46, background: DK.panelBorder }} />
          <div style={{ fontFamily: SANS, fontWeight: 700, fontSize: 25, color: DK.text }}>
            Johannesburg — <span style={{ color: DK.gold }}>Tshabalala 55′</span> · Márquez 79′ &nbsp;
            <b style={{ color: DK.text }}>South Africa 1–1 Mexico</b>
          </div>
          <div style={{ width: 1, height: 46, background: DK.panelBorder }} />
          <div style={{ fontFamily: SANS, fontWeight: 800, fontSize: 22, color: DK.red, letterSpacing: '0.04em', textTransform: 'uppercase' }}>Unfinished business</div>
        </div>
      </div>
    </SceneWrap>
  );
}

// =============================================================================
// SCENE 3 — MEXICO, THE HOSTS (31.5 – 55.3)
// =============================================================================
const MEX_PLAYERS = [
  ['assets/Guillermo-Ochoa.png', 'Guillermo Ochoa', 'GK · 40 · record 6th World Cup'],
  ['assets/Hirving-Lozano.png', 'Hirving Lozano', '"Chucky" · the lightning left'],
  ['assets/Santiago-Gimenez.png', 'Santiago Giménez', 'ST · the cold finisher'],
  ['assets/Edson-Alvarez.png', 'Edson Álvarez', '"El Machín" · 90+ caps'],
  ['assets/Orbelin-Pineda.png', 'Orbelín Pineda', 'AM · the spark'],
];

function SceneMexico() {
  const { localTime } = useSprite();
  return (
    <SceneWrap>
      <div style={{ position: 'absolute', left: 120, top: 100, right: 120, display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between' }}>
        <div>
          <div style={rev(localTime, 0.2, 0.5)}>
            <DkEyebrow color={DK.green}>The Hosts · Group A</DkEyebrow>
          </div>
          <div style={{ ...rev(localTime, 0.4, 0.6, 26), fontFamily: SANS, fontWeight: 850, fontSize: 92, color: DK.text, letterSpacing: '-0.03em', lineHeight: 1, marginTop: 14 }}>
            Mexico brings <span style={{ color: DK.green }}>legends.</span>
          </div>
        </div>
        <div style={{ ...rev(localTime, 0.5, 0.6), display: 'flex', alignItems: 'center', gap: 16 }}>
          <FlagTile id="mexico" w={110} radius={8} />
          <div style={{ fontFamily: SANS, fontWeight: 800, fontSize: 24, color: DK.muted }}>×{fmtCoef(T.mexico.coefficient)} <span style={{ fontWeight: 650, fontSize: 17 }}>coefficient</span></div>
        </div>
      </div>

      {/* player cards */}
      <div style={{ position: 'absolute', left: 0, right: 0, top: 330, display: 'flex', justifyContent: 'center', gap: 26 }}>
        {MEX_PLAYERS.map(([src, name, sub], i) => (
          <div key={name} style={rev(localTime, 1.1 + i * 0.5, 0.6, 34)}>
            <PlayerCard src={src} name={name} sub={sub} accent={DK.green} />
          </div>
        ))}
      </div>

      <div style={{ ...rev(localTime, 17.4, 0.6), position: 'absolute', left: 0, right: 0, top: 770, textAlign: 'center' }}>
        <span style={{
          fontFamily: SANS, fontWeight: 750, fontSize: 30, color: DK.text,
          background: 'rgba(4,22,16,0.8)', border: `1px solid ${DK.panelBorder}`,
          borderRadius: 999, padding: '16px 38px', display: 'inline-block',
        }}>
          100,000 voices · 7,200 feet of altitude · <span style={{ color: DK.gold }}>one cauldron</span>
        </span>
      </div>
    </SceneWrap>
  );
}

// =============================================================================
// SCENE 4 — THE AZTEC WARRIOR (55.3 – 73.1)  · mystery I
// =============================================================================
function SceneAztec() {
  const { localTime } = useSprite();
  const glow = 0.5 + 0.5 * Math.sin(localTime * 1.4);
  return (
    <SceneWrap entry={0.8}>
      {/* darker pass for the mystery beat */}
      <div style={{ position: 'absolute', inset: 0, background: 'rgba(1,10,7,0.55)' }} />
      <Mist y={120} height={300} speed={12} opacity={0.22} />
      <Mist y={620} height={320} speed={20} opacity={0.26} />

      {/* portrait */}
      <div style={{ ...rev(localTime, 0.7, 1.0, 40), position: 'absolute', left: 170, top: 110 }}>
        <div style={{
          width: 470, height: 836, borderRadius: 16, overflow: 'hidden',
          border: '1px solid rgba(255,207,102,0.34)',
          boxShadow: `0 0 ${60 + glow * 50}px rgba(255,207,102,${(0.16 + glow * 0.12).toFixed(3)}), ${DK.shadow}`,
        }}>
          <img src="assets/mystery-aztec-warrior.png" alt="" draggable="false"
            style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
        </div>
      </div>

      {/* lore */}
      <div style={{ position: 'absolute', left: 760, top: 210, width: 1010 }}>
        <div style={rev(localTime, 1.2, 0.6)}>
          <DkEyebrow>Mystery of the Azteca · I</DkEyebrow>
        </div>
        <div style={{ ...rev(localTime, 1.6, 0.7, 28), fontFamily: SANS, fontWeight: 850, fontSize: 96, color: DK.text, letterSpacing: '-0.03em', lineHeight: 1.02, marginTop: 18 }}>
          The Aztec<br /><span style={{ color: DK.gold }}>Warrior.</span>
        </div>
        <div style={{ ...rev(localTime, 4.2, 0.7), fontFamily: SANS, fontWeight: 650, fontSize: 29, color: DK.muted, lineHeight: 1.55, marginTop: 30, maxWidth: 940 }}>
          Jaguar regalia. A carved staff. He appears above the south stand only on
          the great nights — seen, never found.
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14, marginTop: 36 }}>
          {[
            'No ticket. No seat. No photographs — only blessings.',
            'Mexico has never lost when he is seen.',
            'Tomorrow, every eye checks the south stand.',
          ].map((line, i) => (
            <div key={i} style={{
              ...rev(localTime, 10.6 + i * 1.4, 0.6, 18),
              display: 'flex', alignItems: 'center', gap: 16,
              fontFamily: SANS, fontWeight: 720, fontSize: 26, color: DK.text,
            }}>
              <span style={{ width: 10, height: 10, borderRadius: '50%', background: DK.gold, boxShadow: `0 0 14px rgba(255,207,102,0.8)`, flexShrink: 0 }} />
              {line}
            </div>
          ))}
        </div>
      </div>
    </SceneWrap>
  );
}

// =============================================================================
// SCENE 5 — BAFANA BAFANA (73.1 – 95.3)
// =============================================================================
const RSA_PLAYERS = [
  ['assets/Ronwen-Williams.png', 'Ronwen Williams', 'GK · captain · the wall'],
  ['assets/Percy-Tau.png', 'Percy Tau', '"The Lion of Judah" · magic'],
  ['assets/Lyle-Foster.png', 'Lyle Foster', 'ST · Premier League steel'],
  ['assets/Teboho-Mokoena.png', 'Teboho Mokoena', 'CM · pulls every string'],
  ['assets/Evidence-Makgopa.png', 'Evidence Makgopa', 'FW · pace in behind'],
];

function SceneBafana() {
  const { localTime } = useSprite();
  return (
    <SceneWrap>
      <div style={{ position: 'absolute', left: 120, top: 100, right: 120, display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between' }}>
        <div>
          <div style={rev(localTime, 0.2, 0.5)}>
            <DkEyebrow color={DK.gold}>The Visitors · Group A</DkEyebrow>
          </div>
          <div style={{ ...rev(localTime, 0.4, 0.6, 26), fontFamily: SANS, fontWeight: 850, fontSize: 72, color: DK.text, letterSpacing: '-0.03em', lineHeight: 1, marginTop: 14, whiteSpace: 'nowrap' }}>
            Nothing to lose. <span style={{ color: DK.gold }}>Everything to take.</span>
          </div>
        </div>
        <div style={{ ...rev(localTime, 0.5, 0.6), display: 'flex', alignItems: 'center', gap: 16 }}>
          <FlagTile id="south_africa" w={110} radius={8} />
          <div style={{ fontFamily: SANS, fontWeight: 800, fontSize: 24, color: DK.gold }}>×{fmtCoef(T.south_africa.coefficient)} <span style={{ fontWeight: 650, fontSize: 17, color: DK.muted }}>coefficient</span></div>
        </div>
      </div>

      <div style={{ position: 'absolute', left: 0, right: 0, top: 330, display: 'flex', justifyContent: 'center', gap: 26 }}>
        {RSA_PLAYERS.map(([src, name, sub], i) => (
          <div key={name} style={rev(localTime, 1.1 + i * 0.5, 0.6, 34)}>
            <PlayerCard src={src} name={name} sub={sub} accent={DK.gold} />
          </div>
        ))}
      </div>

      <div style={{ ...rev(localTime, 16.6, 0.6), position: 'absolute', left: 0, right: 0, top: 770, textAlign: 'center' }}>
        <span style={{
          fontFamily: SANS, fontWeight: 750, fontSize: 30, color: DK.text,
          background: 'rgba(4,22,16,0.8)', border: `1px solid ${DK.panelBorder}`,
          borderRadius: 999, padding: '16px 38px', display: 'inline-block',
        }}>
          The most dangerous team a World Cup knows — <span style={{ color: DK.gold }}>one with nothing to lose</span>
        </span>
      </div>
    </SceneWrap>
  );
}

// =============================================================================
// SCENE 6 — THE MANDELA SPIRIT (95.3 – 112.1) · mystery II
// =============================================================================
function SceneSpirit() {
  const { localTime } = useSprite();
  const glow = 0.5 + 0.5 * Math.sin(localTime * 1.2);
  return (
    <SceneWrap entry={0.8}>
      <div style={{ position: 'absolute', inset: 0, background: 'rgba(1,10,7,0.55)' }} />
      <Mist y={100} height={300} speed={16} opacity={0.22} />
      <Mist y={640} height={300} speed={11} opacity={0.26} />

      {/* lore on the left this time */}
      <div style={{ position: 'absolute', left: 150, top: 210, width: 1010 }}>
        <div style={rev(localTime, 1.2, 0.6)}>
          <DkEyebrow>Mystery of the Azteca · II</DkEyebrow>
        </div>
        <div style={{ ...rev(localTime, 1.6, 0.7, 28), fontFamily: SANS, fontWeight: 850, fontSize: 96, color: DK.text, letterSpacing: '-0.03em', lineHeight: 1.02, marginTop: 18 }}>
          The Mandela<br /><span style={{ color: DK.gold }}>Spirit.</span>
        </div>
        <div style={{ ...rev(localTime, 4.0, 0.7), fontFamily: SANS, fontWeight: 650, fontSize: 29, color: DK.muted, lineHeight: 1.55, marginTop: 30, maxWidth: 940 }}>
          A Madiba shirt. A small flag. Every Bafana match since 1994 —
          always above the crowd, never in it.
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14, marginTop: 36 }}>
          {[
            'Three decades. Every match. No one knows his name.',
            'When the flag rises, impossible things happen.',
            'Tomorrow, he flies to enemy ground.',
          ].map((line, i) => (
            <div key={i} style={{
              ...rev(localTime, 9.6 + i * 1.6, 0.6, 18),
              display: 'flex', alignItems: 'center', gap: 16,
              fontFamily: SANS, fontWeight: 720, fontSize: 26, color: DK.text,
            }}>
              <span style={{ width: 10, height: 10, borderRadius: '50%', background: DK.gold, boxShadow: `0 0 14px rgba(255,207,102,0.8)`, flexShrink: 0 }} />
              {line}
            </div>
          ))}
        </div>
      </div>

      <div style={{ ...rev(localTime, 0.7, 1.0, 40), position: 'absolute', right: 170, top: 110 }}>
        <div style={{
          width: 470, height: 836, borderRadius: 16, overflow: 'hidden',
          border: '1px solid rgba(255,207,102,0.34)',
          boxShadow: `0 0 ${60 + glow * 50}px rgba(255,207,102,${(0.16 + glow * 0.12).toFixed(3)}), ${DK.shadow}`,
        }}>
          <img src="assets/mystery-mandela-spirit.png" alt="" draggable="false"
            style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
        </div>
      </div>
    </SceneWrap>
  );
}

// =============================================================================
// SCENE 7 — THE QUESTION (112.1 – 128.1) · head-to-head + coefficients
// =============================================================================
function SceneQuestion() {
  const { localTime } = useSprite();
  const duel = [
    { id: 'mexico', name: 'Mexico', c: T.mexico.coefficient, accent: DK.green },
    { id: 'south_africa', name: 'South Africa', c: T.south_africa.coefficient, accent: DK.gold },
  ];
  return (
    <SceneWrap>
      <div style={{ position: 'absolute', left: 0, right: 0, top: 110, textAlign: 'center' }}>
        <div style={rev(localTime, 0.2, 0.5)}>
          <DkEyebrow>The Question</DkEyebrow>
        </div>
        <div style={{ ...rev(localTime, 0.45, 0.6, 26), fontFamily: SANS, fontWeight: 850, fontSize: 96, color: DK.text, letterSpacing: '-0.03em', marginTop: 16 }}>
          The warrior — <span style={{ color: DK.gold }}>or the spirit?</span>
        </div>
      </div>

      {/* head to head tiles */}
      <div style={{ ...rev(localTime, 1.3, 0.6, 24), position: 'absolute', left: 0, right: 0, top: 360, display: 'flex', justifyContent: 'center', gap: 22 }}>
        {[['4', 'meetings'], ['2', 'Mexico wins'], ['1', 'draw — 2010'], ['1', 'South Africa win']].map(([n, label], i) => (
          <div key={label} style={{
            width: 270, textAlign: 'center', background: DK.panel,
            border: `1px solid ${DK.panelBorder}`, borderRadius: 12, padding: '26px 18px', boxShadow: DK.shadow,
          }}>
            <div style={{ fontFamily: SANS, fontWeight: 850, fontSize: 64, color: i === 0 ? DK.text : i === 1 ? DK.green : i === 3 ? DK.gold : DK.muted, lineHeight: 1 }}>{n}</div>
            <div style={{ fontFamily: SANS, fontWeight: 700, fontSize: 18, color: DK.muted, marginTop: 8 }}>{label}</div>
          </div>
        ))}
      </div>

      {/* coefficient duel */}
      <div style={{ ...rev(localTime, 7.2, 0.7, 26), position: 'absolute', left: 0, right: 0, top: 620, display: 'flex', justifyContent: 'center' }}>
        <DkPanel pad={34} style={{ width: 1480 }}>
          <div style={{ fontFamily: SANS, fontWeight: 850, fontSize: 15, letterSpacing: '0.18em', textTransform: 'uppercase', color: DK.muted, marginBottom: 22 }}>
            WorldCup26 coefficient · the underdog multiplies
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            {duel.map((g, i) => {
              const pct = ((g.c - 1) / 2) * 100;
              const w = animate({ from: 0, to: pct, start: 7.8 + i * 0.3, end: 9.2 + i * 0.3, ease: ease.easeOutCubic })(localTime);
              return (
                <div key={g.id} style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
                  <FlagTile id={g.id} w={64} radius={6} />
                  <span style={{ width: 280, fontFamily: SANS, fontWeight: 780, fontSize: 30, color: DK.text }}>{g.name}</span>
                  <div style={{ flex: 1, height: 22, borderRadius: 11, background: 'rgba(255,255,255,0.08)', overflow: 'hidden' }}>
                    <div style={{ width: `${w}%`, height: '100%', borderRadius: 11, background: `linear-gradient(90deg, ${DK.greenDeep}, ${g.accent})` }} />
                  </div>
                  <span style={{ width: 130, textAlign: 'right', fontFamily: SANS, fontWeight: 850, fontSize: 40, color: g.accent, fontVariantNumeric: 'tabular-nums' }}>×{fmtCoef(g.c)}</span>
                </div>
              );
            })}
          </div>
          <div style={{ fontFamily: SANS, fontWeight: 650, fontSize: 21, color: DK.muted, marginTop: 22 }}>
            Same goal, same win — South Africa's points are worth nearly <b style={{ color: DK.gold }}>1.5× Mexico's</b>. Risk pays.
          </div>
        </DkPanel>
      </div>
    </SceneWrap>
  );
}

// =============================================================================
// SCENE 8 — THE GAME (128.1 – 152.3) · the pitch
// =============================================================================
function SceneGame() {
  const { localTime } = useSprite();
  const picks = [
    { id: 'mexico', slot: 0, at: 5.2 },
    { id: 'south_africa', slot: 1, at: 6.4 },
    { id: 'brazil', slot: 2, at: 7.6 },
  ];
  return (
    <SceneWrap>
      <div style={{ position: 'absolute', left: 120, top: 110, width: 1680 }}>
        <div style={rev(localTime, 0.2, 0.5)}>
          <DkEyebrow color={DK.green}>WorldCup26.world · The Game</DkEyebrow>
        </div>
        <div style={{ ...rev(localTime, 0.45, 0.6, 26), fontFamily: SANS, fontWeight: 850, fontSize: 88, color: DK.text, letterSpacing: '-0.03em', lineHeight: 1, marginTop: 16 }}>
          Stop watching. <span style={{ color: DK.green }}>Start playing.</span>
        </div>
        <div style={{ ...rev(localTime, 3.6, 0.6), fontFamily: SANS, fontWeight: 650, fontSize: 28, color: DK.muted, marginTop: 20 }}>
          Pick any 3 of the 48 nations — free. They score for you all tournament.
        </div>
      </div>

      {/* three pick chips */}
      <div style={{ position: 'absolute', left: 120, top: 470, display: 'flex', gap: 20 }}>
        {picks.map(({ id, slot, at }) => {
          const team = T[id];
          const on = localTime >= at;
          const pop = animate({ from: 0.7, to: 1, start: at, end: at + 0.45, ease: ease.easeOutBack })(localTime);
          return (
            <div key={id} style={{
              opacity: on ? 1 : 0.25, transform: `scale(${on ? pop : 1})`,
              display: 'flex', alignItems: 'center', gap: 16,
              background: on ? 'rgba(16,107,79,0.32)' : 'rgba(255,255,255,0.04)',
              border: `2px ${on ? 'solid' : 'dashed'} ${on ? DK.green : 'rgba(255,255,255,0.2)'}`,
              borderRadius: 12, padding: '18px 26px', width: 480, boxSizing: 'border-box',
            }}>
              <FlagTile id={id} w={64} radius={6} />
              <div>
                <div style={{ fontFamily: SANS, fontWeight: 850, fontSize: 13, letterSpacing: '0.1em', color: DK.green }}>PICK {slot + 1}</div>
                <div style={{ fontFamily: SANS, fontWeight: 800, fontSize: 28, color: DK.text, whiteSpace: 'nowrap' }}>{team.name}</div>
              </div>
              <div style={{ flex: 1 }} />
              <div style={{ fontFamily: SANS, fontWeight: 850, fontSize: 26, color: DK.gold }}>×{fmtCoef(team.coefficient)}</div>
            </div>
          );
        })}
      </div>

      {/* formula band */}
      <div style={{ ...rev(localTime, 11.4, 0.7, 24), position: 'absolute', left: 120, top: 620, width: 1680 }}>
        <DkPanel pad={30}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 18, flexWrap: 'wrap' }}>
            {[
              ['(base + goals + clean sheet)', DK.text, 'rgba(255,255,255,0.08)'],
              ['×', DK.muted, null],
              ['team coefficient', DK.green, 'rgba(16,107,79,0.30)'],
              ['×', DK.muted, null],
              ['stage coefficient', DK.gold, 'rgba(201,148,46,0.22)'],
            ].map(([txt, col, bg], i) => bg ? (
              <span key={i} style={{ fontFamily: SANS, fontWeight: 820, fontSize: 31, color: col, background: bg, padding: '12px 22px', borderRadius: 9, letterSpacing: '-0.01em' }}>{txt}</span>
            ) : (
              <span key={i} style={{ fontFamily: SANS, fontWeight: 820, fontSize: 34, color: col }}>{txt}</span>
            ))}
            <div style={{ flex: 1 }} />
            <span style={{ fontFamily: SANS, fontWeight: 650, fontSize: 22, color: DK.muted }}>underdogs pay up to <b style={{ color: DK.gold, fontSize: 28 }}>×3.00</b></span>
          </div>
        </DkPanel>
      </div>

      {/* live leaderboard tease */}
      <div style={{ ...rev(localTime, 18.4, 0.7, 24), position: 'absolute', left: 120, top: 800, width: 1680 }}>
        <div style={{
          display: 'flex', alignItems: 'center', gap: 24,
          background: 'rgba(4,22,16,0.85)', border: `1px solid ${DK.panelBorder}`,
          borderRadius: 12, padding: '20px 32px', boxShadow: DK.shadow,
        }}>
          <Trophy size={40} color={DK.gold} />
          <span style={{ fontFamily: SANS, fontWeight: 800, fontSize: 28, color: DK.text }}>
            Live leaderboard · <span style={{ color: DK.gold }}>live prize pool</span> · free picks first, ticket only if you want the paid board
          </span>
          <div style={{ flex: 1 }} />
          <span style={{ fontFamily: SANS, fontWeight: 850, fontSize: 30, color: DK.green, fontVariantNumeric: 'tabular-nums' }}>
            <LCount from={0} to={38.08} start={18.8} end={20.6} fmt={(v) => v.toFixed(2)} /> pts
          </span>
        </div>
      </div>
    </SceneWrap>
  );
}

// =============================================================================
// SCENE 9 — THE LOCK (152.3 – 167.1) · urgency
// =============================================================================
function SceneLock() {
  const { localTime } = useSprite();
  const pulse = 1 + 0.012 * Math.sin(localTime * 3.2);
  return (
    <SceneWrap>
      {/* story-card art on the right */}
      <div style={{ ...rev(localTime, 0.5, 0.8, 36), position: 'absolute', right: 170, top: 120 }}>
        <div style={{
          width: 452, height: 812, borderRadius: 16, overflow: 'hidden',
          border: `1px solid rgba(255,207,102,0.36)`, boxShadow: DK.shadow,
        }}>
          <img src="assets/kickoff-1000-story-a.png" alt="" draggable="false"
            style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
        </div>
      </div>

      <div style={{ position: 'absolute', left: 150, top: 200, width: 1080 }}>
        <div style={rev(localTime, 0.3, 0.5)}>
          <DkEyebrow color={DK.red}>Hear the clock</DkEyebrow>
        </div>
        <div style={{ ...rev(localTime, 0.6, 0.7, 28), fontFamily: SANS, fontWeight: 850, fontSize: 100, color: DK.text, letterSpacing: '-0.03em', lineHeight: 1.0, marginTop: 18 }}>
          Every team locks<br />at its <span style={{ color: DK.gold }}>first kickoff.</span>
        </div>
        <div style={{ ...rev(localTime, 4.4, 0.6), fontFamily: SANS, fontWeight: 650, fontSize: 30, color: DK.muted, marginTop: 26, lineHeight: 1.5 }}>
          Mexico and South Africa lock <b style={{ color: DK.text }}>first</b> — tomorrow, at the whistle.
          Pick while all 48 nations are still on the table.
        </div>

        <div style={{ ...rev(localTime, 7.4, 0.6), marginTop: 44, transform: `scale(${pulse})`, transformOrigin: 'left center', display: 'inline-flex', alignItems: 'center', gap: 20, background: 'rgba(184,74,69,0.2)', border: `1px solid rgba(226,101,79,0.5)`, borderRadius: 14, padding: '24px 34px' }}>
          <svg width="44" height="44" viewBox="0 0 24 24" fill="none" stroke={DK.red} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="13" r="8" /><path d="M12 9v4l2.5 2.5" /><path d="M9 2h6" /></svg>
          <div>
            <div style={{ fontFamily: SANS, fontWeight: 850, fontSize: 38, color: DK.text, letterSpacing: '-0.01em' }}>June 11 · 19:00 UTC</div>
            <div style={{ fontFamily: SANS, fontWeight: 700, fontSize: 20, color: 'rgba(245,242,232,0.78)', marginTop: 4 }}>First whistle, Estadio Azteca — full team choice ends</div>
          </div>
        </div>
      </div>
    </SceneWrap>
  );
}

// =============================================================================
// SCENE 10 — CTA (167.1 – 180)
// =============================================================================
function SceneFinale() {
  const { localTime } = useSprite();
  return (
    <SceneWrap exit={0.5}>
      <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 30 }}>
        <div style={{ ...rev(localTime, 0.3, 0.6), display: 'flex', alignItems: 'center', gap: 24 }}>
          <FlagTile id="mexico" w={120} radius={8} />
          <span style={{ fontFamily: SANS, fontWeight: 850, fontSize: 44, color: DK.gold }}>VS</span>
          <FlagTile id="south_africa" w={120} radius={8} />
        </div>
        <div style={{ ...rev(localTime, 0.8, 0.6), fontFamily: SANS, fontWeight: 700, fontSize: 30, color: DK.muted, letterSpacing: '0.02em' }}>
          Free entry · 2 minutes · no card
        </div>
        <div style={{ ...rev(localTime, 1.2, 0.7, 30), fontFamily: SANS, fontWeight: 850, fontSize: 132, color: DK.gold, letterSpacing: '-0.03em', lineHeight: 1, textShadow: '0 0 80px rgba(255,207,102,0.3)' }}>
          WorldCup26.world
        </div>
        <div style={{ ...rev(localTime, 2.4, 0.6), display: 'flex', alignItems: 'center', gap: 14, background: DK.greenDeep, borderRadius: 12, padding: '22px 48px', boxShadow: '0 18px 50px rgba(16,107,79,0.45)' }}>
          <Trophy size={32} />
          <span style={{ fontFamily: SANS, fontWeight: 850, fontSize: 34, color: '#fff' }}>Pick your 3 — before the first whistle</span>
        </div>
        <div style={{ ...rev(localTime, 3.4, 0.6), fontFamily: SANS, fontWeight: 650, fontSize: 23, color: DK.muted }}>
          The mystery kicks off June 11 · FIFA World Cup 2026
        </div>
      </div>
      <Mist y={780} height={260} speed={13} opacity={0.14} />
    </SceneWrap>
  );
}

// ── Persistent watermark on dark ─────────────────────────────────────────────
function NightWatermark() {
  const time = useTime();
  const op = Math.min(clamp((time - 16) / 0.6, 0, 1), clamp((166 - time) / 0.6, 0, 1)) * 0.72;
  if (op <= 0.001) return null;
  return (
    <div style={{
      position: 'absolute', left: 64, bottom: 50, opacity: op,
      display: 'flex', alignItems: 'center', gap: 12, zIndex: 40,
    }}>
      <BrandMark size={34} showWord={false} glow={false} />
      <span style={{ fontFamily: SANS, fontWeight: 800, fontSize: 24, color: DK.gold, letterSpacing: '-0.01em' }}>WorldCup26.world</span>
    </div>
  );
}

Object.assign(window, {
  DK, NightBackdrop, NightWatermark,
  SceneGhosts, SceneRivalry, SceneMexico, SceneAztec, SceneBafana,
  SceneSpirit, SceneQuestion, SceneGame, SceneLock, SceneFinale,
});
