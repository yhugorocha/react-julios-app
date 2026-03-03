import { z } from "zod";

export const userSchema = z
  .object({
    name: z
      .string()
      .trim()
      .min(1, "Nome é obrigatório.")
      .max(120, "Nome deve ter no máximo 120 caracteres."),
    email: z.string().trim().email("E-mail inválido."),
    password: z
      .string()
      .min(8, "Senha deve ter no mínimo 8 caracteres.")
      .max(120, "Senha deve ter no máximo 120 caracteres."),
    confirmPassword: z.string().min(1, "Confirmação de senha é obrigatória."),
    role: z.enum(["ADMIN", "USER"], {
      message: "Perfil inválido.",
    }),
  })
  .superRefine((values, context) => {
    if (values.password !== values.confirmPassword) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["confirmPassword"],
        message: "As senhas não conferem.",
      });
    }
  });

export type UserFormValues = z.infer<typeof userSchema>;
