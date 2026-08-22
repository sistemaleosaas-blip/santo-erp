"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Loader2, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { uploadPontoLote } from "@/app/(admin)/admin/ponto/actions";

const EXEMPLO = `cpf,tipo,data_hora
123.456.789-00,entrada,2026-08-20T08:00:00
123.456.789-00,saida,2026-08-20T17:00:00`;

export function UploadPontoLoteForm() {
  const router = useRouter();
  const [csv, setCsv] = useState("");
  const [loading, setLoading] = useState(false);
  const [resultado, setResultado] = useState<{ inseridos: number; erros: string[] } | null>(null);

  function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setCsv(String(reader.result ?? ""));
    reader.readAsText(file);
  }

  async function enviar() {
    if (!csv.trim()) {
      toast.error("Cole ou envie um CSV antes de continuar.");
      return;
    }
    setLoading(true);
    const result = await uploadPontoLote(csv);
    setLoading(false);

    if (!result.success) {
      toast.error(result.error);
      return;
    }
    setResultado({ inseridos: result.inseridos, erros: result.erros });
    toast.success(`${result.inseridos} registro(s) importado(s).`);
    router.refresh();
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Upload em lote (CSV)</CardTitle>
        <CardDescription>
          Formato: <code className="rounded bg-secondary px-1 py-0.5">cpf,tipo,data_hora</code>. Tipos aceitos: entrada,
          saida_almoco, volta_almoco, saida, ajuste_manual.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <textarea
          rows={6}
          className="w-full rounded-md border border-input bg-background p-3 font-mono text-xs"
          placeholder={EXEMPLO}
          value={csv}
          onChange={(e) => setCsv(e.target.value)}
        />
        <div className="flex flex-wrap items-center gap-3">
          <label htmlFor="csvFile" className="cursor-pointer rounded-md border border-input px-3 py-2 text-sm hover:bg-secondary">
            Selecionar arquivo .csv
          </label>
          <input id="csvFile" type="file" accept=".csv,text/csv" className="hidden" onChange={handleFile} />
          <Button type="button" variant="accent" onClick={enviar} disabled={loading}>
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
            Importar registros
          </Button>
        </div>

        {resultado && (
          <div className="rounded-md border border-border p-3 text-sm">
            <p><strong>{resultado.inseridos}</strong> registro(s) importado(s) com sucesso.</p>
            {resultado.erros.length > 0 && (
              <ul className="mt-2 list-disc pl-5 text-xs text-destructive">
                {resultado.erros.map((e, i) => <li key={i}>{e}</li>)}
              </ul>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
