import type { Metadata } from "next";
import { Building2, Factory, Landmark, ShoppingBag } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "Clientes",
  description: "Condomínios, indústrias, redes de varejo e instituições que confiam na Santo Serviços Terceirizados.",
};

const SEGMENTOS = [
  { icon: Building2, titulo: "Condomínios", texto: "Residenciais e comerciais de Limeira e região, com portaria e controle de acesso 24h." },
  { icon: Factory, titulo: "Indústrias", texto: "Segurança patrimonial e ronda interna para plantas industriais e centros de distribuição." },
  { icon: ShoppingBag, titulo: "Varejo", texto: "Lojas e shoppings com facilities completos: limpeza, zeladoria e segurança." },
  { icon: Landmark, titulo: "Instituições", texto: "Escolas, clínicas e associações com equipes dedicadas e supervisão constante." },
];

export default function ClientesPage() {
  return (
    <div className="container py-20">
      <span className="font-mono text-xs uppercase tracking-widest text-accent">Quem confia na Santo</span>
      <h1 className="mt-3 max-w-2xl font-display text-5xl font-bold tracking-tight">Clientes</h1>
      <p className="mt-6 max-w-2xl text-lg text-muted-foreground">
        Atendemos mais de 80 contratos ativos em Limeira e região, entre condomínios,
        indústrias, varejo e instituições — cada um com um plano de segurança e
        facilities desenhado sob medida.
      </p>

      <div className="mt-16 grid gap-6 sm:grid-cols-2">
        {SEGMENTOS.map((s) => (
          <div key={s.titulo} className="flex gap-4 rounded-lg border border-border bg-card p-6">
            <s.icon className="h-8 w-8 shrink-0 text-accent" />
            <div>
              <h2 className="font-display text-lg font-semibold">{s.titulo}</h2>
              <p className="mt-1 text-sm text-muted-foreground">{s.texto}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-16 rounded-2xl border border-border bg-secondary/40 p-10 text-center">
        <h2 className="font-display text-2xl font-bold">Já é cliente da Santo?</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          Acompanhe seus postos, contratos e chamados pelo Portal do Cliente.
        </p>
        <Button asChild className="mt-6" variant="accent">
          <Link href="/login/cliente">Acessar Portal do Cliente</Link>
        </Button>
      </div>
    </div>
  );
}
