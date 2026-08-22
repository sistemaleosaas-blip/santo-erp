"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { FileSignature, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { contratoSchema, type ContratoInput } from "@/lib/validations/erp";
import { criarContrato } from "@/app/(admin)/admin/contratos/actions";

const SERVICOS = [
  { value: "portaria", label: "Portaria" },
  { value: "controle_acesso", label: "Controle de Acesso" },
  { value: "limpeza", label: "Limpeza" },
  { value: "zeladoria", label: "Zeladoria" },
  { value: "jardinagem", label: "Jardinagem" },
  { value: "ronda_interna", label: "Ronda Interna" },
  { value: "seguranca_patrimonial", label: "Segurança Patrimonial" },
  { value: "facilities", label: "Facilities" },
] as const;

interface ClienteOption {
  id: string;
  razao_social: string;
}

export function NovoContratoDialog({ clientes }: { clientes: ClienteOption[] }) {
  const [open, setOpen] = useState(false);
  const router = useRouter();
  const {
    register,
    control,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<ContratoInput>({
    resolver: zodResolver(contratoSchema),
    defaultValues: { servicos: [], status: "em_negociacao", postosContratados: 1 },
  });

  const servicosSelecionados = watch("servicos") ?? [];

  function toggleServico(value: string) {
    const atual = servicosSelecionados;
    const novo = atual.includes(value as never) ? atual.filter((s) => s !== value) : [...atual, value];
    setValue("servicos", novo as ContratoInput["servicos"], { shouldValidate: true });
  }

  async function onSubmit(data: ContratoInput) {
    const result = await criarContrato(data);
    if (result.success) {
      toast.success("Contrato cadastrado com sucesso.");
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
          <FileSignature className="h-4 w-4" /> Novo Contrato
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Cadastrar contrato</DialogTitle>
          <DialogDescription>Os postos de serviço são criados separadamente após o contrato ser aprovado.</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="numero">Número do contrato</Label>
              <Input id="numero" placeholder="CT-2026-0002" {...register("numero")} aria-invalid={!!errors.numero} />
              {errors.numero && <p className="text-xs text-destructive">{errors.numero.message}</p>}
            </div>
            <div className="space-y-1.5">
              <Label>Cliente</Label>
              <Controller
                control={control}
                name="clienteId"
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
                    <SelectContent>
                      {clientes.map((c) => (
                        <SelectItem key={c.id} value={c.id}>{c.razao_social}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
              {errors.clienteId && <p className="text-xs text-destructive">{errors.clienteId.message}</p>}
            </div>
          </div>

          <div className="space-y-1.5">
            <Label>Serviços incluídos</Label>
            <div className="grid grid-cols-2 gap-2 rounded-md border border-border p-3">
              {SERVICOS.map((s) => (
                <label key={s.value} className="flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={servicosSelecionados.includes(s.value as never)}
                    onChange={() => toggleServico(s.value)}
                    className="h-4 w-4 rounded border-input"
                  />
                  {s.label}
                </label>
              ))}
            </div>
            {errors.servicos && <p className="text-xs text-destructive">{errors.servicos.message}</p>}
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="dataInicio">Início</Label>
              <Input id="dataInicio" type="date" {...register("dataInicio")} aria-invalid={!!errors.dataInicio} />
              {errors.dataInicio && <p className="text-xs text-destructive">{errors.dataInicio.message}</p>}
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="valorMensal">Valor mensal (R$)</Label>
              <Input id="valorMensal" type="number" step="0.01" {...register("valorMensal")} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="postosContratados">Postos</Label>
              <Input id="postosContratados" type="number" min={1} {...register("postosContratados")} />
            </div>
          </div>

          <Button type="submit" className="w-full" disabled={isSubmitting}>
            {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <FileSignature className="h-4 w-4" />}
            Cadastrar contrato
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
