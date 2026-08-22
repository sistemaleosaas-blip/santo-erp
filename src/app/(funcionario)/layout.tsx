import {
  LayoutDashboard,
  FileText,
  Clock,
  CalendarDays,
  Bell,
  Gift,
  Palmtree,
  UserCog,
} from "lucide-react";
import { DashboardSidebar, type NavItem } from "@/components/layout/dashboard-sidebar";
import { DashboardTopbar } from "@/components/layout/dashboard-topbar";
import { getSessionProfile } from "@/lib/services/session";

const NAV: NavItem[] = [
  { href: "/funcionario/dashboard", label: "Início", icon: LayoutDashboard },
  { href: "/funcionario/holerites", label: "Holerites", icon: FileText },
  { href: "/funcionario/ponto", label: "Folha de Ponto", icon: Clock },
  { href: "/funcionario/escalas", label: "Escalas", icon: CalendarDays },
  { href: "/funcionario/avisos", label: "Avisos", icon: Bell },
  { href: "/funcionario/beneficios", label: "Benefícios", icon: Gift },
  { href: "/funcionario/ferias", label: "Férias", icon: Palmtree },
  { href: "/funcionario/perfil", label: "Meu Cadastro", icon: UserCog },
];

export default async function FuncionarioLayout({ children }: { children: React.ReactNode }) {
  const profile = await getSessionProfile();

  return (
    <div className="flex min-h-screen">
      <aside className="hidden w-64 shrink-0 border-r border-border md:block">
        <DashboardSidebar items={NAV} basePath="/funcionario" />
      </aside>
      <div className="flex flex-1 flex-col">
        <DashboardTopbar profile={profile} portalLabel="Portal do Funcionário" />
        <main className="flex-1 bg-secondary/20 p-6">{children}</main>
      </div>
    </div>
  );
}
