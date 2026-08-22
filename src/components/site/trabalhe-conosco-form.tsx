"use client";

import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Loader2, Send, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createClient } from "@/lib/supabase/client";
import { trabalheConoscoSchema, type TrabalheConoscoInput } from "@/lib/validations/site-forms";
import { enviarTrabalheConosco } from "@/app/(site)/actions";

export function TrabalheConoscoForm() {
  const [uploading, setUploading] = React.useState(false);
  const [fileName, setFileName] = React.useState<string | null>(null);
  const {
    register,
    handleSubmit,
    setValue,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<TrabalheConoscoInput>({ resolver: zodResolver(trabalheConoscoSchema) });

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.type !== "application/pdf") {
      toast.error("Envie o currículo em formato PDF.");
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      toast.error("O arquivo deve ter até 10MB.");
      return;
    }

    setUploading(true);
    const supabase = createClient();
    const path = `${crypto.randomUUID()}.pdf`;
    const { error } = await supabase.storage.from("curriculos").upload(path, file);
    setUploading(false);

    if (error) {
      toast.error("Falha ao enviar o currículo. Tente novamente.");
      return;
    }

    const { data } = supabase.storage.from("curriculos").getPublicUrl(path);
    setValue("curriculoUrl", data.publicUrl);
    setFileName(file.name);
    toast.success("Currículo anexado.");
  }

  async function onSubmit(data: TrabalheConoscoInput) {
    const result = await enviarTrabalheConosco(data);
    if (result.success) {
      toast.success("Candidatura enviada com sucesso!");
      reset();
      setFileName(null);
    } else {
      toast.error(result.error);
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5" noValidate>
      <div className="grid gap-5 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label htmlFor="nome">Nome completo</Label>
          <Input id="nome" {...register("nome")} aria-invalid={!!errors.nome} />
          {errors.nome && <p className="text-xs text-destructive">{errors.nome.message}</p>}
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="telefone">Telefone / WhatsApp</Label>
          <Input id="telefone" {...register("telefone")} aria-invalid={!!errors.telefone} />
          {errors.telefone && <p className="text-xs text-destructive">{errors.telefone.message}</p>}
        </div>
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label htmlFor="email">E-mail</Label>
          <Input id="email" type="email" {...register("email")} aria-invalid={!!errors.email} />
          {errors.email && <p className="text-xs text-destructive">{errors.email.message}</p>}
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="cargoPretendido">Cargo de interesse</Label>
          <Input id="cargoPretendido" placeholder="Ex: Porteiro, Vigilante, Auxiliar de Limpeza" {...register("cargoPretendido")} aria-invalid={!!errors.cargoPretendido} />
          {errors.cargoPretendido && <p className="text-xs text-destructive">{errors.cargoPretendido.message}</p>}
        </div>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="curriculo">Currículo (PDF, até 10MB)</Label>
        <label
          htmlFor="curriculo"
          className="flex cursor-pointer items-center justify-center gap-2 rounded-md border border-dashed border-input bg-background px-3 py-6 text-sm text-muted-foreground hover:bg-secondary/50"
        >
          {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
          {fileName ?? "Clique para selecionar o arquivo"}
        </label>
        <input id="curriculo" type="file" accept="application/pdf" className="hidden" onChange={handleFileChange} />
      </div>

      <Button type="submit" variant="accent" size="lg" disabled={isSubmitting || uploading} className="w-full sm:w-auto">
        {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
        Enviar candidatura
      </Button>
    </form>
  );
}
