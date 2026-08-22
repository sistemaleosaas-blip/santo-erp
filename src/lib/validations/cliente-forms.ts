import { z } from "zod";

export const chamadoPrioridadeEnum = z.enum(["baixa", "media", "alta", "urgente"]);

export const novoChamadoSchema = z.object({
  contratoId: z.string().uuid().optional(),
  assunto: z.string().min(3, "Informe um assunto"),
  descricao: z.string().min(10, "Descreva melhor a solicitação"),
  prioridade: chamadoPrioridadeEnum.default("media"),
});
export type NovoChamadoInput = z.infer<typeof novoChamadoSchema>;

export const mensagemChamadoSchema = z.object({
  chamadoId: z.string().uuid(),
  mensagem: z.string().min(1, "Escreva uma mensagem"),
});
export type MensagemChamadoInput = z.infer<typeof mensagemChamadoSchema>;
