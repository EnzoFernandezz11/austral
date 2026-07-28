import { describe, expect, it } from "vitest";
import {
  calculateExpensesByCategory,
  calculateMonthlyComparison,
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

  it("mantiene totales y filtros correctos a lo largo de 36 meses", () => {
    const historical = Array.from({ length: 36 * 28 }, (_, index) => {
      const monthOffset = Math.floor(index / 28);
      const day = (index % 28) + 1;
      const date = new Date(2023, monthOffset, day);
      return movement({
        id: `history-${index}`,
        type: index % 5 === 0 ? "income" : "expense",
        amountCents: (index + 1) * 101,
        categoryId: index % 2 === 0 ? "food" : "transport",
        occurredOn: date.toISOString().slice(0, 10),
      });
    });

    const target = { year: 2025, monthIndex: 11 };
    const expected = historical.filter((transaction) =>
      transaction.occurredOn.startsWith("2025-12-"),
    );

    expect(filterTransactionsByMonth(historical, target)).toEqual(expected);
    expect(calculateTotals(historical)).toEqual({
      incomeCents: historical
        .filter((transaction) => transaction.type === "income")
        .reduce((total, transaction) => total + transaction.amountCents, 0),
      expenseCents: historical
        .filter((transaction) => transaction.type === "expense")
        .reduce((total, transaction) => total + transaction.amountCents, 0),
      balanceCents:
        historical
          .filter((transaction) => transaction.type === "income")
          .reduce((total, transaction) => total + transaction.amountCents, 0) -
        historical
          .filter((transaction) => transaction.type === "expense")
          .reduce((total, transaction) => total + transaction.amountCents, 0),
    });
  });

  it("maneja el cambio de año, categorías eliminadas y meses sin gastos", () => {
    const boundary = [
      movement({
        id: "december",
        type: "expense",
        amountCents: 10_000,
        categoryId: "deleted-category",
        occurredOn: "2025-12-31",
      }),
      movement({
        id: "january",
        type: "income",
        amountCents: 20_000,
        occurredOn: "2026-01-01",
      }),
    ];

    expect(
      filterTransactionsByMonth(boundary, { year: 2026, monthIndex: 0 }),
    ).toEqual([boundary[1]]);
    expect(calculateExpensesByCategory(boundary, [])).toEqual([
      {
        categoryId: "deleted-category",
        name: "Sin categoría",
        color: "#6c757d",
        amountCents: 10_000,
      },
    ]);
    expect(
      calculateMonthlyComparison(
        boundary,
        { year: 2026, monthIndex: 0 },
        { year: 2025, monthIndex: 11 },
      ),
    ).toMatchObject({
      currentExpenseCents: 0,
      previousExpenseCents: 10_000,
      differenceCents: -10_000,
      percentageChange: -100,
    });
  });
});
