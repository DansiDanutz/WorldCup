// wc-scenes-vertical.jsx — native 1080x1920 (9:16) scene layouts for the
// WorldCup26 ad. Reuses the kit primitives (BrandMark, FlagTile, TeamRow,
// PickChip, RankBadge, Panel, Eyebrow, Trophy, DealCard…) and the shared
// timeline (Sprite/useSprite, rev, LCount, SceneWrap, FlagMarquee, Backdrop)
// from wc-kit.jsx / wc-scenes.jsx, restacked for portrait. Same data + story.

const TV = window.WC_TEAMS_BY_ID;
const easeV = Easing;

// local reveal helper (rev isn't exported from wc-scenes.jsx)
function vrev(localTime, at, dur = 0.5, dist = 20) {
  const t = easeV.easeOutCubic(clamp((localTime - at) / dur, 0, 1));
  return { opacity: t, transform: `translateY(${(1 - t) * dist}px)` };
}

const W = 1080, H = 1920, MX = 60, CW = W - MX * 2; // content width 960

// =============================================================================
// 1 — HOOK
// =============================================================================
function VHook() {
  const { localTime } = useSprite();
  return (
    <SceneWrap exit={0.6}>
      <div style={{ position: 'absolute', inset: 0, opacity: 0.5 }}>
        <FlagMarquee y={150} dir={1} speed={30} scale={1.05} />
        <FlagMarquee y={330} dir={-1} speed={24} scale={1.05} />
        <FlagMarquee y={1430} dir={1} speed={26} scale={1.05} />
        <FlagMarquee y={1610} dir={-1} speed={30} scale={1.05} />
      </div>
      <div style={{
        position: 'absolute', inset: 0,
        background: 'radial-gradient(760px 760px at 50% 50%, rgba(247,250,249,0.98) 46%, rgba(247,250,249,0) 78%)',
      }} />
      <div style={{
        position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center', gap: 34, padding: '0 60px',
      }}>
        <div style={vrev(localTime, 0.2, 0.5)}><BrandMark size={86} wordSize={52} /></div>
        <div style={{ ...vrev(localTime, 0.5, 0.55), textAlign: 'center' }}>
          <Eyebrow style={{ fontSize: 22 }}>FIFA World Cup 2026 · WorldCup26.world</Eyebrow>
        </div>
        <div style={{ textAlign: 'center', lineHeight: 1.0 }}>
          <div style={{ ...vrev(localTime, 0.8, 0.6, 30), fontFamily: SANS, fontWeight: 850, fontSize: 118, color: WC.text, letterSpacing: '-0.03em' }}>
            Predict<br />the Game
          </div>
          <div style={{ ...vrev(localTime, 1.2, 0.6, 30), fontFamily: SANS, fontWeight: 850, fontSize: 118, color: WC.green, letterSpacing: '-0.03em', marginTop: 8 }}>
            WorldCup26
          </div>
        </div>
        <div style={{ ...vrev(localTime, 1.75, 0.55), fontFamily: SANS, fontWeight: 650, fontSize: 34, color: WC.muted, textAlign: 'center', maxWidth: 880, lineHeight: 1.35 }}>
          Pick 3 teams. Watch them score. Win the prize pool.
        </div>
      </div>
    </SceneWrap>
  );
}

// =============================================================================
// 2 — PICK 3 TEAMS
// =============================================================================
const V_PICK_LIST = ['brazil', 'spain', 'morocco', 'japan', 'croatia'];
const V_PICK_EVENTS = [
  { row: 0, slot: 0, at: 1.5 },
  { row: 2, slot: 1, at: 2.8 },
  { row: 4, slot: 2, at: 4.1 },
];

