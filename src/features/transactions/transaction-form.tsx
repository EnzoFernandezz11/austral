"use client";

import { useMemo, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2 } from "lucide-react";
import { MoneyInput } from "@/components/money-input";
import { useAppData } from "@/features/settings/app-provider";
import { currentLocalDate } from "@/lib/finance/periods";
import { formatCentsForInput, parseAmountToCents } from "@/lib/finance/money";
import { transactionDraftSchema } from "@/lib/validation/transaction";
import type {
  Category,
  Transaction,
  TransactionDraft,
  TransactionType,
} from "@/types/finance";

function categorySupportsType(
  category: Category,
  type: TransactionType,
): boolean {
  return category.type === "both" || category.type === type;
}

function defaultCategoryId(
  categories: readonly Category[],
  type: TransactionType,
): string {
  if (type === "income") {
    const otherIncome = categories.find(
      (category) => category.id === "income-other",
    );
    if (otherIncome !== undefined) {
      return otherIncome.id;
    }
  }

  return (
    categories.find((category) => categorySupportsType(category, type))?.id ??
    ""
  );
}

export function TransactionForm({
  transaction,
}: {
  transaction?: Transaction;
}) {
  const router = useRouter();
  const { categories, saveTransaction } = useAppData();
  const [type, setType] = useState<TransactionType>(
    transaction?.type ?? "expense",
  );
  const [amount, setAmount] = useState(
    transaction === undefined
      ? ""
      : formatCentsForInput(transaction.amountCents),
  );
  const [categoryId, setCategoryId] = useState(
    transaction?.categoryId ?? "expense-food",
  );
  const [occurredOn, setOccurredOn] = useState(
    transaction?.occurredOn ?? currentLocalDate(),
  );
  const [note, setNote] = useState(transaction?.note ?? "");
  const [formError, setFormError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const availableCategories = useMemo(
    () => categories.filter((category) => categorySupportsType(category, type)),
    [categories, type],
  );

  const changeType = (nextType: TransactionType) => {
    setType(nextType);
    const currentStillValid = categories.some(
      (category) =>
        category.id === categoryId && categorySupportsType(category, nextType),
    );
    if (!currentStillValid) {
      setCategoryId(defaultCategoryId(categories, nextType));
    }
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setFormError(null);
    setSaved(false);

    const amountCents = parseAmountToCents(amount);
    if (amountCents === null) {
      setFormError("Ingresá un monto mayor a cero con hasta dos decimales.");
      return;
    }

    const baseDraft = {
      type,
      amountCents,
      categoryId,
      occurredOn,
    };
    const draft: TransactionDraft =
      note.trim() === "" ? baseDraft : { ...baseDraft, note: note.trim() };
    const validation = transactionDraftSchema.safeParse(draft);

    if (!validation.success) {
      setFormError(validation.error.issues[0]?.message ?? "Revisá los datos.");
      return;
    }

    try {
      setSaving(true);
      await saveTransaction(validation.data, transaction?.id);
      setSaved(true);
      if (transaction !== undefined) {
        router.push("/history");
      } else {
        setAmount("");
        setNote("");
      }
    } catch (cause: unknown) {
      setFormError(
        cause instanceof Error
          ? cause.message
          : "No pudimos guardar el movimiento.",
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <form className="space-y-4" onSubmit={handleSubmit}>
      {saved ? (
        <p
          className="flex items-center gap-2 rounded-xl bg-emerald-50 p-3 text-sm font-medium text-emerald-800"
          role="status"
        >
          <CheckCircle2 aria-hidden="true" size={18} />
          Movimiento guardado
        </p>
      ) : null}

      <fieldset>
        <legend className="mb-1 text-sm font-medium text-[var(--muted)]">
          Tipo
        </legend>
        <div className="grid grid-cols-2 gap-2">
          {(["expense", "income"] as const).map((option) => (
            <button
              aria-pressed={type === option}
              className={`min-h-11 rounded-xl border font-semibold ${
                type === option
                  ? "border-[var(--navy)] bg-[#eef2f4] text-[var(--navy)]"
                  : "hairline"
              }`}
              key={option}
              onClick={() => changeType(option)}
              type="button"
            >
              {option === "expense" ? "Gasto" : "Ingreso"}
            </button>
          ))}
        </div>
      </fieldset>

      <div>
        <label
          className="mb-1 block text-sm text-[var(--muted)]"
          htmlFor="amount"
        >
          Monto en ARS
        </label>
        <MoneyInput
          id="amount"
          onValueChange={setAmount}
          placeholder="0,00"
          required
          value={amount}
        />
      </div>

      {type === "expense" ? (
        <div>
          <label
            className="mb-1 block text-sm text-[var(--muted)]"
            htmlFor="category"
          >
            Categoría
          </label>
          <select
            className="field"
            id="category"
            onChange={(event) => setCategoryId(event.target.value)}
            required
            value={categoryId}
          >
            {availableCategories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>
        </div>
      ) : null}

      <div>
        <label
          className="mb-1 block text-sm text-[var(--muted)]"
          htmlFor="occurred-on"
        >
          Fecha
        </label>
        <input
          className="field"
          id="occurred-on"
          onChange={(event) => setOccurredOn(event.target.value)}
          required
          type="date"
          value={occurredOn}
        />
      </div>

      <div>
        <label
          className="mb-1 block text-sm text-[var(--muted)]"
          htmlFor="note"
        >
          Nota <span className="font-normal">(opcional)</span>
        </label>
        <textarea
          className="field min-h-24 resize-y"
          id="note"
          maxLength={240}
          onChange={(event) => setNote(event.target.value)}
          value={note}
        />
      </div>

      {formError === null ? null : (
        <p className="text-sm font-medium text-red-700" role="alert">
          {formError}
        </p>
      )}

      <button className="button-black w-full" disabled={saving} type="submit">
        {saving
          ? "Guardando…"
          : transaction === undefined
            ? "Guardar movimiento"
            : "Guardar cambios"}
      </button>
    </form>
  );
}
