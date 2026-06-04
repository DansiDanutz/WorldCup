// wc-scenes.jsx — WorldCup26 ad scenes (loads after wc-kit.jsx)
// Each scene is designed to live inside a <Sprite> in the main file, so it
// reads local time via useSprite(). Composes primitives from wc-kit.jsx.

const T = window.WC_TEAMS_BY_ID;
const ease = Easing;

// ── Backdrop — always-on paper bg with a subtle drifting mint glow ──────────
function Backdrop() {
  const time = useTime();
  const gx = 30 + Math.sin(time * 0.18) * 14;
  const gy = 20 + Math.cos(time * 0.14) * 10;
  return (
    <div style={{ position: 'absolute', inset: 0, background: WC.bg, overflow: 'hidden' }}>
      <div style={{
        position: 'absolute', inset: 0,
        background: `radial-gradient(900px 600px at ${gx}% ${gy}%, rgba(16,107,79,0.07), transparent 60%),
                     linear-gradient(180deg, rgba(229,243,238,0.95), rgba(247,250,249,0) 460px)`,
      }} />
    </div>
  );
}

// ── SceneWrap — fade/slide in & out on local time ────────────────────────────
function SceneWrap({ children, entry = 0.55, exit = 0.5 }) {
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

// LCount — eased count-up bound to scene local time
function LCount({ from, to, start, end, fmt = (v) => v.toFixed(0), easeFn = ease.easeOutCubic }) {
  const { localTime } = useSprite();
  const v = animate({ from, to, start, end, ease: easeFn })(localTime);
  return <React.Fragment>{fmt(v)}</React.Fragment>;
}

// reveal helper: opacity+y for an element appearing at local `at`
function rev(localTime, at, dur = 0.5, dist = 18) {
  const t = ease.easeOutCubic(clamp((localTime - at) / dur, 0, 1));
  return { opacity: t, transform: `translateY(${(1 - t) * dist}px)` };
}

// arrow cursor
function Cursor({ x, y, pressing }) {
  return (
    <div style={{
      position: 'absolute', left: x, top: y, zIndex: 50,
      transform: `translate(-3px,-2px) scale(${pressing ? 0.86 : 1})`,
      transition: 'none', filter: 'drop-shadow(0 4px 8px rgba(12,29,26,.35))',
      willChange: 'left, top, transform', pointerEvents: 'none',
    }}>
      <svg width="34" height="34" viewBox="0 0 24 24" fill="none">
        <path d="M5 3l14 7-6 1.6L9.6 18 5 3z" fill="#0c1d1a" stroke="#fff" strokeWidth="1.4" strokeLinejoin="round" />
      </svg>
      {pressing && (
        <div style={{
          position: 'absolute', left: -8, top: -8, width: 26, height: 26,
          borderRadius: '50%', border: '2px solid rgba(16,107,79,.5)',
        }} />
      )}
    </div>
  );
}

// =============================================================================
// SCENE 1 — HOOK
// =============================================================================
const MARQUEE = ['france','spain','england','brazil','argentina','portugal','germany','netherlands','belgium','morocco','japan','uruguay','mexico','croatia','senegal','colombia','ghana','egypt','korea_republic','australia','canada','switzerland','sweden','norway'];

function FlagMarquee({ y, dir = 1, speed = 26, scale = 1 }) {
  const time = useTime();
  const tile = 84 * scale, gap = 16, n = MARQUEE.length;
  const span = (tile + gap) * n;
  let off = (time * speed) % span;
  if (dir < 0) off = span - off;
  return (
    <div style={{ position: 'absolute', left: 0, top: y, width: '100%', height: tile * 0.7, overflow: 'hidden' }}>
      <div style={{ position: 'absolute', display: 'flex', gap, left: -off }}>
        {MARQUEE.concat(MARQUEE).map((id, i) => (
          <FlagTile key={i} id={id} w={tile} radius={6} />
        ))}
      </div>
    </div>
  );
}

function SceneHook() {
  const { localTime } = useSprite();
  return (
    <SceneWrap exit={0.6}>
      {/* flag marquees top & bottom, dimmed */}
      <div style={{ position: 'absolute', inset: 0, opacity: 0.5 }}>
        <FlagMarquee y={70} dir={1} speed={30} scale={0.95} />
        <FlagMarquee y={910} dir={-1} speed={24} scale={0.95} />
      </div>
      {/* center protection so text reads */}
      <div style={{
        position: 'absolute', inset: 0,
        background: 'radial-gradient(1200px 520px at 50% 50%, rgba(247,250,249,0.97) 38%, rgba(247,250,249,0.0) 78%)',
      }} />
      <div style={{
        position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center', gap: 26,
      }}>
        <div style={rev(localTime, 0.2, 0.5)}>
          <BrandMark size={64} wordSize={40} />
        </div>
        <div style={{ ...rev(localTime, 0.5, 0.55), textAlign: 'center' }}>
          <Eyebrow style={{ fontSize: 18 }}>FIFA World Cup 2026 · WorldCup26.world</Eyebrow>
        </div>
        <div style={{ textAlign: 'center', lineHeight: 0.98 }}>
          <div style={{ ...rev(localTime, 0.8, 0.6, 28), fontFamily: SANS, fontWeight: 850, fontSize: 132, color: WC.text, letterSpacing: '-0.03em' }}>
            Predict the Game
          </div>
          <div style={{ ...rev(localTime, 1.15, 0.6, 28), fontFamily: SANS, fontWeight: 850, fontSize: 132, color: WC.green, letterSpacing: '-0.03em', marginTop: 4 }}>
            WorldCup26
          </div>
        </div>
        <div style={{ ...rev(localTime, 1.7, 0.55), fontFamily: SANS, fontWeight: 650, fontSize: 30, color: WC.muted, textAlign: 'center' }}>
          Pick 3 teams. Watch them score. Win the prize pool.
        </div>
      </div>
    </SceneWrap>
  );
}

// =============================================================================
// SCENE 2 — PICK 3 TEAMS (with cursor selecting)
// =============================================================================
const PICK_LIST = ['brazil', 'spain', 'morocco', 'japan', 'croatia'];
// which list-index gets selected, and into which slot, and at what local time
const PICK_EVENTS = [
  { row: 0, slot: 0, at: 1.5 },   // Brazil  → pick 1 (green)
  { row: 2, slot: 1, at: 2.8 },   // Morocco → pick 2 (blue)
  { row: 4, slot: 2, at: 4.1 },   // Croatia → pick 3 (amber)
];

function ScenePick() {
  const { localTime } = useSprite();
  const panelX = 760, panelY = 150, panelW = 1040;
  const rowH = 76, rowGap = 12, listTop = panelY + 196;

  // selection state at this localTime
  const selectedSlotByRow = {};
  let selCount = 0;
  PICK_EVENTS.forEach((e) => { if (localTime >= e.at) { selectedSlotByRow[e.row] = e.slot; selCount++; } });

  // cursor path: travel to each event's selection-dot just before `at`
  const dotX = panelX + 22 + 13;
  const rowCenterY = (row) => listTop + row * (rowH + rowGap) + rowH / 2;
  const cstops = [
    { t: 0.0, x: panelX + 520, y: panelY + 90 },
    { t: 1.2, x: dotX, y: rowCenterY(0) },
    { t: 1.5, x: dotX, y: rowCenterY(0) },
    { t: 2.5, x: dotX, y: rowCenterY(2) },
    { t: 2.8, x: dotX, y: rowCenterY(2) },
    { t: 3.8, x: dotX, y: rowCenterY(4) },
    { t: 4.1, x: dotX, y: rowCenterY(4) },
    { t: 4.7, x: panelX + 540, y: panelY + 120 },
  ];
  const cx = interpolate(cstops.map(s => s.t), cstops.map(s => s.x), ease.easeInOutCubic)(localTime);
  const cy = interpolate(cstops.map(s => s.t), cstops.map(s => s.y), ease.easeInOutCubic)(localTime);
  const pressing = PICK_EVENTS.some(e => localTime >= e.at - 0.12 && localTime <= e.at + 0.14);

  return (
    <SceneWrap>
      {/* left column */}
      <div style={{ position: 'absolute', left: 120, top: 300, width: 560 }}>
        <div style={rev(localTime, 0.2, 0.5)}>
          <Eyebrow>Step 01 · Your Entry</Eyebrow>
        </div>
        <div style={{ ...rev(localTime, 0.35, 0.55), fontFamily: SANS, fontWeight: 850, fontSize: 84, color: WC.text, letterSpacing: '-0.03em', lineHeight: 1.0, marginTop: 18 }}>
          Pick 3 teams.
        </div>
        <div style={{ ...rev(localTime, 0.55, 0.55), fontFamily: SANS, fontWeight: 650, fontSize: 27, color: WC.muted, lineHeight: 1.45, marginTop: 22 }}>
          Choose any three of the 48 nations before kickoff — each one keeps scoring as the tournament unfolds.
        </div>
        {/* mini selected summary */}
        <div style={{ display: 'flex', gap: 10, marginTop: 38 }}>
          {[0, 1, 2].map((slot) => {
            const ev = PICK_EVENTS.find(e => e.slot === slot);
            const on = localTime >= ev.at;
            const team = T[PICK_LIST[ev.row]];
            const p = WC.picks[slot];
            return (
              <div key={slot} style={{
                width: 168, height: 70, borderRadius: 8, boxSizing: 'border-box',
                border: `2px ${on ? 'solid' : 'dashed'} ${on ? p.border : WC.borderStrong}`,
                background: on ? p.bg : 'transparent',
                display: 'flex', alignItems: 'center', gap: 10, padding: '0 14px',
                transform: on ? `scale(${animate({ from: 0.8, to: 1, start: ev.at, end: ev.at + 0.4, ease: ease.easeOutBack })(localTime)})` : 'scale(1)',
              }}>
                {on ? <>
                  <FlagTile id={team.id} w={34} radius={4} />
                  <div>
                    <div style={{ fontFamily: SANS, fontWeight: 850, fontSize: 10, letterSpacing: '0.06em', color: p.textc }}>PICK {slot + 1}</div>
                    <div style={{ fontFamily: SANS, fontWeight: 760, fontSize: 17, color: WC.text }}>{team.name}</div>
                  </div>
                </> : (
                  <div style={{ fontFamily: SANS, fontWeight: 760, fontSize: 14, color: WC.muted, letterSpacing: '0.04em' }}>PICK {slot + 1}</div>
                )}
              </div>
            );
          })}
        </div>

        {/* Lock Entry CTA — appears after the 3rd pick, gently pulses */}
        <div style={{ ...rev(localTime, PICK_EVENTS[2].at + 0.6, 0.55), marginTop: 34 }}>
          {(() => {
            const g = 0.5 + 0.5 * Math.sin((localTime - PICK_EVENTS[2].at) * 2.6);
            return (
              <div style={{
                display: 'inline-flex', alignItems: 'center', gap: 12,
                background: WC.green, color: '#fff', fontFamily: SANS, fontWeight: 800, fontSize: 25,
                padding: '17px 36px', borderRadius: 8,
                boxShadow: `0 12px 30px rgba(16,107,79,${(0.20 + 0.18 * g).toFixed(3)})`,
              }}>
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><rect x="4" y="11" width="16" height="9" rx="2" /><path d="M8 11V7a4 4 0 0 1 8 0v4" /></svg>
                Lock Entry
              </div>
            );
          })()}
        </div>
      </div>

      {/* picker panel */}
      <div style={{ ...rev(localTime, 0.15, 0.55, 30), position: 'absolute', left: panelX, top: panelY, width: panelW }}>
        <Panel pad={26}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <div style={{ fontFamily: SANS, fontWeight: 800, fontSize: 30, color: WC.text, letterSpacing: '-0.01em' }}>Choose 3 Teams</div>
              <div style={{ fontFamily: SANS, fontWeight: 650, fontSize: 16, color: WC.muted, marginTop: 4 }}>Late entries open — a team locks when its 2nd group match starts.</div>
            </div>
            <div style={{
              background: selCount === 3 ? WC.greenSoft : WC.surfaceStrong,
              border: `1px solid ${selCount === 3 ? WC.picks[0].border : WC.border}`,
              borderRadius: 8, padding: '10px 18px', textAlign: 'center',
            }}>
              <span style={{ fontFamily: SANS, fontWeight: 850, fontSize: 26, color: selCount === 3 ? WC.green : WC.text }}>{selCount}</span>
              <span style={{ fontFamily: SANS, fontWeight: 700, fontSize: 18, color: WC.muted }}> / 3</span>
              <div style={{ fontFamily: SANS, fontWeight: 700, fontSize: 12, color: WC.muted, letterSpacing: '0.06em', textTransform: 'uppercase' }}>selected</div>
            </div>
          </div>
          {/* search bar */}
          <div style={{
            marginTop: 20, height: 56, borderRadius: 7, border: `1px solid ${WC.border}`,
            background: WC.paperSoft, display: 'flex', alignItems: 'center', gap: 12, padding: '0 18px',
          }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={WC.muted} strokeWidth="2" strokeLinecap="round"><circle cx="11" cy="11" r="7" /><path d="M21 21l-4.3-4.3" /></svg>
            <span style={{ fontFamily: SANS, fontWeight: 650, fontSize: 18, color: WC.muted }}>Search by team, group, confederation</span>
          </div>
          {/* rows */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: rowGap, marginTop: 16 }}>
            {PICK_LIST.map((id, i) => (
              <TeamRow key={id} team={T[id]} slot={selectedSlotByRow[i]} selected={i in selectedSlotByRow} height={rowH} />
            ))}
          </div>
        </Panel>
      </div>

      <Cursor x={cx} y={cy} pressing={pressing} />
    </SceneWrap>
  );
}

// =============================================================================
// SCENE 3 — COEFFICIENT SCORING
// =============================================================================
function SceneCoef() {
  const { localTime } = useSprite();
  // worked example: Morocco wins in 90' + 1 goal, Round of 32
  // (5 base + 0.5 goal) * 1.77 team * 1.20 stage = 7.79
  const gauges = [
    { team: T.france, c: 1.00 },
    { team: T.morocco, c: 1.77 },
    { team: T.ghana, c: 2.47 },
    { team: T.curacao, c: 3.00 },
  ];
  return (
    <SceneWrap>
      <div style={{ position: 'absolute', left: 120, top: 150, width: 1680 }}>
        <div style={rev(localTime, 0.15, 0.5)}><Eyebrow>Step 02 · Scoring</Eyebrow></div>
        <div style={{ ...rev(localTime, 0.3, 0.55), fontFamily: SANS, fontWeight: 850, fontSize: 78, color: WC.text, letterSpacing: '-0.03em', lineHeight: 1.0, marginTop: 16 }}>
          Every result scores — <span style={{ color: WC.green }}>multiplied.</span>
        </div>
        <div style={{ ...rev(localTime, 0.5, 0.55), fontFamily: SANS, fontWeight: 650, fontSize: 27, color: WC.muted, marginTop: 18, maxWidth: 1000 }}>
          Each team's points are scaled by its coefficient and the stage it reaches. The bigger the underdog, the bigger the multiplier.
        </div>
      </div>

      {/* formula band */}
      <div style={{ ...rev(localTime, 0.85, 0.55), position: 'absolute', left: 120, top: 470, width: 1080 }}>
        <div style={{
          background: WC.greenSoft, border: `1px solid ${WC.picks[0].border}`, borderRadius: 8,
          padding: '26px 32px', display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap',
        }}>
          {[
            ['(base + bonuses)', WC.text, WC.surface],
            ['×', WC.muted, null],
            ['team coefficient', WC.green, '#dbeee6'],
            ['×', WC.muted, null],
            ['stage coefficient', WC.green, '#dbeee6'],
          ].map(([txt, col, bg], i) => bg ? (
            <span key={i} style={{ fontFamily: SANS, fontWeight: 800, fontSize: 28, color: col, background: bg, padding: '8px 16px', borderRadius: 7, letterSpacing: '-0.01em' }}>{txt}</span>
          ) : (
            <span key={i} style={{ fontFamily: SANS, fontWeight: 800, fontSize: 30, color: col }}>{txt}</span>
          ))}
        </div>
      </div>

      {/* worked example card */}
      <div style={{ ...rev(localTime, 1.3, 0.55), position: 'absolute', left: 120, top: 640, width: 1080 }}>
        <Panel pad={28}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <FlagTile id="morocco" w={56} radius={6} />
            <div style={{ flex: 1 }}>
              <div style={{ fontFamily: SANS, fontWeight: 800, fontSize: 28, color: WC.text }}>Morocco wins in the Round of 32</div>
              <div style={{ fontFamily: SANS, fontWeight: 650, fontSize: 19, color: WC.muted, marginTop: 4 }}>
                Win 90′ <b style={{ color: WC.text }}>5</b> + goal <b style={{ color: WC.text }}>0.5</b> · coef <b style={{ color: WC.green }}>×1.77</b> · stage <b style={{ color: WC.green }}>×1.20</b>
              </div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontFamily: SANS, fontWeight: 700, fontSize: 14, color: WC.muted, letterSpacing: '0.06em', textTransform: 'uppercase' }}>Points</div>
              <div style={{ fontFamily: SANS, fontWeight: 850, fontSize: 64, color: WC.green, letterSpacing: '-0.02em', lineHeight: 1 }}>
                <LCount from={0} to={11.77} start={1.6} end={3.0} fmt={(v) => v.toFixed(2)} />
              </div>
            </div>
          </div>
        </Panel>
      </div>

      {/* coefficient gauges */}
      <div style={{ ...rev(localTime, 1.0, 0.55), position: 'absolute', left: 1280, top: 470, width: 520 }}>
        <div style={{ fontFamily: SANS, fontWeight: 700, fontSize: 14, color: WC.muted, letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: 18 }}>Coefficient range · 1.00 → 3.00</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
          {gauges.map((g, i) => {
            const pct = ((g.c - 1) / 2) * 100;
            const w = animate({ from: 0, to: pct, start: 1.1 + i * 0.12, end: 1.9 + i * 0.12, ease: ease.easeOutCubic })(localTime);
            return (
              <div key={g.team.id} style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                <FlagTile id={g.team.id} w={40} radius={4} />
                <span style={{ width: 130, fontFamily: SANS, fontWeight: 760, fontSize: 19, color: WC.text }}>{g.team.name}</span>
                <div style={{ flex: 1, height: 14, borderRadius: 7, background: WC.surfaceStrong, overflow: 'hidden' }}>
                  <div style={{ width: `${w}%`, height: '100%', borderRadius: 7, background: `linear-gradient(90deg, ${WC.green}, ${WC.gold})` }} />
                </div>
                <span style={{ width: 64, textAlign: 'right', fontFamily: SANS, fontWeight: 850, fontSize: 22, color: i >= 2 ? WC.gold : WC.green, fontVariantNumeric: 'tabular-nums' }}>{fmtCoef(g.c)}</span>
              </div>
            );
          })}
        </div>
      </div>
    </SceneWrap>
  );
}

