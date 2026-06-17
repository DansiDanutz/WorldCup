// match-scenes.jsx — the twelve scenes of the Episode 30 video (300s timeline):
// CANADA vs QATAR. Scene windows must match the SCENES table in match.html and
// narration.json. CLIP-BASED: real fal video animations (VideoSprite). SOCCER ONLY.
// a pitch with goals, never gridiron. REAL-RESULTS-ONLY: the 2-1 is OUR PREDICTION.
// NOTE: nested <Sprite> windows are GLOBAL seconds (Sprite reads the timeline clock).
// Story spine: Canada — the risers, 36 years away since 1986 (zero goals then),
// now 2026 co-hosts led by Alphonso Davies — against Qatar, the back-to-back
// Asian champions and the 2022 host. Legend 030 = the Boy of Eighty-Six.
// Palette: Canada red (#d52b1e)+white; Qatar maroon (#8a1538) + white.

// ── 1. Cold open (0–16): 40 years, 9 failed campaigns — the door stayed shut ──
function SceneColdOpen() {
  const { localTime: lt } = useSprite();
  const beat = Math.pow(Math.max(0, Math.sin(lt * Math.PI * 1.1)), 8);
  const line1P = Easing.easeOutCubic(clamp((lt - 1.2) / 1.4, 0, 1)) * (lt > 10.5 ? Math.max(0, (12.0 - lt) / 1.5) : 1);
  const titleP = Easing.easeOutCubic(clamp((lt - 12.3) / 1.4, 0, 1));
  return (
    <div style={{ position: 'absolute', inset: 0, background: '#000' }}>
      {/* a Jordan star — Al-Tamari as the symbol of the dream (dark, dramatic) */}
      <VideoSprite src="assets/mystery2.mp4" start={0} dur={16} from={1.18} to={1.32} panY={-30}
        dim={0.28} style={{ filter: 'brightness(0.72) contrast(1.18) saturate(1.05) grayscale(0)' }} />
      {/* ember base in Jordan red so the screen never reads as dead air */}
      <div style={{ position: 'absolute', inset: 0, background: `radial-gradient(ellipse at 50% 78%, rgba(206,17,38,0.18) 0%, transparent 55%)` }} />
      {/* heartbeat glow */}
      <div style={{ position: 'absolute', inset: 0, background: `radial-gradient(ellipse at center, rgba(206,17,38,${(0.5 * beat).toFixed(3)}) 0%, transparent 62%)` }} />
      {line1P > 0.01 && (
        <div style={{
          position: 'absolute', left: 160, right: 160, bottom: 200, textAlign: 'center', zIndex: 22,
          opacity: line1P,
          fontFamily: '"Inter",sans-serif', fontWeight: 800, fontSize: 46, color: '#f4d9bf',
          letterSpacing: '0.04em', lineHeight: 1.25, textShadow: '0 4px 22px rgba(0,0,0,0.9)',
        }}></div>
      )}
      <Vignette strength={0.85} />
      {lt > 12.3 && (
        <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 30, opacity: titleP, zIndex: 22 }}>
          <Kicker size={32} color="#f4d9bf">A true story</Kicker>
          <TitleReveal text="WHO BREAKS THE CURSE" start={12.4} size={96} color={MV.jor} />
        </div>
      )}
      <Letterbox />
    </div>
  );
}

// ── 2. Recap + title card (16–28) ────────────────────────────────────────────
function SceneTitle() {
  const { localTime: lt } = useSprite();
  // first ~10s carries the Ep22 recap line, then the Ep23 title settles
  const recapP = Easing.easeOutCubic(clamp(lt / 0.9, 0, 1)) * Math.max(0, Math.min(1, (10.5 - lt) / 1.0));
  const p1 = Easing.easeOutCubic(clamp((lt - 10.0) / 1.0, 0, 1));
  const p2 = Easing.easeOutBack(clamp((lt - 10.6) / 1.0, 0, 1));
  const p3 = Easing.easeOutCubic(clamp((lt - 11.4) / 0.9, 0, 1));
  return (
    <div style={{ position: 'absolute', inset: 0, background: `linear-gradient(180deg, #0a0f1c 0%, #11182b 55%, #0a0f1c 100%)` }}>
      <div style={{ position: 'absolute', inset: 0, background: `radial-gradient(ellipse at 50% 30%, rgba(206,17,38,0.10) 0%, transparent 55%)` }} />
      <VideoSprite src="assets/fans-away2.mp4" start={16} dur={14} dim={0.55} fit="cover" style={{ filter: "brightness(0.7) saturate(1.05)" }} />
      <div style={{ position: "absolute", inset: 0, background: "linear-gradient(180deg, rgba(7,10,18,0.45), rgba(7,10,18,0.78))" }} />
      <AmbientParticles start={16} dur={12} count={34} color="237,41,57" />
      {/* RECAP — OUR PREDICTION from Ep22 (never stated as a real result) */}
      {recapP > 0.01 && (
        <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 22, opacity: recapP }}>
          <Kicker size={26} color={MV.muted}>Last time · our prediction</Kicker>
          <BigTitle size={62} color={MV.text} glow={MV.gold} style={{ maxWidth: 1500 }}>SWITZERLAND 2 — 1 BOSNIA</BigTitle>
          <div style={{ fontFamily: '"Inter",sans-serif', fontWeight: 600, fontSize: 30, color: MV.muted, letterSpacing: '0.06em' }}></div>
        </div>
      )}
      {/* TITLE CARD */}
      {lt >= 9.5 && (
        <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 40 }}>
          <div style={{ opacity: p1, transform: `translateY(${(1 - p1) * -30}px)` }}>
            <Kicker color={MV.aut}>WorldCup26 Legends · Episode 30</Kicker>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 70, opacity: clamp(p2, 0, 1), transform: `scale(${p2})` }}>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 20 }}>
              <Waving><FlagCAN w={230} /></Waving>
              <BigTitle size={62} glow={MV.aut}>CANADA</BigTitle>
            </div>
            <BigTitle size={120} color={MV.gold}>VS</BigTitle>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 20 }}>
              <Waving speed={1.9}><FlagQAT w={230} /></Waving>
              <BigTitle size={62} glow={MV.jor}>QATAR</BigTitle>
            </div>
          </div>
          <div style={{ opacity: p3, transform: `translateY(${(1 - p3) * 26}px)`, fontFamily: '"Inter",sans-serif', fontWeight: 600, fontSize: 32, color: MV.muted, letterSpacing: '0.08em' }}>
            THE RISERS vs THE CHAMPIONS
          </div>
        </div>
      )}
      <Letterbox />
    </div>
  );
}

