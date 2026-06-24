// match-scenes.jsx — the scenes of the Ep54 video (318s timeline).
// Morocco vs Haiti · "The Lion and the Grenadier" · Group C.
// SPINE: two diaspora teams whose best players were developed in European
// academies but chose the ancestral homeland over an easier flag — what does
// that choice cost a man, and what does it give him back when the anthem plays?
// Morocco = the Atlas Lions (2022 semifinalists); Haiti = Les Grenadiers
// (earthquake, exile, defiance), celebrating a goal like winning the cup.
// MATCH NOT YET PLAYED — predicted MOROCCO 2–1 HAITI. THREE goals:
// 38' En-Nesyri heads home off a Hakimi cross (from a Ziyech pass) (MAR 1–0 HAI);
// 56' Bilal El-Khannouss curls one past Placide (MAR 2–0 HAI);
// 81' Ricardo Adé heads in off a corner past Bounou — HAITI (MAR 2–1 HAI).
// NO 4th goal, NO save beat. Final MAR 2–1 HAI — OUR PREDICTION.
// Every scoreline/goal is OUR PREDICTION, clearly labelled, never stated as a real result.
// Scene windows must match the SCENES table in match.html and narration.json.
// NOTE: nested <Sprite> windows are GLOBAL seconds (Sprite reads the timeline clock).

// Local team colours (kit must not be modified).
const MAR = '#c1272d';        // Morocco red accent
const MAR_LIGHT = '#e35055';
const MAR_GREEN = '#0a7d3b';  // Morocco green accent
const HAI = '#00209f';        // Haiti deep blue accent
const HAI_LIGHT = '#3a5fcf';  // Haiti accent light

// Morocco flag — red field with a green five-point pentagram star centred.
function FlagMAR({ w = 120 }) {
  const h = w * 2 / 3;
  return (
    <div style={{ width: w, height: h, borderRadius: w * 0.05, position: 'relative', overflow: 'hidden', background: '#c1272d', boxShadow: '0 6px 18px rgba(0,0,0,0.45)' }}>
      {/* green five-point pentagram star (outline) centred */}
      <svg viewBox="0 0 100 100" style={{ position: 'absolute', left: '50%', top: '50%', transform: 'translate(-50%,-50%)', width: h * 0.5, height: h * 0.5 }}>
        <polygon points="50,8 61,38 93,38 67,58 77,90 50,70 23,90 33,58 7,38 39,38"
          fill="none" stroke="#0a7d3b" strokeWidth="6" strokeLinejoin="round" />
      </svg>
    </div>
  );
}

// Haiti flag — two horizontal bands, blue (top) over red (bottom), with a small
// centred emblem (a tiny white square stands in for the arms panel).
function FlagHAI({ w = 120 }) {
  const h = w * 2 / 3;
  return (
    <div style={{ width: w, height: h, borderRadius: w * 0.05, position: 'relative', overflow: 'hidden', boxShadow: '0 6px 18px rgba(0,0,0,0.45)' }}>
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '50%', background: '#00209f' }} />
      <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: '50%', background: '#d21034' }} />
      {/* small centred white emblem panel */}
      <div style={{ position: 'absolute', left: '50%', top: '50%', transform: 'translate(-50%,-50%)', width: h * 0.28, height: h * 0.28, background: '#fff', borderRadius: 2 }} />
    </div>
  );
}

// Match scoreboard chip (top center) — MOROCCO vs HAITI. Local override of
// the kit's ScoreBug so the labels/props/colours track this episode (kit unchanged).
// Morocco is LEFT/home, Haiti RIGHT. Ep54 is UNPLAYED — the 2–1 is OUR PREDICTION,
// badge defaults to "OUR PREDICTION".
function ScoreBug({ start, mar = 0, hai = 0, minute, badge = "OUR PREDICTION" }) {
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
        <div style={{ ...cell, background: MAR, color: '#fff' }}>MAR</div>
        <div style={{ ...cell, fontSize: 38, color: MV.gold }}>{mar} — {hai}</div>
        <div style={{ ...cell, background: HAI, color: '#fff' }}>HAI</div>
        {minute && <div style={{ ...cell, fontSize: 26, color: MV.muted, borderLeft: `1px solid ${MV.line}` }}>{minute}</div>}
      </div>
      <div style={{
        fontFamily: '"Inter",sans-serif', fontWeight: 800, fontSize: 16, color: MV.gold, letterSpacing: '0.22em',
        background: 'rgba(255,210,74,0.12)', border: '1px solid rgba(255,210,74,0.5)', borderRadius: 999, padding: '4px 16px',
      }}>{badge}</div>
    </div>
  );
}

// ── Persistent cinematic B-roll backdrop (0–318): continuous tiled footage so
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

