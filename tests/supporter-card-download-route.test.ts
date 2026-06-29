import assert from "node:assert/strict";
import { statSync } from "node:fs";
import { describe, it } from "node:test";

import { GET } from "@/app/api/supporter-cards/download/[fileName]/route";

function createContext(fileName: string) {
  return {
    params: Promise.resolve({ fileName }),
  };
}

describe("supporter card download route", () => {
  it("serves manifest-owned HD supporter cards as attachments", async () => {
    const response = await GET(new Request("http://localhost/api/supporter-cards/download/usasupporter.png"), createContext("usasupporter.png"));
    const body = Buffer.from(await response.arrayBuffer());

    assert.equal(response.status, 200);
    assert.equal(response.headers.get("content-type"), "image/png");
    assert.equal(response.headers.get("x-content-type-options"), "nosniff");
    assert.match(response.headers.get("content-disposition") ?? "", /attachment; filename="usasupporter\.png"/);
    assert.equal(Number(response.headers.get("content-length")), statSync("public/supporter-cards/usasupporter.png").size);
    assert.equal(body.toString("ascii", 1, 4), "PNG");
    assert.equal(body.readUInt32BE(16), 1080);
    assert.equal(body.readUInt32BE(20), 1920);
  });

  it("rejects files that are not in the supporter card manifest", async () => {
    const response = await GET(
      new Request("http://localhost/api/supporter-cards/download/../hero-matchup.png"),
      createContext("../hero-matchup.png"),
    );

    assert.equal(response.status, 404);
    assert.deepEqual(await response.json(), { error: "Supporter wallpaper not found." });
  });
});
