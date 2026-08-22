"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Loader2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cancelarFerias } from "@/app/(funcionario)/actions";

export function CancelarFeriasButton({ solicitacaoId }: { solicitacaoId: string }) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handle() {
    setLoading(true);
    const result = await cancelarFerias(solicitacaoId);
    setLoading(false);
    if (result.success) {
      toast.success("Solicitação cancelada.");
      router.refresh();
    } else {
      toast.error(result.error);
    }
  }

  return (
    <Button size="sm" variant="outline" onClick={handle} disabled={loading}>
      {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <X className="h-4 w-4" />}
      Cancelar
    </Button>
  );
}
