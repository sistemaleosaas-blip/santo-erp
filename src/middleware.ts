import { NextResponse, type NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";
import type { AppRole } from "@/types/auth";

/**
 * Protege as três áreas logadas do sistema, mapeando prefixo de rota →
 * papéis autorizados. Qualquer papel de "staff" (master/administrador/rh/
 * supervisor) pode acessar /admin; apenas 'cliente' acessa /cliente; apenas
 * 'funcionario' acessa /funcionario. O papel 'master' tem acesso irrestrito.
 */
const AREA_ROLES: Record<string, AppRole[]> = {
  "/admin": ["master", "administrador", "rh", "supervisor"],
  "/cliente": ["master", "cliente"],
  "/funcionario": ["master", "funcionario"],
};

const PUBLIC_PATHS = ["/", "/empresa", "/servicos", "/clientes", "/trabalhe-conosco", "/contato"];

function matchArea(pathname: string): string | null {
  return Object.keys(AREA_ROLES).find((prefix) => pathname.startsWith(prefix)) ?? null;
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const { response, user, supabase } = await updateSession(request);

  const area = matchArea(pathname);

  // Rotas públicas do site institucional: sempre liberadas.
  if (!area && !pathname.startsWith("/login")) {
    return response;
  }

  // Já logado tentando acessar /login → manda para o dashboard correto.
  if (pathname.startsWith("/login") && user) {
    const { data: roles } = await supabase.from("user_roles").select("role").eq("user_id", user.id);
    const roleList = (roles ?? []).map((r) => r.role as AppRole);
    return NextResponse.redirect(new URL(resolveHomeForRoles(roleList), request.url));
  }

  if (area) {
    if (!user) {
      const loginUrl = new URL(loginPathForArea(area), request.url);
      loginUrl.searchParams.set("redirectTo", pathname);
      return NextResponse.redirect(loginUrl);
    }

    const { data: roles } = await supabase.from("user_roles").select("role").eq("user_id", user.id);
    const roleList = (roles ?? []).map((r) => r.role as AppRole);
    const allowed = AREA_ROLES[area]!;

    const hasAccess = roleList.some((r) => allowed.includes(r));
    if (!hasAccess) {
      return NextResponse.redirect(new URL("/nao-autorizado", request.url));
    }
  }

  return response;
}

function loginPathForArea(area: string): string {
  if (area === "/admin") return "/login/admin";
  if (area === "/cliente") return "/login/cliente";
  return "/login/funcionario";
}

function resolveHomeForRoles(roles: AppRole[]): string {
  if (roles.some((r) => ["master", "administrador", "rh", "supervisor"].includes(r))) return "/admin/dashboard";
  if (roles.includes("cliente")) return "/cliente/dashboard";
  if (roles.includes("funcionario")) return "/funcionario/dashboard";
  return "/";
}

export const config = {
  matcher: [
    /*
     * Roda em tudo, exceto assets estáticos e imagens, para manter o
     * middleware leve nas rotas públicas do site institucional.
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|webp)$).*)",
  ],
};
