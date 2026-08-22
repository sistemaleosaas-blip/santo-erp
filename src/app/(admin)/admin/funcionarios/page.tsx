import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { NovoFuncionarioDialog } from "@/components/admin/novo-funcionario-dialog";
import { FuncionarioStatusMenu } from "@/components/admin/funcionario-status-menu";
import { createClient } from "@/lib/supabase/server";
import { formatCPF } from "@/lib/utils/cpf-cnpj";

const STATUS_VARIANT = {
  ativo: "success",
  ferias: "default",
  afastado: "secondary",
  desligado: "destructive",
} as const;

const STATUS_LABEL = {
  ativo: "Ativo",
  ferias: "Em férias",
  afastado: "Afastado",
  desligado: "Desligado",
} as const;

export default async function FuncionariosPage() {
  const supabase = await createClient();
  const { data: funcionarios } = await supabase
    .from("funcionarios")
    .select("id, nome_completo, cpf, matricula, cargo, categoria, status, data_admissao")
    .order("nome_completo");

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold">Gestão de Funcionários</h1>
          <p className="text-sm text-muted-foreground">{funcionarios?.length ?? 0} funcionários cadastrados.</p>
        </div>
        <NovoFuncionarioDialog />
      </div>

      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border text-left text-xs uppercase tracking-wide text-muted-foreground">
                  <th className="px-4 py-3">Nome</th>
                  <th className="px-4 py-3">CPF</th>
                  <th className="px-4 py-3">Matrícula</th>
                  <th className="px-4 py-3">Cargo</th>
                  <th className="px-4 py-3">Admissão</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3" />
                </tr>
              </thead>
              <tbody>
                {funcionarios && funcionarios.length > 0 ? (
                  funcionarios.map((f) => (
                    <tr key={f.id} className="border-b border-border last:border-0 hover:bg-secondary/40">
                      <td className="px-4 py-3 font-medium">{f.nome_completo}</td>
                      <td className="px-4 py-3 text-muted-foreground">{formatCPF(f.cpf)}</td>
                      <td className="px-4 py-3 font-mono text-xs text-muted-foreground">{f.matricula}</td>
                      <td className="px-4 py-3">{f.cargo}</td>
                      <td className="px-4 py-3 text-muted-foreground">
                        {new Date(f.data_admissao).toLocaleDateString("pt-BR")}
                      </td>
                      <td className="px-4 py-3">
                        <Badge variant={STATUS_VARIANT[f.status as keyof typeof STATUS_VARIANT]}>
                          {STATUS_LABEL[f.status as keyof typeof STATUS_LABEL]}
                        </Badge>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <FuncionarioStatusMenu funcionarioId={f.id} />
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={7} className="px-4 py-10 text-center text-muted-foreground">
                      Nenhum funcionário cadastrado ainda. Clique em "Novo Funcionário" para começar.
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
