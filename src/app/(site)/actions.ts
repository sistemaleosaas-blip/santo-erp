"use server";

import { createClient } from "@/lib/supabase/server";
import { contatoComercialSchema, trabalheConoscoSchema } from "@/lib/validations/site-forms";

type ActionResult = { success: true } | { success: false; error: string };

export async function enviarContatoComercial(input: unknown): Promise<ActionResult> {
  const parsed = contatoComercialSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? "Dados inválidos" };
  }

  const supabase = await createClient();
  const { error } = await supabase.from("contatos_site").insert({
    tipo: "contato_comercial",
    nome: parsed.data.nome,
    email: parsed.data.email,
    telefone: parsed.data.telefone,
    empresa: parsed.data.empresa ?? null,
    mensagem: parsed.data.mensagem,
  });

  if (error) return { success: false, error: "Não foi possível enviar sua mensagem. Tente novamente." };
  return { success: true };
}

export async function enviarTrabalheConosco(input: unknown): Promise<ActionResult> {
  const parsed = trabalheConoscoSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? "Dados inválidos" };
  }

  const supabase = await createClient();
  const { error } = await supabase.from("contatos_site").insert({
    tipo: "trabalhe_conosco",
    nome: parsed.data.nome,
    email: parsed.data.email,
    telefone: parsed.data.telefone,
    cargo_pretendido: parsed.data.cargoPretendido,
    mensagem: parsed.data.mensagem ?? null,
    curriculo_url: parsed.data.curriculoUrl ?? null,
  });

  if (error) return { success: false, error: "Não foi possível enviar sua candidatura. Tente novamente." };
  return { success: true };
}
