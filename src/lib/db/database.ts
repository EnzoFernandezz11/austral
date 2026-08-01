import Dexie, { type EntityTable } from "dexie";
import type { AppSettings, Category, Transaction } from "@/types/finance";
import { CURRENT_SCHEMA_VERSION } from "@/lib/db/defaults";

export type StoredSettings = AppSettings & {
  id: "app";
};

export type StoredMetadata = {
  id: "local";
  lastBackupAt?: string | undefined;
};

class AustralDatabase extends Dexie {
  transactions!: EntityTable<Transaction, "id">;
  categories!: EntityTable<Category, "id">;
  settings!: EntityTable<StoredSettings, "id">;
  metadata!: EntityTable<StoredMetadata, "id">;

  constructor() {
    super("austral-finance");

    this.version(1).stores({
      transactions: "&id, occurredOn, type, categoryId, createdAt",
      categories: "&id, type, isDefault",
      settings: "&id",
    });

    this.version(2)
      .stores({
        transactions:
          "&id, occurredOn, type, categoryId, updatedAt, [type+occurredOn], [categoryId+occurredOn]",
        categories: "&id, type, isDefault",
        settings: "&id",
      })
      .upgrade(async (transaction) => {
        await transaction
          .table<Transaction>("transactions")
          .toCollection()
          .modify((movement) => {
            movement.amountCents = Math.round(movement.amountCents);
            movement.currency = "ARS";
            movement.updatedAt = movement.updatedAt || movement.createdAt;
          });

        await transaction
          .table<StoredSettings>("settings")
          .toCollection()
          .modify((settings) => {
            settings.schemaVersion = CURRENT_SCHEMA_VERSION;
          });
      });

    this.version(CURRENT_SCHEMA_VERSION)
      .stores({
        transactions:
          "&id, occurredOn, type, categoryId, updatedAt, [type+occurredOn], [categoryId+occurredOn]",
        categories: "&id, type, isDefault",
        settings: "&id",
        metadata: "&id",
      })
      .upgrade(async (transaction) => {
        await transaction
          .table<StoredSettings>("settings")
          .toCollection()
          .modify((settings) => {
            settings.schemaVersion = CURRENT_SCHEMA_VERSION;
          });
      });
  }
}

let database: AustralDatabase | undefined;

export function getDatabase(): AustralDatabase {
  if (typeof window === "undefined" || !("indexedDB" in window)) {
    throw new Error("IndexedDB solamente está disponible en el navegador.");
  }

  database ??= new AustralDatabase();
  return database;
}

export async function closeDatabase(): Promise<void> {
  if (database !== undefined) {
    database.close();
    database = undefined;
  }
}
