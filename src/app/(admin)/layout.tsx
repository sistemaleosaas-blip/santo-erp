import {
  LayoutDashboard,
  Users,
  Building2,
  FileSignature,
  FileText,
  Clock,
  FileCheck2,
  BarChart3,
  UserCog,
} from "lucide-react";
import { DashboardSidebar, type NavItem } from "@/components/layout/dashboard-sidebar";
import { DashboardTopbar } from "@/components/layout/dashboard-topbar";
import { getSessionProfile } from "@/lib/services/session";

const NAV: NavItem[] = [
  { href: "/admin/dashboard", label: "Início", icon: LayoutDashboard },
  { href: "/admin/funcionarios", label: "Funcionários", icon: Users },
  { href: "/admin/clientes", label: "Clientes", icon: Building2 },
  { href: "/admin/contratos", label: "Contratos", icon: FileSignature },
  { href: "/admin/holerites", label: "Holerites", icon: FileText },
  { href: "/admin/ponto", label: "Folha de Ponto", icon: Clock },
  { href: "/admin/assinaturas", label: "Assinaturas", icon: FileCheck2 },
  { href: "/admin/relatorios", label: "Relatórios", icon: BarChart3 },
  { href: "/admin/usuarios", label: "Usuários e Papéis", icon: UserCog },
];

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const profile = await getSessionProfile();

  return (
    <div className="flex min-h-screen">
      <aside className="hidden w-64 shrink-0 border-r border-border md:block">
        <DashboardSidebar items={NAV} basePath="/admin" />
      </aside>
      <div className="flex flex-1 flex-col">
        <DashboardTopbar profile={profile} portalLabel="Área Administrativa" />
        <main className="flex-1 bg-secondary/20 p-6">{children}</main>
      </div>
    </div>
  );
}
