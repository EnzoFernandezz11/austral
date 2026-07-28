import type { Transaction } from "@/types/finance";
import { localDateToString } from "@/lib/finance/periods";

function dateThisMonth(day: number): string {
  const now = new Date();
  return localDateToString(
    new Date(now.getFullYear(), now.getMonth(), Math.min(day, now.getDate())),
  );
}

function relativeDate(daysAgo: number): string {
  const now = new Date();
  return localDateToString(
    new Date(now.getFullYear(), now.getMonth(), now.getDate() - daysAgo),
  );
}

export function createDevelopmentTransactions(): Transaction[] {
  const createdAt = new Date().toISOString();

  return [
    {
      id: "10000000-0000-4000-8000-000000000001",
      type: "income",
      amountCents: 40_000_00,
      currency: "ARS",
      categoryId: "income-scholarship",
      note: "Beca",
      occurredOn: relativeDate(1),
      createdAt,
      updatedAt: createdAt,
    },
    {
      id: "10000000-0000-4000-8000-000000000002",
      type: "expense",
      amountCents: 12_000_00,
      currency: "ARS",
      categoryId: "expense-food",
      note: "Papas",
      occurredOn: relativeDate(0),
      createdAt,
      updatedAt: createdAt,
    },
    {
      id: "10000000-0000-4000-8000-000000000003",
      type: "expense",
      amountCents: 8_000_00,
      currency: "ARS",
      categoryId: "expense-gym",
      occurredOn: dateThisMonth(12),
      createdAt,
      updatedAt: createdAt,
    },
    {
      id: "10000000-0000-4000-8000-000000000004",
      type: "expense",
      amountCents: 5_000_00,
      currency: "ARS",
      categoryId: "expense-going-out",
      occurredOn: dateThisMonth(8),
      createdAt,
      updatedAt: createdAt,
    },
    {
      id: "10000000-0000-4000-8000-000000000005",
      type: "expense",
      amountCents: 3_000_00,
      currency: "ARS",
      categoryId: "expense-transport",
      occurredOn: dateThisMonth(4),
      createdAt,
      updatedAt: createdAt,
    },
  ];
}
