import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import type { AppRole, SessionProfile } from "@/types/auth";

/**
 * Busca o usuário autenticado + perfil + papéis. Usado no topo de cada
 * layout de portal para montar o cabeçalho e validar contexto (o
 * middleware já bloqueia o acesso indevido; esta função só monta os dados).
 */
export async function getSessionProfile(): Promise<SessionProfile> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const [{ data: profile }, { data: rolesRows }] = await Promise.all([
    supabase.from("profiles").select("full_name, email, avatar_url").eq("id", user.id).single(),
    supabase.from("user_roles").select("role").eq("user_id", user.id),
  ]);

  return {
    id: user.id,
    fullName: profile?.full_name ?? user.email ?? "Usuário",
    email: profile?.email ?? user.email ?? "",
    avatarUrl: profile?.avatar_url ?? null,
    roles: (rolesRows ?? []).map((r) => r.role as AppRole),
  };
}

/** Retorna o registro de funcionário vinculado ao usuário logado, se houver. */
export async function getFuncionarioAtual(userId: string) {
  const supabase = await createClient();
  const { data } = await supabase.from("funcionarios").select("*").eq("user_id", userId).maybeSingle();
  return data;
}

/** Retorna o(s) cliente(s) vinculados ao usuário logado. */
export async function getClientesDoUsuario(userId: string) {
  const supabase = await createClient();
  const { data } = await supabase
    .from("cliente_usuarios")
    .select("cliente_id, clientes(*)")
    .eq("user_id", userId);
  return data ?? [];
}
