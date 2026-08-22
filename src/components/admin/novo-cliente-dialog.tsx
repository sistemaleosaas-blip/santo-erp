"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Building2, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { clienteSchema, type ClienteInput } from "@/lib/validations/erp";
import { criarCliente } from "@/app/(admin)/admin/clientes/actions";

export function NovoClienteDialog() {
  const [open, setOpen] = useState(false);
  const router = useRouter();
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ClienteInput>({ resolver: zodResolver(clienteSchema) });

  async function onSubmit(data: ClienteInput) {
    const result = await criarCliente(data);
    if (result.success) {
      toast.success("Cliente cadastrado com sucesso.");
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
          <Building2 className="h-4 w-4" /> Novo Cliente
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Cadastrar cliente</DialogTitle>
          <DialogDescription>Depois vincule um usuário a este cliente para liberar o acesso ao Portal do Cliente.</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
          <div className="space-y-1.5">
            <Label htmlFor="razaoSocial">Razão social</Label>
            <Input id="razaoSocial" {...register("razaoSocial")} aria-invalid={!!errors.razaoSocial} />
            {errors.razaoSocial && <p className="text-xs text-destructive">{errors.razaoSocial.message}</p>}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="nomeFantasia">Nome fantasia</Label>
              <Input id="nomeFantasia" {...register("nomeFantasia")} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="cnpj">CNPJ</Label>
              <Input id="cnpj" placeholder="00.000.000/0000-00" {...register("cnpj")} aria-invalid={!!errors.cnpj} />
              {errors.cnpj && <p className="text-xs text-destructive">{errors.cnpj.message}</p>}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="emailContato">E-mail de contato</Label>
              <Input id="emailContato" type="email" {...register("emailContato")} aria-invalid={!!errors.emailContato} />
              {errors.emailContato && <p className="text-xs text-destructive">{errors.emailContato.message}</p>}
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="telefone">Telefone</Label>
              <Input id="telefone" {...register("telefone")} />
            </div>
          </div>

          <Button type="submit" className="w-full" disabled={isSubmitting}>
            {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Building2 className="h-4 w-4" />}
            Cadastrar
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
