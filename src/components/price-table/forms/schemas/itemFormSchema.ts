
import { z } from "zod";

export const itemFormSchema = z.object({
  name: z.string().min(1, "Nome é obrigatório"),
  description: z.string().optional(),
  price: z.union([
    z.number().min(0, "Preço deve ser um número positivo"),
    z.string().transform((val, ctx) => {
      const parsed = parseFloat(val);
      if (isNaN(parsed)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Preço inválido",
        });
        return z.NEVER;
      }
      return parsed;
    }),
  ]),
  type: z.string().min(1, "Tipo é obrigatório"),
  subtype: z.string().optional(),
  specs: z.array(z.string()).optional(),
  tags: z.array(z.string()).optional(),
  capacity: z.string().optional(), // Explicitly include capacity
  // Include metadata to avoid validation errors
  metadata: z.any().optional(),
});

export type FormValues = z.infer<typeof itemFormSchema>;
