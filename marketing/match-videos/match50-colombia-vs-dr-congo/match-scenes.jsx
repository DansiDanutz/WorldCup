// match-scenes.jsx — the scenes of the Ep50 video (308s timeline).
// Colombia vs D.R. Congo · "Two Rhythms, One Game" · Group K.
// SPINE: Congolese rumba vs Colombian cumbia — two peoples separated by an ocean,
// united by rhythm. Does the night crown a winner, or prove football is the
// language both already speak?
// MATCH NOT YET PLAYED — predicted Colombia 2–1 (D.R. Congo shock lead via
// Bakambu 30', then Díaz 55' equaliser & Durán 86' winner off a James assist).
// Every scoreline/goal is OUR PREDICTION, clearly labelled, never stated as a real result.
// Scene windows must match the SCENES table in match.html and narration.json.
// NOTE: nested <Sprite> windows are GLOBAL seconds (Sprite reads the timeline clock).

// Local team colours (kit must not be modified).
const COL = '#fcd116';        // Colombia yellow
const COL_LIGHT = '#ffe066';
const COD = '#007fff';        // D.R. Congo sky blue
const COD_LIGHT = '#4da6ff';
const ACCENT_RED = '#ce1126'; // shared red accent

// Colombia flag — yellow (half the height), then a band of blue, then a band of red.
function FlagCOL({ w = 120 }) {
  const h = w * 2 / 3;
  return (
    <div style={{ width: w, height: h, borderRadius: w * 0.05, position: 'relative', overflow: 'hidden', display: 'flex', flexDirection: 'column', boxShadow: '0 6px 18px rgba(0,0,0,0.45)' }}>
      <div style={{ flex: 2, background: '#fcd116' }} />
      <div style={{ flex: 1, background: '#003893' }} />
      <div style={{ flex: 1, background: '#ce1126' }} />
    </div>
  );
}

// D.R. Congo flag — sky-blue field, a red diagonal stripe edged thin yellow
// from bottom-left to top-right, and a yellow five-pointed star in the upper hoist.
function FlagCOD({ w = 120 }) {
  const h = w * 2 / 3;
  return (
    <div style={{ width: w, height: h, borderRadius: w * 0.05, position: 'relative', overflow: 'hidden', background: '#007fff', boxShadow: '0 6px 18px rgba(0,0,0,0.45)' }}>
      {/* diagonal stripe: yellow edges then red core, bottom-left -> top-right */}
      <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(45deg, transparent 38%, #f7d518 38%, #f7d518 42%, #ce1126 42%, #ce1126 58%, #f7d518 58%, #f7d518 62%, transparent 62%)' }} />
      {/* five-pointed star, upper hoist */}
      <span style={{
        position: 'absolute', left: '14%', top: '20%', transform: 'translate(-50%,-50%)',
        color: '#f7d518', fontSize: h * 0.34, lineHeight: 1,
      }}>★</span>
    </div>
  );
}

// Match scoreboard chip (top center) — COLOMBIA vs D.R. CONGO. Local override of the
// kit's ScoreBug so the labels/props/colours track this episode (kit unchanged).
// Ep50 is UNPLAYED — the 2–1 is OUR PREDICTION, badge defaults to "OUR PREDICTION".
function ScoreBug({ start, col = 0, cod = 0, minute, badge = "OUR PREDICTION" }) {
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
        <div style={{ ...cell, background: COL, color: '#1a1a1a' }}>COL</div>
        <div style={{ ...cell, fontSize: 38, color: MV.gold }}>{col} — {cod}</div>
        <div style={{ ...cell, background: COD, color: '#fff' }}>COD</div>
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

// ── 1. Cold open (0–26): heartbeat in the dark, flash glimpses, hook line ────
function SceneColdOpen() {
  const { localTime: lt } = useSprite();
  const beat = Math.pow(Math.max(0, Math.sin(lt * Math.PI * 1.15)), 8);
  const titleP = Easing.easeOutCubic(clamp((lt - 20.6) / 1.4, 0, 1));
  return (
    <div style={{ position: 'absolute', inset: 0, background: 'rgba(2,3,7,0.46)' }}>
      {/* moving flash-glimpses of what's coming (video, not stills) */}
      <ClipSprite id="glimpse-stad" style={{ filter: 'brightness(0.78) contrast(1.15) saturate(1.2)' }} />
      <ClipSprite id="glimpse-eldorado" style={{ filter: 'brightness(0.74) contrast(1.12) saturate(1.05)' }} />
      <ClipSprite id="glimpse-james" style={{ filter: 'brightness(0.78) contrast(1.15) saturate(1.2)' }} />
      <ClipSprite id="glimpse-bakambu" style={{ filter: 'brightness(0.78) contrast(1.15) saturate(1.2)' }} />
      {/* ember base so the screen never reads as dead air */}
      <div style={{
        position: 'absolute', inset: 0,
        background: `radial-gradient(ellipse at 50% 78%, rgba(0,127,255,0.12) 0%, transparent 55%)`,
      }} />
      {/* heartbeat glow */}
      <div style={{
        position: 'absolute', inset: 0,
        background: `radial-gradient(ellipse at center, rgba(252,209,22,${(0.42 * beat).toFixed(3)}) 0%, transparent 62%)`,
      }} />
      <Vignette strength={0.8} />
      {lt > 20.6 && (
        <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 34, opacity: titleP, zIndex: 22 }}>
          <Kicker size={34}>One Language, Two Oceans</Kicker>
          <TitleReveal text="TWO RHYTHMS" start={22.4} size={140} color={MV.gold} />
        </div>
      )}
      <Letterbox />
    </div>
  );
}

