"use client";

import Link from "next/link";
import { useRef, useState, type TouchEvent } from "react";
import { CategoryIcon } from "@/components/category-icon";
import { formatArs } from "@/lib/formatters/currency";
import { formatRelativeLocalDate } from "@/lib/formatters/dates";
import type { Category, Transaction } from "@/types/finance";

export function TransactionList({
  transactions,
  categories,
  editable = false,
  onDelete,
  variant = "dashboard",
}: {
  transactions: readonly Transaction[];
  categories: readonly Category[];
  editable?: boolean;
  onDelete?: (transaction: Transaction) => void;
  variant?: "dashboard" | "history";
}) {
  const categoryById = new Map(
    categories.map((category) => [category.id, category]),
  );

  return (
    <ul>
      {transactions.map((transaction) => {
        const category = categoryById.get(transaction.categoryId);
        return (
          <SwipeableRow
            editable={editable}
            key={transaction.id}
            onDelete={onDelete}
            transaction={transaction}
          >
            <div className="flex min-h-[66px] items-center gap-3 border-b bg-[var(--paper)] py-2 hairline">
              <CategoryIcon
                income={transaction.type === "income"}
                name={category?.icon ?? "Ellipsis"}
              />
              <div className="min-w-0 flex-1">
                <p className="truncate text-[14px] font-medium">
                  {variant === "dashboard"
                    ? (transaction.note ?? category?.name ?? "Sin categoría")
                    : (category?.name ?? "Sin categoría")}
                </p>
                <p className="mt-0.5 truncate text-[10px] text-[var(--muted)]">
                  {variant === "dashboard"
                    ? formatRelativeLocalDate(transaction.occurredOn)
                    : (transaction.note ??
                      (transaction.type === "income" ? "Ingreso" : "Gasto"))}
                </p>
              </div>
              <p
                className={`numeric shrink-0 text-[13px] font-semibold ${
                  transaction.type === "income"
                    ? "text-[var(--income)]"
                    : "text-[var(--ink)]"
                }`}
              >
                {transaction.type === "income" ? "+" : "−"}
                {formatArs(transaction.amountCents)}
              </p>
            </div>
          </SwipeableRow>
        );
      })}
    </ul>
  );
}

function SwipeableRow({
  transaction,
  editable,
  onDelete,
  children,
}: {
  transaction: Transaction;
  editable: boolean;
  onDelete?: ((transaction: Transaction) => void) | undefined;
  children: React.ReactNode;
}) {
  const touchStart = useRef<number | null>(null);
  const [revealed, setRevealed] = useState(false);

  const handleStart = (event: TouchEvent<HTMLDivElement>) => {
    touchStart.current = event.touches[0]?.clientX ?? null;
  };

  const handleEnd = (event: TouchEvent<HTMLDivElement>) => {
    if (!editable || touchStart.current === null) {
      return;
    }
    const end = event.changedTouches[0]?.clientX ?? touchStart.current;
    const movement = end - touchStart.current;
    if (movement < -35) {
      setRevealed(true);
    } else if (movement > 35) {
      setRevealed(false);
    }
    touchStart.current = null;
  };

  if (!editable) {
    return <li>{children}</li>;
  }

  return (
    <li className="relative overflow-hidden">
      <div className="absolute inset-y-0 right-0 flex w-32">
        <Link
          aria-hidden={!revealed}
          className="grid w-16 place-items-center bg-[var(--navy)] text-[10px] font-semibold text-white"
          href={`/transactions/${transaction.id}/edit`}
          tabIndex={revealed ? 0 : -1}
        >
          Editar
        </Link>
        <button
          aria-hidden={!revealed}
          className="w-16 bg-[#b64b48] text-[10px] font-semibold text-white"
          onClick={() => onDelete?.(transaction)}
          tabIndex={revealed ? 0 : -1}
          type="button"
        >
          Eliminar
        </button>
      </div>
      <div
        className="relative transition-transform duration-200"
        onTouchEnd={handleEnd}
        onTouchStart={handleStart}
        style={{ transform: revealed ? "translateX(-128px)" : "translateX(0)" }}
      >
        {children}
      </div>
    </li>
  );
}
