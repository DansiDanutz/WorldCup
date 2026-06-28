export const LEGEND_CARD_IMAGE_ASSETS: Record<string, string> = {
  "short-gaetjens-vanished": "/legend-cards/did-you-know/01-gaetjens-the-vanished-hero.png",
  "short-garrincha-broken-magic": "/legend-cards/did-you-know/02-garrincha-the-joy-of-the-people.png",
  "short-carbajal-five-world-cups": "/legend-cards/did-you-know/03-carbajal-the-eternal-keeper.png",
  "short-socrates-sunday": "/legend-cards/did-you-know/04-socrates-the-doctor.png",
  "short-milla-dancing-lion": "/legend-cards/did-you-know/05-milla-the-dancing-lion.png",
  "short-laurent-first-goal": "/legend-cards/did-you-know/06-laurent-the-first-goal.png",
  "short-escobar-gentleman": "/legend-cards/did-you-know/07-escobar-the-gentleman.png",
  "short-yashin-black-spider": "/legend-cards/did-you-know/08-yashin-the-black-spider.png",
  "short-monti-two-nations": "/legend-cards/did-you-know/09-monti-two-nations.png",
  "short-tostao-eyes-champion": "/legend-cards/did-you-know/10-tostao-eyes-of-a-champion.png",
  "bonus-lukaku-promise": "/legend-cards/bonus/lukaku-the-promise.png",
  "bonus-luis-diaz": "/legend-cards/bonus/luis-diaz.png",
  "bonus-world-cup-secrets": "/legend-cards/bonus/world-cup-monopoly.png",
};

export function getLegendCardAssetImagePath(cardId: string) {
  return LEGEND_CARD_IMAGE_ASSETS[cardId] ?? null;
}
