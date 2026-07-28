import { getDatabase } from "@/lib/db/database";
import { DEFAULT_CATEGORIES } from "@/lib/db/defaults";
import { categorySchema } from "@/lib/validation/category";
import type { Category, TransactionType } from "@/types/finance";

const DEFAULT_ORDER = new Map(
  DEFAULT_CATEGORIES.map((category, index) => [category.id, index]),
);

export const categoryRepository = {
  async list(): Promise<Category[]> {
    const categories = await getDatabase().categories.toArray();
    return categories.sort((left, right) => {
      const leftOrder = DEFAULT_ORDER.get(left.id) ?? Number.MAX_SAFE_INTEGER;
      const rightOrder = DEFAULT_ORDER.get(right.id) ?? Number.MAX_SAFE_INTEGER;
      return leftOrder - rightOrder || left.name.localeCompare(right.name);
    });
  },

  async addMissing(categories: readonly Category[]): Promise<void> {
    const database = getDatabase();
    const existingIds = new Set(
      (await database.categories.toArray()).map((category) => category.id),
    );
    const missing = categories.filter(
      (category) => !existingIds.has(category.id),
    );

    if (missing.length > 0) {
      await database.categories.bulkAdd([...missing]);
    }
  },

  async create(name: string, type: TransactionType): Promise<Category> {
    const category = categorySchema.parse({
      id: crypto.randomUUID(),
      name,
      icon: "Tag",
      color: type === "income" ? "#40916c" : "#6c757d",
      type,
      isDefault: false,
    });
    await getDatabase().categories.add(category);
    return category;
  },

  async update(
    id: string,
    name: string,
    type: TransactionType,
  ): Promise<Category | undefined> {
    const database = getDatabase();
    const current = await database.categories.get(id);
    if (current === undefined) {
      return undefined;
    }

    if (current.type !== type) {
      const transactionCount = await database.transactions
        .where("categoryId")
        .equals(id)
        .count();
      if (transactionCount > 0) {
        throw new Error(
          "No podés cambiar el tipo de una categoría que ya tiene movimientos.",
        );
      }
    }

    const category = categorySchema.parse({ ...current, name, type });
    await database.categories.put(category);
    return category;
  },

  async remove(id: string): Promise<void> {
    const database = getDatabase();
    const transactionCount = await database.transactions
      .where("categoryId")
      .equals(id)
      .count();
    if (transactionCount > 0) {
      throw new Error(
        "No podés eliminar una categoría que tiene movimientos. Editá o eliminá esos movimientos primero.",
      );
    }
    await database.categories.delete(id);
  },
};
