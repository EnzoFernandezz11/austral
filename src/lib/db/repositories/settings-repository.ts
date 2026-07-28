import { getDatabase, type StoredSettings } from "@/lib/db/database";
import { DEFAULT_SETTINGS } from "@/lib/db/defaults";
import { appSettingsSchema } from "@/lib/validation/settings";
import type { AppSettings } from "@/types/finance";

function toStored(settings: AppSettings): StoredSettings {
  return { id: "app", ...settings };
}

function fromStored(settings: StoredSettings): AppSettings {
  const base: AppSettings = {
    schemaVersion: settings.schemaVersion,
    preferredCurrency: settings.preferredCurrency,
    theme: settings.theme,
  };
  return settings.monthlyBudgetCents === undefined
    ? base
    : { ...base, monthlyBudgetCents: settings.monthlyBudgetCents };
}

export const settingsRepository = {
  async get(): Promise<AppSettings> {
    const stored = await getDatabase().settings.get("app");
    return stored === undefined ? DEFAULT_SETTINGS : fromStored(stored);
  },

  async save(settings: AppSettings): Promise<void> {
    const validSettings = appSettingsSchema.parse(settings);
    await getDatabase().settings.put(toStored(validSettings));
  },

  async setMonthlyBudget(monthlyBudgetCents?: number): Promise<AppSettings> {
    const current = await this.get();
    const updated: AppSettings =
      monthlyBudgetCents === undefined
        ? {
            schemaVersion: current.schemaVersion,
            preferredCurrency: current.preferredCurrency,
            theme: current.theme,
          }
        : { ...current, monthlyBudgetCents };

    await this.save(updated);
    return updated;
  },
};
