import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { NovoContratoDialog } from "@/components/admin/novo-contrato-dialog";
import { createClient } from "@/lib/supabase/server";

const STATUS_VARIANT = {
  ativo: "success",
  suspenso: "secondary",
  encerrado: "destructive",
  em_negociacao: "default",
} as const;

const STATUS_LABEL = {
  ativo: "Ativo",
  suspenso: "Suspenso",
  encerrado: "Encerrado",
  em_negociacao: "Em negociação",
} as const;

export default async function ContratosPage() {
  const supabase = await createClient();
  const [{ data: contratos }, { data: clientes }] = await Promise.all([
    supabase
      .from("contratos")
      .select("id, numero, status, data_inicio, valor_mensal, postos_contratados, servicos, clientes(razao_social)")
      .order("created_at", { ascending: false }),
    supabase.from("clientes").select("id, razao_social").eq("is_active", true).order("razao_social"),
  ]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold">Gestão de Contratos</h1>
          <p className="text-sm text-muted-foreground">{contratos?.length ?? 0} contratos cadastrados.</p>
        </div>
        <NovoContratoDialog clientes={clientes ?? []} />
      </div>

      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border text-left text-xs uppercase tracking-wide text-muted-foreground">
                  <th className="px-4 py-3">Número</th>
                  <th className="px-4 py-3">Cliente</th>
                  <th className="px-4 py-3">Início</th>
                  <th className="px-4 py-3">Valor mensal</th>
                  <th className="px-4 py-3">Postos</th>
                  <th className="px-4 py-3">Status</th>
                </tr>
              </thead>
              <tbody>
                {contratos && contratos.length > 0 ? (
                  contratos.map((c: any) => (
                    <tr key={c.id} className="border-b border-border last:border-0 hover:bg-secondary/40">
                      <td className="px-4 py-3 font-mono text-xs font-medium">{c.numero}</td>
                      <td className="px-4 py-3">{c.clientes?.razao_social}</td>
                      <td className="px-4 py-3 text-muted-foreground">{new Date(c.data_inicio).toLocaleDateString("pt-BR")}</td>
                      <td className="px-4 py-3 text-muted-foreground">
                        {c.valor_mensal ? `R$ ${Number(c.valor_mensal).toFixed(2)}` : "—"}
                      </td>
                      <td className="px-4 py-3 text-muted-foreground">{c.postos_contratados}</td>
                      <td className="px-4 py-3">
                        <Badge variant={STATUS_VARIANT[c.status as keyof typeof STATUS_VARIANT]}>
                          {STATUS_LABEL[c.status as keyof typeof STATUS_LABEL]}
                        </Badge>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} className="px-4 py-10 text-center text-muted-foreground">
                      Nenhum contrato cadastrado ainda.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