// ── 3. Tease (28–46.5): royalty vs newcomers + "the great fairytale" ─────────
function SceneTease() {
  const { localTime: lt } = useSprite();
  const a = Easing.easeOutCubic(clamp((lt - 0.4) / 1.0, 0, 1));
  // second beat (~44 global → lt ~16): "the story of how Jordan got here is a fairytale"
  const b = Easing.easeOutBack(clamp((lt - 14.0) / 1.0, 0, 1)) * Math.max(0, Math.min(1, (18.5 - lt) / 0.8));
  return (
    <div style={{ position: 'absolute', inset: 0, background: '#05060a' }}>
      <VideoSprite src="assets/stadium-wide.mp4" start={30} dur={20} dim={0.42} fit="cover" />
      <Vignette strength={0.5} />
      <AmbientParticles start={28} dur={18.5} count={26} color="255,209,0" />
      {/* royalty vs newcomers headline */}
      <div style={{ position: 'absolute', top: 200, left: 0, right: 0, textAlign: 'center', zIndex: 25, opacity: a, transform: `translateY(${(1 - a) * 24}px)` }}>
        <Kicker size={28} color={MV.aut}></Kicker>
        <div style={{ fontFamily: '"Inter",sans-serif', fontWeight: 900, fontSize: 76, color: MV.text, letterSpacing: '0.03em', marginTop: 18, textShadow: '0 4px 22px rgba(0,0,0,0.85)' }}>
          RISERS vs CHAMPIONS
        </div>
      </div>
      {/* the tease */}
      {b > 0.01 && (
        <div style={{ position: 'absolute', left: 0, right: 0, bottom: 210, display: 'flex', justifyContent: 'center', zIndex: 26, opacity: clamp(b, 0, 1), transform: `scale(${0.9 + 0.1 * clamp(b,0,1)})` }}>
          <div style={{ background: MV.panel, border: `1px solid ${MV.line}`, borderRadius: 999, padding: '20px 52px', display: 'flex', alignItems: 'center', gap: 18 }}>
            <span style={{ fontSize: 30 }}>⚽</span>
            <span style={{ fontFamily: '"Inter",sans-serif', fontWeight: 800, fontSize: 34, color: MV.gold, letterSpacing: '0.04em' }}></span>
          </div>
        </div>
      )}
      <Letterbox />
    </div>
  );
}

// ── 4. History (46.5–150): the Wunderteam + Jordan's Asian Cup + first WC ─────
function HistoryPlate({ start, end, year, venue, score, note, accent = MV.gold, stamp }) {
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
        boxShadow: '0 30px 110px rgba(0,0,0,0.65)', backdropFilter: 'blur(4px)', maxWidth: 1200,
      }}>
        <div style={{ fontFamily: '"Inter",sans-serif', fontWeight: 800, fontSize: 30, color: MV.muted, letterSpacing: '0.30em' }}>{venue}</div>
        <div style={{ fontFamily: '"Inter",sans-serif', fontWeight: 900, fontSize: 110, color: accent, lineHeight: 1.05, margin: '14px 0 6px', textShadow: `0 0 60px ${accent}44` }}>{score}</div>
        <div style={{ fontFamily: '"Inter",sans-serif', fontWeight: 800, fontSize: 44, color: MV.text, letterSpacing: '0.06em' }}>{year}</div>
        {note && <div style={{ fontFamily: '"Inter",sans-serif', fontWeight: 600, fontSize: 27, color: MV.muted, marginTop: 14, maxWidth: 900 }}>{note}</div>}
        {stamp && stampP > 0 && (
          <div style={{
            position: 'absolute', top: -34, right: -60, transform: `rotate(-12deg) scale(${stampP})`,
            border: `5px solid ${MV.jorGreen}`, color: MV.jorGreen, borderRadius: 14, padding: '10px 26px',
            fontFamily: '"Inter",sans-serif', fontWeight: 900, fontSize: 32, letterSpacing: '0.08em',
            background: 'rgba(7,9,15,0.85)',
          }}>{stamp}</div>
        )}
      </div>
    </div>
  );
}

