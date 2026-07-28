import { getDatabase } from "@/lib/db/database";
import {
  CURRENT_SCHEMA_VERSION,
  DEFAULT_CATEGORIES,
  DEFAULT_SETTINGS,
} from "@/lib/db/defaults";
import { createDevelopmentTransactions } from "@/lib/db/mock-data";

export async function initializeDatabase(): Promise<void> {
  const database = getDatabase();
  await database.open();

  await database.transaction(
    "rw",
    [database.categories, database.settings, database.transactions],
    async () => {
      const [categoryCount, settings, transactionCount] = await Promise.all([
        database.categories.count(),
        database.settings.get("app"),
        database.transactions.count(),
      ]);

      if (categoryCount === 0) {
        await database.categories.bulkAdd([...DEFAULT_CATEGORIES]);
      }

      if (settings === undefined) {
        const initialSettings =
          process.env.NODE_ENV === "development"
            ? { ...DEFAULT_SETTINGS, monthlyBudgetCents: 100_000_00 }
            : DEFAULT_SETTINGS;
        await database.settings.add({
          id: "app",
          ...initialSettings,
          schemaVersion: CURRENT_SCHEMA_VERSION,
        });
      }

      if (process.env.NODE_ENV === "development" && transactionCount === 0) {
        await database.transactions.bulkAdd(createDevelopmentTransactions());
      }
    },
  );
}

export async function resetDevelopmentData(): Promise<void> {
  if (process.env.NODE_ENV !== "development") {
    throw new Error("Los datos mock solo están disponibles en desarrollo.");
  }

  const database = getDatabase();
  await database.transaction("rw", database.transactions, async () => {
    await database.transactions.clear();
    await database.transactions.bulkAdd(createDevelopmentTransactions());
  });
}
