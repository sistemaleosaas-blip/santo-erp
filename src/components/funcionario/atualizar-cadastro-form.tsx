"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Loader2, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { atualizacaoCadastralSchema, type AtualizacaoCadastralInput } from "@/lib/validations/funcionario-forms";
import { solicitarAtualizacaoCadastral } from "@/app/(funcionario)/actions";

const CAMPOS = [
  { value: "endereco", label: "Endereço" },
  { value: "telefone", label: "Telefone" },
  { value: "pix_key", label: "Chave PIX" },
  { value: "contato_emergencia", label: "Contato de emergência" },
] as const;

export function AtualizarCadastroForm() {
  const router = useRouter();
  const {
    control,
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<AtualizacaoCadastralInput>({ resolver: zodResolver(atualizacaoCadastralSchema) });

  async function onSubmit(data: AtualizacaoCadastralInput) {
    const result = await solicitarAtualizacaoCadastral(data);
    if (result.success) {
      toast.success("Solicitação enviada ao RH para análise.");
      reset();
      router.refresh();
    } else {
      toast.error(result.error);
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
      <div className="space-y-1.5">
        <Label>Campo a atualizar</Label>
        <Controller
          control={control}
          name="campo"
          render={({ field }) => (
            <Select value={field.value} onValueChange={field.onChange}>
              <SelectTrigger><SelectValue placeholder="Selecione o campo" /></SelectTrigger>
              <SelectContent>
                {CAMPOS.map((c) => <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>)}
              </SelectContent>
            </Select>
          )}
        />
        {errors.campo && <p className="text-xs text-destructive">{errors.campo.message}</p>}
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="valorProposto">Novo valor</Label>
        <Input id="valorProposto" {...register("valorProposto")} aria-invalid={!!errors.valorProposto} />
        {errors.valorProposto && <p className="text-xs text-destructive">{errors.valorProposto.message}</p>}
        <p className="text-xs text-muted-foreground">A alteração só entra em vigor após aprovação do RH.</p>
      </div>

      <Button type="submit" variant="accent" disabled={isSubmitting}>
        {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
        Enviar solicitação
      </Button>
    </form>
  );
}
