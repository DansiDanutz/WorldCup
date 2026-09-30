// FORGOTTEN Vol.1 — the whole film is data-driven from film.json (window.MV_FILM),
// so the timeline and the render can never drift apart.
function FilmLayer() {
  const K = window.MotionKit;
  const F = window.MV_FILM || { graphics: [], chapters: [] };
  const accent = (b) => (b.accent === 'red' ? K.MK.red : K.MK.gold);
  return (
    <div style={{ position: 'absolute', inset: 0 }}>
      {/* procedural background + typography beats */}
      <div style={{ position: 'absolute', inset: 0, zIndex: 6 }}>
        {F.graphics.map((b, i) => {
          if (b.type === 'ambient')  return <K.AmbientStadium key={i} from={b.at} dur={b.dur} tint={b.tint} />;
          if (b.type === 'drift')    return <K.CardDrift  key={i} from={b.at} dur={b.dur} srcs={b.srcs} count={b.count} opacity={b.opacity} />;
          if (b.type === 'cardwall') return <K.CardWall   key={i} from={b.at} dur={b.dur} srcs={b.srcs} label={b.label} columns={b.columns || 5} />;
          if (b.type === 'impact')   return <K.ImpactText key={i} from={b.at} dur={b.dur} text={b.text} size={b.size || 180} accent={accent(b)} />;
          if (b.type === 'kinetic')  return <K.KineticWords key={i} from={b.at} dur={b.dur} words={b.words} size={b.size || 130} accent={accent(b)} />;
          if (b.type === 'phone')    return <K.PhoneMock  key={i} from={b.at} dur={b.dur} srcs={b.srcs} />;
          return null;
        })}
      </div>
      {/* the legend cards, alive */}
      {F.chapters.map((c, i) => (
        <React.Fragment key={i}>
          <K.LivingCard from={c.at} dur={c.dur} card={c.card} media={c.media} side={c.side} />
          <K.ChapterPlate from={c.at} dur={c.dur} index={c.index} name={c.name}
            label={c.label} meta={c.meta} side={c.side === 'left' ? 'right' : 'left'} />
        </React.Fragment>
      ))}
    </div>
  );
}

function SceneFilm() {
  return (
    <div style={{ position: 'absolute', inset: 0, background: '#05070c', overflow: 'hidden' }}>
      <FilmLayer />
      <Vignette strength={0.62} />
      <Letterbox />
    </div>
  );
}
