"use client";

import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { MoreVertical } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from "@/components/ui/dropdown-menu";
import { atualizarStatusFuncionario } from "@/app/(admin)/admin/funcionarios/actions";
import type { Database } from "@/types/database.types";

type FuncionarioStatus = Database["public"]["Enums"]["funcionario_status"];

const OPCOES: { status: FuncionarioStatus; label: string }[] = [
  { status: "ativo", label: "Marcar como ativo" },
  { status: "ferias", label: "Marcar como em férias" },
  { status: "afastado", label: "Marcar como afastado" },
  { status: "desligado", label: "Desligar funcionário" },
];

export function FuncionarioStatusMenu({ funcionarioId }: { funcionarioId: string }) {
  const router = useRouter();

  async function handleChange(status: FuncionarioStatus) {
    const result = await atualizarStatusFuncionario(funcionarioId, status);
    if (result.success) {
      toast.success("Status atualizado.");
      router.refresh();
    } else {
      toast.error(result.error);
    }
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" aria-label="Ações">
          <MoreVertical className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {OPCOES.map((o) => (
          <DropdownMenuItem key={o.status} onClick={() => handleChange(o.status)}>
            {o.label}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
