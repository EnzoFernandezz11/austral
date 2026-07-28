"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { useState } from "react";
import { MonthSelector } from "@/components/month-selector";
import {
  EmptyState,
  ErrorState,
  LoadingState,
} from "@/components/screen-state";
import { TopHeader } from "@/components/top-header";
import { TransactionList } from "@/components/transaction-list";
import { useAppData } from "@/features/settings/app-provider";
import {
  calculateExpensesByCategory,
  calculateRemainingBudget,
  calculateTotals,
} from "@/lib/finance/calculations";
import { currentMonth, filterTransactionsByMonth } from "@/lib/finance/periods";
import { formatArs } from "@/lib/formatters/currency";

export function DashboardScreen() {
  const { status, error, transactions, categories, settings } = useAppData();
  const [selectedMonth, setSelectedMonth] = useState(currentMonth);

  if (status === "loading") {
    return <LoadingState label="Abriendo tus datos…" />;
  }

  if (status === "error") {
    return <ErrorState message={error ?? "Error desconocido"} />;
  }

  const monthlyTransactions = filterTransactionsByMonth(
    transactions,
    selectedMonth,
  );
  const totals = calculateTotals(monthlyTransactions);
  const remainingBudget = calculateRemainingBudget(
    settings.monthlyBudgetCents,
    totals.expenseCents,
  );
  const available = remainingBudget ?? totals.balanceCents;
  const categoryExpenses = calculateExpensesByCategory(
    monthlyTransactions,
    categories,
  );
  const hasExpenses = totals.expenseCents > 0;
  const progress =
    settings.monthlyBudgetCents === undefined ||
    settings.monthlyBudgetCents === 0
      ? 0
      : Math.min(
          100,
          Math.max(
            0,
            ((settings.monthlyBudgetCents - totals.expenseCents) * 100) /
              settings.monthlyBudgetCents,
          ),
        );

  return (
    <div className="screen">
      <TopHeader />
      <MonthSelector onChange={setSelectedMonth} value={selectedMonth} />

      {!hasExpenses && monthlyTransactions.length === 0 ? (
        <EmptyState
          description="Empezá con el primero."
          title="Todavía no registraste gastos este mes."
        />
      ) : (
        <>
          <section className="pb-6 pt-2 text-center">
            <p className="text-[9px] font-medium tracking-[0.12em]">
              DISPONIBLE
            </p>
            <p className="numeric mt-1 text-[32px] font-bold">
              {formatArs(available)}
            </p>
            <p className="mt-1 text-[12px] text-[#4f5659]">
              {settings.monthlyBudgetCents === undefined
                ? "saldo del mes"
                : `de ${formatArs(settings.monthlyBudgetCents)} para este mes`}
            </p>
            <div className="mt-2 h-px w-full bg-[var(--line)]">
              <div
                className="h-px bg-[var(--ink)]"
                style={{ width: `${progress}%` }}
              />
            </div>
          </section>

          <section className="grid grid-cols-3 py-5">
            <Metric label="INGRESOS" value={formatArs(totals.incomeCents)} />
            <Metric
              bordered
              label="GASTOS"
              value={formatArs(totals.expenseCents)}
            />
            <Metric label="SALDO" value={formatArs(totals.balanceCents)} />
          </section>

          <section className="mt-4">
            <div className="flex h-12 items-center justify-between border-b hairline">
              <h2 className="text-[19px] font-semibold">En qué se fue</h2>
              <Link
                className="flex min-h-11 items-center gap-1 text-[9px] font-semibold tracking-wide"
                href="/analytics"
              >
                VER TODO
                <ArrowRight aria-hidden="true" size={13} />
              </Link>
            </div>
            <CategoryBreakdown categories={categoryExpenses.slice(0, 3)} />
          </section>

          <section className="mt-5">
            <h2 className="flex h-12 items-center border-b text-[19px] font-semibold hairline">
              Últimos movimientos
            </h2>
            <TransactionList
              categories={categories}
              transactions={monthlyTransactions.slice(0, 4)}
            />
          </section>
        </>
      )}
    </div>
  );
}

function Metric({
  label,
  value,
  bordered = false,
}: {
  label: string;
  value: string;
  bordered?: boolean;
}) {
  return (
    <div className={bordered ? "border-x hairline" : ""}>
      <p className="text-center text-[8px] tracking-[0.08em]">{label}</p>
      <p className="numeric mt-1 text-center text-[12px] font-semibold">
        {value}
      </p>
    </div>
  );
}

function CategoryBreakdown({
  categories,
}: {
  categories: ReturnType<typeof calculateExpensesByCategory>;
}) {
  const maximum = categories[0]?.amountCents ?? 1;
  return (
    <ul>
      {categories.map((category) => (
        <li
          className="relative flex h-10 items-center border-b hairline"
          key={category.categoryId}
        >
          <span className="text-[13px]">{category.name}</span>
          <span className="numeric ml-auto text-[12px] text-[#4f5659]">
            {formatArs(category.amountCents)}
          </span>
          <span
            className="absolute bottom-[-1px] left-0 h-px bg-[var(--navy)]"
            style={{ width: `${(category.amountCents * 42) / maximum}%` }}
          />
        </li>
      ))}
    </ul>
  );
}
