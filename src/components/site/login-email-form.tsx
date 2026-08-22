"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, LogIn } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { loginEmailSchema, type LoginEmailInput } from "@/lib/validations/auth";
import { loginEmail } from "@/app/(auth)/actions";

export function LoginEmailForm({ defaultRedirect }: { defaultRedirect: string }) {
  const router = useRouter();
  const params = useSearchParams();
  const [serverError, setServerError] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginEmailInput>({ resolver: zodResolver(loginEmailSchema) });

  async function onSubmit(data: LoginEmailInput) {
    setServerError(null);
    const result = await loginEmail(data);
    if (!result.success) {
      setServerError(result.error);
      return;
    }
    router.push(params.get("redirectTo") ?? defaultRedirect);
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
      <div className="space-y-1.5">
        <Label htmlFor="email">E-mail</Label>
        <Input id="email" type="email" {...register("email")} aria-invalid={!!errors.email} />
        {errors.email && <p className="text-xs text-destructive">{errors.email.message}</p>}
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
