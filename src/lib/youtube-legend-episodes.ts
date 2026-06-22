export type YouTubeLegendEpisode = {
  ep: number;
  episodeLabel?: string;
  home: string;
  away: string;
  stage?: string;
  date?: string;
  score: string | null;
  hook: string;
  story: string;
  youtube: string;
  imageTeam?: string;
};

export type YouTubeLegendBonusVideo = {
  id: string;
  episode: number;
  episodeLabel: string;
  title: string;
  subtitle: string;
  teams: string;
  story: string;
  youtube: string;
  imageTeam?: string;
};

export const YOUTUBE_LEGEND_EPISODES: YouTubeLegendEpisode[] = [
  {
    ep: 1,
    home: "Mexico",
    away: "South Africa",
    stage: "Group A - Matchday 1",
    date: "Jun 11, 2026 - Estadio Azteca",
    score: "0-0",
    hook: "The Azteca's ghosts and the unfinished business of 2010.",
    story:
      "Opening night belongs to pressure, memory, and noise. Mexico walk into the Azteca with history on their shoulders, while South Africa carry the spirit of Soccer City into another first chapter.",
    youtube: "https://www.youtube.com/watch?v=myNgytIwZ0U",
    imageTeam: "Mexico",
  },
  {
    ep: 2,
    home: "South Korea",
    away: "Czechia",
    stage: "Group A",
    score: "1-0",
    hook: "Son's last dance begins under the Guadalajara lights.",
    story:
      "South Korea's goodbye story begins with speed, sacrifice, and one final run from Son. Czechia arrive with old tournament muscle, ready to turn sentiment into silence.",
    youtube: "https://www.youtube.com/watch?v=53d_4pQcY_8",
    imageTeam: "South Korea",
  },
  {
    ep: 3,
    home: "Canada",
    away: "Bosnia & Herzegovina",
    stage: "Group B",
    score: "0-0",
    hook: "The Maple Leaf Man turns Toronto into a wall of red.",
    story:
      "Canada's home crowd searches for a moment that can outlive the match. Bosnia bring old scars, pride, and the calm of a team that knows how to suffer without bending.",
    youtube: "https://www.youtube.com/watch?v=qicbV-pTVdM",
    imageTeam: "Canada",
  },
  {
    ep: 4,
    home: "USA",
    away: "Paraguay",
    stage: "Group D",
    score: "1-1",
    hook: "The 1930 secret America forgot returns under a modern roof.",
    story:
      "The USA carry a forgotten rematch into a stadium built for noise. Paraguay answer with defiance, distance shooting, and a reminder that history rarely stays buried.",
    youtube: "https://www.youtube.com/watch?v=Rzi_0xhjrF4",
    imageTeam: "USA",
  },
  {
    ep: 5,
    home: "Brazil",
    away: "Morocco",
    stage: "Group C",
    score: "1-0",
    hook: "Brazil's kings meet Morocco's revenge story.",
    story:
      "Brazil chase beauty and a sixth star, but Morocco arrive with 2022 still burning in their boots. The kings have a secret, and the Atlas Lions know where to press.",
    youtube: "https://www.youtube.com/watch?v=hoOs2h5Jzms",
    imageTeam: "Brazil",
  },
  {
    ep: 6,
    home: "Argentina",
    away: "Algeria",
    stage: "Group J",
    score: null,
    hook: "Messi and Algeria share a night haunted by betrayal and miracles.",
    story:
      "Argentina's last dance meets Algeria's old football wound. Two ghosts walk beside the pitch, waiting for one save, one touch, and one moment that refuses to leave.",
    youtube: "https://www.youtube.com/watch?v=j57_mVzWGXg",
    imageTeam: "Argentina",
  },
  {
    ep: 7,
    home: "Brazil",
    away: "Haiti",
    stage: "Group C",
    score: "4-1",
    hook: "The supermarket worker who shocked Brazil walks into the legend.",
    story:
      "Brazil expect a procession, but Haiti bring rhythm, memory, and a goal that turns a mismatch into a story worth repeating. The drumbeat refuses to fade.",
    youtube: "https://www.youtube.com/watch?v=4RxCyLtIccs",
    imageTeam: "Haiti",
  },
  {
    ep: 9,
    home: "Qatar",
    away: "Switzerland",
    stage: "Group stage",
    score: "0-1",
    hook: "The desert trap waits for the quiet Swiss machine.",
    story:
      "Qatar set the tempo low and dangerous, asking Switzerland to solve heat, patience, and pride. The Falconer watches every pass before danger arrives.",
    youtube: "https://www.youtube.com/watch?v=8Pf-oRROUyk",
    imageTeam: "Qatar",
  },
  {
    ep: 10,
    home: "Haiti",
    away: "Scotland",
    stage: "Group stage",
    score: "1-1",
    hook: "Two underdogs carry fifty years of glorious heartbreak.",
    story:
      "Haiti and Scotland meet where hope hurts most. One nation remembers 1974 drums, the other hears the lone piper, and both know a single goal can become folklore.",
    youtube: "https://www.youtube.com/watch?v=x5N4LiIgXRo",
    imageTeam: "Haiti",
  },
  {
    ep: 11,
    home: "England",
    away: "Ghana",
    stage: "Group L",
    score: "1-1",
    hook: "England's secret meets Ghana's unfinished World Cup pain.",
    story:
      "England bring old invention and new expectation. Ghana bring the memory of the goal Africa was denied, and a belief that one brave clearance can rewrite a continent's night.",
    youtube: "https://www.youtube.com/watch?v=zWAcb4CLOWs",
    imageTeam: "South Africa",
  },
  {
    ep: 12,
    home: "Australia",
    away: "Turkey",
    stage: "Group stage",
    score: "2-2",
    hook: "Two nations with no home fight for one place to breathe.",
    story:
      "Australia and Turkey carry migration, distance, and survival in the same match. The Wanderer card belongs to the team that keeps moving when the path closes.",
    youtube: "https://www.youtube.com/watch?v=gGOqgKEG10o",
    imageTeam: "Australia",
  },
  {
    ep: 13,
    home: "Germany",
    away: "Curacao",
    stage: "Group stage",
    score: "3-0",
    hook: "The island of 150,000 meets the German machine.",
    story:
      "Germany arrive like a machine built from tournaments. Curacao answer with the courage of the smallest nation in the room, asking the giant to notice every save.",
    youtube: "https://www.youtube.com/watch?v=uKZ5R7vlBi8",
    imageTeam: "USA",
  },
  {
    ep: 14,
    home: "Netherlands",
    away: "Japan",
    stage: "Group stage",
    score: "2-2",
    hook: "Total Football meets the Samurai spirit.",
    story:
      "The Netherlands bring geometry and old orange swagger. Japan bring discipline, speed, and the memory of beating giants who thought the match was already solved.",
    youtube: "https://www.youtube.com/watch?v=vKJ1O2sNV1Y",
    imageTeam: "South Korea",
  },
  {
    ep: 15,
    home: "Ivory Coast",
    away: "Ecuador",
    stage: "Group E",
    score: "1-1",
    hook: "The footballer who helped stop a war watches the touchline.",
    story:
      "Ivory Coast bring a story bigger than sport, where football once helped quiet a nation. Ecuador answer with altitude, speed, and a defence that does not flinch.",
    youtube: "https://www.youtube.com/watch?v=3GRncnYwQVw",
    imageTeam: "Brazil",
  },
  {
    ep: 16,
    home: "Sweden",
    away: "Tunisia",
    stage: "Group F",
    score: "2-1",
    hook: "The team that opened Africa's door walks into Nordic frost.",
    story:
      "Sweden bring cold control and a striker's hunger. Tunisia bring the fire of a continent's first World Cup win, still glowing beneath the desert shirt.",
    youtube: "https://www.youtube.com/watch?v=gGZPOt2H_0s",
    imageTeam: "Morocco",
  },
  {
    ep: 17,
    home: "Spain",
    away: "Cape Verde",
    stage: "Group H",
    score: "3-1",
    hook: "Half a million people step onto Spain's stage.",
    story:
      "Spain bring an empire of passes and patience. Cape Verde bring a first World Cup night, an island heartbeat, and the dangerous freedom of having everything to gain.",
    youtube: "https://www.youtube.com/watch?v=_vHQqJxt6G4",
    imageTeam: "Mexico",
  },
  {
    ep: 18,
    home: "Belgium",
    away: "Egypt",
    stage: "Group G",
    score: "2-1",
    hook: "The number one team that never won faces the Pharaoh king.",
    story:
      "Belgium carry the last glow of a golden generation. Egypt carry Salah's crown and the question every great player hears near the end: can one more night be enough?",
    youtube: "https://www.youtube.com/watch?v=R1r8n4D7BTg",
    imageTeam: "Morocco",
  },
  {
    ep: 19,
    home: "Saudi Arabia",
    away: "Uruguay",
    stage: "Group H",
    score: "1-2",
    hook: "Three million people once silenced two hundred thousand.",
    story:
      "Saudi Arabia remember the shock that humbled Argentina. Uruguay remember the Maracanazo, when a small nation turned a giant stadium silent. This match is built from nerve.",
    youtube: "https://www.youtube.com/watch?v=a8xvaJWZhrs",
    imageTeam: "Qatar",
  },
  {
    ep: 20,
    home: "Iran",
    away: "New Zealand",
    stage: "Group G",
    score: "1-1",
    hook: "The team that went home unbeaten returns to the world stage.",
    story:
      "Iran bring pressure and pride. New Zealand bring the memory of 2010, when they left a World Cup unbeaten while champions fell around them.",
    youtube: "https://www.youtube.com/watch?v=0NFA-yDOlf4",
    imageTeam: "South Korea",
  },
  {
    ep: 21,
    home: "France",
    away: "Senegal",
    stage: "Group I",
    score: "2-1",
    hook: "The debutants who knocked out the champions meet France again.",
    story:
      "France enter with depth everywhere. Senegal enter with the ghost of 2002 dancing beside them, reminding every champion that one brave opener can change history.",
    youtube: "https://www.youtube.com/watch?v=dRK7UPQGzFQ",
    imageTeam: "Morocco",
  },
  {
    ep: 22,
    home: "Iraq",
    away: "Norway",
    stage: "Group I",
    score: "1-1",
    hook: "The war-torn nation that became champions of Asia meets Haaland.",
    story:
      "Iraq carry one flag through old wounds and impossible unity. Norway answer with northern power, Odegaard's control, and Haaland waiting for one clean ball.",
    youtube: "https://www.youtube.com/watch?v=tEURjCad3aY",
    imageTeam: "South Africa",
  },
  {
    ep: 23,
    home: "Austria",
    away: "Jordan",
    stage: "Group J",
    score: "2-1",
    hook: "The tiny kingdom reaches its first World Cup.",
    story:
      "Austria bring old European ghosts and the memory of the Wunderteam. Jordan bring the joy of first arrival, where every tackle feels like proof they belong.",
    youtube: "https://www.youtube.com/watch?v=sbW4Vjt89XY",
    imageTeam: "Qatar",
  },
  {
    ep: 24,
    home: "Portugal",
    away: "DR Congo",
    stage: "Group K",
    score: "3-1",
    hook: "The free kick the world got wrong returns to haunt Portugal.",
    story:
      "Portugal chase the last golden chapter. DR Congo bring the Leopards' old roar and a piece of football history that still feels unresolved.",
    youtube: "https://www.youtube.com/watch?v=uYP2OQxkyA4",
    imageTeam: "Portugal",
  },
  {
    ep: 25,
    home: "England",
    away: "Croatia",
    stage: "Group L",
    score: "2-1",
    hook: "The tiny nation that broke England's dream comes back.",
    story:
      "England meet the checkerboard ghost of 2018. Croatia bring Modric's old calm and the knowledge that small nations can still make giants tremble.",
    youtube: "https://www.youtube.com/watch?v=XthcG-jo4nc",
    imageTeam: "USA",
  },
  {
    ep: 26,
    home: "Ghana",
    away: "Panama",
    stage: "Group L",
    score: null,
    hook: "One kick from history brings Ghana back to the edge.",
    story:
      "Ghana carry the ache of a goal Africa was denied. Panama bring fight, noise, and a chance to make someone else's old wound hurt again.",
    youtube: "https://www.youtube.com/watch?v=q5FyP7kqn_Y",
    imageTeam: "South Africa",
  },
  {
    ep: 27,
    home: "Uzbekistan",
    away: "Colombia",
    stage: "Group K",
    score: null,
    hook: "Twenty years in the cold, and the match FIFA ordered replayed.",
    story:
      "Uzbekistan arrive carrying decades of near misses. Colombia bring rhythm, belief, and the kind of attacking joy that can turn a first-timer's dream into panic.",
    youtube: "https://www.youtube.com/watch?v=RfZIdYYQMF0",
    imageTeam: "Canada",
  },
  {
    ep: 28,
    home: "Czechia",
    away: "South Africa",
    stage: "Group A",
    score: null,
    hook: "The penalty he named the goal that woke a continent.",
    story:
      "Czechia bring structure and tournament memory. South Africa bring 2010 noise, the continent's first World Cup heartbeat, and a belief that joy can score.",
    youtube: "https://www.youtube.com/watch?v=MvIh3oTqD8U",
    imageTeam: "South Africa",
  },
  {
    ep: 29,
    home: "Switzerland",
    away: "Bosnia & Herzegovina",
    stage: "Group B",
    score: null,
    hook: "Born from the same war, two nations share one football story.",
    story:
      "Switzerland and Bosnia meet across memory, migration, and identity. The match feels less like strangers colliding and more like history looking in a mirror.",
    youtube: "https://www.youtube.com/watch?v=tC_s4X28xIo",
    imageTeam: "Bosnia and Herzegovina",
  },
  {
    ep: 30,
    home: "Canada",
    away: "Qatar",
    stage: "Group B",
    score: null,
    hook: "Two World Cup hosts carry opposite curses into one game.",
    story:
      "Canada chase the lift of home soil. Qatar chase respect after hosting without the story they wanted. One host learns what the other still fears.",
    youtube: "https://www.youtube.com/watch?v=aDHiYekaNSE",
    imageTeam: "Canada",
  },
  {
    ep: 31,
    home: "Mexico",
    away: "South Korea",
    stage: "Group A",
    score: null,
    hook: "It took both of them to kill the champions.",
    story:
      "Mexico and South Korea share a strange World Cup thread: nights when giants fell and the script tore open. Now they meet with that same chaos waiting.",
    youtube: "https://www.youtube.com/watch?v=uWC0hQVGYSQ",
    imageTeam: "Mexico",
  },
  {
    ep: 32,
    home: "USA",
    away: "Australia",
    stage: "Group D",
    score: null,
    hook: "The Miracle on Grass returns when amateurs humbled the masters.",
    story:
      "The USA carry one of football's oldest shocks into a modern home game. Australia bring distance, toughness, and the refusal to be impressed by the stage.",
    youtube: "https://www.youtube.com/watch?v=6Y0tMk7FqmE",
    imageTeam: "USA",
  },
  {
    ep: 33,
    home: "Scotland",
    away: "Morocco",
    stage: "Group C",
    score: null,
    hook: "The team that never lost and still went home meets Morocco's miracle.",
    story:
      "Scotland carry the old cruelty of goal difference. Morocco carry the first African semifinal run. One team remembers being unbeaten; the other remembers being impossible.",
    youtube: "https://www.youtube.com/watch?v=VCJPzek1eQE",
    imageTeam: "Morocco",
  },
  {
    ep: 34,
    home: "Turkey",
    away: "Paraguay",
    stage: "Group D",
    score: null,
    hook: "Ten seconds, and the fastest goal in World Cup history.",
    story:
      "Turkey bring the memory of a goal that arrived before the match could breathe. Paraguay bring stubborn South American bite and a talent for ruining rhythm.",
    youtube: "https://www.youtube.com/watch?v=pfebz7jf3ts",
    imageTeam: "Paraguay",
  },
  {
    ep: 35,
    home: "Netherlands",
    away: "Sweden",
    stage: "Group F",
    score: null,
    hook: "The greatest team that never won meets Sweden's new hunger.",
    story:
      "The Netherlands carry beauty, finals, and old heartbreak. Sweden arrive with power up front and the confidence to make another elegant team feel mortal.",
    youtube: "https://www.youtube.com/watch?v=JqDq9e_khdY",
    imageTeam: "South Korea",
  },
  {
    ep: 36,
    home: "Germany",
    away: "Ivory Coast",
    stage: "Group E",
    score: null,
    hook: "The footballer who stopped a war stands against the machine.",
    story:
      "Germany bring tournament order. Ivory Coast bring a story where football once mattered beyond the scoreboard, and every orange shirt carries that memory forward.",
    youtube: "https://www.youtube.com/watch?v=ZsYk3qXKaw0",
    imageTeam: "Brazil",
  },
  {
    ep: 37,
    home: "Ecuador",
    away: "Curacao",
    stage: "Group E",
    score: null,
    hook: "The smallest nation ever at a World Cup holds a continent.",
    story:
      "Ecuador bring altitude legs and serious pressure. Curacao bring the impossible scale of their own arrival, small enough to be counted and brave enough to be feared.",
    youtube: "https://www.youtube.com/watch?v=5wMJTGeEF7E",
    imageTeam: "USA",
  },
  {
    ep: 38,
    home: "Japan",
    away: "Tunisia",
    stage: "Group F",
    score: null,
    hook: "The Samurai and the Eagle fight for one door.",
    story:
      "Japan bring the patience of a team that waits for the 91st minute. Tunisia bring desert pride and the memory of opening a door for Africa.",
    youtube: "https://www.youtube.com/watch?v=ZhZfuu3T2yc",
    imageTeam: "South Korea",
  },
  {
    ep: 39,
    home: "Spain",
    away: "Saudi Arabia",
    stage: "Group H",
    score: null,
    hook: "The ghost of 2022 returns to the scene of football's greatest shock.",
    story:
      "Spain bring the ball and the burden of control. Saudi Arabia bring the memory of the day Argentina fell, and the belief that shock can be rehearsed.",
    youtube: "https://www.youtube.com/watch?v=FGKu0WJ0lp0",
    imageTeam: "Qatar",
  },
  {
    ep: 40,
    home: "Belgium",
    away: "Iran",
    stage: "Group G",
    score: null,
    hook: "The assassin needs one chance; the architect builds a hundred.",
    story:
      "Belgium move through craft and invention. Iran wait for the one ruthless chance that turns a careful match into a knife-edge story.",
    youtube: "https://www.youtube.com/watch?v=Lt-3gH1Ssm4",
    imageTeam: "Morocco",
  },
  {
    ep: 41,
    home: "Uruguay",
    away: "Cape Verde",
    stage: "Group H",
    score: null,
    hook: "The smallest sharks bare their teeth at Uruguay.",
    story:
      "Uruguay bring old giant energy from a small population. Cape Verde answer with island defiance, proving small can mean concentrated, not weak.",
    youtube: "https://www.youtube.com/watch?v=-sHkBq0kyP8",
    imageTeam: "South Africa",
  },
  {
    ep: 42,
    home: "Egypt",
    away: "New Zealand",
    stage: "Group G",
    score: null,
    hook: "The King's last dance meets the unbeaten memory.",
    story:
      "Egypt carry Salah's final chase into a match that cannot waste chances. New Zealand bring the calm of a team that once refused to lose at all.",
    youtube: "https://www.youtube.com/watch?v=qZFXBnqxdE8",
    imageTeam: "Morocco",
  },
  {
    ep: 43,
    home: "Argentina",
    away: "Austria",
    stage: "Group J",
    score: null,
    hook: "Messi's genius meets the machine.",
    story:
      "Argentina bring one last genius chapter. Austria bring structure, old ghosts, and the machine-like patience to ask whether magic still has enough time.",
    youtube: "https://www.youtube.com/watch?v=SmHGZMbrOv4",
    imageTeam: "Argentina",
  },
];