// ── 1. Cold open (0–23): heartbeat in the dark, flash glimpses, hook line ────
function SceneColdOpen() {
  const { localTime: lt } = useSprite();
  const beat = Math.pow(Math.max(0, Math.sin(lt * Math.PI * 1.15)), 8);
  const titleP = Easing.easeOutCubic(clamp((lt - 18.0) / 1.4, 0, 1));
  return (
    <div style={{ position: 'absolute', inset: 0, background: 'rgba(2,3,7,0.46)' }}>
      {/* moving flash-glimpses of what's coming (video, not stills) */}
      <ClipSprite id="glimpse-stad" style={{ filter: 'brightness(0.78) contrast(1.15) saturate(1.2)' }} />
      <ClipSprite id="glimpse-gnawa" style={{ filter: 'brightness(0.74) contrast(1.12) saturate(1.05)' }} />
      <ClipSprite id="glimpse-hakimi" style={{ filter: 'brightness(0.78) contrast(1.15) saturate(1.2)' }} />
      <ClipSprite id="glimpse-etienne" style={{ filter: 'brightness(0.78) contrast(1.15) saturate(1.2)' }} />
      {/* ember base so the screen never reads as dead air */}
      <div style={{
        position: 'absolute', inset: 0,
        background: `radial-gradient(ellipse at 50% 78%, rgba(193,39,45,0.20) 0%, transparent 55%)`,
      }} />
      {/* heartbeat glow — the question that haunts the anthem */}
      <div style={{
        position: 'absolute', inset: 0,
        background: `radial-gradient(ellipse at center, rgba(245,208,17,${(0.42 * beat).toFixed(3)}) 0%, transparent 62%)`,
      }} />
      <Vignette strength={0.8} />
      {lt > 18.0 && (
        <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 34, opacity: titleP, zIndex: 22 }}>
          <Kicker size={34}>They Chose The Homeland</Kicker>
          <TitleReveal text="A DEFIANT YES" start={19.8} size={104} color={MV.gold} />
        </div>
      )}
      <Letterbox />
    </div>
  );
}

// ── 2. Title card (23–33) ────────────────────────────────────────────────────
function SceneTitle() {
  const { localTime: lt } = useSprite();
  const p1 = Easing.easeOutCubic(clamp(lt / 1.0, 0, 1));
  const p2 = Easing.easeOutBack(clamp((lt - 0.8) / 1.0, 0, 1));
  const p3 = Easing.easeOutCubic(clamp((lt - 1.7) / 0.9, 0, 1));
  return (
    <div style={{ position: 'absolute', inset: 0, background: `linear-gradient(180deg, #0a0f1c 0%, #11182b 55%, #0a0f1c 100%)` }}>
      <div style={{ position: 'absolute', inset: 0, background: `radial-gradient(ellipse at 50% 30%, rgba(255,210,74,0.10) 0%, transparent 55%)` }} />
      <AmbientParticles start={23.48} dur={9.5} count={34} />
      <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 44 }}>
        <div style={{ opacity: p1, transform: `translateY(${(1 - p1) * -30}px)` }}>
          <Kicker>WorldCup26 Legends · Episode 54</Kicker>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 70, opacity: clamp(p2, 0, 1), transform: `scale(${p2})` }}>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 20 }}>
            <Waving><FlagMAR w={230} /></Waving>
            <BigTitle size={84} glow={MAR_LIGHT}>MOROCCO</BigTitle>
          </div>
          <BigTitle size={120} color={MV.gold}>VS</BigTitle>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 20 }}>
            <Waving speed={1.9}><FlagHAI w={230} /></Waving>
            <BigTitle size={84} glow={HAI_LIGHT}>HAITI</BigTitle>
          </div>
        </div>
        <div style={{ opacity: p3, transform: `translateY(${(1 - p3) * 26}px)`, fontFamily: '"Inter",sans-serif', fontWeight: 600, fontSize: 32, color: MV.muted, letterSpacing: '0.08em' }}>
          GROUP C · LIONS vs GRENADIERS · A WORLD CUP NIGHT
        </div>
      </div>
      <Letterbox />
    </div>
  );
}

