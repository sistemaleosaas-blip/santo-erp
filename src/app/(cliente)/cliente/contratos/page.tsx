import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { createClient } from "@/lib/supabase/server";
import { getSessionProfile, getClientesDoUsuario } from "@/lib/services/session";

const STATUS_VARIANT = {
  ativo: "success",
  suspenso: "secondary",
  encerrado: "destructive",
  em_negociacao: "default",
} as const;

export default async function ContratosClientePage() {
  const profile = await getSessionProfile();
  const vinculos = await getClientesDoUsuario(profile.id);
  const clienteId = vinculos[0]?.cliente_id;
  const supabase = await createClient();

  const { data: contratos } = clienteId
    ? await supabase
        .from("contratos")
        .select("id, numero, status, data_inicio, data_fim, servicos, postos_contratados, arquivo_url")
        .eq("cliente_id", clienteId)
        .order("data_inicio", { ascending: false })
    : { data: [] };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold">Contratos</h1>
        <p className="text-sm text-muted-foreground">Seus contratos com a Santo Serviços Terceirizados.</p>
      </div>

      <div className="grid gap-4">
        {contratos && contratos.length > 0 ? (
          contratos.map((c) => (
            <Card key={c.id}>
              <CardContent className="flex flex-col gap-3 p-6 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="font-mono text-xs text-muted-foreground">{c.numero}</p>
                  <p className="mt-1 font-display text-lg font-semibold">
                    {(c.servicos as string[]).map((s) => s.replace(/_/g, " ")).join(", ")}
                  </p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Início: {new Date(c.data_inicio).toLocaleDateString("pt-BR")} · {c.postos_contratados} posto(s)
                  </p>
                </div>
                <Badge variant={STATUS_VARIANT[c.status as keyof typeof STATUS_VARIANT]}>{c.status}</Badge>
              </CardContent>
            </Card>
          ))
        ) : (
          <Card><CardContent className="p-10 text-center text-muted-foreground">Nenhum contrato encontrado.</CardContent></Card>
        )}
      </div>
    </div>
  );
}
