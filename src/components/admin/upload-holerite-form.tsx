"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Loader2, Upload, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { createClient } from "@/lib/supabase/client";
import { uploadHoleriteSchema, type UploadHoleriteInput } from "@/lib/validations/erp";
import { registrarHolerite } from "@/app/(admin)/admin/holerites/actions";

interface FuncionarioOption {
  id: string;
  nome_completo: string;
  matricula: string;
}

export function UploadHoleriteForm({ funcionarios }: { funcionarios: FuncionarioOption[] }) {
  const router = useRouter();
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const {
    register,
    control,
    handleSubmit,
    reset,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<UploadHoleriteInput>({ resolver: zodResolver(uploadHoleriteSchema) });

  const proventos = Number(watch("proventos")) || 0;
  const descontos = Number(watch("descontos")) || 0;
  const inss = Number(watch("inss")) || 0;
  const irrf = Number(watch("irrf")) || 0;
  const liquidoCalculado = proventos - descontos - inss - irrf;

  async function onSubmit(data: UploadHoleriteInput) {
    let arquivoPdfUrl: string | null = null;

    if (file) {
      setUploading(true);
      const supabase = createClient();
      const path = `${data.funcionarioId}/${data.competencia}.pdf`;
      const { error: uploadError } = await supabase.storage.from("holerites").upload(path, file, { upsert: true });
      setUploading(false);

      if (uploadError) {
        toast.error("Falha ao enviar o PDF. O holerite não foi registrado.");
        return;
      }
      const { data: urlData } = supabase.storage.from("holerites").getPublicUrl(path);
      arquivoPdfUrl = urlData.publicUrl;
    }

    const result = await registrarHolerite({ ...data, liquido: liquidoCalculado }, arquivoPdfUrl);
    if (result.success) {
      toast.success("Holerite registrado e disponibilizado para assinatura.");
      reset();
      setFile(null);
      router.refresh();
    } else {
      toast.error(result.error);
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Registrar holerite</CardTitle>
        <CardDescription>Selecione o funcionário, informe os valores e anexe o PDF (opcional nesta etapa).</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label>Funcionário</Label>
              <Controller
                control={control}
                name="funcionarioId"
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
                    <SelectContent>
                      {funcionarios.map((f) => (
                        <SelectItem key={f.id} value={f.id}>{f.nome_completo} ({f.matricula})</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
              {errors.funcionarioId && <p className="text-xs text-destructive">{errors.funcionarioId.message}</p>}
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="competencia">Competência</Label>
              <Input id="competencia" type="month" {...register("competencia")} aria-invalid={!!errors.competencia} />
              {errors.competencia && <p className="text-xs text-destructive">{errors.competencia.message}</p>}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            <div className="space-y-1.5">
              <Label htmlFor="proventos">Proventos</Label>
              <Input id="proventos" type="number" step="0.01" {...register("proventos")} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="descontos">Descontos</Label>
              <Input id="descontos" type="number" step="0.01" {...register("descontos")} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="inss">INSS</Label>
              <Input id="inss" type="number" step="0.01" {...register("inss")} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="irrf">IRRF</Label>
              <Input id="irrf" type="number" step="0.01" {...register("irrf")} />
            </div>
          </div>

          <div className="rounded-md border border-border bg-secondary/40 p-3 text-sm">
            Líquido calculado: <strong>R$ {liquidoCalculado.toFixed(2)}</strong>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="pdf">PDF do holerite (opcional)</Label>
            <label htmlFor="pdf" className="flex cursor-pointer items-center justify-center gap-2 rounded-md border border-dashed border-input px-3 py-4 text-sm text-muted-foreground hover:bg-secondary/50">
              {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <FileText className="h-4 w-4" />}
              {file ? file.name : "Selecionar PDF"}
            </label>
            <input id="pdf" type="file" accept="application/pdf" className="hidden" onChange={(e) => setFile(e.target.files?.[0] ?? null)} />
          </div>

          <Button type="submit" variant="accent" disabled={isSubmitting || uploading}>
            {isSubmitting || uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
            Registrar holerite
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
