// match-scenes.jsx — the scenes of the Ep56 video (318s timeline).
// South Africa vs South Korea · "Two Sons of the Beautiful Game" · Group A.
// SPINE: two sons (Percy Tau / Son Heung-min) who carried their fathers' dreams
// from nowhere to the World Cup; tonight they collide and only one father is right.
// South Africa = Bafana Bafana (green & gold, vuvuzelas, counter-punchers);
// South Korea = the Taegeuk Warriors (red, technical, carrying Son, the greatest
// Asian footballer ever) — honoured in defeat with dignity.
// MATCH NOT YET PLAYED — predicted SOUTH AFRICA 1–0 SOUTH KOREA. ONE goal + one SAVE:
// 52' Makgopa header parried, Lyle FOSTER pounces to score (VAR checks, stands) RSA 1–0;
// 89' Son curls from 25 yards, Ronwen WILLIAMS flies and SAVES — NO goal, 1–0 holds.
// There is NO second goal. Final RSA 1–0 KOR — OUR PREDICTION, never stated as fact.
// Scene windows must match the SCENES table in match.html and narration.json.
// NOTE: nested <Sprite> windows are GLOBAL seconds (Sprite reads the timeline clock).
// Player clips (rsa-*/kor-*) are REAL paid library animations; crowds/stadium/action
// are UNIQUE Higgsfield clips for THIS episode (never reused — hash-verified).

// Local team colours (kit must not be modified).
const RSA = '#007749';        // South Africa green
const RSA_LIGHT = '#1f9c6b';  // green light
const RSA_GOLD = '#ffb81c';   // South Africa gold
const KOR = '#cd2e3a';        // South Korea red
const KOR_LIGHT = '#e0565f';  // red light
const KOR_BLUE = '#0047a0';   // South Korea blue

// South Africa flag — black hoist triangle (gold-edged) + green horizontal Y (pall),
// red over blue bands, white fimbriations. Simplified but recognisable.
function FlagRSA({ w = 120 }) {
  const h = w * 2 / 3;
  return (
    <div style={{ width: w, height: h, borderRadius: w * 0.05, position: 'relative', overflow: 'hidden', boxShadow: '0 6px 18px rgba(0,0,0,0.45)' }}>
      <svg viewBox="0 0 90 60" style={{ width: '100%', height: '100%', display: 'block' }} preserveAspectRatio="none">
        {/* red top, blue bottom */}
        <rect x="0" y="0" width="90" height="30" fill="#de3831" />
        <rect x="0" y="30" width="90" height="30" fill="#002395" />
        {/* white pall fimbriation */}
        <polygon points="0,4 38,30 0,56" fill="#fff" />
        <polygon points="0,8 90,8 90,0 0,0" fill="#fff" opacity="0" />
        <polygon points="34,30 90,2 90,12 50,30 90,48 90,58 34,30" fill="#fff" />
        {/* gold fimbriation around black triangle */}
        <polygon points="0,2 42,30 0,58" fill="#ffb81c" />
        {/* green pall */}
        <polygon points="40,30 90,5 90,11 52,30 90,49 90,55 40,30" fill="#007749" />
        {/* black hoist triangle */}
        <polygon points="0,8 30,30 0,52" fill="#000" />
      </svg>
    </div>
  );
}

// South Korea flag — white field, central taegeuk (red over blue), 4 black trigrams.
function FlagKOR({ w = 120 }) {
  const h = w * 2 / 3;
  const bar = (x, y, rot, gap) => (
    <g transform={`rotate(${rot} ${x} ${y})`}>
      {[-1, 0, 1].map((k) => (
        <rect key={k} x={x - 11} y={y + k * 4 - 1.2} width="22" height="2.4" fill="#000"
          style={gap && k === 0 ? { } : {}} />
      ))}
    </g>
  );
  return (
    <div style={{ width: w, height: h, borderRadius: w * 0.05, position: 'relative', overflow: 'hidden', background: '#fff', boxShadow: '0 6px 18px rgba(0,0,0,0.45)' }}>
      <svg viewBox="0 0 90 60" style={{ width: '100%', height: '100%', display: 'block' }} preserveAspectRatio="none">
        {/* taegeuk circle */}
        <clipPath id="tg"><circle cx="45" cy="30" r="13" /></clipPath>
        <g clipPath="url(#tg)">
          <rect x="32" y="17" width="26" height="26" fill="#cd2e3a" />
          <path d="M45 17 a6.5 6.5 0 0 1 0 13 a6.5 6.5 0 0 0 0 13 a13 13 0 0 1 0 -26 Z" fill="#0047a0" />
          <circle cx="45" cy="23.5" r="6.5" fill="#cd2e3a" />
          <circle cx="45" cy="36.5" r="6.5" fill="#0047a0" />
        </g>
        {/* four trigrams (simplified 3-bar marks) */}
        {bar(16, 12, 33)}
        {bar(74, 12, -33)}
        {bar(16, 48, -33)}
        {bar(74, 48, 33)}
      </svg>
    </div>
  );
}

