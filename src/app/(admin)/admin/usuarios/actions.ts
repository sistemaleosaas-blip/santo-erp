"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { atribuirPapelSchema } from "@/lib/validations/erp";

type ActionResult = { success: true } | { success: false; error: string };

/**
 * Atribui um papel a um usuário já cadastrado (via e-mail). O usuário
 * precisa já existir no Auth — este fluxo não cria contas novas, apenas
 * concede/expande permissões, mantendo a criação de conta centralizada
 * no login/self-signup ou no script de seed.
 */
export async function atribuirPapel(input: unknown): Promise<ActionResult> {
  const parsed = atribuirPapelSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? "Dados inválidos" };
  }

  const supabase = await createClient();
  const { data: profile } = await supabase.from("profiles").select("id").eq("email", parsed.data.email).maybeSingle();

  if (!profile) {
    return { success: false, error: "Nenhum usuário encontrado com este e-mail. Ele precisa ter feito login ao menos uma vez." };
  }

  const { error } = await supabase.from("user_roles").insert({ user_id: profile.id, role: parsed.data.role });

  if (error) {
    if (error.code === "23505") return { success: false, error: "Este usuário já possui este papel." };
    return { success: false, error: "Não foi possível atribuir o papel." };
  }

  revalidatePath("/admin/usuarios");
  return { success: true };
}

export async function removerPapel(userRoleId: string): Promise<ActionResult> {
  const supabase = await createClient();
  const { error } = await supabase.from("user_roles").delete().eq("id", userRoleId);
  if (error) return { success: false, error: "Não foi possível remover o papel." };
  revalidatePath("/admin/usuarios");
  return { success: true };
}