// ── 2. Title card (26–34) ────────────────────────────────────────────────────
function SceneTitle() {
  const { localTime: lt } = useSprite();
  const p1 = Easing.easeOutCubic(clamp(lt / 1.0, 0, 1));
  const p2 = Easing.easeOutBack(clamp((lt - 0.8) / 1.0, 0, 1));
  const p3 = Easing.easeOutCubic(clamp((lt - 1.7) / 0.9, 0, 1));
  return (
    <div style={{ position: 'absolute', inset: 0, background: `linear-gradient(180deg, #0a0f1c 0%, #11182b 55%, #0a0f1c 100%)` }}>
      <div style={{ position: 'absolute', inset: 0, background: `radial-gradient(ellipse at 50% 30%, rgba(255,210,74,0.10) 0%, transparent 55%)` }} />
      <AmbientParticles start={26.65} dur={8} count={34} />
      <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 44 }}>
        <div style={{ opacity: p1, transform: `translateY(${(1 - p1) * -30}px)` }}>
          <Kicker>WorldCup26 Legends · Episode 50</Kicker>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 70, opacity: clamp(p2, 0, 1), transform: `scale(${p2})` }}>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 20 }}>
            <Waving><FlagCOL w={230} /></Waving>
            <BigTitle size={66} glow={COL_LIGHT}>COLOMBIA</BigTitle>
          </div>
          <BigTitle size={120} color={MV.gold}>VS</BigTitle>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 20 }}>
            <Waving speed={1.9}><FlagCOD w={230} /></Waving>
            <BigTitle size={66} glow={COD_LIGHT}>D.R. CONGO</BigTitle>
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

