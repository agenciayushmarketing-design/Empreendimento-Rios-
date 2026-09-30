// Exporta a listagem de movimentacoes (mesmos filtros da tela) em CSV para o contador.
// Separador ";" e BOM para o Excel em portugues abrir direto.
import { NextResponse, type NextRequest } from "next/server";

import { carregarContextoAcesso, pode } from "@/lib/services/acesso";
import { exportarMovimentacoes } from "@/lib/services/movimentacoes";
import { createClient } from "@/lib/supabase/server";
import { lerUnidadeAtual, unidadeIdOuNull } from "@/lib/unidade-atual";
import { formatarData, mesAtualISO } from "@/lib/utils/formatacao";

function celula(v: string | number | null | undefined): string {
  const s = String(v ?? "");
  return /[";\n\r]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}

export async function GET(request: NextRequest) {
  const ctx = await carregarContextoAcesso();
  if (!ctx || !pode(ctx, "cash_flow", "view")) return new NextResponse("Sem acesso.", { status: 403 });

  const p = request.nextUrl.searchParams;
  const mes = /^\d{4}-\d{2}$/.test(p.get("mes") ?? "") ? p.get("mes")! : mesAtualISO();
  const tipoParam = p.get("tipo");
  const tipo = tipoParam === "income" || tipoParam === "expense" ? tipoParam : undefined;
  const unidadeId = unidadeIdOuNull(lerUnidadeAtual(ctx.unidades));
  const nomeUnidade = new Map(ctx.unidades.map((u) => [u.id, u.nome]));

  const linhas = await exportarMovimentacoes(createClient(), {
    unidadeId,
    mes,
    tipo,
    status: p.get("status") ?? undefined,
    busca: p.get("q")?.trim() || undefined,
  });

  const cabecalho = ["Data", "Descrição", "Unidade", "Categoria", "Cliente", "Conta bancária", "Tipo", "Valor", "Status", "Observações"];
  const corpo = linhas.map((l) =>
    [
      formatarData(l.date),
      l.description,
      nomeUnidade.get(l.business_unit_id) ?? "",
      l.category?.name ?? "",
      l.client?.name ?? "",
      l.bank_account?.name ?? "",
      l.type === "income" ? "Receita" : "Despesa",
      Number(l.amount).toFixed(2).replace(".", ","),
      l.status === "paid" ? "Pago" : l.status === "pending" ? "Pendente" : l.status,
      [l.is_transfer ? "Transferência" : "", l.is_adjustment ? "Ajuste" : "", l.reconciled_at ? "Conciliada" : ""].filter(Boolean).join(", "),
    ]
      .map(celula)
      .join(";")
  );

  const csv = "\uFEFF" + [cabecalho.join(";"), ...corpo].join("\r\n");
  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="movimentacoes-${mes}.csv"`,
      "Cache-Control": "no-store",
    },
  });
}
