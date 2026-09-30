// Contas a pagar (payables) e a receber (receivables), normalizadas num mesmo formato.
// Efeitos do banco: mark_*_paid cria a transacao de caixa; unmark_*_paid apaga; mark_overdue()
// (cron diario) muda pending -> overdue; enforce_period_close bloqueia periodo fechado;
// tg_notify_became_overdue gera notificacao; recurring_payables gera contas a pagar por mes.
import type { SupabaseServerClient } from "@/lib/supabase/server";
import type { TipoConta } from "@/lib/contas-config";
import { hojeISO, limitesDoMesISO } from "@/lib/utils/formatacao";

export const POR_PAGINA = 50;

export type StatusConta = "pending" | "paid" | "overdue" | "renegotiated" | "cancelled";
export type Situacao = "abertas" | "pagas" | "todas";

export type Conta = {
  id: string;
  business_unit_id: string;
  description: string;
  amount: number;
  due_date: string;
  status: StatusConta;
  paid_at: string | null;
  category_id: string | null;
  pessoa_id: string | null;
  preferred_bank_account_id: string | null;
  notes: string | null;
  recorrente: boolean;
  closed_at: string | null;
  transaction_id: string | null;
};

export type FiltrosContas = {
  unidadeId: string | null;
  situacao: Situacao;
  mes: string; // "AAAA-MM": vencimento (todas) ou pagamento (pagas)
  busca?: string;
  pagina: number;
};

const COLS_PAG =
  "id, business_unit_id, description, amount, due_date, status, paid_at, category_id, supplier_id, preferred_bank_account_id, notes, recurring_payable_id, closed_at, transaction_id";
const COLS_REC =
  "id, business_unit_id, description, amount, due_date, status, paid_at, category_id, client_id, preferred_bank_account_id, recurring_invoice_id, closed_at, transaction_id";

type LinhaPag = {
  id: string; business_unit_id: string; description: string; amount: number; due_date: string; status: StatusConta;
  paid_at: string | null; category_id: string | null; supplier_id: string | null; preferred_bank_account_id: string | null;
  notes: string | null; recurring_payable_id: string | null; closed_at: string | null; transaction_id: string | null;
};
type LinhaRec = {
  id: string; business_unit_id: string; description: string; amount: number; due_date: string; status: StatusConta;
  paid_at: string | null; category_id: string | null; client_id: string | null; preferred_bank_account_id: string | null;
  recurring_invoice_id: string | null; closed_at: string | null; transaction_id: string | null;
};

function dePag(l: LinhaPag): Conta {
  return {
    id: l.id, business_unit_id: l.business_unit_id, description: l.description, amount: Number(l.amount),
    due_date: l.due_date, status: l.status, paid_at: l.paid_at, category_id: l.category_id, pessoa_id: l.supplier_id,
    preferred_bank_account_id: l.preferred_bank_account_id, notes: l.notes, recorrente: Boolean(l.recurring_payable_id),
    closed_at: l.closed_at, transaction_id: l.transaction_id,
  };
}
function deRec(l: LinhaRec): Conta {
  return {
    id: l.id, business_unit_id: l.business_unit_id, description: l.description, amount: Number(l.amount),
    due_date: l.due_date, status: l.status, paid_at: l.paid_at, category_id: l.category_id, pessoa_id: l.client_id,
    preferred_bank_account_id: l.preferred_bank_account_id, notes: null, recorrente: Boolean(l.recurring_invoice_id),
    closed_at: l.closed_at, transaction_id: l.transaction_id,
  };
}

// Um builder por tabela: o supabase-js perde a tipagem quando o nome da tabela e dinamico.
function base(supabase: SupabaseServerClient, tipo: TipoConta) {
  return tipo === "pagar"
    ? supabase.from("payables").select(COLS_PAG, { count: "exact" })
    : supabase.from("receivables").select(COLS_REC, { count: "exact" });
}