// ── 3. Stadium (33–44): flyover clip + stakes ────────────────────────────────
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
          {[['GROUP C', 'WORLD CUP'], ['ATLAS LIONS', 'vs GRENADIERS'], ['CLASS', 'vs COURAGE'], ['ONE FLAG', 'vs ANOTHER']].map(([v, l], i) => (
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
            border: `5px solid ${HAI}`, color: HAI_LIGHT, borderRadius: 14, padding: '10px 26px',
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
              {/* staggered sheen sweep so each of the five cards is visibly alive */}
              <div style={{ position: 'absolute', inset: 0, zIndex: 3, pointerEvents: 'none',
                background: `linear-gradient(115deg, transparent ${((t * 34 + i * 70) % 280) - 30 - 11}%, rgba(255,255,255,0.22) ${((t * 34 + i * 70) % 280) - 30}%, transparent ${((t * 34 + i * 70) % 280) - 30 + 11}%)`,
                mixBlendMode: 'overlay' }} />
              {/* accent live-glow pulse at the top edge */}
              <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 3, zIndex: 4, pointerEvents: 'none',
                background: accent, opacity: 0.5 + 0.5 * Math.sin(t * 2.6 + i) }} />
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

// ── 4. Morocco (44–79.5): the Atlas Lions, red and green ─────────────────────
function SceneMorocco() {
  const { localTime: lt } = useSprite();
  const S = 44.00;
  const headerP = Easing.easeOutCubic(clamp(lt / 0.9, 0, 1));
  return (
    <div style={{ position: 'absolute', inset: 0, background: 'rgba(10,12,20,0.46)' }}>
      <ClipSprite id="hist-mar" dim={0.5} style={{ filter: 'brightness(0.34) saturate(0.8) contrast(1.1)' }} />
      <ClipSprite id="mar-bg" dim={0.55} />
      <ClipSprite id="hakimi" dim={0.12} />
      <ClipSprite id="ziyech" dim={0.12} />
      <ClipSprite id="ennesyri" dim={0.12} />
      <ClipSprite id="khannouss" dim={0.12} />
      <ClipSprite id="bounou" dim={0.12} />
      <div style={{ position: 'absolute', inset: 0, zIndex: 22, pointerEvents: 'none', background: `linear-gradient(90deg, rgba(193,39,45,0.30) 0%, transparent 30%, transparent 70%, rgba(10,125,59,0.16) 100%)` }} />
      <div style={{ position: 'absolute', top: 108, left: 0, right: 0, display: 'flex', justifyContent: 'center', zIndex: 26, opacity: headerP, transform: `translateY(${(1 - headerP) * -24}px)` }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 26, background: MV.panel, border: `1px solid ${MV.line}`, borderRadius: 999, padding: '16px 44px' }}>
          <FlagMAR w={74} />
          <span style={{ fontFamily: '"Inter",sans-serif', fontWeight: 900, fontSize: 40, color: MV.text, letterSpacing: '0.10em' }}>THE ATLAS LIONS</span>
        </div>
      </div>
      {/* squad named ~55.5s: Hakimi, Ziyech, En-Nesyri, then El-Khannouss + Bounou ~68s */}
      <SquadGrid start={S + 11.5} end={S + 23.5} accent={MAR} players={[
        { img: 'assets/squad/mar-hakimi.png', vid: 'sqm-hakimi', name: 'A. HAKIMI', role: 'THE OVERLAP' },
        { img: 'assets/squad/mar-ziyech.png', vid: 'sqm-ziyech', name: 'H. ZIYECH', role: 'THE WIZARD' },
        { img: 'assets/squad/mar-ennesyri.png', vid: 'sqm-ennesyri', name: 'Y. EN-NESYRI', role: 'THE FINISHER' },
        { img: 'assets/squad/mar-khannouss.png', vid: 'sqm-khannouss', name: 'B. EL-KHANNOUSS', role: 'THE JEWEL' },
        { img: 'assets/squad/mar-bounou.png', vid: 'sqm-bounou', name: 'Y. BOUNOU', role: 'THE KEEPER' },
      ]} />
      {/* "Achraf Hakimi" named at ~55.5 */}
      <Sprite start={55.5} end={61.5}>
        <LowerThird start={55.8} name="ACHRAF HAKIMI" role="The Overlap · Right-back" accent={MAR} />
      </Sprite>
      {/* "Hakim Ziyech" named at ~58 */}
      <Sprite start={61.5} end={68.21}>
        <LowerThird start={61.8} name="HAKIM ZIYECH" role="The Wizard · Forward" accent={MAR_LIGHT} />
      </Sprite>
      {/* "Bilal El-Khannouss" named at ~68; "Bono" keeper ~74 */}
      <Sprite start={68.21} end={74.21}>
        <LowerThird start={68.51} name="B. EL-KHANNOUSS" role="The Jewel · Midfielder" accent={MAR_GREEN} />
      </Sprite>
      <Sprite start={74.21} end={79.5}>
        <LowerThird start={74.51} name="YASSINE BOUNOU" role="The Keeper · Bono" accent={MAR} />
      </Sprite>
      <Vignette strength={0.4} />
      <Letterbox />
    </div>
  );
}

