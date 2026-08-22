import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { UploadHoleriteForm } from "@/components/admin/upload-holerite-form";
import { createClient } from "@/lib/supabase/server";

const STATUS_VARIANT = {
  gerado: "secondary",
  disponivel: "default",
  assinado: "success",
  contestado: "destructive",
} as const;

export default async function AdminHoleritesPage() {
  const supabase = await createClient();

  const [{ data: funcionarios }, { data: holerites }] = await Promise.all([
    supabase.from("funcionarios").select("id, nome_completo, matricula").eq("status", "ativo").order("nome_completo"),
    supabase
      .from("holerites")
      .select("id, competencia, liquido, status, funcionarios(nome_completo, matricula)")
      .order("competencia", { ascending: false })
      .limit(20),
  ]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold">Holerites</h1>
        <p className="text-sm text-muted-foreground">Registre holerites individualmente e acompanhe o status de assinatura.</p>
      </div>

      <UploadHoleriteForm funcionarios={funcionarios ?? []} />

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Últimos registros</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {holerites && holerites.length > 0 ? (
            holerites.map((h: any) => (
              <div key={h.id} className="flex items-center justify-between rounded-md border border-border p-3 text-sm">
                <div>
                  <p className="font-medium">{h.funcionarios?.nome_completo}</p>
                  <p className="text-xs text-muted-foreground">
                    {h.funcionarios?.matricula} · {new Date(h.competencia).toLocaleDateString("pt-BR", { month: "long", year: "numeric" })}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-medium">R$ {Number(h.liquido).toFixed(2)}</span>
                  <Badge variant={STATUS_VARIANT[h.status as keyof typeof STATUS_VARIANT]}>{h.status}</Badge>
                </div>
              </div>
            ))
          ) : (
            <p className="text-sm text-muted-foreground">Nenhum holerite registrado ainda.</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
