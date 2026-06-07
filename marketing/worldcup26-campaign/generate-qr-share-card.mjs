#!/usr/bin/env node
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const referralCode = "26BC4B90CB";
const referralLink = "https://worldcup26.world/login?ref=26BC4B90CB";
const displayLink = "worldcup26.world/login?ref=26BC4B90CB";
const qrUrl = `https://quickchart.io/qr?text=${encodeURIComponent(referralLink)}&size=720&margin=2&ecLevel=M&format=png`;

const variants = [
  { name: "worldcup26-qr-square.jpg", width: 1080, height: 1080, mode: "square" },
  { name: "worldcup26-qr-story.jpg", width: 1080, height: 1920, mode: "story" },
];

const qrPng = await fetchQrPng();
await writeBoth("worldcup26-referral-qr.png", qrPng);

for (const variant of variants) {
  const svg = renderSvg(variant, qrPng.toString("base64"));
  const buffer = await sharp(Buffer.from(svg)).jpeg({ quality: 93, mozjpeg: true }).toBuffer();
  await writeBoth(variant.name, buffer);
}

process.stdout.write(
  [
    "WorldCup26 QR share cards ready",
    `Referral: ${referralLink}`,
    "Outputs:",
    "  media/worldcup26-referral-qr.png",
    "  media/worldcup26-qr-square.jpg",
    "  media/worldcup26-qr-story.jpg",
    "",
  ].join("\n"),
);

async function fetchQrPng() {
  const response = await fetch(qrUrl, {
    headers: { "user-agent": "WorldCup26-campaign-asset-generator/1.0" },
  });
  if (!response.ok) {
    throw new Error(`QR request failed: ${response.status} ${response.statusText}`);
  }
  const bytes = Buffer.from(await response.arrayBuffer());
  const metadata = await sharp(bytes).metadata();
  if (metadata.format !== "png" || metadata.width < 300 || metadata.height < 300) {
    throw new Error(`QR response was not a usable PNG: ${JSON.stringify(metadata)}`);
  }
  return bytes;
}

async function writeBoth(name, buffer) {
  for (const folder of ["assets", "media"]) {
    const targetDir = path.join(__dirname, folder);
    await mkdir(targetDir, { recursive: true });
    await writeFile(path.join(targetDir, name), buffer);
  }
}

