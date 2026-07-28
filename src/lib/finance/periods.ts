import type { MonthSelection, Transaction } from "@/types/finance";

function pad(value: number): string {
  return String(value).padStart(2, "0");
}

export function localDateToString(date: Date): string {
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

export function currentLocalDate(): string {
  return localDateToString(new Date());
}

export function currentMonth(): MonthSelection {
  const now = new Date();
  return { year: now.getFullYear(), monthIndex: now.getMonth() };
}

export function monthKey(month: MonthSelection): string {
  return `${month.year}-${pad(month.monthIndex + 1)}`;
}

export function shiftMonth(
  month: MonthSelection,
  offset: number,
): MonthSelection {
  const shifted = new Date(month.year, month.monthIndex + offset, 1);
  return {
    year: shifted.getFullYear(),
    monthIndex: shifted.getMonth(),
  };
}

export function isTransactionInMonth(
  transaction: Transaction,
  month: MonthSelection,
): boolean {
  return transaction.occurredOn.startsWith(`${monthKey(month)}-`);
}

export function filterTransactionsByMonth(
  transactions: readonly Transaction[],
  month: MonthSelection,
): Transaction[] {
  return transactions.filter((transaction) =>
    isTransactionInMonth(transaction, month),
  );
}

export function filterTransactionsByYear(
  transactions: readonly Transaction[],
  year: number,
): Transaction[] {
  return transactions.filter((transaction) =>
    transaction.occurredOn.startsWith(`${year}-`),
  );
}