function SceneHistory() {
  const S = 46.5;
  const t = useTime();
  // Background switches from an Austria-tinted plate (Wunderteam era) to a
  // Jordan-tinted one when the narration pivots to the Nashama (~lt 54 → t≈101).
  const austriaBg = t < 101;
  return (
    <div style={{ position: 'absolute', inset: 0, background: '#05060a' }}>
      {austriaBg ? (
        <VideoSprite src="assets/alphonso-davies-act.mp4" start={S} dur={54.5} from={1.1} to={1.24} panX={-20}
          dim={0.72} style={{ filter: 'brightness(0.24) saturate(0.7) contrast(1.1) grayscale(0.35)' }} />
      ) : (
        <VideoSprite src="assets/almoez-ali-act.mp4" start={101} dur={49} from={1.1} to={1.24} panX={20}
          dim={0.72} style={{ filter: 'brightness(0.26) saturate(0.85) contrast(1.1) grayscale(0.18)' }} />
      )}
      <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse at center, transparent 30%, rgba(5,6,10,0.82) 100%)' }} />
      <AmbientParticles start={S} dur={103.5} count={28} color={austriaBg ? '237,41,57' : '0,122,61'} maxR={4} />
      {/* chapter header */}
      <div style={{ position: 'absolute', top: 116, left: 0, right: 0, textAlign: 'center', zIndex: 26 }}>
        <Kicker size={28} color={austriaBg ? MV.aut : MV.jor}>Chapter One · The True History</Kicker>
        <div style={{ fontFamily: '"Inter",sans-serif', fontWeight: 900, fontSize: 50, color: MV.text, letterSpacing: '0.04em', marginTop: 16, textShadow: '0 4px 22px rgba(0,0,0,0.8)' }}>
          {austriaBg ? 'THE RISERS' : 'THE CHAMPIONS'}
        </div>
      </div>
      {/* flag, always present, swaps with the story */}
      <div style={{ position: 'absolute', bottom: 124, left: 0, right: 0, display: 'flex', justifyContent: 'center', zIndex: 26, opacity: 0.95 }}>
        {austriaBg ? <FlagCAN w={120} /> : <FlagQAT w={120} />}
      </div>
      {/* CANADA — the risers (narration 53–93) */}
      <HistoryPlate start={S + 6.0}  end={S + 16.0} year="1986 · ZERO GOALS" venue="CANADA · MEXICO 86" score="0 — 0 — 0" accent={MV.aut} />
      <HistoryPlate start={S + 16.0} end={S + 26.0} year="36 YEARS AWAY" venue="THE LONG WAIT" score="36 YEARS" accent={MV.gold} />
      <HistoryPlate start={S + 26.0} end={S + 36.0} year="DAVIES · 68 SECONDS" venue="THE FASTEST GOAL" score="68 SEC" accent={MV.text} stamp="LIFTOFF" />
      <HistoryPlate start={S + 36.0} end={S + 46.5} year="2026 CO-HOSTS" venue="HOME SOIL" score="THE RISERS" accent={MV.aut} />
      {/* QATAR — the champions (narration 101–139) */}
      <HistoryPlate start={S + 56.0} end={S + 65.5} year="2022 HOST" venue="QATAR · THE CHAMPIONS" score="WORST HOST EVER" accent={MV.jor} />
      <HistoryPlate start={S + 65.5} end={S + 76.5} year="ASIAN CHAMPIONS" venue="ASIAN CUP · 2019" score="3 — 1" accent={MV.jorGreen} stamp="KINGS" />
      <HistoryPlate start={S + 76.5} end={S + 87.0} year="BACK-TO-BACK" venue="ASIAN CUP · 2023" score="HISTORY" accent={MV.gold} />
      <HistoryPlate start={S + 87.0} end={S + 103.5} year="AFIF'S FINAL" venue="THE MAGICIAN" score="CAN × QAT" accent={MV.jor} stamp="ASIAN KINGS" />
      <Vignette strength={0.5} />
      <Letterbox />
    </div>
  );
}

