import {
  createBackup,
  parseBackup,
  planBackupImport,
  snapshotForMerge,
  type BackupImportMode,
  type BackupImportPlan,
} from "@/features/backup/backup-domain";
import { appDataRepository } from "@/lib/db/repositories/app-data-repository";
import type { FinanceSnapshot, Transaction } from "@/types/finance";

function downloadText(
  contents: string,
  filename: string,
  mimeType: string,
): void {
  const blob = new Blob([contents], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}

function exportDate(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function escapeCsv(value: string): string {
  return `"${value.replaceAll('"', '""')}"`;
}

export async function exportJsonBackup(): Promise<void> {
  const snapshot = await appDataRepository.getSnapshot();
  const backup = createBackup(snapshot);
  downloadText(
    JSON.stringify(backup, null, 2),
    `austral-backup-${exportDate()}.json`,
    "application/json;charset=utf-8",
  );
}

export async function inspectBackupFile(
  contents: string,
): Promise<BackupImportPlan> {
  const backup = parseBackup(contents);
  const current = await appDataRepository.getSnapshot();
  return planBackupImport(backup, current);
}

export async function importBackup(
  plan: BackupImportPlan,
  mode: BackupImportMode,
): Promise<void> {
  if (mode === "replace") {
    await appDataRepository.replaceAll(plan.backup.data);
    return;
  }

  const current = await appDataRepository.getSnapshot();
  await appDataRepository.merge(snapshotForMerge(plan, current));
}

export async function exportTransactionsCsv(): Promise<void> {
  const snapshot = await appDataRepository.getSnapshot();
  const header = [
    "id",
    "tipo",
    "monto_centavos",
    "moneda",
    "categoria_id",
    "fecha",
    "nota",
    "creado",
    "actualizado",
  ];
  const rows = snapshot.transactions.map((transaction) =>
    transactionToCsvRow(transaction),
  );
  const csv = [header, ...rows]
    .map((row) => row.map(escapeCsv).join(","))
    .join("\n");

  downloadText(
    `\uFEFF${csv}`,
    `austral-movimientos-${exportDate()}.csv`,
    "text/csv;charset=utf-8",
  );
}

function transactionToCsvRow(transaction: Transaction): string[] {
  return [
    transaction.id,
    transaction.type,
    String(transaction.amountCents),
    transaction.currency,
    transaction.categoryId,
    transaction.occurredOn,
    transaction.note ?? "",
    transaction.createdAt,
    transaction.updatedAt,
  ];
}

export function backupPlanSnapshot(plan: BackupImportPlan): FinanceSnapshot {
  return plan.backup.data;
}
