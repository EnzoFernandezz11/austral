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
        if (snapshot.transactions.length > 0) {
          await database.transactions.bulkAdd(snapshot.transactions);
        }
        if (snapshot.categories.length > 0) {
          await database.categories.bulkAdd(snapshot.categories);
        }
      },
    );
  },

  async clearTransactions(): Promise<void> {
    await getDatabase().transactions.clear();
  },
};
