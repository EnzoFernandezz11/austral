import { backupSchema, type AustralBackup } from "@/lib/validation/backup";
import type { Category, FinanceSnapshot, Transaction } from "@/types/finance";

export type BackupImportMode = "replace" | "merge";

export type BackupImportPlan = {
  backup: AustralBackup;
  transactionCount: number;
  categoryCount: number;
  duplicateTransactionCount: number;
  newTransactionCount: number;
};

export function parseBackup(input: string): AustralBackup {
  const parsedJson: unknown = JSON.parse(input);
  return backupSchema.parse(parsedJson);
}

export function createBackup(snapshot: FinanceSnapshot): AustralBackup {
  return backupSchema.parse({
    formatVersion: 1,
    app: "Austral",
    exportedAt: new Date().toISOString(),
    data: snapshot,
  });
}

export function deduplicateTransactions(
  existing: readonly Transaction[],
  incoming: readonly Transaction[],
): Transaction[] {
  const knownIds = new Set(existing.map((transaction) => transaction.id));
  const uniqueIncoming: Transaction[] = [];

  for (const transaction of incoming) {
    if (!knownIds.has(transaction.id)) {
      knownIds.add(transaction.id);
      uniqueIncoming.push(transaction);
    }
  }

  return uniqueIncoming;
}

export function deduplicateCategories(
  existing: readonly Category[],
  incoming: readonly Category[],
): Category[] {
  const knownIds = new Set(existing.map((category) => category.id));
  return incoming.filter((category) => {
    if (knownIds.has(category.id)) {
      return false;
    }
    knownIds.add(category.id);
    return true;
  });
}

export function planBackupImport(
  backup: AustralBackup,
  current: FinanceSnapshot,
): BackupImportPlan {
  const uniqueTransactions = deduplicateTransactions(
    current.transactions,
    backup.data.transactions,
  );

  return {
    backup,
    transactionCount: backup.data.transactions.length,
    categoryCount: backup.data.categories.length,
    duplicateTransactionCount:
      backup.data.transactions.length - uniqueTransactions.length,
    newTransactionCount: uniqueTransactions.length,
  };
}

export function snapshotForMerge(
  plan: BackupImportPlan,
  current: FinanceSnapshot,
): FinanceSnapshot {
  return {
    transactions: deduplicateTransactions(
      current.transactions,
      plan.backup.data.transactions,
    ),
    categories: deduplicateCategories(
      current.categories,
      plan.backup.data.categories,
    ),
    settings: current.settings,
  };
}
