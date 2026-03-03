import { z } from "zod";

function normalizeAmountInput(value: unknown): unknown {
  if (typeof value !== "string") {
    return value;
  }

  const trimmed = value.trim();
  if (trimmed.length === 0) {
    return undefined;
  }

  const normalized = trimmed.includes(",")
    ? trimmed.replace(/\./g, "").replace(",", ".")
    : trimmed;

  const parsed = Number(normalized);
  return Number.isFinite(parsed) ? parsed : Number.NaN;
}

export const transactionSchema = z.object({
  description: z
    .string()
    .trim()
    .min(1, "Descrição é obrigatória.")
    .max(200, "Descrição deve ter no máximo 200 caracteres."),
  amount: z.preprocess(
    normalizeAmountInput,
    z
      .number({
        required_error: "Valor é obrigatório.",
        invalid_type_error: "Valor inválido.",
      })
      .gt(0, "Valor deve ser maior que zero."),
  ),
  date: z.string().min(1, "Data é obrigatória."),
  categoryId: z
    .string()
    .trim()
    .min(1, "Categoria é obrigatória.")
    .uuid("Categoria inválida."),
});

export type TransactionFormValues = z.infer<typeof transactionSchema>;
