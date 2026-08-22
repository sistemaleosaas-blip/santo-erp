import { FileSpreadsheet, FileText } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function RelatoriosPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold">Relatórios</h1>
        <p className="text-sm text-muted-foreground">Exporte dados operacionais em Excel ou PDF.</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <Card>
          <CardHeader>
            <FileSpreadsheet className="h-6 w-6 text-accent" />
            <CardTitle className="text-base">Funcionários — Excel</CardTitle>
            <CardDescription>Planilha completa com CPF, matrícula, cargo, status e salário base.</CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild variant="accent">
              <a href="/api/relatorios/excel" download>
                Baixar .xlsx
              </a>
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <FileText className="h-6 w-6 text-accent" />
            <CardTitle className="text-base">Funcionários — PDF</CardTitle>
            <CardDescription>Listagem em PDF pronta para impressão ou arquivamento.</CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild variant="outline">
              <a href="/api/relatorios/pdf" download>
                Baixar .pdf
              </a>
            </Button>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Próximos relatórios</CardTitle>
          <CardDescription>
            Relatórios de contratos, folha de pagamento consolidada e performance por posto
            entram na próxima fase, seguindo o mesmo padrão de exportação.
          </CardDescription>
        </CardHeader>
        <CardContent />
      </Card>
    </div>
  );
}
