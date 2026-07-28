import { describe, expect, it } from "vitest";
import {
  createBackup,
  deduplicateTransactions,
  parseBackup,
  planBackupImport,
  snapshotForMerge,
} from "@/features/backup/backup-domain";
import { DEFAULT_CATEGORIES, DEFAULT_SETTINGS } from "@/lib/db/defaults";
import type { FinanceSnapshot, Transaction } from "@/types/finance";

const first: Transaction = {
  id: "10000000-0000-4000-8000-000000000001",
  type: "expense",
  amountCents: 12_345,
  currency: "ARS",
  categoryId: "expense-food",
  occurredOn: "2026-07-27",
  createdAt: "2026-07-27T12:00:00.000Z",
  updatedAt: "2026-07-27T12:00:00.000Z",
};

const second: Transaction = {
  ...first,
  id: "10000000-0000-4000-8000-000000000002",
  amountCents: 67_890,
};

function snapshot(transactions: Transaction[]): FinanceSnapshot {
  return {
    transactions,
    categories: [...DEFAULT_CATEGORIES],
    settings: DEFAULT_SETTINGS,
  };
}

describe("backups de Austral", () => {
  it("crea y valida un backup versionado", () => {
    const backup = createBackup(snapshot([first]));
    const parsed = parseBackup(JSON.stringify(backup));

    expect(parsed.formatVersion).toBe(1);
    expect(parsed.app).toBe("Austral");
    expect(parsed.data.transactions).toEqual([first]);
  });

  it("rechaza backups con montos no enteros", () => {
    const backup = createBackup(snapshot([first]));
    const invalid = {
      ...backup,
      data: {
        ...backup.data,
        transactions: [{ ...first, amountCents: 12.5 }],
      },
    };

    expect(() => parseBackup(JSON.stringify(invalid))).toThrow();
  });

  it("deduplica movimientos existentes y repetidos dentro del backup", () => {
    const incoming = [first, second, second];
    expect(deduplicateTransactions([first], incoming)).toEqual([second]);
  });

  it("resume la importación y prepara una combinación sin duplicados", () => {
    const current = snapshot([first]);
    const backup = createBackup(snapshot([first, second]));
    const plan = planBackupImport(backup, current);
    const mergedAdditions = snapshotForMerge(plan, current);

    expect(plan.transactionCount).toBe(2);
    expect(plan.duplicateTransactionCount).toBe(1);
    expect(plan.newTransactionCount).toBe(1);
    expect(mergedAdditions.transactions).toEqual([second]);
    expect(mergedAdditions.categories).toEqual([]);
    expect(mergedAdditions.settings).toEqual(current.settings);
  });
});
