import { Card, CardContent } from "@/components/ui/card";
import { MarcarLidoButton } from "@/components/funcionario/marcar-lido-button";
import { createClient } from "@/lib/supabase/server";
import { getSessionProfile, getFuncionarioAtual } from "@/lib/services/session";

export default async function AvisosPage() {
  const profile = await getSessionProfile();
  const funcionario = await getFuncionarioAtual(profile.id);
  const supabase = await createClient();

  const [{ data: avisos }, { data: leituras }] = await Promise.all([
    supabase.from("avisos").select("id, titulo, conteudo, publicado_em").eq("publicado", true).order("publicado_em", { ascending: false }),
    funcionario
      ? supabase.from("avisos_leituras").select("aviso_id").eq("funcionario_id", funcionario.id)
      : Promise.resolve({ data: [] }),
  ]);

  const lidosSet = new Set((leituras ?? []).map((l) => l.aviso_id));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold">Avisos</h1>
        <p className="text-sm text-muted-foreground">Comunicados da Santo para você.</p>
      </div>

      <div className="space-y-3">
        {avisos && avisos.length > 0 ? (
          avisos.map((a) => {
            const lido = lidosSet.has(a.id);
            return (
              <Card key={a.id}>
                <CardContent className="p-5">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="font-display text-lg font-semibold">{a.titulo}</p>
                      <p className="mt-1 text-sm text-muted-foreground">{a.conteudo}</p>
                      <p className="mt-2 text-xs text-muted-foreground">{new Date(a.publicado_em).toLocaleDateString("pt-BR")}</p>
                    </div>
                    {!lido && <MarcarLidoButton avisoId={a.id} />}
                  </div>
                </CardContent>
              </Card>
            );
          })
        ) : (
          <Card><CardContent className="p-10 text-center text-muted-foreground">Nenhum aviso publicado ainda.</CardContent></Card>
        )}
      </div>
    </div>
  );
}
