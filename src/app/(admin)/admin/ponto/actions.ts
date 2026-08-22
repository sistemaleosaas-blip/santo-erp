"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

type ActionResult =
  | { success: true; inseridos: number; erros: string[] }
  | { success: false; error: string };

/**
 * Espera um CSV com cabeçalho: cpf,tipo,data_hora
 * Ex: 123.456.789-00,entrada,2026-08-20T08:00:00
 * tipo ∈ entrada | saida_almoco | volta_almoco | saida | ajuste_manual
 */
export async function uploadPontoLote(csv: string): Promise<ActionResult> {
  const linhas = csv
    .trim()
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean);

  if (linhas.length < 2) return { success: false, error: "CSV vazio ou sem dados." };

  const [, ...dados] = linhas; // ignora cabeçalho
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const erros: string[] = [];
  let inseridos = 0;

  for (const [i, linha] of dados.entries()) {
    const [cpfRaw, tipo, dataHora] = linha.split(",").map((c) => c?.trim());
    const cpf = cpfRaw?.replace(/\D/g, "");

    if (!cpf || !tipo || !dataHora) {
      erros.push(`Linha ${i + 2}: formato inválido.`);
      continue;
    }

    const { data: funcionario } = await supabase.from("funcionarios").select("id").eq("cpf", cpf).maybeSingle();
    if (!funcionario) {
      erros.push(`Linha ${i + 2}: CPF ${cpfRaw} não encontrado.`);
      continue;
    }

    const { error } = await supabase.from("registros_ponto").insert({
      funcionario_id: funcionario.id,
      tipo,
      registrado_em: dataHora,
      justificativa: tipo === "ajuste_manual" ? "Upload em lote pelo RH" : null,
      ajustado_por: tipo === "ajuste_manual" ? user?.id : null,
    });

    if (error) {
      erros.push(`Linha ${i + 2}: ${error.message}`);
    } else {
      inseridos++;
    }
  }

  revalidatePath("/admin/ponto");
  return { success: true, inseridos, erros };
}