// ── 5. Haiti (79.5–103): Les Grenadiers, the blue and red ────────────────────
function SceneHaiti() {
  const { localTime: lt } = useSprite();
  const S = 79.50;
  const headerP = Easing.easeOutCubic(clamp(lt / 0.9, 0, 1));
  return (
    <div style={{ position: 'absolute', inset: 0, background: 'rgba(10,12,20,0.46)' }}>
      <ClipSprite id="hist-hai" dim={0.5} style={{ filter: 'brightness(0.34) saturate(0.8) contrast(1.1)' }} />
      <ClipSprite id="hai-bg" dim={0.55} />
      <ClipSprite id="ade" dim={0.12} />
      <ClipSprite id="nazon" dim={0.12} />
      <ClipSprite id="etienne" dim={0.12} />
      <ClipSprite id="arcus" dim={0.12} />
      <ClipSprite id="placide" dim={0.12} />
      <div style={{ position: 'absolute', inset: 0, zIndex: 22, pointerEvents: 'none', background: `linear-gradient(90deg, rgba(0,32,159,0.28) 0%, transparent 30%, transparent 70%, rgba(210,16,52,0.18) 100%)` }} />
      <div style={{ position: 'absolute', top: 108, left: 0, right: 0, display: 'flex', justifyContent: 'center', zIndex: 26, opacity: headerP, transform: `translateY(${(1 - headerP) * -24}px)` }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 26, background: MV.panel, border: `1px solid ${MV.line}`, borderRadius: 999, padding: '16px 44px' }}>
          <FlagHAI w={74} />
          <span style={{ fontFamily: '"Inter",sans-serif', fontWeight: 900, fontSize: 40, color: MV.text, letterSpacing: '0.10em' }}>LES GRENADIERS</span>
        </div>
      </div>
      {/* squad named ~91s: Ade, Nazon, Etienne Jr, Placide */}
      <SquadGrid start={S + 11.5} end={S + 22} accent={HAI} players={[
        { img: 'assets/squad/hai-ade.png', vid: 'sqh-ade', name: 'R. ADÉ', role: 'THE GRENADIER' },
        { img: 'assets/squad/hai-nazon.png', vid: 'sqh-nazon', name: 'D. NAZON', role: 'THE STRIKER' },
        { img: 'assets/squad/hai-etienne.png', vid: 'sqh-etienne', name: 'D. ETIENNE JR', role: 'THE WINGER' },
        { img: 'assets/squad/hai-arcus.png', vid: 'sqh-arcus', name: 'C. ARCUS', role: 'THE WALL' },
        { img: 'assets/squad/hai-placide.png', vid: 'sqh-placide', name: 'J. PLACIDE', role: 'THE KEEPER' },
      ]} />
      {/* "Ricardo Ade" named at ~91 */}
      <Sprite start={91} end={96}>
        <LowerThird start={91.3} name="RICARDO ADÉ" role="The Grenadier · Defender" accent={HAI} />
      </Sprite>
      {/* "Duckens Nazon" named at ~94 */}
      <Sprite start={96} end={100}>
        <LowerThird start={96.3} name="DUCKENS NAZON" role="The Striker · Forward" accent={HAI_LIGHT} />
      </Sprite>
      {/* "Derrick Etienne Junior" named at ~97 */}
      <Sprite start={100} end={103}>
        <LowerThird start={100.2} name="D. ETIENNE JR" role="The Winger · Forward" accent={HAI_LIGHT} />
      </Sprite>
      <Vignette strength={0.4} />
      <Letterbox />
    </div>
  );
}

// ── 6. The duel (103–132): Hakimi vs Etienne Jr split screen ─────────────────
function SceneDuel() {
  const { localTime: lt } = useSprite();
  const slideP = Easing.easeOutQuart(clamp(lt / 1.1, 0, 1));
  const vsP = Easing.easeOutBack(clamp((lt - 0.9) / 0.8, 0, 1));
  const shake = lt > 0.9 && lt < 1.25 ? Math.sin(lt * 160) * 7 * (1.25 - lt) / 0.35 : 0;
  return (
    <div style={{ position: 'absolute', inset: 0, background: 'rgba(5,6,10,0.46)', transform: `translate(${shake}px, ${-shake}px)` }}>
      <div style={{ position: 'absolute', top: 0, bottom: 0, left: 0, width: '50%', overflow: 'hidden', transform: `translateX(${(1 - slideP) * -100}%)` }}>
        <img src="assets/squad/mar-hakimi.png" alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', filter: 'saturate(1.15) brightness(0.92)' }} />
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(90deg, rgba(193,39,45,0.32), transparent 65%)' }} />
        <div style={{ position: 'absolute', bottom: 150, left: 90, fontFamily: '"Inter",sans-serif', fontWeight: 900, fontSize: 62, color: '#fff', textShadow: '0 4px 26px rgba(0,0,0,0.9)' }}>
          THE OVERLAP
          <div style={{ fontSize: 27, fontWeight: 700, color: MV.gold, letterSpacing: '0.2em', marginTop: 8 }}>ACHRAF HAKIMI</div>
        </div>
      </div>
      <div style={{ position: 'absolute', top: 0, bottom: 0, right: 0, width: '50%', overflow: 'hidden', transform: `translateX(${(1 - slideP) * 100}%)` }}>
        <img src="assets/squad/hai-etienne.png" alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', filter: 'saturate(1.15) brightness(0.92)' }} />
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(270deg, rgba(0,32,159,0.46), transparent 65%)' }} />
        <div style={{ position: 'absolute', bottom: 150, right: 90, textAlign: 'right', fontFamily: '"Inter",sans-serif', fontWeight: 900, fontSize: 62, color: '#fff', textShadow: '0 4px 26px rgba(0,0,0,0.9)' }}>
          THE WINGER
          <div style={{ fontSize: 27, fontWeight: 700, color: MV.gold, letterSpacing: '0.2em', marginTop: 8 }}>DERRICK ETIENNE JR</div>
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
      {/* "Class against courage" lands ~113 */}
      <Sprite start={115.19} end={132}>
        <div style={{ position: 'absolute', left: 0, right: 0, bottom: 0, top: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 27, background: 'rgba(0,0,0,0.55)' }}>
          <Kicker size={40}>Class vs Courage</Kicker>
        </div>
      </Sprite>
      <Letterbox />
    </div>
  );
}

