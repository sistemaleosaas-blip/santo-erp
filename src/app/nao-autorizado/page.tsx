import Link from "next/link";
import { ShieldAlert } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function NaoAutorizadoPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 px-4 text-center">
      <ShieldAlert className="h-12 w-12 text-destructive" />
      <h1 className="font-display text-2xl font-bold">Acesso não autorizado</h1>
      <p className="max-w-sm text-sm text-muted-foreground">
        Seu usuário não tem permissão para acessar esta área. Se você acredita
        que isso é um erro, fale com o administrador do sistema.
      </p>
      <Button asChild>
        <Link href="/">Voltar ao início</Link>
      </Button>
    </div>
  );
}
