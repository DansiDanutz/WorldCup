import { readFile } from "node:fs/promises";
import path from "node:path";

import { NextResponse } from "next/server";

import { SUPPORTER_CARD_ASSETS } from "@/lib/supporter-card-assets";

export const runtime = "nodejs";

const supporterCardAssetByFileName = new Map(
  SUPPORTER_CARD_ASSETS.map((asset) => [asset.fileName, asset]),
);

function getAttachmentHeader(fileName: string) {
  const safeFileName = fileName.replace(/"/g, "");

  return `attachment; filename="${safeFileName}"; filename*=UTF-8''${encodeURIComponent(safeFileName)}`;
}

export async function GET(
  _request: Request,
  context: { params: Promise<{ fileName: string }> },
) {
  const { fileName } = await context.params;
  const asset = supporterCardAssetByFileName.get(fileName);

  if (!asset) {
    return NextResponse.json({ error: "Supporter wallpaper not found." }, { status: 404 });
  }

  try {
    const filePath = path.join(process.cwd(), "public", "supporter-cards", asset.fileName);
    const file = await readFile(filePath);

    return new NextResponse(new Uint8Array(file), {
      headers: {
        "Cache-Control": "public, max-age=31536000, immutable",
        "Content-Disposition": getAttachmentHeader(asset.fileName),
        "Content-Length": String(file.byteLength),
        "Content-Type": "image/png",
        "X-Content-Type-Options": "nosniff",
      },
    });
  } catch {
    return NextResponse.json({ error: "Supporter wallpaper unavailable." }, { status: 500 });
  }
}
