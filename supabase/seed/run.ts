/**
 * supabase/seed/run.ts
 *
 * Cria usuários de demonstração (um por papel) usando a service_role key,
 * e vincula os papéis em public.user_roles. Roda por cima do seed.sql,
 * que já populou clientes/contratos/benefícios.
 *
 * Uso:
 *   SUPABASE_URL=... SUPABASE_SERVICE_ROLE_KEY=... npm run seed
 */
import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = process.env.SUPABASE_URL ?? process.env.NEXT_PUBLIC_SUPABASE_URL;
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
  console.error("Defina SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY antes de rodar o seed.");
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
});

const DEMO_USERS = [
  { email: "master@santoservicos.com.br", password: "Demo@12345", role: "master", full_name: "Usuário Master" },
  { email: "admin@santoservicos.com.br", password: "Demo@12345", role: "administrador", full_name: "Ana Administradora" },
  { email: "rh@santoservicos.com.br", password: "Demo@12345", role: "rh", full_name: "Renata RH" },
  { email: "supervisor@santoservicos.com.br", password: "Demo@12345", role: "supervisor", full_name: "Sérgio Supervisor" },
  { email: "cliente@businessparklimeira.com.br", password: "Demo@12345", role: "cliente", full_name: "Carlos Cliente" },
  { email: "funcionario@santoservicos.com.br", password: "Demo@12345", role: "funcionario", full_name: "Fábio Funcionário", cpf: "123.456.789-00" },
] as const;

const CLIENTE_DEMO_ID = "11111111-1111-1111-1111-111111111111";

async function main() {
  for (const demo of DEMO_USERS) {
    const { data: created, error } = await supabase.auth.admin.createUser({
      email: demo.email,
      password: demo.password,
      email_confirm: true,
      user_metadata: { full_name: demo.full_name },
    });

    if (error) {
      console.warn(`⚠️  ${demo.email}: ${error.message} (pode já existir — pulando)`);
      continue;
    }

    const userId = created.user.id;

    // profiles é criado automaticamente pela trigger handle_new_user().
    if ("cpf" in demo && demo.cpf) {
      await supabase.from("profiles").update({ cpf: demo.cpf }).eq("id", userId);
    }

    await supabase.from("user_roles").insert({ user_id: userId, role: demo.role });

    if (demo.role === "cliente") {
      await supabase.from("cliente_usuarios").insert({
        cliente_id: CLIENTE_DEMO_ID,
        user_id: userId,
        cargo: "Síndico",
        is_principal: true,
      });
    }

    if (demo.role === "funcionario") {
      await supabase.from("funcionarios").insert({
        user_id: userId,
        cpf: demo.cpf,
        matricula: "SANTO-00001",
        nome_completo: demo.full_name,
        data_admissao: "2026-02-01",
        cargo: "Porteiro",
        categoria: "portaria",
        status: "ativo",
      });
    }

    console.log(`✅ Criado: ${demo.email} (${demo.role})`);
  }

  console.log("\nSeed concluído. Senha padrão de todos os usuários demo: Demo@12345");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
