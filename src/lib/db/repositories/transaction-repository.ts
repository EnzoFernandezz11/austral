import { getDatabase } from "@/lib/db/database";
import { transactionDraftSchema } from "@/lib/validation/transaction";
import type { Transaction, TransactionDraft } from "@/types/finance";

function byNewest(left: Transaction, right: Transaction): number {
  const dateComparison = right.occurredOn.localeCompare(left.occurredOn);
  return dateComparison !== 0
    ? dateComparison
    : right.createdAt.localeCompare(left.createdAt);
}

export const transactionRepository = {
  async list(): Promise<Transaction[]> {
    const movements = await getDatabase().transactions.toArray();
    return movements.sort(byNewest);
  },

  async get(id: string): Promise<Transaction | undefined> {
    return getDatabase().transactions.get(id);
  },

  async create(draft: TransactionDraft): Promise<Transaction> {
    const validDraft = transactionDraftSchema.parse(draft);
    const now = new Date().toISOString();
    const movement: Transaction = {
      id: crypto.randomUUID(),
      ...validDraft,
      currency: "ARS",
      createdAt: now,
      updatedAt: now,
    };

    await getDatabase().transactions.add(movement);
    return movement;
  },

  async update(
    id: string,
    draft: TransactionDraft,
  ): Promise<Transaction | undefined> {
    const database = getDatabase();
    const current = await database.transactions.get(id);
    if (current === undefined) {
      return undefined;
    }

    const validDraft = transactionDraftSchema.parse(draft);
    const updated: Transaction = {
      ...current,
      ...validDraft,
      updatedAt: new Date().toISOString(),
    };
    await database.transactions.put(updated);
    return updated;
  },

  async remove(id: string): Promise<void> {
    await getDatabase().transactions.delete(id);
  },
};
