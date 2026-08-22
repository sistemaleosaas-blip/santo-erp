"use client";

import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Check, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { aprovarAssinatura, rejeitarAssinatura } from "@/app/(admin)/admin/assinaturas/actions";

export function AssinaturaAcoes({ assinaturaId, podeAprovar }: { assinaturaId: string; podeAprovar: boolean }) {
  const router = useRouter();

  async function handle(action: (id: string) => Promise<{ success: boolean; error?: string }>) {
    const result = await action(assinaturaId);
    if (result.success) {
      toast.success("Atualizado.");
      router.refresh();
    } else {
      toast.error(result.error ?? "Erro ao atualizar.");
    }
  }

  return (
    <div className="flex gap-2">
      <Button size="sm" variant="outline" onClick={() => handle(rejeitarAssinatura)}>
        <X className="h-4 w-4" /> Rejeitar
      </Button>
      <Button size="sm" variant="accent" disabled={!podeAprovar} onClick={() => handle(aprovarAssinatura)}>
        <Check className="h-4 w-4" /> Aprovar
      </Button>
    </div>
  );
}
