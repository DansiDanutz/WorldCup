export const PRIZE_POOL_FEE_PERCENT = 20;

export function calculateNetPrizePool(
  grossAmount: string | number | null | undefined,
  feePercent: string | number = PRIZE_POOL_FEE_PERCENT,
) {
  const gross = Number(grossAmount ?? 0);
  const fee = Number(feePercent);

  if (!Number.isFinite(gross) || gross <= 0) {
    return 0;
  }

  if (!Number.isFinite(fee) || fee < 0 || fee >= 100) {
    return gross;
  }

  return gross * (1 - fee / 100);
}

export function formatPrizeAmount(value: string | number) {
  return new Intl.NumberFormat("en", {
    maximumFractionDigits: 0,
    minimumFractionDigits: 0,
  }).format(Number(value));
}
