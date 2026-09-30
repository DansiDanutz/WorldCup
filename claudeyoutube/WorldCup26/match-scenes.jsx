// match-scenes.jsx — WorldCup26.world milestone + FIFA-records documentary (1470s).
// Scene windows MUST match SCENES in match.html, narration.json (VO) and clips.json.
// Every ClipSprite below references a clip id that must exist in clips.json (boot QA guard checks this).
// ClipSprite self-positions from its clips.json at/dur — scenes just declare which
// clips belong to the chapter, plus SHORT chapter labels (<=4 words, rule #10: no sentences).
// The big numbers/records are HyperFrames cards played as clips (hf/*.mp4), never on-screen sentences.

const GREEN = '#106b4f';

// Shared cinematic frame for every chapter.
function Frame({ children, grain = false }) {
  return (
    <div style={{ position: 'absolute', inset: 0, background: '#050608', overflow: 'hidden' }}>
      {children}
      <Vignette strength={0.6} />
      <Letterbox />
    </div>
  );
}

// Procedural graphics beats (clips.json `graphics[]`) rendered through MotionKit.
// Each chapter mounts one GraphicsLayer over its window — Remotion-style animated
// numbers/names/charts that tile every second no clip or card covers (no-black rule).
function GraphicsLayer({ from, to }) {
  const K = window.MotionKit;
  const beats = (window.MV_GRAPHICS || []).filter(b => b.at >= from - 0.01 && b.at < to);
  return (
    <div style={{ position: 'absolute', inset: 0, zIndex: 8 }}>
      {beats.map((b, i) => {
        const accent = b.accent === 'red' ? K.MK.red : K.MK.gold;
        if (b.type === 'kinetic')  return <K.KineticWords key={i} from={b.at} dur={b.dur} words={b.words} size={b.size || 140} accent={accent} />;
        if (b.type === 'score')    return <K.ScoreTicker key={i} from={b.at} dur={b.dur} left={b.left} right={b.right} score={b.score} note={b.note} />;
        if (b.type === 'flags')    return <K.FlagWall key={i} from={b.at} dur={b.dur} colors={b.colors} />;
        if (b.type === 'barchart') return <K.BarChartGrow key={i} from={b.at} dur={b.dur} title={b.title} bars={b.bars} />;
        if (b.type === 'trophy')   return <K.TrophyCup key={i} from={b.at} dur={b.dur} label={b.label} />;
        if (b.type === 'pitch')    return <K.PitchLines key={i} from={b.at} dur={b.dur} />;
        if (b.type === 'name')     return <K.NamePlate key={i} from={b.at} dur={b.dur} name={b.name} stat={b.stat} meta={b.meta} accent={accent} />;
        if (b.type === 'impact')   return <K.ImpactText key={i} from={b.at} dur={b.dur} text={b.text} size={b.size || 210} accent={accent} />;
        if (b.type === 'clock')    return <K.ClockTick key={i} from={b.at} dur={b.dur} to={b.to} label={b.label} />;
        if (b.type === 'ball')     return <K.BallToNet key={i} from={b.at} dur={b.dur} accent={accent} />;
        if (b.type === 'timeline') return <K.YearTimeline key={i} from={b.at} dur={b.dur} years={b.years} label={b.label} />;
        if (b.type === 'bowl')     return <K.StadiumBowl key={i} from={b.at} dur={b.dur} fillTo={b.fillTo || 1} label={b.label} />;
        if (b.type === 'card')     return <K.CardShowcase key={i} from={b.at} dur={b.dur} src={b.src} name={b.name} meta={b.meta} accent={accent} />;
        if (b.type === 'cardwall') return <K.CardWall key={i} from={b.at} dur={b.dur} srcs={b.srcs} label={b.label} columns={b.columns || 7} />;
        if (b.type === 'phone')    return <K.PhoneMock key={i} from={b.at} dur={b.dur} srcs={b.srcs} />;
        if (b.type === 'drift')    return <K.CardDrift key={i} from={b.at} dur={b.dur} srcs={b.srcs} count={b.count || 6} opacity={b.opacity || 0.5} />;
        return null;
      })}
    </div>
  );
}

