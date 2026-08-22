import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { UploadPontoLoteForm } from "@/components/admin/upload-ponto-lote-form";
import { createClient } from "@/lib/supabase/server";

export default async function AdminPontoPage() {
  const supabase = await createClient();
  const { data: registros } = await supabase
    .from("registros_ponto")
    .select("id, tipo, registrado_em, funcionarios(nome_completo, matricula)")
    .order("registrado_em", { ascending: false })
    .limit(20);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold">Folha de Ponto</h1>
        <p className="text-sm text-muted-foreground">Importe registros de ponto em lote a partir de um CSV.</p>
      </div>

      <UploadPontoLoteForm />

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Últimos registros</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {registros && registros.length > 0 ? (
            registros.map((r: any) => (
              <div key={r.id} className="flex items-center justify-between rounded-md border border-border p-3 text-sm">
                <span>{r.funcionarios?.nome_completo} <span className="text-xs text-muted-foreground">({r.funcionarios?.matricula})</span></span>
                <span className="text-muted-foreground">{r.tipo} · {new Date(r.registrado_em).toLocaleString("pt-BR")}</span>
              </div>
            ))
          ) : (
            <p className="text-sm text-muted-foreground">Nenhum registro de ponto ainda.</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
