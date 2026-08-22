import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight as ArrowRightIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { servicos } from "@/config/site";

export const metadata: Metadata = {
  title: "Serviços",
  description: "Portaria, controle de acesso, limpeza, zeladoria, jardinagem, ronda interna, segurança patrimonial e facilities.",
};

export default function ServicosPage() {
  return (
    <div className="container py-20">
      <span className="font-mono text-xs uppercase tracking-widest text-accent">O que fazemos</span>
      <h1 className="mt-3 max-w-2xl font-display text-5xl font-bold tracking-tight">Nossos serviços</h1>
      <p className="mt-6 max-w-2xl text-lg text-muted-foreground">
        Cada serviço pode ser contratado isoladamente ou combinado em um pacote de
        facilities com gestão única.
      </p>

      <div className="mt-16 space-y-4">
        {servicos.map((s, i) => {
          const Icon = s.icon;
          return (
            <div
              key={s.slug}
              id={s.slug}
              className="grid gap-6 rounded-xl border border-border bg-card p-8 md:grid-cols-[auto_1fr_auto] md:items-center"
            >
              <div className="flex h-14 w-14 items-center justify-center rounded-lg bg-accent/10">
                <Icon className="h-7 w-7 text-accent" />
              </div>
              <div>
                <span className="font-mono text-xs text-muted-foreground">0{i + 1}</span>
                <h2 className="font-display text-2xl font-semibold">{s.nome}</h2>
                <p className="mt-1 max-w-xl text-sm text-muted-foreground">{s.descricao}</p>
              </div>
              <Button asChild variant="outline">
                <Link href="/contato">
                  Consultar disponibilidade <ArrowRightIcon className="h-4 w-4" />
                </Link>
              </Button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
