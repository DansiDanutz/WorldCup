// Deep Dive — the whole film is data (window.MV_FILM, built by build.mjs from the
// episode's episode.json + VO durations), so picture and sound can never drift.
/* global React */
const SCENE_TYPES = {
  ambient: 'AmbientStadium', drift: 'CardDrift', cardwall: 'CardWall', impact: 'ImpactText',
  kinetic: 'KineticWords', phone: 'PhoneMock', nameplate: 'NamePlate', timeline: 'YearTimeline',
  stadium: 'StadiumBowl', ballnet: 'BallToNet', card: 'CardShowcase', clock: 'ClockTick',
  title: 'PlayerTitle', jersey: 'Jersey', stat: 'StatCounter', route: 'RouteMap', pitch: 'TacticalPitch',
  artifact: 'Artifact', versus: 'VersusBars', heartbeat: 'Heartbeat', date: 'DateFlip',
  chapter: 'ChapterMark', bug: 'CornerBug', clip: 'ClipShot',
};

function FilmLayer() {
  const K = window.MotionKit;
  const F = window.MV_FILM || { graphics: [] };
  return (
    <div style={{ position: 'absolute', inset: 0, zIndex: 6 }}>
      {F.graphics.map((b, i) => {
        const Comp = K[SCENE_TYPES[b.type]];
        if (!Comp) return null;
        const { at, dur, type, accent, ...rest } = b;
        const acc = accent === 'red' ? K.MK.red : accent === 'green' ? K.MK.green : undefined;
        if (b.type === 'ambient') return <Comp key={i} from={at} dur={dur} tint={b.tint} />;
        return <Comp key={i} from={at} dur={dur} {...rest} {...(acc ? { accent: acc } : {})} />;
      })}
    </div>
  );
}

function SceneFilm() {
  return (
    <div style={{ position: 'absolute', inset: 0, background: '#05070c', overflow: 'hidden' }}>
      <FilmLayer />
      <Vignette strength={0.42} />
      <Letterbox />
    </div>
  );
}
