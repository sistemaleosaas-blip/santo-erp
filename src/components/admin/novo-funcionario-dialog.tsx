"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Loader2, UserPlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { funcionarioSchema, type FuncionarioInput } from "@/lib/validations/erp";
import { criarFuncionario } from "@/app/(admin)/admin/funcionarios/actions";

const CATEGORIAS = [
  { value: "portaria", label: "Portaria" },
  { value: "controle_acesso", label: "Controle de Acesso" },
  { value: "limpeza", label: "Limpeza" },
  { value: "zeladoria", label: "Zeladoria" },
  { value: "jardinagem", label: "Jardinagem" },
  { value: "ronda_interna", label: "Ronda Interna" },
  { value: "seguranca_patrimonial", label: "Segurança Patrimonial" },
  { value: "facilities", label: "Facilities" },
] as const;

export function NovoFuncionarioDialog() {
  const [open, setOpen] = useState(false);
  const router = useRouter();
  const {
    register,
    control,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FuncionarioInput>({ resolver: zodResolver(funcionarioSchema) });

  async function onSubmit(data: FuncionarioInput) {
    const result = await criarFuncionario(data);
    if (result.success) {
      toast.success("Funcionário cadastrado com sucesso.");
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
          <UserPlus className="h-4 w-4" /> Novo Funcionário
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Cadastrar funcionário</DialogTitle>
          <DialogDescription>A matrícula é gerada automaticamente. O acesso ao portal é vinculado no primeiro login por CPF.</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
          <div className="space-y-1.5">
            <Label htmlFor="nomeCompleto">Nome completo</Label>
            <Input id="nomeCompleto" {...register("nomeCompleto")} aria-invalid={!!errors.nomeCompleto} />
            {errors.nomeCompleto && <p className="text-xs text-destructive">{errors.nomeCompleto.message}</p>}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="cpf">CPF</Label>
              <Input id="cpf" placeholder="000.000.000-00" {...register("cpf")} aria-invalid={!!errors.cpf} />
              {errors.cpf && <p className="text-xs text-destructive">{errors.cpf.message}</p>}
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="rg">RG</Label>
              <Input id="rg" {...register("rg")} />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="cargo">Cargo</Label>
              <Input id="cargo" placeholder="Ex: Porteiro" {...register("cargo")} aria-invalid={!!errors.cargo} />
              {errors.cargo && <p className="text-xs text-destructive">{errors.cargo.message}</p>}
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="dataAdmissao">Data de admissão</Label>
              <Input id="dataAdmissao" type="date" {...register("dataAdmissao")} aria-invalid={!!errors.dataAdmissao} />
              {errors.dataAdmissao && <p className="text-xs text-destructive">{errors.dataAdmissao.message}</p>}
            </div>
          </div>

          <div className="space-y-1.5">
            <Label>Categoria de serviço</Label>
            <Controller
              control={control}
              name="categoria"
              render={({ field }) => (
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger><SelectValue placeholder="Selecione a categoria" /></SelectTrigger>
                  <SelectContent>
                    {CATEGORIAS.map((c) => (
                      <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
            {errors.categoria && <p className="text-xs text-destructive">{errors.categoria.message}</p>}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="salarioBase">Salário base (R$)</Label>
              <Input id="salarioBase" type="number" step="0.01" {...register("salarioBase")} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="pixKey">Chave PIX</Label>
              <Input id="pixKey" {...register("pixKey")} />
            </div>
          </div>

          <Button type="submit" className="w-full" disabled={isSubmitting}>
            {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <UserPlus className="h-4 w-4" />}
            Cadastrar
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
