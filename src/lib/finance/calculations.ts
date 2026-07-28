import type {
  Category,
  MonthSelection,
  Transaction,
  TransactionType,
} from "@/types/finance";
import { filterTransactionsByMonth } from "@/lib/finance/periods";

export type FinancialTotals = {
  incomeCents: number;
  expenseCents: number;
  balanceCents: number;
};

export type TransactionFilters = {
  month?: MonthSelection;
  type?: TransactionType | "all";
  categoryId?: string | "all";
};

export type CategoryExpense = {
  categoryId: string;
  name: string;
  color: string;
  amountCents: number;
};

export function calculateTotals(
  transactions: readonly Transaction[],
): FinancialTotals {
  let incomeCents = 0;
  let expenseCents = 0;

  for (const transaction of transactions) {
    if (transaction.type === "income") {
      incomeCents += transaction.amountCents;
    } else {
      expenseCents += transaction.amountCents;
    }
  }

  return {
    incomeCents,
    expenseCents,
    balanceCents: incomeCents - expenseCents,
  };
}

export function calculateRemainingBudget(
  monthlyBudgetCents: number | undefined,
  expenseCents: number,
): number | undefined {
  if (monthlyBudgetCents === undefined) {
    return undefined;
  }

  return monthlyBudgetCents - expenseCents;
}

export function filterTransactions(
  transactions: readonly Transaction[],
  filters: TransactionFilters,
): Transaction[] {
  return transactions.filter((transaction) => {
    if (
      filters.month !== undefined &&
      !transaction.occurredOn.startsWith(
        `${filters.month.year}-${String(filters.month.monthIndex + 1).padStart(2, "0")}-`,
      )
    ) {
      return false;
    }

    if (
      filters.type !== undefined &&
      filters.type !== "all" &&
      transaction.type !== filters.type
    ) {
      return false;
    }

    return !(
      filters.categoryId !== undefined &&
      filters.categoryId !== "all" &&
      transaction.categoryId !== filters.categoryId
    );
  });
}

export function calculateExpensesByCategory(
  transactions: readonly Transaction[],
  categories: readonly Category[],
): CategoryExpense[] {
  const categoryById = new Map(
    categories.map((category) => [category.id, category]),
  );
  const totals = new Map<string, number>();

  for (const transaction of transactions) {
    if (transaction.type !== "expense") {
      continue;
    }

    totals.set(
      transaction.categoryId,
      (totals.get(transaction.categoryId) ?? 0) + transaction.amountCents,
    );
  }

  return [...totals.entries()]
    .map(([categoryId, amountCents]) => {
      const category = categoryById.get(categoryId);
      return {
        categoryId,
        name: category?.name ?? "Sin categoría",
        color: category?.color ?? "#6c757d",
        amountCents,
      };
    })
    .sort((left, right) => right.amountCents - left.amountCents);
}

export function calculateMonthlyComparison(
  transactions: readonly Transaction[],
  current: MonthSelection,
  previous: MonthSelection,
): {
  currentExpenseCents: number;
  previousExpenseCents: number;
  differenceCents: number;
  percentageChange: number | null;
} {
  const currentExpenseCents = calculateTotals(
    filterTransactionsByMonth(transactions, current),
  ).expenseCents;
  const previousExpenseCents = calculateTotals(
    filterTransactionsByMonth(transactions, previous),
  ).expenseCents;
  const differenceCents = currentExpenseCents - previousExpenseCents;

  return {
    currentExpenseCents,
    previousExpenseCents,
    differenceCents,
    percentageChange:
      previousExpenseCents === 0
        ? null
        : (differenceCents * 100) / previousExpenseCents,
  };
}