// ── 7. Match drama (132–211): En-Nesyri 38' header (MAR 1-0), El-Khannouss 56'
//      curler (MAR 2-0), Ricardo Adé 81' header for HAITI (MAR 2-1) — final
//      MAR 2–1 HAI — OUR PREDICTION. NO 4th goal, NO save beat. The ScoreBug +
//      final card carry the "OUR PREDICTION" badge, never "FULL TIME"/as fact.
function SceneDrama() {
  const { localTime: lt } = useSprite();
  const S = 132.00;
  return (
    <div style={{ position: 'absolute', inset: 0, background: 'rgba(2,3,7,0.46)' }}>
      {/* LIVE ACTION footage tiled across the whole drama — never static */}
      <ClipSprite id="drama-stad" style={{ filter: 'brightness(0.82) contrast(1.08) saturate(1.12)' }} />
      <ClipSprite id="drama-hakimi" style={{ filter: 'brightness(0.86) contrast(1.1) saturate(1.15)' }} />
      <ClipSprite id="drama-ennesyri" style={{ filter: 'brightness(0.94) contrast(1.12) saturate(1.18)' }} />
      <ClipSprite id="drama-mar1" style={{ filter: 'brightness(0.9) contrast(1.1) saturate(1.15)' }} />
      <ClipSprite id="drama-khannouss" style={{ filter: 'brightness(0.94) contrast(1.12) saturate(1.18)' }} />
      <ClipSprite id="drama-fill1" style={{ filter: 'brightness(0.8) contrast(1.08) saturate(1.1)' }} />
      <ClipSprite id="drama-fill2" style={{ filter: 'brightness(0.9) contrast(1.1) saturate(1.15)' }} />
      <ClipSprite id="drama-ade" style={{ filter: 'brightness(0.94) contrast(1.12) saturate(1.18)' }} />
      <ClipSprite id="drama-hai-cel" style={{ filter: 'brightness(0.94) contrast(1.12) saturate(1.18)' }} />

      {/* 38' — predicted: Hakimi overlaps onto Ziyech's pass and crosses; En-Nesyri
          heads it home. MOROCCO 1 – 0 HAITI. The lion has woken. */}
      <GoalFlash at={S + 20.0} />
      <Sprite start={152.1} end={163.61}>
        <ScoreBug start={S + 20.1} mar={1} hai={0} minute="38'" badge="OUR PREDICTION" />
      </Sprite>

      {/* 56' — predicted: young Bilal El-Khannouss collects it on the edge and
          curls it past Placide. MOROCCO 2 – 0 HAITI. Two precise strokes. */}
      <GoalFlash at={S + 31.61} />
      <Sprite start={163.71} end={192}>
        <ScoreBug start={S + 31.71} mar={2} hai={0} minute="56'" badge="OUR PREDICTION" />
      </Sprite>

      {/* 81' — predicted: a corner swings in and Ricardo Adé climbs highest to
          power a header past Bounou — HAITI. MOROCCO 2 – 1 HAITI. Celebrated like
          a victory. */}
      <GoalFlash at={S + 60.0} />
      <Sprite start={192.1} end={211.64}>
        <ScoreBug start={S + 60.1} mar={2} hai={1} minute="81'" badge="OUR PREDICTION" />
      </Sprite>

      {/* The predicted final — clearly stamped OUR PREDICTION, never FULL TIME */}
      <Sprite start={205.05} end={211.64}>
        <PredictionCard start={S + 73.0} />
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
        <Kicker size={26}>The Lion and the Grenadier</Kicker>
        <div style={{ display: 'flex', alignItems: 'center', gap: 56, marginTop: 40 }}>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16 }}>
            <FlagMAR w={150} />
            <span style={{ fontFamily: '"Inter",sans-serif', fontWeight: 800, fontSize: 34, color: MV.text }}>MOROCCO</span>
          </div>
          <BigTitle size={170} color={MV.gold}>2 — 1</BigTitle>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16 }}>
            <FlagHAI w={150} />
            <span style={{ fontFamily: '"Inter",sans-serif', fontWeight: 800, fontSize: 34, color: MV.text }}>HAITI</span>
          </div>
        </div>
        <div style={{ fontFamily: '"Inter",sans-serif', fontWeight: 800, fontSize: 26, color: MV.muted, letterSpacing: '0.18em', marginTop: 26 }}>BOUND BY A DEFIANT YES</div>
      </div>
    </div>
  );
}

