
import { z } from "zod";

// Define schema with explicit typing for specs as string[]
export const itemFormSchema = z.object({
  name: z.string()
    .min(3, { message: "Nome do item deve ter pelo menos 3 caracteres" })
    .trim(),
  description: z.string()
    .min(3, { message: "Descrição deve ter pelo menos 3 caracteres" })
    .trim(),
  price: z.coerce.number()
    .min(0, { message: "Preço deve ser maior ou igual a zero" })
    .nonnegative({ message: "Preço não pode ser negativo" }),
  type: z.string()
    .min(1, { message: "Tipo é obrigatório" })
    .trim(),
  subtype: z.string().optional(),
  specs: z.preprocess(
    // Ensure input is transformed into array
    (val): string[] => {
      if (typeof val === 'string') {
        return val.split('\n').filter(Boolean).map(line => line.trim());
      }
      if (Array.isArray(val)) {
        return val.filter(Boolean).map(line => 
          typeof line === 'string' ? line.trim() : String(line)
        );
      }
      return [];
    },
    z.array(z.string())
  ),
  tags: z.array(z.string()).default([]), // Added tags field
});

export type FormValues = z.infer<typeof itemFormSchema>;
