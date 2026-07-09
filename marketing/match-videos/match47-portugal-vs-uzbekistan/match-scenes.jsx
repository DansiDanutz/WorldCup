// match-scenes.jsx — the scenes of the Ep47 video (308s timeline).
// Portugal vs Uzbekistan · "The Last Dance" · Group K.
// SPINE: Cristiano Ronaldo at 41 — a monument that learned to move — in what may
// be his final World Cup, against Uzbekistan's debutants (their first-ever World
// Cup) and "the Wall of Tashkent" (Khusanov). Can the Silk Road shake the Atlantic?
// MATCH NOT YET PLAYED — predicted Portugal 2–1 (Fayzullaev 26' shock lead for
// Uzbekistan, Ronaldo 71' equaliser & Ronaldo 88' winner — the last dance).
// Every scoreline/goal is OUR PREDICTION, clearly labelled, never stated as a real result.
// Scene windows must match the SCENES table in match.html and narration.json.
// NOTE: nested <Sprite> windows are GLOBAL seconds (Sprite reads the timeline clock).

// Local team colours (kit must not be modified).
const POR = '#c8102e';        // Portugal red
const POR_LIGHT = '#e8455e';
const UZB = '#0ea5e9';        // Uzbekistan sky blue
const UZB_LIGHT = '#5cc9f5';

// Portugal flag — green left (~40%) / red right (~60%), gold circular emblem on the divide.
function FlagPOR({ w = 120 }) {
  const h = w * 2 / 3;
  return (
    <div style={{ width: w, height: h, borderRadius: w * 0.05, position: 'relative', overflow: 'hidden', display: 'flex', boxShadow: '0 6px 18px rgba(0,0,0,0.45)' }}>
      <div style={{ flex: '0 0 40%', background: '#006600' }} />
      <div style={{ flex: '0 0 60%', background: '#c8102e' }} />
      <div style={{
        position: 'absolute', left: '40%', top: '50%', transform: 'translate(-50%,-50%)',
        width: h * 0.34, height: h * 0.34, borderRadius: '50%',
        background: 'radial-gradient(circle at 35% 30%, #ffe08a, #d4a017 70%)',
        border: `${Math.max(1, h * 0.02)}px solid #b8860b`, boxShadow: '0 0 8px rgba(0,0,0,0.4)',
      }} />
    </div>
  );
}

// Uzbekistan flag — three horizontal bands sky-blue / white / green, thin red separators,
// white crescent + small white stars in the top-left blue band.
function FlagUZB({ w = 120 }) {
  const h = w * 2 / 3;
  const redline = Math.max(1, h * 0.02);
  return (
    <div style={{ width: w, height: h, borderRadius: w * 0.05, position: 'relative', overflow: 'hidden', display: 'flex', flexDirection: 'column', boxShadow: '0 6px 18px rgba(0,0,0,0.45)' }}>
      <div style={{ flex: 1, background: '#1eb4e8' }} />
      <div style={{ height: redline, background: '#ce1126' }} />
      <div style={{ flex: 1, background: '#fff' }} />
      <div style={{ height: redline, background: '#ce1126' }} />
      <div style={{ flex: 1, background: '#1eb53a' }} />
      {/* crescent in the top-left blue band */}
      <div style={{ position: 'absolute', left: w * 0.08, top: h * 0.085, width: h * 0.18, height: h * 0.18, borderRadius: '50%', background: '#fff' }} />
      <div style={{ position: 'absolute', left: w * 0.11, top: h * 0.085, width: h * 0.18, height: h * 0.18, borderRadius: '50%', background: '#1eb4e8' }} />
      {/* small white stars */}
      {[[0.21, 0.10], [0.27, 0.10], [0.24, 0.155], [0.30, 0.155]].map(([x, y], i) => (
        <span key={i} style={{ position: 'absolute', left: w * x, top: h * y, color: '#fff', fontSize: h * 0.085, lineHeight: 1 }}>★</span>
      ))}
    </div>
  );
}

// Match scoreboard chip (top center) — PORTUGAL vs UZBEKISTAN. Local override of the
// kit's ScoreBug so the labels/props/colours track this episode (kit unchanged).
// Ep47 is UNPLAYED — the 2–1 is OUR PREDICTION, badge defaults to "OUR PREDICTION".
function ScoreBug({ start, por = 0, uzb = 0, minute, badge = "OUR PREDICTION" }) {
  const t = useTime();
  const local = t - start;
  if (local < 0) return null;
  const inP = Easing.easeOutBack(clamp(local / 0.7, 0, 1));
  const cell = { fontFamily: '"Inter",sans-serif', fontWeight: 900, fontSize: 34, color: '#fff', padding: '10px 18px' };
  return (
    <div style={{
      position: 'absolute', top: 118, left: '50%', zIndex: 26,
      transform: `translateX(-50%) scale(${inP})`, opacity: clamp(inP, 0, 1),
      display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8,
    }}>
      <div style={{
        display: 'flex', alignItems: 'center',
        background: MV.panel, border: `1px solid ${MV.line}`, borderRadius: 14,
        boxShadow: '0 10px 36px rgba(0,0,0,0.5)', overflow: 'hidden',
      }}>
        <div style={{ ...cell, background: POR }}>POR</div>
        <div style={{ ...cell, fontSize: 38, color: MV.gold }}>{por} — {uzb}</div>
        <div style={{ ...cell, background: UZB, color: '#fff' }}>UZB</div>
        {minute && <div style={{ ...cell, fontSize: 26, color: MV.muted, borderLeft: `1px solid ${MV.line}` }}>{minute}</div>}
      </div>
      <div style={{
        fontFamily: '"Inter",sans-serif', fontWeight: 800, fontSize: 16, color: MV.gold, letterSpacing: '0.22em',
        background: 'rgba(255,210,74,0.12)', border: '1px solid rgba(255,210,74,0.5)', borderRadius: 999, padding: '4px 16px',
      }}>{badge}</div>
    </div>
  );
}