// ── Squad montage grid (uses the generated still library) ────────────────────
function SquadGrid({ start, end, players, accent }) {
  const t = useTime();
  if (t < start || t > end) return null;
  const fade = t > end - 0.5 ? (end - t) / 0.5 : 1;
  return (
    <div style={{
      position: 'absolute', inset: 0, zIndex: 25, display: 'flex', alignItems: 'center', justifyContent: 'center',
      gap: 34, opacity: clamp(fade, 0, 1), padding: '0 90px',
    }}>
      {players.map((p, i) => {
        const cp = Easing.easeOutBack(clamp((t - start - 0.25 - i * 0.28) / 0.7, 0, 1));
        return (
          <div key={i} style={{
            width: 290, transform: `translateY(${(1 - cp) * 90}px) scale(${0.85 + 0.15 * cp})`, opacity: clamp(cp, 0, 1),
            borderRadius: 22, overflow: 'hidden', background: MV.panel, border: `1px solid ${MV.line}`,
            boxShadow: `0 26px 80px rgba(0,0,0,0.6)`,
          }}>
            <div style={{ height: 322, overflow: 'hidden' }}>
              <VideoSprite src={p.clip} start={start} dur={end - start} fit="cover" />
            </div>
            <div style={{ padding: '18px 16px 20px', textAlign: 'center', borderTop: `4px solid ${accent}` }}>
              <div style={{ fontFamily: '"Inter",sans-serif', fontWeight: 900, fontSize: 25, color: MV.text }}>{p.name}</div>
              <div style={{ fontFamily: '"Inter",sans-serif', fontWeight: 700, fontSize: 17, color: MV.muted, letterSpacing: '0.16em', marginTop: 5 }}>{p.role}</div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ── 5. Austria (150–178): heirs of the Wunderteam ────────────────────────────
function SceneAustria() {
  const { localTime: lt } = useSprite();
  const S = 150.0;
  const headerP = Easing.easeOutCubic(clamp(lt / 0.9, 0, 1));
  return (
    <div style={{ position: 'absolute', inset: 0, background: '#0a0c14' }}>
      <PitchBackdrop tint="#241015" dim={0.4} />
      <div style={{ position: 'absolute', inset: 0, zIndex: 22, pointerEvents: 'none', background: `linear-gradient(90deg, rgba(237,41,57,0.22) 0%, transparent 30%, transparent 70%, rgba(255,255,255,0.10) 100%)` }} />
      <div style={{ position: 'absolute', top: 108, left: 0, right: 0, display: 'flex', justifyContent: 'center', zIndex: 26, opacity: headerP, transform: `translateY(${(1 - headerP) * -24}px)` }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 26, background: MV.panel, border: `1px solid ${MV.line}`, borderRadius: 999, padding: '16px 44px' }}>
          <FlagCAN w={74} />
          <span style={{ fontFamily: '"Inter",sans-serif', fontWeight: 900, fontSize: 40, color: MV.text, letterSpacing: '0.10em' }}>CANADA · THE RISERS</span>
        </div>
      </div>
      <SquadGrid start={S + 0.4} end={S + 7.0} accent={MV.aut} players={[
        { clip: 'assets/alphonso-davies.mp4', img: 'assets/squad/can-1-Davies.png', name: 'ALPHONSO DAVIES', role: 'CAPTAIN · WINGER' },
        { clip: 'assets/jonathan-david.mp4', img: 'assets/squad/can-2-David.png', name: 'JONATHAN DAVID', role: 'TOP SCORER' },
        { clip: 'assets/tajon-buchanan.mp4', img: 'assets/squad/can-3-Buchanan.png', name: 'TAJON BUCHANAN', role: 'THE FLAIR' },
        { clip: 'assets/stephen-eustaquio.mp4', img: 'assets/squad/can-4-Eustaquio.png', name: 'EUSTÁQUIO', role: 'THE ENGINE' },
        { clip: 'assets/cyle-larin.mp4', img: 'assets/squad/can-5-Larin.png', name: 'CYLE LARIN', role: 'THE TARGET' },
      ]} />
      {/* line beats: 150 Alaba, 160 Sabitzer/Laimer/Baumgartner, 170 Arnautovic */}
      <Sprite start={150.0} end={160.0}>
        <VideoSprite src="assets/alphonso-davies-cel.mp4" start={150} dur={10} from={1.04} to={1.14} dim={0.18} style={{ zIndex: 10 }} />
        <LowerThird start={150.4} name="ALPHONSO DAVIES" role="Captain · Winger" accent={MV.aut} />
      </Sprite>
      <Sprite start={160.0} end={170.0}>
        <VideoSprite src="assets/tajon-buchanan-act.mp4" start={160} dur={10} from={1.04} to={1.16} panX={20} dim={0.18} style={{ zIndex: 10 }} />
        <LowerThird start={160.4} name="BUCHANAN · DAVID · EUSTÁQUIO" role="The Midfield" accent={MV.aut} />
      </Sprite>
      <Sprite start={170.0} end={178.0}>
        <VideoSprite src="assets/cyle-larin-act.mp4" start={170} dur={8} from={1.04} to={1.14} dim={0.18} style={{ zIndex: 10 }} />
        <LowerThird start={170.3} name="CYLE LARIN" role="The Target · Striker" accent={MV.autSoft} />
      </Sprite>
      <Vignette strength={0.42} />
      <Letterbox />
    </div>
  );
}

// ── 6. Jordan (178–195): Al-Tamari & Al-Naimat ───────────────────────────────
function SceneJordan() {
  const { localTime: lt } = useSprite();
  const S = 178.0;
  const headerP = Easing.easeOutCubic(clamp(lt / 0.9, 0, 1));
  return (
    <div style={{ position: 'absolute', inset: 0, background: '#0a0c14' }}>
      <PitchBackdrop tint="#0a2a18" dim={0.4} />
      <div style={{ position: 'absolute', inset: 0, zIndex: 22, pointerEvents: 'none', background: `linear-gradient(90deg, rgba(206,17,38,0.24) 0%, transparent 30%, transparent 70%, rgba(0,122,61,0.18) 100%)` }} />
      <div style={{ position: 'absolute', top: 108, left: 0, right: 0, display: 'flex', justifyContent: 'center', zIndex: 26, opacity: headerP, transform: `translateY(${(1 - headerP) * -24}px)` }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 26, background: MV.panel, border: `1px solid ${MV.line}`, borderRadius: 999, padding: '16px 44px' }}>
          <FlagQAT w={74} />
          <span style={{ fontFamily: '"Inter",sans-serif', fontWeight: 900, fontSize: 40, color: MV.text, letterSpacing: '0.10em' }}>QATAR · ASIAN CHAMPIONS</span>
        </div>
      </div>
      <SquadGrid start={S + 0.4} end={S + 8.0} accent={MV.jor} players={[
        { clip: 'assets/akram-afif.mp4', img: 'assets/squad/qat-1-Afif.png', name: 'AKRAM AFIF', role: 'THE MAGICIAN' },
        { clip: 'assets/almoez-ali.mp4', img: 'assets/squad/qat-2-AlmoezAli.png', name: 'ALMOEZ ALI', role: 'TOP SCORER' },
        { clip: 'assets/hassan-al-haydos.mp4', img: 'assets/squad/qat-3-AlHaydos.png', name: 'AL-HAYDOS', role: 'THE CAPTAIN' },
        { clip: 'assets/abdelkarim-hassan.mp4', img: 'assets/squad/qat-4-Hassan.png', name: 'ABDELKARIM HASSAN', role: 'THE FLANK' },
        { clip: 'assets/karim-boudiaf.mp4', img: 'assets/squad/qat-5-Boudiaf.png', name: 'KARIM BOUDIAF', role: 'THE WALL' },
      ]} />
      {/* line beats: 178 Al-Tamari, 187 Al-Naimat */}
      <Sprite start={178.0} end={187.0}>
        <VideoSprite src="assets/stadium-night.mp4" start={178} dur={9} from={1.04} to={1.16} panX={-20} dim={0.2} style={{ zIndex: 10 }} />
        <LowerThird start={178.3} name="AKRAM AFIF" role="The Magician · Winger" accent={MV.jor} />
      </Sprite>
      <Sprite start={187.0} end={195.0}>
        <VideoSprite src="assets/almoez-ali-cel.mp4" start={187} dur={8} from={1.04} to={1.14} dim={0.2} style={{ zIndex: 10 }} />
        <LowerThird start={187.3} name="ALMOEZ ALI" role="Top Scorer · Striker" accent={MV.jorGreen} />
      </Sprite>
      <Vignette strength={0.42} />
      <Letterbox />
    </div>
  );
}

// ── 7. The duel (195–213): pedigree vs fearless ──────────────────────────────
function SceneDuel() {
  const { localTime: lt } = useSprite();
  const slideP = Easing.easeOutQuart(clamp(lt / 1.1, 0, 1));
  const vsP = Easing.easeOutBack(clamp((lt - 0.9) / 0.8, 0, 1));
  const shake = lt > 0.9 && lt < 1.25 ? Math.sin(lt * 160) * 7 * (1.25 - lt) / 0.35 : 0;
  return (
    <div style={{ position: 'absolute', inset: 0, background: '#05060a', transform: `translate(${shake}px, ${-shake}px)` }}>
      <div style={{ position: 'absolute', top: 0, bottom: 0, left: 0, width: '50%', overflow: 'hidden', transform: `translateX(${(1 - slideP) * -100}%)` }}>
        <VideoSprite src="assets/jonathan-david-act.mp4" start={195} dur={18.5} fit="cover" />
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(90deg, rgba(237,41,57,0.34), transparent 65%)' }} />
        <div style={{ position: 'absolute', bottom: 150, left: 90, fontFamily: '"Inter",sans-serif', fontWeight: 900, fontSize: 58, color: '#fff', textShadow: '0 4px 26px rgba(0,0,0,0.9)' }}>
          THE RISERS
          <div style={{ fontSize: 27, fontWeight: 700, color: MV.gold, letterSpacing: '0.2em', marginTop: 8 }}>CANADA · 36 YEARS OF HURT</div>
        </div>
      </div>
      <div style={{ position: 'absolute', top: 0, bottom: 0, right: 0, width: '50%', overflow: 'hidden', transform: `translateX(${(1 - slideP) * 100}%)` }}>
        <VideoSprite src="assets/fans-can-anx.mp4" start={195} dur={18.5} fit="cover" />
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(270deg, rgba(0,122,61,0.4), transparent 65%)' }} />
        <div style={{ position: 'absolute', bottom: 150, right: 90, textAlign: 'right', fontFamily: '"Inter",sans-serif', fontWeight: 900, fontSize: 58, color: '#fff', textShadow: '0 4px 26px rgba(0,0,0,0.9)' }}>
          THE CHAMPIONS
          <div style={{ fontSize: 27, fontWeight: 700, color: MV.gold, letterSpacing: '0.2em', marginTop: 8 }}>QATAR · KINGS OF ASIA</div>
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
      <Sprite start={207.5} end={213.0}>
        <div style={{ position: 'absolute', left: 0, right: 0, bottom: 0, top: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 27, background: 'rgba(0,0,0,0.55)' }}>
          <BigTitle size={66} color={MV.text} style={{ maxWidth: 1400 }}></BigTitle>
        </div>
      </Sprite>
      <Letterbox />
    </div>
  );
}

// ── 8. Match drama (213–256): OUR PREDICTION Austria 2-1 Jordan ──────────────
// Sabitzer→Baumgartner (1-0, ~221). Al-Tamari→Al-Naimat answers (1-1, ~232.5).
// Alaba climbs at a corner for the winner (2-1, ~244). Full-time = OUR PREDICTION.
function SceneDrama() {
  const { localTime: lt } = useSprite();
  const S = 213.0;
  return (
    <div style={{ position: 'absolute', inset: 0, background: '#000' }}>
      <VideoSprite src="assets/fans-can-joy.mp4" start={S} dur={19} from={1.1} to={1.28} panX={-30} dim={0.18} />
      <Sprite start={224} end={236}>
        <VideoSprite src="assets/akram-afif-act.mp4" start={224} dur={12} from={1.08} to={1.24} panX={20} dim={0.16} />
      </Sprite>
      <Sprite start={236} end={247}>
        <VideoSprite src="assets/stephen-eustaquio-act.mp4" start={236} dur={11} from={1.08} to={1.22} panX={-18} dim={0.16} />
      </Sprite>
      {/* OUR PREDICTION watermark — REAL-RESULTS-ONLY rule */}
      <div style={{ position: 'absolute', top: 116, left: 0, right: 0, textAlign: 'center', zIndex: 25 }}>
        <Kicker size={24} color={MV.gold}>Our Prediction · Our Story</Kicker>
      </div>

      {/* 0-0 until Austria's opener (~221, lt 8) */}
      <Sprite start={213.0} end={221.0}>
        <ScoreBug start={S + 0.4} aut={0} jor={0} minute="1st half" />
      </Sprite>
      <GoalFlash at={S + 8.0} color={MV.aut} />
      <Confetti start={S + 8.2} dur={11} colors={[MV.aut, '#fff', MV.gold]} />
      <Sprite start={221.0} end={232.5}>
        <ScoreBug start={S + 8.0} aut={1} jor={0} minute="DAVID" />
      </Sprite>
      {/* Jordan equalise (~232.5, lt 19.5) */}
      <GoalFlash at={S + 19.5} color={MV.jor} />
      <Confetti start={S + 19.7} dur={11} colors={[MV.jor, '#fff', MV.jorGreen, '#000']} />
      <Sprite start={232.5} end={244.0}>
        <ScoreBug start={S + 19.5} aut={1} jor={1} minute="AFIF" />
      </Sprite>
      {/* Austria winner (~244, lt 31) */}
      <GoalFlash at={S + 31.0} color={MV.aut} />
      <Confetti start={S + 31.2} dur={11} colors={[MV.aut, '#fff', MV.gold]} />
      <Sprite start={244.0} end={250.0}>
        <ScoreBug start={S + 31.0} aut={2} jor={1} minute="DAVIES" />
      </Sprite>

      <Sprite start={250.0} end={256.0}>
        <FullTimeCard start={S + 37.0} />
      </Sprite>
      <Vignette strength={0.42} />
      <Letterbox />
    </div>
  );
}

function FullTimeCard({ start }) {
  const t = useTime();
  const local = t - start;
  const p = Easing.easeOutCubic(clamp(local / 1.0, 0, 1));
  return (
    <div style={{ position: 'absolute', inset: 0, zIndex: 26, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(2,3,6,0.62)', opacity: p }}>
      <div style={{ background: MV.panel, border: `1px solid ${MV.line}`, borderRadius: 26, padding: '54px 100px', textAlign: 'center', transform: `scale(${0.92 + 0.08 * p})`, boxShadow: '0 30px 120px rgba(0,0,0,0.7)' }}>
        <Kicker size={26} color={MV.gold}>Our Prediction · Full Time</Kicker>
        <div style={{ display: 'flex', alignItems: 'center', gap: 56, marginTop: 36 }}>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16 }}>
            <FlagCAN w={150} />
            <span style={{ fontFamily: '"Inter",sans-serif', fontWeight: 800, fontSize: 34, color: MV.text }}>CANADA</span>
          </div>
          <BigTitle size={170} color={MV.gold}>2 — 1</BigTitle>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16 }}>
            <FlagQAT w={150} />
            <span style={{ fontFamily: '"Inter",sans-serif', fontWeight: 800, fontSize: 34, color: MV.text }}>QATAR</span>
          </div>
        </div>
        <div style={{ fontFamily: '"Inter",sans-serif', fontWeight: 600, fontSize: 30, color: MV.muted, marginTop: 34, maxWidth: 1000 }}></div>
      </div>
    </div>
  );
}

// ── 9. Verdict (256–266): do you agree? CANADA / QATAR ──────────────────
function SceneVerdict() {
  const { localTime: lt } = useSprite();
  const S = 256.0;
  const headP = Easing.easeOutCubic(clamp(lt / 0.8, 0, 1));
  const a = Easing.easeOutBack(clamp((lt - 1.2) / 0.7, 0, 1));
  const b = Easing.easeOutBack(clamp((lt - 1.6) / 0.7, 0, 1));
  return (
    <div style={{ position: 'absolute', inset: 0, background: '#0a0f1c' }}>
      <PitchBackdrop tint="#1a1014" dim={0.45} />
      <div style={{ position: 'absolute', top: 150, left: 0, right: 0, textAlign: 'center', zIndex: 25, opacity: headP }}>
        <Kicker size={30} color={MV.text}></Kicker>
        <div style={{ fontFamily: '"Inter",sans-serif', fontWeight: 900, fontSize: 72, color: MV.gold, marginTop: 18, letterSpacing: '0.04em' }}>DO YOU AGREE?</div>
      </div>
      <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 70, zIndex: 26, marginTop: 60 }}>
        <div style={{ opacity: clamp(a, 0, 1), transform: `translateY(${(1 - a) * 50}px) scale(${0.85 + 0.15 * a})`, background: 'rgba(237,41,57,0.12)', border: `2px solid ${MV.aut}`, borderRadius: 22, padding: '34px 60px', textAlign: 'center', minWidth: 420 }}>
          <div style={{ fontFamily: '"Inter",sans-serif', fontWeight: 900, fontSize: 52, color: MV.autSoft, letterSpacing: '0.06em' }}>“CANADA”</div>
          <div style={{ fontFamily: '"Inter",sans-serif', fontWeight: 600, fontSize: 26, color: MV.muted, marginTop: 12 }}></div>
        </div>
        <div style={{ opacity: clamp(b, 0, 1), transform: `translateY(${(1 - b) * 50}px) scale(${0.85 + 0.15 * b})`, background: 'rgba(0,122,61,0.18)', border: `2px solid ${MV.jorGreen}`, borderRadius: 22, padding: '34px 60px', textAlign: 'center', minWidth: 420 }}>
          <div style={{ fontFamily: '"Inter",sans-serif', fontWeight: 900, fontSize: 52, color: '#3ddc8a', letterSpacing: '0.06em' }}>“QATAR”</div>
          <div style={{ fontFamily: '"Inter",sans-serif', fontWeight: 600, fontSize: 26, color: MV.muted, marginTop: 12 }}></div>
        </div>
      </div>
      <Vignette strength={0.5} />
      <Letterbox />
    </div>
  );
}

