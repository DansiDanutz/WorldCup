#!/usr/bin/env node
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const referralCode = "26BC4B90CB";
const referralUrl = "worldcup26.world/login?ref=26BC4B90CB";

const variants = [
  { name: "worldcup26-referral-16x9.jpg", width: 1920, height: 1080, mode: "wide" },
  { name: "worldcup26-referral-square.jpg", width: 1080, height: 1080, mode: "square" },
  { name: "worldcup26-referral-story.jpg", width: 1080, height: 1920, mode: "story" },
];

for (const variant of variants) {
  const svg = renderSvg(variant);
  const buffer = await sharp(Buffer.from(svg)).jpeg({ quality: 92, mozjpeg: true }).toBuffer();
  await writeBoth(variant.name, buffer);
}

async function writeBoth(name, buffer) {
  for (const folder of ["assets", "media"]) {
    const targetDir = path.join(__dirname, folder);
    await mkdir(targetDir, { recursive: true });
    await writeFile(path.join(targetDir, name), buffer);
  }
}

function renderSvg({ width, height, mode }) {
  const isStory = mode === "story";
  const isSquare = mode === "square";
  const pad = isStory ? 84 : isSquare ? 70 : 92;
  const titleSize = isStory ? 108 : isSquare ? 78 : 92;
  const subSize = isStory ? 50 : isSquare ? 38 : 44;
  const codeSize = isStory ? 70 : isSquare ? 55 : 62;
  const cardY = isStory ? 1010 : isSquare ? 590 : 620;
  const cardH = isStory ? 530 : isSquare ? 340 : 310;
  const titleY = isStory ? 330 : isSquare ? 240 : 250;
  const titleLines = isStory
    ? ["Pick 3 teams", "for free."]
    : isSquare
      ? ["Pick 3 teams", "free first."]
      : ["Pick 3 teams free first."];
  const subtitleLines = isStory
    ? ["See your private points preview.", "Use a ticket only for the paid leaderboard."]
    : ["Private points preview first.", "Paid leaderboard only with a ticket."];
  const fieldOpacity = isStory ? "0.18" : "0.14";
  const players = isStory ? renderPlayerBand(width, 720, 270, 0.3) : renderPlayerBand(width, 360, 190, 0.26);

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" fill="none" xmlns="http://www.w3.org/2000/svg">
  <rect width="${width}" height="${height}" fill="#001b13"/>
  <defs>
    <radialGradient id="goldGlow" cx="0" cy="0" r="1" gradientUnits="userSpaceOnUse" gradientTransform="translate(${width * 0.78} ${height * 0.18}) rotate(120) scale(${width * 0.62})">
      <stop stop-color="#ffd36a" stop-opacity="0.35"/>
      <stop offset="1" stop-color="#ffd36a" stop-opacity="0"/>
    </radialGradient>
    <radialGradient id="mintGlow" cx="0" cy="0" r="1" gradientUnits="userSpaceOnUse" gradientTransform="translate(${width * 0.2} ${height * 0.16}) rotate(40) scale(${width * 0.55})">
      <stop stop-color="#4be0a3" stop-opacity="0.32"/>
      <stop offset="1" stop-color="#4be0a3" stop-opacity="0"/>
    </radialGradient>
    <linearGradient id="card" x1="${pad}" y1="${cardY}" x2="${width - pad}" y2="${cardY + cardH}" gradientUnits="userSpaceOnUse">
      <stop stop-color="#0a4d39"/>
      <stop offset="1" stop-color="#105f48"/>
    </linearGradient>
  </defs>
  <rect width="${width}" height="${height}" fill="url(#goldGlow)"/>
  <rect width="${width}" height="${height}" fill="url(#mintGlow)"/>
  <g opacity="${fieldOpacity}" stroke="#e8fff4" stroke-width="${Math.max(3, Math.round(width / 360))}">
    <path d="M${pad} ${height * 0.18}H${width - pad}V${height * 0.82}H${pad}Z"/>
    <path d="M${width / 2} ${height * 0.18}V${height * 0.82}"/>
    <circle cx="${width / 2}" cy="${height / 2}" r="${Math.min(width, height) * 0.145}"/>
  </g>
  ${players}
  <text x="${pad}" y="${pad + 12}" fill="#84f0bb" font-family="Inter, Arial, sans-serif" font-size="${isStory ? 32 : 28}" font-weight="800" letter-spacing="4">WORLDCUP26 INVITE</text>
  ${renderTextLines(titleLines, pad, titleY, titleSize, titleSize * 1.04, "#fffaf0", 900)}
  ${renderTextLines(subtitleLines, pad, titleY + titleLines.length * titleSize * 1.12 + 24, subSize, subSize * 1.34, "#cceadd", 700)}
  <g transform="translate(${pad} ${cardY})">
    <rect width="${width - pad * 2}" height="${cardH}" rx="${isStory ? 34 : 28}" fill="url(#card)" stroke="#f8d87c" stroke-width="${isStory ? 4 : 3}"/>
    <text x="${isStory ? 48 : 40}" y="${isStory ? 80 : 62}" fill="#84f0bb" font-family="Inter, Arial, sans-serif" font-size="${isStory ? 31 : 27}" font-weight="900" letter-spacing="2">USE REFERRAL CODE</text>
    <text x="${isStory ? 48 : 40}" y="${isStory ? 174 : 145}" fill="#ffe28a" font-family="Inter, Arial, sans-serif" font-size="${codeSize}" font-weight="950" letter-spacing="${isStory ? 3 : 2}">${referralCode}</text>
    <rect x="${isStory ? 48 : 40}" y="${isStory ? 230 : 190}" width="${width - pad * 2 - (isStory ? 96 : 80)}" height="${isStory ? 126 : 84}" rx="${isStory ? 24 : 18}" fill="#e8fff4" fill-opacity="0.13" stroke="#e8fff4" stroke-opacity="0.32"/>
    <text x="${isStory ? 78 : 66}" y="${isStory ? 306 : 244}" fill="#ffffff" font-family="Inter, Arial, sans-serif" font-size="${isStory ? 33 : isSquare ? 27 : 30}" font-weight="800">${referralUrl}</text>
    <text x="${isStory ? 48 : 40}" y="${cardH - (isStory ? 56 : 36)}" fill="#d5f5e9" font-family="Inter, Arial, sans-serif" font-size="${isStory ? 28 : 23}" font-weight="700">All 48 teams are still available before kickoff.</text>
  </g>
</svg>`;
}

function renderTextLines(lines, x, y, size, lineHeight, fill, weight) {
  return lines
    .map(
      (line, index) =>
        `<text x="${x}" y="${y + index * lineHeight}" fill="${fill}" font-family="Inter, Arial, sans-serif" font-size="${size}" font-weight="${weight}">${escapeXml(line)}</text>`,
    )
    .join("\n  ");
}

function renderPlayerBand(width, y, height, opacity) {
  const players = Array.from({ length: 7 }, (_, index) => {
    const x = width * (0.08 + index * 0.14);
    const scale = 0.78 + (index % 3) * 0.1;
    const color = index % 3 === 0 ? "#f8d87c" : index % 3 === 1 ? "#84f0bb" : "#ffffff";
    return `
    <g transform="translate(${x} ${y + (index % 2) * 18}) scale(${scale})" opacity="${opacity}">
      <circle cx="34" cy="22" r="20" fill="${color}"/>
      <path d="M18 54h32l18 96H0l18-96Z" fill="${color}"/>
      <path d="M17 70l-44 44" stroke="${color}" stroke-width="14" stroke-linecap="round"/>
      <path d="M52 70l44 34" stroke="${color}" stroke-width="14" stroke-linecap="round"/>
      <path d="M22 148l-16 78" stroke="${color}" stroke-width="16" stroke-linecap="round"/>
      <path d="M48 148l36 72" stroke="${color}" stroke-width="16" stroke-linecap="round"/>
    </g>`;
  }).join("");
  return `<g>${players}<rect x="0" y="${y + height * 0.7}" width="${width}" height="${height * 0.4}" fill="#001b13" opacity="0.45"/></g>`;
}

function escapeXml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}
