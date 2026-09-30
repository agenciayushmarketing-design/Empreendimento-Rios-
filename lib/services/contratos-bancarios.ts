// Contratos bancarios (bank_contracts). Quase tudo e feito por funcoes do banco:
// create_bank_contract (cria contrato + parcelas em payables + credita o principal na conta
// bancaria como receita), settle_bank_contract (quitacao antecipada), renegotiate_bank_contract
// (cancela parcelas pendentes, cria contrato novo ligado ao antigo), add_revolving_charge
// (lancamento avulso em contrato rotativo). O trigger em payables fecha o contrato quando todas
// as parcelas sao pagas. A view bank_contract_progress resume o andamento.
import type { SupabaseServerClient } from "@/lib/supabase/server";
import type { STATUS_CONTRATO, TIPOS_CONTRATO } from "@/lib/validacao/contrato-bancario";

export type TipoContrato = keyof typeof TIPOS_CONTRATO;
export type StatusContrato = keyof typeof STATUS_CONTRATO;

export type Contrato = {
  id: string;
  business_unit_id: string;
  institution: string;
  contract_number: string;
  contract_type: TipoContrato;
  principal: number;
  contract_date: string;
  installments_count: number | null;
  installment_amount: number | null;
  first_due_date: string | null;
  interest_rate_info: number | null;
  bank_account_id: string | null;
  notes: string | null;
  status: StatusContrato;
  settled_at: string | null;
  settlement_amount: number | null;
  renegotiated_from_id: string | null;
  progresso: { pagas: number; pendentes: number; atrasadas: number; valorPago: number; valorPendente: number; proximoVencimento: string | null; pct: number | null };
};

export type ParcelaContrato = {
  id: string;
  installment_number: number | null;
  description: string;
  amount: number;
  due_date: string;
  status: string;
  paid_at: string | null;
};

const COLS =
  "id, business_unit_id, institution, contract_number, contract_type, principal, contract_date, installments_count, installment_amount, first_due_date, interest_rate_info, bank_account_id, notes, status, settled_at, settlement_amount, renegotiated_from_id";

type Linha = Omit<Contrato, "progresso">;
type Progresso = {
  contract_id: string; paid_count: number | null; pending_count: number | null; overdue_count: number | null;
  paid_amount: number | null; pending_amount: number | null; next_due_date: string | null; progress_pct: number | null;
};

async function completar(supabase: SupabaseServerClient, linhas: Linha[]): Promise<Contrato[]> {
  const ids = linhas.map((l) => l.id);
  const { data: prog } = ids.length
    ? await supabase.from("bank_contract_progress").select("contract_id, paid_count, pending_count, overdue_count, paid_amount, pending_amount, next_due_date, progress_pct").in("contract_id", ids)
    : { data: [] as Progresso[] };
  const por = new Map(((prog ?? []) as Progresso[]).map((p) => [p.contract_id, p]));
  return linhas.map((l) => {
    const p = por.get(l.id);
    return {
      ...l,
      principal: Number(l.principal),
      installment_amount: l.installment_amount === null ? null : Number(l.installment_amount),
      interest_rate_info: l.interest_rate_info === null ? null : Number(l.interest_rate_info),
      settlement_amount: l.settlement_amount === null ? null : Number(l.settlement_amount),
      progresso: {
        pagas: Number(p?.paid_count ?? 0),
        pendentes: Number(p?.pending_count ?? 0),
        atrasadas: Number(p?.overdue_count ?? 0),
        valorPago: Number(p?.paid_amount ?? 0),
        valorPendente: Number(p?.pending_amount ?? 0),
        proximoVencimento: p?.next_due_date ?? null,
        pct: p?.progress_pct === null || p?.progress_pct === undefined ? null : Number(p.progress_pct),
      },
    };
  });
}

export async function listarContratos(supabase: SupabaseServerClient, unidadeId: string | null, status?: StatusContrato) {
  let q = supabase.from("bank_contracts").select(COLS).order("contract_date", { ascending: false });
  if (unidadeId) q = q.eq("business_unit_id", unidadeId);
  if (status) q = q.eq("status", status);
  const { data, error } = await q;
  if (error) throw new Error(`Falha ao listar contratos: ${error.message}`);
  return completar(supabase, (data ?? []) as Linha[]);
}

export async function obterContrato(supabase: SupabaseServerClient, id: string): Promise<Contrato | null> {
  const { data } = await supabase.from("bank_contracts").select(COLS).eq("id", id).maybeSingle();
  if (!data) return null;
  const [c] = await completar(supabase, [data as Linha]);
  return c ?? null;
}

export async function parcelasDoContrato(supabase: SupabaseServerClient, id: string): Promise<ParcelaContrato[]> {
  const { data } = await supabase
    .from("payables")
    .select("id, contract_installment_number, description, amount, due_date, status, paid_at")
    .eq("bank_contract_id", id)
    .order("due_date");
  return (data ?? []).map((p) => ({
    id: p.id,
    installment_number: p.contract_installment_number,
    description: p.description,
    amount: Number(p.amount),
    due_date: p.due_date,
    status: p.status,
    paid_at: p.paid_at,
  }));
}
