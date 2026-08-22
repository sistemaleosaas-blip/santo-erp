import type { Metadata } from "next";
import { Mail, MapPin, Phone } from "lucide-react";
import { ContatoForm } from "@/components/site/contato-form";
import { siteConfig } from "@/config/site";

export const metadata: Metadata = {
  title: "Contato",
  description: `Fale com a ${siteConfig.name} e solicite um orçamento para segurança patrimonial e facilities em Limeira/SP.`,
};

export default function ContatoPage() {
  return (
    <div className="container py-20">
      <div className="grid gap-16 lg:grid-cols-[1fr_1.2fr]">
        <div>
          <span className="font-mono text-xs uppercase tracking-widest text-accent">Fale conosco</span>
          <h1 className="mt-3 font-display text-5xl font-bold tracking-tight">Contato</h1>
          <p className="mt-6 text-muted-foreground">
            Preencha o formulário com os detalhes do seu local e retornamos em até 1
            dia útil com uma proposta.
          </p>

          <ul className="mt-10 space-y-5 text-sm">
            <li className="flex gap-3">
              <MapPin className="h-5 w-5 shrink-0 text-accent" /> {siteConfig.address}
            </li>
            <li className="flex gap-3">
              <Phone className="h-5 w-5 shrink-0 text-accent" /> {siteConfig.phone}
            </li>
            <li className="flex gap-3">
              <Mail className="h-5 w-5 shrink-0 text-accent" /> {siteConfig.email}
            </li>
          </ul>
        </div>

        <div className="rounded-2xl border border-border bg-card p-8">
          <ContatoForm />
        </div>
      </div>
    </div>
  );
}
