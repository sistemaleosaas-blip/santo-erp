"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { contratoSchema } from "@/lib/validations/erp";

type ActionResult = { success: true } | { success: false; error: string };

export async function criarContrato(input: unknown): Promise<ActionResult> {
  const parsed = contratoSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? "Dados inválidos" };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { error } = await supabase.from("contratos").insert({
    numero: parsed.data.numero,
    cliente_id: parsed.data.clienteId,
    servicos: parsed.data.servicos,
    status: parsed.data.status,
    data_inicio: parsed.data.dataInicio,
    data_fim: parsed.data.dataFim || null,
    valor_mensal: parsed.data.valorMensal ?? null,
    postos_contratados: parsed.data.postosContratados,
    created_by: user?.id,
  });

  if (error) {
    if (error.code === "23505") return { success: false, error: "Já existe um contrato com este número." };
    return { success: false, error: "Não foi possível cadastrar o contrato." };
  }

  revalidatePath("/admin/contratos");
  return { success: true };
}

export async function atualizarStatusContrato(
  contratoId: string,
  status: "ativo" | "suspenso" | "encerrado" | "em_negociacao"
): Promise<ActionResult> {
  const supabase = await createClient();
  const { error } = await supabase.from("contratos").update({ status }).eq("id", contratoId);
  if (error) return { success: false, error: "Não foi possível atualizar o contrato." };
  revalidatePath("/admin/contratos");
  return { success: true };
}