function VPick() {
  const { localTime } = useSprite();
  const panelX = MX, panelY = 560, rowH = 84, rowGap = 12;
  const selectedSlotByRow = {};
  let selCount = 0;
  V_PICK_EVENTS.forEach((e) => { if (localTime >= e.at) { selectedSlotByRow[e.row] = e.slot; selCount++; } });

  const dotX = panelX + 24 + 22 + 13;        // panel pad + row pad + dot center
  const listTop = panelY + 24 + 74 + 20 + 56 + 16;
  const rowCenterY = (row) => listTop + row * (rowH + rowGap) + rowH / 2;
  const cs = [
    { t: 0.0, x: 540, y: 470 }, { t: 1.2, x: dotX, y: rowCenterY(0) }, { t: 1.5, x: dotX, y: rowCenterY(0) },
    { t: 2.5, x: dotX, y: rowCenterY(2) }, { t: 2.8, x: dotX, y: rowCenterY(2) },
    { t: 3.8, x: dotX, y: rowCenterY(4) }, { t: 4.1, x: dotX, y: rowCenterY(4) },
    { t: 4.7, x: 560, y: 1300 },
  ];
  const cx = interpolate(cs.map(s => s.t), cs.map(s => s.x), easeV.easeInOutCubic)(localTime);
  const cy = interpolate(cs.map(s => s.t), cs.map(s => s.y), easeV.easeInOutCubic)(localTime);
  const pressing = V_PICK_EVENTS.some(e => localTime >= e.at - 0.12 && localTime <= e.at + 0.14);

  return (
    <SceneWrap>
      <div style={{ position: 'absolute', left: MX, top: 118, width: CW }}>
        <div style={vrev(localTime, 0.2, 0.5)}><Eyebrow>Step 01 · Your Entry</Eyebrow></div>
        <div style={{ ...vrev(localTime, 0.35, 0.55), fontFamily: SANS, fontWeight: 850, fontSize: 92, color: WC.text, letterSpacing: '-0.03em', lineHeight: 1.0, marginTop: 14 }}>
          Pick 3 teams.
        </div>
        <div style={{ ...vrev(localTime, 0.55, 0.55), fontFamily: SANS, fontWeight: 650, fontSize: 28, color: WC.muted, lineHeight: 1.4, marginTop: 16 }}>
          Choose any three of the 48 nations before kickoff — each keeps scoring all tournament long.
        </div>
      </div>

      {/* picker panel */}
      <div style={{ ...vrev(localTime, 0.15, 0.55, 30), position: 'absolute', left: panelX, top: panelY, width: CW }}>
        <Panel pad={24}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <div style={{ fontFamily: SANS, fontWeight: 800, fontSize: 34, color: WC.text, letterSpacing: '-0.01em' }}>Choose 3 Teams</div>
              <div style={{ fontFamily: SANS, fontWeight: 650, fontSize: 17, color: WC.muted, marginTop: 4 }}>A team locks when its 2nd group match starts.</div>
            </div>
            <div style={{
              background: selCount === 3 ? WC.greenSoft : WC.surfaceStrong,
              border: `1px solid ${selCount === 3 ? WC.picks[0].border : WC.border}`,
              borderRadius: 8, padding: '10px 20px', textAlign: 'center',
            }}>
              <span style={{ fontFamily: SANS, fontWeight: 850, fontSize: 30, color: selCount === 3 ? WC.green : WC.text }}>{selCount}</span>
              <span style={{ fontFamily: SANS, fontWeight: 700, fontSize: 20, color: WC.muted }}> / 3</span>
              <div style={{ fontFamily: SANS, fontWeight: 700, fontSize: 12, color: WC.muted, letterSpacing: '0.06em', textTransform: 'uppercase' }}>selected</div>
            </div>
          </div>
          <div style={{ marginTop: 20, height: 56, borderRadius: 7, border: `1px solid ${WC.border}`, background: WC.paperSoft, display: 'flex', alignItems: 'center', gap: 12, padding: '0 18px' }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={WC.muted} strokeWidth="2" strokeLinecap="round"><circle cx="11" cy="11" r="7" /><path d="M21 21l-4.3-4.3" /></svg>
            <span style={{ fontFamily: SANS, fontWeight: 650, fontSize: 18, color: WC.muted }}>Search by team, group, confederation</span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: rowGap, marginTop: 16 }}>
            {V_PICK_LIST.map((id, i) => (
              <TeamRow key={id} team={TV[id]} slot={selectedSlotByRow[i]} selected={i in selectedSlotByRow} height={rowH} big />
            ))}
          </div>
        </Panel>
      </div>

      {/* Lock Entry */}
      <div style={{ ...vrev(localTime, V_PICK_EVENTS[2].at + 0.6, 0.55), position: 'absolute', left: 0, right: 0, top: 1330, display: 'flex', justifyContent: 'center' }}>
        {(() => {
          const g = 0.5 + 0.5 * Math.sin((localTime - V_PICK_EVENTS[2].at) * 2.6);
          return (
            <div style={{
              display: 'inline-flex', alignItems: 'center', gap: 14,
              background: WC.green, color: '#fff', fontFamily: SANS, fontWeight: 800, fontSize: 30,
              padding: '22px 52px', borderRadius: 10,
              boxShadow: `0 14px 34px rgba(16,107,79,${(0.20 + 0.18 * g).toFixed(3)})`,
            }}>
              <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><rect x="4" y="11" width="16" height="9" rx="2" /><path d="M8 11V7a4 4 0 0 1 8 0v4" /></svg>
              Lock Entry
            </div>
          );
        })()}
      </div>

      <Cursor x={cx} y={cy} pressing={pressing} />
    </SceneWrap>
  );
}