// ── 10. Mystery Supporter (266–284): Legend 030 — the the Boy of Eighty-Six ─────
function SceneMystery() {
  const { localTime: lt } = useSprite();
  const S = 266.0;
  const inP = Easing.easeOutCubic(clamp((lt - 0.6) / 1.4, 0, 1));
  const plateP = Easing.easeOutBack(clamp((lt - 4.2) / 0.9, 0, 1));
  return (
    <div style={{ position: 'absolute', inset: 0, background: '#02030a' }}>
      <VideoSprite src="assets/cyle-larin-cel.mp4" start={S} dur={18} from={1.16} to={1.3} panY={-20}
        dim={0.32} style={{ filter: 'brightness(0.4) contrast(1.1) saturate(1.0) grayscale(0.28)' }} />
      <div style={{
        position: 'absolute', inset: 0, zIndex: 21, pointerEvents: 'none', opacity: 0.5,
        background: `radial-gradient(ellipse at ${20 + Math.sin(lt * 0.3) * 14}% 75%, rgba(206,17,38,0.16) 0%, transparent 45%),` +
                    `radial-gradient(ellipse at ${78 - Math.sin(lt * 0.22) * 12}% 30%, rgba(0,122,61,0.14) 0%, transparent 50%)`,
      }} />
      <AmbientParticles start={S} dur={18} count={46} color="255,210,150" maxR={3.5} zIndex={22} />
      <div style={{ position: 'absolute', top: 118, left: 0, right: 0, textAlign: 'center', zIndex: 25, opacity: inP }}>
        <Kicker size={26} color="#f4c98a">The Mystery Supporter · Legend No. 030</Kicker>
      </div>
      {plateP > 0 && (
        <div style={{
          position: 'absolute', left: 110, bottom: 150, zIndex: 25,
          opacity: clamp(plateP, 0, 1), transform: `translateY(${(1 - plateP) * 50}px)`,
        }}>
          <div style={{ background: 'rgba(14,12,8,0.9)', border: '1px solid rgba(255,200,120,0.4)', borderRadius: 18, padding: '28px 44px', backdropFilter: 'blur(6px)' }}>
            <div style={{ fontFamily: '"Inter",sans-serif', fontWeight: 900, fontSize: 54, color: '#fff3e2', letterSpacing: '0.02em' }}>THE BOY OF EIGHTY-SIX</div>
            <div style={{ fontFamily: '"Inter",sans-serif', fontWeight: 700, fontSize: 24, color: '#f4c98a', letterSpacing: '0.14em', marginTop: 8, maxWidth: 820 }}>1986 · ZERO GOALS</div>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 12, marginTop: 18, background: 'rgba(255,210,74,0.12)', border: '1px solid rgba(255,210,74,0.5)', borderRadius: 999, padding: '10px 24px' }}>
              <span style={{ fontSize: 26 }}>✦</span>
              <span style={{ fontFamily: '"Inter",sans-serif', fontWeight: 800, fontSize: 24, color: MV.gold, letterSpacing: '0.08em' }}>COLLECT HIM INSIDE THE GAME · worldcup26.world</span>
            </div>
          </div>
        </div>
      )}
      <Vignette strength={0.55} />
      <Letterbox />
    </div>
  );
}