// ── 3. Stadium (34–44): flyover clip + stakes ────────────────────────────────
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
          {[['GROUP K', 'WORLD CUP'], ['CUMBIA', 'vs RUMBA'], ['CAFETEROS', 'LEOPARDS'], ['FLAIR', 'vs FIRE']].map(([v, l], i) => (
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
            border: `5px solid ${COD}`, color: COD_LIGHT, borderRadius: 14, padding: '10px 26px',
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

// ── 4. Colombia (44–77): Los Cafeteros, the cumbia ───────────────────────────
function SceneColombia() {
  const { localTime: lt } = useSprite();
  const S = 44;
  const headerP = Easing.easeOutCubic(clamp(lt / 0.9, 0, 1));
  return (
    <div style={{ position: 'absolute', inset: 0, background: 'rgba(10,12,20,0.46)' }}>
      <ClipSprite id="hist-col" dim={0.5} style={{ filter: 'brightness(0.34) saturate(0.8) contrast(1.1)' }} />
      <ClipSprite id="col-bg" dim={0.55} />
      <ClipSprite id="james" dim={0.12} />
      <ClipSprite id="diaz" dim={0.12} />
      <ClipSprite id="duran" dim={0.12} />
      <ClipSprite id="munoz" dim={0.12} />
      <ClipSprite id="arias" dim={0.12} />
      <div style={{ position: 'absolute', inset: 0, zIndex: 22, pointerEvents: 'none', background: `linear-gradient(90deg, rgba(252,209,22,0.22) 0%, transparent 30%, transparent 70%, rgba(0,127,255,0.16) 100%)` }} />
      <div style={{ position: 'absolute', top: 108, left: 0, right: 0, display: 'flex', justifyContent: 'center', zIndex: 26, opacity: headerP, transform: `translateY(${(1 - headerP) * -24}px)` }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 26, background: MV.panel, border: `1px solid ${MV.line}`, borderRadius: 999, padding: '16px 44px' }}>
          <FlagCOL w={74} />
          <span style={{ fontFamily: '"Inter",sans-serif', fontWeight: 900, fontSize: 40, color: MV.text, letterSpacing: '0.10em' }}>LOS CAFETEROS</span>
        </div>
      </div>
      <SquadGrid start={S + 19.5} end={S + 29.5} accent={COL} players={[
        { img: 'assets/squad/col-james.png', vid: 'sqc-james', name: 'JAMES RODRÍGUEZ', role: 'THE MAESTRO' },
        { img: 'assets/squad/col-diaz.png', vid: 'sqc-diaz', name: 'LUIS DÍAZ', role: 'EL TREN' },
        { img: 'assets/squad/col-duran.png', vid: 'sqc-duran', name: 'JHON DURÁN', role: 'THE TANK' },
        { img: 'assets/squad/col-arias.png', vid: 'sqc-arias', name: 'JORGE ARIAS', role: 'THE SPARK' },
        { img: 'assets/squad/col-munoz.png', vid: 'sqc-munoz', name: 'DANIEL MUÑOZ', role: 'THE ENGINE' },
      ]} />
      <Sprite start={54.50} end={64.50}>
        <LowerThird start={54.80} name="JAMES RODRÍGUEZ" role="The Maestro · Playmaker" accent={COL_LIGHT} />
      </Sprite>
      <Sprite start={64.50} end={73.00}>
        <LowerThird start={64.80} name="LUIS DÍAZ" role="El Tren · Winger" accent={COL_LIGHT} />
      </Sprite>
      <Sprite start={73.00} end={77.00}>
        <LowerThird start={73.20} name="JHON DURÁN" role="The Tank · Forward" accent={COL_LIGHT} />
      </Sprite>
      <Vignette strength={0.4} />
      <Letterbox />
    </div>
  );
}

// ── 5. D.R. Congo (77–109): the Leopards, the rumba ──────────────────────────
function SceneCongo() {
  const { localTime: lt } = useSprite();
  const S = 77;
  const headerP = Easing.easeOutCubic(clamp(lt / 0.9, 0, 1));
  return (
    <div style={{ position: 'absolute', inset: 0, background: 'rgba(10,12,20,0.46)' }}>
      <ClipSprite id="hist-cod" dim={0.5} style={{ filter: 'brightness(0.34) saturate(0.8) contrast(1.1)' }} />
      <ClipSprite id="cod-bg" dim={0.55} />
      <ClipSprite id="bakambu" dim={0.12} />
      <ClipSprite id="wissa" dim={0.12} />
      <ClipSprite id="mbemba" dim={0.12} />
      <ClipSprite id="silas" dim={0.12} />
      <ClipSprite id="masuaku" dim={0.12} />
      <div style={{ position: 'absolute', inset: 0, zIndex: 22, pointerEvents: 'none', background: `linear-gradient(90deg, rgba(0,127,255,0.26) 0%, transparent 30%, transparent 70%, rgba(206,17,38,0.14) 100%)` }} />
      <div style={{ position: 'absolute', top: 108, left: 0, right: 0, display: 'flex', justifyContent: 'center', zIndex: 26, opacity: headerP, transform: `translateY(${(1 - headerP) * -24}px)` }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 26, background: MV.panel, border: `1px solid ${MV.line}`, borderRadius: 999, padding: '16px 44px' }}>
          <FlagCOD w={74} />
          <span style={{ fontFamily: '"Inter",sans-serif', fontWeight: 900, fontSize: 40, color: MV.text, letterSpacing: '0.10em' }}>THE LEOPARDS</span>
        </div>
      </div>
      <SquadGrid start={S + 11.5} end={S + 22} accent={COD} players={[
        { img: 'assets/squad/cod-bakambu.png', vid: 'sqd-bakambu', name: 'C. BAKAMBU', role: 'THE PREDATOR' },
        { img: 'assets/squad/cod-wissa.png', vid: 'sqd-wissa', name: 'YOANE WISSA', role: 'THE MENACE' },
        { img: 'assets/squad/cod-mbemba.png', vid: 'sqd-mbemba', name: 'C. MBEMBA', role: 'THE CAPTAIN' },
        { img: 'assets/squad/cod-silas.png', vid: 'sqd-silas', name: 'SILAS', role: 'THE WINGER' },
        { img: 'assets/squad/cod-masuaku.png', vid: 'sqd-masuaku', name: 'MASUAKU', role: 'THE MARAUDER' },
      ]} />
      <Sprite start={88.00} end={97.50}>
        <LowerThird start={88.30} name="CÉDRIC BAKAMBU" role="The Predator · Forward" accent={COD_LIGHT} />
      </Sprite>
      <Sprite start={97.50} end={104.00}>
        <LowerThird start={97.80} name="YOANE WISSA" role="The Menace · Forward" accent={COD_LIGHT} />
      </Sprite>
      <Sprite start={104.00} end={109.00}>
        <LowerThird start={104.30} name="CHANCEL MBEMBA" role="The Captain · Defender" accent={COD_LIGHT} />
      </Sprite>
      <Vignette strength={0.4} />
      <Letterbox />
    </div>
  );
}

// ── 6. The duel (109–136): James vs Bakambu split screen ─────────────────────
function SceneDuel() {
  const { localTime: lt } = useSprite();
  const slideP = Easing.easeOutQuart(clamp(lt / 1.1, 0, 1));
  const vsP = Easing.easeOutBack(clamp((lt - 0.9) / 0.8, 0, 1));
  const shake = lt > 0.9 && lt < 1.25 ? Math.sin(lt * 160) * 7 * (1.25 - lt) / 0.35 : 0;
  return (
    <div style={{ position: 'absolute', inset: 0, background: 'rgba(5,6,10,0.46)', transform: `translate(${shake}px, ${-shake}px)` }}>
      <div style={{ position: 'absolute', top: 0, bottom: 0, left: 0, width: '50%', overflow: 'hidden', transform: `translateX(${(1 - slideP) * -100}%)` }}>
        <img src="assets/squad/col-james.png" alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', filter: 'saturate(1.15) brightness(0.92)' }} />
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(90deg, rgba(252,209,22,0.30), transparent 65%)' }} />
        <div style={{ position: 'absolute', bottom: 150, left: 90, fontFamily: '"Inter",sans-serif', fontWeight: 900, fontSize: 62, color: '#fff', textShadow: '0 4px 26px rgba(0,0,0,0.9)' }}>
          THE MAESTRO
          <div style={{ fontSize: 27, fontWeight: 700, color: MV.gold, letterSpacing: '0.2em', marginTop: 8 }}>JAMES RODRÍGUEZ</div>
        </div>
      </div>
      <div style={{ position: 'absolute', top: 0, bottom: 0, right: 0, width: '50%', overflow: 'hidden', transform: `translateX(${(1 - slideP) * 100}%)` }}>
        <img src="assets/squad/cod-bakambu.png" alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', filter: 'saturate(1.15) brightness(0.92)' }} />
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(270deg, rgba(0,127,255,0.40), transparent 65%)' }} />
        <div style={{ position: 'absolute', bottom: 150, right: 90, textAlign: 'right', fontFamily: '"Inter",sans-serif', fontWeight: 900, fontSize: 62, color: '#fff', textShadow: '0 4px 26px rgba(0,0,0,0.9)' }}>
          THE PREDATOR
          <div style={{ fontSize: 27, fontWeight: 700, color: MV.gold, letterSpacing: '0.2em', marginTop: 8 }}>CÉDRIC BAKAMBU</div>
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
          <Kicker size={40}>Flair vs Fire</Kicker>
        </div>
      </Sprite>
      <Letterbox />
    </div>
  );
}

// ── 7. Match drama (136–216): Bakambu 0–1, Díaz 1–1, Durán 2–1 — OUR PREDICTION
//      This is NOT a real result. The ScoreBug + final card carry the
//      "OUR PREDICTION" badge, never "FULL TIME" or anything stated as fact.
function SceneDrama() {
  const { localTime: lt } = useSprite();
  const S = 136;
  return (
    <div style={{ position: 'absolute', inset: 0, background: 'rgba(2,3,7,0.46)' }}>
      <ClipSprite id="drama-cod1" dim={0.06} />
      <ClipSprite id="drama-bakambu" dim={0.1} />
      <ClipSprite id="drama-james" dim={0.1} />
      <ClipSprite id="drama-diaz" dim={0.1} />
      <ClipSprite id="drama-duran" dim={0.1} />
      <ClipSprite id="drama-col-cel" dim={0.05} />
      <ClipSprite id="drama-stad" dim={0.08} />

      {/* 30th minute — predicted: D.R. Congo shock lead, Bakambu finishes cold */}
      <GoalFlash at={S + 18.5} />
      <Sprite start={154.50} end={185.00}>
        <ScoreBug start={S + 18.6} col={0} cod={1} minute="30'" badge="OUR PREDICTION" />
      </Sprite>

      {/* Colombia reply — James threads it, Díaz level */}
      <GoalFlash at={S + 49.5} />
      <Sprite start={185.00} end={204.00}>
        <ScoreBug start={S + 49.6} col={1} cod={1} minute="55'" badge="OUR PREDICTION" />
      </Sprite>

      {/* The winner — Durán powers home off a James assist */}
      <GoalFlash at={S + 68.5} />
      <Sprite start={204.50} end={207.50}>
        <ScoreBug start={S + 68.6} col={2} cod={1} minute="86'" badge="OUR PREDICTION" />
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
        <Kicker size={26}>The Maestro's Final Note</Kicker>
        <div style={{ display: 'flex', alignItems: 'center', gap: 56, marginTop: 40 }}>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16 }}>
            <FlagCOL w={150} />
            <span style={{ fontFamily: '"Inter",sans-serif', fontWeight: 800, fontSize: 34, color: MV.text }}>COLOMBIA</span>
          </div>
          <BigTitle size={170} color={MV.gold}>2 — 1</BigTitle>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16 }}>
            <FlagCOD w={150} />
            <span style={{ fontFamily: '"Inter",sans-serif', fontWeight: 800, fontSize: 34, color: MV.text }}>D.R. CONGO</span>
          </div>
        </div>
        <div style={{ fontFamily: '"Inter",sans-serif', fontWeight: 800, fontSize: 26, color: MV.muted, letterSpacing: '0.18em', marginTop: 26 }}>TWO RHYTHMS, ONE GAME</div>
      </div>
    </div>
  );
}