// =============================================================================
// 3 — COEFFICIENT SCORING
// =============================================================================
function VCoef() {
  const { localTime } = useSprite();
  const gauges = [
    { team: TV.france, c: 1.00 }, { team: TV.morocco, c: 1.77 },
    { team: TV.ghana, c: 2.47 }, { team: TV.curacao, c: 3.00 },
  ];
  return (
    <SceneWrap>
      <div style={{ position: 'absolute', left: MX, top: 120, width: CW }}>
        <div style={vrev(localTime, 0.15, 0.5)}><Eyebrow>Step 02 · Scoring</Eyebrow></div>
        <div style={{ ...vrev(localTime, 0.3, 0.55), fontFamily: SANS, fontWeight: 850, fontSize: 82, color: WC.text, letterSpacing: '-0.03em', lineHeight: 1.02, marginTop: 14 }}>
          Every result scores — <span style={{ color: WC.green }}>multiplied.</span>
        </div>
        <div style={{ ...vrev(localTime, 0.5, 0.55), fontFamily: SANS, fontWeight: 650, fontSize: 27, color: WC.muted, marginTop: 16, lineHeight: 1.4 }}>
          Points are scaled by each team's coefficient and the stage it reaches. The bigger the underdog, the bigger the multiplier.
        </div>
      </div>

      {/* formula */}
      <div style={{ ...vrev(localTime, 0.85, 0.55), position: 'absolute', left: MX, top: 470, width: CW }}>
        <div style={{ background: WC.greenSoft, border: `1px solid ${WC.picks[0].border}`, borderRadius: 10, padding: '24px 28px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 14, flexWrap: 'wrap' }}>
          {[['base + bonuses', WC.text, WC.surface], ['×', WC.muted, null], ['team coef', WC.green, '#dbeee6'], ['×', WC.muted, null], ['stage coef', WC.green, '#dbeee6']].map(([txt, col, bg], i) => bg ? (
            <span key={i} style={{ fontFamily: SANS, fontWeight: 800, fontSize: 30, color: col, background: bg, padding: '10px 18px', borderRadius: 8, letterSpacing: '-0.01em' }}>{txt}</span>
          ) : (
            <span key={i} style={{ fontFamily: SANS, fontWeight: 800, fontSize: 34, color: col }}>{txt}</span>
          ))}
        </div>
      </div>

      {/* worked example */}
      <div style={{ ...vrev(localTime, 1.25, 0.55), position: 'absolute', left: MX, top: 640, width: CW }}>
        <Panel pad={28}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 18 }}>
            <FlagTile id="morocco" w={64} radius={6} />
            <div style={{ flex: 1 }}>
              <div style={{ fontFamily: SANS, fontWeight: 800, fontSize: 30, color: WC.text }}>Morocco wins · Round of 32</div>
              <div style={{ fontFamily: SANS, fontWeight: 650, fontSize: 20, color: WC.muted, marginTop: 6 }}>
                Win 90′ <b style={{ color: WC.text }}>5</b> + goal <b style={{ color: WC.text }}>0.5</b> · <b style={{ color: WC.green }}>×1.77</b> · <b style={{ color: WC.green }}>×1.20</b>
              </div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontFamily: SANS, fontWeight: 700, fontSize: 14, color: WC.muted, letterSpacing: '0.06em', textTransform: 'uppercase' }}>Points</div>
              <div style={{ fontFamily: SANS, fontWeight: 850, fontSize: 72, color: WC.green, letterSpacing: '-0.02em', lineHeight: 1 }}>
                <LCount from={0} to={11.77} start={1.5} end={3.0} fmt={(v) => v.toFixed(2)} />
              </div>
            </div>
          </div>
        </Panel>
      </div>

      {/* gauges */}
      <div style={{ ...vrev(localTime, 1.0, 0.55), position: 'absolute', left: MX, top: 920, width: CW }}>
        <div style={{ fontFamily: SANS, fontWeight: 700, fontSize: 15, color: WC.muted, letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: 22 }}>Coefficient range · 1.00 → 3.00</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 26 }}>
          {gauges.map((g, i) => {
            const pct = ((g.c - 1) / 2) * 100;
            const w = animate({ from: 0, to: pct, start: 1.1 + i * 0.12, end: 1.9 + i * 0.12, ease: easeV.easeOutCubic })(localTime);
            return (
              <div key={g.team.id} style={{ display: 'flex', alignItems: 'center', gap: 18 }}>
                <FlagTile id={g.team.id} w={52} radius={5} />
                <span style={{ width: 200, fontFamily: SANS, fontWeight: 760, fontSize: 26, color: WC.text }}>{g.team.name}</span>
                <div style={{ flex: 1, height: 18, borderRadius: 9, background: WC.surfaceStrong, overflow: 'hidden' }}>
                  <div style={{ width: `${w}%`, height: '100%', borderRadius: 9, background: `linear-gradient(90deg, ${WC.green}, ${WC.gold})` }} />
                </div>
                <span style={{ width: 80, textAlign: 'right', fontFamily: SANS, fontWeight: 850, fontSize: 30, color: i >= 2 ? WC.gold : WC.green, fontVariantNumeric: 'tabular-nums' }}>{fmtCoef(g.c)}</span>
              </div>
            );
          })}
        </div>
      </div>
    </SceneWrap>
  );
}

