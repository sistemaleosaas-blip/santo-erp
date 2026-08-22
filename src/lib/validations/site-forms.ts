import { z } from "zod";

export const contatoComercialSchema = z.object({
  nome: z.string().min(2, "Informe seu nome completo"),
  email: z.string().email("E-mail inválido"),
  telefone: z.string().min(10, "Telefone inválido"),
  empresa: z.string().optional(),
  mensagem: z.string().min(10, "Conte um pouco mais sobre sua necessidade"),
});
export type ContatoComercialInput = z.infer<typeof contatoComercialSchema>;

export const trabalheConoscoSchema = z.object({
  nome: z.string().min(2, "Informe seu nome completo"),
  email: z.string().email("E-mail inválido"),
  telefone: z.string().min(10, "Telefone inválido"),
  cargoPretendido: z.string().min(2, "Informe o cargo de interesse"),
  mensagem: z.string().optional(),
  // Validação do arquivo acontece no client antes do upload (tamanho/tipo);
  // aqui armazenamos apenas a URL já enviada ao Storage.
  curriculoUrl: z.string().url().optional(),
});
export type TrabalheConoscoInput = z.infer<typeof trabalheConoscoSchema>;
