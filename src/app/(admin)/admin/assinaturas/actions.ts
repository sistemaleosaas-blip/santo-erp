"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

type ActionResult = { success: true } | { success: false; error: string };

export async function aprovarAssinatura(assinaturaId: string): Promise<ActionResult> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { error } = await supabase
    .from("assinaturas_digitais")
    .update({ aprovado_por: user?.id, aprovado_em: new Date().toISOString() })
    .eq("id", assinaturaId)
    .eq("status", "assinado"); // só pode aprovar o que o funcionário já assinou

  if (error) return { success: false, error: "Não foi possível aprovar a assinatura." };
  revalidatePath("/admin/assinaturas");
  return { success: true };
}

export async function rejeitarAssinatura(assinaturaId: string): Promise<ActionResult> {
  const supabase = await createClient();
  const { error } = await supabase
    .from("assinaturas_digitais")
    .update({ status: "rejeitado" })
    .eq("id", assinaturaId);

  if (error) return { success: false, error: "Não foi possível rejeitar a assinatura." };
  revalidatePath("/admin/assinaturas");
  return { success: true };
}
