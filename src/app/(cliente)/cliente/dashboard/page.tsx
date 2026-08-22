import Link from "next/link";
import { Users, FileSignature, LifeBuoy, ArrowRight } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { createClient } from "@/lib/supabase/server";
import { getSessionProfile, getClientesDoUsuario } from "@/lib/services/session";

export default async function ClienteDashboardPage() {
  const profile = await getSessionProfile();
  const vinculos = await getClientesDoUsuario(profile.id);
  const clienteId = vinculos[0]?.cliente_id;
  const cliente = (vinculos[0] as any)?.clientes;
  const supabase = await createClient();

  const [funcionariosRes, contratosRes, chamadosRes] = clienteId
    ? await Promise.all([
        supabase
          .from("alocacoes")
          .select("id, postos_servico(nome, contrato_id, contratos(cliente_id))", { count: "exact", head: true })
          .eq("is_atual", true),
        supabase.from("contratos").select("id", { count: "exact", head: true }).eq("cliente_id", clienteId).eq("status", "ativo"),
        supabase.from("chamados").select("id", { count: "exact", head: true }).eq("cliente_id", clienteId).neq("status", "fechado"),
      ])
    : [{ count: 0 }, { count: 0 }, { count: 0 }];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold">Olá, {profile.fullName.split(" ")[0]}</h1>
        <p className="text-sm text-muted-foreground">{cliente?.razao_social ?? "Nenhuma empresa vinculada ao seu usuário."}</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <Link href="/cliente/funcionarios">
          <Card className="transition-shadow hover:shadow-md">
            <CardContent className="flex items-center gap-3 p-5">
              <Users className="h-6 w-6 text-accent" />
              <div>
                <p className="text-2xl font-bold">{funcionariosRes.count ?? 0}</p>
                <p className="flex items-center gap-1 text-xs text-muted-foreground">Funcionários alocados <ArrowRight className="h-3 w-3" /></p>
              </div>
            </CardContent>
          </Card>
        </Link>
        <Link href="/cliente/contratos">
          <Card className="transition-shadow hover:shadow-md">
            <CardContent className="flex items-center gap-3 p-5">
              <FileSignature className="h-6 w-6 text-accent" />
              <div>
                <p className="text-2xl font-bold">{contratosRes.count ?? 0}</p>
                <p className="flex items-center gap-1 text-xs text-muted-foreground">Contratos ativos <ArrowRight className="h-3 w-3" /></p>
              </div>
            </CardContent>
          </Card>
        </Link>
        <Link href="/cliente/chamados">
          <Card className="transition-shadow hover:shadow-md">
            <CardContent className="flex items-center gap-3 p-5">
              <LifeBuoy className="h-6 w-6 text-accent" />
              <div>
                <p className="text-2xl font-bold">{chamadosRes.count ?? 0}</p>
                <p className="flex items-center gap-1 text-xs text-muted-foreground">Chamados em aberto <ArrowRight className="h-3 w-3" /></p>
              </div>
            </CardContent>
          </Card>
        </Link>
      </div>
    </div>
  );
}
