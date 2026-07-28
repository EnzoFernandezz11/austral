"use client";

import { useState } from "react";
import {
  DistributionChart,
  type DistributionItem,
} from "@/features/analytics/analysis-charts";
import { MonthSelector } from "@/components/month-selector";
import { ErrorState, LoadingState } from "@/components/screen-state";
import { TopHeader } from "@/components/top-header";
import { useAppData } from "@/features/settings/app-provider";
import {
  calculateExpensesByCategory,
  calculateMonthlyComparison,
  calculateTotals,
} from "@/lib/finance/calculations";
import {
  currentMonth,
  filterTransactionsByMonth,
  filterTransactionsByYear,
  shiftMonth,
} from "@/lib/finance/periods";
import { formatArs } from "@/lib/formatters/currency";
import type { Transaction } from "@/types/finance";

const CHART_COLORS = ["#193e5d", "#4b6d8b", "#7b817f", "#dedfdd"] as const;

export function AnalyticsScreen() {
  const { status, error, transactions, categories } = useAppData();
  const [month, setMonth] = useState(currentMonth);
  const [period, setPeriod] = useState<"month" | "year">("month");

  if (status === "loading") {
    return <LoadingState />;
  }

  if (status === "error") {
    return <ErrorState message={error ?? "Error desconocido"} />;
  }

  const previousMonth = shiftMonth(month, -1);
  const selectedTransactions =
    period === "month"
      ? filterTransactionsByMonth(transactions, month)
      : filterTransactionsByYear(transactions, month.year);
  const totals = calculateTotals(selectedTransactions);
  const categoryExpenses = calculateExpensesByCategory(
    selectedTransactions,
    categories,
  );
  const distribution = buildDistribution(categoryExpenses);
  const comparison =
    period === "month"
      ? calculateMonthlyComparison(transactions, month, previousMonth)
      : calculateYearlyComparison(transactions, month.year);

  return (
    <div className="screen">
      <TopHeader />
      <div className="pt-5">
        <div className="grid grid-cols-2 rounded-xl border p-1 hairline">
          <PeriodButton
            active={period === "month"}
            onClick={() => setPeriod("month")}
          >
            Mensual
          </PeriodButton>
          <PeriodButton
            active={period === "year"}
            onClick={() => setPeriod("year")}
          >
            Anual
          </PeriodButton>
        </div>
        {period === "month" ? (
          <MonthSelector compact onChange={setMonth} value={month} />
        ) : (
          <div className="flex items-center justify-center gap-5 py-5 text-sm font-medium">
            <button
              aria-label="Año anterior"
              className="min-h-11 px-2 text-[var(--navy)]"
              onClick={() => setMonth((current) => shiftMonth(current, -12))}
              type="button"
            >
              ←
            </button>
            <p className="min-w-12 text-center">{month.year}</p>
            <button
              aria-label="Año siguiente"
              className="min-h-11 px-2 text-[var(--navy)]"
              onClick={() => setMonth((current) => shiftMonth(current, 12))}
              type="button"
            >
              →
            </button>
          </div>
        )}
      </div>

      <section className="analysis-entry rounded-xl border bg-white/35 p-5 hairline">
        <h1 className="text-[19px] font-semibold">Distribución</h1>
        {distribution.length === 0 ? (
          <p className="py-16 text-center text-sm text-[var(--muted)]">
            No hay gastos en este mes.
          </p>
        ) : (
          <>
            <DistributionChart
              data={distribution}
              totalCents={totals.expenseCents}
            />
            <DistributionList
              data={distribution}
              totalCents={totals.expenseCents}
            />
          </>
        )}
      </section>

      <section className="mt-4 rounded-xl border bg-white/20 p-5 hairline">
        <h2 className="text-sm font-semibold">
          Resumen {period === "month" ? "del mes" : "del año"}
        </h2>
        <p className="mt-2 text-[13px] leading-5 text-[#555d60]">
          {comparison.percentageChange === null
            ? "Todavía no hay un mes anterior con el que comparar tus gastos."
            : `Este mes gastaste un ${Math.abs(Math.round(comparison.percentageChange))}% ${
                comparison.percentageChange <= 0 ? "menos" : "más"
              } que el anterior${
                comparison.percentageChange <= 0
                  ? ", manteniendo tus gastos principales bajo control."
                  : "."
              }`}
        </p>
      </section>
    </div>
  );
}

function PeriodButton({
  active,
  children,
  onClick,
}: {
  active: boolean;
  children: React.ReactNode;
  onClick: () => void;
}) {
  return (
    <button
      aria-pressed={active}
      className={`min-h-9 rounded-lg text-xs font-semibold ${
        active ? "bg-[var(--navy)] text-white" : "text-[var(--muted)]"
      }`}
      onClick={onClick}
      type="button"
    >
      {children}
    </button>
  );
}

function buildDistribution(
  categories: ReturnType<typeof calculateExpensesByCategory>,
): DistributionItem[] {
  if (categories.length <= 4) {
    return categories.map((category, index) => ({
      id: category.categoryId,
      name: category.name,
      amountCents: category.amountCents,
      color: CHART_COLORS[index] ?? CHART_COLORS[3],
    }));
  }

  const primary = categories.slice(0, 3).map((category, index) => ({
    id: category.categoryId,
    name: category.name,
    amountCents: category.amountCents,
    color: CHART_COLORS[index] ?? CHART_COLORS[2],
  }));
  const otherAmount = categories
    .slice(3)
    .reduce((total, category) => total + category.amountCents, 0);
  return [
    ...primary,
    {
      id: "other-group",
      name: "Otros",
      amountCents: otherAmount,
      color: CHART_COLORS[3],
    },
  ];
}

function calculateYearlyComparison(
  transactions: readonly Transaction[],
  year: number,
): {
  percentageChange: number | null;
} {
  const currentExpenseCents = calculateTotals(
    filterTransactionsByYear(transactions, year),
  ).expenseCents;
  const previousExpenseCents = calculateTotals(
    filterTransactionsByYear(transactions, year - 1),
  ).expenseCents;
  return {
    percentageChange:
      previousExpenseCents === 0
        ? null
        : ((currentExpenseCents - previousExpenseCents) * 100) /
          previousExpenseCents,
  };
}

function DistributionList({
  data,
  totalCents,
}: {
  data: readonly DistributionItem[];
  totalCents: number;
}) {
  return (
    <ul className="mt-2">
      {data.map((item) => (
        <li
          className="grid min-h-11 grid-cols-[1fr_42px_auto] items-center gap-2 border-b text-[12px] last:border-b-0 hairline"
          key={item.id}
        >
          <span className="flex items-center gap-2">
            <span
              aria-hidden="true"
              className="size-2 rounded-full"
              style={{ backgroundColor: item.color }}
            />
            {item.name}
          </span>
          <span className="numeric text-right text-[var(--muted)]">
            {totalCents === 0
              ? "0%"
              : `${Math.round((item.amountCents * 100) / totalCents)}%`}
          </span>
          <span className="numeric text-right font-semibold">
            {formatArs(item.amountCents)}
          </span>
        </li>
      ))}
    </ul>
  );
}
