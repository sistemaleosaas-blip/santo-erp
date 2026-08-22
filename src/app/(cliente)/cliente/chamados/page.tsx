import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { NovoChamadoDialog } from "@/components/cliente/novo-chamado-dialog";
import { EnviarMensagemChamado } from "@/components/cliente/enviar-mensagem-chamado";
import { createClient } from "@/lib/supabase/server";
import { getSessionProfile, getClientesDoUsuario } from "@/lib/services/session";

const STATUS_VARIANT = {
  aberto: "default",
  em_andamento: "secondary",
  aguardando_cliente: "secondary",
  resolvido: "success",
  fechado: "outline",
} as const;

export default async function ChamadosPage() {
  const profile = await getSessionProfile();
  const vinculos = await getClientesDoUsuario(profile.id);
  const clienteId = vinculos[0]?.cliente_id;
  const supabase = await createClient();

  const { data: chamados } = clienteId
    ? await supabase
        .from("chamados")
        .select("id, numero, assunto, descricao, prioridade, status, created_at, chamados_mensagens(id, mensagem, autor_id, created_at)")
        .eq("cliente_id", clienteId)
        .order("created_at", { ascending: false })
    : { data: [] };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold">Chamados</h1>
          <p className="text-sm text-muted-foreground">Abra solicitações e acompanhe o andamento com a equipe Santo.</p>
        </div>
        {clienteId && <NovoChamadoDialog clienteId={clienteId} />}
      </div>

      <div className="space-y-4">
        {chamados && chamados.length > 0 ? (
          chamados.map((c: any) => (
            <Card key={c.id}>
              <CardContent className="p-6">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="font-mono text-xs text-muted-foreground">#{c.numero}</p>
                    <p className="font-display text-lg font-semibold">{c.assunto}</p>
                    <p className="mt-1 text-sm text-muted-foreground">{c.descricao}</p>
                  </div>
                  <Badge variant={STATUS_VARIANT[c.status as keyof typeof STATUS_VARIANT]}>{c.status}</Badge>
                </div>

                {c.chamados_mensagens?.length > 0 && (
                  <div className="mt-4 space-y-2 border-t border-border pt-4">
                    {c.chamados_mensagens.map((m: any) => (
                      <div key={m.id} className="rounded-md bg-secondary/40 p-2 text-sm">
                        {m.mensagem}
                        <span className="ml-2 text-xs text-muted-foreground">{new Date(m.created_at).toLocaleString("pt-BR")}</span>
                      </div>
                    ))}
                  </div>
                )}

                <div className="mt-4">
                  <EnviarMensagemChamado chamadoId={c.id} />
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
          <Card><CardContent className="p-10 text-center text-muted-foreground">Nenhum chamado aberto ainda.</CardContent></Card>
        )}
      </div>
    </div>
  );
}
