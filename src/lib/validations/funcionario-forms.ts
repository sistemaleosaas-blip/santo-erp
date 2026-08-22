import { z } from "zod";

export const solicitarFeriasSchema = z
  .object({
    periodoAquisitivoInicio: z.string().min(1, "Informe o início do período aquisitivo"),
    periodoAquisitivoFim: z.string().min(1, "Informe o fim do período aquisitivo"),
    dataInicio: z.string().min(1, "Informe a data de início das férias"),
    dataFim: z.string().min(1, "Informe a data de fim das férias"),
    observacoesFuncionario: z.string().optional(),
  })
  .refine((d) => d.dataFim >= d.dataInicio, {
    message: "A data de fim deve ser igual ou posterior à data de início",
    path: ["dataFim"],
  });
export type SolicitarFeriasInput = z.infer<typeof solicitarFeriasSchema>;

export const atualizacaoCadastralSchema = z.object({
  campo: z.enum(["endereco", "telefone", "pix_key", "contato_emergencia"]),
  valorProposto: z.string().min(1, "Informe o novo valor"),
});
export type AtualizacaoCadastralInput = z.infer<typeof atualizacaoCadastralSchema>;