function renderSvg({ width, height, mode }, qrBase64) {
  const isStory = mode === "story";
  const pad = isStory ? 74 : 64;
  const titleY = isStory ? 260 : 138;
  const titleSize = isStory ? 92 : 60;
  const subSize = isStory ? 38 : 26;
  const qrSize = isStory ? 620 : 390;
  const qrX = (width - qrSize) / 2;
  const qrY = isStory ? 720 : 350;
  const codeY = qrY + qrSize + (isStory ? 96 : 64);
  const footerY = height - (isStory ? 170 : 92);

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" fill="none" xmlns="http://www.w3.org/2000/svg">
  <rect width="${width}" height="${height}" fill="#001b13"/>
  <defs>
    <radialGradient id="goldGlow" cx="0" cy="0" r="1" gradientUnits="userSpaceOnUse" gradientTransform="translate(${width * 0.82} ${height * 0.12}) rotate(120) scale(${width * 0.74})">
      <stop stop-color="#ffd36a" stop-opacity="0.36"/>
      <stop offset="1" stop-color="#ffd36a" stop-opacity="0"/>
    </radialGradient>
    <radialGradient id="mintGlow" cx="0" cy="0" r="1" gradientUnits="userSpaceOnUse" gradientTransform="translate(${width * 0.16} ${height * 0.08}) rotate(35) scale(${width * 0.66})">
      <stop stop-color="#4be0a3" stop-opacity="0.34"/>
      <stop offset="1" stop-color="#4be0a3" stop-opacity="0"/>
    </radialGradient>
    <linearGradient id="panel" x1="${pad}" y1="${qrY - 52}" x2="${width - pad}" y2="${codeY + 92}" gradientUnits="userSpaceOnUse">
      <stop stop-color="#0a4d39"/>
      <stop offset="1" stop-color="#105f48"/>
    </linearGradient>
  </defs>
  <rect width="${width}" height="${height}" fill="url(#goldGlow)"/>
  <rect width="${width}" height="${height}" fill="url(#mintGlow)"/>
  ${renderField(width, height, pad)}
  ${renderPlayerBand(width, isStory ? 440 : 252, isStory ? 180 : 126)}
  <text x="${pad}" y="${pad}" fill="#84f0bb" font-family="Inter, Arial, sans-serif" font-size="${isStory ? 32 : 26}" font-weight="900" letter-spacing="4">WORLDCUP26 INVITE</text>
  <text x="${pad}" y="${titleY}" fill="#fffaf0" font-family="Inter, Arial, sans-serif" font-size="${titleSize}" font-weight="950">Scan to join</text>
  <text x="${pad}" y="${titleY + titleSize * 1.1}" fill="#fffaf0" font-family="Inter, Arial, sans-serif" font-size="${titleSize}" font-weight="950">and pick 3 teams</text>
  <text x="${pad}" y="${titleY + titleSize * 2.05}" fill="#cceadd" font-family="Inter, Arial, sans-serif" font-size="${subSize}" font-weight="760">Free private points preview first.</text>
  <text x="${pad}" y="${titleY + titleSize * 2.55}" fill="#cceadd" font-family="Inter, Arial, sans-serif" font-size="${subSize}" font-weight="760">Paid leaderboard only when you use a ticket.</text>
  <rect x="${pad}" y="${qrY - 52}" width="${width - pad * 2}" height="${codeY + (isStory ? 148 : 122) - (qrY - 52)}" rx="${isStory ? 36 : 28}" fill="url(#panel)" stroke="#f8d87c" stroke-width="4"/>
  <rect x="${qrX - 26}" y="${qrY - 26}" width="${qrSize + 52}" height="${qrSize + 52}" rx="${isStory ? 34 : 28}" fill="#fffaf0"/>
  <image href="data:image/png;base64,${qrBase64}" x="${qrX}" y="${qrY}" width="${qrSize}" height="${qrSize}"/>
  <text x="${pad + 38}" y="${codeY}" fill="#84f0bb" font-family="Inter, Arial, sans-serif" font-size="${isStory ? 31 : 25}" font-weight="900" letter-spacing="2">REFERRAL CODE</text>
  <text x="${pad + 38}" y="${codeY + (isStory ? 76 : 60)}" fill="#ffe28a" font-family="Inter, Arial, sans-serif" font-size="${isStory ? 64 : 48}" font-weight="950" letter-spacing="2">${referralCode}</text>
  <text x="${pad}" y="${footerY}" fill="#f7fff9" font-family="Inter, Arial, sans-serif" font-size="${isStory ? 36 : 28}" font-weight="850">${displayLink}</text>
  <text x="${pad}" y="${footerY + (isStory ? 54 : 40)}" fill="#d5f5e9" font-family="Inter, Arial, sans-serif" font-size="${isStory ? 28 : 22}" font-weight="720">All 48 teams are still available before kickoff.</text>
</svg>`;
}

function renderField(width, height, pad) {
  return `<g opacity="0.14" stroke="#e8fff4" stroke-width="4">
    <path d="M${pad} ${height * 0.2}H${width - pad}V${height * 0.82}H${pad}Z"/>
    <path d="M${width / 2} ${height * 0.2}V${height * 0.82}"/>
    <circle cx="${width / 2}" cy="${height * 0.51}" r="${Math.min(width, height) * 0.145}"/>
  </g>`;
}

function renderPlayerBand(width, y, height) {
  const players = Array.from({ length: 7 }, (_, index) => {
    const x = width * (0.08 + index * 0.14);
    const scale = 0.66 + (index % 3) * 0.08;
    const color = index % 3 === 0 ? "#f8d87c" : index % 3 === 1 ? "#84f0bb" : "#ffffff";
    return `<g transform="translate(${x} ${y + (index % 2) * 14}) scale(${scale})" opacity="0.2">
      <circle cx="34" cy="22" r="20" fill="${color}"/>
      <path d="M18 54h32l18 96H0l18-96Z" fill="${color}"/>
      <path d="M17 70l-44 44" stroke="${color}" stroke-width="14" stroke-linecap="round"/>
      <path d="M52 70l44 34" stroke="${color}" stroke-width="14" stroke-linecap="round"/>
      <path d="M22 148l-16 78" stroke="${color}" stroke-width="16" stroke-linecap="round"/>
      <path d="M48 148l36 72" stroke="${color}" stroke-width="16" stroke-linecap="round"/>
    </g>`;
  }).join("");
  return `<g>${players}<rect x="0" y="${y + height * 0.7}" width="${width}" height="${height * 0.45}" fill="#001b13" opacity="0.45"/></g>`;
}
