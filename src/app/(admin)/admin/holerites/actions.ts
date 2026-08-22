"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { uploadHoleriteSchema } from "@/lib/validations/erp";

type ActionResult = { success: true } | { success: false; error: string };

/**
 * Cria (ou atualiza, se já existir para a competência) o registro de
 * holerite e o coloca como "disponivel" para o funcionário assinar.
 * O upload do PDF em si acontece no client, direto pro Storage (bucket
 * 'holerites'); esta action só grava a URL e os valores.
 */
export async function registrarHolerite(
  input: unknown,
  arquivoPdfUrl: string | null
): Promise<ActionResult> {
  const parsed = uploadHoleriteSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? "Dados inválidos" };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { error } = await supabase.from("holerites").upsert(
    {
      funcionario_id: parsed.data.funcionarioId,
      competencia: parsed.data.competencia,
      proventos: parsed.data.proventos,
      descontos: parsed.data.descontos,
      inss: parsed.data.inss,
      irrf: parsed.data.irrf,
      liquido: parsed.data.liquido,
      arquivo_pdf_url: arquivoPdfUrl,
      status: "disponivel",
      uploaded_by: user?.id,
    },
    { onConflict: "funcionario_id,competencia" }
  );

  if (error) return { success: false, error: "Não foi possível registrar o holerite." };

  // Cria a linha de assinatura pendente automaticamente.
  const { data: holerite } = await supabase
    .from("holerites")
    .select("id")
    .eq("funcionario_id", parsed.data.funcionarioId)
    .eq("competencia", parsed.data.competencia)
    .single();

  if (holerite) {
    await supabase
      .from("assinaturas_digitais")
      .upsert({ holerite_id: holerite.id, funcionario_id: parsed.data.funcionarioId, status: "pendente" }, { onConflict: "holerite_id" });
  }

  revalidatePath("/admin/holerites");
  return { success: true };
}
