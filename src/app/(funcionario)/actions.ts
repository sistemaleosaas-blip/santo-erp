"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { solicitarFeriasSchema, atualizacaoCadastralSchema } from "@/lib/validations/funcionario-forms";

type ActionResult = { success: true } | { success: false; error: string };

async function getFuncionarioIdDoUsuarioLogado(): Promise<string | null> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data } = await supabase.from("funcionarios").select("id").eq("user_id", user.id).maybeSingle();
  return data?.id ?? null;
}

export async function solicitarFerias(input: unknown): Promise<ActionResult> {
  const parsed = solicitarFeriasSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? "Dados inválidos" };
  }

  const funcionarioId = await getFuncionarioIdDoUsuarioLogado();
  if (!funcionarioId) return { success: false, error: "Cadastro de funcionário não encontrado." };

  const supabase = await createClient();
  const { error } = await supabase.from("solicitacoes_ferias").insert({
    funcionario_id: funcionarioId,
    periodo_aquisitivo_inicio: parsed.data.periodoAquisitivoInicio,
    periodo_aquisitivo_fim: parsed.data.periodoAquisitivoFim,
    data_inicio: parsed.data.dataInicio,
    data_fim: parsed.data.dataFim,
    observacoes_funcionario: parsed.data.observacoesFuncionario || null,
  });

  if (error) return { success: false, error: "Não foi possível registrar a solicitação." };
  revalidatePath("/funcionario/ferias");
  return { success: true };
}

export async function cancelarFerias(solicitacaoId: string): Promise<ActionResult> {
  const supabase = await createClient();
  const { error } = await supabase
    .from("solicitacoes_ferias")
    .update({ status: "cancelada" })
    .eq("id", solicitacaoId)
    .eq("status", "solicitada");

  if (error) return { success: false, error: "Não foi possível cancelar." };
  revalidatePath("/funcionario/ferias");
  return { success: true };
}

export async function solicitarAtualizacaoCadastral(input: unknown): Promise<ActionResult> {
  const parsed = atualizacaoCadastralSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? "Dados inválidos" };
  }

  const funcionarioId = await getFuncionarioIdDoUsuarioLogado();
  if (!funcionarioId) return { success: false, error: "Cadastro de funcionário não encontrado." };

  const supabase = await createClient();
  const { data: funcionario } = await supabase.from("funcionarios").select("*").eq("id", funcionarioId).single();

  const { error } = await supabase.from("solicitacoes_atualizacao_cadastral").insert({
    funcionario_id: funcionarioId,
    campo: parsed.data.campo,
    valor_atual: funcionario ? { valor: (funcionario as any)[parsed.data.campo] } : null,
    valor_proposto: { valor: parsed.data.valorProposto },
  });

  if (error) return { success: false, error: "Não foi possível enviar a solicitação." };
  revalidatePath("/funcionario/perfil");
  return { success: true };
}

export async function marcarAvisoLido(avisoId: string): Promise<ActionResult> {
  const funcionarioId = await getFuncionarioIdDoUsuarioLogado();
  if (!funcionarioId) return { success: false, error: "Cadastro de funcionário não encontrado." };

  const supabase = await createClient();
  const { error } = await supabase
    .from("avisos_leituras")
    .upsert({ aviso_id: avisoId, funcionario_id: funcionarioId }, { onConflict: "aviso_id,funcionario_id" });

  if (error) return { success: false, error: "Não foi possível marcar como lido." };
  revalidatePath("/funcionario/avisos");
  return { success: true };
}
