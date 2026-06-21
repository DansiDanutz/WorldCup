import type { StaticImageData } from "next/image";

import algeriaFennec from "../../content/images/Supporters/Algeria/Le-Vieux-Fennec.png";
import argentinaAbuelo from "../../content/images/Supporters/Argentina/El-Abuelo-de-la-Bombonera.png";
import brazilMystery from "../../content/images/Supporters/Brazil/Mystery-Supporter.png";
import canadaMystery from "../../content/images/Supporters/Canada/Mystery-Supporter.png";
import haitiTambouye from "../../content/images/Supporters/Haiti/Le-Tambouye-de-74.png";
import mexicoMystery from "../../content/images/Supporters/Mexico/Mystery-Supporter.png";
import qatarFalconer from "../../content/images/Supporters/Qatar/The-Falconer-of-the-Desert.png";
import southAfricaMystery from "../../content/images/Supporters/South_Africa/Mystery-Supporter.png";
import southKoreaMystery from "../../content/images/Supporters/South_Korea/Mystery-Supporter.png";
import usaMystery from "../../content/images/Supporters/USA/Mystery-Supporter.png";
import {
  LEGEND_CARD_DEFINITIONS,
  type LegendCardDefinition,
  type LegendCardKind,
  type LegendCardRarity,
} from "@/lib/legend-card-registry";

export type { LegendCardKind, LegendCardRarity };

export type LegendCard = LegendCardDefinition & {
  image: StaticImageData;
};

const legendCardImages: Record<string, StaticImageData> = {
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

export const LEGEND_CARDS: LegendCard[] = LEGEND_CARD_DEFINITIONS.map((card) => ({
  ...card,
  image: legendCardImages[card.id],
}));