// ── Persistent cinematic B-roll backdrop (0–308): continuous tiled footage so
// the frame is NEVER black behind a scene; scenes render their own clips on top.
function Backdrop() {
  const clips = (window.MV_CLIPS || []).filter((c) => c.id && c.id.indexOf('bd-') === 0);
  return (
    <div style={{ position: 'absolute', inset: 0, zIndex: 0 }}>
      {clips.map((c) => (
        <ClipSprite key={c.id} id={c.id} dim={0.34} style={{ filter: 'brightness(0.66) saturate(1.1) contrast(1.05)' }} />
      ))}
      <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse at 50% 42%, rgba(5,6,12,0.18) 25%, rgba(2,3,8,0.6) 100%)' }} />
    </div>
  );
}

// ── 1. Cold open (0–24): heartbeat in the dark, flash glimpses, hook line ────
function SceneColdOpen() {
  const { localTime: lt } = useSprite();
  const beat = Math.pow(Math.max(0, Math.sin(lt * Math.PI * 1.15)), 8);
  const titleP = Easing.easeOutCubic(clamp((lt - 18.6) / 1.4, 0, 1));
  return (
    <div style={{ position: 'absolute', inset: 0, background: 'rgba(2,3,7,0.46)' }}>
      {/* moving flash-glimpses of what's coming (video, not stills) */}
      <ClipSprite id="glimpse-stad" style={{ filter: 'brightness(0.78) contrast(1.15) saturate(1.2)' }} />
      <ClipSprite id="glimpse-fado" style={{ filter: 'brightness(0.74) contrast(1.12) saturate(1.05)' }} />
      <ClipSprite id="glimpse-ronaldo" style={{ filter: 'brightness(0.78) contrast(1.15) saturate(1.2)' }} />
      <ClipSprite id="glimpse-fayzullaev" style={{ filter: 'brightness(0.78) contrast(1.15) saturate(1.2)' }} />
      {/* ember base so the screen never reads as dead air */}
      <div style={{
        position: 'absolute', inset: 0,
        background: `radial-gradient(ellipse at 50% 78%, rgba(14,165,233,0.12) 0%, transparent 55%)`,
      }} />
      {/* heartbeat glow */}
      <div style={{
        position: 'absolute', inset: 0,
        background: `radial-gradient(ellipse at center, rgba(200,16,46,${(0.48 * beat).toFixed(3)}) 0%, transparent 62%)`,
      }} />
      <Vignette strength={0.8} />
      {lt > 18.6 && (
        <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 34, opacity: titleP, zIndex: 22 }}>
          <Kicker size={34}>The Silk Road Meets The Atlantic</Kicker>
          <TitleReveal text="THE LAST DANCE" start={20.4} size={140} color={MV.gold} />
        </div>
      )}
      <Letterbox />
    </div>
  );
}

// ── 2. Title card (24–34) ────────────────────────────────────────────────────
function SceneTitle() {
  const { localTime: lt } = useSprite();
  const p1 = Easing.easeOutCubic(clamp(lt / 1.0, 0, 1));
  const p2 = Easing.easeOutBack(clamp((lt - 0.8) / 1.0, 0, 1));
  const p3 = Easing.easeOutCubic(clamp((lt - 1.7) / 0.9, 0, 1));
  return (
    <div style={{ position: 'absolute', inset: 0, background: `linear-gradient(180deg, #0a0f1c 0%, #11182b 55%, #0a0f1c 100%)` }}>
      <div style={{ position: 'absolute', inset: 0, background: `radial-gradient(ellipse at 50% 30%, rgba(255,210,74,0.10) 0%, transparent 55%)` }} />
      <AmbientParticles start={24.65} dur={10} count={34} />
      <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 44 }}>
        <div style={{ opacity: p1, transform: `translateY(${(1 - p1) * -30}px)` }}>
          <Kicker>WorldCup26 Legends · Episode 47</Kicker>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 70, opacity: clamp(p2, 0, 1), transform: `scale(${p2})` }}>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 20 }}>
            <Waving><FlagPOR w={230} /></Waving>
            <BigTitle size={66} glow={POR_LIGHT}>PORTUGAL</BigTitle>
          </div>
          <BigTitle size={120} color={MV.gold}>VS</BigTitle>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 20 }}>
            <Waving speed={1.9}><FlagUZB w={230} /></Waving>
            <BigTitle size={66} glow={UZB_LIGHT}>UZBEKISTAN</BigTitle>
          </div>
        </div>
        <div style={{ opacity: p3, transform: `translateY(${(1 - p3) * 26}px)`, fontFamily: '"Inter",sans-serif', fontWeight: 600, fontSize: 32, color: MV.muted, letterSpacing: '0.08em' }}>
          GROUP K · A PACKED WORLD CUP NIGHT
        </div>
      </div>
      <Letterbox />
    </div>
  );
}

// ── 3. Stadium (34–45): flyover clip + stakes ────────────────────────────────
function SceneStadium() {
  const { localTime: lt } = useSprite();
  const stripP = Easing.easeOutCubic(clamp((lt - 1.2) / 0.9, 0, 1));
  return (
    <div style={{ position: 'absolute', inset: 0, background: 'rgba(2,3,7,0.46)' }}>
      <ClipSprite id="stadium-ext" dim={0.08} />
      <ClipSprite id="stadium-aerial" dim={0.08} />
      <Vignette strength={0.45} />
      <div style={{
        position: 'absolute', left: 0, right: 0, bottom: 130, display: 'flex', justifyContent: 'center', zIndex: 25,
        opacity: stripP, transform: `translateY(${(1 - stripP) * 30}px)`,
      }}>
        <div style={{ display: 'flex', gap: 0, background: MV.panel, border: `1px solid ${MV.line}`, borderRadius: 16, overflow: 'hidden', backdropFilter: 'blur(6px)' }}>
          {[['GROUP K', 'WORLD CUP'], ['THE ATLANTIC', 'A SELEÇÃO'], ['THE SILK ROAD', 'WHITE WOLVES'], ['THE MONUMENT', 'vs THE DAWN']].map(([v, l], i) => (
            <div key={i} style={{ padding: '24px 42px', borderLeft: i ? `1px solid ${MV.line}` : 'none', textAlign: 'center' }}>
              <div style={{ fontFamily: '"Inter",sans-serif', fontWeight: 900, fontSize: 40, color: MV.gold }}>{v}</div>
              <div style={{ fontFamily: '"Inter",sans-serif', fontWeight: 700, fontSize: 18, color: MV.muted, letterSpacing: '0.16em', marginTop: 6 }}>{l}</div>
            </div>
          ))}
        </div>
      </div>
      <Letterbox />
    </div>
  );
}

