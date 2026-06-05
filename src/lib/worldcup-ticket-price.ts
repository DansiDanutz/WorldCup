export const DEFAULT_WORLDCUP_TICKET_PRICE_AMOUNT = "50.00";
export const DEFAULT_WORLDCUP_TICKET_PRICE_USD = 50;

export function normalizeWorldCupTicketPriceAmount(value: unknown) {
  const parsed = Number(value);

  if (!Number.isFinite(parsed) || parsed <= 0) {
    return DEFAULT_WORLDCUP_TICKET_PRICE_AMOUNT;
  }

  return parsed.toFixed(2);
}

export function normalizeWorldCupTicketPriceNumber(value: unknown) {
  return Number(normalizeWorldCupTicketPriceAmount(value));
}
