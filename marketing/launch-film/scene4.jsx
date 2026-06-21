// scene4.jsx — SCORING (global 82–116 → local 0–34). Full-bleed explainer.
const { Sprite, useTime, useSprite, Easing, interpolate, animate, clamp } = window;
const { C, FONT, PICKS, Flag, Eyebrow, Pill, PaperBG } = window;

const s4ease = Easing.easeOutCubic;
const appear = (lt, at, d = 0.5) => clamp((lt - at) / d, 0, 1);

// formula token chip
function Tok({ label, value, filled, color = C.text, bg = C.surface, big, show = 1, pop = 0 }) {
  return (
    <div style={{
      display: 'inline-flex', flexDirection: 'column', alignItems: 'center', gap: 5,
      padding: big ? '14px 22px' : '12px 18px', borderRadius: 12,
      background: filled ? bg : C.surfaceStrong, border: `1.5px solid ${filled ? color + '55' : C.border}`,
      opacity: show, transform: `scale(${0.9 + show * 0.1 + pop * 0.06})`, minWidth: big ? 96 : 64,
      boxShadow: filled ? `0 6px 18px ${color}1a` : 'none',
    }}>
      <span style={{ fontFamily: FONT, fontWeight: 800, fontSize: big ? 40 : 30, lineHeight: 1, color: filled ? color : C.borderStrong }}>{value}</span>
      <span style={{ fontFamily: FONT, fontWeight: 760, fontSize: 11.5, letterSpacing: '0.05em', textTransform: 'uppercase', color: C.muted, whiteSpace: 'nowrap' }}>{label}</span>
    </div>
  );
}
function Op({ ch, show = 1 }) {
  return <span style={{ fontFamily: FONT, fontWeight: 700, fontSize: 34, color: C.muted, opacity: show, margin: '0 2px' }}>{ch}</span>;
}

function Scorecard({ lt }) {
  const sc = appear(lt, 6.6, 0.5);
  const homeGoals = lt >= 8.4 ? 1 : 0;
  const homeGoals2 = lt >= 9.6 ? 2 : homeGoals;
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 30,
      padding: '20px 40px', borderRadius: 18, background: C.surface, border: `1px solid ${C.border}`,
      boxShadow: '0 16px 45px rgba(17,43,36,.10)', opacity: sc, transform: `translateY(${(1 - sc) * 24}px)` }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
        <Flag id="morocco" w={72} radius={8} />
        <div>
          <div style={{ fontFamily: FONT, fontWeight: 800, fontSize: 30, color: C.text }}>Morocco</div>
          <div style={{ display: 'inline-flex', marginTop: 4 }}><Pill bg={PICKS[1].b} color={PICKS[1].t} border={PICKS[1].bd} style={{ fontSize: 12.5 }}>Your pick · 1.77×</Pill></div>
        </div>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 18 }}>
        <span style={{ fontFamily: FONT, fontWeight: 850, fontSize: 64, color: C.green, lineHeight: 1, minWidth: 44, textAlign: 'center' }}>{homeGoals2}</span>
        <span style={{ fontFamily: FONT, fontWeight: 700, fontSize: 34, color: C.borderStrong }}>–</span>
        <span style={{ fontFamily: FONT, fontWeight: 850, fontSize: 64, color: C.muted, lineHeight: 1, minWidth: 44, textAlign: 'center' }}>0</span>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontFamily: FONT, fontWeight: 800, fontSize: 30, color: C.text }}>Brazil</div>
          <div style={{ fontFamily: FONT, fontWeight: 700, fontSize: 13, color: C.muted, marginTop: 5 }}>Group C · 90′</div>
        </div>
        <Flag id="brazil" w={72} radius={8} />
      </div>
    </div>
  );
}

const STAGES = [
  { name: 'Group', c: 1.00 }, { name: 'Round of 16', c: 1.35 },
  { name: 'Quarter', c: 1.50 }, { name: 'Semi', c: 1.75 }, { name: 'Final', c: 2.00 },
];

