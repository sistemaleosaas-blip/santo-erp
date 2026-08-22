import { NextResponse } from "next/server";
import { PDFDocument, StandardFonts, rgb } from "pdf-lib";
import { createClient } from "@/lib/supabase/server";
import { formatCPF } from "@/lib/utils/cpf-cnpj";

/** GET /api/relatorios/pdf — relatório de funcionários ativos em PDF. */
export async function GET() {
  const supabase = await createClient();
  const { data: funcionarios } = await supabase
    .from("funcionarios")
    .select("nome_completo, cpf, matricula, cargo, status")
    .order("nome_completo");

  const pdfDoc = await PDFDocument.create();
  let page = pdfDoc.addPage([595, 842]); // A4
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const bold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

  let y = 800;
  page.drawText("Santo Serviços Terceirizados", { x: 40, y, size: 16, font: bold });
  y -= 20;
  page.drawText(`Relatório de Funcionários — gerado em ${new Date().toLocaleDateString("pt-BR")}`, { x: 40, y, size: 10, font, color: rgb(0.4, 0.4, 0.4) });
  y -= 30;

  page.drawText("Nome", { x: 40, y, size: 9, font: bold });
  page.drawText("CPF", { x: 250, y, size: 9, font: bold });
  page.drawText("Matrícula", { x: 360, y, size: 9, font: bold });
  page.drawText("Status", { x: 460, y, size: 9, font: bold });
  y -= 14;
  page.drawLine({ start: { x: 40, y: y + 4 }, end: { x: 555, y: y + 4 }, thickness: 0.5, color: rgb(0.8, 0.8, 0.8) });

  for (const f of funcionarios ?? []) {
    if (y < 60) {
      page = pdfDoc.addPage([595, 842]);
      y = 800;
    }
    page.drawText(f.nome_completo.slice(0, 32), { x: 40, y, size: 9, font });
    page.drawText(formatCPF(f.cpf), { x: 250, y, size: 9, font });
    page.drawText(f.matricula, { x: 360, y, size: 9, font });
    page.drawText(f.status, { x: 460, y, size: 9, font });
    y -= 16;
  }

  const pdfBytes = await pdfDoc.save();

  return new NextResponse(pdfBytes, {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="relatorio-funcionarios-${new Date().toISOString().slice(0, 10)}.pdf"`,
    },
  });
}