// Match scoreboard chip (top center) — SOUTH AFRICA vs SOUTH KOREA. RSA is LEFT/home
// (green), KOR RIGHT (red). Ep56 is UNPLAYED — the 1–0 is OUR PREDICTION; badge
// defaults to "OUR PREDICTION". Optional `note` shows a beat caption (e.g. "WILLIAMS SAVES").
function ScoreBug({ start, rsa = 0, kor = 0, minute, badge = "OUR PREDICTION", note }) {
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
        <div style={{ ...cell, background: RSA, color: '#fff' }}>RSA</div>
        <div style={{ ...cell, fontSize: 38, color: MV.gold }}>{rsa} — {kor}</div>
        <div style={{ ...cell, background: KOR, color: '#fff' }}>KOR</div>
        {minute && <div style={{ ...cell, fontSize: 26, color: MV.muted, borderLeft: `1px solid ${MV.line}` }}>{minute}</div>}
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <div style={{
          fontFamily: '"Inter",sans-serif', fontWeight: 800, fontSize: 16, color: MV.gold, letterSpacing: '0.22em',
          background: 'rgba(255,210,74,0.12)', border: '1px solid rgba(255,210,74,0.5)', borderRadius: 999, padding: '4px 16px',
        }}>{badge}</div>
        {note && <div style={{
          fontFamily: '"Inter",sans-serif', fontWeight: 900, fontSize: 16, color: '#fff', letterSpacing: '0.18em',
          background: 'rgba(0,119,73,0.34)', border: `1px solid ${RSA_LIGHT}`, borderRadius: 999, padding: '4px 16px',
        }}>{note}</div>}
      </div>
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
      <ClipSprite id="glimpse-stad" style={{ filter: 'brightness(0.78) contrast(1.15) saturate(1.2)' }} />
      <ClipSprite id="glimpse-bead" style={{ filter: 'brightness(0.74) contrast(1.12) saturate(1.05)' }} />
      <ClipSprite id="glimpse-son" style={{ filter: 'brightness(0.78) contrast(1.15) saturate(1.2)' }} />
      <ClipSprite id="glimpse-tau" style={{ filter: 'brightness(0.78) contrast(1.15) saturate(1.2)' }} />
      <div style={{ position: 'absolute', inset: 0, background: `radial-gradient(ellipse at 50% 78%, rgba(0,119,73,0.20) 0%, transparent 55%)` }} />
      <div style={{ position: 'absolute', inset: 0, background: `radial-gradient(ellipse at center, rgba(255,184,28,${(0.42 * beat).toFixed(3)}) 0%, transparent 62%)` }} />
      <Vignette strength={0.8} />
      {lt > 18.0 && (
        <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 34, opacity: titleP, zIndex: 22 }}>
          <Kicker size={34}>Only One Father Is Right</Kicker>
          <TitleReveal text="TWO SONS" start={19.8} size={120} color={MV.gold} />
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
          <Kicker>WorldCup26 Legends · Episode 56</Kicker>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 70, opacity: clamp(p2, 0, 1), transform: `scale(${p2})` }}>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 20 }}>
            <Waving><FlagRSA w={230} /></Waving>
            <BigTitle size={72} glow={RSA_LIGHT}>SOUTH AFRICA</BigTitle>
          </div>
          <BigTitle size={120} color={MV.gold}>VS</BigTitle>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 20 }}>
            <Waving speed={1.9}><FlagKOR w={230} /></Waving>
            <BigTitle size={72} glow={KOR_LIGHT}>SOUTH KOREA</BigTitle>
          </div>
        </div>
        <div style={{ opacity: p3, transform: `translateY(${(1 - p3) * 26}px)`, fontFamily: '"Inter",sans-serif', fontWeight: 600, fontSize: 32, color: MV.muted, letterSpacing: '0.08em' }}>
          GROUP A · TWO SONS OF THE BEAUTIFUL GAME
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
          {[['GROUP A', 'THE BIG STAGE'], ['BAFANA', 'vs TAEGEUK'], ['AFRICA', 'vs ASIA'], ['TWO SONS', 'ONE NIGHT']].map(([v, l], i) => (
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

// ── Squad montage grid (uses the full generated image + animation library) ────
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
              <div style={{ position: 'absolute', inset: 0, zIndex: 3, pointerEvents: 'none',
                background: `linear-gradient(115deg, transparent ${((t * 34 + i * 70) % 280) - 30 - 11}%, rgba(255,255,255,0.22) ${((t * 34 + i * 70) % 280) - 30}%, transparent ${((t * 34 + i * 70) % 280) - 30 + 11}%)`,
                mixBlendMode: 'overlay' }} />
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

// ── 4. South Africa (44–79.5): Bafana Bafana, green & gold, the counter-punchers
function SceneSouthAfrica() {
  const { localTime: lt } = useSprite();
  const S = 44.00;
  const headerP = Easing.easeOutCubic(clamp(lt / 0.9, 0, 1));
  return (
    <div style={{ position: 'absolute', inset: 0, background: 'rgba(10,12,20,0.46)' }}>
      <ClipSprite id="hist-rsa" dim={0.5} style={{ filter: 'brightness(0.34) saturate(0.8) contrast(1.1)' }} />
      <ClipSprite id="rsa-bg" dim={0.55} />
      <ClipSprite id="foster" dim={0.12} />
      <ClipSprite id="tau" dim={0.12} />
      <ClipSprite id="mokoena" dim={0.12} />
      <ClipSprite id="makgopa" dim={0.12} />
      <ClipSprite id="williams" dim={0.12} />
      <div style={{ position: 'absolute', inset: 0, zIndex: 22, pointerEvents: 'none', background: `linear-gradient(90deg, rgba(0,119,73,0.30) 0%, transparent 30%, transparent 70%, rgba(255,184,28,0.16) 100%)` }} />
      <div style={{ position: 'absolute', top: 108, left: 0, right: 0, display: 'flex', justifyContent: 'center', zIndex: 26, opacity: headerP, transform: `translateY(${(1 - headerP) * -24}px)` }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 26, background: MV.panel, border: `1px solid ${MV.line}`, borderRadius: 999, padding: '16px 44px' }}>
          <FlagRSA w={74} />
          <span style={{ fontFamily: '"Inter",sans-serif', fontWeight: 900, fontSize: 40, color: MV.text, letterSpacing: '0.10em' }}>BAFANA BAFANA</span>
        </div>
      </div>
      {/* squad named ~55.5s: Tau, Foster, Mokoena; then Makgopa + Williams ~68s */}
      <SquadGrid start={S + 11.5} end={S + 23.5} accent={RSA} players={[
        { img: 'assets/squad/rsa-tau.png', vid: 'sqx-tau', name: 'P. TAU', role: 'LION OF JUDAH' },
        { img: 'assets/squad/rsa-foster.png', vid: 'sqx-foster', name: 'L. FOSTER', role: 'THE POACHER' },
        { img: 'assets/squad/rsa-mokoena.png', vid: 'sqx-mokoena', name: 'T. MOKOENA', role: 'THE ENGINE' },
        { img: 'assets/squad/rsa-makgopa.png', vid: 'sqx-makgopa', name: 'E. MAKGOPA', role: 'THE AERIAL THREAT' },
        { img: 'assets/squad/rsa-williams.png', vid: 'sqx-williams', name: 'R. WILLIAMS', role: 'THE CAPTAIN' },
      ]} />
      <Sprite start={55.5} end={61.5}>
        <LowerThird start={55.8} name="PERCY TAU" role="The Lion of Judah · Forward" accent={RSA} />
      </Sprite>
      <Sprite start={61.5} end={65}>
        <LowerThird start={61.8} name="LYLE FOSTER" role="The Poacher · Striker" accent={RSA_LIGHT} />
      </Sprite>
      <Sprite start={65} end={68}>
        <LowerThird start={65.3} name="TEBOHO MOKOENA" role="The Engine · Midfielder" accent={RSA_GOLD} />
      </Sprite>
      <Sprite start={68} end={73.5}>
        <LowerThird start={68.3} name="EVIDENCE MAKGOPA" role="Fearless in the Air · Forward" accent={RSA_LIGHT} />
      </Sprite>
      <Sprite start={73.5} end={79.5}>
        <LowerThird start={73.8} name="RONWEN WILLIAMS" role="The Captain · Goalkeeper" accent={RSA} />
      </Sprite>
      <Vignette strength={0.4} />
      <Letterbox />
    </div>
  );
}

// ── 5. South Korea (79.5–103): the Taegeuk Warriors, red, carrying Son ────────
function SceneSouthKorea() {
  const { localTime: lt } = useSprite();
  const S = 79.50;
  const headerP = Easing.easeOutCubic(clamp(lt / 0.9, 0, 1));
  return (
    <div style={{ position: 'absolute', inset: 0, background: 'rgba(10,12,20,0.46)' }}>
      <ClipSprite id="hist-kor" dim={0.5} style={{ filter: 'brightness(0.34) saturate(0.8) contrast(1.1)' }} />
      <ClipSprite id="kor-bg" dim={0.55} />
      <ClipSprite id="son" dim={0.12} />
      <ClipSprite id="kim" dim={0.12} />
      <ClipSprite id="lee" dim={0.12} />
      <ClipSprite id="hwangib" dim={0.12} />
      <ClipSprite id="hwanghc" dim={0.12} />
      <div style={{ position: 'absolute', inset: 0, zIndex: 22, pointerEvents: 'none', background: `linear-gradient(90deg, rgba(205,46,58,0.28) 0%, transparent 30%, transparent 70%, rgba(0,71,160,0.18) 100%)` }} />
      <div style={{ position: 'absolute', top: 108, left: 0, right: 0, display: 'flex', justifyContent: 'center', zIndex: 26, opacity: headerP, transform: `translateY(${(1 - headerP) * -24}px)` }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 26, background: MV.panel, border: `1px solid ${MV.line}`, borderRadius: 999, padding: '16px 44px' }}>
          <FlagKOR w={74} />
          <span style={{ fontFamily: '"Inter",sans-serif', fontWeight: 900, fontSize: 40, color: MV.text, letterSpacing: '0.10em' }}>THE TAEGEUK WARRIORS</span>
        </div>
      </div>
      {/* squad named ~91s: Son, Kim, Lee, Hwang In-beom */}
      <SquadGrid start={S + 11.5} end={S + 22} accent={KOR} players={[
        { img: 'assets/squad/kor-son.png', vid: 'sqz-son', name: 'SON HEUNG-MIN', role: 'SONALDO' },
        { img: 'assets/squad/kor-kim.png', vid: 'sqz-kim', name: 'KIM MIN-JAE', role: 'THE MONSTER' },
        { img: 'assets/squad/kor-lee.png', vid: 'sqz-lee', name: 'LEE KANG-IN', role: 'THE MAGICIAN' },
        { img: 'assets/squad/kor-hwangib.png', vid: 'sqz-hwangib', name: 'HWANG IN-BEOM', role: 'THE CONDUCTOR' },
        { img: 'assets/squad/kor-hwanghc.png', vid: 'sqz-hwanghc', name: 'HWANG HEE-CHAN', role: 'THE BULLET' },
      ]} />
      <Sprite start={91} end={96}>
        <LowerThird start={91.3} name="SON HEUNG-MIN" role="Sonaldo · 173 Spurs goals" accent={KOR} />
      </Sprite>
      <Sprite start={96} end={99.5}>
        <LowerThird start={96.3} name="KIM MIN-JAE" role="The Monster · Defender" accent={KOR_LIGHT} />
      </Sprite>
      <Sprite start={99.5} end={103}>
        <LowerThird start={99.8} name="LEE KANG-IN" role="The Magician · Playmaker" accent={KOR_BLUE} />
      </Sprite>
      <Vignette strength={0.4} />
      <Letterbox />
    </div>
  );
}

// ── 6. The duel (103–132): Son vs Williams — the greatest vs the wall ─────────
function SceneDuel() {
  const { localTime: lt } = useSprite();
  const slideP = Easing.easeOutQuart(clamp(lt / 1.1, 0, 1));
  const vsP = Easing.easeOutBack(clamp((lt - 0.9) / 0.8, 0, 1));
  const shake = lt > 0.9 && lt < 1.25 ? Math.sin(lt * 160) * 7 * (1.25 - lt) / 0.35 : 0;
  return (
    <div style={{ position: 'absolute', inset: 0, background: 'rgba(5,6,10,0.46)', transform: `translate(${shake}px, ${-shake}px)` }}>
      <div style={{ position: 'absolute', top: 0, bottom: 0, left: 0, width: '50%', overflow: 'hidden', transform: `translateX(${(1 - slideP) * -100}%)` }}>
        <img src="assets/squad/kor-son.png" alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', filter: 'saturate(1.15) brightness(0.92)' }} />
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(90deg, rgba(205,46,58,0.32), transparent 65%)' }} />
        <div style={{ position: 'absolute', bottom: 150, left: 90, fontFamily: '"Inter",sans-serif', fontWeight: 900, fontSize: 62, color: '#fff', textShadow: '0 4px 26px rgba(0,0,0,0.9)' }}>
          THE GREATEST
          <div style={{ fontSize: 27, fontWeight: 700, color: MV.gold, letterSpacing: '0.2em', marginTop: 8 }}>SON HEUNG-MIN</div>
        </div>
      </div>
      <div style={{ position: 'absolute', top: 0, bottom: 0, right: 0, width: '50%', overflow: 'hidden', transform: `translateX(${(1 - slideP) * 100}%)` }}>
        <img src="assets/squad/rsa-williams.png" alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', filter: 'saturate(1.15) brightness(0.92)' }} />
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(270deg, rgba(0,119,73,0.46), transparent 65%)' }} />
        <div style={{ position: 'absolute', bottom: 150, right: 90, textAlign: 'right', fontFamily: '"Inter",sans-serif', fontWeight: 900, fontSize: 62, color: '#fff', textShadow: '0 4px 26px rgba(0,0,0,0.9)' }}>
          THE WALL
          <div style={{ fontSize: 27, fontWeight: 700, color: MV.gold, letterSpacing: '0.2em', marginTop: 8 }}>RONWEN WILLIAMS</div>
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
      <Sprite start={115.19} end={132}>
        <div style={{ position: 'absolute', left: 0, right: 0, bottom: 0, top: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 27, background: 'rgba(0,0,0,0.55)' }}>
          <Kicker size={40}>Stop Son, Win The Game</Kicker>
        </div>
      </Sprite>
      <Letterbox />
    </div>
  );
}

// ── 7. Match drama (132–203.32): 52' Makgopa header parried, Lyle FOSTER pounces
//      to score (VAR checks, stands) RSA 1–0; 89' Son curls, Ronwen WILLIAMS SAVES
//      (NO goal, 1–0 holds). The ONLY goal is Foster's. Final RSA 1–0 KOR — OUR
//      PREDICTION. The ScoreBug + final card carry "OUR PREDICTION", never "FULL TIME".
function SceneDrama() {
  const { localTime: lt } = useSprite();
  const S = 132.00;
  return (
    <div style={{ position: 'absolute', inset: 0, background: 'rgba(2,3,7,0.46)' }}>
      {/* LIVE ACTION footage tiled across the whole drama — never static */}
      <ClipSprite id="drama-stad" style={{ filter: 'brightness(0.82) contrast(1.08) saturate(1.12)' }} />
      <ClipSprite id="drama-tau" style={{ filter: 'brightness(0.9) contrast(1.1) saturate(1.15)' }} />
      <ClipSprite id="drama-makgopa" style={{ filter: 'brightness(0.9) contrast(1.1) saturate(1.15)' }} />
      <ClipSprite id="drama-foster" style={{ filter: 'brightness(0.96) contrast(1.12) saturate(1.2)' }} />
      <ClipSprite id="drama-celeb" style={{ filter: 'brightness(0.94) contrast(1.12) saturate(1.18)' }} />
      <ClipSprite id="drama-fill" style={{ filter: 'brightness(0.82) contrast(1.08) saturate(1.1)' }} />
      <ClipSprite id="drama-son" style={{ filter: 'brightness(0.86) contrast(1.1) saturate(1.12)' }} />
      <ClipSprite id="drama-williams" style={{ filter: 'brightness(0.96) contrast(1.12) saturate(1.2)' }} />
      <ClipSprite id="drama-end" style={{ filter: 'brightness(0.94) contrast(1.12) saturate(1.18)' }} />

      {/* 52' — predicted: Makgopa header parried, Lyle Foster pounces and pokes it
          over the line. VAR checks the offside — and the GOAL STANDS. RSA 1–0. */}
      <GoalFlash at={S + 24.5} />
      <Sprite start={157.5} end={190.0}>
        <ScoreBug start={S + 26.0} rsa={1} kor={0} minute="52'" badge="OUR PREDICTION" />
      </Sprite>

      {/* 89' — predicted: Son curls one for the top corner, but Ronwen Williams
          FLIES and catches it. The save of a lifetime. SAVE BEAT, NO goal — 1–0 holds. */}
      <Sprite start={190.0} end={203.32}>
        <ScoreBug start={S + 58.0} rsa={1} kor={0} minute="89'" badge="OUR PREDICTION" note="WILLIAMS SAVES" />
      </Sprite>

      {/* The predicted final — clearly stamped OUR PREDICTION, never FULL TIME */}
      <Sprite start={198.5} end={203.32}>
        <PredictionCard start={S + 67.0} />
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
        <Kicker size={26}>Two Sons of the Beautiful Game</Kicker>
        <div style={{ display: 'flex', alignItems: 'center', gap: 56, marginTop: 40 }}>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16 }}>
            <FlagRSA w={150} />
            <span style={{ fontFamily: '"Inter",sans-serif', fontWeight: 800, fontSize: 32, color: MV.text }}>SOUTH AFRICA</span>
          </div>
          <BigTitle size={170} color={MV.gold}>1 — 0</BigTitle>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16 }}>
            <FlagKOR w={150} />
            <span style={{ fontFamily: '"Inter",sans-serif', fontWeight: 800, fontSize: 32, color: MV.text }}>SOUTH KOREA</span>
          </div>
        </div>
        <div style={{ fontFamily: '"Inter",sans-serif', fontWeight: 800, fontSize: 26, color: MV.muted, letterSpacing: '0.18em', marginTop: 26 }}>THE ANSWER WORE GREEN</div>
      </div>
    </div>
  );
}

