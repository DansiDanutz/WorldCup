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
      <ClipSprite id="cold-final-night" dim={0.25} style={{ filter: 'brightness(0.7) contrast(1.1)' }} />
      <ClipSprite id="cold-torres-winner" />
      <ClipSprite id="cold-messi-walk" dim={0.15} style={{ filter: 'saturate(0.9)' }} />
      <ClipSprite id="cold-scale" dim={0.1} />
      <ClipSprite id="cold-title-card" />
      <ChapterTitle at={30.5} text="WHAT FOOTBALL LEFT BEHIND" color="#e8eeff" size={78} />
    </Frame>
  );
}

// ── CH1 · What we built — worldcup26.world (74–242) ───────────────────────────
function SceneBuilt() {
  return (
    <Frame>
      <ClipSprite id="build-app-hero" />
      <ClipSprite id="build-pick3-card" />
      <ClipSprite id="build-legendcards" dim={0.1} />
      <ClipSprite id="build-castro" />
      <ClipSprite id="build-escobar" />
      <ClipSprite id="build-carbajal" />
      <ClipSprite id="build-craft" dim={0.15} />
      <ChapterTitle at={76} text="WHAT WE BUILT" color={MV.gold} />
    </Frame>
  );
}

// ── CH2 · Thank you — 14,000 (242–388) ────────────────────────────────────────
function SceneThanks() {
  return (
    <Frame>
      <ClipSprite id="thanks-14k-card" />
      <ClipSprite id="thanks-stadium" />
      <ClipSprite id="thanks-community" />
      <ClipSprite id="thanks-basecamp" dim={0.1} />
      <ChapterTitle at={242.5} text="THANK YOU" color={MV.gold} />
    </Frame>
  );
}

// ── CH3 · The money (388–611) ─────────────────────────────────────────────────
function SceneMoney() {
  return (
    <Frame>
      <ClipSprite id="money-655-card" />
      <ClipSprite id="money-50m-card" />
      <ClipSprite id="money-placings" />
      <ClipSprite id="money-clubs-card" />
      <ClipSprite id="money-growth-card" />
      <ClipSprite id="money-explode" dim={0.2} />
      <ChapterTitle at={388} text="THE MONEY" color="#f6b40e" />
    </Frame>
  );
}

// ── CH4 · The record books (611–832) ──────────────────────────────────────────
function SceneRecords() {
  return (
    <Frame>
      <ClipSprite id="rec-brazil5-card" />
      <ClipSprite id="rec-klose-card" />
      <ClipSprite id="rec-mbappe" />
      <ClipSprite id="rec-messi-scorer" />
      <ClipSprite id="rec-scorers-card" />
      <ClipSprite id="rec-boot-card" />
      <ClipSprite id="rec-pele-young" />
      <ClipSprite id="rec-milla-old" />
      <ClipSprite id="rec-fastest-card" />
      <ClipSprite id="rec-format-card" />
      <ClipSprite id="rec-308-card" />
      <ClipSprite id="rec-attendance" dim={0.1} />
      <ClipSprite id="rec-spain-def" />
      <ChapterTitle at={611} text="THE RECORD BOOKS" color="#e8eeff" size={82} />
    </Frame>
  );
}

// ── CH5 · The greatest winners (832–992) ──────────────────────────────────────
function SceneGreatest() {
  return (
    <Frame>
      <ClipSprite id="great-brazil70" />
      <ClipSprite id="great-spain10" />
      <ClipSprite id="great-pele58" />
      <ClipSprite id="great-machines" />
      <ClipSprite id="great-spain26-card" />
      <ClipSprite id="great-montage" dim={0.1} />
      <ChapterTitle at={832} text="THE GREATEST" color={MV.gold} />
    </Frame>
  );
}

// ── CH6 · What it leaves behind — Messi, the memories, the storm (992–1331) ────
function SceneLeaves() {
  return (
    <Frame>
      <ClipSprite id="leave-cruyff" />
      <ClipSprite id="leave-puskas" />
      <ClipSprite id="leave-milla" />
      <ClipSprite id="leave-messi-hero" />
      <ClipSprite id="leave-messi-drive" />
      <ClipSprite id="leave-final-drama" />
      <ClipSprite id="leave-torres-goal" />
      <ClipSprite id="leave-medal" dim={0.1} />
      <ClipSprite id="leave-awards-card" />
      <ClipSprite id="leave-messi-love" />
      <ClipSprite id="leave-trump-card" />
      <ClipSprite id="leave-phonecall" dim={0.2} />
      <ClipSprite id="leave-belgium-card" />
      <ChapterTitle at={992} text="WHAT REMAINS" color="#e8eeff" />
    </Frame>
  );
}

// ── CH7 · Close + CTA (1331–1470) ─────────────────────────────────────────────
function SceneClose() {
  return (
    <Frame>
      <ClipSprite id="close-montage" dim={0.12} />
      <ClipSprite id="close-14k-climb" />
      <ClipSprite id="close-app-cta" />
      <ClipSprite id="close-endcard" />
      <Confetti start={1331} dur={10} />
      <ChapterTitle at={1331} text="WE CONTINUE" color={MV.gold} />
    </Frame>
  );
}
