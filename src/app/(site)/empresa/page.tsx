import type { Metadata } from "next";
import { Award, Target, Users, Eye } from "lucide-react";
import { siteConfig } from "@/config/site";

export const metadata: Metadata = {
  title: "Empresa",
  description: `Conheça a história, a missão e os valores da ${siteConfig.name}, referência em segurança patrimonial e facilities em Limeira/SP.`,
};

const VALORES = [
  { icon: Target, titulo: "Missão", texto: "Proteger patrimônios e manter ambientes funcionando, com gente treinada e processos claros." },
  { icon: Eye, titulo: "Visão", texto: "Ser a referência regional em segurança patrimonial e facilities pela confiança que constrói." },
  { icon: Award, titulo: "Valores", texto: "Integridade, disciplina operacional, respeito ao trabalhador e transparência com o cliente." },
  { icon: Users, titulo: "Gente", texto: "Mais de 300 colaboradores próprios, selecionados e treinados internamente." },
];

export default function EmpresaPage() {
  return (
    <div className="container py-20">
      <span className="font-mono text-xs uppercase tracking-widest text-accent">A empresa</span>
      <h1 className="mt-3 max-w-2xl font-display text-5xl font-bold tracking-tight">
        18 anos protegendo o que importa em Limeira.
      </h1>
      <p className="mt-6 max-w-2xl text-lg text-muted-foreground">
        Fundada em Limeira/SP, a {siteConfig.name} nasceu para resolver um problema
        simples de enunciar e difícil de executar bem: colocar gente confiável e
        processos sólidos entre o patrimônio do cliente e qualquer risco. Hoje
        atendemos condomínios, indústrias e empresas com portaria, segurança
        patrimonial e facilities sob um único contrato.
      </p>

      <div className="mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {VALORES.map((v) => (
          <div key={v.titulo} className="rounded-lg border border-border bg-card p-6">
            <v.icon className="h-7 w-7 text-accent" />
            <h2 className="mt-4 font-display text-lg font-semibold">{v.titulo}</h2>
            <p className="mt-2 text-sm text-muted-foreground">{v.texto}</p>
          </div>
        ))}
      </div>

      <div className="mt-20 grid gap-10 rounded-2xl border border-border bg-secondary/40 p-10 md:grid-cols-2">
        <div>
          <h2 className="font-display text-2xl font-bold">Certificações e conformidade</h2>
          <p className="mt-3 text-sm text-muted-foreground">
            Vigilantes certificados conforme normas do Departamento de Polícia Federal,
            folha de pagamento auditável e recolhimento em dia de todos os encargos
            trabalhistas — sem letras miúdas.
          </p>
        </div>
        <div>
          <h2 className="font-display text-2xl font-bold">Onde atuamos</h2>
          <p className="mt-3 text-sm text-muted-foreground">
            Sede em Limeira/SP, com equipes atendendo toda a região metropolitana de
            Campinas: Americana, Piracicaba, Rio Claro e municípios vizinhos.
          </p>
        </div>
      </div>
    </div>
  );
}
