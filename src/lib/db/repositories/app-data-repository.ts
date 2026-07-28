import { getDatabase } from "@/lib/db/database";
import type { FinanceSnapshot } from "@/types/finance";

export const appDataRepository = {
  async getSnapshot(): Promise<FinanceSnapshot> {
    const database = getDatabase();
    const [transactions, categories, storedSettings] = await Promise.all([
      database.transactions.toArray(),
      database.categories.toArray(),
      database.settings.get("app"),
    ]);

    if (storedSettings === undefined) {
      throw new Error("No se encontraron los ajustes de Austral.");
    }

    const settings =
      storedSettings.monthlyBudgetCents === undefined
        ? {
            schemaVersion: storedSettings.schemaVersion,
            preferredCurrency: storedSettings.preferredCurrency,
            theme: storedSettings.theme,
          }
        : {
            schemaVersion: storedSettings.schemaVersion,
            preferredCurrency: storedSettings.preferredCurrency,
            theme: storedSettings.theme,
            monthlyBudgetCents: storedSettings.monthlyBudgetCents,
          };
    return { transactions, categories, settings };
  },

  async replaceAll(snapshot: FinanceSnapshot): Promise<void> {
    const database = getDatabase();
    await database.transaction(
      "rw",
      [database.transactions, database.categories, database.settings],
      async () => {
        await Promise.all([
          database.transactions.clear(),
          database.categories.clear(),
          database.settings.clear(),
        ]);
        await database.transactions.bulkAdd(snapshot.transactions);
        await database.categories.bulkAdd(snapshot.categories);
        await database.settings.add({ id: "app", ...snapshot.settings });
      },
    );
  },

  async merge(snapshot: FinanceSnapshot): Promise<void> {
    const database = getDatabase();
    await database.transaction(
      "rw",
      [database.transactions, database.categories],
      async () => {
        // The import preview is calculated before the user confirms it. A
        // second tab (or a double confirmation) can write the same backup in
        // between that preview and this transaction. Deduplicate again while
        // holding the IndexedDB write transaction so that merging remains
        // idempotent instead of failing with a primary-key constraint error.
        const existingTransactions = await database.transactions.bulkGet(
          snapshot.transactions.map((transaction) => transaction.id),
        );
        const existingTransactionIds = new Set(
          existingTransactions.flatMap((transaction) =>
            transaction === undefined ? [] : [transaction.id],
          ),
        );
        const newTransactions = snapshot.transactions.filter(
          (transaction) => !existingTransactionIds.has(transaction.id),
        );

        const existingCategories = await database.categories.bulkGet(
          snapshot.categories.map((category) => category.id),
        );
        const existingCategoryIds = new Set(
          existingCategories.flatMap((category) =>
            category === undefined ? [] : [category.id],
          ),
        );
        const newCategories = snapshot.categories.filter(
          (category) => !existingCategoryIds.has(category.id),
        );

        if (newTransactions.length > 0) {
          await database.transactions.bulkAdd(newTransactions);
        }
        if (newCategories.length > 0) {
          await database.categories.bulkAdd(newCategories);
        }
      },
    );
  },

  async clearTransactions(): Promise<void> {
    await getDatabase().transactions.clear();
  },
};