// ── 8. Disclaimer + group recap (211–244): our prediction & what it means ────
function SceneVerdict() {
  const { localTime: lt } = useSprite();
  const S = 211.64;
  const discP = Easing.easeOutCubic(clamp(lt / 1.0, 0, 1));
  const discFade = lt > 14 ? clamp((16 - lt) / 1.0, 0, 1) : 1;
  return (
    <div style={{ position: 'absolute', inset: 0, background: 'rgba(10,15,28,0.46)' }}>
      <ClipSprite id="verdict-bg" dim={0.6} />
      {/* disclaimer beat — our prediction, real one yours to watch */}
      <Sprite start={211.64} end={227}>
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
          <Kicker size={26}>Group C · Our Prediction</Kicker>
          <div style={{ marginTop: 26 }}>
            <StatLine start={S + 17} delay={0.0} label="MOROCCO" value="THE ATLAS LIONS" accent={MAR_LIGHT} />
            <StatLine start={S + 17} delay={0.25} label="HAITI" value="LES GRENADIERS" accent={HAI_LIGHT} />
            <StatLine start={S + 17} delay={0.5} label="OUR PREDICTION" value="MAR 2 — 1 HAI" accent={MV.text} />
            <StatLine start={S + 17} delay={0.75} label="38' EN-NESYRI · 56' EL-KHANNOUSS · 81' ADÉ" value="A DEFIANT YES" accent={MV.gold} />
          </div>
        </div>
      </div>
      <Vignette strength={0.5} />
      <Letterbox />
    </div>
  );
}

