import { z } from "zod";
import {
  amountCentsSchema,
  isoDateTimeSchema,
  localDateSchema,
} from "@/lib/validation/common";

export const transactionTypeSchema = z.enum(["expense", "income"]);

export const transactionSchema = z
  .object({
    id: z.string().uuid("El identificador del movimiento no es válido"),
    type: transactionTypeSchema,
    amountCents: amountCentsSchema,
    currency: z.literal("ARS"),
    categoryId: z.string().trim().min(1, "La categoría es obligatoria"),
    note: z.string().trim().max(240, "La nota es demasiado larga").optional(),
    occurredOn: localDateSchema,
    createdAt: isoDateTimeSchema,
    updatedAt: isoDateTimeSchema,
  })
  .strict();

export const transactionDraftSchema = transactionSchema
  .omit({
    id: true,
    currency: true,
    createdAt: true,
    updatedAt: true,
  })
  .strict();