// =============================================================================
// 4 — LEADERBOARD
// =============================================================================
const V_BOARD = [
  { name: 'You', you: true, score: 84.50, picks: [['brazil', 38.20, 1.19], ['morocco', 27.80, 1.77], ['croatia', 18.50, 1.96]] },
  { name: 'deicu_07', score: 79.15, picks: [['argentina', 41.00, 1.19], ['japan', 22.40, 1.86], ['ecuador', 15.75, 1.96]] },
  { name: 'Toni R.', score: 71.60, picks: [['spain', 33.50, 1.00], ['uruguay', 24.10, 1.86], ['senegal', 14.00, 1.96]] },
  { name: 'GoalMachine', score: 63.05, picks: [['portugal', 29.20, 1.27], ['colombia', 20.85, 1.77], ['ghana', 13.00, 2.47]] },
];

function VBoard() {
  const { localTime } = useSprite();
  const chipW = (CW - 44 - 24) / 3;
  return (
    <SceneWrap>
      <div style={{ position: 'absolute', left: MX, top: 120, width: CW }}>
        <div style={vrev(localTime, 0.15, 0.5)}><Eyebrow>Step 03 · Leaderboard</Eyebrow></div>
        <div style={{ ...vrev(localTime, 0.3, 0.55), fontFamily: SANS, fontWeight: 850, fontSize: 80, color: WC.text, letterSpacing: '-0.03em', lineHeight: 1.02, marginTop: 14 }}>
          Climb the board as your teams win.
        </div>
      </div>
      <div style={{ ...vrev(localTime, 0.5, 0.55), position: 'absolute', left: MX, top: 380, width: CW }}>
        <Panel pad={22}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {V_BOARD.map((row, i) => {
              const isYou = row.you;
              const pulse = isYou ? 1 + 0.015 * Math.max(0, Math.sin((localTime - 0.8) * 6)) * Math.exp(-(localTime - 0.8)) : 1;
              return (
                <div key={i} style={{
                  ...vrev(localTime, 0.7 + i * 0.12, 0.5, 16),
                  background: isYou ? WC.greenSoft : WC.paperSoft,
                  border: `1px solid ${isYou ? WC.picks[0].border : WC.border}`,
                  boxShadow: isYou ? '0 0 0 2px rgba(16,107,79,0.25)' : 'none',
                  borderRadius: 10, padding: 20, transform: `scale(${pulse})`,
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 18 }}>
                    <RankBadge n={i + 1} size={46} />
                    <span style={{ fontFamily: SANS, fontWeight: 850, fontSize: 34, color: WC.text, whiteSpace: 'nowrap' }}>
                      {row.name}{isYou && <span style={{ fontWeight: 700, fontSize: 18, color: WC.green, marginLeft: 12, background: '#fff', border: `1px solid ${WC.picks[0].border}`, borderRadius: 999, padding: '3px 12px' }}>your entry</span>}
                    </span>
                    <div style={{ flex: 1 }} />
                    <span style={{ fontFamily: SANS, fontWeight: 850, fontSize: 46, color: WC.text, fontVariantNumeric: 'tabular-nums' }}>
                      {isYou ? <LCount from={0} to={row.score} start={0.9} end={2.4} fmt={fmtPts} /> : fmtPts(row.score)}
                    </span>
                  </div>
                  <div style={{ display: 'flex', gap: 12, marginTop: 14 }}>
                    {row.picks.map(([tid, pts, coef], si) => (
                      <PickChip key={si} slot={si} team={TV[tid]} pts={pts} coef={coef} w={chipW} />
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </Panel>
      </div>
    </SceneWrap>
  );
}

// =============================================================================
// 5 — PRIZE POOL
// =============================================================================
const V_PAYOUTS = [
  { rank: '#1', pct: 32.0, amt: 15360 }, { rank: '#2', pct: 20.0, amt: 9600 },
  { rank: '#3', pct: 14.0, amt: 6720 }, { rank: '#4', pct: 10.0, amt: 4800 },
  { rank: '#5', pct: 7.0, amt: 3360 }, { rank: '#6', pct: 5.0, amt: 2400 },
];

function VPrize() {
  const { localTime } = useSprite();
  return (
    <SceneWrap>
      <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '0 60px' }}>
        <div style={{ ...vrev(localTime, 0.15, 0.5), textAlign: 'center' }}>
          <Eyebrow style={{ color: WC.gold, fontSize: 18 }}>Step 04 · The Prize</Eyebrow>
        </div>
        <div style={{ ...vrev(localTime, 0.3, 0.5), display: 'flex', alignItems: 'center', gap: 18, marginTop: 16 }}>
          <svg width="72" height="72" viewBox="0 0 24 24" fill="none" stroke={WC.gold} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10" /><path d="M16 8h-6a2 2 0 1 0 0 4h4a2 2 0 1 1 0 4H8" /><path d="M12 6v2m0 8v2" />
          </svg>
          <div style={{ fontFamily: SANS, fontWeight: 850, fontSize: 168, color: WC.gold, letterSpacing: '-0.03em', lineHeight: 1, fontVariantNumeric: 'tabular-nums' }}>
            <LCount from={0} to={48000} start={0.4} end={2.0} fmt={fmtMoney} />
          </div>
        </div>
        <div style={{ ...vrev(localTime, 0.6, 0.5), fontFamily: SANS, fontWeight: 800, fontSize: 42, color: WC.text, marginTop: 10 }}>
          Prize pool · <span style={{ color: WC.green }}>Top 10 paid</span>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginTop: 56, width: 900 }}>
          {V_PAYOUTS.map((p, i) => (
            <div key={p.rank} style={{
              ...vrev(localTime, 1.0 + i * 0.1, 0.5, 22),
              background: WC.surface, border: `1px solid ${i === 0 ? '#e4bd86' : WC.border}`,
              boxShadow: i === 0 ? '0 0 0 2px rgba(201,148,46,0.3), ' + WC.shadow : WC.shadow,
              borderRadius: 10, padding: '22px 28px', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            }}>
              <div>
                <div style={{ fontFamily: SANS, fontWeight: 700, fontSize: 20, color: WC.muted }}>{p.rank}</div>
                <div style={{ fontFamily: SANS, fontWeight: 850, fontSize: 44, color: i === 0 ? WC.gold : WC.text, letterSpacing: '-0.02em', marginTop: 2, fontVariantNumeric: 'tabular-nums' }}>
                  <LCount from={0} to={p.amt} start={1.1 + i * 0.1} end={2.2 + i * 0.1} fmt={fmtMoney} />
                </div>
              </div>
              <div style={{ fontFamily: SANS, fontWeight: 800, fontSize: 26, color: WC.muted }}>{p.pct.toFixed(0)}%</div>
            </div>
          ))}
        </div>
        <div style={{ ...vrev(localTime, 1.9, 0.5), fontFamily: SANS, fontWeight: 650, fontSize: 24, color: WC.muted, marginTop: 40, textAlign: 'center', maxWidth: 820 }}>
          Weighted split from the live prize pool — it grows with every entry.
        </div>
      </div>
    </SceneWrap>
  );
}

// =============================================================================
// 6 — PASSIVE INCOME (refer + agent)
// =============================================================================
// DealCard / BenefitRow mirror wc-scenes.jsx (not exported to window there).
function BenefitRow({ big, unit, label, accent, bg, bd, style }) {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 22,
      background: bg, border: `1px solid ${bd}`, borderLeft: `5px solid ${accent}`,
      borderRadius: 8, padding: '18px 24px', ...style,
    }}>
      <div style={{ minWidth: 132, display: 'flex', alignItems: 'baseline', gap: 4 }}>
        <span style={{ fontFamily: SANS, fontWeight: 850, fontSize: 60, color: accent, letterSpacing: '-0.02em', lineHeight: 1 }}>{big}</span>
        {unit && <span style={{ fontFamily: SANS, fontWeight: 800, fontSize: 26, color: accent }}>{unit}</span>}
      </div>
      <span style={{ fontFamily: SANS, fontWeight: 650, fontSize: 22, color: WC.text, lineHeight: 1.32, flex: 1 }}>{label}</span>
    </div>
  );
}

