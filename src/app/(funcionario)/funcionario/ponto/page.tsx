import { Card, CardContent } from "@/components/ui/card";
import { createClient } from "@/lib/supabase/server";
import { getSessionProfile, getFuncionarioAtual } from "@/lib/services/session";

const TIPO_LABEL: Record<string, string> = {
  entrada: "Entrada",
  saida_almoco: "Saída (almoço)",
  volta_almoco: "Volta (almoço)",
  saida: "Saída",
  ajuste_manual: "Ajuste manual",
};

export default async function FuncionarioPontoPage() {
  const profile = await getSessionProfile();
  const funcionario = await getFuncionarioAtual(profile.id);
  const supabase = await createClient();

  const { data: registros } = funcionario
    ? await supabase
        .from("registros_ponto")
        .select("id, tipo, registrado_em")
        .eq("funcionario_id", funcionario.id)
        .order("registrado_em", { ascending: false })
        .limit(30)
    : { data: [] };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold">Folha de Ponto</h1>
        <p className="text-sm text-muted-foreground">Seus últimos registros de entrada e saída.</p>
      </div>

      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border text-left text-xs uppercase tracking-wide text-muted-foreground">
                  <th className="px-4 py-3">Tipo</th>
                  <th className="px-4 py-3">Data e hora</th>
                </tr>
              </thead>
              <tbody>
                {registros && registros.length > 0 ? (
                  registros.map((r) => (
                    <tr key={r.id} className="border-b border-border last:border-0">
                      <td className="px-4 py-3">{TIPO_LABEL[r.tipo] ?? r.tipo}</td>
                      <td className="px-4 py-3 text-muted-foreground">{new Date(r.registrado_em).toLocaleString("pt-BR")}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={2} className="px-4 py-10 text-center text-muted-foreground">
                      Nenhum registro de ponto ainda.
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
