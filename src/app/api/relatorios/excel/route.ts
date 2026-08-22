import { NextResponse } from "next/server";
import ExcelJS from "exceljs";
import { createClient } from "@/lib/supabase/server";
import { formatCPF } from "@/lib/utils/cpf-cnpj";

/**
 * GET /api/relatorios/excel?tipo=funcionarios
 * Restrito a staff (a query já respeita RLS; usuários sem permissão
 * simplesmente recebem uma planilha vazia, já que as policies impedem
 * a leitura de linhas que não deveriam ver).
 */
export async function GET() {
  const supabase = await createClient();
  const { data: funcionarios } = await supabase
    .from("funcionarios")
    .select("nome_completo, cpf, matricula, cargo, categoria, status, data_admissao, salario_base")
    .order("nome_completo");

  const workbook = new ExcelJS.Workbook();
  workbook.creator = "Santo ERP";
  workbook.created = new Date();

  const sheet = workbook.addWorksheet("Funcionários");
  sheet.columns = [
    { header: "Nome completo", key: "nome", width: 32 },
    { header: "CPF", key: "cpf", width: 18 },
    { header: "Matrícula", key: "matricula", width: 16 },
    { header: "Cargo", key: "cargo", width: 22 },
    { header: "Categoria", key: "categoria", width: 22 },
    { header: "Status", key: "status", width: 14 },
    { header: "Admissão", key: "admissao", width: 14 },
    { header: "Salário base (R$)", key: "salario", width: 18 },
  ];
  sheet.getRow(1).font = { bold: true };

  (funcionarios ?? []).forEach((f) => {
    sheet.addRow({
      nome: f.nome_completo,
      cpf: formatCPF(f.cpf),
      matricula: f.matricula,
      cargo: f.cargo,
      categoria: f.categoria,
      status: f.status,
      admissao: new Date(f.data_admissao).toLocaleDateString("pt-BR"),
      salario: f.salario_base ? Number(f.salario_base).toFixed(2) : "",
    });
  });

  const buffer = await workbook.xlsx.writeBuffer();

  return new NextResponse(buffer, {
    headers: {
      "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "Content-Disposition": `attachment; filename="funcionarios-santo-${new Date().toISOString().slice(0, 10)}.xlsx"`,
    },
  });
}
