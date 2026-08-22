import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { HardHat, Building2, ShieldCheck } from "lucide-react";

const PORTAIS = [
  { href: "/login/funcionario", icon: HardHat, titulo: "Portal do Funcionário", desc: "Holerites, ponto, escalas e férias. Login por CPF." },
  { href: "/login/cliente", icon: Building2, titulo: "Portal do Cliente", desc: "Acompanhe contratos, chamados e relatórios." },
  { href: "/login/admin", icon: ShieldCheck, titulo: "Área Administrativa", desc: "Master, Administrador, RH e Supervisor." },
];

export default function LoginChooserPage() {
  return (
    <div className="w-full max-w-3xl space-y-3">
      <h1 className="mb-6 text-center font-display text-2xl font-bold">Qual portal você quer acessar?</h1>
      <div className="grid gap-4 sm:grid-cols-3">
        {PORTAIS.map((p) => (
          <Link key={p.href} href={p.href}>
            <Card className="h-full transition-shadow hover:shadow-md">
              <CardHeader>
                <p.icon className="h-7 w-7 text-accent" />
                <CardTitle className="text-base">{p.titulo}</CardTitle>
                <CardDescription>{p.desc}</CardDescription>
              </CardHeader>
              <CardContent />
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
