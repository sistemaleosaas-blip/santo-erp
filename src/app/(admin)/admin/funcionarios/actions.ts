"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { funcionarioSchema } from "@/lib/validations/erp";

type ActionResult = { success: true } | { success: false; error: string };

function gerarMatricula(): string {
  // Matrícula legível, ex: SANTO-73F2A1. A unicidade é garantida pelo
  // índice unique da coluna; em caso de colisão (extremamente raro), o
  // insert falha e o admin tenta novamente.
  return `SANTO-${crypto.randomUUID().slice(0, 6).toUpperCase()}`;
}

export async function criarFuncionario(input: unknown): Promise<ActionResult> {
  const parsed = funcionarioSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? "Dados inválidos" };
  }

  const supabase = await createClient();
  const { error } = await supabase.from("funcionarios").insert({
    nome_completo: parsed.data.nomeCompleto,
    cpf: parsed.data.cpf,
    rg: parsed.data.rg || null,
    data_nascimento: parsed.data.dataNascimento || null,
    data_admissao: parsed.data.dataAdmissao,
    cargo: parsed.data.cargo,
    categoria: parsed.data.categoria,
    salario_base: parsed.data.salarioBase ?? null,
    pix_key: parsed.data.pixKey || null,
    matricula: gerarMatricula(),
    status: "ativo",
  });

  if (error) {
    if (error.code === "23505") return { success: false, error: "Já existe um funcionário com este CPF." };
    return { success: false, error: "Não foi possível cadastrar o funcionário." };
  }

  revalidatePath("/admin/funcionarios");
  return { success: true };
}

export async function atualizarStatusFuncionario(
  funcionarioId: string,
  status: "ativo" | "ferias" | "afastado" | "desligado"
): Promise<ActionResult> {
  const supabase = await createClient();
  const { error } = await supabase
    .from("funcionarios")
    .update({ status, ...(status === "desligado" ? { data_desligamento: new Date().toISOString().slice(0, 10) } : {}) })
    .eq("id", funcionarioId);

  if (error) return { success: false, error: "Não foi possível atualizar o status." };
  revalidatePath("/admin/funcionarios");
  return { success: true };
}
