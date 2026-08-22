import { z } from "zod";
import { isValidCPF } from "@/lib/utils/cpf-cnpj";

/** Login do Portal do Funcionário: por CPF + senha. */
export const loginFuncionarioSchema = z.object({
  cpf: z
    .string()
    .min(11, "CPF inválido")
    .transform((v) => v.replace(/\D/g, ""))
    .refine(isValidCPF, "CPF inválido"),
  senha: z.string().min(6, "A senha deve ter ao menos 6 caracteres"),
});
export type LoginFuncionarioInput = z.infer<typeof loginFuncionarioSchema>;

/** Login do Portal do Cliente e da Área Administrativa: por e-mail + senha. */
export const loginEmailSchema = z.object({
  email: z.string().email("Informe um e-mail válido"),
  senha: z.string().min(6, "A senha deve ter ao menos 6 caracteres"),
});
export type LoginEmailInput = z.infer<typeof loginEmailSchema>;
