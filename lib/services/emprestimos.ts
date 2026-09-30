// Emprestimos (loans) e parcelas (loan_installments).
// Efeitos do banco: generate_loan_installments (trigger AFTER INSERT em loans) cria as parcelas pela
// tabela Price; mark_overdue() (cron) marca pending -> overdue; tg_notify_became_overdue avisa.
// Nao ha funcao de recebimento no banco: a baixa da parcela e feita pelo app (ver actions).
import type { SupabaseServerClient } from "@/lib/supabase/server";
import { hojeISO, limitesDoMesISO, mesAtualISO } from "@/lib/utils/formatacao";

export type StatusEmprestimo = "active" | "paid_off" | "defaulted";
export type StatusParcela = "pending" | "paid" | "overdue" | "renegotiated" | "cancelled";

export type Parcela = {
  id: string;
  loan_id: string;
  installment_number: number;
  due_date: string;
  amount: number;
  status: StatusParcela;
  paid_at: string | null;
};

export type Emprestimo = {
  id: string;
  business_unit_id: string;
  client_id: string;
  clienteNome: string;
  principal: number;
  monthly_rate: number;
  start_date: string;
  term_months: number;
  status: StatusEmprestimo;
  created_at: string;
  parcelas: Parcela[];
  pagas: number;
  saldoDevedor: number;
  atrasado: number;
  proximoVencimento: string | null;
};

const COLS = "id, business_unit_id, client_id, principal, monthly_rate, start_date, term_months, status, created_at, client:clients(name)";

type LinhaLoan = {
  id: string; business_unit_id: string; client_id: string; principal: number; monthly_rate: number; start_date: string;
  term_months: number; status: StatusEmprestimo; created_at: string; client: { name: string } | null;
};

function montar(l: LinhaLoan, parcelas: Parcela[], hoje: string): Emprestimo {
  const abertas = parcelas.filter((p) => p.status === "pending" || p.status === "overdue");
  return {
    id: l.id,
    business_unit_id: l.business_unit_id,
    client_id: l.client_id,
    clienteNome: l.client?.name ?? "—",
    principal: Number(l.principal),
    monthly_rate: Number(l.monthly_rate),
    start_date: l.start_date,
    term_months: l.term_months,
    status: l.status,
    created_at: l.created_at,
    parcelas,
    pagas: parcelas.filter((p) => p.status === "paid").length,
    saldoDevedor: abertas.reduce((s, p) => s + p.amount, 0),
    atrasado: abertas.filter((p) => p.status === "overdue" || p.due_date < hoje).reduce((s, p) => s + p.amount, 0),
    proximoVencimento: abertas.map((p) => p.due_date).sort()[0] ?? null,
  };
}

async function parcelasDe(supabase: SupabaseServerClient, loanIds: string[]): Promise<Map<string, Parcela[]>> {
  const mapa = new Map<string, Parcela[]>();
  if (loanIds.length === 0) return mapa;
  const { data } = await supabase
    .from("loan_installments")
    .select("id, loan_id, installment_number, due_date, amount, status, paid_at")
    .in("loan_id", loanIds)
    .order("installment_number");
  for (const p of data ?? []) {
    const lista = mapa.get(p.loan_id) ?? [];
    lista.push({ ...p, amount: Number(p.amount) });
    mapa.set(p.loan_id, lista);
  }
  return mapa;
}

export async function listarEmprestimos(supabase: SupabaseServerClient, unidadeId: string | null, status?: StatusEmprestimo) {
  let q = supabase.from("loans").select(COLS).order("created_at", { ascending: false });
  if (unidadeId) q = q.eq("business_unit_id", unidadeId);
  if (status) q = q.eq("status", status);
  const { data, error } = await q;
  if (error) throw new Error(`Falha ao listar empréstimos: ${error.message}`);

  const linhas = (data ?? []) as unknown as LinhaLoan[];
  const parcelas = await parcelasDe(supabase, linhas.map((l) => l.id));
  const hoje = hojeISO();
  return linhas.map((l) => montar(l, parcelas.get(l.id) ?? [], hoje));
}

export async function obterEmprestimo(supabase: SupabaseServerClient, id: string): Promise<Emprestimo | null> {
  const { data } = await supabase.from("loans").select(COLS).eq("id", id).maybeSingle();
  if (!data) return null;
  const parcelas = await parcelasDe(supabase, [id]);
  return montar(data as unknown as LinhaLoan, parcelas.get(id) ?? [], hojeISO());
}

export type ResumoEmprestimos = { emprestadoAtivo: number; aReceber: number; atrasado: number; recebidoNoMes: number; ativos: number };

export function resumir(lista: Emprestimo[], mes = mesAtualISO()): ResumoEmprestimos {
  const { inicio, fim } = limitesDoMesISO(mes);
  const r: ResumoEmprestimos = { emprestadoAtivo: 0, aReceber: 0, atrasado: 0, recebidoNoMes: 0, ativos: 0 };
  for (const e of lista) {
    if (e.status !== "paid_off") {
      r.ativos++;
      r.emprestadoAtivo += e.principal;
      r.aReceber += e.saldoDevedor;
      r.atrasado += e.atrasado;
    }
    for (const p of e.parcelas) {
      const dia = p.paid_at?.slice(0, 10);
      if (p.status === "paid" && dia && dia >= inicio && dia <= fim) r.recebidoNoMes += p.amount;
    }
  }
  return r;
}

// Descricao deterministica da movimentacao gerada ao receber uma parcela: e por ela que o estorno
// encontra a movimentacao (loan_installments nao guarda o id da transacao).
export function descricaoParcela(e: Pick<Emprestimo, "clienteNome" | "term_months">, numero: number): string {
  return `Parcela ${numero}/${e.term_months} - Empréstimo ${e.clienteNome}`;
}