export async function listarContas(supabase: SupabaseServerClient, tipo: TipoConta, f: FiltrosContas) {
  const de = (f.pagina - 1) * POR_PAGINA;
  const { inicio, fim } = limitesDoMesISO(f.mes);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let q: any = base(supabase, tipo);
  if (f.unidadeId) q = q.eq("business_unit_id", f.unidadeId);
  if (f.busca) q = q.ilike("description", `%${f.busca.replace(/[%_]/g, "")}%`);

  if (f.situacao === "abertas") {
    q = q.in("status", ["pending", "overdue"]).order("due_date", { ascending: true });
  } else if (f.situacao === "pagas") {
    q = q.eq("status", "paid").gte("paid_at", inicio).lte("paid_at", fim).order("paid_at", { ascending: false });
  } else {
    q = q.gte("due_date", inicio).lte("due_date", fim).order("due_date", { ascending: false });
  }
  q = q.order("created_at", { ascending: false }).range(de, de + POR_PAGINA - 1);

  const { data, error, count } = await q;
  if (error) throw new Error(`Falha ao listar contas: ${error.message}`);

  const linhas: Conta[] = tipo === "pagar" ? (data as LinhaPag[]).map(dePag) : (data as LinhaRec[]).map(deRec);
  return { linhas, total: (count as number | null) ?? 0 };
}

export type ResumoContas = { atrasadas: number; qtdAtrasadas: number; aVencer: number; qtdAVencer: number; pagasNoMes: number };

export async function resumoContas(supabase: SupabaseServerClient, tipo: TipoConta, unidadeId: string | null, mes: string): Promise<ResumoContas> {
  const hoje = hojeISO();
  const { inicio, fim } = limitesDoMesISO(mes);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let abertas: any = tipo === "pagar"
    ? supabase.from("payables").select("amount, due_date, status").in("status", ["pending", "overdue"])
    : supabase.from("receivables").select("amount, due_date, status").in("status", ["pending", "overdue"]);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let pagas: any = tipo === "pagar"
    ? supabase.from("payables").select("amount").eq("status", "paid").gte("paid_at", inicio).lte("paid_at", fim)
    : supabase.from("receivables").select("amount").eq("status", "paid").gte("paid_at", inicio).lte("paid_at", fim);
  if (unidadeId) {
    abertas = abertas.eq("business_unit_id", unidadeId);
    pagas = pagas.eq("business_unit_id", unidadeId);
  }
  const [{ data: a }, { data: p }] = await Promise.all([abertas, pagas]);

  const r: ResumoContas = { atrasadas: 0, qtdAtrasadas: 0, aVencer: 0, qtdAVencer: 0, pagasNoMes: 0 };
  for (const l of (a ?? []) as { amount: number; due_date: string; status: string }[]) {
    // Antes do cron rodar, uma pendente vencida ainda esta "pending": trata como atrasada.
    if (l.status === "overdue" || l.due_date < hoje) {
      r.atrasadas += Number(l.amount);
      r.qtdAtrasadas++;
    } else {
      r.aVencer += Number(l.amount);
      r.qtdAVencer++;
    }
  }
  for (const l of (p ?? []) as { amount: number }[]) r.pagasNoMes += Number(l.amount);
  return r;
}

export async function obterConta(supabase: SupabaseServerClient, tipo: TipoConta, id: string): Promise<Conta | null> {
  if (tipo === "pagar") {
    const { data } = await supabase.from("payables").select(COLS_PAG).eq("id", id).maybeSingle();
    return data ? dePag(data as LinhaPag) : null;
  }
  const { data } = await supabase.from("receivables").select(COLS_REC).eq("id", id).maybeSingle();
  return data ? deRec(data as LinhaRec) : null;
}

// Nomes para a listagem (payables nao tem FK de categoria/fornecedor, entao o join e manual).
export async function mapasDeNomes(supabase: SupabaseServerClient) {
  const [{ data: cats }, { data: clis }, { data: contas }] = await Promise.all([
    supabase.from("categories").select("id, name"),
    supabase.from("clients").select("id, name"),
    supabase.from("bank_accounts").select("id, name"),
  ]);
  return {
    categorias: new Map((cats ?? []).map((c) => [c.id, c.name])),
    pessoas: new Map((clis ?? []).map((c) => [c.id, c.name])),
    contasBancarias: new Map((contas ?? []).map((c) => [c.id, c.name])),
  };
}

export type Recorrencia = {
  id: string; business_unit_id: string; description: string; amount: number; frequency: string;
  day_of_month: number; next_run_date: string; end_date: string | null; is_active: boolean;
};

export async function listarRecorrencias(supabase: SupabaseServerClient, unidadeId: string | null): Promise<Recorrencia[]> {
  let q = supabase
    .from("recurring_payables")
    .select("id, business_unit_id, description, amount, frequency, day_of_month, next_run_date, end_date, is_active")
    .eq("is_active", true)
    .order("day_of_month");
  if (unidadeId) q = q.eq("business_unit_id", unidadeId);
  const { data } = await q;
  return ((data ?? []) as Recorrencia[]).map((r) => ({ ...r, amount: Number(r.amount) }));
}
