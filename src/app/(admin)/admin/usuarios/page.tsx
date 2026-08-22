import { AtribuirPapelForm, UsuariosTable } from "@/components/admin/usuarios-papeis";
import { createClient } from "@/lib/supabase/server";
import type { AppRole } from "@/types/auth";

export default async function UsuariosPage() {
  const supabase = await createClient();
  const [{ data: profiles }, { data: roles }] = await Promise.all([
    supabase.from("profiles").select("id, full_name, email").order("full_name"),
    supabase.from("user_roles").select("id, user_id, role"),
  ]);

  const usuarios = (profiles ?? []).map((p) => ({
    ...p,
    papeis: (roles ?? [])
      .filter((r) => r.user_id === p.id)
      .map((r) => ({ id: r.id, role: r.role as AppRole })),
  }));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold">Usuários e Papéis</h1>
        <p className="text-sm text-muted-foreground">Controle de acesso (RBAC) — quem pode acessar cada área do sistema.</p>
      </div>

      <AtribuirPapelForm />
      <UsuariosTable usuarios={usuarios} />
    </div>
  );
}