// ── History plate (short labels only, no sentences) ──────────────────────────
function HistoryPlate({ start, end, year, venue, score, accent = MV.gold, stamp }) {
  const t = useTime();
  if (t < start || t > end) return null;
  const p = Easing.easeOutBack(clamp((t - start) / 0.8, 0, 1));
  const fade = t > end - 0.6 ? (end - t) / 0.6 : 1;
  const stampP = stamp ? Easing.easeOutBack(clamp((t - start - 1.6) / 0.5, 0, 1)) : 0;
  return (
    <div style={{
      position: 'absolute', inset: 0, zIndex: 25, display: 'flex', alignItems: 'center', justifyContent: 'center',
      opacity: clamp(p, 0, 1) * clamp(fade, 0, 1),
    }}>
      <div style={{
        transform: `scale(${0.86 + 0.14 * p})`,
        background: MV.panel, border: `1px solid ${MV.line}`, borderRadius: 24,
        padding: '52px 100px', textAlign: 'center', position: 'relative',
        boxShadow: '0 30px 110px rgba(0,0,0,0.65)', backdropFilter: 'blur(4px)',
      }}>
        <div style={{ fontFamily: '"Inter",sans-serif', fontWeight: 800, fontSize: 30, color: MV.muted, letterSpacing: '0.34em' }}>{venue}</div>
        <div style={{ fontFamily: '"Inter",sans-serif', fontWeight: 900, fontSize: 130, color: accent, lineHeight: 1.05, margin: '14px 0 6px', textShadow: `0 0 60px ${accent}44` }}>{score}</div>
        <div style={{ fontFamily: '"Inter",sans-serif', fontWeight: 800, fontSize: 44, color: MV.text, letterSpacing: '0.08em' }}>{year}</div>
        {stamp && stampP > 0 && (
          <div style={{
            position: 'absolute', top: -34, right: -60, transform: `rotate(-12deg) scale(${stampP})`,
            border: `5px solid ${UZB}`, color: UZB_LIGHT, borderRadius: 14, padding: '10px 26px',
            fontFamily: '"Inter",sans-serif', fontWeight: 900, fontSize: 38, letterSpacing: '0.1em',
            background: 'rgba(7,9,15,0.85)',
          }}>{stamp}</div>
        )}
      </div>
    </div>
  );
}