// ── 11. App promo (284–292): worldcup26.world ────────────────────────────────
function SceneApp() {
  const { localTime: lt } = useSprite();
  const S = 284.0;
  const inP = Easing.easeOutCubic(clamp(lt / 1.0, 0, 1));
  const cards = [
    { name: 'CANADA', coef: 'x2.10', pts: '+2.10', flag: <FlagCAN w={86} />, hot: true },
    { name: 'QATAR', coef: 'x3.00', pts: 'UNDERDOG', flag: <FlagQAT w={86} />, hot: true },
    { name: 'BRAZIL', coef: 'x1.20', pts: '+0.00', flag: <div style={{ width: 86, height: 57, borderRadius: 6, background: 'linear-gradient(135deg,#159b46 55%,#ffd24a 55%)' }} /> },
  ];
  return (
    <div style={{ position: 'absolute', inset: 0, background: `linear-gradient(160deg, #0d2a20 0%, #07090f 70%)` }}>
      <div style={{ position: 'absolute', inset: 0, background: `radial-gradient(ellipse at 50% 20%, rgba(16,107,79,0.35) 0%, transparent 60%)` }} />
      <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 36, opacity: inP }}>
        <Kicker color="#7fd6b5" size={30}>The Prediction Game</Kicker>
        <BigTitle size={100} color="#fff" glow={MV.green}>worldcup26.world</BigTitle>
        <div style={{ fontFamily: '"Inter",sans-serif', fontWeight: 700, fontSize: 36, color: '#cfe9de', letterSpacing: '0.04em' }}></div>
        <div style={{ display: 'flex', gap: 36, marginTop: 8 }}>
          {cards.map((c, i) => {
            const cp = Easing.easeOutBack(clamp((lt - 1.2 - i * 0.35) / 0.7, 0, 1));
            return (
              <div key={i} style={{
                transform: `translateY(${(1 - cp) * 60}px) scale(${0.8 + 0.2 * cp})`, opacity: clamp(cp, 0, 1),
                background: 'rgba(255,255,255,0.07)', border: `1px solid ${c.hot ? 'rgba(255,210,74,0.5)' : 'rgba(255,255,255,0.18)'}`, borderRadius: 22,
                padding: '34px 46px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16, minWidth: 290,
                boxShadow: '0 24px 70px rgba(0,0,0,0.45)',
              }}>
                {c.flag}
                <div style={{ fontFamily: '"Inter",sans-serif', fontWeight: 900, fontSize: 30, color: '#fff' }}>{c.name}</div>
                <div style={{ fontFamily: '"Inter",sans-serif', fontWeight: 800, fontSize: 26, color: MV.gold }}>{c.coef}</div>
                <div style={{ fontFamily: '"Inter",sans-serif', fontWeight: 800, fontSize: 26, color: c.hot ? '#6ee7a8' : '#9fb2a9' }}>{c.pts}</div>
              </div>
            );
          })}
        </div>
        <div style={{ fontFamily: '"Inter",sans-serif', fontWeight: 800, fontSize: 32, color: MV.gold, letterSpacing: '0.05em', marginTop: 6 }}>
          FREE TO PLAY · LIVE LEADERBOARD · JUST FOR FUN
        </div>
      </div>
      <Letterbox />
    </div>
  );
}