// Always-on animated base + graphics for one chapter window.
function ChapterBase({ from, to, tint = GREEN }) {
  const K = window.MotionKit;
  const t = useTime();
  if (t < from || t >= to) return null;
  return (
    <React.Fragment>
      <K.AmbientStadium from={from} dur={to - from} tint={tint} />
      <GraphicsLayer from={from} to={to} />
    </React.Fragment>
  );
}

// Short chapter kicker (label only, fades in/out) — global time via TitleReveal.
function ChapterTitle({ at, text, color = MV.gold, size = 96 }) {
  const t = useTime();
  const local = t - at;
  if (local < 0 || local > 6.5) return null;
  const out = Easing.easeInOutSine(clamp((local - 5.2) / 1.2, 0, 1));
  return (
    <div style={{
      position: 'absolute', inset: 0, zIndex: 26, display: 'flex',
      alignItems: 'center', justifyContent: 'center', opacity: 1 - out,
    }}>
      <TitleReveal text={text} start={at} size={size} color={color} />
    </div>
  );
}

// ── CH0 · Cold open (0–74): the final whistle, and the question ───────────────
function SceneColdOpen() {
  return (
    <Frame>
      <ChapterBase from={0} to={74} tint="#106b4f" />
      <ClipSprite id="cold-title-card" />
      <ChapterTitle at={30.5} text="WHAT FOOTBALL LEFT BEHIND" color="#e8eeff" size={78} />
    </Frame>
  );
}

// ── CH1 · What we built — worldcup26.world (74–242) ───────────────────────────
function SceneBuilt() {
  return (
    <Frame>
      <ChapterBase from={74} to={242.5} tint="#0e5a8a" />
      <ClipSprite id="build-pick3-card" />
      <ChapterTitle at={76} text="WHAT WE BUILT" color={MV.gold} />
    </Frame>
  );
}

// ── CH2 · Thank you — 14,000 (242–388) ────────────────────────────────────────
function SceneThanks() {
  return (
    <Frame>
      <ChapterBase from={242.5} to={388} tint="#106b4f" />
      <ChapterTitle at={242.5} text="THANK YOU" color={MV.gold} />
    </Frame>
  );
}

// ── CH3 · The money (388–611) ─────────────────────────────────────────────────
function SceneMoney() {
  return (
    <Frame>
      <ChapterBase from={388} to={611} tint="#8a6d0e" />
      {/* the static growth card was replaced by the animated BarChartGrow beat
          (clips.json graphics[], 528-559s) - values count up bar by bar */}
      <ChapterTitle at={388} text="THE MONEY" color="#f6b40e" />
    </Frame>
  );
}

// ── CH4 · The record books (611–832) ──────────────────────────────────────────
function SceneRecords() {
  return (
    <Frame>
      <ChapterBase from={611} to={832} tint="#0e5a8a" />
      <ChapterTitle at={611} text="THE RECORD BOOKS" color="#e8eeff" size={82} />
    </Frame>
  );
}

// ── CH5 · The greatest winners (832–992) ──────────────────────────────────────
function SceneGreatest() {
  return (
    <Frame>
      <ChapterBase from={832} to={992} tint="#106b4f" />
      <ChapterTitle at={832} text="THE GREATEST" color={MV.gold} />
    </Frame>
  );
}

// ── CH6 · What it leaves behind — Messi, the memories, the storm (992–1331) ────
function SceneLeaves() {
  return (
    <Frame>
      <ChapterBase from={992} to={1331} tint="#4a2a6b" />
      <ChapterTitle at={992} text="WHAT REMAINS" color="#e8eeff" />
    </Frame>
  );
}

// ── CH7 · Close + CTA (1331–1470) ─────────────────────────────────────────────
function SceneClose() {
  return (
    <Frame>
      <ChapterBase from={1331} to={1470} tint="#106b4f" />
      <Confetti start={1331} dur={10} />
      <ChapterTitle at={1331} text="WE CONTINUE" color={MV.gold} />
    </Frame>
  );
}