// ── Squad montage grid (uses the full generated image library) ───────────────
function SquadGrid({ start, end, players, accent }) {
  const t = useTime();
  if (t < start || t > end) return null;
  const fade = t > end - 0.5 ? (end - t) / 0.5 : 1;
  return (
    <div style={{
      position: 'absolute', inset: 0, zIndex: 25, display: 'flex', alignItems: 'center', justifyContent: 'center',
      gap: 26, opacity: clamp(fade, 0, 1), padding: '0 70px',
    }}>
      {players.map((p, i) => {
        const cp = Easing.easeOutBack(clamp((t - start - 0.25 - i * 0.28) / 0.7, 0, 1));
        return (
          <div key={i} style={{
            width: 256, transform: `translateY(${(1 - cp) * 90}px) scale(${0.85 + 0.15 * cp})`, opacity: clamp(cp, 0, 1),
            borderRadius: 22, overflow: 'hidden', background: MV.panel, border: `1px solid ${MV.line}`,
            boxShadow: `0 26px 80px rgba(0,0,0,0.6)`,
          }}>
            <div style={{ height: 280, overflow: 'hidden', position: 'relative' }}>
              <img src={p.img} alt="" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', transform: `scale(${1.02 + 0.05 * clamp((t - start) / (end - start), 0, 1)})` }} />
              {p.vid && <div style={{ position: 'absolute', inset: 0, zIndex: 1 }}><ClipSprite id={p.vid} style={{ objectFit: 'cover' }} /></div>}
              <div style={{ position: 'absolute', inset: 0, zIndex: 2, pointerEvents: 'none', boxShadow: `inset 0 -60px 60px -30px rgba(0,0,0,0.55)` }} />
            </div>
            <div style={{ padding: '16px 14px 18px', textAlign: 'center', borderTop: `4px solid ${accent}` }}>
              <div style={{ fontFamily: '"Inter",sans-serif', fontWeight: 900, fontSize: 23, color: MV.text }}>{p.name}</div>
              <div style={{ fontFamily: '"Inter",sans-serif', fontWeight: 700, fontSize: 16, color: MV.muted, letterSpacing: '0.14em', marginTop: 5 }}>{p.role}</div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ── 4. Portugal (45–75): A Seleção, the champions ────────────────────────────
function ScenePortugal() {
  const { localTime: lt } = useSprite();
  const S = 45;
  const headerP = Easing.easeOutCubic(clamp(lt / 0.9, 0, 1));
  return (
    <div style={{ position: 'absolute', inset: 0, background: 'rgba(10,12,20,0.46)' }}>
      <ClipSprite id="hist-por" dim={0.5} style={{ filter: 'brightness(0.34) saturate(0.8) contrast(1.1)' }} />
      <ClipSprite id="por-bg" dim={0.55} />
      <ClipSprite id="ronaldo" dim={0.12} />
      <ClipSprite id="bruno" dim={0.12} />
      <ClipSprite id="leao" dim={0.12} />
      <ClipSprite id="bernardo" dim={0.12} />
      <ClipSprite id="dias" dim={0.12} />
      <div style={{ position: 'absolute', inset: 0, zIndex: 22, pointerEvents: 'none', background: `linear-gradient(90deg, rgba(200,16,46,0.28) 0%, transparent 30%, transparent 70%, rgba(255,210,74,0.14) 100%)` }} />
      <div style={{ position: 'absolute', top: 108, left: 0, right: 0, display: 'flex', justifyContent: 'center', zIndex: 26, opacity: headerP, transform: `translateY(${(1 - headerP) * -24}px)` }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 26, background: MV.panel, border: `1px solid ${MV.line}`, borderRadius: 999, padding: '16px 44px' }}>
          <FlagPOR w={74} />
          <span style={{ fontFamily: '"Inter",sans-serif', fontWeight: 900, fontSize: 40, color: MV.text, letterSpacing: '0.10em' }}>PORTUGAL · A SELEÇÃO</span>
        </div>
      </div>
      <SquadGrid start={S + 19.5} end={S + 29.5} accent={POR} players={[
        { img: 'assets/squad/por-ronaldo.png', vid: 'sqp-ronaldo', name: 'C. RONALDO', role: 'THE MONUMENT' },
        { img: 'assets/squad/por-bruno.png', vid: 'sqp-bruno', name: 'BRUNO FERNANDES', role: 'THE MAESTRO' },
        { img: 'assets/squad/por-leao.png', vid: 'sqp-leao', name: 'RAFAEL LEÃO', role: 'THE CHEETAH' },
        { img: 'assets/squad/por-bernardo.png', vid: 'sqp-bernardo', name: 'BERNARDO SILVA', role: 'THE SILK' },
        { img: 'assets/squad/por-dias.png', vid: 'sqp-dias', name: 'RÚBEN DIAS', role: 'THE WALL' },
      ]} />
      <Sprite start={55.50} end={64.50}>
        <LowerThird start={55.80} name="CRISTIANO RONALDO" role="The Monument · Forward" accent={POR_LIGHT} />
      </Sprite>
      <Sprite start={64.50} end={72.00}>
        <LowerThird start={64.80} name="BRUNO FERNANDES" role="The Maestro · Midfield" accent={POR_LIGHT} />
      </Sprite>
      <Sprite start={72.00} end={75.00}>
        <LowerThird start={72.20} name="RAFAEL LEÃO" role="The Cheetah · Winger" accent={POR_LIGHT} />
      </Sprite>
      <Vignette strength={0.4} />
      <Letterbox />
    </div>
  );
}

// ── 5. Uzbekistan (75–109): the White Wolves, the debutants ──────────────────
function SceneUzbekistan() {
  const { localTime: lt } = useSprite();
  const S = 75;
  const headerP = Easing.easeOutCubic(clamp(lt / 0.9, 0, 1));
  return (
    <div style={{ position: 'absolute', inset: 0, background: 'rgba(10,12,20,0.46)' }}>
      <ClipSprite id="hist-uzb" dim={0.5} style={{ filter: 'brightness(0.34) saturate(0.8) contrast(1.1)' }} />
      <ClipSprite id="uzb-bg" dim={0.55} />
      <ClipSprite id="shomurodov" dim={0.12} />
      <ClipSprite id="fayzullaev" dim={0.12} />
      <ClipSprite id="khusanov" dim={0.12} />
      <ClipSprite id="masharipov" dim={0.12} />
      <ClipSprite id="khamdamov" dim={0.12} />
      <div style={{ position: 'absolute', inset: 0, zIndex: 22, pointerEvents: 'none', background: `linear-gradient(90deg, rgba(14,165,233,0.28) 0%, transparent 30%, transparent 70%, rgba(30,181,58,0.14) 100%)` }} />
      <div style={{ position: 'absolute', top: 108, left: 0, right: 0, display: 'flex', justifyContent: 'center', zIndex: 26, opacity: headerP, transform: `translateY(${(1 - headerP) * -24}px)` }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 26, background: MV.panel, border: `1px solid ${MV.line}`, borderRadius: 999, padding: '16px 44px' }}>
          <FlagUZB w={74} />
          <span style={{ fontFamily: '"Inter",sans-serif', fontWeight: 900, fontSize: 40, color: MV.text, letterSpacing: '0.10em' }}>UZBEKISTAN · THE WHITE WOLVES</span>
        </div>
      </div>
      <SquadGrid start={S + 11.5} end={S + 22} accent={UZB} players={[
        { img: 'assets/squad/uzb-shomurodov.png', vid: 'squ-shomurodov', name: 'E. SHOMURODOV', role: 'THE CAPTAIN' },
        { img: 'assets/squad/uzb-fayzullaev.png', vid: 'squ-fayzullaev', name: 'FAYZULLAEV', role: 'THE SPARK' },
        { img: 'assets/squad/uzb-khusanov.png', vid: 'squ-khusanov', name: 'KHUSANOV', role: 'WALL OF TASHKENT' },
        { img: 'assets/squad/uzb-masharipov.png', vid: 'squ-masharipov', name: 'MASHARIPOV', role: 'THE SET-PIECE' },
        { img: 'assets/squad/uzb-khamdamov.png', vid: 'squ-khamdamov', name: 'KHAMDAMOV', role: 'THE FEARLESS' },
      ]} />
      <Sprite start={86.00} end={97.50}>
        <LowerThird start={86.30} name="ELDOR SHOMURODOV" role="The Captain · Forward" accent={UZB_LIGHT} />
      </Sprite>
      <Sprite start={97.50} end={104.00}>
        <LowerThird start={97.80} name="ABBOSBEK FAYZULLAEV" role="The Spark · Midfield" accent={UZB_LIGHT} />
      </Sprite>
      <Sprite start={104.00} end={109.00}>
        <LowerThird start={104.30} name="ABDUKODIR KHUSANOV" role="Wall of Tashkent · Defence" accent={UZB_LIGHT} />
      </Sprite>
      <Vignette strength={0.4} />
      <Letterbox />
    </div>
  );
}

// ── 6. The duel (109–136): Ronaldo vs Khusanov split screen ──────────────────
function SceneDuel() {
  const { localTime: lt } = useSprite();
  const slideP = Easing.easeOutQuart(clamp(lt / 1.1, 0, 1));
  const vsP = Easing.easeOutBack(clamp((lt - 0.9) / 0.8, 0, 1));
  const shake = lt > 0.9 && lt < 1.25 ? Math.sin(lt * 160) * 7 * (1.25 - lt) / 0.35 : 0;
  return (
    <div style={{ position: 'absolute', inset: 0, background: 'rgba(5,6,10,0.46)', transform: `translate(${shake}px, ${-shake}px)` }}>
      <div style={{ position: 'absolute', top: 0, bottom: 0, left: 0, width: '50%', overflow: 'hidden', transform: `translateX(${(1 - slideP) * -100}%)` }}>
        <img src="assets/squad/por-ronaldo.png" alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', filter: 'saturate(1.15) brightness(0.92)' }} />
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(90deg, rgba(200,16,46,0.36), transparent 65%)' }} />
        <div style={{ position: 'absolute', bottom: 150, left: 90, fontFamily: '"Inter",sans-serif', fontWeight: 900, fontSize: 62, color: '#fff', textShadow: '0 4px 26px rgba(0,0,0,0.9)' }}>
          THE MONUMENT
          <div style={{ fontSize: 27, fontWeight: 700, color: MV.gold, letterSpacing: '0.2em', marginTop: 8 }}>CRISTIANO RONALDO</div>
        </div>
      </div>
      <div style={{ position: 'absolute', top: 0, bottom: 0, right: 0, width: '50%', overflow: 'hidden', transform: `translateX(${(1 - slideP) * 100}%)` }}>
        <img src="assets/squad/uzb-khusanov.png" alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', filter: 'saturate(1.15) brightness(0.92)' }} />
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(270deg, rgba(14,165,233,0.44), transparent 65%)' }} />
        <div style={{ position: 'absolute', bottom: 150, right: 90, textAlign: 'right', fontFamily: '"Inter",sans-serif', fontWeight: 900, fontSize: 62, color: '#fff', textShadow: '0 4px 26px rgba(0,0,0,0.9)' }}>
          THE WALL
          <div style={{ fontSize: 27, fontWeight: 700, color: MV.gold, letterSpacing: '0.2em', marginTop: 8 }}>KHUSANOV</div>
        </div>
      </div>
      <div style={{ position: 'absolute', top: 0, bottom: 0, left: 'calc(50% - 3px)', width: 6, background: `linear-gradient(180deg, transparent, ${MV.gold}, transparent)`, zIndex: 24, opacity: slideP }} />
      <div style={{
        position: 'absolute', top: '50%', left: '50%', zIndex: 26,
        transform: `translate(-50%,-50%) scale(${vsP}) rotate(${(1 - vsP) * 20}deg)`, opacity: clamp(vsP, 0, 1),
        width: 210, height: 210, borderRadius: '50%', background: MV.panel, border: `5px solid ${MV.gold}`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        boxShadow: `0 0 90px ${MV.gold}66`,
      }}>
        <span style={{ fontFamily: '"Inter",sans-serif', fontWeight: 900, fontSize: 92, color: MV.gold }}>VS</span>
      </div>
      <Sprite start={128.00} end={136.00}>
        <div style={{ position: 'absolute', left: 0, right: 0, bottom: 0, top: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 27, background: 'rgba(0,0,0,0.55)' }}>
          <Kicker size={40}>Experience vs Innocence</Kicker>
        </div>
      </Sprite>
      <Letterbox />
    </div>
  );
}

// ── 7. Match drama (136–216): Fayzullaev 0–1, Ronaldo 1–1, Ronaldo 2–1 — OUR PREDICTION
//      This is NOT a real result. The ScoreBug + final card carry the
//      "OUR PREDICTION" badge, never "FULL TIME" or anything stated as fact.
function SceneDrama() {
  const { localTime: lt } = useSprite();
  const S = 136;
  return (
    <div style={{ position: 'absolute', inset: 0, background: 'rgba(2,3,7,0.46)' }}>
      <ClipSprite id="drama-uzb1" dim={0.06} />
      <ClipSprite id="drama-fayzullaev" dim={0.1} />
      <ClipSprite id="drama-shomurodov" dim={0.1} />
      <ClipSprite id="drama-bruno" dim={0.1} />
      <ClipSprite id="drama-ronaldo" dim={0.1} />
      <ClipSprite id="drama-por-cel" dim={0.05} />
      <ClipSprite id="drama-stad" dim={0.08} />

      {/* 26th minute — predicted: Uzbekistan shock lead, their first-ever WC goal */}
      <GoalFlash at={S + 8.5} />
      <Sprite start={144.50} end={174.00}>
        <ScoreBug start={S + 8.6} por={0} uzb={1} minute="26'" badge="OUR PREDICTION" />
      </Sprite>

      {/* Portugal reply — Bruno floats it, Ronaldo rises to level */}
      <GoalFlash at={S + 38.0} />
      <Sprite start={174.00} end={192.00}>
        <ScoreBug start={S + 38.1} por={1} uzb={1} minute="71'" badge="OUR PREDICTION" />
      </Sprite>

      {/* The winner — Ronaldo strikes one final time, the last dance */}
      <GoalFlash at={S + 56.0} />
      <Sprite start={192.50} end={207.50}>
        <ScoreBug start={S + 56.1} por={2} uzb={1} minute="88'" badge="OUR PREDICTION" />
      </Sprite>

      {/* The predicted final — clearly stamped OUR PREDICTION, never FULL TIME */}
      <Sprite start={207.50} end={216.00}>
        <PredictionCard start={S + 71.8} />
      </Sprite>
      <Vignette strength={0.42} />
      <Letterbox />
    </div>
  );
}

// The predicted final scoreline — stamped OUR PREDICTION (the match isn't played).
function PredictionCard({ start }) {
  const t = useTime();
  const local = t - start;
  const p = Easing.easeOutCubic(clamp(local / 1.0, 0, 1));
  const stampP = Easing.easeOutBack(clamp((local - 1.0) / 0.6, 0, 1));
  return (
    <div style={{ position: 'absolute', inset: 0, zIndex: 26, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(2,3,6,0.62)', opacity: p }}>
      <div style={{ background: MV.panel, border: `1px solid ${MV.line}`, borderRadius: 26, padding: '60px 110px', textAlign: 'center', transform: `scale(${0.92 + 0.08 * p})`, boxShadow: '0 30px 120px rgba(0,0,0,0.7)', position: 'relative' }}>
        {stampP > 0 && (
          <div style={{
            position: 'absolute', top: -30, right: -54, transform: `rotate(-12deg) scale(${stampP})`,
            border: `4px solid ${MV.gold}`, color: MV.gold, borderRadius: 12, padding: '8px 22px',
            fontFamily: '"Inter",sans-serif', fontWeight: 900, fontSize: 26, letterSpacing: '0.14em',
            background: 'rgba(7,9,15,0.9)', zIndex: 2,
          }}>OUR PREDICTION</div>
        )}
        <Kicker size={26}>The Last Dance</Kicker>
        <div style={{ display: 'flex', alignItems: 'center', gap: 56, marginTop: 40 }}>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16 }}>
            <FlagPOR w={150} />
            <span style={{ fontFamily: '"Inter",sans-serif', fontWeight: 800, fontSize: 34, color: MV.text }}>PORTUGAL</span>
          </div>
          <BigTitle size={170} color={MV.gold}>2 — 1</BigTitle>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16 }}>
            <FlagUZB w={150} />
            <span style={{ fontFamily: '"Inter",sans-serif', fontWeight: 800, fontSize: 34, color: MV.text }}>UZBEKISTAN</span>
          </div>
        </div>
        <div style={{ fontFamily: '"Inter",sans-serif', fontWeight: 800, fontSize: 26, color: MV.muted, letterSpacing: '0.18em', marginTop: 26 }}>THE MONUMENT ANSWERS</div>
      </div>
    </div>
  );
}

// ── 8. Disclaimer + group recap (216–248): our prediction & what it means ────
function SceneVerdict() {
  const { localTime: lt } = useSprite();
  const S = 216;
  const discP = Easing.easeOutCubic(clamp(lt / 1.0, 0, 1));
  const discFade = lt > 20 ? clamp((22 - lt) / 1.0, 0, 1) : 1;
  return (
    <div style={{ position: 'absolute', inset: 0, background: 'rgba(10,15,28,0.46)' }}>
      <ClipSprite id="verdict-bg" dim={0.6} />
      {/* disclaimer beat — our prediction, real one yours to watch */}
      <Sprite start={216.00} end={238.00}>
        <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 26, opacity: discP * discFade }}>
          <div style={{ background: MV.panel, border: `1px solid ${MV.line}`, borderRadius: 22, padding: '44px 80px', textAlign: 'center', backdropFilter: 'blur(6px)' }}>
            <Kicker size={26} color={MV.gold}>Our Prediction</Kicker>
            <div style={{ fontFamily: '"Inter",sans-serif', fontWeight: 900, fontSize: 54, color: MV.text, letterSpacing: '0.04em', marginTop: 20 }}>THE REAL MATCH IS YOURS</div>
          </div>
        </div>
      </Sprite>
      {/* group recap */}
      <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 25 }}>
        <div style={{ background: MV.panel, border: `1px solid ${MV.line}`, borderRadius: 24, padding: '52px 84px', minWidth: 900, backdropFilter: 'blur(6px)', opacity: clamp((lt - 22.5) / 1.0, 0, 1) }}>
          <Kicker size={26}>Group K · Our Prediction</Kicker>
          <div style={{ marginTop: 26 }}>
            <StatLine start={S + 23} delay={0.0} label="PORTUGAL" value="MARCHING ON" accent={POR_LIGHT} />
            <StatLine start={S + 23} delay={0.25} label="UZBEKISTAN" value="UNFORGOTTEN" accent={UZB_LIGHT} />
            <StatLine start={S + 23} delay={0.5} label="OUR PREDICTION" value="POR 2 — 1 UZB" accent={MV.text} />
            <StatLine start={S + 23} delay={0.75} label="88' RONALDO" value="WINS IT" accent={MV.gold} />
          </div>
        </div>
      </div>
      <Vignette strength={0.5} />
      <Letterbox />
    </div>
  );
}

