"use client";

import {
  ChevronRight,
  Download,
  Pencil,
  Plus,
  Shapes,
  ShieldCheck,
  Trash2,
  Upload,
  WalletCards,
  X,
  type LucideIcon,
} from "lucide-react";
import { useRef, useState, type ChangeEvent, type FormEvent } from "react";
import type {
  BackupImportMode,
  BackupImportPlan,
} from "@/features/backup/backup-domain";
import {
  exportJsonBackup,
  importBackup,
  inspectBackupFile,
} from "@/features/backup/backup-service";
import { ErrorState, LoadingState } from "@/components/screen-state";
import { TopHeader } from "@/components/top-header";
import { MoneyInput } from "@/components/money-input";
import { useAppData } from "@/features/settings/app-provider";
import { formatCentsForInput, parseAmountToCents } from "@/lib/finance/money";
import { formatArs } from "@/lib/formatters/currency";
import {
  friendlyStorageError,
  isStorageAlmostFull,
} from "@/lib/storage/storage-service";
import type { Category, TransactionType } from "@/types/finance";

type OpenPanel =
  "budget" | "categories" | "security" | "message" | "import" | null;
type CategoryEditor = "new" | string | null;

function formatBytes(bytes: number): string {
  if (bytes < 1024) {
    return `${bytes} B`;
  }
  if (bytes < 1024 * 1024) {
    return `${(bytes / 1024).toFixed(1)} KB`;
  }
  if (bytes < 1024 * 1024 * 1024) {
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  }
  return `${(bytes / (1024 * 1024 * 1024)).toFixed(1)} GB`;
}

