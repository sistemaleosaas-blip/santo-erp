import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { SolicitarFeriasDialog } from "@/components/funcionario/solicitar-ferias-dialog";
import { CancelarFeriasButton } from "@/components/funcionario/cancelar-ferias-button";
import { createClient } from "@/lib/supabase/server";
import { getSessionProfile, getFuncionarioAtual } from "@/lib/services/session";

const STATUS_VARIANT = {
  solicitada: "secondary",
  aprovada: "success",
  rejeitada: "destructive",
  em_andamento: "default",
  concluida: "outline",
  cancelada: "outline",
} as const;

export default async function FeriasPage() {
  const profile = await getSessionProfile();
  const funcionario = await getFuncionarioAtual(profile.id);
  const supabase = await createClient();

  const { data: solicitacoes } = funcionario
    ? await supabase
        .from("solicitacoes_ferias")
        .select("id, data_inicio, data_fim, dias, status")
        .eq("funcionario_id", funcionario.id)
        .order("created_at", { ascending: false })
    : { data: [] };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold">Férias</h1>
          <p className="text-sm text-muted-foreground">Solicite férias e acompanhe o status.</p>
        </div>
        <SolicitarFeriasDialog />
      </div>

      <div className="space-y-3">
        {solicitacoes && solicitacoes.length > 0 ? (
          solicitacoes.map((s) => (
            <Card key={s.id}>
              <CardContent className="flex items-center justify-between p-5">
                <div>
                  <p className="font-medium">
                    {new Date(s.data_inicio).toLocaleDateString("pt-BR")} — {new Date(s.data_fim).toLocaleDateString("pt-BR")}
                  </p>
                  <p className="text-sm text-muted-foreground">{s.dias} dia(s)</p>
                </div>
                <div className="flex items-center gap-3">
                  <Badge variant={STATUS_VARIANT[s.status as keyof typeof STATUS_VARIANT]}>{s.status}</Badge>
                  {s.status === "solicitada" && <CancelarFeriasButton solicitacaoId={s.id} />}
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
          <Card><CardContent className="p-10 text-center text-muted-foreground">Nenhuma solicitação de férias ainda.</CardContent></Card>
        )}
      </div>
    </div>
  );
}
