import type { Metadata } from "next";
import { HeartHandshake, TrendingUp, GraduationCap } from "lucide-react";
import { TrabalheConoscoForm } from "@/components/site/trabalhe-conosco-form";

export const metadata: Metadata = {
  title: "Trabalhe Conosco",
  description: "Faça parte da equipe da Santo Serviços Terceirizados em Limeira/SP. Envie seu currículo.",
};

const BENEFICIOS = [
  { icon: HeartHandshake, texto: "Registro em carteira e benefícios desde o primeiro dia" },
  { icon: GraduationCap, texto: "Treinamento contínuo e capacitação técnica" },
  { icon: TrendingUp, texto: "Plano de carreira interno, com promoções reais" },
];

export default function TrabalheConoscoPage() {
  return (
    <div className="container py-20">
      <div className="grid gap-16 lg:grid-cols-[1fr_1.2fr]">
        <div>
          <span className="font-mono text-xs uppercase tracking-widest text-accent">Carreiras</span>
          <h1 className="mt-3 font-display text-5xl font-bold tracking-tight">Trabalhe Conosco</h1>
          <p className="mt-6 text-muted-foreground">
            Buscamos porteiros, vigilantes, auxiliares de limpeza, jardineiros e
            supervisores comprometidos com um bom trabalho. Envie seu currículo e
            entraremos em contato quando surgir uma vaga compatível.
          </p>

          <ul className="mt-10 space-y-4 text-sm">
            {BENEFICIOS.map((b) => (
              <li key={b.texto} className="flex gap-3">
                <b.icon className="h-5 w-5 shrink-0 text-accent" /> {b.texto}
              </li>
            ))}
          </ul>
        </div>

        <div className="rounded-2xl border border-border bg-card p-8">
          <TrabalheConoscoForm />
        </div>
      </div>
    </div>
  );
}
