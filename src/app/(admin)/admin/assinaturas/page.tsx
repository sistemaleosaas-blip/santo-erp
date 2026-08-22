import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { AssinaturaAcoes } from "@/components/admin/assinatura-acoes";
import { createClient } from "@/lib/supabase/server";

const STATUS_VARIANT = {
  pendente: "secondary",
  assinado: "default",
  rejeitado: "destructive",
  expirado: "destructive",
} as const;

export default async function AssinaturasPage() {
  const supabase = await createClient();
  const { data: assinaturas } = await supabase
    .from("assinaturas_digitais")
    .select("id, status, assinado_em, aprovado_em, funcionarios(nome_completo, matricula), holerites(competencia)")
    .order("created_at", { ascending: false });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold">Aprovação de Assinaturas</h1>
        <p className="text-sm text-muted-foreground">
          Valide as assinaturas digitais feitas pelos funcionários antes do fechamento da folha.
        </p>
      </div>

      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border text-left text-xs uppercase tracking-wide text-muted-foreground">
                  <th className="px-4 py-3">Funcionário</th>
                  <th className="px-4 py-3">Competência</th>
                  <th className="px-4 py-3">Assinado em</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3" />
                </tr>
              </thead>
              <tbody>
                {assinaturas && assinaturas.length > 0 ? (
                  assinaturas.map((a: any) => (
                    <tr key={a.id} className="border-b border-border last:border-0 hover:bg-secondary/40">
                      <td className="px-4 py-3 font-medium">
                        {a.funcionarios?.nome_completo}
                        <span className="ml-2 text-xs text-muted-foreground">{a.funcionarios?.matricula}</span>
                      </td>
                      <td className="px-4 py-3 text-muted-foreground">
                        {a.holerites?.competencia
                          ? new Date(a.holerites.competencia).toLocaleDateString("pt-BR", { month: "long", year: "numeric" })
                          : "—"}
                      </td>
                      <td className="px-4 py-3 text-muted-foreground">
                        {a.assinado_em ? new Date(a.assinado_em).toLocaleString("pt-BR") : "—"}
                      </td>
                      <td className="px-4 py-3">
                        <Badge variant={STATUS_VARIANT[a.status as keyof typeof STATUS_VARIANT]}>{a.status}</Badge>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <AssinaturaAcoes assinaturaId={a.id} podeAprovar={a.status === "assinado"} />
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="px-4 py-10 text-center text-muted-foreground">
                      Nenhuma assinatura registrada ainda.
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
