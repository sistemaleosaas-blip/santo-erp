"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Loader2, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { enviarMensagemChamado } from "@/app/(cliente)/actions";

export function EnviarMensagemChamado({ chamadoId }: { chamadoId: string }) {
  const [mensagem, setMensagem] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function enviar() {
    if (!mensagem.trim()) return;
    setLoading(true);
    const result = await enviarMensagemChamado({ chamadoId, mensagem });
    setLoading(false);

    if (result.success) {
      setMensagem("");
      router.refresh();
    } else {
      toast.error(result.error);
    }
  }

  return (
    <form
      onSubmit={(e) => { e.preventDefault(); enviar(); }}
      className="flex gap-2"
    >
      <Input placeholder="Escreva uma mensagem..." value={mensagem} onChange={(e) => setMensagem(e.target.value)} />
      <Button type="submit" size="icon" variant="accent" disabled={loading}>
        {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
      </Button>
    </form>
  );
}