// ── 12. CTA outro (292–300) ──────────────────────────────────────────────────
function SceneCTA() {
  const { localTime: lt } = useSprite();
  const S = 292;
  const inP = Easing.easeOutCubic(clamp(lt / 0.8, 0, 1));
  return (
    <div style={{ position: 'absolute', inset: 0, background: '#07090f' }}>
      <PitchBackdrop tint="#1a1014" dim={0.55} />
      <AmbientParticles start={S} dur={8} count={28} color="237,41,57" />
      <div style={{ position: 'absolute', inset: 0, zIndex: 23, background: 'radial-gradient(ellipse at 50% 35%, transparent 0%, rgba(7,9,15,0.88) 75%)' }} />
      <div style={{ position: 'absolute', top: 200, left: 0, right: 0, textAlign: 'center', zIndex: 25, opacity: inP }}>
        <Kicker size={30} color={MV.aut}></Kicker>
        <div style={{ marginTop: 24 }}><TitleReveal text="JOIN THE LEGENDS" start={S + 0.5} size={86} color={MV.text} /></div>
      </div>
      <div style={{ position: 'absolute', inset: 0, zIndex: 26 }}>
        <CtaButton start={S} delay={1.2} label="SUBSCRIBE" icon="🔔" accent="#ed2939" x={500} />
        <CtaButton start={S} delay={1.6} label="LIKE" icon="👍" accent="#007a3d" x={960} />
        <CtaButton start={S} delay={2.0} label="SHARE" icon="📣" accent="#c9942e" x={1400} />
      </div>
      <Sprite start={296.6} end={300}>
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
        <span style={{ fontFamily: '"Inter",sans-serif', fontWeight: 700, fontSize: 26, color: MV.muted, letterSpacing: '0.14em' }}>WORLDCUP26 LEGENDS</span>
        <span style={{ fontFamily: '"Inter",sans-serif', fontWeight: 900, fontSize: 30, color: MV.gold }}>✦ THE DREAM PLAYS ON · worldcup26.world</span>
      </div>
    </div>
  );
}
