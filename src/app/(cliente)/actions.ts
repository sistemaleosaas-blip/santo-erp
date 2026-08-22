"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { novoChamadoSchema, mensagemChamadoSchema } from "@/lib/validations/cliente-forms";

type ActionResult = { success: true } | { success: false; error: string };

export async function abrirChamado(clienteId: string, input: unknown): Promise<ActionResult> {
  const parsed = novoChamadoSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? "Dados inválidos" };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { success: false, error: "Não autenticado." };

  const { error } = await supabase.from("chamados").insert({
    cliente_id: clienteId,
    contrato_id: parsed.data.contratoId || null,
    aberto_por: user.id,
    assunto: parsed.data.assunto,
    descricao: parsed.data.descricao,
    prioridade: parsed.data.prioridade,
  });

  if (error) return { success: false, error: "Não foi possível abrir o chamado." };
  revalidatePath("/cliente/chamados");
  return { success: true };
}

export async function enviarMensagemChamado(input: unknown): Promise<ActionResult> {
  const parsed = mensagemChamadoSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? "Dados inválidos" };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { success: false, error: "Não autenticado." };

  const { error } = await supabase.from("chamados_mensagens").insert({
    chamado_id: parsed.data.chamadoId,
    autor_id: user.id,
    mensagem: parsed.data.mensagem,
  });

  if (error) return { success: false, error: "Não foi possível enviar a mensagem." };
  revalidatePath("/cliente/chamados");
  return { success: true };
}
