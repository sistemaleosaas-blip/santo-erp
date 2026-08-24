import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { cookies } from "next/headers";
import type { Database } from "@/types/database.types";

type CookieToSet = { name: string; value: string; options?: CookieOptions };

/**
 * Cliente Supabase para uso em Server Components, Route Handlers e Server
 * Actions. Sincroniza a sessão via cookies do Next.js.
 */
export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet: CookieToSet[]) {
          try {
            cookiesToSet.forEach(({ name, value, options }) => {
              cookieStore.set(name, value, options as CookieOptions);
            });
          } catch {
            // Chamado a partir de um Server Component — o middleware já
            // cuida de renovar a sessão, então é seguro ignorar aqui.
          }
        },
      },
    }
  );
}

/**
 * Cliente com service_role — SOMENTE em Route Handlers server-side que
 * precisam ignorar RLS deliberadamente (ex.: webhooks, jobs administrativos).
 * NUNCA importar em código que roda no browser.
 */
export function createServiceRoleClient() {
  const { createClient: createSupabaseClient } = require("@supabase/supabase-js") as typeof import("@supabase/supabase-js");
  return createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );
}
