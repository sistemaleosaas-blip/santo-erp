"use server";

import { createClient, createServiceRoleClient } from "@/lib/supabase/server";
import { loginFuncionarioSchema, loginEmailSchema } from "@/lib/validations/auth";

type ActionResult = { success: true } | { success: false; error: string };

/**
 * Login do Portal do Funcionário: recebe CPF, resolve o e-mail interno
 * correspondente (armazenado em profiles) e autentica via Supabase Auth.
 * O funcionário nunca precisa saber ou digitar um e-mail.
 */
export async function loginFuncionario(input: unknown): Promise<ActionResult> {
  const parsed = loginFuncionarioSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? "Dados inválidos" };
  }

  const admin = createServiceRoleClient();
  const { data: profile } = await admin
    .from("profiles")
    .select("email")
    .eq("cpf", parsed.data.cpf)
    .maybeSingle();

  if (!profile) {
    return { success: false, error: "CPF não encontrado. Procure o RH da Santo." };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({
    email: profile.email,
    password: parsed.data.senha,
  });

  if (error) return { success: false, error: "CPF ou senha incorretos." };
  return { success: true };
}

/** Login do Portal do Cliente e da Área Administrativa: e-mail + senha padrão. */
export async function loginEmail(input: unknown): Promise<ActionResult> {
  const parsed = loginEmailSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? "Dados inválidos" };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({
    email: parsed.data.email,
    password: parsed.data.senha,
  });

  if (error) return { success: false, error: "E-mail ou senha incorretos." };
  return { success: true };
}

export async function logout(): Promise<void> {
  const supabase = await createClient();
  await supabase.auth.signOut();
}
