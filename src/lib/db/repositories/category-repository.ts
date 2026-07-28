import { getDatabase } from "@/lib/db/database";
import { DEFAULT_CATEGORIES } from "@/lib/db/defaults";
import type { Category } from "@/types/finance";

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
};
