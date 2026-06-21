import { PREDICTIONS } from "@/lib/predictions";

export type LegendCardKind = "episode-special" | "legend-bonus";
export type LegendCardRarity = "Story" | "Rare" | "Legendary";

export type LegendCardDefinition = {
  id: string;
  episode: number;
  kind: LegendCardKind;
  title: string;
  subtitle: string;
  teams: string;
  rarity: LegendCardRarity;
  story: string;
  youtube: string | null;
};

function youtubeForEpisode(episode: number) {
  return PREDICTIONS.find((prediction) => prediction.ep === episode)?.youtube ?? null;
}

export const LEGEND_CARD_DEFINITIONS: LegendCardDefinition[] = [
  {
    id: "ep1-azteca-warrior",
    episode: 1,
    kind: "episode-special",
    title: "The Azteca Warrior",
    subtitle: "Episode 1 special card",
    teams: "Mexico vs South Africa",
    rarity: "Legendary",
    story:
      "A guardian of the opening night watches the Azteca lights and waits for Mexico to write a new first chapter.",
    youtube: youtubeForEpisode(1),
  },
  {
    id: "ep1-mandela-spirit",
    episode: 1,
    kind: "legend-bonus",
    title: "Mandela Spirit",
    subtitle: "Legend bonus card",
    teams: "Mexico vs South Africa",
    rarity: "Legendary",
    story:
      "The memory of 2010 follows South Africa into the tunnel: joy, defiance, and the sound of a nation refusing to be small.",
    youtube: youtubeForEpisode(1),
  },
  {
    id: "ep2-mystery-master",
    episode: 2,
    kind: "episode-special",
    title: "The Mystery Master",
    subtitle: "Episode 2 special card",
    teams: "South Korea vs Czech Republic",
    rarity: "Rare",
    story:
      "A masked strategist studies every passing lane, waiting for Son's last dance to become one clean finish.",
    youtube: youtubeForEpisode(2),
  },
  {
    id: "ep3-maple-leaf-man",
    episode: 3,
    kind: "episode-special",
    title: "The Maple Leaf Man",
    subtitle: "Episode 3 special card",
    teams: "Canada vs Bosnia & Herzegovina",
    rarity: "Rare",
    story:
      "Toronto holds its breath as the Maple Leaf Man turns a home crowd into a wall of red before the first whistle.",
    youtube: youtubeForEpisode(3),
  },
  {
    id: "ep4-liberty-fan",
    episode: 4,
    kind: "episode-special",
    title: "The Liberty Fan",
    subtitle: "Episode 4 special card",
    teams: "USA vs Paraguay",
    rarity: "Story",
    story:
      "The Liberty Fan carries the old 1930 rematch into a modern stadium, where one long-range strike can change the night.",
    youtube: youtubeForEpisode(4),
  },
  {
    id: "ep5-feathered-prophet",
    episode: 5,
    kind: "episode-special",
    title: "The Feathered Prophet",
    subtitle: "Episode 5 special card",
    teams: "Brazil vs Morocco",
    rarity: "Rare",
    story:
      "A quiet omen follows Brazil's yellow shirts, whispering that revenge is never clean when Morocco is waiting.",
    youtube: youtubeForEpisode(5),
  },
  {
    id: "ep6-abuelo",
    episode: 6,
    kind: "legend-bonus",
    title: "El Abuelo de la Bombonera",
    subtitle: "Legend bonus card",
    teams: "Argentina vs Algeria",
    rarity: "Legendary",
    story:
      "The old voice from Buenos Aires remembers every miracle and every heartbreak, then leans forward for one more Messi night.",
    youtube: youtubeForEpisode(6),
  },
  {
    id: "ep6-vieux-fennec",
    episode: 6,
    kind: "legend-bonus",
    title: "Le Vieux Fennec",
    subtitle: "Legend bonus card",
    teams: "Argentina vs Algeria",
    rarity: "Legendary",
    story:
      "The desert fox has seen giants fall before; he waits for the match to ask whether Algeria can steal one last shadow.",
    youtube: youtubeForEpisode(6),
  },
  {
    id: "ep7-tambouye",
    episode: 7,
    kind: "legend-bonus",
    title: "Le Tambouye de 74",
    subtitle: "Legend bonus card",
    teams: "Brazil vs Haiti",
    rarity: "Legendary",
    story:
      "The drumbeat of 1974 returns through Haiti's stands, turning one impossible reply into a card worth collecting.",
    youtube: youtubeForEpisode(7),
  },
  {
    id: "ep9-falconer",
    episode: 9,
    kind: "legend-bonus",
    title: "The Falconer of the Desert",
    subtitle: "Legend bonus card",
    teams: "Qatar vs Switzerland",
    rarity: "Rare",
    story:
      "Above the desert trap, the Falconer reads the wind before the ball arrives and knows when patience becomes danger.",
    youtube: youtubeForEpisode(9),
  },
];

export const LEGEND_CARD_IDS = new Set(LEGEND_CARD_DEFINITIONS.map((card) => card.id));

export function findLegendCardDefinition(cardId: string) {
  return LEGEND_CARD_DEFINITIONS.find((card) => card.id === cardId) ?? null;
}

export function isUnlockableLegendCard(cardId: string) {
  const card = findLegendCardDefinition(cardId);

  return Boolean(card?.youtube);
}