// ── 9. Engagement (244–255): comment prompts ─────────────────────────────────
function SceneEngage() {
  const { localTime: lt } = useSprite();
  const headP = Easing.easeOutCubic(clamp(lt / 0.9, 0, 1));
  const cards = [
    { label: 'COMMENT LIONS', sub: "MOROCCO'S CLASS", flag: <FlagMAR w={80} />, accent: MAR_LIGHT },
    { label: 'COMMENT GRENADIERS', sub: "HAITI'S HEART", flag: <FlagHAI w={80} />, accent: HAI_LIGHT },
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

// ── 10. Mystery Supporter (255–281): the series' signature collectible card ──
function SceneMystery() {
  const { localTime: lt } = useSprite();
  const S = 255.00;
  const inP = Easing.easeOutCubic(clamp((lt - 0.6) / 1.4, 0, 1));
  const cardP = Easing.easeOutCubic(clamp((lt - 4.2) / 1.0, 0, 1));
  // ADVANCED REVEAL: 3D flip-in from the edge, then settle & float
  const flipDeg = (1 - cardP) * 88;                          // rotateY flip-in
  const settle = clamp((lt - 5.4) / 1.0, 0, 1);              // after flip lands
  // repeating holo sweep + rotating rainbow hue so the foil never sits dead
  const shine = lt > 5.4 ? -40 + (((lt - 5.4) * 24) % 240) : -60;
  const holoHue = (lt * 26) % 360;                            // rainbow foil sweep
  const burst = clamp((lt - 5.2) / 0.6, 0, 1);               // sparkle burst on land
  const floatY = Math.sin(lt * 1.05) * 5 * settle;           // gentle float once settled
  const floatR = Math.sin(lt * 0.6) * 0.6 * settle;
  const pulse = 0.5 + 0.5 * Math.sin(lt * 3.4);              // signup-CTA pulse
  return (
    <div style={{ position: 'absolute', inset: 0, background: 'rgba(2,3,10,0.46)' }}>
      <ClipSprite id="mystery" dim={0.12} />
      <ClipSprite id="mystery-close" dim={0.18} />
      {/* drifting fog layers */}
      <div style={{
        position: 'absolute', inset: 0, zIndex: 21, pointerEvents: 'none', opacity: 0.5,
        background: `radial-gradient(ellipse at ${20 + Math.sin(lt * 0.3) * 14}% 75%, rgba(245,208,17,0.18) 0%, transparent 45%),` +
                    `radial-gradient(ellipse at ${78 - Math.sin(lt * 0.22) * 12}% 30%, rgba(193,39,45,0.18) 0%, transparent 50%)`,
      }} />
      <AmbientParticles start={S} dur={26} count={46} color="252,228,150" maxR={3.5} zIndex={22} />
      <div style={{ position: 'absolute', top: 118, left: 0, right: 0, textAlign: 'center', zIndex: 25, opacity: inP }}>
        <Kicker size={26} color="#e8c97a">The Mystery Supporter · Legend No. 054</Kicker>
      </div>
      {/* sparkle burst behind the card as it lands */}
      {burst > 0 && burst < 1 && (
        <div style={{
          position: 'absolute', left: '50%', top: '52%', zIndex: 24, pointerEvents: 'none',
          width: 900, height: 900, transform: `translate(-50%,-50%) scale(${0.4 + burst * 1.3})`,
          opacity: (1 - burst) * 0.9,
          background: 'radial-gradient(circle, rgba(255,233,160,0.55) 0%, rgba(245,208,22,0.18) 30%, transparent 62%)',
          borderRadius: '50%',
        }} />
      )}
      {/* Premium COLLECTIBLE CARD — 3D flip-in reveal */}
      {cardP > 0 && (
        <div style={{
          position: 'absolute', left: '50%', top: '52%', zIndex: 25,
          opacity: clamp(cardP, 0, 1), perspective: 1500,
          transform: `translate(-50%,-50%) translateY(${(1 - cardP) * 40 + floatY}px) scale(${0.9 + 0.1 * cardP})`,
        }}>
          <div style={{
            position: 'relative', width: 760, borderRadius: 26, overflow: 'hidden',
            padding: '5px', transformStyle: 'preserve-3d',
            transform: `rotateY(${flipDeg}deg) rotate(${floatR}deg)`,
            background: 'linear-gradient(150deg, #f4d784 0%, #b9842c 30%, #f8e9a8 55%, #9c6a1d 80%, #f4d784 100%)',
            boxShadow: `0 30px 120px rgba(0,0,0,0.75), 0 0 ${40 + settle * 30}px rgba(245,208,22,${0.15 + settle * 0.25})`,
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
                <span style={{ fontFamily: '"Inter",sans-serif', fontWeight: 900, fontSize: 40, color: '#3a2706' }}>054</span>
              </div>
              <div style={{ fontFamily: '"Inter",sans-serif', fontWeight: 800, fontSize: 22, color: '#e8c97a', letterSpacing: '0.28em' }}>LEGEND 054</div>
              <div style={{ fontFamily: '"Inter",sans-serif', fontWeight: 900, fontSize: 64, color: '#f6f9ff', letterSpacing: '0.01em', marginTop: 8, lineHeight: 1.05, maxWidth: 540 }}>THE GNAWA MASTER</div>
              <div style={{ fontFamily: '"Inter",sans-serif', fontWeight: 700, fontSize: 22, color: '#9fb6e0', letterSpacing: '0.16em', marginTop: 14, textTransform: 'uppercase' }}>The Soul of the Trance · Morocco</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginTop: 22 }}>
                <div style={{ display: 'inline-flex', alignSelf: 'flex-start', alignItems: 'center', gap: 12, background: 'rgba(255,210,74,0.14)', border: '1px solid rgba(255,210,74,0.55)', borderRadius: 999, padding: '10px 24px' }}>
                  <span style={{ fontSize: 24 }}>✦</span>
                  <span style={{ fontFamily: '"Inter",sans-serif', fontWeight: 800, fontSize: 22, color: MV.gold, letterSpacing: '0.08em' }}>worldcup26.world</span>
                </div>
                {/* hard SIGN-UP hook, pulsing */}
                <div style={{ display: 'inline-flex', alignSelf: 'flex-start', alignItems: 'center', gap: 12,
                  background: 'linear-gradient(100deg, #16a34a, #0e8a3c)', borderRadius: 999, padding: '13px 30px',
                  transform: `scale(${1 + pulse * 0.04})`,
                  boxShadow: `0 8px 30px rgba(22,163,74,${0.35 + pulse * 0.4})` }}>
                  <span style={{ fontSize: 22 }}>⚡</span>
                  <span style={{ fontFamily: '"Inter",sans-serif', fontWeight: 900, fontSize: 23, color: '#fff', letterSpacing: '0.03em' }}>SIGN UP FREE — UNLOCK LEGEND 054</span>
                </div>
              </div>
              {/* rotating rainbow holographic foil */}
              <div style={{
                position: 'absolute', inset: 0, pointerEvents: 'none', opacity: 0.5,
                background: `linear-gradient(${60 + holoHue}deg, hsla(${holoHue},90%,60%,0) 20%, hsla(${(holoHue + 60) % 360},90%,65%,0.22) 38%, hsla(${(holoHue + 140) % 360},90%,60%,0) 56%)`,
                mixBlendMode: 'color-dodge',
              }} />
              {/* bright white shine sweep */}
              <div style={{
                position: 'absolute', inset: 0, pointerEvents: 'none',
                background: `linear-gradient(115deg, transparent ${shine - 12}%, rgba(255,255,255,0.34) ${shine}%, transparent ${shine + 12}%)`,
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

// ── 11. App promo (281–303): worldcup26.world ────────────────────────────────
function SceneApp() {
  const { localTime: lt } = useSprite();
  const inP = Easing.easeOutCubic(clamp(lt / 1.0, 0, 1));
  const btnP = Easing.easeOutBack(clamp((lt - 2.4) / 0.7, 0, 1));
  const pulse = 0.5 + 0.5 * Math.sin(lt * 3.4);
  const cards = [
    { name: 'MOROCCO', mult: 'EVERY GOAL SCORES', flag: <FlagMAR w={86} /> },
    { name: 'HAITI', mult: 'EVERY GOAL SCORES', flag: <FlagHAI w={86} /> },
    { name: 'ARGENTINA', mult: 'EVERY GOAL SCORES', flag: <div style={{ width: 86, height: 57, borderRadius: 6, background: 'linear-gradient(180deg,#75aadb 33%,#fff 33%,#fff 66%,#75aadb 66%)' }} /> },
  ];
  return (
    <div style={{ position: 'absolute', inset: 0, background: `linear-gradient(160deg, #0d2a20 0%, #07090f 70%)` }}>
      <div style={{ position: 'absolute', inset: 0, background: `radial-gradient(ellipse at 50% 20%, rgba(16,107,79,0.35) 0%, transparent 60%)` }} />
      <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 46, opacity: inP }}>
        <Kicker color="#7fd6b5" size={30}>The Prediction Game</Kicker>
        <BigTitle size={104} color="#fff" glow={MV.green}>worldcup26.world</BigTitle>
        <Kicker color="#cfe9de" size={30}>Sign Up · Pick 3 Of 48</Kicker>
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
                <div style={{ fontFamily: '"Inter",sans-serif', fontWeight: 900, fontSize: 28, color: '#fff', textAlign: 'center' }}>{c.name}</div>
                <div style={{ fontFamily: '"Inter",sans-serif', fontWeight: 800, fontSize: 22, color: MV.gold }}>{c.mult}</div>
              </div>
            );
          })}
        </div>
        {/* HARD SIGN-UP CTA — drive every viewer to create an account */}
        <div style={{
          transform: `translateY(${(1 - btnP) * 40}px) scale(${(0.8 + 0.2 * btnP) * (1 + pulse * 0.03)})`,
          opacity: clamp(btnP, 0, 1), marginTop: 6,
          display: 'flex', alignItems: 'center', gap: 16,
          background: 'linear-gradient(100deg, #16a34a, #0c8f3a)', borderRadius: 999, padding: '20px 52px',
          boxShadow: `0 14px 50px rgba(22,163,74,${0.4 + pulse * 0.45})`,
        }}>
          <span style={{ fontSize: 34 }}>⚡</span>
          <span style={{ fontFamily: '"Inter",sans-serif', fontWeight: 900, fontSize: 40, color: '#fff', letterSpacing: '0.02em' }}>CREATE YOUR FREE ACCOUNT</span>
        </div>
        <div style={{ fontFamily: '"Inter",sans-serif', fontWeight: 800, fontSize: 28, color: MV.gold, letterSpacing: '0.04em', opacity: clamp(btnP, 0, 1) }}>
          Unlock Legend 054 the moment you sign up · free · no prizes
        </div>
      </div>
      <Letterbox />
    </div>
  );
}

// ── 12. CTA outro (303–318) ──────────────────────────────────────────────────
function SceneCTA() {
  const { localTime: lt } = useSprite();
  const S = 303.33;
  const inP = Easing.easeOutCubic(clamp(lt / 0.8, 0, 1));
  return (
    <div style={{ position: 'absolute', inset: 0, background: 'rgba(7,9,15,0.46)' }}>
      <ClipSprite id="cta-bg" dim={0.68} />
      <AmbientParticles start={305.57} dur={6} count={28} />
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
      <Sprite start={307.93} end={318.33}>
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
        <span style={{ fontFamily: '"Inter",sans-serif', fontWeight: 900, fontSize: 30, color: MV.gold }}>⚡ EP55 · COLLECT LEGEND 054 · worldcup26.world</span>
      </div>
    </div>
  );
}
