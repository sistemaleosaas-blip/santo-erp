import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { createClient } from "@/lib/supabase/server";
import { getSessionProfile, getFuncionarioAtual } from "@/lib/services/session";

export default async function EscalasPage() {
  const profile = await getSessionProfile();
  const funcionario = await getFuncionarioAtual(profile.id);
  const supabase = await createClient();

  const hoje = new Date().toISOString().slice(0, 10);
  const { data: escalas } = funcionario
    ? await supabase
        .from("escalas")
        .select("id, data, turno_inicio, turno_fim, tipo, observacoes, postos_servico(nome)")
        .eq("funcionario_id", funcionario.id)
        .gte("data", hoje)
        .order("data")
        .limit(15)
    : { data: [] };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold">Escalas</h1>
        <p className="text-sm text-muted-foreground">Seus próximos plantões e turnos.</p>
      </div>

      <div className="space-y-3">
        {escalas && escalas.length > 0 ? (
          escalas.map((e: any) => (
            <Card key={e.id}>
              <CardContent className="flex items-center justify-between p-4">
                <div>
                  <p className="font-medium">{new Date(e.data).toLocaleDateString("pt-BR", { weekday: "long", day: "2-digit", month: "long" })}</p>
                  <p className="text-sm text-muted-foreground">
                    {e.turno_inicio} — {e.turno_fim} · {e.postos_servico?.nome}
                  </p>
                </div>
                <Badge variant="secondary">{e.tipo}</Badge>
              </CardContent>
            </Card>
          ))
        ) : (
          <Card><CardContent className="p-10 text-center text-muted-foreground">Nenhuma escala futura cadastrada.</CardContent></Card>
        )}
      </div>
    </div>
  );
}
