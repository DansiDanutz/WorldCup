import type { StaticImageData } from "next/image";

import algeriaFennec from "../../content/images/Supporters/Algeria/Le-Vieux-Fennec.png";
import argentinaAbuelo from "../../content/images/Supporters/Argentina/El-Abuelo-de-la-Bombonera.png";
import bosniaUltra from "../../content/images/Supporters/Bosnia_and_Herzegovina/Ultra-Fan.png";
import brazilMystery from "../../content/images/Supporters/Brazil/Mystery-Supporter.png";
import brazilUltra from "../../content/images/Supporters/Brazil/Ultra-Fan.png";
import canadaMystery from "../../content/images/Supporters/Canada/Mystery-Supporter.png";
import canadaUltra from "../../content/images/Supporters/Canada/Ultra-Fan.png";
import haitiTambouye from "../../content/images/Supporters/Haiti/Le-Tambouye-de-74.png";
import joeGaetjens from "../../content/images/Legends/Joe-Gaetjens.png";
import mexicoMystery from "../../content/images/Supporters/Mexico/Mystery-Supporter.png";
import mexicoUltra from "../../content/images/Supporters/Mexico/Ultra-Fan.png";
import moroccoUltra from "../../content/images/Supporters/Morocco/Ultra-Fan.png";
import paraguayUltra from "../../content/images/Supporters/Paraguay/Ultra-Fan.png";
import qatarFalconer from "../../content/images/Supporters/Qatar/The-Falconer-of-the-Desert.png";
import southAfricaMystery from "../../content/images/Supporters/South_Africa/Mystery-Supporter.png";
import southAfricaUltra from "../../content/images/Supporters/South_Africa/Ultra-Fan.png";
import southKoreaMystery from "../../content/images/Supporters/South_Korea/Mystery-Supporter.png";
import usaMystery from "../../content/images/Supporters/USA/Mystery-Supporter.png";
import usaUltra from "../../content/images/Supporters/USA/Ultra-Fan.png";
import {
  LEGEND_CARD_DEFINITIONS,
  type LegendCardDefinition,
  type LegendCardKind,
  type LegendCardRarity,
} from "@/lib/legend-card-registry";

export type { LegendCardKind, LegendCardRarity };

export type LegendCard = LegendCardDefinition & {
  image: StaticImageData | string;
};

const legendCardImages: Record<string, StaticImageData> = {
  "short-gaetjens-vanished": joeGaetjens,
  "ep1-azteca-warrior": mexicoMystery,
  "ep1-mandela-spirit": southAfricaMystery,
  "ep2-mystery-master": southKoreaMystery,
  "ep3-maple-leaf-man": canadaMystery,
  "ep4-liberty-fan": usaMystery,
  "ep5-feathered-prophet": brazilMystery,
  "ep6-abuelo": argentinaAbuelo,
  "ep6-vieux-fennec": algeriaFennec,
  "ep7-tambouye": haitiTambouye,
  "ep9-falconer": qatarFalconer,
};

const teamLegendImages: Record<string, StaticImageData> = {
  algeria: algeriaFennec,
  argentina: argentinaAbuelo,
  australia: canadaUltra,
  belgium: moroccoUltra,
  bosnia_and_herzegovina: bosniaUltra,
  brazil: brazilMystery,
  canada: canadaMystery,
  cape_verde: southAfricaUltra,
  colombia: canadaUltra,
  curacao: usaUltra,
  czechia: southKoreaMystery,
  dr_congo: southAfricaUltra,
  ecuador: brazilUltra,
  egypt: qatarFalconer,
  england: usaMystery,
  france: moroccoUltra,
  germany: usaUltra,
  ghana: southAfricaUltra,
  haiti: haitiTambouye,
  iran: qatarFalconer,
  iraq: qatarFalconer,
  ivory_coast: brazilUltra,
  japan: southKoreaMystery,
  jordan: qatarFalconer,
  mexico: mexicoMystery,
  morocco: moroccoUltra,
  netherlands: usaUltra,
  new_zealand: canadaUltra,
  norway: usaUltra,
  panama: southAfricaUltra,
  paraguay: paraguayUltra,
  portugal: brazilUltra,
  qatar: qatarFalconer,
  saudi_arabia: qatarFalconer,
  scotland: usaMystery,
  senegal: moroccoUltra,
  south_africa: southAfricaMystery,
  south_korea: southKoreaMystery,
  spain: mexicoUltra,
  sweden: canadaUltra,
  switzerland: usaUltra,
  tunisia: moroccoUltra,
  turkey: paraguayUltra,
  uruguay: brazilUltra,
  usa: usaMystery,
  uzbekistan: qatarFalconer,
  world_cup_history: mexicoUltra,
  worldcup26_legends: usaUltra,
};

function imageKey(value: string) {
  return value
    .toLowerCase()
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "");
}

function resolveLegendCardImage(card: LegendCardDefinition) {
  if (legendCardImages[card.id]) {
    return legendCardImages[card.id];
  }

  if (card.imageTeam) {
    const teamImage = teamLegendImages[imageKey(card.imageTeam)];
    if (teamImage) {
      return teamImage;
    }
  }

  return "/hero-matchup.png";
}

export const LEGEND_CARDS: LegendCard[] = LEGEND_CARD_DEFINITIONS.map((card) => ({
  ...card,
  image: resolveLegendCardImage(card),
}));
