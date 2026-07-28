"use client";

import { useMemo, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { CategoryIcon } from "@/components/category-icon";
import { useAppData } from "@/features/settings/app-provider";
import { parseAmountToCents } from "@/lib/finance/money";
import { currentLocalDate } from "@/lib/finance/periods";
import { transactionDraftSchema } from "@/lib/validation/transaction";
import type {
  Category,
  TransactionDraft,
  TransactionType,
} from "@/types/finance";

function supportsType(category: Category, type: TransactionType): boolean {
  return category.type === "both" || category.type === type;
}

export function QuickExpenseForm() {
  const router = useRouter();
  const { categories, saveTransaction } = useAppData();
  const [type, setType] = useState<TransactionType>("expense");
  const [amount, setAmount] = useState("");
  const [categoryId, setCategoryId] = useState("expense-food");
  const [occurredOn, setOccurredOn] = useState(currentLocalDate);
  const [note, setNote] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const availableCategories = useMemo(
    () => categories.filter((category) => supportsType(category, type)),
    [categories, type],
  );

  const selectType = (nextType: TransactionType) => {
    setType(nextType);
    const first = categories.find((category) =>
      supportsType(category, nextType),
    );
    setCategoryId(first?.id ?? "");
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);

    const amountCents = parseAmountToCents(amount);
    if (amountCents === null) {
      setError("Ingresá un monto mayor a cero.");
      return;
    }

    const baseDraft = { type, amountCents, categoryId, occurredOn };
    const draft: TransactionDraft =
      note.trim() === "" ? baseDraft : { ...baseDraft, note: note.trim() };
    const validation = transactionDraftSchema.safeParse(draft);
    if (!validation.success) {
      setError(validation.error.issues[0]?.message ?? "Revisá los datos.");
      return;
    }

    try {
      setSaving(true);
      await saveTransaction(validation.data);
      router.replace("/");
    } catch (cause: unknown) {
      setError(
        cause instanceof Error
          ? cause.message
          : "No pudimos guardar el movimiento.",
      );
      setSaving(false);
    }
  };

  return (
    <form
      className="flex min-h-[calc(100%_-_56px)] flex-col"
      onSubmit={handleSubmit}
    >
      <fieldset className="mx-auto mt-5 grid w-48 grid-cols-2 rounded-full border p-1 hairline">
        <legend className="sr-only">Tipo de movimiento</legend>
        {(["expense", "income"] as const).map((option) => (
          <button
            aria-pressed={type === option}
            className={`min-h-11 rounded-full text-xs font-semibold ${
              type === option ? "bg-black text-white" : "text-[var(--muted)]"
            }`}
            key={option}
            onClick={() => selectType(option)}
            type="button"
          >
            {option === "expense" ? "Gasto" : "Ingreso"}
          </button>
        ))}
      </fieldset>

      <div className="py-7 text-center">
        <label className="sr-only" htmlFor="quick-amount">
          Monto en ARS
        </label>
        <div className="mx-auto flex max-w-[290px] items-center justify-center">
          <span className="numeric mr-2 text-[34px] font-bold">$</span>
          <input
            autoComplete="off"
            autoFocus
            className="quick-amount numeric min-w-0 max-w-[230px] bg-transparent text-center text-[42px] font-bold outline-none placeholder:text-black"
            id="quick-amount"
            inputMode="decimal"
            onChange={(event) => setAmount(event.target.value)}
            placeholder="0"
            value={amount}
          />
        </div>
      </div>

      <fieldset>
        <legend className="mb-3 text-[12px] font-semibold tracking-wide">
          CATEGORÍA
        </legend>
        <div className="grid grid-cols-3 gap-x-2 gap-y-3">
          {availableCategories.map((category) => (
            <button
              aria-pressed={categoryId === category.id}
              className={`flex min-h-[70px] flex-col items-center justify-center gap-1 rounded-xl border text-center text-[10px] ${
                categoryId === category.id
                  ? "border-[var(--navy)] bg-[#f1f4f5]"
                  : "border-transparent"
              }`}
              key={category.id}
              onClick={() => setCategoryId(category.id)}
              type="button"
            >
              <CategoryIcon
                income={type === "income"}
                name={category.icon}
                size="small"
              />
              <span className="line-clamp-2">{category.name}</span>
            </button>
          ))}
        </div>
      </fieldset>

      <div className="mt-5 grid grid-cols-2 gap-5">
        <div>
          <label
            className="text-[10px] font-semibold tracking-wide"
            htmlFor="quick-date"
          >
            FECHA
          </label>
          <input
            className="field text-sm"
            id="quick-date"
            onChange={(event) => setOccurredOn(event.target.value)}
            required
            type="date"
            value={occurredOn}
          />
        </div>
        <div>
          <label
            className="text-[10px] font-semibold tracking-wide"
            htmlFor="quick-note"
          >
            NOTA OPCIONAL
          </label>
          <input
            className="field text-sm"
            id="quick-note"
            maxLength={240}
            onChange={(event) => setNote(event.target.value)}
            placeholder="Ej. Papas"
            value={note}
          />
        </div>
      </div>

      {error === null ? null : (
        <p className="mt-3 text-center text-xs text-red-700" role="alert">
          {error}
        </p>
      )}

      <button
        className="quick-submit button-black"
        disabled={saving}
        type="submit"
      >
        {saving
          ? "Guardando…"
          : type === "expense"
            ? "Guardar gasto"
            : "Guardar ingreso"}
      </button>
    </form>
  );
}