// ── 9. Engagement (248–258): comment prompts ─────────────────────────────────
function SceneEngage() {
  const { localTime: lt } = useSprite();
  const headP = Easing.easeOutCubic(clamp(lt / 0.9, 0, 1));
  const cards = [
    { label: 'COMMENT SELEÇÃO', sub: 'THE MONUMENT ANSWERS', flag: <FlagPOR w={80} />, accent: POR_LIGHT },
    { label: 'COMMENT WOLVES', sub: 'THE SILK ROAD RISES', flag: <FlagUZB w={80} />, accent: UZB_LIGHT },
  ];
  return (
    <div style={{ position: 'absolute', inset: 0, background: 'rgba(10,15,28,0.46)' }}>
      <div style={{ position: 'absolute', inset: 0, background: `radial-gradient(ellipse at 50% 30%, rgba(255,210,74,0.10) 0%, transparent 55%)` }} />
      <div style={{ position: 'absolute', top: 150, left: 0, right: 0, textAlign: 'center', zIndex: 25, opacity: headP }}>
        <Kicker size={30}>Do You Agree?</Kicker>
      </div>
      <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 60, zIndex: 25 }}>
        {cards.map((c, i) => {
          const cp = Easing.easeOutBack(clamp((lt - 0.8 - i * 0.4) / 0.7, 0, 1));
          return (
            <div key={i} style={{
              transform: `translateY(${(1 - cp) * 60}px) scale(${0.85 + 0.15 * cp})`, opacity: clamp(cp, 0, 1),
              background: MV.panel, border: `1px solid ${MV.line}`, borderRadius: 22,
              padding: '40px 56px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 20, minWidth: 360,
              boxShadow: '0 24px 70px rgba(0,0,0,0.5)', borderTop: `5px solid ${c.accent}`,
            }}>
              {c.flag}
              <div style={{ fontFamily: '"Inter",sans-serif', fontWeight: 900, fontSize: 38, color: MV.text }}>{c.label}</div>
              <div style={{ fontFamily: '"Inter",sans-serif', fontWeight: 700, fontSize: 22, color: MV.muted, letterSpacing: '0.16em' }}>{c.sub}</div>
            </div>
          );
        })}
      </div>
      <Vignette strength={0.45} />
      <Letterbox />
    </div>
  );
}

