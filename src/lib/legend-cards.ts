import {
  LEGEND_CARD_DEFINITIONS,
  type LegendCardDefinition,
  type LegendCardKind,
  type LegendCardRarity,
} from "@/lib/legend-card-registry";
import { getLegendCardAssetImagePath } from "@/lib/legend-card-image-assets";
import { getSupporterCardImagePath } from "@/lib/supporter-card-assets";

export type { LegendCardKind, LegendCardRarity };

export type LegendCard = LegendCardDefinition & {
  image: string;
};

function hashCardValue(value: string) {
  let hash = 0;

  for (let index = 0; index < value.length; index += 1) {
    hash = (hash * 31 + value.charCodeAt(index)) >>> 0;
  }

  return hash;
}

function escapeSvgText(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function splitSvgLines(value: string, maxLineLength: number, maxLines: number) {
  const words = value.split(/\s+/).filter(Boolean);
  const lines: string[] = [];
  let currentLine = "";

  for (const word of words) {
    const nextLine = currentLine ? `${currentLine} ${word}` : word;

    if (nextLine.length > maxLineLength && currentLine) {
      lines.push(currentLine);
      currentLine = word;
    } else {
      currentLine = nextLine;
    }

    if (lines.length === maxLines) {
      break;
    }
  }

  if (currentLine && lines.length < maxLines) {
    lines.push(currentLine);
  }

  if (lines.length === maxLines && words.join(" ").length > lines.join(" ").length) {
    lines[maxLines - 1] = `${lines[maxLines - 1].replace(/[.,;:!?-]+$/, "")}...`;
  }

  return lines.map(escapeSvgText);
}

function createTextBlock(lines: string[], x: number, y: number, lineHeight: number) {
  return lines
    .map((line, index) => `<text x="${x}" y="${y + index * lineHeight}">${line}</text>`)
    .join("");
}

function createGeneratedLegendCardImage(card: LegendCardDefinition) {
  const hash = hashCardValue(card.id);
  const hue = hash % 360;
  const background = `hsl(${hue} 56% 14%)`;
  const accent = `hsl(${(hue + 44) % 360} 84% 62%)`;
  const secondary = `hsl(${(hue + 156) % 360} 80% 58%)`;
  const gold = `hsl(${(hue + 88) % 360} 92% 72%)`;
  const label = card.kind === "did-you-know-short" ? "Did You Know" : card.episodeLabel ?? `Episode ${card.episode}`;
  const titleLines = splitSvgLines(card.title, 17, 4);
  const teamLines = splitSvgLines(card.teams, 22, 2);
  const number = String(card.episode).padStart(2, "0");
  const ringOffset = hash % 180;
  const slashOffset = 140 + (hash % 420);

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="1080" height="1920" viewBox="0 0 1080 1920">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="${background}"/>
      <stop offset="0.55" stop-color="#06110f"/>
      <stop offset="1" stop-color="#020706"/>
    </linearGradient>
    <radialGradient id="shine" cx="50%" cy="18%" r="70%">
      <stop offset="0" stop-color="${accent}" stop-opacity="0.45"/>
      <stop offset="0.48" stop-color="${accent}" stop-opacity="0.08"/>
      <stop offset="1" stop-color="${accent}" stop-opacity="0"/>
    </radialGradient>
    <filter id="shadow" x="-30%" y="-30%" width="160%" height="160%">
      <feDropShadow dx="0" dy="28" stdDeviation="24" flood-color="#000" flood-opacity="0.38"/>
    </filter>
  </defs>
  <rect width="1080" height="1920" rx="72" fill="url(#bg)"/>
  <rect x="42" y="42" width="996" height="1836" rx="56" fill="none" stroke="${gold}" stroke-opacity="0.82" stroke-width="6"/>
  <rect x="82" y="82" width="916" height="1756" rx="44" fill="none" stroke="#fff" stroke-opacity="0.12" stroke-width="3"/>
  <circle cx="${260 + (hash % 560)}" cy="${310 + (hash % 220)}" r="360" fill="url(#shine)"/>
  <path d="M-${slashOffset} 410 L${slashOffset + 420} 40 L${slashOffset + 570} 40 L${slashOffset} 520 Z" fill="${secondary}" opacity="0.24"/>
  <path d="M${1080 - slashOffset} 1060 L${1500 - slashOffset} 660 L${1640 - slashOffset} 660 L${1210 - slashOffset} 1140 Z" fill="${accent}" opacity="0.18"/>
  <circle cx="540" cy="690" r="312" fill="none" stroke="${accent}" stroke-opacity="0.24" stroke-width="28" stroke-dasharray="48 26" stroke-dashoffset="${ringOffset}"/>
  <circle cx="540" cy="690" r="220" fill="${accent}" opacity="0.18"/>
  <text x="540" y="820" fill="#fff" opacity="0.13" font-family="Inter, Arial, sans-serif" font-size="390" font-weight="950" text-anchor="middle">${escapeSvgText(number)}</text>
  <path d="M256 774 C354 590, 470 570, 540 678 C610 570, 726 590, 824 774 C738 736, 654 740, 540 820 C426 740, 342 736, 256 774 Z" fill="${gold}" opacity="0.94" filter="url(#shadow)"/>
  <path d="M320 1050 H760" stroke="${accent}" stroke-width="14" stroke-linecap="round" opacity="0.8"/>
  <path d="M260 1110 H820" stroke="${gold}" stroke-width="5" stroke-linecap="round" opacity="0.72"/>
  <text x="92" y="168" fill="${gold}" font-family="Inter, Arial, sans-serif" font-size="42" font-weight="900" letter-spacing="4">${escapeSvgText(label.toUpperCase())}</text>
  <text x="870" y="168" fill="#fff" font-family="Inter, Arial, sans-serif" font-size="46" font-weight="900" text-anchor="end">#${escapeSvgText(number)}</text>
  <g fill="#fff" font-family="Inter, Arial, sans-serif" font-size="104" font-weight="950" letter-spacing="0">
    ${createTextBlock(titleLines, 92, 1260, 118)}
  </g>
  <g fill="${accent}" font-family="Inter, Arial, sans-serif" font-size="48" font-weight="850">
    ${createTextBlock(teamLines, 92, 1692, 60)}
  </g>
  <text x="92" y="1810" fill="${gold}" font-family="Inter, Arial, sans-serif" font-size="38" font-weight="900">${escapeSvgText(card.rarity.toUpperCase())}</text>
  <text x="988" y="1810" fill="#fff" opacity="0.72" font-family="Inter, Arial, sans-serif" font-size="30" font-weight="800" text-anchor="end">WORLDCUP26</text>
</svg>`;

  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
}

function resolveLegendCardImage(card: LegendCardDefinition) {
  const assetImage = getLegendCardAssetImagePath(card);

  if (assetImage) {
    return assetImage;
  }

  if (card.kind === "supporter-card") {
    const supporterImage = getSupporterCardImagePath(card.imageTeam ?? card.teams);

    if (supporterImage) {
      return supporterImage;
    }
  }

  return createGeneratedLegendCardImage(card);
}

export const LEGEND_CARDS: LegendCard[] = LEGEND_CARD_DEFINITIONS.map((card) => ({
  ...card,
  image: resolveLegendCardImage(card),
}));
