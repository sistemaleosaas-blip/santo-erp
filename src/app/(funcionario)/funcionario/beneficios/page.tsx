import { Card, CardContent } from "@/components/ui/card";
import { createClient } from "@/lib/supabase/server";
import { getSessionProfile, getFuncionarioAtual } from "@/lib/services/session";

export default async function BeneficiosPage() {
  const profile = await getSessionProfile();
  const funcionario = await getFuncionarioAtual(profile.id);
  const supabase = await createClient();

  const { data: beneficios } = funcionario
    ? await supabase
        .from("funcionario_beneficios")
        .select("id, valor, data_inicio, beneficios(nome, descricao)")
        .eq("funcionario_id", funcionario.id)
        .is("data_fim", null)
    : { data: [] };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold">Benefícios</h1>
        <p className="text-sm text-muted-foreground">Seus benefícios ativos.</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        {beneficios && beneficios.length > 0 ? (
          beneficios.map((b: any) => (
            <Card key={b.id}>
              <CardContent className="p-5">
                <p className="font-display text-lg font-semibold">{b.beneficios?.nome}</p>
                <p className="mt-1 text-sm text-muted-foreground">{b.beneficios?.descricao}</p>
                {b.valor && <p className="mt-2 text-sm font-medium">R$ {Number(b.valor).toFixed(2)} / mês</p>}
              </CardContent>
            </Card>
          ))
        ) : (
          <Card><CardContent className="p-10 text-center text-muted-foreground">Nenhum benefício vinculado ainda.</CardContent></Card>
        )}
      </div>
    </div>
  );
}