// ── 10. Mystery Supporter (258–279): the series' signature collectible card ──
function SceneMystery() {
  const { localTime: lt } = useSprite();
  const S = 258;
  const inP = Easing.easeOutCubic(clamp((lt - 0.6) / 1.4, 0, 1));
  const cardP = Easing.easeOutBack(clamp((lt - 4.2) / 0.9, 0, 1));
  // repeating holo sweep across the card so it never sits dead
  const shine = lt > 5 ? -40 + (((lt - 5) * 26) % 240) : -60;
  const floatY = Math.sin(lt * 1.05) * 5; // continuous gentle float once card is in
  const floatR = Math.sin(lt * 0.6) * 0.6;
  return (
    <div style={{ position: 'absolute', inset: 0, background: 'rgba(2,3,10,0.46)' }}>
      <ClipSprite id="mystery" dim={0.12} />
      <ClipSprite id="mystery-close" dim={0.18} />
      {/* drifting fog layers */}
      <div style={{
        position: 'absolute', inset: 0, zIndex: 21, pointerEvents: 'none', opacity: 0.5,
        background: `radial-gradient(ellipse at ${20 + Math.sin(lt * 0.3) * 14}% 75%, rgba(200,16,46,0.18) 0%, transparent 45%),` +
                    `radial-gradient(ellipse at ${78 - Math.sin(lt * 0.22) * 12}% 30%, rgba(14,165,233,0.16) 0%, transparent 50%)`,
      }} />
      <AmbientParticles start={S} dur={20} count={46} color="252,228,150" maxR={3.5} zIndex={22} />
      <div style={{ position: 'absolute', top: 118, left: 0, right: 0, textAlign: 'center', zIndex: 25, opacity: inP }}>
        <Kicker size={26} color="#e8c97a">The Mystery Supporter · Legend No. 047</Kicker>
      </div>
      {/* Premium COLLECTIBLE CARD */}
      {cardP > 0 && (
        <div style={{
          position: 'absolute', left: '50%', top: '52%', zIndex: 25,
          opacity: clamp(cardP, 0, 1),
          transform: `translate(-50%,-50%) translateY(${(1 - cardP) * 50 + cardP * floatY}px) rotate(${cardP * floatR}deg) scale(${0.9 + 0.1 * cardP})`,
        }}>
          <div style={{
            position: 'relative', width: 760, borderRadius: 26, overflow: 'hidden',
            padding: '5px',
            background: 'linear-gradient(150deg, #f4d784 0%, #b9842c 30%, #f8e9a8 55%, #9c6a1d 80%, #f4d784 100%)',
            boxShadow: '0 30px 120px rgba(0,0,0,0.75)',
          }}>
            <div style={{
              borderRadius: 22, background: 'linear-gradient(160deg, #0a1430 0%, #0c244e 55%, #08101f 100%)',
              padding: '34px 46px', position: 'relative', overflow: 'hidden',
            }}>
              {/* card number badge */}
              <div style={{
                position: 'absolute', top: 26, right: 30,
                width: 96, height: 96, borderRadius: '50%',
                background: 'radial-gradient(circle at 35% 30%, #fbe9a8, #c9942e 70%)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                boxShadow: '0 8px 30px rgba(0,0,0,0.5), inset 0 0 0 3px rgba(255,255,255,0.35)',
              }}>
                <span style={{ fontFamily: '"Inter",sans-serif', fontWeight: 900, fontSize: 40, color: '#3a2706' }}>047</span>
              </div>
              <div style={{ fontFamily: '"Inter",sans-serif', fontWeight: 800, fontSize: 22, color: '#e8c97a', letterSpacing: '0.28em' }}>LEGEND 047</div>
              <div style={{ fontFamily: '"Inter",sans-serif', fontWeight: 900, fontSize: 64, color: '#f6f9ff', letterSpacing: '0.01em', marginTop: 8, lineHeight: 1.05, maxWidth: 540 }}>THE FADO SINGER</div>
              <div style={{ fontFamily: '"Inter",sans-serif', fontWeight: 700, fontSize: 22, color: '#9fb6e0', letterSpacing: '0.16em', marginTop: 14, textTransform: 'uppercase' }}>The Voice of Saudade · Portugal</div>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: 12, marginTop: 24, background: 'rgba(255,210,74,0.14)', border: '1px solid rgba(255,210,74,0.55)', borderRadius: 999, padding: '12px 28px' }}>
                <span style={{ fontSize: 26 }}>✦</span>
                <span style={{ fontFamily: '"Inter",sans-serif', fontWeight: 800, fontSize: 24, color: MV.gold, letterSpacing: '0.08em' }}>COLLECT IT · worldcup26.world</span>
              </div>
              {/* holo shine sweep */}
              <div style={{
                position: 'absolute', inset: 0, pointerEvents: 'none',
                background: `linear-gradient(115deg, transparent ${shine - 14}%, rgba(255,255,255,0.28) ${shine}%, transparent ${shine + 14}%)`,
                mixBlendMode: 'overlay',
              }} />
            </div>
          </div>
        </div>
      )}
      <Vignette strength={0.55} />
      <Letterbox />
    </div>
  );
}