function formatBackupDate(value: string | null): string {
  if (value === null) {
    return "Todavía no creaste un respaldo";
  }
  return new Intl.DateTimeFormat("es-AR", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

export function SettingsScreen() {
  const {
    status,
    error,
    settings,
    categories,
    storageHealth,
    lastBackupAt,
    setMonthlyBudget,
    saveCategory: persistCategory,
    deleteCategory,
    refresh,
    refreshStorageHealth,
    requestPersistentStorage,
    recordBackup,
  } = useAppData();
  const fileInput = useRef<HTMLInputElement>(null);
  const [openPanel, setOpenPanel] = useState<OpenPanel>(null);
  const [budget, setBudget] = useState("");
  const [categoryEditor, setCategoryEditor] = useState<CategoryEditor>(null);
  const [categoryName, setCategoryName] = useState("");
  const [categoryType, setCategoryType] = useState<TransactionType>("expense");
  const [plan, setPlan] = useState<BackupImportPlan | null>(null);
  const [message, setMessage] = useState("");
  const [actionError, setActionError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [protecting, setProtecting] = useState(false);

  if (status === "loading") {
    return <LoadingState />;
  }

  if (status === "error") {
    return <ErrorState message={error ?? "Error desconocido"} />;
  }

  const saveBudget = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const amountCents = parseAmountToCents(budget);
    if (amountCents === null) {
      setActionError("Ingresá un monto mayor a cero.");
      return;
    }
    try {
      setBusy(true);
      await setMonthlyBudget(amountCents);
      setBudget("");
      setActionError(null);
      setOpenPanel(null);
    } catch (cause: unknown) {
      setActionError(friendlyStorageError(cause).message);
    } finally {
      setBusy(false);
    }
  };

  const openBudget = () => {
    setBudget(
      settings.monthlyBudgetCents === undefined
        ? ""
        : formatCentsForInput(settings.monthlyBudgetCents),
    );
    setActionError(null);
    setOpenPanel("budget");
  };

  const openCategoryEditor = (category?: Category) => {
    setCategoryEditor(category?.id ?? "new");
    setCategoryName(category?.name ?? "");
    setCategoryType(category?.type === "income" ? "income" : "expense");
    setActionError(null);
  };

  const saveCategory = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    try {
      setBusy(true);
      await persistCategory(
        categoryName,
        categoryType,
        categoryEditor === "new" ? undefined : (categoryEditor ?? undefined),
      );
      setCategoryEditor(null);
      setActionError(null);
    } catch (cause: unknown) {
      setActionError(
        cause instanceof Error
          ? cause.message
          : "No se pudo guardar la categoría.",
      );
    } finally {
      setBusy(false);
    }
  };

  const removeCategory = async (category: Category) => {
    if (!window.confirm(`¿Eliminar la categoría “${category.name}”?`)) {
      return;
    }
    try {
      setBusy(true);
      await deleteCategory(category.id);
      setActionError(null);
    } catch (cause: unknown) {
      setActionError(
        cause instanceof Error
          ? cause.message
          : "No se pudo eliminar la categoría.",
      );
    } finally {
      setBusy(false);
    }
  };

  const exportBackup = async () => {
    try {
      setBusy(true);
      setActionError(null);
      const result = await exportJsonBackup();
      await recordBackup(result.exportedAt);
      setMessage(
        result.delivery === "share"
          ? "El respaldo se compartió correctamente."
          : "El respaldo JSON se descargó correctamente.",
      );
      setOpenPanel("message");
    } catch (cause: unknown) {
      if (
        typeof cause === "object" &&
        cause !== null &&
        "name" in cause &&
        cause.name === "AbortError"
      ) {
        return;
      }
      setActionError(
        cause instanceof Error ? cause.message : "No se pudo exportar.",
      );
    } finally {
      setBusy(false);
    }
  };

  const openSecurity = () => {
    setOpenPanel("security");
    void refreshStorageHealth();
  };

  const protectStorage = async () => {
    try {
      setProtecting(true);
      setActionError(null);
      await requestPersistentStorage();
    } finally {
      setProtecting(false);
    }
  };

  const selectBackup = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (file === undefined) {
      return;
    }
    try {
      setBusy(true);
      setActionError(null);
      setPlan(await inspectBackupFile(await file.text()));
      setOpenPanel("import");
    } catch (cause: unknown) {
      setMessage(
        cause instanceof Error
          ? `El archivo no es válido: ${cause.message}`
          : "El archivo no es un backup válido de Austral.",
      );
      setOpenPanel("message");
    } finally {
      setBusy(false);
    }
  };

  const confirmImport = async (mode: BackupImportMode) => {
    if (plan === null) {
      return;
    }
    const warning =
      mode === "replace"
        ? "Se reemplazarán todos los datos actuales. ¿Continuar?"
        : "Se agregarán solamente los datos que no existan. ¿Continuar?";
    if (!window.confirm(warning)) {
      return;
    }
    try {
      setBusy(true);
      await importBackup(plan, mode);
      await refresh();
      setPlan(null);
      setMessage("El respaldo se importó correctamente.");
      setOpenPanel("message");
    } catch (cause: unknown) {
      setMessage(friendlyStorageError(cause).message);
      setOpenPanel("message");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="screen flex min-h-full flex-col">
      <TopHeader />
      <h1 className="mb-5 mt-8 text-[19px] font-semibold">Ajustes</h1>

      <div>
        <SettingsItem
          icon={WalletCards}
          label="Presupuesto mensual"
          onClick={openBudget}
        />
        <SettingsItem
          icon={Shapes}
          label="Categorías"
          onClick={() => setOpenPanel("categories")}
        />
        <SettingsItem
          icon={ShieldCheck}
          label="Seguridad de los datos"
          onClick={openSecurity}
        />
        <SettingsItem
          disabled={busy}
          icon={Upload}
          label="Crear respaldo"
          onClick={() => void exportBackup()}
        />
        <SettingsItem
          disabled={busy}
          icon={Download}
          label="Importar respaldo"
          onClick={() => fileInput.current?.click()}
        />
        <input
          accept=".json,application/json"
          className="sr-only"
          onChange={(event) => void selectBackup(event)}
          ref={fileInput}
          type="file"
        />
      </div>

      {actionError === null ? null : (
        <p className="mt-4 text-xs text-red-700" role="alert">
          {actionError}
        </p>
      )}

      <p className="mt-8 pt-6 text-center text-[12px] text-[var(--muted)]">
        Tus datos se guardan en este dispositivo.
      </p>

      <div className="mt-auto space-y-1 pt-6 text-center text-[12px] text-[var(--muted)]">
        <p>
          Desarrollado por{" "}
          <a
            className="hover:underline"
            href="https://github.com/EnzoFernandezz11"
            rel="noopener noreferrer"
            target="_blank"
          >
            Enzo Fernández
          </a>
        </p>
      </div>

      {openPanel === "budget" ? (
        <Modal onClose={() => setOpenPanel(null)} title="Presupuesto mensual">
          <p className="text-sm text-[var(--muted)]">
            Definí cuánto querés destinar a gastos cada mes. Austral lo compara
            con tus gastos para mostrarte lo que queda disponible.
          </p>
          <p className="mt-3 text-sm text-[var(--muted)]">
            Actual:{" "}
            {settings.monthlyBudgetCents === undefined
              ? "sin configurar"
              : formatArs(settings.monthlyBudgetCents)}
          </p>
          <form className="mt-5" onSubmit={saveBudget}>
            <label className="text-xs font-medium" htmlFor="budget">
              Monto mensual en ARS
            </label>
            <MoneyInput
              autoFocus
              className="mt-1"
              id="budget"
              onValueChange={setBudget}
              placeholder="100.000"
              value={budget}
            />
            <div className="mt-5 grid grid-cols-2 gap-2">
              <button className="button-black" type="submit">
                Guardar
              </button>
              <button
                className="button-outline"
                onClick={() => {
                  void setMonthlyBudget();
                  setOpenPanel(null);
                }}
                type="button"
              >
                Quitar
              </button>
            </div>
          </form>
        </Modal>
      ) : null}

      {openPanel === "categories" ? (
        <Modal onClose={() => setOpenPanel(null)} title="Categorías">
          {categoryEditor === null ? (
            <>
              <ul className="max-h-64 overflow-y-auto">
                {categories.map((category) => (
                  <li
                    className="flex min-h-12 items-center gap-2 border-b text-sm last:border-b-0 hairline"
                    key={category.id}
                  >
                    <div className="min-w-0 flex-1">
                      <p className="truncate">{category.name}</p>
                      <p className="text-[10px] text-[var(--muted)]">
                        {category.type === "expense" ? "Gasto" : "Ingreso"}
                      </p>
                    </div>
                    <button
                      aria-label={`Editar ${category.name}`}
                      className="grid size-11 place-items-center"
                      onClick={() => openCategoryEditor(category)}
                      type="button"
                    >
                      <Pencil aria-hidden="true" size={15} />
                    </button>
                    <button
                      aria-label={`Eliminar ${category.name}`}
                      className="grid size-11 place-items-center text-red-700 disabled:opacity-40"
                      disabled={busy}
                      onClick={() => void removeCategory(category)}
                      type="button"
                    >
                      <Trash2 aria-hidden="true" size={15} />
                    </button>
                  </li>
                ))}
              </ul>
              <button
                className="button-black mt-5 w-full"
                onClick={() => openCategoryEditor()}
                type="button"
              >
                <Plus aria-hidden="true" size={16} />
                Agregar categoría
              </button>
            </>
          ) : (
            <form className="space-y-4" onSubmit={saveCategory}>
              <div>
                <label className="text-xs font-medium" htmlFor="category-name">
                  Nombre
                </label>
                <input
                  autoFocus
                  className="field mt-1"
                  id="category-name"
                  maxLength={80}
                  onChange={(event) => setCategoryName(event.target.value)}
                  required
                  value={categoryName}
                />
              </div>
              <div>
                <label className="text-xs font-medium" htmlFor="category-type">
                  Tipo
                </label>
                <select
                  className="field mt-1"
                  id="category-type"
                  onChange={(event) =>
                    setCategoryType(event.target.value as TransactionType)
                  }
                  value={categoryType}
                >
                  <option value="expense">Gasto</option>
                  <option value="income">Ingreso</option>
                </select>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <button className="button-black" disabled={busy} type="submit">
                  Guardar
                </button>
                <button
                  className="button-outline"
                  onClick={() => setCategoryEditor(null)}
                  type="button"
                >
                  Cancelar
                </button>
              </div>
            </form>
          )}
        </Modal>
      ) : null}

      {openPanel === "security" ? (
        <Modal
          onClose={() => setOpenPanel(null)}
          title="Seguridad de los datos"
        >
          <dl className="space-y-4 text-sm">
            <div>
              <dt className="text-[var(--muted)]">Protección local</dt>
              <dd className="mt-1 font-semibold">
                {storageHealth.persistence === "persistent"
                  ? "Protegido"
                  : storageHealth.persistence === "best-effort"
                    ? "Protección limitada"
                    : storageHealth.persistence === "unsupported"
                      ? "No compatible con este navegador"
                      : "No se pudo consultar"}
              </dd>
            </div>
            {storageHealth.usageBytes !== undefined &&
            storageHealth.quotaBytes !== undefined ? (
              <div>
                <dt className="text-[var(--muted)]">Espacio del navegador</dt>
                <dd className="mt-1 font-semibold">
                  {formatBytes(storageHealth.usageBytes)} de{" "}
                  {formatBytes(storageHealth.quotaBytes)} utilizados
                </dd>
                {isStorageAlmostFull(storageHealth) ? (
                  <p className="mt-1 text-xs text-amber-800">
                    El espacio disponible es bajo.
                  </p>
                ) : null}
              </div>
            ) : null}
            <div>
              <dt className="text-[var(--muted)]">Último respaldo</dt>
              <dd className="mt-1 font-semibold">
                {formatBackupDate(lastBackupAt)}
              </dd>
            </div>
          </dl>

          <p className="mt-5 text-xs leading-5 text-[var(--muted)]">
            La protección reduce el riesgo de limpieza automática, pero borrar
            la app o sus datos también elimina la información local.
          </p>

          {storageHealth.persistence === "persistent" ||
          storageHealth.persistence === "unsupported" ? null : (
            <button
              className="button-black mt-5 w-full"
              disabled={protecting}
              onClick={() => void protectStorage()}
              type="button"
            >
              {protecting ? "Solicitando…" : "Reintentar protección"}
            </button>
          )}
        </Modal>
      ) : null}

      {openPanel === "message" ? (
        <Modal onClose={() => setOpenPanel(null)} title="Respaldo">
          <p className="text-sm leading-5 text-[var(--muted)]">{message}</p>
          <button
            className="button-black mt-5 w-full"
            onClick={() => setOpenPanel(null)}
            type="button"
          >
            Entendido
          </button>
        </Modal>
      ) : null}

      {openPanel === "import" && plan !== null ? (
        <Modal onClose={() => setOpenPanel(null)} title="Importar respaldo">
          <dl className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <dt className="text-[var(--muted)]">Movimientos</dt>
              <dd className="numeric mt-1 font-semibold">
                {plan.transactionCount}
              </dd>
            </div>
            <div>
              <dt className="text-[var(--muted)]">Nuevos</dt>
              <dd className="numeric mt-1 font-semibold">
                {plan.newTransactionCount}
              </dd>
            </div>
            <div>
              <dt className="text-[var(--muted)]">Duplicados</dt>
              <dd className="numeric mt-1 font-semibold">
                {plan.duplicateTransactionCount}
              </dd>
            </div>
            <div>
              <dt className="text-[var(--muted)]">Categorías</dt>
              <dd className="numeric mt-1 font-semibold">
                {plan.categoryCount}
              </dd>
            </div>
          </dl>
          <div className="mt-5 space-y-2">
            <button
              className="button-black w-full"
              onClick={() => void confirmImport("merge")}
              type="button"
            >
              Combinar sin duplicados
            </button>
            <button
              className="button-outline w-full"
              onClick={() => void confirmImport("replace")}
              type="button"
            >
              Reemplazar todos los datos
            </button>
          </div>
        </Modal>
      ) : null}
    </div>
  );
}

function SettingsItem({
  icon: Icon,
  label,
  onClick,
  disabled = false,
}: {
  icon: LucideIcon;
  label: string;
  onClick: () => void;
  disabled?: boolean;
}) {
  return (
    <button
      className="flex min-h-[56px] w-full items-center gap-4 border-b text-left text-[15px] disabled:opacity-50 hairline"
      disabled={disabled}
      onClick={onClick}
      type="button"
    >
      <Icon aria-hidden="true" className="text-[var(--navy)]" size={17} />
      <span>{label}</span>
      <ChevronRight
        aria-hidden="true"
        className="ml-auto text-[#c8cdcf]"
        size={15}
      />
    </button>
  );
}

function Modal({
  title,
  children,
  onClose,
}: {
  title: string;
  children: React.ReactNode;
  onClose: () => void;
}) {
  return (
    <div className="phone-overlay z-50 grid items-end bg-black/20 p-3 sm:items-center">
      <section
        aria-labelledby="modal-title"
        aria-modal="true"
        className="rounded-[14px] border bg-[var(--paper)] p-5 shadow-xl hairline"
        role="dialog"
      >
        <div className="mb-5 flex min-h-11 items-center justify-between">
          <h2 className="text-lg font-semibold" id="modal-title">
            {title}
          </h2>
          <button
            aria-label="Cerrar"
            className="grid size-11 place-items-center"
            onClick={onClose}
            type="button"
          >
            <X aria-hidden="true" size={19} />
          </button>
        </div>
        {children}
      </section>
    </div>
  );
}
