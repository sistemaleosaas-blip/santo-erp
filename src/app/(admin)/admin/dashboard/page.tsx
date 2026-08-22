import { Users, Building2, FileSignature, FileCheck2, AlertTriangle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { createClient } from "@/lib/supabase/server";

async function getKpis() {
  const supabase = await createClient();
  const [funcionarios, clientes, contratos, assinaturasPendentes] = await Promise.all([
    supabase.from("funcionarios").select("id", { count: "exact", head: true }).eq("status", "ativo"),
    supabase.from("clientes").select("id", { count: "exact", head: true }).eq("is_active", true),
    supabase.from("contratos").select("id", { count: "exact", head: true }).eq("status", "ativo"),
    supabase.from("assinaturas_digitais").select("id", { count: "exact", head: true }).eq("status", "pendente"),
  ]);

  return {
    funcionariosAtivos: funcionarios.count ?? 0,
    clientesAtivos: clientes.count ?? 0,
    contratosAtivos: contratos.count ?? 0,
    assinaturasPendentes: assinaturasPendentes.count ?? 0,
  };
}

export default async function AdminDashboardPage() {
  const kpis = await getKpis();

  const cards = [
    { label: "Funcionários ativos", value: kpis.funcionariosAtivos, icon: Users },
    { label: "Clientes ativos", value: kpis.clientesAtivos, icon: Building2 },
    { label: "Contratos ativos", value: kpis.contratosAtivos, icon: FileSignature },
    { label: "Assinaturas pendentes", value: kpis.assinaturasPendentes, icon: FileCheck2, alert: kpis.assinaturasPendentes > 0 },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold">Visão geral</h1>
        <p className="text-sm text-muted-foreground">Resumo operacional da Santo Serviços Terceirizados.</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {cards.map((c) => (
          <Card key={c.label}>
            <CardContent className="flex items-center justify-between p-5">
              <div>
                <p className="text-sm text-muted-foreground">{c.label}</p>
                <p className="mt-1 text-3xl font-bold">{c.value}</p>
              </div>
              <c.icon className={`h-8 w-8 ${c.alert ? "text-destructive" : "text-accent"}`} />
            </CardContent>
          </Card>
        ))}
      </div>

      {kpis.assinaturasPendentes > 0 && (
        <Card className="border-destructive/40 bg-destructive/5">
          <CardContent className="flex items-center gap-3 p-5">
            <AlertTriangle className="h-5 w-5 text-destructive" />
            <p className="text-sm">
              Há <strong>{kpis.assinaturasPendentes}</strong> assinatura(s) digital(is) aguardando aprovação do RH.
            </p>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Próximos passos sugeridos</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm text-muted-foreground">
          <p>• Cadastre os funcionários e vincule-os aos postos de serviço.</p>
          <p>• Faça upload dos holerites do mês em Holerites → Upload em lote.</p>
          <p>• Revise assinaturas digitais pendentes antes do fechamento da folha.</p>
        </CardContent>
      </Card>
    </div>
  );
}
