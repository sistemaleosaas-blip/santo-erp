import { Card, CardContent } from "@/components/ui/card";
import { createClient } from "@/lib/supabase/server";
import { getSessionProfile, getClientesDoUsuario } from "@/lib/services/session";

export default async function FuncionariosAlocadosPage() {
  const profile = await getSessionProfile();
  const vinculos = await getClientesDoUsuario(profile.id);
  const clienteId = vinculos[0]?.cliente_id;
  const supabase = await createClient();

  const { data: alocacoes } = clienteId
    ? await supabase
        .from("alocacoes")
        .select(
          "id, funcionarios(nome_completo, cargo, categoria), postos_servico(nome, contratos(cliente_id))"
        )
        .eq("is_atual", true)
    : { data: [] };

  // Filtra no client porque o filtro por cliente_id atravessa duas relações
  // (posto → contrato → cliente); o RLS já garante que só vêm linhas do
  // próprio cliente, então este filtro é só para não misturar outros contratos.
  const alocacoesDoCliente = (alocacoes ?? []).filter(
    (a: any) => a.postos_servico?.contratos?.cliente_id === clienteId
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold">Funcionários Alocados</h1>
        <p className="text-sm text-muted-foreground">Equipe da Santo atualmente trabalhando no seu contrato.</p>
      </div>

      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border text-left text-xs uppercase tracking-wide text-muted-foreground">
                  <th className="px-4 py-3">Nome</th>
                  <th className="px-4 py-3">Cargo</th>
                  <th className="px-4 py-3">Posto</th>
                </tr>
              </thead>
              <tbody>
                {alocacoesDoCliente.length > 0 ? (
                  alocacoesDoCliente.map((a: any) => (
                    <tr key={a.id} className="border-b border-border last:border-0 hover:bg-secondary/40">
                      <td className="px-4 py-3 font-medium">{a.funcionarios?.nome_completo}</td>
                      <td className="px-4 py-3">{a.funcionarios?.cargo}</td>
                      <td className="px-4 py-3 text-muted-foreground">{a.postos_servico?.nome}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={3} className="px-4 py-10 text-center text-muted-foreground">
                      Nenhum funcionário alocado no momento.
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
