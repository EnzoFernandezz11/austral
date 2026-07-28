"use client";

import { ChevronDown, ListFilter } from "lucide-react";
import { useMemo, useState } from "react";
import {
  EmptyState,
  ErrorState,
  LoadingState,
} from "@/components/screen-state";
import { TransactionList } from "@/components/transaction-list";
import { useAppData } from "@/features/settings/app-provider";
import { filterTransactions } from "@/lib/finance/calculations";
import { currentMonth, monthKey, shiftMonth } from "@/lib/finance/periods";
import { formatLocalDate, formatMonth } from "@/lib/formatters/dates";
import type { MonthSelection, Transaction } from "@/types/finance";

type FilterValue = "all" | "expense" | "income" | `category:${string}`;

export function HistoryScreen() {
  const { status, error, transactions, categories, deleteTransaction } =
    useAppData();
  const [month, setMonth] = useState(currentMonth);
  const [filter, setFilter] = useState<FilterValue>("all");
  const [actionError, setActionError] = useState<string | null>(null);

  const filtered = useMemo(() => {
    const categoryId = filter.startsWith("category:")
      ? filter.slice("category:".length)
      : "all";
    const type = filter === "expense" || filter === "income" ? filter : "all";
    return filterTransactions(transactions, { month, type, categoryId });
  }, [transactions, month, filter]);

  const groups = useMemo(() => groupTransactionsByDay(filtered), [filtered]);
  const monthOptions = useMemo(
    () =>
      Array.from({ length: 13 }, (_, index) =>
        shiftMonth(currentMonth(), index - 10),
      ),
    [],
  );

  if (status === "loading") {
    return <LoadingState />;
  }

  if (status === "error") {
    return <ErrorState message={error ?? "Error desconocido"} />;
  }

  const handleDelete = async (transaction: Transaction) => {
    if (
      !window.confirm(
        "¿Eliminar este movimiento? Esta acción no se puede deshacer.",
      )
    ) {
      return;
    }

    try {
      setActionError(null);
      await deleteTransaction(transaction.id);
    } catch (cause: unknown) {
      setActionError(
        cause instanceof Error ? cause.message : "No se pudo eliminar.",
      );
    }
  };

  return (
    <div className="screen pt-8">
      <h1 className="text-[30px] font-bold tracking-[-0.04em]">Movimientos</h1>

      <div className="mt-4 flex gap-2">
        <label className="relative">
          <span className="sr-only">Mes</span>
          <select
            className="h-11 appearance-none rounded-full border bg-transparent pl-4 pr-9 text-[11px] font-semibold hairline"
            onChange={(event) => {
              const selected = monthOptions.find(
                (option) => monthKey(option) === event.target.value,
              );
              if (selected !== undefined) {
                setMonth(selected);
              }
            }}
            value={monthKey(month)}
          >
            {monthOptions.map((option) => (
              <option key={monthKey(option)} value={monthKey(option)}>
                {formatMonth(option)}
              </option>
            ))}
          </select>
          <ChevronDown
            aria-hidden="true"
            className="pointer-events-none absolute right-3 top-3.5"
            size={13}
          />
        </label>

        <label className="relative min-w-0 flex-1">
          <span className="sr-only">Filtrar movimientos</span>
          <select
            className="h-11 w-full appearance-none rounded-full border bg-transparent pl-4 pr-9 text-[11px] font-semibold hairline"
            onChange={(event) => setFilter(event.target.value as FilterValue)}
            value={filter}
          >
            <option value="all">Todos los movimientos</option>
            <option value="expense">Solo gastos</option>
            <option value="income">Solo ingresos</option>
            <optgroup label="Categorías">
              {categories.map((category) => (
                <option key={category.id} value={`category:${category.id}`}>
                  {category.name}
                </option>
              ))}
            </optgroup>
          </select>
          <ListFilter
            aria-hidden="true"
            className="pointer-events-none absolute right-3 top-3.5"
            size={13}
          />
        </label>
      </div>

      {actionError === null ? null : (
        <p className="mt-3 text-xs font-medium text-red-700" role="alert">
          {actionError}
        </p>
      )}

      {groups.length === 0 ? (
        <EmptyState
          description="Probá otro mes o cambiá el filtro."
          title="No hay movimientos para mostrar."
        />
      ) : (
        <div className="mt-7 space-y-5">
          {groups.map((group) => (
            <section key={group.date}>
              <h2 className="border-b pb-2 text-[9px] font-semibold tracking-[0.12em] text-[var(--muted)] hairline">
                {group.label.toUpperCase()}
              </h2>
              <TransactionList
                categories={categories}
                editable
                onDelete={(transaction) => void handleDelete(transaction)}
                transactions={group.transactions}
                variant="history"
              />
            </section>
          ))}
        </div>
      )}
    </div>
  );
}

function groupTransactionsByDay(
  transactions: readonly Transaction[],
): Array<{ date: string; label: string; transactions: Transaction[] }> {
  const groups = new Map<string, Transaction[]>();
  for (const transaction of transactions) {
    const current = groups.get(transaction.occurredOn) ?? [];
    current.push(transaction);
    groups.set(transaction.occurredOn, current);
  }

  return [...groups.entries()].map(([date, groupedTransactions]) => ({
    date,
    label: dayGroupLabel(date),
    transactions: groupedTransactions,
  }));
}

function dayGroupLabel(value: string): string {
  const today = new Date();
  const todaySelection: MonthSelection = {
    year: today.getFullYear(),
    monthIndex: today.getMonth(),
  };
  const todayValue = `${monthKey(todaySelection)}-${String(today.getDate()).padStart(2, "0")}`;
  if (value === todayValue) {
    return "Hoy";
  }

  const yesterday = new Date(
    today.getFullYear(),
    today.getMonth(),
    today.getDate() - 1,
  );
  const yesterdayValue = `${yesterday.getFullYear()}-${String(
    yesterday.getMonth() + 1,
  ).padStart(2, "0")}-${String(yesterday.getDate()).padStart(2, "0")}`;
  return value === yesterdayValue ? "Ayer" : formatLocalDate(value);
}
