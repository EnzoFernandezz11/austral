import { describe, expect, it } from "vitest";
import {
  calculateRemainingBudget,
  calculateTotals,
  filterTransactions,
} from "@/lib/finance/calculations";
import { filterTransactionsByMonth } from "@/lib/finance/periods";
import type { Transaction } from "@/types/finance";

function movement(
  overrides: Partial<Transaction> &
    Pick<Transaction, "id" | "type" | "amountCents">,
): Transaction {
  return {
    currency: "ARS",
    categoryId: "category",
    occurredOn: "2026-07-10",
    createdAt: "2026-07-10T12:00:00.000Z",
    updatedAt: "2026-07-10T12:00:00.000Z",
    ...overrides,
  };
}

describe("cálculos financieros", () => {
  const transactions = [
    movement({ id: "1", type: "income", amountCents: 150_000 }),
    movement({ id: "2", type: "income", amountCents: 50_000 }),
    movement({ id: "3", type: "expense", amountCents: 75_500 }),
    movement({ id: "4", type: "expense", amountCents: 10_000 }),
  ];

  it("suma ingresos y gastos usando enteros", () => {
    const totals = calculateTotals(transactions);
    expect(totals.incomeCents).toBe(200_000);
    expect(totals.expenseCents).toBe(85_500);
  });

  it("calcula el saldo neto", () => {
    expect(calculateTotals(transactions).balanceCents).toBe(114_500);
  });

  it("filtra movimientos por mes", () => {
    const withAnotherMonth = [
      ...transactions,
      movement({
        id: "5",
        type: "expense",
        amountCents: 25_000,
        occurredOn: "2026-06-30",
      }),
    ];

    expect(
      filterTransactionsByMonth(withAnotherMonth, {
        year: 2026,
        monthIndex: 6,
      }),
    ).toHaveLength(4);
    expect(
      filterTransactions(withAnotherMonth, {
        month: { year: 2026, monthIndex: 5 },
        type: "expense",
      }).map((transaction) => transaction.id),
    ).toEqual(["5"]);
  });

  it("calcula el presupuesto restante y conserva valores negativos", () => {
    expect(calculateRemainingBudget(100_000, 85_500)).toBe(14_500);
    expect(calculateRemainingBudget(50_000, 85_500)).toBe(-35_500);
    expect(calculateRemainingBudget(undefined, 85_500)).toBeUndefined();
  });
});
