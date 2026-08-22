"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Loader2, Palmtree } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { solicitarFeriasSchema, type SolicitarFeriasInput } from "@/lib/validations/funcionario-forms";
import { solicitarFerias } from "@/app/(funcionario)/actions";

export function SolicitarFeriasDialog() {
  const [open, setOpen] = useState(false);
  const router = useRouter();
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<SolicitarFeriasInput>({ resolver: zodResolver(solicitarFeriasSchema) });

  async function onSubmit(data: SolicitarFeriasInput) {
    const result = await solicitarFerias(data);
    if (result.success) {
      toast.success("Solicitação enviada ao RH.");
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
          <Palmtree className="h-4 w-4" /> Solicitar Férias
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Solicitar férias</DialogTitle>
          <DialogDescription>O RH avalia e aprova sua solicitação em até 5 dias úteis.</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="periodoAquisitivoInicio">Período aquisitivo — início</Label>
              <Input id="periodoAquisitivoInicio" type="date" {...register("periodoAquisitivoInicio")} aria-invalid={!!errors.periodoAquisitivoInicio} />
              {errors.periodoAquisitivoInicio && <p className="text-xs text-destructive">{errors.periodoAquisitivoInicio.message}</p>}
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="periodoAquisitivoFim">Período aquisitivo — fim</Label>
              <Input id="periodoAquisitivoFim" type="date" {...register("periodoAquisitivoFim")} aria-invalid={!!errors.periodoAquisitivoFim} />
              {errors.periodoAquisitivoFim && <p className="text-xs text-destructive">{errors.periodoAquisitivoFim.message}</p>}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="dataInicio">Início das férias</Label>
              <Input id="dataInicio" type="date" {...register("dataInicio")} aria-invalid={!!errors.dataInicio} />
              {errors.dataInicio && <p className="text-xs text-destructive">{errors.dataInicio.message}</p>}
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="dataFim">Fim das férias</Label>
              <Input id="dataFim" type="date" {...register("dataFim")} aria-invalid={!!errors.dataFim} />
              {errors.dataFim && <p className="text-xs text-destructive">{errors.dataFim.message}</p>}
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="observacoesFuncionario">Observações (opcional)</Label>
            <textarea
              id="observacoesFuncionario"
              rows={3}
              className="w-full rounded-md border border-input bg-background p-3 text-sm"
              {...register("observacoesFuncionario")}
            />
          </div>

          <Button type="submit" className="w-full" disabled={isSubmitting}>
            {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Palmtree className="h-4 w-4" />}
            Enviar solicitação
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
