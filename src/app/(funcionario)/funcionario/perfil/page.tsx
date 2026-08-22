import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { AtualizarCadastroForm } from "@/components/funcionario/atualizar-cadastro-form";
import { createClient } from "@/lib/supabase/server";
import { getSessionProfile, getFuncionarioAtual } from "@/lib/services/session";
import { formatCPF } from "@/lib/utils/cpf-cnpj";

export default async function PerfilPage() {
  const profile = await getSessionProfile();
  const funcionario = await getFuncionarioAtual(profile.id);
  const supabase = await createClient();

  const { data: solicitacoes } = funcionario
    ? await supabase
        .from("solicitacoes_atualizacao_cadastral")
        .select("id, campo, status, created_at")
        .eq("funcionario_id", funcionario.id)
        .order("created_at", { ascending: false })
        .limit(10)
    : { data: [] };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold">Meu Cadastro</h1>
        <p className="text-sm text-muted-foreground">Dados cadastrais e solicitação de atualização.</p>
      </div>

      {funcionario && (
        <Card>
          <CardContent className="grid gap-4 p-6 sm:grid-cols-2">
            <div><p className="text-xs text-muted-foreground">Nome completo</p><p className="font-medium">{funcionario.nome_completo}</p></div>
            <div><p className="text-xs text-muted-foreground">CPF</p><p className="font-medium">{formatCPF(funcionario.cpf)}</p></div>
            <div><p className="text-xs text-muted-foreground">Matrícula</p><p className="font-medium">{funcionario.matricula}</p></div>
            <div><p className="text-xs text-muted-foreground">Cargo</p><p className="font-medium">{funcionario.cargo}</p></div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Solicitar atualização cadastral</CardTitle>
          <CardDescription>Endereço, telefone, chave PIX e contato de emergência dependem de aprovação do RH.</CardDescription>
        </CardHeader>
        <CardContent>
          <AtualizarCadastroForm />
        </CardContent>
      </Card>

      {solicitacoes && solicitacoes.length > 0 && (
        <Card>
          <CardHeader><CardTitle className="text-base">Histórico de solicitações</CardTitle></CardHeader>
          <CardContent className="space-y-2">
            {solicitacoes.map((s) => (
              <div key={s.id} className="flex items-center justify-between rounded-md border border-border p-3 text-sm">
                <span className="capitalize">{s.campo.replace(/_/g, " ")}</span>
                <Badge variant={s.status === "aprovada" ? "success" : s.status === "rejeitada" ? "destructive" : "secondary"}>
                  {s.status}
                </Badge>
              </div>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
