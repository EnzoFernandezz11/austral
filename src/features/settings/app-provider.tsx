"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { initializeDatabase, resetDevelopmentData } from "@/lib/db/bootstrap";
import { DEFAULT_SETTINGS } from "@/lib/db/defaults";
import { appDataRepository } from "@/lib/db/repositories/app-data-repository";
import { categoryRepository } from "@/lib/db/repositories/category-repository";
import { metadataRepository } from "@/lib/db/repositories/metadata-repository";
import { settingsRepository } from "@/lib/db/repositories/settings-repository";
import { transactionRepository } from "@/lib/db/repositories/transaction-repository";
import {
  friendlyStorageError,
  INITIAL_STORAGE_HEALTH,
  inspectStorageHealth,
  requestPersistentStorage as persistStorage,
  type StorageHealth,
} from "@/lib/storage/storage-service";
import type {
  AppSettings,
  Category,
  Transaction,
  TransactionDraft,
  TransactionType,
} from "@/types/finance";

type AppStatus = "loading" | "ready" | "error";

type AppContextValue = {
  status: AppStatus;
  error: string | null;
  transactions: Transaction[];
  categories: Category[];
  settings: AppSettings;
  storageHealth: StorageHealth;
  lastBackupAt: string | null;
  refresh: () => Promise<void>;
  refreshStorageHealth: () => Promise<void>;
  requestPersistentStorage: () => Promise<void>;
  recordBackup: (exportedAt: string) => Promise<void>;
  saveTransaction: (draft: TransactionDraft, id?: string) => Promise<void>;
  deleteTransaction: (id: string) => Promise<void>;
  setMonthlyBudget: (amountCents?: number) => Promise<void>;
  saveCategory: (
    name: string,
    type: TransactionType,
    id?: string,
  ) => Promise<void>;
  deleteCategory: (id: string) => Promise<void>;
  clearTransactions: () => Promise<void>;
  restoreDevelopmentData: () => Promise<void>;
};

const AppContext = createContext<AppContextValue | null>(null);

async function runStorageMutation(operation: () => Promise<void>) {
  try {
    await operation();
  } catch (cause: unknown) {
    throw friendlyStorageError(cause);
  }
}

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [status, setStatus] = useState<AppStatus>("loading");
  const [error, setError] = useState<string | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [settings, setSettings] = useState<AppSettings>(DEFAULT_SETTINGS);
  const [storageHealth, setStorageHealth] = useState<StorageHealth>(
    INITIAL_STORAGE_HEALTH,
  );
  const [lastBackupAt, setLastBackupAt] = useState<string | null>(null);
  const refreshVersion = useRef(0);

  const refresh = useCallback(async () => {
    const version = ++refreshVersion.current;
    const [movements, availableCategories, appSettings] = await Promise.all([
      transactionRepository.list(),
      categoryRepository.list(),
      settingsRepository.get(),
    ]);

    // Mutations can trigger overlapping reads. Ignore an older response that
    // arrives after a more recent refresh, otherwise the UI may briefly (or
    // permanently) show a stale list of movements.
    if (version !== refreshVersion.current) {
      return;
    }

    setTransactions(movements);
    setCategories(availableCategories);
    setSettings(appSettings);
    setError(null);
    setStatus("ready");
  }, []);

  const refreshStorageHealth = useCallback(async () => {
    setStorageHealth(await inspectStorageHealth());
  }, []);

  const requestPersistentStorage = useCallback(async () => {
    setStorageHealth(await persistStorage());
  }, []);

  const recordBackup = useCallback(async (exportedAt: string) => {
    await runStorageMutation(() =>
      metadataRepository.setLastBackupAt(exportedAt),
    );
    setLastBackupAt(exportedAt);
  }, []);

  useEffect(() => {
    let active = true;

    const load = async () => {
      try {
        await initializeDatabase();
        if (active) {
          await refresh();
        }

        void persistStorage().then((health) => {
          if (active) {
            setStorageHealth(health);
          }
        });
        void metadataRepository
          .getLastBackupAt()
          .then((storedLastBackupAt) => {
            if (active) {
              setLastBackupAt(storedLastBackupAt);
            }
          })
          .catch(() => undefined);
      } catch (cause: unknown) {
        if (active) {
          setError(friendlyStorageError(cause).message);
          setStatus("error");
        }
      }
    };

    void load();
    return () => {
      active = false;
    };
  }, [refresh]);

  const saveTransaction = useCallback(
    async (draft: TransactionDraft, id?: string) => {
      await runStorageMutation(async () => {
        if (id === undefined) {
          await transactionRepository.create(draft);
        } else {
          await transactionRepository.update(id, draft);
        }
      });
      await refresh();
    },
    [refresh],
  );

  const deleteTransaction = useCallback(
    async (id: string) => {
      await runStorageMutation(() => transactionRepository.remove(id));
      await refresh();
    },
    [refresh],
  );

  const setMonthlyBudget = useCallback(
    async (amountCents?: number) => {
      await runStorageMutation(() =>
        settingsRepository.setMonthlyBudget(amountCents).then(() => undefined),
      );
      await refresh();
    },
    [refresh],
  );

  const saveCategory = useCallback(
    async (name: string, type: TransactionType, id?: string) => {
      await runStorageMutation(async () => {
        if (id === undefined) {
          await categoryRepository.create(name, type);
        } else {
          await categoryRepository.update(id, name, type);
        }
      });
      await refresh();
    },
    [refresh],
  );

  const deleteCategory = useCallback(
    async (id: string) => {
      await runStorageMutation(() => categoryRepository.remove(id));
      await refresh();
    },
    [refresh],
  );

  const clearTransactions = useCallback(async () => {
    await runStorageMutation(() => appDataRepository.clearTransactions());
    await refresh();
  }, [refresh]);

  const restoreDevelopmentData = useCallback(async () => {
    await resetDevelopmentData();
    await refresh();
  }, [refresh]);

  const value = useMemo<AppContextValue>(
    () => ({
      status,
      error,
      transactions,
      categories,
      settings,
      storageHealth,
      lastBackupAt,
      refresh,
      refreshStorageHealth,
      requestPersistentStorage,
      recordBackup,
      saveTransaction,
      deleteTransaction,
      setMonthlyBudget,
      saveCategory,
      deleteCategory,
      clearTransactions,
      restoreDevelopmentData,
    }),
    [
      status,
      error,
      transactions,
      categories,
      settings,
      storageHealth,
      lastBackupAt,
      refresh,
      refreshStorageHealth,
      requestPersistentStorage,
      recordBackup,
      saveTransaction,
      deleteTransaction,
      setMonthlyBudget,
      saveCategory,
      deleteCategory,
      clearTransactions,
      restoreDevelopmentData,
    ],
  );

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useAppData(): AppContextValue {
  const context = useContext(AppContext);
  if (context === null) {
    throw new Error("useAppData debe usarse dentro de AppProvider.");
  }
  return context;
}