// ── 8. Disclaimer + group recap (216–240): our prediction & what it means ────
function SceneVerdict() {
  const { localTime: lt } = useSprite();
  const S = 216;
  const discP = Easing.easeOutCubic(clamp(lt / 1.0, 0, 1));
  const discFade = lt > 14 ? clamp((16 - lt) / 1.0, 0, 1) : 1;
  return (
    <div style={{ position: 'absolute', inset: 0, background: 'rgba(10,15,28,0.46)' }}>
      <ClipSprite id="verdict-bg" dim={0.6} />
      {/* disclaimer beat — our prediction, real one yours to watch */}
      <Sprite start={216.00} end={232.00}>
        <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 26, opacity: discP * discFade }}>
          <div style={{ background: MV.panel, border: `1px solid ${MV.line}`, borderRadius: 22, padding: '44px 80px', textAlign: 'center', backdropFilter: 'blur(6px)' }}>
            <Kicker size={26} color={MV.gold}>Our Prediction</Kicker>
            <div style={{ fontFamily: '"Inter",sans-serif', fontWeight: 900, fontSize: 54, color: MV.text, letterSpacing: '0.04em', marginTop: 20 }}>THE REAL MATCH IS YOURS</div>
          </div>
        </div>
      </Sprite>
      {/* group recap */}
      <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 25 }}>
        <div style={{ background: MV.panel, border: `1px solid ${MV.line}`, borderRadius: 24, padding: '52px 84px', minWidth: 900, backdropFilter: 'blur(6px)', opacity: clamp((lt - 16.5) / 1.0, 0, 1) }}>
          <Kicker size={26}>Group K · Our Prediction</Kicker>
          <div style={{ marginTop: 26 }}>
            <StatLine start={S + 17} delay={0.0} label="COLOMBIA" value="THE CUMBIA" accent={COL_LIGHT} />
            <StatLine start={S + 17} delay={0.25} label="D.R. CONGO" value="THE RUMBA" accent={COD_LIGHT} />
            <StatLine start={S + 17} delay={0.5} label="OUR PREDICTION" value="COL 2 — 1 COD" accent={MV.text} />
            <StatLine start={S + 17} delay={0.75} label="86' DURÁN" value="WINS IT" accent={MV.gold} />
          </div>
        </div>
      </div>
      <Vignette strength={0.5} />
      <Letterbox />
    </div>
  );
}

