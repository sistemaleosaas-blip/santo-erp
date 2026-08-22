"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Loader2, LifeBuoy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { novoChamadoSchema, type NovoChamadoInput } from "@/lib/validations/cliente-forms";
import { abrirChamado } from "@/app/(cliente)/actions";

const PRIORIDADES = [
  { value: "baixa", label: "Baixa" },
  { value: "media", label: "Média" },
  { value: "alta", label: "Alta" },
  { value: "urgente", label: "Urgente" },
] as const;

export function NovoChamadoDialog({ clienteId }: { clienteId: string }) {
  const [open, setOpen] = useState(false);
  const router = useRouter();
  const {
    register,
    control,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<NovoChamadoInput>({ resolver: zodResolver(novoChamadoSchema), defaultValues: { prioridade: "media" } });

  async function onSubmit(data: NovoChamadoInput) {
    const result = await abrirChamado(clienteId, data);
    if (result.success) {
      toast.success("Chamado aberto com sucesso.");
      reset();
      setOpen(false);
      router.refresh();
    } else {
      toast.error(result.error);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="accent">
          <LifeBuoy className="h-4 w-4" /> Abrir Chamado
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Abrir novo chamado</DialogTitle>
          <DialogDescription>Nossa equipe responde chamados de prioridade alta e urgente com prioridade.</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
          <div className="space-y-1.5">
            <Label htmlFor="assunto">Assunto</Label>
            <Input id="assunto" {...register("assunto")} aria-invalid={!!errors.assunto} />
            {errors.assunto && <p className="text-xs text-destructive">{errors.assunto.message}</p>}
          </div>

          <div className="space-y-1.5">
            <Label>Prioridade</Label>
            <Controller
              control={control}
              name="prioridade"
              render={({ field }) => (
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {PRIORIDADES.map((p) => <SelectItem key={p.value} value={p.value}>{p.label}</SelectItem>)}
                  </SelectContent>
                </Select>
              )}
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="descricao">Descrição</Label>
            <textarea
              id="descricao"
              rows={4}
              className="w-full rounded-md border border-input bg-background p-3 text-sm"
              {...register("descricao")}
              aria-invalid={!!errors.descricao}
            />
            {errors.descricao && <p className="text-xs text-destructive">{errors.descricao.message}</p>}
          </div>

          <Button type="submit" className="w-full" disabled={isSubmitting}>
            {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <LifeBuoy className="h-4 w-4" />}
            Abrir chamado
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
