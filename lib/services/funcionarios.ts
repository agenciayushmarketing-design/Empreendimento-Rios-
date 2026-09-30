// Funcionarios (employees) e folha de pagamento.
// Funcoes do banco: preview_monthly_payroll (previa por unidade e mes), generate_monthly_payroll
// (gera uma conta a pagar por funcionario, com payroll_breakdown e payroll_batch_id, na categoria de
// folha da unidade), rollback_payroll_batch (desfaz um lote ainda nao pago). O trigger
// validate_payable_employee exige categoria de folha em contas ligadas a funcionario.
import type { SupabaseServerClient } from "@/lib/supabase/server";
import { limitesDoMesISO } from "@/lib/utils/formatacao";
import { liquidoEstimado } from "@/lib/validacao/funcionario";

export type Funcionario = {
  id: string;
  business_unit_id: string;
  full_name: string;
  role: string | null;
  document: string | null;
  admission_date: string | null;
  is_active: boolean;
  default_base_salary: number;
  default_transport: number;
  default_meal: number;
  default_inss: number;
  default_fgts: number;
  default_other: number;
  notes: string | null;
  liquido: number;
};

const COLS =
  "id, business_unit_id, full_name, role, document, admission_date, is_active, default_base_salary, default_transport, default_meal, default_inss, default_fgts, default_other, notes";

type Linha = Omit<Funcionario, "liquido">;

function montar(l: Linha): Funcionario {
  const f = {
    ...l,
    default_base_salary: Number(l.default_base_salary),
    default_transport: Number(l.default_transport),
    default_meal: Number(l.default_meal),
    default_inss: Number(l.default_inss),
    default_fgts: Number(l.default_fgts),
    default_other: Number(l.default_other),
  };
  return { ...f, liquido: liquidoEstimado(f) };
}

export async function listarFuncionarios(supabase: SupabaseServerClient, unidadeId: string | null, incluirArquivados: boolean) {
  let q = supabase.from("employees").select(COLS).order("is_active", { ascending: false }).order("full_name");
  if (unidadeId) q = q.eq("business_unit_id", unidadeId);
  if (!incluirArquivados) q = q.eq("is_active", true);
  const { data, error } = await q;
  if (error) throw new Error(`Falha ao listar funcionários: ${error.message}`);
  return ((data ?? []) as Linha[]).map(montar);
}

export async function obterFuncionario(supabase: SupabaseServerClient, id: string): Promise<Funcionario | null> {
  const { data } = await supabase.from("employees").select(COLS).eq("id", id).maybeSingle();
  return data ? montar(data as Linha) : null;
}

export type PreviaFolha = {
  employee_id: string;
  employee_name: string;
  base_salary: number;
  transport: number;
  meal: number;
  inss: number;
  fgts: number;
  other: number;
  net_amount: number;
  already_generated: boolean;
  existing_payable_id: string | null;
};

export async function previaFolha(supabase: SupabaseServerClient, unidadeId: string, periodo: string): Promise<PreviaFolha[]> {
  const { data, error } = await supabase.rpc("preview_monthly_payroll", { _unit_id: unidadeId, _period: `${periodo}-01` });
  if (error) throw new Error(error.message);
  return ((data ?? []) as PreviaFolha[]).map((p) => ({
    ...p,
    base_salary: Number(p.base_salary),
    transport: Number(p.transport),
    meal: Number(p.meal),
    inss: Number(p.inss),
    fgts: Number(p.fgts),
    other: Number(p.other),
    net_amount: Number(p.net_amount),
  }));
}

export type LoteFolha = {
  batch_id: string;
  periodo: string;
  qtd: number;
  total: number;
  pagas: number;
  vencimento: string;
};

// Lotes gerados para a unidade no mes (agrupa as contas a pagar de folha por payroll_batch_id).
export async function lotesDoMes(supabase: SupabaseServerClient, unidadeId: string, periodo: string): Promise<LoteFolha[]> {
  const { inicio } = limitesDoMesISO(periodo);
  const { data } = await supabase
    .from("payables")
    .select("payroll_batch_id, payroll_period, amount, status, due_date")
    .eq("business_unit_id", unidadeId)
    .eq("payroll_period", inicio)
    .not("payroll_batch_id", "is", null);
  const por = new Map<string, LoteFolha>();
  for (const p of data ?? []) {
    const id = p.payroll_batch_id as string;
    const l = por.get(id) ?? { batch_id: id, periodo: p.payroll_period ?? inicio, qtd: 0, total: 0, pagas: 0, vencimento: p.due_date };
    l.qtd++;
    l.total += Number(p.amount);
    if (p.status === "paid") l.pagas++;
    por.set(id, l);
  }
  return Array.from(por.values());
}

export async function categoriaFolha(supabase: SupabaseServerClient, unidadeId: string): Promise<string | null> {
  const { data } = await supabase.from("categories").select("id").eq("business_unit_id", unidadeId).eq("is_payroll", true).limit(1).maybeSingle();
  return data?.id ?? null;
}
