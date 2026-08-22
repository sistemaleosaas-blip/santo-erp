import { FileDown } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { AssinarHoleriteDialog } from "@/components/funcionario/assinar-holerite-dialog";
import { createClient } from "@/lib/supabase/server";
import { getSessionProfile, getFuncionarioAtual } from "@/lib/services/session";

const STATUS_VARIANT = {
  gerado: "secondary",
  disponivel: "default",
  assinado: "success",
  contestado: "destructive",
} as const;

export default async function HoleritesPage() {
  const profile = await getSessionProfile();
  const funcionario = await getFuncionarioAtual(profile.id);
  const supabase = await createClient();

  const { data: holerites } = funcionario
    ? await supabase
        .from("holerites")
        .select("id, competencia, liquido, status, arquivo_pdf_url")
        .eq("funcionario_id", funcionario.id)
        .order("competencia", { ascending: false })
    : { data: [] };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold">Holerites</h1>
        <p className="text-sm text-muted-foreground">Baixe seus contracheques e assine digitalmente quando disponível.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Histórico</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {holerites && holerites.length > 0 ? (
            holerites.map((h) => (
              <div key={h.id} className="flex flex-col gap-3 rounded-md border border-border p-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="font-medium capitalize">
                    {new Date(h.competencia).toLocaleDateString("pt-BR", { month: "long", year: "numeric" })}
                  </p>
                  <p className="text-sm text-muted-foreground">Líquido: R$ {Number(h.liquido).toFixed(2)}</p>
                </div>
                <div className="flex items-center gap-3">
                  <Badge variant={STATUS_VARIANT[h.status as keyof typeof STATUS_VARIANT]}>{h.status}</Badge>
                  <Button variant="outline" size="sm" disabled={!h.arquivo_pdf_url}>
                    <FileDown className="h-4 w-4" /> PDF
                  </Button>
                  {h.status === "disponivel" && (
                    <AssinarHoleriteDialog
                      holeriteId={h.id}
                      competencia={new Date(h.competencia).toLocaleDateString("pt-BR", { month: "long", year: "numeric" })}
                    />
                  )}
                </div>
              </div>
            ))
          ) : (
            <p className="text-sm text-muted-foreground">Nenhum holerite disponível ainda.</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
