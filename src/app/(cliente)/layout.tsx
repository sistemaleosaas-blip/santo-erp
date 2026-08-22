import { LayoutDashboard, Users, FileSignature, LifeBuoy, BarChart3 } from "lucide-react";
import { DashboardSidebar, type NavItem } from "@/components/layout/dashboard-sidebar";
import { DashboardTopbar } from "@/components/layout/dashboard-topbar";
import { getSessionProfile } from "@/lib/services/session";

const NAV: NavItem[] = [
  { href: "/cliente/dashboard", label: "Início", icon: LayoutDashboard },
  { href: "/cliente/funcionarios", label: "Funcionários Alocados", icon: Users },
  { href: "/cliente/contratos", label: "Contratos", icon: FileSignature },
  { href: "/cliente/chamados", label: "Chamados", icon: LifeBuoy },
  { href: "/cliente/relatorios", label: "Relatórios", icon: BarChart3 },
];

export default async function ClienteLayout({ children }: { children: React.ReactNode }) {
  const profile = await getSessionProfile();

  return (
    <div className="flex min-h-screen">
      <aside className="hidden w-64 shrink-0 border-r border-border md:block">
        <DashboardSidebar items={NAV} basePath="/cliente" />
      </aside>
      <div className="flex flex-1 flex-col">
        <DashboardTopbar profile={profile} portalLabel="Portal do Cliente" />
        <main className="flex-1 bg-secondary/20 p-6">{children}</main>
      </div>
    </div>
  );
}
