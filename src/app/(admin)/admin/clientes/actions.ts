"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { clienteSchema } from "@/lib/validations/erp";

type ActionResult = { success: true } | { success: false; error: string };

export async function criarCliente(input: unknown): Promise<ActionResult> {
  const parsed = clienteSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? "Dados inválidos" };
  }

  const supabase = await createClient();
  const { error } = await supabase.from("clientes").insert({
    razao_social: parsed.data.razaoSocial,
    nome_fantasia: parsed.data.nomeFantasia || null,
    cnpj: parsed.data.cnpj,
    email_contato: parsed.data.emailContato,
    telefone: parsed.data.telefone || null,
  });

  if (error) {
    if (error.code === "23505") return { success: false, error: "Já existe um cliente com este CNPJ." };
    return { success: false, error: "Não foi possível cadastrar o cliente." };
  }

  revalidatePath("/admin/clientes");
  return { success: true };
}

export async function alternarStatusCliente(clienteId: string, isActive: boolean): Promise<ActionResult> {
  const supabase = await createClient();
  const { error } = await supabase.from("clientes").update({ is_active: isActive }).eq("id", clienteId);
  if (error) return { success: false, error: "Não foi possível atualizar o cliente." };
  revalidatePath("/admin/clientes");
  return { success: true };
}
