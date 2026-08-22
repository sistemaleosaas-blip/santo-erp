import Link from "next/link";
import Image from "next/image";
import type { Metadata } from "next";
import { ArrowRight, CheckCircle2, Clock, MapPin, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { servicos, siteConfig } from "@/config/site";

export const metadata: Metadata = {
  title: "Segurança Patrimonial e Facilities em Limeira/SP",
  description:
    "A Santo Serviços Terceirizados protege patrimônios e mantém instalações em pleno funcionamento em Limeira e região, com portaria, segurança patrimonial, limpeza e facilities sob um único contrato.",
};

const DIFERENCIAIS = [
  { titulo: "Equipe própria e treinada", desc: "Sem subcontratação: seleção, treinamento e supervisão diretos da Santo." },
  { titulo: "Gestão à vista", desc: "Portal do cliente com acompanhamento de postos, chamados e relatórios em tempo real." },
  { titulo: "Conformidade total", desc: "Folha, encargos e escalas 100% dentro da CLT e das normas de segurança do trabalho." },
  { titulo: "Presença regional", desc: "Base em Limeira com atendimento ágil em toda a região metropolitana de Campinas." },
];

export default function HomePage() {
  return (
    <>
      {/* HERO — foto real de campo (equipe em operação) como fundo, com
          overlay em degradê na cor primária para manter o texto legível
          e preservar a identidade visual da marca. */}
      <section className="relative overflow-hidden border-b border-border/60 text-primary-foreground">
        <Image
          src="/images/hero-banner.jpg"
          alt="Equipe da Santo Serviços Terceirizados em operação: segurança patrimonial, limpeza, jardinagem e monitoramento"
          fill
          priority
          className="object-cover object-center"
          sizes="100vw"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-primary via-primary/90 to-primary/50" aria-hidden />
        <div className="pointer-events-none absolute inset-0 bg-scan-lines" aria-hidden />
        <div className="container relative py-20 md:py-28">
          <div className="mb-8 inline-flex items-center gap-2 rounded-full border border-primary-foreground/20 bg-primary-foreground/5 px-4 py-1.5 font-mono text-xs uppercase tracking-widest text-accent">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-accent opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-accent" />
            </span>
            Postos monitorados agora em Limeira e região
          </div>

          <h1 className="max-w-3xl text-balance font-display text-5xl font-bold leading-[1.05] tracking-tight md:text-7xl">
            Patrimônio protegido. Instalações em ordem. Todos os dias.
          </h1>
          <p className="mt-6 max-w-xl text-balance text-lg text-primary-foreground/80">
            A Santo cuida da segurança patrimonial e dos facilities de condomínios,
            indústrias e empresas em Limeira/SP — com equipe própria, gestão
            transparente e um único ponto de contato.
          </p>

          <div className="mt-10 flex flex-wrap gap-4">
            <Button asChild size="lg" variant="accent">
              <Link href="/contato">
                Solicitar orçamento <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="border-primary-foreground/30 bg-transparent text-primary-foreground hover:bg-primary-foreground/10 hover:text-primary-foreground">
              <Link href="/servicos">Conhecer os serviços</Link>
            </Button>
          </div>

          {/* Ticker de status — o "signature element" da página */}
          <dl className="mt-16 grid grid-cols-2 gap-6 border-t border-primary-foreground/15 pt-8 font-mono md:grid-cols-4">
            {[
              { label: "Postos ativos", value: "120+" },
              { label: "Anos em Limeira", value: "18" },
              { label: "Clientes atendidos", value: "80+" },
              { label: "Cobertura", value: "24/7" },
            ].map((s) => (
              <div key={s.label}>
                <dt className="text-xs uppercase tracking-widest text-primary-foreground/60">{s.label}</dt>
                <dd className="mt-1 text-3xl font-bold text-accent">{s.value}</dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      {/* SERVIÇOS */}
      <section className="container py-20">
        <div className="mb-12 max-w-2xl">
          <span className="font-mono text-xs uppercase tracking-widest text-accent">Escopo de atuação</span>
          <h2 className="mt-3 font-display text-4xl font-bold tracking-tight">Oito frentes, um único contrato.</h2>
          <p className="mt-4 text-muted-foreground">
            Combine os serviços que seu ambiente precisa — da portaria à jardinagem —
            com supervisão unificada e um SLA claro para cada posto.
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {servicos.map((s) => {
            const Icon = s.icon;
            return (
              <Card key={s.slug} id={s.slug} className="group transition-shadow hover:shadow-md">
                <CardContent className="p-6">
                  <Icon className="h-8 w-8 text-accent" aria-hidden />
                  <h3 className="mt-4 font-display text-lg font-semibold">{s.nome}</h3>
                  <p className="mt-2 text-sm text-muted-foreground">{s.resumo}</p>
                  <Link
                    href="/servicos"
                    className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-primary group-hover:underline"
                  >
                    Saiba mais <ArrowRight className="h-3.5 w-3.5" />
                  </Link>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </section>

      {/* DIFERENCIAIS */}
      <section className="border-y border-border/60 bg-secondary/40 py-20">
        <div className="container grid gap-12 lg:grid-cols-2">
          <div>
            <span className="font-mono text-xs uppercase tracking-widest text-accent">Por que a Santo</span>
            <h2 className="mt-3 font-display text-4xl font-bold tracking-tight">
              Segurança de verdade começa pela gestão.
            </h2>
            <p className="mt-4 max-w-md text-muted-foreground">
              Não terceirizamos apenas mão de obra: entregamos processo, tecnologia
              e responsabilidade — com o cliente acompanhando cada posto pelo portal.
            </p>
            <div className="mt-8 flex items-center gap-3 rounded-lg border border-border bg-card p-4">
              <MapPin className="h-5 w-5 shrink-0 text-accent" />
              <p className="text-sm text-muted-foreground">
                Sede em {siteConfig.city}/{siteConfig.state}, com equipes prontas para
                atender toda a região de Campinas.
              </p>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            {DIFERENCIAIS.map((d) => (
              <div key={d.titulo} className="rounded-lg border border-border bg-card p-5">
                <CheckCircle2 className="h-5 w-5 text-success" />
                <h3 className="mt-3 font-display text-base font-semibold">{d.titulo}</h3>
                <p className="mt-1 text-sm text-muted-foreground">{d.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA FINAL */}
      <section className="container py-20">
        <div className="flex flex-col items-center gap-6 rounded-2xl border border-border bg-primary px-8 py-16 text-center text-primary-foreground">
          <ShieldCheck className="h-10 w-10 text-accent" />
          <h2 className="max-w-xl text-balance font-display text-3xl font-bold tracking-tight md:text-4xl">
            Pronto para colocar a segurança do seu patrimônio em boas mãos?
          </h2>
          <p className="flex items-center gap-2 text-sm text-primary-foreground/70">
            <Clock className="h-4 w-4" /> Retorno em até 1 dia útil
          </p>
          <Button asChild size="lg" variant="accent">
            <Link href="/contato">Falar com um consultor</Link>
          </Button>
        </div>
      </section>
    </>
  );
}