// ── 8. Disclaimer + group recap (203.32–244): our prediction & what it means ──
function SceneVerdict() {
  const { localTime: lt } = useSprite();
  const S = 203.32;
  const discP = Easing.easeOutCubic(clamp(lt / 1.0, 0, 1));
  const discFade = lt > 14 ? clamp((16 - lt) / 1.0, 0, 1) : 1;
  return (
    <div style={{ position: 'absolute', inset: 0, background: 'rgba(10,15,28,0.46)' }}>
      <ClipSprite id="verdict-bg" dim={0.6} />
      <Sprite start={203.32} end={217.52}>
        <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 26, opacity: discP * discFade }}>
          <div style={{ background: MV.panel, border: `1px solid ${MV.line}`, borderRadius: 22, padding: '44px 80px', textAlign: 'center', backdropFilter: 'blur(6px)' }}>
            <Kicker size={26} color={MV.gold}>Our Prediction</Kicker>
            <div style={{ fontFamily: '"Inter",sans-serif', fontWeight: 900, fontSize: 54, color: MV.text, letterSpacing: '0.04em', marginTop: 20 }}>THE REAL MATCH IS YOURS</div>
          </div>
        </div>
      </Sprite>
      <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 25 }}>
        <div style={{ background: MV.panel, border: `1px solid ${MV.line}`, borderRadius: 24, padding: '52px 84px', minWidth: 900, backdropFilter: 'blur(6px)', opacity: clamp((lt - 16.5) / 1.0, 0, 1) }}>
          <Kicker size={26}>Group A · Our Prediction</Kicker>
          <div style={{ marginTop: 26 }}>
            <StatLine start={S + 17} delay={0.0} label="SOUTH AFRICA" value="BAFANA BAFANA" accent={RSA_LIGHT} />
            <StatLine start={S + 17} delay={0.25} label="SOUTH KOREA" value="THE TAEGEUK WARRIORS" accent={KOR_LIGHT} />
            <StatLine start={S + 17} delay={0.5} label="OUR PREDICTION" value="RSA 1 — 0 KOR" accent={MV.text} />
            <StatLine start={S + 17} delay={0.75} label="52' FOSTER · 89' WILLIAMS SAVES" value="THE ANSWER WORE GREEN" accent={MV.gold} />
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
    { label: 'COMMENT BAFANA', sub: "SOUTH AFRICA'S ROAR", flag: <FlagRSA w={80} />, accent: RSA_LIGHT },
    { label: 'COMMENT SON', sub: "THE GREATEST", flag: <FlagKOR w={80} />, accent: KOR_LIGHT },
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
//      ENHANCED reveal: a "?" mystery teaser underlines the mystery, then the
//      premium card 3D-flips in with sparkle burst + rotating holo foil + signup CTA.
function SceneMystery() {
  const { localTime: lt } = useSprite();
  const S = 255.00;
  const inP = Easing.easeOutCubic(clamp((lt - 0.6) / 1.4, 0, 1));
  const teaseP = clamp((lt - 1.0) / 0.8, 0, 1) * clamp((4.0 - lt) / 0.6, 0, 1); // "?" before the card
  const teasePulse = 0.5 + 0.5 * Math.sin(lt * 4.2);
  const cardP = Easing.easeOutCubic(clamp((lt - 4.2) / 1.0, 0, 1));
  const flipDeg = (1 - cardP) * 88;                          // rotateY flip-in
  const settle = clamp((lt - 5.4) / 1.0, 0, 1);              // after flip lands
  const shine = lt > 5.4 ? -40 + (((lt - 5.4) * 24) % 240) : -60;
  const holoHue = (lt * 26) % 360;                            // rainbow foil sweep
  const burst = clamp((lt - 5.2) / 0.6, 0, 1);               // sparkle burst on land
  const floatY = Math.sin(lt * 1.05) * 5 * settle;
  const floatR = Math.sin(lt * 0.6) * 0.6 * settle;
  const pulse = 0.5 + 0.5 * Math.sin(lt * 3.4);              // signup-CTA pulse
  const ring = clamp((lt - 5.2) / 1.2, 0, 1);                // expanding sparkle ring
  return (
    <div style={{ position: 'absolute', inset: 0, background: 'rgba(2,3,10,0.46)' }}>
      <ClipSprite id="mystery" dim={0.12} />
      <ClipSprite id="mystery-close" dim={0.18} />
      <div style={{
        position: 'absolute', inset: 0, zIndex: 21, pointerEvents: 'none', opacity: 0.5,
        background: `radial-gradient(ellipse at ${20 + Math.sin(lt * 0.3) * 14}% 75%, rgba(255,184,28,0.18) 0%, transparent 45%),` +
                    `radial-gradient(ellipse at ${78 - Math.sin(lt * 0.22) * 12}% 30%, rgba(0,119,73,0.18) 0%, transparent 50%)`,
      }} />
      <AmbientParticles start={S} dur={26} count={46} color="252,228,150" maxR={3.5} zIndex={22} />
      <div style={{ position: 'absolute', top: 118, left: 0, right: 0, textAlign: 'center', zIndex: 25, opacity: inP }}>
        <Kicker size={26} color="#e8c97a">The Mystery Supporter · Legend No. 056</Kicker>
      </div>
      {/* "?" MYSTERY TEASER — underlines the mystery before the reveal */}
      {teaseP > 0.01 && (
        <div style={{
          position: 'absolute', left: '50%', top: '52%', zIndex: 24, pointerEvents: 'none',
          transform: `translate(-50%,-50%) scale(${0.8 + teasePulse * 0.12})`, opacity: teaseP,
          display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 18,
        }}>
          <div style={{
            width: 200, height: 200, borderRadius: '50%',
            background: 'radial-gradient(circle at 38% 32%, rgba(255,233,160,0.95), rgba(201,148,46,0.5) 70%)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: `0 0 ${50 + teasePulse * 40}px rgba(245,208,22,0.7)`,
          }}>
            <span style={{ fontFamily: '"Inter",sans-serif', fontWeight: 900, fontSize: 130, color: '#2a1c04' }}>?</span>
          </div>
          <div style={{ fontFamily: '"Inter",sans-serif', fontWeight: 900, fontSize: 30, color: '#ffe9a0', letterSpacing: '0.2em', textShadow: '0 2px 18px rgba(0,0,0,0.8)' }}>WHO IS LEGEND 056?</div>
        </div>
      )}
      {/* expanding sparkle ring as the card lands */}
      {ring > 0 && ring < 1 && (
        <div style={{
          position: 'absolute', left: '50%', top: '52%', zIndex: 23, pointerEvents: 'none',
          width: 700, height: 700, transform: `translate(-50%,-50%) scale(${0.3 + ring * 1.5})`,
          opacity: (1 - ring) * 0.8, borderRadius: '50%',
          border: '3px solid rgba(255,225,150,0.7)', boxShadow: '0 0 60px rgba(245,208,22,0.5)',
        }} />
      )}
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
              borderRadius: 22, background: 'linear-gradient(160deg, #102a16 0%, #0c3a22 55%, #08110c 100%)',
              padding: '34px 46px', position: 'relative', overflow: 'hidden',
            }}>
              <div style={{
                position: 'absolute', top: 26, right: 30,
                width: 96, height: 96, borderRadius: '50%',
                background: 'radial-gradient(circle at 35% 30%, #fbe9a8, #c9942e 70%)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                boxShadow: '0 8px 30px rgba(0,0,0,0.5), inset 0 0 0 3px rgba(255,255,255,0.35)',
              }}>
                <span style={{ fontFamily: '"Inter",sans-serif', fontWeight: 900, fontSize: 40, color: '#3a2706' }}>056</span>
              </div>
              <div style={{ fontFamily: '"Inter",sans-serif', fontWeight: 800, fontSize: 22, color: '#e8c97a', letterSpacing: '0.28em' }}>LEGEND 056</div>
              <div style={{ fontFamily: '"Inter",sans-serif', fontWeight: 900, fontSize: 64, color: '#f6f9ff', letterSpacing: '0.01em', marginTop: 8, lineHeight: 1.05, maxWidth: 540 }}>THE BEADWORKER</div>
              <div style={{ fontFamily: '"Inter",sans-serif', fontWeight: 700, fontSize: 22, color: '#9fe0bd', letterSpacing: '0.16em', marginTop: 14, textTransform: 'uppercase' }}>Ndebele Beadwork · South Africa</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginTop: 22 }}>
                <div style={{ display: 'inline-flex', alignSelf: 'flex-start', alignItems: 'center', gap: 12, background: 'rgba(255,210,74,0.14)', border: '1px solid rgba(255,210,74,0.55)', borderRadius: 999, padding: '10px 24px' }}>
                  <span style={{ fontSize: 24 }}>✦</span>
                  <span style={{ fontFamily: '"Inter",sans-serif', fontWeight: 800, fontSize: 22, color: MV.gold, letterSpacing: '0.08em' }}>worldcup26.world</span>
                </div>
                <div style={{ display: 'inline-flex', alignSelf: 'flex-start', alignItems: 'center', gap: 12,
                  background: 'linear-gradient(100deg, #16a34a, #0e8a3c)', borderRadius: 999, padding: '13px 30px',
                  transform: `scale(${1 + pulse * 0.04})`,
                  boxShadow: `0 8px 30px rgba(22,163,74,${0.35 + pulse * 0.4})` }}>
                  <span style={{ fontSize: 22 }}>⚡</span>
                  <span style={{ fontFamily: '"Inter",sans-serif', fontWeight: 900, fontSize: 23, color: '#fff', letterSpacing: '0.03em' }}>SIGN UP FREE — UNLOCK LEGEND 056</span>
                </div>
              </div>
              <div style={{
                position: 'absolute', inset: 0, pointerEvents: 'none', opacity: 0.5,
                background: `linear-gradient(${60 + holoHue}deg, hsla(${holoHue},90%,60%,0) 20%, hsla(${(holoHue + 60) % 360},90%,65%,0.22) 38%, hsla(${(holoHue + 140) % 360},90%,60%,0) 56%)`,
                mixBlendMode: 'color-dodge',
              }} />
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
    { name: 'SOUTH AFRICA', mult: 'EVERY GOAL SCORES', flag: <FlagRSA w={86} /> },
    { name: 'SOUTH KOREA', mult: 'EVERY GOAL SCORES', flag: <FlagKOR w={86} /> },
    { name: 'BRAZIL', mult: 'EVERY GOAL SCORES', flag: <div style={{ width: 86, height: 57, borderRadius: 6, background: '#009b3a', position: 'relative', overflow: 'hidden' }}><div style={{ position: 'absolute', left: '50%', top: '50%', width: 46, height: 32, background: '#ffdf00', transform: 'translate(-50%,-50%) rotate(45deg)' }} /><div style={{ position: 'absolute', left: '50%', top: '50%', width: 20, height: 20, borderRadius: '50%', background: '#002776', transform: 'translate(-50%,-50%)' }} /></div> },
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
                <div style={{ fontFamily: '"Inter",sans-serif', fontWeight: 900, fontSize: 26, color: '#fff', textAlign: 'center' }}>{c.name}</div>
                <div style={{ fontFamily: '"Inter",sans-serif', fontWeight: 800, fontSize: 22, color: MV.gold }}>{c.mult}</div>
              </div>
            );
          })}
        </div>
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
          Unlock Legend 056 the moment you sign up · free · no prizes
        </div>
      </div>
      <Letterbox />
    </div>
  );
}

// ── 12. CTA outro (303–318) ──────────────────────────────────────────────────
function SceneCTA() {
  const { localTime: lt } = useSprite();
  const S = 303.05;
  const inP = Easing.easeOutCubic(clamp(lt / 0.8, 0, 1));
  return (
    <div style={{ position: 'absolute', inset: 0, background: 'rgba(7,9,15,0.46)' }}>
      <ClipSprite id="cta-bg" dim={0.68} />
      <AmbientParticles start={305.29} dur={6} count={28} />
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
      <Sprite start={307.65} end={318.05}>
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
        <span style={{ fontFamily: '"Inter",sans-serif', fontWeight: 900, fontSize: 30, color: MV.gold }}>⚡ EP57 · COLLECT LEGEND 056 · worldcup26.world</span>
      </div>
    </div>
  );
}
