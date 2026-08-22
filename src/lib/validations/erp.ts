import { z } from "zod";
import { isValidCPF, isValidCNPJ } from "@/lib/utils/cpf-cnpj";

export const servicoCategoriaEnum = z.enum([
  "portaria",
  "controle_acesso",
  "limpeza",
  "zeladoria",
  "jardinagem",
  "ronda_interna",
  "seguranca_patrimonial",
  "facilities",
]);

export const funcionarioSchema = z.object({
  nomeCompleto: z.string().min(3, "Informe o nome completo"),
  cpf: z
    .string()
    .transform((v) => v.replace(/\D/g, ""))
    .refine(isValidCPF, "CPF inválido"),
  rg: z.string().optional(),
  dataNascimento: z.string().optional(),
  dataAdmissao: z.string().min(1, "Informe a data de admissão"),
  cargo: z.string().min(2, "Informe o cargo"),
  categoria: servicoCategoriaEnum,
  salarioBase: z.coerce.number().min(0).optional(),
  pixKey: z.string().optional(),
});
export type FuncionarioInput = z.infer<typeof funcionarioSchema>;

export const clienteSchema = z.object({
  razaoSocial: z.string().min(3, "Informe a razão social"),
  nomeFantasia: z.string().optional(),
  cnpj: z
    .string()
    .transform((v) => v.replace(/\D/g, ""))
    .refine(isValidCNPJ, "CNPJ inválido"),
  emailContato: z.string().email("E-mail inválido"),
  telefone: z.string().optional(),
});
export type ClienteInput = z.infer<typeof clienteSchema>;

export const uploadHoleriteSchema = z.object({
  funcionarioId: z.string().uuid("Selecione um funcionário"),
  competencia: z.string().min(1, "Informe a competência"),
  proventos: z.coerce.number().min(0),
  descontos: z.coerce.number().min(0),
  inss: z.coerce.number().min(0),
  irrf: z.coerce.number().min(0),
  liquido: z.coerce.number().min(0),
});
export type UploadHoleriteInput = z.infer<typeof uploadHoleriteSchema>;

export const contratoStatusEnum = z.enum(["ativo", "suspenso", "encerrado", "em_negociacao"]);

export const contratoSchema = z.object({
  numero: z.string().min(3, "Informe o número do contrato"),
  clienteId: z.string().uuid("Selecione um cliente"),
  servicos: z.array(servicoCategoriaEnum).min(1, "Selecione ao menos um serviço"),
  status: contratoStatusEnum.default("em_negociacao"),
  dataInicio: z.string().min(1, "Informe a data de início"),
  dataFim: z.string().optional(),
  valorMensal: z.coerce.number().min(0).optional(),
  postosContratados: z.coerce.number().min(1).default(1),
});
export type ContratoInput = z.infer<typeof contratoSchema>;

export const atribuirPapelSchema = z.object({
  email: z.string().email("E-mail inválido"),
  role: z.enum(["master", "administrador", "rh", "supervisor", "cliente", "funcionario"]),
});
export type AtribuirPapelInput = z.infer<typeof atribuirPapelSchema>;

export const uploadPontoLoteSchema = z.object({
  csv: z.string().min(1, "Cole ou envie o CSV de registros de ponto"),
});
export type UploadPontoLoteInput = z.infer<typeof uploadPontoLoteSchema>;
