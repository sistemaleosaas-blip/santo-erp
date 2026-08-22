import Link from "next/link";
import { FileText, Clock, Bell, Palmtree, ArrowRight } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { createClient } from "@/lib/supabase/server";
import { getSessionProfile, getFuncionarioAtual } from "@/lib/services/session";

export default async function FuncionarioDashboardPage() {
  const profile = await getSessionProfile();
  const funcionario = await getFuncionarioAtual(profile.id);
  const supabase = await createClient();

  const [holeritesRes, avisosRes, feriasRes] = funcionario
    ? await Promise.all([
        supabase
          .from("holerites")
          .select("id, competencia, liquido, status")
          .eq("funcionario_id", funcionario.id)
          .order("competencia", { ascending: false })
          .limit(3),
        supabase.from("avisos").select("id, titulo, publicado_em").eq("publicado", true).order("publicado_em", { ascending: false }).limit(3),
        supabase
          .from("solicitacoes_ferias")
          .select("id, data_inicio, data_fim, status")
          .eq("funcionario_id", funcionario.id)
          .order("created_at", { ascending: false })
          .limit(1),
      ])
    : [{ data: [] }, { data: [] }, { data: [] }];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold">Olá, {profile.fullName.split(" ")[0]}</h1>
        <p className="text-sm text-muted-foreground">
          {funcionario ? `${funcionario.cargo} · Matrícula ${funcionario.matricula}` : "Cadastro de funcionário não vinculado a este usuário ainda."}
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { label: "Último holerite", icon: FileText, href: "/funcionario/holerites" },
          { label: "Folha de ponto", icon: Clock, href: "/funcionario/ponto" },
          { label: "Avisos não lidos", icon: Bell, href: "/funcionario/avisos" },
          { label: "Solicitar férias", icon: Palmtree, href: "/funcionario/ferias" },
        ].map((item) => (
          <Link key={item.label} href={item.href}>
            <Card className="transition-shadow hover:shadow-md">
              <CardContent className="flex items-center gap-3 p-5">
                <item.icon className="h-6 w-6 text-accent" />
                <div>
                  <p className="text-sm font-medium">{item.label}</p>
                  <p className="flex items-center gap-1 text-xs text-muted-foreground">
                    Acessar <ArrowRight className="h-3 w-3" />
                  </p>
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Holerites recentes</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {holeritesRes.data && holeritesRes.data.length > 0 ? (
              holeritesRes.data.map((h) => (
                <div key={h.id} className="flex items-center justify-between rounded-md border border-border p-3 text-sm">
                  <span>{new Date(h.competencia).toLocaleDateString("pt-BR", { month: "long", year: "numeric" })}</span>
                  <div className="flex items-center gap-2">
                    <span className="font-medium">R$ {Number(h.liquido).toFixed(2)}</span>
                    <Badge variant={h.status === "assinado" ? "success" : "secondary"}>{h.status}</Badge>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-sm text-muted-foreground">Nenhum holerite disponível ainda.</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Últimos avisos</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {avisosRes.data && avisosRes.data.length > 0 ? (
              avisosRes.data.map((a) => (
                <div key={a.id} className="rounded-md border border-border p-3 text-sm">
                  <p className="font-medium">{a.titulo}</p>
                  <p className="text-xs text-muted-foreground">
                    {new Date(a.publicado_em).toLocaleDateString("pt-BR")}
                  </p>
                </div>
              ))
            ) : (
              <p className="text-sm text-muted-foreground">Nenhum aviso publicado ainda.</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