// ── 9. Engagement (240–250): comment prompts ─────────────────────────────────
function SceneEngage() {
  const { localTime: lt } = useSprite();
  const headP = Easing.easeOutCubic(clamp(lt / 0.9, 0, 1));
  const cards = [
    { label: 'COMMENT CAFETEROS', sub: 'COLOMBIA FLAIR', flag: <FlagCOL w={80} />, accent: COL_LIGHT },
    { label: 'COMMENT LEOPARDS', sub: 'CONGO FIRE', flag: <FlagCOD w={80} />, accent: COD_LIGHT },
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
              <div style={{ fontFamily: '"Inter",sans-serif', fontWeight: 900, fontSize: 34, color: MV.text }}>{c.label}</div>
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

// ── 10. Mystery Supporter (250–271): the series' signature collectible card ──
function SceneMystery() {
  const { localTime: lt } = useSprite();
  const S = 250;
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
        background: `radial-gradient(ellipse at ${20 + Math.sin(lt * 0.3) * 14}% 75%, rgba(252,209,22,0.18) 0%, transparent 45%),` +
                    `radial-gradient(ellipse at ${78 - Math.sin(lt * 0.22) * 12}% 30%, rgba(0,127,255,0.16) 0%, transparent 50%)`,
      }} />
      <AmbientParticles start={S} dur={20} count={46} color="252,228,150" maxR={3.5} zIndex={22} />
      <div style={{ position: 'absolute', top: 118, left: 0, right: 0, textAlign: 'center', zIndex: 25, opacity: inP }}>
        <Kicker size={26} color="#e8c97a">The Mystery Supporter · Legend No. 050</Kicker>
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
                <span style={{ fontFamily: '"Inter",sans-serif', fontWeight: 900, fontSize: 40, color: '#3a2706' }}>050</span>
              </div>
              <div style={{ fontFamily: '"Inter",sans-serif', fontWeight: 800, fontSize: 22, color: '#e8c97a', letterSpacing: '0.28em' }}>LEGEND 050</div>
              <div style={{ fontFamily: '"Inter",sans-serif', fontWeight: 900, fontSize: 64, color: '#f6f9ff', letterSpacing: '0.01em', marginTop: 8, lineHeight: 1.05, maxWidth: 540 }}>EL DORADO</div>
              <div style={{ fontFamily: '"Inter",sans-serif', fontWeight: 700, fontSize: 22, color: '#9fb6e0', letterSpacing: '0.16em', marginTop: 14, textTransform: 'uppercase' }}>The Golden One · Colombia</div>
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

// ── 11. App promo (271–286): worldcup26.world ────────────────────────────────
function SceneApp() {
  const { localTime: lt } = useSprite();
  const inP = Easing.easeOutCubic(clamp(lt / 1.0, 0, 1));
  const cards = [
    { name: 'COLOMBIA', mult: 'EVERY GOAL SCORES', flag: <FlagCOL w={86} /> },
    { name: 'D.R. CONGO', mult: 'EVERY GOAL SCORES', flag: <FlagCOD w={86} /> },
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

// ── 12. CTA outro (286–308) ──────────────────────────────────────────────────
function SceneCTA() {
  const { localTime: lt } = useSprite();
  const S = 286;
  const inP = Easing.easeOutCubic(clamp(lt / 0.8, 0, 1));
  return (
    <div style={{ position: 'absolute', inset: 0, background: 'rgba(7,9,15,0.46)' }}>
      <ClipSprite id="cta-bg" dim={0.68} />
      <AmbientParticles start={288.24} dur={6} count={28} />
      <div style={{ position: 'absolute', inset: 0, zIndex: 23, background: 'radial-gradient(ellipse at 50% 35%, transparent 0%, rgba(7,9,15,0.88) 75%)' }} />
      <div style={{ position: 'absolute', top: 200, left: 0, right: 0, textAlign: 'center', zIndex: 25, opacity: inP }}>
        <Kicker size={30}>WorldCup26 Legends</Kicker>
        <div style={{ marginTop: 24 }}><TitleReveal text="JOIN THE LEGENDS" start={S + 0.5} size={92} color={MV.text} /></div>
      </div>
      <div style={{ position: 'absolute', inset: 0, zIndex: 26 }}>
        <CtaButton start={S} delay={1.2} label="SUBSCRIBE" icon="🔔" accent="#16a34a" x={500} />
        <CtaButton start={S} delay={1.6} label="LIKE" icon="👍" accent="#1e3a8a" x={960} />
        <CtaButton start={S} delay={2.0} label="SHARE" icon="📣" accent="#106b4f" x={1400} />
      </div>
      <Sprite start={290.50} end={308.00}>
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
        <span style={{ fontFamily: '"Inter",sans-serif', fontWeight: 900, fontSize: 30, color: MV.gold }}>⚡ EP51 · COLLECT LEGEND 050 · worldcup26.world</span>
      </div>
    </div>
  );
}
