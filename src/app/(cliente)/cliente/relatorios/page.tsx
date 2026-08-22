import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { createClient } from "@/lib/supabase/server";
import { getSessionProfile, getClientesDoUsuario } from "@/lib/services/session";

export default async function RelatoriosClientePage() {
  const profile = await getSessionProfile();
  const vinculos = await getClientesDoUsuario(profile.id);
  const clienteId = vinculos[0]?.cliente_id;
  const supabase = await createClient();

  const [contratosRes, chamadosRes] = clienteId
    ? await Promise.all([
        supabase.from("contratos").select("id", { count: "exact", head: true }).eq("cliente_id", clienteId),
        supabase.from("chamados").select("status").eq("cliente_id", clienteId),
      ])
    : [{ count: 0 }, { data: [] }];

  const chamados = (chamadosRes as any).data ?? [];
  const resolvidos = chamados.filter((c: any) => c.status === "resolvido" || c.status === "fechado").length;
  const taxaResolucao = chamados.length > 0 ? Math.round((resolvidos / chamados.length) * 100) : 0;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold">Relatórios</h1>
        <p className="text-sm text-muted-foreground">Indicadores de performance do seu contrato com a Santo.</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <Card>
          <CardContent className="p-5">
            <p className="text-sm text-muted-foreground">Contratos totais</p>
            <p className="mt-1 text-3xl font-bold">{contratosRes.count ?? 0}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5">
            <p className="text-sm text-muted-foreground">Chamados abertos (histórico)</p>
            <p className="mt-1 text-3xl font-bold">{chamados.length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5">
            <p className="text-sm text-muted-foreground">Taxa de resolução</p>
            <p className="mt-1 text-3xl font-bold">{taxaResolucao}%</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Próximos relatórios</CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground">
          Relatórios de assiduidade por posto e histórico de rondas entram na próxima fase.
        </CardContent>
      </Card>
    </div>
  );
}
