export function normalizeMoneyAmount(value: string | number | null | undefined) {
  const amount = Number(value ?? 0);

  if (!Number.isFinite(amount)) {
    return 0;
  }

  return Math.round(amount * 100) / 100;
}

export function formatMoneyAmount(value: string | number | null | undefined) {
  return new Intl.NumberFormat("en", {
    maximumFractionDigits: 2,
    minimumFractionDigits: 2,
  }).format(normalizeMoneyAmount(value));
}

export function calculateWalletBalance(
  userId: string,
  transactions: Array<{
    from_user_id: string | null;
    to_user_id: string | null;
    amount: string | number;
  }>,
) {
  return transactions.reduce((balance, transaction) => {
    const amount = normalizeMoneyAmount(transaction.amount);

    if (transaction.to_user_id === userId) {
      return balance + amount;
    }

    if (transaction.from_user_id === userId) {
      return balance - amount;
    }

    return balance;
  }, 0);
}
