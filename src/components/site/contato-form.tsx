"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Loader2, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { contatoComercialSchema, type ContatoComercialInput } from "@/lib/validations/site-forms";
import { enviarContatoComercial } from "@/app/(site)/actions";

export function ContatoForm() {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ContatoComercialInput>({ resolver: zodResolver(contatoComercialSchema) });

  async function onSubmit(data: ContatoComercialInput) {
    const result = await enviarContatoComercial(data);
    if (result.success) {
      toast.success("Mensagem enviada! Retornaremos em até 1 dia útil.");
      reset();
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
          <Label htmlFor="empresa">Empresa (opcional)</Label>
          <Input id="empresa" {...register("empresa")} />
        </div>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="mensagem">Como podemos ajudar?</Label>
        <textarea
          id="mensagem"
          rows={5}
          className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          placeholder="Conte um pouco sobre o local, os serviços que precisa e o número de postos."
          {...register("mensagem")}
          aria-invalid={!!errors.mensagem}
        />
        {errors.mensagem && <p className="text-xs text-destructive">{errors.mensagem.message}</p>}
      </div>

      <Button type="submit" variant="accent" size="lg" disabled={isSubmitting} className="w-full sm:w-auto">
        {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
        Enviar mensagem
      </Button>
    </form>
  );
}
