import { NextResponse, type NextRequest } from "next/server";
import { PDFDocument, rgb, StandardFonts } from "pdf-lib";
import { createHash } from "node:crypto";
import { createClient } from "@/lib/supabase/server";

/**
 * POST /api/assinaturas
 * Body: { holeriteId: string, signaturePngBase64: string }
 *
 * Fluxo:
 * 1. Confirma que o holerite pertence ao funcionário autenticado.
 * 2. Gera um PDF com o resumo do holerite + a assinatura capturada.
 * 3. Calcula o hash SHA-256 do PDF final (integridade/auditoria).
 * 4. Sobe o PDF para o bucket 'assinaturas' e atualiza o registro,
 *    deixando status = 'assinado' — a aprovação final é do RH.
 */
export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return NextResponse.json({ error: "Não autenticado." }, { status: 401 });

  const { holeriteId, signaturePngBase64 } = await request.json();
  if (!holeriteId || !signaturePngBase64) {
    return NextResponse.json({ error: "Dados incompletos." }, { status: 400 });
  }

  const { data: funcionario } = await supabase
    .from("funcionarios")
    .select("id, nome_completo, matricula")
    .eq("user_id", user.id)
    .single();

  if (!funcionario) return NextResponse.json({ error: "Funcionário não encontrado." }, { status: 404 });

  const { data: holerite } = await supabase
    .from("holerites")
    .select("id, competencia, liquido, funcionario_id")
    .eq("id", holeriteId)
    .eq("funcionario_id", funcionario.id) // garante que só assina o próprio holerite
    .single();

  if (!holerite) return NextResponse.json({ error: "Holerite não encontrado." }, { status: 404 });

  // --- Gera o PDF assinado ---
  const pdfDoc = await PDFDocument.create();
  const page = pdfDoc.addPage([595, 400]); // A5-ish, suficiente para o comprovante
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const bold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

  page.drawText("Santo Serviços Terceirizados", { x: 40, y: 350, size: 16, font: bold });
  page.drawText("Comprovante de Assinatura Digital de Holerite", { x: 40, y: 328, size: 11, font });

  const competenciaFmt = new Date(holerite.competencia).toLocaleDateString("pt-BR", { month: "long", year: "numeric" });
  page.drawText(`Funcionário: ${funcionario.nome_completo} (${funcionario.matricula})`, { x: 40, y: 290, size: 11, font });
  page.drawText(`Competência: ${competenciaFmt}`, { x: 40, y: 272, size: 11, font });
  page.drawText(`Valor líquido: R$ ${Number(holerite.liquido).toFixed(2)}`, { x: 40, y: 254, size: 11, font });
  page.drawText(`Assinado em: ${new Date().toLocaleString("pt-BR")}`, { x: 40, y: 236, size: 11, font });

  // Embute a assinatura capturada (PNG base64 vindo do signature_pad)
  const pngBytes = Buffer.from(signaturePngBase64.replace(/^data:image\/png;base64,/, ""), "base64");
  const pngImage = await pdfDoc.embedPng(pngBytes);
  const sigDims = pngImage.scaleToFit(220, 80);
  page.drawText("Assinatura:", { x: 40, y: 190, size: 10, font, color: rgb(0.4, 0.4, 0.4) });
  page.drawImage(pngImage, { x: 40, y: 100, width: sigDims.width, height: sigDims.height });
  page.drawLine({ start: { x: 40, y: 96 }, end: { x: 260, y: 96 }, thickness: 0.5, color: rgb(0.6, 0.6, 0.6) });

  const pdfBytes = await pdfDoc.save();
  const hash = createHash("sha256").update(pdfBytes).digest("hex");

  const path = `${funcionario.id}/${holerite.id}.pdf`;
  const { error: uploadError } = await supabase.storage
    .from("assinaturas")
    .upload(path, pdfBytes, { contentType: "application/pdf", upsert: true });

  if (uploadError) {
    return NextResponse.json({ error: "Falha ao salvar o PDF assinado." }, { status: 500 });
  }

  const { data: urlData } = supabase.storage.from("assinaturas").getPublicUrl(path);

  const { error: updateError } = await supabase
    .from("assinaturas_digitais")
    .update({
      status: "assinado",
      assinatura_svg: signaturePngBase64,
      arquivo_pdf_assinado_url: urlData.publicUrl,
      hash_documento: hash,
      ip_origem: request.headers.get("x-forwarded-for")?.split(",")[0] ?? null,
      user_agent: request.headers.get("user-agent"),
      assinado_em: new Date().toISOString(),
    })
    .eq("holerite_id", holerite.id);

  if (updateError) {
    return NextResponse.json({ error: "Falha ao registrar a assinatura." }, { status: 500 });
  }

  return NextResponse.json({ success: true, hash });
}
