import { z } from "zod";

export const categorySchema = z.object({
  name: z.string().trim().min(1, "Nome é obrigatório.").max(120, "Nome deve ter até 120 caracteres."),
  type: z.enum(["INCOME", "EXPENSE"], {
    message: "Tipo inválido.",
  }),
});

export type CategoryFormValues = z.infer<typeof categorySchema>;

