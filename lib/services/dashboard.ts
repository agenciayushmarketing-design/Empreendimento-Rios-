// Resumos para o dashboard. Agregacao feita no app por enquanto (poucas linhas);
// quando o volume crescer, vira uma view ou funcao no banco.
import type { SupabaseServerClient } from "@/lib/supabase/server";
import { deslocarMes, hojeISO, limitesDoMesISO, mesAtualISO } from "@/lib/utils/formatacao";

type Abertos = { pendentes: number; atrasadas: number; totalPendente: number; totalAtrasado: number };

export type ResumoMes = {
  receitas: number;
  despesas: number;
  resultado: number;
  aReceber: Abertos;
  aPagar: Abertos;
};

function somarAbertos(linhas: { amount: number; status: string; due_date: string }[], hoje: string): Abertos {
  const r: Abertos = { pendentes: 0, atrasadas: 0, totalPendente: 0, totalAtrasado: 0 };
  for (const l of linhas) {
    // Antes do cron mark_overdue() rodar, uma pendente vencida ainda esta "pending".
    if (l.status === "overdue" || l.due_date < hoje) {
      r.atrasadas++;
      r.totalAtrasado += Number(l.amount);
    } else {
      r.pendentes++;
      r.totalPendente += Number(l.amount);
    }
  }
  return r;
}

export async function resumoDoMes(supabase: SupabaseServerClient, unidadeId: string | null, mes = mesAtualISO()): Promise<ResumoMes> {
  const { inicio, fim } = limitesDoMesISO(mes);
  const hoje = hojeISO();

  let tx = supabase.from("transactions").select("type, amount").eq("status", "paid").gte("date", inicio).lte("date", fim);
  let rec = supabase.from("receivables").select("amount, status, due_date").in("status", ["pending", "overdue"]);
  let pag = supabase.from("payables").select("amount, status, due_date").in("status", ["pending", "overdue"]);
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
    aReceber: somarAbertos(recebiveis ?? [], hoje),
    aPagar: somarAbertos(pagaveis ?? [], hoje),
  };
}

export type LinhaUnidade = { unidadeId: string; receitas: number; despesas: number; resultado: number };

// Receitas e despesas pagas no mes, por unidade (so as que o usuario enxerga, via RLS).
export async function resumoPorUnidade(supabase: SupabaseServerClient, mes = mesAtualISO()): Promise<LinhaUnidade[]> {
  const { inicio, fim } = limitesDoMesISO(mes);
  const { data } = await supabase
    .from("transactions")
    .select("business_unit_id, type, amount")
    .eq("status", "paid")
    .gte("date", inicio)
    .lte("date", fim);

  const por = new Map<string, LinhaUnidade>();
  for (const t of data ?? []) {
    const l = por.get(t.business_unit_id) ?? { unidadeId: t.business_unit_id, receitas: 0, despesas: 0, resultado: 0 };
    if (t.type === "income") l.receitas += Number(t.amount);
    else l.despesas += Number(t.amount);
    l.resultado = l.receitas - l.despesas;
    por.set(t.business_unit_id, l);
  }
  return Array.from(por.values());
}

export type PontoMes = { mes: string; receitas: number; despesas: number };

// Ultimos N meses (inclui o atual), com zeros nos meses sem lancamento.
export async function tendenciaMeses(supabase: SupabaseServerClient, unidadeId: string | null, meses = 6): Promise<PontoMes[]> {
  const atual = mesAtualISO();
  const primeiro = deslocarMes(atual, -(meses - 1));
  const { inicio } = limitesDoMesISO(primeiro);
  const { fim } = limitesDoMesISO(atual);

  let q = supabase.from("transactions").select("date, type, amount").eq("status", "paid").gte("date", inicio).lte("date", fim);
  if (unidadeId) q = q.eq("business_unit_id", unidadeId);
  const { data } = await q;

  const pontos = new Map<string, PontoMes>();
  for (let i = 0; i < meses; i++) {
    const m = deslocarMes(primeiro, i);
    pontos.set(m, { mes: m, receitas: 0, despesas: 0 });
  }
  for (const t of data ?? []) {
    const p = pontos.get(t.date.slice(0, 7));
    if (!p) continue;
    if (t.type === "income") p.receitas += Number(t.amount);
    else p.despesas += Number(t.amount);
  }
  return Array.from(pontos.values());
}

export type Vencimento = {
  id: string;
  tipo: "pagar" | "receber";
  description: string;
  amount: number;
  due_date: string;
  business_unit_id: string;
  atrasada: boolean;
};

// Contas em aberto vencendo ate N dias a frente (e as ja atrasadas), mais urgentes primeiro.
export async function proximosVencimentos(supabase: SupabaseServerClient, unidadeId: string | null, dias = 7, limite = 10): Promise<Vencimento[]> {
  const hoje = hojeISO();
  const ate = new Date(Date.UTC(Number(hoje.slice(0, 4)), Number(hoje.slice(5, 7)) - 1, Number(hoje.slice(8, 10)) + dias)).toISOString().slice(0, 10);

  let pag = supabase.from("payables").select("id, description, amount, due_date, business_unit_id").in("status", ["pending", "overdue"]).lte("due_date", ate).order("due_date").limit(limite);
  let rec = supabase.from("receivables").select("id, description, amount, due_date, business_unit_id").in("status", ["pending", "overdue"]).lte("due_date", ate).order("due_date").limit(limite);
  if (unidadeId) {
    pag = pag.eq("business_unit_id", unidadeId);
    rec = rec.eq("business_unit_id", unidadeId);
  }
  const [{ data: p }, { data: r }] = await Promise.all([pag, rec]);

  const tudo: Vencimento[] = [
    ...(p ?? []).map((x) => ({ ...x, amount: Number(x.amount), tipo: "pagar" as const, atrasada: x.due_date < hoje })),
    ...(r ?? []).map((x) => ({ ...x, amount: Number(x.amount), tipo: "receber" as const, atrasada: x.due_date < hoje })),
  ];
  return tudo.sort((a, b) => a.due_date.localeCompare(b.due_date)).slice(0, limite);
}
