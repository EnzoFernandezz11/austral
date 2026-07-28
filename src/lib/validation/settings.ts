import { z } from "zod";

export const appSettingsSchema = z
  .object({
    schemaVersion: z.number().int().positive(),
    monthlyBudgetCents: z.number().int().nonnegative().safe().optional(),
    preferredCurrency: z.literal("ARS"),
    theme: z.literal("light"),
  })
  .strict();
