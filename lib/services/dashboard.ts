// Resumo financeiro para o dashboard. Agregacao feita no app por enquanto (poucas linhas);
// quando o volume crescer, vira uma view ou funcao no banco.
import type { SupabaseServerClient } from "@/lib/supabase/server";
import { limitesDoMes } from "@/lib/utils/formatacao";

type Abertos = { pendentes: number; atrasadas: number; totalPendente: number; totalAtrasado: number };

export type ResumoMes = {
  receitas: number;
  despesas: number;
  resultado: number;
  aReceber: Abertos;
  aPagar: Abertos;
};

function somarAbertos(linhas: { amount: number; status: string }[]): Abertos {
  const r: Abertos = { pendentes: 0, atrasadas: 0, totalPendente: 0, totalAtrasado: 0 };
  for (const l of linhas) {
    if (l.status === "pending") {
      r.pendentes++;
      r.totalPendente += Number(l.amount);
    } else if (l.status === "overdue") {
      r.atrasadas++;
      r.totalAtrasado += Number(l.amount);
    }
  }
  return r;
}

export async function resumoDoMes(
  supabase: SupabaseServerClient,
  unidadeId: string | null
): Promise<ResumoMes> {
  const { inicio, fim } = limitesDoMes();

  let tx = supabase
    .from("transactions")
    .select("type, amount")
    .eq("status", "paid")
    .gte("date", inicio)
    .lte("date", fim);
  let rec = supabase.from("receivables").select("amount, status").in("status", ["pending", "overdue"]);
  let pag = supabase.from("payables").select("amount, status").in("status", ["pending", "overdue"]);

  if (unidadeId) {
    tx = tx.eq("business_unit_id", unidadeId);
    rec = rec.eq("business_unit_id", unidadeId);
    pag = pag.eq("business_unit_id", unidadeId);
  }

  const [{ data: transacoes }, { data: recebiveis }, { data: pagaveis }] = await Promise.all([tx, rec, pag]);

  let receitas = 0;
  let despesas = 0;
  for (const t of transacoes ?? []) {
    if (t.type === "income") receitas += Number(t.amount);
    else despesas += Number(t.amount);
  }

  return {
    receitas,
    despesas,
    resultado: receitas - despesas,
    aReceber: somarAbertos(recebiveis ?? []),
    aPagar: somarAbertos(pagaveis ?? []),
  };
}
