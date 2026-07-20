import assert from "node:assert/strict";
import { existsSync, readFileSync, statSync } from "node:fs";
import { describe, it } from "node:test";

import { LEGEND_CARDS } from "@/lib/legend-cards";
import { LEGEND_CARD_DEFINITIONS } from "@/lib/legend-card-registry";
import {
  findSupporterCardAsset,
  getSupporterCardImagePath,
  SUPPORTER_CARD_ASSETS,
} from "@/lib/supporter-card-assets";
import { YOUTUBE_LEGEND_EPISODES } from "@/lib/youtube-legend-episodes";

function readPngSize(filePath: string) {
  const buffer = readFileSync(filePath);

  assert.equal(buffer.toString("ascii", 1, 4), "PNG", `${filePath} is not a PNG`);

  return {
    width: buffer.readUInt32BE(16),
    height: buffer.readUInt32BE(20),
  };
}

describe("supporter card asset pack", () => {
  it("contains one generated supporter card and real short story for all 48 nations", () => {
    assert.equal(SUPPORTER_CARD_ASSETS.length, 48);
    assert.equal(new Set(SUPPORTER_CARD_ASSETS.map((asset) => asset.slug)).size, 48);
    assert.equal(new Set(SUPPORTER_CARD_ASSETS.map((asset) => asset.fileName)).size, 48);

    for (const asset of SUPPORTER_CARD_ASSETS) {
      assert.equal(asset.fileName, `${asset.slug}supporter.png`);
      assert.equal(asset.publicPath, `/supporter-cards/${asset.fileName}`);
      assert.equal(asset.downloadPath, asset.publicPath);
      assert.equal(asset.width, 1080);
      assert.equal(asset.height, 1920);
      assert.equal(asset.aspectRatio, "9:16");
      assert.match(asset.slug, /^[a-z0-9]+$/);
      assert.match(asset.mysteryPromptPath, /^content\/Supporters\/.+\/Mystery-Supporter-prompt\.md$/);
      assert.match(asset.ultraPromptPath, /^content\/Supporters\/.+\/Ultra-Fan-prompt\.md$/);
      assert.match(asset.mysteryName, /^(The|Le|El|La|A )|Oracle|Fan|Master|Prophet|Keeper|Guardian|Mystic|Sage|Ghost|Shaman/);
      assert.match(asset.mysteryConcept, /—|Mystery|mysterious|supporter|fan/i);
      assert.match(asset.ultraName, /Ultra Fan$/);
      assert.match(asset.ultraConcept, /die-hard|ultra|supporter/i);
      assert.match(asset.supporterReference, /supporter|fan|voice|hinchada|torcida|army/i);
      assert.ok(asset.story.length >= 110, `${asset.team} needs a real short story`);
      assert.ok(asset.voiceStory.length > asset.story.length, `${asset.team} needs a longer Brian voice story`);
      assert.ok(asset.voiceStory.split(/\s+/).length >= 84, `${asset.team} voice story is too short`);
      assert.ok(asset.voiceStory.split(/\s+/).length <= 110, `${asset.team} voice story is too long`);
      assert.ok(asset.ultraStory.length >= 110, `${asset.team} needs an ultra story`);
      assert.ok(asset.ultraVoiceStory.split(/\s+/).length >= 84, `${asset.team} ultra voice story is too short`);
      assert.ok(asset.ultraVoiceStory.split(/\s+/).length <= 120, `${asset.team} ultra voice story is too long`);
      assert.doesNotMatch(asset.story, /Every nation has a guardian|Mystery Supporter|generic/i);
      assert.doesNotMatch(asset.voiceStory, /Every nation has a guardian|Mystery Supporter|generic/i);
      assert.equal(asset.colors.length, 3);
      assert.match(asset.sourceNote, /content\/Supporters prompt library/i);

      const filePath = `public/supporter-cards/${asset.fileName}`;
      assert.equal(existsSync(filePath), true, `${asset.fileName} is missing`);
      assert.ok(statSync(filePath).size > 100_000, `${asset.fileName} looks too small to be an HD card image`);
      assert.deepEqual(readPngSize(filePath), { width: 1080, height: 1920 });
    }
  });

  it("maps every YouTube episode nation to a supporter asset and public image path", () => {
    const teams = new Set(YOUTUBE_LEGEND_EPISODES.flatMap((episode) => [episode.home, episode.away]));

    assert.equal(teams.size, 48);

    for (const team of teams) {
      const asset = findSupporterCardAsset(team);
      assert.ok(asset, `${team} is missing a supporter card asset`);
      assert.equal(getSupporterCardImagePath(team), asset.publicPath);
    }

    assert.equal(getSupporterCardImagePath("United States"), "/supporter-cards/usasupporter.png");
    assert.equal(getSupporterCardImagePath("Korea Republic"), "/supporter-cards/southkoreasupporter.png");
    assert.equal(getSupporterCardImagePath("Czech Republic"), "/supporter-cards/czechiasupporter.png");
    assert.equal(getSupporterCardImagePath("Congo DR"), "/supporter-cards/drcongosupporter.png");
    assert.equal(getSupporterCardImagePath("Cabo Verde"), "/supporter-cards/capeverdesupporter.png");
  });

  it("keeps supporter assets out of the collectible Legend card registry", () => {
    const supporterCards = LEGEND_CARD_DEFINITIONS.filter((card) => String(card.kind) === "supporter-card");

    assert.equal(supporterCards.length, 0);
    assert.equal(LEGEND_CARDS.some((card) => card.image.startsWith("/supporter-cards/")), false);
  });
});
