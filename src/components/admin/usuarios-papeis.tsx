"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Loader2, ShieldPlus, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { atribuirPapelSchema, type AtribuirPapelInput } from "@/lib/validations/erp";
import { atribuirPapel, removerPapel } from "@/app/(admin)/admin/usuarios/actions";
import { ROLE_LABELS, type AppRole } from "@/types/auth";

interface UsuarioComPapeis {
  id: string;
  full_name: string;
  email: string;
  papeis: { id: string; role: AppRole }[];
}

export function AtribuirPapelForm() {
  const router = useRouter();
  const {
    register,
    control,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<AtribuirPapelInput>({ resolver: zodResolver(atribuirPapelSchema) });

  async function onSubmit(data: AtribuirPapelInput) {
    const result = await atribuirPapel(data);
    if (result.success) {
      toast.success("Papel atribuído com sucesso.");
      reset();
      router.refresh();
    } else {
      toast.error(result.error);
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Atribuir papel</CardTitle>
        <CardDescription>O usuário precisa já ter feito login no sistema ao menos uma vez.</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-wrap items-end gap-3" noValidate>
          <div className="min-w-[220px] flex-1 space-y-1.5">
            <Label htmlFor="email">E-mail do usuário</Label>
            <Input id="email" type="email" {...register("email")} aria-invalid={!!errors.email} />
            {errors.email && <p className="text-xs text-destructive">{errors.email.message}</p>}
          </div>
          <div className="w-48 space-y-1.5">
            <Label>Papel</Label>
            <Controller
              control={control}
              name="role"
              render={({ field }) => (
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
                  <SelectContent>
                    {(Object.keys(ROLE_LABELS) as AppRole[]).map((r) => (
                      <SelectItem key={r} value={r}>{ROLE_LABELS[r]}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
          </div>
          <Button type="submit" variant="accent" disabled={isSubmitting}>
            {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <ShieldPlus className="h-4 w-4" />}
            Atribuir
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}

export function UsuariosTable({ usuarios }: { usuarios: UsuarioComPapeis[] }) {
  const router = useRouter();

  async function handleRemover(id: string) {
    const result = await removerPapel(id);
    if (result.success) {
      toast.success("Papel removido.");
      router.refresh();
    } else {
      toast.error(result.error);
    }
  }

  return (
    <Card>
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border text-left text-xs uppercase tracking-wide text-muted-foreground">
                <th className="px-4 py-3">Nome</th>
                <th className="px-4 py-3">E-mail</th>
                <th className="px-4 py-3">Papéis</th>
              </tr>
            </thead>
            <tbody>
              {usuarios.length > 0 ? (
                usuarios.map((u) => (
                  <tr key={u.id} className="border-b border-border last:border-0 hover:bg-secondary/40">
                    <td className="px-4 py-3 font-medium">{u.full_name}</td>
                    <td className="px-4 py-3 text-muted-foreground">{u.email}</td>
                    <td className="px-4 py-3">
                      <div className="flex flex-wrap gap-1.5">
                        {u.papeis.map((p) => (
                          <Badge key={p.id} variant="secondary" className="gap-1 pr-1">
                            {ROLE_LABELS[p.role]}
                            <button onClick={() => handleRemover(p.id)} aria-label={`Remover papel ${p.role}`}>
                              <X className="h-3 w-3" />
                            </button>
                          </Badge>
                        ))}
                        {u.papeis.length === 0 && <span className="text-xs text-muted-foreground">Sem papéis</span>}
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={3} className="px-4 py-10 text-center text-muted-foreground">
                    Nenhum usuário encontrado.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}