// ── 11. App promo (279–293): worldcup26.world ────────────────────────────────
function SceneApp() {
  const { localTime: lt } = useSprite();
  const inP = Easing.easeOutCubic(clamp(lt / 1.0, 0, 1));
  const cards = [
    { name: 'UZBEKISTAN', mult: 'EVERY GOAL SCORES', flag: <FlagUZB w={86} /> },
    { name: 'PORTUGAL', mult: 'EVERY GOAL SCORES', flag: <FlagPOR w={86} /> },
    { name: 'BRAZIL', mult: 'EVERY GOAL SCORES', flag: <div style={{ width: 86, height: 57, borderRadius: 6, background: 'linear-gradient(135deg,#159b46 55%,#ffd24a 55%)' }} /> },
  ];
  return (
    <div style={{ position: 'absolute', inset: 0, background: `linear-gradient(160deg, #0d2a20 0%, #07090f 70%)` }}>
      <div style={{ position: 'absolute', inset: 0, background: `radial-gradient(ellipse at 50% 20%, rgba(16,107,79,0.35) 0%, transparent 60%)` }} />
      <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 46, opacity: inP }}>
        <Kicker color="#7fd6b5" size={30}>The Prediction Game</Kicker>
        <BigTitle size={104} color="#fff" glow={MV.green}>worldcup26.world</BigTitle>
        <Kicker color="#cfe9de" size={30}>Pick 3 Of 48</Kicker>
        <div style={{ display: 'flex', gap: 36, marginTop: 12 }}>
          {cards.map((c, i) => {
            const cp = Easing.easeOutBack(clamp((lt - 1.2 - i * 0.35) / 0.7, 0, 1));
            return (
              <div key={i} style={{
                transform: `translateY(${(1 - cp) * 60}px) scale(${0.8 + 0.2 * cp})`, opacity: clamp(cp, 0, 1),
                background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.18)', borderRadius: 22,
                padding: '34px 46px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 18, minWidth: 290,
                boxShadow: '0 24px 70px rgba(0,0,0,0.45)',
              }}>
                {c.flag}
                <div style={{ fontFamily: '"Inter",sans-serif', fontWeight: 900, fontSize: 32, color: '#fff' }}>{c.name}</div>
                <div style={{ fontFamily: '"Inter",sans-serif', fontWeight: 800, fontSize: 22, color: MV.gold }}>{c.mult}</div>
              </div>
            );
          })}
        </div>
        <div style={{ fontFamily: '"Inter",sans-serif', fontWeight: 800, fontSize: 34, color: MV.gold, letterSpacing: '0.06em', marginTop: 8 }}>
          free · just for fun · no prizes
        </div>
      </div>
      <Letterbox />
    </div>
  );
}