export const YOUTUBE_LEGEND_BONUS_VIDEOS: YouTubeLegendBonusVideo[] = [
  {
    id: "bonus-lukaku-promise",
    episode: 901,
    episodeLabel: "Bonus Legend",
    title: "Lukaku: The Promise",
    subtitle: "Legend bonus card",
    teams: "Belgium",
    story:
      "A striker carries every miss, every chant, and every promise into one last Belgium chapter. This bonus card belongs to the player who keeps standing back up.",
    youtube: "https://www.youtube.com/watch?v=Yo4q-_iHoKM",
    imageTeam: "Morocco",
  },
  {
    id: "bonus-luis-diaz",
    episode: 902,
    episodeLabel: "Bonus Legend",
    title: "Luis Diaz",
    subtitle: "Legend bonus card",
    teams: "Colombia",
    story:
      "Luis Diaz plays like a storm with a smile: fearless, direct, and impossible to ignore. This bonus card turns Colombia's wing into a collectible spark.",
    youtube: "https://www.youtube.com/watch?v=3AuPzxScrac",
    imageTeam: "Canada",
  },
  {
    id: "bonus-world-cup-secrets",
    episode: 903,
    episodeLabel: "Bonus Facts",
    title: "Five World Cup Secrets",
    subtitle: "WorldCup26 facts card",
    teams: "World Cup history",
    story:
      "From the Hand of God to AI referees, this facts card gathers the strange truths that make the World Cup bigger than ninety minutes.",
    youtube: "https://www.youtube.com/watch?v=e96tg1mpKHo",
    imageTeam: "Mexico",
  },
  {
    id: "bonus-launch-film",
    episode: 904,
    episodeLabel: "Launch Film",
    title: "WorldCup26 Launch",
    subtitle: "Series launch card",
    teams: "WorldCup26 Legends",
    story:
      "The launch card opens the whole collection: nations, myths, rivalries, and a prediction game built around stories before every match.",
    youtube: "https://www.youtube.com/watch?v=NGyPLObwq4c",
    imageTeam: "USA",
  },
];

export function youtubeForEpisode(episode: number) {
  return YOUTUBE_LEGEND_EPISODES.find((prediction) => prediction.ep === episode)?.youtube ?? null;
}