// =============================================================================
// SCENE 4 — LEADERBOARD
// =============================================================================
const BOARD = [
  { name: 'You', you: true, score: 84.50, picks: [['brazil', 38.20, 1.19], ['morocco', 27.80, 1.77], ['croatia', 18.50, 1.96]] },
  { name: 'deicu_07', score: 79.15, picks: [['argentina', 41.00, 1.19], ['japan', 22.40, 1.86], ['ecuador', 15.75, 1.96]] },
  { name: 'Toni R.', score: 71.60, picks: [['spain', 33.50, 1.00], ['uruguay', 24.10, 1.86], ['senegal', 14.00, 1.96]] },
  { name: 'GoalMachine', score: 63.05, picks: [['portugal', 29.20, 1.27], ['colombia', 20.85, 1.77], ['ghana', 13.00, 2.47]] },
];

function SceneBoard() {
  const { localTime } = useSprite();
  return (
    <SceneWrap>
      <div style={{ position: 'absolute', left: 120, top: 110, width: 1680 }}>
        <div style={rev(localTime, 0.15, 0.5)}><Eyebrow>Step 03 · Leaderboard</Eyebrow></div>
        <div style={{ ...rev(localTime, 0.3, 0.55), fontFamily: SANS, fontWeight: 850, fontSize: 70, color: WC.text, letterSpacing: '-0.03em', lineHeight: 1.0, marginTop: 14 }}>
          Climb the board as your teams win.
        </div>
      </div>

      <div style={{ ...rev(localTime, 0.5, 0.55), position: 'absolute', left: 120, top: 290, width: 1680 }}>
        <Panel pad={22}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {BOARD.map((row, i) => {
              const isYou = row.you;
              // "You" pops in to #1 with a brief highlight pulse
              const pulse = isYou ? 1 + 0.015 * Math.max(0, Math.sin((localTime - 0.8) * 6)) * Math.exp(-(localTime - 0.8)) : 1;
              return (
                <div key={i} style={{
                  ...rev(localTime, 0.7 + i * 0.12, 0.5, 16),
                  background: isYou ? WC.greenSoft : WC.paperSoft,
                  border: `1px solid ${isYou ? WC.picks[0].border : WC.border}`,
                  boxShadow: isYou ? '0 0 0 2px rgba(16,107,79,0.25)' : 'none',
                  borderRadius: 8, padding: 18, transform: `scale(${pulse})`,
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 18 }}>
                    <RankBadge n={i + 1} size={42} />
                    <span style={{ fontFamily: SANS, fontWeight: 850, fontSize: 30, color: WC.text, whiteSpace: 'nowrap' }}>
                      {row.name}{isYou && <span style={{ fontWeight: 700, fontSize: 18, color: WC.green, marginLeft: 12, background: '#fff', border: `1px solid ${WC.picks[0].border}`, borderRadius: 999, padding: '3px 12px' }}>your entry</span>}
                    </span>
                    <div style={{ flex: 1 }} />
                    <span style={{ fontFamily: SANS, fontWeight: 850, fontSize: 40, color: WC.text, fontVariantNumeric: 'tabular-nums' }}>
                      {isYou
                        ? <LCount from={0} to={row.score} start={0.9} end={2.4} fmt={fmtPts} />
                        : fmtPts(row.score)}
                    </span>
                  </div>
                  <div style={{ display: 'flex', gap: 12, marginTop: 14 }}>
                    {row.picks.map(([tid, pts, coef], si) => (
                      <PickChip key={si} slot={si} team={T[tid]} pts={pts} coef={coef} w={(1680 - 44 - 24) / 3} />
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
// SCENE 5 — PRIZE POOL
// =============================================================================
const PAYOUTS = [
  { rank: '#1', pct: 32.0, amt: 15360 },
  { rank: '#2', pct: 20.0, amt: 9600 },
  { rank: '#3', pct: 14.0, amt: 6720 },
  { rank: '#4', pct: 10.0, amt: 4800 },
  { rank: '#5', pct: 7.0, amt: 3360 },
  { rank: '#6', pct: 5.0, amt: 2400 },
];

function ScenePrize() {
  const { localTime } = useSprite();
  return (
    <SceneWrap>
      <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ ...rev(localTime, 0.15, 0.5), textAlign: 'center' }}>
          <Eyebrow style={{ color: WC.gold }}>Step 04 · The Prize</Eyebrow>
        </div>
        <div style={{ ...rev(localTime, 0.3, 0.5), display: 'flex', alignItems: 'center', gap: 18, marginTop: 18 }}>
          <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke={WC.gold} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10" /><path d="M16 8h-6a2 2 0 1 0 0 4h4a2 2 0 1 1 0 4H8" /><path d="M12 6v2m0 8v2" />
          </svg>
          <div style={{ fontFamily: SANS, fontWeight: 850, fontSize: 156, color: WC.gold, letterSpacing: '-0.03em', lineHeight: 1, fontVariantNumeric: 'tabular-nums' }}>
            <LCount from={0} to={48000} start={0.4} end={2.0} fmt={fmtMoney} />
          </div>
        </div>
        <div style={{ ...rev(localTime, 0.6, 0.5), fontFamily: SANS, fontWeight: 800, fontSize: 38, color: WC.text, marginTop: 6, whiteSpace: 'nowrap' }}>
          Prize pool · <span style={{ color: WC.green }}>Top 10 paid</span>
        </div>

        {/* payout strip */}
        <div style={{ display: 'flex', gap: 16, marginTop: 52 }}>
          {PAYOUTS.map((p, i) => (
            <div key={p.rank} style={{
              ...rev(localTime, 1.0 + i * 0.1, 0.5, 22),
              width: 210, background: WC.surface, border: `1px solid ${i === 0 ? '#e4bd86' : WC.border}`,
              boxShadow: i === 0 ? '0 0 0 2px rgba(201,148,46,0.3), ' + WC.shadow : WC.shadow,
              borderRadius: 8, padding: '18px 20px',
            }}>
              <div style={{ fontFamily: SANS, fontWeight: 700, fontSize: 16, color: WC.muted }}>{p.rank}</div>
              <div style={{ fontFamily: SANS, fontWeight: 850, fontSize: 34, color: i === 0 ? WC.gold : WC.text, letterSpacing: '-0.02em', marginTop: 4, fontVariantNumeric: 'tabular-nums' }}>
                <LCount from={0} to={p.amt} start={1.1 + i * 0.1} end={2.2 + i * 0.1} fmt={fmtMoney} />
              </div>
              <div style={{ fontFamily: SANS, fontWeight: 700, fontSize: 15, color: WC.muted, marginTop: 2 }}>{p.pct.toFixed(2)}%</div>
            </div>
          ))}
        </div>
        <div style={{ ...rev(localTime, 1.9, 0.5), fontFamily: SANS, fontWeight: 650, fontSize: 22, color: WC.muted, marginTop: 34 }}>
          Weighted split from the live prize pool — it grows with every entry.
        </div>
      </div>
    </SceneWrap>
  );
}

// =============================================================================
// SCENE 6 — REFERRAL / EARN AS AN AGENT
// =============================================================================
function NodeCircle({ icon, label, sub, color, bg }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 14, width: 300 }}>
      <div style={{
        width: 132, height: 132, borderRadius: '50%', background: bg,
        border: `2px solid ${color}`, display: 'flex', alignItems: 'center', justifyContent: 'center',
        boxShadow: '0 12px 30px rgba(17,43,36,.10)',
      }}>{icon}</div>
      <div style={{ textAlign: 'center' }}>
        <div style={{ fontFamily: SANS, fontWeight: 800, fontSize: 26, color: WC.text, whiteSpace: 'nowrap' }}>{label}</div>
        <div style={{ fontFamily: SANS, fontWeight: 650, fontSize: 17, color: WC.muted, marginTop: 2 }}>{sub}</div>
      </div>
    </div>
  );
}

function Flow({ at, localTime }) {
  const t = ease.easeOutCubic(clamp((localTime - at) / 0.5, 0, 1));
  return (
    <div style={{ width: 120, display: 'flex', alignItems: 'center', justifyContent: 'center', marginTop: 46 }}>
      <svg width="120" height="40" viewBox="0 0 120 40" fill="none">
        <path d="M6 20 H100" stroke={WC.green} strokeWidth="3" strokeDasharray="94" strokeDashoffset={94 * (1 - t)} strokeLinecap="round" />
        <path d="M96 13 l12 7 -12 7" stroke={WC.green} strokeWidth="3" fill="none" strokeLinecap="round" strokeLinejoin="round" opacity={t} />
      </svg>
    </div>
  );
}

// Benefit row inside a deal card
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
      <span style={{ fontFamily: SANS, fontWeight: 650, fontSize: 21, color: WC.text, lineHeight: 1.32, flex: 1 }}>{label}</span>
    </div>
  );
}

// One passive-income deal card
function DealCard({ tag, tagColor, tagBg, icon, title, sub, children, style }) {
  return (
    <div style={{
      width: 800, background: WC.surface, border: `1px solid ${WC.border}`,
      borderRadius: 10, boxShadow: WC.shadow, padding: 36, boxSizing: 'border-box', ...style,
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 18 }}>
        <div style={{
          width: 70, height: 70, borderRadius: 12, background: tagBg,
          border: `1px solid ${tagColor}`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
        }}>{icon}</div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontFamily: SANS, fontWeight: 850, fontSize: 13, letterSpacing: '0.14em', textTransform: 'uppercase', color: tagColor }}>{tag}</div>
          <div style={{ fontFamily: SANS, fontWeight: 850, fontSize: 38, color: WC.text, letterSpacing: '-0.02em', marginTop: 2 }}>{title}</div>
        </div>
      </div>
      <div style={{ fontFamily: SANS, fontWeight: 650, fontSize: 22, color: WC.muted, marginTop: 18, lineHeight: 1.4 }}>{sub}</div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 14, marginTop: 24 }}>{children}</div>
    </div>
  );
}

