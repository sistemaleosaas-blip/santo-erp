"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, LogIn } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { loginFuncionarioSchema, type LoginFuncionarioInput } from "@/lib/validations/auth";
import { loginFuncionario } from "@/app/(auth)/actions";

export function LoginFuncionarioForm() {
  const router = useRouter();
  const params = useSearchParams();
  const [serverError, setServerError] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFuncionarioInput>({ resolver: zodResolver(loginFuncionarioSchema) });

  async function onSubmit(data: LoginFuncionarioInput) {
    setServerError(null);
    const result = await loginFuncionario(data);
    if (!result.success) {
      setServerError(result.error);
      return;
    }
    router.push(params.get("redirectTo") ?? "/funcionario/dashboard");
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
      <div className="space-y-1.5">
        <Label htmlFor="cpf">CPF</Label>
        <Input id="cpf" placeholder="000.000.000-00" {...register("cpf")} aria-invalid={!!errors.cpf} />
        {errors.cpf && <p className="text-xs text-destructive">{errors.cpf.message}</p>}
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="senha">Senha</Label>
        <Input id="senha" type="password" {...register("senha")} aria-invalid={!!errors.senha} />
        {errors.senha && <p className="text-xs text-destructive">{errors.senha.message}</p>}
      </div>
      {serverError && <p className="text-sm text-destructive">{serverError}</p>}
      <Button type="submit" className="w-full" disabled={isSubmitting}>
        {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <LogIn className="h-4 w-4" />}
        Entrar
      </Button>
    </form>
  );
}
