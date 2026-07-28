"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { formatMonth } from "@/lib/formatters/dates";
import { shiftMonth } from "@/lib/finance/periods";
import type { MonthSelection } from "@/types/finance";

export function MonthSelector({
  value,
  onChange,
  compact = false,
}: {
  value: MonthSelection;
  onChange: (month: MonthSelection) => void;
  compact?: boolean;
}) {
  return (
    <div
      className={`mx-auto flex items-center justify-center ${
        compact ? "gap-3" : "gap-4 py-5"
      }`}
    >
      <button
        aria-label="Mes anterior"
        className="grid size-11 place-items-center text-[var(--navy)]"
        onClick={() => onChange(shiftMonth(value, -1))}
        type="button"
      >
        <ChevronLeft aria-hidden="true" size={18} />
      </button>
      <p
        className={`min-w-32 text-center font-medium ${
          compact ? "text-sm" : "text-[17px]"
        }`}
      >
        {formatMonth(value)}
      </p>
      <button
        aria-label="Mes siguiente"
        className="grid size-11 place-items-center text-[var(--navy)]"
        onClick={() => onChange(shiftMonth(value, 1))}
        type="button"
      >
        <ChevronRight aria-hidden="true" size={18} />
      </button>
    </div>
  );
}
