"use client";

import { useRef, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Eraser, FileSignature, Loader2 } from "lucide-react";
import SignaturePad from "signature_pad";
import { Button } from "@/components/ui/button";
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";

export function AssinarHoleriteDialog({ holeriteId, competencia }: { holeriteId: string; competencia: string }) {
  const [open, setOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const padRef = useRef<SignaturePad | null>(null);
  const router = useRouter();

  useEffect(() => {
    if (open && canvasRef.current) {
      const canvas = canvasRef.current;
      // Ajusta resolução do canvas ao tamanho real exibido (evita traço borrado).
      const ratio = Math.max(window.devicePixelRatio || 1, 1);
      canvas.width = canvas.offsetWidth * ratio;
      canvas.height = canvas.offsetHeight * ratio;
      canvas.getContext("2d")?.scale(ratio, ratio);

      padRef.current = new SignaturePad(canvas, {
        backgroundColor: "rgb(255,255,255)",
        penColor: "rgb(30,41,59)",
      });
    }
    return () => {
      padRef.current?.off();
      padRef.current = null;
    };
  }, [open]);

  function limpar() {
    padRef.current?.clear();
  }

  async function confirmarAssinatura() {
    if (!padRef.current || padRef.current.isEmpty()) {
      toast.error("Desenhe sua assinatura antes de confirmar.");
      return;
    }

    setSubmitting(true);
    const signaturePngBase64 = padRef.current.toDataURL("image/png");

    try {
      const res = await fetch("/api/assinaturas", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ holeriteId, signaturePngBase64 }),
      });
      const json = await res.json();

      if (!res.ok) {
        toast.error(json.error ?? "Não foi possível registrar a assinatura.");
        return;
      }

      toast.success("Holerite assinado! Aguardando aprovação do RH.");
      setOpen(false);
      router.refresh();
    } catch {
      toast.error("Erro de conexão. Tente novamente.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" variant="accent">
          <FileSignature className="h-4 w-4" /> Assinar
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Assinar holerite — {competencia}</DialogTitle>
          <DialogDescription>
            Desenhe sua assinatura no campo abaixo com o dedo ou o mouse. Ao confirmar, um
            PDF com sua assinatura é gerado e fica disponível para aprovação do RH.
          </DialogDescription>
        </DialogHeader>

        <canvas ref={canvasRef} className="h-40 w-full rounded-md border border-input bg-white" />

        <div className="mt-4 flex justify-between gap-3">
          <Button type="button" variant="outline" onClick={limpar} disabled={submitting}>
            <Eraser className="h-4 w-4" /> Limpar
          </Button>
          <Button type="button" variant="accent" onClick={confirmarAssinatura} disabled={submitting}>
            {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <FileSignature className="h-4 w-4" />}
            Confirmar assinatura
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
