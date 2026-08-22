"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Check, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { marcarAvisoLido } from "@/app/(funcionario)/actions";

export function MarcarLidoButton({ avisoId }: { avisoId: string }) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handle() {
    setLoading(true);
    const result = await marcarAvisoLido(avisoId);
    setLoading(false);
    if (result.success) {
      toast.success("Marcado como lido.");
      router.refresh();
    } else {
      toast.error(result.error);
    }
  }

  return (
    <Button size="sm" variant="outline" onClick={handle} disabled={loading}>
      {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
      Marcar como lido
    </Button>
  );
}
