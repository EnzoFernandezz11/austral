import { z } from "zod";
import { categorySchema } from "@/lib/validation/category";
import { appSettingsSchema } from "@/lib/validation/settings";
import { transactionSchema } from "@/lib/validation/transaction";

export const BACKUP_FORMAT_VERSION = 1;

export const backupSchema = z
  .object({
    formatVersion: z.literal(BACKUP_FORMAT_VERSION),
    app: z.literal("Austral"),
    exportedAt: z.string().datetime({ offset: true }),
    data: z
      .object({
        transactions: z.array(transactionSchema),
        categories: z.array(categorySchema),
        settings: appSettingsSchema,
      })
      .strict(),
  })
  .strict();

export type AustralBackup = z.infer<typeof backupSchema>;