function DealCard({ tag, tagColor, tagBg, icon, title, sub, children, style }) {
  return (
    <div style={{
      width: 800, background: WC.surface, border: `1px solid ${WC.border}`,
      borderRadius: 12, boxShadow: WC.shadow, padding: 36, boxSizing: 'border-box', ...style,
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 18 }}>
        <div style={{
          width: 70, height: 70, borderRadius: 12, background: tagBg,
          border: `1px solid ${tagColor}`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
        }}>{icon}</div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontFamily: SANS, fontWeight: 850, fontSize: 14, letterSpacing: '0.14em', textTransform: 'uppercase', color: tagColor }}>{tag}</div>
          <div style={{ fontFamily: SANS, fontWeight: 850, fontSize: 40, color: WC.text, letterSpacing: '-0.02em', marginTop: 2 }}>{title}</div>
        </div>
      </div>
      <div style={{ fontFamily: SANS, fontWeight: 650, fontSize: 23, color: WC.muted, marginTop: 18, lineHeight: 1.4 }}>{sub}</div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 14, marginTop: 24 }}>{children}</div>
    </div>
  );
}

function VRefer() {
  const { localTime } = useSprite();
  const P1 = WC.picks[0], P2 = WC.picks[1];
  return (
    <SceneWrap>
      <div style={{ position: 'absolute', left: 0, right: 0, top: 104, textAlign: 'center', padding: '0 60px' }}>
        <div style={vrev(localTime, 0.15, 0.5)}><Eyebrow style={{ color: WC.gold }}>Step 05 · Passive Income</Eyebrow></div>
        <div style={{ ...vrev(localTime, 0.3, 0.55), fontFamily: SANS, fontWeight: 850, fontSize: 76, color: WC.text, letterSpacing: '-0.03em', marginTop: 12, lineHeight: 1.02 }}>
          Two ways to earn — <span style={{ color: WC.green }}>even off the pitch.</span>
        </div>
      </div>

      <div style={{ position: 'absolute', left: MX, right: MX, top: 320, display: 'flex', flexDirection: 'column', gap: 28 }}>
        <div style={vrev(localTime, 0.7, 0.55, 26)}>
          <DealCard
            style={{ width: CW }}
            tag="Deal 01 · Refer a friend" tagColor={P2.accent} tagBg={P2.bg}
            icon={<svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke={P2.accent} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 2 11 13" /><path d="M22 2 15 22l-4-9-9-4z" /></svg>}
            title="Refer a friend"
            sub="Share your link. When the friend you referred wins, you earn a cut of their prize.">
            <div style={vrev(localTime, 1.1, 0.5, 16)}>
              <BenefitRow big="5" unit="%" accent={P1.accent} bg={P1.bg} bd={P1.border}
                label={<span><b style={{ color: WC.text }}>If you were referred too</b> — you're in the chain.</span>} />
            </div>
            <div style={vrev(localTime, 1.35, 0.5, 16)}>
              <BenefitRow big="3" unit="%" accent={P2.accent} bg={P2.bg} bd={P2.border}
                label={<span><b style={{ color: WC.text }}>If you joined on your own</b> — no referral.</span>} />
            </div>
          </DealCard>
        </div>

        <div style={vrev(localTime, 1.6, 0.55, 26)}>
          <DealCard
            style={{ width: CW }}
            tag="Deal 02 · Become an agent" tagColor={WC.gold} tagBg="#fff0dd"
            icon={<svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke={WC.gold} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 9a3 3 0 0 1 0 6v2a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-2a3 3 0 0 1 0-6V7a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2z" /><path d="M13 5v14" strokeDasharray="2 2" /></svg>}
            title="Agent deal"
            sub="Pre-buy tickets and sell them to your friends — earn from every one of them.">
            <div style={vrev(localTime, 2.0, 0.5, 16)}>
              <BenefitRow big="1" unit="free" accent={WC.green} bg={WC.greenSoft} bd={P1.border}
                label={<span><b style={{ color: WC.text }}>ticket on us for every 10 you sell</b> — stock up and save.</span>} />
            </div>
            <div style={vrev(localTime, 2.25, 0.5, 16)}>
              <BenefitRow big="5" unit="%" accent={WC.gold} bg="#fff0dd" bd="#e4bd86"
                label={<span><b style={{ color: WC.text }}>of all your friends' winnings</b> — every time they win.</span>} />
            </div>
          </DealCard>
        </div>
      </div>

      <div style={{ ...vrev(localTime, 2.5, 0.5), position: 'absolute', left: 60, right: 60, top: 1760, textAlign: 'center' }}>
        <span style={{ fontFamily: SANS, fontWeight: 650, fontSize: 24, color: WC.muted }}>
          Paid out automatically from the prize pool — income keeps coming as long as they keep winning.
        </span>
      </div>
    </SceneWrap>
  );
}

// =============================================================================
// 7 — CTA END CARD
// =============================================================================
function VCTA() {
  const { localTime } = useSprite();
  return (
    <SceneWrap exit={0.4}>
      <div style={{ position: 'absolute', inset: 0, opacity: 0.32 }}>
        <FlagMarquee y={150} dir={1} speed={28} scale={1.0} />
        <FlagMarquee y={330} dir={-1} speed={22} scale={1.0} />
        <FlagMarquee y={1440} dir={1} speed={24} scale={1.0} />
        <FlagMarquee y={1620} dir={-1} speed={28} scale={1.0} />
      </div>
      <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(740px 740px at 50% 50%, rgba(247,250,249,0.97) 44%, rgba(247,250,249,0) 80%)' }} />
      <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 30, padding: '0 60px' }}>
        <div style={vrev(localTime, 0.2, 0.55)}><BrandMark size={108} showWord={false} /></div>
        <div style={{ ...vrev(localTime, 0.45, 0.55), fontFamily: SANS, fontWeight: 700, fontSize: 38, color: WC.muted, letterSpacing: '0.02em' }}>Play now at</div>
        <div style={{ ...vrev(localTime, 0.65, 0.6, 26), fontFamily: SANS, fontWeight: 850, fontSize: 104, color: WC.green, letterSpacing: '-0.03em', lineHeight: 1, textAlign: 'center' }}>
          WorldCup26<br />.world
        </div>
        <div style={{ ...vrev(localTime, 0.95, 0.55), marginTop: 16 }}>
          <div style={{ background: WC.green, color: '#fff', fontFamily: SANS, fontWeight: 800, fontSize: 32, padding: '24px 54px', borderRadius: 10, boxShadow: '0 16px 38px rgba(16,107,79,.32)', display: 'flex', alignItems: 'center', gap: 14 }}>
            <Trophy size={32} /> Pick Your 3 Teams
          </div>
        </div>
        <div style={{ ...vrev(localTime, 1.25, 0.55), fontFamily: SANS, fontWeight: 650, fontSize: 26, color: WC.muted, marginTop: 10, textAlign: 'center' }}>
          Pick 3 · Predict the Game · FIFA World Cup 2026
        </div>
      </div>
    </SceneWrap>
  );
}

Object.assign(window, { VHook, VPick, VCoef, VBoard, VPrize, VRefer, VCTA });