function Scene4() {
  const { localTime: lt } = useSprite();
  // beats
  const beatA = lt < 6.4;
  const showLadder = lt >= 18.4;
  const showPayoff = lt >= 27.6;

  // formula fills
  const fBase = lt >= 7.4, fGoals = lt >= 10.6, fClean = lt >= 12.0, fTeam = lt >= 13.4, fStage = lt >= 14.4;
  const popAt = (at) => clamp(1 - (lt - at) / 0.4, 0, 1);
  // result roll 15.0 → 17.0 to 12.39
  const resP = s4ease(clamp((lt - 15.0) / 1.8, 0, 1));
  const result = (12.39 * resP).toFixed(2);

  // headline per beat
  let ey = 'How scoring works', hl = <>Points after<br />every match.</>;
  if (lt >= 6.4 && lt < 18.4) { ey = 'A real upset'; hl = <>Underdogs<br />pay big.</>; }
  if (showLadder && !showPayoff) { ey = 'Stage multiplier'; hl = <>The deeper they go,<br />the more it's worth.</>; }
  if (showPayoff) { ey = 'The mystery'; hl = <>Every match<br />rewrites the board.</>; }
  const hlKey = ey;

  return (
    <div style={{ position: 'absolute', inset: 0, fontFamily: FONT }}>
      <PaperBG />

      {/* headline top-left */}
      {!showLadder && !showPayoff && (
        <div key={hlKey} style={{ position: 'absolute', left: 120, top: 96 }}>
          <Eyebrow style={{ fontSize: 16, letterSpacing: '0.16em' }}>{ey}</Eyebrow>
          <div style={{ fontFamily: FONT, fontWeight: 800, fontSize: 62, lineHeight: 1.04, letterSpacing: '-0.03em', color: C.text, marginTop: 14 }}>{hl}</div>
        </div>
      )}
      {showLadder && !showPayoff && (
        <div style={{ position: 'absolute', left: 0, right: 0, top: 110, textAlign: 'center' }}>
          <Eyebrow style={{ fontSize: 16, letterSpacing: '0.16em' }}>Stage multiplier</Eyebrow>
          <div style={{ fontFamily: FONT, fontWeight: 800, fontSize: 56, lineHeight: 1.04, letterSpacing: '-0.03em', color: C.text, marginTop: 12 }}>The deeper they go, the more it's worth.</div>
        </div>
      )}

      {/* CENTER STAGE */}
      {!showLadder && (
        <>
          {/* scorecard */}
          <div style={{ position: 'absolute', left: 0, right: 0, top: 322, display: 'flex', justifyContent: 'center' }}>
            {lt >= 6.5 && <Scorecard lt={lt} />}
          </div>

          {/* formula */}
          <div style={{ position: 'absolute', left: 0, right: 0, top: beatA ? 470 : 560, display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 6, transition: 'none' }}>
            <Op ch="(" show={appear(lt, 0.6)} />
            <Tok label="Win 90′" value={fBase ? '5' : '5'} filled={fBase} color={C.green} bg={C.greenSoft} show={appear(lt, 0.8)} pop={popAt(7.4)} />
            <Op ch="+" show={appear(lt, 1.0)} />
            <Tok label="2 goals" value={fGoals ? '+1.0' : '+0'} filled={fGoals} color={C.green} bg={C.greenSoft} show={appear(lt, 1.2)} pop={popAt(10.6)} />
            <Op ch="+" show={appear(lt, 1.4)} />
            <Tok label="Clean sheet" value={fClean ? '+1.0' : '+0'} filled={fClean} color={C.green} bg={C.greenSoft} show={appear(lt, 1.6)} pop={popAt(12.0)} />
            <Op ch=")" show={appear(lt, 1.8)} />
            <Op ch="×" show={appear(lt, 2.0)} />
            <Tok label="Team" value="1.77" filled={fTeam} color={PICKS[1].a} bg={PICKS[1].b} show={appear(lt, 2.1)} pop={popAt(13.4)} />
            <Op ch="×" show={appear(lt, 2.3)} />
            <Tok label="Stage" value="1.00" filled={fStage} color={C.gold} bg="#fbf2e0" show={appear(lt, 2.4)} pop={popAt(14.4)} />
            <Op ch="=" show={appear(lt, 2.6)} />
            <Tok label="Points" value={result} filled={lt >= 15.0} color={C.gold} bg="#fbf2e0" big show={appear(lt, 2.7)} pop={popAt(15.0)} />
          </div>
        </>
      )}

      {/* STAGE LADDER */}
      {showLadder && !showPayoff && (
        <div style={{ position: 'absolute', left: 0, right: 0, top: 380, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 22 }}>
          <div style={{ display: 'flex', alignItems: 'flex-end', gap: 26 }}>
            {STAGES.map((s, i) => {
              const sh = appear(lt, 18.8 + i * 0.45, 0.5);
              const pts = (7.0 * 1.77 * s.c);
              const h = 60 + (s.c - 1.0) * 200;
              return (
                <div key={s.name} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12, opacity: sh, transform: `translateY(${(1 - sh) * 20}px)` }}>
                  <div style={{ fontFamily: FONT, fontWeight: 850, fontSize: 32, color: i === STAGES.length - 1 ? C.gold : C.green }}>{pts.toFixed(1)}</div>
                  <div style={{ width: 96, height: h, borderRadius: '12px 12px 0 0',
                    background: i === STAGES.length - 1 ? `linear-gradient(180deg, ${C.gold}, #b07f1f)` : `linear-gradient(180deg, ${C.green}, ${C.greenMid})`,
                    boxShadow: `0 14px 30px ${(i === STAGES.length - 1 ? C.gold : C.green)}33` }} />
                  <div style={{ fontFamily: FONT, fontWeight: 760, fontSize: 15, color: C.text }}>{s.name}</div>
                  <div style={{ fontFamily: FONT, fontWeight: 700, fontSize: 13, color: C.muted, marginTop: -6 }}>{s.c.toFixed(2)}×</div>
                </div>
              );
            })}
          </div>
          <div style={{ fontFamily: FONT, fontWeight: 500, fontSize: 22, color: C.muted, marginTop: 14, opacity: appear(lt, 21.5) }}>
            Same 7 base points. Worth <span style={{ fontWeight: 800, color: C.gold }}>2×</span> by the final.
          </div>
        </div>
      )}

      {/* PAYOFF */}
      {showPayoff && (
        <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', opacity: appear(lt, 27.8, 0.6) }}>
          <div style={{ fontFamily: FONT, fontWeight: 800, fontSize: 86, letterSpacing: '-0.03em', color: C.text, textAlign: 'center', lineHeight: 1.05 }}>
            Every match<br />rewrites the board.
          </div>
          <div style={{ fontFamily: FONT, fontWeight: 400, fontSize: 28, color: C.muted, marginTop: 26 }}>
            You picked them early. The tournament decides the rest.
          </div>
        </div>
      )}
    </div>
  );
}

window.Scene4 = Scene4;