// ── 12. CTA outro (293–308) ──────────────────────────────────────────────────
function SceneCTA() {
  const { localTime: lt } = useSprite();
  const S = 293;
  const inP = Easing.easeOutCubic(clamp(lt / 0.8, 0, 1));
  return (
    <div style={{ position: 'absolute', inset: 0, background: 'rgba(7,9,15,0.46)' }}>
      <ClipSprite id="cta-bg" dim={0.68} />
      <AmbientParticles start={295.24} dur={6} count={28} />
      <div style={{ position: 'absolute', inset: 0, zIndex: 23, background: 'radial-gradient(ellipse at 50% 35%, transparent 0%, rgba(7,9,15,0.88) 75%)' }} />
      <div style={{ position: 'absolute', top: 200, left: 0, right: 0, textAlign: 'center', zIndex: 25, opacity: inP }}>
        <Kicker size={30}>WorldCup26 Legends</Kicker>
        <div style={{ marginTop: 24 }}><TitleReveal text="JOIN THE LEGENDS" start={S + 0.5} size={92} color={MV.text} /></div>
      </div>
      <div style={{ position: 'absolute', inset: 0, zIndex: 26 }}>
        <CtaButton start={S} delay={1.2} label="SUBSCRIBE" icon="🔔" accent="#16a34a" x={500} />
        <CtaButton start={S} delay={1.6} label="LIKE" icon="👍" accent="#c8102e" x={960} />
        <CtaButton start={S} delay={2.0} label="SHARE" icon="📣" accent="#0ea5e9" x={1400} />
      </div>
      <Sprite start={297.50} end={308.00}>
        <NextMatchTease start={S + 4.6} />
      </Sprite>
      <Letterbox />
    </div>
  );
}

function NextMatchTease({ start }) {
  const t = useTime();
  const p = Easing.easeOutCubic(clamp((t - start) / 0.8, 0, 1));
  return (
    <div style={{ position: 'absolute', left: 0, right: 0, bottom: 150, display: 'flex', justifyContent: 'center', zIndex: 26, opacity: p, transform: `translateY(${(1 - p) * 24}px)` }}>
      <div style={{ background: MV.panel, border: `1px solid ${MV.line}`, borderRadius: 999, padding: '20px 54px', display: 'flex', alignItems: 'center', gap: 22 }}>
        <span style={{ fontFamily: '"Inter",sans-serif', fontWeight: 700, fontSize: 26, color: MV.muted, letterSpacing: '0.14em' }}>NEXT EPISODE</span>
        <span style={{ fontFamily: '"Inter",sans-serif', fontWeight: 900, fontSize: 30, color: MV.gold }}>⚡ EP48 · COLLECT LEGEND 047 · worldcup26.world</span>
      </div>
    </div>
  );
}
