import { z } from "zod";
import { transactionTypeSchema } from "@/lib/validation/transaction";

export const categorySchema = z
  .object({
    id: z.string().trim().min(1),
    name: z.string().trim().min(1).max(80),
    icon: z.string().trim().min(1).max(80),
    color: z.string().regex(/^#[0-9a-fA-F]{6}$/),
    type: z.union([transactionTypeSchema, z.literal("both")]),
    isDefault: z.boolean(),
  })
  .strict();
