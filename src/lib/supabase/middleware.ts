import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import type { Database } from "@/types/database.types";

/**
 * Renova a sessão do Supabase a cada request e retorna tanto a response
 * (com cookies atualizados) quanto o usuário autenticado, para que o
 * middleware principal possa aplicar as regras de RBAC.
 */
export async function updateSession(request: NextRequest) {
  let response = NextResponse.next({ request });

  const supabase = createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          response = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  // IMPORTANTE: getUser() revalida o token contra o servidor Supabase —
  // nunca confiar apenas em getSession() no middleware (pode estar stale).
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return { response, user, supabase };
}