function SceneRefer() {
  const { localTime } = useSprite();
  const P1 = WC.picks[0], P2 = WC.picks[1];
  return (
    <SceneWrap>
      <div style={{ position: 'absolute', left: 0, right: 0, top: 92, textAlign: 'center' }}>
        <div style={rev(localTime, 0.15, 0.5)}><Eyebrow style={{ color: WC.gold }}>Step 05 · Passive Income</Eyebrow></div>
        <div style={{ ...rev(localTime, 0.3, 0.55), fontFamily: SANS, fontWeight: 850, fontSize: 76, color: WC.text, letterSpacing: '-0.03em', marginTop: 12 }}>
          Two ways to earn — <span style={{ color: WC.green }}>even off the pitch.</span>
        </div>
      </div>

      <div style={{ position: 'absolute', left: 0, right: 0, top: 300, display: 'flex', justifyContent: 'center', gap: 40 }}>
        {/* Deal 1 — Refer a friend */}
        <div style={rev(localTime, 0.7, 0.55, 26)}>
          <DealCard
            tag="Deal 01 · Refer a friend"
            tagColor={P2.accent} tagBg={P2.bg}
            icon={<svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke={P2.accent} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 2 11 13" /><path d="M22 2 15 22l-4-9-9-4z" /></svg>}
            title="Refer a friend"
            sub="Share your link. When the friend you referred wins, you earn a cut of their prize.">
            <div style={rev(localTime, 1.1, 0.5, 16)}>
              <BenefitRow big="5" unit="%" accent={P1.accent} bg={P1.bg} bd={P1.border}
                label={<span><b style={{ color: WC.text }}>If you were referred too</b> — you're in the chain.</span>} />
            </div>
            <div style={rev(localTime, 1.35, 0.5, 16)}>
              <BenefitRow big="3" unit="%" accent={P2.accent} bg={P2.bg} bd={P2.border}
                label={<span><b style={{ color: WC.text }}>If you joined on your own</b> — no referral.</span>} />
            </div>
          </DealCard>
        </div>

        {/* Deal 2 — Agent deal */}
        <div style={rev(localTime, 1.6, 0.55, 26)}>
          <DealCard
            tag="Deal 02 · Become an agent"
            tagColor={WC.gold} tagBg="#fff0dd"
            icon={<svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke={WC.gold} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 9a3 3 0 0 1 0 6v2a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-2a3 3 0 0 1 0-6V7a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2z" /><path d="M13 5v14" strokeDasharray="2 2" /></svg>}
            title="Agent deal"
            sub="Pre-buy tickets and sell them to your friends — earn from every one of them.">
            <div style={rev(localTime, 2.0, 0.5, 16)}>
              <BenefitRow big="1" unit="free" accent={WC.green} bg={WC.greenSoft} bd={P1.border}
                label={<span><b style={{ color: WC.text }}>ticket for you</b> — on the house when you stock up.</span>} />
            </div>
            <div style={rev(localTime, 2.25, 0.5, 16)}>
              <BenefitRow big="5" unit="%" accent={WC.gold} bg="#fff0dd" bd="#e4bd86"
                label={<span><b style={{ color: WC.text }}>of all your friends' winnings</b> — every time they win.</span>} />
            </div>
          </DealCard>
        </div>
      </div>

      <div style={{ ...rev(localTime, 2.5, 0.5), position: 'absolute', left: 0, right: 0, top: 870, textAlign: 'center' }}>
        <span style={{ fontFamily: SANS, fontWeight: 650, fontSize: 23, color: WC.muted }}>
          Paid out automatically from the prize pool — your income keeps coming as long as they keep winning.
        </span>
      </div>
    </SceneWrap>
  );
}

// =============================================================================
// SCENE 7 — CTA END CARD
// =============================================================================
function SceneCTA() {
  const { localTime } = useSprite();
  return (
    <SceneWrap exit={0.4}>
      <div style={{ position: 'absolute', inset: 0, opacity: 0.32 }}>
        <FlagMarquee y={60} dir={1} speed={28} scale={0.9} />
        <FlagMarquee y={920} dir={-1} speed={22} scale={0.9} />
      </div>
      <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(1100px 520px at 50% 50%, rgba(247,250,249,0.97) 40%, rgba(247,250,249,0) 80%)' }} />
      <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 28 }}>
        <div style={rev(localTime, 0.2, 0.55)}>
          <BrandMark size={96} showWord={false} />
        </div>
        <div style={{ ...rev(localTime, 0.45, 0.55), fontFamily: SANS, fontWeight: 700, fontSize: 34, color: WC.muted, letterSpacing: '0.02em' }}>
          Play now at
        </div>
        <a href="https://worldcup26.world" target="_blank" rel="noopener" style={{ ...rev(localTime, 0.65, 0.6, 26), fontFamily: SANS, fontWeight: 850, fontSize: 124, color: WC.green, letterSpacing: '-0.03em', lineHeight: 1, textDecoration: 'none', display: 'block' }}>
          WorldCup26.world
        </a>
        {/* CTA button */}
        <div style={{ ...rev(localTime, 0.95, 0.55), display: 'flex', gap: 18, marginTop: 14 }}>
          <a href="https://worldcup26.world" target="_blank" rel="noopener" style={{
            background: WC.green, color: '#fff', fontFamily: SANS, fontWeight: 800, fontSize: 28,
            padding: '20px 44px', borderRadius: 8, boxShadow: '0 14px 34px rgba(16,107,79,.32)',
            display: 'flex', alignItems: 'center', gap: 12, textDecoration: 'none',
          }}>
            <Trophy size={28} /> Pick Your 3 Teams
          </a>
        </div>
        <div style={{ ...rev(localTime, 1.25, 0.55), fontFamily: SANS, fontWeight: 650, fontSize: 24, color: WC.muted, marginTop: 8 }}>
          Pick 3 · Predict the Game · FIFA World Cup 2026
        </div>
      </div>
    </SceneWrap>
  );
}

// ── Persistent website watermark (clickable) ────────────────────────────────
function Watermark() {
  const time = useTime();
  const op = Math.min(clamp((time - 9.5) / 0.5, 0, 1), clamp((83.5 - time) / 0.5, 0, 1)) * 0.66;
  if (op <= 0.001) return null;
  return (
    <a href="https://worldcup26.world" target="_blank" rel="noopener" style={{
      position: 'absolute', left: 64, bottom: 56, opacity: op, textDecoration: 'none',
      display: 'flex', alignItems: 'center', gap: 12, zIndex: 40,
    }}>
      <BrandMark size={34} showWord={false} glow={false} />
      <span style={{ fontFamily: SANS, fontWeight: 800, fontSize: 24, color: WC.green, letterSpacing: '-0.01em' }}>WorldCup26.world</span>
    </a>
  );
}

Object.assign(window, {
  Backdrop, SceneWrap, LCount, Cursor, FlagMarquee, Watermark,
  SceneHook, ScenePick, SceneCoef, SceneBoard, ScenePrize, SceneRefer, SceneCTA,
});
