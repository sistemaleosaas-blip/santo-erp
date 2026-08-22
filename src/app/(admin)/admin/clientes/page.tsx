import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { NovoClienteDialog } from "@/components/admin/novo-cliente-dialog";
import { createClient } from "@/lib/supabase/server";
import { formatCNPJ } from "@/lib/utils/cpf-cnpj";

export default async function ClientesAdminPage() {
  const supabase = await createClient();
  const { data: clientes } = await supabase
    .from("clientes")
    .select("id, razao_social, nome_fantasia, cnpj, email_contato, is_active")
    .order("razao_social");

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold">Gestão de Clientes</h1>
          <p className="text-sm text-muted-foreground">{clientes?.length ?? 0} clientes cadastrados.</p>
        </div>
        <NovoClienteDialog />
      </div>

      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border text-left text-xs uppercase tracking-wide text-muted-foreground">
                  <th className="px-4 py-3">Razão social</th>
                  <th className="px-4 py-3">CNPJ</th>
                  <th className="px-4 py-3">E-mail de contato</th>
                  <th className="px-4 py-3">Status</th>
                </tr>
              </thead>
              <tbody>
                {clientes && clientes.length > 0 ? (
                  clientes.map((c) => (
                    <tr key={c.id} className="border-b border-border last:border-0 hover:bg-secondary/40">
                      <td className="px-4 py-3">
                        <p className="font-medium">{c.razao_social}</p>
                        {c.nome_fantasia && <p className="text-xs text-muted-foreground">{c.nome_fantasia}</p>}
                      </td>
                      <td className="px-4 py-3 text-muted-foreground">{formatCNPJ(c.cnpj)}</td>
                      <td className="px-4 py-3 text-muted-foreground">{c.email_contato}</td>
                      <td className="px-4 py-3">
                        <Badge variant={c.is_active ? "success" : "secondary"}>{c.is_active ? "Ativo" : "Inativo"}</Badge>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={4} className="px-4 py-10 text-center text-muted-foreground">
                      Nenhum cliente cadastrado ainda.
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
