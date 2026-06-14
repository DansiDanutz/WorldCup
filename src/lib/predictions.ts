// WorldCup26 Legends — episode/match predictions feed for the Predictions tab.
//
// IMPORTANT (series canon): every scoreline here is OUR STORY PREDICTION from the
// matching YouTube episode — NOT a real result. The Predictions page frames them
// as predictions throughout. Keep scores/scorers consistent with content/Stories/
// and each episode's narration.json, and never contradict the group draw in
// content/README.md.
//
// `youtube` is the public video URL once the episode is live, or null while it is
// still scheduled to premiere. Update the URL here (and content/youtube/PRODUCTION_LOG.md)
// after each upload.

export type MatchPrediction = {
  ep: number;
  home: string;
  away: string;
  /** Group / stage label, when known from the episode canon. */
  stage?: string;
  /** Human date of the match the episode covers. */
  date?: string;
  /** Predicted scoreline as "home–away", or null when the episode leaves it open. */
  score: string | null;
  /** One-line story hook for the card. */
  hook: string;
  /** Public YouTube URL, or null until the episode premieres. */
  youtube: string | null;
};

export const PREDICTIONS: MatchPrediction[] = [
  {
    ep: 1,
    home: "Mexico",
    away: "South Africa",
    stage: "Group A · Matchday 1",
    date: "Jun 11, 2026 · Estadio Azteca",
    score: "0–0",
    hook: "The Azteca's ghosts and the unfinished business of 2010.",
    youtube: "https://www.youtube.com/watch?v=myNgytIwZ0U",
  },
  {
    ep: 2,
    home: "South Korea",
    away: "Czech Republic",
    stage: "Group stage",
    date: "Jun 2026",
    score: "1–0",
    hook: "Sonaldo's last dance — Son's 41st-minute winner.",
    youtube: null,
  },
  {
    ep: 3,
    home: "Canada",
    away: "Bosnia & Herzegovina",
    stage: "Group B · Matchday 1",
    date: "Jun 12, 2026 · BMO Field, Toronto",
    score: "0–0",
    hook: "The Maple Leaf Man; Davies' cutback, Džeko inches wide.",
    youtube: null,
  },
  {
    ep: 4,
    home: "USA",
    away: "Paraguay",
    stage: "Group D · Matchday 1",
    date: "Jun 12, 2026 · AT&T Stadium, Arlington",
    score: "1–1",
    hook: "A 1930 rematch; Enciso from 40 yards — a cliffhanger.",
    youtube: null,
  },
  {
    ep: 5,
    home: "Brazil",
    away: "Morocco",
    stage: "Group C · Matchday 1",
    date: "Jun 13, 2026",
    score: "1–0",
    hook: "Revenge for Tangier; Neymar's no-look, Vini finishes.",
    youtube: null,
  },
  {
    ep: 6,
    home: "Argentina",
    away: "Algeria",
    stage: "Group J · Matchday 1",
    date: "Jun 13, 2026",
    score: null,
    hook: "Messi vs Mahrez; Dibu's 83' save kisses the post. Score left open.",
    youtube: null,
  },
  {
    ep: 7,
    home: "Brazil",
    away: "Haiti",
    stage: "Group C · Matchday 2",
    date: "Jun 16, 2026",
    score: "4–1",
    hook: "Nazon's top-corner reply to the Seleção.",
    youtube: "https://youtu.be/4RxCyLtIccs",
  },
  {
    ep: 11,
    home: "England",
    away: "Ghana",
    stage: "Group L · Matchday 2",
    date: "Jun 16, 2026",
    score: "1–1",
    hook: "England's secret; Partey clears Kane's header off the line.",
    youtube: "https://youtu.be/zWAcb4CLOWs",
  },
  {
    ep: 9,
    home: "Qatar",
    away: "Switzerland",
    stage: "Group stage",
    date: "Jun 13, 2026",
    score: "0–1",
    hook: "The desert trap; Embolo's 52' header settles it.",
    youtube: "https://youtu.be/8Pf-oRROUyk",
  },
  {
    ep: 10,
    home: "Haiti",
    away: "Scotland",
    stage: "Group stage",
    date: "Jun 14, 2026",
    score: "1–1",
    hook: "Battle of the underdogs; the Lone Piper, Nazon's 63' equaliser.",
    youtube: "https://youtu.be/x5N4LiIgXRo",
  },
  {
    ep: 12,
    home: "Australia",
    away: "Turkey",
    stage: "Group stage",
    date: "Jun 14, 2026",
    score: "2–2",
    hook: "Two nations of wanderers; Souttar's 88' header.",
    youtube: "https://youtu.be/gGOqgKEG10o",
  },
  {
    ep: 13,
    home: "Germany",
    away: "Curaçao",
    stage: "Group stage",
    date: "Jun 14, 2026",
    score: "3–0",
    hook: "David and the machine; Eloy Room's 34' save.",
    youtube: "https://youtu.be/uKZ5R7vlBi8",
  },
  {
    ep: 14,
    home: "Netherlands",
    away: "Japan",
    stage: "Group stage",
    date: "Jun 14, 2026",
    score: "2–2",
    hook: "Total Football vs the Samurai; Mitoma's late equaliser.",
    youtube: null,
  },
];
